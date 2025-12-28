# Frontend Changelog

Все изменения в frontend (Web) приложения документируются здесь.

Формат основан на [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
и этот проект следует [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.6.3] - 2025-12-28 - Dashboard Projects UI Improvements

### Changed
- **Dashboard Projects Display**:
  - Заменены две отдельные секции (Активные объекты и Архив) на табы в одном ряду
  - Вкладка "Архив" скрывается автоматически, если нет архивных проектов
  - Улучшена сортировка проектов:
    - Сначала отображаются активные и незавершенные проекты
    - Затем завершенные проекты
  - Добавлен функционал дополнительной сортировки:
    - По умолчанию (умная сортировка)
    - По названию (алфавитный порядок)
    - По дате (новые сначала)
    - По статусу

### Added
- Компонент табов для переключения между активными и архивными проектами
- Выпадающий список для выбора типа сортировки
- Умная сортировка проектов с приоритетом активных/незавершенных

### Improved
- Улучшен UX дашборда: более компактное и интуитивное отображение проектов
- Более гибкая навигация между активными и архивными проектами

## [1.6.2] - 2025-12-28 - Subscription Plans UI Polish & Admin Menu Fixes

### Changed
- **Subscription Plans UI**:
  - Независимое открытие планов (не закрываются автоматически при открытии других)
  - Улучшена анимация раскрытия списка возможностей
  - Оптимизировано выравнивание элементов в карточках

- **Admin Panel User Menu**:
  - Убран желтый фон у кнопки пользователя при открытии меню
  - Убран фон у пункта "Выход" при наведении
  - Изменены названия пунктов меню:
    - "Клиентский дашборд" → "Дашборд"
    - "Настройки профиля" → "Настройки"
    - "Выйти из аккаунта" → "Выход"

### Fixed
- Добавлена поддержка `side="top"` в DropdownMenu компонент для корректного открытия меню вверх
- Исправлено позиционирование меню в админ сайдбаре
- Улучшена анимация появления меню в зависимости от стороны открытия

## [1.6.1] - 2025-12-28 - UI Improvements & Admin Panel Enhancements

### Added
- **Admin Panel User Menu**: Добавлено выпадающее меню пользователя в админ сайдбаре
  - Меню открывается при клике на блок пользователя внизу сайдбара
  - Пункты меню: "Дашборд", "Настройки", "Выход"
  - Меню открывается вверх с плавной анимацией
  - Использует UserAvatar компонент для отображения аватара

### Changed
- **Subscription Plans UI Improvements**:
  - Улучшено отображение карточек планов подписки
  - Добавлен раскрывающийся список возможностей (accordion) для каждого плана
  - Кнопка "Показать все возможности" со стрелкой для раскрытия списка
  - Карточки имеют фиксированную высоту, не сдвигаются при раскрытии других
  - Бейджи "Early Bird" и "Популярный" выровнены по высоте с названием плана
  - Убрана кнопка "Подробнее" из карточек планов
  - Улучшено выравнивание элементов (цена, описание, лимиты)
  - Карточки центрированы и имеют оптимальный размер

### Fixed
- Исправлено позиционирование бейджей в карточках планов
- Исправлено выравнивание элементов в карточках планов
- Убраны hover эффекты в админ панели для консистентности с header

## [1.6.0] - 2025-12-28 - Full Subscription System with Multi-Provider Payments 🚧

### ✅ COMPLETED - Phase 2: Enforcement of Limits (Frontend) (100% complete)

Глобальная обработка ошибок лимитов и уведомления пользователей.

**ФАЗА 2.4: Apollo Error Link для Лимитов** ✅

**Проблема:**
- Backend guards бросают ForbiddenException при превышении лимитов
- Frontend не обрабатывает эти ошибки глобально
- Пользователь не получает понятных уведомлений о причине блокировки
- Нет автоматического redirect на страницу billing

**Решение:**
- ✅ Создан utility `limit-error-handler.ts` для обработки limit errors
- ✅ Apollo Client error link обновлён для перехвата limit errors
- ✅ Toast notifications с кнопкой "Улучшить план"
- ✅ Автоматический redirect на `/settings?tab=billing`

**Изменения:**
- `apps/web/src/packages/utils/limit-error-handler.ts` (+93 LOC, NEW):
  - Type `LimitError` с полями: limitType, current, limit, required
  - Функция `handleLimitError()` - показывает toast и логирует
  - Функция `isLimitError()` - проверяет extensions на код LIMIT_EXCEEDED
  - Функция `extractLimitError()` - извлекает детали из GraphQL error
  - Конфиги для сообщений по каждому типу лимита:
    - Projects: "Достигнут лимит проектов"
    - Members: "Достигнут лимит участников команды"
    - Storage: "Недостаточно места в хранилище"
  - Детальные descriptions с текущими/максимальными значениями

- `apps/web/src/packages/libs/apollo/apollo-client.config.ts` (+9 LOC):
  - Импорт `extractLimitError` и `handleLimitError`
  - Добавлена проверка limit errors в errorLink ПЕРЕД auth errors
  - Early return после обработки limit error (не продолжать обработку)
  - Работает только в browser (isBrowser check)

**Результат:**
- ✅ Все GraphQL errors с `limitType` автоматически обрабатываются
- ✅ Пользователь видит понятное toast уведомление с действием
- ✅ Toast содержит кнопку "Улучшить план" → redirect на billing
- ✅ Toast отображается 8 секунд для видимости
- ✅ Development logging для отладки
- ✅ Работает для всех типов лимитов: projects, members, storage

**Статистика:**
- ✅ 2 файла изменено/создано
- ✅ +102 LOC (Frontend)
- ✅ 3 utility функции для обработки errors
- ✅ 100% покрытие всех типов лимитов

---

**ФАЗА 2.5: UpgradePrompt Support для Storage** ✅

**Проблема:**
- Проверка существующего UpgradePrompt component
- Убедиться что storage limit type поддерживается

**Решение:**
- ✅ Компонент уже поддерживает `limitType: 'storage'`
- ✅ Конфиг LIMIT_CONFIG содержит storage с иконкой 💾
- ✅ Title: "Достигнут лимит хранилища"
- ✅ Description: "Вы достигли лимита доступного хранилища для вашего тарифа"
- ✅ Component готов к использованию для всех типов лимитов

**Результат:**
- ✅ Storage limit поддерживается из коробки
- ✅ Consistent UX для всех типов лимитов
- ✅ Готов к Phase 3

**Статистика Phase 2 (Frontend):**
- ✅ 3 файла проверено/изменено
- ✅ +102 LOC (только новый код)
- ✅ Global error handling для limits
- ✅ Toast notifications с actions
- ✅ 100% готовность к Phase 3

---

### ✅ COMPLETED - Phase 1: Subscription UI & Plan Selection (100% complete)

Реализация пользовательского интерфейса для выбора подписок с отображением планов из БД.

**ФАЗА 1.4-1.6: Обновление SubscriptionManagement с DB-Driven Plans** ✅

**Цель:**
- Обновить существующий компонент для использования полных данных планов из БД
- Показывать early bird pricing, trial period, detailed features
- Улучшить UX с показом популярных планов и детальных описаний

**Изменения:**
- `apps/web/src/packages/components/settings/SubscriptionManagement.tsx` (+45 LOC, refactored):
  - Заменён `GetAvailablePlansDocument` → `AvailablePlansDetailedDocument`
  - Использование `plans Data?.availablePlansDetailed` вместо старого формата
  - **Отображение цен из БД:**
    - Early Bird pricing с перечёркнутой обычной ценой
    - Автоматический выбор RUB валюты из prices array
    - Показ скидки для early bird пользователей
  - **Trial Period Badge:**
    - Отображение "{plan.trialDays} дней бесплатно" для планов с trial
    - Синий badge с информацией о пробном периоде
  - **Popular Plan Highlight:**
    - Ring border для популярных планов (ring-2 ring-primary/20)
    - Badge "Популярный" для выделенных планов
  - **Детальные Features из БД:**
    - Фильтрация по `isIncluded` (только включённые features)
    - Сортировка по `sortOrder`
    - Показ feature.name и feature.description
    - Улучшенный UX с описаниями фич
  - **Plan Description:**
    - Отображение plan.description под заголовком
    - Более информативные карточки планов
  - **Кнопка "Сменить тариф":**
    - Fallback к setIsChangingPlan(true) если нет onUpgrade callback

**Результат:**
- ✅ Полностью DB-driven отображение планов
- ✅ Early bird pricing визуально выделен
- ✅ Trial period информация показывается пользователю
- ✅ Популярные планы визуально выделены
- ✅ Детальные descriptions для features
- ✅ UX улучшен с badges и highlights
- ✅ Обратная совместимость сохранена

**Статистика:**
- ✅ 1 файл изменён (+45 LOC, refactor ~100 LOC)
- ✅ Полная интеграция с AdminPlanModel
- ✅ 0 breaking changes для существующего UI

---

**ФАЗА 1.3: Исправление Schema и Codegen** ✅

**Проблема:**
- GraphQL codegen не мог найти новые queries в schema
- Старый query `availablePlans` использовал неправильный fragment
- TypeScript типы не генерировались для новых queries

**Решение:**
- ✅ Добавлены новые queries в `schema.gql` вручную:
  - `availablePlansDetailed: [AdminPlanModel!]!`
  - `planBySlug(slug: String!): AdminPlanModel`
- ✅ Исправлен fragment в `AvailablePlans` query (PlanLimitsFields → AdminPlanFields)
- ✅ Успешно запущен codegen - сгенерированы TypeScript типы

**Изменения:**
- `apps/api/schema.gql` (+6 LOC):
  - Добавлены 2 новых query definitions в type Query
  - Документация для публичных queries

- `apps/web/src/packages/api/graphql/subscriptions.graphql` (+1 LOC fix):
  - Исправлен fragment в AvailablePlans query

**Результат:**
- ✅ TypeScript типы сгенерированы для всех queries
- ✅ Доступны typed hooks: `useAvailablePlansDetailedQuery`, `usePlanBySlugQuery`
- ✅ Полная типизация для AdminPlanModel, AdminPlanPriceModel, AdminPlanFeatureModel
- ✅ Готовность к созданию UI компонентов

**Статистика:**
- ✅ 2 файла изменено (+7 LOC)
- ✅ Codegen успешно завершен
- ✅ 0 ошибок валидации

**ФАЗА 1.2: GraphQL Queries для Планов** ✅

**Цель:**
- Создать GraphQL queries для получения детальной информации о планах подписки
- Подготовить TypeScript типы через codegen для использования в компонентах

**Изменения:**
- `apps/web/src/packages/api/graphql/subscriptions.graphql` (+60 LOC):
  - Fragment `PlanPriceFields` - структура цены плана (price, earlyBirdPrice, currency, billingCycleDays)
  - Fragment `PlanFeatureFields` - структура функции плана (name, description, isIncluded, sortOrder)
  - Fragment `AdminPlanFields` - полная структура плана (используя AdminPlanPriceModel и AdminPlanFeatureModel)
  - Query `availablePlansDetailed` - получение всех активных планов с ценами и features
  - Query `planBySlug($slug)` - получение плана по slug для детальной страницы

**Что получено:**
- ✅ 3 новых GraphQL фрагмента для структурированных данных
- ✅ 2 новых query для получения планов из БД
- ✅ Поддержка всех полей: prices, features, trial days, isPopular, isEarlyBird
- ✅ Готовность к codegen для генерации TypeScript типов

**Следующий шаг:**
- 🔄 Генерация GraphQL schema на backend
- 🔄 Запуск codegen для создания типов
- ⏳ Создание компонентов CurrentSubscriptionView и PlanSelectionView

**Статистика:**
- ✅ 1 файл изменен
- ✅ +60 LOC (GraphQL)
- ✅ 3 fragments, 2 queries добавлено
- ✅ Полная поддержка AdminPlanModel из backend

---

## [1.5.0] - 2025-12-27 - Multi-Bot Telegram Management UI ✅

### ✅ COMPLETED - Phase 4: Admin UI for Telegram Bots (100% complete)

**GraphQL Operations**
- ✅ Создан файл `admin-telegram-bots.graphql` с полным набором операций:
  - Queries: `GetAdminTelegramBots`, `GetAdminTelegramBot`, `AdminTelegramBotWebhookInfo`
  - Mutations: `AdminCreateTelegramBot`, `AdminUpdateTelegramBot`, `AdminDeleteTelegramBot`
  - Mutations: `AdminSyncTelegramBot`, `AdminTestTelegramBot`
  - Mutations: `AdminSetTelegramWebhook`, `AdminDeleteTelegramWebhook`, `AdminReloadTelegramBot`
- ✅ Все необходимые поля для UI определены
- ✅ Поддержка фильтрации по includeInactive
- ✅ Поддержка поиска по ID и botName
- 📊 **Изменения:** Создан файл `admin-telegram-bots.graphql` (+158 LOC)

**TypeScript Codegen**
- ✅ Исправлены несоответствия в GraphQL operations:
  - Убрано `webhookInfo` из `configStatus` (не существует в schema)
  - Исправлен `adminTestTelegramBot`: `token` → `input: TestBotTokenInput`
  - Исправлен `adminSetTelegramWebhook`: отдельные параметры → `input: SetWebhookInput`
  - Переименован `adminGetTelegramWebhookInfo` → `adminTelegramBotWebhookInfo` (query вместо mutation)
  - Убрано поле `ipAddress` из WebhookInfoModel
- ✅ Сгенерированы TypeScript types для всех операций
- ✅ Все GraphQL operations готовы к использованию в компонентах
- 📊 **Изменения:** Обновлен `admin-telegram-bots.graphql` (исправления схемы)

**TelegramBotsPanel Component**
- ✅ Создан главный компонент панели управления ботами:
  - Stats cards: Total Bots, Active Bots, Primary Bot
  - Integration с GetAdminTelegramBotsDocument query
  - Полный набор mutations: Create, Update, Delete, Sync, Test, Reload
  - State management для dialogs, loading states
  - Toast notifications для всех операций
  - Error handling с retry функционалом
- ✅ Функциональность:
  - Add Bot - создание нового бота
  - Configure - редактирование существующего
  - Test Token - валидация токена перед сохранением
  - Sync - синхронизация данных с Telegram API
  - Reload - hot reload бота без рестарта
  - Toggle Active - включение/отключение бота
  - Delete - удаление с подтверждением
- 📊 **Изменения:** Создан `telegram-bots-panel.tsx` (+380 LOC)

**TelegramBotsTable Component**
- ✅ Создан компонент таблицы для отображения ботов:
  - 9 колонок: Bot (avatar + name), Username, Description, Status, Configuration, Primary, Webhook URL, Last Sync, Actions
  - Avatar support с fallback на Bot icon
  - Status badges (Active/Inactive с иконками)
  - Configuration status badges (Fully Configured / Webhook Set / Token Only / Not Configured)
  - Primary badge с звездочкой
  - Webhook URL с кнопкой копирования
  - Last Sync форматирование (formatDistanceToNow from date-fns)
  - Dropdown menu с действиями: Configure, Sync, Reload, Toggle Active, Delete
  - Loading states для Sync и Reload операций
  - Empty state с подсказкой "Click 'Add Telegram Bot' to create one"
- ✅ UI/UX особенности:
  - Интеграция с shadcn/ui компонентами (Table, Avatar, Badge, DropdownMenu)
  - Responsive truncate для длинных описаний и webhook URLs
  - Destructive стиль для Delete action
  - Disabled состояния для Reload (только для активных ботов)
  - Spinners при выполнении операций
- 📊 **Изменения:** Создан `telegram-bots-table.tsx` (+240 LOC)

**BotConfigDialog Component**
- ✅ Создан диалог конфигурации бота (Create/Edit):
  - Режимы: Create (новый бот) и Edit (редактирование существующего)
  - Поля формы:
    - Bot Name (только create mode, автозаполнение из username)
    - Bot Token (password field с кнопкой "Test")
    - Display Name (автозаполнение из firstName)
    - Description (textarea, опционально)
    - Webhook URL (readonly, автогенерация)
    - Active (switch)
    - Primary OAuth Bot (switch)
- ✅ Функциональность:
  - Test Token - валидация через adminTestTelegramBot mutation
  - Auto-population полей при успешном тесте токена
  - Visual feedback: Success/Error alerts с иконками
  - Token security: никогда не показывается существующий токен (edit mode)
  - Validation: обязательные поля отмечены звездочкой
  - Disabled save button до заполнения обязательных полей
- ✅ UI/UX особенности:
  - shadcn/ui Dialog с responsive max-height и scroll
  - Alert компонент для результатов теста токена
  - Info tooltips для всех полей
  - Loading states для Test и Save операций
  - Clear test result при изменении token
- 📊 **Изменения:** Создан `bot-config-dialog.tsx` (+315 LOC)

**SystemSettingsTabs Integration**
- ✅ Добавлена вкладка "Telegram Bots" в System Settings:
  - Импорт TelegramBotsPanel компонента
  - Добавлен тип 'telegram-bots' в MainTab
  - TabsList расширен с grid-cols-5 до grid-cols-6
  - TabsTrigger и TabsContent для telegram-bots добавлены
  - URL routing поддержка: ?tab=telegram-bots
- 📊 **Изменения:** Обновлен `system-settings-tabs.tsx` (+5 LOC)

### ✅ ЗАВЕРШЕНО - Phase 4: Admin UI for Telegram Bots (100% complete)

### Итого Phase 4 (Завершена):
- ✅ 5 новых файлов создано
- ✅ GraphQL operations определены и исправлены (+158 LOC)
- ✅ TypeScript types сгенерированы
- ✅ TelegramBotsPanel component реализован (+380 LOC)
- ✅ TelegramBotsTable component реализован (+240 LOC)
- ✅ BotConfigDialog component реализован (+315 LOC)
- ✅ Index export файл создан (+3 LOC)
- ✅ SystemSettingsTabs интеграция (+5 LOC)
- ✅ **+1,101 LOC** (Frontend: GraphQL +158, Components +935, Exports +3, Integration +5)
- 📊 **Прогресс: 100%** (6/6 задач выполнено) 🎉

## ✅ ЗАВЕРШЕНО - Multi-Bot Telegram Management v1.5.0

### Итоговая статистика Frontend:

**Components Created:** 4
- ✅ TelegramBotsPanel (+380 LOC) - Главный контейнер с stats и mutations
- ✅ TelegramBotsTable (+240 LOC) - Таблица с full CRUD
- ✅ BotConfigDialog (+315 LOC) - Create/Edit диалог с token test
- ✅ Index export (+3 LOC) - Barrel exports

**Integration:**
- ✅ SystemSettingsTabs (+5 LOC) - Добавлена вкладка "Telegram Bots"

**GraphQL:**
- ✅ admin-telegram-bots.graphql (+158 LOC) - Все queries и mutations

**Total LOC:** +1,101 (Frontend)
**Time:** ~5 часов (из общих ~13 часов проекта)

### Ключевые особенности UI:

**User Experience:**
- ✅ Stats dashboard с метриками
- ✅ Full CRUD через intuitive UI
- ✅ Test Token перед сохранением
- ✅ Auto-population из Telegram API
- ✅ Visual feedback (toasts, loading states, alerts)
- ✅ Error handling с retry
- ✅ Avatar display в таблице

**Responsive Design:**
- ✅ Desktop: full table view
- ✅ Mobile-friendly components
- ✅ Truncate для длинных текстов
- ✅ Dropdown actions menu

**Performance:**
- ✅ Optimistic UI updates
- ✅ Parallel GraphQL queries
- ✅ Lazy loading dialogs
- ✅ Memoized components where needed

---

## [1.4.6] - 2025-12-25 - Active Sessions UI ✅

### Added

- **Active Sessions:**
  - ✅ Отображение детальной информации о сессиях (IP, City, Country, Device, Browser, OS)
  - ✅ Новая секция "История входов" (Login History)
  - ✅ Интеграция с `geoip-lite` и `ua-parser-js` для обогащения данных

---

## [1.4.5] - 2025-12-25 - Telegram Integration for Email Users 🚧

### 🚧 IN PROGRESS - Account Linking UI

**Settings Page**
- ⏳ Реализация кнопки "Подключить Telegram" (вместо "Скоро")
- ⏳ Интеграция `initTelegramAuth` для получения deep link
- ⏳ Логика поллинга статуса и привязки аккаунта

---

## [1.4.4] - 2025-12-25 - Admin Panel UX Improvements & Trial Period 🚧

### 🚧 IN PROGRESS - Admin Panel Navigation & Trial Period

**Admin Panel UX Improvements** - Frontend changes for sidebar cleanup and trial period UI

#### Progress: 70% (Admin UI + Onboarding complete, User dashboard & notifications pending)

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

**✅ Trial Period - Onboarding Flow (COMPLETE)**
- ✅ Created new Step 4 in onboarding for plan selection:
  - Beautiful plan selection UI with cards for each plan
  - Trial period badge display (e.g., "14 дней бесплатно")
  - Plan features, pricing, and limits display
  - Popular plan highlighting
  - Selection state with visual feedback
- ✅ Updated Step 3 to navigate to Step 4 instead of completing directly
- ✅ Updated Stepper to show 4 steps instead of 3
- ✅ Added `trialDays` field to all GraphQL plan queries (GetAvailablePlans, GetAdminPlans, etc.)
- ✅ Success animation with confetti on completion
- ✅ Automatic subscription creation with selected plan during onboarding
- 📊 **Changes:**
  - Created `step-4/page.tsx` (+361 LOC)
  - Modified `step-3/page.tsx` (-96 LOC cleanup, routing update)
  - Modified `admin-plans.graphql` (+7 trialDays fields)
- 🎯 **Benefit:** Users can choose their plan with trial period during onboarding, automatic subscription activation

**⏳ Trial Period - User Dashboard UI (PENDING)**
- ⏳ Add trial status widget in user dashboard
- ⏳ Display countdown of remaining trial days
- ⏳ Show trial period details in profile/settings

**⏳ Trial Period - Notifications (PENDING)**
- ⏳ Email notifications before trial ends
- ⏳ In-app notifications about trial status

### Files Modified

- `apps/web/src/packages/components/admin/admin-sidebar.tsx` (-12 LOC)
- `apps/web/src/packages/components/admin/settings/subscription-plans/subscription-plans-panel.tsx` (+35 LOC)
- `apps/web/src/app/(root)/onboarding/step-3/page.tsx` (-96 LOC, routing update to Step 4)
- `apps/web/src/packages/api/graphql/admin/admin-plans.graphql` (+7 trialDays fields)

### Files Created

- `apps/web/src/app/(root)/onboarding/step-4/page.tsx` (+361 LOC) - Plan selection page with trial period display

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

## [0.7.3] - 2025-12-27 - Subscription Upgrade Flow ✅

### Added

- **Subscription Management:**
  - ✅ Implemented "Select Plan" & "Change Plan" (Upgrade) functionality
  - ✅ Added `NewPlanId` support in mutations
  - ✅ Added "Changing Plan" UI state
  - ✅ Improved error handling in subscription flow

## [0.7.2] - 2025-12-27 - Subscription UI Update ✅

### Changed

- **Subscription Management:**
  - ✅ Enabled fetching available plans from the API (DB source)
  - ✅ Updated `SubscriptionManagement` component to display dynamic plan data
  - 🔄 Re-enabled `AvailablePlansDocument` query

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
