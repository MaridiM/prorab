import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { TelegramBotConfigService } from '../../telegram/telegram-bot-config.service';
import { TelegramApiClient } from '../../telegram/telegram-api-client.service';
import { TelegramBotRegistry } from '../../telegram/telegram-bot-registry.service';
import { AdminActionLogService } from './admin-action-log.service';
import type { TelegramBot } from '@prisma/generated/client';
import type { CreateTelegramBotInput, UpdateTelegramBotInput } from '../dto/telegram-bot.input';
import type { TelegramBotConfigStatus } from '../models/admin-telegram-bot.model';

export interface TelegramBotWithStatus extends TelegramBot {
  configStatus?: TelegramBotConfigStatus;
}

@Injectable()
export class AdminTelegramBotsService {
  private readonly logger = new Logger(AdminTelegramBotsService.name);

  constructor(
    private readonly botConfigService: TelegramBotConfigService,
    private readonly telegramApiClient: TelegramApiClient,
    private readonly botRegistry: TelegramBotRegistry,
    private readonly auditService: AdminActionLogService,
  ) {}

  /**
   * Get all Telegram bots with their configuration status
   */
  async findAll(includeInactive = false, baseUrl?: string): Promise<TelegramBotWithStatus[]> {
    this.logger.log('Fetching all Telegram bots for admin panel');

    const bots = await this.botConfigService.findAll(includeInactive);

    // Enhance with configuration status and webhook URLs
    const enhancedBots = await Promise.all(
      bots.map(async (bot) => {
        const configStatus = await this.botConfigService.getConfigStatus(bot.id);

        return {
          ...bot,
          configStatus,
          webhookUrl: bot.webhookUrl || this.generateWebhookUrl(bot.botName, baseUrl),
        };
      }),
    );

    return enhancedBots;
  }

  /**
   * Get a specific Telegram bot by ID
   */
  async findById(id: string, baseUrl?: string): Promise<TelegramBotWithStatus> {
    this.logger.log(`Fetching Telegram bot by ID: ${id}`);

    const bot = await this.botConfigService.findById(id);

    if (!bot) {
      throw new NotFoundException(`Telegram bot not found: ${id}`);
    }

    const configStatus = await this.botConfigService.getConfigStatus(id);

    return {
      ...bot,
      configStatus,
      webhookUrl: bot.webhookUrl || this.generateWebhookUrl(bot.botName, baseUrl),
    };
  }

  /**
   * Get a specific Telegram bot by botName
   */
  async findByBotName(botName: string, baseUrl?: string): Promise<TelegramBotWithStatus | null> {
    this.logger.log(`Fetching Telegram bot by name: ${botName}`);

    const bot = await this.botConfigService.findByBotName(botName);

    if (!bot) {
      return null;
    }

    const configStatus = await this.botConfigService.getConfigStatus(bot.id);

    return {
      ...bot,
      configStatus,
      webhookUrl: bot.webhookUrl || this.generateWebhookUrl(bot.botName, baseUrl),
    };
  }

  /**
   * Create a new Telegram bot
   */
  async createBot(input: CreateTelegramBotInput, adminId: string): Promise<TelegramBot> {
    this.logger.log(`Admin ${adminId} creating new Telegram bot: ${input.botName}`);

    try {
      const bot = await this.botConfigService.create(
        {
          botName: input.botName,
          token: input.token,
          displayName: input.displayName,
          description: input.description,
          isActive: input.isActive,
          isPrimary: input.isPrimary,
        },
        adminId,
      );

      // Log admin action
      await this.auditService.logAction({
        adminUserId: adminId,
        action: 'CREATE_TELEGRAM_BOT',
        resource: 'TelegramBot',
        resourceId: bot.id,
        details: {
          botName: bot.botName,
          username: bot.username,
          displayName: bot.displayName,
          isActive: bot.isActive,
          isPrimary: bot.isPrimary,
        },
      });

      this.logger.log(`Telegram bot created successfully: ${bot.id}`);
      return bot;
    } catch (error) {
      this.logger.error(`Failed to create Telegram bot: ${error.message}`);
      throw error;
    }
  }

  /**
   * Update an existing Telegram bot
   */
  async updateBot(botId: string, input: UpdateTelegramBotInput, adminId: string): Promise<TelegramBot> {
    this.logger.log(`Admin ${adminId} updating Telegram bot: ${botId}`);

    // Get current state for audit log
    const botBefore = await this.botConfigService.findById(botId);
    if (!botBefore) {
      throw new NotFoundException(`Telegram bot not found: ${botId}`);
    }

    try {
      const bot = await this.botConfigService.update(botId, {
        token: input.token,
        displayName: input.displayName,
        description: input.description,
        isActive: input.isActive,
        isPrimary: input.isPrimary,
        webhookUrl: input.webhookUrl,
        avatarUrl: input.avatarUrl,
      });

      // Log admin action
      await this.auditService.logAction({
        adminUserId: adminId,
        action: 'UPDATE_TELEGRAM_BOT',
        resource: 'TelegramBot',
        resourceId: bot.id,
        details: {
          before: {
            displayName: botBefore.displayName,
            description: botBefore.description,
            isActive: botBefore.isActive,
            isPrimary: botBefore.isPrimary,
          },
          after: {
            displayName: bot.displayName,
            description: bot.description,
            isActive: bot.isActive,
            isPrimary: bot.isPrimary,
          },
          tokenUpdated: !!input.token,
        },
      });

      this.logger.log(`Telegram bot updated successfully: ${bot.id}`);
      return bot;
    } catch (error) {
      this.logger.error(`Failed to update Telegram bot: ${error.message}`);
      throw error;
    }
  }

