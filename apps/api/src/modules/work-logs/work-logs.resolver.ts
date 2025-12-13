import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '../../shared/guards/auth.guard';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';
import { WorkLogsService } from './work-logs.service';
import { WorkLog } from './models/work-log.model';
import { CreateWorkLogInput } from './dto/create-work-log.input';
import { BulkCreateWorkLogInput } from './dto/bulk-create-work-log.input';
import { UpdateWorkLogInput } from './dto/update-work-log.input';
import { BulkUpdateResult } from '../payouts/models/bulk-update-result.model';

@Resolver(() => WorkLog)
export class WorkLogsResolver {
  constructor(private readonly workLogsService: WorkLogsService) {}

  // ==================== QUERIES ====================

  @Query(() => [WorkLog], {
    description: 'Get all work logs for a project (owner or team member)',
  })
  @UseGuards(AuthGuard)
  async projectWorkLogs(
    @Args('projectId', { type: () => ID }) projectId: string,
    @CurrentUser() user: any,
  ): Promise<WorkLog[]> {
    return this.workLogsService.getProjectWorkLogs(projectId, user.id);
  }

  @Query(() => [WorkLog], {
    description: 'Get all work logs for a team member (owner or self)',
  })
  @UseGuards(AuthGuard)
  async memberWorkLogs(
    @Args('memberId', { type: () => ID }) memberId: string,
    @CurrentUser() user: any,
  ): Promise<WorkLog[]> {
    return this.workLogsService.getMemberWorkLogs(memberId, user.id);
  }

  @Query(() => [WorkLog], {
    description: 'Get work logs for a date range',
  })
  @UseGuards(AuthGuard)
  async workLogsByDateRange(
    @Args('projectId', { type: () => ID }) projectId: string,
    @Args('startDate') startDate: Date,
    @Args('endDate') endDate: Date,
    @CurrentUser() user: any,
  ): Promise<WorkLog[]> {
    return this.workLogsService.getWorkLogsByDateRange(
      projectId,
      startDate,
      endDate,
      user.id,
    );
  }

  // ==================== MUTATIONS ====================

  @Mutation(() => WorkLog, {
    description: 'Create a new work log entry (owner or self)',
  })
  @UseGuards(AuthGuard)
  async createWorkLog(
    @Args('input') input: CreateWorkLogInput,
    @CurrentUser() user: any,
  ): Promise<WorkLog> {
    return this.workLogsService.createWorkLog(input, user.id);
  }

  @Mutation(() => BulkUpdateResult, {
    description: 'Bulk create work log entries (owner or self)',
  })
  @UseGuards(AuthGuard)
  async bulkCreateWorkLogs(
    @Args('input') input: BulkCreateWorkLogInput,
    @CurrentUser() user: any,
  ): Promise<BulkUpdateResult> {
    return this.workLogsService.bulkCreateWorkLogs(input, user.id);
  }

  @Mutation(() => WorkLog, {
    description: 'Update a work log entry (owner or creator)',
  })
  @UseGuards(AuthGuard)
  async updateWorkLog(
    @Args('input') input: UpdateWorkLogInput,
    @CurrentUser() user: any,
  ): Promise<WorkLog> {
    return this.workLogsService.updateWorkLog(input, user.id);
  }

  @Mutation(() => Boolean, {
    description: 'Delete a work log entry (owner or creator)',
  })
  @UseGuards(AuthGuard)
  async deleteWorkLog(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: any,
  ): Promise<boolean> {
    return this.workLogsService.deleteWorkLog(id, user.id);
  }

  // ==================== EXPORT ====================

  @Query(() => String, {
    description: 'Export project work logs to CSV (owner or team member)',
  })
  @UseGuards(AuthGuard)
  async exportProjectWorkLogs(
    @Args('projectId', { type: () => ID }) projectId: string,
    @CurrentUser() user: any,
  ): Promise<string> {
    return this.workLogsService.exportProjectWorkLogsToCsv(projectId, user.id);
  }
}
