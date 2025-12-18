import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.service';
import type { AdminActionLog } from '@prisma/generated/client';

export interface LogAdminActionInput {
  adminUserId: string;
  action: string;
  resource: string;
  resourceId?: string;
  details?: any;
  ipAddress?: string;
  userAgent?: string;
}

export interface AdminActionLogFilter {
  adminUserId?: string;
  action?: string;
  resource?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}

@Injectable()
export class AdminActionLogService {
  private readonly logger = new Logger(AdminActionLogService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Log an admin action
   */
  async logAction(input: LogAdminActionInput): Promise<AdminActionLog> {
    const log = await this.prisma.adminActionLog.create({
      data: {
        adminUserId: input.adminUserId,
        action: input.action,
        resource: input.resource,
        resourceId: input.resourceId,
        details: input.details,
        ipAddress: input.ipAddress,
        userAgent: input.userAgent,
      },
    });

    this.logger.log(
      `Admin action logged: ${input.action} on ${input.resource} by ${input.adminUserId}`
    );

    return log;
  }

  /**
   * Get admin action logs with filters
   */
  async getActionLogs(filter: AdminActionLogFilter): Promise<{
    logs: any[];
    total: number;
  }> {
    const where: any = {};

    if (filter.adminUserId) {
      where.adminUserId = filter.adminUserId;
    }

    if (filter.action) {
      where.action = filter.action;
    }

    if (filter.resource) {
      where.resource = filter.resource;
    }

    if (filter.startDate || filter.endDate) {
      where.createdAt = {};
      if (filter.startDate) {
        where.createdAt.gte = filter.startDate;
      }
      if (filter.endDate) {
        where.createdAt.lte = filter.endDate;
      }
    }

    const [logs, total] = await Promise.all([
      this.prisma.adminActionLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: filter.limit || 50,
        skip: filter.offset || 0,
        include: {
          adminUser: {
            select: {
              email: true,
            },
          },
        },
      }),
      this.prisma.adminActionLog.count({ where }),
    ]);

    // Map to include adminUserEmail from relation
    const logsWithEmail = logs.map(log => ({
      ...log,
      adminUserEmail: log.adminUser?.email || 'Unknown',
    }));

    return { logs: logsWithEmail, total };
  }

  /**
   * Get action log by ID
   */
  async getActionLog(id: string): Promise<AdminActionLog | null> {
    return this.prisma.adminActionLog.findUnique({
      where: { id },
    });
  }

  /**
   * Get recent actions by admin user
   */
  async getRecentActionsByAdmin(
    adminUserId: string,
    limit: number = 20
  ): Promise<AdminActionLog[]> {
    return this.prisma.adminActionLog.findMany({
      where: { adminUserId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  /**
   * Get actions by resource
   */
  async getActionsByResource(
    resource: string,
    resourceId: string,
    limit: number = 50
  ): Promise<AdminActionLog[]> {
    return this.prisma.adminActionLog.findMany({
      where: {
        resource,
        resourceId,
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  /**
   * Get action statistics
   */
  async getActionStatistics(startDate: Date, endDate: Date): Promise<{
    totalActions: number;
    actionsByType: Record<string, number>;
    actionsByResource: Record<string, number>;
    actionsByAdmin: Record<string, number>;
  }> {
    const logs = await this.prisma.adminActionLog.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    const actionsByType: Record<string, number> = {};
    const actionsByResource: Record<string, number> = {};
    const actionsByAdmin: Record<string, number> = {};

    logs.forEach((log) => {
      // Count by action type
      actionsByType[log.action] = (actionsByType[log.action] || 0) + 1;

      // Count by resource
      actionsByResource[log.resource] = (actionsByResource[log.resource] || 0) + 1;

      // Count by admin user
      actionsByAdmin[log.adminUserId] = (actionsByAdmin[log.adminUserId] || 0) + 1;
    });

    return {
      totalActions: logs.length,
      actionsByType,
      actionsByResource,
      actionsByAdmin,
    };
  }

  /**
   * Delete old logs (for cleanup)
   */
  async deleteOldLogs(olderThan: Date): Promise<number> {
    const result = await this.prisma.adminActionLog.deleteMany({
      where: {
        createdAt: {
          lt: olderThan,
        },
      },
    });

    this.logger.log(`Deleted ${result.count} old admin action logs`);

    return result.count;
  }
}
