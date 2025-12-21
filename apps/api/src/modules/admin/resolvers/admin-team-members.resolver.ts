import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql'
import { UseGuards } from '@nestjs/common'
import { AuthGuard } from '../../../shared/guards/auth.guard'
import { AdminGuard } from '../../../shared/guards/admin.guard'
import { PermissionsGuard } from '../../../shared/guards/permissions.guard'
import { RequirePermissions } from '../../../shared/decorators/require-permissions.decorator'
import { AdminPermissions } from '../../../shared/constants/admin-permissions'
import { CurrentUser } from '../../../shared/decorators/current-user.decorator'
import { AdminTeamMembersService } from '../services/admin-team-members.service'
import {
  TeamMemberExtended,
  MemberActivityConnection,
  BulkOperationResult,
  MemberStatistics,
  MemberFilterInput,
  PaginationInput,
  BulkUpdateMembersInput,
  BulkRemoveMembersInput,
  TransferMemberInput,
  MemberExportFormat,
} from '../models/admin-team-members.model'

@Resolver()
@UseGuards(AuthGuard, AdminGuard, PermissionsGuard)
export class AdminTeamMembersResolver {
  constructor(private readonly teamMembersService: AdminTeamMembersService) {}

  // ==================== QUERIES ====================

  @Query(() => [TeamMemberExtended], {
    name: 'adminGetTeamMembers',
    description: 'Get team members with filtering and pagination',
  })
  @RequirePermissions(AdminPermissions.TEAMS_VIEW)
  async getTeamMembers(
    @Args('teamId', { type: () => String }) teamId: string,
    @Args('filter', { type: () => MemberFilterInput, nullable: true }) filter?: MemberFilterInput,
    @Args('pagination', { type: () => PaginationInput, nullable: true }) pagination?: PaginationInput,
  ): Promise<TeamMemberExtended[]> {
    return this.teamMembersService.getTeamMembers(teamId, filter, pagination)
  }

  @Query(() => TeamMemberExtended, {
    name: 'adminGetMemberById',
    description: 'Get member details by ID',
  })
  @RequirePermissions(AdminPermissions.TEAMS_VIEW)
  async getMemberById(@Args('memberId', { type: () => ID }) memberId: string): Promise<TeamMemberExtended> {
    return this.teamMembersService.getMemberById(memberId)
  }

  @Query(() => MemberActivityConnection, {
    name: 'adminGetMemberActivityHistory',
    description: 'Get member activity history with pagination',
  })
  @RequirePermissions(AdminPermissions.TEAMS_VIEW)
  async getMemberActivityHistory(
    @Args('memberId', { type: () => String }) memberId: string,
    @Args('pagination', { type: () => PaginationInput, nullable: true }) pagination?: PaginationInput,
  ): Promise<MemberActivityConnection> {
    return this.teamMembersService.getMemberActivityHistory(memberId, pagination)
  }

  @Query(() => MemberStatistics, {
    name: 'adminGetMemberStatistics',
    description: 'Get team member statistics',
  })
  @RequirePermissions(AdminPermissions.TEAMS_VIEW)
  async getMemberStatistics(@Args('teamId', { type: () => String }) teamId: string): Promise<MemberStatistics> {
    return this.teamMembersService.getMemberStatistics(teamId)
  }

  @Query(() => String, {
    name: 'adminExportMembers',
    description: 'Export team members data',
  })
  @RequirePermissions(AdminPermissions.TEAMS_VIEW)
  async exportMembers(
    @Args('teamId', { type: () => String }) teamId: string,
    @Args('format', { type: () => MemberExportFormat }) format: MemberExportFormat,
  ): Promise<string> {
    return this.teamMembersService.exportMembers(teamId, format)
  }

  // ==================== MUTATIONS ====================

  @Mutation(() => BulkOperationResult, {
    name: 'adminBulkUpdateMembers',
    description: 'Bulk update team members',
  })
  @RequirePermissions(AdminPermissions.TEAMS_MANAGE)
  async bulkUpdateMembers(
    @Args('input') input: BulkUpdateMembersInput,
    @CurrentUser('id') userId: string,
  ): Promise<BulkOperationResult> {
    return this.teamMembersService.bulkUpdateMembers(input, userId)
  }

  @Mutation(() => BulkOperationResult, {
    name: 'adminBulkRemoveMembers',
    description: 'Bulk remove team members',
  })
  @RequirePermissions(AdminPermissions.TEAMS_MANAGE)
  async bulkRemoveMembers(@Args('input') input: BulkRemoveMembersInput): Promise<BulkOperationResult> {
    return this.teamMembersService.bulkRemoveMembers(input)
  }

  @Mutation(() => TeamMemberExtended, {
    name: 'adminTransferMember',
    description: 'Transfer member to another team',
  })
  @RequirePermissions(AdminPermissions.TEAMS_MANAGE)
  async transferMember(
    @Args('input') input: TransferMemberInput,
    @CurrentUser('id') userId: string,
  ): Promise<TeamMemberExtended> {
    return this.teamMembersService.transferMember(input, userId)
  }
}
