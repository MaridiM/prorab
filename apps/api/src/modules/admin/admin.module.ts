import { Module } from '@nestjs/common';
import { PrismaService } from '../../core/prisma/prisma.service';
import { EncryptionService } from '../../shared/services/encryption.service';
import { AuthModule } from '../auth/auth.module';
import { StorageModule } from '../../core/storage/storage.module';
import { SystemSettingsService } from './services/system-settings.service';
import { AdminActionLogService } from './services/admin-action-log.service';
import { AdminStorageService } from './services/admin-storage.service';
import { AdminUsersService } from './services/admin-users.service';
import { AdminTeamsService } from './services/admin-teams.service';
import { AdminSubscriptionsService } from './services/admin-subscriptions.service';
import { AdminPaymentsService } from './services/admin-payments.service';
import { AdminAnalyticsService } from './services/admin-analytics.service';
import { AdminSettingsResolver } from './resolvers/admin-settings.resolver';
import { AdminLogsResolver } from './resolvers/admin-logs.resolver';
import { AdminStorageResolver } from './resolvers/admin-storage.resolver';
import { AdminUsersResolver } from './resolvers/admin-users.resolver';
import { AdminTeamsResolver } from './resolvers/admin-teams.resolver';
import { AdminSubscriptionsResolver } from './resolvers/admin-subscriptions.resolver';
import { AdminPaymentsResolver } from './resolvers/admin-payments.resolver';
import { AdminAnalyticsResolver } from './resolvers/admin-analytics.resolver';

@Module({
  imports: [AuthModule, StorageModule],
  providers: [
    // Services
    PrismaService,
    EncryptionService,
    SystemSettingsService,
    AdminActionLogService,
    AdminStorageService,
    AdminUsersService,
    AdminTeamsService,
    AdminSubscriptionsService,
    AdminPaymentsService,
    AdminAnalyticsService,

    // Resolvers
    AdminSettingsResolver,
    AdminLogsResolver,
    AdminStorageResolver,
    AdminUsersResolver,
    AdminTeamsResolver,
    AdminSubscriptionsResolver,
    AdminPaymentsResolver,
    AdminAnalyticsResolver,
  ],
  exports: [
    SystemSettingsService,
    AdminActionLogService,
    AdminStorageService,
    AdminUsersService,
    AdminTeamsService,
    AdminSubscriptionsService,
    AdminPaymentsService,
    AdminAnalyticsService,
    EncryptionService,
  ],
})
export class AdminModule {}
