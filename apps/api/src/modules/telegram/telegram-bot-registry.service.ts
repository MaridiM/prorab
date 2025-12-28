import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { Telegraf, Context } from 'telegraf';
import { TelegramBotConfigService } from './telegram-bot-config.service';
import type { TelegramBot } from '@prisma/generated/client';

/**
 * Registry for managing dynamic Telegram bot instances
 * Allows hot-loading, reloading, and unloading bots without app restart
 */
@Injectable()
export class TelegramBotRegistry implements OnModuleDestroy {
  private readonly logger = new Logger(TelegramBotRegistry.name);
  private readonly bots = new Map<string, Telegraf<Context>>();

  constructor(private readonly botConfigService: TelegramBotConfigService) {}

  /**
   * Register a bot and start listening for updates
   */
  async registerBot(bot: TelegramBot): Promise<void> {
    this.logger.log(`Registering bot: ${bot.botName} (@${bot.username})`);

    try {
      // Get decrypted token
      const token = await this.botConfigService.getBotToken(bot.id);
      if (!token) {
        throw new Error(`No token found for bot: ${bot.botName}`);
      }

      // Create Telegraf instance
      const telegraf = new Telegraf(token);

      // Set up basic command handlers (can be extended later)
      telegraf.start((ctx) => {
        ctx.reply(`Hello! I'm ${bot.displayName}.`);
      });

      telegraf.help((ctx) => {
        ctx.reply('Available commands:\n/start - Start the bot\n/help - Show this help message');
      });

      // Store instance
      this.bots.set(bot.botName, telegraf);

      // Check if webhook is already set on the bot
      let hasWebhook = false;
      try {
        const webhookInfo = await telegraf.telegram.getWebhookInfo();
        hasWebhook = !!webhookInfo.url && webhookInfo.url.length > 0;
      } catch (error) {
        this.logger.warn(`Failed to check webhook status for bot ${bot.botName}: ${error.message}`);
      }

      // Set webhook if configured (non-blocking - fails gracefully)
      if (bot.webhookUrl) {
        try {
          // Delete existing webhook first to avoid conflicts
          if (hasWebhook) {
            await telegraf.telegram.deleteWebhook({ drop_pending_updates: false });
            this.logger.log(`Deleted existing webhook for bot ${bot.botName}`);
          }
          await telegraf.telegram.setWebhook(bot.webhookUrl);
          this.logger.log(`Webhook set for bot ${bot.botName}: ${bot.webhookUrl}`);
        } catch (webhookError) {
          this.logger.warn(
            `Failed to set webhook for bot ${bot.botName}: ${webhookError.message}. Bot registered but webhook not active.`
          );
        }
      } else if (hasWebhook) {
        // If webhook exists but not configured in DB, delete it to allow polling
        try {
          await telegraf.telegram.deleteWebhook({ drop_pending_updates: false });
          this.logger.log(`Deleted existing webhook for bot ${bot.botName} (no webhook URL in config)`);
        } catch (error) {
          this.logger.warn(`Failed to delete webhook for bot ${bot.botName}: ${error.message}`);
        }
      } else {
        this.logger.warn(`No webhook URL configured for bot: ${bot.botName}`);
      }

      // Don't launch polling - bots with webhooks should not use polling
      // Polling is only for bots without webhook configuration
      // If polling is needed, it should be explicitly enabled elsewhere

      this.logger.log(`Bot registered successfully: ${bot.botName}`);
    } catch (error) {
      this.logger.error(`Failed to register bot ${bot.botName}: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Unregister a bot and stop it
   */
  async unregisterBot(botName: string): Promise<void> {
    this.logger.log(`Unregistering bot: ${botName}`);

    const telegraf = this.bots.get(botName);
    if (!telegraf) {
      this.logger.warn(`Bot not found in registry: ${botName}`);
      return;
    }

    try {
      // Delete webhook
      await telegraf.telegram.deleteWebhook();

      // Stop bot
      telegraf.stop();

      // Remove from registry
      this.bots.delete(botName);

      this.logger.log(`Bot unregistered successfully: ${botName}`);
    } catch (error) {
      this.logger.error(`Failed to unregister bot ${botName}: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Reload a bot (unregister and re-register)
   */
  async reloadBot(botId: string): Promise<void> {
    this.logger.log(`Reloading bot: ${botId}`);

    const bot = await this.botConfigService.findById(botId);
    if (!bot) {
      throw new Error(`Bot not found: ${botId}`);
    }

    // Unregister if exists
    if (this.bots.has(bot.botName)) {
      await this.unregisterBot(bot.botName);
    }

    // Re-register
    await this.registerBot(bot);

    this.logger.log(`Bot reloaded successfully: ${bot.botName}`);
  }

  /**
   * Get bot instance by name
   */
  getBotInstance(botName: string): Telegraf<Context> | undefined {
    return this.bots.get(botName);
  }

  /**
   * Check if bot is registered
   */
  isBotRegistered(botName: string): boolean {
    return this.bots.has(botName);
  }

  /**
   * Get all registered bot names
   */
  getRegisteredBots(): string[] {
    return Array.from(this.bots.keys());
  }

  /**
   * Load all active bots from database on startup
   * Skips bots that are already registered via TelegrafModule (oauth, support)
   */
  async loadAllActiveBots(): Promise<void> {
    this.logger.log('Loading all active bots from database...');

    try {
      const bots = await this.botConfigService.findAll(false); // Only active bots

      // Bots that are already registered via TelegrafModule.forRootAsync
      // These should not be loaded again to avoid webhook/polling conflicts
      const excludedBotNames = ['oauth', 'support'];

      let successCount = 0;
      let failCount = 0;
      let skippedCount = 0;

      for (const bot of bots) {
        // Skip bots that are already registered via TelegrafModule
        if (excludedBotNames.includes(bot.botName)) {
          this.logger.log(`Skipping bot ${bot.botName} - already registered via TelegrafModule`);
          skippedCount++;
          continue;
        }

        try {
          await this.registerBot(bot);
          successCount++;
        } catch (error) {
          this.logger.error(`Failed to load bot ${bot.botName}: ${error.message}`);
          failCount++;
        }
      }

      this.logger.log(
        `Bot loading complete. Success: ${successCount}, Failed: ${failCount}, Skipped: ${skippedCount}, Total: ${bots.length}`,
      );
    } catch (error) {
      this.logger.error(`Failed to load bots: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Shutdown all bots on module destroy
   */
  async onModuleDestroy(): Promise<void> {
    this.logger.log('Shutting down all bots...');

    const botNames = Array.from(this.bots.keys());

    for (const botName of botNames) {
      try {
        await this.unregisterBot(botName);
      } catch (error) {
        this.logger.error(`Error shutting down bot ${botName}: ${error.message}`);
      }
    }

    this.logger.log('All bots shut down');
  }

  /**
   * Handle incoming webhook update
   */
  async handleWebhookUpdate(botName: string, update: any): Promise<void> {
    const bot = this.bots.get(botName);

    if (!bot) {
      this.logger.warn(`Webhook update received for unregistered bot: ${botName}`);
      throw new Error(`Bot not found: ${botName}`);
    }

    try {
      await bot.handleUpdate(update);
    } catch (error) {
      this.logger.error(`Error handling webhook update for ${botName}: ${error.message}`, error.stack);
      throw error;
    }
  }
}
