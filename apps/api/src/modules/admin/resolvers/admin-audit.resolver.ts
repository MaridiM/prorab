import { Resolver, Query, Mutation, Args } from '@nestjs/graphql'
import { UseGuards } from '@nestjs/common'
import { AuthGuard } from '../../../shared/guards/auth.guard'
import { AdminGuard } from '../../../shared/guards/admin.guard'
import { PermissionsGuard } from '../../../shared/guards/permissions.guard'
import { RequirePermissions } from '../../../shared/decorators/permissions.decorator'
import { CurrentUser } from '../../../shared/decorators/current-user.decorator'
import { AdminPermissions } from '../models/admin.model'
import { AdminAuditService } from '../services/admin-audit.service'
import {
  TeamAuditLog,
  DataRetentionPolicy,
  DataExportRequest,
  AuditStatistics,
  AuditLogsConnection,
  ComplianceReport,
  AuditLogFilterInput,
  CreateRetentionPolicyInput,
  UpdateRetentionPolicyInput,
  CreateDataExportInput,
  PaginationInput,
} from '../models/admin-audit.model'

@Resolver()
@UseGuards(AuthGuard, AdminGuard, PermissionsGuard)
export class AdminAuditResolver {
  constructor(private readonly auditService: AdminAuditService) {}

  // ==================== AUDIT LOGS ====================

  @Query(() => AuditLogsConnection, { name: 'adminGetAuditLogs' })
  @RequirePermissions(AdminPermissions.SETTINGS_VIEW)
  async getAuditLogs(
    @Args('filter', { type: () => AuditLogFilterInput, nullable: true }) filter?: AuditLogFilterInput,
    @Args('pagination', { type: () => PaginationInput, nullable: true }) pagination?: PaginationInput,
  ): Promise<AuditLogsConnection> {
    return this.auditService.getAuditLogs(filter, pagination)
  }

  @Query(() => AuditStatistics, { name: 'adminGetAuditStatistics' })
  @RequirePermissions(AdminPermissions.SETTINGS_VIEW)
  async getAuditStatistics(
    @Args('teamId', { type: () => String, nullable: true }) teamId?: string,
  ): Promise<AuditStatistics> {
    return this.auditService.getAuditStatistics(teamId)
  }

  // ==================== RETENTION POLICIES ====================

  @Query(() => [DataRetentionPolicy], { name: 'adminGetRetentionPolicies' })
  @RequirePermissions(AdminPermissions.SETTINGS_VIEW)
  async getRetentionPolicies(
    @Args('teamId', { type: () => String, nullable: true }) teamId?: string,
  ): Promise<DataRetentionPolicy[]> {
    return this.auditService.getRetentionPolicies(teamId)
  }

  @Mutation(() => DataRetentionPolicy, { name: 'adminCreateRetentionPolicy' })
  @RequirePermissions(AdminPermissions.SETTINGS_MANAGE)
  async createRetentionPolicy(
    @Args('input') input: CreateRetentionPolicyInput,
  ): Promise<DataRetentionPolicy> {
    return this.auditService.createRetentionPolicy(input)
  }

  @Mutation(() => DataRetentionPolicy, { name: 'adminUpdateRetentionPolicy' })
  @RequirePermissions(AdminPermissions.SETTINGS_MANAGE)
  async updateRetentionPolicy(
    @Args('input') input: UpdateRetentionPolicyInput,
  ): Promise<DataRetentionPolicy> {
    return this.auditService.updateRetentionPolicy(input)
  }

  @Mutation(() => Boolean, { name: 'adminDeleteRetentionPolicy' })
  @RequirePermissions(AdminPermissions.SETTINGS_MANAGE)
  async deleteRetentionPolicy(
    @Args('id', { type: () => String }) id: string,
  ): Promise<boolean> {
    return this.auditService.deleteRetentionPolicy(id)
  }

  // ==================== DATA EXPORTS ====================

  @Query(() => [DataExportRequest], { name: 'adminGetDataExportRequests' })
  @RequirePermissions(AdminPermissions.SETTINGS_VIEW)
  async getDataExportRequests(
    @Args('teamId', { type: () => String, nullable: true }) teamId?: string,
  ): Promise<DataExportRequest[]> {
    return this.auditService.getDataExportRequests(teamId)
  }

  @Mutation(() => DataExportRequest, { name: 'adminCreateDataExportRequest' })
  @RequirePermissions(AdminPermissions.SETTINGS_MANAGE)
  async createDataExportRequest(
    @Args('input') input: CreateDataExportInput,
    @CurrentUser('id') userId: string,
  ): Promise<DataExportRequest> {
    return this.auditService.createDataExportRequest(input, userId)
  }

  // ==================== COMPLIANCE REPORT ====================

  @Query(() => ComplianceReport, { name: 'adminGetComplianceReport' })
  @RequirePermissions(AdminPermissions.SETTINGS_VIEW)
  async getComplianceReport(
    @Args('teamId', { type: () => String }) teamId: string,
  ): Promise<ComplianceReport> {
    return this.auditService.getComplianceReport(teamId)
  }
}
