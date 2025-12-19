import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '../../../shared/guards/auth.guard';
import { AdminGuard } from '../../../shared/guards/admin.guard';
import { PermissionsGuard } from '../../../shared/guards/permissions.guard';
import { RequirePermissions } from '../../../shared/decorators/require-permissions.decorator';
import { CurrentUser } from '../../../shared/decorators/current-user.decorator';
import { AdminRolesService } from '../services/admin-roles.service';
import {
  AdminRoleDetail,
  AssignAdminRoleInput,
  UpdateAdminPermissionsInput,
  UpdateTwoFactorInput,
  UpdateIpWhitelistInput,
} from '../models/admin-role-detail.model';
import { AdminRoleType } from '../models/admin-role-type.enum';
import { AdminPermissions } from '../../../shared/constants/admin-permissions';

@Resolver(() => AdminRoleDetail)
@UseGuards(AuthGuard, AdminGuard, PermissionsGuard)
export class AdminRolesResolver {
  constructor(private readonly adminRolesService: AdminRolesService) {}

  /**
   * Get all admin roles with optional filtering
   */
  @Query(() => [AdminRoleDetail], { name: 'adminRoles' })
  @RequirePermissions(AdminPermissions.ADMIN_ROLES_VIEW)
  async getAdminRoles(
    @Args('role', { nullable: true }) role?: AdminRoleType,
    @Args('search', { nullable: true }) search?: string,
    @Args('limit', { nullable: true, defaultValue: 50 }) limit?: number,
    @Args('offset', { nullable: true, defaultValue: 0 }) offset?: number,
  ): Promise<AdminRoleDetail[]> {
    return this.adminRolesService.findAll(role, search, limit, offset);
  }

  /**
   * Get admin role by ID
   */
  @Query(() => AdminRoleDetail, { name: 'adminRole' })
  @RequirePermissions(AdminPermissions.ADMIN_ROLES_VIEW)
  async getAdminRole(@Args('id') id: string): Promise<AdminRoleDetail> {
    return this.adminRolesService.findById(id);
  }

  /**
   * Get admin role by user ID
   */
  @Query(() => AdminRoleDetail, { name: 'adminRoleByUserId', nullable: true })
  @RequirePermissions(AdminPermissions.ADMIN_ROLES_VIEW)
  async getAdminRoleByUserId(
    @Args('userId') userId: string,
  ): Promise<AdminRoleDetail | null> {
    return this.adminRolesService.findByUserId(userId);
  }

  /**
   * Assign admin role to a user
   */
  @Mutation(() => AdminRoleDetail, { name: 'assignAdminRole' })
  @RequirePermissions(AdminPermissions.ADMIN_ROLES_CREATE)
  async assignAdminRole(
    @Args('input') input: AssignAdminRoleInput,
    @CurrentUser() user: any,
  ): Promise<AdminRoleDetail> {
    return this.adminRolesService.assignRole(input, user.id);
  }

  /**
   * Update admin permissions
   */
  @Mutation(() => AdminRoleDetail, { name: 'updateAdminPermissions' })
  @RequirePermissions(AdminPermissions.ADMIN_ROLES_UPDATE)
  async updateAdminPermissions(
    @Args('input') input: UpdateAdminPermissionsInput,
    @CurrentUser() user: any,
  ): Promise<AdminRoleDetail> {
    return this.adminRolesService.updatePermissions(input, user.id);
  }

  /**
   * Update two-factor enforcement
   */
  @Mutation(() => AdminRoleDetail, { name: 'updateTwoFactorEnforcement' })
  @RequirePermissions(AdminPermissions.ADMIN_ROLES_UPDATE)
  async updateTwoFactorEnforcement(
    @Args('input') input: UpdateTwoFactorInput,
    @CurrentUser() user: any,
  ): Promise<AdminRoleDetail> {
    return this.adminRolesService.updateTwoFactorEnforcement(input, user.id);
  }

  /**
   * Update IP whitelist
   */
  @Mutation(() => AdminRoleDetail, { name: 'updateIpWhitelist' })
  @RequirePermissions(AdminPermissions.ADMIN_ROLES_UPDATE)
  async updateIpWhitelist(
    @Args('input') input: UpdateIpWhitelistInput,
    @CurrentUser() user: any,
  ): Promise<AdminRoleDetail> {
    return this.adminRolesService.updateIpWhitelist(input, user.id);
  }

  /**
   * Change admin role type
   */
  @Mutation(() => AdminRoleDetail, { name: 'changeAdminRole' })
  @RequirePermissions(AdminPermissions.ADMIN_ROLES_UPDATE)
  async changeAdminRole(
    @Args('roleId') roleId: string,
    @Args('newRole') newRole: AdminRoleType,
    @CurrentUser() user: any,
  ): Promise<AdminRoleDetail> {
    return this.adminRolesService.changeRole(roleId, newRole, user.id);
  }

  /**
   * Revoke admin role
   */
  @Mutation(() => Boolean, { name: 'revokeAdminRole' })
  @RequirePermissions(AdminPermissions.ADMIN_ROLES_DELETE)
  async revokeAdminRole(
    @Args('roleId') roleId: string,
    @CurrentUser() user: any,
  ): Promise<boolean> {
    return this.adminRolesService.revokeRole(roleId, user.id);
  }
}
