import { Field, ID, ObjectType, registerEnumType } from '@nestjs/graphql';
import {
  SubscriptionPlan,
  SubscriptionStatus,
  Subscription as PrismaSubscription,
} from '@prisma/generated/client';
import { PlanLimitsModel } from './plan-limits.model';

registerEnumType(SubscriptionPlan, {
  name: 'SubscriptionPlan',
});

registerEnumType(SubscriptionStatus, {
  name: 'SubscriptionStatus',
});

@ObjectType('Subscription')
export class SubscriptionModel implements Partial<PrismaSubscription> {
  @Field(() => ID)
  id: string;

  @Field()
  teamId: string;

  @Field(() => SubscriptionPlan)
  plan: SubscriptionPlan;

  @Field(() => SubscriptionStatus)
  status: SubscriptionStatus;

  @Field()
  currentPeriodStart: Date;

  @Field()
  currentPeriodEnd: Date;

  @Field({ nullable: true })
  trialEndsAt?: Date;

  @Field({ nullable: true })
  yookassaSubscriptionId?: string;

  @Field()
  cancelAtPeriodEnd: boolean;

  @Field({ nullable: true })
  cancelledAt?: Date;

  @Field()
  isEarlyBird: boolean;

  @Field(() => PlanLimitsModel)
  limits: PlanLimitsModel;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
