-- Create TeamRole enum if it doesn't exist
DO $$ BEGIN
    CREATE TYPE "TeamRole" AS ENUM ('OWNER', 'MEMBER');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add missing columns to team_members table
ALTER TABLE "team_members"
ADD COLUMN IF NOT EXISTS "position" VARCHAR(100),
ADD COLUMN IF NOT EXISTS "custom_role_id" TEXT,
ADD COLUMN IF NOT EXISTS "salary_type" VARCHAR(50) NOT NULL DEFAULT 'none',
ADD COLUMN IF NOT EXISTS "salary_amount" DECIMAL(12,2);

-- Change role column type from VARCHAR to TeamRole enum
-- Check if column is already the correct type, if not convert it
DO $$ 
BEGIN
    -- Only convert if the column is not already TeamRole enum
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'team_members' 
        AND column_name = 'role' 
        AND udt_name != 'TeamRole'
    ) THEN
        -- Update existing values to uppercase
        UPDATE "team_members" 
        SET "role" = UPPER(CAST("role" AS VARCHAR(50)))
        WHERE LOWER(CAST("role" AS VARCHAR(50))) IN ('owner', 'member');
        
        -- Alter the column type
        ALTER TABLE "team_members" 
        ALTER COLUMN "role" TYPE "TeamRole" 
        USING CASE 
            WHEN UPPER(CAST("role" AS VARCHAR(50))) = 'OWNER' THEN 'OWNER'::"TeamRole"
            WHEN UPPER(CAST("role" AS VARCHAR(50))) = 'MEMBER' THEN 'MEMBER'::"TeamRole"
            ELSE 'MEMBER'::"TeamRole"
        END;
    END IF;
END $$;

-- Set default value for role column
ALTER TABLE "team_members" 
ALTER COLUMN "role" SET DEFAULT 'MEMBER';

-- Add indexes
CREATE INDEX IF NOT EXISTS "team_members_team_id_salary_type_idx" ON "team_members"("team_id", "salary_type");
CREATE INDEX IF NOT EXISTS "team_members_team_id_position_idx" ON "team_members"("team_id", "position");
CREATE INDEX IF NOT EXISTS "team_members_custom_role_id_idx" ON "team_members"("custom_role_id");

-- Add foreign key constraint for custom_role_id if CustomRole table exists
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'custom_roles') THEN
        ALTER TABLE "team_members" 
        ADD CONSTRAINT "team_members_custom_role_id_fkey" 
        FOREIGN KEY ("custom_role_id") 
        REFERENCES "custom_roles"("id") 
        ON DELETE SET NULL 
        ON UPDATE CASCADE;
    END IF;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

