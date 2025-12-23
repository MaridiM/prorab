import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common'
import { PrismaService } from '../../../core/prisma/prisma.service'
import {
  TeamMemberExtended,
  MemberActivityEvent,
  MemberActivityConnection,
  MemberActivityType,
  BulkOperationResult,
  MemberStatistics,
  MemberFilterInput,
  BulkUpdateMembersInput,
  BulkRemoveMembersInput,
  TransferMemberInput,
  MemberExportFormat,
} from '../models/admin-team-members.model'
import { PaginationInput } from '../dto/pagination.input'

@Injectable()
export class AdminTeamMembersService {
  constructor(private prisma: PrismaService) {}

  // ==================== MEMBER LISTING & FILTERING ====================

  async getTeamMembers(
    teamId: string,
    filter?: MemberFilterInput,
    pagination?: PaginationInput,
  ): Promise<TeamMemberExtended[]> {
    const where: any = { teamId }

    // Apply filters
    if (filter) {
      if (filter.search) {
        where.OR = [
          { user: { fullName: { contains: filter.search, mode: 'insensitive' } } },
          { user: { email: { contains: filter.search, mode: 'insensitive' } } },
          { position: { contains: filter.search, mode: 'insensitive' } },
        ]
      }

      if (filter.roles && filter.roles.length > 0) {
        where.role = { in: filter.roles }
      }

      if (filter.positions && filter.positions.length > 0) {
        where.position = { in: filter.positions }
      }

      if (filter.salaryTypes && filter.salaryTypes.length > 0) {
        where.salaryType = { in: filter.salaryTypes }
      }

      if (filter.customRoleIds && filter.customRoleIds.length > 0) {
        where.customRoleId = { in: filter.customRoleIds }
      }

      if (filter.joinedAfter) {
        where.joinedAt = { ...where.joinedAt, gte: filter.joinedAfter }
      }

      if (filter.joinedBefore) {
        where.joinedAt = { ...where.joinedAt, lte: filter.joinedBefore }
      }
    }

    const members = await this.prisma.teamMember.findMany({
      where,
      include: {
        user: {
          select: {
            fullName: true,
            email: true,
            avatarUrl: true,
            phone: true,
          },
        },
        customRole: {
          select: {
            name: true,
            color: true,
          },
        },
        workLogs: {
          select: {
            hours: true,
          },
        },
        _count: {
          select: {
            assignedTasks: true,
            payouts: true,
          },
        },
      },
      skip: pagination ? (pagination.page - 1) * (pagination.limit || 50) : 0,
      take: pagination?.limit || 50,
      orderBy: { joinedAt: 'desc' },
    })

    // Get additional stats for each member
    const membersWithStats = await Promise.all(
      members.map(async (member) => {
        const [projectsCount, expenses, lastWorkLog] = await Promise.all([
          this.prisma.workLog
            .findMany({
              where: { memberId: member.id },
              distinct: ['projectId'],
            })
            .then((logs) => logs.length),
          this.prisma.expense
            .aggregate({
              where: { createdById: member.userId },
              _sum: { amount: true },
            })
            .then((result) => Number(result._sum.amount || 0)),
          this.prisma.workLog.findFirst({
            where: { memberId: member.id },
            orderBy: { createdAt: 'desc' },
            select: { createdAt: true },
          }),
        ])

        const hoursLogged = member.workLogs.reduce((sum, log) => sum + Number(log.hours), 0)

        return {
          id: member.id,
          teamId: member.teamId,
          userId: member.userId,
          role: member.role,
          position: member.position || undefined,
          joinedAt: member.joinedAt,
          salaryType: member.salaryType,
          salaryAmount: member.salaryAmount ? Number(member.salaryAmount) : undefined,
          customRoleId: member.customRoleId || undefined,
          userName: member.user.fullName,
          email: member.user.email,
          avatarUrl: member.user.avatarUrl || undefined,
          phone: member.user.phone || undefined,
          customRoleName: member.customRole?.name || undefined,
          customRoleColor: member.customRole?.color || undefined,
          projectsCount,
          hoursLogged,
          totalExpenses: expenses,
          tasksCount: member._count.assignedTasks,
          totalPayouts: member._count.payouts,
          lastActiveAt: lastWorkLog?.createdAt || undefined,
        }
      }),
    )

    // Apply active filter if specified
    if (filter?.isActive !== undefined) {
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

      return membersWithStats.filter((m) => {
        const isActive = m.lastActiveAt && m.lastActiveAt > thirtyDaysAgo
        return filter.isActive ? isActive : !isActive
      })
    }

    return membersWithStats
  }

  async getMemberById(memberId: string): Promise<TeamMemberExtended> {
    const members = await this.getTeamMembers('', undefined, undefined)
    const member = members.find((m) => m.id === memberId)

    if (!member) {
      throw new NotFoundException(`Member with ID ${memberId} not found`)
    }

    return member
  }

  // ==================== BULK OPERATIONS ====================

