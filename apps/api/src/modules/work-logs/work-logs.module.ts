import { Module } from '@nestjs/common';
import { WorkLogsService } from './work-logs.service';
import { WorkLogsResolver } from './work-logs.resolver';
import { PrismaModule } from '../../core/prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { CsvExportService } from '../../shared/services/csv-export.service';

@Module({
  imports: [PrismaModule, AuthModule],
  providers: [WorkLogsService, WorkLogsResolver, CsvExportService],
  exports: [WorkLogsService],
})
export class WorkLogsModule {}
