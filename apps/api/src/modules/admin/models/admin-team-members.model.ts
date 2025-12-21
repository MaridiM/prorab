import { ObjectType, Field, ID, Int, InputType, registerEnumType } from '@nestjs/graphql'
import { IsString, IsOptional, IsBoolean, IsArray, IsEnum, IsNumber, Min, Max } from 'class-validator'

// ==================== ENUMS ====================

export enum MemberActivityType {
  JOINED = 'JOINED',
  ROLE_CHANGED = 'ROLE_CHANGED',
  SALARY_CHANGED = 'SALARY_CHANGED',
  WORKLOG_ADDED = 'WORKLOG_ADDED',
  EXPENSE_ADDED = 'EXPENSE_ADDED',
  TASK_ASSIGNED = 'TASK_ASSIGNED',
  TASK_COMPLETED = 'TASK_COMPLETED',
  PAYOUT_RECEIVED = 'PAYOUT_RECEIVED',
  REMOVED = 'REMOVED',
}

registerEnumType(MemberActivityType, {
  name: 'MemberActivityType',
  description: 'Types of member activity events',
})

export enum MemberExportFormat {
  CSV = 'CSV',
  XLSX = 'XLSX',
  JSON = 'JSON',
}

registerEnumType(MemberExportFormat, {
  name: 'MemberExportFormat',
  description: 'Export format for member data',
})

// ==================== OBJECT TYPES ====================

@ObjectType({ description: 'Extended team member information' })
export class TeamMemberExtended {
  @Field(() => ID, { description: 'Member ID' })
  id: string

  @Field(() => String, { description: 'Team ID' })
  teamId: string

  @Field(() => String, { description: 'User ID' })
  userId: string

  @Field(() => String, { description: 'Team role (OWNER/MEMBER)' })
  role: string

  @Field(() => String, { nullable: true, description: 'Position/Job title' })
  position?: string

  @Field(() => Date, { description: 'Join date' })
  joinedAt: Date

  @Field(() => String, { description: 'Salary type (fixed/percentage/none)' })
  salaryType: string

  @Field(() => Number, { nullable: true, description: 'Salary amount' })
  salaryAmount?: number

  @Field(() => ID, { nullable: true, description: 'Custom role ID' })
  customRoleId?: string

  // User info
  @Field(() => String, { description: 'User full name' })
  userName: string

  @Field(() => String, { description: 'User email' })
  email: string

  @Field(() => String, { nullable: true, description: 'User avatar URL' })
  avatarUrl?: string

  @Field(() => String, { nullable: true, description: 'User phone' })
  phone?: string

  // Custom role info
  @Field(() => String, { nullable: true, description: 'Custom role name' })
  customRoleName?: string

  @Field(() => String, { nullable: true, description: 'Custom role color' })
  customRoleColor?: string

  // Stats
  @Field(() => Int, { description: 'Total projects participated' })
  projectsCount: number

  @Field(() => Number, { description: 'Total hours logged' })
  hoursLogged: number

  @Field(() => Number, { description: 'Total expenses added' })
  totalExpenses: number

  @Field(() => Int, { description: 'Total tasks assigned' })
  tasksCount: number

  @Field(() => Number, { description: 'Total payouts received' })
  totalPayouts: number

  @Field(() => Date, { nullable: true, description: 'Last activity timestamp' })
  lastActiveAt?: Date
}

@ObjectType({ description: 'Member activity event' })
export class MemberActivityEvent {
  @Field(() => ID, { description: 'Event ID' })
  id: string

  @Field(() => MemberActivityType, { description: 'Activity type' })
  type: MemberActivityType

  @Field(() => String, { description: 'Event description' })
  description: string

  @Field(() => String, { nullable: true, description: 'Additional details (JSON)' })
  metadata?: string

  @Field(() => String, { nullable: true, description: 'Related entity ID' })
  relatedId?: string

  @Field(() => String, { nullable: true, description: 'Related entity type' })
  relatedType?: string

  @Field(() => Date, { description: 'Event timestamp' })
  createdAt: Date

  @Field(() => String, { nullable: true, description: 'Triggered by user ID' })
  triggeredBy?: string

  @Field(() => String, { nullable: true, description: 'Triggered by user name' })
  triggeredByName?: string
}

@ObjectType({ description: 'Paginated member activity' })
export class MemberActivityConnection {
  @Field(() => [MemberActivityEvent], { description: 'Activity events' })
  events: MemberActivityEvent[]

  @Field(() => Int, { description: 'Total count' })
  totalCount: number

  @Field(() => Boolean, { description: 'Has more pages' })
  hasMore: boolean
}

