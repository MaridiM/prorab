/**
 * Storage Provider Factory
 *
 * Factory for selecting and instantiating the appropriate storage provider
 * Implements Factory Pattern for dynamic provider selection
 *
 * Selection logic:
 * 1. Check SystemSettings.storage.admin_mode
 *    - If "cloudinary" → CloudinaryProvider
 *    - If "r2" → R2Provider
 *    - If "local" → LocalProvider
 *    - If "user_choice" → Continue to step 2
 *
 * 2. Check User.storagePreference (if admin_mode = "user_choice")
 *    - If set → Use user's preference
 *    - If null → Continue to step 3
 *
 * 3. Check SystemSettings.storage.default_provider
 *    - Return default provider
 *
 * 4. Fallback: LocalProvider
 */

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { IStorageProvider, StorageProviderType } from '../interfaces/storage-provider.interface';
import { LocalStorageProvider } from '../providers/local.provider';
import { CloudinaryProvider } from '../providers/cloudinary.provider';
import { R2Provider } from '../providers/r2.provider';
import { ConfigurationError } from '../exceptions/storage-provider.exception';

@Injectable()
export class StorageProviderFactory {
  private readonly logger = new Logger(StorageProviderFactory.name);

  // Cache providers to avoid re-instantiation
  private providers: Map<StorageProviderType, IStorageProvider> = new Map();

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {}

  /**
   * Get the appropriate storage provider for a user
   * @param userId - User ID (optional, for user-specific provider selection)
   * @returns IStorageProvider instance
   */
  async getProvider(userId?: string): Promise<IStorageProvider> {
    try {
      // 1. Check admin mode setting
      const adminMode = await this.getSystemSetting('storage.admin_mode');

      // If admin forces a specific provider, use it
      if (adminMode && adminMode !== 'user_choice') {
        const providerType = this.normalizeProviderType(adminMode);
        this.logger.debug(`Admin mode set to: ${providerType}`);
        return this.getProviderInstance(providerType);
      }

      // 2. If admin allows user choice and userId is provided, check user preference
      if (userId && adminMode === 'user_choice') {
        const userPreference = await this.getUserStoragePreference(userId);

        if (userPreference) {
          this.logger.debug(`User ${userId} prefers: ${userPreference}`);
          return this.getProviderInstance(userPreference);
        }
      }

      // 3. Use default provider from settings
      const defaultProvider = await this.getSystemSetting('storage.default_provider');

      if (defaultProvider) {
        const providerType = this.normalizeProviderType(defaultProvider);
        this.logger.debug(`Using default provider: ${providerType}`);
        return this.getProviderInstance(providerType);
      }

      // 4. Fallback to local storage
      this.logger.debug('Falling back to local storage');
      return this.getProviderInstance(StorageProviderType.LOCAL);
    } catch (error) {
      this.logger.error(`Failed to get storage provider: ${error.message}`, error.stack);

      // On error, fallback to local storage
      this.logger.warn('Falling back to local storage due to error');
      return this.getProviderInstance(StorageProviderType.LOCAL);
    }
  }

  /**
   * Get a specific provider instance by type
   * @param providerType - Storage provider type
   * @returns IStorageProvider instance
   */
  async getProviderByType(providerType: StorageProviderType): Promise<IStorageProvider> {
    return this.getProviderInstance(providerType);
  }

  /**
   * Test connection for all configured providers
   * @returns Object with test results for each provider
   */
  async testAllProviders(): Promise<Record<StorageProviderType, boolean>> {
    const results: Record<StorageProviderType, boolean> = {
      [StorageProviderType.LOCAL]: false,
      [StorageProviderType.CLOUDINARY]: false,
      [StorageProviderType.R2]: false,
    };

    // Test local provider
    try {
      const localProvider = this.getProviderInstance(StorageProviderType.LOCAL);
      results[StorageProviderType.LOCAL] = await localProvider.testConnection();
    } catch (error) {
      this.logger.error(`Local provider test failed: ${error.message}`);
    }

    // Test Cloudinary provider (if configured)
    try {
      const cloudinaryProvider = this.getProviderInstance(StorageProviderType.CLOUDINARY);
      results[StorageProviderType.CLOUDINARY] = await cloudinaryProvider.testConnection();
    } catch (error) {
      this.logger.error(`Cloudinary provider test failed: ${error.message}`);
    }

    // Test R2 provider (if configured)
    try {
      const r2Provider = this.getProviderInstance(StorageProviderType.R2);
      results[StorageProviderType.R2] = await r2Provider.testConnection();
    } catch (error) {
      this.logger.error(`R2 provider test failed: ${error.message}`);
    }

    return results;
  }

  /**
   * Get or create provider instance (with caching)
   */
  private getProviderInstance(providerType: StorageProviderType): IStorageProvider {
    // Check cache first
    if (this.providers.has(providerType)) {
      return this.providers.get(providerType)!;
    }

    // Create new provider instance
    let provider: IStorageProvider;

    switch (providerType) {
      case StorageProviderType.LOCAL:
        provider = new LocalStorageProvider(this.configService);
        break;

      case StorageProviderType.CLOUDINARY:
        provider = new CloudinaryProvider(this.configService);
        break;

      case StorageProviderType.R2:
        provider = new R2Provider(this.configService);
        break;

      default:
        throw new ConfigurationError(
          `Unknown storage provider type: ${providerType}`,
          'factory',
        );
    }

    // Cache provider
    this.providers.set(providerType, provider);

    return provider;
  }

  /**
   * Get system setting value
   */
  private async getSystemSetting(key: string): Promise<string | null> {
    try {
      const setting = await this.prisma.systemSettings.findUnique({
        where: { key },
      });

      return setting?.value || null;
    } catch (error) {
      this.logger.error(`Failed to get system setting ${key}: ${error.message}`);
      return null;
    }
  }

  /**
   * Get user's storage preference
   */
  private async getUserStoragePreference(userId: string): Promise<StorageProviderType | null> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { storagePreference: true },
      });

      if (!user || !user.storagePreference) {
        return null;
      }

      return this.normalizeProviderType(user.storagePreference);
    } catch (error) {
      this.logger.error(`Failed to get user storage preference: ${error.message}`);
      return null;
    }
  }

  /**
   * Normalize provider type string to enum
   */
  private normalizeProviderType(value: string): StorageProviderType {
    const normalized = value.toLowerCase();

    switch (normalized) {
      case 'local':
        return StorageProviderType.LOCAL;
      case 'cloudinary':
        return StorageProviderType.CLOUDINARY;
      case 'r2':
        return StorageProviderType.R2;
      default:
        throw new ConfigurationError(
          `Invalid storage provider type: ${value}`,
          'factory',
        );
    }
  }
}
