import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { AdminActionLogService } from './admin-action-log.service';
import type { Subscription } from '@prisma/generated/client';

export interface AdminSubscriptionFilters {
  search?: string;
  plan?: string;
  status?: string;
  createdAfter?: Date;
  createdBefore?: Date;
  expiringBefore?: Date;
}

export interface PaginationInput {
  page: number;
  limit: number;
}

export interface AdminSubscriptionsConnection {
  nodes: any[];
  totalCount: number;
  pageInfo: {
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    currentPage: number;
    totalPages: number;
  };
}

export interface SubscriptionStats {
  totalSubscriptions: number;
  activeSubscriptions: number;
  trialingSubscriptions: number;
  cancelledSubscriptions: number;
  totalRevenue: number;
  byPlan: {
    LITE: number;
    FOREMAN: number;
    BRIGADE: number;
  };
}

@Injectable()
export class AdminSubscriptionsService {
  private readonly logger = new Logger(AdminSubscriptionsService.name);

  constructor(
    private prisma: PrismaService,
    private auditService: AdminActionLogService,
  ) {}

  /**
   * Get paginated list of subscriptions with filters
   */
  async findAll(
    filters: AdminSubscriptionFilters,
    pagination: PaginationInput,
  ): Promise<AdminSubscriptionsConnection> {
    this.logger.log(`Fetching subscriptions with filters: ${JSON.stringify(filters)}`);

    const where: any = {};

    // Search filter (team name, owner email)
    if (filters.search) {
      where.team = {
        OR: [
          { name: { contains: filters.search, mode: 'insensitive' } },
          { owner: { email: { contains: filters.search, mode: 'insensitive' } } },
        ],
      };
    }

    // Plan filter
    if (filters.plan) {
      where.plan = filters.plan;
    }

    // Status filter
    if (filters.status) {
      where.status = filters.status;
    }

    // Date filters
    if (filters.createdAfter || filters.createdBefore) {
      where.createdAt = {};
      if (filters.createdAfter) {
        where.createdAt.gte = filters.createdAfter;
      }
      if (filters.createdBefore) {
        where.createdAt.lte = filters.createdBefore;
      }
    }

    // Expiring before filter
    if (filters.expiringBefore) {
      where.currentPeriodEnd = {
        lte: filters.expiringBefore,
      };
    }

    // Get total count
    const totalCount = await this.prisma.subscription.count({ where });

    // Calculate pagination
    const skip = (pagination.page - 1) * pagination.limit;
    const totalPages = Math.ceil(totalCount / pagination.limit);

    // Get subscriptions
    const nodes = await this.prisma.subscription.findMany({
      where,
      skip,
      take: pagination.limit,
      orderBy: { createdAt: 'desc' },
      include: {
        team: {
          include: {
            owner: {
              select: {
                id: true,
                email: true,
                fullName: true,
                avatarUrl: true,
              },
            },
            _count: {
              select: {
                members: true,
                projects: true,
              },
            },
          },
        },
        payments: {
          select: {
            id: true,
            amount: true,
            status: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
    });

    return {
      nodes,
      totalCount,
      pageInfo: {
        hasNextPage: pagination.page < totalPages,
        hasPreviousPage: pagination.page > 1,
        currentPage: pagination.page,
        totalPages,
      },
    };
  }

  /**
   * Get detailed information about a subscription
   */
  async findById(subscriptionId: string): Promise<any> {
    this.logger.log(`Fetching subscription details for ID: ${subscriptionId}`);

    const subscription = await this.prisma.subscription.findUnique({
      where: { id: subscriptionId },
      include: {
        team: {
          include: {
            owner: {
              select: {
                id: true,
                email: true,
                fullName: true,
                avatarUrl: true,
                phone: true,
              },
            },
            _count: {
              select: {
                members: true,
                projects: true,
              },
            },
          },
        },
        payments: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!subscription) {
      throw new NotFoundException(`Subscription with ID ${subscriptionId} not found`);
    }

    return subscription;
  }

  /**
   * Get subscription statistics
   */
  async getStats(): Promise<SubscriptionStats> {
    this.logger.log('Calculating subscription statistics');

    // Get all subscriptions
    const subscriptions = await this.prisma.subscription.findMany({
      include: {
        payments: {
          where: {
            status: 'SUCCEEDED',
          },
          select: {
            amount: true,
          },
        },
      },
    });

    // Calculate statistics
    const totalSubscriptions = subscriptions.length;
    const activeSubscriptions = subscriptions.filter((s) => s.status === 'ACTIVE').length;
    const trialingSubscriptions = subscriptions.filter((s) => s.status === 'TRIALING').length;
    const cancelledSubscriptions = subscriptions.filter((s) => s.status === 'CANCELLED').length;

    // Calculate total revenue from payments
    const totalRevenue = subscriptions.reduce((sum, sub) => {
      const subRevenue = sub.payments.reduce(
        (subSum, payment) => subSum + Number(payment.amount),
        0,
      );
      return sum + subRevenue;
    }, 0);

    // Count by plan
    const byPlan = {
      LITE: subscriptions.filter((s) => s.plan === 'LITE').length,
      FOREMAN: subscriptions.filter((s) => s.plan === 'FOREMAN').length,
      BRIGADE: subscriptions.filter((s) => s.plan === 'BRIGADE').length,
    };

    return {
      totalSubscriptions,
      activeSubscriptions,
      trialingSubscriptions,
      cancelledSubscriptions,
      totalRevenue,
      byPlan,
    };
  }

  /**
   * Update subscription
   */
  async updateSubscription(
    subscriptionId: string,
    data: {
      plan?: string;
      status?: string;
      currentPeriodEnd?: Date;
      cancelAtPeriodEnd?: boolean;
    },
    adminId: string,
  ): Promise<Subscription> {
    this.logger.log(`Updating subscription ${subscriptionId} by admin ${adminId}`);

    // Get current subscription state
    const subscriptionBefore = await this.prisma.subscription.findUnique({
      where: { id: subscriptionId },
    });

    if (!subscriptionBefore) {
      throw new NotFoundException(`Subscription with ID ${subscriptionId} not found`);
    }

    // Update subscription
    const subscriptionAfter = await this.prisma.subscription.update({
      where: { id: subscriptionId },
      data: data as any,
    });

    // Log action
    await this.auditService.logAction({
      adminUserId: adminId,
      action: 'UPDATE_SUBSCRIPTION',
      resource: 'Subscription',
      resourceId: subscriptionId,
      details: {
        before: subscriptionBefore,
        after: subscriptionAfter,
      },
    });

    return subscriptionAfter;
  }

  /**
   * Cancel subscription
   */
  async cancelSubscription(
    subscriptionId: string,
    cancelAtPeriodEnd: boolean,
    adminId: string,
  ): Promise<Subscription> {
    this.logger.log(
      `Cancelling subscription ${subscriptionId} (at period end: ${cancelAtPeriodEnd}) by admin ${adminId}`,
    );

    const subscription = await this.prisma.subscription.findUnique({
      where: { id: subscriptionId },
    });

    if (!subscription) {
      throw new NotFoundException(`Subscription with ID ${subscriptionId} not found`);
    }

    if (subscription.status === 'CANCELLED') {
      throw new BadRequestException('Subscription is already cancelled');
    }

    // Update subscription
    const updatedSubscription = await this.prisma.subscription.update({
      where: { id: subscriptionId },
      data: {
        cancelAtPeriodEnd,
        cancelledAt: cancelAtPeriodEnd ? null : new Date(),
        status: cancelAtPeriodEnd ? subscription.status : 'CANCELLED',
      },
    });

    // Log action
    await this.auditService.logAction({
      adminUserId: adminId,
      action: 'CANCEL_SUBSCRIPTION',
      resource: 'Subscription',
      resourceId: subscriptionId,
      details: {
        cancelAtPeriodEnd,
        previousStatus: subscription.status,
      },
    });

    return updatedSubscription;
  }

  /**
   * Reactivate subscription
   */
  async reactivateSubscription(
    subscriptionId: string,
    adminId: string,
  ): Promise<Subscription> {
    this.logger.log(`Reactivating subscription ${subscriptionId} by admin ${adminId}`);

    const subscription = await this.prisma.subscription.findUnique({
      where: { id: subscriptionId },
    });

    if (!subscription) {
      throw new NotFoundException(`Subscription with ID ${subscriptionId} not found`);
    }

    if (subscription.status === 'ACTIVE') {
      throw new BadRequestException('Subscription is already active');
    }

    // Extend current period if expired
    const now = new Date();
    let newPeriodEnd = subscription.currentPeriodEnd;
    if (newPeriodEnd < now) {
      newPeriodEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days
    }

    // Update subscription
    const updatedSubscription = await this.prisma.subscription.update({
      where: { id: subscriptionId },
      data: {
        status: 'ACTIVE',
        cancelAtPeriodEnd: false,
        cancelledAt: null,
        currentPeriodEnd: newPeriodEnd,
      },
    });

    // Log action
    await this.auditService.logAction({
      adminUserId: adminId,
      action: 'REACTIVATE_SUBSCRIPTION',
      resource: 'Subscription',
      resourceId: subscriptionId,
      details: {
        previousStatus: subscription.status,
        newPeriodEnd,
      },
    });

    return updatedSubscription;
  }

  /**
   * Delete subscription
   */
  async deleteSubscription(subscriptionId: string, adminId: string): Promise<boolean> {
    this.logger.log(`Deleting subscription ${subscriptionId} by admin ${adminId}`);

    const subscription = await this.prisma.subscription.findUnique({
      where: { id: subscriptionId },
      include: {
        team: true,
      },
    });

    if (!subscription) {
      throw new NotFoundException(`Subscription with ID ${subscriptionId} not found`);
    }

    // Log action before deletion
    await this.auditService.logAction({
      adminUserId: adminId,
      action: 'DELETE_SUBSCRIPTION',
      resource: 'Subscription',
      resourceId: subscriptionId,
      details: {
        teamId: subscription.teamId,
        teamName: subscription.team.name,
        plan: subscription.plan,
        status: subscription.status,
      },
    });

    // Delete subscription
    await this.prisma.subscription.delete({
      where: { id: subscriptionId },
    });

    return true;
  }
}
