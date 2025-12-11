import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { SubscriptionsService } from '../subscriptions.service';

@Injectable()
export class CheckMemberLimitGuard implements CanActivate {
  constructor(private subscriptionsService: SubscriptionsService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const ctx = GqlExecutionContext.create(context);
    const args = ctx.getArgs();
    const teamId = args.teamId || args.input?.teamId;

    if (!teamId) {
      return true; // Skip check if teamId not found
    }

    const canAdd = await this.subscriptionsService.checkMemberLimit(teamId);

    if (!canAdd) {
      throw new ForbiddenException(
        'Member limit reached. Upgrade your plan to add more team members.',
      );
    }

    return true;
  }
}
