import { Field, InputType } from '@nestjs/graphql';
import { SubscriptionPlan } from '@prisma/generated/client';

@InputType()
export class CreateSubscriptionInput {
  @Field()
  teamId: string;

  @Field(() => String)
  plan: SubscriptionPlan;

  @Field({ nullable: true, description: 'Plan ID from database (new Plan model)' })
  planId?: string;

  @Field({ nullable: true })
  useEarlyBird?: boolean;
}
