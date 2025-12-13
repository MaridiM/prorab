import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { PrismaService } from '../../core/prisma/prisma.service';

/**
 * AdminGuard - Ensures the user has an admin role
 * Use this guard to protect admin-only routes
 */
@Injectable()
export class AdminGuard implements CanActivate {
  private readonly logger = new Logger(AdminGuard.name);

  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const ctx = GqlExecutionContext.create(context);
    const { req } = ctx.getContext();
    const user = req.user;

    if (!user) {
      throw new ForbiddenException('Authentication required');
    }

    // Check if user has an admin role
    const adminRole = await this.prisma.adminRole.findUnique({
      where: { userId: user.id },
    });

    if (!adminRole) {
      this.logger.warn(`Non-admin user ${user.id} attempted to access admin route`);
      throw new ForbiddenException('Admin access required');
    }

    // Check if 2FA is enforced and enabled
    if (adminRole.twoFactorEnforced && !user.twoFactorEnabled) {
      throw new ForbiddenException('Two-factor authentication is required for admin access');
    }

    // Check IP whitelist if configured
    if (adminRole.ipWhitelist.length > 0) {
      const clientIp = this.getClientIp(req);

      if (!adminRole.ipWhitelist.includes(clientIp)) {
        this.logger.warn(
          `Admin user ${user.id} attempted access from unauthorized IP: ${clientIp}`
        );
        throw new ForbiddenException('Access denied from this IP address');
      }
    }

    // Attach admin role to request for use in resolvers
    req.adminRole = adminRole;

    return true;
  }

  private getClientIp(req: any): string {
    return (
      req.headers['x-forwarded-for']?.split(',')[0] ||
      req.headers['x-real-ip'] ||
      req.connection.remoteAddress ||
      req.socket.remoteAddress ||
      ''
    );
  }
}
