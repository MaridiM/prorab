import { Module } from '@nestjs/common'
import { TelegramSupportBot } from './telegram-support.bot'
import { TelegramSupportService } from './telegram-support.service'
import { FAQService } from './faq.service'
import { PrismaModule } from '../../core/prisma/prisma.module'
import { UsersModule } from '../users/users.module'
import { DonationsModule } from '../donations/donations.module'

/**
 * Module for Support Bot (@ProRabSupportBot) handlers only
 * This module is included only in the Support bot configuration
 */
@Module({
	imports: [PrismaModule, UsersModule, DonationsModule],
	providers: [TelegramSupportBot, TelegramSupportService, FAQService],
	exports: [TelegramSupportService, FAQService],
})
export class TelegramSupportBotModule {}