  async bulkUpdateMembers(input: BulkUpdateMembersInput, userId: string): Promise<BulkOperationResult> {
    const results: BulkOperationResult = {
      successCount: 0,
      failedCount: 0,
      errors: [],
      successIds: [],
      failedIds: [],
    }

    for (const memberId of input.memberIds) {
      try {
        const member = await this.prisma.teamMember.findUnique({
          where: { id: memberId },
          include: { user: true },
        })

        if (!member) {
          throw new Error(`Member ${memberId} not found`)
        }

        const updateData: any = {}

        if (input.position !== undefined) {
          updateData.position = input.position
        }

        if (input.salaryType !== undefined) {
          updateData.salaryType = input.salaryType
          updateData.salaryAmount = input.salaryAmount
        }

        if (input.customRoleId !== undefined) {
          updateData.customRoleId = input.customRoleId
        }

        await this.prisma.teamMember.update({
          where: { id: memberId },
          data: updateData,
        })

        // Log salary change if applicable
        if (input.salaryType !== undefined && input.salaryType !== member.salaryType) {
          await this.prisma.teamMemberSalaryHistory.create({
            data: {
              memberId,
              previousType: member.salaryType,
              previousAmount: member.salaryAmount,
              newType: input.salaryType,
              newAmount: input.salaryAmount,
              changedByUserId: userId,
              reason: input.reason,
            },
          })
        }

        results.successCount++
        results.successIds!.push(memberId)
      } catch (error) {
        results.failedCount++
        results.failedIds!.push(memberId)
        results.errors!.push(`${memberId}: ${error.message}`)
      }
    }

    return results
  }

  async bulkRemoveMembers(input: BulkRemoveMembersInput): Promise<BulkOperationResult> {
    const results: BulkOperationResult = {
      successCount: 0,
      failedCount: 0,
      errors: [],
      successIds: [],
      failedIds: [],
    }

    for (const memberId of input.memberIds) {
      try {
        const member = await this.prisma.teamMember.findUnique({
          where: { id: memberId },
        })

        if (!member) {
          throw new Error(`Member ${memberId} not found`)
        }

        if (member.role === 'OWNER') {
          throw new Error('Cannot remove team owner')
        }

        await this.prisma.teamMember.delete({
          where: { id: memberId },
        })

        results.successCount++
        results.successIds!.push(memberId)
      } catch (error) {
        results.failedCount++
        results.failedIds!.push(memberId)
        results.errors!.push(`${memberId}: ${error.message}`)
      }
    }

    return results
  }

  async transferMember(input: TransferMemberInput, userId: string): Promise<TeamMemberExtended> {
    const member = await this.prisma.teamMember.findUnique({
      where: { id: input.memberId },
      include: { user: true, team: true },
    })

    if (!member) {
      throw new NotFoundException(`Member with ID ${input.memberId} not found`)
    }

    if (member.role === 'OWNER') {
      throw new BadRequestException('Cannot transfer team owner')
    }

    const targetTeam = await this.prisma.team.findUnique({
      where: { id: input.targetTeamId },
    })

    if (!targetTeam) {
      throw new NotFoundException(`Target team with ID ${input.targetTeamId} not found`)
    }

    // Check if user is already member of target team
    const existing = await this.prisma.teamMember.findUnique({
      where: {
        teamId_userId: {
          teamId: input.targetTeamId,
          userId: member.userId,
        },
      },
    })

    if (existing) {
      throw new ConflictException('User is already a member of the target team')
    }

    // Remove from current team
    await this.prisma.teamMember.delete({
      where: { id: input.memberId },
    })

    // Add to target team
    const newMember = await this.prisma.teamMember.create({
      data: {
        teamId: input.targetTeamId,
        userId: member.userId,
        role: 'MEMBER',
        position: input.newPosition || member.position,
        salaryType: 'none',
        salaryAmount: null,
      },
    })

    return this.getMemberById(newMember.id)
  }

  // ==================== ACTIVITY HISTORY ====================

