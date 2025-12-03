# Changelog (backend)

## 2025-11-21
- Scaffolded NestJS API in `apps/api` with pnpm workspace wiring.
- Configured GraphQL (Apollo driver) + ConfigModule, Prisma module/service, and health query.
- Added Prisma schema for `Project` model and generated Prisma client.
- Implemented Projects resolver/service with create + list operations.
- Updated E2E test to target GraphQL health endpoint; lint fixed.
# Changelog (backend)

## Module: Backend Monorepo Setup

### Step 1: NestJS GraphQL + Prisma Bootstrap

:calendar: `2025-11-21`

**Added**

- ✅ NestJS API scaffolded under `apps/api` with GraphQL (Apollo driver) and ConfigModule.
- ✅ Prisma integration with `PrismaModule`/`PrismaService` and Postgres connection via `.env`.
- ✅ Projects module with GraphQL resolver, DTO, model, and Prisma service for create/list.
- ✅ Health query resolver and e2e test targeting `/graphql`.
- ✅ Prisma schema defining `Project` model and generated Prisma client.
- ✅ Workspace scripts for Prisma commands and dev workflows.

**Changed**

- ✅ `main.ts` bootstrapping enhanced with CORS, validation pipe, graceful shutdown, and startup logging.
- ✅ `app.module.ts` now wires GraphQL auto-schema, ConfigModule env loading, Prisma, and Projects module.

**Fixed**

- ✅ Lint issues in tests and bootstrap (await handling, typed response checks).

**Removed**

- ❌ Default Nest controller/service and sample e2e test hitting `/`.

**Files Modified**

- `apps/api/src/app.module.ts`
- `apps/api/src/main.ts`
- `apps/api/test/app.e2e-spec.ts`
- `apps/api/package.json`
- `package.json`

**Files Created**

- `apps/api/.env`
- `apps/api/prisma/schema.prisma`
- `apps/api/src/app.resolver.ts`
- `apps/api/src/prisma/prisma.module.ts`
- `apps/api/src/prisma/prisma.service.ts`
- `apps/api/src/projects/dto/create-project.input.ts`
- `apps/api/src/projects/models/project.model.ts`
- `apps/api/src/projects/projects.module.ts`
- `apps/api/src/projects/projects.resolver.ts`
- `apps/api/src/projects/projects.service.ts`
- `changelog.backend.md`

---

## Module: Backend Monorepo Setup

### Step 7: GraphQL Type Metadata Fix

:calendar: `2025-11-21`

**Added**

- ✅ Explicit GraphQL field type declarations for optional `description` fields.

**Changed**

- ✅ `Project` model and `CreateProjectInput` now specify `@Field(() => String, { nullable: true })` to avoid undefined type metadata.

**Fixed**

- ✅ Resolved GraphQL schema build error (`Undefined type error` for `description`).

**Removed**

- ❌ N/A.

**Files Modified**

- `apps/api/src/projects/models/project.model.ts`
- `apps/api/src/projects/dto/create-project.input.ts`

**Files Created**

- N/A

---

## Module: Backend Monorepo Setup

### Step 8: Core Module Skeleton & Prisma Move

:calendar: `2025-11-21`

**Added**

- ✅ Core module wiring config/env loading, GraphQL module setup, and Prisma module exposure.
- ✅ Config helpers for app defaults and GraphQL options.

**Changed**

- ✅ AppModule now composes CoreModule + ProjectsModule, simplifying bootstrap.
- ✅ PrismaService relocated under `core/prisma` with clean shutdown hooks.
- ✅ ESLint config adjusted to remove redundant project setting; tsconfig now includes tests.
- ✅ Workspace dev dependency added for `@trivago/prettier-plugin-sort-imports` to satisfy lint tooling.

**Fixed**

- ✅ Lint project-service parsing errors; ensured test files are part of TS project for linting.

**Removed**

- ❌ Legacy `src/prisma` module/service copies.

**Files Modified**

