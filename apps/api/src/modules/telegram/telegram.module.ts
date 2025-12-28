import { Module, OnModuleInit } from '@nestjs/common'
import { TelegrafModule } from 'nestjs-telegraf'
import { ConfigService } from '@nestjs/config'
import { TelegramOAuthBotModule } from './telegram-oauth-bot.module'
import { TelegramSupportBotModule } from './telegram-support-bot.module'
import { PrismaModule } from '../../core/prisma/prisma.module'
import { StorageModule } from '../../core/storage/storage.module'
import { UsersModule } from '../users/users.module'
import { session } from 'telegraf'
import { TelegramBotConfigService } from './telegram-bot-config.service'
import { TelegramApiClient } from './telegram-api-client.service'
import { TelegramBotRegistry } from './telegram-bot-registry.service'
import { TelegramWebhookController } from './telegram-webhook.controller'
import { SharedModule } from '../../shared/shared.module'

@Module({
	imports: [
		// OAuth Bot (@ProRabSpaceBot)
		TelegrafModule.forRootAsync({
			botName: 'oauth',
			useFactory: (config: ConfigService) => {
				const botToken = config.get<string>('telegram.botToken')

				if (!botToken) {
					throw new Error(
						'TELEGRAM_BOT_TOKEN is not set. Please create @ProRabSpaceBot via @BotFather and add the token to .env',
					)
				}

				return {
					token: botToken,
					middlewares: [session()],
					include: [TelegramOAuthBotModule], // Only include OAuth bot handlers
				}
			},
			inject: [ConfigService],
		}),
		// Support Bot (@ProRabSupportBot)
		TelegrafModule.forRootAsync({
			botName: 'support',
			useFactory: (config: ConfigService) => {
				const botToken = config.get<string>('telegramSupport.botToken')

				if (!botToken || botToken === 'dummy' || botToken.trim() === '') {
					const logger = new (require('@nestjs/common').Logger)('TelegramModule')
					logger.error(
						'❌ TELEGRAM_SUPPORT_BOT_TOKEN is not set or invalid!',
					)
					logger.error(
						'   Support bot will NOT work. Please set TELEGRAM_SUPPORT_BOT_TOKEN in .env',
					)
					// Return dummy token but log error - module will initialize but bot won't work
					return {
						token: 'dummy',
					}
				}

				const logger = new (require('@nestjs/common').Logger)('TelegramModule')
				logger.log(`✅ Support Bot token configured (length: ${botToken.length})`)

				return {
					token: botToken,
					middlewares: [session()],
					include: [TelegramSupportBotModule], // Only include Support bot handlers
				}
			},
			inject: [ConfigService],
		}),
		PrismaModule,
		StorageModule, // For StorageService
		SharedModule, // For EncryptionService
		UsersModule,
		TelegramOAuthBotModule, // Import OAuth bot module (exports TelegramAuthService)
		TelegramSupportBotModule, // Import Support bot module (exports TelegramSupportService, FAQService)
	],
	controllers: [TelegramWebhookController],
	providers: [
		// Bot configuration services
		TelegramBotConfigService,
		TelegramApiClient,
		TelegramBotRegistry,
		// Services are provided by their respective bot modules
		// TelegramAuthService is provided by TelegramOAuthBotModule
	],
	exports: [
		TelegramBotConfigService, // Export for use in AdminModule
		TelegramApiClient, // Export for use in AdminModule
		TelegramBotRegistry, // Export for use in AdminModule
		TelegramOAuthBotModule, // Re-export to make TelegramAuthService available
		TelegramSupportBotModule, // Re-export to make TelegramSupportService and FAQService available
	],
})
export class TelegramModule implements OnModuleInit {
	constructor(
		private readonly botConfigService: TelegramBotConfigService,
		private readonly botRegistry: TelegramBotRegistry,
	) {}

	/**
	 * Initialize default bots and load active bots on module startup
	 */
	async onModuleInit() {
		try {
			// Step 1: Initialize default bots from env variables (if not exists in DB)
			await this.botConfigService.initializeDefaultBots()

			// Step 2: Load all active bots from database into registry
			await this.botRegistry.loadAllActiveBots()
			console.log('[TelegramModule] Bot registry auto-loading enabled - all active bots loaded')
		} catch (error) {
			// Log error but don't prevent app from starting
			console.error('Failed to initialize Telegram bots:', error)
		}
	}
}
