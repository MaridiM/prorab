#!/usr/bin/env ts-node
/**
 * Migration Script: Yookassa Tokens to SystemSettings
 *
 * This script migrates Yookassa credentials from environment variables (.env)
 * to the SystemSettings table in the database with encryption.
 *
 * PREREQUISITES:
 * - SystemSettings table exists
 * - EncryptionService is properly configured
 * - .env file contains YOOKASSA_* variables
 *
 * WHAT THIS SCRIPT DOES:
 * 1. Reads Yookassa credentials from environment variables
 * 2. Creates/updates SystemSettings records with encryption
 * 3. Validates that settings were saved correctly
 * 4. Provides instructions for .env cleanup
 *
 * SETTINGS CREATED:
 * - payment.yookassa.shop_id (not encrypted)
 * - payment.yookassa.secret_key (encrypted)
 * - payment.yookassa.webhook_secret (encrypted)
 *
 * ROLLBACK:
 * - Keep .env variables until migration is validated
 * - To rollback: delete SystemSettings records, application will fall back to .env
 *
 * USAGE:
 * ```bash
 * cd apps/api
 * pnpm ts-node scripts/migrate-yookassa-to-systemsettings.ts
 * ```
 */

import { PrismaClient, SettingCategory, SettingValueType } from '../prisma/generated/client';
import * as crypto from 'crypto';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load .env file
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const prisma = new PrismaClient();

// Simple encryption service (matches the one used in SystemSettingsService)
class SimpleEncryption {
  private readonly algorithm = 'aes-256-gcm';
  private readonly key: Buffer;

  constructor() {
    const encryptionKey = process.env.ENCRYPTION_KEY;
    if (!encryptionKey) {
      throw new Error('ENCRYPTION_KEY not found in environment variables');
    }

    // Ensure key is 32 bytes for AES-256
    this.key = crypto.scryptSync(encryptionKey, 'salt', 32);
  }

  encrypt(text: string): string {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(this.algorithm, this.key, iv);

    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag();

    // Return: iv:authTag:encryptedData
    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
  }