- `apps/api/src/app.module.ts`
- `apps/api/eslint.config.mjs`
- `apps/api/tsconfig.json`
- `package.json`

**Files Created**

- `apps/api/src/core/core.module.ts`
- `apps/api/src/core/config/app.config.ts`
- `apps/api/src/core/config/graphql.config.ts`
- `apps/api/src/core/prisma/prisma.module.ts`
- `apps/api/src/core/prisma/prisma.service.ts`
- `docs/architecture.backend.md`

---

### Step 9: Dependency Refresh & Version Bump

:calendar: `2025-11-21`

**Added**

- ✅ Upgraded Prisma packages to 6.19.0 and Node typings to current major.

**Changed**

- ✅ API package version set to `0.0.2`.

**Fixed**

- ✅ N/A.

**Removed**

- ❌ N/A.

**Files Modified**

- `apps/api/package.json`

**Files Created**

- N/A

---

### Step 10: GraphQL Context Typing & Prisma Path Fix

:calendar: `2025-11-21`

**Added**

- ✅ Typed GraphQL context parameters to avoid implicit any.

**Changed**

- ✅ Updated PrismaService imports to the new core location across main/bootstrap and services.

**Fixed**

- ✅ Resolved TypeScript errors for missing Prisma path and implicit any in GraphQL context.

**Removed**

- ❌ N/A.

**Files Modified**

- `apps/api/src/core/config/graphql.config.ts`
- `apps/api/src/main.ts`
- `apps/api/src/projects/projects.service.ts`

**Files Created**

- N/A

---

### Step 11: Prisma Client Output Alignment

:calendar: `2025-11-22`

**Added**

- ✅ Regenerated Prisma client to `prisma/__generated__` with Prisma 6.19.0.

**Changed**

- ✅ PrismaService now imports PrismaClient from `@prisma/__generated__`.

**Fixed**

- ✅ Resolved TypeScript errors about missing PrismaClient exports and model accessors.

**Removed**

- ❌ N/A.

**Files Modified**

- `apps/api/src/core/prisma/prisma.service.ts`

**Files Created**

- `apps/api/prisma/__generated__/*` (via `pnpm --filter api exec prisma generate`).

---

### Step 6: ValidationPipe Dependencies Added

:calendar: `2025-11-21`

**Added**

- ✅ Installed `class-validator` and `class-transformer` to support global `ValidationPipe`.

**Changed**

- ✅ API runtime now resolves ValidationPipe package requirement.

**Fixed**

- ✅ Runtime error complaining about missing `class-validator` on startup.

**Removed**

- ❌ N/A.

**Files Modified**

- `apps/api/package.json`

**Files Created**

- N/A

---

### Step 5: Prisma Shutdown Hook Fix

:calendar: `2025-11-21`

**Added**

- ✅ Lifecycle hook `onModuleDestroy` to disconnect Prisma safely.

**Changed**

- ✅ Prisma shutdown handling now uses Nest `enableShutdownHooks` without `$on('beforeExit')` type issues.

**Fixed**

- ✅ Resolved TypeScript error for `$on('beforeExit')` in `PrismaService` and ensured clean shutdown.

**Removed**

- ❌ Deprecated `$on('beforeExit')` handler that broke compilation.

**Files Modified**

- `apps/api/src/prisma/prisma.service.ts`
- `apps/api/src/main.ts`

**Files Created**

- N/A

---

### Step 4: Turbo Dev Runs API

:calendar: `2025-11-21`

**Added**

- ✅ `dev` npm script in `apps/api` to participate in the monorepo `turbo run dev`.

**Changed**

- ✅ `pnpm dev` now launches both Next.js (3000) and NestJS API (8080) via Turborepo.

**Fixed**

- ✅ Eliminated missing-script issue where Turbo only started the web app.

**Removed**

- ❌ N/A.

**Files Modified**

- `apps/api/package.json`

**Files Created**

- N/A

---

### Step 3: Turborepo Schema Update

:calendar: `2025-11-21`

**Added**

- ✅ N/A.

**Changed**

