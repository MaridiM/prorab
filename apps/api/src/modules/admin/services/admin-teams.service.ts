import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { AdminActionLogService } from './admin-action-log.service';
import type { Team, Subscription } from '@prisma/generated/client';

export interface AdminTeamFilters {
  search?: string;
  plan?: string;
  subscriptionStatus?: string;
  createdAfter?: Date;
  createdBefore?: Date;
}

export interface PaginationInput {
  page: number;
  limit: number;
}

export interface AdminTeamsConnection {
  nodes: any[];
  totalCount: number;
  pageInfo: {
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    currentPage: number;
    totalPages: number;
  };
}

export interface AdminTeamStatsInterface {
  totalMembers: number;
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  totalExpenses: number;
  totalExpenseAmount: number;
  storageUsed: number;
  projects: any[];
}

@Injectable()
export class AdminTeamsService {
  private readonly logger = new Logger(AdminTeamsService.name);

  constructor(
    private prisma: PrismaService,
    private auditService: AdminActionLogService,
  ) {}

  /**
   * Get paginated list of teams with filters
   */
  async findAll(
    filters: AdminTeamFilters,
    pagination: PaginationInput,
  ): Promise<AdminTeamsConnection> {
    this.logger.log(`Fetching teams with filters: ${JSON.stringify(filters)}`);

    const where: any = {};

    // Search filter (team name, owner email)
    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { owner: { email: { contains: filters.search, mode: 'insensitive' } } },
      ];
    }

    // Subscription plan filter
    if (filters.plan) {
      where.subscription = {
        plan: filters.plan,
      };
    }

    // Subscription status filter
    if (filters.subscriptionStatus) {
      where.subscription = {
        ...where.subscription,
        status: filters.subscriptionStatus,
      };
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

    // Get total count
    const totalCount = await this.prisma.team.count({ where });

    // Calculate pagination
    const skip = (pagination.page - 1) * pagination.limit;
    const totalPages = Math.ceil(totalCount / pagination.limit);

    // Get teams
    const nodes = await this.prisma.team.findMany({
      where,
      skip,
      take: pagination.limit,
      orderBy: { createdAt: 'desc' },
      include: {
        owner: {
          select: {
            id: true,
            email: true,
            fullName: true,
            avatarUrl: true,
          },
        },
        subscription: true,
        _count: {
          select: {
            members: true,
            projects: true,
          },
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
   * Get detailed information about a team
   */
  async findById(teamId: string): Promise<any> {
    this.logger.log(`Fetching team details for ID: ${teamId}`);

    const team = await this.prisma.team.findUnique({
      where: { id: teamId },
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
        subscription: true,
        members: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                fullName: true,
                avatarUrl: true,
              },
            },
          },
          orderBy: { joinedAt: 'desc' },
        },
        projects: {
          select: {
            id: true,
            name: true,
            status: true,
            budget: true,
            createdAt: true,
            _count: {
              select: {
                expenses: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        _count: {
          select: {
            members: true,
            projects: true,
            inviteCodes: true,
          },
        },
      },
    });

    if (!team) {
      throw new NotFoundException(`Team with ID ${teamId} not found`);
    }

    return team;
  }

  /**
   * Get team statistics
   */
  async getTeamStats(teamId: string): Promise<AdminTeamStatsInterface> {
    this.logger.log(`Calculating statistics for team ID: ${teamId}`);

    // Get team with projects including expense counts
    const team = await this.prisma.team.findUnique({
      where: { id: teamId },
      include: {
        _count: {
          select: {
            members: true,
            projects: true,
          },
        },
        projects: {
          select: {
            id: true,
            status: true,
            _count: {
              select: {
                expenses: true,
              },
            },
          },
        },
      },
    });

    if (!team) {
      throw new NotFoundException(`Team with ID ${teamId} not found`);
    }

    // Calculate project statistics
    const activeProjects = team.projects.filter((p) => p.status === 'ACTIVE').length;
    const completedProjects = team.projects.filter((p) => p.status === 'COMPLETED').length;

    // Calculate total expenses count from all projects
    const totalExpenses = team.projects.reduce(
      (sum, project) => sum + project._count.expenses,
      0,
    );

    // Get all expenses for team's projects to calculate total amount
    const projectIds = team.projects.map((p) => p.id);
    const expenses = await this.prisma.expense.findMany({
      where: {
        projectId: { in: projectIds },
      },
      select: {
        amount: true,
      },
    });

    // Calculate total expense amount
    const totalExpenseAmount = expenses.reduce(
      (sum, expense) => sum + Number(expense.amount),
      0,
    );

    return {
      totalMembers: team._count.members,
      totalProjects: team._count.projects,
      activeProjects,
      completedProjects,
      totalExpenses,
      totalExpenseAmount,
      storageUsed: Number(team.storageUsedBytes),
      projects: team.projects,
    };
  }

  /**
   * Update team information
   */
  async updateTeam(
    teamId: string,
    data: {
      name?: string;
      logoUrl?: string;
    },
    adminId: string,
  ): Promise<Team> {
    this.logger.log(`Updating team ${teamId} by admin ${adminId}`);

    // Get current team state for audit
    const teamBefore = await this.prisma.team.findUnique({
      where: { id: teamId },
    });

    if (!teamBefore) {
      throw new NotFoundException(`Team with ID ${teamId} not found`);
    }

    // Update team
    const teamAfter = await this.prisma.team.update({
      where: { id: teamId },
      data,
      include: {
        owner: true,
        subscription: true,
      },
    });

    // Log action
    await this.auditService.logAction({
      adminUserId: adminId,
      action: 'UPDATE_TEAM',
      resource: 'Team',
      resourceId: teamId,
      details: {
        before: teamBefore,
        after: teamAfter,
      },
    });

    return teamAfter as any;
  }

  /**
   * Change team subscription plan
   */
  async changeTeamPlan(
    teamId: string,
    plan: string,
    adminId: string,
  ): Promise<Team> {
    this.logger.log(`Changing plan for team ${teamId} to ${plan} by admin ${adminId}`);

    // Verify team exists
    const team = await this.prisma.team.findUnique({
      where: { id: teamId },
      include: { subscription: true },
    });

    if (!team) {
      throw new NotFoundException(`Team with ID ${teamId} not found`);
    }

    // Validate plan
    const validPlans = ['LITE', 'FOREMAN', 'BRIGADE'];
    if (!validPlans.includes(plan)) {
      throw new BadRequestException(`Invalid plan. Must be one of: ${validPlans.join(', ')}`);
    }

    // Update or create subscription
    const subscription = await this.prisma.subscription.upsert({
      where: { teamId },
      update: {
        plan: plan as any,
      },
      create: {
        teamId,
        plan: plan as any,
        status: 'ACTIVE',
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      },
    });

    // Log action
    await this.auditService.logAction({
      adminUserId: adminId,
      action: 'CHANGE_TEAM_PLAN',
      resource: 'Team',
      resourceId: teamId,
      details: {
        oldPlan: team.subscription?.plan,
        newPlan: plan,
      },
    });

    // Return updated team with subscription
    return this.prisma.team.findUnique({
      where: { id: teamId },
      include: {
        owner: true,
        subscription: true,
      },
    }) as Promise<Team>;
  }

  /**
   * Remove a member from a team
   */
  async removeTeamMember(
    teamId: string,
    memberId: string,
    adminId: string,
  ): Promise<boolean> {
    this.logger.log(`Removing member ${memberId} from team ${teamId} by admin ${adminId}`);

    // Verify team exists
    const team = await this.prisma.team.findUnique({
      where: { id: teamId },
    });

    if (!team) {
      throw new NotFoundException(`Team with ID ${teamId} not found`);
    }

    // Verify member exists in team
    const member = await this.prisma.teamMember.findUnique({
      where: { id: memberId },
      include: { user: true },
    });

    if (!member || member.teamId !== teamId) {
      throw new NotFoundException(`Member with ID ${memberId} not found in team ${teamId}`);
    }

    // Don't allow removing the team owner
    if (member.userId === team.ownerId) {
      throw new BadRequestException('Cannot remove team owner from team');
    }

    // Remove member
    await this.prisma.teamMember.delete({
      where: { id: memberId },
    });

    // Log action
    await this.auditService.logAction({
      adminUserId: adminId,
      action: 'REMOVE_TEAM_MEMBER',
      resource: 'Team',
      resourceId: teamId,
      details: {
        memberId,
        memberEmail: member.user.email,
      },
    });

    return true;
  }

  /**
   * Delete team (with all related data)
   */
  async deleteTeam(teamId: string, adminId: string): Promise<boolean> {
    this.logger.log(`Deleting team ${teamId} by admin ${adminId}`);

    const team = await this.prisma.team.findUnique({
      where: { id: teamId },
      include: {
        _count: {
          select: {
            members: true,
            projects: true,
          },
        },
      },
    });

    if (!team) {
      throw new NotFoundException(`Team with ID ${teamId} not found`);
    }

    // Log action before deletion
    await this.auditService.logAction({
      adminUserId: adminId,
      action: 'DELETE_TEAM',
      resource: 'Team',
      resourceId: teamId,
      details: {
        teamName: team.name,
        membersCount: team._count.members,
        projectsCount: team._count.projects,
      },
    });

    // Delete team (CASCADE will handle related records)
    await this.prisma.team.delete({
      where: { id: teamId },
    });

    return true;
  }
}
