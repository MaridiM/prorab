# Telegram Bots Management - Quick Start

> 🤖 Динамическое управление множественными Telegram ботами через админ-панель

**Version:** 1.5.0 | **Status:** ✅ Production Ready

## Быстрый старт

### 1. Настройка окружения

```env
# .env
ENCRYPTION_KEY=<32-byte-hex-key>          # openssl rand -hex 32
API_BASE_URL=https://api.prorab.space

# Optional: Default bots
TELEGRAM_BOT_TOKEN=<token-from-botfather>
```

### 2. Запуск миграции

```bash
cd apps/api
npx prisma migrate deploy
npx prisma generate
```

### 3. Старт приложения

```bash
pnpm dev  # или pnpm start
```

### 4. Создание бота

**Admin Panel:** Settings → Telegram Bots → Add Telegram Bot

1. **Bot Name:** `oauth` (unique)
2. **Token:** От [@BotFather](https://t.me/BotFather)
3. **Display Name:** `OAuth Bot`
4. Click **Test** → **Create**

✅ Done! Бот автоматически настроен с webhook.

## Основные возможности

| Feature | Description |
|---------|-------------|
| 🔐 **Шифрование** | Токены зашифрованы AES-256-GCM |
| 🔄 **Hot Reload** | Перезагрузка без рестарта |
| 🖼️ **Avatars** | Авто-загрузка в R2 storage |
| 🌐 **Webhooks** | Авто-конфигурация |
| 📊 **Stats** | Dashboard с метриками |
| 🔍 **Audit** | Полное логирование операций |

## Архитектура

```
Telegram API
    ↓
TelegramApiClient (fetch bot info, avatar)
    ↓
TelegramBotConfigService (CRUD, encryption)
    ↓
TelegramBotRegistry (dynamic loading)
    ↓
TelegramWebhookController (routing)
```

## API Operations

### GraphQL Queries

```graphql
# Get all bots
adminTelegramBots(includeInactive: true)

# Get specific bot
adminTelegramBot(id: "cm123...")
```

### GraphQL Mutations

```graphql
# Create bot
adminCreateTelegramBot(input: {
  botName: "notifications"
  token: "7123456789:AAH..."
  displayName: "Notifications Bot"
})

# Sync from Telegram (updates avatar)
adminSyncTelegramBot(botId: "cm123...")

# Hot reload
adminReloadTelegramBot(botId: "cm123...")
```

## Webhook URLs

Format: `https://api.prorab.space/webhooks/telegram/{botName}`

Examples:
- OAuth: `https://api.prorab.space/webhooks/telegram/oauth`
- Support: `https://api.prorab.space/webhooks/telegram/support`

## File Structure

```
Backend:
├── telegram-api-client.service.ts       # Telegram Bot API
├── telegram-bot-config.service.ts       # Config & CRUD
├── telegram-bot-registry.service.ts     # Dynamic loading
├── telegram-webhook.controller.ts       # Webhook routing
└── admin-telegram-bots.service.ts       # GraphQL layer

Frontend:
├── telegram-bots-panel.tsx              # Main container
├── telegram-bots-table.tsx              # Bots list
└── bot-config-dialog.tsx                # Create/Edit
```

## Common Tasks

### Add new bot
```
Admin Panel → Add → Fill form → Test → Create
```

### Update bot token
```
Edit Bot → Enter new token → Test → Save
```

### Sync bot info
```
Dropdown → Sync (fetches latest from Telegram + avatar)
```

### Reload bot
```
Dropdown → Reload (hot reload without restart)
```

## Troubleshooting

### Bot not responding?
1. Check `isActive` in admin panel
2. Verify webhook: Dropdown → Webhook Info
3. Reload bot: Dropdown → Reload

### Avatar not loading?
1. Sync bot: Dropdown → Sync
2. Check R2 credentials in `.env`
3. Verify bot has avatar on Telegram

### Token validation fails?
1. Get fresh token from @BotFather
2. Check token format: `{bot_id}:{hash}`
3. Verify network access to Telegram API

## Stats (v1.5.0)

- **Total LOC:** 3,379
  - Backend: 1,828
  - Frontend: 1,101
  - Docs: 450
- **Files Created:** 15
- **Time:** ~13 hours
- **Phases:** 6/6 complete

## Documentation

- 📖 **Full Guide:** [MULTI_BOT_TELEGRAM.md](./MULTI_BOT_TELEGRAM.md)
- 🚀 **Deployment:** [DEPLOYMENT_GUIDE_TELEGRAM_BOTS.md](./DEPLOYMENT_GUIDE_TELEGRAM_BOTS.md)
- 📝 **Changelog:** [changelog.backend.md](../changelog.backend.md)

## Security

✅ Token encryption (AES-256-GCM)
✅ Role-based access (SETTINGS_TELEGRAM)
✅ Audit logging
✅ HTTPS-only webhooks
✅ Environment-based config

## Performance

- Avatar upload: ~200-500ms
- Hot reload: ~300-500ms
- Webhook response: <100ms
- DB query: <10ms

---

**Quick Links:**
- [Admin Panel](https://app.prorab.space/admin/settings?tab=telegram-bots)
- [BotFather](https://t.me/BotFather)
- [Telegram Bot API](https://core.telegram.org/bots/api)

**Version:** 1.5.0 | **Status:** ✅ Ready