- ✅ Updated `turbo.json` to use the new `tasks` key (Turbo 2.6 requirement) for backend workflows.

**Fixed**

- ✅ Dev pipeline `pnpm dev` now runs without Turbo schema errors.

**Removed**

- ❌ N/A.

**Files Modified**

- `turbo.json`

**Files Created**

- N/A

---

### Step 2: Turborepo Orchestration for API Workflows

:calendar: `2025-11-21`

**Added**

- ✅ Turborepo pipeline to coordinate backend dev/build/lint runs across packages.

**Changed**

- ✅ Root scripts now use Turborepo for `dev`, `build`, and `lint` commands.
- ✅ `.gitignore` updated to exclude Turborepo cache artifacts.

**Fixed**

- ✅ N/A.

**Removed**

- ❌ N/A.

**Files Modified**

- `package.json`
- `.gitignore`

**Files Created**

- `turbo.json`

---

### Step 14: Prisma v7 Finalization (adapter, schema, config)

:calendar: `2025-11-22`

**Added**

- ✅ Prisma v7 packages (`@prisma/client`, `prisma`, `@prisma/adapter-pg`) and Postgres typings.
- ✅ `prisma.config.ts` with dotenv loading and centralized datasource/migrations config.

**Changed**

- ✅ Prisma schema uses `provider = "prisma-client"` outputting to `prisma/generated`; datasource URL handled in config.
- ✅ PrismaService uses PrismaPg adapter with shared pg Pool and imports from `@prisma/generated/client`.
- ✅ API version bumped to `0.0.4`; tsconfig paths updated to new generated location.

**Fixed**

- ✅ Removed schema-embedded URL per v7 requirements and cleaned old `prisma/__generated__` artifacts.

**Removed**

- ❌ Old Prisma v6 generated client directory `prisma/__generated__`.

**Files Modified**

- `apps/api/package.json`
- `apps/api/prisma/schema.prisma`
- `apps/api/src/core/prisma/prisma.service.ts`
- `apps/api/tsconfig.json`

**Files Created**

- `prisma.config.ts`
- `apps/api/prisma/generated/*` (new client)

---

### Step 15: Prisma DB Sync & Regeneration

:calendar: `2025-11-22`

**Added**

- ✅ Ran `prisma migrate reset`, `migrate dev --name sync-v7`, `db push`, and regenerated client.

**Changed**

- ✅ Ensured database state matches v7 schema; cleaned old generated artifacts.

**Fixed**

- ✅ Resolved lingering Prisma TS errors by removing legacy outputs and re-emitting client.

**Removed**

- ❌ Stale Prisma generate outputs in `prisma/__generated__`.

**Files Modified**

- `apps/api/prisma/schema.prisma`
- `apps/api/src/core/prisma/prisma.service.ts`
- `apps/api/tsconfig.json`
- `apps/api/tsconfig.build.json`

**Files Created**

- `apps/api/prisma/generated/*`
- `apps/api/prisma/__migrations__/20251122000241_sync_v7/migration.sql`

---

### Step 16: Roadmap Refresh

:calendar: `2025-11-22`

**Added**

- ✅ Roadmap rewritten with clear phases, statuses, and completed ORM/Prisma tasks.

**Changed**

- ✅ Document now reflects completed Prisma v7 setup and pending feature tracks.

**Fixed**

- ✅ Removed unreadable text; clarified deliverables and timeline.

**Removed**

- ❌ N/A.

**Files Modified**

- `docs/roadmap.md`

**Files Created**

- N/A

---

## Module: Authentication System

### Step 20: Custom Auth with Redis Sessions

:calendar: `2025-12-01`

**Added**

