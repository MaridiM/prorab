import { Resolver, Query, Args, Int } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '../../../shared/guards/auth.guard';
import { AdminGuard } from '../../../shared/guards/admin.guard';
import { PermissionsGuard } from '../../../shared/guards/permissions.guard';
import { RequirePermissions } from '../../../shared/decorators/require-permissions.decorator';
import { AdminAnalyticsService } from '../services/admin-analytics.service';
import {
  DashboardStats,
  ChartData,
  ActivityLog,
  SystemHealth,
} from '../models/admin-analytics.model';
import { AdminPermissions } from '../../../shared/constants/admin-permissions';

@Resolver()
@UseGuards(AuthGuard, AdminGuard, PermissionsGuard)
export class AdminAnalyticsResolver {
  constructor(private adminAnalyticsService: AdminAnalyticsService) {}

  @Query(() => DashboardStats, {
    description: 'Get comprehensive dashboard statistics (Admin only)',
  })
  @RequirePermissions(AdminPermissions.ANALYTICS_VIEW)
  async adminDashboardStats(): Promise<DashboardStats> {
    return this.adminAnalyticsService.getDashboardStats();
  }

  @Query(() => ChartData, {
    description: 'Get revenue chart data for the last 12 months (Admin only)',
  })
  @RequirePermissions(AdminPermissions.ANALYTICS_VIEW)
  async adminRevenueChart(): Promise<ChartData> {
    return this.adminAnalyticsService.getRevenueChart();
  }

  @Query(() => ChartData, {
    description: 'Get user growth chart data for the last 12 months (Admin only)',
  })
  @RequirePermissions(AdminPermissions.ANALYTICS_VIEW)
  async adminUserGrowthChart(): Promise<ChartData> {
    return this.adminAnalyticsService.getUserGrowthChart();
  }

  @Query(() => [ActivityLog], {
    description: 'Get recent admin activity logs (Admin only)',
  })
  @RequirePermissions(AdminPermissions.AUDIT_LOGS_VIEW)
  async adminRecentActivity(
    @Args('limit', { type: () => Int, defaultValue: 50 }) limit: number,
  ): Promise<ActivityLog[]> {
    return this.adminAnalyticsService.getRecentActivity(limit);
  }

  @Query(() => SystemHealth, {
    description: 'Get system health status (Admin only)',
  })
  @RequirePermissions(AdminPermissions.ANALYTICS_VIEW)
  async adminSystemHealth(): Promise<SystemHealth> {
    return this.adminAnalyticsService.getSystemHealth();
  }
}
