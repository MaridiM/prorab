import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common'
import { PrismaService } from '../../../shared/services/prisma.service'
import {
  CustomRole,
  RoleAssignmentHistory,
  PermissionCategory,
  PermissionDefinition,
  RoleHierarchyNode,
  RoleStatistics,
  CreateCustomRoleInput,
  UpdateCustomRoleInput,
  AssignRoleInput,
  BulkAssignRoleInput,
} from '../models/admin-role-builder.model'
import {
  TeamPermissions,
  PERMISSION_CATEGORIES,
  PERMISSION_LABELS,
  getAllPermissions,
  mergePermissions,
} from '../../../shared/constants/team-permissions'

@Injectable()
export class AdminRoleBuilderService {
  constructor(private prisma: PrismaService) {}

  // ==================== ROLE CRUD ====================

  async getAllRoles(teamId: string): Promise<CustomRole[]> {
    const roles = await this.prisma.customRole.findMany({
      where: { teamId },
      include: {
        parentRole: true,
        childRoles: true,
        _count: {
          select: { teamMembers: true },
        },
      },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    })

    return roles.map((role) => this.mapRoleWithEffectivePermissions(role))
  }

  async getRoleById(roleId: string): Promise<CustomRole> {
    const role = await this.prisma.customRole.findUnique({
      where: { id: roleId },
      include: {
        parentRole: true,
        childRoles: true,
        _count: {
          select: { teamMembers: true },
        },
      },
    })

    if (!role) {
      throw new NotFoundException(`Role with ID ${roleId} not found`)
    }

    return this.mapRoleWithEffectivePermissions(role)
  }

  async createRole(input: CreateCustomRoleInput, userId: string): Promise<CustomRole> {
    // Check for duplicate name
    const existing = await this.prisma.customRole.findFirst({
      where: {
        teamId: input.teamId,
        name: input.name,
      },
    })

    if (existing) {
      throw new ConflictException(`Role with name "${input.name}" already exists in this team`)
    }

    // Validate parent role if provided
    let parentLevel = -1
    if (input.parentRoleId) {
      const parentRole = await this.prisma.customRole.findUnique({
        where: { id: input.parentRoleId },
      })

      if (!parentRole) {
        throw new NotFoundException(`Parent role with ID ${input.parentRoleId} not found`)
      }

      if (parentRole.teamId !== input.teamId) {
        throw new BadRequestException('Parent role must be from the same team')
      }

      parentLevel = parentRole.level
    }

    // Auto-calculate level if not provided
    const level = input.level !== undefined ? input.level : parentLevel + 1

    // Validate permissions
    const validPermissions = getAllPermissions()
    const invalidPerms = input.permissions.filter((p) => !validPermissions.includes(p as TeamPermissions))
    if (invalidPerms.length > 0) {
      throw new BadRequestException(`Invalid permissions: ${invalidPerms.join(', ')}`)
    }

    const role = await this.prisma.customRole.create({
      data: {
        teamId: input.teamId,
        name: input.name,
        description: input.description,
        color: input.color,
        permissions: input.permissions,
        parentRoleId: input.parentRoleId,
        level,
        sortOrder: input.sortOrder ?? 0,
        createdBy: userId,
      },
      include: {
        parentRole: true,
        childRoles: true,
        _count: {
          select: { teamMembers: true },
        },
      },
    })

    return this.mapRoleWithEffectivePermissions(role)
  }

  async updateRole(input: UpdateCustomRoleInput, userId: string): Promise<CustomRole> {
    const existingRole = await this.prisma.customRole.findUnique({
      where: { id: input.id },
    })

    if (!existingRole) {
      throw new NotFoundException(`Role with ID ${input.id} not found`)
    }

    if (existingRole.isBuiltIn) {
      throw new BadRequestException('Cannot modify built-in roles')
    }

    // Check for duplicate name if name is being changed
    if (input.name && input.name !== existingRole.name) {
      const duplicate = await this.prisma.customRole.findFirst({
        where: {
          teamId: existingRole.teamId,
          name: input.name,
          id: { not: input.id },
        },
      })

      if (duplicate) {
        throw new ConflictException(`Role with name "${input.name}" already exists in this team`)
      }
    }

    // Validate parent role if being changed
    if (input.parentRoleId !== undefined) {
      if (input.parentRoleId) {
        const parentRole = await this.prisma.customRole.findUnique({
          where: { id: input.parentRoleId },
        })

        if (!parentRole) {
          throw new NotFoundException(`Parent role with ID ${input.parentRoleId} not found`)
        }

        if (parentRole.teamId !== existingRole.teamId) {
          throw new BadRequestException('Parent role must be from the same team')
        }

        // Prevent circular inheritance
        if (input.parentRoleId === input.id) {
          throw new BadRequestException('A role cannot be its own parent')
        }

        // Check if the new parent is a descendant of this role
        const isDescendant = await this.isDescendantOf(input.parentRoleId, input.id)
        if (isDescendant) {
          throw new BadRequestException('Cannot set a child role as parent (circular inheritance)')
        }
      }
    }

    // Validate permissions if being changed
    if (input.permissions) {
      const validPermissions = getAllPermissions()
      const invalidPerms = input.permissions.filter((p) => !validPermissions.includes(p as TeamPermissions))
      if (invalidPerms.length > 0) {
        throw new BadRequestException(`Invalid permissions: ${invalidPerms.join(', ')}`)
      }
    }

    const role = await this.prisma.customRole.update({
      where: { id: input.id },
      data: {
        name: input.name,
        description: input.description,
        color: input.color,
        permissions: input.permissions,
        parentRoleId: input.parentRoleId,
        isActive: input.isActive,
        sortOrder: input.sortOrder,
        modifiedBy: userId,
      },
      include: {
        parentRole: true,
        childRoles: true,
        _count: {
          select: { teamMembers: true },
        },
      },
    })

    return this.mapRoleWithEffectivePermissions(role)
  }

