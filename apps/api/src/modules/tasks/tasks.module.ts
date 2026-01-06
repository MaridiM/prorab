import { Module } from '@nestjs/common'
import { PrismaModule } from '../../core/prisma/prisma.module'
import { AuthModule } from '../auth/auth.module'
import { UsersModule } from '../users/users.module'
import { TeamsModule } from '../teams/teams.module'
import { TasksResolver } from './tasks.resolver'
import { TasksService } from './tasks.service'

@Module({
	imports: [PrismaModule, AuthModule, UsersModule, TeamsModule],
	providers: [TasksResolver, TasksService],
	exports: [TasksService],
})
export class TasksModule {}
