import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '../../../shared/guards/auth.guard';
import { AdminGuard } from '../../../shared/guards/admin.guard';
import { PermissionsGuard } from '../../../shared/guards/permissions.guard';
import { RequirePermissions } from '../../../shared/decorators/require-permissions.decorator';
import { CurrentUser } from '../../../shared/decorators/current-user.decorator';
import type { CurrentUserData } from '../../auth/decorators/current-user.decorator';
import { AdminSubscriptionsService } from '../services/admin-subscriptions.service';
import { SubscriptionModel } from '../../subscriptions/models/subscription.model';
import {
  AdminSubscriptionsConnection,
  SubscriptionStats,
  AdminSubscriptionFilters,
  UpdateSubscriptionInput,
} from '../models/admin-subscription.model';
import { PaginationInput } from '../dto/pagination.input';
import { AdminPermissions } from '../../../shared/constants/admin-permissions';

@Resolver(() => SubscriptionModel)
@UseGuards(AuthGuard, AdminGuard, PermissionsGuard)
export class AdminSubscriptionsResolver {
  constructor(private adminSubscriptionsService: AdminSubscriptionsService) {}

  @Query(() => AdminSubscriptionsConnection, {
    description: 'Get paginated list of subscriptions with filters (Admin only)',
  })
  @RequirePermissions(AdminPermissions.SUBSCRIPTIONS_VIEW)
  async adminSubscriptions(
    @Args('filters', { type: () => AdminSubscriptionFilters, nullable: true })
    filters: AdminSubscriptionFilters = {},
    @Args('pagination', { type: () => PaginationInput })
    pagination: PaginationInput,
  ): Promise<any> {
    return this.adminSubscriptionsService.findAll(filters, pagination);
  }

  @Query(() => SubscriptionModel, {
    description: 'Get detailed information about a specific subscription (Admin only)',
  })
  @RequirePermissions(AdminPermissions.SUBSCRIPTIONS_VIEW)
  async adminSubscription(
    @Args('id', { type: () => String }) id: string,
  ): Promise<any> {
    return this.adminSubscriptionsService.findById(id);
  }

  @Query(() => SubscriptionStats, {
    description: 'Get subscription statistics (Admin only)',
  })
  @RequirePermissions(AdminPermissions.SUBSCRIPTIONS_VIEW)
  async adminSubscriptionStats(): Promise<SubscriptionStats> {
    return this.adminSubscriptionsService.getStats();
  }

  @Mutation(() => SubscriptionModel, {
    description: 'Update subscription (Admin only)',
  })
  @RequirePermissions(AdminPermissions.SUBSCRIPTIONS_UPDATE)
  async adminUpdateSubscription(
    @Args('id', { type: () => String }) id: string,
    @Args('input', { type: () => UpdateSubscriptionInput }) input: UpdateSubscriptionInput,
    @CurrentUser() currentUser: CurrentUserData,
  ): Promise<any> {
    return this.adminSubscriptionsService.updateSubscription(id, input, currentUser.id);
  }

  @Mutation(() => SubscriptionModel, {
    description: 'Cancel subscription (Admin only)',
  })
  @RequirePermissions(AdminPermissions.SUBSCRIPTIONS_CANCEL)
  async adminCancelSubscription(
    @Args('id', { type: () => String }) id: string,
    @Args('cancelAtPeriodEnd', { type: () => Boolean, defaultValue: true })
    cancelAtPeriodEnd: boolean,
    @CurrentUser() currentUser: CurrentUserData,
  ): Promise<any> {
    return this.adminSubscriptionsService.cancelSubscription(id, cancelAtPeriodEnd, currentUser.id);
  }

  @Mutation(() => SubscriptionModel, {
    description: 'Reactivate cancelled subscription (Admin only)',
  })
  @RequirePermissions(AdminPermissions.SUBSCRIPTIONS_UPDATE)
  async adminReactivateSubscription(
    @Args('id', { type: () => String }) id: string,
    @CurrentUser() currentUser: CurrentUserData,
  ): Promise<any> {
    return this.adminSubscriptionsService.reactivateSubscription(id, currentUser.id);
  }

  @Mutation(() => Boolean, {
    description: 'Delete subscription (Admin only)',
  })
  @RequirePermissions(AdminPermissions.SUBSCRIPTIONS_UPDATE)
  async adminDeleteSubscription(
    @Args('id', { type: () => String }) id: string,
    @CurrentUser() currentUser: CurrentUserData,
  ): Promise<boolean> {
    return this.adminSubscriptionsService.deleteSubscription(id, currentUser.id);
  }
}
