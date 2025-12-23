import { ObjectType, Field, ID, InputType, Int, registerEnumType } from '@nestjs/graphql'
import { IsString, IsOptional, IsNotEmpty, IsEnum, IsInt, Min, IsBoolean, IsUUID } from 'class-validator'
import { GraphQLJSON } from 'graphql-scalars'
import { PaginationInput } from '../dto/pagination.input'

// ==================== ENUMS ====================

export enum AuditCategory {
  MEMBER_MANAGEMENT = 'MEMBER_MANAGEMENT',
  PROJECT_MANAGEMENT = 'PROJECT_MANAGEMENT',
  FINANCIAL = 'FINANCIAL',
  SETTINGS = 'SETTINGS',
  PERMISSIONS = 'PERMISSIONS',
  DATA_ACCESS = 'DATA_ACCESS',
  AUTHENTICATION = 'AUTHENTICATION',
  INTEGRATIONS = 'INTEGRATIONS',
}

export enum DataExportType {
  TEAM_DATA = 'TEAM_DATA',
  USER_DATA = 'USER_DATA',
  GDPR_FULL = 'GDPR_FULL',
  AUDIT_LOGS = 'AUDIT_LOGS',
}

export enum ExportStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

export enum ExportFormat {
  JSON = 'JSON',
  CSV = 'CSV',
  PDF = 'PDF',
}

registerEnumType(AuditCategory, { name: 'AuditCategory' })
registerEnumType(DataExportType, { name: 'DataExportType' })
registerEnumType(ExportStatus, { name: 'ExportStatus' })
registerEnumType(ExportFormat, { name: 'ExportFormat' })

// ==================== OBJECT TYPES ====================

@ObjectType({ description: 'Team audit log entry' })
export class TeamAuditLog {
  @Field(() => ID)
  id: string

  @Field(() => String)
  teamId: string

  @Field(() => String, { nullable: true })
  userId?: string

  @Field(() => String)
  action: string

  @Field(() => AuditCategory)
  category: AuditCategory

  @Field(() => String)
  resource: string

  @Field(() => String, { nullable: true })
  resourceId?: string

  @Field(() => GraphQLJSON, { nullable: true })
  oldValue?: any

  @Field(() => GraphQLJSON, { nullable: true })
  newValue?: any

  @Field(() => String, { nullable: true })
  ipAddress?: string

  @Field(() => String, { nullable: true })
  userAgent?: string

  @Field(() => GraphQLJSON, { nullable: true })
  metadata?: any

  @Field(() => Date)
  createdAt: Date

  // Computed fields
  @Field(() => String, { nullable: true })
  userName?: string

  @Field(() => String, { nullable: true })
  teamName?: string
}

@ObjectType({ description: 'Data retention policy' })
export class DataRetentionPolicy {
  @Field(() => ID)
  id: string

  @Field(() => String, { nullable: true })
  teamId?: string

  @Field(() => String)
  resourceType: string

  @Field(() => Int)
  retentionDays: number

  @Field(() => Boolean)
  isActive: boolean

  @Field(() => Date)
  createdAt: Date

  @Field(() => Date)
  updatedAt: Date

  // Computed fields
  @Field(() => String, { nullable: true })
  teamName?: string
}

@ObjectType({ description: 'Data export request' })
export class DataExportRequest {
  @Field(() => ID)
  id: string

  @Field(() => String, { nullable: true })
  teamId?: string

  @Field(() => String, { nullable: true })
  userId?: string

  @Field(() => String)
  requestedById: string

  @Field(() => DataExportType)
  type: DataExportType

  @Field(() => ExportStatus)
  status: ExportStatus

  @Field(() => ExportFormat)
  format: ExportFormat

  @Field(() => String, { nullable: true })
  fileUrl?: string

  @Field(() => Date, { nullable: true })
  expiresAt?: Date

  @Field(() => Date, { nullable: true })
  completedAt?: Date

  @Field(() => String, { nullable: true })
  errorMessage?: string

  @Field(() => Date)
  createdAt: Date

  // Computed fields
  @Field(() => String, { nullable: true })
  teamName?: string

  @Field(() => String, { nullable: true })
  userName?: string

  @Field(() => String, { nullable: true })
  requestedByName?: string
}

@ObjectType({ description: 'Audit statistics' })
export class AuditStatistics {
  @Field(() => Int)
  totalLogs: number

  @Field(() => Int)
  logsLast24h: number

  @Field(() => Int)
  logsLast7d: number

  @Field(() => Int)
  logsLast30d: number

  @Field(() => [CategoryCount])
  byCategory: CategoryCount[]

  @Field(() => [String])
  topActions: string[]

  @Field(() => Int)
  uniqueUsers: number
}

@ObjectType({ description: 'Count by category' })
export class CategoryCount {
  @Field(() => AuditCategory)
  category: AuditCategory

  @Field(() => Int)
  count: number
}

@ObjectType({ description: 'Audit logs connection with pagination' })
export class AuditLogsConnection {
  @Field(() => [TeamAuditLog])
  logs: TeamAuditLog[]

  @Field(() => Int)
  totalCount: number

  @Field(() => Boolean)
  hasMore: boolean
}

@ObjectType({ description: 'Compliance report' })
export class ComplianceReport {
  @Field(() => String)
  teamId: string

  @Field(() => String)
  teamName: string

  @Field(() => Int)
  totalAuditLogs: number

  @Field(() => Int)
  activePolicies: number

  @Field(() => Int)
  pendingExports: number

  @Field(() => Boolean)
  hasGDPRCompliance: boolean

  @Field(() => Boolean)
  hasDataRetention: boolean

  @Field(() => Date)
  lastAuditDate: Date

  @Field(() => Date)
  generatedAt: Date
}

// ==================== INPUT TYPES ====================

@InputType({ description: 'Filter for audit logs' })
export class AuditLogFilterInput {
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsUUID()
  teamId?: string

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsUUID()
  userId?: string

  @Field(() => AuditCategory, { nullable: true })
  @IsOptional()
  @IsEnum(AuditCategory)
  category?: AuditCategory

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  resource?: string

  @Field(() => Date, { nullable: true })
  @IsOptional()
  dateFrom?: Date

  @Field(() => Date, { nullable: true })
  @IsOptional()
  dateTo?: Date
}

@InputType({ description: 'Input for creating retention policy' })
export class CreateRetentionPolicyInput {
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsUUID()
  teamId?: string

  @Field(() => String)
  @IsNotEmpty()
  @IsString()
  resourceType: string

  @Field(() => Int)
  @IsInt()
  @Min(1)
  retentionDays: number

  @Field(() => Boolean, { nullable: true, defaultValue: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean
}

@InputType({ description: 'Input for updating retention policy' })
export class UpdateRetentionPolicyInput {
  @Field(() => ID)
  @IsNotEmpty()
  @IsUUID()
  id: string

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(1)
  retentionDays?: number

  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean
}

@InputType({ description: 'Input for creating data export request' })
export class CreateDataExportInput {
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsUUID()
  teamId?: string

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsUUID()
  userId?: string

  @Field(() => DataExportType)
  @IsNotEmpty()
  @IsEnum(DataExportType)
  type: DataExportType

  @Field(() => ExportFormat, { nullable: true, defaultValue: ExportFormat.JSON })
  @IsOptional()
  @IsEnum(ExportFormat)
  format?: ExportFormat
}

