import { Field, ID, ObjectType, registerEnumType } from '@nestjs/graphql';
import { PaymentStatus } from '@prisma/generated/client';

registerEnumType(PaymentStatus, {
  name: 'PaymentStatus',
});

@ObjectType('Payment')
export class PaymentGraphQLModel {
  @Field(() => ID)
  id: string;

  @Field()
  subscriptionId: string;

  @Field()
  teamId: string;

  @Field()
  amount: number;

  @Field()
  currency: string;

  @Field(() => PaymentStatus)
  status: PaymentStatus;

  @Field()
  yookassaPaymentId: string;

  @Field({ nullable: true })
  paymentMethod?: string;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  failureReason?: string;

  @Field({ nullable: true })
  paidAt?: Date;

  @Field({ nullable: true })
  refundedAt?: Date;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