  /**
   * Delete a Telegram bot
   */
  async deleteBot(botId: string, adminId: string): Promise<boolean> {
    this.logger.log(`Admin ${adminId} deleting Telegram bot: ${botId}`);

    const bot = await this.botConfigService.findById(botId);
    if (!bot) {
      throw new NotFoundException(`Telegram bot not found: ${botId}`);
    }

    try {
      await this.botConfigService.delete(botId);

      // Log admin action
      await this.auditService.logAction({
        adminUserId: adminId,
        action: 'DELETE_TELEGRAM_BOT',
        resource: 'TelegramBot',
        resourceId: botId,
        details: {
          botName: bot.botName,
          username: bot.username,
          displayName: bot.displayName,
        },
      });

      this.logger.log(`Telegram bot deleted successfully: ${botId}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to delete Telegram bot: ${error.message}`);
      throw error;
    }
  }

  /**
   * Sync bot information from Telegram API
   */
  async syncBot(botId: string, adminId: string): Promise<TelegramBot> {
    this.logger.log(`Admin ${adminId} syncing Telegram bot: ${botId}`);

    try {
      const bot = await this.botConfigService.syncBotInfo(botId);

      // Log admin action
      await this.auditService.logAction({
        adminUserId: adminId,
        action: 'SYNC_TELEGRAM_BOT',
        resource: 'TelegramBot',
        resourceId: botId,
        details: {
          username: bot.username,
          firstName: bot.firstName,
          avatarUrl: bot.avatarUrl,
        },
      });

      this.logger.log(`Telegram bot synced successfully: ${botId}`);
      return bot;
    } catch (error) {
      this.logger.error(`Failed to sync Telegram bot: ${error.message}`);
      throw error;
    }
  }

  /**
   * Test a bot token
   */
  async testBotToken(token: string) {
    this.logger.log('Testing bot token');

    try {
      const result = await this.telegramApiClient.testBotToken(token);
      return result;
    } catch (error) {
      this.logger.error(`Bot token test failed: ${error.message}`);
      return {
        valid: false,
        error: error.message,
      };
    }
  }

  /**
   * Set webhook for a bot
   */
  async setWebhook(botId: string, webhookUrl: string | undefined, adminId: string): Promise<boolean> {
    this.logger.log(`Admin ${adminId} setting webhook for bot: ${botId}`);

    try {
      const success = await this.botConfigService.setWebhook(botId, webhookUrl);

      if (success) {
        // Log admin action
        await this.auditService.logAction({
          adminUserId: adminId,
          action: 'SET_TELEGRAM_WEBHOOK',
          resource: 'TelegramBot',
          resourceId: botId,
          details: {
            webhookUrl,
          },
        });
      }

      return success;
    } catch (error) {
      this.logger.error(`Failed to set webhook: ${error.message}`);
      throw error;
    }
  }

  /**
   * Delete webhook for a bot
   */
  async deleteWebhook(botId: string, adminId: string): Promise<boolean> {
    this.logger.log(`Admin ${adminId} deleting webhook for bot: ${botId}`);

    try {
      const success = await this.botConfigService.deleteWebhook(botId);

      if (success) {
        // Log admin action
        await this.auditService.logAction({
          adminUserId: adminId,
          action: 'DELETE_TELEGRAM_WEBHOOK',
          resource: 'TelegramBot',
          resourceId: botId,
          details: {},
        });
      }

      return success;
    } catch (error) {
      this.logger.error(`Failed to delete webhook: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get webhook info for a bot
   */
  async getWebhookInfo(botId: string) {
    this.logger.log(`Getting webhook info for bot: ${botId}`);

    try {
      return await this.botConfigService.getWebhookInfo(botId);
    } catch (error) {
      this.logger.error(`Failed to get webhook info: ${error.message}`);
      throw error;
    }
  }

  /**
   * Reload a bot (hot reload without app restart)
   */
  async reloadBot(botId: string, adminId: string): Promise<boolean> {
    this.logger.log(`Admin ${adminId} requested bot reload: ${botId}`);

    try {
      await this.botRegistry.reloadBot(botId);

      // Log admin action
      await this.auditService.logAction({
        adminUserId: adminId,
        action: 'RELOAD_TELEGRAM_BOT',
        resource: 'TelegramBot',
        resourceId: botId,
        details: {
          success: true,
        },
      });

      this.logger.log(`Bot reloaded successfully: ${botId}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to reload bot: ${error.message}`);

      // Log failed action
      await this.auditService.logAction({
        adminUserId: adminId,
        action: 'RELOAD_TELEGRAM_BOT',
        resource: 'TelegramBot',
        resourceId: botId,
        details: {
          success: false,
          error: error.message,
        },
      });

      throw error;
    }
  }

  /**
   * Generate webhook URL for a bot
   */
  private generateWebhookUrl(botName: string, baseUrl?: string): string {
    const base = baseUrl || process.env.API_BASE_URL || 'https://api.prorab.space';
    return `${base}/webhooks/telegram/${botName}`;
  }
}
