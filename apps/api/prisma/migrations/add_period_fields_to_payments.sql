-- Add period_start_at and period_end_at columns to payments table
-- These fields track the subscription period covered by each payment

-- Add columns if they don't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'payments' AND column_name = 'period_start_at'
    ) THEN
        ALTER TABLE payments ADD COLUMN period_start_at TIMESTAMP;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'payments' AND column_name = 'period_end_at'
    ) THEN
        ALTER TABLE payments ADD COLUMN period_end_at TIMESTAMP;
    END IF;
END $$;

-- Update existing payments with period information based on subscription data
-- For succeeded payments, calculate periods based on subscription currentPeriodStart/currentPeriodEnd
UPDATE payments p
SET 
    period_start_at = COALESCE(
        p.period_start_at,
        CASE 
            -- If payment has paid_at, use it as period start
            WHEN p.paid_at IS NOT NULL THEN p.paid_at
            -- Otherwise use created_at
            ELSE p.created_at
        END
    ),
    period_end_at = COALESCE(
        p.period_end_at,
        CASE 
            -- If payment has paid_at, calculate end date (30 days later)
            WHEN p.paid_at IS NOT NULL THEN p.paid_at + INTERVAL '30 days'
            -- Otherwise use created_at + 30 days
            ELSE p.created_at + INTERVAL '30 days'
        END
    )
WHERE p.status = 'SUCCEEDED'
  AND (p.period_start_at IS NULL OR p.period_end_at IS NULL);

-- For payments with subscription, try to use subscription period data
UPDATE payments p
SET 
    period_start_at = COALESCE(
        p.period_start_at,
        s.current_period_start,
        CASE 
            WHEN p.paid_at IS NOT NULL THEN p.paid_at
            ELSE p.created_at
        END
    ),
    period_end_at = COALESCE(
        p.period_end_at,
        s.current_period_end,
        CASE 
            WHEN p.paid_at IS NOT NULL THEN p.paid_at + INTERVAL '30 days'
            ELSE p.created_at + INTERVAL '30 days'
        END
    )
FROM subscriptions s
WHERE p.subscription_id = s.id
  AND p.status = 'SUCCEEDED'
  AND (p.period_start_at IS NULL OR p.period_end_at IS NULL);





