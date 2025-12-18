import { Module } from '@nestjs/common';
import { WorkLogService } from './work-log.service';
import { WorkLogResolver } from './work-log.resolver';
import { CoreModule } from '../../core/core.module';

@Module({
  imports: [CoreModule],
  providers: [WorkLogService, WorkLogResolver],
  exports: [WorkLogService],
})
export class WorkLogModule {}
