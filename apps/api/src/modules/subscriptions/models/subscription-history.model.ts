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
}
