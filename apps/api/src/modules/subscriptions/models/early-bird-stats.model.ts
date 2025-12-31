import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
export class EarlyBirdStatsModel {
  @Field(() => Int, { description: 'Number of Early Bird subscriptions used' })
  used: number;

  @Field(() => Int, { description: 'Total Early Bird subscription limit' })
  limit: number;

  @Field(() => Int, { description: 'Remaining Early Bird subscriptions' })
  remaining: number;

  @Field(() => Boolean, { description: 'Whether Early Bird program is still available' })
  isAvailable: boolean;

  @Field(() => Int, { description: 'Total number of active teams/subscriptions' })
  totalTeams: number;
}
