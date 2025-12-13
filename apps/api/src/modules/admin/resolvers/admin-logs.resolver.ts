import { Args, ID, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '../../../shared/guards/auth.guard';
import { AdminGuard } from '../../../shared/guards/admin.guard';
import { PermissionsGuard } from '../../../shared/guards/permissions.guard';
import { RequirePermissions } from '../../../shared/decorators/require-permissions.decorator';
import { AdminPermissions } from '../../../shared/constants/admin-permissions';
import { AdminActionLogService } from '../services/admin-action-log.service';
import {
  AdminActionLog,
  AdminActionLogsResult,
  AdminActionStatistics,
} from '../models/admin-action-log.model';
import { AdminActionLogFilterInput } from '../dto/admin-action-log-filter.input';

@Resolver(() => AdminActionLog)
export class AdminLogsResolver {
  constructor(private readonly actionLogService: AdminActionLogService) {}

  // ==================== QUERIES ====================

  @Query(() => AdminActionLogsResult, {
    description: 'Get admin action logs with filters (admin only)',
  })
  @UseGuards(AuthGuard, AdminGuard, PermissionsGuard)
  @RequirePermissions(AdminPermissions.AUDIT_LOGS_VIEW)
  async adminActionLogs(
    @Args('filter', { nullable: true }) filter?: AdminActionLogFilterInput
  ): Promise<AdminActionLogsResult> {
    const { logs, total } = await this.actionLogService.getActionLogs(filter || {});

    return { logs, total };
  }

  @Query(() => AdminActionLog, {
    description: 'Get admin action log by ID (admin only)',
    nullable: true,
  })
  @UseGuards(AuthGuard, AdminGuard, PermissionsGuard)
  @RequirePermissions(AdminPermissions.AUDIT_LOGS_VIEW)
  async adminActionLog(
    @Args('id', { type: () => ID }) id: string
  ): Promise<AdminActionLog | null> {
    return this.actionLogService.getActionLog(id);
  }

  @Query(() => [AdminActionLog], {
    description: 'Get recent actions by admin user (admin only)',
  })
  @UseGuards(AuthGuard, AdminGuard, PermissionsGuard)
  @RequirePermissions(AdminPermissions.AUDIT_LOGS_VIEW)
  async recentAdminActions(
    @Args('adminUserId', { type: () => ID }) adminUserId: string,
    @Args('limit', { type: () => Number, defaultValue: 20 }) limit: number
  ): Promise<AdminActionLog[]> {
    return this.actionLogService.getRecentActionsByAdmin(adminUserId, limit);
  }

  @Query(() => [AdminActionLog], {
    description: 'Get actions by resource (admin only)',
  })
  @UseGuards(AuthGuard, AdminGuard, PermissionsGuard)
  @RequirePermissions(AdminPermissions.AUDIT_LOGS_VIEW)
  async actionsByResource(
    @Args('resource') resource: string,
    @Args('resourceId', { type: () => ID }) resourceId: string,
    @Args('limit', { type: () => Number, defaultValue: 50 }) limit: number
  ): Promise<AdminActionLog[]> {
    return this.actionLogService.getActionsByResource(resource, resourceId, limit);
  }

  @Query(() => AdminActionStatistics, {
    description: 'Get admin action statistics (admin only)',
  })
  @UseGuards(AuthGuard, AdminGuard, PermissionsGuard)
  @RequirePermissions(AdminPermissions.ANALYTICS_VIEW)
  async adminActionStatistics(
    @Args('startDate') startDate: Date,
    @Args('endDate') endDate: Date
  ): Promise<AdminActionStatistics> {
    return this.actionLogService.getActionStatistics(startDate, endDate);
  }
}
