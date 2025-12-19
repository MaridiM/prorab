import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '../../../shared/guards/auth.guard';
import { AdminGuard } from '../../../shared/guards/admin.guard';
import { PermissionsGuard } from '../../../shared/guards/permissions.guard';
import { RequirePermissions } from '../../../shared/decorators/require-permissions.decorator';
import { CurrentUser } from '../../../shared/decorators/current-user.decorator';
import type { CurrentUserData } from '../../auth/decorators/current-user.decorator';
import { AdminPlansService } from '../services/admin-plans.service';
import {
  AdminPlanModel,
  AdminPlansConnection,
  AdminPlanFilters,
  AdminCreatePlanInput,
  AdminUpdatePlanInput,
} from '../models/admin-plan.model';
import { PaginationInput } from '../dto/pagination.input';
import { AdminPermissions } from '../../../shared/constants/admin-permissions';

@Resolver(() => AdminPlanModel)
@UseGuards(AuthGuard, AdminGuard, PermissionsGuard)
export class AdminPlansResolver {
  constructor(private adminPlansService: AdminPlansService) {}

  // ==================== QUERIES ====================

  @Query(() => [AdminPlanModel], {
    description: 'Get all plans (with optional filters) - Admin only',
  })
  @RequirePermissions(AdminPermissions.PLANS_VIEW)
  async adminPlans(
    @Args('filters', { type: () => AdminPlanFilters, nullable: true })
    filters?: AdminPlanFilters,
  ): Promise<any[]> {
    const result = await this.adminPlansService.findAll(filters || {});
    return Array.isArray(result) ? result : result.nodes;
  }

  @Query(() => AdminPlansConnection, {
    description: 'Get paginated list of plans with filters - Admin only',
  })
  @RequirePermissions(AdminPermissions.PLANS_VIEW)
  async adminPlansPaginated(
    @Args('filters', { type: () => AdminPlanFilters, nullable: true })
    filters: AdminPlanFilters = {},
    @Args('pagination', { type: () => PaginationInput })
    pagination: PaginationInput,
  ): Promise<any> {
    return this.adminPlansService.findAll(filters, pagination);
  }

  @Query(() => AdminPlanModel, {
    description: 'Get detailed information about a specific plan by ID - Admin only',
  })
  @RequirePermissions(AdminPermissions.PLANS_VIEW)
  async adminPlan(
    @Args('id', { type: () => String }) id: string,
  ): Promise<any> {
    return this.adminPlansService.findOne(id);
  }

  @Query(() => AdminPlanModel, {
    description: 'Get detailed information about a specific plan by slug - Admin only',
  })
  @RequirePermissions(AdminPermissions.PLANS_VIEW)
  async adminPlanBySlug(
    @Args('slug', { type: () => String }) slug: string,
  ): Promise<any> {
    return this.adminPlansService.findBySlug(slug);
  }

  @Query(() => [AdminPlanModel], {
    description: 'Get available plans for public (active plans only)',
  })
  async availablePlans(
    @Args('currency', { type: () => String, nullable: true, description: 'Filter prices by currency (RUB, USD, EUR)' })
    currency?: string,
  ): Promise<any[]> {
    return this.adminPlansService.getAvailablePlans(currency);
  }

  // ==================== MUTATIONS ====================

  @Mutation(() => AdminPlanModel, {
    description: 'Create a new plan - Admin only',
  })
  @RequirePermissions(AdminPermissions.PLANS_MANAGE)
  async adminCreatePlan(
    @Args('input', { type: () => AdminCreatePlanInput }) input: AdminCreatePlanInput,
    @CurrentUser() currentUser: CurrentUserData,
  ): Promise<any> {
    return this.adminPlansService.create(input, currentUser.id);
  }

  @Mutation(() => AdminPlanModel, {
    description: 'Update an existing plan - Admin only',
  })
  @RequirePermissions(AdminPermissions.PLANS_MANAGE)
  async adminUpdatePlan(
    @Args('id', { type: () => String }) id: string,
    @Args('input', { type: () => AdminUpdatePlanInput }) input: AdminUpdatePlanInput,
    @CurrentUser() currentUser: CurrentUserData,
  ): Promise<any> {
    return this.adminPlansService.update(id, input, currentUser.id);
  }

  @Mutation(() => AdminPlanModel, {
    description: 'Archive a plan (set isActive = false) - Admin only',
  })
  @RequirePermissions(AdminPermissions.PLANS_MANAGE)
  async adminArchivePlan(
    @Args('id', { type: () => String }) id: string,
    @CurrentUser() currentUser: CurrentUserData,
  ): Promise<any> {
    return this.adminPlansService.archive(id, currentUser.id);
  }

  @Mutation(() => AdminPlanModel, {
    description: 'Activate a plan (set isActive = true) - Admin only',
  })
  @RequirePermissions(AdminPermissions.PLANS_MANAGE)
  async adminActivatePlan(
    @Args('id', { type: () => String }) id: string,
    @CurrentUser() currentUser: CurrentUserData,
  ): Promise<any> {
    return this.adminPlansService.activate(id, currentUser.id);
  }

  @Mutation(() => Boolean, {
    description: 'Delete a plan (only if no active subscriptions exist) - Admin only',
  })
  @RequirePermissions(AdminPermissions.PLANS_MANAGE)
  async adminDeletePlan(
    @Args('id', { type: () => String }) id: string,
    @CurrentUser() currentUser: CurrentUserData,
  ): Promise<boolean> {
    return this.adminPlansService.delete(id, currentUser.id);
  }
}
