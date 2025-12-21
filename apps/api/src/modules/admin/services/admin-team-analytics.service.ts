import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.service';
import type {
  TeamGrowthChart,
  MemberActivity,
  TeamComposition,
  TeamStorageUsage,
  TeamKPIs,
  TeamAnalytics,
} from '../models/admin-team-analytics.model';

@Injectable()
export class AdminTeamAnalyticsService {
  private readonly logger = new Logger(AdminTeamAnalyticsService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Get team growth chart data (members and projects over time)
   */
  async getTeamGrowthChart(teamId: string, months: number = 12): Promise<TeamGrowthChart> {
    this.logger.log(`Getting growth chart for team ${teamId} (${months} months)`);

    await this.validateTeamExists(teamId);

    const now = new Date();
    const labels: string[] = [];
    const memberData: number[] = [];
    const projectData: number[] = [];

    // Get data for each month
    for (let i = months - 1; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const nextDate = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);

      const monthName = date.toLocaleString('ru-RU', { month: 'short', year: 'numeric' });
      labels.push(monthName);

      // Count members who joined by this date
      const membersCount = await this.prisma.teamMember.count({
        where: {
          teamId,
          joinedAt: { lt: nextDate },
        },
      });
      memberData.push(membersCount);

      // Count projects created by this date
      const projectsCount = await this.prisma.project.count({
        where: {
          teamId,
          createdAt: { lt: nextDate },
        },
      });
      projectData.push(projectsCount);
    }

    return { labels, memberData, projectData };
  }