  async getMemberActivityHistory(
    memberId: string,
    pagination?: PaginationInput,
  ): Promise<MemberActivityConnection> {
    const member = await this.prisma.teamMember.findUnique({
      where: { id: memberId },
      include: { user: true },
    })

    if (!member) {
      throw new NotFoundException(`Member with ID ${memberId} not found`)
    }

    const events: MemberActivityEvent[] = []

    // Joined event
    events.push({
      id: `joined_${member.id}`,
      type: MemberActivityType.JOINED,
      description: 'Присоединился к команде',
      metadata: JSON.stringify({ role: member.role }),
      relatedId: member.teamId,
      relatedType: 'team',
      createdAt: member.joinedAt,
      triggeredBy: undefined,
      triggeredByName: undefined,
    })

    // Role assignment history
    const roleHistory = await this.prisma.roleAssignmentHistory.findMany({
      where: { memberId },
      orderBy: { createdAt: 'desc' },
    })

    for (const history of roleHistory) {
      events.push({
        id: history.id,
        type: MemberActivityType.ROLE_CHANGED,
        description: `Роль изменена: ${history.previousRole || 'нет'} → ${history.newRole}`,
        metadata: JSON.stringify({
          previous: history.previousRole,
          new: history.newRole,
          reason: history.reason,
        }),
        relatedId: history.roleId || undefined,
        relatedType: 'role',
        createdAt: history.createdAt,
        triggeredBy: history.assignedBy,
        triggeredByName: undefined,
      })
    }

    // Salary history
    const salaryHistory = await this.prisma.teamMemberSalaryHistory.findMany({
      where: { memberId },
      include: { changedBy: { select: { fullName: true } } },
      orderBy: { createdAt: 'desc' },
    })

    for (const history of salaryHistory) {
      events.push({
        id: history.id,
        type: MemberActivityType.SALARY_CHANGED,
        description: `Зарплата изменена: ${history.previousType || 'нет'} → ${history.newType}`,
        metadata: JSON.stringify({
          previousType: history.previousType,
          previousAmount: history.previousAmount ? Number(history.previousAmount) : null,
          newType: history.newType,
          newAmount: history.newAmount ? Number(history.newAmount) : null,
          reason: history.reason,
        }),
        relatedId: undefined,
        relatedType: 'salary',
        createdAt: history.createdAt,
        triggeredBy: history.changedByUserId,
        triggeredByName: history.changedBy.fullName,
      })
    }

    // Work logs (sample recent ones)
    const recentWorkLogs = await this.prisma.workLog.findMany({
      where: { memberId },
      orderBy: { createdAt: 'desc' },
      take: 20,
      include: { project: { select: { name: true } } },
    })

    for (const log of recentWorkLogs) {
      events.push({
        id: log.id,
        type: MemberActivityType.WORKLOG_ADDED,
        description: `Добавлен учёт времени: ${Number(log.hours)} ч. на проекте "${log.project.name}"`,
        metadata: JSON.stringify({
          hours: Number(log.hours),
          projectId: log.projectId,
          projectName: log.project.name,
          description: log.description,
        }),
        relatedId: log.projectId,
        relatedType: 'project',
        createdAt: log.createdAt,
        triggeredBy: log.createdById,
        triggeredByName: undefined,
      })
    }

    // Sort all events by date
    events.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())

    const page = pagination?.page || 1
    const limit = pagination?.limit || 50
    const offset = (page - 1) * limit

    return {
      events: events.slice(offset, offset + limit),
      totalCount: events.length,
      hasMore: offset + limit < events.length,
    }
  }

  // ==================== STATISTICS ====================

  async getMemberStatistics(teamId: string): Promise<MemberStatistics> {
    const members = await this.getTeamMembers(teamId)

    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const activeMembers = members.filter((m) => m.lastActiveAt && m.lastActiveAt > thirtyDaysAgo).length

    const withCustomRoles = members.filter((m) => m.customRoleId).length
    const withFixedSalary = members.filter((m) => m.salaryType === 'fixed').length
    const withPercentageSalary = members.filter((m) => m.salaryType === 'percentage').length
    const withNoSalary = members.filter((m) => m.salaryType === 'none').length

    const totalHours = members.reduce((sum, m) => sum + m.hoursLogged, 0)
    const averageHours = members.length > 0 ? totalHours / members.length : 0

    const totalPayroll = members
      .filter((m) => m.salaryType === 'fixed' && m.salaryAmount)
      .reduce((sum, m) => sum + (m.salaryAmount || 0), 0)

    return {
      totalMembers: members.length,
      activeMembers,
      inactiveMembers: members.length - activeMembers,
      withCustomRoles,
      withFixedSalary,
      withPercentageSalary,
      withNoSalary,
      averageHours,
      totalPayroll,
    }
  }

  // ==================== EXPORT ====================

  async exportMembers(teamId: string, format: MemberExportFormat): Promise<string> {
    const members = await this.getTeamMembers(teamId)

    switch (format) {
      case MemberExportFormat.CSV:
        return this.generateCSV(members)
      case MemberExportFormat.JSON:
        return JSON.stringify(members, null, 2)
      case MemberExportFormat.XLSX:
        // For now, return CSV format (XLSX would require additional library)
        return this.generateCSV(members)
      default:
        throw new BadRequestException(`Unsupported export format: ${format}`)
    }
  }

  private generateCSV(members: TeamMemberExtended[]): string {
    const headers = [
      'ID',
      'Name',
      'Email',
      'Phone',
      'Role',
      'Position',
      'Salary Type',
      'Salary Amount',
      'Custom Role',
      'Projects',
      'Hours',
      'Expenses',
      'Tasks',
      'Payouts',
      'Joined',
      'Last Active',
    ]

    const rows = members.map((m) => [
      m.id,
      m.userName,
      m.email,
      m.phone || '',
      m.role,
      m.position || '',
      m.salaryType,
      m.salaryAmount || '',
      m.customRoleName || '',
      m.projectsCount,
      m.hoursLogged,
      m.totalExpenses,
      m.tasksCount,
      m.totalPayouts,
      m.joinedAt.toISOString(),
      m.lastActiveAt?.toISOString() || '',
    ])

    return [headers.join(','), ...rows.map((row) => row.join(','))].join('\n')
  }
}
