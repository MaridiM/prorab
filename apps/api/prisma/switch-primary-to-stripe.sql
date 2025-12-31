-- Switch Primary Payment Provider from YooKassa to Stripe
-- This script updates existing payment providers to make Stripe primary

-- Update Stripe to be primary
UPDATE "PaymentProvider"
SET "isPrimary" = true, "isActive" = true, "updatedAt" = NOW()
WHERE type = 'STRIPE';

-- Update YooKassa to be secondary (not primary)
UPDATE "PaymentProvider"
SET "isPrimary" = false, "isActive" = true, "updatedAt" = NOW()
WHERE type = 'YOOKASSA';

-- Update system setting for primary provider
UPDATE "SystemSetting"
SET value = 'stripe', "updatedAt" = NOW()
WHERE key = 'payment.primary_provider';

-- Show current providers status
SELECT
    type,
    name,
    "isActive" as active,
    "isPrimary" as primary,
    "updatedAt" as updated
FROM "PaymentProvider"
ORDER BY "isPrimary" DESC, type;

-- Show system setting
SELECT
    key,
    value,
    "updatedAt" as updated
FROM "SystemSetting"
WHERE key = 'payment.primary_provider';





