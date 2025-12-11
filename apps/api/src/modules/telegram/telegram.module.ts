import { Module } from '@nestjs/common'
import { TelegrafModule } from 'nestjs-telegraf'
import { ConfigService } from '@nestjs/config'
import { TelegramAuthService } from './telegram-auth.service'
import { TelegramBot } from './telegram.bot'
import { PrismaModule } from '../../core/prisma/prisma.module'

@Module({
	imports: [
		TelegrafModule.forRootAsync({
			useFactory: (config: ConfigService) => {
				const botToken = config.get<string>('telegram.botToken')

				if (!botToken) {
					throw new Error(
						'TELEGRAM_BOT_TOKEN is not set. Please create a bot via @BotFather and add the token to .env',
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
		PrismaModule,
	],
	providers: [TelegramAuthService, TelegramBot],
	exports: [TelegramAuthService],
})
export class TelegramModule {}
