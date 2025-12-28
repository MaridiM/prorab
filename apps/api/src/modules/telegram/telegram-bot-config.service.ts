import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../core/prisma/prisma.service';
import { EncryptionService } from '../../shared/services/encryption.service';
import { TelegramApiClient, BotInfo } from './telegram-api-client.service';
import { StorageService } from '../../core/storage/storage.service';
import { FileType } from '../../core/storage/interfaces/storage-provider.interface';
import type { TelegramBot } from '@prisma/generated/client';
import sharp from 'sharp';

export interface CreateTelegramBotInput {
  botName: string;
  token: string;
  displayName: string;
  description?: string;
  isActive?: boolean;
  isPrimary?: boolean;
}

export interface UpdateTelegramBotInput {
  token?: string;
  displayName?: string;
  description?: string;
  isActive?: boolean;
  isPrimary?: boolean;
  webhookUrl?: string;
  avatarUrl?: string;
}

export interface TelegramBotWithStatus extends TelegramBot {
  configStatus?: {
    hasToken: boolean;
    hasWebhook: boolean;
    isRegistered: boolean;
  };
}

@Injectable()
export class TelegramBotConfigService {
  private readonly logger = new Logger(TelegramBotConfigService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly encryptionService: EncryptionService,
    private readonly telegramApiClient: TelegramApiClient,
    private readonly storageService: StorageService,
  ) {}

  /**
   * Get all Telegram bots
   */
  async findAll(includeInactive = false): Promise<TelegramBot[]> {
    this.logger.log('Fetching all Telegram bots');

    return this.prisma.telegramBot.findMany({
      where: includeInactive ? undefined : { isActive: true },
      orderBy: [{ isPrimary: 'desc' }, { botName: 'asc' }],
    });
  }

  /**
   * Get a specific bot by ID
   */
  async findById(id: string): Promise<TelegramBot | null> {
    this.logger.log(`Fetching Telegram bot by ID: ${id}`);

    return this.prisma.telegramBot.findUnique({
      where: { id },
    });
  }

  /**
   * Get a specific bot by botName
   */
  async findByBotName(botName: string): Promise<TelegramBot | null> {
    this.logger.log(`Fetching Telegram bot by name: ${botName}`);

    return this.prisma.telegramBot.findUnique({
      where: { botName },
    });
  }

  /**
   * Get a specific bot by username
   */
  async findByUsername(username: string): Promise<TelegramBot | null> {
    this.logger.log(`Fetching Telegram bot by username: ${username}`);

    return this.prisma.telegramBot.findUnique({
      where: { username },
    });
  }

  /**
   * Get primary OAuth bot
   */
  async getPrimaryBot(): Promise<TelegramBot | null> {
    this.logger.log('Fetching primary OAuth bot');

    return this.prisma.telegramBot.findFirst({
      where: { isPrimary: true, isActive: true },
    });
  }

  /**
   * Create a new Telegram bot
   */
  async create(input: CreateTelegramBotInput, createdBy?: string): Promise<TelegramBot> {
    this.logger.log(`Creating new Telegram bot: ${input.botName}`);

    // Validate token by fetching bot info from Telegram
    const botInfo = await this.validateAndFetchBotInfo(input.token);

    // Check if bot with same botName or username already exists
    const existingByName = await this.findByBotName(input.botName);
    if (existingByName) {
      throw new BadRequestException(`Bot with name "${input.botName}" already exists`);
    }

    const existingByUsername = await this.findByUsername(botInfo.username);
    if (existingByUsername) {
      throw new BadRequestException(`Bot with username "@${botInfo.username}" already exists`);
    }

    // If setting as primary, unset other primary bots
    if (input.isPrimary === true) {
      await this.prisma.telegramBot.updateMany({
        where: { isPrimary: true },
        data: { isPrimary: false },
      });
      this.logger.log('Removed primary flag from other bots');
    }

    // Encrypt token
    const encryptedToken = this.encryptionService.encrypt(input.token);

    // Generate webhook URL
    const webhookUrl = this.generateWebhookUrl(input.botName);

    // Create bot in database
    const bot = await this.prisma.telegramBot.create({
      data: {
        botName: input.botName,
        token: encryptedToken,
        username: botInfo.username,
        displayName: input.displayName,
        description: input.description,
        isActive: input.isActive ?? true,
        isPrimary: input.isPrimary ?? false,
        webhookUrl,
        firstName: botInfo.firstName,
        canJoinGroups: botInfo.canJoinGroups,
        canReadMessages: botInfo.canReadMessages,
        supportsInlineQueries: botInfo.supportsInlineQueries,
        createdBy,
        lastSyncAt: new Date(),
      },
    });

    this.logger.log(`Telegram bot created successfully: ${bot.id}`);
    return bot;
  }

