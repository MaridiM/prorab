import { Resolver, Query, Mutation, Args } from '@nestjs/graphql'
import { UseGuards } from '@nestjs/common'
import { AuthGuard } from '../../../shared/guards/auth.guard'
import { AdminGuard } from '../../../shared/guards/admin.guard'
import { PermissionsGuard } from '../../../shared/guards/permissions.guard'
import { RequirePermissions } from '../../../shared/decorators/require-permissions.decorator'
import { CurrentUser } from '../../../shared/decorators/current-user.decorator'
import type { CurrentUserData } from '../../auth/decorators/current-user.decorator'
import { AdminUsersService } from '../services/admin-users.service'
import { User } from '../../users/models/user.model'
import {
	AdminUsersConnection,
	AdminUserDetails,
	UserActivity,
	UserSession,
	AdminUserFilters,
} from '../models/admin-user.model'
import { AdminUpdateUserInput } from '../dto/admin-update-user.input'
import { PaginationInput } from '../dto/pagination.input'
import { AdminPermissions } from '../../../shared/constants/admin-permissions'

@Resolver(() => User)
@UseGuards(AuthGuard, AdminGuard, PermissionsGuard)
export class AdminUsersResolver {
	constructor(private adminUsersService: AdminUsersService) {}

	@Query(() => AdminUsersConnection, {
		description: 'Get paginated list of users with filters (Admin only)',
	})
	@RequirePermissions(AdminPermissions.USERS_VIEW)
	async adminUsers(
		@Args('filters', { type: () => AdminUserFilters, nullable: true })
		filters: AdminUserFilters = {},
		@Args('pagination', { type: () => PaginationInput })
		pagination: PaginationInput,
	): Promise<AdminUsersConnection> {
		return this.adminUsersService.findAll(filters, pagination)
	}

	@Query(() => AdminUserDetails, {
		description: 'Get detailed information about a specific user (Admin only)',
	})
	@RequirePermissions(AdminPermissions.USERS_VIEW)
	async adminUser(@Args('id', { type: () => String }) id: string): Promise<AdminUserDetails> {
		return this.adminUsersService.findById(id)
	}

	@Query(() => [UserActivity], {
		description: 'Get activity logs for a specific user (Admin only)',
	})
	@RequirePermissions(AdminPermissions.USERS_VIEW)
	async adminUserActivity(
		@Args('userId', { type: () => String }) userId: string,
		@Args('limit', { type: () => Number, nullable: true, defaultValue: 50 }) limit: number,
	): Promise<UserActivity[]> {
		return this.adminUsersService.getUserActivity(userId, limit)
	}

	@Query(() => [UserSession], {
		description: 'Get active sessions for a specific user (Admin only)',
	})
	@RequirePermissions(AdminPermissions.USERS_VIEW)
	async adminUserSessions(
		@Args('userId', { type: () => String }) userId: string,
	): Promise<UserSession[]> {
		return this.adminUsersService.getUserSessions(userId)
	}

	@Mutation(() => User, {
		description: 'Update user information (Admin only)',
	})
	@RequirePermissions(AdminPermissions.USERS_UPDATE)
	async adminUpdateUser(
		@Args('id', { type: () => String }) id: string,
		@Args('input', { type: () => AdminUpdateUserInput }) input: AdminUpdateUserInput,
		@CurrentUser() currentUser: CurrentUserData,
	): Promise<User> {
		return this.adminUsersService.updateUser(id, input, currentUser.id)
	}

	@Mutation(() => Boolean, {
		description: 'Send password reset link to user (Admin only)',
	})
	@RequirePermissions(AdminPermissions.USERS_UPDATE)
	async adminResetUserPassword(
		@Args('id', { type: () => String }) id: string,
		@CurrentUser() currentUser: CurrentUserData,
	): Promise<boolean> {
		return this.adminUsersService.resetUserPassword(id, currentUser.id)
	}

	@Mutation(() => User, {
		description: 'Manually verify user email (Admin only)',
	})
	@RequirePermissions(AdminPermissions.USERS_UPDATE)
	async adminVerifyUserEmail(
		@Args('id', { type: () => String }) id: string,
		@CurrentUser() currentUser: CurrentUserData,
	): Promise<User> {
		return this.adminUsersService.verifyUserEmail(id, currentUser.id)
	}

	@Mutation(() => Boolean, {
		description: 'Delete a user account (Admin only)',
	})
	@RequirePermissions(AdminPermissions.USERS_DELETE)
	async adminDeleteUser(
		@Args('id', { type: () => String}) id: string,
		@CurrentUser() currentUser: CurrentUserData,
	): Promise<boolean> {
		return this.adminUsersService.deleteUser(id, currentUser.id)
	}
}
