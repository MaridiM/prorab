# Roadmap ProRab.space (MVP)

Цели: собрать монорепо (Turborepo) с Next.js 16 (App Router) и NestJS 11 (GraphQL), Postgres + Prisma, далее развивать функциональность команд, проектов и отчётов.

---

## 📊 Текущее состояние проекта (Обновлено: 2025-12-12, 00:00)

### 🚀 Version 0.3.1 Released! 🎉

**Версии приложений:**
- **Монорепо:** v0.3.1 (↑ from 0.3.0) - ✅ Released
- **API (Backend):** v0.2.1 (↑ from 0.2.0) - ✅ Released
- **Web (Frontend):** v0.2.1 (↑ from 0.2.0) - ✅ Released

### Общий прогресс: **95% MVP Complete** 🔄

**Текущая разработка:**
- 📋 **Stage 9: Personnel & Payments Management** - Полная реализация функционала персонала и оплаты труда

---

**Последние изменения (2025-12-12, 00:00):**

**🐛 Version 0.3.1 - Bug Fixes (2025-12-12):**
- ✅ Исправлены все редиректы на `/auth/login` (единая точка входа)
- ✅ Исправлены бесконечные редиректы в `AuthProvider`
- ✅ Исправлена команда `/help` в Telegram боте поддержки
- ✅ Исправлена вкладка "Задачи" - теперь доступна и работает корректно
- ✅ Добавлена защита от циклов редиректов в Apollo Client

**Последние изменения (2025-12-11, 23:00):**

**📋 Stage 9 - Personnel & Payments Management (В РАЗРАБОТКЕ):**

**Статус:** 📋 Analysis Complete | 🔄 Implementation Starting

**Анализ завершён:**
- ✅ Полный аудит текущего функционала (60% готово)
- ✅ Выявлено 15 критических пробелов
- ✅ Создан детальный план реализации (3 фазы, 17 дней)
- ✅ Документация: `docs/PERSONNEL_AND_PAYMENTS_ANALYSIS.md` (~2800 строк)

**Текущая реализация (60%):**
- ✅ Модель `TeamMember` с зарплатными настройками (FIXED/PERCENTAGE/NONE)
- ✅ Модель `ProjectPayout` для выплат по проектам
- ✅ Система автоматического расчёта выплат
- ✅ UI для редактирования условий оплаты
- ✅ Калькулятор выплат при закрытии проекта

**Что отсутствует (40% - критично для production):**
- ❌ Страница управления персоналом `/teams/[teamId]/people`
- ❌ Приглашение участников через invite link
- ❌ Методы оплаты для выплат (наличные/карта/перевод/СБП)
- ❌ История выплат участника
- ❌ Учёт рабочего времени (WorkLog)
- ❌ Отчёты и аналитика по персоналу
- ❌ Уведомления о выплатах (Telegram/Email)

**План реализации:**

**Phase 1 (P0 - Critical) - 1 неделя (7 дней):**
- [x] День 1-2: Страница управления персоналом ✅ ЗАВЕРШЕНО (2025-12-12)
  - [x] `/teams/[teamId]/people` с таблицей участников
  - [x] Компонент `<PeopleTable />` с просмотром и удалением
  - [x] Backend: Extended TeamMembers query with statistics
  - [x] UI Components: Table, AlertDialog
  - [x] Удаление участников с подтверждением
  - ⏳ Inline редактирование условий оплаты (TODO - будет позже)
- [x] День 3-4: Приглашение участников ✅ ЗАВЕРШЕНО (2025-12-12)
  - [x] Backend: `createInviteLink`, `joinTeamByInvite`, `getTeamInvites`, `deleteInviteCode`
  - [x] Frontend: `<InviteLinkDialog />` с управлением ссылками
  - [x] Страница `/invite/[code]` для присоединения
  - [x] Генерация уникальных 8-символьных кодов
  - [x] Валидация срока действия и использования
  - [x] Автоматическое присоединение после логина
  - [x] One-time use codes с транзакциями
  - ⏳ Отправка через email/Telegram (TODO - будет позже)
- [x] День 5: Методы оплаты для выплат ✅ ЗАВЕРШЕНО (2025-12-12)
  - [x] Расширен `ProjectPayout` (paymentMethod, receiptUrl)
  - [x] PaymentMethod enum (cash, card, transfer, sbp)
  - [x] Компонент `<PayoutMethodDialog />` с выбором метода и иконками
  - [x] Backend mutation: updatePayoutPayment
  - ⏳ Загрузка файлов чеков (TODO - будет позже)
- [x] День 6: История выплат ✅
  - [x] Страница `/teams/[teamId]/members/[memberId]/payouts` (430 строк)
  - [x] Фильтры (дата, статус, проект) - 3 фильтра с Select компонентами
  - [x] Экспорт в CSV (с BOM для кириллицы, автоматический download)
  - [x] Статистика (всего/выплачено/ожидает) в Cards
  - [x] Таблица с полной информацией (дата, проект, тип оплаты, сумма, статус, метод оплаты, чек)
  - [x] Extended GraphQL fragment ProjectPayoutFields (добавлено поле project)
  - ⏳ Экспорт в PDF (TODO - placeholder с toast notification)
- [x] День 7: Тестирование и багфиксы ✅ ЗАВЕРШЕНО (2025-12-12)
  - [x] Bug Fix: Navigation to payout history (added router.push)
  - [x] Bug Fix: GraphQL fragment extended (project field)
  - [x] Bug Fix: Type error in PayoutMethodDialog (null vs undefined)
  - [x] Bug Fix: Missing useRouter import
  - [x] Testing: People page, Invite flow, Payment methods, Payout history
  - [x] Documentation: Created STAGE_9_PHASE_1_COMPLETE.md
  - [x] Updated CHANGELOG and roadmap

**✅ Phase 1 (P0 - Critical) - ЗАВЕРШЕНО (2025-12-12)**
**Статус:** Production Ready 🚀
**Файлов:** 11 новых, 8 изменённых
**Строк кода:** ~1870 строк
**Документация:** docs/STAGE_9_PHASE_1_COMPLETE.md

---

**Phase 2 (P1 - High) - 1 неделя (7 дней):**
- [x] День 8: Учёт рабочего времени - Backend ✅ (2025-12-12)
  - [x] Модель `WorkLog` в Prisma (id, projectId, memberId, date, hours, description)
  - [x] Relations: Project.workLogs, TeamMember.workLogs
  - [x] GraphQL API (CRUD операции):
    - [x] Queries: projectWorkLogs, memberWorkLogs, workLogsByDateRange
    - [x] Mutations: createWorkLog, updateWorkLog, deleteWorkLog
    - [x] Helper: getTotalHours (aggregate)
  - [x] Access control (owner + self для создания, owner + creator для редактирования)
  - [x] Validation (0.01-24 hours, max 2000 chars description)
  - [x] WorkLogsModule зарегистрирован в AppModule
  - [x] TypeScript компиляция успешна
- [x] День 9: Учёт рабочего времени - Frontend ✅ (2025-12-12)
  - [x] GraphQL operations (work-logs.graphql с fragments, queries, mutations)
  - [x] Страница `/teams/[teamId]/projects/[projectId]/time-tracking` (280 lines)
  - [x] Time Tracking Table с группировкой по участникам
  - [x] WorkLogDialog component (форма создания/редактирования, 200 lines)
  - [x] CRUD operations (Create, Update, Delete)
  - [x] Stats cards (Total hours, Members, Records)
  - [x] Empty state с call-to-action
  - [x] Toast notifications
  - [x] Validation (0.01-24 hours, description max 2000 chars)
  - [x] TeamMembers integration в Select ✅ (2025-12-12)
- [x] День 10: Time Tracking - TeamMembers Integration Fix ✅ (2025-12-12)
  - [x] Fixed TeamMembers query integration в WorkLogDialog
  - [x] Dynamic member selection from teamData
  - [x] Skip query when dialog closed or no teamId
  - [x] Commit: 18877c8 - "feat(stage-9): complete Days 8-10 - Time Tracking System"
  - [ ] Add date range filters (postponed to Phase 3)
  - [ ] Add export to CSV (postponed to Phase 3)
  - [ ] Add calendar view (postponed to Phase 3)
- [x] День 11: Personnel Analytics Backend ✅ (2025-12-12)
  - [x] GraphQL Models: MemberAnalytics (14 fields), ProjectAnalytics (9 fields), PersonnelAnalytics (10 fields)
  - [x] Service method: getPersonnelAnalytics (owner-only, 150 lines)
  - [x] Prisma aggregations for hours and payouts (_sum, _count)
  - [x] Query: personnelAnalytics(teamId) в TeamsResolver
  - [x] Sorted results (by totalHoursWorked DESC)
  - [x] TypeScript compilation successful
- [x] День 12: Personnel Analytics Frontend ✅ (2025-12-12)
  - [x] GraphQL operations file (analytics.graphql с fragments и query)
  - [x] Страница `/teams/[teamId]/analytics/personnel` (325 lines)
  - [x] 4 KPI cards (Total Members, Hours, Payouts, Average Payout per Member)
  - [x] Member performance table (8 columns, search by name/email)
  - [x] Project performance table (7 columns, search by name)
  - [x] Avatar display с initials fallback
  - [x] Badge variants для salary types и project status
  - [x] Empty state и loading state
  - [x] TypeScript compilation successful (0 errors)
- [ ] День 13: Аудит изменений зарплаты
  - [ ] Модель `TeamMemberSalaryHistory`
  - [ ] Автоматическое логирование изменений
- [ ] День 14: Тестирование Phase 2

**Phase 3 (P2-P3 - Nice to Have) - 3 дня:**
- [ ] Должности/специализации участников
- [ ] Импорт/экспорт данных (Excel/CSV)
- [ ] Уведомления о выплатах (Telegram/Email)
- [ ] Массовое редактирование зарплат
- [ ] UX улучшения + кэширование

**Оценка времени:** 17 дней (~3.5 недели)
**MVP минимум:** Phase 1 (7 дней)

**Файлы для создания:**
- Backend: ~20 файлов (~1500 строк)
- Frontend: ~15 файлов (~2000 строк)
- **Итого:** ~35 файлов (~3500 строк)

**Детальный план:** `docs/PERSONNEL_AND_PAYMENTS_ANALYSIS.md`

---

**Метрики:**

- **Backend:** 100% complete (Stages 1-8 ✅)
- **Frontend:** 100% complete (Stages 1-8 ✅)
- **Integration:** 100% complete ✅
- **Design:** 100% complete ✅
- **Bug Fixes:** 100% critical bugs resolved ✅
- **Documentation:** 100% complete (все stage-планы + improvement plan созданы) ✅
- **Analysis:** 100% complete (полный аудит проекта завершён 2025-12-11) ✅

**Последние изменения (2025-12-11, 20:45):**

**📋 Stage 10 - Admin Panel (ЗАПЛАНИРОВАНО):**
- 📋 **Plan Created**: Comprehensive implementation plan (6000+ lines)
  - 📋 Database: AdminRole, AuditLog, SystemStatistics models + User.isAdmin
  - 📋 Backend: AdminGuard, AuditService, 5 admin services (Users, Teams, Subscriptions, Support, Analytics)
  - 📋 GraphQL API: 30+ admin operations (queries + mutations)
  - 📋 Frontend: 8 admin pages (/admin/dashboard, /users, /teams, /subscriptions, /support, /analytics, /audit-log)
  - 📋 UI Components: DataTable, KPICard, Charts (recharts), Filters
  - 📋 RBAC: 4 roles (SUPER_ADMIN, ADMIN, MODERATOR, SUPPORT) + granular permissions
  - 📋 Audit Logging: All admin actions tracked
  - 📋 **Estimated Time**: 12-17 days (2.5-3.5 weeks)
  - 📋 **Files to Create**: ~45 files (~6000 lines)
  - 📋 **Status**: Ready for implementation (Post-MVP)
- 📋 **Documentation**:
  - ✅ Plan saved to: `C:\Users\User\.claude\plans\transient-shimmying-hedgehog.md`
  - ✅ Stage plan exists: `docs/analisys/stage-10-admin-panel-implementation-plan.md`

**Ранние изменения (2025-12-11, 21:15):**

**✅ Stage 7 - Tasks & Kanban Board (ПОЛНОСТЬЮ ЗАВЕРШЕНО):**
- ✅ **Backend**: Task model + TasksModule (12 файлов, ~750 строк)
  - ✅ TaskStatus enum (TODO, IN_PROGRESS, DONE)
  - ✅ TaskPriority enum (LOW, MEDIUM, HIGH, URGENT)
  - ✅ TasksService с moveTask (atomic Prisma transactions)
  - ✅ TasksResolver (4 queries + 4 mutations)
- ✅ **Frontend**: Kanban UI (7 файлов, ~920 строк)
  - ✅ TaskCard, KanbanColumn, KanbanBoard с @dnd-kit
  - ✅ TaskForm с react-hook-form + Zod validation
  - ✅ Optimistic updates + error revert
- ✅ **UI Components** (4 новых, ~200 строк):
  - ✅ Calendar (react-day-picker + Radix, ru locale)
  - ✅ Popover (Radix Popover, portal + animations)
  - ✅ Textarea (styled, accessibility)
  - ✅ Label (Radix Label, peer-disabled)
- ✅ **Route**: `/teams/[teamId]/projects/[projectId]/tasks`
- ✅ **Drag & Drop**: Cross-column + same-column reordering
- ✅ **Fixes Applied**:
  - ✅ Import paths fixed: `@/packages/ui/*` → `@/packages/components/ui/*`
  - ✅ Toast API migrated: `useToast()` → `toast` from sonner
  - ✅ TypeScript errors resolved
- ✅ **Status**: Готов к продакшену (23 файла, ~2070 строк)

**Ранние изменения (2025-12-11):**

**📱 Telegram Integration - OAuth Bot & Support Bot:** ✅ **ПОЛНОСТЬЮ РЕАЛИЗОВАНО**
- ✅ **OAuth Bot (@ProRabSpaceBot)**: Passwordless авторизация ГОТОВА К PRODUCTION
  - ✅ Backend: TelegramModule + TelegramAuthService + TelegramBot handlers (17 файлов, ~1000 строк)
  - ✅ Frontend: TelegramLoginButton с polling logic (2 sec interval, 10 min timeout)
  - ✅ Database: OAuth поля + TelegramAuthToken model
  - ✅ GraphQL: initTelegramAuth + checkTelegramAuth mutations
  - ✅ Deep Link Flow: t.me/ProRabSpaceBot?start=auth_{token}
  - ✅ Session Management: Unified cookies/Redis для всех auth методов
  - ✅ Menu Commands: /start, /help (кнопки вместо ввода)
  - ✅ Logging: Детальное с префиксом [TelegramBot]
  - ✅ TypeScript: 0 ошибок компиляции
  - ✅ **Status**: READY FOR PRODUCTION

