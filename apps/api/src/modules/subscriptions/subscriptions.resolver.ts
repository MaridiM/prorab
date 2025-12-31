import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { SubscriptionModel } from './models/subscription.model';
import { PlanLimitsModel } from './models/plan-limits.model';
import { UsageStatsModel } from './models/usage-stats.model';
import { EarlyBirdStatsModel } from './models/early-bird-stats.model';
import { CreateSubscriptionInput } from './dto/create-subscription.input';
import { ChangePlanInput } from './dto/change-plan.input';
import { AuthGuard } from '../auth/guards/auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '@prisma/generated/client';
import { PLAN_LIMITS } from './constants/plans.constants';
import { AdminPlansService } from '../admin/services/admin-plans.service';
import { AdminPlanModel } from '../admin/models/admin-plan.model';

@Resolver(() => SubscriptionModel)
export class SubscriptionsResolver {
  constructor(
    private subscriptionsService: SubscriptionsService,
    private adminPlansService: AdminPlansService,
  ) {}

  @Query(() => SubscriptionModel, { nullable: true })
  @UseGuards(AuthGuard)
  async mySubscription(
    @CurrentUser() user: User,
  ): Promise<SubscriptionModel | null> {
    const subscription = await this.subscriptionsService.findByUserId(user.id);

    if (!subscription) {
      return null;
    }

    const limits = await this.subscriptionsService.getPlanLimits(subscription.plan);

    return {
      ...subscription,
      limits,
      planRef: subscription.planRef ? {
        ...subscription.planRef,
        prices: subscription.planRef.prices.map(p => ({
          ...p,
          price: Number(p.price),
          earlyBirdPrice: Number(p.earlyBirdPrice),
        })),
      } : undefined,
    };
  }

  @Query(() => [SubscriptionModel])
  @UseGuards(AuthGuard)
  async mySubscriptionHistory(
    @CurrentUser() user: User,
  ): Promise<SubscriptionModel[]> {
    const subscriptions = await this.subscriptionsService.findAllByUserId(user.id);

    return Promise.all(
      subscriptions.map(async (subscription) => {
        const limits = await this.subscriptionsService.getPlanLimits(subscription.plan);
        return {
          ...subscription,
          limits,
          planRef: subscription.planRef ? {
            ...subscription.planRef,
            prices: subscription.planRef.prices.map(p => ({
              ...p,
              price: Number(p.price),
              earlyBirdPrice: Number(p.earlyBirdPrice),
            })),
          } : undefined,
        };
      })
    );
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

    const limits = await this.subscriptionsService.getPlanLimits(subscription.plan);

    return {
      ...subscription,
      limits,
      planRef: subscription.planRef ? {
        ...subscription.planRef,
        prices: subscription.planRef.prices.map(p => ({
          ...p,
          price: Number(p.price),
          earlyBirdPrice: Number(p.earlyBirdPrice),
        })),
      } : undefined,
    };
  }

  @Query(() => [PlanLimitsModel])
  async availablePlans(): Promise<PlanLimitsModel[]> {
    return this.subscriptionsService.getAvailablePlans();
  }

  /**
   * Get Early Bird statistics
   * Public query - shows remaining Early Bird slots and social proof
   */
  @Query(() => EarlyBirdStatsModel)
  async earlyBirdStats(): Promise<EarlyBirdStatsModel> {
    return this.subscriptionsService.getEarlyBirdStats();
  }

  /**
   * Get all available plans from database with full details (prices, features)
   * Public query - no authentication required
   */
  @Query(() => [AdminPlanModel])
  async availablePlansDetailed(): Promise<AdminPlanModel[]> {
    const plans = await this.adminPlansService.getAvailablePlans();

    // Transform to match AdminPlanModel format (convert Decimal to number)
    return plans.map(plan => ({
      ...plan,
      prices: plan.prices.map(p => ({
        ...p,
        price: Number(p.price),
        earlyBirdPrice: Number(p.earlyBirdPrice),
      })),
      subscriptionsCount: (plan as any)._count?.subscriptions,
    }));
  }

  /**
   * Get a plan by slug from database
   * Public query - no authentication required
   */
  @Query(() => AdminPlanModel, { nullable: true })
  async planBySlug(
    @Args('slug') slug: string,
  ): Promise<AdminPlanModel | null> {
    try {
      const plan = await this.adminPlansService.findBySlug(slug);

      // Transform to match AdminPlanModel format (convert Decimal to number)
      return {
        ...plan,
        prices: plan.prices.map(p => ({
          ...p,
          price: Number(p.price),
          earlyBirdPrice: Number(p.earlyBirdPrice),
        })),
        subscriptionsCount: (plan as any)._count?.subscriptions,
      };
    } catch (error) {
      // Return null if plan not found instead of throwing error
      return null;
    }
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

    const limits = await this.subscriptionsService.getPlanLimits(subscription.plan);

    return {
      ...subscription,
      limits,
      planRef: subscription.planRef ? {
        ...subscription.planRef,
        prices: subscription.planRef.prices.map(p => ({
          ...p,
          price: Number(p.price),
          earlyBirdPrice: Number(p.earlyBirdPrice),
        })),
      } : undefined,
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

    const limits = await this.subscriptionsService.getPlanLimits(subscription.plan);

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

    const limits = await this.subscriptionsService.getPlanLimits(subscription.plan);

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

    const limits = await this.subscriptionsService.getPlanLimits(subscription.plan);

    return {
      ...subscription,
      limits,
    };
  }
}
