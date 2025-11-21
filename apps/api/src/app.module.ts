import { Module } from '@nestjs/common'

import { AppResolver } from './app.resolver'
import { CoreModule } from './core/core.module'
import { ProjectsModule } from './projects/projects.module'

@Module({
	imports: [CoreModule, ProjectsModule],
	providers: [AppResolver],
})
export class AppModule {}
