import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { EncryptionService } from '../../../shared/services/encryption.service';
import type { SettingCategory, SettingValueType, SystemSettings } from '@prisma/generated/client';



export interface SystemSettingInput {
  key: string;
  category: SettingCategory;
  name: string;
  description?: string;
  valueType: SettingValueType;
  value?: string;
  defaultValue?: string;
  isEncrypted?: boolean;
  isRequired?: boolean;
  validationRules?: any;
}

export interface UpdateSystemSettingInput {
  key: string;
  value: string;
}

@Injectable()
export class SystemSettingsService {
  private readonly logger = new Logger(SystemSettingsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly encryptionService: EncryptionService
  ) {}

  /**
   * Get all system settings
   * Decrypts encrypted values automatically
   */
  async getAllSettings(category?: SettingCategory): Promise<SystemSettings[]> {
    const settings = await this.prisma.systemSettings.findMany({
      where: category ? { category } : undefined,
      orderBy: [{ category: 'asc' }, { name: 'asc' }],
    });

    return settings.map((setting) => ({
      ...setting,
      value: this.getDecryptedValue(setting),
    }));
  }

  /**
   * Get a single setting by key
   */
  async getSetting(key: string): Promise<SystemSettings | null> {
    const setting = await this.prisma.systemSettings.findUnique({
      where: { key },
    });

    if (!setting) {
      return null;
    }

    return {
      ...setting,
      value: this.getDecryptedValue(setting),
    };
  }

  /**
   * Get setting value (returns default if not set)
   */
  async getSettingValue(key: string): Promise<string | null> {
    const setting = await this.getSetting(key);

    if (!setting) {
      this.logger.warn(`Setting not found: ${key}`);
      return null;
    }

    return setting.value || setting.defaultValue || null;
  }

  /**
   * Create a new system setting
   */
  async createSetting(
    input: SystemSettingInput,
    adminUserId: string
  ): Promise<SystemSettings> {
    const encryptedValue = input.isEncrypted && input.value
      ? this.encryptionService.encrypt(input.value)
      : input.value;

    const setting = await this.prisma.systemSettings.create({
      data: {
        key: input.key,
        category: input.category,
        name: input.name,
        description: input.description,
        valueType: input.valueType,
        value: encryptedValue,
        defaultValue: input.defaultValue,
        isEncrypted: input.isEncrypted || false,
        isRequired: input.isRequired || false,
        validationRules: input.validationRules,
        updatedBy: adminUserId,
      },
    });

    this.logger.log(`Setting created: ${setting.key} by admin ${adminUserId}`);

    return {
      ...setting,
      value: this.getDecryptedValue(setting),
    };
  }

  /**
   * Update a system setting value
   */
  async updateSetting(
    key: string,
    value: string,
    adminUserId: string
  ): Promise<SystemSettings> {
    const setting = await this.prisma.systemSettings.findUnique({
      where: { key },
    });

    if (!setting) {
      throw new NotFoundException(`Setting not found: ${key}`);
    }

    // Validate value type
    this.validateValue(value, setting.valueType);

    // Encrypt if needed
    const finalValue = setting.isEncrypted
      ? this.encryptionService.encrypt(value)
      : value;

    const updated = await this.prisma.systemSettings.update({
      where: { key },
      data: {
        value: finalValue,
        updatedBy: adminUserId,
      },
    });

    this.logger.log(`Setting updated: ${key} by admin ${adminUserId}`);

    return {
      ...updated,
      value: this.getDecryptedValue(updated),
    };
  }

  /**
   * Bulk update settings
   */
  async bulkUpdateSettings(
    updates: UpdateSystemSettingInput[],
    adminUserId: string
  ): Promise<SystemSettings[]> {
    const results: SystemSettings[] = [];

    for (const update of updates) {
      try {
        const result = await this.updateSetting(update.key, update.value, adminUserId);
        results.push(result);
      } catch (error) {
        this.logger.error(`Failed to update setting ${update.key}:`, error);
        throw error;
      }
    }

    return results;
  }

