import { Args, Field, ID, InputType, Int, Mutation, ObjectType, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { GraphQLJSON } from 'graphql-scalars';
import { AuthGuard } from '../../../shared/guards/auth.guard';
import { AdminGuard } from '../../../shared/guards/admin.guard';
import { PermissionsGuard } from '../../../shared/guards/permissions.guard';
import { RequirePermissions } from '../../../shared/decorators/require-permissions.decorator';
import { AdminPermissions } from '../../../shared/constants/admin-permissions';
import { AdminProjectsService } from '../services/admin-projects.service';
import { CurrentUser } from '../../../shared/decorators/current-user.decorator';
import { User } from '../../users/models/user.model';
import { PaginationInput } from '../dto/pagination.input';
import { DeleteResult } from '../models/shared/delete-result.model';

// Models
@ObjectType()
class ProjectCount {
  @Field(() => Int)
  expenses: number;

  @Field(() => Int)
  photoReports: number;

  @Field(() => Int)
  tasks: number;
}

@ObjectType()
class AdminProject {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field({ nullable: true })
  description?: string;

  @Field()
  status: string;

  @Field({ nullable: true })
  budget?: number;

  @Field({ nullable: true })
  actualCost?: number;

  @Field({ nullable: true })
  startDate?: Date;

  @Field({ nullable: true })
  endDate?: Date;

  @Field({ nullable: true })
  completedAt?: Date;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field(() => GraphQLJSON, { nullable: true })
  team?: any;

  @Field(() => GraphQLJSON, { nullable: true })
  owner?: any;

  @Field(() => ProjectCount, { nullable: true })
  _count?: ProjectCount;
}

@ObjectType()
class AdminProjectsResult {
  @Field(() => [AdminProject])
  projects: AdminProject[];

  @Field(() => Int)
  total: number;

  @Field()
  hasMore: boolean;
}

// Input types
@InputType()
class AdminProjectFilterInput {
  @Field({ nullable: true })
  status?: string;

  @Field({ nullable: true })
  teamId?: string;

  @Field({ nullable: true })
  ownerId?: string;

  @Field({ nullable: true })
  search?: string;

  @Field({ nullable: true })
  startDateFrom?: Date;

  @Field({ nullable: true })
  startDateTo?: Date;
}

@Resolver()
export class AdminProjectsResolver {
  constructor(private readonly adminProjectsService: AdminProjectsService) {}

  @Query(() => AdminProjectsResult, {
    description: 'Get all projects with filters (admin only)',
  })
  @UseGuards(AuthGuard, AdminGuard, PermissionsGuard)
  @RequirePermissions(AdminPermissions.PROJECTS_VIEW)
  async adminProjects(
    @Args('filter', { nullable: true }) filter?: AdminProjectFilterInput,
    @Args('pagination', { type: () => PaginationInput, nullable: true }) pagination?: PaginationInput,
  ): Promise<AdminProjectsResult> {
    return this.adminProjectsService.findAll(filter || {}, pagination || {});
  }

  @Query(() => AdminProject, {
    description: 'Get project by ID with details (admin only)',
    nullable: true,
  })
  @UseGuards(AuthGuard, AdminGuard, PermissionsGuard)
  @RequirePermissions(AdminPermissions.PROJECTS_VIEW)
  async adminProject(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<AdminProject | null> {
    return this.adminProjectsService.findById(id);
  }

  @Mutation(() => AdminProject, {
    description: 'Update project status (admin only)',
  })
  @UseGuards(AuthGuard, AdminGuard, PermissionsGuard)
  @RequirePermissions(AdminPermissions.PROJECTS_MANAGE)
  async adminUpdateProjectStatus(
    @CurrentUser() currentUser: User,
    @Args('projectId', { type: () => ID }) projectId: string,
    @Args('status') status: string,
  ): Promise<AdminProject> {
    return this.adminProjectsService.updateStatus(
      projectId,
      status,
      currentUser.id,
    );
  }

  @Mutation(() => DeleteResult, {
    description: 'Delete project (admin only)',
  })
  @UseGuards(AuthGuard, AdminGuard, PermissionsGuard)
  @RequirePermissions(AdminPermissions.PROJECTS_DELETE)
  async adminDeleteProject(
    @CurrentUser() currentUser: User,
    @Args('projectId', { type: () => ID }) projectId: string,
  ): Promise<DeleteResult> {
    return this.adminProjectsService.deleteProject(projectId, currentUser.id);
  }

  @Mutation(() => AdminProject, {
    description: 'Archive project (admin only)',
  })
  @UseGuards(AuthGuard, AdminGuard, PermissionsGuard)
  @RequirePermissions(AdminPermissions.PROJECTS_MANAGE)
  async adminArchiveProject(
    @CurrentUser() currentUser: User,
    @Args('projectId', { type: () => ID }) projectId: string,
  ): Promise<AdminProject> {
    return this.adminProjectsService.archiveProject(projectId, currentUser.id);
  }
}