  decrypt(encryptedText: string): string {
    const parts = encryptedText.split(':');
    if (parts.length !== 3) {
      throw new Error('Invalid encrypted format');
    }

    const iv = Buffer.from(parts[0], 'hex');
    const authTag = Buffer.from(parts[1], 'hex');
    const encrypted = parts[2];

    const decipher = crypto.createDecipheriv(this.algorithm, this.key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }
}

interface SettingToMigrate {
  key: string;
  envVar: string;
  name: string;
  description: string;
  isEncrypted: boolean;
  isRequired: boolean;
}

const SETTINGS_TO_MIGRATE: SettingToMigrate[] = [
  {
    key: 'payment.yookassa.shop_id',
    envVar: 'YOOKASSA_SHOP_ID',
    name: 'Yookassa Shop ID',
    description: 'Yookassa merchant/shop ID',
    isEncrypted: false,
    isRequired: true,
  },
  {
    key: 'payment.yookassa.secret_key',
    envVar: 'YOOKASSA_SECRET_KEY',
    name: 'Yookassa Secret Key',
    description: 'Yookassa API secret key',
    isEncrypted: true,
    isRequired: true,
  },
  {
    key: 'payment.yookassa.webhook_secret',
    envVar: 'YOOKASSA_WEBHOOK_SECRET',
    name: 'Yookassa Webhook Secret',
    description: 'Secret for Yookassa webhook signature verification',
    isEncrypted: true,
    isRequired: false, // Optional, but recommended
  },
];

async function main() {
  console.log('🚀 Starting Yookassa Tokens → SystemSettings Migration\n');

  const encryption = new SimpleEncryption();
  const results: Array<{ key: string; status: 'created' | 'updated' | 'skipped' | 'error'; message: string }> = [];

  try {
    console.log('📋 Step 1: Reading environment variables...\n');

    // Check which env vars exist
    const envVars: Record<string, string | undefined> = {};
    SETTINGS_TO_MIGRATE.forEach((setting) => {
      const value = process.env[setting.envVar];
      envVars[setting.envVar] = value;

      if (value) {
        console.log(`   ✅ ${setting.envVar}: ${value.length > 0 ? '***' + value.slice(-4) : '(empty)'}`);
      } else {
        console.log(`   ${setting.isRequired ? '⚠️ ' : 'ℹ️ '} ${setting.envVar}: not found`);
      }
    });

    // Step 2: Migrate each setting
    console.log('\n📋 Step 2: Migrating settings to database...\n');

    for (const setting of SETTINGS_TO_MIGRATE) {
      const value = envVars[setting.envVar];

      // Skip if no value and not required
      if (!value && !setting.isRequired) {
        console.log(`   ⏭️  Skipping ${setting.key} (optional, not in .env)`);
        results.push({
          key: setting.key,
          status: 'skipped',
          message: 'Optional setting not found in .env',
        });
        continue;
      }

      // Error if required but missing
      if (!value && setting.isRequired) {
        console.log(`   ❌ Missing required ${setting.key} (${setting.envVar} not in .env)`);
        results.push({
          key: setting.key,
          status: 'error',
          message: `Required env var ${setting.envVar} not found`,
        });
        continue;
      }

      try {
        // Check if setting already exists
        const existing = await prisma.systemSettings.findUnique({
          where: { key: setting.key },
        });

        // Encrypt value if needed
        const finalValue = setting.isEncrypted ? encryption.encrypt(value!) : value!;

        if (existing) {
          // Update existing
          await prisma.systemSettings.update({
            where: { key: setting.key },
            data: {
              value: finalValue,
              updatedBy: 'migration-script',
            },
          });

          console.log(`   🔄 Updated ${setting.key}`);
          results.push({
            key: setting.key,
            status: 'updated',
            message: 'Existing setting updated',
          });
        } else {
          // Create new
          await prisma.systemSettings.create({
            data: {
              key: setting.key,
              category: SettingCategory.PAYMENT,
              name: setting.name,
              description: setting.description,
              valueType: SettingValueType.STRING,
              value: finalValue,
              isEncrypted: setting.isEncrypted,
              isRequired: setting.isRequired,
              updatedBy: 'migration-script',
            },
          });

          console.log(`   ✨ Created ${setting.key}`);
          results.push({
            key: setting.key,
            status: 'created',
            message: 'New setting created',
          });
        }
      } catch (error) {
        console.log(`   ❌ Error migrating ${setting.key}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        results.push({
          key: setting.key,
          status: 'error',
          message: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    // Step 3: Validation
    console.log('\n📋 Step 3: Validating migration...\n');

    for (const setting of SETTINGS_TO_MIGRATE) {
      const dbSetting = await prisma.systemSettings.findUnique({
        where: { key: setting.key },
      });

      if (!dbSetting) {
        if (setting.isRequired) {
          console.log(`   ⚠️  ${setting.key}: NOT FOUND in database (required!)`);
        }
        continue;
      }

      // Validate encryption
      if (setting.isEncrypted) {
        try {
          const decrypted = encryption.decrypt(dbSetting.value!);
          const envValue = envVars[setting.envVar];

          if (decrypted === envValue) {
            console.log(`   ✅ ${setting.key}: Encrypted correctly, matches .env value`);
          } else {
            console.log(`   ⚠️  ${setting.key}: Encrypted, but value doesn't match .env`);
          }
        } catch (error) {
          console.log(`   ❌ ${setting.key}: Decryption failed - ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      } else {
        console.log(`   ✅ ${setting.key}: Saved correctly (not encrypted)`);
      }
    }

    // Step 4: Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 MIGRATION SUMMARY');
    console.log('='.repeat(60));

    const created = results.filter((r) => r.status === 'created').length;
    const updated = results.filter((r) => r.status === 'updated').length;
    const skipped = results.filter((r) => r.status === 'skipped').length;
    const errors = results.filter((r) => r.status === 'error').length;

    console.log(`Created:  ${created}`);
    console.log(`Updated:  ${updated}`);
    console.log(`Skipped:  ${skipped}`);
    console.log(`Errors:   ${errors}`);
    console.log('='.repeat(60));

    if (errors > 0) {
      console.log('\n⚠️  MIGRATION COMPLETED WITH ERRORS');
      console.log('\nErrors:');
      results
        .filter((r) => r.status === 'error')
        .forEach((r) => {
          console.log(`   - ${r.key}: ${r.message}`);
        });
    } else {
      console.log('\n✅ MIGRATION SUCCESSFUL!');
      console.log('\n💡 Next steps:');
      console.log('   1. Test your application to ensure it reads settings from SystemSettings');
      console.log('   2. Verify PaymentProviderFactory uses SystemSettings correctly');
      console.log('   3. Run validation script: pnpm ts-node scripts/validate-migration.ts');
      console.log('\n⚠️  IMPORTANT: Keep .env variables for now!');
      console.log('   - After thorough testing in production, you can remove:');
      console.log('     * YOOKASSA_SHOP_ID');
      console.log('     * YOOKASSA_SECRET_KEY');
      console.log('     * YOOKASSA_WEBHOOK_SECRET');
      console.log('   - The application will automatically fall back to .env if SystemSettings are missing');
    }
  } catch (error) {
    console.error('\n❌ MIGRATION FAILED:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run migration
main()
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
