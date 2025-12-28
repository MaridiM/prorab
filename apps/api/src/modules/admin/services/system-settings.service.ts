import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { EncryptionService } from '../../../shared/services/encryption.service';
import { S3Client, HeadBucketCommand } from '@aws-sdk/client-s3';
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
   * Get setting value from settings array (helper for test methods)
   */
  private getSettingValueFromArray(settings: SystemSettings[], key: string): string | null {
    const setting = settings.find((s) => s.key === key);
    if (!setting) {
      return null;
    }
    return this.getDecryptedValue(setting) || setting.defaultValue || null;
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

  /**
   * Sync environment variables to database settings
   * Called on application startup
   * Only updates empty database values (never overwrites existing DB values)
   */
  async syncEnvToDatabase(): Promise<void> {
    const envMappings = [
      // Payment
      { key: 'payment.yookassa.shop_id', envVar: 'YOOKASSA_SHOP_ID' },
      { key: 'payment.yookassa.secret_key', envVar: 'YOOKASSA_SECRET_KEY' },

      // Email
      { key: 'email.brevo.api_key', envVar: 'BREVO_API_KEY' },
      { key: 'email.brevo.sender_email', envVar: 'MAIL_FROM_EMAIL' },
      { key: 'email.brevo.sender_name', envVar: 'MAIL_FROM_NAME' },

      // Telegram
      { key: 'telegram.bot_token', envVar: 'TELEGRAM_BOT_TOKEN' },

      // Storage
      { key: 'storage.r2.account_id', envVar: 'R2_ACCOUNT_ID' },
      { key: 'storage.r2.access_key_id', envVar: 'R2_ACCESS_KEY_ID' },
      { key: 'storage.r2.secret_access_key', envVar: 'R2_SECRET_ACCESS_KEY' },
      { key: 'storage.r2.bucket_name', envVar: 'R2_BUCKET_NAME' },
      { key: 'storage.r2.public_url', envVar: 'R2_PUBLIC_URL' },

      // SMS
      { key: 'sms.twilio.account_sid', envVar: 'TWILIO_ACCOUNT_SID' },
      { key: 'sms.twilio.auth_token', envVar: 'TWILIO_AUTH_TOKEN' },
      { key: 'sms.twilio.phone_number', envVar: 'TWILIO_PHONE_NUMBER' },

      // Social
      { key: 'social.google.client_id', envVar: 'GOOGLE_CLIENT_ID' },
      { key: 'social.google.client_secret', envVar: 'GOOGLE_CLIENT_SECRET' },
      { key: 'social.github.client_id', envVar: 'GITHUB_CLIENT_ID' },
      { key: 'social.github.client_secret', envVar: 'GITHUB_CLIENT_SECRET' },

      // Analytics
      { key: 'analytics.google_analytics.measurement_id', envVar: 'GA_MEASUREMENT_ID' },
      { key: 'analytics.yandex_metrika.counter_id', envVar: 'YM_COUNTER_ID' },
      { key: 'analytics.posthog.api_key', envVar: 'POSTHOG_API_KEY' },
      { key: 'analytics.posthog.host', envVar: 'POSTHOG_HOST' },
    ];

    let syncedCount = 0;

    for (const mapping of envMappings) {
      const envValue = process.env[mapping.envVar];

      // Skip if env var is not set
      if (!envValue) continue;

      const setting = await this.prisma.systemSettings.findUnique({
        where: { key: mapping.key },
      });

      // Only sync if setting exists and has no value (never overwrite)
      if (setting && !setting.value) {
        const valueToStore = setting.isEncrypted
          ? this.encryptionService.encrypt(envValue)
          : envValue;

        await this.prisma.systemSettings.update({
          where: { key: mapping.key },
          data: {
            value: valueToStore,
            updatedBy: 'system', // Special marker for system-initiated updates
          },
        });

        syncedCount++;
        this.logger.log(`✅ Synced ${mapping.key} from ${mapping.envVar}`);
      }
    }

    if (syncedCount > 0) {
      this.logger.log(`✅ Environment sync completed: ${syncedCount} settings synced to database`);
    }
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
    try {
      const shopId = this.getSettingValueFromArray(settings, 'payment.yookassa.shop_id');
      const secretKey = this.getSettingValueFromArray(settings, 'payment.yookassa.secret_key');

      if (!shopId || !secretKey) {
        return {
          success: false,
          message: 'Yookassa Shop ID or Secret Key not configured',
        };
      }

      // Test Yookassa API by getting shop info
      const auth = Buffer.from(`${shopId}:${secretKey}`).toString('base64');
      const response = await fetch('https://api.yookassa.ru/v3/me', {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        return {
          success: false,
          message: `Yookassa API error: ${response.status} - ${errorText}`,
        };
      }

      const data = await response.json();
      return {
        success: true,
        message: `Connected to Yookassa account: ${data.account_id || shopId}`,
        details: {
          accountId: data.account_id,
          status: data.status,
        },
      };
    } catch (error) {
      this.logger.error('Yookassa connection test failed:', error);
      return {
        success: false,
        message: `Connection failed: ${error.message}`,
      };
    }
  }

  private async testBrevoConnection(settings: SystemSettings[]): Promise<any> {
    try {
      const apiKey = this.getSettingValueFromArray(settings, 'email.brevo.api_key');

      if (!apiKey) {
        return {
          success: false,
          message: 'Brevo API Key not configured',
        };
      }

      // Test Brevo API by getting account info
      const response = await fetch('https://api.brevo.com/v3/account', {
        method: 'GET',
        headers: {
          'api-key': apiKey,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        return {
          success: false,
          message: `Brevo API error: ${response.status} - ${errorText}`,
        };
      }

      const data = await response.json();
      return {
        success: true,
        message: `Connected to Brevo account: ${data.email || 'Account verified'}`,
        details: {
          email: data.email,
          firstName: data.firstName,
          lastName: data.lastName,
          companyName: data.companyName,
        },
      };
    } catch (error) {
      this.logger.error('Brevo connection test failed:', error);
      return {
        success: false,
        message: `Connection failed: ${error.message}`,
      };
    }
  }

  private async testTelegramConnection(settings: SystemSettings[]): Promise<any> {
    try {
      const botToken = this.getSettingValueFromArray(settings, 'telegram.bot_token');

      if (!botToken) {
        return {
          success: false,
          message: 'Telegram Bot Token not configured',
        };
      }

      // Test Telegram Bot API by getting bot info
      const response = await fetch(`https://api.telegram.org/bot${botToken}/getMe`, {
        method: 'GET',
      });

      if (!response.ok) {
        const errorText = await response.text();
        return {
          success: false,
          message: `Telegram API error: ${response.status} - ${errorText}`,
        };
      }

      const data = await response.json();

      if (!data.ok) {
        return {
          success: false,
          message: `Telegram API error: ${data.description || 'Unknown error'}`,
        };
      }

      const botInfo = data.result;
      return {
        success: true,
        message: `Connected to Telegram bot: @${botInfo.username}`,
        details: {
          id: botInfo.id,
          firstName: botInfo.first_name,
          username: botInfo.username,
          canJoinGroups: botInfo.can_join_groups,
          canReadAllGroupMessages: botInfo.can_read_all_group_messages,
          supportsInlineQueries: botInfo.supports_inline_queries,
        },
      };
    } catch (error) {
      this.logger.error('Telegram connection test failed:', error);
      return {
        success: false,
        message: `Connection failed: ${error.message}`,
      };
    }
  }

  private async testR2Connection(settings: SystemSettings[]): Promise<any> {
    try {
      const accessKeyId = this.getSettingValueFromArray(settings, 'storage.r2.access_key_id');
      const secretAccessKey = this.getSettingValueFromArray(settings, 'storage.r2.secret_access_key');
      const bucketName = this.getSettingValueFromArray(settings, 'storage.r2.bucket_name');
      const endpoint = this.getSettingValueFromArray(settings, 'storage.r2.endpoint');

      if (!accessKeyId || !secretAccessKey || !bucketName || !endpoint) {
        return {
          success: false,
          message: 'R2 credentials not fully configured',
        };
      }

      // Test R2 connection by checking bucket access
      const s3Client = new S3Client({
        region: 'auto',
        endpoint: endpoint,
        credentials: {
          accessKeyId: accessKeyId,
          secretAccessKey: secretAccessKey,
        },
      });

      const command = new HeadBucketCommand({ Bucket: bucketName });
      await s3Client.send(command);

      return {
        success: true,
        message: `Successfully connected to R2 bucket: ${bucketName}`,
        details: {
          bucketName: bucketName,
          endpoint: endpoint,
        },
      };
    } catch (error) {
      this.logger.error('R2 connection test failed:', error);

      let message = `Connection failed: ${error.message}`;
      if (error.name === 'NotFound') {
        message = `Bucket not found or access denied`;
      } else if (error.name === 'Forbidden') {
        message = `Access denied - check credentials`;
      }

      return {
        success: false,
        message: message,
      };
    }
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
      {
        key: 'payment.primary_provider',
        category: 'PAYMENT' as SettingCategory,
        name: 'Primary Payment Provider',
        description: 'Default payment provider for new subscriptions',
        valueType: 'STRING' as SettingValueType,
        defaultValue: 'stripe',
        isRequired: true,
      },

      // SMS Settings (Twilio)
      {
        key: 'sms.twilio.account_sid',
        category: 'SMS' as SettingCategory,
        name: 'Twilio Account SID',
        description: 'Twilio account SID for SMS sending',
        valueType: 'STRING' as SettingValueType,
        isEncrypted: false,
        isRequired: false,
      },
      {
        key: 'sms.twilio.auth_token',
        category: 'SMS' as SettingCategory,
        name: 'Twilio Auth Token',
        description: 'Twilio authentication token',
        valueType: 'ENCRYPTED' as SettingValueType,
        isEncrypted: true,
        isRequired: false,
      },
      {
        key: 'sms.twilio.phone_number',
        category: 'SMS' as SettingCategory,
        name: 'Twilio Phone Number',
        description: 'Twilio sender phone number (E.164 format)',
        valueType: 'STRING' as SettingValueType,
        isEncrypted: false,
        isRequired: false,
      },

      // Social Settings (OAuth)
      {
        key: 'social.google.client_id',
        category: 'SOCIAL' as SettingCategory,
        name: 'Google OAuth Client ID',
        description: 'Google OAuth 2.0 client ID',
        valueType: 'STRING' as SettingValueType,
        isEncrypted: false,
        isRequired: false,
      },
      {
        key: 'social.google.client_secret',
        category: 'SOCIAL' as SettingCategory,
        name: 'Google OAuth Client Secret',
        description: 'Google OAuth 2.0 client secret',
        valueType: 'ENCRYPTED' as SettingValueType,
        isEncrypted: true,
        isRequired: false,
      },
      {
        key: 'social.github.client_id',
        category: 'SOCIAL' as SettingCategory,
        name: 'GitHub OAuth Client ID',
        description: 'GitHub OAuth App client ID',
        valueType: 'STRING' as SettingValueType,
        isEncrypted: false,
        isRequired: false,
      },
      {
        key: 'social.github.client_secret',
        category: 'SOCIAL' as SettingCategory,
        name: 'GitHub OAuth Client Secret',
        description: 'GitHub OAuth App client secret',
        valueType: 'ENCRYPTED' as SettingValueType,
        isEncrypted: true,
        isRequired: false,
      },

      // Analytics Settings
      {
        key: 'analytics.google_analytics.measurement_id',
        category: 'ANALYTICS' as SettingCategory,
        name: 'Google Analytics Measurement ID',
        description: 'GA4 Measurement ID (format: G-XXXXXXXXXX)',
        valueType: 'STRING' as SettingValueType,
        isEncrypted: false,
        isRequired: false,
      },
      {
        key: 'analytics.yandex_metrika.counter_id',
        category: 'ANALYTICS' as SettingCategory,
        name: 'Yandex Metrika Counter ID',
        description: 'Yandex Metrika counter ID',
        valueType: 'STRING' as SettingValueType,
        isEncrypted: false,
        isRequired: false,
      },
      {
        key: 'analytics.posthog.api_key',
        category: 'ANALYTICS' as SettingCategory,
        name: 'PostHog API Key',
        description: 'PostHog project API key',
        valueType: 'ENCRYPTED' as SettingValueType,
        isEncrypted: true,
        isRequired: false,
      },
      {
        key: 'analytics.posthog.host',
        category: 'ANALYTICS' as SettingCategory,
        name: 'PostHog Host',
        description: 'PostHog instance URL',
        valueType: 'STRING' as SettingValueType,
        defaultValue: 'https://app.posthog.com',
        isEncrypted: false,
        isRequired: false,
      },
    ];
  }
}
