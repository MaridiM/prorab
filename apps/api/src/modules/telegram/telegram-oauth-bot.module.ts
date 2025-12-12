import { Module } from '@nestjs/common'
import { TelegramBot } from './telegram.bot'
import { TelegramAuthService } from './telegram-auth.service'
import { PrismaModule } from '../../core/prisma/prisma.module'

/**
 * Module for OAuth Bot (@ProRabSpaceBot) handlers only
 * This module is included only in the OAuth bot configuration
 */
@Module({
	imports: [PrismaModule],
	providers: [TelegramBot, TelegramAuthService],
	exports: [TelegramAuthService],
})
export class TelegramOAuthBotModule {}
