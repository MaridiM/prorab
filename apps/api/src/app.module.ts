import { Module } from '@nestjs/common'
import { APP_GUARD } from '@nestjs/core'

import { AppResolver } from './app.resolver'
import { CoreModule } from './core/core.module'
import { ProjectsModule } from './projects/projects.module'
import { AuthModule } from './auth/auth.module'
import { UsersModule } from './users/users.module'
import { MailModule } from './mail/mail.module'
import { AuthGuard } from './auth/guards/auth.guard'

@Module({
	imports: [CoreModule, ProjectsModule, AuthModule, UsersModule, MailModule],
	providers: [
		AppResolver,
		{
			provide: APP_GUARD,
			useClass: AuthGuard,
		},
	],
})
export class AppModule {}
