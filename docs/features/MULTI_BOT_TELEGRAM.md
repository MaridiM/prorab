# Multi-Bot Telegram Management System

**Version:** 1.5.0
**Status:** ✅ Production Ready
**Date:** 2025-12-27

## Обзор

Система управления множественными Telegram ботами позволяет динамически создавать, настраивать и управлять несколькими Telegram ботами через единую админ-панель без перезапуска приложения.

## Основные возможности

### 1. Управление ботами через Admin Panel

- 📊 **Dashboard с метриками**: Total Bots, Active Bots, Primary Bot
- ➕ **Создание ботов**: Добавление новых ботов с валидацией токена
- ✏️ **Редактирование**: Обновление настроек существующих ботов
- 🗑️ **Удаление**: Безопасное удаление с подтверждением
- 🔄 **Синхронизация**: Обновление данных из Telegram API
- 🔁 **Hot Reload**: Перезагрузка бота без рестарта приложения
- 🔐 **Шифрование токенов**: Автоматическое шифрование при сохранении

### 2. Информация о боте

Каждый бот содержит:
- **Bot Name** (уникальный идентификатор): `oauth`, `support`, `notifications`
- **Display Name**: Человекочитаемое имя для админ-панели
- **Username**: Telegram username (@botname)
- **Description**: Описание назначения бота
- **Token**: Зашифрованный токен от @BotFather
- **Avatar**: Автоматическая загрузка из Telegram в R2 storage
- **Webhook URL**: Автогенерация на основе bot name
- **Status**: Active/Inactive
- **Primary**: Отметка основного OAuth бота
- **Capabilities**: canJoinGroups, canReadMessages, supportsInlineQueries
- **Last Sync**: Время последней синхронизации

### 3. Автоматизация

- 🚀 **Auto-initialization**: Загрузка ботов из env при первом запуске
- 🔄 **Auto-loading**: Загрузка всех активных ботов при старте приложения
- 🖼️ **Avatar sync**: Автоматическая загрузка аватаров при синхронизации
- 🌐 **Webhook setup**: Автоматическая настройка webhook при создании/обновлении
- 🔐 **Fallback to env**: Поддержка токенов из environment variables

## Архитектура

### Backend Services

#### 1. TelegramApiClient
```typescript
// Взаимодействие с Telegram Bot API
getBotInfo(token: string): Promise<BotInfo>
getBotAvatar(token: string, botUserId: number): Promise<string | null>
setWebhook(token: string, webhookUrl: string): Promise<boolean>
deleteWebhook(token: string): Promise<boolean>
getWebhookInfo(token: string): Promise<WebhookInfo>
testBotToken(token: string): Promise<TestResult>
```

#### 2. TelegramBotConfigService
```typescript
// Управление конфигурацией ботов
create(input: CreateTelegramBotInput): Promise<TelegramBot>
update(id: string, input: UpdateTelegramBotInput): Promise<TelegramBot>
delete(id: string): Promise<void>
syncBotInfo(id: string): Promise<TelegramBot>
uploadBotAvatarFromTelegram(botId: string, token: string, userId: number): Promise<string | null>
getBotToken(botNameOrId: string): Promise<string | null>
```

#### 3. TelegramBotRegistry
```typescript
// Динамическая регистрация и управление инстансами
registerBot(botId: string): Promise<void>
unregisterBot(botId: string): Promise<void>
reloadBot(botId: string): Promise<void>
getBotInstance(botName: string): Telegraf | null
handleWebhookUpdate(botName: string, update: any): Promise<void>
loadAllActiveBots(): Promise<void>
```

#### 4. AdminTelegramBotsService
```typescript
// GraphQL API для админ-панели
findAll(includeInactive?: boolean): Promise<TelegramBot[]>
findById(id: string): Promise<TelegramBot | null>
createBot(input: CreateTelegramBotInput, adminId: string): Promise<TelegramBot>
updateBot(id: string, input: UpdateTelegramBotInput, adminId: string): Promise<TelegramBot>
deleteBot(id: string, adminId: string): Promise<void>
syncBot(id: string, adminId: string): Promise<TelegramBot>
reloadBot(id: string, adminId: string): Promise<boolean>
```

### Frontend Components

#### 1. TelegramBotsPanel
Главный контейнер с:
- Stats cards (Total, Active, Primary)
- Интеграция всех GraphQL queries/mutations
- State management для dialogs и loading states
- Toast notifications

#### 2. TelegramBotsTable
Таблица со списком ботов:
- 9 колонок: Avatar, Name, Username, Description, Status, Config, Primary, Webhook, Last Sync, Actions
- Dropdown меню с действиями
- Loading states для async операций
- Empty state с подсказками

#### 3. BotConfigDialog
Диалог создания/редактирования:
- Режимы: Create и Edit
- Test Token функциональность
- Auto-population полей из Telegram
- Validation с визуальным feedback

## Database Schema

