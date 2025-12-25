# Backend Changelog

Все изменения в backend (API) приложения документируются здесь.

Формат основан на [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
и этот проект следует [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.4.4] - 2025-12-25 - Admin Panel UX Improvements 🚧

### 🚧 IN PROGRESS - Admin Panel Navigation & Trial Period

**Admin Panel UX Improvements** - Backend changes for trial period and primary payment provider

#### Progress: 100% (Backend portion complete) ✅

**✅ Primary Payment Provider Setting (COMPLETE)**
- ✅ Added `payment.primary_provider` setting in System Settings (PAYMENT category)
- ✅ Default value: "yookassa"
- ✅ Added to default settings in `system-settings.service.ts`
- 📊 **Changes:** +9 LOC in `system-settings.service.ts`

**✅ Trial Period - Database Schema (COMPLETE)**
- ✅ Added `trialDays` field to Plan model (nullable Int)
- ✅ Created migration `20251225_add_trial_days_and_primary_provider`
- ✅ Applied migration successfully
- ✅ Generated Prisma client with new schema
- 📊 **Changes:** +3 LOC in `schema.prisma`, +1 migration file

**✅ Trial Period - GraphQL Schema (COMPLETE)**
- ✅ Added `trialDays` field to `AdminPlanModel`
- ✅ Added `trialDays` field to `AdminCreatePlanInput`
- ✅ Added `trialDays` field to `AdminUpdatePlanInput`
- ✅ Regenerated GraphQL schema
- 📊 **Changes:** +9 LOC in `admin-plan.model.ts`

**✅ Trial Period - Backend Logic (COMPLETE)**
- ✅ Added `planId` field to `CreateSubscriptionInput` (optional, nullable)
- ✅ Modified `createSubscription` to load Plan from database when `planId` provided
- ✅ Implemented dynamic trial period calculation based on `plan.trialDays`:
  - If `trialDays > 0`: Set trial period and status to TRIALING
  - If `trialDays === 0` or `null`: No trial, status set to ACTIVE
  - Fallback to `TRIAL_DURATION_DAYS` constant if plan not found
- ✅ Added backward compatibility: keep old `plan` enum field
- ✅ Include `planRef` in subscription response
- 📊 **Changes:** +28 LOC in `subscriptions.service.ts`, +3 LOC in `create-subscription.input.ts`

### Files Modified

- `apps/api/src/modules/admin/services/system-settings.service.ts` (+9 LOC)
- `apps/api/src/modules/admin/models/admin-plan.model.ts` (+9 LOC)
- `apps/api/prisma/schema.prisma` (+3 LOC)
- `apps/api/src/modules/subscriptions/subscriptions.service.ts` (+28 LOC)
- `apps/api/src/modules/subscriptions/dto/create-subscription.input.ts` (+3 LOC)

### Files Created

- `apps/api/prisma/migrations/20251225_add_trial_days_and_primary_provider/migration.sql`

---

## [1.4.4-old] - 2025-12-25 - Email Change with 2FA Verification ✅

### Added

- **Email Change Functionality with 2FA Protection:**
  - ✅ Создан `ChangeEmailInput` DTO с полями `newEmail` и опциональным `twoFactorCode`
  - ✅ Создан `ChangeEmailResult` model с полями `success`, `pendingVerification`, `message`
  - ✅ Создан `VerifyEmailChangeInput` DTO для подтверждения по токену
  - ✅ Добавлен метод `initiateEmailChange()` в `AuthService`:
    - Проверка статуса 2FA пользователя
    - Верификация 2FA кода, если 2FA включена
    - Валидация нового email (формат, уникальность, не Telegram placeholder)
    - Использование существующей логики из `UsersService.requestEmailChange()`
  - ✅ Добавлен метод `verifyEmailChange()` в `AuthService`:
    - Подтверждение изменения email по токену из письма
    - Использование существующей логики из `UsersService.confirmEmailChange()`
  - ✅ Добавлены GraphQL мутации:
    - `initiateEmailChange` - инициирование изменения email (требует 2FA, если включена)
    - `verifyEmailChange` - подтверждение изменения email по токену (публичная)
  - 📊 **Backend Changes:** +150 LOC в `auth.service.ts`, +50 LOC в `auth.resolver.ts`, +3 новых файла (DTOs и Models)

### Security

- ✅ Обязательная 2FA верификация для пользователей с включенной 2FA
- ✅ Валидация нового email (формат, уникальность)
- ✅ Защита от изменения на Telegram placeholder email
- ✅ Rate limiting (наследуется от `UsersService.requestEmailChange()`)
- ✅ Токен подтверждения с истечением срока действия (24 часа)

### Files Modified

- `apps/api/src/modules/auth/auth.service.ts` (+150 LOC)
- `apps/api/src/modules/auth/auth.resolver.ts` (+50 LOC)

### Files Created

- `apps/api/src/modules/auth/dto/change-email.input.ts`
- `apps/api/src/modules/auth/dto/verify-email-change.input.ts`
- `apps/api/src/modules/auth/models/change-email-result.model.ts`

---

## [1.1.0] - 2025-12-25 - Email Change & Bug Fixes ✅

### Added

- **Email Change Functionality:**
  - ✅ Добавлена мутация `requestEmailChange` для запроса изменения email
    - Требует 2FA код, если двухфакторная аутентификация включена
    - Валидация нового email и проверка уникальности
    - Rate limiting (максимум 3 запроса в час)
  - ✅ Добавлена мутация `confirmEmailChange` для подтверждения изменения
    - Подтверждение через токен из email письма
    - Автоматическая замена старого email на новый
    - Автоматическая верификация нового email
  - ✅ Добавлен метод отправки письма подтверждения изменения email
  - ✅ Созданы DTO: `RequestChangeEmailInput`, `ConfirmEmailChangeInput`
  - 📊 **Changes:** +200 LOC в `users.service.ts`, +50 LOC в `mail.service.ts`, +2 DTO файла

### Fixed

- **Database Schema Issues:**
  - ✅ Добавлены недостающие колонки в таблицу `telegram_auth_tokens`:
    - `telegram_first_name`, `telegram_last_name`, `telegram_username`, `telegram_photo_url`
  - ✅ Добавлены недостающие колонки в таблицу `team_members`:
    - `position`, `custom_role_id`, `salary_type`, `salary_amount`
  - ✅ Создан enum `TeamRole` и обновлен тип колонки `role`
  - ✅ Созданы миграции: `20251225153636_add_telegram_auth_token_user_fields`, `20251225154451_add_team_member_fields`
  - 📊 **Changes:** +2 migration files

- **GraphQL Upload Issues:**
  - ✅ Создан кастомный `GraphQLValidationPipe` для обработки `GraphQLUpload`
  - ✅ Обновлен глобальный ValidationPipe для пропуска Promise типов
  - ✅ Исправлена ошибка "Promise resolver undefined is not a function"
  - 📊 **Changes:** +30 LOC в `graphql-validation.pipe.ts`, обновлен `main.ts`

- **SystemSettingsService Access:**
  - ✅ Исправлен доступ к `SystemSettingsService` в `main.ts` (использование класса вместо строки)
  - ✅ Добавлен прямой импорт `SystemSettingsService` в `main.ts`

### Files Modified

- `apps/api/src/modules/users/users.service.ts` (+200 LOC)
- `apps/api/src/core/mail/mail.service.ts` (+50 LOC)
- `apps/api/src/shared/pipes/graphql-validation.pipe.ts` (+30 LOC)
- `apps/api/src/main.ts` (исправления)

### Files Created

- `apps/api/src/modules/users/dto/request-change-email.input.ts`
- `apps/api/src/modules/users/dto/confirm-email-change.input.ts`
- `apps/api/src/shared/pipes/graphql-validation.pipe.ts`
- `apps/api/prisma/migrations/20251225153636_add_telegram_auth_token_user_fields/migration.sql`
- `apps/api/prisma/migrations/20251225154451_add_team_member_fields/migration.sql`

---

## [1.4.3] - 2025-12-25 - System Settings Expansion ✅

### Added

- **System Settings Expansion:**
  - ✅ PHASE 1: Backend - Database Schema
    - Updated Prisma schema with 3 new enum values (SMS, SOCIAL, ANALYTICS)
    - Created migration `20251225_add_sms_social_analytics_categories`
    - Updated TypeScript enum `SettingCategory`
  - ✅ PHASE 2: Backend - Default Settings & Env Sync
    - Added 11 default settings for new categories in `system-settings.service.ts`
    - Created `syncEnvToDatabase()` method with 24 environment variable mappings
    - Added startup initialization in `main.ts` to sync .env → DB on app start
  - 📊 **Backend Changes:** +243 LOC в `system-settings.service.ts`, +9 LOC в `main.ts`, +1 migration

### Files Modified

- `apps/api/prisma/schema.prisma` (+3 enum values)
- `apps/api/src/modules/admin/services/system-settings.service.ts` (+252 LOC)
- `apps/api/src/main.ts` (+12 LOC)

### Files Created

- `apps/api/prisma/migrations/20251225_add_sms_social_analytics_categories/migration.sql`

---

## [1.4.0] - 2025-12-24 - Stage 16: Advanced Team & Role Management ✅

### Added

- **Day 8: Team Analytics Dashboard:**
  - ✅ Backend (3 files, ~520 LOC):
    - `admin-team-analytics.model.ts` - 10 GraphQL ObjectTypes
    - `admin-team-analytics.service.ts` - 6 методов аналитики
    - `admin-team-analytics.resolver.ts` - 6 GraphQL queries с RequirePermissions guards

- **Day 9: Role & Permission Builder:**
  - ✅ Prisma Schema Updates (~65 LOC):
    - `CustomRole` model - Пользовательские роли с иерархией
    - `RoleAssignmentHistory` model - История назначения ролей
  - ✅ Backend (4 files, ~830 LOC):
    - `team-permissions.ts` - 62 team-level permissions в 9 категориях
    - `admin-role-builder.model.ts` - 10 GraphQL ObjectTypes и 5 InputTypes
    - `admin-role-builder.service.ts` - 11 методов (CRUD ролей, назначение, иерархия)
    - `admin-role-builder.resolver.ts` - 11 GraphQL queries/mutations

- **Day 10: Team Member Management:**
  - ✅ Backend (3 files, ~840 LOC):
    - `admin-team-members.model.ts` - 8 GraphQL ObjectTypes
    - `admin-team-members.service.ts` - 10 методов управления участниками
    - `admin-team-members.resolver.ts` - 10 GraphQL operations

- **Day 11: Team Communication Tools:**
  - ✅ Backend (3 files, ~620 LOC):
    - `admin-communications.model.ts` - 5 GraphQL ObjectTypes
    - `admin-communications.service.ts` - 7 методов управления объявлениями
    - `admin-communications.resolver.ts` - 7 GraphQL operations

- **Day 12: Advanced Team Features:**
  - ✅ Backend (3 files, ~1,005 LOC):
    - `admin-team-operations.model.ts` - 7 GraphQL ObjectTypes
    - `admin-team-operations.service.ts` - 9 методов операций с командами
    - `admin-team-operations.resolver.ts` - 9 GraphQL operations

- **Day 13: Team Audit & Compliance:**
  - ✅ Backend (3 files, ~880 LOC):
    - `admin-audit.model.ts` - 4 GraphQL ObjectTypes
    - `admin-audit.service.ts` - 6 методов аудита
    - `admin-audit.resolver.ts` - 6 GraphQL queries

---

## [1.0.2] - 2025-12-19 - 2FA Login & Settings UX Improvements

### Added

- **Two-Factor Authentication (2FA) Login Flow:**
  - ✅ Complete 2FA verification during login when enabled
  - ✅ Backend: `verifyTwoFactorLogin` mutation with temporary token flow
  - ✅ Secure 5-minute expiry for 2FA pending tokens in Redis

### Changed

- `apps/api/src/modules/auth/auth.service.ts` - Added 2FA check during login
- `apps/api/src/modules/auth/auth.resolver.ts` - Added verifyTwoFactorLogin mutation
- `apps/api/src/modules/auth/models/auth.model.ts` - Added requiresTwoFactor and twoFactorToken fields

---

## [1.0.1] - 2025-12-19 - Bugfixes & Improvements

### Fixed

- **Admin Permissions:**
  - ✅ Added missing `payment_providers:view`, `payment_providers:manage`, `plans:view`, `plans:manage` to ADMIN and SUPER_ADMIN roles
  - ✅ Created `fix-permissions.ts` script for database update

- **Build Fixes:**
  - ✅ Fixed UpdatePaymentProviderInput type errors (added null values for optional fields)
  - ✅ Fixed AdminUserFilters missing role property
  - ✅ Regenerated GraphQL types

---

## [1.0.0] - 2025-12-19 🎉 MVP RELEASE

### Added

- **Stage 15: Subscription Plans & Payment Providers Management - 100% COMPLETE:**
  - ✅ **Phase 1: Database Schema:**
    - 4 New Models: Plan, PlanPrice, PlanFeature, PaymentProvider
    - Updated Models: Subscription (+planId, +currency), Payment (+providerType, +providerPaymentId)
    - Seed Data: 3 plans, 9 prices (RUB/USD/EUR), 21 features, 2 providers
  - ✅ **Phase 2: Multi-Provider Architecture:**
    - IPaymentProvider Interface (250+ LOC): Unified API for all payment gateways
    - PaymentProviderFactory (150+ LOC): Factory pattern with caching
    - YookassaProvider (280+ LOC): Wrapper for Yookassa
    - StripeProvider (340+ LOC): Full Stripe integration
  - ✅ **Phase 3: Backend Services & GraphQL:**
    - AdminPlansService (600+ LOC): Full CRUD for plans with prices and features
    - AdminPaymentProvidersService (380+ LOC): Provider management
    - GraphQL resolvers and mutations

---

## [0.5.0] - 2025-01-XX

### Changed

- **Multiple Teams Support:**
  - ✅ Подтверждена поддержка множественных команд для одного пользователя
  - ✅ Пользователь может быть владельцем нескольких команд
  - ✅ Пользователь может быть участником нескольких команд
  - ✅ При приглашении создается роль "member" в новой команде
  - ✅ Существующие членства не затрагиваются

### Security

- **Invite Code Validation:**
  - ✅ Проверка дублей через unique constraint `teamId_userId`
  - ✅ Валидация срока действия кода
  - ✅ Проверка использования кода (одноразовый)

---

## [0.3.0] - Previous Version

### Added

- Personnel Analytics
- Salary History
- Work Logs
- CSV Export
