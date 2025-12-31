-- Add missing Telegram user fields to telegram_auth_tokens table
ALTER TABLE "telegram_auth_tokens"
ADD COLUMN IF NOT EXISTS "telegram_first_name" TEXT,
ADD COLUMN IF NOT EXISTS "telegram_last_name" TEXT,
ADD COLUMN IF NOT EXISTS "telegram_username" TEXT,
ADD COLUMN IF NOT EXISTS "telegram_photo_url" TEXT;










