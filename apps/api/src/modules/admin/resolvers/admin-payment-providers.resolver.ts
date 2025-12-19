import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '../../../shared/guards/auth.guard';
import { AdminGuard } from '../../../shared/guards/admin.guard';
import { PermissionsGuard } from '../../../shared/guards/permissions.guard';
import { RequirePermissions } from '../../../shared/decorators/require-permissions.decorator';
import { CurrentUser } from '../../../shared/decorators/current-user.decorator';
import type { CurrentUserData } from '../../auth/decorators/current-user.decorator';
import { AdminPaymentProvidersService } from '../services/admin-payment-providers.service';
import {
  AdminPaymentProviderModel,
  PaymentProviderConfig,
  UpdatePaymentProviderInput,
  TestConnectionResult,
} from '../models/admin-payment-provider.model';
import { PaymentProviderType } from '@prisma/generated/client';
import { AdminPermissions } from '../../../shared/constants/admin-permissions';

@Resolver(() => AdminPaymentProviderModel)
@UseGuards(AuthGuard, AdminGuard, PermissionsGuard)
export class AdminPaymentProvidersResolver {
  constructor(private adminPaymentProvidersService: AdminPaymentProvidersService) {}

  // ==================== QUERIES ====================

  @Query(() => [AdminPaymentProviderModel], {
    description: 'Get all payment providers - Admin only',
  })
  @RequirePermissions(AdminPermissions.PAYMENT_PROVIDERS_VIEW)
  async adminPaymentProviders(
    @Args('baseUrl', { type: () => String, nullable: true, description: 'Base URL for webhook URLs' })
    baseUrl?: string,
  ): Promise<any[]> {
    return this.adminPaymentProvidersService.findAll(baseUrl);
  }

  @Query(() => AdminPaymentProviderModel, {
    description: 'Get specific payment provider by type - Admin only',
  })
  @RequirePermissions(AdminPermissions.PAYMENT_PROVIDERS_VIEW)
  async adminPaymentProvider(
    @Args('type', { type: () => PaymentProviderType }) type: PaymentProviderType,
    @Args('baseUrl', { type: () => String, nullable: true, description: 'Base URL for webhook URL' })
    baseUrl?: string,
  ): Promise<any> {
    return this.adminPaymentProvidersService.findByType(type, baseUrl);
  }

  @Query(() => PaymentProviderConfig, {
    description: 'Get payment provider configuration (secrets are masked) - Admin only',
  })
  @RequirePermissions(AdminPermissions.PAYMENT_PROVIDERS_VIEW)
  async adminPaymentProviderConfig(
    @Args('type', { type: () => PaymentProviderType }) type: PaymentProviderType,
  ): Promise<PaymentProviderConfig> {
    return this.adminPaymentProvidersService.getProviderConfig(type);
  }

  // ==================== MUTATIONS ====================

  @Mutation(() => AdminPaymentProviderModel, {
    description: 'Update payment provider settings and configuration - Admin only',
  })
  @RequirePermissions(AdminPermissions.PAYMENT_PROVIDERS_MANAGE)
  async adminUpdatePaymentProvider(
    @Args('type', { type: () => PaymentProviderType }) type: PaymentProviderType,
    @Args('input', { type: () => UpdatePaymentProviderInput }) input: UpdatePaymentProviderInput,
    @CurrentUser() currentUser: CurrentUserData,
  ): Promise<any> {
    return this.adminPaymentProvidersService.updateProvider(type, input, currentUser.id);
  }

  @Mutation(() => TestConnectionResult, {
    description: 'Test payment provider connection - Admin only',
  })
  @RequirePermissions(AdminPermissions.PAYMENT_PROVIDERS_MANAGE)
  async adminTestPaymentProvider(
    @Args('type', { type: () => PaymentProviderType }) type: PaymentProviderType,
  ): Promise<TestConnectionResult> {
    return this.adminPaymentProvidersService.testProvider(type);
  }

  @Mutation(() => Boolean, {
    description: 'Clear payment provider cache (force re-initialization) - Admin only',
  })
  @RequirePermissions(AdminPermissions.PAYMENT_PROVIDERS_MANAGE)
  async adminClearPaymentProviderCache(
    @Args('type', { type: () => PaymentProviderType, nullable: true, description: 'Specific provider to clear (or null for all)' })
    type: PaymentProviderType | null,
    @CurrentUser() currentUser: CurrentUserData,
  ): Promise<boolean> {
    await this.adminPaymentProvidersService.clearProviderCache(
      type || undefined,
      currentUser.id,
    );
    return true;
  }
}
