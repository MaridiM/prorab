import { Module } from '@nestjs/common';
import { WorkLogsService } from './work-logs.service';
import { WorkLogsResolver } from './work-logs.resolver';
import { PrismaModule } from '../../core/prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  providers: [WorkLogsService, WorkLogsResolver],
  exports: [WorkLogsService],
})
export class WorkLogsModule {}
