import { ObjectType, Field, Int, ID, Float, InputType } from '@nestjs/graphql'
import { Team } from '../../teams/models/team.model'
import { User } from '../../users/models/user.model'
import { SubscriptionModel } from '../../subscriptions/models/subscription.model'
import { Project } from '../../teams/models/project.model'
import { PageInfo } from './shared/page-info.model'

@InputType()
export class AdminTeamFilters {
	@Field(() => String, { nullable: true, description: 'Search by team name or owner email' })
	search?: string

	@Field(() => String, { nullable: true, description: 'Filter by plan type' })
	planType?: string

	@Field(() => String, { nullable: true, description: 'Filter by subscription status' })
	subscriptionStatus?: string

	@Field(() => Date, { nullable: true, description: 'Created after date' })
	createdAfter?: Date

	@Field(() => Date, { nullable: true, description: 'Created before date' })
	createdBefore?: Date

	@Field(() => Int, { nullable: true, description: 'Minimum number of members' })
	minMembers?: number

	@Field(() => Int, { nullable: true, description: 'Maximum number of members' })
	maxMembers?: number

	@Field(() => Int, { nullable: true, description: 'Minimum number of projects' })
	minProjects?: number

	@Field(() => Int, { nullable: true, description: 'Maximum number of projects' })
	maxProjects?: number
}

@ObjectType()
export class AdminTeamsConnection {
	@Field(() => [Team], { description: 'List of teams' })
	nodes: Team[]

	@Field(() => Int, { description: 'Total count of teams' })
	totalCount: number

	@Field(() => PageInfo, { description: 'Pagination info' })
	pageInfo: PageInfo
}

@ObjectType()
export class TeamMemberDetails {
	@Field(() => ID)
	id: string

	@Field(() => User)
	user: User

	@Field(() => String)
	role: string

	@Field(() => Date)
	createdAt: Date
}

@ObjectType()
export class AdminTeamCounts {
	@Field(() => Int, { description: 'Number of team members' })
	members: number

	@Field(() => Int, { description: 'Number of projects' })
	projects: number
}

@ObjectType()
export class AdminTeamDetails {
	@Field(() => Team, { description: 'Team data' })
	team: Team

	@Field(() => User, { description: 'Team owner' })
	owner: User

	@Field(() => [TeamMemberDetails], { description: 'Team members' })
	members: TeamMemberDetails[]

	@Field(() => [Project], { description: 'Team projects' })
	projects: Project[]

	@Field(() => SubscriptionModel, { nullable: true, description: 'Team subscription' })
	subscription: SubscriptionModel | null

	@Field(() => AdminTeamCounts, { description: 'Aggregated counts' })
	_count: AdminTeamCounts
}

@ObjectType()
export class AdminTeamStats {
	@Field(() => Int, { description: 'Total number of members' })
	totalMembers: number

	@Field(() => Int, { description: 'Total number of projects' })
	totalProjects: number

	@Field(() => Int, { description: 'Total number of expenses' })
	totalExpenses: number

	@Field(() => Float, { description: 'Total expense amount' })
	totalExpenseAmount: number

	@Field(() => Int, { description: 'Number of active projects' })
	activeProjects: number

	@Field(() => Int, { description: 'Number of completed projects' })
	completedProjects: number
}