  async deleteRole(roleId: string): Promise<boolean> {
    const role = await this.prisma.customRole.findUnique({
      where: { id: roleId },
      include: {
        _count: {
          select: { teamMembers: true },
        },
      },
    })

    if (!role) {
      throw new NotFoundException(`Role with ID ${roleId} not found`)
    }

    if (role.isBuiltIn) {
      throw new BadRequestException('Cannot delete built-in roles')
    }

    if (role._count.teamMembers > 0) {
      throw new BadRequestException(
        `Cannot delete role "${role.name}" because it is assigned to ${role._count.teamMembers} member(s)`,
      )
    }

    await this.prisma.customRole.delete({
      where: { id: roleId },
    })

    return true
  }

  // ==================== ROLE ASSIGNMENT ====================

  async assignRole(input: AssignRoleInput, userId: string): Promise<boolean> {
    const member = await this.prisma.teamMember.findUnique({
      where: { id: input.memberId },
      include: { customRole: true },
    })

    if (!member) {
      throw new NotFoundException(`Team member with ID ${input.memberId} not found`)
    }

    // Validate custom role if provided
    if (input.customRoleId) {
      const role = await this.prisma.customRole.findUnique({
        where: { id: input.customRoleId },
      })

      if (!role) {
        throw new NotFoundException(`Custom role with ID ${input.customRoleId} not found`)
      }

      if (role.teamId !== member.teamId) {
        throw new BadRequestException('Role must be from the same team as the member')
      }

      if (!role.isActive) {
        throw new BadRequestException('Cannot assign an inactive role')
      }
    }

    // Create history record
    await this.prisma.roleAssignmentHistory.create({
      data: {
        memberId: input.memberId,
        teamId: member.teamId,
        previousRole: member.customRole?.name || member.role,
        newRole: input.customRoleId || member.role,
        roleId: input.customRoleId,
        assignedBy: userId,
        reason: input.reason,
      },
    })

    // Update member
    await this.prisma.teamMember.update({
      where: { id: input.memberId },
      data: { customRoleId: input.customRoleId },
    })

    return true
  }

  async bulkAssignRole(input: BulkAssignRoleInput, userId: string): Promise<number> {
    // Validate all members exist and are from the same team
    const members = await this.prisma.teamMember.findMany({
      where: { id: { in: input.memberIds } },
      include: { customRole: true },
    })

    if (members.length !== input.memberIds.length) {
      throw new NotFoundException('Some team members not found')
    }

    const teamId = members[0]?.teamId
    if (!teamId || !members.every((m) => m.teamId === teamId)) {
      throw new BadRequestException('All members must be from the same team')
    }

    // Validate custom role if provided
    if (input.customRoleId) {
      const role = await this.prisma.customRole.findUnique({
        where: { id: input.customRoleId },
      })

      if (!role) {
        throw new NotFoundException(`Custom role with ID ${input.customRoleId} not found`)
      }

      if (role.teamId !== teamId) {
        throw new BadRequestException('Role must be from the same team as the members')
      }

      if (!role.isActive) {
        throw new BadRequestException('Cannot assign an inactive role')
      }
    }

    // Create history records for all members
    const historyRecords = members.map((member) => ({
      memberId: member.id,
      teamId: member.teamId,
      previousRole: member.customRole?.name || member.role,
      newRole: input.customRoleId || member.role,
      roleId: input.customRoleId,
      assignedBy: userId,
      reason: input.reason,
    }))

    await this.prisma.roleAssignmentHistory.createMany({
      data: historyRecords,
    })

    // Update all members
    await this.prisma.teamMember.updateMany({
      where: { id: { in: input.memberIds } },
      data: { customRoleId: input.customRoleId },
    })

    return members.length
  }

  // ==================== ROLE HIERARCHY ====================