- ✅ Полная система аутентификации с Redis сессиями
- ✅ **Redis модуль** (`apps/api/src/core/redis/`) — подключение и управление сессиями
- ✅ **Auth модуль** (`apps/api/src/auth/`) — регистрация, логин, сессии, сброс пароля
- ✅ **Users модуль** (`apps/api/src/users/`) — управление пользователями
- ✅ **Mail модуль** (`apps/api/src/mail/`) — интеграция Brevo для отправки писем
- ✅ **Prisma схема** — модели `User`, `VerificationToken`, `PasswordResetToken`
- ✅ **Guards** — `AuthGuard` для защиты GraphQL resolvers
- ✅ **Decorators** — `@Public()`, `@CurrentUser()`, `@SessionToken()`, `@ClientIp()`, `@UserAgent()`
- ✅ **Rate Limiting** — 5 попыток / 15 минут на login, register, forgot_password
- ✅ **Docker** — добавлен Redis 8 сервис в `docker-compose.yml`

**GraphQL API:**

- `register(input)` — регистрация с нормализацией email и хешированием Argon2
- `login(input)` — вход с созданием сессии в Redis
- `logout` — удаление сессии и cookies
- `verifyEmail(token)` — подтверждение email
- `resendVerificationEmail` — повторная отправка письма
- `forgotPassword(email)` — запрос сброса пароля
- `resetPassword(input)` — установка нового пароля + инвалидация всех сессий
- `changePassword(input)` — смена пароля + инвалидация всех сессий кроме текущей
- `sessions` — список всех сессий пользователя
- `revokeSession(sessionId)` — удаление конкретной сессии
- `revokeAllSessions` — удаление всех сессий кроме текущей
- `me` — текущий пользователь

**Session Configuration:**

| Параметр | Значение |
|----------|----------|
| Access Token (Session) | 7 дней |
| Refresh Token | 30 дней |
| Email Verification Token | 24 часа |
| Password Reset Token | 1 час |
| Rate Limit | 5 попыток / 15 мин |

**Changed**

- ✅ `main.ts` — полная переработка bootstrap:
  - Helmet с настройками безопасности (CSP в prod)
  - Cookie parser с секретом из конфига
  - GraphQL upload middleware (10MB / 10 files)
  - ValidationPipe с whitelist, transform, forbidNonWhitelisted
  - CORS с credentials, exposedHeaders, allowedHeaders
  - Graceful shutdown hooks
  - Подробное логирование при запуске (port, GraphQL path, env, CORS)
- ✅ `app.module.ts` — подключены AuthModule, UsersModule, MailModule, глобальный AuthGuard
- ✅ `core.module.ts` — подключён RedisModule
- ✅ `app.config.ts` — добавлены конфигурации Redis, Auth, Mail

**Files Created**

- `apps/api/src/auth/auth.module.ts`
- `apps/api/src/auth/auth.service.ts`
- `apps/api/src/auth/auth.resolver.ts`
- `apps/api/src/auth/guards/auth.guard.ts`
- `apps/api/src/auth/decorators/public.decorator.ts`
- `apps/api/src/auth/decorators/current-user.decorator.ts`
- `apps/api/src/auth/dto/register.input.ts`
- `apps/api/src/auth/dto/login.input.ts`
- `apps/api/src/auth/dto/reset-password.input.ts`
- `apps/api/src/auth/dto/change-password.input.ts`
- `apps/api/src/auth/models/auth.model.ts`
- `apps/api/src/users/users.module.ts`
- `apps/api/src/users/users.service.ts`
- `apps/api/src/users/users.resolver.ts`
- `apps/api/src/users/models/user.model.ts`
- `apps/api/src/mail/mail.module.ts`
- `apps/api/src/mail/mail.service.ts`
- `apps/api/src/core/redis/redis.module.ts`
- `apps/api/src/core/redis/redis.service.ts`

**Files Modified**

- `apps/api/prisma/schema.prisma`
- `apps/api/src/main.ts`
- `apps/api/src/app.module.ts`
- `apps/api/src/app.resolver.ts`
- `apps/api/src/core/core.module.ts`
- `apps/api/src/core/config/app.config.ts`
- `docker-compose.yml`

**Dependencies Added**

