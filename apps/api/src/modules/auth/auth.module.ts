import { Module } from '@nestjs/common'

import { AuthResolver } from './auth.resolver'
import { AuthService } from './auth.service'
import { MailModule } from '../../core/mail/mail.module'
import { UsersModule } from '../users/users.module'
import { TelegramModule } from '../telegram/telegram.module'

@Module({
	imports: [UsersModule, MailModule, TelegramModule],
	providers: [AuthService, AuthResolver],
	exports: [AuthService],
})
export class AuthModule {}

