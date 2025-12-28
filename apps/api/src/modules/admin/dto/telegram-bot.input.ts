import { InputType, Field } from '@nestjs/graphql';
import { IsString, IsNotEmpty, MinLength, MaxLength, IsBoolean, IsOptional, Matches } from 'class-validator';

@InputType({ description: 'Input for creating a new Telegram bot' })
export class CreateTelegramBotInput {
  @Field(() => String, { description: 'Unique bot identifier (e.g., "oauth", "support", "notifications")' })
  @IsString()
  @IsNotEmpty({ message: 'Bot name is required' })
  @MinLength(2, { message: 'Bot name must be at least 2 characters' })
  @MaxLength(50, { message: 'Bot name must not exceed 50 characters' })
  @Matches(/^[a-z0-9_-]+$/, { message: 'Bot name can only contain lowercase letters, numbers, hyphens, and underscores' })
  botName: string;

  @Field(() => String, { description: 'Bot token from @BotFather' })
  @IsString()
  @IsNotEmpty({ message: 'Bot token is required' })
  @MinLength(30, { message: 'Bot token appears to be invalid (too short)' })
  token: string;

  @Field(() => String, { description: 'Display name for admin panel (e.g., "OAuth Bot", "Support Bot")' })
  @IsString()
  @IsNotEmpty({ message: 'Display name is required' })
  @MinLength(2, { message: 'Display name must be at least 2 characters' })
  @MaxLength(100, { message: 'Display name must not exceed 100 characters' })
  displayName: string;

  @Field(() => String, { nullable: true, description: 'Description of bot purpose' })
  @IsString()
  @IsOptional()
  @MaxLength(500, { message: 'Description must not exceed 500 characters' })
  description?: string;

  @Field(() => Boolean, { nullable: true, defaultValue: true, description: 'Whether the bot should be active' })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @Field(() => Boolean, { nullable: true, defaultValue: false, description: 'Whether this is the primary OAuth bot' })
  @IsBoolean()
  @IsOptional()
  isPrimary?: boolean;
}

@InputType({ description: 'Input for updating an existing Telegram bot' })
export class UpdateTelegramBotInput {
  @Field(() => String, { nullable: true, description: 'New bot token (only if changing)' })
  @IsString()
  @IsOptional()
  @MinLength(30, { message: 'Bot token appears to be invalid (too short)' })
  token?: string;

  @Field(() => String, { nullable: true, description: 'Updated display name' })
  @IsString()
  @IsOptional()
  @MinLength(2, { message: 'Display name must be at least 2 characters' })
  @MaxLength(100, { message: 'Display name must not exceed 100 characters' })
  displayName?: string;

  @Field(() => String, { nullable: true, description: 'Updated description' })
  @IsString()
  @IsOptional()
  @MaxLength(500, { message: 'Description must not exceed 500 characters' })
  description?: string;

  @Field(() => Boolean, { nullable: true, description: 'Whether the bot should be active' })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @Field(() => Boolean, { nullable: true, description: 'Whether this is the primary OAuth bot' })
  @IsBoolean()
  @IsOptional()
  isPrimary?: boolean;

  @Field(() => String, { nullable: true, description: 'Custom webhook URL (advanced)' })
  @IsString()
  @IsOptional()
  webhookUrl?: string;

  @Field(() => String, { nullable: true, description: 'Avatar URL (usually auto-fetched from Telegram)' })
  @IsString()
  @IsOptional()
  avatarUrl?: string;
}

@InputType({ description: 'Input for testing a bot token' })
export class TestBotTokenInput {
  @Field(() => String, { description: 'Bot token to test' })
  @IsString()
  @IsNotEmpty({ message: 'Bot token is required' })
  @MinLength(30, { message: 'Bot token appears to be invalid (too short)' })
  token: string;
}

@InputType({ description: 'Input for setting webhook' })
export class SetWebhookInput {
  @Field(() => String, { description: 'Bot ID' })
  @IsString()
  @IsNotEmpty({ message: 'Bot ID is required' })
  botId: string;

  @Field(() => String, { nullable: true, description: 'Custom webhook URL (optional, uses default if not provided)' })
  @IsString()
  @IsOptional()
  webhookUrl?: string;
}
