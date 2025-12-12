import { Module } from '@nestjs/common'
import { TelegrafModule } from 'nestjs-telegraf'
import { ConfigService } from '@nestjs/config'
import { TelegramOAuthBotModule } from './telegram-oauth-bot.module'
import { TelegramSupportBotModule } from './telegram-support-bot.module'
import { PrismaModule } from '../../core/prisma/prisma.module'
import { UsersModule } from '../users/users.module'
import { session } from 'telegraf'

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
		UsersModule,
		TelegramOAuthBotModule, // Import OAuth bot module (exports TelegramAuthService)
		TelegramSupportBotModule, // Import Support bot module (exports TelegramSupportService, FAQService)
	],
	providers: [
		// Services are provided by their respective bot modules
	],
	exports: [
		TelegramOAuthBotModule, // Re-export to make TelegramAuthService available
		TelegramSupportBotModule, // Re-export to make TelegramSupportService and FAQService available
	],
})
export class TelegramModule {}
