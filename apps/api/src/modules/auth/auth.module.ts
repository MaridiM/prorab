import { Module } from '@nestjs/common'

import { AuthResolver } from './auth.resolver'
import { AuthService } from './auth.service'
import { MailModule } from '../../core/mail/mail.module'
import { UsersModule } from '../users/users.module'

@Module({
	imports: [UsersModule, MailModule],
	providers: [AuthService, AuthResolver],
	exports: [AuthService],
})
export class AuthModule {}