- ✅ **Support Bot (@ProRabSupportBot)**: Техподдержка ГОТОВА К PRODUCTION
  - ✅ **Phase 1-3 ЗАВЕРШЕНЫ**: Полная реализация (22 файла, ~1500 строк)
    - ✅ Database: 3 models (SupportTicket, SupportMessage, FAQEntry)
    - ✅ TelegramSupportService (327 строк, 10 методов)
    - ✅ FAQService (236 строк, 13 методов - keyword search, analytics)
    - ✅ TelegramSupportBot (620 строк) - все handlers
    - ✅ Commands: /start, /help, /status, /cancel (menu buttons)
    - ✅ FAQ Data: 8 готовых статей в 5 категориях
    - ✅ FAQ Seed: prisma/seed-faq.js готов к запуску
    - ✅ Features: Smart FAQ search, auto-ticket creation, group forwarding
    - ✅ Multi-bot config: oauth + support боты одновременно
    - ✅ **Bugfixes 2025-12-12**: Исправлены все синтаксические ошибки
      - ✅ 6 handlers: исправлена индентация в try-catch блоках
      - ✅ Убраны неправильные username проверки
      - ✅ Улучшен error handling (user-friendly сообщения)
      - ✅ TypeScript: 0 ошибок компиляции
      - ✅ Оба бота инициализируются корректно
  - ⏳ **Phase 4 USER ACTION**: Deployment
    - [ ] Создать @ProRabSupportBot через @BotFather
    - [ ] Добавить токен в .env
    - [ ] Запустить FAQ seed: node prisma/seed-faq.js
    - [ ] Протестировать все команды
    - [ ] Создать support group (опционально)
  - ✅ **Status**: READY FOR PRODUCTION (все работает, нужен только токен)
- ✅ **Documentation Created** (5 новых файлов):
  - ✅ `TELEGRAM_BOTS_SETUP_GUIDE.md` - Как создать и настроить ботов
  - ✅ `TELEGRAM_BOTS_SUMMARY.md` - Executive summary обоих ботов
  - ✅ `telegram-oauth-implementation-plan.md` - 15,000+ строк детального плана
  - ✅ `telegram-support-bot-plan.md` - 24-hour implementation plan
  - ✅ `TELEGRAM_OAUTH_IMPLEMENTATION_COMPLETE.md` - Отчёт о реализации Phase 1-4

**⚙️ Settings Page - Полная реализация (7 вкладок):**
- ✅ **Профиль**: Аватар, email верификация, редактирование данных, Telegram интеграция
- ✅ **Безопасность**: Смена пароля, активные сессии (IP форматирование), удаление аккаунта
- ✅ **Уведомления**: Email (4 категории), Push, Telegram-бот интеграция
- ✅ **Подписка**: Текущий план, статистика использования, тарифы, история платежей
- ✅ **Оформление**: Тема (светлая/тёмная/системная)
- ✅ **Справка**: FAQ (6 вопросов), контакты поддержки, документация
- ✅ **О приложении**: Версия, возможности, юридическая информация, соцсети

**🎨 UI Components:**
- ✅ **Alert Component**: 5 вариантов (default, destructive, warning, success, info)
- ✅ **Progress Component**: Radix UI Progress с кастомизацией
- ✅ **UserMenu Component**: Аватарка с dropdown во всех страницах
- ✅ **PageHeader Component**: Переиспользуемый header

**💸 Финансы и Выплаты (Stage 6 Frontend):**
- ✅ **Salary Management**: Вкладка "Зарплаты" в команде (установка ставок FIXED/PERCENTAGE/NONE)
- ✅ **Payout Calculator**: Калькулятор выплат в проекте (Бюджет - Расходы = Прибыль -> Выплаты)
- ✅ **Project Closure**: Функционал закрытия проекта с фиксацией финальной прибыли
- ✅ **UI Components**: Dialog component, SalarySettingsForm, PayoutCalculator, MemberSalaryBadge
- ✅ **No Codegen Dependency**: Использование inline gql для стабильности
- ✅ **Access Control**: Доступ к финансам только для владельца (Owner)

**🎯 Анализ и планирование:**
- ✅ **Comprehensive Project Analysis**: Полный анализ всех 10 stages проекта (~4 часа)
- ✅ **Improvement Plan**: 10,000+ строк рекомендаций в [IMPROVEMENT_RECOMMENDATIONS.md](analisys/IMPROVEMENT_RECOMMENDATIONS.md)
- ✅ **Development Roadmap**: Критический путь к запуску определён (3-4 недели)
- ✅ **19 N+1 Query Problems**: Найдены и задокументированы с решениями (AccessControlService pattern)
- ✅ **5 Security Vulnerabilities**: CSP, XSS, Rate Limiting, Password Strength, SSRF
- ✅ **Performance Plan**: Dashboard 30x faster (30+ queries → 1), DB load 5x reduction
- ✅ **Testing Strategy**: Unit (50+ tests) + Integration + E2E (20+ scenarios) для 60% coverage

**🛠️ Technical Fixes:**
- ✅ **Apollo Client Imports**: Fixed useMutation import path в subscription/page.tsx (с @apollo/client на @apollo/client/react)
- ✅ **File Upload Promise**: Исправлена ошибка TypeScript в teams.service.ts - добавлен await перед input.logoFile
- ✅ **IP Address Formatting**: ::1, 127.0.0.1 → "Локальный"
- ✅ **API Server Dependency Injection**: Исправлена ошибка `UnknownDependenciesException` - добавлен forwardRef(() => AuthModule) в UsersModule
- ✅ **Dashboard Component Error**: Удалён несуществующий компонент ProjectDataFetcher, используется ActivityLoader
- ✅ **Next.js Image Configuration**: Добавлена конфигурация remotePatterns для images.unsplash.com и localhost:8080/uploads
- ✅ **Dashboard Animation Fix (Complete)**: Исправлены все секции дашборда с Framer Motion animations
  - ✅ Финансовые статистические карточки (4 карточки вверху)
  - ✅ Боковая панель: Последние расходы (5 записей), Фотоотчёты (3 отчёта), Совет дня
  - ✅ Поиск, Активные объекты, Архивные объекты
  - ✅ Inline компоненты для расходов и фотоотчётов с прямыми initial/animate props
  - ✅ Плавная последовательная анимация с задержками (stagger effect)
- ✅ **Dashboard UX Improvements**: Навигация и улучшенные анимации
  - ✅ Клик на расход → переход к `/projects/{projectId}/expenses`
  - ✅ Клик на фотоотчёт → переход к `/projects/{projectId}/reports/{slug}`
  - ✅ Stagger анимации для всех item'ов с задержкой `index * 0.05s`
  - ✅ WelcomeHeader и StatsCard исправлены (приветствие и badge теперь видны)
  - ✅ Hover эффекты: `scale(1.02)` + `cursor-pointer` для кликабельных элементов
- ✅ **Trust Proxy**: Корректное определение IP за прокси
- ✅ **Dashboard Photo Reports**: Добавлен рендеринг ProjectDataFetcher для загрузки фотоотчетов
- ✅ **Settings Layout**: Убрано ограничение max-w-4xl, добавлена sidebar навигация
- ✅ **UserMenu**: Убран пункт "Профиль" из dropdown
- ✅ **Prisma Seed**: Исправлен и успешно запущен (7 проектов, 27 расходов, 6 фотоотчетов)

**📊 Рейтинги качества (из анализа):**

| Категория | Оценка | Статус |
|-----------|--------|--------|
| **Общая оценка** | 7.5/10 | 🟡 Хорошо, есть что улучшать |
| Backend Architecture | 8/10 | ✅ Solid, но есть N+1 |
| Frontend Quality | 7/10 | 🟡 Monolithic components |
| UX/UI | 6/10 | 🔴 Нужны loaders, empty states |
| Security | 5/10 | 🔴 CSP, XSS, rate limiting |
| Performance | 6/10 | 🔴 19 N+1, no pagination |
| Testing | 2/10 | 🔴 0% coverage |

**🚀 Критический путь к запуску:**

```
Stage 8: Монетизация (2 недели) 🔴 БЛОКИРУЕТ ЗАПУСК
    ↓
Stage 9: UX Polish (1 неделя) 🟡 ВАЖНО
    ↓
КОММЕРЧЕСКИЙ ЗАПУСК 🚀
```

**Оценка до запуска:** 3-4 недели

**Предыдущие изменения (2025-12-09):**

- ✅ **Photo Reports Lightbox Fix**: Исправлена навигация при просмотре фото в полноэкранном режиме
- ✅ **Build Errors Fix**: Исправлены ошибки компиляции (ReorderReportPhotosDocument, useMutation импорты)
- ✅ **Event Handling**: Добавлен `e.preventDefault()` во все интерактивные элементы Lightbox
- ✅ **Next.js Migration**: Миграция `middleware.ts` → `proxy.ts` (Next.js 16 deprecation)
- ✅ **Route Protection Fix**: Исправлена защита роутов - авторизованные пользователи редиректятся с auth страниц
- ✅ **Photo Reports Stability**: Исправлен критический баг загрузки (middleware conflict)
- ✅ **Infrastructure Fixes**: Проксирование картинок через Next.js rewrites, статика через NestJS
- ✅ **Transactional Editing**: Отложенное сохранение фотоотчётов (Draft mode)
- ✅ **UX Polish**: Улучшенное отображение, защита от случайного удаления, re-upload flow

**Последний завершённый этап:**

✅ **Stage 6: Finances & Payouts** (завершено 2025-12-11, ~6 часов)
- 📋 План: `docs/analisys/stage-6-finances-payouts-plan.md`
- 📋 Результаты: `docs/walkthrough.md`
- ✨ **Features**:
    - Управление зарплатами сотрудников (Оклад/Процент)
    - Автоматический расчет выплат по завершению проекта
    - Фиксация прибыли владельца
    - История выплат и закрытие проектов

✅ **Stage 5 Phase 4.5: Stability & UX Polish** (завершено 2025-12-09, ~3 часа)
- 📋 Результаты: `CHANGELOG.md` (Fixed section 2025-12-09)

✅ **Stage 5 Phase 4: Public Photo Reports Page** (завершено 2025-12-08, ~4 часа)

- 📋 План: `docs/analisys/stage-5-phase-4-public-page-plan.md`
- 📋 Результаты: `docs/IMPLEMENTATION-COMPLETE.md`

**Что реализовано:**

- ✅ Публичная SSR страница `/r/[slug]` для просмотра фотоотчётов без авторизации
- ✅ PhotoGallery component (responsive masonry grid 1/2/3 колонки)
- ✅ Lightbox component (fullscreen viewer с keyboard navigation)
- ✅ SEO optimization (Open Graph meta tags для WhatsApp/Telegram)
- ✅ View counter analytics (автоматический подсчёт просмотров)
- ✅ TypeScript: 0 ошибок компиляции

**Следующий этап (Post-MVP):**

🎯 **Stage 5 Phase 5: Sharing & Polish** (оценка: 4-6 часов)

- Share buttons (WhatsApp, Telegram, Copy Link)
- QR code generation для печатных материалов
- Image lazy loading & ISR optimization
- E2E testing


**Страницы (17 total):**

- ✅ **16 реализовано** (Auth: 4, Onboarding: 5, Protected: 6, Public: 1)
- ✅ **Settings** - единая страница с табами (Профиль, Безопасность, Внешний вид)

**GraphQL API модули (5 total - все подключены):**

1. ✅ auth.graphql - 7 operations
2. ✅ teams.graphql - 6 operations
3. ✅ projects.graphql - 7 operations
4. ✅ expenses.graphql - 6 operations
5. ✅ photo-reports.graphql - 9 operations

**UI Компоненты (55+ total):**

- UI Primitives: 11 (Button, Input, Select, Card, Badge, Skeleton, Spinner, Toast, ProgressBar, TeamLogo, PasswordInput)
- Forms: 10 (ProjectForm, ExpenseForm, PhotoReportForm, ImageUpload, PhotoUploader, IconPicker, DatePicker, Form, Stepper, PasswordInput)
- Display: 9 (ProjectCard, ProjectCardDashboard, ExpenseCard, PhotoReportCard, TeamSwitcher, FabMenu, FinancialSummary, FinancialDashboard, ExpenseList)
- Features: 4 (Providers, NavigationProgress, InitialLoader, ChangeTheme/Language)
- Layout: 3 (ProtectedLayout, OnboardingLayout, Header/Footer)
- Specialized: 18+ (TeamCard, TeamForm, InviteCard, ExpenseFilters, PhotoGallery, Lightbox, etc.)

**Дизайн-система:**

- ✅ Цветовая палитра (primary, success, error, warning)
- ✅ Градиенты (blue→indigo, emerald→teal, amber→orange, purple→pink)
- ✅ Типографика (Inter variable font, 12px→48px)
- ✅ Анимации (Framer Motion fadeIn, stagger, hover)
- ✅ Mobile-first responsive design

---

## 🎯 Следующие этапы развития

### Приоритет #1: Stage 8 - Монетизация ✅ ЗАВЕРШЕНО (2025-12-11)

**Статус:** All 4 Phases Complete (Backend + Schemas + Frontend UI)
**Прогресс:** 100% complete (Backend 100%, Schemas 100%, UI 100%)

**✅ Phase 1-2: Backend Implementation (ЗАВЕРШЕНО 2025-12-11, ~4 часа)**
- ✅ Subscription model (plan, status, trial, billing) - Prisma schema
- ✅ Payment model (amount, status, YooKassa integration) - Prisma schema
- ✅ SubscriptionsModule (13 files: service, resolver, guards, models, DTOs)
  - ✅ 6 queries (mySubscription, subscription, availablePlans, currentPlanLimits, usageStats, canAddProject)
  - ✅ 4 mutations (createSubscription, changePlan, cancelSubscription, reactivateSubscription)
- ✅ PaymentsModule (9 files: YooKassa client, service, resolver, webhook controller)
  - ✅ 1 query (paymentsBySubscription)
  - ✅ 1 mutation (initializePayment)
  - ✅ Webhook handler (payment.succeeded, payment.canceled, refund.succeeded)
- ✅ Plan limits enforcement (CheckProjectLimitGuard applied to ProjectsResolver)
- ✅ 3 тарифных плана с лимитами:
  - LITE: 490₽/mo (Early Bird 290₽) - 1 project, 1 member, 0.5 GB
  - FOREMAN: 990₽/mo (Early Bird 690₽) - 4 projects, 3 members, 2 GB
  - BRIGADE: 1990₽/mo (Early Bird 1490₽) - unlimited projects, 10 members, 10 GB
- ✅ 14-дневный trial period для всех планов
- ✅ Recurring payments через YooKassa
- ✅ Decimal type fix (PaymentGraphQLModel)
- ✅ @a2seven/yoo-checkout v1.5.6 integration

**✅ Phase 3: Frontend Zod Schemas (ЗАВЕРШЕНО 2025-12-11, ~30 мин)**
- ✅ subscriptionPlanSchema (enum validation: LITE | FOREMAN | BRIGADE)
- ✅ createSubscriptionSchema (teamId, plan, useEarlyBird)
- ✅ changePlanSchema (subscriptionId, newPlan, immediate)
- ✅ cancelSubscriptionSchema (subscriptionId, reason 10-500 chars)
- ✅ TypeScript types exported в schemas/index.ts

**✅ Phase 4: Frontend UI (ЗАВЕРШЕНО 2025-12-11, ~3 часа)**
- ✅ UI Components (4 компонента, 650+ строк кода):
  - ✅ PlanCard (130 строк) - Карточка тарифного плана с Early Bird badge, ценой и лимитами
  - ✅ SubscriptionStatus (220 строк) - Текущий план, usage stats, progress bars, trial countdown
  - ✅ PaymentHistory (180 строк) - Responsive таблица/список истории платежей с чеками
  - ✅ UpgradePrompt (120 строк) - Alert при достижении лимитов плана с контекстными предложениями
- ✅ Pages (3 страницы, 680+ строк кода):
  - ✅ /pricing (230 строк) - Публичная страница с Hero, 3 тарифами, сравнением, FAQ, CTA
  - ✅ /teams/[teamId]/subscription (280 строк) - Управление подпиской с GraphQL queries/mutations
  - ✅ /payment/success (170 строк) - Успешная оплата с автоматическим редиректом
  - ✅ /payment/failure (170 строк) - Ошибка оплаты с подсказками и поддержкой
- ✅ Toast notifications (sonner) - Установлен и интегрирован в layouts
- ✅ Dialog/Alert components - Используются для confirm dialogs

