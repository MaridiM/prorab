-- CreateTable
CREATE TABLE "telegram_bots" (
    "id" TEXT NOT NULL,
    "bot_name" VARCHAR(50) NOT NULL,
    "token" TEXT NOT NULL,
    "username" VARCHAR(50) NOT NULL,
    "display_name" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_primary" BOOLEAN NOT NULL DEFAULT false,
    "webhook_url" TEXT,
    "avatar_url" TEXT,
    "first_name" TEXT,
    "can_join_groups" BOOLEAN NOT NULL DEFAULT false,
    "can_read_messages" BOOLEAN NOT NULL DEFAULT false,
    "supports_inline_queries" BOOLEAN NOT NULL DEFAULT false,
    "created_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "last_sync_at" TIMESTAMP(3),

    CONSTRAINT "telegram_bots_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "telegram_bots_bot_name_key" ON "telegram_bots"("bot_name");

-- CreateIndex
CREATE UNIQUE INDEX "telegram_bots_username_key" ON "telegram_bots"("username");

-- CreateIndex
CREATE INDEX "telegram_bots_bot_name_idx" ON "telegram_bots"("bot_name");

-- CreateIndex
CREATE INDEX "telegram_bots_is_active_idx" ON "telegram_bots"("is_active");
