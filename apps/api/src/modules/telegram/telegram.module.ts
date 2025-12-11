import { Module } from '@nestjs/common'
import { TelegrafModule } from 'nestjs-telegraf'
import { ConfigService } from '@nestjs/config'
import { TelegramAuthService } from './telegram-auth.service'
import { TelegramSupportService } from './telegram-support.service'
import { FAQService } from './faq.service'
import { TelegramBot } from './telegram.bot'
import { TelegramSupportBot } from './telegram-support.bot'
import { PrismaModule } from '../../core/prisma/prisma.module'
import { UsersModule } from '../users/users.module'

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
					launchOptions: {
						// Development: polling
						// Production: webhook будет настроен отдельно
					},
				}
			},
			inject: [ConfigService],
		}),
		// Support Bot (@ProRabSupportBot)
		TelegrafModule.forRootAsync({
			botName: 'support',
			useFactory: (config: ConfigService) => {
				const botToken = config.get<string>('telegramSupport.botToken')

				if (!botToken) {
					console.warn(
						'TELEGRAM_SUPPORT_BOT_TOKEN is not set. Support bot will not be available.',
					)
					// Return minimal config without launchOptions
					return {
						token: 'dummy',
					}
				}

				return {
					token: botToken,
					// launchOptions: {} causes type error, omit it for default polling
				}
			},
			inject: [ConfigService],
		}),
		PrismaModule,
		UsersModule,
	],
	providers: [
		TelegramAuthService,
		TelegramSupportService,
		FAQService,
		TelegramBot, // OAuth Bot handler
		TelegramSupportBot, // Support Bot handler
	],
	exports: [TelegramAuthService, TelegramSupportService, FAQService],
})
export class TelegramModule {}
