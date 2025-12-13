-- Add Telegram notification settings columns
ALTER TABLE "notification_settings"
ADD COLUMN IF NOT EXISTS "telegram_enabled" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN IF NOT EXISTS "telegram_salary_changes" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN IF NOT EXISTS "telegram_payouts" BOOLEAN NOT NULL DEFAULT true;
