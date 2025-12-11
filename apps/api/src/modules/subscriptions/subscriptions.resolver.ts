import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { SubscriptionModel } from './models/subscription.model';
import { PlanLimitsModel } from './models/plan-limits.model';
import { UsageStatsModel } from './models/usage-stats.model';
import { CreateSubscriptionInput } from './dto/create-subscription.input';
import { ChangePlanInput } from './dto/change-plan.input';
import { AuthGuard } from '../auth/guards/auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '@prisma/generated/client';
import { PLAN_LIMITS } from './constants/plans.constants';

@Resolver(() => SubscriptionModel)
export class SubscriptionsResolver {
  constructor(private subscriptionsService: SubscriptionsService) {}

  @Query(() => SubscriptionModel, { nullable: true })
  @UseGuards(AuthGuard)
  async mySubscription(
    @CurrentUser() user: User,
  ): Promise<SubscriptionModel | null> {
    const subscription = await this.subscriptionsService.findByUserId(user.id);

    if (!subscription) {
      return null;
    }

    const limits = this.subscriptionsService.getPlanLimits(subscription.plan);

    return {
      ...subscription,
      limits,
    };
  }

  @Query(() => SubscriptionModel)
  @UseGuards(AuthGuard)
  async subscription(
    @Args('id') id: string,
    @CurrentUser() user: User,
  ): Promise<SubscriptionModel> {
    const subscription = await this.subscriptionsService.findByIdWithAuth(
      id,
      user.id,
    );

    const limits = this.subscriptionsService.getPlanLimits(subscription.plan);

    return {
      ...subscription,
      limits,
    };
  }

  @Query(() => [PlanLimitsModel])
  async availablePlans(): Promise<PlanLimitsModel[]> {
    return Object.values(PLAN_LIMITS).map((limits) => ({
      name: limits.name,
      price: limits.price,
      maxActiveProjects: limits.maxActiveProjects,
      maxMembers: limits.maxMembers,
      storageGB: limits.storageGB,
      features: limits.features,
    }));
  }

  @Query(() => PlanLimitsModel)
  @UseGuards(AuthGuard)
  async currentPlanLimits(
    @Args('teamId') teamId: string,
    @CurrentUser() user: User,
  ): Promise<PlanLimitsModel> {
    return this.subscriptionsService.getCurrentLimits(teamId, user.id);
  }

  @Query(() => UsageStatsModel)
  @UseGuards(AuthGuard)
  async usageStats(
    @Args('teamId') teamId: string,
    @CurrentUser() user: User,
  ): Promise<UsageStatsModel> {
    return this.subscriptionsService.getUsageStats(teamId, user.id);
  }

  @Query(() => Boolean)
  @UseGuards(AuthGuard)
  async canAddProject(@Args('teamId') teamId: string): Promise<boolean> {
    return this.subscriptionsService.checkProjectLimit(teamId);
  }

  @Mutation(() => SubscriptionModel)
  @UseGuards(AuthGuard)
  async createSubscription(
    @Args('input') input: CreateSubscriptionInput,
    @CurrentUser() user: User,
  ): Promise<SubscriptionModel> {
    const subscription = await this.subscriptionsService.createSubscription(
      input,
      user.id,
    );

    const limits = this.subscriptionsService.getPlanLimits(subscription.plan);

    return {
      ...subscription,
      limits,
    };
  }

  @Mutation(() => SubscriptionModel)
  @UseGuards(AuthGuard)
  async changePlan(
    @Args('input') input: ChangePlanInput,
    @CurrentUser() user: User,
  ): Promise<SubscriptionModel> {
    const subscription = await this.subscriptionsService.changePlan(
      input,
      user.id,
    );

    const limits = this.subscriptionsService.getPlanLimits(subscription.plan);

    return {
      ...subscription,
      limits,
    };
  }

  @Mutation(() => SubscriptionModel)
  @UseGuards(AuthGuard)
  async cancelSubscription(
    @Args('subscriptionId') subscriptionId: string,
    @CurrentUser() user: User,
  ): Promise<SubscriptionModel> {
    const subscription = await this.subscriptionsService.cancelSubscription(
      subscriptionId,
      user.id,
    );

    const limits = this.subscriptionsService.getPlanLimits(subscription.plan);

    return {
      ...subscription,
      limits,
    };
  }

  @Mutation(() => SubscriptionModel)
  @UseGuards(AuthGuard)
  async reactivateSubscription(
    @Args('subscriptionId') subscriptionId: string,
    @CurrentUser() user: User,
  ): Promise<SubscriptionModel> {
    const subscription =
      await this.subscriptionsService.reactivateSubscription(
        subscriptionId,
        user.id,
      );

    const limits = this.subscriptionsService.getPlanLimits(subscription.plan);

    return {
      ...subscription,
      limits,
    };
  }
}
