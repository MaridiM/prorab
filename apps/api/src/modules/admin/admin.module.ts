import { Module } from '@nestjs/common';
import { PrismaService } from '../../core/prisma/prisma.service';
import { EncryptionService } from '../../shared/services/encryption.service';
import { AuthModule } from '../auth/auth.module';
import { StorageModule } from '../../core/storage/storage.module';
import { PaymentProviderFactory } from '../../core/payments/factories/payment-provider.factory';
import { SystemSettingsService } from './services/system-settings.service';
import { AdminActionLogService } from './services/admin-action-log.service';
import { AdminStorageService } from './services/admin-storage.service';
import { AdminUsersService } from './services/admin-users.service';
import { AdminTeamsService } from './services/admin-teams.service';
import { AdminSubscriptionsService } from './services/admin-subscriptions.service';
import { AdminPaymentsService } from './services/admin-payments.service';
import { AdminAnalyticsService } from './services/admin-analytics.service';
import { AdminRolesService } from './services/admin-roles.service';
import { AdminProjectsService } from './services/admin-projects.service';
import { AdminSupportService } from './services/admin-support.service';
import { AdminPlansService } from './services/admin-plans.service';
import { AdminPaymentProvidersService } from './services/admin-payment-providers.service';
import { AdminSettingsResolver } from './resolvers/admin-settings.resolver';
import { AdminLogsResolver } from './resolvers/admin-logs.resolver';
import { AdminStorageResolver } from './resolvers/admin-storage.resolver';
import { AdminUsersResolver } from './resolvers/admin-users.resolver';
import { AdminTeamsResolver } from './resolvers/admin-teams.resolver';
import { AdminSubscriptionsResolver } from './resolvers/admin-subscriptions.resolver';
import { AdminPaymentsResolver } from './resolvers/admin-payments.resolver';
import { AdminAnalyticsResolver } from './resolvers/admin-analytics.resolver';
import { AdminRolesResolver } from './resolvers/admin-roles.resolver';
import { AdminProjectsResolver } from './resolvers/admin-projects.resolver';
import { AdminSupportResolver } from './resolvers/admin-support.resolver';
import { AdminPlansResolver } from './resolvers/admin-plans.resolver';
import { AdminPaymentProvidersResolver } from './resolvers/admin-payment-providers.resolver';

@Module({
  imports: [AuthModule, StorageModule],
  providers: [
    // Core Services
    PrismaService,
    EncryptionService,
    SystemSettingsService,
    AdminActionLogService,
    PaymentProviderFactory,

    // Admin Services
    AdminStorageService,
    AdminUsersService,
    AdminTeamsService,
    AdminSubscriptionsService,
    AdminPaymentsService,
    AdminAnalyticsService,
    AdminRolesService,
    AdminProjectsService,
    AdminSupportService,
    AdminPlansService,
    AdminPaymentProvidersService,

    // Resolvers
    AdminSettingsResolver,
    AdminLogsResolver,
    AdminStorageResolver,
    AdminUsersResolver,
    AdminTeamsResolver,
    AdminSubscriptionsResolver,
    AdminPaymentsResolver,
    AdminAnalyticsResolver,
    AdminRolesResolver,
    AdminProjectsResolver,
    AdminSupportResolver,
    AdminPlansResolver,
    AdminPaymentProvidersResolver,
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
    AdminRolesService,
    AdminProjectsService,
    AdminSupportService,
    AdminPlansService,
    AdminPaymentProvidersService,
    EncryptionService,
    PaymentProviderFactory,
  ],
})
export class AdminModule {}
