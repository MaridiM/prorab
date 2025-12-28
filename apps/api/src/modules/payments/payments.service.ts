import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../core/prisma/prisma.service';
import { YooKassaClient } from './clients/yookassa.client';
import { PaymentStatus, SubscriptionStatus, PaymentProviderType } from '@prisma/generated/client';
import { BILLING_CYCLE_DAYS } from '../subscriptions/constants/plans.constants';
import { MailService } from '../../core/mail/mail.service';
import { PaymentProviderFactory } from '../../core/payments/factories/payment-provider.factory';
import { getProviderByIP } from './utils/geo-provider.util';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    private prisma: PrismaService,
    private yookassaClient: YooKassaClient,
    private configService: ConfigService,
    private mailService: MailService,
    private paymentProviderFactory: PaymentProviderFactory,
  ) {}

  /**
   * Initialize payment with automatic provider selection based on IP geolocation
   *
   * @param subscriptionId - Subscription ID
   * @param userId - User ID for authorization
   * @param providerType - Optional: manually specified payment provider (YOOKASSA or STRIPE)
   *                       If not provided, automatically determined by user's IP
   * @param userIP - User's IP address for geolocation-based provider selection
   * @returns Payment confirmation URL and payment ID
   */
  async initializePayment(
    subscriptionId: string,
    userId: string,
    providerType?: PaymentProviderType,
    userIP?: string,
  ) {
    // Verify subscription ownership
    const subscription = await this.prisma.subscription.findUnique({
      where: { id: subscriptionId },
      include: {
        team: {
          include: {
            owner: true,
          },
        },
        planRef: {
          include: {
            prices: true,
          },
        },
      },
    });

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    if (subscription.team.ownerId !== userId) {
      throw new Error('Access denied');
    }

    // Get plan price from DB or fallback to constants
    let amount: number;
    let planName: string;

    if (subscription.planRef) {
      const rubPrice = subscription.planRef.prices?.find((p: { currency: string }) => p.currency === 'RUB');
      amount = subscription.isEarlyBird && rubPrice?.earlyBirdPrice
        ? Number(rubPrice.earlyBirdPrice)
        : Number(rubPrice?.price || 0);
      planName = subscription.planRef.name;
    } else {
      // Fallback to constants (for legacy subscriptions)
      const { PLAN_LIMITS } = await import(
        '../subscriptions/constants/plans.constants'
      );
      const limits = PLAN_LIMITS[subscription.plan];
      amount = subscription.isEarlyBird
        ? limits.earlyBirdPrice
        : limits.price;
      planName = limits.name;
    }

    // Determine payment provider
    // 1. If providerType explicitly specified - use it
    // 2. If userIP provided - auto-select by geolocation
    // 3. Otherwise - use primary provider from DB
    let selectedProviderType = providerType;

    if (!selectedProviderType && userIP) {
      selectedProviderType = getProviderByIP(userIP);
      this.logger.log(`Auto-selected provider by IP ${userIP}: ${selectedProviderType}`);
    }

    // Get payment provider (use factory for multi-provider support)
    const provider = await this.paymentProviderFactory.getProvider(selectedProviderType);
    this.logger.log(`Initializing payment with provider: ${provider.type}`);

    // Create payment record
    const payment = await this.prisma.payment.create({
      data: {
        subscription: {
          connect: { id: subscription.id },
        },
        teamId: subscription.teamId,
        amount,
        currency: 'RUB',
        status: PaymentStatus.PENDING,
        providerType: provider.type, // Store which provider is used
        providerPaymentId: 'pending', // Will be updated after provider creates payment
        yookassaPaymentId: 'pending', // DEPRECATED: Kept for backward compatibility
        description: `Оплата подписки "${planName}" за месяц`,
      },
    });

    // Create payment through provider
    const returnUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';
    const paymentResult = await provider.createPayment({
      amount,
      currency: 'RUB',
      description: payment.description!,
      returnUrl: `${returnUrl}/payment/success?paymentId=${payment.id}`,
      metadata: {
        subscriptionId: subscription.id,
        teamId: subscription.teamId,
        paymentId: payment.id,
        plan: subscription.plan,
      },
      customerEmail: subscription.team.owner.email,
    });

    // Update payment with provider payment ID
    await this.prisma.payment.update({
      where: { id: payment.id },
      data: {
        providerPaymentId: paymentResult.paymentId,
        // For backward compatibility with YooKassa
        yookassaPaymentId: provider.type === PaymentProviderType.YOOKASSA
          ? paymentResult.paymentId
          : payment.yookassaPaymentId,
      },
    });

    this.logger.log(`Payment initialized: ${payment.id} via ${provider.type}`);

    return {
      url: paymentResult.confirmationUrl,
      paymentId: payment.id,
    };
  }

  async handlePaymentSucceeded(yookassaPaymentId: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { yookassaPaymentId },
      include: {
        subscription: {
          include: {
            team: {
              include: {
                owner: true,
              },
            },
            planRef: true,
          },
        },
      },
    });

    if (!payment) {
      this.logger.warn(`Payment not found: ${yookassaPaymentId}`);
      return;
    }

    // Update payment status
    await this.prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: PaymentStatus.SUCCEEDED,
        paidAt: new Date(),
      },
    });

    this.logger.log(`Payment succeeded: ${payment.id}`);

    // Update subscription status
    const subscription = payment.subscription;
    const now = new Date();
    const nextPeriodEnd = new Date(
      subscription.currentPeriodEnd.getTime() +
        BILLING_CYCLE_DAYS * 24 * 60 * 60 * 1000,
    );

    await this.prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        status: SubscriptionStatus.ACTIVE,
        currentPeriodStart: subscription.currentPeriodEnd,
        currentPeriodEnd: nextPeriodEnd,
      },
    });

    this.logger.log(`Subscription activated: ${subscription.id}`);

    // Send email notification to team owner
    const owner = subscription.team.owner;
    const planName = subscription.planRef?.name || subscription.plan;

    await this.mailService.sendPaymentSuccessEmail(
      owner.email,
      owner.fullName,
      payment.amount.toString(),
      payment.currency,
      planName,
    );
  }

  async handlePaymentFailed(yookassaPaymentId: string, reason?: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { yookassaPaymentId },
      include: {
        subscription: {
          include: {
            team: {
              include: {
                owner: true,
              },
            },
          },
        },
      },
    });

    if (!payment) {
      this.logger.warn(`Payment not found: ${yookassaPaymentId}`);
      return;
    }

    // Update payment status
    await this.prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: PaymentStatus.FAILED,
        failureReason: reason,
      },
    });

    this.logger.warn(`Payment failed: ${payment.id} - ${reason}`);

    // Mark subscription as PAST_DUE
    await this.prisma.subscription.update({
      where: { id: payment.subscriptionId },
      data: {
        status: SubscriptionStatus.PAST_DUE,
      },
    });

    // Send email notification to team owner
    const owner = payment.subscription.team.owner;
    await this.mailService.sendPaymentFailedEmail(
      owner.email,
      owner.fullName,
      payment.amount.toString(),
      payment.currency,
      reason || 'Неизвестная ошибка',
    );

    // Note: Auto-retry requires cron job implementation
    // For now, payment is marked as FAILED and subscription as PAST_DUE
    // Admins can manually retry failed payments via processRetryPayments()
    this.logger.log(`Payment ${payment.id} marked as FAILED - retry available via admin panel`);
  }

  async handlePaymentCanceled(yookassaPaymentId: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { yookassaPaymentId },
    });

    if (!payment) {
      this.logger.warn(`Payment not found: ${yookassaPaymentId}`);
      return;
    }

    await this.prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: PaymentStatus.CANCELLED,
      },
    });

    this.logger.log(`Payment cancelled: ${payment.id}`);
  }

  /**
   * Internal helper: Handle payment succeeded by payment ID
   */
  private async handlePaymentSucceededByPaymentId(paymentId: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        subscription: {
          include: {
            team: {
              include: {
                owner: true,
              },
            },
            planRef: true,
          },
        },
      },
    });

    if (!payment) {
      this.logger.warn(`Payment not found: ${paymentId}`);
      return;
    }

    // Update payment status
    await this.prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: PaymentStatus.SUCCEEDED,
        paidAt: new Date(),
      },
    });

    this.logger.log(`Payment succeeded: ${payment.id}`);

    // Update subscription status
    const subscription = payment.subscription;
    const now = new Date();
    const nextPeriodEnd = new Date(
      subscription.currentPeriodEnd.getTime() +
        BILLING_CYCLE_DAYS * 24 * 60 * 60 * 1000,
    );

    await this.prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        status: SubscriptionStatus.ACTIVE,
        currentPeriodStart: subscription.currentPeriodEnd,
        currentPeriodEnd: nextPeriodEnd,
      },
    });

    this.logger.log(`Subscription activated: ${subscription.id}`);

    // Send email notification to team owner
    const owner = subscription.team.owner;
    const planName = subscription.planRef?.name || subscription.plan;

    await this.mailService.sendPaymentSuccessEmail(
      owner.email,
      owner.fullName,
      payment.amount.toString(),
      payment.currency,
      planName,
    );
  }

  /**
   * Internal helper: Handle payment failed by payment ID
   */
  private async handlePaymentFailedByPaymentId(paymentId: string, reason?: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        subscription: {
          include: {
            team: {
              include: {
                owner: true,
              },
            },
          },
        },
      },
    });

    if (!payment) {
      this.logger.warn(`Payment not found: ${paymentId}`);
      return;
    }

    // Update payment status
    await this.prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: PaymentStatus.FAILED,
        failureReason: reason,
      },
    });

    this.logger.warn(`Payment failed: ${payment.id} - ${reason}`);

    // Mark subscription as PAST_DUE
    await this.prisma.subscription.update({
      where: { id: payment.subscriptionId },
      data: {
        status: SubscriptionStatus.PAST_DUE,
      },
    });

    // Send email notification to team owner
    const owner = payment.subscription.team.owner;
    await this.mailService.sendPaymentFailedEmail(
      owner.email,
      owner.fullName,
      payment.amount.toString(),
      payment.currency,
      reason || 'Неизвестная ошибка',
    );
  }

  /**
   * Handle Stripe payment succeeded
   * Uses providerPaymentId to find payment (works for both Stripe and YooKassa)
   */
  async handleStripePaymentSucceeded(stripePaymentId: string) {
    // Try to find payment by providerPaymentId (works for Stripe)
    const payment = await this.prisma.payment.findFirst({
      where: {
        providerPaymentId: stripePaymentId,
        providerType: 'STRIPE',
      },
    });

    if (!payment) {
      this.logger.warn(`Stripe payment not found: ${stripePaymentId}`);
      return;
    }

    await this.handlePaymentSucceededByPaymentId(payment.id);
  }

  /**
   * Handle Stripe payment failed
   */
  async handleStripePaymentFailed(stripePaymentId: string, reason?: string) {
    const payment = await this.prisma.payment.findFirst({
      where: {
        providerPaymentId: stripePaymentId,
        providerType: 'STRIPE',
      },
    });

    if (!payment) {
      this.logger.warn(`Stripe payment not found: ${stripePaymentId}`);
      return;
    }

    await this.handlePaymentFailedByPaymentId(payment.id, reason);
  }

  /**
   * Handle Stripe refund succeeded
   */
  async handleStripeRefundSucceeded(refundId: string, stripePaymentId: string) {
    this.logger.log(`Processing Stripe refund: ${refundId} for payment: ${stripePaymentId}`);

    const payment = await this.prisma.payment.findFirst({
      where: {
        providerPaymentId: stripePaymentId,
        providerType: 'STRIPE',
      },
      include: {
        subscription: {
          include: {
            team: {
              include: {
                owner: true,
              },
            },
          },
        },
      },
    });

    if (!payment) {
      this.logger.warn(`Stripe payment not found for refund: ${stripePaymentId}`);
      return;
    }

    // Update payment status to refunded
    await this.prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: PaymentStatus.REFUNDED,
        refundedAt: new Date(),
      },
    });

    // Update subscription status to cancelled
    if (payment.subscription) {
      await this.prisma.subscription.update({
        where: { id: payment.subscriptionId },
        data: {
          status: SubscriptionStatus.CANCELLED,
          cancelledAt: new Date(),
        },
      });

      this.logger.log(`Subscription cancelled due to refund: ${payment.subscriptionId}`);
    }

    this.logger.log(`Stripe refund processed successfully: ${payment.id}`);

    // Send email notification to team owner about refund
    const owner = payment.subscription.team.owner;
    await this.mailService.sendRefundSuccessEmail(
      owner.email,
      owner.fullName,
      payment.amount.toString(),
      payment.currency,
    );
  }

  async handleRefundSucceeded(refundId: string, yookassaPaymentId: string) {
    this.logger.log(`Processing refund: ${refundId} for payment: ${yookassaPaymentId}`);

    const payment = await this.prisma.payment.findUnique({
      where: { yookassaPaymentId },
      include: {
        subscription: {
          include: {
            team: {
              include: {
                owner: true,
              },
            },
          },
        },
      },
    });

    if (!payment) {
      this.logger.warn(`Payment not found for refund: ${yookassaPaymentId}`);
      return;
    }

    // Update payment status to refunded
    await this.prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: PaymentStatus.REFUNDED,
        refundedAt: new Date(),
      },
    });

    // Update subscription status to cancelled
    if (payment.subscription) {
      await this.prisma.subscription.update({
        where: { id: payment.subscriptionId },
        data: {
          status: SubscriptionStatus.CANCELLED,
          cancelledAt: new Date(),
        },
      });

      this.logger.log(`Subscription cancelled due to refund: ${payment.subscriptionId}`);
    }

    this.logger.log(`Refund processed successfully: ${payment.id}`);

    // Send email notification to team owner about refund
    const owner = payment.subscription.team.owner;
    await this.mailService.sendRefundSuccessEmail(
      owner.email,
      owner.fullName,
      payment.amount.toString(),
      payment.currency,
    );
  }

  async getPaymentsBySubscription(subscriptionId: string) {
    return this.prisma.payment.findMany({
      where: { subscriptionId },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Get all failed payments that are eligible for retry
   * (FAILED status, created more than 3 days ago, subscription still PAST_DUE)
   */
  async getRetryEligiblePayments() {
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);

    const failedPayments = await this.prisma.payment.findMany({
      where: {
        status: PaymentStatus.FAILED,
        createdAt: {
          lte: threeDaysAgo,
        },
        subscription: {
          status: SubscriptionStatus.PAST_DUE,
        },
      },
      include: {
        subscription: {
          include: {
            team: {
              include: {
                owner: true,
              },
            },
          },
        },
      },
      take: 100, // Limit to 100 payments per batch
    });

    return failedPayments;
  }

  /**
   * Process retry for all eligible failed payments
   * Note: This should be called manually or via cron job
   */
  async processRetryPayments(): Promise<{ processed: number; succeeded: number; failed: number }> {
    this.logger.log('Starting retry payment processing...');

    const eligiblePayments = await this.getRetryEligiblePayments();
    this.logger.log(`Found ${eligiblePayments.length} payments eligible for retry`);

    let succeeded = 0;
    let failed = 0;

    for (const payment of eligiblePayments) {
      try {
        this.logger.log(`Retrying payment ${payment.id} for subscription ${payment.subscriptionId}`);

        // Create a new payment attempt
        const owner = payment.subscription.team.owner;
        const result = await this.initializePayment(payment.subscriptionId, owner.id);

        if (result) {
          succeeded++;
          this.logger.log(`Successfully created retry payment for ${payment.id}`);
        }
      } catch (error) {
        failed++;
        this.logger.error(`Failed to retry payment ${payment.id}: ${error.message}`);
      }
    }

    this.logger.log(`Retry processing complete: ${succeeded} succeeded, ${failed} failed`);

    return {
      processed: eligiblePayments.length,
      succeeded,
      failed,
    };
  }
}
