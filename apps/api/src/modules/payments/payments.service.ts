import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../core/prisma/prisma.service';
import { YooKassaClient } from './clients/yookassa.client';
import { PaymentStatus, SubscriptionStatus, PaymentProviderType, SubscriptionPlan } from '@prisma/generated/client';
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
    targetPlanId?: string,
    targetPlan?: string,
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

    // Determine which plan to use for payment calculation
    // If targetPlanId is provided, use the target plan; otherwise use current subscription plan
    let planToUse = subscription.planRef;
    let planIdToUse = subscription.planId;

    // Determine Early Bird eligibility
    // If user has active Early Bird subscription, they keep Early Bird pricing when changing plans
    let isEarlyBird = subscription.isEarlyBird;

    // Import SubscriptionsService to check Early Bird availability
    const { SubscriptionsService } = await import('../subscriptions/subscriptions.service');
    const subscriptionsService = new SubscriptionsService(this.prisma);

    // Check if Early Bird is available for this user
    const isEarlyBirdAvailable = await subscriptionsService.isEarlyBirdAvailableForUser(userId);

    // If user has active Early Bird OR is eligible for Early Bird, use Early Bird pricing
    if (isEarlyBirdAvailable && planToUse?.isEarlyBird) {
      isEarlyBird = true;
      this.logger.log(`User ${userId} is eligible for Early Bird pricing`);
    }

    if (targetPlanId && targetPlanId !== subscription.planId) {
      // Load target plan from database
      const targetPlan = await this.prisma.plan.findUnique({
        where: { id: targetPlanId },
        include: {
          prices: true,
        },
      });

      if (targetPlan) {
        planToUse = targetPlan;
        planIdToUse = targetPlanId;

        // Re-check Early Bird for target plan
        if (isEarlyBirdAvailable && targetPlan.isEarlyBird) {
          isEarlyBird = true;
          this.logger.log(`Target plan ${targetPlan.name} will use Early Bird pricing`);
        }
      } else {
        this.logger.warn(`Target plan not found: ${targetPlanId}, using current subscription plan`);
      }
    }

    // Get plan price from DB or fallback to constants
    let amount: number;
    let planName: string;

    if (planToUse) {
      const rubPrice = planToUse.prices?.find((p: { currency: string }) => p.currency === 'RUB');
      amount = isEarlyBird && rubPrice?.earlyBirdPrice
        ? Number(rubPrice.earlyBirdPrice)
        : Number(rubPrice?.price || 0);
      planName = planToUse.name;
    } else {
      // Fallback to constants (for legacy subscriptions)
      const { PLAN_LIMITS } = await import(
        '../subscriptions/constants/plans.constants'
      );
      // Use targetPlan enum if provided, otherwise use subscription plan
      const planEnum = (targetPlan as SubscriptionPlan) || subscription.plan;
      // Type guard to ensure planEnum is a valid SubscriptionPlan key
      if (planEnum && planEnum in PLAN_LIMITS) {
        const limits = PLAN_LIMITS[planEnum as SubscriptionPlan];
        amount = isEarlyBird
          ? limits.earlyBirdPrice
          : limits.price;
        planName = limits.name;
      } else {
        // Final fallback
        this.logger.warn(`Plan limits not found for ${planEnum}, using default`);
        amount = 0;
        planName = 'Unknown Plan';
      }
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

    // Check if there's already an active pending payment for this subscription
    // Only check payments that have been fully initialized (not just created with 'pending' ID)
    const existingPayment = await this.prisma.payment.findFirst({
      where: {
        subscriptionId: subscription.id,
        status: PaymentStatus.PENDING,
        providerPaymentId: {
          not: {
            startsWith: 'pending-', // Exclude temporary pending IDs
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // If there's an existing pending payment that was already initialized with provider, try to get checkout URL
    if (existingPayment && existingPayment.providerPaymentId && !existingPayment.providerPaymentId.startsWith('pending-')) {
      this.logger.log(`Found existing pending payment: ${existingPayment.id}, attempting to get checkout URL from provider`);
      
      // Try to get payment details from provider to retrieve the checkout URL
      try {
        const paymentDetails = await provider.getPayment(existingPayment.providerPaymentId);
        if (paymentDetails && paymentDetails.status === 'pending') {
          // For Stripe, we need to get the Checkout Session URL
          // For YooKassa, we need to get the confirmation URL
          // Since PaymentDetails doesn't include URL, we'll need to cancel the old payment and create a new one
          // OR: Store the checkout URL in payment metadata when creating
          // For now, cancel the old payment and create a new one to ensure we have a valid checkout URL
          this.logger.log(`Cancelling old pending payment ${existingPayment.id} and creating new one`);
          try {
            await provider.cancelPayment(existingPayment.providerPaymentId);
          } catch (cancelError) {
            this.logger.warn(`Could not cancel old payment: ${cancelError.message}`);
          }
          // Update payment status to cancelled
          await this.prisma.payment.update({
            where: { id: existingPayment.id },
            data: { status: PaymentStatus.CANCELLED },
          });
          // Continue to create new payment below
        } else {
          // Payment is not pending anymore, create new one
          this.logger.log(`Existing payment ${existingPayment.id} is no longer pending, creating new payment`);
        }
      } catch (error) {
        this.logger.warn(`Could not get payment details from provider: ${error.message}, will create new payment`);
        // If we can't get payment details, continue to create a new payment
      }
    }

    // Create payment record with unique providerPaymentId to avoid conflicts
    // Use UUID to ensure uniqueness even if multiple payments are created simultaneously
    const { randomUUID } = await import('crypto');
    const uniquePendingId = `pending-${randomUUID()}`;
    
    // Store targetPlanId and targetPlan for later use (will be passed in metadata to provider)
    // We don't store JSON in description to avoid showing it to users
    // For mock payments, we'll store targetPlanId in failureReason field temporarily
    // (failureReason is only used for failed payments, so it's safe to use for metadata)
    const targetPlanIdToStore = targetPlanId || planIdToUse;
    const targetPlanToStore = targetPlan || (planToUse?.slug?.toUpperCase() || subscription.plan);

    // Store metadata in failureReason for mock payments (will be cleared after payment succeeds)
    // Format: "TARGET_PLAN_METADATA:targetPlanId|targetPlan|isEarlyBird"
    // IMPORTANT: Always store metadata if targetPlanId is provided (even if same as current plan)
    // This ensures Early Bird status and plan updates work correctly
    const metadataForMock = targetPlanId
      ? `TARGET_PLAN_METADATA:${targetPlanIdToStore}|${targetPlanToStore}|${isEarlyBird}`
      : null;
    
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
        providerPaymentId: uniquePendingId, // Unique temporary ID to avoid conflicts
        yookassaPaymentId: null, // DEPRECATED: Will be set only for YooKassa payments
        // Store metadata in description for real payments (format: "Plan Name | TARGET_PLAN:planId|plan|isEarlyBird")
        // This ensures we can extract plan info later even if subscription changes
        description: targetPlanIdToStore && targetPlanToStore
          ? `Оплата подписки "${planName}" за месяц | TARGET_PLAN:${targetPlanIdToStore}|${targetPlanToStore}|${isEarlyBird}`
          : `Оплата подписки "${planName}" за месяц`,
        failureReason: metadataForMock, // Temporarily store metadata here for mock payments
      },
    });

    // Create payment through provider
    const returnUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';
    // Add success=true to return URL to ensure success page is displayed
    const paymentResult = await provider.createPayment({
      amount,
      currency: 'RUB',
      description: payment.description!,
      returnUrl: `${returnUrl}/payment/success?success=true&paymentId=${payment.id}`,
      metadata: {
        subscriptionId: subscription.id,
        teamId: subscription.teamId,
        paymentId: payment.id,
        plan: subscription.plan,
        // Store target plan if different from current plan (for plan changes)
        targetPlanId: targetPlanId || planIdToUse,
        targetPlan: targetPlan || (planToUse?.slug?.toUpperCase() || subscription.plan),
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

  /**
   * Confirm mock payment (for development/testing)
   * This is called when user completes payment in mock checkout page
   */
  async confirmMockPayment(paymentId: string): Promise<void> {
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
      this.logger.warn(`Mock payment not found: ${paymentId}`);
      throw new Error(`Payment not found: ${paymentId}`);
    }

    // Only process if payment is still pending
    if (payment.status !== 'PENDING') {
      this.logger.log(`Mock payment ${paymentId} already processed with status: ${payment.status}`);
      return;
    }

    // For mock payments, metadata was stored in failureReason field temporarily
    // Extract it from there, then clear the field
    const subscription = payment.subscription;
    const metadata: Record<string, string> = {
      subscriptionId: subscription.id,
      teamId: subscription.teamId,
      paymentId: payment.id,
      plan: subscription.plan,
    };

    // Extract targetPlanId, targetPlan, and isEarlyBird from failureReason if present
    // Format: "TARGET_PLAN_METADATA:targetPlanId|targetPlan|isEarlyBird"
    if (payment.failureReason && payment.failureReason.startsWith('TARGET_PLAN_METADATA:')) {
      const metadataPart = payment.failureReason.replace('TARGET_PLAN_METADATA:', '');
      const [targetPlanId, targetPlan, isEarlyBirdStr] = metadataPart.split('|');

      if (targetPlanId) {
        metadata.targetPlanId = targetPlanId;
        this.logger.log(`Mock payment targetPlanId: ${targetPlanId}`);
      }
      if (targetPlan) {
        metadata.targetPlan = targetPlan;
        this.logger.log(`Mock payment targetPlan: ${targetPlan}`);
      }
      if (isEarlyBirdStr !== undefined) {
        metadata.isEarlyBird = isEarlyBirdStr;
        this.logger.log(`Mock payment isEarlyBird: ${isEarlyBirdStr}`);
      }

      // Clear failureReason after extracting metadata
      await this.prisma.payment.update({
        where: { id: payment.id },
        data: { failureReason: null },
      });
    }
    
    // Process the payment with metadata
    await this.handlePaymentSucceededByPaymentId(paymentId, metadata);
    
    this.logger.log(`Mock payment confirmed: ${paymentId}`);
  }

  async handlePaymentSucceeded(yookassaPaymentId: string, metadata?: Record<string, string>) {
    const payment = await this.prisma.payment.findFirst({
      where: {
        providerPaymentId: yookassaPaymentId,
        providerType: 'YOOKASSA',
      },
    });

    if (!payment) {
      // Fallback to old method for backward compatibility
      const oldPayment = await this.prisma.payment.findUnique({
        where: { yookassaPaymentId },
      });
      if (oldPayment) {
        await this.handlePaymentSucceededByPaymentId(oldPayment.id, metadata);
        return;
      }
      this.logger.warn(`Payment not found: ${yookassaPaymentId}`);
      return;
    }

    await this.handlePaymentSucceededByPaymentId(payment.id, metadata);
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
   * Can optionally receive metadata from payment provider
   */
  private async handlePaymentSucceededByPaymentId(paymentId: string, metadata?: Record<string, string>) {
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

    // Extract target plan from metadata if available
    // This will be used to show correct plan in history
    const targetPlanId = metadata?.targetPlanId;
    const targetPlan = metadata?.targetPlan;
    const isEarlyBirdFromMetadata = metadata?.isEarlyBird === 'true';

    // Update payment status and store target plan info in description for history
    // We'll store it in a format that can be parsed later: "TARGET_PLAN:planId|plan|isEarlyBird"
    // Always add metadata if available (even if already present, to ensure it's up-to-date)
    let updatedDescription = payment.description || '';
    
    // Extract existing TARGET_PLAN metadata if present
    const existingTargetPlanMatch = updatedDescription.match(/TARGET_PLAN:([^|]+)\|([^|]+)\|([^|]+)/);
    
    if (targetPlanId && targetPlan) {
      // Remove existing TARGET_PLAN metadata if present
      if (existingTargetPlanMatch) {
        updatedDescription = updatedDescription.replace(/\s*\|\s*TARGET_PLAN:[^|]+\|[^|]+\|[^|]+/, '');
      }
      // Add/update target plan info in description (will be parsed in history resolver)
      updatedDescription = `${updatedDescription.trim()} | TARGET_PLAN:${targetPlanId}|${targetPlan}|${isEarlyBirdFromMetadata}`;
    }

    // Calculate subscription period for this payment
    // This will be displayed in subscription history
    const paymentTime = new Date();
    const paidAt = paymentTime; // Use current time as payment time

    // IMPORTANT: We need the CURRENT subscription state (before any updates)
    // to determine the period for this payment
    // Fetch fresh subscription data to get accurate currentPeriodEnd
    const currentSub = await this.prisma.subscription.findUnique({
      where: { id: payment.subscriptionId },
      select: {
        id: true,
        status: true,
        planId: true,
        currentPeriodStart: true,
        currentPeriodEnd: true,
      },
    });

    if (!currentSub) {
      throw new Error('Subscription not found');
    }

    // Determine if this is a plan change or renewal
    const isChangingPlan = metadata?.targetPlanId &&
      currentSub.planId &&
      metadata.targetPlanId !== currentSub.planId;

    let periodStartAt: Date;
    let periodEndAt: Date;

    if (currentSub.status === SubscriptionStatus.PENDING_PAYMENT) {
      // First payment - period starts from payment date
      periodStartAt = paidAt;
      periodEndAt = new Date(paidAt.getTime() + BILLING_CYCLE_DAYS * 24 * 60 * 60 * 1000);
      this.logger.log(`First payment: period ${periodStartAt.toISOString()} to ${periodEndAt.toISOString()}`);
    } else if (isChangingPlan) {
      // Plan change - new period starts from payment date
      // The old plan period ends at paidAt, new plan starts fresh
      periodStartAt = paidAt;
      periodEndAt = new Date(paidAt.getTime() + BILLING_CYCLE_DAYS * 24 * 60 * 60 * 1000);
      this.logger.log(`Plan change: period ${periodStartAt.toISOString()} to ${periodEndAt.toISOString()}`);
    } else {
      // Renewal of same plan - period starts from CURRENT period end (not payment date!)
      // This ensures continuous periods even if user pays early or late
      // Example: if current period ends Jan 15, renewal period is Jan 15 - Feb 14
      const currentPeriodEnd = currentSub.currentPeriodEnd || currentSub.currentPeriodStart || paidAt;
      
      // If user pays AFTER current period end (late payment), start from payment date
      // If user pays BEFORE current period end (early renewal), start from current period end
      if (paidAt > currentPeriodEnd) {
        // Late payment - period starts from payment date (gap in coverage)
        periodStartAt = paidAt;
        this.logger.log(`Late renewal: gap detected, starting from payment date`);
      } else {
        // Normal or early renewal - period starts from current period end (continuous coverage)
        periodStartAt = currentPeriodEnd;
      }
      
      periodEndAt = new Date(periodStartAt.getTime() + BILLING_CYCLE_DAYS * 24 * 60 * 60 * 1000);
      this.logger.log(
        `Renewal: current period ends ${currentPeriodEnd.toISOString()}, new period ${periodStartAt.toISOString()} to ${periodEndAt.toISOString()}`
      );
    }

    await this.prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: PaymentStatus.SUCCEEDED,
        paidAt: paidAt,
        periodStartAt,
        periodEndAt,
        ...(updatedDescription !== payment.description && { description: updatedDescription }),
      },
    });

    this.logger.log(`Payment succeeded: ${payment.id}`);

    // Update subscription status
    const subscription = payment.subscription;
    const now = new Date();

    // Check if payment metadata contains target plan information (plan change)
    // This happens when user selects a different plan and completes payment
    const planChanged = metadata?.targetPlanId && metadata.targetPlanId !== subscription.planId;
    
    // IMPORTANT: When changing plan, ALWAYS remove trial period
    // Trial period should only be available on first subscription creation, not on plan changes
    let shouldRemoveTrial = false;
    let trialWasActive = false;
    
    if (planChanged) {
      // Always remove trial when changing plan
      shouldRemoveTrial = true;
      trialWasActive = subscription.trialEndsAt !== null && subscription.trialEndsAt > now;
      this.logger.log(
        `Plan change detected: ${subscription.planId} -> ${metadata.targetPlanId}. Trial period will be removed.`
      );
    }

    // Determine correct status based on trial period (AFTER checking for plan change)
    let newStatus: SubscriptionStatus;
    if (shouldRemoveTrial) {
      // Plan changed - no trial, status should be ACTIVE
      newStatus = SubscriptionStatus.ACTIVE;
    } else if (subscription.trialEndsAt && subscription.trialEndsAt > now) {
      // Trial period is active (and no plan change)
      newStatus = SubscriptionStatus.TRIALING;
    } else {
      // No trial or trial expired
      newStatus = SubscriptionStatus.ACTIVE;
    }

    // Only update period dates if subscription was PENDING_PAYMENT
    // For renewals of existing active subscriptions, extend the period
    const updateData: any = {
      status: newStatus,
    };

    // Determine if this is a plan change (different planId) or renewal (same planId)
    const isPlanChange = metadata?.targetPlanId && 
      subscription.planId && 
      metadata.targetPlanId !== subscription.planId;
    
    if (subscription.status === SubscriptionStatus.PENDING_PAYMENT) {
      // First payment - activate subscription
      updateData.currentPeriodStart = now;
      updateData.currentPeriodEnd = subscription.trialEndsAt || new Date(
        now.getTime() + BILLING_CYCLE_DAYS * 24 * 60 * 60 * 1000,
      );
    } else if (isPlanChange) {
      // Plan change - new period starts from payment date
      // Previous plan ends at payment date, new plan starts from payment date
      updateData.currentPeriodStart = now;
      updateData.currentPeriodEnd = new Date(
        now.getTime() + BILLING_CYCLE_DAYS * 24 * 60 * 60 * 1000
      );
      this.logger.log(
        `Plan change: Previous plan ends at ${now}, new plan period: ${updateData.currentPeriodStart} to ${updateData.currentPeriodEnd}`
      );
    } else {
      // Renewal of same plan - extend period end
      // currentPeriodStart stays the same (original subscription start)
      // currentPeriodEnd extends by 30 days from current end (not from payment date!)
      const currentPeriodEnd = subscription.currentPeriodEnd || subscription.currentPeriodStart || now;
      
      // Calculate new period end based on whether this is early or late payment
      let newPeriodEnd: Date;
      if (now > currentPeriodEnd) {
        // Late payment - extend from payment date (gap in coverage)
        newPeriodEnd = new Date(now.getTime() + BILLING_CYCLE_DAYS * 24 * 60 * 60 * 1000);
        this.logger.log(`Late renewal: extending from payment date ${now.toISOString()}`);
      } else {
        // Normal or early renewal - extend from current period end (continuous coverage)
        newPeriodEnd = new Date(currentPeriodEnd.getTime() + BILLING_CYCLE_DAYS * 24 * 60 * 60 * 1000);
      }
      
      updateData.currentPeriodEnd = newPeriodEnd;
      this.logger.log(
        `Plan renewal: Current period ${subscription.currentPeriodStart?.toISOString()} - ${currentPeriodEnd.toISOString()}, extending end to ${newPeriodEnd.toISOString()}`
      );
    }

    // Update plan if metadata contains target plan information
    if (metadata?.targetPlanId) {
      if (planChanged) {
        this.logger.log(`Plan change: ${subscription.planId} -> ${metadata.targetPlanId}`);
      } else {
        this.logger.log(`Same plan selected, but updating Early Bird status if needed`);
      }

      // Update plan fields
      updateData.planId = metadata.targetPlanId;

      // If targetPlan enum is provided, update it too
      if (metadata.targetPlan) {
        updateData.plan = metadata.targetPlan as SubscriptionPlan;
        this.logger.log(`Updating plan enum to: ${metadata.targetPlan}`);
      } else {
        // Try to determine plan enum from planId
        const targetPlan = await this.prisma.plan.findUnique({
          where: { id: metadata.targetPlanId },
        });

        if (targetPlan) {
          // Map plan slug to SubscriptionPlan enum
          const planEnumMap: Record<string, SubscriptionPlan> = {
            'lite': SubscriptionPlan.LITE,
            'light': SubscriptionPlan.LITE,
            'foreman': SubscriptionPlan.FOREMAN,
            'brigade': SubscriptionPlan.BRIGADE,
          };

          const planEnum = planEnumMap[targetPlan.slug.toLowerCase()];
          if (planEnum) {
            updateData.plan = planEnum;
            this.logger.log(`Mapped plan slug "${targetPlan.slug}" to enum: ${planEnum}`);
          }
        }
      }

      // Update Early Bird status if present in metadata
      if (metadata.isEarlyBird !== undefined) {
        updateData.isEarlyBird = metadata.isEarlyBird === 'true';
        this.logger.log(`Updating Early Bird status to: ${updateData.isEarlyBird}`);
      }

      // IMPORTANT: When changing plan, ALWAYS remove trial period
      if (planChanged) {
        updateData.trialEndsAt = null;
        this.logger.log(
          `Plan change: Trial period removed. User must pay for the new plan.`
        );
      }

      this.logger.log(`Plan and Early Bird status will be updated after payment confirmation`);
    }

    await this.prisma.subscription.update({
      where: { id: subscription.id },
      data: updateData,
    });

    this.logger.log(`Subscription activated: ${subscription.id} with status ${newStatus}`);

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
   * Can optionally receive metadata from Stripe webhook
   */
  async handleStripePaymentSucceeded(stripePaymentId: string, metadata?: Record<string, string>) {
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

    await this.handlePaymentSucceededByPaymentId(payment.id, metadata);
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