- `argon2` — хеширование паролей
- `redis` — клиент Redis
- `nanoid` — генерация токенов
- `@getbrevo/brevo` — отправка email
- `cookie-parser` — работа с cookies
- `dotenv` — загрузка переменных окружения
- `helmet` — HTTP security headers
- `graphql-upload-minimal` — загрузка файлов через GraphQL
- `@types/express` — типы Express (dev)

**Migrations**

- ✅ `20251201220249_add_auth_models` — создание таблиц users, verification_tokens, password_reset_tokens
- ✅ `prisma db push` — синхронизация схемы с БД
- ✅ `prisma generate` — генерация Prisma Client

**Fixed**

- ✅ `redis.service.ts` — исправлены типы для `get()` и `sIsMember()` (Redis v5 typing issues)
- ✅ `main.ts` — исправлен import cookie-parser (namespace → default import)

---

### Step: Database Connection Fix

:calendar: `2025-12-02`

**Added**

- ✅ N/A.

**Changed**

- ✅ DATABASE_URL in `apps/api/.env` now uses hardcoded connection string instead of variable interpolation
- ✅ Updated POSTGRES_PORT from 5432 to 5433 to match actual database port

**Fixed**

- ✅ Fixed PostgreSQL connection error "Cannot read properties of undefined (reading 'searchParams')"
- ✅ Resolved issue where `pg` library received undefined connection string due to unresolved environment variable interpolation

**Removed**

