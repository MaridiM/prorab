import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { SubscriptionModel } from './models/subscription.model';
import { PlanLimitsModel } from './models/plan-limits.model';
import { UsageStatsModel } from './models/usage-stats.model';
import { EarlyBirdStatsModel } from './models/early-bird-stats.model';
import { SubscriptionHistoryModel } from './models/subscription-history.model';
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
    // For now, return current subscription only
    // True history is available via mySubscriptionHistoryFromPayments
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
   * Check if Early Bird is available for the current user
   * Authenticated query - checks both global availability and user eligibility
   * User can only use Early Bird once in their lifetime
   */
  @Query(() => Boolean)
  @UseGuards(AuthGuard)
  async isEarlyBirdAvailableForMe(
    @CurrentUser() user: User,
  ): Promise<boolean> {
    return this.subscriptionsService.isEarlyBirdAvailableForUser(user.id);
  }

  /**
   * Get subscription history based on successful payments
   * Shows all successful payments as subscription history entries
   * This provides true history of plan changes over time
   */
  @Query(() => [SubscriptionHistoryModel])
  @UseGuards(AuthGuard)
  async mySubscriptionHistoryFromPayments(
    @CurrentUser() user: User,
  ): Promise<SubscriptionHistoryModel[]> {
    const payments = await this.subscriptionsService.getSubscriptionHistoryFromPayments(user.id);

    return payments.map(payment => {
      // Try to extract plan info from payment metadata
      // Sources: failureReason (mock payments) or description (real payments)
      // Format: "TARGET_PLAN_METADATA:targetPlanId|targetPlan|isEarlyBird" or "TARGET_PLAN:targetPlanId|targetPlan|isEarlyBird"
      let planName = 'Unknown';
      let planSlug = 'unknown';
      let isEarlyBird = false;
      let metadataFound = false;

      // Try to extract from failureReason (mock payments)
      if (payment.failureReason && payment.failureReason.startsWith('TARGET_PLAN_METADATA:')) {
        const metadataPart = payment.failureReason.replace('TARGET_PLAN_METADATA:', '');
        const [targetPlanId, targetPlan, isEarlyBirdStr] = metadataPart.split('|');
        
        if (targetPlan) {
          const planEnum = targetPlan.toUpperCase();
          planSlug = planEnum.toLowerCase();
          
          const planNameMap: Record<string, string> = {
            'LITE': 'Лайт',
            'FOREMAN': 'Прораб',
            'BRIGADE': 'Бригада',
          };
          planName = planNameMap[planEnum] || planEnum;
          metadataFound = true;
        }
        
        if (isEarlyBirdStr !== undefined) {
          isEarlyBird = isEarlyBirdStr === 'true';
        }
      }
      // Try to extract from description (real payments)
      else if (payment.description && payment.description.includes('TARGET_PLAN:')) {
        const targetPlanMatch = payment.description.match(/TARGET_PLAN:([^|]+)\|([^|]+)\|([^|]+)/);
        if (targetPlanMatch) {
          const [, targetPlanId, targetPlan, isEarlyBirdStr] = targetPlanMatch;
          
          if (targetPlan) {
            const planEnum = targetPlan.toUpperCase();
            planSlug = planEnum.toLowerCase();
            
            const planNameMap: Record<string, string> = {
              'LITE': 'Лайт',
              'FOREMAN': 'Прораб',
              'BRIGADE': 'Бригада',
            };
            planName = planNameMap[planEnum] || planEnum;
            metadataFound = true;
          }
          
          if (isEarlyBirdStr !== undefined) {
            isEarlyBird = isEarlyBirdStr === 'true';
          }
        }
      }

      // Fallback: If metadata not found, try to determine plan from payment amount
      // This is a fallback for old payments that don't have metadata
      if (!metadataFound) {
        const amount = Number(payment.amount);
        
        // Plan prices (RUB, Early Bird):
        // LITE: 290 (Early Bird), 490 (Regular)
        // FOREMAN: 690 (Early Bird), 990 (Regular)
        // BRIGADE: 1490 (Early Bird), 1990 (Regular)
        
        if (amount === 290 || amount === 490) {
          planName = 'Лайт';
          planSlug = 'lite';
          isEarlyBird = amount === 290;
          metadataFound = true;
        } else if (amount === 690 || amount === 990) {
          planName = 'Прораб';
          planSlug = 'foreman';
          isEarlyBird = amount === 690;
          metadataFound = true;
        } else if (amount === 1490 || amount === 1990) {
          planName = 'Бригада';
          planSlug = 'brigade';
          isEarlyBird = amount === 1490;
          metadataFound = true;
        }
      }

      // Final fallback: Use current subscription plan (least reliable)
      if (!metadataFound) {
        planName = payment.subscription?.planRef?.name || payment.subscription?.plan || 'Unknown';
        planSlug = payment.subscription?.planRef?.slug || payment.subscription?.plan?.toLowerCase() || 'unknown';
        isEarlyBird = payment.subscription?.isEarlyBird || false;
      }

      return {
        id: payment.id,
        planName,
        planSlug,
        amount: Number(payment.amount),
        currency: payment.currency,
        isEarlyBird,
        paidAt: payment.paidAt || payment.createdAt,
        createdAt: payment.createdAt,
      };
    });
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
