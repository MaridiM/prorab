import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../core/prisma/prisma.service';
import { CreateWorkLogInput, UpdateWorkLogInput, WorkLogFilters } from './dto/work-log.input';

@Injectable()
export class WorkLogService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create a new work log entry
   */
  async createWorkLog(input: CreateWorkLogInput, userId: string) {
    // Verify user is member of the team/project
    const member = await this.prisma.teamMember.findFirst({
      where: {
        userId: input.memberId,
        team: {
          projects: {
            some: {
              id: input.projectId,
            },
          },
        },
      },
    });

    if (!member) {
      throw new ForbiddenException('Member not found in project team');
    }

    const workLog = await this.prisma.workLog.create({
      data: {
        projectId: input.projectId,
        memberId: input.memberId,
        date: input.date,
        hours: input.hours,
        description: input.description,
        createdById: userId,
      },
      include: {
        member: {
          include: {
            user: true,
          },
        },
        project: true,
      },
    });

    return {
      ...workLog,
      hours: Number(workLog.hours),
    };
  }

  /**
   * Update an existing work log entry
   */
  async updateWorkLog(id: string, input: UpdateWorkLogInput, userId: string) {
    const workLog = await this.prisma.workLog.findUnique({
      where: { id },
    });

    if (!workLog) {
      throw new NotFoundException('Work log not found');
    }

    // Only creator can update
    if (workLog.createdById !== userId) {
      throw new ForbiddenException('You can only update your own work logs');
    }

    const updated = await this.prisma.workLog.update({
      where: { id },
      data: {
        ...(input.date && { date: input.date }),
        ...(input.hours !== undefined && { hours: input.hours }),
        ...(input.description !== undefined && { description: input.description }),
      },
      include: {
        member: {
          include: {
            user: true,
          },
        },
        project: true,
      },
    });

    return {
      ...updated,
      hours: Number(updated.hours),
    };
  }

  /**
   * Delete a work log entry
   */
  async deleteWorkLog(id: string, userId: string) {
    const workLog = await this.prisma.workLog.findUnique({
      where: { id },
    });

    if (!workLog) {
      throw new NotFoundException('Work log not found');
    }

    // Only creator can delete
    if (workLog.createdById !== userId) {
      throw new ForbiddenException('You can only delete your own work logs');
    }

    await this.prisma.workLog.delete({
      where: { id },
    });

    return true;
  }

  /**
   * Get work logs with filters
   */
  async getWorkLogs(filters: WorkLogFilters) {
    const where: any = {};

    if (filters.memberId) {
      where.memberId = filters.memberId;
    }

    if (filters.projectId) {
      where.projectId = filters.projectId;
    }

    if (filters.teamId) {
      where.project = {
        teamId: filters.teamId,
      };
    }

    if (filters.dateFrom || filters.dateTo) {
      where.date = {};
      if (filters.dateFrom) {
        where.date.gte = filters.dateFrom;
      }
      if (filters.dateTo) {
        where.date.lte = filters.dateTo;
      }
    }

    const workLogs = await this.prisma.workLog.findMany({
      where,
      include: {
        member: {
          include: {
            user: true,
          },
        },
        project: true,
      },
      orderBy: {
        date: 'desc',
      },
    });

    return workLogs.map(log => ({
      ...log,
      hours: Number(log.hours),
    }));
  }

  /**
   * Get a single work log by ID
   */
  async getWorkLog(id: string) {
    const workLog = await this.prisma.workLog.findUnique({
      where: { id },
      include: {
        member: {
          include: {
            user: true,
          },
        },
        project: true,
      },
    });

    if (!workLog) {
      throw new NotFoundException('Work log not found');
    }

    return {
      ...workLog,
      hours: Number(workLog.hours),
    };
  }

  /**
   * Get work logs by user
   */
  async getWorkLogsByUser(userId: string, filters?: Partial<WorkLogFilters>) {
    const where: any = {
      member: {
        userId,
      },
    };

    if (filters?.projectId) {
      where.projectId = filters.projectId;
    }

    if (filters?.dateFrom || filters?.dateTo) {
      where.date = {};
      if (filters.dateFrom) {
        where.date.gte = filters.dateFrom;
      }
      if (filters.dateTo) {
        where.date.lte = filters.dateTo;
      }
    }

    const workLogs = await this.prisma.workLog.findMany({
      where,
      include: {
        member: {
          include: {
            user: true,
          },
        },
        project: true,
      },
      orderBy: {
        date: 'desc',
      },
    });

    return workLogs.map(log => ({
      ...log,
      hours: Number(log.hours),
    }));
  }

  /**
   * Get work logs by project
   */
  async getWorkLogsByProject(projectId: string, filters?: Partial<WorkLogFilters>) {
    const where: any = {
      projectId,
    };

    if (filters?.memberId) {
      where.memberId = filters.memberId;
    }

    if (filters?.dateFrom || filters?.dateTo) {
      where.date = {};
      if (filters.dateFrom) {
        where.date.gte = filters.dateFrom;
      }
      if (filters.dateTo) {
        where.date.lte = filters.dateTo;
      }
    }

    return this.prisma.workLog.findMany({
      where,
      include: {
        member: {
          include: {
            user: true,
          },
        },
        project: true,
      },
      orderBy: {
        date: 'desc',
      },
    });
  }

  /**
   * Calculate total hours
   */
  async getTotalHours(filters: WorkLogFilters): Promise<number> {
    const where: any = {};

    if (filters.memberId) {
      where.memberId = filters.memberId;
    }

    if (filters.projectId) {
      where.projectId = filters.projectId;
    }

    if (filters.teamId) {
      where.project = {
        teamId: filters.teamId,
      };
    }

    if (filters.dateFrom || filters.dateTo) {
      where.date = {};
      if (filters.dateFrom) {
        where.date.gte = filters.dateFrom;
      }
      if (filters.dateTo) {
        where.date.lte = filters.dateTo;
      }
    }

    const result = await this.prisma.workLog.aggregate({
      where,
      _sum: {
        hours: true,
      },
    });

    return Number(result._sum.hours || 0);
  }

  /**
   * Calculate hourly salary for a period
   */
  async calculateHourlySalary(userId: string, dateFrom: Date, dateTo: Date): Promise<number> {
    const member = await this.prisma.teamMember.findFirst({
      where: {
        userId,
        salaryType: 'hourly',
      },
    });

    if (!member || !member.salaryAmount) {
      return 0;
    }

    const totalHours = await this.getTotalHours({
      memberId: member.id,
      dateFrom,
      dateTo,
    });

    return totalHours * Number(member.salaryAmount);
  }
}
