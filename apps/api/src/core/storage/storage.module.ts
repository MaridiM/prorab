import { Module } from '@nestjs/common';
import { StorageService } from './storage.service';
import { StorageProviderFactory } from './factories/storage-provider.factory';
import { StorageMigrationService } from './storage-migration.service';
import { LocalStorageProvider } from './providers/local.provider';
import { CloudinaryProvider } from './providers/cloudinary.provider';
import { R2Provider } from './providers/r2.provider';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [
    StorageService,
    StorageProviderFactory,
    StorageMigrationService,
    LocalStorageProvider,
    CloudinaryProvider,
    R2Provider,
  ],
  exports: [StorageService, StorageProviderFactory, StorageMigrationService],
})
export class StorageModule {}
