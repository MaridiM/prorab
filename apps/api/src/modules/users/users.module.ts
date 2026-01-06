import { Module, forwardRef } from '@nestjs/common'

import { UsersResolver } from './users.resolver'
import { UsersService } from './users.service'
import { PersonalAccessTokensService } from './personal-access-tokens.service'
import { PersonalAccessTokensResolver } from './personal-access-tokens.resolver'
import { AuthModule } from '../auth/auth.module'
import { MailModule } from '../../core/mail/mail.module'
import { TelegramOAuthBotModule } from '../telegram/telegram-oauth-bot.module'

@Module({
	imports: [forwardRef(() => AuthModule), MailModule, TelegramOAuthBotModule],
	providers: [UsersService, UsersResolver, PersonalAccessTokensService, PersonalAccessTokensResolver],
	exports: [UsersService, PersonalAccessTokensService],
})
export class UsersModule {}
