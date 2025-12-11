import { Field, InputType } from '@nestjs/graphql';
import { SubscriptionPlan } from '@prisma/generated/client';

@InputType()
export class CreateSubscriptionInput {
  @Field()
  teamId: string;

  @Field(() => String)
  plan: SubscriptionPlan;

  @Field({ nullable: true })
  useEarlyBird?: boolean;
}
