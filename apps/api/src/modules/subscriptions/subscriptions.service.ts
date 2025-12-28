import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../core/prisma/prisma.service';
import {
  SubscriptionStatus,
  ProjectStatus,
  SubscriptionPlan,
} from '@prisma/generated/client';
import { CreateSubscriptionInput } from './dto/create-subscription.input';
import { ChangePlanInput } from './dto/change-plan.input';
import {
  PLAN_LIMITS,
  TRIAL_DURATION_DAYS,
  BILLING_CYCLE_DAYS,
} from './constants/plans.constants';
import { PlanLimitsModel } from './models/plan-limits.model';
import { UsageStatsModel } from './models/usage-stats.model';

@Injectable()
export class SubscriptionsService {
  constructor(private prisma: PrismaService) {}

  async createSubscription(input: CreateSubscriptionInput, userId: string) {
    // Validate: user is team owner
    const team = await this.prisma.team.findUnique({
      where: { id: input.teamId },
      include: { owner: true },
    });

    if (!team || team.ownerId !== userId) {
      throw new ForbiddenException('Only team owner can create subscription');
    }

    // Check if subscription already exists
    const existing = await this.prisma.subscription.findUnique({
      where: { teamId: input.teamId },
    });

    if (existing) {
      throw new BadRequestException('Subscription already exists');
    }

    // Load plan to get trial days configuration
    let planData = null;
    let trialDays = TRIAL_DURATION_DAYS; // Fallback to default constant
    let planEnum = input.plan; // Default from input

    if (input.planId) {
      planData = await this.prisma.plan.findUnique({
        where: { id: input.planId },
      });

      if (!planData) {
        throw new NotFoundException('Plan not found');
      }

      // Use trial days from plan if configured
      if (planData.trialDays !== null && planData.trialDays !== undefined) {
        trialDays = planData.trialDays;
      }

      // Map slug to enum for backward compatibility
      // slug: 'lite' | 'foreman' | 'brigade' → enum: LITE | FOREMAN | BRIGADE
      if (planData.slug) {
        planEnum = planData.slug.toUpperCase() as any;
      }
    }

    // Calculate trial end date based on plan configuration
    const now = new Date();
    const trialEndsAt = trialDays > 0
      ? new Date(now.getTime() + trialDays * 24 * 60 * 60 * 1000)
      : null; // No trial if trialDays is 0 or null

    const currentPeriodEnd = trialEndsAt || new Date(
      now.getTime() + BILLING_CYCLE_DAYS * 24 * 60 * 60 * 1000,
    );

    // Create subscription
    const subscription = await this.prisma.subscription.create({
      data: {
        teamId: input.teamId,
        plan: planEnum, // Determined from planData.slug or input.plan
        planId: input.planId, // NEW: Use planId if provided
        status: trialEndsAt ? SubscriptionStatus.TRIALING : SubscriptionStatus.ACTIVE,
        currentPeriodStart: now,
        currentPeriodEnd,
        trialEndsAt,
        isEarlyBird: input.useEarlyBird || false,
      },
      include: {
        team: true,
        payments: true,
        planRef: {
          include: {
            prices: true,
            features: true,
          },
        },
      },
    });

    return subscription;
  }

