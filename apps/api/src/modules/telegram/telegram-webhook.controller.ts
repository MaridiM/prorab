import { Controller, Post, Param, Body, NotFoundException, Logger, HttpCode } from '@nestjs/common';
import { TelegramBotRegistry } from './telegram-bot-registry.service';

/**
 * Controller for handling Telegram webhook updates
 * Route pattern: POST /webhooks/telegram/:botName
 */
@Controller('webhooks/telegram')
export class TelegramWebhookController {
  private readonly logger = new Logger(TelegramWebhookController.name);

  constructor(private readonly botRegistry: TelegramBotRegistry) {}

  /**
   * Handle incoming webhook update for a specific bot
   * @param botName - Bot identifier (e.g., "oauth", "support")
   * @param update - Telegram update object
   */
  @Post(':botName')
  @HttpCode(200)
  async handleWebhook(@Param('botName') botName: string, @Body() update: any): Promise<{ ok: boolean }> {
    this.logger.log(`Received webhook update for bot: ${botName}`);

    try {
      // Check if bot is registered
      if (!this.botRegistry.isBotRegistered(botName)) {
        this.logger.warn(`Webhook received for unregistered bot: ${botName}`);
        throw new NotFoundException(`Bot not found or not active: ${botName}`);
      }

      // Forward update to bot instance
      await this.botRegistry.handleWebhookUpdate(botName, update);

      this.logger.debug(`Webhook update processed successfully for bot: ${botName}`);
      return { ok: true };
    } catch (error) {
      this.logger.error(`Failed to process webhook for ${botName}: ${error.message}`, error.stack);
      throw error;
    }
  }
}
