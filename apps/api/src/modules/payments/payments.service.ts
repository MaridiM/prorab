import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../core/prisma/prisma.service';
import { YooKassaClient } from './clients/yookassa.client';
import { PaymentStatus, SubscriptionStatus } from '@prisma/generated/client';
import { BILLING_CYCLE_DAYS } from '../subscriptions/constants/plans.constants';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    private prisma: PrismaService,
    private yookassaClient: YooKassaClient,
    private configService: ConfigService,
  ) {}

  async initializePayment(subscriptionId: string, userId: string) {
    // Verify subscription ownership
    const subscription = await this.prisma.subscription.findUnique({
      where: { id: subscriptionId },
      include: {
        team: {
          include: {
            owner: true,
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

    // Get plan price
    const { PLAN_LIMITS } = await import(
      '../subscriptions/constants/plans.constants'
    );
    const limits = PLAN_LIMITS[subscription.plan];
    const amount = subscription.isEarlyBird
      ? limits.earlyBirdPrice
      : limits.price;

    // Create payment record
    const payment = await this.prisma.payment.create({
      data: {
        subscriptionId: subscription.id,
        teamId: subscription.teamId,
        amount,
        currency: 'RUB',
        status: PaymentStatus.PENDING,
        yookassaPaymentId: 'pending', // Will be updated after YooKassa creates payment
        description: `Оплата подписки "${limits.name}" за месяц`,
      },
    });

    // Create payment in YooKassa
    const returnUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';
    const yookassaPayment = await this.yookassaClient.createPayment({
      amount,
      currency: 'RUB',
      description: payment.description!,
      returnUrl: `${returnUrl}/payment/success?paymentId=${payment.id}`,
      metadata: {
        subscriptionId: subscription.id,
        teamId: subscription.teamId,
        paymentId: payment.id,
      },
    });

    // Update payment with YooKassa ID
    await this.prisma.payment.update({
      where: { id: payment.id },
      data: {
        yookassaPaymentId: yookassaPayment.id,
      },
    });

    // Get confirmation URL
    const confirmationUrl =
      yookassaPayment.confirmation?.type === 'redirect'
        ? yookassaPayment.confirmation.confirmation_url
        : null;

    if (!confirmationUrl) {
      throw new Error('Failed to get payment confirmation URL');
    }

    return {
      url: confirmationUrl,
      paymentId: payment.id,
    };
  }

  async handlePaymentSucceeded(yookassaPaymentId: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { yookassaPaymentId },
      include: { subscription: true },
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
  }

  async handlePaymentFailed(yookassaPaymentId: string, reason?: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { yookassaPaymentId },
      include: { subscription: true },
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

    // TODO: Send email notification to user
    // TODO: Schedule retry payment after 3 days
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

  async getPaymentsBySubscription(subscriptionId: string) {
    return this.prisma.payment.findMany({
      where: { subscriptionId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