  async getRoleHierarchy(teamId: string): Promise<RoleHierarchyNode[]> {
    const roles = await this.prisma.customRole.findMany({
      where: { teamId },
      include: {
        _count: {
          select: { teamMembers: true },
        },
      },
      orderBy: [{ level: 'asc' }, { sortOrder: 'asc' }],
    })

    // Build hierarchy tree (roles with no parent at root level)
    const roleMap = new Map<string, RoleHierarchyNode>()
    const rootRoles: RoleHierarchyNode[] = []

    // Create nodes
    for (const role of roles) {
      const node: RoleHierarchyNode = {
        id: role.id,
        name: role.name,
        color: role.color || undefined,
        level: role.level,
        memberCount: role._count.teamMembers,
        permissionCount: role.permissions.length,
        isBuiltIn: role.isBuiltIn,
        children: [],
      }
      roleMap.set(role.id, node)
    }

    // Build tree structure
    for (const role of roles) {
      const node = roleMap.get(role.id)!
      if (role.parentRoleId) {
        const parent = roleMap.get(role.parentRoleId)
        if (parent) {
          parent.children!.push(node)
        }
      } else {
        rootRoles.push(node)
      }
    }

    return rootRoles
  }

  // ==================== PERMISSIONS ====================

  async getPermissionCategories(): Promise<PermissionCategory[]> {
    const categories: PermissionCategory[] = []

    for (const [key, category] of Object.entries(PERMISSION_CATEGORIES)) {
      const permissions: PermissionDefinition[] = category.permissions.map((perm) => ({
        key: perm,
        name: PERMISSION_LABELS[perm].name,
        description: PERMISSION_LABELS[perm].description,
        category: key,
      }))

      categories.push({
        key,
        label: category.label,
        description: category.description,
        icon: category.icon,
        permissions,
      })
    }

    return categories
  }

  // ==================== ASSIGNMENT HISTORY ====================

  async getRoleAssignmentHistory(teamId: string, limit: number = 50): Promise<RoleAssignmentHistory[]> {
    const history = await this.prisma.roleAssignmentHistory.findMany({
      where: { teamId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    })

    return history.map((h) => ({
      id: h.id,
      memberId: h.memberId,
      teamId: h.teamId,
      previousRole: h.previousRole || undefined,
      newRole: h.newRole,
      roleId: h.roleId || undefined,
      assignedBy: h.assignedBy,
      reason: h.reason || undefined,
      createdAt: h.createdAt,
    }))
  }

  async getMemberRoleHistory(memberId: string, limit: number = 20): Promise<RoleAssignmentHistory[]> {
    const history = await this.prisma.roleAssignmentHistory.findMany({
      where: { memberId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    })

    return history.map((h) => ({
      id: h.id,
      memberId: h.memberId,
      teamId: h.teamId,
      previousRole: h.previousRole || undefined,
      newRole: h.newRole,
      roleId: h.roleId || undefined,
      assignedBy: h.assignedBy,
      reason: h.reason || undefined,
      createdAt: h.createdAt,
    }))
  }

  // ==================== STATISTICS ====================

  async getRoleStatistics(teamId: string): Promise<RoleStatistics> {
    const [roles, members, membersWithCustomRoles] = await Promise.all([
      this.prisma.customRole.findMany({
        where: { teamId },
        select: { isActive: true, isBuiltIn: true },
      }),
      this.prisma.teamMember.count({
        where: { teamId },
      }),
      this.prisma.teamMember.count({
        where: { teamId, customRoleId: { not: null } },
      }),
    ])

    const activeRoles = roles.filter((r) => r.isActive).length
    const builtInRoles = roles.filter((r) => r.isBuiltIn).length

    return {
      totalRoles: roles.length,
      activeRoles,
      inactiveRoles: roles.length - activeRoles,
      builtInRoles,
      totalMembers: members,
      membersWithCustomRoles,
      membersWithDefaultRoles: members - membersWithCustomRoles,
    }
  }

  // ==================== HELPER METHODS ====================

  private mapRoleWithEffectivePermissions(role: any): CustomRole {
    const effectivePermissions = this.calculateEffectivePermissions(role)

    return {
      id: role.id,
      teamId: role.teamId,
      name: role.name,
      description: role.description || undefined,
      color: role.color || undefined,
      permissions: role.permissions,
      parentRoleId: role.parentRoleId || undefined,
      level: role.level,
      isActive: role.isActive,
      isBuiltIn: role.isBuiltIn,
      sortOrder: role.sortOrder,
      createdBy: role.createdBy,
      modifiedBy: role.modifiedBy || undefined,
      createdAt: role.createdAt,
      updatedAt: role.updatedAt,
      parentRole: role.parentRole ? this.mapRoleWithEffectivePermissions(role.parentRole) : undefined,
      childRoles: role.childRoles?.map((c: any) => this.mapRoleWithEffectivePermissions(c)),
      memberCount: role._count?.teamMembers,
      effectivePermissions,
    }
  }

  private calculateEffectivePermissions(role: any): string[] {
    if (!role.parentRole) {
      return role.permissions
    }

    const parentPerms = this.calculateEffectivePermissions(role.parentRole)
    return mergePermissions(role.permissions, parentPerms)
  }

  private async isDescendantOf(potentialDescendantId: string, ancestorId: string): Promise<boolean> {
    const descendant = await this.prisma.customRole.findUnique({
      where: { id: potentialDescendantId },
      select: { parentRoleId: true },
    })

    if (!descendant || !descendant.parentRoleId) {
      return false
    }

    if (descendant.parentRoleId === ancestorId) {
      return true
    }

    return this.isDescendantOf(descendant.parentRoleId, ancestorId)
  }
}
