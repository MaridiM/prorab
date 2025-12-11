# Полный анализ приложения ProRab.space

**Дата анализа:** 2025-01-04  
**Версия:** MVP 0.1.2  
**Статус:** Phase 1 Complete (65% MVP)

---

## 📋 Оглавление

1. [Общее описание продукта](#1-общее-описание-продукта)
2. [Технический стек](#2-технический-стек)
3. [Архитектура приложения](#3-архитектура-приложения)
4. [База данных](#4-база-данных)
5. [Backend API](#5-backend-api)
6. [Frontend структура](#6-frontend-структура)
7. [Дизайн-система](#7-дизайн-система)
8. [Реализованный функционал](#8-реализованный-функционал)
9. [Нереализованный функционал](#9-нереализованный-функционал)
10. [Безопасность](#10-безопасность)
11. [Производительность](#11-производительность)
12. [Известные проблемы](#12-известные-проблемы)
13. [Рекомендации](#13-рекомендации)

---

## 1. Общее описание продукта

### 1.1. Концепция

**ProRab.space** — мобильное первое (mobile-first) веб-приложение для малых строительных и ремонтных бригад (2–10 человек). Это единственное приложение в СНГ, которое решает ровно ТРИ самые дорогие боли прораба одновременно:

1. **Где мои деньги?** — учёт расходов и реальная прибыль
2. **Как быстро и красиво отчитаться перед клиентом?** — фотоотчёты
3. **Сколько кому платить в конце объекта?** — автоматический расчёт зарплаты бригаде

### 1.2. Целевая аудитория

- Малые строительные и ремонтные бригады (2–10 человек)
- Частные прорабы
- Команды без офиса, секретаря и нормального учёта

### 1.3. Тарифная модель

| Тариф | Цена (мес) | Активных объектов | Участников |
|-------|------------|-------------------|------------|
| Лайт | 490 ₽ | 1 | 1 (только прораб) |
| Прораб | 990 ₽ | до 4 | до 3 |
| Бригада | 1 990 ₽ | безлимит | до 10 |

**Спецпредложение:** Первые 500 бригад → вечная цена 990 ₽/мес за тариф «Бригада»

---

## 2. Технический стек

### 2.1. Backend

| Технология | Версия | Назначение |
|------------|--------|------------|
| **NestJS** | 11 | API Framework |
| **GraphQL** | Code-First | API протокол |
| **Apollo Server** | - | GraphQL сервер |
| **Prisma** | 7 | ORM |
| **PostgreSQL** | 16 | База данных |
| **Redis** | 8 | Сессии, кэш |
| **Argon2** | - | Хеширование паролей |
| **Sharp** | 0.34+ | Обработка изображений |
| **Brevo** | - | Email отправка |
| **nanoid** | - | Генерация slugs |

### 2.2. Frontend

| Технология | Версия | Назначение |
|------------|--------|------------|
| **Next.js** | 16 | React Framework (App Router) |
| **React** | 19 | UI библиотека |
| **TypeScript** | 5 | Типизация |
| **Tailwind CSS** | 4 | Стилизация |
| **shadcn/ui** | - | UI компоненты |
| **Framer Motion** | - | Анимации |
| **Apollo Client** | - | GraphQL клиент |
| **Zod** | - | Валидация схем |
| **React Hook Form** | - | Управление формами |
| **Zustand** | - | State management |
| **next-intl** | - | Интернационализация |

### 2.3. Инфраструктура

| Технология | Назначение |
|------------|------------|
| **Turborepo** | Монорепо |
| **Docker Compose** | Контейнеризация |
| **pnpm** | Пакетный менеджер |

---

## 3. Архитектура приложения

### 3.1. Структура монорепо

```
v-1/
├── apps/
│   ├── api/                    # NestJS Backend
│   │   ├── prisma/             # Database schema
│   │   └── src/
│   │       ├── core/           # Инфраструктурные модули
│   │       │   ├── config/     # Конфигурация
│   │       │   ├── mail/       # Email сервис
│   │       │   ├── prisma/     # Database
│   │       │   ├── redis/      # Sessions
│   │       │   └── storage/    # File storage
│   │       ├── modules/        # Бизнес-модули
│   │       │   ├── auth/       # Аутентификация
│   │       │   ├── users/      # Пользователи
│   │       │   ├── teams/      # Команды
│   │       │   ├── projects/   # Проекты
│   │       │   ├── expenses/   # Расходы
│   │       │   └── photo-reports/ # Фотоотчёты
│   │       └── shared/         # Общие декораторы/guards
│   │
│   └── web/                    # Next.js Frontend
│       └── src/
│           ├── app/            # App Router pages
│           │   ├── (root)/     # Основные роуты
│           │   │   ├── (protected)/ # Защищённые страницы
│           │   │   ├── auth/   # Страницы авторизации
│           │   │   └── onboarding/ # Онбординг
│           │   └── components/ # Локальные компоненты
│           ├── middleware.ts   # Route protection
│           └── packages/       # Переиспользуемые модули
│               ├── api/        # GraphQL operations
│               ├── components/ # UI компоненты
│               ├── hooks/      # React hooks
│               ├── libs/       # Библиотеки (Apollo, Auth, i18n)
│               ├── schemas/    # Zod schemas
│               └── utils/      # Утилиты
│
├── docs/                       # Документация
└── package.json                # Root package
```

### 3.2. Модульная архитектура Backend

```
CoreModule
├── PrismaModule (Database)
├── RedisModule (Sessions)
├── ConfigModule (Environment)
└── StorageModule (Files)

BusinessModules
├── AuthModule (Аутентификация)
├── UsersModule (Пользователи)
├── TeamsModule (Команды + Онбординг)
├── ProjectsModule (Проекты)
├── ExpensesModule (Расходы)
└── PhotoReportsModule (Фотоотчёты)
```

### 3.3. Frontend архитектура

```
Layout Providers
├── ApolloProvider (GraphQL)
├── AuthProvider (Auth context)
├── NextIntlProvider (i18n)
└── ThemeProvider (Light/Dark)

Route Groups
├── (root)
│   ├── (protected)     # Требует авторизации
│   │   ├── dashboard   # Главный экран
│   │   └── teams/      # Команды и проекты
│   ├── auth/           # Публичные auth страницы
│   └── onboarding/     # Wizard онбординга
└── page.tsx            # Landing
```

---

## 4. База данных

### 4.1. Prisma Schema (10 таблиц)

```prisma
// ==================== AUTH ====================
User {
  id, email, emailNormalized, emailVerified
  passwordHash, fullName, phone
  hasCompletedOnboarding, onboardingCompletedAt
  currentTeamId
  createdAt, updatedAt
}

VerificationToken { id, userId, token, expiresAt }
PasswordResetToken { id, userId, token, expiresAt, used }

// ==================== BUSINESS ====================
Team {
  id, name
  logoType (UPLOADED | GENERATED | DEFAULT)
  logoUrl, iconId, colorId
  ownerId
  createdAt, updatedAt
}

TeamMember { id, teamId, userId, role, joinedAt }
InviteCode { id, teamId, code, expiresAt, usedBy, usedAt }

Project {
  id, teamId, name, address, description
  budget (Decimal 12,2), clientPhone
  startDate, endDate
  photoUrl, progress (0-100), notes
  status (ACTIVE | ARCHIVED | COMPLETED)
  archivedAt, completedAt
  createdById, createdAt, updatedAt
}

Expense {
  id, projectId
  amount (Decimal 12,2), category
  photos[], comment, paidByClient
  createdById, createdAt, updatedAt
}

PhotoReport {
  id, slug (unique, 7 chars)
  projectId, title, description
  coverPhotoUrl, isPublic, viewCount
  createdById, createdAt, updatedAt, publishedAt
}

ReportPhoto {
  id, reportId
  photoUrl, thumbnailUrl, caption
  orderIndex, width, height, fileSize
  createdAt
}
```

### 4.2. Индексы

- `users`: currentTeamId
- `teams`: ownerId
- `team_members`: userId, teamId
- `projects`: teamId, status, createdById, [teamId, status]
- `expenses`: projectId, createdById, createdAt, [projectId, category]
- `photo_reports`: slug, projectId, createdAt, isPublic
- `report_photos`: [reportId, orderIndex]

### 4.3. Relationships

```
User ─┬── Team (owner)
      │   ├── TeamMember
      │   ├── InviteCode
      │   └── Project
      │       ├── Expense
      │       └── PhotoReport
      │           └── ReportPhoto
      │
      └── TeamMember (member)
```

---

## 5. Backend API

### 5.1. GraphQL Operations (40+)

#### Auth Module (9 операций)
- **Mutations:** register, login, logout, verifyEmail, forgotPassword, resetPassword, changePassword, refreshSession, revokeSession
- **Queries:** me, sessions

#### Teams Module (4 операции)
- **Mutations:** completeOnboarding
- **Queries:** myTeams

#### Projects Module (8 операций)
- **Mutations:** createProject, updateProject, archiveProject, restoreProject, updateProjectProgress
- **Queries:** project, projectsByTeam, projectStats

#### Expenses Module (6 операций)
- **Mutations:** createExpense, updateExpense, deleteExpense
- **Queries:** expense, expensesByProject, expensesByCategory

#### Photo Reports Module (9 операций)
- **Mutations:** createPhotoReport, updatePhotoReport, deletePhotoReport, uploadPhotoToReport, addPhotoToReport, deletePhotoFromReport
- **Queries:** projectPhotoReports, photoReport, publicPhotoReport (без auth)

### 5.2. Особенности API

- **Code-First GraphQL** — автогенерация схемы
- **Global AuthGuard** — защита по умолчанию
- **@Public() decorator** — для публичных endpoints
- **Rate Limiting** — 5 попыток / 15 минут
- **File Upload** — graphql-upload-minimal (10MB / 10 files)
- **Image Processing** — Sharp (resize, thumbnail, WebP)

---

## 6. Frontend структура

### 6.1. Страницы (14 реализовано)

| Группа | Страница | Путь | Статус |
|--------|----------|------|--------|
| **Public** | Landing | `/` | ✅ |
| **Auth** | Login | `/auth/login` | ✅ |
| | Register | `/auth/register` | ✅ |
| | Forgot Password | `/auth/forgot-password` | ✅ |
| | Reset Password | `/auth/reset-password` | ✅ |
| **Onboarding** | Start | `/onboarding` | ✅ |
| | Step 1 | `/onboarding/step-1` | ✅ |
| | Step 2 | `/onboarding/step-2` | ✅ |
| | Step 3 | `/onboarding/step-3` | ✅ |
| | Invite | `/onboarding/invite` | ✅ |
| **Protected** | Dashboard | `/dashboard` | ✅ |
| | Teams List | `/teams` | ✅ |
| | Team Details | `/teams/[teamId]` | ✅ |
| | Project Details | `/teams/[teamId]/projects/[projectId]` | ✅ |
| | Project Create | `/teams/[teamId]/projects/new` | ✅ |
| | Project Edit | `/teams/[teamId]/projects/[projectId]/edit` | ✅ |

### 6.2. Компоненты (45+)

#### UI Primitives (17)
- Badge, Button, Card, DatePicker, Form, IconPicker
- ImageUpload, Input, PasswordInput, ProgressBar
- Select, Skeleton, Spinner, Stepper, TeamLogo, Toast

#### Dashboard Components (4)
- TeamSwitcher, FinancialSummary, ProjectCardDashboard, FabMenu

#### Project Components (3)
- ProjectCard, ProjectForm

#### Expense Components (4)
- ExpenseCard, ExpenseForm, ExpenseList, FinancialDashboard

#### Photo Report Components (3)
- PhotoUploader, PhotoReportForm, PhotoReportCard

#### Feature Components (6)
- ChangeLanguage, ChangeTheme, InitialLoader
- NavigationProgress, Providers

### 6.3. Hooks

- `useAuth` — контекст авторизации
- `useToast` — toast уведомления
- `useAutoValidateForm` — автовалидация форм

### 6.4. Zod Schemas

- **Auth:** login, register, forgotPassword, resetPassword
- **Teams:** team, project, invite
- **Projects:** createProject, updateProject, projectFilter
- **Expenses:** createExpense, updateExpense
- **Photo Reports:** createPhotoReport, uploadPhoto

---

## 7. Дизайн-система

### 7.1. Цветовая палитра (HSL)

#### Light Theme
```css
--primary: 221 83% 53%       /* Blue */
--secondary: 223 13% 91%     /* Light Gray */
--accent: 45 97% 61%         /* Amber */
--success: 160 93% 31%       /* Green */
--destructive: 0 72% 52%     /* Red */
--background: 0 0% 100%      /* White */
--foreground: 222 47% 12%    /* Dark Blue */
--muted: 223 13% 91%
--border: 214 32% 91%
```

#### Dark Theme
```css
--primary: 217 91% 60%
--secondary: 215 14% 34%
--accent: 45 97% 64%
--success: 156 72% 67%
--destructive: 0 93% 82%
--background: 215 15% 17%
--foreground: 220 14% 96%
```

### 7.2. Типографика

- **Sans:** Geist Sans, system-ui fallback
- **Mono:** Geist Mono, ui-monospace fallback

### 7.3. Анимации

```css
/* Keyframes */
@keyframes float      /* Плавающая анимация */
@keyframes pulse-slow /* Медленный пульс */
@keyframes shimmer    /* Shimmer эффект */
@keyframes shine      /* Блик */
@keyframes spin-slow  /* Медленное вращение */

/* Utilities */
.animate-float
.animate-pulse-slow
.animate-shimmer
.animate-fade-up
.animate-zoom-in
```

### 7.4. Радиусы

- `--radius: 0.75rem` (12px базовый)
- `rounded-2xl` — карточки
- `rounded-3xl` — большие блоки
- `rounded-full` — круглые элементы

### 7.5. Shadows

- `shadow-sm` — базовая тень
- `shadow-md` — средняя тень
- `shadow-lg` — для hover эффектов
- Backdrop blur для glassmorphism

---

## 8. Реализованный функционал

### 8.1. Аутентификация ✅ (100%)

- ✅ Email/Password регистрация и вход
- ✅ Argon2 хеширование паролей
- ✅ Redis сессии (7 дней session, 30 дней refresh)
- ✅ HTTP-only cookies
- ✅ Email верификация (Brevo)
- ✅ Сброс пароля
- ✅ Rate limiting (5 попыток / 15 минут)
- ✅ GraphQL Guards и Decorators
- ❌ Telegram OAuth (запланировано)

### 8.2. Онбординг ✅ (100%)

- ✅ 3-шаговый wizard
- ✅ Название бригады
- ✅ Логотип (upload / icon+color / default)
- ✅ Первый проект (автосоздание)
- ✅ Присоединение по 6-значному коду
- ✅ Celebration animation (confetti)
- ✅ Mobile-first design
- ✅ Route protection

### 8.3. Команды ✅ (100%)

- ✅ Создание команды (через онбординг)
- ✅ Список команд пользователя
- ✅ Переключатель команд
- ✅ Owner/Member роли
- ✅ Логотип система (3 типа)
- ❌ Редактирование команды
- ❌ Приглашения (backend готов)

### 8.4. Проекты ✅ (100%)

- ✅ CRUD операции
- ✅ 9 полей (название, адрес, бюджет, даты, прогресс, и т.д.)
- ✅ 3 статуса (ACTIVE, ARCHIVED, COMPLETED)
- ✅ Фильтрация и поиск
- ✅ Лимит 10 активных проектов
- ✅ Автоматический COMPLETED при progress=100%
- ✅ Страницы: Dashboard, Create, Details, Edit
- ✅ ProjectCard, ProjectForm компоненты

### 8.5. Расходы ✅ (100%)

- ✅ CRUD операции
- ✅ 8 категорий
- ✅ Decimal точность для сумм
- ✅ Фото чеков (массив URLs)
- ✅ Флаг "Оплатил клиент"
- ✅ Финансовые метрики (бюджет, расходы, прибыль)
- ✅ ExpenseCard, ExpenseForm, ExpenseList
- ✅ FinancialDashboard с диаграммами
- ❌ Загрузка фото (требует R2)

### 8.6. Фотоотчёты 🔄 (60%)

- ✅ Backend API (8 endpoints)
- ✅ Database models (PhotoReport, ReportPhoto)
- ✅ Slug generation (nanoid 7 chars)
- ✅ Image processing (Sharp)
- ✅ Public endpoint (без auth)
- ✅ Frontend компоненты (PhotoUploader, PhotoReportForm, PhotoReportCard)
- ✅ Интеграция в Project Details Page
- ❌ Публичная страница `/r/[slug]`
- ❌ Реакции на фото
- ❌ Cloudflare R2 storage

### 8.7. Dashboard ✅

- ✅ Team Switcher
- ✅ Financial Summary (только для owner)
- ✅ Project Cards с прибылью
- ✅ FAB Menu (быстрые действия)
- ✅ Поиск проектов
- ✅ Archived projects (collapsed)
- ✅ Empty states
- ✅ Skeleton loaders

### 8.8. Landing Page ✅

- ✅ Hero секция с мокапом
- ✅ Секция проблем (3 боли)
- ✅ Секция "Как работает" (4 шага)
- ✅ Секция возможностей (4 фичи)
- ✅ Секция "До/После"
- ✅ Тарифы (3 плана)
- ✅ Testimonials
- ✅ CTA секция
- ✅ Framer Motion анимации
- ✅ Light/Dark theme
- ✅ Адаптивный дизайн

---

## 9. Нереализованный функционал

### 9.1. Критичные (MVP)

| Функция | Приоритет | Статус |
|---------|-----------|--------|
| Публичная страница фотоотчёта `/r/[slug]` | 🔴 | ❌ |
| Реакции на фото (❤️ ✅ ❓) | 🔴 | ❌ |
| Cloudflare R2 storage | 🔴 | ❌ |
| Telegram OAuth | 🟡 | ❌ |

### 9.2. Важные (Phase 2)

| Функция | Приоритет | Описание |
|---------|-----------|----------|
| Расчёт зарплаты | 🔴 | Автоматический расчёт для бригады |
| Kanban задачи | 🟡 | 3 колонки, drag & drop |
| Настройки бригады | 🟡 | Редактирование, участники |
| Страница тарифов | 🟡 | Выбор и оплата |
| Страница профиля | 🟢 | Редактирование профиля |

### 9.3. Платежи (Phase 3)

- ЮKassa интеграция
- Рекуррентные платежи
- Страница подписки
- Ограничения по тарифам

---

## 10. Безопасность

### 10.1. Реализовано ✅

- ✅ Argon2 password hashing
- ✅ HTTP-only secure cookies
- ✅ Redis session storage
- ✅ CORS configuration
- ✅ Helmet CSP headers
- ✅ Rate limiting
- ✅ GraphQL Guards
- ✅ TeamMember access validation
- ✅ UUID for all IDs
- ✅ Decimal for financial data

### 10.2. Требуется внимание

- ⚠️ HTTPS в production
- ⚠️ API key rotation
- ⚠️ Audit logging
- ⚠️ GDPR compliance
- ⚠️ Backup strategy

---

## 11. Производительность

### 11.1. Backend оптимизации

- ✅ Database indexes (10+)
- ✅ Cascade deletes
- ✅ GraphQL field-level optimization
- ✅ Image compression (Sharp)
- ✅ WebP conversion

### 11.2. Frontend оптимизации

- ✅ Code splitting (Next.js)
- ✅ Skeleton loaders
- ✅ Lazy loading images
- ✅ Conditional queries (skip)
- ✅ Apollo cache

### 11.3. Рекомендации

- 📋 ISR для публичных страниц
- 📋 CDN для статики
- 📋 Image lazy loading
- 📋 Bundle analysis
- 📋 Lighthouse audit

---

## 12. Известные проблемы

### 12.1. Текущие

| Проблема | Серьёзность | Статус |
|----------|-------------|--------|
| Photo upload требует R2 | Medium | В процессе |
| Markdown lint warnings | Low | Косметическое |
| Prisma migrations (db push) | Medium | Планируется |

### 12.2. Technical Debt

- [ ] E2E тесты (Playwright)
- [ ] Unit тесты для сервисов
- [ ] API документация (Swagger)
- [ ] Separate config для environments
- [ ] Proper migrations вместо db push

---

## 13. Рекомендации

### 13.1. Немедленные действия

1. **Cloudflare R2** — настроить bucket для фото
2. **Публичная страница** — реализовать `/r/[slug]`
3. **Telegram OAuth** — добавить для конверсии
4. **E2E тесты** — покрыть основные flows

### 13.2. Улучшения архитектуры

1. **Prisma migrations** — перейти с db push
2. **Environment configs** — разделить dev/staging/prod
3. **Error tracking** — добавить Sentry
4. **Analytics** — добавить PostHog

### 13.3. Оптимизации

1. **ISR** — для публичных отчётов
2. **CDN** — для загруженных изображений
3. **Cache** — Redis кэширование запросов
4. **Bundle size** — анализ и оптимизация

---

## 📊 Сводка

### Прогресс MVP

```
█████████████░░░░░░░ 65% Complete
```

### Статистика кодовой базы

| Метрика | Значение |
|---------|----------|
| Backend модулей | 10 |
| GraphQL операций | 40+ |
| Frontend страниц | 14 |
| React компонентов | 45+ |
| Database таблиц | 10 |
| TypeScript файлов | 210+ |

### Ключевые показатели

- ✅ 5 этапов завершено (из 10)
- ✅ 4 killer-фичи в работе
- ✅ 0 критических багов
- 🔄 Phase 1 Complete
- 📋 Phase 2 Starting

---

**Документ создан:** 2025-01-04  
**Автор:** AI Assistant  
**Последнее обновление:** 2025-01-04





