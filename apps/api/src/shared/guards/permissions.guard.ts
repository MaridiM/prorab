import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { PERMISSIONS_KEY } from '../decorators/require-permissions.decorator';
import { AdminPermission, hasAllPermissions } from '../constants/admin-permissions';

/**
 * PermissionsGuard - Checks if user has required permissions
 * Use with @RequirePermissions decorator
 * Requires AdminGuard to be applied first
 */
@Injectable()
export class PermissionsGuard implements CanActivate {
  private readonly logger = new Logger(PermissionsGuard.name);

  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<AdminPermission[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()]
    );

    if (!requiredPermissions || requiredPermissions.length === 0) {
      // No permissions required
      return true;
    }

    const ctx = GqlExecutionContext.create(context);
    const { req } = ctx.getContext();
    const adminRole = req.adminRole;

    if (!adminRole) {
      throw new ForbiddenException('Admin role not found');
    }

    // Check if user has all required permissions
    if (!hasAllPermissions(adminRole.permissions, requiredPermissions)) {
      this.logger.warn(
        `Admin user ${req.user.id} (role: ${adminRole.role}) lacks required permissions: ${requiredPermissions.join(', ')}`
      );
      throw new ForbiddenException('Insufficient permissions');
    }

    return true;
  }
}