  /**
   * Update an existing Telegram bot
   */
  async update(id: string, input: UpdateTelegramBotInput): Promise<TelegramBot> {
    this.logger.log(`Updating Telegram bot: ${id}`);

    const bot = await this.findById(id);
    if (!bot) {
      throw new NotFoundException(`Telegram bot not found: ${id}`);
    }

    const updateData: any = {};

    // If token is being updated, validate it and fetch new bot info
    if (input.token) {
      const botInfo = await this.validateAndFetchBotInfo(input.token);

      // Check if username changed and conflicts with another bot
      if (botInfo.username !== bot.username) {
        const existingByUsername = await this.findByUsername(botInfo.username);
        if (existingByUsername && existingByUsername.id !== id) {
          throw new BadRequestException(`Bot with username "@${botInfo.username}" already exists`);
        }
      }

      updateData.token = this.encryptionService.encrypt(input.token);
      updateData.username = botInfo.username;
      updateData.firstName = botInfo.firstName;
      updateData.canJoinGroups = botInfo.canJoinGroups;
      updateData.canReadMessages = botInfo.canReadMessages;
      updateData.supportsInlineQueries = botInfo.supportsInlineQueries;
      updateData.lastSyncAt = new Date();
    }

    // Update other fields
    if (input.displayName !== undefined) updateData.displayName = input.displayName;
    if (input.description !== undefined) updateData.description = input.description;
    if (input.isActive !== undefined) updateData.isActive = input.isActive;
    if (input.webhookUrl !== undefined) updateData.webhookUrl = input.webhookUrl;
    if (input.avatarUrl !== undefined) updateData.avatarUrl = input.avatarUrl;

    // If setting as primary, unset other primary bots
    if (input.isPrimary === true && !bot.isPrimary) {
      await this.prisma.telegramBot.updateMany({
        where: { id: { not: id }, isPrimary: true },
        data: { isPrimary: false },
      });
      this.logger.log('Removed primary flag from other bots');
      updateData.isPrimary = true;
    } else if (input.isPrimary === false) {
      updateData.isPrimary = false;
    }

    const updatedBot = await this.prisma.telegramBot.update({
      where: { id },
      data: updateData,
    });

    this.logger.log(`Telegram bot updated successfully: ${id}`);
    return updatedBot;
  }

  /**
   * Delete a Telegram bot
   */
  async delete(id: string): Promise<void> {
    this.logger.log(`Deleting Telegram bot: ${id}`);

    const bot = await this.findById(id);
    if (!bot) {
      throw new NotFoundException(`Telegram bot not found: ${id}`);
    }

    await this.prisma.telegramBot.delete({
      where: { id },
    });

    this.logger.log(`Telegram bot deleted successfully: ${id}`);
  }

  /**
   * Sync bot information from Telegram API
   */
  async syncBotInfo(id: string): Promise<TelegramBot> {
    this.logger.log(`Syncing bot info from Telegram API: ${id}`);

    const bot = await this.findById(id);
    if (!bot) {
      throw new NotFoundException(`Telegram bot not found: ${id}`);
    }

    const decryptedToken = this.getDecryptedToken(bot);
    const botInfo = await this.validateAndFetchBotInfo(decryptedToken);

    // Fetch avatar URL from Telegram and upload to R2
    const avatarUrl = await this.uploadBotAvatarFromTelegram(id, decryptedToken, botInfo.id);

    const updatedBot = await this.prisma.telegramBot.update({
      where: { id },
      data: {
        username: botInfo.username,
        firstName: botInfo.firstName,
        canJoinGroups: botInfo.canJoinGroups,
        canReadMessages: botInfo.canReadMessages,
        supportsInlineQueries: botInfo.supportsInlineQueries,
        avatarUrl,
        lastSyncAt: new Date(),
      },
    });

    this.logger.log(`Bot info synced successfully: ${id}`);
    return updatedBot;
  }

