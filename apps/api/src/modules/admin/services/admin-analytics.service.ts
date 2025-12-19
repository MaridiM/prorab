import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.service';

export interface DashboardStats {
  users: {
    total: number;
    verified: number;
    admins: number;
    newThisMonth: number;
    growthRate: number;
    byBusinessRole: {
      FOREMAN: number;
      WORKER: number;
      unassigned: number;
    };
    activeLastWeek: number;
    activeLastMonth: number;
  };
  teams: {
    total: number;
    withActiveSubscription: number;
    averageMembers: number;
    newThisMonth: number;
    topTeamsByMembers: Array<{
      id: string;
      name: string;
      membersCount: number;
      ownerName: string;
    }>;
  };
  projects: {
    total: number;
    active: number;
    completed: number;
    archived: number;
    byTeam: Array<{
      teamId: string;
      teamName: string;
      projectsCount: number;
    }>;
  };
  subscriptions: {
    total: number;
    active: number;
    trialing: number;
    cancelled: number;
    byPlan: {
      LITE: number;
      FOREMAN: number;
      BRIGADE: number;
    };
  };
  payments: {
    total: number;
    succeeded: number;
    totalRevenue: number;
    thisMonthRevenue: number;
    averagePayment: number;
    topPayingTeams: Array<{
      teamId: string;
      teamName: string;
      totalPaid: number;
    }>;
  };
  storage: {
    totalUsedBytes: number;
    totalUsedGB: number;
    averagePerTeam: number;
  };
}

export interface RevenueChart {
  labels: string[];
  data: number[];
}

export interface UserGrowthChart {
  labels: string[];
  data: number[];
}

export interface ActivityLog {
  id: string;
  action: string;
  resource: string;
  resourceId: string;
  adminUserEmail: string;
  createdAt: Date;
}