  /**
   * Get member activity metrics for a team
   */
  async getMemberActivityMetrics(teamId: string): Promise<MemberActivity[]> {
    this.logger.log(`Getting member activity for team ${teamId}`);

    await this.validateTeamExists(teamId);

    const members = await this.prisma.teamMember.findMany({
      where: { teamId },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            avatarUrl: true,
            updatedAt: true,
          },
        },
      },
      orderBy: { joinedAt: 'asc' },
    });

    const memberActivities: MemberActivity[] = [];

    for (const member of members) {
      // Count work logs for this member
      const workLogs = await this.prisma.workLog.findMany({
        where: {
          memberId: member.id,
          project: { teamId },
        },
        select: {
          hours: true,
          createdAt: true,
        },
      });

      // Count expenses created by this member's user
      const expensesCount = await this.prisma.expense.count({
        where: {
          createdById: member.userId,
          project: { teamId },
        },
      });

      // Count unique projects
      const projectsCount = await this.prisma.project.count({
        where: {
          teamId,
          OR: [
            { workLogs: { some: { memberId: member.id } } },
            { expenses: { some: { createdById: member.userId } } },
          ],
        },
      });

      const totalHours = workLogs.reduce((sum, log) => sum + Number(log.hours), 0);
      const actionsCount = workLogs.length + expensesCount;

      // Find last activity date
      const lastWorkLog = workLogs.length > 0
        ? workLogs.reduce((latest, log) => log.createdAt > latest ? log.createdAt : latest, workLogs[0].createdAt)
        : null;

      memberActivities.push({
        userId: member.userId,
        userName: member.user.fullName || 'Без имени',
        email: member.user.email,
        avatarUrl: member.user.avatarUrl,
        role: member.role,
        position: member.position,
        actionsCount,
        lastActiveAt: lastWorkLog || member.user.updatedAt,
        hoursLogged: Math.round(totalHours * 100) / 100,
        projectsCount,
        joinedAt: member.joinedAt,
      });
    }

    // Sort by hours logged (most active first)
    return memberActivities.sort((a, b) => b.hoursLogged - a.hoursLogged);
  }

  /**
   * Get team composition analysis
   */
  async getTeamComposition(teamId: string): Promise<TeamComposition> {
    this.logger.log(`Getting team composition for ${teamId}`);

    await this.validateTeamExists(teamId);

    const members = await this.prisma.teamMember.findMany({
      where: { teamId },
      select: {
        role: true,
        position: true,
        salaryType: true,
        salaryAmount: true,
      },
    });

    // Group by role
    const roleMap = new Map<string, number>();
    members.forEach((m) => {
      const role = m.role || 'MEMBER';
      roleMap.set(role, (roleMap.get(role) || 0) + 1);
    });
    const byRole = Array.from(roleMap.entries()).map(([role, count]) => ({ role, count }));

    // Group by position
    const positionMap = new Map<string, number>();
    members.forEach((m) => {
      const position = m.position || 'Не указана';
      positionMap.set(position, (positionMap.get(position) || 0) + 1);
    });
    const byPosition = Array.from(positionMap.entries())
      .map(([position, count]) => ({ position, count }))
      .sort((a, b) => b.count - a.count);

    // Salary distribution
    const salaryDistribution = {
      fixed: 0,
      percentage: 0,
      none: 0,
      totalAmount: 0,
    };

    members.forEach((m) => {
      const salaryType = m.salaryType || 'none';
      if (salaryType === 'fixed') {
        salaryDistribution.fixed++;
        salaryDistribution.totalAmount += Number(m.salaryAmount) || 0;
      } else if (salaryType === 'percentage') {
        salaryDistribution.percentage++;
      } else {
        salaryDistribution.none++;
      }
    });

    return {
      byRole,
      byPosition,
      salaryDistribution,
      totalMembers: members.length,
    };
  }

  /**
   * Get storage usage breakdown for a team
   */
  async getStorageUsageByTeam(teamId: string): Promise<TeamStorageUsage> {
    this.logger.log(`Getting storage usage for team ${teamId}`);

    const team = await this.prisma.team.findUnique({
      where: { id: teamId },
      select: {
        storageUsedBytes: true,
        subscription: {
          select: {
            plan: true,
          },
        },
      },
    });

    if (!team) {
      throw new NotFoundException(`Team with ID ${teamId} not found`);
    }

    // Get storage limits by plan (in bytes)
    const storageLimits: Record<string, number> = {
      LITE: 5 * 1024 * 1024 * 1024, // 5 GB
      FOREMAN: 50 * 1024 * 1024 * 1024, // 50 GB
      BRIGADE: 200 * 1024 * 1024 * 1024, // 200 GB
    };

    const plan = team.subscription?.plan || 'LITE';
    const totalBytes = storageLimits[plan] || storageLimits.LITE;
    const usedBytes = Number(team.storageUsedBytes) || 0;

    // Get storage usage by project (approximation based on photos)
    const projects = await this.prisma.project.findMany({
      where: { teamId },
      select: {
        id: true,
        name: true,
        _count: {
          select: {
            photoReports: true,
          },
        },
      },
    });

    // Estimate storage per project (based on photo reports count)
    // Average photo size ~2MB
    const avgPhotoSize = 2 * 1024 * 1024;
    const byProject = projects.map((project) => {
      const estimatedBytes = project._count.photoReports * avgPhotoSize;
      return {
        projectId: project.id,
        projectName: project.name,
        usedBytes: estimatedBytes,
        filesCount: project._count.photoReports,
        percentage: usedBytes > 0 ? Math.round((estimatedBytes / usedBytes) * 100) : 0,
      };
    }).sort((a, b) => b.usedBytes - a.usedBytes);

    return {
      totalBytes,
      usedBytes,
      usedPercentage: totalBytes > 0 ? Math.round((usedBytes / totalBytes) * 100 * 100) / 100 : 0,
      usedGB: Math.round((usedBytes / (1024 * 1024 * 1024)) * 100) / 100,
      byProject,
    };
  }

  /**
   * Get team KPIs (Key Performance Indicators)
   */
  async getTeamKPIs(teamId: string): Promise<TeamKPIs> {
    this.logger.log(`Calculating KPIs for team ${teamId}`);

    await this.validateTeamExists(teamId);

    // Get all team data in parallel
    const [
      membersCount,
      removedMembersCount,
      projects,
      workLogs,
      expenses,
    ] = await Promise.all([
      // Current members
      this.prisma.teamMember.count({ where: { teamId } }),
      // Count removed members (from salary history as proxy)
      this.prisma.teamMemberSalaryHistory.count({
        where: { member: { teamId } },
      }),
      // All projects with budget
      this.prisma.project.findMany({
        where: { teamId },
        select: {
          id: true,
          status: true,
          budget: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      // All work logs
      this.prisma.workLog.findMany({
        where: { project: { teamId } },
        select: { hours: true },
      }),
      // All expenses
      this.prisma.expense.findMany({
        where: { project: { teamId } },
        select: { amount: true },
      }),
    ]);

    // Project stats
    const activeProjectsCount = projects.filter((p) => p.status === 'ACTIVE').length;
    const completedProjectsCount = projects.filter((p) => p.status === 'COMPLETED').length;
    const archivedProjectsCount = projects.filter((p) => p.status === 'ARCHIVED').length;

    // Calculate project completion rate
    const totalProjects = projects.length;
    const projectCompletionRate = totalProjects > 0
      ? Math.round((completedProjectsCount / totalProjects) * 100 * 100) / 100
      : 0;

    // Calculate average project duration (in days)
    const completedProjects = projects.filter((p) => p.status === 'COMPLETED');
    let avgProjectDurationDays = 0;
    if (completedProjects.length > 0) {
      const totalDays = completedProjects.reduce((sum, p) => {
        const days = Math.ceil(
          (p.updatedAt.getTime() - p.createdAt.getTime()) / (1000 * 60 * 60 * 24)
        );
        return sum + days;
      }, 0);
      avgProjectDurationDays = Math.round(totalDays / completedProjects.length);
    }

    // Calculate member retention (simple: current / (current + estimated left))
    const estimatedTotalMembers = membersCount + Math.floor(removedMembersCount / 5);
    const memberRetention = estimatedTotalMembers > 0
      ? Math.round((membersCount / estimatedTotalMembers) * 100 * 100) / 100
      : 100;

    // Financial calculations
    const totalBudget = projects.reduce((sum, p) => sum + (Number(p.budget) || 0), 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
    const profit = totalBudget - totalExpenses;

    // Hours calculations
    const totalHoursWorked = workLogs.reduce((sum, w) => sum + Number(w.hours), 0);
    const avgHoursPerMember = membersCount > 0
      ? Math.round((totalHoursWorked / membersCount) * 100) / 100
      : 0;

    // Revenue (using budget of completed projects as proxy)
    const totalRevenue = completedProjects.reduce((sum, p) => sum + (Number(p.budget) || 0), 0);

    return {
      memberRetention,
      projectCompletionRate,
      avgProjectDurationDays,
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      activeProjectsCount,
      completedProjectsCount,
      archivedProjectsCount,
      totalMembers: membersCount,
      totalHoursWorked: Math.round(totalHoursWorked * 100) / 100,
      avgHoursPerMember,
      totalExpenses: Math.round(totalExpenses * 100) / 100,
      totalBudget: Math.round(totalBudget * 100) / 100,
      profit: Math.round(profit * 100) / 100,
    };
  }

  /**
   * Get combined team analytics (all data in one call)
   */
  async getTeamAnalytics(teamId: string): Promise<TeamAnalytics> {
    this.logger.log(`Getting full analytics for team ${teamId}`);

    const team = await this.prisma.team.findUnique({
      where: { id: teamId },
      select: { id: true, name: true },
    });

    if (!team) {
      throw new NotFoundException(`Team with ID ${teamId} not found`);
    }

    // Get all analytics in parallel
    const [kpis, growthChart, memberActivity, composition, storageUsage] = await Promise.all([
      this.getTeamKPIs(teamId),
      this.getTeamGrowthChart(teamId, 12),
      this.getMemberActivityMetrics(teamId),
      this.getTeamComposition(teamId),
      this.getStorageUsageByTeam(teamId),
    ]);

    return {
      teamId: team.id,
      teamName: team.name,
      kpis,
      growthChart,
      memberActivity,
      composition,
      storageUsage,
    };
  }

  /**
   * Validate that team exists
   */
  private async validateTeamExists(teamId: string): Promise<void> {
    const team = await this.prisma.team.findUnique({
      where: { id: teamId },
      select: { id: true },
    });

    if (!team) {
      throw new NotFoundException(`Team with ID ${teamId} not found`);
    }
  }
}