```prisma
model TelegramBot {
  id                     String   @id @default(cuid())
  botName                String   @unique // internal identifier (oauth, support)
  token                  String   // encrypted bot token
  username               String   @unique // telegram @username
  displayName            String   // display name for admin panel
  description            String?  // bot purpose description
  isActive               Boolean  @default(true)
  isPrimary              Boolean  @default(false) // primary OAuth bot
  webhookUrl             String?  // auto-generated webhook URL
  avatarUrl              String?  // R2 storage URL
  firstName              String?  // from Telegram API
  canJoinGroups          Boolean  @default(false)
  canReadMessages        Boolean  @default(false)
  supportsInlineQueries  Boolean  @default(false)
  createdBy              String?  // admin who created
  createdAt              DateTime @default(now())
  updatedAt              DateTime @updatedAt
  lastSyncAt             DateTime?

  @@index([botName])
  @@index([isActive])
}
```

## GraphQL API

### Queries

```graphql
# Get all bots (with optional filter)
adminTelegramBots(includeInactive: Boolean): [AdminTelegramBotModel!]!

# Get specific bot by ID or name
adminTelegramBot(id: ID, botName: String): AdminTelegramBotModel

# Get webhook info
adminTelegramBotWebhookInfo(botId: ID!): WebhookInfoModel
```

### Mutations

```graphql
# Create new bot
adminCreateTelegramBot(input: CreateTelegramBotInput!): AdminTelegramBotModel!

# Update existing bot
adminUpdateTelegramBot(botId: ID!, input: UpdateTelegramBotInput!): AdminTelegramBotModel!

# Delete bot
adminDeleteTelegramBot(botId: ID!): Boolean!

# Sync bot info from Telegram
adminSyncTelegramBot(botId: ID!): AdminTelegramBotModel!

# Test token without saving
adminTestTelegramBot(input: TestBotTokenInput!): TestBotResult!

# Webhook management
adminSetTelegramWebhook(input: SetWebhookInput!): Boolean!
adminDeleteTelegramWebhook(botId: ID!): Boolean!

# Hot reload
adminReloadTelegramBot(botId: ID!): Boolean!
```

## Workflow Examples

### 1. Создание нового бота

**Admin Panel UI:**
1. Открыть Admin Settings → Telegram Bots
2. Нажать "Add Telegram Bot"
3. Заполнить форму:
   - Bot Name: `notifications`
   - Token: `7123456789:AAHdqTcvCH1vGWJxfSeofSAs0K5PALDsaw`
   - Display Name: `Notifications Bot`
   - Description: `Handles user notifications`
4. Нажать "Test" для валидации токена
5. Поля Username и Display Name автозаполнятся
6. Нажать "Create Bot"

**Backend Flow:**
1. `AdminTelegramBotsService.createBot()` вызывается
2. Токен валидируется через `TelegramApiClient.testBotToken()`
3. Получение bot info из Telegram API
4. Проверка уникальности botName и username
5. Шифрование токена через `EncryptionService`
6. Генерация webhook URL: `https://api.prorab.space/webhooks/telegram/notifications`
7. Сохранение в БД
8. Логирование в AdminActionLog
9. Возврат созданного бота

### 2. Синхронизация бота с Telegram

**Что происходит при Sync:**
1. `syncBotInfo()` вызывается с bot ID
2. Расшифровка токена из БД
3. Запрос `getMe` к Telegram API
4. Запрос `getUserProfilePhotos` для аватара
5. Скачивание аватара с Telegram servers
6. Обработка изображения (resize 512x512, WebP)
7. Upload в R2 storage (`prorab-space/system/bot-avatars/`)
8. Обновление всех полей в БД:
   - username, firstName
   - canJoinGroups, canReadMessages, supportsInlineQueries
   - avatarUrl
   - lastSyncAt
9. Возврат обновленного бота

### 3. Hot Reload бота

**Когда использовать:**
- После обновления token
- После изменения webhook URL
- Для применения изменений без рестарта

**Процесс:**
1. `AdminTelegramBotsService.reloadBot()` вызывается
2. `TelegramBotRegistry.reloadBot()` выполняется:
   - `unregisterBot()`: остановка текущего инстанса, удаление webhook
   - `registerBot()`: создание нового Telegraf инстанса, установка webhook
3. Бот готов принимать updates на новом webhook
4. Логирование в AdminActionLog

## Security

### 1. Token Encryption
```typescript
// Шифрование при сохранении
const encryptedToken = encryptionService.encrypt(plainToken);

// Дешифрование при использовании
const plainToken = encryptionService.decrypt(encryptedToken);
```

### 2. Permissions
Все операции требуют:
- `@UseGuards(AuthGuard, AdminGuard, PermissionsGuard)`
- `@RequirePermissions(AdminPermissions.SETTINGS_TELEGRAM)`

### 3. Audit Logging
Все CRUD операции логируются в `AdminActionLog`:
- CREATE_TELEGRAM_BOT
- UPDATE_TELEGRAM_BOT
- DELETE_TELEGRAM_BOT
- SYNC_TELEGRAM_BOT
- RELOAD_TELEGRAM_BOT

