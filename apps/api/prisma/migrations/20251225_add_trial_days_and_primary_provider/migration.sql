-- Add trial_days field to subscription_plans table
ALTER TABLE "subscription_plans" ADD COLUMN "trial_days" INTEGER;

-- Add comment
COMMENT ON COLUMN "subscription_plans"."trial_days" IS 'Number of trial days for new subscriptions (null = no trial period)';