@ObjectType({ description: 'Bulk operation result' })
export class BulkOperationResult {
  @Field(() => Int, { description: 'Number of successful operations' })
  successCount: number

  @Field(() => Int, { description: 'Number of failed operations' })
  failedCount: number

  @Field(() => [String], { nullable: true, description: 'Error messages' })
  errors?: string[]

  @Field(() => [String], { nullable: true, description: 'IDs of successfully processed items' })
  successIds?: string[]

  @Field(() => [String], { nullable: true, description: 'IDs of failed items' })
  failedIds?: string[]
}

@ObjectType({ description: 'Member statistics summary' })
export class MemberStatistics {
  @Field(() => Int, { description: 'Total members' })
  totalMembers: number

  @Field(() => Int, { description: 'Active members (activity in last 30 days)' })
  activeMembers: number

  @Field(() => Int, { description: 'Inactive members' })
  inactiveMembers: number

  @Field(() => Int, { description: 'Members with custom roles' })
  withCustomRoles: number

  @Field(() => Int, { description: 'Members with fixed salary' })
  withFixedSalary: number

  @Field(() => Int, { description: 'Members with percentage salary' })
  withPercentageSalary: number

  @Field(() => Int, { description: 'Members with no salary' })
  withNoSalary: number

  @Field(() => Number, { description: 'Average hours per member' })
  averageHours: number

  @Field(() => Number, { description: 'Total payroll (fixed salaries)' })
  totalPayroll: number
}

// ==================== INPUT TYPES ====================

@InputType({ description: 'Filter for team members' })
export class MemberFilterInput {
  @Field(() => String, { nullable: true, description: 'Search by name, email, position' })
  @IsOptional()
  @IsString()
  search?: string

  @Field(() => [String], { nullable: true, description: 'Filter by roles' })
  @IsOptional()
  @IsArray()
  roles?: string[]

  @Field(() => [String], { nullable: true, description: 'Filter by positions' })
  @IsOptional()
  @IsArray()
  positions?: string[]

  @Field(() => [String], { nullable: true, description: 'Filter by salary types' })
  @IsOptional()
  @IsArray()
  salaryTypes?: string[]

  @Field(() => [String], { nullable: true, description: 'Filter by custom role IDs' })
  @IsOptional()
  @IsArray()
  customRoleIds?: string[]

  @Field(() => Boolean, { nullable: true, description: 'Filter by active status (last 30 days)' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean

  @Field(() => Date, { nullable: true, description: 'Joined after date' })
  @IsOptional()
  joinedAfter?: Date

  @Field(() => Date, { nullable: true, description: 'Joined before date' })
  @IsOptional()
  joinedBefore?: Date
}

@InputType({ description: 'Pagination input' })
export class PaginationInput {
  @Field(() => Int, { nullable: true, defaultValue: 0, description: 'Offset' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  offset?: number

  @Field(() => Int, { nullable: true, defaultValue: 50, description: 'Limit' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number
}

@InputType({ description: 'Bulk update member input' })
export class BulkUpdateMembersInput {
  @Field(() => [String], { description: 'Member IDs to update' })
  @IsArray()
  memberIds: string[]

  @Field(() => String, { nullable: true, description: 'Update position' })
  @IsOptional()
  @IsString()
  position?: string

  @Field(() => String, { nullable: true, description: 'Update salary type' })
  @IsOptional()
  @IsString()
  salaryType?: string

  @Field(() => Number, { nullable: true, description: 'Update salary amount' })
  @IsOptional()
  @IsNumber()
  salaryAmount?: number

  @Field(() => ID, { nullable: true, description: 'Assign custom role' })
  @IsOptional()
  @IsString()
  customRoleId?: string

  @Field(() => String, { nullable: true, description: 'Reason for bulk update' })
  @IsOptional()
  @IsString()
  reason?: string
}

@InputType({ description: 'Bulk remove members input' })
export class BulkRemoveMembersInput {
  @Field(() => [String], { description: 'Member IDs to remove' })
  @IsArray()
  memberIds: string[]

  @Field(() => String, { nullable: true, description: 'Reason for removal' })
  @IsOptional()
  @IsString()
  reason?: string
}

@InputType({ description: 'Transfer member to another team' })
export class TransferMemberInput {
  @Field(() => String, { description: 'Member ID to transfer' })
  @IsString()
  memberId: string

  @Field(() => String, { description: 'Target team ID' })
  @IsString()
  targetTeamId: string

  @Field(() => String, { nullable: true, description: 'New position in target team' })
  @IsOptional()
  @IsString()
  newPosition?: string

  @Field(() => String, { nullable: true, description: 'Transfer reason' })
  @IsOptional()
  @IsString()
  reason?: string
}
