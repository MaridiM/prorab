import { Module } from '@nestjs/common'
import { APP_GUARD } from '@nestjs/core'

import { AppResolver } from './app.resolver'
import { CoreModule } from './core/core.module'
import { ProjectsModule } from './modules/projects/projects.module'
import { AuthModule } from './modules/auth/auth.module'
import { UsersModule } from './modules/users/users.module'
import { TeamsModule } from './modules/teams/teams.module'
import { MailModule } from './core/mail/mail.module'
import { StorageModule } from './core/storage/storage.module'
import { AuthGuard } from './shared/guards/auth.guard'

@Module({
	imports: [
		CoreModule,
		ProjectsModule, // ✅ Включён обратно - конфликт типов решён
		AuthModule,
		UsersModule,
		TeamsModule,
		MailModule,
		StorageModule,
	],
	providers: [
		AppResolver,
		{
			provide: APP_GUARD,
			useClass: AuthGuard,
		},
	],
})
export class AppModule {}
