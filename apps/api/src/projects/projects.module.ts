import { Module } from '@nestjs/common'

import { PrismaModule } from '../core/prisma/prisma.module'

import { ProjectsResolver } from './projects.resolver'
import { ProjectsService } from './projects.service'

@Module({
	imports: [PrismaModule],
	providers: [ProjectsResolver, ProjectsService],
})
export class ProjectsModule {}
