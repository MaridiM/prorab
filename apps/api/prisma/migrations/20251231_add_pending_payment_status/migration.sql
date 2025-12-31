-- AlterEnum
-- Add PENDING_PAYMENT status to SubscriptionStatus enum
ALTER TYPE "SubscriptionStatus" ADD VALUE IF NOT EXISTS 'PENDING_PAYMENT';
