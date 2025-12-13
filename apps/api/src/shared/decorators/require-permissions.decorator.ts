import { SetMetadata } from '@nestjs/common';
import { AdminPermission } from '../constants/admin-permissions';

export const PERMISSIONS_KEY = 'permissions';

/**
 * Decorator to require specific permissions for a route
 * Use with PermissionsGuard
 *
 * @example
 * @RequirePermissions(AdminPermissions.USERS_VIEW, AdminPermissions.USERS_UPDATE)
 * async updateUser() { ... }
 */
export const RequirePermissions = (...permissions: AdminPermission[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);
