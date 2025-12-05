import { Module } from '@nestjs/common';

import { PrismaModule } from '../../core/prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';

import { ProjectsResolver } from './projects.resolver';
import { ProjectsService } from './projects.service';

@Module({
  imports: [PrismaModule, AuthModule],
  providers: [ProjectsResolver, ProjectsService],
  exports: [ProjectsService],
})
export class ProjectsModule {}