@Injectable()
export class AdminAnalyticsService {
  private readonly logger = new Logger(AdminAnalyticsService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Get comprehensive dashboard statistics
   */
  async getDashboardStats(): Promise<DashboardStats> {
    this.logger.log('Calculating dashboard statistics');

    // Calculate date ranges
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const firstDayOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Get all data in parallel
    const [
      users,
      usersThisMonth,
      usersLastMonth,
      verifiedUsers,
      adminUsers,
      usersByRole,
      activeUsersLastWeek,
      activeUsersLastMonth,
      teams,
      teamsThisMonth,
      teamsWithMembers,
      topTeamsByMembers,
      projects,
      projectsByTeam,
      subscriptions,
      payments,
      succeededPayments,
      paymentsThisMonth,
      paymentsByTeam,
      storageStats,
    ] = await Promise.all([
      // Users
      this.prisma.user.count(),
      this.prisma.user.count({ where: { createdAt: { gte: firstDayOfMonth } } }),
      this.prisma.user.count({
        where: {
          createdAt: { gte: firstDayOfLastMonth, lt: firstDayOfMonth },
        },
      }),
      this.prisma.user.count({ where: { emailVerified: true } }),
      this.prisma.user.count({ where: { adminRole: { isNot: null } } }),
      // Users by business role
      this.prisma.user.groupBy({
        by: ['businessRole'],
        _count: true,
      }),
      // Active users (updated profile/activity last week)
      this.prisma.user.count({ where: { updatedAt: { gte: oneWeekAgo } } }),
      // Active users (updated profile/activity last month)
      this.prisma.user.count({ where: { updatedAt: { gte: oneMonthAgo } } }),

      // Teams
      this.prisma.team.count(),
      this.prisma.team.count({ where: { createdAt: { gte: firstDayOfMonth } } }),
      this.prisma.team.findMany({
        select: {
          _count: {
            select: {
              members: true,
            },
          },
        },
      }),
      // Top teams by members
      this.prisma.team.findMany({
        select: {
          id: true,
          name: true,
          owner: {
            select: {
              fullName: true,
            },
          },
          _count: {
            select: {
              members: true,
            },
          },
        },
        orderBy: {
          members: {
            _count: 'desc',
          },
        },
        take: 10,
      }),

      // Projects
      this.prisma.project.groupBy({
        by: ['status'],
        _count: true,
      }),
      // Projects by team
      this.prisma.project.groupBy({
        by: ['teamId'],
        _count: true,
        orderBy: {
          _count: {
            teamId: 'desc',
          },
        },
        take: 10,
      }),

      // Subscriptions
      this.prisma.subscription.groupBy({
        by: ['status', 'plan'],
        _count: true,
      }),

      // Payments
      this.prisma.payment.count(),
      this.prisma.payment.findMany({
        where: { status: 'SUCCEEDED' },
        select: { amount: true },
      }),
      this.prisma.payment.findMany({
        where: {
          status: 'SUCCEEDED',
          createdAt: { gte: firstDayOfMonth },
        },
        select: { amount: true },
      }),
      // Top paying teams
      this.prisma.payment.groupBy({
        by: ['subscriptionId'],
        where: { status: 'SUCCEEDED' },
        _sum: {
          amount: true,
        },
        orderBy: {
          _sum: {
            amount: 'desc',
          },
        },
        take: 10,
      }),

      // Storage
      this.prisma.team.aggregate({
        _sum: {
          storageUsedBytes: true,
        },
      }),
    ]);

    // Calculate user growth rate
    const growthRate =
      usersLastMonth > 0 ? ((usersThisMonth - usersLastMonth) / usersLastMonth) * 100 : 0;

    // Process users by business role
    const userRoleStats = {
      FOREMAN: 0,
      WORKER: 0,
      unassigned: 0,
    };
    usersByRole.forEach((r) => {
      if (r.businessRole === 'FOREMAN') userRoleStats.FOREMAN = r._count;
      else if (r.businessRole === 'WORKER') userRoleStats.WORKER = r._count;
      else userRoleStats.unassigned += r._count;
    });

    // Calculate average members per team
    const totalMembers = teamsWithMembers.reduce((sum, team) => sum + team._count.members, 0);
    const averageMembers = teams > 0 ? totalMembers / teams : 0;

    // Process top teams
    const topTeams = topTeamsByMembers.map(team => ({
      id: team.id,
      name: team.name,
      membersCount: team._count.members,
      ownerName: team.owner?.fullName || 'Unknown',
    }));

    // Process projects
    const projectStats = {
      total: 0,
      active: 0,
      completed: 0,
      archived: 0,
    };
    projects.forEach((p) => {
      projectStats.total += p._count;
      if (p.status === 'ACTIVE') projectStats.active = p._count;
      if (p.status === 'COMPLETED') projectStats.completed = p._count;
      if (p.status === 'ARCHIVED') projectStats.archived = p._count;
    });

    // Process projects by team
    const projectsByTeamData = await Promise.all(
      projectsByTeam.slice(0, 10).map(async (pt) => {
        const team = await this.prisma.team.findUnique({
          where: { id: pt.teamId },
          select: { id: true, name: true },
        });
        return {
          teamId: pt.teamId,
          teamName: team?.name || 'Unknown',
          projectsCount: pt._count,
        };
      })
    );

    // Process subscriptions
    const subscriptionStats = {
      total: 0,
      active: 0,
      trialing: 0,
      cancelled: 0,
      byPlan: {
        LITE: 0,
        FOREMAN: 0,
        BRIGADE: 0,
      },
    };
    subscriptions.forEach((s) => {
      subscriptionStats.total += s._count;
      if (s.status === 'ACTIVE') subscriptionStats.active += s._count;
      if (s.status === 'TRIALING') subscriptionStats.trialing += s._count;
      if (s.status === 'CANCELLED') subscriptionStats.cancelled += s._count;
      if (s.plan === 'LITE') subscriptionStats.byPlan.LITE += s._count;
      if (s.plan === 'FOREMAN') subscriptionStats.byPlan.FOREMAN += s._count;
      if (s.plan === 'BRIGADE') subscriptionStats.byPlan.BRIGADE += s._count;
    });

    // Calculate revenue
    const totalRevenue = succeededPayments.reduce((sum, p) => sum + Number(p.amount), 0);
    const thisMonthRevenue = paymentsThisMonth.reduce((sum, p) => sum + Number(p.amount), 0);
    const averagePayment =
      succeededPayments.length > 0 ? totalRevenue / succeededPayments.length : 0;

    // Process top paying teams
    const topPayingTeamsData = await Promise.all(
      paymentsByTeam.slice(0, 10).map(async (pt) => {
        const subscription = await this.prisma.subscription.findUnique({
          where: { id: pt.subscriptionId },
          select: {
            team: {
              select: { id: true, name: true },
            },
          },
        });
        return {
          teamId: subscription?.team?.id || 'unknown',
          teamName: subscription?.team?.name || 'Unknown',
          totalPaid: Math.round(Number(pt._sum.amount || 0) * 100) / 100,
        };
      })
    );

    // Calculate storage
    const totalUsedBytes = Number(storageStats._sum.storageUsedBytes || 0);
    const totalUsedGB = totalUsedBytes / (1024 * 1024 * 1024);
    const averagePerTeam = teams > 0 ? totalUsedBytes / teams : 0;

    return {
      users: {
        total: users,
        verified: verifiedUsers,
        admins: adminUsers,
        newThisMonth: usersThisMonth,
        growthRate: Math.round(growthRate * 100) / 100,
        byBusinessRole: userRoleStats,
        activeLastWeek: activeUsersLastWeek,
        activeLastMonth: activeUsersLastMonth,
      },
      teams: {
        total: teams,
        withActiveSubscription: subscriptionStats.active,
        averageMembers: Math.round(averageMembers * 100) / 100,
        newThisMonth: teamsThisMonth,
        topTeamsByMembers: topTeams,
      },
      projects: {
        ...projectStats,
        byTeam: projectsByTeamData,
      },
      subscriptions: subscriptionStats,
      payments: {
        total: payments,
        succeeded: succeededPayments.length,
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        thisMonthRevenue: Math.round(thisMonthRevenue * 100) / 100,
        averagePayment: Math.round(averagePayment * 100) / 100,
        topPayingTeams: topPayingTeamsData,
      },
      storage: {
        totalUsedBytes,
        totalUsedGB: Math.round(totalUsedGB * 100) / 100,
        averagePerTeam: Math.round(averagePerTeam * 100) / 100,
      },
    };
  }

  /**
   * Get revenue chart data for the last 12 months
   */
  async getRevenueChart(): Promise<RevenueChart> {
    this.logger.log('Calculating revenue chart data');

    const now = new Date();
    const labels: string[] = [];
    const data: number[] = [];

    // Get data for last 12 months
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const nextDate = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);

      const monthName = date.toLocaleString('en', { month: 'short', year: 'numeric' });
      labels.push(monthName);

      const payments = await this.prisma.payment.findMany({
        where: {
          status: 'SUCCEEDED',
          createdAt: {
            gte: date,
            lt: nextDate,
          },
        },
        select: {
          amount: true,
        },
      });

      const monthRevenue = payments.reduce((sum, p) => sum + Number(p.amount), 0);
      data.push(Math.round(monthRevenue * 100) / 100);
    }

