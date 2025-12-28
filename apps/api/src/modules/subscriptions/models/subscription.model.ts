import { Field, ID, ObjectType, registerEnumType } from '@nestjs/graphql';
import { GraphQLJSON } from 'graphql-scalars';
import {
  SubscriptionPlan,
  SubscriptionStatus,
  Subscription as PrismaSubscription,
} from '@prisma/generated/client';
import { PlanLimitsModel } from './plan-limits.model';
import { AdminPlanModel } from '../../admin/models/admin-plan.model';

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

  @Field({ nullable: true, description: 'Plan ID from database (new Plan model)' })
  planId?: string;

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

  @Field(() => AdminPlanModel, { nullable: true, description: 'Plan reference from database' })
  planRef?: AdminPlanModel;

  @Field(() => PlanLimitsModel)
  limits: PlanLimitsModel;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field(() => GraphQLJSON, { nullable: true, description: 'Team with owner and members details' })
  team?: any;
}
