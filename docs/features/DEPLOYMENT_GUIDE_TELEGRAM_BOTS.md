# Deployment Guide: Multi-Bot Telegram Management

**Version:** 1.5.0
**Last Updated:** 2025-12-27

## Pre-Deployment Checklist

### 1. Environment Variables

Убедитесь, что следующие переменные настроены:

```env
# Required - Encryption for bot tokens
ENCRYPTION_KEY=your-32-byte-hex-key-here

# Required - Base URL for webhook generation
API_BASE_URL=https://api.prorab.space

# Optional - Default bots (auto-created on first run)
TELEGRAM_BOT_TOKEN=7123456789:AAHdqTcvCH1vGWJxfSeofSAs0K5PALDsaw
TELEGRAM_SUPPORT_BOT_TOKEN=7987654321:BBGdqTcvCH1vGWJxfSeofSAs0K5PALDsaw
```

#### Generating ENCRYPTION_KEY

```bash
# Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# OpenSSL
openssl rand -hex 32
```

### 2. Database Migration

```bash
cd apps/api

# Generate Prisma Client with new TelegramBot model
npx prisma generate

# Run migration
npx prisma migrate deploy
```

### 3. Dependencies Check

Убедитесь, что все зависимости установлены:

```bash
# Root level
pnpm install

# Verify Sharp is installed (for avatar processing)
cd apps/api
pnpm list sharp
```

## Deployment Steps

### Step 1: Build Application

```bash
# From root directory
pnpm build

# Or build individually
cd apps/api && pnpm build
cd apps/web && pnpm build
```

### Step 2: Database Schema

```bash
cd apps/api

# Apply migration
npx prisma migrate deploy

# Verify TelegramBot table exists
npx prisma studio
# Check for "TelegramBot" model in Prisma Studio
```

### Step 3: Start Services

```bash
# Development
pnpm dev

# Production
cd apps/api && pnpm start
cd apps/web && pnpm start
```

### Step 4: Verify Initialization

Check logs for:
```
[TelegramModule] Initializing default Telegram bots from environment variables
[TelegramModule] OAuth bot initialized from environment
[TelegramBotConfigService] Creating new Telegram bot: oauth
[TelegramBotRegistry] Bot registry auto-loading disabled (development mode)
```

**Note:** Auto-loading is temporarily disabled to avoid conflicts with old TelegrafModule.

## Post-Deployment Configuration

### 1. Enable Bot Auto-Loading

Once old TelegrafModule is removed, uncomment in `telegram.module.ts`:

```typescript
async onModuleInit() {
  try {
    await this.botConfigService.initializeDefaultBots()

    // Uncomment this line:
    await this.botRegistry.loadAllActiveBots()

    console.log('[TelegramModule] Bot registry initialized')
  } catch (error) {
    console.error('Failed to initialize Telegram bots:', error)
  }
}
```

### 2. Access Admin Panel

1. Navigate to: `https://your-domain.com/admin/settings`
2. Go to: **System Settings → Telegram Bots**
3. Verify default bots are listed (if env variables were set)

### 3. Create First Bot (Manual)

If no env variables were provided:

