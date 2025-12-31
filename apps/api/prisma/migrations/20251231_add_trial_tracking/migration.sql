-- Add column to track which plans user has trialed
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "trialed_plan_ids" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- Backfill existing trial usage from subscription history
-- Mark plans as trialed if user has any subscription with a trial period
UPDATE "users" u
SET "trialed_plan_ids" = (
  SELECT COALESCE(ARRAY_AGG(DISTINCT s."plan_id"), ARRAY[]::TEXT[])
  FROM "subscriptions" s
  INNER JOIN "teams" t ON s."team_id" = t."id"
  WHERE t."owner_id" = u."id"
    AND s."trial_ends_at" IS NOT NULL
    AND s."plan_id" IS NOT NULL
);

-- Ensure empty arrays for users with no trial history
UPDATE "users"
SET "trialed_plan_ids" = ARRAY[]::TEXT[]
WHERE "trialed_plan_ids" IS NULL;
