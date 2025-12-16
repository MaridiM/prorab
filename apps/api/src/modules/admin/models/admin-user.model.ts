import { ObjectType, Field, Int, ID, InputType } from '@nestjs/graphql'
import { User } from '../../users/models/user.model'
import { AdminRole } from './admin-role.model'
import { Team } from '../../teams/models/team.model'
import { PageInfo } from './shared/page-info.model'

@InputType()
export class AdminUserFilters {
	@Field(() => String, { nullable: true, description: 'Search by email, name, or phone' })
	search?: string

	@Field(() => Boolean, { nullable: true, description: 'Filter by email verification status' })
	emailVerified?: boolean

	@Field(() => Date, { nullable: true, description: 'Created after date' })
	createdAfter?: Date

	@Field(() => Date, { nullable: true, description: 'Created before date' })
	createdBefore?: Date

	@Field(() => Date, { nullable: true, description: 'Last login after date' })
	lastLoginAfter?: Date

	@Field(() => Date, { nullable: true, description: 'Last login before date' })
	lastLoginBefore?: Date
}

@ObjectType()
export class AdminUsersConnection {
	@Field(() => [User], { description: 'List of users' })
	nodes: User[]

	@Field(() => Int, { description: 'Total count of users' })
	totalCount: number

	@Field(() => PageInfo, { description: 'Pagination info' })
	pageInfo: PageInfo
}

@ObjectType()
export class TeamMemberInfo {
	@Field(() => ID)
	id: string

	@Field(() => Team)
	team: Team

	@Field(() => String)
	role: string

	@Field(() => Date)
	createdAt: Date
}

@ObjectType()
export class AdminUserCounts {
	@Field(() => Int, { description: 'Number of teams owned' })
	ownedTeams: number

	@Field(() => Int, { description: 'Number of team memberships' })
	teamMemberships: number

	@Field(() => Int, { description: 'Number of payments made' })
	payments: number
}

@ObjectType()
export class AdminUserDetails {
	@Field(() => User, { description: 'User data' })
	user: User

	@Field(() => [Team], { description: 'Teams owned by this user' })
	ownedTeams: Team[]

	@Field(() => [TeamMemberInfo], { description: 'Teams where user is a member' })
	teamMemberships: TeamMemberInfo[]

	@Field(() => AdminUserCounts, { description: 'Aggregated counts' })
	_count: AdminUserCounts
}

@ObjectType()
export class UserActivity {
	@Field(() => ID)
	id: string

	@Field(() => String, { description: 'Action type (e.g., UPDATE_USER, DELETE_USER)' })
	action: string

	@Field(() => String, { description: 'Resource type affected' })
	resource: string

	@Field(() => String, { description: 'Resource ID affected' })
	resourceId: string

	@Field(() => Date, { description: 'When the action occurred' })
	createdAt: Date

	@Field(() => String, { nullable: true, description: 'IP address of the actor' })
	ipAddress: string | null
}

@ObjectType()
export class UserSession {
	@Field(() => ID)
	id: string

	@Field(() => String)
	userId: string

	@Field(() => String, { description: 'Session token (masked)' })
	token: string

	@Field(() => Date, { description: 'Session expiration date' })
	expiresAt: Date

	@Field(() => Date, { description: 'Session creation date' })
	createdAt: Date

	@Field(() => String, { nullable: true, description: 'IP address' })
	ipAddress: string | null

	@Field(() => String, { nullable: true, description: 'User agent string' })
	userAgent: string | null
}
