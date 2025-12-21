import { ObjectType, Field, ID, Int, InputType } from '@nestjs/graphql'
import { IsString, IsOptional, IsBoolean, IsInt, IsArray, MaxLength, Min } from 'class-validator'

// ==================== OBJECT TYPES ====================

@ObjectType({ description: 'Custom team role with permissions' })
export class CustomRole {
  @Field(() => ID, { description: 'Role ID' })
  id: string

  @Field(() => String, { description: 'Team ID' })
  teamId: string

  @Field(() => String, { description: 'Role name (e.g., "Старший прораб", "Бухгалтер")' })
  name: string

  @Field(() => String, { nullable: true, description: 'Role description' })
  description?: string

  @Field(() => String, { nullable: true, description: 'Role color (hex)' })
  color?: string

  @Field(() => [String], { description: 'Array of permission keys' })
  permissions: string[]

  @Field(() => ID, { nullable: true, description: 'Parent role ID for inheritance' })
  parentRoleId?: string

  @Field(() => Int, { description: 'Role hierarchy level (0 = base)' })
  level: number

  @Field(() => Boolean, { description: 'Is role active' })
  isActive: boolean

  @Field(() => Boolean, { description: 'Is built-in system role (cannot be deleted)' })
  isBuiltIn: boolean

  @Field(() => Int, { description: 'Display sort order' })
  sortOrder: number

  @Field(() => String, { description: 'Creator user ID' })
  createdBy: string

  @Field(() => String, { nullable: true, description: 'Last modifier user ID' })
  modifiedBy?: string

  @Field(() => Date, { description: 'Creation timestamp' })
  createdAt: Date

  @Field(() => Date, { description: 'Last update timestamp' })
  updatedAt: Date

  // Relations (populated separately)
  @Field(() => CustomRole, { nullable: true, description: 'Parent role' })
  parentRole?: CustomRole

  @Field(() => [CustomRole], { nullable: true, description: 'Child roles' })
  childRoles?: CustomRole[]

  @Field(() => Int, { nullable: true, description: 'Number of members with this role' })
  memberCount?: number

  @Field(() => [String], { nullable: true, description: 'Effective permissions (including inherited)' })
  effectivePermissions?: string[]
}

@ObjectType({ description: 'Role assignment history entry' })
export class RoleAssignmentHistory {
  @Field(() => ID, { description: 'History entry ID' })
  id: string

  @Field(() => String, { description: 'Team member ID' })
  memberId: string

  @Field(() => String, { description: 'Team ID' })
  teamId: string

  @Field(() => String, { nullable: true, description: 'Previous role name/ID' })
  previousRole?: string

  @Field(() => String, { description: 'New role name/ID' })
  newRole: string

  @Field(() => ID, { nullable: true, description: 'CustomRole ID if applicable' })
  roleId?: string

  @Field(() => String, { description: 'User ID who made the assignment' })
  assignedBy: string

  @Field(() => String, { nullable: true, description: 'Assignment reason' })
  reason?: string

  @Field(() => Date, { description: 'Assignment timestamp' })
  createdAt: Date
}

@ObjectType({ description: 'Permission category for UI grouping' })
export class PermissionCategory {
  @Field(() => String, { description: 'Category key' })
  key: string

  @Field(() => String, { description: 'Category label' })
  label: string

  @Field(() => String, { description: 'Category description' })
  description: string

  @Field(() => String, { description: 'Icon name' })
  icon: string

  @Field(() => [PermissionDefinition], { description: 'Permissions in this category' })
  permissions: PermissionDefinition[]
}

@ObjectType({ description: 'Permission definition with metadata' })
export class PermissionDefinition {
  @Field(() => String, { description: 'Permission key' })
  key: string

  @Field(() => String, { description: 'Permission name' })
  name: string

  @Field(() => String, { description: 'Permission description' })
  description: string

  @Field(() => String, { description: 'Category key' })
  category: string
}

@ObjectType({ description: 'Role hierarchy tree node' })
export class RoleHierarchyNode {
  @Field(() => ID, { description: 'Role ID' })
  id: string

  @Field(() => String, { description: 'Role name' })
  name: string

  @Field(() => String, { nullable: true, description: 'Role color' })
  color?: string