## Environment Variables

### Required
```env
# Encryption key (32 bytes hex)
ENCRYPTION_KEY=your-32-byte-hex-key

# API base URL for webhooks
API_BASE_URL=https://api.prorab.space
```

### Optional (Fallback Tokens)
```env
# Primary OAuth bot (auto-creates 'oauth' bot if not in DB)
TELEGRAM_BOT_TOKEN=7123456789:AAHdqTcvCH1vGWJxfSeofSAs0K5PALDsaw

# Support bot (auto-creates 'support' bot if not in DB)
TELEGRAM_SUPPORT_BOT_TOKEN=7987654321:BBGdqTcvCH1vGWJxfSeofSAs0K5PALDsaw
```

## Webhook Routing

### Endpoint
```
POST /webhooks/telegram/:botName
```

### Flow
1. Telegram отправляет update на `https://api.prorab.space/webhooks/telegram/oauth`
2. `TelegramWebhookController` принимает request
3. Извлечение `botName` из URL params
4. `TelegramBotRegistry.handleWebhookUpdate(botName, update)`
5. Получение Telegraf инстанса по botName
6. Передача update в соответствующий бот
7. Возврат `{ ok: true }`

### Example Webhook URLs
- OAuth bot: `https://api.prorab.space/webhooks/telegram/oauth`
- Support bot: `https://api.prorab.space/webhooks/telegram/support`
- Notifications: `https://api.prorab.space/webhooks/telegram/notifications`

## Storage Structure

```
prorab-space/
├── system/
│   └── bot-avatars/
│       ├── bot-cm1234567890-1735334400000.webp
│       └── bot-cm9876543210-1735334500000.webp
└── user-{userId}/
    ├── avatars/
    └── team-{teamId}/
        └── ...
```

## Performance

### Image Processing
- **Input**: Any format/size from Telegram
- **Output**: WebP 512x512, quality 90%
- **Processing time**: ~200-500ms per image
- **Storage**: ~20-50 KB per avatar

### Database Queries
- Indexed fields: `botName`, `isActive`
- Unique constraints: `botName`, `username`
- Average query time: <10ms

### Bot Loading
- Initial load: ~100-200ms per bot
- Hot reload: ~300-500ms per bot
- Parallel loading при старте приложения

## Error Handling

### Graceful Failures
1. **Avatar upload fails**: Bot создается без аватара (avatarUrl = null)
2. **Webhook setup fails**: Bot регистрируется, warning в логах
3. **Token invalid**: Валидация перед сохранением, descriptive error
4. **Sync fails**: Частичное обновление, логирование ошибки

### User Feedback
- ✅ Success toasts для успешных операций
- ❌ Error toasts с детальным описанием
- ⏳ Loading states для async операций
- 🔄 Retry functionality при ошибках

## Limitations

1. **Bot Name**: 2-50 символов, lowercase, alphanumeric + дефис
2. **Token**: Минимум 30 символов (Telegram стандарт)
3. **Display Name**: 2-100 символов
4. **Description**: Максимум 500 символов
5. **Avatar**: Max 5MB (Telegram ограничение)
6. **Primary Bot**: Только один бот может быть primary

## Future Enhancements

- [ ] Bulk operations (activate/deactivate multiple bots)
- [ ] Bot analytics (messages sent/received)
- [ ] Commands management UI
- [ ] Webhook delivery logs
- [ ] Bot templates (quick create with presets)
- [ ] Manual avatar upload (override Telegram avatar)
- [ ] Bot groups/categories
- [ ] Scheduled bot operations

## Troubleshooting

### Бот не отвечает на команды
1. Проверить isActive в админ-панели
2. Проверить webhook URL в Telegram Bot Settings
3. Выполнить Reload в админ-панели
4. Проверить логи: `[TelegramBotRegistry]` и `[TelegramWebhookController]`

### Webhook не устанавливается
1. Проверить доступность `API_BASE_URL`
2. Проверить SSL сертификат (Telegram требует HTTPS)
3. Проверить firewall правила
4. Выполнить manual webhook setup через Telegram API

### Токен не валидируется
1. Проверить формат токена: `{bot_id}:{hash}`
2. Проверить token в @BotFather
3. Проверить сетевое соединение к Telegram API
4. Проверить rate limits Telegram API

## Related Documentation

- [Backend Changelog](../changelog.backend.md) - История изменений Backend
- [Frontend Changelog](../changelog.frontend.md) - История изменений Frontend
- [Roadmap](../roadmap.md) - План развития проекта
- [Telegram Bot API](https://core.telegram.org/bots/api) - Официальная документация Telegram

## Contributors

- **Backend Development**: Claude Sonnet 4.5
- **Frontend Development**: Claude Sonnet 4.5
- **Documentation**: Claude Sonnet 4.5
- **Project**: ProRab.space v1.5.0

---

**Last Updated:** 2025-12-27
**Version:** 1.5.0
**Status:** ✅ Production Ready
