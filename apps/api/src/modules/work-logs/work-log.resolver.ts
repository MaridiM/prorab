import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { WorkLogService } from './work-log.service';
import { WorkLog } from './models/work-log.model';
import { CreateWorkLogInput, UpdateWorkLogInput, WorkLogFilters } from './dto/work-log.input';
import { AuthGuard } from '../../shared/guards/auth.guard';
import { CurrentUser, CurrentUserData } from '../auth/decorators/current-user.decorator';

@Resolver(() => WorkLog)
export class WorkLogResolver {
  constructor(private readonly workLogService: WorkLogService) {}

  @Query(() => [WorkLog], { name: 'workLogs' })
  @UseGuards(AuthGuard)
  async getWorkLogs(
    @Args('filters') filters: WorkLogFilters,
  ): Promise<any[]> {
    return this.workLogService.getWorkLogs(filters);
  }

  @Query(() => WorkLog, { name: 'workLog', nullable: true })
  @UseGuards(AuthGuard)
  async getWorkLog(
    @Args('id', { type: () => String }) id: string,
  ): Promise<any> {
    return this.workLogService.getWorkLog(id);
  }

  @Query(() => Number, { name: 'totalHours' })
  @UseGuards(AuthGuard)
  async getTotalHours(
    @Args('filters') filters: WorkLogFilters,
  ): Promise<number> {
    return this.workLogService.getTotalHours(filters);
  }

  @Query(() => [WorkLog], { name: 'myWorkLogs' })
  @UseGuards(AuthGuard)
  async getMyWorkLogs(
    @CurrentUser() user: CurrentUserData,
    @Args('filters', { nullable: true }) filters?: WorkLogFilters,
  ): Promise<any[]> {
    return this.workLogService.getWorkLogsByUser(user.id, filters);
  }

  @Mutation(() => WorkLog, { name: 'createWorkLog' })
  @UseGuards(AuthGuard)
  async createWorkLog(
    @Args('input') input: CreateWorkLogInput,
    @CurrentUser() user: CurrentUserData,
  ): Promise<any> {
    return this.workLogService.createWorkLog(input, user.id);
  }

  @Mutation(() => WorkLog, { name: 'updateWorkLog' })
  @UseGuards(AuthGuard)
  async updateWorkLog(
    @Args('id', { type: () => String }) id: string,
    @Args('input') input: UpdateWorkLogInput,
    @CurrentUser() user: CurrentUserData,
  ): Promise<any> {
    return this.workLogService.updateWorkLog(id, input, user.id);
  }

  @Mutation(() => Boolean, { name: 'deleteWorkLog' })
  @UseGuards(AuthGuard)
  async deleteWorkLog(
    @Args('id', { type: () => String }) id: string,
    @CurrentUser() user: CurrentUserData,
  ): Promise<boolean> {
    return this.workLogService.deleteWorkLog(id, user.id);
  }
}
