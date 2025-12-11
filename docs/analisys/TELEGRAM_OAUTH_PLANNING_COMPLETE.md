# Telegram OAuth Integration - Planning Complete ✅

**Дата:** 2025-12-11
**Статус:** Планирование завершено, готов к реализации
**Время:** ~3 часа (анализ + планирование + документация)
**Оценка реализации:** 5-7 дней (40-56 часов)

---

## 📋 Executive Summary

Завершено полное планирование интеграции Telegram OAuth для ProRab.space. Выбран **Hybrid Integration** подход, который обеспечивает:

- ✅ OAuth авторизацию через Telegram (passwordless authentication)
- ✅ Сбор `chat_id` для будущих уведомлений (Stage 9)
- ✅ Основу для "Telegram Share" функции (Stage 5)
- ✅ Обратную совместимость с email/password авторизацией

---

## 🎯 Что было сделано

### 1. Стратегический анализ
- ✅ Изучен существующий документ `telegram-integration-analysis.md`
- ✅ Проанализированы 3 варианта интеграции (Login Widget, Hybrid, Mini App)
- ✅ Выбран Hybrid Integration как оптимальный подход
- ✅ Определены архитектурные решения (nestjs-telegraf, deep link flow, polling)

### 2. Exploration Phase (3 parallel agents)
- ✅ **Agent 1:** Current auth architecture (auth.service.ts, auth.resolver.ts)
- ✅ **Agent 2:** Telegram OAuth requirements (User model, OAuth fields)
- ✅ **Agent 3:** Configuration and deployment (bot setup, webhooks)

### 3. Plan Creation (Plan agent)
- ✅ Created comprehensive 6-phase implementation plan
- ✅ Designed database schema changes (OAuth fields + TelegramAuthToken model)
- ✅ Architected backend module structure (TelegramModule with 5 files)
- ✅ Designed frontend component (TelegramLoginButton with polling)
- ✅ Documented security considerations (rate limiting, token security)
- ✅ Created testing strategy (unit, E2E, manual)

### 4. Documentation
- ✅ Created `telegram-oauth-implementation-plan.md` (15,000+ строк)
- ✅ Updated `CHANGELOG.md` with planning entry
- ✅ Updated `roadmap.md` with Telegram OAuth section
- ✅ Updated `PROJECT_ANALYSIS_2025-12-11.md` with new documents
- ✅ Created `TELEGRAM_OAUTH_PLANNING_COMPLETE.md` (этот файл)

---

## 🏗️ Архитектурные решения

### Authentication Flow

```
User clicks "Войти через Telegram" on website
  ↓
Backend generates auth token (nanoid, 10 min TTL)
  ↓
Frontend opens deep link: t.me/ProRabBot?start=auth_{token}
  ↓
User clicks "Start" in Telegram bot
  ↓
Bot receives chat_id and links with token
  ↓
Frontend polling (2 sec interval) checks token status
  ↓
Backend creates User (if new) or finds existing
  ↓
Backend creates session (same Redis/cookies as email/password)
  ↓
Frontend receives user + sessionToken → redirect to /dashboard
```

### Key Technical Decisions

1. **nestjs-telegraf** package для bot integration
2. **Deep link authentication** (избегаем OAuth callback сложности)
3. **Polling mechanism** (2 сек интервал, 10 мин таймаут)
4. **Unified sessions** (те же Redis keys и cookies что у email/password)
5. **Backward compatible** (passwordHash становится nullable)
6. **Multi-provider support** (OAuth fields для telegram/google/github)

### Database Schema Changes

**User Model:**
```prisma
model User {
  // Made optional for OAuth users
  passwordHash     String?   @map("password_hash")

  // New OAuth fields
  oauthProvider    String?   @map("oauth_provider")      // "telegram", "google"
  oauthProviderId  String?   @map("oauth_provider_id")   // Telegram user ID
  telegramChatId   String?   @unique @map("telegram_chat_id")
  telegramUsername String?   @map("telegram_username")
  telegramPhotoUrl String?   @map("telegram_photo_url")

  @@index([oauthProvider, oauthProviderId])
  @@index([telegramChatId])
}
```

