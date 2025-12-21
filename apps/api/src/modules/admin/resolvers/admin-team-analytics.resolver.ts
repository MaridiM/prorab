import { Resolver, Query, Args, Int } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '../../../shared/guards/auth.guard';
import { AdminGuard } from '../../../shared/guards/admin.guard';
import { PermissionsGuard } from '../../../shared/guards/permissions.guard';
import { RequirePermissions } from '../../../shared/decorators/require-permissions.decorator';
import { AdminPermissions } from '../../../shared/constants/admin-permissions';
import { AdminTeamAnalyticsService } from '../services/admin-team-analytics.service';
import {
  TeamGrowthChart,
  MemberActivity,
  TeamComposition,
  TeamStorageUsage,
  TeamKPIs,
  TeamAnalytics,
} from '../models/admin-team-analytics.model';

@Resolver()
@UseGuards(AuthGuard, AdminGuard, PermissionsGuard)
export class AdminTeamAnalyticsResolver {
  constructor(private readonly analyticsService: AdminTeamAnalyticsService) {}

  @Query(() => TeamGrowthChart, {
    name: 'adminTeamGrowthChart',
    description: 'Get team growth chart data (members and projects over time)',
  })
  @RequirePermissions(AdminPermissions.TEAMS_VIEW)
  async getTeamGrowthChart(
    @Args('teamId', { type: () => String, description: 'Team ID' }) teamId: string,
    @Args('months', { type: () => Int, defaultValue: 12, description: 'Number of months' }) months: number,
  ): Promise<TeamGrowthChart> {
    return this.analyticsService.getTeamGrowthChart(teamId, months);
  }

  @Query(() => [MemberActivity], {
    name: 'adminTeamMemberActivity',
    description: 'Get member activity metrics for a team',
  })
  @RequirePermissions(AdminPermissions.TEAMS_VIEW)
  async getTeamMemberActivity(
    @Args('teamId', { type: () => String, description: 'Team ID' }) teamId: string,
  ): Promise<MemberActivity[]> {
    return this.analyticsService.getMemberActivityMetrics(teamId);
  }

  @Query(() => TeamComposition, {
    name: 'adminTeamComposition',
    description: 'Get team composition analysis (roles, positions, salary distribution)',
  })
  @RequirePermissions(AdminPermissions.TEAMS_VIEW)
  async getTeamComposition(
    @Args('teamId', { type: () => String, description: 'Team ID' }) teamId: string,
  ): Promise<TeamComposition> {
    return this.analyticsService.getTeamComposition(teamId);
  }

  @Query(() => TeamStorageUsage, {
    name: 'adminTeamStorageUsage',
    description: 'Get storage usage breakdown for a team',
  })
  @RequirePermissions(AdminPermissions.TEAMS_VIEW)
  async getTeamStorageUsage(
    @Args('teamId', { type: () => String, description: 'Team ID' }) teamId: string,
  ): Promise<TeamStorageUsage> {
    return this.analyticsService.getStorageUsageByTeam(teamId);
  }

  @Query(() => TeamKPIs, {
    name: 'adminTeamKPIs',
    description: 'Get team KPIs (Key Performance Indicators)',
  })
  @RequirePermissions(AdminPermissions.TEAMS_VIEW)
  async getTeamKPIs(
    @Args('teamId', { type: () => String, description: 'Team ID' }) teamId: string,
  ): Promise<TeamKPIs> {
    return this.analyticsService.getTeamKPIs(teamId);
  }

  @Query(() => TeamAnalytics, {
    name: 'adminTeamAnalytics',
    description: 'Get combined team analytics (all data in one call)',
  })
  @RequirePermissions(AdminPermissions.TEAMS_VIEW)
  async getTeamAnalytics(
    @Args('teamId', { type: () => String, description: 'Team ID' }) teamId: string,
  ): Promise<TeamAnalytics> {
    return this.analyticsService.getTeamAnalytics(teamId);
  }
}
