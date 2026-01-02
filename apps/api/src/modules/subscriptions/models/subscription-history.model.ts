import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType({ description: 'Subscription history entry based on payments' })
export class SubscriptionHistoryModel {
  @Field(() => ID)
  id: string;

  @Field(() => String)
  planName: string;

  @Field(() => String)
  planSlug: string;

  @Field(() => Number)
  amount: number;

  @Field(() => String)
  currency: string;

  @Field(() => Boolean)
  isEarlyBird: boolean;

  @Field(() => Date)
  paidAt: Date;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date, { nullable: true })
  periodStartAt?: Date; // Дата начала периода подписки (дата оплаты)

  @Field(() => Date, { nullable: true })
  periodEndAt?: Date; // Дата окончания периода подписки (для текущего плана) или дата завершения (для завершенных)

  @Field(() => Boolean, { nullable: true })
  isRenewal?: boolean; // true если этот платеж был продлением того же плана (не сменой плана)
}
