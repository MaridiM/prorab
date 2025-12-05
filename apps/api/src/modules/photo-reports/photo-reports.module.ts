import { Module } from '@nestjs/common';
import { PhotoReportsService } from './photo-reports.service';
import { PhotoReportsResolver } from './photo-reports.resolver';
import { PublicPhotoReportsResolver } from './public-photo-reports.resolver';
import { PrismaModule } from '../../core/prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  providers: [
    PhotoReportsService,
    PhotoReportsResolver,
    PublicPhotoReportsResolver,
  ],
  exports: [PhotoReportsService],
})
export class PhotoReportsModule {}
