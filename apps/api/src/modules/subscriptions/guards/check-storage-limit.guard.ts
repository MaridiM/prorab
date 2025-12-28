import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import type { FileUpload } from 'graphql-upload-minimal';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { SubscriptionsService } from '../subscriptions.service';

/**
 * Guard to check if file upload will exceed team's storage limit
 *
 * Usage:
 * @UseGuards(AuthGuard, CheckStorageLimitGuard)
 *
 * Applies to mutations that upload files:
 * - uploadAvatar
 * - uploadPhotoToReport
 * - uploadExpensePhoto
 *
 * Throws ForbiddenException with limitType: 'storage' if limit would be exceeded
 */
@Injectable()
export class CheckStorageLimitGuard implements CanActivate {
  // Estimated max file size before processing (10MB)
  // This is a conservative estimate since images are processed/compressed
  private readonly MAX_ESTIMATED_SIZE = 10 * 1024 * 1024;

  constructor(
    private prisma: PrismaService,
    private subscriptionsService: SubscriptionsService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const ctx = GqlExecutionContext.create(context);
    const args = ctx.getArgs();

    // Extract teamId from different input structures
    const teamId = await this.extractTeamId(args, ctx);

    if (!teamId) {
      // If we can't determine teamId, skip the check
      // (e.g., for uploadAvatar which doesn't belong to a team)
      return true;
    }

    // Get team's current storage usage
    const team = await this.prisma.team.findUnique({
      where: { id: teamId },
      select: { storageUsedBytes: true },
    });

    if (!team) {
      throw new BadRequestException('Team not found');
    }

    // Get storage limits from subscription
    const limits = await this.subscriptionsService['getEffectivePlanLimits'](teamId);
    const limitBytes = limits.storageGB * 1024 * 1024 * 1024;

    // Current usage in bytes
    const currentUsageBytes = Number(team.storageUsedBytes);

    // Estimate file size (we use conservative estimate since actual size is known after processing)
    // For better accuracy, we could stream the file first, but that adds complexity
    const estimatedFileSize = this.MAX_ESTIMATED_SIZE;

    // Check if adding this file would exceed the limit
    if (currentUsageBytes + estimatedFileSize > limitBytes) {
      const currentUsageGB = currentUsageBytes / (1024 * 1024 * 1024);
      const requiredGB = estimatedFileSize / (1024 * 1024 * 1024);

      throw new ForbiddenException({
        message: 'Превышен лимит хранилища. Улучшите план для загрузки файлов.',
        code: 'LIMIT_EXCEEDED',
        limitType: 'storage',
        current: currentUsageGB,
        limit: limits.storageGB,
        required: requiredGB,
      });
    }

    return true;
  }

  /**
   * Extract teamId from various argument structures
   */
  private async extractTeamId(
    args: any,
    ctx: GqlExecutionContext,
  ): Promise<string | null> {
    // Case 1: Direct in input (e.g., some mutations)
    if (args.input?.teamId) {
      return args.input.teamId;
    }

    // Case 2: From reportId (uploadPhotoToReport)
    if (args.input?.reportId) {
      const report = await this.prisma.photoReport.findUnique({
        where: { id: args.input.reportId },
        select: {
          project: {
            select: { teamId: true },
          },
        },
      });
      return report?.project.teamId || null;
    }

    // Case 3: From projectId (if directly provided)
    if (args.input?.projectId) {
      const project = await this.prisma.project.findUnique({
        where: { id: args.input.projectId },
        select: { teamId: true },
      });
      return project?.teamId || null;
    }

    // Case 4: From user's current team (uploadAvatar)
    // For user avatars, we don't enforce team storage limits
    // since they're personal. Return null to skip check.
    const request = ctx.getContext().req;
    const user = request?.user;

    if (user?.id && !args.input?.teamId && !args.input?.reportId && !args.input?.projectId) {
      // This is likely a personal file (avatar), skip team storage check
      return null;
    }

    return null;
  }
}
