import { Injectable, NotFoundException, BadRequestException, ConflictException, Logger } from '@nestjs/common'
import { PrismaService } from '../../../core/prisma/prisma.service'
import {
  TeamTemplate,
  TeamMergeLog,
  TeamCloneLog,
  MergePreview,
  MergeResult,
  CloneResult,
  TeamOperationsStatistics,
  CreateTeamTemplateInput,
  UpdateTeamTemplateInput,
  MergeTeamsInput,
  CloneTeamInput,
  CreateTeamFromTemplateInput,
  TeamTemplateFilterInput,
} from '../models/admin-team-operations.model'

@Injectable()
export class AdminTeamOperationsService {
  private readonly logger = new Logger(AdminTeamOperationsService.name)

  constructor(private prisma: PrismaService) {}

  // ==================== TEAM TEMPLATES ====================

  async getTeamTemplates(filter?: TeamTemplateFilterInput): Promise<TeamTemplate[]> {
    const where: any = {}

    if (filter) {
      if (filter.publicOnly) {
        where.isPublic = true
      }
      if (filter.createdById) {
        where.createdById = filter.createdById
      }
    }

    try {
      const templates = await this.prisma.teamTemplate.findMany({
        where,
        include: {
          createdBy: {
            select: { fullName: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      })

      return templates.map((t) => ({
        id: t.id,
        name: t.name,
        description: t.description,
        settings: t.settings,
        roles: t.roles,
        projectSetup: t.projectSetup,
        isPublic: t.isPublic,
        createdById: t.createdById,
        createdAt: t.createdAt,
        updatedAt: t.updatedAt,
        createdByName: t.createdBy.fullName,
      }))
    } catch (error: any) {
      // Table doesn't exist yet - return empty array
      if (error?.code === 'P2021' || error?.meta?.driverAdapterError?.kind === 'TableDoesNotExist') {
        this.logger.warn('TeamTemplate table does not exist, returning empty array')
        return []
      }
      throw error
    }
  }

  async getTeamTemplateById(id: string): Promise<TeamTemplate> {
    try {
      const template = await this.prisma.teamTemplate.findUnique({
        where: { id },
        include: {
          createdBy: {
            select: { fullName: true },
          },
        },
      })

      if (!template) {
        throw new NotFoundException(`Template with ID ${id} not found`)
      }

      return {
        id: template.id,
        name: template.name,
        description: template.description,
        settings: template.settings,
        roles: template.roles,
        projectSetup: template.projectSetup,
        isPublic: template.isPublic,
        createdById: template.createdById,
        createdAt: template.createdAt,
        updatedAt: template.updatedAt,
        createdByName: template.createdBy.fullName,
      }
    } catch (error: any) {
      // Table doesn't exist yet
      if (error?.code === 'P2021' || error?.meta?.driverAdapterError?.kind === 'TableDoesNotExist') {
        throw new NotFoundException(`Template with ID ${id} not found`)
      }
      throw error
    }
  }

  async createTeamTemplate(input: CreateTeamTemplateInput, userId: string): Promise<TeamTemplate> {
    const template = await this.prisma.teamTemplate.create({
      data: {
        name: input.name,
        description: input.description,
        settings: input.settings,
        roles: input.roles,
        projectSetup: input.projectSetup,
        isPublic: input.isPublic || false,
        createdById: userId,
      },
      include: {
        createdBy: {
          select: { fullName: true },
        },
      },
    })

    return {
      id: template.id,
      name: template.name,
      description: template.description,
      settings: template.settings,
      roles: template.roles,
      projectSetup: template.projectSetup,
      isPublic: template.isPublic,
      createdById: template.createdById,
      createdAt: template.createdAt,
      updatedAt: template.updatedAt,
      createdByName: template.createdBy.fullName,
    }
  }

  async updateTeamTemplate(input: UpdateTeamTemplateInput): Promise<TeamTemplate> {
    const existing = await this.prisma.teamTemplate.findUnique({
      where: { id: input.id },
    })

    if (!existing) {
      throw new NotFoundException(`Template with ID ${input.id} not found`)
    }

    const template = await this.prisma.teamTemplate.update({
      where: { id: input.id },
      data: {
        name: input.name,
        description: input.description,
        settings: input.settings,
        roles: input.roles,
        projectSetup: input.projectSetup,
        isPublic: input.isPublic,
      },
      include: {
        createdBy: {
          select: { fullName: true },
        },
      },
    })

    return {
      id: template.id,
      name: template.name,
      description: template.description,
      settings: template.settings,
      roles: template.roles,
      projectSetup: template.projectSetup,
      isPublic: template.isPublic,
      createdById: template.createdById,
      createdAt: template.createdAt,
      updatedAt: template.updatedAt,
      createdByName: template.createdBy.fullName,
    }
  }

  async deleteTeamTemplate(id: string): Promise<boolean> {
    const template = await this.prisma.teamTemplate.findUnique({
      where: { id },
    })

    if (!template) {
      throw new NotFoundException(`Template with ID ${id} not found`)
    }

    await this.prisma.teamTemplate.delete({
      where: { id },
    })

    return true
  }

  // ==================== TEAM MERGE ====================

  async getMergePreview(sourceTeamId: string, targetTeamId: string): Promise<MergePreview> {
    if (sourceTeamId === targetTeamId) {
      throw new BadRequestException('Cannot merge a team with itself')
    }

    const [sourceTeam, targetTeam] = await Promise.all([
      this.prisma.team.findUnique({
        where: { id: sourceTeamId },
        include: {
          _count: {
            select: { members: true, projects: true },
          },
        },
      }),
      this.prisma.team.findUnique({
        where: { id: targetTeamId },
        include: {
          members: {
            select: { userId: true },
          },
        },
      }),
    ])

    if (!sourceTeam) {
      throw new NotFoundException(`Source team ${sourceTeamId} not found`)
    }

    if (!targetTeam) {
      throw new NotFoundException(`Target team ${targetTeamId} not found`)
    }

    // Find members that exist in both teams
    const sourceMembers = await this.prisma.teamMember.findMany({
      where: { teamId: sourceTeamId },
      select: { userId: true },
    })

    const targetMemberUserIds = new Set(targetTeam.members.map((m) => m.userId))
    const conflictingMembers = sourceMembers.filter((m) => targetMemberUserIds.has(m.userId))

    const warnings: string[] = []

    if (conflictingMembers.length > 0) {
      warnings.push(`${conflictingMembers.length} участников уже есть в целевой команде`)
    }

    if (sourceTeam._count.projects > 50) {
      warnings.push('Большое количество проектов может замедлить слияние')
    }

    return {
      sourceTeamId,
      sourceTeamName: sourceTeam.name,
      targetTeamId,
      targetTeamName: targetTeam.name,
      membersToMove: sourceTeam._count.members - conflictingMembers.length,
      projectsToMove: sourceTeam._count.projects,
      conflictingMembers: conflictingMembers.length,
      warnings,
      canMerge: true,
    }
  }

  async mergeTeams(input: MergeTeamsInput, userId: string): Promise<MergeResult> {
    if (input.sourceTeamId === input.targetTeamId) {
      throw new BadRequestException('Cannot merge a team with itself')
    }

    const [sourceTeam, targetTeam] = await Promise.all([
      this.prisma.team.findUnique({
        where: { id: input.sourceTeamId },
        include: {
          members: true,
          projects: true,
        },
      }),
      this.prisma.team.findUnique({
        where: { id: input.targetTeamId },
        include: {
          members: {
            select: { userId: true },
          },
        },
      }),
    ])

    if (!sourceTeam) {
      throw new NotFoundException(`Source team ${input.sourceTeamId} not found`)
    }

    if (!targetTeam) {
      throw new NotFoundException(`Target team ${input.targetTeamId} not found`)
    }

    const targetMemberUserIds = new Set(targetTeam.members.map((m) => m.userId))
    const errors: string[] = []
    let membersMoved = 0
    let projectsMoved = 0

    // Create snapshot
    const dataSnapshot = {
      sourceTeam: {
        id: sourceTeam.id,
        name: sourceTeam.name,
        membersCount: sourceTeam.members.length,
        projectsCount: sourceTeam.projects.length,
      },
      targetTeam: {
        id: targetTeam.id,
        name: targetTeam.name,
      },
    }

    try {
      // Move members (skip if already exists in target)
      for (const member of sourceTeam.members) {
        if (!targetMemberUserIds.has(member.userId)) {
          await this.prisma.teamMember.update({
            where: { id: member.id },
            data: { teamId: input.targetTeamId },
          })
          membersMoved++
        }
      }

      // Move all projects
      await this.prisma.project.updateMany({
        where: { teamId: input.sourceTeamId },
        data: { teamId: input.targetTeamId },
      })
      projectsMoved = sourceTeam.projects.length

      // Create merge log
      const mergeLog = await this.prisma.teamMergeLog.create({
        data: {
          sourceTeamId: input.sourceTeamId,
          targetTeamId: input.targetTeamId,
          mergedById: userId,
          membersMoved,
          projectsMoved,
          dataSnapshot,
          notes: input.notes,
        },
      })

      // Delete source team if requested
      if (input.deleteSourceTeam) {
        await this.prisma.team.delete({
          where: { id: input.sourceTeamId },
        })
      }

      return {
        success: true,
        mergeLogId: mergeLog.id,
        membersMoved,
        projectsMoved,
        errors: errors.length > 0 ? errors : undefined,
      }
    } catch (error) {
      throw new BadRequestException(`Merge failed: ${error.message}`)
    }
  }

  // ==================== TEAM CLONE ====================

  async cloneTeam(input: CloneTeamInput, userId: string): Promise<CloneResult> {
    const sourceTeam = await this.prisma.team.findUnique({
      where: { id: input.sourceTeamId },
      include: {
        customRoles: input.cloneRoles,
        projects: input.cloneProjects
          ? {
              include: {
                expenses: true,
                payouts: true,
              },
            }
          : false,
        members: input.cloneMembers,
      },
    })

    if (!sourceTeam) {
      throw new NotFoundException(`Source team ${input.sourceTeamId} not found`)
    }

    try {
      // Create new team
      const clonedTeam = await this.prisma.team.create({
        data: {
          name: input.newTeamName,
          logoType: sourceTeam.logoType,
          logoUrl: sourceTeam.logoUrl,
          iconId: sourceTeam.iconId,
          colorId: sourceTeam.colorId,
          ownerId: userId,
        },
      })

      // Clone custom roles if requested
      if (input.cloneRoles && sourceTeam.customRoles) {
        for (const role of sourceTeam.customRoles) {
          await this.prisma.customRole.create({
            data: {
              team: { connect: { id: clonedTeam.id } },
              name: role.name,
              description: role.description,
              permissions: role.permissions,
              color: role.color,
              isBuiltIn: false,
              createdBy: userId,
            },
          })
        }
      }

      // Clone projects if requested (without members/expenses/payouts)
      if (input.cloneProjects && sourceTeam.projects) {
        for (const project of sourceTeam.projects) {
          await this.prisma.project.create({
            data: {
              teamId: clonedTeam.id,
              name: project.name,
              description: project.description,
              status: 'ACTIVE',
              startDate: new Date(),
              budget: project.budget,
              clientPhone: project.clientPhone,
              address: project.address,
              createdById: userId,
            },
          })
        }
      }

      // Create clone log
      const cloneLog = await this.prisma.teamCloneLog.create({
        data: {
          sourceTeamId: input.sourceTeamId,
          clonedTeamId: clonedTeam.id,
          clonedById: userId,
          clonedSettings: {
            cloneRoles: input.cloneRoles,
            cloneProjects: input.cloneProjects,
            cloneMembers: input.cloneMembers,
          },
        },
      })

      return {
        success: true,
        clonedTeamId: clonedTeam.id,
        cloneLogId: cloneLog.id,
      }
    } catch (error) {
      return {
        success: false,
        clonedTeamId: '',
        cloneLogId: '',
        error: error.message,
      }
    }
  }

  // ==================== CREATE FROM TEMPLATE ====================

  async createTeamFromTemplate(input: CreateTeamFromTemplateInput): Promise<CloneResult> {
    const template = await this.prisma.teamTemplate.findUnique({
      where: { id: input.templateId },
    })

    if (!template) {
      throw new NotFoundException(`Template ${input.templateId} not found`)
    }

    try {
      // Create team with template settings
      const team = await this.prisma.team.create({
        data: {
          name: input.teamName,
          ownerId: input.ownerId,
          ...(template.settings as any),
        },
      })

      // Create custom roles from template
      if (template.roles && Array.isArray((template.roles as any).roles)) {
        for (const roleData of (template.roles as any).roles) {
          await this.prisma.customRole.create({
            data: {
              team: { connect: { id: team.id } },
              name: roleData.name,
              description: roleData.description,
              permissions: roleData.permissions,
              color: roleData.color,
              isBuiltIn: false,
              createdBy: input.ownerId,
            },
          })
        }
      }

      return {
        success: true,
        clonedTeamId: team.id,
        cloneLogId: '',
      }
    } catch (error) {
      return {
        success: false,
        clonedTeamId: '',
        cloneLogId: '',
        error: error.message,
      }
    }
  }

  // ==================== LOGS ====================

  async getMergeLogs(): Promise<TeamMergeLog[]> {
    try {
      const logs = await this.prisma.teamMergeLog.findMany({
        orderBy: { createdAt: 'desc' },
        take: 100,
      })

      return logs.map((log) => ({
      id: log.id,
      sourceTeamId: log.sourceTeamId,
      targetTeamId: log.targetTeamId,
      mergedById: log.mergedById,
      membersMoved: log.membersMoved,
      projectsMoved: log.projectsMoved,
      dataSnapshot: log.dataSnapshot,
      notes: log.notes,
      createdAt: log.createdAt,
        sourceTeamName: (log.dataSnapshot as any)?.sourceTeam?.name,
        targetTeamName: (log.dataSnapshot as any)?.targetTeam?.name,
      }))
    } catch (error: any) {
      // Table doesn't exist yet - return empty array
      if (error?.code === 'P2021' || error?.meta?.driverAdapterError?.kind === 'TableDoesNotExist') {
        this.logger.warn('TeamMergeLog table does not exist, returning empty array')
        return []
      }
      throw error
    }
  }

  async getCloneLogs(): Promise<TeamCloneLog[]> {
    try {
      const logs = await this.prisma.teamCloneLog.findMany({
        orderBy: { createdAt: 'desc' },
        take: 100,
      })

      return logs.map((log) => ({
      id: log.id,
      sourceTeamId: log.sourceTeamId,
      clonedTeamId: log.clonedTeamId,
        clonedById: log.clonedById,
        clonedSettings: log.clonedSettings,
        createdAt: log.createdAt,
      }))
    } catch (error: any) {
      // Table doesn't exist yet - return empty array
      if (error?.code === 'P2021' || error?.meta?.driverAdapterError?.kind === 'TableDoesNotExist') {
        this.logger.warn('TeamCloneLog table does not exist, returning empty array')
        return []
      }
      throw error
    }
  }

  // ==================== STATISTICS ====================

  async getTeamOperationsStatistics(): Promise<TeamOperationsStatistics> {
    try {
      const [totalTemplates, publicTemplates, totalMerges, totalClones] = await Promise.all([
        this.prisma.teamTemplate.count(),
        this.prisma.teamTemplate.count({ where: { isPublic: true } }),
        this.prisma.teamMergeLog.count(),
        this.prisma.teamCloneLog.count(),
      ])

      return {
        totalTemplates,
        publicTemplates,
        totalMerges,
        totalClones,
        teamsCreatedFromTemplates: 0, // Would need additional tracking
      }
    } catch (error: any) {
      // Tables don't exist yet - return zeros
      if (error?.code === 'P2021' || error?.meta?.driverAdapterError?.kind === 'TableDoesNotExist') {
        this.logger.warn('Team operations tables do not exist, returning zero statistics')
        return {
          totalTemplates: 0,
          publicTemplates: 0,
          totalMerges: 0,
          totalClones: 0,
          teamsCreatedFromTemplates: 0,
        }
      }
      throw error
    }
  }
}