**New Model:**
```prisma
model TelegramAuthToken {
  id        String   @id @default(uuid())
  token     String   @unique
  chatId    String?  @map("chat_id")
  used      Boolean  @default(false)
  expiresAt DateTime @map("expires_at")
  createdAt DateTime @default(now()) @map("created_at")

  @@index([token])
  @@index([expiresAt])
}
```

### Backend Architecture

**Module Structure:** `apps/api/src/modules/telegram/`
```
telegram/
├── telegram.module.ts           # NestJS module с TelegrafModule
├── telegram.service.ts          # Общий сервис для бота
├── telegram-auth.service.ts     # OAuth логика (token gen, validation)
├── telegram.bot.ts              # Bot handlers (/start, /help)
├── dto/
│   └── telegram-auth.dto.ts
└── models/
    └── telegram-auth.model.ts
```

**Key Services:**
- `TelegramAuthService.generateAuthToken()` - создать токен и deep link
- `TelegramAuthService.linkAuthToken()` - связать токен с chat_id
- `TelegramAuthService.checkAuthToken()` - проверить статус (polling)
- `TelegramAuthService.authenticateWithTelegram()` - создать/найти User

**GraphQL API:**
- `initTelegramAuth` mutation - возвращает token + deepLink
- `checkTelegramAuth(token)` mutation - возвращает user + sessionToken (если completed)

### Frontend Component