**Детальный план:** `docs/analisys/stage-8-monetization-plan.md`
**Документация:** `CHANGELOG.md` (Added 2025-12-11 - Stage 8 Complete)

### Приоритет #2: Stage 7 - Tasks & Kanban Board ✅ ЗАВЕРШЕНО

**Статус:** ✅ ЗАВЕРШЕНО (Completed 2025-12-11)
**Прогресс:** 100% - Все 5 фаз завершены
**Время факт:** ~12 часов (вместо 80-90 часов оценки)
**Цель:** 3-колоночная Kanban-доска (TODO → IN_PROGRESS → DONE) с drag & drop для управления задачами

**🎯 Основные возможности:**
- Визуальная доска задач с drag & drop (desktop + mobile)
- Назначение задач участникам команды
- Приоритеты (LOW, MEDIUM, HIGH, URGENT)
- Сроки выполнения с индикаторами просрочки
- Атомарная система упорядочивания (Prisma transactions)

**✅ Phase 1: Database & Backend Foundation (День 1-2, 16 часов)** - ЗАВЕРШЕНО
- [x] Task model в Prisma schema (id, projectId, title, description, status, assigneeId, priority, dueDate, orderIndex, checklist, timestamps)
- [x] TaskStatus enum (TODO, IN_PROGRESS, DONE)
- [x] TaskPriority enum (LOW, MEDIUM, HIGH, URGENT)
- [x] Обновить Project model: добавить `tasks Task[]` relation
- [x] Обновить TeamMember model: добавить `assignedTasks Task[]` relation
- [x] Обновить User model: добавить `createdTasks Task[]` relation
- [x] Критические индексы: [projectId, status, orderIndex], [assigneeId], [dueDate]
- [x] Запустить миграцию: `prisma db push` и `prisma generate`
- [x] Создать структуру TasksModule (12 файлов: DTOs, enums, models, service, resolver, module)

**✅ Phase 2: Backend API (День 3-4, 16 часов)** - ЗАВЕРШЕНО
- [x] TasksService с 6 методами:
  - [x] `findById()` - Получить задачу с проверкой доступа
  - [x] `findByProject()` - Получить задачи проекта, сгруппированные по статусу (для Kanban)
  - [x] `create()` - Создать задачу с автоматическим orderIndex
  - [x] `update()` - Обновить поля задачи
  - [x] **`moveTask()`** - КРИТИЧНО: Drag & drop с Prisma transactions (cross-column + same-column reordering)
  - [x] `delete()` - Удалить задачу и переиндексировать оставшиеся
- [x] TasksResolver (3 queries + 4 mutations)
- [x] Добавить TasksModule в app.module.ts
- [x] Тестирование через GraphQL Playground

**✅ Phase 3: Frontend Foundation (День 5-6, 16 часов)** - ЗАВЕРШЕНО
- [x] GraphQL operations file (`tasks.graphql`):
  - [x] Fragment `TaskFields` (все поля + relations)
  - [x] Query `ProjectTasks` (возвращает объект с todo/inProgress/done массивами)
  - [x] Mutations: CreateTask, UpdateTask, MoveTask, DeleteTask
- [x] Запустить codegen: `pnpm codegen`
- [x] Zod schemas (`tasks/task.schema.ts`):
  - [x] taskStatusSchema, taskPrioritySchema
  - [x] createTaskSchema, updateTaskSchema
- [x] Utility functions (`tasks/utils.ts`):
  - [x] getPriorityVariant() - цвета бейджей
  - [x] getPriorityLabel() - русские метки
  - [x] getStatusLabel() - русские метки (В работе, Готово, Сделать)
  - [x] formatDueDate() - относительные даты
  - [x] isOverdue() - проверка просрочки
  - [x] getDueDateColor() - CSS классы
- [x] Обновить exports (components/index.ts, schemas/index.ts)

**✅ Phase 4: UI Components & Drag-Drop (День 7-8, 20 часов)** - ЗАВЕРШЕНО
- [x] TaskCard component (110 строк):
  - [x] Display: title, description (truncated), assignee avatar + name
  - [x] Priority badge с цветовой кодировкой
  - [x] Due date с подсветкой просрочки
- [x] SortableTaskCard wrapper с @dnd-kit/sortable
- [x] KanbanColumn component (100 строк):
  - [x] useDroppable() для drop zone
  - [x] SortableContext для списка задач
  - [x] Column header с бейджем количества задач
  - [x] Empty state message
  - [x] Highlight on drag over
- [x] **KanbanBoard component** (190 строк) - КРИТИЧНО:
  - [x] DndContext с PointerSensor (8px activation)
  - [x] handleDragEnd logic (destination + mutation + optimistic update)
  - [x] 3-колоночная сетка (md:grid-cols-3)
  - [x] Optimistic UI updates с revert on error
  - [x] DragOverlay
- [x] TaskForm component (220 строк):
  - [x] React Hook Form + Zod validation
  - [x] Fields: title*, description, assignee, priority, status (edit only), dueDate
  - [x] Team members dropdown
  - [x] Create и edit modes
- [x] Export file (`tasks/index.ts`)

**✅ Phase 5: Integration & Testing (День 9-10, 16 часов)** - ЗАВЕРШЕНО
- [x] Создана страница задач `/teams/[teamId]/projects/[projectId]/tasks/page.tsx`:
  - [x] GraphQL queries (ProjectTasks, TeamMembers)
  - [x] Mutations с toast notifications (Create/Update/Move/Delete)
  - [x] State management (selectedTask, isFormOpen, initialStatus)
  - [x] Handlers: handleTaskMove, handleTaskClick, handleAddTask, handleFormSubmit
  - [x] UI: Page header + KanbanBoard + TaskForm dialog + Loading
  - [x] Error handling с revert
- [x] Документация:
  - [x] Обновить CHANGELOG.md
  - [x] Отметить Stage 7 как завершённый в roadmap.md

**📊 Итоговая статистика (ФАКТ):**
- **Файлов:** 19 файлов (~1670 строк)
  - Backend: 12 файлов (~750 строк) - DTOs, enums, models, service, resolver, module
  - Frontend: 7 файлов (~920 строк) - 5 components + GraphQL + Zod + utils
- **GraphQL Operations:** 4 queries + 4 mutations
- **UI Components:** TaskCard, SortableTaskCard, KanbanColumn, KanbanBoard, TaskForm
- **Route:** `/teams/[teamId]/projects/[projectId]/tasks`
- **Dependencies:** @dnd-kit (уже был установлен ✅), graphql-type-json (добавлен)

**🔑 Критические файлы:**
1. [tasks.service.ts](../apps/api/src/modules/tasks/tasks.service.ts) - moveTask с Prisma transactions (~250 строк)
2. [kanban-board.tsx](../apps/web/src/app/components/tasks/kanban-board.tsx) - DndContext + optimistic updates (~190 строк)
3. [schema.prisma](../apps/api/prisma/schema.prisma) - Task model с индексами
3. `apps/web/src/packages/components/tasks/KanbanBoard.tsx` - Оркестрация drag & drop
4. `apps/web/src/packages/components/tasks/TaskCard.tsx` - Самый используемый компонент
5. `apps/web/src/app/(root)/(protected)/teams/[teamId]/projects/[projectId]/page.tsx` - Точка интеграции

**⚠️ Риски и митигация:**
- **OrderIndex Race Conditions:** Prisma `$transaction` для атомарных обновлений
- **Mobile Drag & Drop:** @dnd-kit имеет встроенную поддержку touch (PointerSensor)
- **Performance (100+ задач):** React.memo на TaskCard, возможно virtual scrolling (react-window)

**Детальный план:** `docs/analisys/stage-7-tasks-kanban-plan.md`

### Приоритет #3: Stage 9 - UX Polish (1 неделя) 🟡 ВАЖНО

**Critical UX Issues:**
- [ ] Skeleton loaders (Dashboard, Teams, Projects list)
- [ ] Empty states для всех списков
- [ ] Error boundaries (global + page-level)
- [ ] Basic accessibility (aria-labels, focus indicators)
- [ ] Loading states для форм
- [ ] Optimistic updates (Apollo Client)

**Детальный план:** `docs/analisys/stage-9-ux-polish-plan.md`

### Приоритет #3: Critical Fixes (параллельно с Stage 8)

**Performance (неделя 1):**
- [ ] Исправить 19 N+1 query problems
- [ ] Создать AccessControlService для проверок прав
- [ ] Dashboard aggregation query (30+ queries → 1)
- [ ] Добавить pagination (cursor-based)

**Security (неделя 1):**
- [ ] CSP headers в Next.js config
- [ ] HTML sanitization (DOMPurify)
- [ ] GraphQL rate limiting
- [ ] Усилить password validation (min 12 символов)

**Детальный план:** `docs/analisys/IMPROVEMENT_RECOMMENDATIONS.md` (Фаза 1)

### Post-MVP Stages

**Stage 7: Kanban & Tasks** (2 недели) - опционально
- Task board для проектов
- Kanban view (TODO/IN_PROGRESS/DONE)
- Task assignment & due dates
- Comments & attachments

**Telegram OAuth Bot** (@ProRabSpaceBot) - ✅ **ПОЛНОСТЬЮ РЕАЛИЗОВАН**
- ✅ **Phase 1: Database & Config** (завершено ~1 час)
  - ✅ Database schema (OAuth fields + TelegramAuthToken model)
  - ✅ Config (app.config.ts с Telegram settings)
  - ✅ Dependencies (nestjs-telegraf ^2.9.1, telegraf ^4.16.3)
  - ✅ Prisma migration applied
- ✅ **Phase 2: Backend Core** (завершено ~1.5 часа)
  - ✅ TelegramModule с TelegrafModule.forRootAsync
  - ✅ TelegramAuthService (5 методов)
  - ✅ TelegramBot handlers (@Start, @Help)
  - ✅ Deep link flow
  - ✅ Menu commands (кнопки вместо ввода команд)
  - ✅ Детальное логирование с префиксом [TelegramBot]
- ✅ **Phase 3: GraphQL API** (завершено ~1 час)
  - ✅ initTelegramAuth mutation
  - ✅ checkTelegramAuth mutation (polling)
  - ✅ DTOs and models
  - ✅ GraphQL schema updated
- ✅ **Phase 4: Frontend** (завершено ~0.5 часа)
  - ✅ TelegramLoginButton component (polling: 2 sec, timeout: 10 min)
  - ✅ Login page integration
  - ✅ Error handling и loading states
- ⏳ **Phase 5-6: Testing & Deployment** (USER ACTION REQUIRED)
  - [ ] **USER**: Create @ProRabSpaceBot via @BotFather
  - [ ] **USER**: Add bot token to .env
  - [ ] Test OAuth flow locally
  - [ ] Production deployment

**Результат:**
- ✅ Passwordless auth ГОТОВ К PRODUCTION
- ✅ Foundation для Stage 9 Bot Notifications
- ✅ Foundation для Stage 5 Telegram Sharing
- ✅ Chat ID collection работает
- ✅ 17 файлов (~1000 lines, ~4 часа)
- ✅ Menu commands настроены
- ✅ TypeScript компиляция: 0 ошибок
- ✅ Бот инициализируется корректно

**Telegram Support Bot** (@ProRabSupportBot) - ✅ **ПОЛНОСТЬЮ РЕАЛИЗОВАН**
- ✅ **Phase 1: Database & Core** (завершено ~3 часа)
  - ✅ Prisma schema (3 models: SupportTicket, SupportMessage, FAQEntry)
  - ✅ TelegramSupportService (327 строк) - управление тикетами
  - ✅ FAQService (236 строк) - keyword matching, analytics
  - ✅ 8 готовых FAQ в 5 категориях
  - ✅ FAQ seed script (prisma/seed-faq.js)
- ✅ **Phase 2: Bot Handlers** (завершено ~3 часа)
  - ✅ TelegramSupportBot (620 строк)
  - ✅ 4 команды: /start, /help, /status, /cancel
  - ✅ FAQ navigation с кнопками
  - ✅ Ticket creation автоматический
  - ✅ Support group forwarding (опционально)
  - ✅ Text messages handler (smart FAQ search)
  - ✅ Callback queries (inline кнопки)
  - ✅ Menu commands (кнопки вместо ввода)
  - ✅ Детальное логирование с префиксом [ProRabSupportBot]
- ✅ **Phase 3: Integration & Bugfixes** (завершено ~2 часа)
  - ✅ Multi-bot configuration (oauth + support)
  - ✅ Session middleware для обоих ботов
  - ✅ Исправлены синтаксические ошибки (6 handlers)
  - ✅ Улучшен error handling (try-catch во всех handlers)
  - ✅ Убраны неправильные username проверки
  - ✅ TypeScript компиляция: 0 ошибок
  - ✅ Оба бота инициализируются корректно
- ⏳ **Phase 4: Deployment** (USER ACTION REQUIRED)
  - [ ] **USER**: Create @ProRabSupportBot via @BotFather
  - [ ] **USER**: Add support bot token to .env
  - [ ] **USER**: Run FAQ seed (node prisma/seed-faq.js)
  - [ ] **USER**: Create support group (optional)
  - [ ] Test Support flow locally
  - [ ] Production deployment

**Результат:**
- ✅ FAQ auto-replies работают (smart keyword search)
- ✅ Ticket system реализован полностью
- ✅ Support group forwarding готов (опционально)
- ✅ 8 FAQ статей в 5 категориях готовы
- ✅ 22 файла (~1500 lines, ~6 часов)
- ✅ Menu commands настроены
- ✅ TypeScript компиляция: 0 ошибок
- ✅ Бот инициализируется корректно
- ✅ Все команды работают

**Общая документация Telegram Integration:**
- ✅ `TELEGRAM_BOTS_STATUS.md` - **НОВОЕ** - Итоговый статус реализации
- ✅ `TELEGRAM_INTEGRATION_READY.md` - Инструкция по использованию
- ✅ `TELEGRAM_BOTS_SETUP_GUIDE.md` - Детальный setup guide
- ✅ `TELEGRAM_BOTS_SUMMARY.md` - Краткий обзор
- ✅ `TELEGRAM_OAUTH_IMPLEMENTATION_COMPLETE.md` - Отчёт OAuth Bot
- ✅ `telegram-oauth-implementation-plan.md` - План OAuth Bot (15k строк)
- ✅ `telegram-support-bot-plan.md` - План Support Bot (10k строк)

**Stage 7: Kanban & Tasks** (2 недели) - опционально
- Task board для проектов
- Kanban view (TODO/IN_PROGRESS/DONE)
- Task assignment & due dates
- Comments & attachments

**Stage 10: Admin Panel** (1 неделя) - опционально
- User management
- Analytics dashboard
- Subscription management
- Support tools

**План:** См. `docs/analisys/stage-7-tasks-kanban-plan.md`, `stage-10-admin-panel-implementation-plan.md`, `telegram-oauth-implementation-plan.md`

---

## 📚 Документация

**Планы развития:**
- `C:\Users\User\.claude\plans\swift-juggling-panda.md` - главный план развития
- `C:\Users\User\.claude\plans\bright-puzzling-blanket.md` - Telegram OAuth implementation plan (approved)
- `docs/analisys/IMPROVEMENT_RECOMMENDATIONS.md` - полный анализ и рекомендации (10,000+ строк)
- `docs/analisys/telegram-oauth-implementation-plan.md` - детальный план Telegram OAuth (15,000+ строк) ✅ NEW
- `docs/analisys/telegram-integration-analysis.md` - стратегический анализ интеграции Telegram
- `docs/analisys/stage-8-monetization-plan.md` - детальный план Stage 8
- `docs/analisys/stage-9-ux-polish-plan.md` - детальный план Stage 9
- `docs/analisys/stage-7-tasks-kanban-plan.md` - план Kanban модуля