  /**
   * Delete a system setting
   */
  async deleteSetting(key: string, adminUserId: string): Promise<boolean> {
    await this.prisma.systemSettings.delete({
      where: { key },
    });

    this.logger.log(`Setting deleted: ${key} by admin ${adminUserId}`);

    return true;
  }

  /**
   * Test connection for service-specific settings
   */
  async testConnection(category: SettingCategory): Promise<{ success: boolean; message: string }> {
    const settings = await this.getAllSettings(category);

    switch (category) {
      case 'PAYMENT':
        return this.testYookassaConnection(settings);
      case 'EMAIL':
        return this.testBrevoConnection(settings);
      case 'TELEGRAM':
        return this.testTelegramConnection(settings);
      case 'STORAGE':
        return this.testR2Connection(settings);
      default:
        return {
          success: false,
          message: 'Test connection not implemented for this category',
        };
    }
  }

  /**
   * Initialize default settings (seed)
   */
  async initializeDefaultSettings(): Promise<void> {
    const defaults = this.getDefaultSettings();

    for (const setting of defaults) {
      const existing = await this.prisma.systemSettings.findUnique({
        where: { key: setting.key },
      });

      if (!existing) {
        await this.prisma.systemSettings.create({
          data: setting,
        });
      }
    }

    this.logger.log('Default settings initialized');
  }

  // ==================== PRIVATE METHODS ====================

  private getDecryptedValue(setting: SystemSettings): string | null {
    if (!setting.value) {
      return null;
    }

    if (setting.isEncrypted) {
      try {
        return this.encryptionService.decrypt(setting.value);
      } catch (error) {
        this.logger.error(`Failed to decrypt setting: ${setting.key}`, error);
        return null;
      }
    }

    return setting.value;
  }

  private validateValue(value: string, valueType: SettingValueType): void {
    switch (valueType) {
      case 'NUMBER':
        if (isNaN(Number(value))) {
          throw new Error('Value must be a number');
        }
        break;
      case 'BOOLEAN':
        if (value !== 'true' && value !== 'false') {
          throw new Error('Value must be true or false');
        }
        break;
      case 'JSON':
        try {
          JSON.parse(value);
        } catch {
          throw new Error('Value must be valid JSON');
        }
        break;
    }
  }

  private async testYookassaConnection(settings: SystemSettings[]): Promise<any> {
    // TODO: Implement Yookassa API test
    return {
      success: true,
      message: 'Yookassa connection test not implemented yet',
    };
  }

  private async testBrevoConnection(settings: SystemSettings[]): Promise<any> {
    // TODO: Implement Brevo API test
    return {
      success: true,
      message: 'Brevo connection test not implemented yet',
    };
  }

  private async testTelegramConnection(settings: SystemSettings[]): Promise<any> {
    // TODO: Implement Telegram Bot API test
    return {
      success: true,
      message: 'Telegram connection test not implemented yet',
    };
  }

  private async testR2Connection(settings: SystemSettings[]): Promise<any> {
    // TODO: Implement R2 connection test
    return {
      success: true,
      message: 'R2 connection test not implemented yet',
    };
  }

