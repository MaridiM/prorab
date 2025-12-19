import { ObjectType, Field, Int, ID, Float, InputType, registerEnumType } from '@nestjs/graphql';
import { PageInfo } from './shared/page-info.model';

// ==================== OBJECT TYPES ====================

@ObjectType({ description: 'Subscription plan' })
export class AdminPlanModel {
  @Field(() => ID)
  id: string;

  @Field(() => String, { description: 'Unique slug for the plan (e.g., "lite", "foreman")' })
  slug: string;

  @Field(() => String, { description: 'Display name of the plan' })
  name: string;

  @Field(() => String, { nullable: true, description: 'Description of the plan' })
  description?: string;

  @Field(() => Int, { nullable: true, description: 'Maximum active projects allowed (null = unlimited)' })
  maxActiveProjects?: number;

  @Field(() => Int, { description: 'Maximum team members allowed' })
  maxMembers: number;

  @Field(() => Float, { description: 'Storage limit in GB' })
  storageGB: number;

  @Field(() => Boolean, { description: 'Whether the plan is currently active' })
  isActive: boolean;

  @Field(() => Boolean, { description: 'Whether this plan is marked as popular' })
  isPopular: boolean;

  @Field(() => Int, { description: 'Sort order for display' })
  sortOrder: number;

  @Field(() => Boolean, { description: 'Whether early bird pricing is available' })
  isEarlyBird: boolean;

  @Field(() => [AdminPlanPriceModel], { description: 'Prices in different currencies' })
  prices: AdminPlanPriceModel[];

  @Field(() => [AdminPlanFeatureModel], { description: 'Features included in the plan' })
  features: AdminPlanFeatureModel[];

  @Field(() => Int, { nullable: true, description: 'Number of subscriptions using this plan' })
  subscriptionsCount?: number;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;
}

@ObjectType({ description: 'Plan price in a specific currency' })
export class AdminPlanPriceModel {
  @Field(() => ID)
  id: string;

  @Field(() => String, { description: 'Plan ID this price belongs to' })
  planId: string;

  @Field(() => String, { description: 'Currency code (RUB, USD, EUR)' })
  currency: string;

  @Field(() => Float, { description: 'Regular price' })
  price: number;

  @Field(() => Float, { description: 'Early bird price (discounted)' })
  earlyBirdPrice: number;

  @Field(() => Int, { description: 'Billing cycle in days (default: 30)' })
  billingCycleDays: number;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;
}

@ObjectType({ description: 'Plan feature' })
export class AdminPlanFeatureModel {
  @Field(() => ID)
  id: string;

  @Field(() => String, { description: 'Plan ID this feature belongs to' })
  planId: string;

  @Field(() => String, { description: 'Feature name' })
  name: string;

  @Field(() => String, { nullable: true, description: 'Feature description' })
  description?: string;

  @Field(() => Boolean, { description: 'Whether this feature is included' })
  isIncluded: boolean;

  @Field(() => Int, { description: 'Sort order for display' })
  sortOrder: number;
}

@ObjectType({ description: 'Paginated list of plans' })
export class AdminPlansConnection {
  @Field(() => [AdminPlanModel], { description: 'List of plans' })
  nodes: AdminPlanModel[];

  @Field(() => Int, { description: 'Total count of plans' })
  totalCount: number;

  @Field(() => PageInfo, { description: 'Pagination information' })
  pageInfo: PageInfo;
}

// ==================== INPUT TYPES ====================

@InputType({ description: 'Filters for querying plans' })
export class AdminPlanFilters {
  @Field(() => String, { nullable: true, description: 'Search by name, slug, or description' })
  search?: string;

  @Field(() => Boolean, { nullable: true, description: 'Filter by active status' })
  isActive?: boolean;

  @Field(() => String, { nullable: true, description: 'Filter prices by currency (RUB, USD, EUR)' })
  currency?: string;
}

@InputType({ description: 'Input for creating a new plan price' })
export class AdminPlanPriceInput {
  @Field(() => String, { description: 'Currency code (RUB, USD, EUR)' })
  currency: string;

  @Field(() => Float, { description: 'Regular price' })
  price: number;

  @Field(() => Float, { description: 'Early bird price (discounted)' })
  earlyBirdPrice: number;

  @Field(() => Int, { nullable: true, defaultValue: 30, description: 'Billing cycle in days' })
  billingCycleDays?: number;
}

@InputType({ description: 'Input for creating a new plan feature' })
export class AdminPlanFeatureInput {
  @Field(() => String, { description: 'Feature name' })
  name: string;

  @Field(() => String, { nullable: true, description: 'Feature description' })
  description?: string;

  @Field(() => Boolean, { nullable: true, defaultValue: true, description: 'Whether this feature is included' })
  isIncluded?: boolean;

  @Field(() => Int, { nullable: true, description: 'Sort order for display' })
  sortOrder?: number;
}

@InputType({ description: 'Input for creating a new plan' })
export class AdminCreatePlanInput {
  @Field(() => String, { description: 'Unique slug for the plan (e.g., "lite", "foreman")' })
  slug: string;

  @Field(() => String, { description: 'Display name of the plan' })
  name: string;

  @Field(() => String, { nullable: true, description: 'Description of the plan' })
  description?: string;

  @Field(() => Int, { nullable: true, description: 'Maximum active projects allowed (null = unlimited)' })
  maxActiveProjects?: number;

  @Field(() => Int, { description: 'Maximum team members allowed' })
  maxMembers: number;

  @Field(() => Float, { description: 'Storage limit in GB' })
  storageGB: number;

  @Field(() => Boolean, { nullable: true, defaultValue: false, description: 'Whether this plan is marked as popular' })
  isPopular?: boolean;

  @Field(() => Int, { nullable: true, defaultValue: 0, description: 'Sort order for display' })
  sortOrder?: number;

  @Field(() => [AdminPlanPriceInput], { description: 'Prices in different currencies (at least one required)' })
  prices: AdminPlanPriceInput[];

  @Field(() => [AdminPlanFeatureInput], { description: 'Features included in the plan' })
  features: AdminPlanFeatureInput[];
}

@InputType({ description: 'Input for updating an existing plan' })
export class AdminUpdatePlanInput {
  @Field(() => String, { nullable: true, description: 'Unique slug for the plan' })
  slug?: string;

  @Field(() => String, { nullable: true, description: 'Display name of the plan' })
  name?: string;

  @Field(() => String, { nullable: true, description: 'Description of the plan' })
  description?: string;

  @Field(() => Int, { nullable: true, description: 'Maximum active projects allowed' })
  maxActiveProjects?: number;

  @Field(() => Int, { nullable: true, description: 'Maximum team members allowed' })
  maxMembers?: number;

  @Field(() => Float, { nullable: true, description: 'Storage limit in GB' })
  storageGB?: number;

  @Field(() => Boolean, { nullable: true, description: 'Whether this plan is marked as popular' })
  isPopular?: boolean;

  @Field(() => Int, { nullable: true, description: 'Sort order for display' })
  sortOrder?: number;

  @Field(() => Boolean, { nullable: true, description: 'Whether the plan is active' })
  isActive?: boolean;

  @Field(() => [AdminPlanPriceInput], { nullable: true, description: 'Update all prices (replaces existing)' })
  prices?: AdminPlanPriceInput[];

  @Field(() => [AdminPlanFeatureInput], { nullable: true, description: 'Update all features (replaces existing)' })
  features?: AdminPlanFeatureInput[];
}
