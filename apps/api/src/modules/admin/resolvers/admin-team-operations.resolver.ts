import { Resolver, Query, Mutation, Args } from '@nestjs/graphql'
import { UseGuards } from '@nestjs/common'
import { AuthGuard } from '../../../shared/guards/auth.guard'
import { AdminGuard } from '../../../shared/guards/admin.guard'
import { PermissionsGuard } from '../../../shared/guards/permissions.guard'
import { RequirePermissions } from '../../../shared/decorators/permissions.decorator'
import { CurrentUser } from '../../../shared/decorators/current-user.decorator'
import { AdminPermissions } from '../models/admin.model'
import { AdminTeamOperationsService } from '../services/admin-team-operations.service'
import {
  TeamTemplate,
  TeamMergeLog,
  TeamCloneLog,
  MergePreview,
  MergeResult,
  CloneResult,
  TeamOperationsStatistics,
  CreateTeamTemplateInput,
  UpdateTeamTemplateInput,
  MergeTeamsInput,
  CloneTeamInput,
  CreateTeamFromTemplateInput,
  TeamTemplateFilterInput,
} from '../models/admin-team-operations.model'

@Resolver()
@UseGuards(AuthGuard, AdminGuard, PermissionsGuard)
export class AdminTeamOperationsResolver {
  constructor(private readonly teamOperationsService: AdminTeamOperationsService) {}

  // ==================== TEAM TEMPLATES ====================

  @Query(() => [TeamTemplate], { name: 'adminGetTeamTemplates' })
  @RequirePermissions(AdminPermissions.TEAMS_VIEW)
  async getTeamTemplates(
    @Args('filter', { type: () => TeamTemplateFilterInput, nullable: true })
    filter?: TeamTemplateFilterInput,
  ): Promise<TeamTemplate[]> {
    return this.teamOperationsService.getTeamTemplates(filter)
  }

  @Query(() => TeamTemplate, { name: 'adminGetTeamTemplateById' })
  @RequirePermissions(AdminPermissions.TEAMS_VIEW)
  async getTeamTemplateById(
    @Args('id', { type: () => String }) id: string,
  ): Promise<TeamTemplate> {
    return this.teamOperationsService.getTeamTemplateById(id)
  }

  @Mutation(() => TeamTemplate, { name: 'adminCreateTeamTemplate' })
  @RequirePermissions(AdminPermissions.TEAMS_MANAGE)
  async createTeamTemplate(
    @Args('input') input: CreateTeamTemplateInput,
    @CurrentUser('id') userId: string,
  ): Promise<TeamTemplate> {
    return this.teamOperationsService.createTeamTemplate(input, userId)
  }

  @Mutation(() => TeamTemplate, { name: 'adminUpdateTeamTemplate' })
  @RequirePermissions(AdminPermissions.TEAMS_MANAGE)
  async updateTeamTemplate(
    @Args('input') input: UpdateTeamTemplateInput,
  ): Promise<TeamTemplate> {
    return this.teamOperationsService.updateTeamTemplate(input)
  }

  @Mutation(() => Boolean, { name: 'adminDeleteTeamTemplate' })
  @RequirePermissions(AdminPermissions.TEAMS_MANAGE)
  async deleteTeamTemplate(
    @Args('id', { type: () => String }) id: string,
  ): Promise<boolean> {
    return this.teamOperationsService.deleteTeamTemplate(id)
  }

  // ==================== TEAM MERGE ====================

  @Query(() => MergePreview, { name: 'adminGetMergePreview' })
  @RequirePermissions(AdminPermissions.TEAMS_VIEW)
  async getMergePreview(
    @Args('sourceTeamId', { type: () => String }) sourceTeamId: string,
    @Args('targetTeamId', { type: () => String }) targetTeamId: string,
  ): Promise<MergePreview> {
    return this.teamOperationsService.getMergePreview(sourceTeamId, targetTeamId)
  }

  @Mutation(() => MergeResult, { name: 'adminMergeTeams' })
  @RequirePermissions(AdminPermissions.TEAMS_MANAGE)
  async mergeTeams(
    @Args('input') input: MergeTeamsInput,
    @CurrentUser('id') userId: string,
  ): Promise<MergeResult> {
    return this.teamOperationsService.mergeTeams(input, userId)
  }

  // ==================== TEAM CLONE ====================

  @Mutation(() => CloneResult, { name: 'adminCloneTeam' })
  @RequirePermissions(AdminPermissions.TEAMS_MANAGE)
  async cloneTeam(
    @Args('input') input: CloneTeamInput,
    @CurrentUser('id') userId: string,
  ): Promise<CloneResult> {
    return this.teamOperationsService.cloneTeam(input, userId)
  }

  @Mutation(() => CloneResult, { name: 'adminCreateTeamFromTemplate' })
  @RequirePermissions(AdminPermissions.TEAMS_MANAGE)
  async createTeamFromTemplate(
    @Args('input') input: CreateTeamFromTemplateInput,
  ): Promise<CloneResult> {
    return this.teamOperationsService.createTeamFromTemplate(input)
  }

  // ==================== LOGS ====================

  @Query(() => [TeamMergeLog], { name: 'adminGetMergeLogs' })
  @RequirePermissions(AdminPermissions.TEAMS_VIEW)
  async getMergeLogs(): Promise<TeamMergeLog[]> {
    return this.teamOperationsService.getMergeLogs()
  }

  @Query(() => [TeamCloneLog], { name: 'adminGetCloneLogs' })
  @RequirePermissions(AdminPermissions.TEAMS_VIEW)
  async getCloneLogs(): Promise<TeamCloneLog[]> {
    return this.teamOperationsService.getCloneLogs()
  }

  // ==================== STATISTICS ====================

  @Query(() => TeamOperationsStatistics, { name: 'adminGetTeamOperationsStatistics' })
  @RequirePermissions(AdminPermissions.TEAMS_VIEW)
  async getTeamOperationsStatistics(): Promise<TeamOperationsStatistics> {
    return this.teamOperationsService.getTeamOperationsStatistics()
  }
}