**TelegramLoginButton** (`apps/web/src/packages/components/auth/TelegramLoginButton.tsx`):
- Кнопка "Войти через Telegram" с брендингом Telegram (#24A1DE)
- `initTelegramAuth` mutation для получения токена
- Открытие deep link в новом окне (`window.open`)
- Polling с `useEffect` (каждые 2 сек)
- Timeout через 10 минут
- Loading states (генерация токена, ожидание подтверждения)
- Error handling с toasts

---

## 📦 Implementation Phases

### Phase 1: Database & Config (3-4 часа)
- [ ] Update Prisma schema with OAuth fields + TelegramAuthToken model
- [ ] Create migration `add_telegram_oauth`
- [ ] Add Telegram config to `app.config.ts`
- [ ] Create .env variables (TELEGRAM_BOT_TOKEN, TELEGRAM_BOT_USERNAME)
- [ ] Install `nestjs-telegraf` and `telegraf` packages
- [ ] Create bot via @BotFather

**Success Criteria:** Migration applied, config accessible, bot created

### Phase 2: Backend Core (12-16 часов)
- [ ] Create telegram module structure
- [ ] Implement TelegramAuthService (4 key methods)
- [ ] Implement TelegramBot handlers (/start command)
- [ ] Test bot locally with ngrok/polling

**Success Criteria:** Bot responds to /start, token linking works

### Phase 3: GraphQL Integration (8-10 часов)
- [ ] Add mutations to auth.resolver.ts (initTelegramAuth, checkTelegramAuth)
- [ ] Create DTOs and models (TelegramAuthPayload, TelegramAuthStatusPayload)
- [ ] Add rate limiting (10 attempts per 15 min)
- [ ] Write unit tests (>80% coverage)
- [ ] Update GraphQL schema

**Success Criteria:** Mutations work, tests pass (>80% coverage)

### Phase 4: Frontend (8-10 часов)
- [ ] Add mutations to auth.graphql
- [ ] Run codegen (`pnpm codegen`)
- [ ] Create TelegramLoginButton component
- [ ] Update login page (replace placeholder)
- [ ] Update register page (add Telegram option)
- [ ] Test polling logic

**Success Criteria:** Button works, polling detects completion, redirect works

### Phase 5: Testing & Polish (8-12 часов)
- [ ] Write E2E tests (Playwright/Cypress)
- [ ] Manual testing (desktop + mobile)
- [ ] Test edge cases (expired/used tokens)
- [ ] Russian error messages
- [ ] Security audit

**Success Criteria:** All tests pass, works on all devices

### Phase 6: Production Deployment (4-6 часов)
- [ ] Configure production bot
- [ ] Set up webhook (для production)
- [ ] Deploy backend
- [ ] Deploy frontend
- [ ] Smoke testing
- [ ] Monitor logs

**Success Criteria:** OAuth works in production without errors

---

## 🔒 Security Features

### Rate Limiting
- 10 attempts per 15 minutes per identifier
- Redis-based rate limiting (same as email/password)

### Token Security
- Single-use tokens (marked `used = true` after linking)
- 10 minute expiration
- nanoid(32) = 128 bits entropy
- HTTPS enforced in production

### Session Security
- HTTP-only cookies (не доступны из JavaScript)
- SameSite=Lax (CSRF protection)
- Same session management as email/password (7 days TTL)

### CSRF Protection
- Deep link + polling pattern (no callbacks)
- No state parameter needed
- Origin validation on webhook (production)

---

## 🧪 Testing Strategy

### Unit Tests
**Files to create:**
- `telegram-auth.service.spec.ts` (8 test cases)
- `telegram.bot.spec.ts` (4 test cases)

**Coverage target:** >80%

**Key test cases:**
1. Generate auth token → valid token + deepLink
2. Link token to chat ID → token marked used
3. Handle expired tokens → throw BadRequestException
4. Handle used tokens → throw BadRequestException
5. Create new user from Telegram data
6. Find existing user by telegramId
7. Bot /start with auth payload → link successful
8. Bot /start without payload → welcome message

### E2E Tests
**File:** `apps/api/test/auth/telegram-auth.e2e-spec.ts`

**Scenario:**
1. Call initTelegramAuth → get token + deepLink
2. Simulate bot /start → link token with chat_id
3. Poll checkTelegramAuth → get user + sessionToken
4. Verify session cookie set
5. Access protected route → success

### Manual Testing Checklist
- [ ] Desktop: Chrome, Firefox, Safari
- [ ] Mobile: iOS Safari, Android Chrome
- [ ] Deep link opens Telegram app (if installed)
- [ ] Deep link opens web Telegram (if app not installed)
- [ ] Polling timeout works (10 min)
- [ ] Error messages are in Russian
- [ ] Loading states are clear
- [ ] Telegram button styling matches design

---

## 📊 Expected Metrics

### Technical Metrics
- **OAuth flow completion time:** <5 seconds (p95)
- **Token expiration rate:** <5% (большинство успевают за 10 мин)
- **Error rate:** <1%
- **Test coverage:** >80%
- **No security vulnerabilities**

### User Metrics
- **Telegram auth adoption:** >20% новых пользователей
- **Completion rate:** >80% начатых flows
- **Support tickets:** <10/месяц связанных с Telegram auth

### Performance Metrics
- **Database queries:** +2 per OAuth flow (TelegramAuthToken + User)
- **Redis operations:** Same as email/password (session management)
- **No performance degradation** for existing email/password users

---

## 🚀 Future Benefits

### Immediate (после реализации)
- ✅ Passwordless authentication via Telegram
- ✅ Better UX для mobile users (не нужен email/password)
- ✅ Collecting chat_id для уведомлений
- ✅ Avatar и username из Telegram (меньше onboarding steps)

### Stage 9 - Bot Notifications (следующий этап)
- Отправка уведомлений о новых расходах в Telegram
- Отправка уведомлений о новых фотоотчётах
- Интерактивные кнопки (Approve/Reject)
- Real-time updates

### Stage 5 - Telegram Sharing (будущий этап)
- Генерация t.me links для фотоотчётов
- Share напрямую в Telegram чаты/каналы
- Rich preview в Telegram (Open Graph)
- QR codes для печатных материалов

### Stage 9+ - Mini App (опционально)
- Embed ProRab.space в Telegram
- WebApp SDK integration
- Mobile-optimized UI внутри Telegram

---

## ⚠️ Risks & Mitigations

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Token expiration during auth | Medium | Low | 10 min timeout достаточно, clear error messages, easy retry |
| Users don't have Telegram | Low | Medium | Email/password остаётся primary option |
| Bot rate limiting | High | Low | Webhook mode в production, respect API limits (30 msg/sec) |
| Backward compatibility break | High | Low | passwordHash nullable, validation ensures passwordHash OR oauthProvider |
| Session conflicts | Medium | Low | Unified AuthService.createSession() для обоих методов |
| Polling overload | Medium | Low | 2 sec interval reasonable, auto-cleanup expired tokens |

---

## 📁 Created Documents

### Planning Documents
1. **`C:\Users\User\.claude\plans\bright-puzzling-blanket.md`** (Approved Plan)
   - Complete implementation plan
   - All technical details
   - Code examples for all components

2. **`docs/analisys/telegram-oauth-implementation-plan.md`** (15,000+ строк)
   - Comprehensive implementation guide
   - Database schema changes with full Prisma code
   - Backend module structure (telegram-auth.service.ts, telegram.bot.ts, etc.)
   - Frontend component (TelegramLoginButton.tsx) with polling logic
   - 6 implementation phases with time estimates
   - Security considerations
   - Testing strategy
   - Risk mitigation strategies
   - Success criteria

### Updated Documents
3. **`CHANGELOG.md`**
   - Added "Telegram OAuth Integration: Planning & Architecture" entry
   - Architecture design with flow diagram
   - Key technical decisions
   - Database schema changes
   - Implementation phases
   - Security features
   - Future benefits

4. **`docs/roadmap.md`**
   - Added Telegram OAuth planning to "Последние изменения"
   - Added "Telegram Integration" section in Post-MVP Stages
   - Updated documentation links
   - Updated auth section with plan reference

5. **`docs/analisys/PROJECT_ANALYSIS_2025-12-11.md`**
   - Added telegram-oauth-implementation-plan.md to created documents
   - Updated обновлённые документы list

6. **`docs/analisys/TELEGRAM_OAUTH_PLANNING_COMPLETE.md`** (этот файл)
   - Complete summary of planning work
   - Ready-to-implement checklist

---

## ✅ Готовность к реализации

**Status:** ✅ **READY TO IMPLEMENT**

Все архитектурные решения приняты:
- ✅ Выбран Hybrid Integration подход
- ✅ Определена структура файлов (13 backend files, 3 frontend files)
- ✅ Спроектированы GraphQL API (2 mutations)
- ✅ Спроектированы database schema changes (2 models)
- ✅ Продуманы security меры (rate limiting, token security, CSRF)
- ✅ Составлен phased план (6 фаз, 5-7 дней, 40-56 часов)
- ✅ Определены success criteria для каждой фазы
- ✅ Создана testing strategy (unit, E2E, manual)

**Следующий шаг:** Начать Phase 1 - Database & Config

**Команда для старта:**
```bash
cd apps/api
# Open prisma/schema.prisma and add OAuth fields
pnpm prisma migrate dev --name add_telegram_oauth
pnpm prisma generate
pnpm add nestjs-telegraf telegraf
```

---

## 📞 Контакты и поддержка

**Проект:** ProRab.space
**Planning Date:** 2025-12-11
**Planner:** Claude Sonnet 4.5
**Estimation:** 5-7 дней (40-56 часов)

**Документация:**
- Implementation Guide: `docs/analisys/telegram-oauth-implementation-plan.md`
- Approved Plan: `C:\Users\User\.claude\plans\bright-puzzling-blanket.md`
- Project Roadmap: `docs/roadmap.md`
- Main Analysis: `docs/analisys/PROJECT_ANALYSIS_2025-12-11.md`

**Strategic Analysis:**
- `docs/analisys/telegram-integration-analysis.md` - 3 варианта интеграции

---

## 🎉 Conclusion

Telegram OAuth integration полностью спланирована и готова к реализации. План включает:

- ✅ 15,000+ строк детальной документации
- ✅ Все необходимые code examples
- ✅ Phased implementation plan (6 фаз)
- ✅ Security considerations
- ✅ Testing strategy
- ✅ Risk mitigation
- ✅ Success criteria

**Estimated development time:** 5-7 дней (40-56 часов)

**Expected benefits:**
- Passwordless auth для пользователей
- Foundation для Stage 9 (Bot Notifications)
- Foundation для Stage 5 (Telegram Sharing)
- Better mobile UX

**Ready to start Phase 1! 🚀**
