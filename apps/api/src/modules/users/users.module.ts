import { Module, forwardRef } from '@nestjs/common'

import { UsersResolver } from './users.resolver'
import { UsersService } from './users.service'
import { AuthModule } from '../auth/auth.module'
import { MailModule } from '../../core/mail/mail.module'

@Module({
	imports: [forwardRef(() => AuthModule), MailModule],
	providers: [UsersService, UsersResolver],
	exports: [UsersService],
})
export class UsersModule {}