  async findByUserId(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        ownedTeams: {
          include: {
            subscription: {
              include: {
                payments: true,
                planRef: {
                  include: {
                    prices: true,
                    features: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    return user?.ownedTeams[0]?.subscription || null;
  }

  async findByIdWithAuth(subscriptionId: string, userId: string) {
    const subscription = await this.prisma.subscription.findUnique({
      where: { id: subscriptionId },
      include: {
        team: {
          include: {
            owner: true,
          },
        },
        payments: true,
        planRef: {
          include: {
            prices: true,
            features: true,
          },
        },
      },
    });

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    if (subscription.team.ownerId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    return subscription;
  }

  async changePlan(input: ChangePlanInput, userId: string) {
    const subscription = await this.findByIdWithAuth(
      input.subscriptionId,
      userId,
    );

    let newPlanId = input.newPlanId;
    let newPlanEnum = input.newPlan;

    // Resolve planId if only enum is provided (backward compatibility)
    if (!newPlanId && newPlanEnum) {
        const p = await this.prisma.plan.findUnique({ where: { slug: newPlanEnum.toLowerCase() } });
        if (p) newPlanId = p.id;
    }

    // Resolve enum if only planId is provided (for legacy field)
    if (newPlanId && !newPlanEnum) {
        const p = await this.prisma.plan.findUnique({ where: { id: newPlanId } });
        // Use LITE as fallback for enum if we can't map it (though we should try to keep it nullable in DB)
        // For now, if p.slug matches an enum key we could use it, but safe to just use existing or LITE
        newPlanEnum = (p?.slug.toUpperCase() as SubscriptionPlan) || SubscriptionPlan.LITE;
    }

    if (subscription.planId === newPlanId) {
       throw new BadRequestException('Already on this plan');
    }

    // For now, only support scheduled changes (not immediate)
    // Immediate changes with proration will be implemented in Phase 2
    if (input.immediate) {
      throw new BadRequestException(
        'Immediate plan changes not yet supported. Plan will change at next billing cycle.',
      );
    }

    // Get current and new plan details for downgrade protection
    const currentPlan = await this.prisma.plan.findUnique({
      where: { id: subscription.planId },
    });

    const newPlan = await this.prisma.plan.findUnique({
      where: { id: newPlanId },
    });

    if (!currentPlan || !newPlan) {
      throw new NotFoundException('Plan not found');
    }

    // Check if this is a downgrade
    const isDowngrade = this.isDowngrade(currentPlan, newPlan);

    if (isDowngrade) {
      // Get current usage stats
      const usage = await this.getUsageStatsInternal(subscription.teamId);

      // Check if usage exceeds new plan limits
      const exceeds: string[] = [];

      if (
        newPlan.maxActiveProjects !== null &&
        usage.activeProjects > newPlan.maxActiveProjects
      ) {
        exceeds.push(
          `Проекты: ${usage.activeProjects} > ${newPlan.maxActiveProjects}`,
        );
      }

      if (usage.totalMembers > newPlan.maxMembers) {
        exceeds.push(`Участники: ${usage.totalMembers} > ${newPlan.maxMembers}`);
      }

      if (usage.storageUsedGB > newPlan.storageGB) {
        exceeds.push(
          `Хранилище: ${usage.storageUsedGB.toFixed(2)} ГБ > ${newPlan.storageGB} ГБ`,
        );
      }

      // If there are any exceeded limits, prevent downgrade
      if (exceeds.length > 0) {
        throw new ForbiddenException({
          message: 'Невозможно понизить план. Превышены лимиты нового плана.',
          code: 'DOWNGRADE_LIMIT_EXCEEDED',
          exceeds,
        });
      }
    }

    // Schedule change for next billing cycle
    return this.prisma.subscription.update({
      where: { id: input.subscriptionId },
      data: {
        plan: newPlanEnum,
        planId: newPlanId,
      },
    });
  }

  /**
   * Check if changing from currentPlan to newPlan is a downgrade
   * Based on sortOrder in database (lower sortOrder = lower tier)
   */
  private isDowngrade(
    currentPlan: { sortOrder: number },
    newPlan: { sortOrder: number },
  ): boolean {
    return newPlan.sortOrder < currentPlan.sortOrder;
  }

  /**
   * Get usage stats without auth check (internal use only)
   * Used by changePlan to check downgrade limits
   */
  private async getUsageStatsInternal(teamId: string): Promise<{
    activeProjects: number;
    totalMembers: number;
    storageUsedGB: number;
  }> {
    const team = await this.prisma.team.findUnique({
      where: { id: teamId },
    });

    if (!team) {
      throw new NotFoundException('Team not found');
    }

    const activeProjects = await this.prisma.project.count({
      where: {
        teamId,
        status: ProjectStatus.ACTIVE,
      },
    });

    const totalMembers = await this.prisma.teamMember.count({
      where: { teamId },
    });

    const storageUsedGB = Number(team.storageUsedBytes) / (1024 * 1024 * 1024);

    return {
      activeProjects,
      totalMembers,
      storageUsedGB,
    };
  }

  async cancelSubscription(subscriptionId: string, userId: string) {
    const subscription = await this.findByIdWithAuth(subscriptionId, userId);

    if (subscription.status === SubscriptionStatus.CANCELLED) {
      throw new BadRequestException('Subscription already cancelled');
    }

    return this.prisma.subscription.update({
      where: { id: subscriptionId },
      data: {
        cancelAtPeriodEnd: true,
        cancelledAt: new Date(),
      },
    });
  }

  async reactivateSubscription(subscriptionId: string, userId: string) {
    const subscription = await this.findByIdWithAuth(subscriptionId, userId);

    if (!subscription.cancelAtPeriodEnd) {
      throw new BadRequestException('Subscription is not cancelled');
    }

    return this.prisma.subscription.update({
      where: { id: subscriptionId },
      data: {
        cancelAtPeriodEnd: false,
        cancelledAt: null,
      },
    });
  }

  private async getEffectivePlanLimits(teamId: string): Promise<PlanLimitsModel> {
    const subscription = await this.prisma.subscription.findUnique({
      where: { teamId },
      include: { planRef: { include: { features: true, prices: true } } },
    });

    if (subscription?.planRef) {
      const rubPrice = subscription.planRef.prices.find((p) => p.currency === 'RUB')?.price;
      return {
        id: subscription.planRef.id,
        slug: subscription.planRef.slug,
        name: subscription.planRef.name,
        price: rubPrice ? Number(rubPrice) : 0,
        maxActiveProjects: subscription.planRef.maxActiveProjects,
        maxMembers: subscription.planRef.maxMembers,
        storageGB: subscription.planRef.storageGB,
        features: subscription.planRef.features.map((f) => f.name),
      };
    }

    // Fallback for legacy subscriptions or no subscription (Free/Lite tier logic)
    const planSlug = subscription?.plan?.toLowerCase() || 'lite';
    const dbPlan = await this.prisma.plan.findUnique({
      where: { slug: planSlug },
      include: { features: true, prices: true },
    });

    if (dbPlan) {
      const rubPrice = dbPlan.prices.find((p) => p.currency === 'RUB')?.price;
      return {
        id: dbPlan.id,
        slug: dbPlan.slug,
        name: dbPlan.name,
        price: rubPrice ? Number(rubPrice) : 0,
        maxActiveProjects: dbPlan.maxActiveProjects,
        maxMembers: dbPlan.maxMembers,
        storageGB: dbPlan.storageGB,
        features: dbPlan.features.map((f) => f.name),
      };
    }

    // Ultimate fallback if DB is empty
    return {
      id: '',
      slug: 'lite',
      name: 'Лайт',
      price: 0,
      maxActiveProjects: 1,
      maxMembers: 1,
      storageGB: 0.5,
      features: [],
    };
  }

  async checkProjectLimit(teamId: string): Promise<boolean> {
    const limits = await this.getEffectivePlanLimits(teamId);

    if (limits.maxActiveProjects === null || limits.maxActiveProjects === undefined) {
      return true; // Unlimited
    }

    const activeCount = await this.prisma.project.count({
      where: {
        teamId,
        status: ProjectStatus.ACTIVE,
      },
    });

    return activeCount < limits.maxActiveProjects;
  }

  async checkMemberLimit(teamId: string): Promise<boolean> {
    const limits = await this.getEffectivePlanLimits(teamId);

    const memberCount = await this.prisma.teamMember.count({
      where: { teamId },
    });

    return memberCount < limits.maxMembers;
  }

  async getCurrentLimits(teamId: string, userId: string): Promise<PlanLimitsModel> {
    const team = await this.prisma.team.findUnique({ where: { id: teamId } });
    if (!team || team.ownerId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    return this.getEffectivePlanLimits(teamId);
  }

  async getUsageStats(teamId: string, userId: string): Promise<UsageStatsModel> {
    const team = await this.prisma.team.findUnique({
      where: { id: teamId },
    });

    if (!team || team.ownerId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    const activeProjects = await this.prisma.project.count({
      where: {
        teamId,
        status: ProjectStatus.ACTIVE,
      },
    });

    const totalMembers = await this.prisma.teamMember.count({
      where: { teamId },
    });

    const storageUsedGB = Number(team.storageUsedBytes) / (1024 * 1024 * 1024);
    const limits = await this.getEffectivePlanLimits(teamId);

    return {
      activeProjects,
      totalMembers,
      storageUsedGB,
      limits,
    };
  }

  async getPlanLimits(plan: SubscriptionPlan): Promise<PlanLimitsModel> {
    const dbPlan = await this.prisma.plan.findUnique({
      where: { slug: plan.toLowerCase() },
      include: { features: true, prices: true },
    });

    if (dbPlan) {
      const rubPrice = dbPlan.prices.find((p) => p.currency === 'RUB')?.price;
      return {
        id: dbPlan.id,
        slug: dbPlan.slug,
        name: dbPlan.name,
        price: rubPrice ? Number(rubPrice) : 0,
        maxActiveProjects: dbPlan.maxActiveProjects,
        maxMembers: dbPlan.maxMembers,
        storageGB: dbPlan.storageGB,
        features: dbPlan.features.map((f) => f.name),
      };
    }

    // Fallback
    const limits = PLAN_LIMITS[plan];
    return {
      id: '',
      slug: plan.toLowerCase(),
      name: limits.name,
      price: limits.price,
      maxActiveProjects: limits.maxActiveProjects,
      maxMembers: limits.maxMembers,
      storageGB: limits.storageGB,
      features: limits.features,
    };
  }

  async getAvailablePlans(): Promise<PlanLimitsModel[]> {
    const plans = await this.prisma.plan.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
      include: { features: true, prices: true },
    });

    return plans.map((plan) => {
      const rubPrice = plan.prices.find((p) => p.currency === 'RUB')?.price;
      return {
        id: plan.id,
        slug: plan.slug,
        name: plan.name,
        price: rubPrice ? Number(rubPrice) : 0,
        maxActiveProjects: plan.maxActiveProjects,
        maxMembers: plan.maxMembers,
        storageGB: plan.storageGB,
        features: plan.features.map((f) => f.name),
      };
    });
  }
}
