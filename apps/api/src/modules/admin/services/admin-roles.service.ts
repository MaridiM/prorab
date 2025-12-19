import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { AdminActionLogService } from './admin-action-log.service';
import {
  AdminRoleDetail,
  AssignAdminRoleInput,
  UpdateAdminPermissionsInput,
  UpdateTwoFactorInput,
  UpdateIpWhitelistInput,
} from '../models/admin-role-detail.model';
import { AdminRoleType } from '../models/admin-role-type.enum';
import { AdminPermissions, RolePermissions } from '../../../shared/constants/admin-permissions';

@Injectable()
export class AdminRolesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly actionLogService: AdminActionLogService,
  ) {}

  /**
   * Get all admin roles with optional filtering
   */
  async findAll(
    role?: AdminRoleType,
    search?: string,
    limit: number = 50,
    offset: number = 0,
  ): Promise<AdminRoleDetail[]> {
    const where: any = {};

    if (role) {
      where.role = role;
    }

    if (search) {
      where.user = {
        OR: [
          { email: { contains: search, mode: 'insensitive' } },
          { username: { contains: search, mode: 'insensitive' } },
        ],
      };
    }

    const adminRoles = await this.prisma.adminRole.findMany({
      where,
      include: {
        user: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
      skip: offset,
    });

    return adminRoles as any;
  }

  /**
   * Get admin role by ID
   */
  async findById(id: string): Promise<AdminRoleDetail> {
    const adminRole = await this.prisma.adminRole.findUnique({
      where: { id },
      include: {
        user: true,
      },
    });

    if (!adminRole) {
      throw new NotFoundException(`Admin role with ID ${id} not found`);
    }

    return adminRole as any;
  }

  /**
   * Get admin role by user ID
   */
  async findByUserId(userId: string): Promise<AdminRoleDetail | null> {
    const adminRole = await this.prisma.adminRole.findUnique({
      where: { userId },
      include: {
        user: true,
      },
    });

    return adminRole as any;
  }

  /**
   * Assign admin role to a user
   */
  async assignRole(
    input: AssignAdminRoleInput,
    assignedBy: string,
  ): Promise<AdminRoleDetail> {
    const { userId, role, permissions, twoFactorEnforced, ipWhitelist } = input;

    // Check if user exists
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    // Check if user already has an admin role
    const existingRole = await this.prisma.adminRole.findUnique({
      where: { userId },
    });

    if (existingRole) {
      throw new BadRequestException(
        `User ${user.email} already has an admin role. Use update instead.`,
      );
    }

    // Get default permissions for the role if not provided
    const finalPermissions = permissions || this.getDefaultPermissionsForRole(role);

    // Validate permissions
    this.validatePermissions(finalPermissions);

    // Create admin role
    const adminRole = await this.prisma.adminRole.create({
      data: {
        userId,
        role,
        permissions: finalPermissions,
        twoFactorEnforced: twoFactorEnforced ?? false,
        ipWhitelist: ipWhitelist ?? [],
      },
      include: {
        user: true,
      },
    });

    // Log the action
    await this.actionLogService.logAction({
      adminUserId: assignedBy,
      action: 'ASSIGN_ADMIN_ROLE',
      resource: 'USER',
      resourceId: userId,
      details: {
        role,
        permissions: finalPermissions,
      },
    });

    return adminRole as any;
  }

  /**
   * Update admin permissions
   */
  async updatePermissions(
    input: UpdateAdminPermissionsInput,
    updatedBy: string,
  ): Promise<AdminRoleDetail> {
    const { roleId, permissions } = input;

    const adminRole = await this.findById(roleId);

    // Validate permissions
    this.validatePermissions(permissions);

    // Update permissions
    const updatedRole = await this.prisma.adminRole.update({
      where: { id: roleId },
      data: {
        permissions,
      },
      include: {
        user: true,
      },
    });

    // Log the action
    await this.actionLogService.logAction({
      adminUserId: updatedBy,
      action: 'UPDATE_ADMIN_PERMISSIONS',
      resource: 'ADMIN_ROLE',
      resourceId: roleId,
      details: {
        oldPermissions: adminRole.permissions,
        newPermissions: permissions,
      },
    });

    return updatedRole as any;
  }

  /**
   * Update two-factor enforcement
   */
  async updateTwoFactorEnforcement(
    input: UpdateTwoFactorInput,
    updatedBy: string,
  ): Promise<AdminRoleDetail> {
    const { roleId, enforced } = input;

    await this.findById(roleId);

    const updatedRole = await this.prisma.adminRole.update({
      where: { id: roleId },
      data: {
        twoFactorEnforced: enforced,
      },
      include: {
        user: true,
      },
    });

    // Log the action
    await this.actionLogService.logAction({
      adminUserId: updatedBy,
      action: 'UPDATE_2FA_ENFORCEMENT',
      resource: 'ADMIN_ROLE',
      resourceId: roleId,
      details: {
        enforced,
      },
    });

    return updatedRole as any;
  }

  /**
   * Update IP whitelist
   */
  async updateIpWhitelist(
    input: UpdateIpWhitelistInput,
    updatedBy: string,
  ): Promise<AdminRoleDetail> {
    const { roleId, ipAddresses } = input;

    await this.findById(roleId);

    // Validate IP addresses
    this.validateIpAddresses(ipAddresses);

    const updatedRole = await this.prisma.adminRole.update({
      where: { id: roleId },
      data: {
        ipWhitelist: ipAddresses,
      },
      include: {
        user: true,
      },
    });

    // Log the action
    await this.actionLogService.logAction({
      adminUserId: updatedBy,
      action: 'UPDATE_IP_WHITELIST',
      resource: 'ADMIN_ROLE',
      resourceId: roleId,
      details: {
        ipAddresses,
      },
    });

    return updatedRole as any;
  }

  /**
   * Revoke admin role
   */
  async revokeRole(roleId: string, revokedBy: string): Promise<boolean> {
    const adminRole = await this.findById(roleId);

    // Don't allow revoking the last SUPER_ADMIN
    if (adminRole.role === AdminRoleType.SUPER_ADMIN) {
      const superAdminCount = await this.prisma.adminRole.count({
        where: { role: AdminRoleType.SUPER_ADMIN },
      });

      if (superAdminCount <= 1) {
        throw new ForbiddenException(
          'Cannot revoke the last SUPER_ADMIN role. Assign another SUPER_ADMIN first.',
        );
      }
    }

    // Delete the admin role
    await this.prisma.adminRole.delete({
      where: { id: roleId },
    });

    // Log the action
    await this.actionLogService.logAction({
      adminUserId: revokedBy,
      action: 'REVOKE_ADMIN_ROLE',
      resource: 'USER',
      resourceId: adminRole.userId,
      details: {
        role: adminRole.role,
        permissions: adminRole.permissions,
      },
    });

    return true;
  }

  /**
   * Change admin role type
   */
  async changeRole(
    roleId: string,
    newRole: AdminRoleType,
    changedBy: string,
  ): Promise<AdminRoleDetail> {
    const adminRole = await this.findById(roleId);

    // Get default permissions for the new role
    const newPermissions = this.getDefaultPermissionsForRole(newRole);

    const updatedRole = await this.prisma.adminRole.update({
      where: { id: roleId },
      data: {
        role: newRole,
        permissions: newPermissions,
      },
      include: {
        user: true,
      },
    });

    // Log the action
    await this.actionLogService.logAction({
      adminUserId: changedBy,
      action: 'CHANGE_ADMIN_ROLE',
      resource: 'ADMIN_ROLE',
      resourceId: roleId,
      details: {
        oldRole: adminRole.role,
        newRole: newRole,
        oldPermissions: adminRole.permissions,
        newPermissions: newPermissions,
      },
    });

    return updatedRole as any;
  }

  /**
   * Get default permissions for a role
   */
  private getDefaultPermissionsForRole(role: AdminRoleType): string[] {
    switch (role) {
      case AdminRoleType.SUPER_ADMIN:
        return [...RolePermissions.SUPER_ADMIN];
      case AdminRoleType.ADMIN:
        return [...RolePermissions.ADMIN];
      case AdminRoleType.MODERATOR:
        return [...RolePermissions.MODERATOR];
      case AdminRoleType.SUPPORT:
        return [...RolePermissions.SUPPORT];
      default:
        return [];
    }
  }

  /**
   * Validate permissions array
   */
  private validatePermissions(permissions: string[]): void {
    const validPermissions = Object.values(AdminPermissions);

    for (const permission of permissions) {
      if (!validPermissions.includes(permission as any)) {
        throw new BadRequestException(
          `Invalid permission: ${permission}. Must be one of the defined admin permissions.`,
        );
      }
    }
  }

  /**
   * Validate IP addresses
   */
  private validateIpAddresses(ipAddresses: string[]): void {
    const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
    const ipv6Regex = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
    const cidrRegex = /^(\d{1,3}\.){3}\d{1,3}\/\d{1,2}$/;

    for (const ip of ipAddresses) {
      if (
        !ipv4Regex.test(ip) &&
        !ipv6Regex.test(ip) &&
        !cidrRegex.test(ip) &&
        ip !== '*'
      ) {
        throw new BadRequestException(
          `Invalid IP address: ${ip}. Must be a valid IPv4, IPv6, CIDR notation, or '*' for all IPs.`,
        );
      }
    }
  }

  /**
   * Check if admin has specific permission
   */
  async hasPermission(userId: string, permission: string): Promise<boolean> {
    const adminRole = await this.prisma.adminRole.findUnique({
      where: { userId },
      select: { permissions: true },
    });

    if (!adminRole) {
      return false;
    }

    return adminRole.permissions.includes(permission);
  }

  /**
   * Get admin role statistics
   */
  async getStatistics() {
    const [total, superAdmins, admins, moderators, support] = await Promise.all([
      this.prisma.adminRole.count(),
      this.prisma.adminRole.count({ where: { role: AdminRoleType.SUPER_ADMIN } }),
      this.prisma.adminRole.count({ where: { role: AdminRoleType.ADMIN } }),
      this.prisma.adminRole.count({ where: { role: AdminRoleType.MODERATOR } }),
      this.prisma.adminRole.count({ where: { role: AdminRoleType.SUPPORT } }),
    ]);

    return {
      total,
      byRole: {
        SUPER_ADMIN: superAdmins,
        ADMIN: admins,
        MODERATOR: moderators,
        SUPPORT: support,
      },
    };
  }
}
