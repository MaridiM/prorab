import { Module } from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { SubscriptionsResolver } from './subscriptions.resolver';
import { PrismaModule } from '../../core/prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { AdminPlansService } from '../admin/services/admin-plans.service';
import { AdminActionLogService } from '../admin/services/admin-action-log.service';

@Module({
  imports: [PrismaModule, AuthModule],
  providers: [
    SubscriptionsService,
    SubscriptionsResolver,
    AdminPlansService,
    AdminActionLogService, // Required by AdminPlansService
  ],
  exports: [SubscriptionsService],
})
export class SubscriptionsModule {}
