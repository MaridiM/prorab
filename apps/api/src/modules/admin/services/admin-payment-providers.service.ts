import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { AdminActionLogService } from './admin-action-log.service';
import { SystemSettingsService } from './system-settings.service';
import { PaymentProviderFactory } from '../../../core/payments/factories/payment-provider.factory';
import type { PaymentProvider, PaymentProviderType } from '@prisma/generated/client';

export interface PaymentProviderConfigInput {
  shopId?: string;
  secretKey?: string;
  webhookSecret?: string;
  publishableKey?: string; // For Stripe
}

export interface UpdatePaymentProviderInput {
  isActive?: boolean;
  isPrimary?: boolean;
  config?: PaymentProviderConfigInput;
}

export interface TestConnectionResult {
  success: boolean;
  message?: string;
  error?: string;
}

export interface PaymentProviderWithWebhook extends PaymentProvider {
  webhookUrl?: string;
  configStatus?: {
    hasShopId?: boolean;
    hasSecretKey?: boolean;
    hasWebhookSecret?: boolean;
    hasPublishableKey?: boolean;
  };
}

@Injectable()
export class AdminPaymentProvidersService {
  private readonly logger = new Logger(AdminPaymentProvidersService.name);

  constructor(
    private prisma: PrismaService,
    private auditService: AdminActionLogService,
    private systemSettings: SystemSettingsService,
    private paymentFactory: PaymentProviderFactory,
  ) {}

  /**
   * Get all payment providers with their webhook URLs
   */
  async findAll(baseUrl?: string): Promise<PaymentProviderWithWebhook[]> {
    this.logger.log('Fetching all payment providers');

    const providers = await this.prisma.paymentProvider.findMany({
      orderBy: { type: 'asc' },
    });

    // Enhance with webhook URLs and config status
    const enhancedProviders = await Promise.all(
      providers.map(async (provider) => {
        const configStatus = await this.getConfigStatus(provider.type);

        return {
          ...provider,
          webhookUrl: baseUrl
            ? `${baseUrl}/webhooks/${provider.type.toLowerCase()}`
            : undefined,
          configStatus,
        };
      }),
    );

    return enhancedProviders;
  }

  /**
   * Get a specific payment provider by type
   */
  async findByType(type: PaymentProviderType, baseUrl?: string): Promise<PaymentProviderWithWebhook> {
    this.logger.log(`Fetching payment provider: ${type}`);

    const provider = await this.prisma.paymentProvider.findUnique({
      where: { type },
    });

    if (!provider) {
      throw new NotFoundException(`Payment provider ${type} not found`);
    }

    const configStatus = await this.getConfigStatus(type);

    return {
      ...provider,
      webhookUrl: baseUrl
        ? `${baseUrl}/webhooks/${type.toLowerCase()}`
        : undefined,
      configStatus,
    };
  }

  /**
   * Update payment provider settings
   */
  async updateProvider(
    type: PaymentProviderType,
    input: UpdatePaymentProviderInput,
    adminId: string,
  ): Promise<PaymentProvider> {
    this.logger.log(`Updating payment provider ${type} by admin ${adminId}`);

    // Get current provider state
    const providerBefore = await this.prisma.paymentProvider.findUnique({
      where: { type },
    });

    if (!providerBefore) {
      throw new NotFoundException(`Payment provider ${type} not found`);
    }

    // If setting as primary, unset other primary providers
    if (input.isPrimary === true) {
      await this.prisma.paymentProvider.updateMany({
        where: {
          type: { not: type },
        },
        data: {
          isPrimary: false,
        },
      });

      this.logger.log(`Set ${type} as primary provider, removed primary flag from others`);
    }

    // Update provider status
    const updateData: any = {};
    if (input.isActive !== undefined) updateData.isActive = input.isActive;
    if (input.isPrimary !== undefined) updateData.isPrimary = input.isPrimary;

    const providerAfter = await this.prisma.paymentProvider.update({
      where: { type },
      data: updateData,
    });

    // Save configuration to SystemSettings if provided
    if (input.config) {
      await this.saveProviderConfig(type, input.config);

      // Clear provider cache to force re-initialization with new config
      this.paymentFactory.clearProviderCache(type);
    }

    // Log action
    await this.auditService.logAction({
      adminUserId: adminId,
      action: 'UPDATE_PAYMENT_PROVIDER',
      resource: 'PaymentProvider',
      resourceId: type,
      details: {
        before: {
          isActive: providerBefore.isActive,
          isPrimary: providerBefore.isPrimary,
        },
        after: {
          isActive: providerAfter.isActive,
          isPrimary: providerAfter.isPrimary,
        },
        configUpdated: !!input.config,
      },
    });

    this.logger.log(`Payment provider ${type} updated successfully`);

    return providerAfter;
  }

