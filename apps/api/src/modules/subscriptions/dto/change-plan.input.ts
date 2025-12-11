import { Field, InputType } from '@nestjs/graphql';
import { SubscriptionPlan } from '@prisma/generated/client';

@InputType()
export class ChangePlanInput {
  @Field()
  subscriptionId: string;

  @Field(() => String)
  newPlan: SubscriptionPlan;

  @Field({ defaultValue: false })
  immediate: boolean;
}
