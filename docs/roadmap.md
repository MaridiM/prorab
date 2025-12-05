# Roadmap ProRab.space (MVP)

Цели: собрать монорепо (Turborepo) с Next.js 16 (App Router) и NestJS 11 (GraphQL), Postgres + Prisma, далее развивать функциональность команд, проектов и отчётов.

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
- [ ] Telegram как провайдер (запланировано)

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

## Этап 3. Проекты (недели 10–11) - 🔄 В ПРОЦЕССЕ
**Приоритет:** 🔴 Критический (MVP)
**Статус:** 🔄 В процессе (Фаза 1: Backend ✅ Завершена, Фаза 2: Frontend ✅ Завершена, Фаза 3: Pages 📋 Запланировано)
**Начало:** 2025-12-05
**План:** `docs/analisys/stage-3-projects-implementation-plan.md`

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

### Фаза 3: Pages Implementation - 📋 ЗАПЛАНИРОВАНО

**Dashboard Page**
- [ ] Обновить `/teams/[teamId]/page.tsx` (ProjectList)
- [ ] Добавить фильтры (Active/Archived tabs)
- [ ] Добавить FAB кнопку "Новый проект"
- [ ] Реализовать empty state и loading state

**Create Page**
- [ ] Создать `/teams/[teamId]/projects/new/page.tsx`
- [ ] Интегрировать ProjectForm
- [ ] Реализовать CreateProject mutation
- [ ] Добавить success toast + redirect

**Details Page**
- [ ] Создать `/teams/[teamId]/projects/[projectId]/page.tsx`
- [ ] Реализовать Tabs (Инфо, Расходы, Задачи, Фотоотчеты)
- [ ] Кнопки "Редактировать" и "В архив"

**Edit Page**
- [ ] Создать `/teams/[teamId]/projects/[projectId]/edit/page.tsx`
- [ ] Интегрировать ProjectForm с defaultValues
- [ ] Реализовать UpdateProject mutation

### Фаза 4: Polish & Testing - 📋 ЗАПЛАНИРОВАНО

- [ ] Оптимизация loading states (skeleton loaders)
- [ ] Error boundaries для страниц
- [ ] Toast notifications для всех операций
- [ ] Mobile responsive проверка
- [ ] E2E тестирование
- [ ] Обновить changelog.md

## Этап 4. Файлы и расходы (недели 8–9)
- [ ] Интеграция хранилища (Cloudflare R2/S3) + upload для GraphQL.
- [ ] Entity `Expense` (сумма, категория, вложения).
- [ ] API: создание расходов, привязка к проектам.
- [ ] Frontend: список/карточки расходов, загрузка файлов.

## Этап 5. Фотоотчёты (Wow #1, недели 10–12)
- [ ] Entity `PhotoReport` + `ReportPhoto` с `slug`.
- [ ] API: `createReport`, загрузка/управление фото.
- [ ] SSR/Next.js SSG страница `/r/[slug]` с галереей, деталями команды/проекта, шаринг в WhatsApp.
- [ ] Экспорт/превью отчёта.

## Этап 6. Финансы и роли (Wow #2–3, недели 13–15)
- [ ] Расчёт зарплат/долей для `TeamMember`.
- [ ] API: `calculateProjectSalary`, `closeProject`.
- [ ] Frontend: раздел «выплаты», графики, фильтры, история транзакций.

## Этап 7. Задачи и приглашения (недели 16–18)
- [ ] Kanban: Entity `Task`, drag&drop API, 3 статуса.
- [ ] Приглашения: JWT-приглашения, join team, обновление ролей.

## Этап 8. Монетизация (недели 19–20)
- [ ] Интеграция оплаты (например, ЮKassa) с вебхуками.
- [ ] Тарифы/подписки, ограничения по планам.
- [ ] UI для планов и состояний подписки.

## Этап 9. UX-полировка (неделя 21)
- [ ] Skeletons, улучшенные состояния загрузки/ошибок.
- [x] Toast-уведомления (реализованы на страницах авторизации, позиция внизу экрана).
- [ ] Telegram-бот (демо): уведомления о задачах/приглашениях/отчётах.

## Этап 10. Админ-панель (недели 22-24)
- [x] **Планирование админки** — создан детальный план (`docs/admin-panel-plan.md`) с описанием всех страниц и функций.
- [ ] Авторизация администраторов (отдельная система или расширение существующей)
- [ ] Дашборд админки (KPI, графики, метрики)
- [ ] Управление пользователями (просмотр, блокировка, редактирование)
- [ ] Управление бригадами (просмотр, изменение тарифа, статистика)
- [ ] Управление подписками и платежами (просмотр, продление, возвраты)
- [ ] Аналитика и метрики (DAU/MAU, MRR, Retention, Churn)
- [ ] Поддержка пользователей (система тикетов)
- [ ] Настройки системы (тарифы, интеграции, email-шаблоны)
- [ ] Логи и мониторинг (логи системы, действия администраторов, статус сервисов)
- [ ] Управление администраторами (роли и права доступа)

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