    return { labels, data };
  }

  /**
   * Get user growth chart data for the last 12 months
   */
  async getUserGrowthChart(): Promise<UserGrowthChart> {
    this.logger.log('Calculating user growth chart data');

    const now = new Date();
    const labels: string[] = [];
    const data: number[] = [];

    // Get data for last 12 months
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const nextDate = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);

      const monthName = date.toLocaleString('en', { month: 'short', year: 'numeric' });
      labels.push(monthName);

      const count = await this.prisma.user.count({
        where: {
          createdAt: {
            gte: date,
            lt: nextDate,
          },
        },
      });

      data.push(count);
    }

    return { labels, data };
  }

  /**
   * Get recent activity logs
   */
  async getRecentActivity(limit = 50): Promise<ActivityLog[]> {
    this.logger.log(`Fetching ${limit} recent activity logs`);

    const logs = await this.prisma.adminActionLog.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
    });

    // Get unique admin user IDs
    const adminUserIds = [...new Set(logs.map((log) => log.adminUserId))];

    // Fetch admin users
    const adminUsers = await this.prisma.user.findMany({
      where: { id: { in: adminUserIds } },
      select: { id: true, email: true },
    });

    // Create a map for quick lookup
    const userMap = new Map(adminUsers.map((user) => [user.id, user.email]));

    return logs.map((log) => ({
      id: log.id,
      action: log.action,
      resource: log.resource,
      resourceId: log.resourceId || '',
      adminUserEmail: userMap.get(log.adminUserId) || 'Unknown',
      createdAt: log.createdAt,
    }));
  }

  /**
   * Get system health metrics
   */
  async getSystemHealth(): Promise<{
    database: boolean;
    storageAvailable: boolean;
    lastBackup: Date | null;
  }> {
    this.logger.log('Checking system health');

    // Test database connection
    let databaseHealthy = false;
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      databaseHealthy = true;
    } catch (error) {
      this.logger.error('Database health check failed', error);
    }

    return {
      database: databaseHealthy,
      storageAvailable: true, // TODO: Implement actual storage check
      lastBackup: null, // TODO: Implement backup tracking
    };
  }
}
