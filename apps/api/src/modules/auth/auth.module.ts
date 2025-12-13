import { Module } from '@nestjs/common'

import { AuthResolver } from './auth.resolver'
import { AuthService } from './auth.service'
import { TwoFactorService } from './two-factor.service'
import { TwoFactorResolver } from './two-factor.resolver'
import { MailModule } from '../../core/mail/mail.module'
import { UsersModule } from '../users/users.module'
import { TelegramModule } from '../telegram/telegram.module'

@Module({
	imports: [UsersModule, MailModule, TelegramModule],
	providers: [AuthService, AuthResolver, TwoFactorService, TwoFactorResolver],
	exports: [AuthService, TwoFactorService],
})
export class AuthModule {}

