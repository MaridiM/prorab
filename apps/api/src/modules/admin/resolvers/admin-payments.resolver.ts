import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '../../../shared/guards/auth.guard';
import { AdminGuard } from '../../../shared/guards/admin.guard';
import { PermissionsGuard } from '../../../shared/guards/permissions.guard';
import { RequirePermissions } from '../../../shared/decorators/require-permissions.decorator';
import { CurrentUser } from '../../../shared/decorators/current-user.decorator';
import type { CurrentUserData } from '../../auth/decorators/current-user.decorator';
import { AdminPaymentsService } from '../services/admin-payments.service';
import {
  AdminPayment,
  AdminPaymentsConnection,
  PaymentStats,
  AdminPaymentFilters,
  RefundPaymentInput,
} from '../models/admin-payment.model';
import { PaginationInput } from '../dto/pagination.input';
import { AdminPermissions } from '../../../shared/constants/admin-permissions';

@Resolver(() => AdminPayment)
@UseGuards(AuthGuard, AdminGuard, PermissionsGuard)
export class AdminPaymentsResolver {
  constructor(private adminPaymentsService: AdminPaymentsService) {}

  @Query(() => AdminPaymentsConnection, {
    description: 'Get paginated list of payments with filters (Admin only)',
  })
  @RequirePermissions(AdminPermissions.PAYMENTS_VIEW)
  async adminPayments(
    @Args('filters', { type: () => AdminPaymentFilters, nullable: true })
    filters: AdminPaymentFilters = {},
    @Args('pagination', { type: () => PaginationInput })
    pagination: PaginationInput,
  ): Promise<any> {
    return this.adminPaymentsService.findAll(filters, pagination);
  }

  @Query(() => AdminPayment, {
    description: 'Get detailed information about a specific payment (Admin only)',
  })
  @RequirePermissions(AdminPermissions.PAYMENTS_VIEW)
  async adminPayment(@Args('id', { type: () => String }) id: string): Promise<any> {
    return this.adminPaymentsService.findById(id);
  }

  @Query(() => PaymentStats, {
    description: 'Get payment statistics (Admin only)',
  })
  @RequirePermissions(AdminPermissions.PAYMENTS_VIEW)
  async adminPaymentStats(): Promise<PaymentStats> {
    return this.adminPaymentsService.getStats();
  }

  @Mutation(() => AdminPayment, {
    description: 'Update payment status (Admin only)',
  })
  @RequirePermissions(AdminPermissions.PAYMENTS_VIEW)
  async adminUpdatePaymentStatus(
    @Args('id', { type: () => String }) id: string,
    @Args('status', { type: () => String }) status: string,
    @CurrentUser() currentUser: CurrentUserData,
  ): Promise<any> {
    return this.adminPaymentsService.updatePaymentStatus(id, status, currentUser.id);
  }

  @Mutation(() => AdminPayment, {
    description: 'Issue refund for payment (Admin only)',
  })
  @RequirePermissions(AdminPermissions.PAYMENTS_REFUND)
  async adminRefundPayment(
    @Args('id', { type: () => String }) id: string,
    @Args('input', { type: () => RefundPaymentInput }) input: RefundPaymentInput,
    @CurrentUser() currentUser: CurrentUserData,
  ): Promise<any> {
    return this.adminPaymentsService.refundPayment(
      id,
      input.amount,
      input.reason,
      currentUser.id,
    );
  }

  @Mutation(() => Boolean, {
    description: 'Delete payment (Admin only)',
  })
  @RequirePermissions(AdminPermissions.PAYMENTS_VIEW)
  async adminDeletePayment(
    @Args('id', { type: () => String }) id: string,
    @CurrentUser() currentUser: CurrentUserData,
  ): Promise<boolean> {
    return this.adminPaymentsService.deletePayment(id, currentUser.id);
  }
}
