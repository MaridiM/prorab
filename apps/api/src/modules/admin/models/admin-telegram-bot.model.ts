import { ObjectType, Field, ID } from '@nestjs/graphql';

// ==================== OBJECT TYPES ====================

@ObjectType({ description: 'Telegram bot configuration status' })
export class TelegramBotConfigStatus {
  @Field(() => Boolean, { description: 'Whether bot token is configured' })
  hasToken: boolean;

  @Field(() => Boolean, { description: 'Whether webhook is configured' })
  hasWebhook: boolean;

  @Field(() => Boolean, { description: 'Whether bot is registered and active' })
  isRegistered: boolean;
}

@ObjectType({ description: 'Bot information from Telegram API' })
export class BotInfoModel {
  @Field(() => Number, { description: 'Telegram bot user ID' })
  id: number;

  @Field(() => String, { description: 'Bot username without @' })
  username: string;

  @Field(() => String, { description: 'Bot first name' })
  firstName: string;

  @Field(() => Boolean, { description: 'Can the bot join groups' })
  canJoinGroups: boolean;

  @Field(() => Boolean, { description: 'Can the bot read all group messages' })
  canReadMessages: boolean;

  @Field(() => Boolean, { description: 'Does the bot support inline queries' })
  supportsInlineQueries: boolean;
}

@ObjectType({ description: 'Test bot token result' })
export class TestBotResult {
  @Field(() => Boolean, { description: 'Whether the token is valid' })
  valid: boolean;

  @Field(() => BotInfoModel, { nullable: true, description: 'Bot information if token is valid' })
  botInfo?: BotInfoModel;

  @Field(() => String, { nullable: true, description: 'Error message if token is invalid' })
  error?: string;
}

@ObjectType({ description: 'Webhook information from Telegram' })
export class WebhookInfoModel {
  @Field(() => String, { description: 'Current webhook URL' })
  url: string;

  @Field(() => Boolean, { description: 'Whether a custom certificate is used' })
  hasCustomCertificate: boolean;

  @Field(() => Number, { description: 'Number of pending updates' })
  pendingUpdateCount: number;

  @Field(() => Number, { nullable: true, description: 'Unix timestamp of last error' })
  lastErrorDate?: number;

  @Field(() => String, { nullable: true, description: 'Last error message' })
  lastErrorMessage?: string;

  @Field(() => Number, { nullable: true, description: 'Maximum allowed connections' })
  maxConnections?: number;

  @Field(() => [String], { nullable: true, description: 'Allowed update types' })
  allowedUpdates?: string[];
}

@ObjectType({ description: 'Admin view of Telegram bot' })
export class AdminTelegramBotModel {
  @Field(() => ID)
  id: string;

  @Field(() => String, { description: 'Unique bot identifier (e.g., "oauth", "support")' })
  botName: string;

  @Field(() => String, { description: 'Bot username (e.g., "ProRabSpaceBot")' })
  username: string;

  @Field(() => String, { description: 'Display name for admin panel' })
  displayName: string;

  @Field(() => String, { nullable: true, description: 'Bot description/purpose' })
  description?: string;

  @Field(() => Boolean, { description: 'Whether the bot is currently active' })
  isActive: boolean;

  @Field(() => Boolean, { description: 'Whether this is the primary OAuth bot' })
  isPrimary: boolean;

  @Field(() => String, { nullable: true, description: 'Webhook URL for this bot' })
  webhookUrl?: string;

  @Field(() => String, { nullable: true, description: 'Avatar URL from Telegram or R2' })
  avatarUrl?: string;

  @Field(() => String, { nullable: true, description: 'Bot first name from Telegram' })
  firstName?: string;

  @Field(() => Boolean, { description: 'Can the bot join groups' })
  canJoinGroups: boolean;

  @Field(() => Boolean, { description: 'Can the bot read all group messages' })
  canReadMessages: boolean;

  @Field(() => Boolean, { description: 'Does the bot support inline queries' })
  supportsInlineQueries: boolean;

  @Field(() => TelegramBotConfigStatus, { nullable: true, description: 'Configuration status' })
  configStatus?: TelegramBotConfigStatus;

  @Field(() => String, { nullable: true, description: 'ID of admin who created this bot' })
  createdBy?: string;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;

  @Field(() => Date, { nullable: true, description: 'Last time bot info was synced from Telegram' })
  lastSyncAt?: Date;
}
