/**
 * Seed script for storage-related system settings
 * Run: npx ts-node prisma/seed-storage-settings.ts
 */

import { PrismaClient, SettingCategory, SettingValueType } from './generated/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '../../.env' });
dotenv.config();

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error('❌ DATABASE_URL is not set');
  process.exit(1);
}

const pool = new Pool({ connectionString: databaseUrl });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// Storage settings to seed
const storageSettings = [
  // Admin Mode
  {
    key: 'storage.admin_mode',
    category: SettingCategory.STORAGE,
    name: 'Storage Admin Mode',
    description: 'Controls which storage provider to use: cloudinary, r2, local, or user_choice (allows users to choose)',
    valueType: SettingValueType.STRING,
    value: 'local',
    defaultValue: 'local',
    isEncrypted: false,
    isRequired: true,
    validationRules: {
      enum: ['cloudinary', 'r2', 'local', 'user_choice'],
    },
  },

  // Default Provider
  {
    key: 'storage.default_provider',
    category: SettingCategory.STORAGE,
    name: 'Default Storage Provider',
    description: 'Default storage provider when admin_mode is "user_choice" and user has no preference',
    valueType: SettingValueType.STRING,
    value: 'local',
    defaultValue: 'local',
    isEncrypted: false,
    isRequired: true,
    validationRules: {
      enum: ['cloudinary', 'r2', 'local'],
    },
  },

  // Auto-migrate
  {
    key: 'storage.auto_migrate',
    category: SettingCategory.STORAGE,
    name: 'Auto-migrate Files',
    description: 'Automatically migrate user files when switching storage providers',
    valueType: SettingValueType.BOOLEAN,
    value: 'false',
    defaultValue: 'false',
    isEncrypted: false,
    isRequired: false,
    validationRules: null as any,
  },

  // Cloudinary Settings
  {
    key: 'storage.cloudinary.cloud_name',
    category: SettingCategory.STORAGE,
    name: 'Cloudinary Cloud Name',
    description: 'Your Cloudinary cloud name',
    valueType: SettingValueType.STRING,
    value: 'prorab-space',
    defaultValue: 'prorab-space',
    isEncrypted: false,
    isRequired: false,
    validationRules: null as any,
  },

  {
    key: 'storage.cloudinary.api_key',
    category: SettingCategory.STORAGE,
    name: 'Cloudinary API Key',
    description: 'Your Cloudinary API key',
    valueType: SettingValueType.STRING,
    value: '',
    defaultValue: '',
    isEncrypted: false,
    isRequired: false,
    validationRules: null as any,
  },

  {
    key: 'storage.cloudinary.api_secret',
    category: SettingCategory.STORAGE,
    name: 'Cloudinary API Secret',
    description: 'Your Cloudinary API secret (encrypted)',
    valueType: SettingValueType.ENCRYPTED,
    value: '',
    defaultValue: '',
    isEncrypted: true,
    isRequired: false,
    validationRules: null as any,
  },

  // R2 Settings
  {
    key: 'storage.r2.account_id',
    category: SettingCategory.STORAGE,
    name: 'Cloudflare Account ID',
    description: 'Your Cloudflare account ID for R2',
    valueType: SettingValueType.STRING,
    value: '',
    defaultValue: '',
    isEncrypted: false,
    isRequired: false,
    validationRules: null as any,
  },

  {
    key: 'storage.r2.access_key_id',
    category: SettingCategory.STORAGE,
    name: 'R2 Access Key ID',
    description: 'R2 access key ID (encrypted)',
    valueType: SettingValueType.ENCRYPTED,
    value: '',
    defaultValue: '',
    isEncrypted: true,
    isRequired: false,
    validationRules: null as any,
  },

  {
    key: 'storage.r2.secret_access_key',
    category: SettingCategory.STORAGE,
    name: 'R2 Secret Access Key',
    description: 'R2 secret access key (encrypted)',
    valueType: SettingValueType.ENCRYPTED,
    value: '',
    defaultValue: '',
    isEncrypted: true,
    isRequired: false,
    validationRules: null as any,
  },

  {
    key: 'storage.r2.bucket_name',
    category: SettingCategory.STORAGE,
    name: 'R2 Bucket Name',
    description: 'Name of your R2 bucket',
    valueType: SettingValueType.STRING,
    value: 'prorab-uploads',
    defaultValue: 'prorab-uploads',
    isEncrypted: false,
    isRequired: false,
    validationRules: null as any,
  },

  {
    key: 'storage.r2.public_url',
    category: SettingCategory.STORAGE,
    name: 'R2 Public URL',
    description: 'Public URL for R2 bucket (custom domain)',
    valueType: SettingValueType.STRING,
    value: 'https://uploads.prorab.space',
    defaultValue: 'https://uploads.prorab.space',
    isEncrypted: false,
    isRequired: false,
    validationRules: null as any,
  },
];

async function main() {
  console.log('🌱 Seeding storage system settings...');

  // Get or create system admin user (for updatedBy field)
  let systemAdmin = await prisma.user.findFirst({
    where: { email: 'system@prorab.app' },
  });

  if (!systemAdmin) {
    console.log('   Creating system admin user...');
    systemAdmin = await prisma.user.create({
      data: {
        email: 'system@prorab.app',
        emailNormalized: 'system@prorab.app',
        emailVerified: true,
        fullName: 'System Administrator',
        hasCompletedOnboarding: true,
      },
    });
  }

  // Seed each setting
  for (const setting of storageSettings) {
    const existing = await prisma.systemSettings.findUnique({
      where: { key: setting.key },
    });

    if (existing) {
      console.log(`   ⚠️  Setting already exists: ${setting.key}`);
      continue;
    }

    await prisma.systemSettings.create({
      data: {
        ...setting,
        updatedBy: systemAdmin.id,
      },
    });

    console.log(`   ✅ Created setting: ${setting.key}`);
  }

  console.log('✅ Storage settings seeded successfully!');
}

main()
  .catch((error) => {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
