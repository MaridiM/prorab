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
  EARLY_BIRD_LIMIT,
  TRIAL_ALLOWED_ONLY_FOR_PLAN,
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

    // Get team owner (user who is creating the subscription)
    const teamOwner = team.owner;

    // Check trial eligibility - user can only get trial ONCE (not per plan, but overall)
    // This prevents users from getting multiple trial periods by changing plans
    let alreadyTrialed = false;
    if (trialDays > 0) {
      // Check if user has used trial for ANY plan (not just this specific plan)
      const user = await this.prisma.user.findUnique({
        where: { id: teamOwner.id },
        select: { trialedPlanIds: true },
      });

      // If user has ANY plan in trialedPlanIds, they already used trial
      alreadyTrialed = (user?.trialedPlanIds?.length || 0) > 0;

      if (alreadyTrialed) {
        // Disable trial if user already used it for any plan
        trialDays = 0;
        console.log(
          `User ${teamOwner.id} already used trial for another plan. Trial disabled to prevent abuse.`
        );
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

    // Validate Early Bird eligibility
    if (input.useEarlyBird) {
      // Check if plan supports Early Bird
      if (planData && !planData.isEarlyBird) {
        throw new BadRequestException(
          'Этот план не участвует в программе Early Bird.'
        );
      }

      // Check Early Bird limit
      const earlyBirdCount = await this.getEarlyBirdCount();
      if (earlyBirdCount >= EARLY_BIRD_LIMIT) {
        throw new BadRequestException(
          `Программа Early Bird завершена. Достигнут лимит ${EARLY_BIRD_LIMIT} подписок.`
        );
      }
    }

    // Create subscription with PENDING_PAYMENT status
    // Status will be changed to TRIALING or ACTIVE after successful payment
    const subscription = await this.prisma.subscription.create({
      data: {
        teamId: input.teamId,
        plan: planEnum, // Determined from planData.slug or input.plan
        planId: input.planId, // NEW: Use planId if provided
        status: SubscriptionStatus.PENDING_PAYMENT, // Wait for payment confirmation
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

    // Mark trial as used if trial was granted
    if (trialEndsAt && input.planId && !alreadyTrialed) {
      await this.markTrialAsUsed(teamOwner.id, input.planId);
      console.log(
        `Marked trial as used for user ${teamOwner.id} on plan ${input.planId}`
      );
    }

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

    // Find active subscription from any team
    const activeSubscription = user?.ownedTeams
      ?.map(team => team.subscription)
      .filter(sub => sub !== null)
      .find(sub => sub.status === 'ACTIVE' || sub.status === 'TRIALING');

    return activeSubscription || null;
  }

  async findAllByUserId(userId: string) {
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

    // Get all subscriptions from all owned teams
    const subscriptions = user?.ownedTeams
      .map(team => team.subscription)
      .filter(sub => sub !== null) || [];

    // Sort by creation date (newest first)
    return subscriptions.sort((a, b) =>
      b.createdAt.getTime() - a.createdAt.getTime()
    );
  }

  /**
   * Get subscription history based on successful payments
   * Each successful payment represents a subscription period
   * This gives true history of plan changes
   */
  async getSubscriptionHistoryFromPayments(userId: string) {
    // Get all teams owned by user
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        ownedTeams: {
          include: {
            subscription: {
              include: {
                payments: {
                  where: {
                    status: 'SUCCEEDED',
                  },
                  orderBy: {
                    paidAt: 'desc',
                  },
                  include: {
                    subscription: {
                      include: {
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

    // Collect all successful payments from all teams
    const allPayments: any[] = [];
    user?.ownedTeams.forEach(team => {
      if (team.subscription?.payments) {
        team.subscription.payments.forEach(payment => {
          allPayments.push({
            ...payment,
            subscription: team.subscription,
          });
        });
      }
    });

    // Sort by paid date (newest first)
    return allPayments.sort((a, b) =>
      new Date(b.paidAt || b.createdAt).getTime() - new Date(a.paidAt || a.createdAt).getTime()
    );
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

    // Allow same plan for renewal (immediate=false means it's a renewal, not a change)
    // Only prevent if immediate=true (which is not supported anyway)
    if (subscription.planId === newPlanId && input.immediate) {
       throw new BadRequestException('Already on this plan');
    }
    
    // If same plan and not immediate, this is a renewal - allow it
    if (subscription.planId === newPlanId && !input.immediate) {
      // This is a renewal, return the subscription as-is
      return subscription;
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

    // Allow downgrade - user can choose to downgrade even if limits are exceeded
    // The plan change will be scheduled for the next billing cycle
    // Note: User will need to reduce usage before the change takes effect, or they may lose access to some features

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
    const team = await this.prisma.team.findUnique({ where: { id: teamId } });
    if (!team) return false;

    // Determine limits based on owner's subscription
    const activeSubscription = await this.findByUserId(team.ownerId);
    const limitSourceTeamId = activeSubscription?.teamId || teamId;
    const limits = await this.getEffectivePlanLimits(limitSourceTeamId);

    if (limits.maxActiveProjects === null || limits.maxActiveProjects === undefined) {
      return true; // Unlimited
    }

    // Global Active Count
    const ownedTeams = await this.prisma.team.findMany({
        where: { ownerId: team.ownerId },
        select: { id: true }
    });
    const ownedTeamIds = ownedTeams.map(t => t.id);

    const activeCount = await this.prisma.project.count({
      where: {
        teamId: { in: ownedTeamIds },
        status: ProjectStatus.ACTIVE,
      },
    });

    return activeCount < limits.maxActiveProjects;
  }

  async checkMemberLimit(teamId: string): Promise<boolean> {
    const team = await this.prisma.team.findUnique({ where: { id: teamId } });
    if (!team) return false;

    // Determine limits based on owner's subscription
    const activeSubscription = await this.findByUserId(team.ownerId);
    const limitSourceTeamId = activeSubscription?.teamId || teamId;
    const limits = await this.getEffectivePlanLimits(limitSourceTeamId);

    // Global Member Count
    const ownedTeams = await this.prisma.team.findMany({
        where: { ownerId: team.ownerId },
        select: { id: true }
    });
    const ownedTeamIds = ownedTeams.map(t => t.id);

    const nonOwnerMembersCount = await this.prisma.teamMember.count({
      where: { 
        teamId: { in: ownedTeamIds },
        userId: { not: team.ownerId } 
      },
    });
    
    const totalMembers = nonOwnerMembersCount;

    // Scale limit by active projects
    // Global active projects count for owner
    const activeProjects = await this.prisma.project.count({
      where: {
        teamId: { in: ownedTeamIds },
        status: ProjectStatus.ACTIVE,
      },
    });

    const baseMaxMembers = limits.maxMembers;
    // Limit = activeProjects * baseLimit. At least 1 unit if 0 projects.
    const effectiveMaxMembers = baseMaxMembers * Math.max(1, activeProjects);

    return totalMembers < effectiveMaxMembers;
  }

  async getCurrentLimits(teamId: string, userId: string): Promise<PlanLimitsModel> {
    const team = await this.prisma.team.findUnique({ where: { id: teamId } });
    if (!team || team.ownerId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    return this.getEffectivePlanLimits(teamId);
  }

  async getUsageStats(teamId: string, userId: string): Promise<UsageStatsModel> {
    // Determine the user's active subscription limits independently of the passed teamId
    // Logic: Find active subscription for the user to get the correct plan limits
    const activeSubscription = await this.findByUserId(userId);
    
    // If an active subscription exists, use its teamId to get limits. 
    // Otherwise fallback to the requested teamId (which leads to Free/Lite limits usually)
    const limitSourceTeamId = activeSubscription?.teamId || teamId;
    const limits = await this.getEffectivePlanLimits(limitSourceTeamId);

    // Get all teams owned by this user to calculate global usage
    const ownedTeams = await this.prisma.team.findMany({
      where: { ownerId: userId },
      select: { 
        id: true,
        storageUsedBytes: true 
      }
    });

    const ownedTeamIds = ownedTeams.map(t => t.id);

    // 1. Calculate Active Projects across ALL owned teams
    const activeProjects = await this.prisma.project.count({
      where: {
        teamId: { in: ownedTeamIds },
        status: ProjectStatus.ACTIVE,
      },
    });

    // 2. Calculate Total Members across ALL owned teams
    // Logic: Count all members in owned teams EXCEPT the owner
    // Owner does not count towards the limit (free seat)
    const nonOwnerMembersCount = await this.prisma.teamMember.count({
      where: { 
        teamId: { in: ownedTeamIds },
        userId: { not: userId } // Exclude owner
      },
    });
    
    const totalMembers = nonOwnerMembersCount;

    // 3. Calculate Total Storage across ALL owned teams
    const totalStorageBytes = ownedTeams.reduce((sum, team) => sum + Number(team.storageUsedBytes), 0);
    const storageUsedGB = totalStorageBytes / (1024 * 1024 * 1024);

    // Calcluate dynamic member limit based on active projects
    // Logic: Limit scales with number of active projects (e.g. 3 members per project)
    // We use Math.max(1, activeProjects) to ensure at least one base limit is available
    const baseMaxMembers = limits.maxMembers;
    const effectiveMaxMembers = baseMaxMembers * Math.max(1, activeProjects);

    // Update limits object to reflect the dynamic limit
    const dynamicLimits = {
      ...limits,
      maxMembers: effectiveMaxMembers,
    };

    return {
      activeProjects,
      totalMembers,
      storageUsedGB,
      limits: dynamicLimits,
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

  /**
   * Get count of active Early Bird subscriptions
   * Used to enforce the EARLY_BIRD_LIMIT (500 subscriptions)
   */
  async getEarlyBirdCount(): Promise<number> {
    return this.prisma.subscription.count({
      where: {
        isEarlyBird: true,
        status: {
          in: [
            SubscriptionStatus.ACTIVE,
            SubscriptionStatus.TRIALING,
            SubscriptionStatus.PENDING_PAYMENT,
          ],
        },
      },
    });
  }

  /**
   * Check if user has already used Early Bird pricing
   * @param userId User ID
   * @returns true if user has already used Early Bird
   */
  async hasUsedEarlyBird(userId: string): Promise<boolean> {
    // Check if user has any subscription with isEarlyBird = true
    const earlyBirdSubscription = await this.prisma.subscription.findFirst({
      where: {
        team: {
          ownerId: userId,
        },
        isEarlyBird: true,
      },
    });

    return !!earlyBirdSubscription;
  }

  /**
   * Check if user currently has an active Early Bird subscription
   * @param userId User ID
   * @returns true if user has active Early Bird subscription
   */
  async hasActiveEarlyBird(userId: string): Promise<boolean> {
    const earlyBirdSubscription = await this.prisma.subscription.findFirst({
      where: {
        team: {
          ownerId: userId,
        },
        isEarlyBird: true,
        status: {
          in: [
            SubscriptionStatus.ACTIVE,
            SubscriptionStatus.TRIALING,
            SubscriptionStatus.PENDING_PAYMENT,
          ],
        },
      },
    });

    return !!earlyBirdSubscription;
  }

  /**
   * Check if Early Bird is available for a specific user
   * User can use Early Bird if:
   * 1. They have ACTIVE Early Bird subscription (can change plans within Early Bird)
   * 2. OR: They never used Early Bird AND global slots available
   *
   * @param userId User ID
   * @returns true if user can use Early Bird pricing
   */
  async isEarlyBirdAvailableForUser(userId: string): Promise<boolean> {
    // First check: Does user have ACTIVE Early Bird subscription?
    // If yes, they can always use Early Bird (for plan changes)
    const hasActive = await this.hasActiveEarlyBird(userId);
    if (hasActive) {
      return true;
    }

    // Second check: Has user EVER used Early Bird?
    const hasUsed = await this.hasUsedEarlyBird(userId);
    if (hasUsed) {
      // User had Early Bird before but doesn't have active subscription now
      // (cancelled, expired, etc.) - cannot get Early Bird again
      return false;
    }

    // Third check: Global Early Bird availability
    const used = await this.getEarlyBirdCount();
    const remaining = Math.max(0, EARLY_BIRD_LIMIT - used);

    // New user who never had Early Bird can get it if slots available
    return remaining > 0;
  }

  /**
   * Get Early Bird statistics for UI display
   * Returns used count, limit, remaining, availability, and total teams
   */
  async getEarlyBirdStats() {
    const used = await this.getEarlyBirdCount();
    const remaining = Math.max(0, EARLY_BIRD_LIMIT - used);
    const isAvailable = remaining > 0;

    // Count total active subscriptions (for social proof)
    const totalTeams = await this.prisma.subscription.count({
      where: {
        status: {
          in: [
            SubscriptionStatus.ACTIVE,
            SubscriptionStatus.TRIALING,
          ],
        },
      },
    });

    return {
      used,
      limit: EARLY_BIRD_LIMIT,
      remaining,
      isAvailable,
      totalTeams,
    };
  }

  /**
   * Check if user has already used trial for a specific plan
   * @param userId User ID
   * @param planId Plan ID
   * @returns true if user has already trialed this plan
   */
  async hasUsedTrial(userId: string, planId: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { trialedPlanIds: true },
    });

    return user?.trialedPlanIds?.includes(planId) || false;
  }

  /**
   * Mark trial as used for a specific plan
   * @param userId User ID
   * @param planId Plan ID
   */
  async markTrialAsUsed(userId: string, planId: string): Promise<void> {
    // Check if already marked to avoid duplicates
    const alreadyMarked = await this.hasUsedTrial(userId, planId);
    if (alreadyMarked) {
      return;
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        trialedPlanIds: {
          push: planId,
        },
      },
    });
  }
}
