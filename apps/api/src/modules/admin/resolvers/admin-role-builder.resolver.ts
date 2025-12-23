import { Resolver, Query, Mutation, Args, ID, Int } from '@nestjs/graphql'
import { UseGuards } from '@nestjs/common'
import { AuthGuard } from '../../../shared/guards/auth.guard'
import { AdminGuard } from '../../../shared/guards/admin.guard'
import { PermissionsGuard } from '../../../shared/guards/permissions.guard'
import { RequirePermissions } from '../../../shared/decorators/require-permissions.decorator'
import { AdminPermissions } from '../../../shared/constants/admin-permissions'
import { CurrentUser } from '../../../shared/decorators/current-user.decorator'
import { AdminRoleBuilderService } from '../services/admin-role-builder.service'
import {
  CustomRole,
  RoleAssignmentHistory,
  PermissionCategory,
  RoleHierarchyNode,
  RoleStatistics,
  CreateCustomRoleInput,
  UpdateCustomRoleInput,
  AssignRoleInput,
  BulkAssignRoleInput,
} from '../models/admin-role-builder.model'

@Resolver()
@UseGuards(AuthGuard, AdminGuard, PermissionsGuard)
export class AdminRoleBuilderResolver {
  constructor(private readonly roleBuilderService: AdminRoleBuilderService) {}

  // ==================== QUERIES ====================

  @Query(() => [CustomRole], {
    name: 'adminGetTeamRoles',
    description: 'Get all custom roles for a team',
  })
  @RequirePermissions(AdminPermissions.TEAMS_VIEW)
  async getTeamRoles(@Args('teamId', { type: () => String }) teamId: string): Promise<CustomRole[]> {
    return this.roleBuilderService.getAllRoles(teamId)
  }

  @Query(() => CustomRole, {
    name: 'adminGetRoleById',
    description: 'Get a custom role by ID',
  })
  @RequirePermissions(AdminPermissions.TEAMS_VIEW)
  async getRoleById(@Args('roleId', { type: () => ID }) roleId: string): Promise<CustomRole> {
    return this.roleBuilderService.getRoleById(roleId)
  }

  @Query(() => [RoleHierarchyNode], {
    name: 'adminGetRoleHierarchy',
    description: 'Get role hierarchy tree for a team',
  })
  @RequirePermissions(AdminPermissions.TEAMS_VIEW)
  async getRoleHierarchy(@Args('teamId', { type: () => String }) teamId: string): Promise<RoleHierarchyNode[]> {
    return this.roleBuilderService.getRoleHierarchy(teamId)
  }

  @Query(() => [PermissionCategory], {
    name: 'adminGetPermissionCategories',
    description: 'Get all available permissions organized by category',
  })
  @RequirePermissions(AdminPermissions.TEAMS_VIEW)
  async getPermissionCategories(): Promise<PermissionCategory[]> {
    return this.roleBuilderService.getPermissionCategories()
  }

  @Query(() => [RoleAssignmentHistory], {
    name: 'adminGetRoleAssignmentHistory',
    description: 'Get role assignment history for a team',
  })
  @RequirePermissions(AdminPermissions.TEAMS_VIEW)
  async getRoleAssignmentHistory(
    @Args('teamId', { type: () => String }) teamId: string,
    @Args('limit', { type: () => Int, nullable: true, defaultValue: 50 }) limit?: number,
  ): Promise<RoleAssignmentHistory[]> {
    return this.roleBuilderService.getRoleAssignmentHistory(teamId, limit)
  }

  @Query(() => [RoleAssignmentHistory], {
    name: 'adminGetMemberRoleHistory',
    description: 'Get role assignment history for a specific member',
  })
  @RequirePermissions(AdminPermissions.TEAMS_VIEW)
  async getMemberRoleHistory(
    @Args('memberId', { type: () => String }) memberId: string,
    @Args('limit', { type: () => Int, nullable: true, defaultValue: 20 }) limit?: number,
  ): Promise<RoleAssignmentHistory[]> {
    return this.roleBuilderService.getMemberRoleHistory(memberId, limit)
  }

  @Query(() => RoleStatistics, {
    name: 'adminGetRoleStatistics',
    description: 'Get role statistics for a team',
  })
  @RequirePermissions(AdminPermissions.TEAMS_VIEW)
  async getRoleStatistics(@Args('teamId', { type: () => String }) teamId: string): Promise<RoleStatistics> {
    return this.roleBuilderService.getRoleStatistics(teamId)
  }

  // ==================== MUTATIONS ====================

  @Mutation(() => CustomRole, {
    name: 'adminCreateCustomRole',
    description: 'Create a new custom role',
  })
  @RequirePermissions(AdminPermissions.TEAMS_UPDATE)
  async createCustomRole(
    @Args('input') input: CreateCustomRoleInput,
    @CurrentUser('id') userId: string,
  ): Promise<CustomRole> {
    return this.roleBuilderService.createRole(input, userId)
  }

  @Mutation(() => CustomRole, {
    name: 'adminUpdateCustomRole',
    description: 'Update an existing custom role',
  })
  @RequirePermissions(AdminPermissions.TEAMS_UPDATE)
  async updateCustomRole(
    @Args('input') input: UpdateCustomRoleInput,
    @CurrentUser('id') userId: string,
  ): Promise<CustomRole> {
    return this.roleBuilderService.updateRole(input, userId)
  }

  @Mutation(() => Boolean, {
    name: 'adminDeleteCustomRole',
    description: 'Delete a custom role',
  })
  @RequirePermissions(AdminPermissions.TEAMS_UPDATE)
  async deleteCustomRole(@Args('roleId', { type: () => ID }) roleId: string): Promise<boolean> {
    return this.roleBuilderService.deleteRole(roleId)
  }

  @Mutation(() => Boolean, {
    name: 'adminAssignRole',
    description: 'Assign a custom role to a team member',
  })
  @RequirePermissions(AdminPermissions.TEAMS_UPDATE)
  async assignRole(@Args('input') input: AssignRoleInput, @CurrentUser('id') userId: string): Promise<boolean> {
    return this.roleBuilderService.assignRole(input, userId)
  }

  @Mutation(() => Int, {
    name: 'adminBulkAssignRole',
    description: 'Assign a custom role to multiple team members',
  })
  @RequirePermissions(AdminPermissions.TEAMS_UPDATE)
  async bulkAssignRole(
    @Args('input') input: BulkAssignRoleInput,
    @CurrentUser('id') userId: string,
  ): Promise<number> {
    return this.roleBuilderService.bulkAssignRole(input, userId)
  }
}