  /**
   * Upload bot avatar from Telegram to R2 storage
   */
  async uploadBotAvatarFromTelegram(
    botId: string,
    token: string,
    botUserId: number,
  ): Promise<string | null> {
    try {
      this.logger.log(`Uploading bot avatar for: ${botId}`);

      // Get avatar URL from Telegram
      const telegramAvatarUrl = await this.telegramApiClient.getBotAvatar(token, botUserId);

      if (!telegramAvatarUrl) {
        this.logger.warn(`No avatar found for bot ${botId}`);
        return null;
      }

      // Fetch the image from Telegram
      const response = await fetch(telegramAvatarUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch avatar from Telegram: ${response.statusText}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Process image with Sharp (512x512, contain mode)
      const processedBuffer = await sharp(buffer)
        .resize(512, 512, {
          fit: 'contain',
          background: { r: 255, g: 255, b: 255, alpha: 0 },
        })
        .webp({ quality: 90 })
        .toBuffer();

      // Get metadata
      const metadata = await sharp(processedBuffer).metadata();

      // Generate unique filename
      const timestamp = Date.now();
      const filename = `bot-${botId}-${timestamp}.webp`;

      // Create file metadata
      const fileMetadata = {
        userId: 'system', // System user for bot avatars
        fileType: FileType.BOT_AVATAR,
        filename,
        mimetype: 'image/webp',
        size: processedBuffer.length,
        width: metadata.width,
        height: metadata.height,
      };

      // Upload to storage (using system user context)
      const provider = await (this.storageService as any).providerFactory.getProvider('system');
      const result = await provider.upload(processedBuffer, fileMetadata);

      this.logger.log(`Bot avatar uploaded successfully: ${result.url}`);
      return result.url;
    } catch (error) {
      this.logger.error(`Failed to upload bot avatar: ${error.message}`);
      return null; // Return null on error, don't fail the whole sync
    }
  }

  /**
   * Get bot token (decrypted) - ONLY for internal use
   * @param botNameOrId Bot name or ID
   * @returns Decrypted token or null if not found
   */
  async getBotToken(botNameOrId: string): Promise<string | null> {
    this.logger.log(`Getting bot token for: ${botNameOrId}`);

    // Try to find by botName first
    let bot = await this.findByBotName(botNameOrId);

    // If not found, try by ID
    if (!bot) {
      bot = await this.findById(botNameOrId);
    }

    // If still not found, fallback to environment variable
    if (!bot) {
      this.logger.warn(`Bot not found in database, checking environment variables: ${botNameOrId}`);
      return this.getTokenFromEnv(botNameOrId);
    }

    // Check if bot is active
    if (!bot.isActive) {
      this.logger.warn(`Bot is inactive: ${botNameOrId}`);
      return null;
    }

    return this.getDecryptedToken(bot);
  }

  /**
   * Get token from environment variables (fallback)
   */
  private getTokenFromEnv(botName: string): string | null {
    const envMap: Record<string, string | undefined> = {
      oauth: process.env.TELEGRAM_BOT_TOKEN,
      support: process.env.TELEGRAM_SUPPORT_BOT_TOKEN,
    };

    const token = envMap[botName.toLowerCase()];

    if (token) {
      this.logger.log(`Using token from environment for: ${botName}`);
      return token;
    }

    this.logger.warn(`No token found in database or environment for: ${botName}`);
    return null;
  }

  /**
   * Initialize default bots from environment variables
   * Called once during application startup
   */
  async initializeDefaultBots(): Promise<void> {
    this.logger.log('Initializing default Telegram bots from environment variables');

    // OAuth Bot
    const oauthToken = process.env.TELEGRAM_BOT_TOKEN;
    if (oauthToken) {
      const existingOAuth = await this.findByBotName('oauth');
      if (!existingOAuth) {
        try {
          const botInfo = await this.telegramApiClient.getBotInfo(oauthToken);
          await this.create(
            {
              botName: 'oauth',
              token: oauthToken,
              displayName: 'OAuth Bot',
              description: 'Основной бот для аутентификации',
              isActive: true,
              isPrimary: true,
            },
            'system',
          );
          this.logger.log('OAuth bot initialized from environment');
        } catch (error) {
          this.logger.error(`Failed to initialize OAuth bot: ${error.message}`);
        }
      }
    }

    // Support Bot
    const supportToken = process.env.TELEGRAM_SUPPORT_BOT_TOKEN;
    if (supportToken) {
      const existingSupport = await this.findByBotName('support');
      if (!existingSupport) {
        try {
          const botInfo = await this.telegramApiClient.getBotInfo(supportToken);
          await this.create(
            {
              botName: 'support',
              token: supportToken,
              displayName: 'Support Bot',
              description: 'Бот поддержки и FAQ',
              isActive: true,
              isPrimary: false,
            },
            'system',
          );
          this.logger.log('Support bot initialized from environment');
        } catch (error) {
          this.logger.error(`Failed to initialize Support bot: ${error.message}`);
        }
      }
    }

    this.logger.log('Default bots initialization complete');
  }

  /**
   * Validate token and fetch bot info from Telegram
   */
  private async validateAndFetchBotInfo(token: string): Promise<BotInfo> {
    try {
      const result = await this.telegramApiClient.testBotToken(token);

      if (!result.valid || !result.botInfo) {
        throw new BadRequestException(result.error || 'Invalid bot token');
      }

      return result.botInfo;
    } catch (error) {
      this.logger.error(`Token validation failed: ${error.message}`);
      throw new BadRequestException('Invalid bot token or unable to reach Telegram API');
    }
  }

  /**
   * Get decrypted token from bot object
   */
  private getDecryptedToken(bot: TelegramBot): string {
    try {
      return this.encryptionService.decrypt(bot.token);
    } catch (error) {
      this.logger.error(`Failed to decrypt token for bot ${bot.id}: ${error.message}`);
      throw new Error('Failed to decrypt bot token');
    }
  }

  /**
   * Generate webhook URL for bot
   */
  private generateWebhookUrl(botName: string): string {
    const baseUrl = process.env.API_BASE_URL || 'https://api.prorab.space';
    return `${baseUrl}/webhooks/telegram/${botName}`;
  }

  /**
   * Get configuration status for a bot
   */
  async getConfigStatus(id: string): Promise<{
    hasToken: boolean;
    hasWebhook: boolean;
    isRegistered: boolean;
  }> {
    const bot = await this.findById(id);

    if (!bot) {
      return {
        hasToken: false,
        hasWebhook: false,
        isRegistered: false,
      };
    }

    return {
      hasToken: !!bot.token && bot.token.length > 0,
      hasWebhook: !!bot.webhookUrl,
      isRegistered: bot.isActive,
    };
  }

  /**
   * Set webhook for bot
   */
  async setWebhook(id: string, webhookUrl?: string): Promise<boolean> {
    this.logger.log(`Setting webhook for bot: ${id}`);

    const bot = await this.findById(id);
    if (!bot) {
      throw new NotFoundException(`Telegram bot not found: ${id}`);
    }

    const token = this.getDecryptedToken(bot);
    const url = webhookUrl || bot.webhookUrl || this.generateWebhookUrl(bot.botName);

    const success = await this.telegramApiClient.setWebhook(token, url);

    if (success) {
      await this.prisma.telegramBot.update({
        where: { id },
        data: { webhookUrl: url },
      });
    }

    return success;
  }

  /**
   * Delete webhook for bot
   */
  async deleteWebhook(id: string): Promise<boolean> {
    this.logger.log(`Deleting webhook for bot: ${id}`);

    const bot = await this.findById(id);
    if (!bot) {
      throw new NotFoundException(`Telegram bot not found: ${id}`);
    }

    const token = this.getDecryptedToken(bot);
    return this.telegramApiClient.deleteWebhook(token);
  }

  /**
   * Get webhook info for bot
   */
  async getWebhookInfo(id: string) {
    this.logger.log(`Getting webhook info for bot: ${id}`);

    const bot = await this.findById(id);
    if (!bot) {
      throw new NotFoundException(`Telegram bot not found: ${id}`);
    }

    const token = this.getDecryptedToken(bot);
    return this.telegramApiClient.getWebhookInfo(token);
  }
}
