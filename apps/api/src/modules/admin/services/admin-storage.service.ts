/**
 * Admin Storage Service
 *
 * Manages storage provider settings and operations for admin panel
 */

import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { StorageProviderFactory } from '../../../core/storage/factories/storage-provider.factory';
import { StorageMigrationService } from '../../../core/storage/storage-migration.service';
import { StorageProviderType } from '../../../core/storage/interfaces/storage-provider.interface';
import { SystemSettingsService } from './system-settings.service';

export interface StorageSettings {
  adminMode: string;
  defaultProvider: string;
  autoMigrate: boolean;

  // Cloudinary
  cloudinaryCloudName: string | null;
  cloudinaryApiKey: string | null;
  cloudinaryApiSecretSet: boolean;

  // R2
  r2AccountId: string | null;
  r2AccessKeyIdSet: boolean;
  r2SecretAccessKeySet: boolean;
  r2BucketName: string | null;
  r2PublicUrl: string | null;
}

export interface UpdateStorageSettingsInput {
  adminMode?: string;
  defaultProvider?: string;
  autoMigrate?: boolean;

  // Cloudinary
  cloudinaryCloudName?: string;
  cloudinaryApiKey?: string;
  cloudinaryApiSecret?: string;

  // R2
  r2AccountId?: string;
  r2AccessKeyId?: string;
  r2SecretAccessKey?: string;
  r2BucketName?: string;
  r2PublicUrl?: string;
}

export interface StorageStats {
  totalFiles: number;
  totalSize: number;
  filesByProvider: ProviderFileStats[];
  filesByType: FileTypeStats[];
}

export interface ProviderFileStats {
  provider: string;
  fileCount: number;
  totalSize: number;
}

export interface FileTypeStats {
  fileType: string;
  count: number;
  totalSize: number;
}

export interface ProviderTestResult {
  provider: StorageProviderType;
  success: boolean;
  message: string;
  latency?: number;
}

@Injectable()
export class AdminStorageService {
  private readonly logger = new Logger(AdminStorageService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly systemSettings: SystemSettingsService,
    private readonly storageFactory: StorageProviderFactory,
    private readonly storageMigration: StorageMigrationService,
  ) {}

  /**
   * Get current storage settings
   */
  async getStorageSettings(): Promise<StorageSettings> {
    const settings: StorageSettings = {
      adminMode: await this.systemSettings.getSettingValue('storage.admin_mode') || 'local',
      defaultProvider: await this.systemSettings.getSettingValue('storage.default_provider') || 'local',
      autoMigrate: (await this.systemSettings.getSettingValue('storage.auto_migrate')) === 'true',

      // Cloudinary
      cloudinaryCloudName: await this.systemSettings.getSettingValue('storage.cloudinary.cloud_name'),
      cloudinaryApiKey: await this.systemSettings.getSettingValue('storage.cloudinary.api_key'),
      cloudinaryApiSecretSet: !!(await this.systemSettings.getSettingValue('storage.cloudinary.api_secret')),

      // R2
      r2AccountId: await this.systemSettings.getSettingValue('storage.r2.account_id'),
      r2AccessKeyIdSet: !!(await this.systemSettings.getSettingValue('storage.r2.access_key_id')),
      r2SecretAccessKeySet: !!(await this.systemSettings.getSettingValue('storage.r2.secret_access_key')),
      r2BucketName: await this.systemSettings.getSettingValue('storage.r2.bucket_name'),
      r2PublicUrl: await this.systemSettings.getSettingValue('storage.r2.public_url'),
    };

    return settings;
  }

  /**
   * Update storage settings
   */
  async updateStorageSettings(
    input: UpdateStorageSettingsInput,
    adminUserId: string,
  ): Promise<StorageSettings> {
    this.logger.log(`Updating storage settings by admin ${adminUserId}`);

    // Validate admin mode
    if (input.adminMode) {
      const validModes = ['local', 'cloudinary', 'r2', 'user_choice'];
      if (!validModes.includes(input.adminMode)) {
        throw new BadRequestException(
          `Invalid admin mode. Must be one of: ${validModes.join(', ')}`,
        );
      }
    }

    // Validate default provider
    if (input.defaultProvider) {
      const validProviders = ['local', 'cloudinary', 'r2'];
      if (!validProviders.includes(input.defaultProvider)) {
        throw new BadRequestException(
          `Invalid default provider. Must be one of: ${validProviders.join(', ')}`,
        );
      }
    }

    // Update settings
    const updates: Array<{ key: string; value: string }> = [];

    if (input.adminMode !== undefined) {
      updates.push({ key: 'storage.admin_mode', value: input.adminMode });
    }

    if (input.defaultProvider !== undefined) {
      updates.push({ key: 'storage.default_provider', value: input.defaultProvider });
    }

    if (input.autoMigrate !== undefined) {
      updates.push({ key: 'storage.auto_migrate', value: String(input.autoMigrate) });
    }

    // Cloudinary
    if (input.cloudinaryCloudName !== undefined) {
      updates.push({ key: 'storage.cloudinary.cloud_name', value: input.cloudinaryCloudName });
    }
    if (input.cloudinaryApiKey !== undefined) {
      updates.push({ key: 'storage.cloudinary.api_key', value: input.cloudinaryApiKey });
    }
    if (input.cloudinaryApiSecret !== undefined) {
      updates.push({ key: 'storage.cloudinary.api_secret', value: input.cloudinaryApiSecret });
    }

    // R2
    if (input.r2AccountId !== undefined) {
      updates.push({ key: 'storage.r2.account_id', value: input.r2AccountId });
    }
    if (input.r2AccessKeyId !== undefined) {
      updates.push({ key: 'storage.r2.access_key_id', value: input.r2AccessKeyId });
    }
    if (input.r2SecretAccessKey !== undefined) {
      updates.push({ key: 'storage.r2.secret_access_key', value: input.r2SecretAccessKey });
    }
    if (input.r2BucketName !== undefined) {
      updates.push({ key: 'storage.r2.bucket_name', value: input.r2BucketName });
    }
    if (input.r2PublicUrl !== undefined) {
      updates.push({ key: 'storage.r2.public_url', value: input.r2PublicUrl });
    }

    // Bulk update
    for (const update of updates) {
      await this.systemSettings.updateSetting(update.key, update.value, adminUserId);
    }

    this.logger.log(`Storage settings updated successfully`);

    // Return updated settings
    return this.getStorageSettings();
  }