- ❌ Removed `${VARIABLE}` syntax from DATABASE_URL (ConfigModule doesn't support bash-style interpolation)

**Files Modified**

- `apps/api/.env`

**Files Created**

- N/A

---

## Module: Documentation

### Step: Authentication System Analysis Report

:calendar: `2025-12-02`

**Added**

- ✅ Comprehensive authentication system analysis report in `docs/reports/auth.md`
- ✅ Documentation includes:
  - Architecture overview (NestJS + GraphQL + Redis + PostgreSQL)
  - Key files and their purposes
  - Step-by-step authentication flows (register, login, logout, refresh, etc.)
  - Security mechanisms (Argon2id, tokens, rate limiting, cookies, email normalization)
  - Additional flows (email verification, password reset, password change)
  - Configuration and environment variables
  - TTL settings for tokens
  - Database schema (Prisma models)
  - Middleware and global settings
  - Decorators usage
  - Graceful degradation (Redis)
  - Security checklist (11 points)
  - Dependencies list
  - Data flow diagrams

**Changed**

- ✅ N/A

**Fixed**

- ✅ N/A

**Removed**

- ❌ N/A

**Files Created**

- `docs/reports/auth.md`

**Files Modified**

- N/A

---

## Module: Documentation

### Step: Admin Panel Planning

:calendar: `2025-12-02`

**Added**

- ✅ Создан детальный план разработки админ-панели (`docs/admin-panel-plan.md`)
- ✅ Описание всех страниц админки (11 основных разделов):
  - Дашборд с KPI и метриками
  - Управление пользователями (список, детальная страница, блокировка)
  - Управление бригадами (список, детальная страница, изменение тарифа)
  - Управление проектами (список, детальная страница)
  - Управление подписками и платежами (история, продление, возвраты)
  - Аналитика и метрики (DAU/MAU, MRR, Retention, Churn, LTV, CAC)
  - Поддержка пользователей (система тикетов)
  - Управление контентом (публичные отчеты, категории расходов)
  - Настройки системы (тарифы, интеграции, email-шаблоны, безопасность)
  - Логи и мониторинг (логи системы, действия администраторов, статус сервисов)
  - Управление администраторами (роли и права доступа)
- ✅ Пошаговый план реализации на 15 дней:
  - Этап 1: Фундамент админки (Дни 1-3)
  - Этап 2: Основные страницы (Дни 4-8)
  - Этап 3: Дополнительные функции (Дни 9-12)
  - Этап 4: Управление администраторами (День 13)
  - Этап 5: Полировка и тестирование (Дни 14-15)
- ✅ Описание GraphQL API для админки (запросы и мутации)
- ✅ Приоритеты реализации (критичные, важные, желательные)
- ✅ Технические детали (безопасность, производительность, UX)

**Changed**

- ✅ N/A

**Fixed**

- ✅ N/A

**Removed**

- ❌ N/A

**Files Created**

- `docs/admin-panel-plan.md`

**Files Modified**

- `docs/roadmap.md` — добавлен Этап 10: Админ-панель

---

## 2025-11-23
- Нет изменений в backend-коде в этой итерации; обновлены только документация и фронтенд-лендинг.

---

## Module: Documentation

### Step: Implementation Plan Analysis

:calendar: `2025-12-02`

**Added**

- ✅ Создан детальный план реализации MVP (`docs/implementation-plan.md`)
- ✅ Анализ всех страниц приложения с указанием:
  - Путей (routes)
  - Данных для вывода
  - GraphQL запросов и мутаций
  - Особенностей реализации
- ✅ Пошаговый план реализации на 18 дней:
  - Этап 1: Фундамент и БД (Дни 1-3)
  - Этап 2: Основные страницы (Дни 4-8)
  - Этап 3: Killer Features (Дни 9-12)
  - Этап 4: Онбординг и UX (Дни 13-15)
  - Этап 5: Полировка и оптимизация (Дни 16-18)
- ✅ Приоритеты реализации (критичные, важные, желательные)
- ✅ Технические детали (хранение файлов, безопасность, производительность)

**Changed**

- ✅ N/A

**Fixed**

- ✅ N/A

**Removed**

- ❌ N/A

**Files Created**

- `docs/implementation-plan.md`

**Files Modified**

- `docs/roadmap.md` — добавлена отметка о завершении анализа требований

---

---

## Module: Frontend UX Improvements

### Step: Password Visibility Toggle & Error Handling

:calendar: `2025-12-02`

**Added**

- ✅ Created `PasswordInput` component with show/hide password toggle
  - Eye/EyeOff icons from lucide-react
  - Toggle button positioned on the right side of input
  - Smooth transition between password and text input types
- ✅ Improved error handling in authentication forms:
  - Added try-catch blocks for better error catching
  - Enhanced error message extraction from GraphQL errors
  - Better handling of network errors and GraphQL errors
- ✅ Applied password visibility toggle to all password fields:
  - Login form (`/auth/login`)
  - Register form (`/auth/register`) - both password and confirmPassword fields
  - Reset password form (`/auth/reset-password`) - both password fields

**Changed**

- ✅ Replaced `Input` with `type="password"` to `PasswordInput` component in all auth forms
- ✅ Enhanced error handling in `onSubmit` handlers:
  - Login form now catches and displays GraphQL errors properly
  - Register form improved error handling
  - Reset password form improved error handling
- ✅ Updated component exports to include `PasswordInput`

**Fixed**

- ✅ Fixed error display issue where GraphQL errors weren't shown to users
- ✅ Improved error message extraction to handle different error formats
- ✅ Fixed password input UX by adding visibility toggle
- ✅ Added fallback error handling for unexpected responses (no errors but no data)
- ✅ All auth forms now show toast notifications for all error scenarios:
  - GraphQL errors (e.g., "Неверный email или пароль", "Слишком много попыток")
  - Network errors
  - Unexpected responses (no errors but no expected data)
- ✅ Added `onError` callback to `useMutation` hooks for better error catching
- ✅ Improved error message extraction to handle all error formats:
  - `response.errors[0].message` (GraphQL errors)
  - `error.message` (general errors)
  - `error.graphQLErrors[0].message` (GraphQL errors in catch)
  - `error.networkError.message` (network errors)
- ✅ Fixed error display issue where actual error messages weren't shown to users

**Removed**

- ❌ N/A

**Files Modified**

- `apps/web/src/app/(root)/auth/login/page.tsx`
- `apps/web/src/app/(root)/auth/register/page.tsx`
- `apps/web/src/app/(root)/auth/reset-password/page.tsx`

**Files Created**

- `apps/web/src/packages/components/ui/password-input.tsx`

**Files Modified (Exports)**

- `apps/web/src/packages/components/ui/index.ts`

---

## Module: Architecture Reorganization

### Step: Project Structure Refactoring

:calendar: `2025-12-02`

**Added**

- ✅ Created `src/shared/` directory structure with subdirectories:
  - `shared/decorators/` — reusable decorators (`@CurrentUser`, `@Public`, `@UserAgent`, `@ClientIp`, `@SessionToken`, `@RefreshToken`)
  - `shared/guards/` — shared guards (`AuthGuard`)
  - `shared/pipes/` — ready for future validation pipes
  - `shared/utils/` — ready for future utilities
- ✅ Created `CoreService` base class with typed access to:
  - `PrismaService` (via `this.prisma`)
  - `RedisService` (via `this.redis`)
  - `ConfigService` (via `this.config`)
  - Redis helper methods (strings, JSON, sets, rate limiting)
- ✅ Created `ARCHITECTURE.md` documentation file with:
  - Current project structure
  - Target structure according to template
  - Migration plan
  - Usage examples for `CoreService`

**Changed**

- ✅ Moved business modules to `src/modules/`:
  - `auth/` → `modules/auth/`
  - `users/` → `modules/users/`
  - `projects/` → `modules/projects/`
- ✅ Moved `MailModule` to `src/core/mail/` as infrastructure module
- ✅ Moved reusable decorators from `modules/auth/decorators/` to `shared/decorators/`
- ✅ Moved `AuthGuard` from `modules/auth/guards/` to `shared/guards/`
- ✅ Updated all imports to use `shared/` decorators and guards:
  - `app.module.ts` — uses `shared/guards/auth.guard`
  - `app.resolver.ts` — uses `shared/decorators/public.decorator`
  - `modules/auth/auth.resolver.ts` — uses `shared/` decorators and guards
  - `modules/users/users.resolver.ts` — uses `shared/decorators/current-user.decorator`
- ✅ Updated module imports in `app.module.ts`:
  - `AuthModule` → `modules/auth/auth.module`
  - `UsersModule` → `modules/users/users.module`
  - `ProjectsModule` → `modules/projects/projects.module`
  - `MailModule` → `core/mail/mail.module`

**Fixed**

- ✅ Fixed dependency injection issues:
  - `UsersModule` now imports `PrismaModule` for `PrismaService` access
  - `AuthGuard` correctly imports `AuthService` from `modules/auth/`
- ✅ Fixed import paths after module reorganization

**Removed**

- ❌ N/A (duplicate decorators/guards in `modules/auth/` remain but are unused)

**Files Modified**

- `apps/api/src/app.module.ts`
- `apps/api/src/app.resolver.ts`
- `apps/api/src/modules/auth/auth.module.ts`
- `apps/api/src/modules/auth/auth.resolver.ts`
- `apps/api/src/modules/users/users.module.ts`
- `apps/api/src/modules/users/users.resolver.ts`
- `apps/api/src/modules/projects/projects.module.ts`

**Files Created**

- `apps/api/src/shared/decorators/current-user.decorator.ts`
- `apps/api/src/shared/decorators/public.decorator.ts`
- `apps/api/src/shared/decorators/index.ts`
- `apps/api/src/shared/guards/auth.guard.ts`
- `apps/api/src/shared/guards/index.ts`
- `apps/api/src/shared/pipes/index.ts`
- `apps/api/src/shared/utils/index.ts`
- `apps/api/src/core/core.service.ts`
- `apps/api/ARCHITECTURE.md`

**Architecture Improvements**

- ✅ Project structure now follows template from `docs/templates/architecture.backend.md`
- ✅ Clear separation of concerns:
  - `core/` — infrastructure modules (Prisma, Redis, Mail, Config)
  - `modules/` — business logic modules (Auth, Users, Projects)
  - `shared/` — reusable cross-cutting concerns (decorators, guards, pipes, utils)
- ✅ `CoreService` provides base class for services to avoid repetitive dependency injection
- ✅ All modules use centralized shared decorators and guards

---