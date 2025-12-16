import { Resolver, Query, Mutation, Args } from '@nestjs/graphql'
import { UseGuards } from '@nestjs/common'
import { AuthGuard } from '../../../shared/guards/auth.guard'
import { AdminGuard } from '../../../shared/guards/admin.guard'
import { PermissionsGuard } from '../../../shared/guards/permissions.guard'
import { RequirePermissions } from '../../../shared/decorators/require-permissions.decorator'
import { CurrentUser } from '../../../shared/decorators/current-user.decorator'
import type { CurrentUserData } from '../../auth/decorators/current-user.decorator'
import { AdminTeamsService } from '../services/admin-teams.service'
import { Team } from '../../teams/models/team.model'
import {
	AdminTeamsConnection,
	AdminTeamDetails,
	AdminTeamStats,
	AdminTeamFilters,
} from '../models/admin-team.model'
import { AdminUpdateTeamInput } from '../dto/admin-update-team.input'
import { PaginationInput } from '../dto/pagination.input'
import { AdminPermissions } from '../../../shared/constants/admin-permissions'

@Resolver(() => Team)
@UseGuards(AuthGuard, AdminGuard, PermissionsGuard)
export class AdminTeamsResolver {
	constructor(private adminTeamsService: AdminTeamsService) {}

	@Query(() => AdminTeamsConnection, {
		description: 'Get paginated list of teams with filters (Admin only)',
	})
	@RequirePermissions(AdminPermissions.TEAMS_VIEW)
	async adminTeams(
		@Args('filters', { type: () => AdminTeamFilters, nullable: true })
		filters: AdminTeamFilters = {},
		@Args('pagination', { type: () => PaginationInput })
		pagination: PaginationInput,
	): Promise<any> {
		return this.adminTeamsService.findAll(filters, pagination)
	}

	@Query(() => AdminTeamDetails, {
		description: 'Get detailed information about a specific team (Admin only)',
	})
	@RequirePermissions(AdminPermissions.TEAMS_VIEW)
	async adminTeam(@Args('id', { type: () => String }) id: string): Promise<any> {
		return this.adminTeamsService.findById(id)
	}

	@Query(() => AdminTeamStats, {
		description: 'Get statistics for a specific team (Admin only)',
	})
	@RequirePermissions(AdminPermissions.TEAMS_VIEW)
	async adminTeamStats(
		@Args('teamId', { type: () => String }) teamId: string,
	): Promise<AdminTeamStats> {
		return this.adminTeamsService.getTeamStats(teamId)
	}

	@Mutation(() => Team, {
		description: 'Update team information (Admin only)',
	})
	@RequirePermissions(AdminPermissions.TEAMS_UPDATE)
	async adminUpdateTeam(
		@Args('id', { type: () => String }) id: string,
		@Args('input', { type: () => AdminUpdateTeamInput }) input: AdminUpdateTeamInput,
		@CurrentUser() currentUser: CurrentUserData,
	): Promise<any> {
		return this.adminTeamsService.updateTeam(id, input, currentUser.id)
	}

	@Mutation(() => Team, {
		description: 'Change team subscription plan (Admin only)',
	})
	@RequirePermissions(AdminPermissions.TEAMS_UPDATE)
	async adminChangeTeamPlan(
		@Args('teamId', { type: () => String }) teamId: string,
		@Args('planType', { type: () => String }) planType: string,
		@CurrentUser() currentUser: CurrentUserData,
	): Promise<any> {
		return this.adminTeamsService.changeTeamPlan(teamId, planType, currentUser.id)
	}

	@Mutation(() => Boolean, {
		description: 'Remove a member from a team (Admin only)',
	})
	@RequirePermissions(AdminPermissions.TEAMS_UPDATE)
	async adminRemoveTeamMember(
		@Args('teamId', { type: () => String }) teamId: string,
		@Args('memberId', { type: () => String }) memberId: string,
		@CurrentUser() currentUser: CurrentUserData,
	): Promise<boolean> {
		return this.adminTeamsService.removeTeamMember(teamId, memberId, currentUser.id)
	}

	@Mutation(() => Boolean, {
		description: 'Delete a team (Admin only)',
	})
	@RequirePermissions(AdminPermissions.TEAMS_DELETE)
	async adminDeleteTeam(
		@Args('id', { type: () => String }) id: string,
		@CurrentUser() currentUser: CurrentUserData,
	): Promise<boolean> {
		return this.adminTeamsService.deleteTeam(id, currentUser.id)
	}
}
