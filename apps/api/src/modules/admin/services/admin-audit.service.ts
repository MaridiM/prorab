import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../../../core/prisma/prisma.service'
import {
  TeamAuditLog,
  DataRetentionPolicy,
  DataExportRequest,
  AuditStatistics,
  CategoryCount,
  AuditLogsConnection,
  ComplianceReport,
  AuditLogFilterInput,
  CreateRetentionPolicyInput,
  UpdateRetentionPolicyInput,
  CreateDataExportInput,
  AuditCategory,
} from '../models/admin-audit.model'
import { PaginationInput } from '../dto/pagination.input'

@Injectable()
export class AdminAuditService {
  constructor(private prisma: PrismaService) {}

  // ==================== AUDIT LOGS ====================

  async getAuditLogs(
    filter?: AuditLogFilterInput,
    pagination?: PaginationInput,
  ): Promise<AuditLogsConnection> {
    const where: any = {}

    if (filter) {
      if (filter.teamId) where.teamId = filter.teamId
      if (filter.userId) where.userId = filter.userId
      if (filter.category) where.category = filter.category
      if (filter.resource) where.resource = { contains: filter.resource, mode: 'insensitive' }
      if (filter.dateFrom || filter.dateTo) {
        where.createdAt = {}
        if (filter.dateFrom) where.createdAt.gte = filter.dateFrom
        if (filter.dateTo) where.createdAt.lte = filter.dateTo
      }
    }

    const limit = pagination?.limit || 50
    const page = pagination?.page || 1
    const offset = (page - 1) * limit

    const [logs, totalCount] = await Promise.all([
      this.prisma.teamAuditLog.findMany({
        where,
        include: {
          team: { select: { name: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      this.prisma.teamAuditLog.count({ where }),
    ])

    return {
      logs: logs.map((log) => ({
        id: log.id,
        teamId: log.teamId,
        userId: log.userId,
        action: log.action,
        category: log.category as AuditCategory,
        resource: log.resource,
        resourceId: log.resourceId,
        oldValue: log.oldValue,
        newValue: log.newValue,
        ipAddress: log.ipAddress,
        userAgent: log.userAgent,
        metadata: log.metadata,
        createdAt: log.createdAt,
        teamName: log.team.name,
      })),
      totalCount,
      hasMore: offset + limit < totalCount,
    }
  }

  async createAuditLog(data: {
    teamId: string
    userId?: string
    action: string
    category: AuditCategory
    resource: string
    resourceId?: string
    oldValue?: any
    newValue?: any
    ipAddress?: string
    userAgent?: string
    metadata?: any
  }): Promise<TeamAuditLog> {
    const log = await this.prisma.teamAuditLog.create({
      data: {
        teamId: data.teamId,
        userId: data.userId,
        action: data.action,
        category: data.category,
        resource: data.resource,
        resourceId: data.resourceId,
        oldValue: data.oldValue,
        newValue: data.newValue,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
        metadata: data.metadata,
      },
      include: {
        team: { select: { name: true } },
      },
    })

    return {
      id: log.id,
      teamId: log.teamId,
      userId: log.userId,
      action: log.action,
      category: log.category as AuditCategory,
      resource: log.resource,
      resourceId: log.resourceId,
      oldValue: log.oldValue,
      newValue: log.newValue,
      ipAddress: log.ipAddress,
      userAgent: log.userAgent,
      metadata: log.metadata,
      createdAt: log.createdAt,
      teamName: log.team.name,
    }
  }

  // ==================== STATISTICS ====================

  async getAuditStatistics(teamId?: string): Promise<AuditStatistics> {
    const where: any = teamId ? { teamId } : {}
    const now = new Date()
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    const last7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const last30d = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    const [totalLogs, logsLast24h, logsLast7d, logsLast30d, byCategory, uniqueUsers] =
      await Promise.all([
        this.prisma.teamAuditLog.count({ where }),
        this.prisma.teamAuditLog.count({ where: { ...where, createdAt: { gte: last24h } } }),
        this.prisma.teamAuditLog.count({ where: { ...where, createdAt: { gte: last7d } } }),
        this.prisma.teamAuditLog.count({ where: { ...where, createdAt: { gte: last30d } } }),
        this.prisma.teamAuditLog.groupBy({
          by: ['category'],
          where,
          _count: true,
        }),
        this.prisma.teamAuditLog.findMany({
          where: { ...where, userId: { not: null } },
          select: { userId: true },
          distinct: ['userId'],
        }),
      ])

    // Get top actions
    const actionGroups = await this.prisma.teamAuditLog.groupBy({
      by: ['action'],
      where,
      _count: true,
      orderBy: { _count: { action: 'desc' } },
      take: 10,
    })

    return {
      totalLogs,
      logsLast24h,
      logsLast7d,
      logsLast30d,
      byCategory: byCategory.map((item) => ({
        category: item.category as AuditCategory,
        count: item._count,
      })),
      topActions: actionGroups.map((item) => item.action),
      uniqueUsers: uniqueUsers.length,
    }
  }

  // ==================== RETENTION POLICIES ====================

  async getRetentionPolicies(teamId?: string): Promise<DataRetentionPolicy[]> {
    const where: any = teamId ? { teamId } : {}

    const policies = await this.prisma.dataRetentionPolicy.findMany({
      where,
      include: {
        team: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    return policies.map((policy) => ({
      id: policy.id,
      teamId: policy.teamId,
      resourceType: policy.resourceType,
      retentionDays: policy.retentionDays,
      isActive: policy.isActive,
      createdAt: policy.createdAt,
      updatedAt: policy.updatedAt,
      teamName: policy.team?.name,
    }))
  }

  async createRetentionPolicy(input: CreateRetentionPolicyInput): Promise<DataRetentionPolicy> {
    const policy = await this.prisma.dataRetentionPolicy.create({
      data: {
        teamId: input.teamId,
        resourceType: input.resourceType,
        retentionDays: input.retentionDays,
        isActive: input.isActive ?? true,
      },
      include: {
        team: { select: { name: true } },
      },
    })

    return {
      id: policy.id,
      teamId: policy.teamId,
      resourceType: policy.resourceType,
      retentionDays: policy.retentionDays,
      isActive: policy.isActive,
      createdAt: policy.createdAt,
      updatedAt: policy.updatedAt,
      teamName: policy.team?.name,
    }
  }

  async updateRetentionPolicy(input: UpdateRetentionPolicyInput): Promise<DataRetentionPolicy> {
    const policy = await this.prisma.dataRetentionPolicy.update({
      where: { id: input.id },
      data: {
        retentionDays: input.retentionDays,
        isActive: input.isActive,
      },
      include: {
        team: { select: { name: true } },
      },
    })

    return {
      id: policy.id,
      teamId: policy.teamId,
      resourceType: policy.resourceType,
      retentionDays: policy.retentionDays,
      isActive: policy.isActive,
      createdAt: policy.createdAt,
      updatedAt: policy.updatedAt,
      teamName: policy.team?.name,
    }
  }

  async deleteRetentionPolicy(id: string): Promise<boolean> {
    await this.prisma.dataRetentionPolicy.delete({ where: { id } })
    return true
  }

  // ==================== DATA EXPORTS ====================

  async getDataExportRequests(teamId?: string): Promise<DataExportRequest[]> {
    const where: any = teamId ? { teamId } : {}

    const requests = await this.prisma.dataExportRequest.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 100,
    })

    return requests.map((req) => ({
      id: req.id,
      teamId: req.teamId,
      userId: req.userId,
      requestedById: req.requestedById,
      type: req.type as any,
      status: req.status as any,
      format: req.format as any,
      fileUrl: req.fileUrl,
      expiresAt: req.expiresAt,
      completedAt: req.completedAt,
      errorMessage: req.errorMessage,
      createdAt: req.createdAt,
    }))
  }

  async createDataExportRequest(
    input: CreateDataExportInput,
    userId: string,
  ): Promise<DataExportRequest> {
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7) // Expires in 7 days

    const request = await this.prisma.dataExportRequest.create({
      data: {
        teamId: input.teamId,
        userId: input.userId,
        requestedById: userId,
        type: input.type,
        format: input.format || 'JSON',
        expiresAt,
      },
    })

    return {
      id: request.id,
      teamId: request.teamId,
      userId: request.userId,
      requestedById: request.requestedById,
      type: request.type as any,
      status: request.status as any,
      format: request.format as any,
      fileUrl: request.fileUrl,
      expiresAt: request.expiresAt,
      completedAt: request.completedAt,
      errorMessage: request.errorMessage,
      createdAt: request.createdAt,
    }
  }

  // ==================== COMPLIANCE REPORT ====================

  async getComplianceReport(teamId: string): Promise<ComplianceReport> {
    const team = await this.prisma.team.findUnique({
      where: { id: teamId },
      include: {
        _count: {
          select: {
            auditLogs: true,
            retentionPolicies: { where: { isActive: true } },
          },
        },
      },
    })

    if (!team) {
      throw new NotFoundException(`Team ${teamId} not found`)
    }

    const pendingExports = await this.prisma.dataExportRequest.count({
      where: { teamId, status: 'PENDING' },
    })

    const lastAudit = await this.prisma.teamAuditLog.findFirst({
      where: { teamId },
      orderBy: { createdAt: 'desc' },
    })

    return {
      teamId: team.id,
      teamName: team.name,
      totalAuditLogs: team._count.auditLogs,
      activePolicies: team._count.retentionPolicies,
      pendingExports,
      hasGDPRCompliance: team._count.retentionPolicies > 0,
      hasDataRetention: team._count.retentionPolicies > 0,
      lastAuditDate: lastAudit?.createdAt || team.createdAt,
      generatedAt: new Date(),
    }
  }
}