  @Field(() => Int, { description: 'Hierarchy level' })
  level: number

  @Field(() => Int, { description: 'Number of members' })
  memberCount: number

  @Field(() => Int, { description: 'Number of permissions' })
  permissionCount: number

  @Field(() => Boolean, { description: 'Is built-in role' })
  isBuiltIn: boolean

  @Field(() => [RoleHierarchyNode], { nullable: true, description: 'Child roles' })
  children?: RoleHierarchyNode[]
}

@ObjectType({ description: 'Role statistics' })
export class RoleStatistics {
  @Field(() => Int, { description: 'Total custom roles' })
  totalRoles: number

  @Field(() => Int, { description: 'Active roles' })
  activeRoles: number

  @Field(() => Int, { description: 'Inactive roles' })
  inactiveRoles: number

  @Field(() => Int, { description: 'Built-in roles' })
  builtInRoles: number

  @Field(() => Int, { description: 'Total team members' })
  totalMembers: number

  @Field(() => Int, { description: 'Members with custom roles' })
  membersWithCustomRoles: number

  @Field(() => Int, { description: 'Members with default roles' })
  membersWithDefaultRoles: number
}

// ==================== INPUT TYPES ====================

@InputType({ description: 'Input for creating a custom role' })
export class CreateCustomRoleInput {
  @Field(() => String, { description: 'Team ID' })
  @IsString()
  teamId: string

  @Field(() => String, { description: 'Role name' })
  @IsString()
  @MaxLength(100)
  name: string

  @Field(() => String, { nullable: true, description: 'Role description' })
  @IsOptional()
  @IsString()
  description?: string

  @Field(() => String, { nullable: true, description: 'Role color (hex)' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  color?: string

  @Field(() => [String], { description: 'Permission keys' })
  @IsArray()
  permissions: string[]

  @Field(() => ID, { nullable: true, description: 'Parent role ID for inheritance' })
  @IsOptional()
  @IsString()
  parentRoleId?: string

  @Field(() => Int, { nullable: true, description: 'Hierarchy level (auto-calculated if not provided)' })
  @IsOptional()
  @IsInt()
  @Min(0)
  level?: number

  @Field(() => Int, { nullable: true, description: 'Sort order' })
  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number
}

@InputType({ description: 'Input for updating a custom role' })
export class UpdateCustomRoleInput {
  @Field(() => ID, { description: 'Role ID' })
  @IsString()
  id: string

  @Field(() => String, { nullable: true, description: 'Role name' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string

  @Field(() => String, { nullable: true, description: 'Role description' })
  @IsOptional()
  @IsString()
  description?: string

  @Field(() => String, { nullable: true, description: 'Role color (hex)' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  color?: string

  @Field(() => [String], { nullable: true, description: 'Permission keys' })
  @IsOptional()
  @IsArray()
  permissions?: string[]

  @Field(() => ID, { nullable: true, description: 'Parent role ID for inheritance' })
  @IsOptional()
  @IsString()
  parentRoleId?: string

  @Field(() => Boolean, { nullable: true, description: 'Is role active' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean

  @Field(() => Int, { nullable: true, description: 'Sort order' })
  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number
}

@InputType({ description: 'Input for assigning a role to a member' })
export class AssignRoleInput {
  @Field(() => String, { description: 'Team member ID' })
  @IsString()
  memberId: string

  @Field(() => ID, { nullable: true, description: 'Custom role ID (null to clear custom role)' })
  @IsOptional()
  @IsString()
  customRoleId?: string

  @Field(() => String, { nullable: true, description: 'Assignment reason' })
  @IsOptional()
  @IsString()
  reason?: string
}

@InputType({ description: 'Input for bulk role assignment' })
export class BulkAssignRoleInput {
  @Field(() => [String], { description: 'Team member IDs' })
  @IsArray()
  memberIds: string[]

  @Field(() => ID, { nullable: true, description: 'Custom role ID (null to clear custom roles)' })
  @IsOptional()
  @IsString()
  customRoleId?: string

  @Field(() => String, { nullable: true, description: 'Assignment reason' })
  @IsOptional()
  @IsString()
  reason?: string
}
