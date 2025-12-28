-- Setup Payment Providers for ProRab
-- This ensures at least one active payment provider exists

-- First, check if providers exist
DO $$
DECLARE
    yookassa_count INT;
    stripe_count INT;
BEGIN
    SELECT COUNT(*) INTO yookassa_count FROM "PaymentProvider" WHERE type = 'YOOKASSA';
    SELECT COUNT(*) INTO stripe_count FROM "PaymentProvider" WHERE type = 'STRIPE';

    -- If no providers exist, create them
    IF stripe_count = 0 THEN
        INSERT INTO "PaymentProvider" (id, type, name, "isActive", "isPrimary", "createdAt", "updatedAt")
        VALUES (
            gen_random_uuid(),
            'STRIPE',
            'Stripe',
            true,
            true, -- Primary provider for international
            NOW(),
            NOW()
        );
        RAISE NOTICE 'Created Stripe provider (Primary)';
    ELSE
        -- Update existing Stripe to be active and primary
        UPDATE "PaymentProvider"
        SET "isActive" = true, "isPrimary" = true, "updatedAt" = NOW()
        WHERE type = 'STRIPE';
        RAISE NOTICE 'Updated Stripe to be active and primary';
    END IF;

    IF yookassa_count = 0 THEN
        INSERT INTO "PaymentProvider" (id, type, name, "isActive", "isPrimary", "createdAt", "updatedAt")
        VALUES (
            gen_random_uuid(),
            'YOOKASSA',
            'ЮKassa',
            true,
            false, -- Secondary provider for CIS
            NOW(),
            NOW()
        );
        RAISE NOTICE 'Created Yookassa provider (Secondary)';
    ELSE
        -- Update existing Yookassa to be active but not primary
        UPDATE "PaymentProvider"
        SET "isActive" = true, "isPrimary" = false, "updatedAt" = NOW()
        WHERE type = 'YOOKASSA';
        RAISE NOTICE 'Updated Yookassa to be active (secondary)';
    END IF;
END $$;

-- Show current providers
SELECT
    type,
    name,
    "isActive" as active,
    "isPrimary" as primary,
    "createdAt" as created
FROM "PaymentProvider"
ORDER BY "isPrimary" DESC, type;
