import { ObjectType, Field, Int, ID, Float, InputType } from '@nestjs/graphql';
import { IsOptional, IsString, IsDate } from 'class-validator';
import { Type } from 'class-transformer';
import { SubscriptionModel } from '../../subscriptions/models/subscription.model';
import { Team } from '../../teams/models/team.model';
import { PageInfo } from './shared/page-info.model';

@InputType()
export class AdminSubscriptionFilters {
  @Field(() => String, { nullable: true, description: 'Search by team name or owner email' })
  @IsOptional()
  @IsString()
  search?: string;

  @Field(() => String, { nullable: true, description: 'Filter by plan (LITE, FOREMAN, BRIGADE)' })
  @IsOptional()
  @IsString()
  plan?: string;

  @Field(() => String, { nullable: true, description: 'Filter by status' })
  @IsOptional()
  @IsString()
  status?: string;

  @Field(() => Date, { nullable: true, description: 'Created after date' })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  createdAfter?: Date;

  @Field(() => Date, { nullable: true, description: 'Created before date' })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  createdBefore?: Date;

  @Field(() => Date, { nullable: true, description: 'Expiring before date' })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  expiringBefore?: Date;
}

@ObjectType()
export class AdminSubscriptionsConnection {
  @Field(() => [SubscriptionModel], { description: 'List of subscriptions' })
  nodes: SubscriptionModel[];

  @Field(() => Int, { description: 'Total count of subscriptions' })
  totalCount: number;

  @Field(() => PageInfo, { description: 'Pagination information' })
  pageInfo: PageInfo;
}

@ObjectType()
export class SubscriptionsByPlan {
  @Field(() => Int, { description: 'Number of LITE subscriptions' })
  LITE: number;

  @Field(() => Int, { description: 'Number of FOREMAN subscriptions' })
  FOREMAN: number;

  @Field(() => Int, { description: 'Number of BRIGADE subscriptions' })
  BRIGADE: number;
}

@ObjectType()
export class SubscriptionStats {
  @Field(() => Int, { description: 'Total number of subscriptions' })
  totalSubscriptions: number;

  @Field(() => Int, { description: 'Number of active subscriptions' })
  activeSubscriptions: number;

  @Field(() => Int, { description: 'Number of trialing subscriptions' })
  trialingSubscriptions: number;

  @Field(() => Int, { description: 'Number of cancelled subscriptions' })
  cancelledSubscriptions: number;

  @Field(() => Float, { description: 'Total revenue from all subscriptions' })
  totalRevenue: number;

  @Field(() => SubscriptionsByPlan, { description: 'Subscriptions count by plan' })
  byPlan: SubscriptionsByPlan;
}

@InputType()
export class UpdateSubscriptionInput {
  @Field(() => String, { nullable: true, description: 'Subscription plan' })
  plan?: string;

  @Field(() => String, { nullable: true, description: 'Subscription status' })
  status?: string;

  @Field(() => Date, { nullable: true, description: 'Current period end date' })
  currentPeriodEnd?: Date;

  @Field(() => Boolean, { nullable: true, description: 'Cancel at period end' })
  cancelAtPeriodEnd?: boolean;
}