  private getDefaultSettings(): any[] {
    return [
      // Payment Settings (Yookassa)
      {
        key: 'payment.yookassa.shop_id',
        category: 'PAYMENT' as SettingCategory,
        name: 'Yookassa Shop ID',
        description: 'Yookassa shop/merchant ID',
        valueType: 'STRING' as SettingValueType,
        isEncrypted: false,
        isRequired: true,
      },
      {
        key: 'payment.yookassa.secret_key',
        category: 'PAYMENT' as SettingCategory,
        name: 'Yookassa Secret Key',
        description: 'Yookassa API secret key',
        valueType: 'ENCRYPTED' as SettingValueType,
        isEncrypted: true,
        isRequired: true,
      },

      // Email Settings (Brevo)
      {
        key: 'email.brevo.api_key',
        category: 'EMAIL' as SettingCategory,
        name: 'Brevo API Key',
        description: 'Brevo (SendinBlue) API key',
        valueType: 'ENCRYPTED' as SettingValueType,
        isEncrypted: true,
        isRequired: true,
      },
      {
        key: 'email.brevo.sender_email',
        category: 'EMAIL' as SettingCategory,
        name: 'Sender Email',
        description: 'Default sender email address',
        valueType: 'STRING' as SettingValueType,
        defaultValue: 'noreply@prorab.space',
        isRequired: true,
      },
      {
        key: 'email.brevo.sender_name',
        category: 'EMAIL' as SettingCategory,
        name: 'Sender Name',
        description: 'Default sender name',
        valueType: 'STRING' as SettingValueType,
        defaultValue: 'ProRab.space',
        isRequired: true,
      },

      // Telegram Settings
      {
        key: 'telegram.bot_token',
        category: 'TELEGRAM' as SettingCategory,
        name: 'Telegram Bot Token',
        description: 'Telegram bot API token',
        valueType: 'ENCRYPTED' as SettingValueType,
        isEncrypted: true,
        isRequired: true,
      },
      {
        key: 'telegram.webhook_url',
        category: 'TELEGRAM' as SettingCategory,
        name: 'Webhook URL',
        description: 'Telegram webhook URL',
        valueType: 'STRING' as SettingValueType,
        isRequired: false,
      },

      // Storage Settings (R2)
      {
        key: 'storage.r2.account_id',
        category: 'STORAGE' as SettingCategory,
        name: 'R2 Account ID',
        description: 'Cloudflare R2 account ID',
        valueType: 'STRING' as SettingValueType,
        isRequired: true,
      },
      {
        key: 'storage.r2.access_key_id',
        category: 'STORAGE' as SettingCategory,
        name: 'R2 Access Key ID',
        description: 'R2 access key ID',
        valueType: 'ENCRYPTED' as SettingValueType,
        isEncrypted: true,
        isRequired: true,
      },
      {
        key: 'storage.r2.secret_access_key',
        category: 'STORAGE' as SettingCategory,
        name: 'R2 Secret Access Key',
        description: 'R2 secret access key',
        valueType: 'ENCRYPTED' as SettingValueType,
        isEncrypted: true,
        isRequired: true,
      },
      {
        key: 'storage.r2.bucket_name',
        category: 'STORAGE' as SettingCategory,
        name: 'R2 Bucket Name',
        description: 'R2 bucket name',
        valueType: 'STRING' as SettingValueType,
        isRequired: true,
      },
      {
        key: 'storage.r2.public_url',
        category: 'STORAGE' as SettingCategory,
        name: 'R2 Public URL',
        description: 'R2 public URL (custom domain)',
        valueType: 'STRING' as SettingValueType,
        isRequired: false,
      },

      // Security Settings
      {
        key: 'security.require_2fa_for_admins',
        category: 'SECURITY' as SettingCategory,
        name: 'Require 2FA for Admins',
        description: 'Enforce 2FA for all admin users',
        valueType: 'BOOLEAN' as SettingValueType,
        defaultValue: 'true',
        isRequired: true,
      },
      {
        key: 'security.max_login_attempts',
        category: 'SECURITY' as SettingCategory,
        name: 'Max Login Attempts',
        description: 'Maximum failed login attempts before lockout',
        valueType: 'NUMBER' as SettingValueType,
        defaultValue: '5',
        isRequired: true,
      },

      // General Settings
      {
        key: 'general.app_name',
        category: 'GENERAL' as SettingCategory,
        name: 'Application Name',
        description: 'Name of the application',
        valueType: 'STRING' as SettingValueType,
        defaultValue: 'ProRab.space',
        isRequired: true,
      },
      {
        key: 'general.support_email',
        category: 'GENERAL' as SettingCategory,
        name: 'Support Email',
        description: 'Support contact email',
        valueType: 'STRING' as SettingValueType,
        defaultValue: 'support@prorab.space',
        isRequired: true,
      },
    ];
  }
}
