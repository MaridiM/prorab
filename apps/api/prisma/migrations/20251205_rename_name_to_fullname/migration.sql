-- Rename 'name' column to 'full_name' in users table
-- Make full_name NOT NULL (required field)

-- First, update any NULL values to empty string (if any exist)
UPDATE "users" SET "name" = 'User' WHERE "name" IS NULL OR "name" = '';

-- Rename the column
ALTER TABLE "users" RENAME COLUMN "name" TO "full_name";

-- Make the column NOT NULL
ALTER TABLE "users" ALTER COLUMN "full_name" SET NOT NULL;
