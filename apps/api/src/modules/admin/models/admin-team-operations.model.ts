import { ObjectType, Field, ID, InputType, Int } from '@nestjs/graphql'
import { IsString, IsBoolean, IsOptional, IsNotEmpty, MaxLength, IsArray, IsUUID } from 'class-validator'
import { GraphQLJSON } from 'graphql-scalars'

// ==================== OBJECT TYPES ====================

@ObjectType({ description: 'Team template for creating teams from predefined configurations' })
export class TeamTemplate {
  @Field(() => ID)
  id: string

  @Field(() => String)
  name: string

  @Field(() => String, { nullable: true })
  description?: string

  @Field(() => GraphQLJSON)
  settings: any

  @Field(() => GraphQLJSON)
  roles: any

  @Field(() => GraphQLJSON, { nullable: true })
  projectSetup?: any

  @Field(() => Boolean)
  isPublic: boolean

  @Field(() => String)
  createdById: string

  @Field(() => Date)
  createdAt: Date

  @Field(() => Date)
  updatedAt: Date

  // Computed field
  @Field(() => String, { nullable: true })
  createdByName?: string
}

@ObjectType({ description: 'Team merge operation log' })
export class TeamMergeLog {
  @Field(() => ID)
  id: string

  @Field(() => String)
  sourceTeamId: string

  @Field(() => String)
  targetTeamId: string

  @Field(() => String)
  mergedById: string

  @Field(() => Int)
  membersMoved: number

  @Field(() => Int)
  projectsMoved: number

  @Field(() => GraphQLJSON)
  dataSnapshot: any

  @Field(() => String, { nullable: true })
  notes?: string

  @Field(() => Date)
  createdAt: Date

  // Computed fields
  @Field(() => String, { nullable: true })
  sourceTeamName?: string

  @Field(() => String, { nullable: true })
  targetTeamName?: string

  @Field(() => String, { nullable: true })
  mergedByName?: string
}

@ObjectType({ description: 'Team clone operation log' })
export class TeamCloneLog {
  @Field(() => ID)
  id: string

  @Field(() => String)
  sourceTeamId: string

  @Field(() => String)
  clonedTeamId: string

  @Field(() => String)
  clonedById: string

  @Field(() => GraphQLJSON)
  clonedSettings: any

  @Field(() => Date)
  createdAt: Date

  // Computed fields
  @Field(() => String, { nullable: true })
  sourceTeamName?: string

  @Field(() => String, { nullable: true })
  clonedTeamName?: string

  @Field(() => String, { nullable: true })
  clonedByName?: string
}

@ObjectType({ description: 'Preview of team merge operation' })
export class MergePreview {
  @Field(() => String)
  sourceTeamId: string

  @Field(() => String)
  sourceTeamName: string

  @Field(() => String)
  targetTeamId: string

  @Field(() => String)
  targetTeamName: string

  @Field(() => Int)
  membersToMove: number

  @Field(() => Int)
  projectsToMove: number

  @Field(() => Int)
  conflictingMembers: number

  @Field(() => [String])
  warnings: string[]

  @Field(() => Boolean)
  canMerge: boolean
}

@ObjectType({ description: 'Result of merge operation' })
export class MergeResult {
  @Field(() => Boolean)
  success: boolean

  @Field(() => String)
  mergeLogId: string

  @Field(() => Int)
  membersMoved: number

  @Field(() => Int)
  projectsMoved: number

  @Field(() => [String], { nullable: true })
  errors?: string[]
}

@ObjectType({ description: 'Result of clone operation' })
export class CloneResult {
  @Field(() => Boolean)
  success: boolean

  @Field(() => String)
  clonedTeamId: string

  @Field(() => String)
  cloneLogId: string

  @Field(() => String, { nullable: true })
  error?: string
}

@ObjectType({ description: 'Team operations statistics' })
export class TeamOperationsStatistics {
  @Field(() => Int)
  totalTemplates: number

  @Field(() => Int)
  publicTemplates: number

  @Field(() => Int)
  totalMerges: number

  @Field(() => Int)
  totalClones: number

  @Field(() => Int)
  teamsCreatedFromTemplates: number
}

// ==================== INPUT TYPES ====================

@InputType({ description: 'Input for creating team template' })
export class CreateTeamTemplateInput {
  @Field(() => String)
  @IsNotEmpty()
  @MaxLength(100)
  name: string

  @Field(() => String, { nullable: true })
  @IsOptional()
  description?: string

  @Field(() => GraphQLJSON)
  @IsNotEmpty()
  settings: any

  @Field(() => GraphQLJSON)
  @IsNotEmpty()
  roles: any

  @Field(() => GraphQLJSON, { nullable: true })
  @IsOptional()
  projectSetup?: any

  @Field(() => Boolean, { nullable: true, defaultValue: false })
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean
}

@InputType({ description: 'Input for updating team template' })
export class UpdateTeamTemplateInput {
  @Field(() => ID)
  @IsNotEmpty()
  @IsUUID()
  id: string

  @Field(() => String, { nullable: true })
  @IsOptional()
  @MaxLength(100)
  name?: string

  @Field(() => String, { nullable: true })
  @IsOptional()
  description?: string

  @Field(() => GraphQLJSON, { nullable: true })
  @IsOptional()
  settings?: any

  @Field(() => GraphQLJSON, { nullable: true })
  @IsOptional()
  roles?: any

  @Field(() => GraphQLJSON, { nullable: true })
  @IsOptional()
  projectSetup?: any

  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean
}

@InputType({ description: 'Input for merging teams' })
export class MergeTeamsInput {
  @Field(() => String)
  @IsNotEmpty()
  @IsUUID()
  sourceTeamId: string

  @Field(() => String)
  @IsNotEmpty()
  @IsUUID()
  targetTeamId: string

  @Field(() => String, { nullable: true })
  @IsOptional()
  notes?: string

  @Field(() => Boolean, { nullable: true, defaultValue: false })
  @IsOptional()
  @IsBoolean()
  deleteSourceTeam?: boolean
}

@InputType({ description: 'Input for cloning team' })
export class CloneTeamInput {
  @Field(() => String)
  @IsNotEmpty()
  @IsUUID()
  sourceTeamId: string

  @Field(() => String)
  @IsNotEmpty()
  @MaxLength(100)
  newTeamName: string

  @Field(() => Boolean, { nullable: true, defaultValue: true })
  @IsOptional()
  @IsBoolean()
  cloneRoles?: boolean

  @Field(() => Boolean, { nullable: true, defaultValue: false })
  @IsOptional()
  @IsBoolean()
  cloneProjects?: boolean

  @Field(() => Boolean, { nullable: true, defaultValue: false })
  @IsOptional()
  @IsBoolean()
  cloneMembers?: boolean
}

@InputType({ description: 'Input for creating team from template' })
export class CreateTeamFromTemplateInput {
  @Field(() => String)
  @IsNotEmpty()
  @IsUUID()
  templateId: string

  @Field(() => String)
  @IsNotEmpty()
  @MaxLength(100)
  teamName: string

  @Field(() => String)
  @IsNotEmpty()
  @IsUUID()
  ownerId: string
}

@InputType({ description: 'Filter for team templates' })
export class TeamTemplateFilterInput {
  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  @IsBoolean()
  publicOnly?: boolean

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsUUID()
  createdById?: string
}
