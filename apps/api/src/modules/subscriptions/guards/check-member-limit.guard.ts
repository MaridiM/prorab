import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { SubscriptionsService } from '../subscriptions.service';

/**
 * Guard to check if adding a team member will exceed team's member limit
 *
 * Usage:
 * @UseGuards(AuthGuard, CheckMemberLimitGuard)
 *
 * Applies to mutations that add team members:
 * - sendInviteByEmail
 * - joinTeamByInvite
 *
 * Throws ForbiddenException with limitType: 'members' if limit would be exceeded
 */
@Injectable()
export class CheckMemberLimitGuard implements CanActivate {
  constructor(
    private prisma: PrismaService,
    private subscriptionsService: SubscriptionsService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const ctx = GqlExecutionContext.create(context);
    const args = ctx.getArgs();

    // Try to get teamId from various sources
    let teamId = args.teamId || args.input?.teamId;

    // If not found, try to get it from invite code
    if (!teamId && args.code) {
      const inviteCode = await this.prisma.inviteCode.findUnique({
        where: { code: args.code },
        select: { teamId: true },
      });
      teamId = inviteCode?.teamId;
    }

    if (!teamId) {
      return true; // Skip check if teamId not found
    }

    // Get team's current member count
    const memberCount = await this.prisma.teamMember.count({
      where: { teamId },
    });

    // Get member limits from subscription
    const limits = await this.subscriptionsService['getEffectivePlanLimits'](teamId);

    // Check if adding one more member would exceed the limit
    if (memberCount + 1 > limits.maxMembers) {
      throw new ForbiddenException({
        message: 'Достигнут лимит участников команды. Улучшите план для добавления участников.',
        code: 'LIMIT_EXCEEDED',
        limitType: 'members',
        current: memberCount,
        limit: limits.maxMembers,
        required: 1,
      });
    }

    return true;
  }
}
