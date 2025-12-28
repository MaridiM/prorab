import { Module } from '@nestjs/common';
import { PhotoReportsService } from './photo-reports.service';
import { PhotoReportsResolver } from './photo-reports.resolver';
import { PublicPhotoReportsResolver } from './public-photo-reports.resolver';
import { PrismaModule } from '../../core/prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { StorageModule } from '../../core/storage/storage.module';
import { SubscriptionsModule } from '../subscriptions/subscriptions.module';

@Module({
  imports: [PrismaModule, AuthModule, StorageModule, SubscriptionsModule],
  providers: [
    PhotoReportsService,
    PhotoReportsResolver,
    PublicPhotoReportsResolver,
  ],
  exports: [PhotoReportsService],
})
export class PhotoReportsModule {}
