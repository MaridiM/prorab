import { Module, forwardRef } from '@nestjs/common'

import { UsersResolver } from './users.resolver'
import { UsersService } from './users.service'
import { AuthModule } from '../auth/auth.module'

@Module({
	imports: [forwardRef(() => AuthModule)],
	providers: [UsersService, UsersResolver],
	exports: [UsersService],
})
export class UsersModule {}

