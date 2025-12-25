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
        plan: input.plan, // Keep old enum for backward compatibility
        planId: input.planId, // NEW: Use planId if provided
        status: trialEndsAt ? SubscriptionStatus.TRIALING : SubscriptionStatus.ACTIVE,
        currentPeriodStart: now,
        currentPeriodEnd,
        trialEndsAt,
        isEarlyBird: input.useEarlyBird || false,
      },
      include: { team: true, payments: true, planRef: true },
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

    if (subscription.plan === input.newPlan) {
      throw new BadRequestException('Already on this plan');
    }

    // For now, only support scheduled changes (not immediate)
    // Immediate changes with proration will be implemented in Phase 2
    if (input.immediate) {
      throw new BadRequestException(
        'Immediate plan changes not yet supported. Plan will change at next billing cycle.',
      );
    }

    // Schedule change for next billing cycle
    return this.prisma.subscription.update({
      where: { id: input.subscriptionId },
      data: {
        plan: input.newPlan,
      },
    });
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

  async checkProjectLimit(teamId: string): Promise<boolean> {
    const subscription = await this.prisma.subscription.findUnique({
      where: { teamId },
    });

    if (!subscription) {
      // No subscription - use LITE limits by default
      const limits = PLAN_LIMITS.LITE;
      const activeCount = await this.prisma.project.count({
        where: {
          teamId,
          status: ProjectStatus.ACTIVE,
        },
      });

      return activeCount < (limits.maxActiveProjects || Infinity);
    }

    const limits = PLAN_LIMITS[subscription.plan];

    if (!limits.maxActiveProjects) {
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
    const subscription = await this.prisma.subscription.findUnique({
      where: { teamId },
    });

    const limits = PLAN_LIMITS[subscription?.plan || 'LITE'];
    const memberCount = await this.prisma.teamMember.count({
      where: { teamId },
    });

    return memberCount < limits.maxMembers;
  }

  async getCurrentLimits(teamId: string, userId: string): Promise<PlanLimitsModel> {
    const team = await this.prisma.team.findUnique({
      where: { id: teamId },
      include: {
        subscription: true,
        owner: true,
      },
    });

    if (!team || team.ownerId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    const plan = team.subscription?.plan || 'LITE';
    const limits = PLAN_LIMITS[plan];
    const isEarlyBird = team.subscription?.isEarlyBird || false;

    return {
      name: limits.name,
      price: isEarlyBird ? limits.earlyBirdPrice : limits.price,
      maxActiveProjects: limits.maxActiveProjects,
      maxMembers: limits.maxMembers,
      storageGB: limits.storageGB,
      features: limits.features,
    };
  }

  async getUsageStats(teamId: string, userId: string): Promise<UsageStatsModel> {
    const team = await this.prisma.team.findUnique({
      where: { id: teamId },
      include: {
        subscription: true,
        owner: true,
      },
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

    const plan = team.subscription?.plan || 'LITE';
    const limits = PLAN_LIMITS[plan];
    const isEarlyBird = team.subscription?.isEarlyBird || false;

    return {
      activeProjects,
      totalMembers,
      storageUsedGB,
      limits: {
        name: limits.name,
        price: isEarlyBird ? limits.earlyBirdPrice : limits.price,
        maxActiveProjects: limits.maxActiveProjects,
        maxMembers: limits.maxMembers,
        storageGB: limits.storageGB,
        features: limits.features,
      },
    };
  }

  getPlanLimits(plan: SubscriptionPlan): PlanLimitsModel {
    const limits = PLAN_LIMITS[plan];
    return {
      name: limits.name,
      price: limits.price,
      maxActiveProjects: limits.maxActiveProjects,
      maxMembers: limits.maxMembers,
      storageGB: limits.storageGB,
      features: limits.features,
    };
  }
}
