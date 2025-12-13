import { PrismaClient } from '@prisma/generated/client';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../../.env') });

const prisma = new PrismaClient();

async function initializeDefaultSettings() {
  try {
    console.log('\n🔧 Initializing Default System Settings...\n');

    const defaultSettings = [
      // Payment Settings (Yookassa)
      {
        key: 'payment.yookassa.shop_id',
        category: 'PAYMENT',
        name: 'Yookassa Shop ID',
        description: 'Yookassa shop/merchant ID',
        valueType: 'STRING',
        isEncrypted: false,
        isRequired: true,
      },
      {
        key: 'payment.yookassa.secret_key',
        category: 'PAYMENT',
        name: 'Yookassa Secret Key',
        description: 'Yookassa API secret key',
        valueType: 'ENCRYPTED',
        isEncrypted: true,
        isRequired: true,
      },

      // Email Settings (Brevo)
      {
        key: 'email.brevo.api_key',
        category: 'EMAIL',
        name: 'Brevo API Key',
        description: 'Brevo (SendinBlue) API key',
        valueType: 'ENCRYPTED',
        isEncrypted: true,
        isRequired: true,
      },
      {
        key: 'email.brevo.sender_email',
        category: 'EMAIL',
        name: 'Sender Email',
        description: 'Default sender email address',
        valueType: 'STRING',
        defaultValue: 'noreply@prorab.space',
        isRequired: true,
      },
      {
        key: 'email.brevo.sender_name',
        category: 'EMAIL',
        name: 'Sender Name',
        description: 'Default sender name',
        valueType: 'STRING',
        defaultValue: 'ProRab.space',
        isRequired: true,
      },

      // Telegram Settings
      {
        key: 'telegram.bot_token',
        category: 'TELEGRAM',
        name: 'Telegram Bot Token',
        description: 'Telegram bot API token',
        valueType: 'ENCRYPTED',
        isEncrypted: true,
        isRequired: true,
      },
      {
        key: 'telegram.webhook_url',
        category: 'TELEGRAM',
        name: 'Webhook URL',
        description: 'Telegram webhook URL',
        valueType: 'STRING',
        isRequired: false,
      },

      // Storage Settings (R2)
      {
        key: 'storage.r2.account_id',
        category: 'STORAGE',
        name: 'R2 Account ID',
        description: 'Cloudflare R2 account ID',
        valueType: 'STRING',
        isRequired: true,
      },
      {
        key: 'storage.r2.access_key_id',
        category: 'STORAGE',
        name: 'R2 Access Key ID',
        description: 'R2 access key ID',
        valueType: 'ENCRYPTED',
        isEncrypted: true,
        isRequired: true,
      },
      {
        key: 'storage.r2.secret_access_key',
        category: 'STORAGE',
        name: 'R2 Secret Access Key',
        description: 'R2 secret access key',
        valueType: 'ENCRYPTED',
        isEncrypted: true,
        isRequired: true,
      },
      {
        key: 'storage.r2.bucket_name',
        category: 'STORAGE',
        name: 'R2 Bucket Name',
        description: 'R2 bucket name',
        valueType: 'STRING',
        isRequired: true,
      },
      {
        key: 'storage.r2.public_url',
        category: 'STORAGE',
        name: 'R2 Public URL',
        description: 'R2 public URL (custom domain)',
        valueType: 'STRING',
        isRequired: false,
      },

      // Security Settings
      {
        key: 'security.require_2fa_for_admins',
        category: 'SECURITY',
        name: 'Require 2FA for Admins',
        description: 'Enforce 2FA for all admin users',
        valueType: 'BOOLEAN',
        defaultValue: 'true',
        isRequired: true,
      },
      {
        key: 'security.max_login_attempts',
        category: 'SECURITY',
        name: 'Max Login Attempts',
        description: 'Maximum failed login attempts before lockout',
        valueType: 'NUMBER',
        defaultValue: '5',
        isRequired: true,
      },

      // General Settings
      {
        key: 'general.app_name',
        category: 'GENERAL',
        name: 'Application Name',
        description: 'Name of the application',
        valueType: 'STRING',
        defaultValue: 'ProRab.space',
        isRequired: true,
      },
      {
        key: 'general.support_email',
        category: 'GENERAL',
        name: 'Support Email',
        description: 'Support contact email',
        valueType: 'STRING',
        defaultValue: 'support@prorab.space',
        isRequired: true,
      },
    ];

    let created = 0;
    let skipped = 0;

    for (const setting of defaultSettings) {
      const existing = await prisma.systemSettings.findUnique({
        where: { key: setting.key },
      });

      if (existing) {
        console.log(`⏭️  Skipped: ${setting.key} (already exists)`);
        skipped++;
      } else {
        await prisma.systemSettings.create({
          data: setting as any,
        });
        console.log(`✅ Created: ${setting.key}`);
        created++;
      }
    }

    console.log(`\n📊 Summary:`);
    console.log(`   ✅ Created: ${created}`);
    console.log(`   ⏭️  Skipped: ${skipped}`);
    console.log(`   📝 Total: ${defaultSettings.length}`);
    console.log('\n✨ Done!\n');
  } catch (error) {
    console.error('\n❌ Error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

initializeDefaultSettings();