  /**
   * Save provider configuration to SystemSettings (encrypted)
   */
  private async saveProviderConfig(
    type: PaymentProviderType,
    config: PaymentProviderConfigInput,
  ): Promise<void> {
    this.logger.log(`Saving configuration for ${type} provider`);

    const prefix = type === 'YOOKASSA' ? 'payment.yookassa' : 'payment.stripe';

    // Map of config field to setting key
    const settingsMap: Record<string, string | null> = {
      shopId: `${prefix}.shop_id`,
      secretKey: `${prefix}.secret_key`,
      webhookSecret: `${prefix}.webhook_secret`,
      publishableKey: type === 'STRIPE' ? `${prefix}.publishable_key` : null,
    };

    // Save each config value to SystemSettings
    for (const [field, value] of Object.entries(config)) {
      if (value === undefined || value === null || value === '') {
        continue; // Skip undefined/null/empty values
      }

      const settingKey = settingsMap[field];
      if (!settingKey) {
        continue; // Skip unknown fields
      }

      try {
        // Check if setting exists
        const existingSetting = await this.systemSettings.getSetting(settingKey);

        if (existingSetting) {
          // Update existing setting
          await this.systemSettings.updateSetting(settingKey, value, 'system');
        } else {
          // Create new setting
          const isSecret = field.includes('secret') || field.includes('Key');

          await this.systemSettings.createSetting(
            {
              key: settingKey,
              category: 'PAYMENT',
              name: this.getSettingName(field, type),
              valueType: 'STRING',
              value,
              isEncrypted: isSecret,
              isRequired: field === 'shopId' || field === 'secretKey',
            },
            'system',
          );
        }

        this.logger.log(`Saved ${settingKey} for ${type}`);
      } catch (error) {
        this.logger.error(`Failed to save ${settingKey}:`, error);
        throw new BadRequestException(`Failed to save configuration for ${field}`);
      }
    }
  }

  /**
   * Get human-readable setting name
   */
  private getSettingName(field: string, type: PaymentProviderType): string {
    const providerName = type === 'YOOKASSA' ? 'Yookassa' : 'Stripe';

    const nameMap: Record<string, string> = {
      shopId: `${providerName} Shop ID`,
      secretKey: `${providerName} Secret Key`,
      webhookSecret: `${providerName} Webhook Secret`,
      publishableKey: `${providerName} Publishable Key`,
    };

    return nameMap[field] || field;
  }

  /**
   * Test payment provider connection
   */
  async testProvider(type: PaymentProviderType): Promise<TestConnectionResult> {
    this.logger.log(`Testing connection for ${type} provider`);

    try {
      const success = await this.paymentFactory.testProvider(type);

      return {
        success,
        message: success
          ? `${type} connection successful`
          : `${type} connection failed`,
      };
    } catch (error) {
      this.logger.error(`${type} connection test failed:`, error);

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Get configuration status for a provider (which settings are configured)
   */
  private async getConfigStatus(
    type: PaymentProviderType,
  ): Promise<{
    hasShopId?: boolean;
    hasSecretKey?: boolean;
    hasWebhookSecret?: boolean;
    hasPublishableKey?: boolean;
  }> {
    const prefix = type === 'YOOKASSA' ? 'payment.yookassa' : 'payment.stripe';

    const settingsToCheck: Record<string, string> = {
      hasSecretKey: `${prefix}.secret_key`,
      hasWebhookSecret: `${prefix}.webhook_secret`,
    };

    if (type === 'YOOKASSA') {
      settingsToCheck.hasShopId = `${prefix}.shop_id`;
    }

    if (type === 'STRIPE') {
      settingsToCheck.hasPublishableKey = `${prefix}.publishable_key`;
    }

    const status: any = {};

    for (const [key, settingKey] of Object.entries(settingsToCheck)) {
      const value = await this.systemSettings.getSettingValue(settingKey);
      status[key] = !!value && value.length > 0;
    }

    return status;
  }

  /**
   * Get provider configuration (decrypted)
   * Only for admin viewing - does NOT expose full secrets
   */
  async getProviderConfig(
    type: PaymentProviderType,
  ): Promise<{
    shopId?: string;
    hasSecretKey: boolean;
    hasWebhookSecret: boolean;
    hasPublishableKey?: boolean;
  }> {
    this.logger.log(`Fetching configuration for ${type} provider`);

    const prefix = type === 'YOOKASSA' ? 'payment.yookassa' : 'payment.stripe';

    const config: any = {
      hasSecretKey: false,
      hasWebhookSecret: false,
    };

    // Get shop ID (not secret)
    if (type === 'YOOKASSA') {
      config.shopId = await this.systemSettings.getSettingValue(`${prefix}.shop_id`);
    }

    // Check if secrets exist (don't expose full values)
    const secretKey = await this.systemSettings.getSettingValue(`${prefix}.secret_key`);
    config.hasSecretKey = !!secretKey && secretKey.length > 0;

    const webhookSecret = await this.systemSettings.getSettingValue(`${prefix}.webhook_secret`);
    config.hasWebhookSecret = !!webhookSecret && webhookSecret.length > 0;

    if (type === 'STRIPE') {
      const publishableKey = await this.systemSettings.getSettingValue(`${prefix}.publishable_key`);
      config.hasPublishableKey = !!publishableKey && publishableKey.length > 0;
    }

    return config;
  }

  /**
   * Clear provider cache (force re-initialization)
   */
  async clearProviderCache(type?: PaymentProviderType, adminId?: string): Promise<void> {
    this.logger.log(
      type
        ? `Clearing ${type} provider cache by admin ${adminId}`
        : `Clearing all provider caches by admin ${adminId}`,
    );

    if (type) {
      this.paymentFactory.clearProviderCache(type);
    } else {
      this.paymentFactory.clearCache();
    }

    // Log action
    if (adminId) {
      await this.auditService.logAction({
        adminUserId: adminId,
        action: 'CLEAR_PROVIDER_CACHE',
        resource: 'PaymentProvider',
        resourceId: type || 'ALL',
        details: {
          type: type || 'ALL',
        },
      });
    }

    this.logger.log('Provider cache cleared successfully');
  }
}