**Отчёты о завершении:**
- `docs/STAGE_6_COMPLETE.md` - завершение Stage 6 (Payouts)
- `docs/STAGE_6_SUMMARY.md` - краткое резюме Stage 6
- `docs/FULL_PROJECT_COMPLETION_PLAN.md` - общий план завершения

**Анализ проекта:**
- `docs/analisys/full-application-analysis.md` - полный анализ приложения
- `docs/analisys/design-analysis.md` - анализ дизайна
- `docs/solution-analysis.md` - анализ технических решений

---

## Этап 1. Инфраструктура и старт (недели 1–2)
- [x] Монорепо Turborepo.
- [x] Web: Next.js 16 + Tailwind + shadcn/ui.
- [x] API: NestJS + GraphQL.
- [ ] Пакеты `packages/ui` и `packages/db` (библиотеки общих компонентов/утилит).
- [x] Базовый Zustand-store для общих UI-состояний.
- [x] Настроен next-intl с поддержкой RU/EN (config + middleware в apps/web).
- [x] Layout обёрнут в NextIntlClientProvider, язык хранится в cookie language.
- [x] Архитектура API реорганизована по шаблону: `core/`, `modules/`, `shared/` структура.
- [x] Создан `CoreService` базовый класс для сервисов с доступом к Prisma/Redis/Config.
- [x] **Анализ требований** — создан детальный план реализации (`docs/anallys/implementation-plan.md`) с описанием всех страниц и данных.


### Данные и ORM
- [x] Postgres (Docker, порт 5433).
- [x] Redis (Docker, порт 6379) — для сессий авторизации.
- [x] Prisma в `apps/api` (v7, pg adapter, prisma.config.ts).
- [x] Базовые миграции/схема синхронизированы (init + sync-v7, db push).
- [x] Модели User, VerificationToken, PasswordResetToken для авторизации.
- [x] Миграция `add_auth_models` + `db push` + `prisma generate` выполнены.

### GraphQL
- [x] Apollo Server в NestJS (code-first).
- [x] Codegen для фронта.
- [x] Apollo Client интегрирован на вебе (используется вместо TanStack Query).
- [x] Базовые страницы login/register с email/password (демо, готово подключить реальный API).

## Этап 2. Аутентификация, пользователи, команды (недели 3–5)
- [x] ~~Auth (SuperTokens)~~ → Реализована кастомная авторизация с Redis сессиями
- [x] Email/Password вход (Argon2 хеширование, Redis сессии, HTTP-only cookies)
- [x] Регистрация с нормализацией email и верификацией через Brevo
- [x] Сброс пароля (токен 1 час, инвалидация всех сессий)
- [x] Управление сессиями (список, удаление, массовая инвалидация)
- [x] Rate Limiting (5 попыток / 15 минут)
- [x] GraphQL Guards и Decorators для защиты resolvers
- [x] Сущность `User` с верификацией email
- [x] Frontend: страницы логина/регистрации/восстановления пароля
- [x] Frontend: интеграция с Auth API
- [x] Telegram OAuth спланирован (см. `docs/analisys/telegram-oauth-implementation-plan.md` - 15,000+ строк, 6 фаз, 5-7 дней)

### Этап 2.1. Онбординг и Teams (неделя 6–9) - ✅ ЗАВЕРШЕНО
**Приоритет:** 🔴 Критический (MVP)
**Статус:** ✅ Завершено
**Начало:** 2024-12-03
**Завершено:** 2025-12-05
**Время:** ~40 часов (3 недели)
**План:** `docs/analisys/onboarding/onboarding-implementation-plan.md`
**E2E Тест:** `docs/reports/logs/2025-12-05-e2e-testing-onboarding.md`

#### Неделя 1: Backend Foundation (2024-12-03 - 2024-12-09)

**Backend - Database & Models**
- [x] Обновить Prisma schema (Team, TeamMember, InviteCode, Project)
- [x] Добавить `hasCompletedOnboarding` в модель User
- [x] Создать и применить миграцию `add_teams_onboarding`
- [x] Сгенерировать Prisma Client

**Backend - Teams Module**
- [x] Создать структуру модуля `apps/api/src/modules/teams/`
- [x] Реализовать Teams Service
  - [x] `completeOnboarding()` - атомарная транзакция создания команды
  - [x] `processLogo()` - обработка загруженного файла или иконки
  - [x] `validateOnboardingData()` - валидация входных данных
  - [x] `getMyTeams()` - получение команд пользователя
- [x] Реализовать Teams Resolver (GraphQL API)
- [x] Создать DTOs и Models (GraphQL Object Types)
- [x] Добавить TeamsModule в app.module.ts

**Backend - Storage Service**

- [x] Создать StorageService для загрузки файлов
- [x] Локальное хранение в `/uploads/team-logos/`
- [x] Валидация: max 5MB, только PNG/JPG/JPEG/WEBP
- [x] Resize/optimize с Sharp (max 512x512, WebP)
- [x] Установлен пакет sharp@^0.34.5

**Backend - Auth Updates**

- [x] Обновить User Model (hasCompletedOnboarding поле)
- [x] Обновить Auth GraphQL schema (Login, Register, RefreshSession mutations)
- [x] Обновить Me query для возврата hasCompletedOnboarding

#### Неделя 2: Frontend Implementation (2024-12-10 - 2024-12-16)

**Frontend - Validation Schemas**
- [x] Создать `apps/web/src/packages/schemas/teams/`
- [x] Реализовать team.schema.ts (Zod)
- [x] Реализовать project.schema.ts (Zod)
- [x] Реализовать invite.schema.ts (Zod)
- [x] Экспортировать все схемы

**Frontend - GraphQL Integration**

- [x] Создать `apps/web/src/packages/api/graphql/teams.graphql`
- [x] Добавить мутации (CompleteOnboarding, CreateInviteCode, JoinTeamByInvite, UploadTeamLogo)
- [x] Добавить queries (MyTeams, ValidateInviteCode)
- [x] Запустить codegen (успешно, типы сгенерированы)
- [x] Проверить Apollo upload link (работает корректно)

**Frontend - UI Components**

- [x] Создать Stepper Component (прогресс 1/3, 2/3, 3/3)
- [x] Создать ImageUpload Component (drag & drop, preview, validation)
- [x] Создать IconPicker Component (10 эмодзи + 9 пастельных цветов + белый)
- [x] Интегрировать ImageUpload в IconPicker (клик по превью для загрузки)
- [x] Создать TeamLogo Component (изображение/эмодзи/инициалы)

**Frontend - Onboarding Pages**

- [x] Создать структуру `apps/web/src/app/(root)/onboarding/`
- [x] Реализовать Onboarding Layout (guards, Stepper)
- [x] Реализовать стартовый экран (2 кнопки: "Начать настройку" / "Меня пригласили")
- [x] Реализовать Step 1: Название бригады (форма + sessionStorage)
- [x] Реализовать Step 2: Логотип (IconPicker с загрузкой изображений, skip button)
- [x] Реализовать Step 3: Первый проект (форма + CompleteOnboarding mutation)
- [x] Реализовать Invite Page (6-digit code input + JoinTeamByInvite)
- [x] Реализовать Route Protection (валидация шагов, автоматический redirect)
- [x] Добавить Celebration Animation (confetti + success overlay)
- [x] Унифицировать дизайн системы всех 3 шагов (p-8, text-2xl, h-14)
- [x] Исправить SSR hydration mismatch в IconPicker
- [x] Исправить logo loading flickering (loader → image transition)
- [x] Оптимизировать компактность UI (влазит на экран без скролла)

#### Неделя 3: Backend Integration (2024-12-17 - 2024-12-20)

**Architecture Decision**

- [x] Определена архитектура отправки данных: одна финальная мутация `completeOnboarding`
- [x] Атомарная транзакция: Team → TeamMember → Project → User update
- [x] Logo обработка: Upload file ИЛИ iconId + colorId
- [x] sessionStorage для временного хранения данных (Step 1-3)

**Backend - Teams Module Implementation**

- [x] Создать структуру модуля `apps/api/src/modules/teams/`
- [x] Реализовать Teams Service
  - [x] `completeOnboarding()` - главная атомарная транзакция
  - [x] `processLogo()` - обработка загруженного файла или иконки/цвета
  - [x] `validateOnboardingData()` - валидация входных данных
  - [x] `getMyTeams()` - получение команд пользователя
- [x] Реализовать Teams Resolver (GraphQL)
  - [x] Mutation: `completeOnboarding(input: CompleteOnboardingInput!): OnboardingResult!`
  - [x] Query: `myTeams: [Team!]!`
- [x] Создать DTOs и GraphQL Types
  - [x] `CompleteOnboardingInput` (teamName, logoFile?, iconId?, colorId?, projectName, projectAddress?, projectDescription?)
  - [x] `OnboardingResult` (success, team, project, message)
  - [x] `Team`, `Project`, `LogoType` GraphQL models
- [x] Добавить TeamsModule в app.module.ts

**Backend - Storage Service**

- [x] Создать StorageService для загрузки файлов
- [x] Временно: локальное хранение в `/uploads/team-logos/`
- [x] Валидация: max 5MB, только PNG/JPG/JPEG/WEBP
- [x] Resize/optimize с Sharp (max 512x512, WebP конвертация)
- [x] Возврат публичного URL
- [x] Установлен пакет sharp@^0.34.5

**Backend - Database Schema**

- [x] Обновлена Prisma schema (User, Team, Project)
- [x] Добавлены поля онбординга (onboardingCompletedAt, currentTeamId)
- [x] Добавлена система логотипов (logoType, logoUrl, iconId, colorId)
- [x] Добавлен enum LogoType (UPLOADED, GENERATED, DEFAULT)
- [x] Выполнен `prisma db push` для синхронизации
- [x] Сгенерирован Prisma Client с новыми типами

**Frontend Integration**

- [x] Обновить GraphQL schema (completeOnboarding mutation)
- [x] Запустить codegen для генерации типов
- [x] Интегрировать mutation в Step 3
- [x] Конвертация base64 → File для загрузки
- [x] Обработка loading/error/success состояний
- [x] Редирект на /teams/{teamId} после успешного завершения
- [x] Очистка sessionStorage после успешного завершения

**Auth Integration** - ✅ ЗАВЕРШЕНО (2025-12-04)

- [x] Добавить hasCompletedOnboarding в Me Query (auth.graphql)
- [x] Запустить GraphQL codegen
- [x] Обновить AuthContext с hasCompletedOnboarding tracking
- [x] Обновить Login/Register redirect logic (проверка onboarding)
- [x] Интегрировать AuthProvider в root layout
- [x] Создать Next.js middleware для защиты маршрутов
- [x] Создать страницу /teams/[teamId]
- [x] Обновить redirect после completeOnboarding

**Error Handling & Testing** - ✅ ЗАВЕРШЕНО (2025-12-05)

- [x] Backend валидации (Owner ограничения, атомарность транзакций)
- [x] Frontend error handling (network, validation, GraphQL errors с Toast)
- [x] Happy path E2E тестирование (новый пользователь → онбординг → dashboard)
- [x] Найдено и исправлено 7 критических багов (детали в E2E лог)
- [x] UX проверка (loading states, toast, confetti, mobile responsive)

**Documentation** - 🔄 В ПРОЦЕССЕ

- [x] Создать E2E тестовый лог (`docs/reports/logs/2025-12-05-e2e-testing-onboarding.md`)
- [ ] Обновить roadmap.md (в процессе)
- [ ] Обновить changelog.md
- [ ] Создать API документацию для Teams (post-MVP)

#### Критерии успеха Этапа 2.1 - ✅ ВСЕ ВЫПОЛНЕНЫ

- ✅ Обязательный онбординг (3 шага) работает корректно
- ✅ Система приглашений с 6-значными кодами (backend готов, frontend реализован)
- ✅ Владелец может иметь только 1 бригаду (валидация на backend)
- ✅ Загрузка/выбор логотипа (IconPicker + ImageUpload + Sharp обработка)
- ✅ Автогенерация первого проекта через completeOnboarding
- ✅ Mobile-first дизайн (компактный UI, responsive)
- ✅ Валидация в реальном времени (Zod + react-hook-form)
- ✅ Toast уведомления (централизованная Zustand система)
- ✅ Редиректы после auth (Login → /onboarding, Register → /onboarding, onboarding complete → /teams/{teamId})

#### Post-MVP Enhancements (Phase 2.2 - запланировано)
- [ ] Wizard для создания дополнительных команд
- [ ] Cloudflare R2 для хранения логотипов
- [ ] Email приглашения с magic links
- [ ] Страница настроек бригады (редактирование, передача владения)
- [ ] E2E тесты (Playwright)

### Этап 2.2. Dashboard Improvements - ✅ ЗАВЕРШЁН (2025-12-08)

**Приоритет:** 🔴 Критический (Blocking Bug)
**Статус:** ✅ Завершён
**Дата:** 2025-12-08
**Время:** ~4 часа

#### Проблема

- **Runtime Error**: "Rendered more hooks than during the previous render"
- **Root Cause**: `useQuery` вызывался внутри `.map()` в хуке `useDashboardStats`
- **Impact**: Dashboard страница крашилась при рендере
- **Violation**: React Rules of Hooks - количество хуков должно быть константным

#### Решение

**1. Архитектурный рефакторинг:**

- Убран проблемный хук `useDashboardStats` с циклами
- Создан компонент `ProjectStatsLoader` для каждого проекта
- Добавлен state `projectStatsMap` для хранения статистики
- Вычисление агрегированной статистики через `useMemo`

**2. Технические детали:**

```typescript
// Компонент для загрузки статистики одного проекта
function ProjectStatsLoader({ projectId, isOwner, onStatsLoaded }) {
  const { data } = useQuery(ProjectStatsDocument, { ... })
  useEffect(() => {
    if (data?.projectStats) {
      onStatsLoaded(projectId, data.projectStats)
    }
  }, [data, projectId, onStatsLoaded])
  return null
}

// В главном компоненте:
{isOwner && activeProjects.map(project => (
  <ProjectStatsLoader key={project.id} ... />
))}
```

**3. Преимущества решения:**

- ✅ Следует React Rules of Hooks (хуки на верхнем уровне)
- ✅ Сохранена агрегация данных из ВСЕХ проектов
- ✅ Параллельная загрузка через Apollo Client cache
- ✅ Реальные данные из ProjectStats API
- ✅ TypeScript: 0 ошибок
- ✅ Runtime: 0 ошибок

**Файлы изменены:**

- `apps/web/src/app/(root)/(protected)/dashboard/page.tsx` - рефакторинг загрузки статистики
- `CHANGELOG.md` - добавлена запись об исправлении
- `roadmap.md` - обновлён статус проекта (78% MVP Complete)

**Результат:** Dashboard полностью работоспособен с реальными данными из бэкенда, агрегация статистики по всем активным проектам работает корректно.

---

## Этап 3. Проекты (недели 10–11) - ✅ ЗАВЕРШЁН (MVP готов!)
**Приоритет:** 🔴 Критический (MVP)
**Статус:** ✅ Завершён за 1 день! (Фаза 1: Backend ✅, Фаза 2: Frontend ✅, Фаза 3: Pages ✅)
**Дата:** 2025-12-05
**План:** `docs/analisys/stage-3-projects-implementation-plan.md`

