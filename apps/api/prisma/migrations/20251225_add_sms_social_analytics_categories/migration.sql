-- AlterEnum: Add new values to SettingCategory enum
ALTER TYPE "SettingCategory" ADD VALUE IF NOT EXISTS 'SMS';
ALTER TYPE "SettingCategory" ADD VALUE IF NOT EXISTS 'SOCIAL';
ALTER TYPE "SettingCategory" ADD VALUE IF NOT EXISTS 'ANALYTICS';
