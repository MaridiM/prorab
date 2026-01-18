import { Resolver, Query, Mutation, Args, Context } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentGraphQLModel } from './models/payment.model';
import { PaymentUrlModel } from './models/payment-url.model';
import { PaymentProviderModel } from './models/payment-provider.model';
import { AuthGuard } from '../auth/guards/auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User, PaymentProviderType } from '@prisma/generated/client';
import { PaymentProviderFactory } from '../../core/payments/factories/payment-provider.factory';
import { PrismaService } from '../../core/prisma/prisma.service';
import { getRealIP } from './utils/geo-provider.util';

@Resolver(() => PaymentGraphQLModel)
export class PaymentsResolver {
  constructor(
    private paymentsService: PaymentsService,
    private paymentProviderFactory: PaymentProviderFactory,
    private prisma: PrismaService,
  ) {}

  @Query(() => [PaymentGraphQLModel])
  @UseGuards(AuthGuard)
  async paymentsBySubscription(
    @Args('subscriptionId') subscriptionId: string,
  ): Promise<PaymentGraphQLModel[]> {
    const payments = await this.paymentsService.getPaymentsBySubscription(subscriptionId);
    return payments.map(payment => ({
      ...payment,
      amount: Number(payment.amount),
    })) as PaymentGraphQLModel[];
  }

  /**
   * Get available payment providers
   * Public query - returns active payment providers for user selection
   */
  @Query(() => [PaymentProviderModel], {
    description: 'Получить доступные платёжные провайдеры (Yookassa, Stripe)',
  })
  async availablePaymentProviders(): Promise<PaymentProviderModel[]> {
    const providers = await this.prisma.paymentProvider.findMany({
      where: { isActive: true },
      orderBy: { isPrimary: 'desc' }, // Primary provider first
    });

    return providers.map((p) => ({
      id: p.id,
      type: p.type,
      name: p.name,
      isActive: p.isActive,
      isPrimary: p.isPrimary,
    }));
  }

  /**
   * Initialize payment with automatic provider selection based on IP geolocation
   * Provider can be manually specified via providerType argument (optional)
   * Auto-selection rules:
   * - Russia, Belarus, CIS → YooKassa
   * - Ukraine, Europe, USA → Stripe
   */
  @Mutation(() => PaymentUrlModel, {
    description: 'Инициализировать платёж с автоматическим выбором провайдера по геолокации',
  })
  @UseGuards(AuthGuard)
  async initializePayment(
    @Args('subscriptionId') subscriptionId: string,
    @CurrentUser() user: User,
    @Args('providerType', { nullable: true }) providerType?: PaymentProviderType,
    @Args('targetPlanId', { nullable: true }) targetPlanId?: string,
    @Args('targetPlan', { nullable: true }) targetPlan?: string,
    @Args('cancelUrl', { nullable: true }) cancelUrl?: string,
    @Context() context?: any,
  ): Promise<PaymentUrlModel> {
    // Get user's real IP from request
    const userIP = context ? getRealIP(context.req) : undefined;

    return this.paymentsService.initializePayment(
      subscriptionId,
      user.id,
      providerType,
      userIP,
      targetPlanId,
      targetPlan,
      cancelUrl,
    );
  }

  /**
   * Confirm mock payment (for development/testing)
   * This mutation is called when user completes payment in mock checkout page
   */
  @Mutation(() => Boolean, {
    description: 'Подтвердить mock платёж (для разработки/тестирования)',
  })
  @UseGuards(AuthGuard)
  async confirmMockPayment(
    @Args('paymentId') paymentId: string,
    @CurrentUser() user: User,
  ): Promise<boolean> {
    await this.paymentsService.confirmMockPayment(paymentId);
    return true;
  }
}