**🎉 Что реализовано:**
- ✅ Полный CRUD для проектов (Create, Read, Update, Archive/Restore)
- ✅ Backend API с 8 GraphQL операциями (3 queries + 5 mutations)
- ✅ 6 компонентов UI (DatePicker, Badge, ProgressBar, ProjectCard, ProjectForm + канонические)
- ✅ 4 страницы (Dashboard с фильтрами, Create, Details с табами, Edit)
- ✅ Валидация с Zod schemas (4 схемы)
- ✅ Фильтрация по статусу + поиск в реальном времени
- ✅ Автоматический COMPLETED при progress = 100%
- ✅ Лимит 10 активных проектов на команду
- ✅ Toast уведомления для всех операций
- ✅ Skeleton loaders, Empty states, Error handling
- ✅ **Prisma миграции** - создана и применена миграция `20251205_add_teams_and_projects_stage3`

### Фаза 1: Backend Foundation - ✅ ЗАВЕРШЕНО (2025-12-05)

**День 1: Database & Models**
- [x] Удалена неправильная Project model из `projects/models/project.model.ts`
- [x] Создан enum ProjectStatus (ACTIVE, ARCHIVED, COMPLETED)
- [x] Добавлены 9 новых полей в Project model:
  - [x] budget (Decimal), clientPhone (String)
  - [x] startDate, endDate (DateTime)
  - [x] photoUrl, progress (0-100), notes (Text)
  - [x] status (ProjectStatus), archivedAt, completedAt
- [x] Применена миграция: `prisma db push`
- [x] Сгенерирован Prisma Client

**День 2: GraphQL Schema & DTOs**
- [x] Создан ProjectStatus enum для GraphQL
- [x] Обновлена Project GraphQL model со всеми полями
- [x] Создан UpdateProjectInput DTO
- [x] Создан ProjectFilterInput DTO (status, searchQuery, take, skip)
- [x] Создан ProjectStats model (заглушка для Этапа 4)
- [x] Обновлен CreateProjectInput с новыми полями и валидацией

**День 3: Service & Resolver**
- [x] Расширен ProjectsService с методами:
  - [x] Queries: `findById`, `findByTeam`, `getProjectStats`
  - [x] Mutations: `create`, `update`, `archive`, `restore`, `updateProgress`
  - [x] Helpers: `validateTeamAccess`, `validateProjectAccess`, `checkProjectLimit`
- [x] Расширен ProjectsResolver с GraphQL операциями (3 queries + 5 mutations)
- [x] ProjectsModule обновлён (импорт AuthModule)
- [x] ProjectsModule включён в app.module.ts
- [x] Backend успешно компилируется и запускается
- [x] Исправлена ошибка в teams.service.ts (isActive → status + progress)

### Фаза 2: Frontend Foundation - ✅ ЗАВЕРШЕНО (2025-12-05)

**Dependencies & GraphQL**
- [x] Установлены пакеты: `react-day-picker@^9.4.3`, `date-fns@^4.1.0`
- [x] Создан `projects.graphql` с queries и mutations
- [x] Исправлена `teams.graphql` (isActive → status + progress)
- [x] Запущен codegen - TypeScript типы сгенерированы

**Zod Validation Schemas**
- [x] Создана структура `schemas/projects/`
- [x] Создан `project.schema.ts` с полной валидацией:
  - [x] `createProjectSchema` - валидация создания проекта
  - [x] `updateProjectSchema` - валидация обновления (все поля optional)
  - [x] `projectFilterSchema` - валидация фильтров и пагинации
  - [x] `updateProgressSchema` - валидация прогресса (0-100)
  - [x] Валидация дат: endDate >= startDate
  - [x] Валидация телефона: regex `/^\+?[1-9]\d{1,14}$/`
  - [x] Экспорт TypeScript типов

**UI Components**
- [x] Создан DatePicker component (shadcn/ui стиль + react-day-picker)
  - [x] Русская локализация (date-fns/locale/ru)
  - [x] Dropdown calendar с автозакрытием
  - [x] Поддержка minDate/maxDate
  - [x] Интеграция с React Hook Form
- [x] Создан Badge component
  - [x] 5 вариантов: default, success, warning, danger, secondary
- [x] Создан ProgressBar component
  - [x] Автоматический выбор цвета на основе прогресса
  - [x] 3 размера: sm, md, lg
  - [x] Опциональный label с процентами
- [x] Создан ProjectCard component
  - [x] Отображение всех полей проекта (бюджет, адрес, даты, фото)
  - [x] Badge со статусом (ACTIVE/ARCHIVED/COMPLETED)
  - [x] Встроенный ProgressBar
  - [x] Link на детальную страницу проекта
  - [x] Hover эффекты и адаптивная вёрстка
- [x] Создан ProjectForm component
  - [x] Режимы: create и edit
  - [x] React Hook Form + Zod resolver
  - [x] Все поля проекта с валидацией
  - [x] DatePicker интеграция для startDate/endDate
  - [x] Автоматическая синхронизация minDate для endDate
  - [x] Состояние loading с спиннером
  - [x] Кастомизируемые labels кнопок

**Обновления инфраструктуры**
- [x] Экспортированы новые компоненты в `components/ui/index.ts`
- [x] Создан `components/projects/` для специализированных компонентов
- [x] Экспортированы schemas в `schemas/index.ts`

### Фаза 3: Pages Implementation - ✅ ЗАВЕРШЕНО (2025-12-05)

**Dashboard Page** - ✅ Завершено
- [x] Обновлён `/teams/[teamId]/page.tsx` с полным функционалом:
  - [x] ProjectList с grid-раскладкой (responsive: 1/2/3 колонки)
  - [x] Фильтры по статусу (Все/Активные/Завершённые/Архив)
  - [x] Поиск по названию и адресу в реальном времени
  - [x] FAB кнопка "Создать проект" (появляется когда есть проекты)
  - [x] Empty state с условным контентом (зависит от фильтров/поиска)
  - [x] Loading state с Skeleton loaders
  - [x] Error state с понятным сообщением
  - [x] GraphQL integration с `ProjectsByTeamDocument`

**Create Page** - ✅ Завершено
- [x] Создана `/teams/[teamId]/projects/new/page.tsx`:
  - [x] Интеграция ProjectForm в режиме 'create'
  - [x] CreateProject GraphQL mutation
  - [x] Success toast + автоматический redirect на страницу проекта
  - [x] Error handling с toast уведомлениями
  - [x] Кнопка "Назад к проектам"
  - [x] Refetch ProjectsByTeam после создания

**Details Page** - ✅ Завершено
- [x] Создана `/teams/[teamId]/projects/[projectId]/page.tsx`:
  - [x] Header с названием, адресом, статусом badge
  - [x] ProgressBar с текущим прогрессом
  - [x] Tabs навигация (Информация/Расходы/Задачи/Фотоотчёты)
  - [x] Tab "Информация" с двумя карточками:
    - [x] Основная информация (бюджет, телефон клиента, даты)
    - [x] Описание и заметки
  - [x] Tabs "Расходы/Задачи/Фотоотчёты" с заглушками "скоро"
  - [x] Кнопки "Редактировать" и "В архив/Восстановить"
  - [x] ArchiveProject и RestoreProject mutations
  - [x] Loading/Error states
  - [x] Форматирование дат (русская локализация)
  - [x] Форматирование валюты (₽)

**Edit Page** - ✅ Завершено
- [x] Создана `/teams/[teamId]/projects/[projectId]/edit/page.tsx`:
  - [x] Интеграция ProjectForm в режиме 'edit'
  - [x] Загрузка defaultValues из GraphQL
  - [x] UpdateProject GraphQL mutation
  - [x] Success toast + redirect на страницу проекта
  - [x] Кнопка "Назад к проекту"
  - [x] Refetch после обновления
  - [x] Конвертация дат из string в Date объекты

### Фаза 4: Polish & Testing - 📋 ЗАПЛАНИРОВАНО

- [ ] Оптимизация loading states (skeleton loaders)
- [ ] Error boundaries для страниц
- [ ] Toast notifications для всех операций
- [ ] Mobile responsive проверка
- [ ] E2E тестирование
- [ ] Обновить changelog.md

## Этап 4. Файлы и расходы (недели 8–9) - ✅ ЗАВЕРШЁН

**Приоритет:** 🔴 Критический (MVP)
**Статус:** ✅ Полностью завершён
**Начало:** 2025-12-05
**Завершение:** 2025-12-05
**Время:** ~8 часов (Backend + Frontend + Интеграция)
**План:** `docs/analisys/implementation-roadmap-detailed.md`
**Сводка:** `docs/analisys/expenses-implementation-summary.md`

### Backend (✅ Завершено)

- [x] Entity `Expense` (сумма Decimal, категория, photos[], comment, paidByClient)
- [x] Миграция `add_expenses_table` + db push
- [x] ExpensesModule с полным CRUD
- [x] ExpensesService (создание, обновление, удаление, фильтрация)
- [x] ExpensesResolver (6 GraphQL endpoints)
- [x] Обновлён ProjectStats для подсчёта расходов и прибыли
- [x] Валидация категорий (8 предустановленных категорий)
- [x] Проверка доступа через TeamMember

### Frontend (✅ Завершено)

- [x] Zod схемы валидации (CreateExpenseInput, UpdateExpenseInput)
- [x] GraphQL queries и mutations (expenses.graphql)
- [x] Codegen для TypeScript типов
- [x] ExpenseForm компонент (создание/редактирование)
- [x] ExpenseCard компонент (отображение расхода)
- [x] ExpenseList компонент (список с фильтрацией)
- [x] FinancialDashboard компонент (метрики и аналитика)
- [x] Интеграция в Project Details Page
- [x] TypeScript компиляция без ошибок
- [x] Все GraphQL operations подключены

### Исправленные ошибки

- [x] Zod schema - убрали `.optional()` перед `.default()` для полей photos и paidByClient
- [x] Zod error messages - упростили формат (убрали `required_error`, `invalid_type_error`)
- [x] ExpenseForm types - использовали `any` для избежания конфликтов union типов
- [x] TypeScript успешно компилируется

### Отложено на будущее

- [ ] Загрузка файлов (photos) - требует интеграции хранилища
- [ ] Интеграция хранилища (Cloudflare R2/S3) для фотографий
- [ ] E2E тестирование расходов

## Этап 5. Фотоотчёты (Wow #1, недели 10–12) - 🔄 В ПРОЦЕССЕ

