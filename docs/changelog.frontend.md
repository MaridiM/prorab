# Frontend Changelog

Все изменения в frontend (Web) приложения документируются здесь.

Формат основан на [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
и этот проект следует [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.4.4] - 2025-12-25 - Admin Panel UX Improvements 🚧

### 🚧 IN PROGRESS - Admin Panel Navigation & Trial Period

**Admin Panel UX Improvements** - Frontend changes for sidebar cleanup and trial period UI

#### Progress: 50% (Admin UI complete, User UI pending)

**✅ Sidebar Navigation Cleanup (COMPLETE)**
- ✅ Removed "Admin Roles" from admin sidebar (now in System Settings → Roles tab)
- ✅ Removed "Audit Logs" from admin sidebar (now in System Settings → Logs tab)
- 📊 **Changes:** -12 LOC in `admin-sidebar.tsx`
- 🎯 **Benefit:** Cleaner navigation, no duplication

**✅ Trial Period - Admin UI (COMPLETE)**
- ✅ Added `trialDays` state variable in SubscriptionPlansPanel
- ✅ Added Trial Period input field in edit mode:
  - Input field with number validation
  - Placeholder "Нет пробного периода"
  - Help text explaining the feature
- ✅ Added Trial Period display in view mode:
  - Formatted display with Russian pluralization (день/дня/дней)
  - Shows "Нет" if no trial period configured
- ✅ Integrated trialDays into updatePlan mutation
- ✅ Added trialDays to form reset on cancel
- 📊 **Changes:** +35 LOC in `subscription-plans-panel.tsx`
- 🎯 **Benefit:** Admin can now configure trial period for each subscription plan

**⏳ Trial Period - User UI (PENDING)**
- ⏳ Create plan selection UI during onboarding
- ⏳ Add trial period display in user dashboard
- ⏳ Add trial period notifications

### Files Modified

- `apps/web/src/packages/components/admin/admin-sidebar.tsx` (-12 LOC)
- `apps/web/src/packages/components/admin/settings/subscription-plans/subscription-plans-panel.tsx` (+35 LOC)

### Files Created

- None (all changes to existing files)

---

## [1.4.4-old] - 2025-12-25 - Email Change with 2FA Verification ✅

### Added

- **Email Change Functionality with 2FA Protection:**
  - ✅ Созданы GraphQL мутации `InitiateEmailChange` и `VerifyEmailChange`
  - ✅ Добавлена секция "Email адрес" в раздел "Безопасность" на странице настроек:
    - Форма с полем нового email
    - Поле для 2FA кода (отображается только если 2FA включена)
    - Валидация email через Zod schema
    - Обработка ошибок и успешных операций
  - ✅ Добавлен диалог для ввода 2FA кода:
    - Автоматическое открытие, если 2FA включена и код не предоставлен
    - Автоматическая отправка при вводе 6-значного кода
    - Обработка ошибок верификации
  - ✅ Добавлена проверка на Telegram placeholder email:
    - Секция изменения email скрыта для пользователей с placeholder email
    - Предотвращение изменения на другой placeholder email
  - ✅ Интеграция с существующей системой 2FA:
    - Проверка статуса 2FA через `TwoFactorStatusDocument`
    - Условное отображение поля 2FA кода
    - Условное открытие диалога 2FA верификации
  - 📊 **Frontend Changes:** +250 LOC в `settings/page.tsx`, +2 GraphQL мутации

### User Experience

- ✅ Понятные сообщения об ошибках
- ✅ Toast уведомления о статусе операций
- ✅ Автоматическое закрытие формы после успешной отправки
- ✅ Автоматическое обновление данных пользователя после подтверждения
- ✅ Скрытие секции для Telegram users с placeholder email

### Files Modified

- `apps/web/src/app/(root)/(protected)/settings/page.tsx` (+250 LOC)
- `apps/web/src/packages/api/graphql/auth.graphql` (+10 LOC)

---

## [1.1.0] - 2025-12-25 - Email Change & Bug Fixes ✅

### Fixed

- **UI/UX Issues:**
  - ✅ Исправлена структура HTML в `DeleteAccountDialog` (вложенные `<p>` и `<div>` в `<p>`)
    - Заменены вложенные `<p>` на отдельные `AlertDialogDescription` элементы
    - Исправлена ошибка гидратации React
  - ✅ Исправлен отсутствующий импорт `CreditCard` в Admin Plans page
  - 📊 **Changes:** обновлены 2 файла

### Improved

- **App Version Display:**
  - ✅ Обновлен `apps/web/src/packages/constants/app.ts` для использования `NEXT_PUBLIC_APP_VERSION`
  - ✅ Версия автоматически подтягивается из `package.json` через `next.config.ts`
  - ✅ Отображается в Settings > About без необходимости ручного обновления
  - 📊 **Changes:** обновлен `app.ts`, версия теперь динамическая
109: 
110: - **Calendar Component Design:**
111:   - ✅ Обновлен дизайн компонента `Calendar` для соответствия dark/clean эстетике
112:   - ✅ Унифицированы стили селекторов Месяца и Года (outline style, background-background)
113:   - ✅ Улучшена читаемость и визуальная согласованность хедера календаря
114:   - 📊 **Changes:** обновлен `calendar.tsx` в `packages/components/ui`

### Files Modified

- `apps/web/src/packages/components/settings/DeleteAccountDialog.tsx`
- `apps/web/src/app/(root)/(protected)/admin/plans/page.tsx`
- `apps/web/src/packages/constants/app.ts`

---

## [1.4.3] - 2025-12-25 - System Settings Expansion ✅

### Added

- **System Settings Expansion:**
  - ✅ PHASE 3: Frontend - Extract Admin Components
    - Created Subscription Plans Panel (1,272 LOC)
    - Created Admin Roles Panel (322 LOC)
    - Moved Role Dialogs (assign-role-dialog.tsx, edit-permissions-dialog.tsx)
    - Created Audit Logs Panel (245 LOC)
    - Created Barrel Exports (3 index.ts files)
  - ✅ PHASE 4: Frontend - Integration Settings Update
    - Added 3 new integration categories with icons (SMS→Smartphone, Social→Users, Analytics→BarChart)
    - Updated TabsList grid from 7 to 10 columns
  - ✅ PHASE 5: Frontend - System Settings Tabs Update
    - Added 3 new main tabs (Plans, Roles, Logs)
    - Imported and integrated new panels
    - Updated URL routing logic to handle new tabs
    - Updated TabsList grid from 2 to 5 columns (max-w-4xl)
  - ✅ PHASE 6: Frontend - Navigation & Redirects
    - Created redirect for /admin/plans → /admin/settings?tab=plans
    - Created redirect for /admin/roles → /admin/settings?tab=roles
    - Created redirect for /admin/logs → /admin/settings?tab=logs
  - ✅ PHASE 7: GraphQL Type Regeneration
    - Regenerated frontend GraphQL types with new SettingCategory enum values
  - 📊 **Frontend Changes:** +8 files (~1,900 LOC), updated settings/index.ts

### Files Created

- `apps/web/src/packages/components/admin/settings/subscription-plans/subscription-plans-panel.tsx` (1,272 LOC)
- `apps/web/src/packages/components/admin/settings/admin-roles/admin-roles-panel.tsx` (322 LOC)
- `apps/web/src/packages/components/admin/settings/audit-logs/audit-logs-panel.tsx` (245 LOC)
- 3 redirect pages (plans, roles, logs)

### Files Modified

- `apps/web/src/packages/components/admin/settings/integration-settings.tsx` (+3 categories, ~15 LOC)
- `apps/web/src/packages/components/admin/settings/system-settings-tabs.tsx` (+45 LOC)
- `apps/web/src/packages/components/admin/settings/index.ts` (+3 exports)

---

## [1.4.2] - 2025-12-25 - System Settings Reorganization ✅

### Added

- **System Settings Reorganization:**
  - ✅ Двухуровневая навигация:
    - Main Tabs: System Integrations, Payment Providers
    - Sub Tabs: 7 категорий интеграций (Payment, Email, Telegram, Storage, AI, Security, General)
  - ✅ URL Routing: Shareable links to specific settings (`/admin/settings?tab=integrations&subtab=email`)
  - ✅ Deep Linking: Browser back/forward support
  - ✅ Модульная архитектура: Переиспользуемые компоненты для панелей настроек
  - ✅ Backward Compatibility: Redirect `/admin/payment-providers` → `/admin/settings?tab=providers`

### Files Created

- `apps/web/src/packages/components/admin/settings/settings-category-panel.tsx` (~210 LOC)
- `apps/web/src/packages/components/admin/settings/integrations/integration-settings.tsx` (~215 LOC)
- `apps/web/src/packages/components/admin/settings/payment-providers/provider-table.tsx` (~210 LOC)
- `apps/web/src/packages/components/admin/settings/payment-providers/provider-config-dialog.tsx` (~225 LOC)
- `apps/web/src/packages/components/admin/settings/payment-providers/payment-providers-panel.tsx` (~310 LOC)
- `apps/web/src/packages/components/admin/settings/system-settings-tabs.tsx` (~85 LOC)

### Files Modified

- `/admin/settings/page.tsx` - Упрощён с 338 до 16 LOC (~95% reduction)
- `/admin/payment-providers/page.tsx` - Заменён на redirect (590 → 21 LOC, ~96% reduction)
- `admin-sidebar.tsx` - Удалён пункт Payment Providers (теперь в System Settings)

---

## [1.4.1] - 2025-12-24 - Admin Sidebar Optimization ✅

### Added

- **Admin Sidebar Refactor:**
  - ✅ Grouped Navigation (6 Groups):
    - Overview (статичная) - Dashboard
    - Team Management (статичная) - Teams, Operations, Communications, Audit
    - User & Access Control (сворачиваемая) - Users, Roles
    - Billing & Finance (сворачиваемая) - Subscriptions, Plans, Payments, Providers
    - System & Operations (сворачиваемая) - Settings, Storage, Projects
    - Monitoring & Support (сворачиваемая) - Support Tickets, Audit Logs, Analytics
  - ✅ Command Palette (Cmd+K):
    - Глобальный поиск по всем пунктам меню
    - Поиск на английском и русском
    - Группировка результатов по категориям
    - Favorites и Recent в начале
    - Instant navigation
  - ✅ Favorites System:
    - Star icon on hover для добавления в избранное
    - Favorites секция в верхней части sidebar
    - localStorage persistence
    - Max 10 favorites
  - ✅ Recent Pages Tracking:
    - Автоматическое отслеживание последних 5 страниц
    - Recent секция в нижней части sidebar
    - localStorage persistence
    - 1-секундная задержка перед записью
  - ✅ Badge Counters & Indicators:
    - Support Tickets - badge счетчик (открытые + в работе)
    - Audit Logs - dot индикатор (активность за 24ч)
    - GraphQL polling каждые 60 секунд
    - Page Visibility API (пауза при скрытой вкладке)

### Files Created

- 10 new files (~1,900 LOC):
  - 4 main components (AdminSidebar, AdminCommandPalette, AdminNavGroup, AdminNavItem)
  - 3 custom hooks (useAdminFavorites, useAdminRecent, useAdminBadges)
  - 1 utilities module
  - 1 types module
  - 1 GraphQL query file

### Files Modified

- `admin-sidebar.tsx` (complete refactor)
- `admin/layout.tsx` (added Command Palette)

---

## [1.4.0] - 2025-12-24 - Stage 16: Advanced Team & Role Management ✅

### Added

- **Day 8: Team Analytics Dashboard:**
  - ✅ Frontend (5 files, ~650 LOC):
    - `apps/web/src/app/(root)/(protected)/admin/teams/[teamId]/analytics/page.tsx` - Полная страница аналитики
    - `TeamGrowthChart.tsx` - Recharts LineChart для роста команды
    - `MemberActivityTable.tsx` - Таблица активности с поиском и сортировкой
    - `TeamCompositionCharts.tsx` - Pie charts для ролей, positions progress bars
    - `StorageUsageCard.tsx` - Визуализация использования хранилища

- **Day 9: Role & Permission Builder:**
  - ✅ Frontend (6 files, ~915 LOC):
    - `apps/web/src/app/(root)/(protected)/admin/teams/[teamId]/roles/page.tsx` - Страница управления ролями
    - `RoleList.tsx` - Таблица ролей с редактированием
    - `RoleHierarchyTree.tsx` - Древовидная визуализация иерархии ролей
    - `PermissionEditor.tsx` - Редактор прав с категориями
    - `RoleFormDialog.tsx` - Форма создания/редактирования роли

- **Day 10: Team Member Management:**
  - ✅ Frontend (4 files, ~490 LOC):
    - `apps/web/src/app/(root)/(protected)/admin/teams/[teamId]/members/page.tsx` - Страница управления участниками
    - Компоненты для управления участниками команды

- **Day 11: Team Communication Tools:**
  - ✅ Frontend (5 files, ~740 LOC):
    - `apps/web/src/app/(root)/(protected)/admin/communications/page.tsx` - Страница управления объявлениями
    - Компоненты для коммуникаций

- **Day 12: Advanced Team Features:**
  - ✅ Frontend (6 files, ~735 LOC):
    - `apps/web/src/app/(root)/(protected)/admin/teams/operations/page.tsx` - Страница управления операциями
    - Компоненты для операций с командами

- **Day 13: Team Audit & Compliance:**
  - ✅ Frontend (2 files, ~230 LOC):
    - `apps/web/src/app/(root)/(protected)/admin/audit/page.tsx` - Страница аудита с табами

---

## [1.0.2] - 2025-12-19 - 2FA Login & Settings UX Improvements

### Added

- **Two-Factor Authentication (2FA) Login Flow:**
  - ✅ Complete 2FA verification during login when enabled
  - ✅ Dedicated 2FA code input screen with shield icon
  - ✅ Support for TOTP codes from Google Authenticator, Authy, etc.
  - ✅ Support for backup codes during login
  - ✅ Beautiful animated 2FA verification UI

- **URL-Based Settings Navigation:**
  - ✅ Settings tabs now use URL query parameters (`/settings?tab=security`)
  - ✅ Page refresh preserves current tab (no more reset to Profile)
  - ✅ Direct links to specific settings sections work correctly
  - ✅ Browser back/forward navigation works with tabs

### Fixed

- **Admin Pages - Debounce for Search/Filters:**
  - ✅ Added 500ms debounce to roles page search
  - ✅ Added debounce to subscriptions page with filter reset on search
  - ✅ Added debounce to payments page with proper filter handling
  - ✅ Prevents unnecessary API calls during typing

- **TypeScript Fixes:**
  - ✅ Fixed AdminRoleType import in resolver and service
  - ✅ Fixed QRCode component import in TwoFactorAuth
  - ✅ Fixed stats type in admin projects page

### Changed

- `apps/web/src/app/(root)/auth/login/page.tsx` - Complete 2FA UI with code input
- `apps/web/src/app/(root)/(protected)/settings/page.tsx` - URL-based tab routing
- `apps/web/src/packages/libs/auth/auth.context.tsx` - Updated login to return 2FA result

---

## [1.0.1] - 2025-12-19 - Bugfixes & Improvements

### Fixed

- **Payment Providers Configuration UI:**
  - ✅ Added configuration dialog for entering Yookassa/Stripe API credentials
  - ✅ Shop ID, Secret Key, Webhook Secret fields for Yookassa
  - ✅ Secret Key, Publishable Key, Webhook Secret fields for Stripe
  - ✅ Active/Primary toggle switches in config dialog
  - ✅ Test Connection and Clear Cache actions

- **Build Fixes:**
  - ✅ Fixed useToast hook to support object-style parameters (`{ title, description, variant }`)
  - ✅ Fixed UpdatePaymentProviderInput type errors (added null values for optional fields)
  - ✅ Fixed AdminUserFilters missing role property
  - ✅ Regenerated GraphQL types

### Changed

- `apps/web/src/app/(root)/(protected)/admin/payment-providers/page.tsx` - Complete rewrite with config dialog (600+ LOC)
- `apps/web/src/packages/hooks/use-toast.ts` - Updated toast function signature
- `apps/web/src/app/(root)/(protected)/admin/roles/assign-role-dialog.tsx` - Added role filter

---

## [1.0.0] - 2025-12-19 🎉 MVP RELEASE

### Added

- **Stage 15: Subscription Plans & Payment Providers Management - 100% COMPLETE:**
  - ✅ Frontend: Admin Plans Management UI
  - ✅ Frontend: Payment Providers Configuration UI
  - ✅ Complete admin panel for managing subscription plans and payment providers

---

## [0.5.0] - 2025-01-XX

### Added

- **Invite Flow Improvements:**
  - ✅ Кнопка "Создать аккаунт и присоединиться" для незарегистрированных
  - ✅ Автоматический возврат на страницу приглашения после auth
  - ✅ Параметр `redirect` в URL для сохранения контекста
  - ✅ Пропуск онбординга для приглашенных пользователей

### Fixed

- **Apollo Client Imports:**
  - ✅ Исправлены импорты в admin панели (4 файла)
  - ✅ Изменено с `@apollo/client` на `@apollo/client/react`

- **Projects Display:**
  - ✅ Полностью переписана логика фильтрации проектов
  - ✅ Удалены анимации framer-motion для стабильности
  - ✅ Добавлен debug panel
  - ✅ Исправлено исчезновение проектов при переключении фильтров

### Changed

- **Team Switcher:**
  - ✅ Показывает все команды пользователя (owner + member)
  - ✅ Визуальное отличие владелец/участник

---

## [0.3.0] - 2025-01-XX

### Added

- Time Tracking UI
- Personnel Analytics UI
- Salary History UI
- CSV Export buttons

---

## [0.2.8] - Previous Version

### Added

- Admin Panel Week 2
- Settings Page
- Multi-Provider Storage UI