1. Click **"Add Telegram Bot"**
2. Fill the form:
   - **Bot Name:** `oauth` (unique identifier)
   - **Token:** Get from [@BotFather](https://t.me/BotFather)
   - **Display Name:** `OAuth Bot`
   - **Description:** `Primary authentication bot`
3. Click **"Test"** to validate token
4. Click **"Create Bot"**

### 4. Set Webhook

Webhooks are auto-configured when creating/updating bots. To verify:

1. In bot row, click dropdown → **"Webhook Info"**
2. Check URL: `https://api.prorab.space/webhooks/telegram/oauth`
3. Verify `pending_update_count` is low

Manual webhook setup (if needed):
```bash
curl -X POST "https://api.telegram.org/bot<TOKEN>/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{"url":"https://api.prorab.space/webhooks/telegram/oauth"}'
```

### 5. Test Bot Functionality

```bash
# Send test message to bot on Telegram
/start

# Check logs for webhook delivery
[TelegramWebhookController] Received update for bot: oauth
[TelegramBotRegistry] Processing update for bot: oauth
```

## Storage Configuration (R2)

### For Avatar Upload to Work

Ensure R2 credentials are configured:

```env
# Cloudflare R2
R2_ACCOUNT_ID=your-account-id
R2_ACCESS_KEY_ID=your-access-key
R2_SECRET_ACCESS_KEY=your-secret-key
R2_BUCKET_NAME=prorab-space
R2_PUBLIC_URL=https://pub-xxxxx.r2.dev
```

### Test Avatar Upload

1. In admin panel, select a bot
2. Click **"Sync"** from dropdown
3. Avatar should appear in table within 2-3 seconds
4. Check R2 bucket: `prorab-space/system/bot-avatars/`

## Troubleshooting

### Issue: Bots not responding

**Check:**
```bash
# 1. Verify bot is active in database
psql -d prorab -c "SELECT bot_name, is_active, webhook_url FROM telegram_bots;"

# 2. Check bot registry
curl http://localhost:8080/api/health

# 3. Verify webhook is set
curl "https://api.telegram.org/bot<TOKEN>/getWebhookInfo"
```

**Solution:**
- Reload bot from admin panel
- Check firewall allows HTTPS traffic
- Verify SSL certificate is valid

### Issue: Token encryption errors

**Check:**
```bash
# Verify ENCRYPTION_KEY is set
echo $ENCRYPTION_KEY

# Should be 64 characters (32 bytes hex)
```

**Solution:**
- Generate new key: `openssl rand -hex 32`
- Update environment variable
- Restart application

### Issue: Avatar not uploading

**Check:**
```bash
# 1. Verify Sharp is installed
npm list sharp

# 2. Check R2 credentials
echo $R2_ACCESS_KEY_ID
echo $R2_BUCKET_NAME
```

**Solution:**
- Reinstall sharp: `pnpm add sharp`
- Verify R2 bucket exists and is public
- Check bot actually has avatar on Telegram

### Issue: Migration fails

**Error:** `Table telegram_bots already exists`

**Solution:**
```bash
# Mark migration as applied
npx prisma migrate resolve --applied 20251227_create_telegram_bots
```

**Error:** `Column "avatarUrl" does not exist`

**Solution:**
```bash
# Reset and reapply migrations
npx prisma migrate reset
npx prisma migrate deploy
```

## Security Recommendations

### 1. Token Security

- ✅ Tokens are encrypted at rest (AES-256-GCM)
- ✅ Never log decrypted tokens
- ✅ Rotate ENCRYPTION_KEY periodically
- ✅ Use environment variables, not hardcoded values

### 2. Webhook Security

- ✅ Use HTTPS only (Telegram requirement)
- ✅ Validate webhook source IP (Telegram ranges)
- ✅ Rate limiting on webhook endpoint
- ✅ Monitor for suspicious activity

### 3. Admin Access

- ✅ Require SETTINGS_TELEGRAM permission
- ✅ All operations logged in AdminActionLog
- ✅ Review audit logs regularly
- ✅ Limit number of super admins

### 4. Database Backups

```bash
# Backup telegram_bots table
pg_dump -t telegram_bots prorab > telegram_bots_backup.sql

# Restore if needed
psql prorab < telegram_bots_backup.sql
```

## Monitoring

### Key Metrics to Track

1. **Bot Uptime**
   - Check `is_active` status
   - Monitor webhook delivery rate
   - Alert on failed reloads

2. **Avatar Sync**
   - Track `last_sync_at` timestamps
   - Monitor R2 storage usage
   - Alert on upload failures

3. **Performance**
   - Webhook response times (<100ms)
   - Bot reload times (<500ms)
   - Database query performance

### Health Check Endpoint

```bash
# Check if bots are loaded
curl http://localhost:8080/api/health

# Expected response includes:
# - Number of registered bots
# - Active webhook URLs
# - Registry status
```

## Rollback Plan

If deployment fails:

### 1. Rollback Code
```bash
git revert HEAD
pnpm build
pm2 restart all
```

### 2. Rollback Database
```bash
# Revert migration
npx prisma migrate resolve --rolled-back 20251227_create_telegram_bots

# Apply previous state
npx prisma migrate deploy
```

### 3. Restore Environment
```bash
# Restore previous .env
cp .env.backup .env

# Restart services
pm2 restart all
```

## Performance Optimization

### 1. Database Indexes

Already created:
```sql
CREATE INDEX IF NOT EXISTS "telegram_bots_bot_name_idx" ON "telegram_bots"("bot_name");
CREATE INDEX IF NOT EXISTS "telegram_bots_is_active_idx" ON "telegram_bots"("is_active");
```

### 2. Caching Strategy

Consider adding Redis cache for:
- Bot token lookups (frequently accessed)
- Webhook info (reduce Telegram API calls)
- Bot metadata (faster UI rendering)

### 3. Webhook Optimization

```typescript
// Already implemented:
// - Non-blocking webhook processing
// - Parallel bot instance lookup
// - Graceful error handling
```

## Scaling Considerations

### Horizontal Scaling

If running multiple API instances:

1. **Shared Database:** All instances read from same `telegram_bots` table ✅
2. **Bot Registry:** Each instance maintains its own registry ✅
3. **Webhooks:** Use load balancer with sticky sessions
4. **Avatar Uploads:** R2 handles concurrent uploads ✅

### Load Balancing

```nginx
upstream api {
    least_conn;
    server api1.prorab.space:8080;
    server api2.prorab.space:8080;
}

location /webhooks/telegram/ {
    proxy_pass http://api;
    # Sticky sessions by bot name in URL
    hash $request_uri consistent;
}
```

## Support & Maintenance

### Regular Tasks

**Daily:**
- Monitor error logs for webhook failures
- Check bot active status in admin panel

**Weekly:**
- Review audit logs for bot operations
- Verify avatar sync is working
- Check R2 storage usage

**Monthly:**
- Update dependencies (pnpm update)
- Review bot performance metrics
- Clean up inactive bots

### Getting Help

- **Documentation:** [MULTI_BOT_TELEGRAM.md](./MULTI_BOT_TELEGRAM.md)
- **Changelogs:** [changelog.backend.md](../changelog.backend.md)
- **Troubleshooting:** See above section
- **Logs:** Check `[TelegramModule]`, `[TelegramBotRegistry]`, `[TelegramWebhookController]`

## Success Criteria

Deployment is successful when:

- ✅ Migration applied without errors
- ✅ Admin panel shows "Telegram Bots" tab
- ✅ Can create new bot through UI
- ✅ Test token validates correctly
- ✅ Webhook auto-configures
- ✅ Bot responds to /start command
- ✅ Avatar syncs from Telegram
- ✅ Hot reload works without restart
- ✅ All operations logged in audit

---

**Deployment Version:** 1.5.0
**Last Verified:** 2025-12-27
**Status:** Production Ready ✅
