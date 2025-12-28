import { Injectable, Logger } from '@nestjs/common';

export interface BotInfo {
  id: number;
  username: string;
  firstName: string;
  canJoinGroups: boolean;
  canReadMessages: boolean;
  supportsInlineQueries: boolean;
}

export interface WebhookInfo {
  url: string;
  hasCustomCertificate: boolean;
  pendingUpdateCount: number;
  lastErrorDate?: number;
  lastErrorMessage?: string;
  maxConnections?: number;
  allowedUpdates?: string[];
}

@Injectable()
export class TelegramApiClient {
  private readonly logger = new Logger(TelegramApiClient.name);

  /**
   * Get bot information from Telegram API
   */
  async getBotInfo(token: string): Promise<BotInfo> {
    try {
      const response = await fetch(`https://api.telegram.org/bot${token}/getMe`);
      const data = await response.json();

      if (!data.ok) {
        throw new Error(`Telegram API error: ${data.description}`);
      }

      return {
        id: data.result.id,
        username: data.result.username,
        firstName: data.result.first_name,
        canJoinGroups: data.result.can_join_groups || false,
        canReadMessages: data.result.can_read_all_group_messages || false,
        supportsInlineQueries: data.result.supports_inline_queries || false,
      };
    } catch (error) {
      this.logger.error(`Failed to get bot info: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get bot avatar URL from Telegram
   */
  async getBotAvatar(token: string, botUserId: number): Promise<string | null> {
    try {
      // Get user profile photos
      const photosResponse = await fetch(
        `https://api.telegram.org/bot${token}/getUserProfilePhotos?user_id=${botUserId}&limit=1`
      );
      const photosData = await photosResponse.json();

      if (!photosData.ok || !photosData.result.photos || photosData.result.photos.length === 0) {
        this.logger.warn(`No avatar found for bot ${botUserId}`);
        return null;
      }

      // Get the largest photo size
      const photo = photosData.result.photos[0];
      const largestPhoto = photo[photo.length - 1];
      const fileId = largestPhoto.file_id;

      // Get file path
      const fileResponse = await fetch(
        `https://api.telegram.org/bot${token}/getFile?file_id=${fileId}`
      );
      const fileData = await fileResponse.json();

      if (!fileData.ok) {
        throw new Error(`Failed to get file info: ${fileData.description}`);
      }

      // Return full file URL
      return `https://api.telegram.org/file/bot${token}/${fileData.result.file_path}`;
    } catch (error) {
      this.logger.error(`Failed to get bot avatar: ${error.message}`);
      return null;
    }
  }

  /**
   * Set webhook for bot
   */
  async setWebhook(token: string, webhookUrl: string): Promise<boolean> {
    try {
      const response = await fetch(
        `https://api.telegram.org/bot${token}/setWebhook`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: webhookUrl }),
        }
      );
      const data = await response.json();

      if (!data.ok) {
        throw new Error(`Failed to set webhook: ${data.description}`);
      }

      this.logger.log(`Webhook set successfully for URL: ${webhookUrl}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to set webhook: ${error.message}`);
      throw error;
    }
  }

  /**
   * Delete webhook
   */
  async deleteWebhook(token: string): Promise<boolean> {
    try {
      const response = await fetch(
        `https://api.telegram.org/bot${token}/deleteWebhook`,
        {
          method: 'POST',
        }
      );
      const data = await response.json();

      if (!data.ok) {
        throw new Error(`Failed to delete webhook: ${data.description}`);
      }

      this.logger.log('Webhook deleted successfully');
      return true;
    } catch (error) {
      this.logger.error(`Failed to delete webhook: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get current webhook info
   */
  async getWebhookInfo(token: string): Promise<WebhookInfo> {
    try {
      const response = await fetch(
        `https://api.telegram.org/bot${token}/getWebhookInfo`
      );
      const data = await response.json();

      if (!data.ok) {
        throw new Error(`Failed to get webhook info: ${data.description}`);
      }

      const result = data.result;
      return {
        url: result.url || '',
        hasCustomCertificate: result.has_custom_certificate || false,
        pendingUpdateCount: result.pending_update_count || 0,
        lastErrorDate: result.last_error_date,
        lastErrorMessage: result.last_error_message,
        maxConnections: result.max_connections,
        allowedUpdates: result.allowed_updates,
      };
    } catch (error) {
      this.logger.error(`Failed to get webhook info: ${error.message}`);
      throw error;
    }
  }

  /**
   * Test bot token validity
   */
  async testBotToken(token: string): Promise<{ valid: boolean; botInfo?: BotInfo; error?: string }> {
    try {
      const botInfo = await this.getBotInfo(token);
      return { valid: true, botInfo };
    } catch (error) {
      return { valid: false, error: error.message };
    }
  }
}
