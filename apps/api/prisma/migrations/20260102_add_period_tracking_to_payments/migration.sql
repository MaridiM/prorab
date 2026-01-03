-- Add period tracking fields to payments table
-- These fields store the subscription period covered by each payment
-- This allows accurate subscription history display without complex calculations

ALTER TABLE "payments" ADD COLUMN IF NOT EXISTS "period_start_at" TIMESTAMP(3);
ALTER TABLE "payments" ADD COLUMN IF NOT EXISTS "period_end_at" TIMESTAMP(3);

-- Note: Existing payments will have NULL values for these fields
-- They can be backfilled if needed, or displayed as "Unknown period" in UI
