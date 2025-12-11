import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentGraphQLModel } from './models/payment.model';
import { PaymentUrlModel } from './models/payment-url.model';
import { AuthGuard } from '../auth/guards/auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '@prisma/generated/client';

@Resolver(() => PaymentGraphQLModel)
export class PaymentsResolver {
  constructor(private paymentsService: PaymentsService) {}

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

  @Mutation(() => PaymentUrlModel)
  @UseGuards(AuthGuard)
  async initializePayment(
    @Args('subscriptionId') subscriptionId: string,
    @CurrentUser() user: User,
  ): Promise<PaymentUrlModel> {
    return this.paymentsService.initializePayment(subscriptionId, user.id);
  }
}
