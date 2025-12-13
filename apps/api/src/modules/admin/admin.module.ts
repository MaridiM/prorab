import { Module } from '@nestjs/common';
import { PrismaService } from '../../core/prisma/prisma.service';
import { EncryptionService } from '../../shared/services/encryption.service';
import { AuthModule } from '../auth/auth.module';
import { SystemSettingsService } from './services/system-settings.service';
import { AdminActionLogService } from './services/admin-action-log.service';
import { AdminSettingsResolver } from './resolvers/admin-settings.resolver';
import { AdminLogsResolver } from './resolvers/admin-logs.resolver';

@Module({
  imports: [AuthModule],
  providers: [
    // Services
    PrismaService,
    EncryptionService,
    SystemSettingsService,
    AdminActionLogService,

    // Resolvers
    AdminSettingsResolver,
    AdminLogsResolver,
  ],
  exports: [
    SystemSettingsService,
    AdminActionLogService,
    EncryptionService,
  ],
})
export class AdminModule {}