  /**
   * Get storage statistics
   */
  async getStorageStats(): Promise<StorageStats> {
    this.logger.log('Calculating storage statistics...');

    // Count files by type
    const [
      avatarCount,
      teamLogoCount,
      reportPhotoCount,
      expenses,
    ] = await Promise.all([
      this.prisma.user.count({ where: { avatarUrl: { not: null } } }),
      this.prisma.team.count({ where: { logoUrl: { not: null } } }),
      this.prisma.reportPhoto.count(),
      this.prisma.expense.findMany({ select: { photos: true } }),
    ]);

    // Count expense photos (each expense can have multiple photos)
    const expensePhotoCount = expenses.reduce((total, expense) => total + expense.photos.length, 0);

    const totalFiles = avatarCount + teamLogoCount + reportPhotoCount * 2 + expensePhotoCount;

    // For now, we don't have file sizes in DB, so we'll estimate
    // Average sizes: avatar=200KB, logo=200KB, photo=500KB, expense=300KB
    const estimatedSize =
      avatarCount * 200000 +
      teamLogoCount * 200000 +
      reportPhotoCount * 500000 * 2 + // original + thumbnail
      expensePhotoCount * 300000;

    // Files by type
    const filesByType: FileTypeStats[] = [
      { fileType: 'avatars', count: avatarCount, totalSize: avatarCount * 200000 },
      { fileType: 'team-logos', count: teamLogoCount, totalSize: teamLogoCount * 200000 },
      { fileType: 'report-photos', count: reportPhotoCount * 2, totalSize: reportPhotoCount * 500000 * 2 },
      { fileType: 'expense-photos', count: expensePhotoCount, totalSize: expensePhotoCount * 300000 },
    ];

    // Files by provider (based on URL patterns)
    // This is approximate - we'd need to parse URLs to be accurate
    const currentProvider = await this.systemSettings.getSettingValue('storage.admin_mode') || 'local';

    const filesByProvider: ProviderFileStats[] = [
      {
        provider: currentProvider,
        fileCount: totalFiles,
        totalSize: estimatedSize,
      },
    ];

    return {
      totalFiles,
      totalSize: estimatedSize,
      filesByProvider,
      filesByType,
    };
  }

  /**
   * Test connection to a specific provider
   */
  async testProvider(provider: StorageProviderType): Promise<ProviderTestResult> {
    this.logger.log(`Testing connection to ${provider} provider...`);

    const startTime = Date.now();

    try {
      const providerInstance = await this.storageFactory.getProviderByType(provider);
      const success = await providerInstance.testConnection();
      const latency = Date.now() - startTime;

      return {
        provider,
        success,
        message: success ? `Connection successful (${latency}ms)` : 'Connection failed',
        latency,
      };
    } catch (error) {
      const latency = Date.now() - startTime;
      this.logger.error(`Provider test failed: ${error.message}`, error.stack);

      return {
        provider,
        success: false,
        message: error.message || 'Connection failed',
        latency,
      };
    }
  }

  /**
   * Test all providers
   */
  async testAllProviders(): Promise<ProviderTestResult[]> {
    this.logger.log('Testing all storage providers...');

    const results = await Promise.all([
      this.testProvider(StorageProviderType.LOCAL),
      this.testProvider(StorageProviderType.CLOUDINARY),
      this.testProvider(StorageProviderType.R2),
    ]);

    return results;
  }

  /**
   * Migrate user storage
   */
  async migrateUserStorage(
    userId: string,
    fromProvider: StorageProviderType,
    toProvider: StorageProviderType,
    adminUserId: string,
  ): Promise<any> {
    this.logger.log(
      `Starting migration for user ${userId}: ${fromProvider} → ${toProvider} (by admin ${adminUserId})`,
    );

    // Validate providers
    if (fromProvider === toProvider) {
      throw new BadRequestException('Source and destination providers must be different');
    }

    // Start migration
    const result = await this.storageMigration.migrateUserFiles(
      userId,
      fromProvider,
      toProvider,
    );

    this.logger.log(
      `Migration completed: ${result.successCount}/${result.totalFiles} files migrated`,
    );

    return {
      userId,
      fromProvider,
      toProvider,
      totalFiles: result.totalFiles,
      successCount: result.successCount,
      failedCount: result.failedCount,
      failures: result.failures,
    };
  }
}