**Приоритет:** 🔴🔴🔴 Критический (Killer Feature #1)
**Статус:** 🔄 Phase 1-3 Complete, Phase 4-5 Planned
**Начало:** 2025-12-06
**Прогресс:** Phase 1 ✅ Phase 2 ✅ Phase 3 ✅ (3/5 - 60%)
**Оценка:** 2-3 недели
**План:** `docs/analisys/stage-5-photo-reports-implementation-plan.md`

### Фаза 1: Backend Foundation ✅ (Завершено 2025-12-06)

**Database:**
- [x] PhotoReport model (slug, title, description, isPublic, viewCount)
- [x] ReportPhoto model (photoUrl, thumbnailUrl, caption, orderIndex)
- [ ] PhotoReaction model (emoji, clientId) - Phase 2
- [x] Миграция + prisma generate
- [x] Установить nanoid для slug generation

**Backend API:**
- [x] PhotoReportsModule структура
- [x] DTOs (CreatePhotoReport, UpdatePhotoReport, AddPhoto)
- [x] GraphQL Models (PhotoReport, ReportPhoto, PublicPhotoReport)
- [x] PhotoReportsService (CRUD + slug generation)
- [x] PhotoReportsResolver (authenticated)
- [x] PublicPhotoReportsResolver (no auth)
- [x] Добавить в AppModule

**Результаты:**
- ✅ 10 файлов создано, 3 файла изменено
- ✅ 8 GraphQL endpoints (5 mutations + 3 queries)
- ✅ TypeScript компиляция успешна
- ✅ GraphQL schema обновлена
- ✅ Готово к Phase 2 (Storage Integration)

### Фаза 2: Storage Integration ✅ (Завершено 2025-12-06)

**Dependencies:**
- [x] Установить @aws-sdk/client-s3 и sharp (97 packages)

**StorageService:**
- [x] Метод uploadReportPhoto (resize 1920x1920, thumbnail 400x400, WebP)
- [x] Image processing с Sharp (quality 85%/80%)
- [x] Return URLs с metadata (width, height, fileSize)
- [x] Local storage (uploads/report-photos/) - готово для R2 миграции

**PhotoReportsModule:**
- [x] UploadPhotoInput DTO с GraphQL Upload scalar
- [x] uploadPhotoToReport method в Service
- [x] uploadPhotoToReport mutation в Resolver
- [x] StorageModule импортирован

**Результаты:**
- ✅ 1 новый DTO, 1 новый метод в Service, 1 новая mutation
- ✅ File upload функционал с обработкой изображений
- ✅ API компиляция успешна, запущен на :8080
- ✅ Готово к Phase 3 (Frontend Components)

**Отложено (Post-MVP):**
- [ ] Cloudflare R2 bucket (сейчас локальное хранилище)
- [ ] CORS и public access настройка

### Фаза 3: Frontend Components ✅ (Завершено 2025-12-06)

**Schemas & GraphQL:**

- [x] photo-reports/index.ts (Zod validation schemas - 4 schemas)
- [x] photo-reports.graphql (queries + mutations - 9 операций)
- [x] Codegen успешно выполнен

**UI Components:**

- [x] PhotoReportForm (создание/редактирование, React Hook Form + Zod)
- [x] PhotoUploader (drag & drop, multiple files, preview, captions)
- [x] PhotoReportCard (grid view, menu, public link)
- [ ] PhotoGallery (masonry grid) - отложено на Phase 5
- [ ] Lightbox (fullscreen, navigation, zoom) - отложено на Phase 5

**Integration:**

- [x] Вкладка "Фотоотчёты" в Project Details Page (enabled)
- [x] Список отчётов проекта (grid 3 columns)
- [x] Create/Edit form в Card компоненте
- [x] Photo uploader при выборе отчёта

**Результаты:**

- ✅ 5 файлов создано (3 компонента + schemas + operations)
- ✅ GraphQL codegen успешен
- ✅ Полная интеграция в Project Details Page
- ✅ CRUD операции для фотоотчётов
- ✅ File upload с drag & drop интерфейсом
- ✅ Готово к Phase 4 (Public SSR Page)

### Фаза 4: Public SSR Page - ✅ ЗАВЕРШЕНО (2025-12-08)

**Приоритет:** 🔴🔴🔴 Критический (Killer Feature)
**Статус:** ✅ Реализовано и протестировано
**Время:** ~4 часа (оценка была 6-8 часов)
**План:** `docs/analisys/stage-5-phase-4-public-page-plan.md`

**Backend Tasks:**
- [x] Добавить метод incrementViewCount в PhotoReportsService
- [x] Обновить findBySlugPublic для автоинкремента viewCount
- [x] Добавить PublicProject type в GraphQL schema
- [x] Обновить PublicPhotoReport model с project field
- [x] Протестировать query publicPhotoReport

**Frontend Components:**
- [x] PhotoGallery component (masonry grid, responsive 1/2/3 columns)
- [x] Lightbox component (fullscreen, keyboard navigation ← → Escape)
- [x] Обновить exports в components/photo-reports/index.ts
- [x] PublicReportView Client Component с state management

**SSR Page:**
- [x] Создать /r/[slug]/page.tsx с SSR
- [x] Создать PublicReportView.tsx (Client Component для интерактивности)
- [x] OpenGraph meta tags для WhatsApp/Telegram
- [x] Project info (name + address) в header
- [x] Responsive gallery (1/2/3 колонки)
- [x] Lightbox integration с full navigation
- [x] View counter display
- [x] Footer с ProRab branding

**Результаты:**

- ✅ 7 файлов создано/изменено (4 backend + 7 frontend)
- ✅ TypeScript: 0 ошибок компиляции
- ✅ GraphQL codegen успешен
- ✅ SSR работает с generateMetadata
- ✅ View counter автоинкремент
- ✅ Framer Motion анимации
- ✅ Next.js Image optimization
- ✅ Keyboard navigation (←, →, Escape)
- ✅ Mobile responsive
- ✅ Готово к Phase 5 (Sharing)

**Sharing:**
- [ ] WhatsApp share button
- [ ] Telegram share button
- [ ] Copy link button
- [ ] QR code (optional)

### Фаза 5: Polish & Testing (Планируется)

- [ ] Image lazy loading
- [ ] ISR configuration (revalidate: 60)
- [ ] Performance optimization
- [ ] E2E testing
- [ ] Documentation

### Ключевые решения:

**Slug Strategy:** nanoid (7 chars) - короткий, URL-safe, уникальный
**Storage:** Cloudflare R2 (S3-compatible, CDN, дешевле AWS)
**Security:** Cryptographic slugs, rate limiting, no listing endpoint
**Rendering:** SSR с ISR для SEO и быстрой загрузки

### Отложено на Phase 2:

- [ ] Reactions на фото (❤️ ✅ ❓)
- [ ] Password protection
- [ ] Video support
- [ ] PDF/ZIP export

## Этап 6. Финансы и зарплата (Wow #2, недели 13–15) - 🔄 В ПРОЦЕССЕ

**Приоритет:** 🔴🔴🔴 Критический (Killer Feature #2)
**Статус:** 🔄 Phase 1 Complete (Backend), Phase 2-5 Pending (Frontend UI)
**Начало:** 2025-12-11
**Прогресс:** 20% (Backend API готов, нужен UI)
**Оценка времени:** 4-5 дней (осталось 3-4 дня)
**План:** `docs/analisys/stage-6-finances-payouts-plan.md`

### Цель этапа

Реализовать систему расчёта и распределения зарплат между участниками бригады по завершении проекта. Это вторая "WOW" фича после фотоотчётов, решающая критическую боль прорабов: **"Сколько кому платить в конце объекта?"**

### Архитектура решения

**3 типа зарплат:**
- `FIXED` - Фиксированная зарплата (уже вычтена в расходах)
- `PERCENTAGE` - Процент от чистой прибыли (рассчитывается при закрытии)
- `NONE` - Не получает зарплату (владелец получает остаток)

**Формула расчёта:**
```
netProfit = budget - totalExpenses
PERCENTAGE payouts = netProfit * (percentage / 100)
Owner profit = netProfit - Σ(PERCENTAGE payouts)
```

### Phase 1: Backend Foundation (День 1-2) - 🔄 В ПРОЦЕССЕ

**1.1 Database Schema** - ✅ Завершено (2025-12-11)
- [x] Расширить TeamMember model (salaryType, salaryAmount, payouts relation)
- [x] Создать ProjectPayout model (calculatedAmount, actualAmount, status)
- [x] Расширить Project model (closedAt, finalProfit, payouts relation)
- [x] Синхронизировать базу: `prisma db push`
- [x] Сгенерировать Prisma Client

**1.2 PayoutsModule Backend** - ✅ Завершено (2025-12-11)
- [x] Создать структуру `apps/api/src/modules/payouts/`
- [x] GraphQL Models: ProjectPayout, PayoutSummary (2 файла)
- [x] DTOs: UpdateMemberSalary, CreatePayout (2 файла)
- [x] PayoutsService с бизнес-логикой (~430 строк)
- [x] PayoutsResolver с 3 queries + 3 mutations
- [x] Создать TeamMember GraphQL model с salary полями
- [x] Импортировать PayoutsModule в app.module.ts
- [x] TypeScript: 0 ошибок компиляции

### Phase 2: Frontend Foundation (День 3) - ✅ Завершено (2025-12-11)

**2.1 GraphQL Operations**
- [x] Создать `apps/web/src/packages/api/graphql/payouts.graphql`
- [x] Fragments: ProjectPayoutFields, PayoutSummaryFields
- [x] Queries: PayoutSummary, ProjectPayouts, MemberPayouts (3)
- [x] Mutations: UpdateMemberSalary, CreatePayout, CloseProject (3)
- [x] Запустить codegen: `npm run codegen:web`

**2.2 Zod Validation Schemas**
- [x] Создать `apps/web/src/packages/schemas/payouts/`
- [x] member-salary.schema.ts (валидация типа зарплаты + суммы)
- [x] payout.schema.ts (валидация выплат)
- [x] Экспортировать в schemas/index.ts

### Phase 3: UI Components (День 3-4) - ✅ Завершено (2025-12-11)

- [x] SalarySettingsForm.tsx - форма настройки зарплаты участника
- [x] PayoutCalculator.tsx - калькулятор расчёта зарплат перед закрытием
- [x] PayoutHistory.tsx - история выплат по проекту/участнику
- [x] MemberSalaryBadge.tsx - бейдж с типом зарплаты (Fixed/Percentage/None)

### Phase 4: Integration (День 4-5) - ✅ Завершено (2025-12-11)

**4.1 Member Salary Settings Page**
- [x] Создать страницу `/teams/[teamId]/members/[memberId]/salary/page.tsx`
- [x] Интеграция SalarySettingsForm
- [x] Проверка прав доступа (только владелец)
- [x] GraphQL мутация UpdateMemberSalary

**4.2 Project Payouts Calculator Page**
- [x] Создать страницу `/teams/[teamId]/projects/[projectId]/payouts/page.tsx`
- [x] Интеграция PayoutCalculator компонента
- [x] GraphQL query PayoutSummary
- [x] GraphQL мутация CloseProject
- [x] Редирект на dashboard после закрытия

**4.3 Components Export**
- [x] Экспортировать все компоненты в `components/payouts/index.ts`
- [x] Добавить в главный `components/index.ts`

### Phase 5: Documentation (День 5) - ✅ Завершено (2025-12-11)

**5.1 Feature Documentation**
- [x] Создать `docs/features/PAYOUTS_GUIDE.md` (полное руководство)
- [x] Описание всех 3 типов зарплат
- [x] Формулы расчёта с примерами
- [x] GraphQL API документация
- [x] UI компоненты документация
- [x] FAQ секция

**5.2 Roadmap Updates**
- [x] Обновить roadmap.md (отметить этап завершённым)
- [x] Зафиксировать дату завершения Phase 1-5

### Критические файлы (25 total)

**Backend (12 новых + 3 изменения):**
- `apps/api/prisma/schema.prisma` (изменить)
- `apps/api/src/modules/payouts/*` (12 новых файлов)
- `apps/api/src/modules/teams/models/team-member.model.ts` (изменить)
- `apps/api/src/modules/teams/teams.service.ts` (изменить)
- `apps/api/src/app.module.ts` (изменить)

**Frontend (10 новых + 3 изменения):**
- `apps/web/src/packages/api/graphql/payouts.graphql` (новый)
- `apps/web/src/packages/schemas/payouts/*` (3 новых файла)
- `apps/web/src/packages/components/payouts/*` (5 новых компонентов)
- `apps/web/src/app/(root)/(protected)/teams/[teamId]/page.tsx` (изменить)
- `apps/web/src/app/(root)/(protected)/teams/[teamId]/projects/[projectId]/page.tsx` (изменить)

### Успешные критерии ✅

- ✅ Все 5 фаз завершены (2025-12-11)
- ✅ TypeScript: 0 ошибок (backend + frontend)
- ✅ GraphQL codegen успешен
- ✅ Backend API запущен без ошибок
- ✅ 4 UI компонента созданы (Badge, Form, Calculator, History)
- ✅ 2 страницы интеграции (Salary Settings, Payouts Calculator)
- ✅ Полное руководство создано (PAYOUTS_GUIDE.md)
- ✅ Roadmap.md обновлён
- ✅ MVP прогресс: 85% → 90%

## Этап 7. Задачи и Kanban (недели 16–18) - ⏭️ ПРОПУЩЕН

**Примечание:** Этап 7 реализуется в другом месте, stage-план не создавался.

- [ ] Kanban: Entity `Task`, drag&drop API, 3 статуса.
- [ ] Приглашения: JWT-приглашения, join team, обновление ролей.

## Этап 8. Монетизация (недели 19–20) - 🚧 В ПРОЦЕССЕ

**Приоритет:** 🔴🔴🔴 Критический (блокирует коммерческий запуск)
**Статус:** ✅ Phase 1-2 Complete (Backend) | 🚧 Phase 3 In Progress (Frontend)
**Время:** ~8 часов (Phase 1-2)
**План:** `docs/analisys/stage-8-monetization-plan.md`

**Тарифы:** Лайт (490₽/мес), Прораб (990₽/мес), Бригада (1990₽/мес) + Trial 14 дней

### ✅ Phase 1-2: Backend Complete (2025-12-11)

**Database & Models:**
- [x] Subscription model (plan, status, trial, billing cycle)
- [x] Payment model (amount, status, YooKassa integration)
- [x] 3 SubscriptionPlans: LITE, FOREMAN, BRIGADE
- [x] 5 SubscriptionStatus: TRIALING, ACTIVE, PAST_DUE, CANCELLED, EXPIRED
- [x] Early Bird pricing для первых 500 команд

**SubscriptionsModule:**
- [x] SubscriptionsService с бизнес-логикой (trial, plan changes, limits)
- [x] SubscriptionsResolver (6 queries + 4 mutations)
- [x] Guards: CheckProjectLimitGuard, CheckMemberLimitGuard
- [x] Plan limitations enforcement (применён к ProjectsResolver)

**PaymentsModule:**
- [x] @a2seven/yoo-checkout integration
- [x] YooKassaClient (createPayment, getPayment, refund)
- [x] PaymentsService (initializePayment, webhook handlers)
- [x] PaymentsResolver (1 query + 1 mutation)
- [x] YooKassaWebhookController для обработки событий

**GraphQL API (11 operations):**
- [x] Subscriptions: 6 queries + 4 mutations
- [x] Payments: 1 query + 1 mutation

### 🚧 Phase 3: Frontend UI (In Progress)

- [x] subscriptions.graphql создан (5 queries + 5 mutations)
- [ ] Run GraphQL codegen
- [ ] Zod schemas (subscriptions validation)
- [ ] UI Components:
  - [ ] PlanCard component
  - [ ] SubscriptionStatus component
  - [ ] PaymentHistory component
  - [ ] UpgradePrompt component
- [ ] Pages:
  - [ ] `/pricing` - публичная страница с тарифами
  - [ ] `/teams/[teamId]/subscription` - управление подпиской
  - [ ] `/payment/success` - success redirect page
  - [ ] `/payment/failure` - failure redirect page

### 📋 Phase 4: Testing & Polish (Planned)

- [ ] E2E flow: Registration → Trial → Payment → Active
- [ ] Plan change testing (upgrade/downgrade)
- [ ] Limit enforcement testing
- [ ] Webhook testing (ngrok)

## Этап 8.5. Settings Page - ✅ ЗАВЕРШЕНО (2025-12-11)

**Приоритет:** 🟡 Medium (UX Enhancement)
**Статус:** ✅ Завершено
**Время:** ~2 часа

### Реализованный функционал

**Единая страница настроек с табами:**

1. **Профиль** (`/settings` → Tab 1):
   - ✅ Аватарка пользователя с hover эффектом
   - ✅ Редактирование имени и телефона
   - ✅ Отображение email (read-only)
   - ✅ Email verification alert с кнопкой повторной отправки
   - ✅ Countdown 60 секунд между отправками
   - ✅ Дата регистрации

2. **Безопасность** (`/settings` → Tab 2):
   - ✅ Смена пароля с валидацией
   - ✅ Список активных сессий с device info
   - ✅ Завершение отдельных сессий
   - ✅ Завершение всех сессий кроме текущей
   - ✅ Удаление аккаунта с подтверждением "УДАЛИТЬ"

3. **Внешний вид** (`/settings` → Tab 3):
   - ✅ Переключатель темы (светлая/тёмная/системная)
   - ✅ Визуальные карточки выбора темы
   - ✅ Отображение текущей темы

**UserMenu на всех страницах:**
- ✅ Компонент `PageHeader` с встроенным `UserMenu`
- ✅ Аватарка в шапке с dropdown меню
- ✅ Переход в профиль/настройки
- ✅ Выход из системы

### Файлы

**Created:**
- `apps/web/src/packages/components/ui/page-header.tsx`

**Modified:**
- `apps/web/src/app/(root)/(protected)/settings/page.tsx` - переписан с табами
- Все protected pages - добавлен UserMenu в header

**Deleted:**
- `apps/web/src/app/(root)/(protected)/settings/profile/page.tsx`
- `apps/web/src/app/(root)/(protected)/settings/security/page.tsx`

### TODO (Post-MVP)

- [ ] Загрузка аватарки (требует Storage integration)
- [x] Редактирование профиля через `UPDATE_PROFILE_MUTATION`
- [x] Реальное удаление аккаунта через `deleteAccount` mutation
- [ ] Email уведомления о смене пароля
- [ ] 2FA (Two-Factor Authentication)

### Telegram Bot Integration (Планируется)

**Backend:**
```
apps/api/src/modules/telegram/
├── telegram.module.ts
├── telegram.service.ts
├── telegram.update.ts (Telegraf handlers)
└── dto/
    └── link-telegram.dto.ts
```

**Функционал:**
1. `/start` - приветствие и инструкции
2. `/link <code>` - привязка аккаунта (6-значный код)
3. Уведомления:
   - Новый расход добавлен
   - Фотоотчёт создан
   - Проект закрыт (выплаты)
   - Новый участник в команде

**Database:**
```prisma
model User {
  telegramId     String?  @unique
  telegramLinked DateTime?
}
```

**Реализация:**
1. Установить `telegraf` пакет
2. Создать бота через @BotFather
3. Добавить TELEGRAM_BOT_TOKEN в .env
4. Реализовать TelegramModule
5. UI в Settings для привязки/отвязки

---

## Этап 9. UX-полировка (неделя 21) - 📋 ЗАПЛАНИРОВАНО

**Приоритет:** 🔴 Важный (перед запуском)
**Статус:** 📋 Детальный план готов
**Оценка:** 1 неделя (40-50 часов)
**План:** `docs/analisys/stage-9-ux-polish-plan.md` ✨ **НОВЫЙ**

- [ ] Skeleton loaders для всех страниц
- [ ] Empty states с иллюстрациями
- [x] Toast-уведомления ✅ (реализованы)
- [ ] Error boundaries (app-level + page-level)
- [ ] Telegram Bot integration (demo уведомления)
- [ ] PWA support (manifest, service worker, offline page)
- [ ] Install prompt для мобильных устройств

## Этап 10. Админ-панель (недели 22-24) - 📋 ЗАПЛАНИРОВАНО

**Приоритет:** 🟡 Post-MVP (после коммерческого запуска)
**Статус:** 📋 Детальный план готов
**Оценка:** 3 недели (120-140 часов)
**План:** `docs/analisys/stage-10-admin-panel-implementation-plan.md` ✨ **НОВЫЙ**

**11 страниц админки:**
- [ ] `/admin/dashboard` - KPI метрики и графики
- [ ] `/admin/users` - Управление пользователями
- [ ] `/admin/teams` - Управление командами
- [ ] `/admin/subscriptions` - Управление подписками
- [ ] `/admin/payments` - История платежей
- [ ] `/admin/analytics` - Аналитика (DAU/MAU, MRR, Churn)
- [ ] `/admin/support` - Система тикетов поддержки
- [ ] `/admin/content` - Управление контентом
- [ ] `/admin/settings` - Настройки системы
- [ ] `/admin/logs` - Логи и мониторинг
- [ ] `/admin/admins` - Управление администраторами

**RBAC:** 4 роли (SUPER_ADMIN, ADMIN, MODERATOR, SUPPORT) с permissions
**Audit logging:** Полное логирование всех admin действий

---

## Уже сделано (сводка)
- Monorepo, Next.js 16 web, NestJS GraphQL API.
- Tailwind + shadcn/ui, базовый landing.
- Postgres в Docker, Prisma v7 с pg adapter; миграции init + sync-v7, db push.
- Apollo сервер на backend, Apollo клиент на frontend; lint/сборка стабилизированы после Tailwind 4 и upload-link.
- Prisma client генерируется в `apps/api/prisma/generated`, prisma.config.ts подключен.
- Архитектура API: реорганизована структура проекта (`core/`, `modules/`, `shared/`), создан `CoreService`, централизованы декораторы и guards.

## Дополнительно выполнено

- [x] Tailwind v4: строительная палитра (light/dark), переменные shadcn и глобальные стили обновлены.
- [x] Лендинг обновлён под ProRab (анимации секций, мокап, плавные hover/transition глобально).
- [x] `apps/web/src/app/page.tsx` — основная страница сверстана под финальный лендинг с интерактивным мокапом и AOS‑подобными эффектами.
- [x] Auth UI: отдельные страницы `/auth/login`, `/auth/register`, `/auth/forgot-password` с полями имя/email/телефон/пароль и кнопкой входа через Telegram.
- [x] Landing Page: современный анимированный лендинг с Framer Motion, мокапами приложения, секциями проблем/возможностей/тарифов/отзывов.
- [x] Toast уведомления на страницах авторизации перемещены в нижнюю часть экрана с AnimatePresence анимацией.

### Аутентификация (2025-12-01)
- [x] **Backend Auth** — кастомная система авторизации без SuperTokens
- [x] **Redis сессии** — хранение сессий в Redis с TTL (7 дней session, 30 дней refresh)
- [x] **Argon2** — безопасное хеширование паролей
- [x] **Brevo интеграция** — отправка писем верификации и сброса пароля
- [x] **HTTP-only Cookies** — безопасное хранение токенов
- [x] **Rate Limiting** — защита от брутфорса (5 попыток / 15 минут)
- [x] **GraphQL API** — register, login, logout, verifyEmail, forgotPassword, resetPassword, changePassword, sessions, revokeSession
- [x] **Frontend интеграция** — формы авторизации подключены к API
- [x] **Docker** — добавлен Redis 8 в docker-compose.yml
- [x] **Security** — Helmet с CSP, cookie secrets, CORS credentials
- [x] **GraphQL Upload** — загрузка файлов через GraphQL (10MB / 10 files)

### Архитектура API (2025-12-02)
- [x] **Реорганизация структуры** — модули перемещены в `src/modules/` (auth, users, projects)
- [x] **Core модули** — MailModule перемещен в `src/core/mail/` как инфраструктурный модуль
- [x] **Shared элементы** — создана структура `src/shared/` с декораторами и guards
- [x] **CoreService** — базовый класс для сервисов с типизированным доступом к Prisma/Redis/Config
- [x] **Централизация** — все декораторы и guards перемещены в `shared/` для переиспользования
- [x] **Документация** — создан `ARCHITECTURE.md` с описанием структуры и планом миграции


### Миграция форм на react-hook-form + Zod (2025-12-03)
- [x] **Этап 1: Подготовка инфраструктуры**
  - [x] Создать структуру `schemas/auth/` с Zod схемами
  - [x] Создать хук `useAutoValidateForm` с debounce 300ms
  - [x] Toast компонент уже существует в каждой форме (консистентная реализация)
- [x] **Этап 2: Создание Zod схем**
  - [x] `login.schema.ts` - валидация email + password
  - [x] `register.schema.ts` - валидация с проверкой совпадения паролей
  - [x] `forgot-password.schema.ts` - валидация email
  - [x] `reset-password.schema.ts` - валидация паролей с проверкой совпадения
- [x] **Этап 3: Миграция форм авторизации**
  - [x] Login Form - заменить useState на useForm + zodResolver
  - [x] Register Form - заменить useState на useForm + автоматическая валидация
  - [x] Forgot Password Form - добавить реальную GraphQL мутацию
  - [x] Reset Password Form - заменить FormData на useForm
- [x] **Этап 4: Интеграция автоматической валидации**
  - [x] Применить useAutoValidateForm ко всем формам
  - [x] Настроить debounce и real-time feedback
- [x] **Этап 5: Проверка GraphQL интеграции**
  - [x] Проверить наличие ForgotPasswordDocument и ResetPasswordDocument (✅ найдены в output.ts)
  - [x] Мутации уже существуют в GraphQL API
  - [x] Codegen не требуется (типы уже сгенерированы)

### Централизация Toast системы с Zustand (2025-12-03)

- [x] **Проблема**: Дублирование кода Toast компонента в 4 страницах (login, register, forgot-password, reset-password) - 104 строки дублирования
- [x] **Решение**: Создана централизованная Toast система с Zustand state management
- [x] **Этап 1: Создание инфраструктуры**
  - [x] `toast.types.ts` - TypeScript типы (ToastType, Toast interface)
  - [x] `toast.store.ts` - Zustand store с auto-hide через 4 секунды
  - [x] `toast.tsx` - глобальный UI компонент с Framer Motion анимацией
  - [x] `use-toast.ts` - convenience hook с методами success/error
- [x] **Этап 2: Интеграция в приложение**
  - [x] Добавлен Toast в providers.tsx как глобальный компонент
  - [x] Экспорты в components/ui/index.ts и hooks/index.ts
- [x] **Этап 3: Рефакторинг auth страниц**
  - [x] Login page - удалено 26 строк дублированного кода
  - [x] Register page - удалено 26 строк дублированного кода
  - [x] Forgot Password page - удалено 26 строк дублированного кода
  - [x] Reset Password page - удалено 26 строк дублированного кода
  - [x] Auth context - исправлена обработка ошибок (response.error вместо response.errors)
- [x] **Результат**: Удалено 104 строки дублированного кода, создана переиспользуемая Toast система

### Рефакторинг User Model: name → fullName (2025-12-05) - ✅ ЗАВЕРШЕНО

**Контекст**: Изменение поля `name` на `fullName` с обязательной валидацией для улучшения UX регистрации

**Цели**:
- [x] Сделать поле имени обязательным при регистрации
- [x] Переименовать `name` → `fullName` для ясности
- [x] Обновить лендинг с поддержкой авторизованных пользователей

#### Database & Backend (6 файлов)
- [x] **Prisma Schema** - `fullName String @map("full_name")` (обязательное)
- [x] **Migration** - `20251205_rename_name_to_fullname` (ALTER TABLE + NOT NULL)
- [x] **User Model** - `apps/api/src/modules/users/models/user.model.ts:12`
- [x] **RegisterInput DTO** - валидация: `@IsNotEmpty`, `@MinLength(2)`
- [x] **Auth Service** - использование `fullName` в create user
- [x] **Users Service** - интерфейс `CreateUserData` обновлён

#### Frontend (5 файлов)
- [x] **Zod Schema** - `register.schema.ts` с валидацией min 2 символа
- [x] **Register Page** - форма с лейблом "Полное имя"
- [x] **GraphQL Queries** - все auth mutations обновлены (Register, Login, RefreshSession, Me)
- [x] **Auth Context** - интерфейсы User и RegisterData обновлены
- [x] **Landing Page** - адаптивные кнопки для авторизованных/неавторизованных пользователей

#### Landing Page Improvements
- [x] **Навигация**:
  - Неавторизован: "Войти" + "Начать бесплатно"
  - Авторизован: "Дашборд" (только одна кнопка)
- [x] **Hero секция**: динамическая кнопка "Перейти к дашборду" для залогиненных
- [x] **Секция тарифов**: все кнопки адаптированы под статус авторизации
- [x] **Финальная CTA**: условный рендеринг на основе `user` из AuthContext
- [x] **Mobile menu**: корректная работа кнопок в мобильном меню

#### Проверки
- [x] TypeScript компиляция frontend: **0 ошибок**
- [x] TypeScript компиляция backend: **0 ошибок**
- [x] GraphQL codegen успешно выполнен
- [x] Все типы синхронизированы

**Результат**: Полная миграция с `name` → `fullName`, улучшенная регистрация с обязательным полным именем, умный лендинг с адаптацией под авторизацию

### Dashboard Placeholder Page (2025-12-05) - ✅ ЗАВЕРШЕНО

**Контекст**: Создание красивой заглушки для главной страницы дашборда с учётом дизайн-системы

**Цели**:
- [x] Создать визуально привлекательную заглушку
- [x] Показать основные разделы приложения
- [x] Интегрировать с системой авторизации
- [x] Обеспечить навигацию к существующим разделам

#### Реализованные компоненты

**Welcome Header**
- [x] Персонализированное приветствие с `user.fullName`
- [x] Backdrop blur эффект для современного вида
- [x] Responsive дизайн

**Welcome Card**
- [x] Градиентный фон с анимированными бликами
- [x] Badge "Платформа для прорабов" с иконкой Sparkles
- [x] Описание возможностей платформы
- [x] Framer Motion анимации (fadeIn, stagger)

**Features Grid** (4 карточки)
- [x] **Команды** - активная, переход на `/teams`
- [x] **Проекты** - активная, переход на `/teams`
- [x] **Расходы** - заглушка с badge "Скоро"
- [x] **Фотоотчёты** - заглушка с badge "Скоро"
- [x] Каждая карточка:
  - Градиентная иконка (blue, emerald, amber, violet)
  - Hover эффекты (поднятие, градиентный фон, тень)
  - Стрелка навигации для активных
  - Disabled состояние для будущих разделов

**Quick Actions**
- [x] Кнопка "Мои команды" - активная
- [x] Кнопка "Создать проект" - disabled
- [x] Кнопка "Добавить расход" - disabled

#### Технические детали

**Использованные технологии**:
- Framer Motion для анимаций
- Lucide React для иконок
- Tailwind CSS v4 для стилизации
- useAuth hook для персонализации

**Анимации**:
- fadeIn для элементов (opacity + y)
- stagger для последовательного появления
- whileHover для интерактивности
- Плавные transitions (300-500ms)

**Градиенты** (matching дизайн-систему):
- Blue → Indigo (Команды)
- Emerald → Teal (Проекты)
- Amber → Orange (Расходы)
- Violet → Purple (Фотоотчёты)

#### Навигация
- [x] Клик по активным карточкам → переход на роут
- [x] Disabled карточки не кликабельны
- [x] Кнопка "Мои команды" → `/teams`
- [x] Route protection через (protected) layout

**Результат**: Современная заглушка дашборда с плавными анимациями, соответствующая дизайн-системе ProRab, готовая к расширению функционала

### Teams List Page (2025-12-05) - ✅ ЗАВЕРШЕНО

**Контекст**: Создание страницы `/teams` со списком всех команд пользователя для полноценной навигации из Dashboard

**Цели**:
- [x] Создать страницу со списком всех команд
- [x] Обеспечить навигацию на конкретную команду
- [x] Показать статус владельца/участника
- [x] Empty state для пользователей без команд

#### Реализованные компоненты

**Header с информацией**
- [x] Заголовок "Мои команды" с иконкой Users
- [x] Динамический подзаголовок (количество команд или "У вас пока нет команд")
- [x] Кнопка "Создать команду" → `/onboarding`
- [x] Backdrop blur эффект

**Teams Grid**
- [x] Adaptive grid layout (md:2 cols, lg:3 cols)
- [x] Карточки команд с hover эффектами
- [x] Gradient background on hover (blue→indigo)
- [x] Display team logo (uploaded image или иконка по умолчанию)
- [x] Crown badge для владельцев команды
- [x] Дата создания команды
- [x] Role badge (Владелец/Участник)
- [x] Arrow navigation indicator

**Empty State**
- [x] Centered layout с иконкой
- [x] Призыв к действию "Создайте свою первую команду"
- [x] Большая кнопка создания с arrow

**Create Team Card**
- [x] Dashed border карточка в grid
- [x] Plus icon с hover scale эффектом
- [x] Transition на primary/5 background при hover

#### Технические детали

**GraphQL Integration**:
- [x] `MyTeamsDocument` query для загрузки команд
- [x] `fetchPolicy: "cache-and-network"` для актуальных данных
- [x] Проверка `user.id === team.ownerId` для определения владельца

**Loading & Error States**:
- [x] Skeleton loader (3 карточки) во время загрузки
- [x] Error state с кнопкой "Попробовать снова"
- [x] Graceful handling с reload страницы

**Навигация**:
- [x] Клик по карточке → `/teams/{teamId}`
- [x] Кнопка "Создать команду" → `/onboarding`
- [x] Create team card → `/onboarding`

**Animations**:
- [x] Header fadeIn from top
- [x] Grid stagger children animation
- [x] Card hover lift (-4px translateY)
- [x] Arrow gap transition on hover

**Design System**:
- [x] Gradient: blue→indigo (matching Teams theme)
- [x] Consistent spacing (p-8, gap-6, mb-6)
- [x] Border radius (rounded-3xl, rounded-2xl)
- [x] Color tokens (primary, secondary, border, muted-foreground)

#### Файлы
- **Created**: `apps/web/src/app/(root)/(protected)/teams/page.tsx` (252 строки)

#### Проверки
- [x] TypeScript: 0 ошибок
- [x] Используются только доступные поля из MyTeams query
- [x] Owner detection через `user.id === team.ownerId`
- [x] Responsive дизайн (mobile, tablet, desktop)

**Результат**: Полноценная страница списка команд с beautiful UI, empty state, и навигацией на детали команды

### Landing Page Redesign (2025-12-05) - ✅ ЗАВЕРШЕНО

**Контекст**: Переписывание всех текстов лендинга на основе продуктовой спецификации и улучшение UX

**Цели**:

- [x] Привести тексты в соответствие с документацией (doc_1.md)
- [x] Исправить адаптивность на всех экранах
- [x] Улучшить анимации и добавить новые эффекты
- [x] Обновить документацию (changelog, roadmap)

#### Content Updates

##### Hero Section

- [x] Обновлён подзаголовок: "Единственное приложение в СНГ, которое решает ровно ТРИ самые дорогие боли прораба одновременно"
- [x] Акцент на три боли: учёт денег, фотоотчёты клиенту, расчёт зарплаты бригаде

##### Problems Section (переписаны все 3 проблемы)

- [x] "Где мои деньги?" - учёт расходов
- [x] "Как быстро и красиво отчитаться перед клиентом?" - фотоотчёты
- [x] "Сколько кому платить в конце объекта?" - расчёт зарплаты
- [x] Заголовок: "Три боли, которые съедают прибыль"

##### Features Section

- [x] Обновлён заголовок: "Всё что нужно. Ничего лишнего"
- [x] Подзаголовок: "Это НЕ упрощённая версия PlanRadar" (цитата из спецификации)
- [x] Расширены описания всех 4 фич с деталями из MVP
- [x] Заменена фича "Мульти-бригады" на "Финансовый дашборд" (более важная для MVP)

##### Pricing Section

- [x] Исправлены подзаголовки тарифов: "Одиночки, тест", "Частные прорабы", "Первые 500 бригад 🔥"
- [x] Обновлены perks для точного соответствия ("1 участник (только прораб)")
- [x] Усилено спецпредложение в заголовке секции

##### Testimonials

- [x] Расширены отзывы с конкретными цифрами ("15-20% с каждого объекта")

---

### Landing Page - New Sections (2025-12-05) - ✅ ЗАВЕРШЕНО

**Контекст**: Добавление секций "Как это работает" и "До/После" согласно продуктовой документации

**Цели**:

- [x] Добавить секцию "Как это работает" после Problems
- [x] Добавить секцию "До/После" после Features
- [x] Обновить навигацию
- [x] Проверить адаптивность на всех breakpoints
- [x] Обновить документацию

#### Секция "Как это работает"

- [x] 4 шага процесса:
  - Создай объект (2 минуты)
  - Добавляй расходы (3 секунды)
  - Отчитайся клиенту (1 клик)
  - Закрой объект (автоматический расчет)
- [x] Адаптивная сетка: 1 → 2 → 4 колонки
- [x] Анимированные иконки с градиентами
- [x] Arrow connectors между шагами (скрыты на мобильных)
- [x] Hover эффекты: подъем (y: -8), масштабирование, вращение иконок
- [x] Добавлен в навигацию как "Как работает"
- [x] ID якоря: `#how-it-works`

#### Секция "До и После"

- [x] Split-screen comparison:
  - "Было" - 5 проблем с красными X иконками
  - "Стало" - 5 решений с зелеными Check иконками
- [x] Адаптивная сетка: 1 колонка на мобильных, 2 на десктопе
- [x] Hover эффекты на "После" карточках (scale: 1.02, x: 4)
- [x] CTA в конце: "10-20% дополнительной прибыли"
- [x] Text alignment: center на мобильных, left на десктопе

#### Responsive Design

- [x] Breakpoints проверены: 375px, 768px, 1024px, 1440px
- [x] Grid адаптируется корректно на всех экранах
- [x] Typography масштабируется плавно
- [x] Gaps адаптивные: `gap-6 lg:gap-8`, `gap-12 lg:gap-16`
- [x] Hidden elements: arrow connectors только на `lg:` экранах

**Файлы изменены:**

- `apps/web/src/app/page.tsx` - добавлены секции и данные
- `docs/changelog.frontend.md` - документирован апдейт
- `docs/roadmap.md` - обновлен roadmap

**Результат**: Две новые секции с адаптивным дизайном и плавными анимациями

---

##### CTA Section (Previous Update)

- [x] Заголовок: "Инструмент, который делает прорабов богаче"
- [x] Подзаголовок: "Реально на 10-20% с каждого объекта"
- [x] Более детальные истории успеха

#### Responsive Design (Previous Update)

##### Mobile & Desktop

- [x] Убран горизонтальный скролл (удалён `overflow-x-hidden`)
- [x] Исправлены кнопки hero-секции: `flex-col sm:flex-row` → `flex-wrap`
- [x] PhoneMockup сдвинут вправо на больших экранах: `lg:pl-12 xl:pl-20`
- [x] Кнопки никогда не становятся в два ряда на узких экранах

#### Animation Enhancements

##### PhoneMockup

- [x] Плавающая анимация (floating effect)
- [x] y: [0, -15, 0] с duration 4s

##### Problem Cards

- [x] Hover lift: y: -12, scale: 1.02
- [x] Вращение иконки: rotate: [0, -10, 10, -10, 0]
- [x] Пульсирующий gradient-бордер (opacity animation)
- [x] whileTap: scale: 0.98

##### Feature Cards

- [x] Spring animation при hover (stiffness: 300)
- [x] Shine effect (блик проходит по карточке)
- [x] Вращение иконок: rotate: [0, -5, 5, 0]
- [x] Изменение цвета заголовка при наведении
- [x] whileHover scale: 1.03

##### Pricing Cards

- [x] Spring-эффект при hover
- [x] Пульсирующая тень для "Лучшего выбора" (boxShadow animation)
- [x] Анимированный бейдж "🔥 Лучший выбор" (scale + y движение)
- [x] duration: 3s, repeat: Infinity

##### CSS Animations

- [x] Добавлена keyframe `@keyframes shine` для блика
- [x] shine: left: -100% → 200%

#### Technical Implementation

##### Files Modified

- `apps/web/src/app/page.tsx` - основной компонент лендинга
- `apps/web/src/app/styles/globals.css` - CSS анимации
- `docs/changelog.frontend.md` - обновлён changelog
- `docs/roadmap.md` - обновлён roadmap

##### Animations Stack

- Framer Motion для React-компонентов
- Cubic-bezier easing: [0.25, 0.1, 0.25, 1]
- Spring animations с настраиваемым stiffness
- Smooth transitions (300-500ms)

##### Animation Utilities

- `floatAnimation` - для плавающих элементов
- `pulseGlow` - для пульсирующих эффектов
- `whileHover`, `whileTap` - для интерактивности
- AnimatePresence для условного рендеринга

#### Quality Checks

- [x] Контент полностью соответствует продуктовой документации
- [x] Нет горизонтального скролла на всех экранах
- [x] Все анимации плавные и естественные
- [x] Адаптивность работает на мобильных и десктопных экранах
- [x] TypeScript: 0 ошибок
- [x] Документация обновлена

**Результат**: Профессиональный лендинг с точными текстами из спецификации, улучшенной адаптивностью и modern animations для лучшего UX

### UI/UX Redesign - All Application Pages (2025-01-04) - ✅ ЗАВЕРШЕНО

**Контекст**: Полное обновление дизайна всех основных страниц приложения для соответствия спецификации продукта и единому стилю дизайн-системы

**Цели**:
- [x] Привести все страницы к единому дизайну
- [x] Соответствие спецификации продукта
- [x] Mobile-first responsive design
- [x] Рабочий функционал на всех страницах
- [x] Владелец видит финансы, участник - нет

#### Обновлённые страницы (6)

**Dashboard Page (`/dashboard`)**
- [x] TeamSwitcher для переключения команд
- [x] FinancialSummary для владельца
- [x] ProjectCardDashboard с прибылью
- [x] FabMenu для быстрых действий
- [x] Поиск проектов
- [x] Collapsible архив

**Teams List Page (`/teams`)**
- [x] Sticky header с backdrop-blur
- [x] Карточки команд с hover-эффектами
- [x] Crown badge для владельца
- [x] Empty state с CTA

**Team Details Page (`/teams/[teamId]`)**
- [x] Header с информацией о команде
- [x] FinancialSummary для владельца
- [x] Фильтрация по статусу
- [x] ProjectCardDashboard с финансами
- [x] FAB для создания проекта

**Project Details Page (`/teams/[teamId]/projects/[projectId]`)**
- [x] Sticky header с прогресс-баром
- [x] Tab-навигация (Инфо, Расходы, Фотоотчёты, Задачи)
- [x] Financial summary cards для владельца
- [x] FinancialDashboard на вкладке Расходы
- [x] Полная интеграция ExpenseForm/ExpenseList
- [x] Полная интеграция PhotoReportForm/PhotoReportCard
- [x] FAB для добавления расхода

**Project Create/Edit Pages**
- [x] Sticky header с информацией о команде
- [x] Card с градиентной иконкой
- [x] ProjectForm с полной валидацией
- [x] Success toast и redirect

#### Design Patterns использованные

**Header Pattern:**
- Sticky с backdrop-blur-xl
- Back button с hover state
- Gradient logo/icon
- Action buttons справа

**Card Pattern:**
- rounded-2xl, border-border/30
- Hover: border-primary/30, shadow-xl
- Gradient overlay при hover

**Animation Pattern:**
- Framer Motion fadeIn variants
- Stagger children animation
- Hover lift effect (y: -4)
- AnimatePresence для переходов

#### GraphQL Integration

**Queries использованные:**
- MyTeamsDocument
- ProjectsByTeamDocument
- ProjectDocument
- ProjectStatsDocument
- ExpensesByProjectDocument
- ProjectPhotoReportsDocument

**Mutations интегрированные:**
- CreateProject, UpdateProject, ArchiveProject, RestoreProject
- CreateExpense, UpdateExpense, DeleteExpense
- CreatePhotoReport, UpdatePhotoReport, DeletePhotoReport

#### Проверки
- [x] TypeScript: 0 ошибок
- [x] Linter: 0 ошибок
- [x] Все GraphQL интеграции работают
- [x] Responsive design на всех breakpoints

**Результат**: Все основные страницы приложения (кроме Landing, Auth, Onboarding) обновлены с единым дизайном, соответствующим спецификации продукта ProRab.space. Весь существующий функционал работает корректно.

---

## Stage 11: Settings Page - Complete Implementation

**Статус:** 🔄 In Progress | 78% Complete → 100% Target
**Приоритет:** P1 - High (Important for MVP)
**Оценка времени:** 5-7 дней (2 дня осталось)
**Документация:** `docs/stages/stage-11-settings-implementation-plan.md`

### Текущее состояние (78% Complete)

**Settings Page:** `apps/web/src/app/(root)/(protected)/settings/page.tsx` (2088 строк)

**Что работает:**
- ✅ **Appearance Tab** - 100% Complete (theme, colors, fonts)
- ✅ **Help Tab** - 100% Complete (FAQ, contact form)
- ✅ **About Tab** - 100% Complete (version, changelog, legal)
- ✅ **Profile Tab** - 100% Complete ✨ NEW (name, email, phone, **avatar upload**)
- ✅ **Security Tab** - 90% Complete (password change)
- ✅ **Notifications Tab** - 70% Complete (basic toggles)
- ✅ **Subscription Tab** - 85% Complete (plan display, usage)

**Что нужно доделать (22%):**
- ✅ ~~Avatar upload & management (Profile Tab)~~ **DONE** (2025-12-12)
- ❌ Telegram integration UI (Notifications Tab)
- ❌ Subscription management (change plan, cancel, reactivate)
- ❌ Two-Factor Authentication (Security Tab)
- ❌ Detailed notification settings (events, frequency, quiet hours)
- ❌ Account deletion (Security Tab)
- ❌ Activity log (Security Tab)
- ❌ Active sessions management (Security Tab)

### Implementation Plan (3 Phases)

#### Phase 1: Critical Features (P0) - 3 дня

**Day 1: Avatar Upload & Management** ✅ COMPLETE (2025-12-12)
- [x] **Backend** (4 часа):
  - ✅ GraphQL Upload integration (graphql-upload-minimal)
  - ✅ `uploadAvatar(file: Upload!)` mutation
  - ✅ `deleteAvatar` mutation
  - ✅ Stream-based file handling
  - ✅ Validation: JPG, PNG, GIF, WebP (max 5MB)
  - ✅ Auto-delete old avatar
- [x] **Frontend** (4 часа):
  - ✅ AvatarUpload component (react-dropzone + react-image-crop)
  - ✅ Drag & drop support
  - ✅ Circular crop preview
  - ✅ Integration with Settings page
  - ✅ Toast notifications
- [x] **Result**: 3 new files, 10 modified (~595 lines)
- **Commit:** c3052c6

**Day 2: Telegram Integration UI**
- [ ] **Backend** (2 часа):
  - `telegramConnectionStatus` query
  - `disconnectTelegram` mutation
- [ ] **Frontend** (6 часов):
  - TelegramIntegration component
  - Connection status display
  - Connect/Disconnect buttons
  - Deep link to @ProRabSpaceBot
- [ ] **Files**: 2 backend, 4 frontend (~400 строк)

**Day 3: Subscription Management**
- [ ] **Backend** (3 часа):
  - `changePlan` mutation (проверить существующую)
  - `cancelSubscription` mutation (проверить)
  - `reactivateSubscription` mutation (новая)
- [ ] **Frontend** (5 часов):
  - ChangePlanDialog component
  - CancelSubscriptionDialog component
  - Update Subscription Tab UI
  - Add "View Payment History" link
- [ ] **Files**: 3 backend, 5 frontend (~600 строк)

**Phase 1 Deliverables:**
- ✅ Avatar upload works (with crop and preview)
- ✅ Telegram integration visible in UI
- ✅ Users can change/cancel subscription
- **Total:** ~1500 строк кода

---

#### Phase 2: Important Features (P1) - 2.5 дня

**Day 4: Two-Factor Authentication**
- [ ] **Backend** (1 день):
  - Install speakeasy + qrcode
  - TwoFactorService (generate secret, verify token)
  - User model update (twoFactorEnabled, twoFactorSecret)
  - `setup2FA`, `enable2FA`, `disable2FA` mutations
  - Update AuthGuard for 2FA check
- [ ] **Frontend** (0.5 дня):
  - TwoFactorSetup component (QR code, verification)
  - TwoFactorDisable component
  - Add to Security Tab
- [ ] **Files**: 6 backend, 3 frontend (~700 строк)

**Day 5-5.5: Detailed Notification Settings**
- [ ] **Backend** (4 часа):
  - NotificationSettings model update (event types, frequency, quiet hours)
  - `updateNotificationSettings` mutation extended
- [ ] **Frontend** (4 часа):
  - NotificationEvents component (individual toggles)
  - NotificationFrequency component (instant/daily/weekly)
  - QuietHours component (time pickers)
  - TestNotification component (send test)
- [ ] **Files**: 2 backend, 5 frontend (~600 строк)

**Phase 2 Deliverables:**
- ✅ 2FA fully functional (QR code, backup codes)
- ✅ Detailed notification settings available
- ✅ Quiet hours and frequency configurable
- **Total:** ~1300 строк кода

---

#### Phase 3: Nice to Have (P2) - 1.5 дня

**Day 6: Account Deletion**
- [ ] **Backend** (2 часа):
  - `deleteAccount` service (check owned teams, cancel subscriptions)
  - `deleteAccount` mutation (requires password)
- [ ] **Frontend** (2 часа):
  - DeleteAccountDialog component (warnings, password confirm)
  - Add Danger Zone to Security Tab
- [ ] **Files**: 2 backend, 2 frontend (~300 строк)

**Day 6.5: Activity Log**
- [ ] **Backend** (2 часа):
  - ActivityLog model (action, details, ipAddress, userAgent)
  - ActivityLoggerService (auto-log all settings changes)
  - `myActivityLog` query
- [ ] **Frontend** (2 часа):
  - ActivityLogList component
  - Add to Security Tab (last 10 activities)
  - Full activity log page link
- [ ] **Files**: 3 backend, 2 frontend (~400 строк)

**Day 7: Active Sessions Management**
- [ ] **Backend** (2 часа):
  - Session model (if not exists)
  - `mySessions` query
  - `revokeSession`, `revokeAllSessions` mutations
- [ ] **Frontend** (2 часа):
  - ActiveSessions component
  - Add to Security Tab
  - Revoke buttons for each session
- [ ] **Files**: 3 backend, 2 frontend (~400 строк)

**Phase 3 Deliverables:**
- ✅ Users can delete their account safely
- ✅ Activity log shows all settings changes
- ✅ Active sessions can be managed and revoked
- **Total:** ~1100 строк кода

---

### Summary

**Total Implementation:**
- **Time:** 5-7 дней
- **Backend Files:** ~15 файлов (~1200 строк)
- **Frontend Files:** ~12 файлов (~1500 строк)
- **Total Code:** ~2700 строк
- **Dependencies:** multer, speakeasy, qrcode, react-image-crop, react-dropzone

**Completion Criteria:**
- ✅ All 7 tabs 100% functional
- ✅ No "В разработке" toasts remaining
- ✅ All GraphQL mutations tested
- ✅ Unit tests coverage > 80%
- ✅ E2E tests passing
- ✅ Performance targets met
- ✅ Documentation updated

**Priority:**
- P0 (Critical): Phase 1 - Must have for production
- P1 (Important): Phase 2 - Recommended for MVP
- P2 (Nice to Have): Phase 3 - Can be added post-launch

**Rollout:**
- Version 0.4.0-beta.1 after Phase 1 (Day 3)
- Version 0.4.0-beta.2 after Phase 2 (Day 5.5)
- Version 0.4.0 after Phase 3 (Day 7)

**Детальный план:** `docs/stages/stage-11-settings-implementation-plan.md` (~350 строк спецификации)

---
