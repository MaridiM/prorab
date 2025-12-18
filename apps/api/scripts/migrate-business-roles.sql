-- ============================================================
-- Stage 14: Role System Normalization & Business Role Migration
-- ============================================================
-- This script:
-- 1. Creates new BusinessRole and TeamRole enums
-- 2. Migrates TeamMember.role from String to TeamRole enum
-- 3. Assigns businessRole to existing users based on team relationships
-- 4. Resolves conflicts (users with both FOREMAN and WORKER roles)
-- ============================================================

BEGIN;

-- ============================================================
-- STEP 1: Create new enums
-- ============================================================

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'BusinessRole') THEN
    CREATE TYPE "BusinessRole" AS ENUM ('FOREMAN', 'WORKER');
    RAISE NOTICE '✅ Created BusinessRole enum';
  ELSE
    RAISE NOTICE '⚠️  BusinessRole enum already exists, skipping';
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'TeamRole') THEN
    CREATE TYPE "TeamRole" AS ENUM ('OWNER', 'MEMBER');
    RAISE NOTICE '✅ Created TeamRole enum';
  ELSE
    RAISE NOTICE '⚠️  TeamRole enum already exists, skipping';
  END IF;
END $$;

-- ============================================================
-- STEP 2: Add businessRole columns to users table
-- ============================================================

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'business_role'
  ) THEN
    ALTER TABLE "users" ADD COLUMN "business_role" "BusinessRole";
    RAISE NOTICE '✅ Added business_role column to users';
  ELSE
    RAISE NOTICE '⚠️  business_role column already exists';
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'business_role_assigned_at'
  ) THEN
    ALTER TABLE "users" ADD COLUMN "business_role_assigned_at" TIMESTAMP(3);
    RAISE NOTICE '✅ Added business_role_assigned_at column to users';
  ELSE
    RAISE NOTICE '⚠️  business_role_assigned_at column already exists';
  END IF;
END $$;

-- ============================================================
-- STEP 3: Migrate TeamMember.role from String to Enum
-- ============================================================

-- Add temporary column
ALTER TABLE "team_members" ADD COLUMN IF NOT EXISTS "role_new" "TeamRole";

-- Migrate data with case-insensitive matching
UPDATE "team_members" SET "role_new" =
  CASE
    WHEN LOWER("role") = 'owner' THEN 'OWNER'::"TeamRole"
    WHEN LOWER("role") = 'member' THEN 'MEMBER'::"TeamRole"
    ELSE 'MEMBER'::"TeamRole" -- Default to MEMBER for any unexpected values
  END
WHERE "role_new" IS NULL;

-- Verify no NULLs before proceeding
DO $$
DECLARE
  null_count INT;
BEGIN
  SELECT COUNT(*) INTO null_count FROM "team_members" WHERE "role_new" IS NULL;
  IF null_count > 0 THEN
    RAISE EXCEPTION '❌ Migration failed: % team_members have NULL role_new', null_count;
  ELSE
    RAISE NOTICE '✅ All team_members have valid role_new values';
  END IF;
END $$;

-- Drop old column and rename new one
ALTER TABLE "team_members" DROP COLUMN IF EXISTS "role";
ALTER TABLE "team_members" RENAME COLUMN "role_new" TO "role";
ALTER TABLE "team_members" ALTER COLUMN "role" SET DEFAULT 'MEMBER'::"TeamRole";
ALTER TABLE "team_members" ALTER COLUMN "role" SET NOT NULL;

RAISE NOTICE '✅ Migrated TeamMember.role to TeamRole enum';

-- ============================================================
-- STEP 4: Assign businessRole to existing users
-- ============================================================

-- 4.1: Assign FOREMAN to team owners
UPDATE "users" u
SET
  "business_role" = 'FOREMAN'::"BusinessRole",
  "business_role_assigned_at" = NOW()
WHERE EXISTS (
  SELECT 1 FROM "teams" t WHERE t."owner_id" = u.id
)
AND "business_role" IS NULL;

-- Log FOREMAN assignments
DO $$
DECLARE
  foremen_count INT;
BEGIN
  SELECT COUNT(*) INTO foremen_count FROM "users" WHERE "business_role" = 'FOREMAN';
  RAISE NOTICE '✅ Assigned FOREMAN role to % users', foremen_count;
END $$;

-- 4.2: Assign WORKER to team members (who are NOT owners)
UPDATE "users" u
SET
  "business_role" = 'WORKER'::"BusinessRole",
  "business_role_assigned_at" = NOW()
WHERE EXISTS (
  SELECT 1 FROM "team_members" tm
  WHERE tm."user_id" = u.id AND tm."role" = 'MEMBER'::"TeamRole"
)
AND NOT EXISTS (
  SELECT 1 FROM "teams" t WHERE t."owner_id" = u.id
)
AND "business_role" IS NULL;

-- Log WORKER assignments
DO $$
DECLARE
  workers_count INT;
