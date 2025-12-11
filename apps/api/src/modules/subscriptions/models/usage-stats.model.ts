import { Field, ObjectType } from '@nestjs/graphql';
import { PlanLimitsModel } from './plan-limits.model';

@ObjectType('UsageStats')
export class UsageStatsModel {
  @Field()
  activeProjects: number;

  @Field()
  totalMembers: number;

  @Field()
  storageUsedGB: number;

  @Field(() => PlanLimitsModel)
  limits: PlanLimitsModel;
}
