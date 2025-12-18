import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { AdminActionLogService } from './admin-action-log.service';

interface AdminProjectFilter {
  status?: string;
  teamId?: string;
  ownerId?: string;
  search?: string;
  startDateFrom?: Date;
  startDateTo?: Date;
}

interface Pagination {
  page?: number;
  limit?: number;
}

@Injectable()
export class AdminProjectsService {
  private readonly logger = new Logger(AdminProjectsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly actionLogService: AdminActionLogService,
  ) {}

  async findAll(filter: AdminProjectFilter, pagination: Pagination) {
    const page = pagination.page || 1;
    const limit = pagination.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (filter.status) {
      where.status = filter.status;
    }

    if (filter.teamId) {
      where.teamId = filter.teamId;
    }

    if (filter.ownerId) {
      where.team = {
        ownerId: filter.ownerId,
      };
    }

    if (filter.search) {
      where.OR = [
        { name: { contains: filter.search, mode: 'insensitive' } },
        { description: { contains: filter.search, mode: 'insensitive' } },
      ];
    }

    if (filter.startDateFrom || filter.startDateTo) {
      where.startDate = {};
      if (filter.startDateFrom) {
        where.startDate.gte = filter.startDateFrom;
      }
      if (filter.startDateTo) {
        where.startDate.lte = filter.startDateTo;
      }
    }

    const [projects, total] = await Promise.all([
      this.prisma.project.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          team: {
            select: {
              id: true,
              name: true,
            },
          },
          _count: {
            select: {
              expenses: true,
              photoReports: true,
              tasks: true,
            },
          },
        },
      }),
      this.prisma.project.count({ where }),
    ]);

    // Получаем owner через team
    const projectsWithOwner = await Promise.all(
      projects.map(async (project) => {
        const team = await this.prisma.team.findUnique({
          where: { id: project.teamId },
          include: {
            owner: {
              select: {
                id: true,
                fullName: true,
                email: true,
              },
            },
          },
        });

        return {
          ...project,
          owner: team?.owner,
        };
      }),
    );

    // Convert Decimal to number for GraphQL
    const formattedProjects = projectsWithOwner.map(project => ({
      ...project,
      budget: project.budget ? Number(project.budget) : null,
      _count: project._count ? {
        expenses: project._count.expenses,
        photoReports: project._count.photoReports,
        tasks: project._count.tasks,
      } : undefined,
    }));

    return {
      projects: formattedProjects,
      total,
      hasMore: skip + projects.length < total,
    };
  }

  async findById(id: string) {
    const project = await this.prisma.project.findUnique({
      where: { id },
      include: {
        team: {
          include: {
            owner: {
              select: {
                id: true,
                fullName: true,
                email: true,
                phone: true,
              },
            },
            subscription: {
              select: {
                status: true,
              },
            },
          },
        },
        expenses: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            category: true,
            amount: true,
            comment: true,
            createdAt: true,
          },
        },
        photoReports: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            title: true,
            description: true,
            createdAt: true,
          },
        },
        tasks: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            title: true,
            status: true,
            priority: true,
          },
        },
      },
    });

    if (!project) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }

    return {
      ...project,
      budget: project.budget ? Number(project.budget) : null,
      finalProfit: project.finalProfit ? Number(project.finalProfit) : null,
      owner: project.team.owner,
    };
  }

  async updateStatus(projectId: string, status: string, adminUserId: string) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      throw new NotFoundException(`Project with ID ${projectId} not found`);
    }

    const uppercaseStatus = status.toUpperCase();
    const updatedProject = await this.prisma.project.update({
      where: { id: projectId },
      data: {
        status: uppercaseStatus as any,
        ...(uppercaseStatus === 'COMPLETED' ? { completedAt: new Date() } : {}),
        ...(uppercaseStatus === 'ARCHIVED' ? { archivedAt: new Date() } : {}),
      },
    });

    // Log action
    await this.actionLogService.logAction({
      adminUserId,
      action: 'UPDATE',
      resource: 'Project',
      resourceId: projectId,
      details: {
        oldStatus: project.status,
        newStatus: status,
      },
    });

    this.logger.log(
      `Project ${projectId} status updated to ${status} by admin ${adminUserId}`,
    );

    return {
      ...updatedProject,
      budget: updatedProject.budget ? Number(updatedProject.budget) : null,
      finalProfit: updatedProject.finalProfit ? Number(updatedProject.finalProfit) : null,
    };
  }

  async deleteProject(projectId: string, adminUserId: string) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: {
        _count: {
          select: {
            expenses: true,
            photoReports: true,
            tasks: true,
          },
        },
      },
    });

    if (!project) {
      throw new NotFoundException(`Project with ID ${projectId} not found`);
    }

    // Delete related data first
    await this.prisma.$transaction([
      this.prisma.expense.deleteMany({ where: { projectId } }),
      this.prisma.photoReport.deleteMany({ where: { projectId } }),
      this.prisma.task.deleteMany({ where: { projectId } }),
      this.prisma.workLog.deleteMany({ where: { projectId } }),
      this.prisma.project.delete({ where: { id: projectId } }),
    ]);

    // Log action
    await this.actionLogService.logAction({
      adminUserId,
      action: 'DELETE',
      resource: 'Project',
      resourceId: projectId,
      details: {
        projectName: project.name,
        deletedExpenses: project._count.expenses,
        deletedReports: project._count.photoReports,
        deletedTasks: project._count.tasks,
      },
    });

    this.logger.log(
      `Project ${projectId} deleted by admin ${adminUserId}`,
    );

    return {
      success: true,
      message: `Project "${project.name}" and all related data deleted successfully`,
    };
  }

  async archiveProject(projectId: string, adminUserId: string) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      throw new NotFoundException(`Project with ID ${projectId} not found`);
    }

    const updatedProject = await this.prisma.project.update({
      where: { id: projectId },
      data: {
        status: 'ARCHIVED',
        archivedAt: new Date(),
      },
    });

    // Log action
    await this.actionLogService.logAction({
      adminUserId,
      action: 'UPDATE',
      resource: 'Project',
      resourceId: projectId,
      details: {
        action: 'archived',
        oldStatus: project.status,
      },
    });

    this.logger.log(
      `Project ${projectId} archived by admin ${adminUserId}`,
    );

    return {
      ...updatedProject,
      budget: updatedProject.budget ? Number(updatedProject.budget) : null,
      finalProfit: updatedProject.finalProfit ? Number(updatedProject.finalProfit) : null,
    };
  }
}