BEGIN
  SELECT COUNT(*) INTO workers_count FROM "users" WHERE "business_role" = 'WORKER';
  RAISE NOTICE '✅ Assigned WORKER role to % users', workers_count;
END $$;

-- ============================================================
-- STEP 5: Handle conflicts
-- ============================================================

-- Identify users who OWN teams AND are members elsewhere
WITH conflict_users AS (
  SELECT DISTINCT u.id
  FROM "users" u
  INNER JOIN "teams" t ON t."owner_id" = u.id
  INNER JOIN "team_members" tm ON tm."user_id" = u.id
    AND tm."team_id" != t.id
    AND tm."role" = 'MEMBER'::"TeamRole"
)
UPDATE "users" u
SET
  "business_role" = 'FOREMAN'::"BusinessRole",
  "business_role_assigned_at" = NOW()
FROM conflict_users cu
WHERE u.id = cu.id;

-- Log conflicts
DO $$
DECLARE
  conflict_count INT;
BEGIN
  SELECT COUNT(DISTINCT u.id) INTO conflict_count
  FROM "users" u
  INNER JOIN "teams" t ON t."owner_id" = u.id
  INNER JOIN "team_members" tm ON tm."user_id" = u.id
    AND tm."team_id" != t.id
    AND tm."role" = 'MEMBER'::"TeamRole";

  IF conflict_count > 0 THEN
    RAISE WARNING '⚠️  Resolved % users with BOTH roles → kept as FOREMAN', conflict_count;
  ELSE
    RAISE NOTICE '✅ No role conflicts found';
  END IF;
END $$;

-- Clean up conflicting memberships (remove worker memberships for FOREMAN users)
WITH deleted AS (
  DELETE FROM "team_members" tm
  WHERE tm."user_id" IN (
    SELECT u.id FROM "users" u WHERE u."business_role" = 'FOREMAN'::"BusinessRole"
  )
  AND tm."role" = 'MEMBER'::"TeamRole"
  AND tm."team_id" NOT IN (
    SELECT t.id FROM "teams" t WHERE t."owner_id" = tm."user_id"
  )
  RETURNING *
)
SELECT COUNT(*) FROM deleted;

DO $$
DECLARE
  deleted_count INT;
BEGIN
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  IF deleted_count > 0 THEN
    RAISE NOTICE '🧹 Removed % conflicting worker memberships', deleted_count;
  ELSE
    RAISE NOTICE '✅ No conflicting memberships to clean up';
  END IF;
END $$;

-- ============================================================
-- STEP 6: Create index on business_role
-- ============================================================

CREATE INDEX IF NOT EXISTS "users_business_role_idx" ON "users"("business_role");
RAISE NOTICE '✅ Created index on users.business_role';

-- ============================================================
-- STEP 7: Verify final state
-- ============================================================

DO $$
DECLARE
  total_users INT;
  foremen INT;
  workers INT;
  no_role INT;
  total_members INT;
  owner_members INT;
  regular_members INT;
BEGIN
  -- User role distribution
  SELECT COUNT(*) INTO total_users FROM "users";
  SELECT COUNT(*) INTO foremen FROM "users" WHERE "business_role" = 'FOREMAN'::"BusinessRole";
  SELECT COUNT(*) INTO workers FROM "users" WHERE "business_role" = 'WORKER'::"BusinessRole";
  SELECT COUNT(*) INTO no_role FROM "users" WHERE "business_role" IS NULL;

  -- Team member role distribution
  SELECT COUNT(*) INTO total_members FROM "team_members";
  SELECT COUNT(*) INTO owner_members FROM "team_members" WHERE "role" = 'OWNER'::"TeamRole";
  SELECT COUNT(*) INTO regular_members FROM "team_members" WHERE "role" = 'MEMBER'::"TeamRole";

  RAISE NOTICE '============================================================';
  RAISE NOTICE '✅ MIGRATION COMPLETE - Final State:';
  RAISE NOTICE '============================================================';
  RAISE NOTICE 'USER BUSINESS ROLES:';
  RAISE NOTICE '  Total users:    %', total_users;
  RAISE NOTICE '  FOREMAN:        % (%.1f%%)', foremen, (foremen::FLOAT / NULLIF(total_users, 0) * 100);
  RAISE NOTICE '  WORKER:         % (%.1f%%)', workers, (workers::FLOAT / NULLIF(total_users, 0) * 100);
  RAISE NOTICE '  No role yet:    % (%.1f%%)', no_role, (no_role::FLOAT / NULLIF(total_users, 0) * 100);
  RAISE NOTICE '';
  RAISE NOTICE 'TEAM MEMBER ROLES:';
  RAISE NOTICE '  Total members:  %', total_members;
  RAISE NOTICE '  OWNER:          % (%.1f%%)', owner_members, (owner_members::FLOAT / NULLIF(total_members, 0) * 100);
  RAISE NOTICE '  MEMBER:         % (%.1f%%)', regular_members, (regular_members::FLOAT / NULLIF(total_members, 0) * 100);
  RAISE NOTICE '============================================================';
END $$;

COMMIT;
