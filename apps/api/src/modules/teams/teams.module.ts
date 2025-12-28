import { Module } from '@nestjs/common';
import { TeamsService } from './teams.service';
import { TeamsResolver, InviteCodeResolver } from './teams.resolver';
import { StorageModule } from '../../core/storage/storage.module';
import { AuthModule } from '../auth/auth.module';
import { CsvExportService } from '../../shared/services/csv-export.service';
import { MailModule } from '../../core/mail/mail.module';
import { SubscriptionsModule } from '../subscriptions/subscriptions.module';

@Module({
  imports: [StorageModule, AuthModule, MailModule, SubscriptionsModule],
  providers: [TeamsService, TeamsResolver, InviteCodeResolver, CsvExportService],
  exports: [TeamsService],
})
export class TeamsModule {}
