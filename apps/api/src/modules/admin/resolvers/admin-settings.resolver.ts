import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '../../../shared/guards/auth.guard';
import { AdminGuard } from '../../../shared/guards/admin.guard';
import { PermissionsGuard } from '../../../shared/guards/permissions.guard';
import { RequirePermissions } from '../../../shared/decorators/require-permissions.decorator';
import { CurrentUser } from '../../../shared/decorators/current-user.decorator';
import { AdminPermissions } from '../../../shared/constants/admin-permissions';
import { SystemSettingsService } from '../services/system-settings.service';
import { AdminActionLogService } from '../services/admin-action-log.service';
import { SystemSetting, ConnectionTestResult } from '../models/system-settings.model';
import { CreateSystemSettingInput } from '../dto/create-system-setting.input';
import {
  UpdateSystemSettingInput,
  BulkUpdateSystemSettingsInput,
} from '../dto/update-system-setting.input';
import { SettingCategory } from '@prisma/generated/client';

@Resolver(() => SystemSetting)
export class AdminSettingsResolver {
  constructor(
    private readonly settingsService: SystemSettingsService,
    private readonly actionLogService: AdminActionLogService
  ) {}

  // ==================== QUERIES ====================

  @Query(() => [SystemSetting], {
    description: 'Get all system settings (admin only)',
  })
  @UseGuards(AuthGuard, AdminGuard, PermissionsGuard)
  @RequirePermissions(AdminPermissions.SETTINGS_VIEW)
  async systemSettings(
    @Args('category', { type: () => SettingCategory, nullable: true })
    category?: SettingCategory
  ): Promise<SystemSetting[]> {
    return this.settingsService.getAllSettings(category);
  }

  @Query(() => SystemSetting, {
    description: 'Get a single system setting by key (admin only)',
    nullable: true,
  })
  @UseGuards(AuthGuard, AdminGuard, PermissionsGuard)
  @RequirePermissions(AdminPermissions.SETTINGS_VIEW)
  async systemSetting(
    @Args('key') key: string
  ): Promise<SystemSetting | null> {
    return this.settingsService.getSetting(key);
  }

  // ==================== MUTATIONS ====================

  @Mutation(() => SystemSetting, {
    description: 'Create a new system setting (super admin only)',
  })
  @UseGuards(AuthGuard, AdminGuard, PermissionsGuard)
  @RequirePermissions(AdminPermissions.SETTINGS_UPDATE)
  async createSystemSetting(
    @Args('input') input: CreateSystemSettingInput,
    @CurrentUser() user: any
  ): Promise<SystemSetting> {
    const setting = await this.settingsService.createSetting(input, user.id);

    // Log action
    await this.actionLogService.logAction({
      adminUserId: user.id,
      action: 'CREATE_SETTING',
      resource: 'SystemSettings',
      resourceId: setting.id,
      details: { key: setting.key, category: setting.category },
    });

    return setting;
  }

  @Mutation(() => SystemSetting, {
    description: 'Update a system setting value (admin only)',
  })
  @UseGuards(AuthGuard, AdminGuard, PermissionsGuard)
  @RequirePermissions(AdminPermissions.SETTINGS_UPDATE)
  async updateSystemSetting(
    @Args('input') input: UpdateSystemSettingInput,
    @CurrentUser() user: any
  ): Promise<SystemSetting> {
    const setting = await this.settingsService.updateSetting(
      input.key,
      input.value,
      user.id
    );

    // Log action
    await this.actionLogService.logAction({
      adminUserId: user.id,
      action: 'UPDATE_SETTING',
      resource: 'SystemSettings',
      resourceId: setting.id,
      details: { key: setting.key },
    });

    return setting;
  }

  @Mutation(() => [SystemSetting], {
    description: 'Bulk update system settings (admin only)',
  })
  @UseGuards(AuthGuard, AdminGuard, PermissionsGuard)
  @RequirePermissions(AdminPermissions.SETTINGS_UPDATE)
  async bulkUpdateSystemSettings(
    @Args('input') input: BulkUpdateSystemSettingsInput,
    @CurrentUser() user: any
  ): Promise<SystemSetting[]> {
    const settings = await this.settingsService.bulkUpdateSettings(
      input.settings,
      user.id
    );

    // Log action
    await this.actionLogService.logAction({
      adminUserId: user.id,
      action: 'BULK_UPDATE_SETTINGS',
      resource: 'SystemSettings',
      details: { count: settings.length, keys: input.settings.map((s) => s.key) },
    });

    return settings;
  }

  @Mutation(() => Boolean, {
    description: 'Delete a system setting (super admin only)',
  })
  @UseGuards(AuthGuard, AdminGuard, PermissionsGuard)
  @RequirePermissions(AdminPermissions.SETTINGS_UPDATE)
  async deleteSystemSetting(
    @Args('key') key: string,
    @CurrentUser() user: any
  ): Promise<boolean> {
    await this.settingsService.deleteSetting(key, user.id);

    // Log action
    await this.actionLogService.logAction({
      adminUserId: user.id,
      action: 'DELETE_SETTING',
      resource: 'SystemSettings',
      details: { key },
    });

    return true;
  }

  @Mutation(() => ConnectionTestResult, {
    description: 'Test connection for a service category (admin only)',
  })
  @UseGuards(AuthGuard, AdminGuard, PermissionsGuard)
  @RequirePermissions(AdminPermissions.SETTINGS_VIEW)
  async testServiceConnection(
    @Args('category', { type: () => SettingCategory }) category: SettingCategory,
    @CurrentUser() user: any
  ): Promise<ConnectionTestResult> {
    const result = await this.settingsService.testConnection(category);

    // Log action
    await this.actionLogService.logAction({
      adminUserId: user.id,
      action: 'TEST_CONNECTION',
      resource: 'SystemSettings',
      details: { category, success: result.success },
    });

    return result;
  }

  @Mutation(() => Boolean, {
    description: 'Initialize default system settings (super admin only)',
  })
  @UseGuards(AuthGuard, AdminGuard, PermissionsGuard)
  @RequirePermissions(AdminPermissions.SETTINGS_UPDATE)
  async initializeDefaultSettings(@CurrentUser() user: any): Promise<boolean> {
    await this.settingsService.initializeDefaultSettings();

    // Log action
    await this.actionLogService.logAction({
      adminUserId: user.id,
      action: 'INITIALIZE_DEFAULT_SETTINGS',
      resource: 'SystemSettings',
    });

    return true;
  }
}
