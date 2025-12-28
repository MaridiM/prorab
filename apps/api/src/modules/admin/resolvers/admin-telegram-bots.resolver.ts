import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '../../../shared/guards/auth.guard';
import { AdminGuard } from '../../../shared/guards/admin.guard';
import { PermissionsGuard } from '../../../shared/guards/permissions.guard';
import { RequirePermissions } from '../../../shared/decorators/require-permissions.decorator';
import { CurrentUser } from '../../../shared/decorators/current-user.decorator';
import type { CurrentUserData } from '../../auth/decorators/current-user.decorator';
import { AdminTelegramBotsService } from '../services/admin-telegram-bots.service';
import {
  AdminTelegramBotModel,
  TestBotResult,
  WebhookInfoModel,
} from '../models/admin-telegram-bot.model';
import {
  CreateTelegramBotInput,
  UpdateTelegramBotInput,
  TestBotTokenInput,
  SetWebhookInput,
} from '../dto/telegram-bot.input';
import { AdminPermissions } from '../../../shared/constants/admin-permissions';

@Resolver(() => AdminTelegramBotModel)
@UseGuards(AuthGuard, AdminGuard, PermissionsGuard)
export class AdminTelegramBotsResolver {
  constructor(private adminTelegramBotsService: AdminTelegramBotsService) {}

  // ==================== QUERIES ====================

  @Query(() => [AdminTelegramBotModel], {
    description: 'Get all Telegram bots - Admin only',
  })
  @RequirePermissions(AdminPermissions.SETTINGS_TELEGRAM)
  async adminTelegramBots(
    @Args('includeInactive', { type: () => Boolean, nullable: true, defaultValue: false, description: 'Include inactive bots' })
    includeInactive?: boolean,
    @Args('baseUrl', { type: () => String, nullable: true, description: 'Base URL for webhook URLs' })
    baseUrl?: string,
  ): Promise<any[]> {
    return this.adminTelegramBotsService.findAll(includeInactive, baseUrl);
  }

  @Query(() => AdminTelegramBotModel, {
    nullable: true,
    description: 'Get specific Telegram bot by ID - Admin only',
  })
  @RequirePermissions(AdminPermissions.SETTINGS_TELEGRAM)
  async adminTelegramBot(
    @Args('id', { type: () => ID, nullable: true, description: 'Bot ID' }) id?: string,
    @Args('botName', { type: () => String, nullable: true, description: 'Bot name (e.g., "oauth", "support")' })
    botName?: string,
    @Args('baseUrl', { type: () => String, nullable: true, description: 'Base URL for webhook URL' })
    baseUrl?: string,
  ): Promise<any | null> {
    if (id) {
      return this.adminTelegramBotsService.findById(id, baseUrl);
    } else if (botName) {
      return this.adminTelegramBotsService.findByBotName(botName, baseUrl);
    }
    throw new Error('Either id or botName must be provided');
  }

  @Query(() => WebhookInfoModel, {
    description: 'Get webhook information for a bot from Telegram API - Admin only',
  })
  @RequirePermissions(AdminPermissions.SETTINGS_TELEGRAM)
  async adminTelegramBotWebhookInfo(
    @Args('botId', { type: () => ID }) botId: string,
  ): Promise<any> {
    return this.adminTelegramBotsService.getWebhookInfo(botId);
  }

  // ==================== MUTATIONS ====================

  @Mutation(() => AdminTelegramBotModel, {
    description: 'Create a new Telegram bot - Admin only',
  })
  @RequirePermissions(AdminPermissions.SETTINGS_TELEGRAM)
  async adminCreateTelegramBot(
    @Args('input', { type: () => CreateTelegramBotInput }) input: CreateTelegramBotInput,
    @CurrentUser() currentUser: CurrentUserData,
  ): Promise<any> {
    return this.adminTelegramBotsService.createBot(input, currentUser.id);
  }

  @Mutation(() => AdminTelegramBotModel, {
    description: 'Update an existing Telegram bot - Admin only',
  })
  @RequirePermissions(AdminPermissions.SETTINGS_TELEGRAM)
  async adminUpdateTelegramBot(
    @Args('botId', { type: () => ID }) botId: string,
    @Args('input', { type: () => UpdateTelegramBotInput }) input: UpdateTelegramBotInput,
    @CurrentUser() currentUser: CurrentUserData,
  ): Promise<any> {
    return this.adminTelegramBotsService.updateBot(botId, input, currentUser.id);
  }

  @Mutation(() => Boolean, {
    description: 'Delete a Telegram bot - Admin only',
  })
  @RequirePermissions(AdminPermissions.SETTINGS_TELEGRAM)
  async adminDeleteTelegramBot(
    @Args('botId', { type: () => ID }) botId: string,
    @CurrentUser() currentUser: CurrentUserData,
  ): Promise<boolean> {
    return this.adminTelegramBotsService.deleteBot(botId, currentUser.id);
  }

  @Mutation(() => AdminTelegramBotModel, {
    description: 'Sync bot information from Telegram API - Admin only',
  })
  @RequirePermissions(AdminPermissions.SETTINGS_TELEGRAM)
  async adminSyncTelegramBot(
    @Args('botId', { type: () => ID }) botId: string,
    @CurrentUser() currentUser: CurrentUserData,
  ): Promise<any> {
    return this.adminTelegramBotsService.syncBot(botId, currentUser.id);
  }

  @Mutation(() => TestBotResult, {
    description: 'Test a bot token without saving it - Admin only',
  })
  @RequirePermissions(AdminPermissions.SETTINGS_TELEGRAM)
  async adminTestTelegramBot(
    @Args('input', { type: () => TestBotTokenInput }) input: TestBotTokenInput,
  ): Promise<any> {
    return this.adminTelegramBotsService.testBotToken(input.token);
  }

  @Mutation(() => Boolean, {
    description: 'Set webhook for a bot - Admin only',
  })
  @RequirePermissions(AdminPermissions.SETTINGS_TELEGRAM)
  async adminSetTelegramWebhook(
    @Args('input', { type: () => SetWebhookInput }) input: SetWebhookInput,
    @CurrentUser() currentUser: CurrentUserData,
  ): Promise<boolean> {
    return this.adminTelegramBotsService.setWebhook(input.botId, input.webhookUrl, currentUser.id);
  }

  @Mutation(() => Boolean, {
    description: 'Delete webhook for a bot - Admin only',
  })
  @RequirePermissions(AdminPermissions.SETTINGS_TELEGRAM)
  async adminDeleteTelegramWebhook(
    @Args('botId', { type: () => ID }) botId: string,
    @CurrentUser() currentUser: CurrentUserData,
  ): Promise<boolean> {
    return this.adminTelegramBotsService.deleteWebhook(botId, currentUser.id);
  }

  @Mutation(() => Boolean, {
    description: 'Reload a bot (hot reload without restart) - Admin only',
  })
  @RequirePermissions(AdminPermissions.SETTINGS_TELEGRAM)
  async adminReloadTelegramBot(
    @Args('botId', { type: () => ID }) botId: string,
    @CurrentUser() currentUser: CurrentUserData,
  ): Promise<boolean> {
    return this.adminTelegramBotsService.reloadBot(botId, currentUser.id);
  }
}
