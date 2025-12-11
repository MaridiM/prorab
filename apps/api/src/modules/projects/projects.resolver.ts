import { UseGuards } from '@nestjs/common';
import { Args, ID, Int, Mutation, Query, Resolver } from '@nestjs/graphql';

import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthGuard } from '../auth/guards/auth.guard';
import { Project } from '../teams/models/project.model';
import { CheckProjectLimitGuard } from '../subscriptions/guards/check-project-limit.guard';

import { CreateProjectInput } from './dto/create-project.input';
import { ProjectFilterInput } from './dto/project-filter.input';
import { UpdateProjectInput } from './dto/update-project.input';
import { ProjectStats } from './models/project-stats.model';
import { ProjectsService } from './projects.service';

@Resolver(() => Project)
export class ProjectsResolver {
  constructor(private readonly projectsService: ProjectsService) {}

  // ========== QUERIES ==========

  @Query(() => Project, { description: 'Получить проект по ID' })
  @UseGuards(AuthGuard)
  async project(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: { id: string },
  ) {
    return this.projectsService.findById(id, user.id);
  }

  @Query(() => [Project], { description: 'Получить проекты команды' })
  @UseGuards(AuthGuard)
  async projectsByTeam(
    @Args('teamId', { type: () => ID }) teamId: string,
    @Args('filter', { nullable: true }) filter: ProjectFilterInput,
    @CurrentUser() user: { id: string },
  ) {
    return this.projectsService.findByTeam(teamId, user.id, filter);
  }

  @Query(() => ProjectStats, { description: 'Статистика проекта' })
  @UseGuards(AuthGuard)
  async projectStats(
    @Args('projectId', { type: () => ID }) projectId: string,
    @CurrentUser() user: { id: string },
  ) {
    return this.projectsService.getProjectStats(projectId, user.id);
  }

  // ========== MUTATIONS ==========

  @Mutation(() => Project, { description: 'Создать проект' })
  @UseGuards(AuthGuard, CheckProjectLimitGuard)
  async createProject(
    @Args('input') input: CreateProjectInput,
    @CurrentUser() user: { id: string },
  ) {
    return this.projectsService.create(user.id, input);
  }

  @Mutation(() => Project, { description: 'Обновить проект' })
  @UseGuards(AuthGuard)
  async updateProject(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateProjectInput,
    @CurrentUser() user: { id: string },
  ) {
    return this.projectsService.update(id, user.id, input);
  }

  @Mutation(() => Project, { description: 'Архивировать проект' })
  @UseGuards(AuthGuard)
  async archiveProject(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: { id: string },
  ) {
    return this.projectsService.archive(id, user.id);
  }

  @Mutation(() => Project, { description: 'Восстановить проект' })
  @UseGuards(AuthGuard)
  async restoreProject(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: { id: string },
  ) {
    return this.projectsService.restore(id, user.id);
  }

  @Mutation(() => Project, { description: 'Обновить прогресс проекта' })
  @UseGuards(AuthGuard)
  async updateProjectProgress(
    @Args('id', { type: () => ID }) id: string,
    @Args('progress', { type: () => Int }) progress: number,
    @CurrentUser() user: { id: string },
  ) {
    return this.projectsService.updateProgress(id, user.id, progress);
  }
}
