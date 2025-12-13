import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../core/prisma/prisma.service';
import { CsvExportService } from '../../shared/services/csv-export.service';
import { WorkLog } from './models/work-log.model';
import { CreateWorkLogInput } from './dto/create-work-log.input';
import { BulkCreateWorkLogInput } from './dto/bulk-create-work-log.input';
import { UpdateWorkLogInput } from './dto/update-work-log.input';

@Injectable()
export class WorkLogsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly csvExportService: CsvExportService,
  ) {}

  // ==================== QUERIES ====================

  /**
   * Get all work logs for a project
   * Only owner and project members can view
   */
  async getProjectWorkLogs(projectId: string, userId: string): Promise<WorkLog[]> {
    // Check access
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: { team: true },
    });

    if (!project) {
      throw new NotFoundException('Проект не найден');
    }

    // Check if user is owner or team member
    const isOwner = project.team.ownerId === userId;
    const teamMember = await this.prisma.teamMember.findUnique({
      where: {
        teamId_userId: {
          teamId: project.teamId,
          userId,
        },
      },
    });

    if (!isOwner && !teamMember) {
      throw new ForbiddenException('У вас нет доступа к этому проекту');
    }

    const workLogs = await this.prisma.workLog.findMany({
      where: { projectId },
      include: {
        project: true,
        member: {
          include: {
            user: true,
          },
        },
      },
      orderBy: { date: 'desc' },
    });

    return workLogs as any;
  }

  /**
   * Get all work logs for a team member
   * Owner can see all members, members can see only their own
   */
  async getMemberWorkLogs(memberId: string, userId: string): Promise<WorkLog[]> {
    const member = await this.prisma.teamMember.findUnique({
      where: { id: memberId },
      include: { team: true, user: true },
    });

    if (!member) {
      throw new NotFoundException('Участник команды не найден');
    }

    // Check if user is owner or the member themselves
    const isOwner = member.team.ownerId === userId;
    const isSelf = member.userId === userId;

    if (!isOwner && !isSelf) {
      throw new ForbiddenException('У вас нет доступа к этим данным');
    }

    const workLogs = await this.prisma.workLog.findMany({
      where: { memberId },
      include: {
        project: true,
        member: {
          include: {
            user: true,
          },
        },
      },
      orderBy: { date: 'desc' },
    });

    return workLogs as any;
  }

  /**
   * Get work logs for a specific date range
   */
  async getWorkLogsByDateRange(
    projectId: string,
    startDate: Date,
    endDate: Date,
    userId: string,
  ): Promise<WorkLog[]> {
    // Check access
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: { team: true },
    });

    if (!project) {
      throw new NotFoundException('Проект не найден');
    }

    const isOwner = project.team.ownerId === userId;
    const teamMember = await this.prisma.teamMember.findUnique({
      where: {
        teamId_userId: {
          teamId: project.teamId,
          userId,
        },
      },
    });

    if (!isOwner && !teamMember) {
      throw new ForbiddenException('У вас нет доступа к этому проекту');
    }

    const workLogs = await this.prisma.workLog.findMany({
      where: {
        projectId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        project: true,
        member: {
          include: {
            user: true,
          },
        },
      },
      orderBy: { date: 'desc' },
    });

    return workLogs as any;
  }

  // ==================== MUTATIONS ====================

  /**
   * Create a new work log entry
   * Owner or member can create logs
   */
  async createWorkLog(input: CreateWorkLogInput, userId: string): Promise<WorkLog> {
    const { projectId, memberId, date, hours, description } = input;

    // Verify project exists and get team info
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: { team: true },
    });

    if (!project) {
      throw new NotFoundException('Проект не найден');
    }

    // Verify member exists and belongs to the team
    const member = await this.prisma.teamMember.findUnique({
      where: { id: memberId },
    });

    if (!member || member.teamId !== project.teamId) {
      throw new NotFoundException('Участник команды не найден');
    }

    // Check if user is owner or the member themselves
    const isOwner = project.team.ownerId === userId;
    const isSelf = member.userId === userId;

    if (!isOwner && !isSelf) {
      throw new ForbiddenException(
        'Только владелец команды или сам участник могут создавать записи о времени',
      );
    }

    const workLog = await this.prisma.workLog.create({
      data: {
        projectId,
        memberId,
        date: new Date(date),
        hours,
        description,
        createdById: userId,
      },
      include: {
        project: true,
        member: {
          include: {
            user: true,
          },
        },
      },
    });

    return workLog as any;
  }

  /**
   * Bulk create work log entries
   * Owner or member can create logs
   */
  async bulkCreateWorkLogs(
    input: BulkCreateWorkLogInput,
    userId: string,
  ): Promise<{ success: number; failed: number; results: any[] }> {
    const results: any[] = [];
    let successCount = 0;
    let failedCount = 0;

    for (const workLog of input.workLogs) {
      try {
        const result = await this.createWorkLog(workLog, userId);
        results.push({
          success: true,
          data: result,
        });
        successCount++;
      } catch (error) {
        results.push({
          success: false,
          error: error.message,
          input: workLog,
        });
        failedCount++;
      }
    }

    return {
      success: successCount,
      failed: failedCount,
      results,
    };
  }

  /**
   * Update a work log entry
   * Only the creator or owner can update
   */
  async updateWorkLog(input: UpdateWorkLogInput, userId: string): Promise<WorkLog> {
    const { id, date, hours, description } = input;

    const existingLog = await this.prisma.workLog.findUnique({
      where: { id },
      include: {
        project: {
          include: { team: true },
        },
        member: true,
      },
    });

    if (!existingLog) {
      throw new NotFoundException('Запись о времени не найдена');
    }

    // Check if user is owner or creator
    const isOwner = existingLog.project.team.ownerId === userId;
    const isCreator = existingLog.createdById === userId;

    if (!isOwner && !isCreator) {
      throw new ForbiddenException('У вас нет прав на редактирование этой записи');
    }

    const updateData: any = {};
    if (date !== undefined) updateData.date = new Date(date);
    if (hours !== undefined) updateData.hours = hours;
    if (description !== undefined) updateData.description = description;

    const updatedLog = await this.prisma.workLog.update({
      where: { id },
      data: updateData,
      include: {
        project: true,
        member: {
          include: {
            user: true,
          },
        },
      },
    });

    return updatedLog as any;
  }

  /**
   * Delete a work log entry
   * Only the creator or owner can delete
   */
  async deleteWorkLog(id: string, userId: string): Promise<boolean> {
    const existingLog = await this.prisma.workLog.findUnique({
      where: { id },
      include: {
        project: {
          include: { team: true },
        },
      },
    });

    if (!existingLog) {
      throw new NotFoundException('Запись о времени не найдена');
    }

    // Check if user is owner or creator
    const isOwner = existingLog.project.team.ownerId === userId;
    const isCreator = existingLog.createdById === userId;

    if (!isOwner && !isCreator) {
      throw new ForbiddenException('У вас нет прав на удаление этой записи');
    }

    await this.prisma.workLog.delete({
      where: { id },
    });

    return true;
  }

  /**
   * Get total hours worked on a project by member
   */
  async getTotalHours(projectId: string, memberId?: string): Promise<number> {
    const result = await this.prisma.workLog.aggregate({
      where: {
        projectId,
        ...(memberId && { memberId }),
      },
      _sum: {
        hours: true,
      },
    });

    return Number(result._sum.hours || 0);
  }

  // ==================== EXPORT ====================

  /**
   * Export project work logs to CSV
   * Owner only
   */
  async exportProjectWorkLogsToCsv(projectId: string, userId: string): Promise<string> {
    // Get work logs with access check
    const workLogs = await this.getProjectWorkLogs(projectId, userId);

    // Transform data for CSV
    const csvData = workLogs.map((log: any) => ({
      date: log.date.toISOString().split('T')[0],
      memberName: log.member.user.fullName || log.member.user.email,
      hours: Number(log.hours),
      description: log.description || '',
      projectName: log.project.name,
      createdAt: log.createdAt.toISOString(),
    }));

    // Define columns
    const columns = [
      { key: 'date' as const, label: 'Дата' },
      { key: 'memberName' as const, label: 'Участник' },
      { key: 'hours' as const, label: 'Часы' },
      { key: 'description' as const, label: 'Описание' },
      { key: 'projectName' as const, label: 'Проект' },
      { key: 'createdAt' as const, label: 'Создано' },
    ];

    return this.csvExportService.exportToCsv(csvData, columns);
  }
}
