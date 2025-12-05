-- CreateEnum: LogoType for teams
CREATE TYPE "LogoType" AS ENUM ('UPLOADED', 'GENERATED', 'DEFAULT');

-- CreateEnum: ProjectStatus for projects
CREATE TYPE "ProjectStatus" AS ENUM ('ACTIVE', 'ARCHIVED', 'COMPLETED');

-- CreateTable: teams
CREATE TABLE "teams" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "logo_type" "LogoType" NOT NULL DEFAULT 'GENERATED',
    "logo_url" TEXT,
    "icon_id" TEXT,
    "color_id" TEXT,
    "owner_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "teams_pkey" PRIMARY KEY ("id")
);

-- CreateTable: team_members
CREATE TABLE "team_members" (
    "id" TEXT NOT NULL,
    "team_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "role" VARCHAR(50) NOT NULL DEFAULT 'member',
    "joined_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "team_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable: invite_codes
CREATE TABLE "invite_codes" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "team_id" TEXT NOT NULL,
    "role" VARCHAR(50) NOT NULL DEFAULT 'member',
    "max_uses" INTEGER,
    "uses_count" INTEGER NOT NULL DEFAULT 0,
    "expires_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "invite_codes_pkey" PRIMARY KEY ("id")
);

-- AlterTable: users - add onboarding fields
ALTER TABLE "users" ADD COLUMN "onboarding_completed_at" TIMESTAMP(3);
ALTER TABLE "users" ADD COLUMN "current_team_id" TEXT;
ALTER TABLE "users" ADD COLUMN "has_completed_onboarding" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable: projects - migrate from old schema to new
-- Drop old primary key and recreate with UUID
ALTER TABLE "projects" DROP CONSTRAINT "projects_pkey";
ALTER TABLE "projects" ALTER COLUMN "id" DROP DEFAULT;
ALTER TABLE "projects" ALTER COLUMN "id" SET DATA TYPE TEXT;

-- Add new columns
ALTER TABLE "projects" ADD COLUMN "team_id" TEXT NOT NULL DEFAULT 'temp';
ALTER TABLE "projects" ADD COLUMN "address" VARCHAR(500);
ALTER TABLE "projects" ADD COLUMN "budget" DECIMAL(12,2);
ALTER TABLE "projects" ADD COLUMN "client_phone" TEXT;
ALTER TABLE "projects" ADD COLUMN "start_date" TIMESTAMP(3);
ALTER TABLE "projects" ADD COLUMN "end_date" TIMESTAMP(3);
ALTER TABLE "projects" ADD COLUMN "photo_url" TEXT;
ALTER TABLE "projects" ADD COLUMN "progress" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "projects" ADD COLUMN "notes" TEXT;
ALTER TABLE "projects" ADD COLUMN "status" "ProjectStatus" NOT NULL DEFAULT 'ACTIVE';
ALTER TABLE "projects" ADD COLUMN "archived_at" TIMESTAMP(3);
ALTER TABLE "projects" ADD COLUMN "completed_at" TIMESTAMP(3);
ALTER TABLE "projects" ADD COLUMN "created_by_id" TEXT NOT NULL DEFAULT 'temp';

-- Drop old isActive column if exists
ALTER TABLE "projects" DROP COLUMN IF EXISTS "is_active";

-- Add new primary key
ALTER TABLE "projects" ADD CONSTRAINT "projects_pkey" PRIMARY KEY ("id");

-- CreateIndex
CREATE INDEX "teams_owner_id_idx" ON "teams"("owner_id");
CREATE INDEX "team_members_team_id_idx" ON "team_members"("team_id");
CREATE INDEX "team_members_user_id_idx" ON "team_members"("user_id");
CREATE UNIQUE INDEX "team_members_team_id_user_id_key" ON "team_members"("team_id", "user_id");
CREATE INDEX "invite_codes_code_idx" ON "invite_codes"("code");
CREATE INDEX "invite_codes_team_id_idx" ON "invite_codes"("team_id");
CREATE UNIQUE INDEX "invite_codes_code_key" ON "invite_codes"("code");
CREATE INDEX "users_current_team_id_idx" ON "users"("current_team_id");
CREATE INDEX "projects_team_id_idx" ON "projects"("team_id");
CREATE INDEX "projects_created_by_id_idx" ON "projects"("created_by_id");
CREATE INDEX "projects_status_idx" ON "projects"("status");
CREATE INDEX "projects_team_id_status_idx" ON "projects"("team_id", "status");

-- AddForeignKey
ALTER TABLE "teams" ADD CONSTRAINT "teams_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "team_members" ADD CONSTRAINT "team_members_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "team_members" ADD CONSTRAINT "team_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "invite_codes" ADD CONSTRAINT "invite_codes_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "users" ADD CONSTRAINT "users_current_team_id_fkey" FOREIGN KEY ("current_team_id") REFERENCES "teams"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "projects" ADD CONSTRAINT "projects_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "projects" ADD CONSTRAINT "projects_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
