/**
 * Admin Storage Resolver
 *
 * GraphQL resolver for storage management in admin panel
 */

import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '../../../shared/guards/auth.guard';
import { AdminGuard } from '../../../shared/guards/admin.guard';
import { PermissionsGuard } from '../../../shared/guards/permissions.guard';
import { RequirePermissions } from '../../../shared/decorators/require-permissions.decorator';
import { CurrentUser } from '../../../shared/decorators/current-user.decorator';
import { AdminPermissions } from '../../../shared/constants/admin-permissions';
import type { User } from '@prisma/generated/client';
import { AdminStorageService } from '../services/admin-storage.service';
import {
  StorageSettings,
  UpdateStorageSettingsInput,
  StorageStats,
  ProviderTestResult,
  StorageMigrationResult,
  StorageProviderType,
} from '../models/admin-storage.model';

@Resolver()
@UseGuards(AuthGuard, AdminGuard, PermissionsGuard)
export class AdminStorageResolver {
  constructor(private readonly storageService: AdminStorageService) {}

  /**
   * Get current storage settings
   */
  @Query(() => StorageSettings, {
    description: 'Get current storage provider settings',
  })
  @RequirePermissions(AdminPermissions.STORAGE_VIEW)
  async storageSettings(): Promise<StorageSettings> {
    return this.storageService.getStorageSettings();
  }

  /**
   * Update storage settings
   */
  @Mutation(() => StorageSettings, {
    description: 'Update storage provider settings',
  })
  @RequirePermissions(AdminPermissions.STORAGE_MANAGE)
  async updateStorageSettings(
    @Args('input') input: UpdateStorageSettingsInput,
    @CurrentUser() user: User,
  ): Promise<StorageSettings> {
    return this.storageService.updateStorageSettings(input, user.id);
  }

  /**
   * Get storage statistics
   */
  @Query(() => StorageStats, {
    description: 'Get storage usage statistics',
  })
  @RequirePermissions(AdminPermissions.STORAGE_VIEW)
  async storageStats(): Promise<StorageStats> {
    return this.storageService.getStorageStats();
  }

  /**
   * Test all storage providers
   */
  @Query(() => [ProviderTestResult], {
    description: 'Test connection to all storage providers',
  })
  @RequirePermissions(AdminPermissions.STORAGE_MANAGE)
  async testStorageProviders(): Promise<ProviderTestResult[]> {
    return this.storageService.testAllProviders();
  }

  /**
   * Test specific storage provider
   */
  @Mutation(() => ProviderTestResult, {
    description: 'Test connection to a specific storage provider',
  })
  @RequirePermissions(AdminPermissions.STORAGE_MANAGE)
  async testStorageProvider(
    @Args('provider', { type: () => StorageProviderType }) provider: StorageProviderType,
  ): Promise<ProviderTestResult> {
    return this.storageService.testProvider(provider);
  }

  /**
   * Migrate user storage
   */
  @Mutation(() => StorageMigrationResult, {
    description: 'Migrate a user\'s files from one provider to another',
  })
  @RequirePermissions(AdminPermissions.STORAGE_MIGRATE)
  async migrateUserStorage(
    @Args('userId') userId: string,
    @Args('fromProvider', { type: () => StorageProviderType }) fromProvider: StorageProviderType,
    @Args('toProvider', { type: () => StorageProviderType }) toProvider: StorageProviderType,
    @CurrentUser() user: User,
  ): Promise<StorageMigrationResult> {
    return this.storageService.migrateUserStorage(
      userId,
      fromProvider,
      toProvider,
      user.id,
    );
  }
}
