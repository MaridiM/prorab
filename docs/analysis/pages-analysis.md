# Анализ текущего состояния и недостающих страниц ProRab.space

**Дата анализа:** 2025-12-05
**Статус:** Завершен

---

## Исполнительное резюме

На основе анализа документации и текущего состояния кодовой базы:

- ✅ **Реализовано:** Базовая инфраструктура (auth, onboarding, teams, projects CRUD)
- ❌ **Отсутствует:** Критичный функционал MVP (расходы, фотоотчеты, финансы, зарплата)
- ⏰ **Оценка:** 8-12 дней разработки для полного MVP

**Рекомендация:** Начать с Фазы 1 (Расходы + Финансовый виджет) как фундамента для всех остальных фич.

---

## Текущее состояние проекта

### ✅ Уже реализовано

#### Публичные страницы
- [/](/) - Landing page (полностью реализован с недавним редизайном)
- [/auth/login](/auth/login) - Вход
- [/auth/register](/auth/register) - Регистрация
- [/auth/forgot-password](/auth/forgot-password) - Восстановление пароля
- [/auth/reset-password](/auth/reset-password) - Сброс пароля

#### Онбординг (полный flow)
- [/onboarding](/onboarding) - Стартовая страница
- [/onboarding/step-1](/onboarding/step-1) - Название бригады
- [/onboarding/step-2](/onboarding/step-2) - Логотип/иконка/цвет
- [/onboarding/step-3](/onboarding/step-3) - Первый объект
- [/onboarding/invite](/onboarding/invite) - Присоединение по коду

#### Защищенные страницы
- [/dashboard](/dashboard) - Главный дашборд (**stub**: показывает feature cards с "Coming Soon")
- [/teams](/teams) - Список команд ✅
- [/teams/[teamId]](/teams/[teamId]) - Dashboard команды со списком проектов ✅
- [/teams/[teamId]/projects/new](/teams/[teamId]/projects/new) - Создание проекта ✅
- [/teams/[teamId]/projects/[projectId]](/teams/[teamId]/projects/[projectId]) - Детали проекта (**частично**: только вкладка "Инфо")
- [/teams/[teamId]/projects/[projectId]/edit](/teams/[teamId]/projects/[projectId]/edit) - Редактирование проекта ✅

#### GraphQL API (Backend)
**Реализовано:**
- ✅ Auth: `register`, `login`, `logout`, `refreshSession`, `forgotPassword`, `resetPassword`, `changePassword`, `verifyEmail`, `me`
- ✅ Teams: `myTeams`, `completeOnboarding`
- ✅ Projects: `project`, `projectsByTeam`, `projectStats`, `createProject`, `updateProject`, `archiveProject`, `restoreProject`, `updateProjectProgress`

**Отсутствует:**
- ❌ Expenses API
- ❌ Photo Reports API
- ❌ Tasks API
- ❌ Team Members API (расширенная)
- ❌ Salary Calculation API
- ❌ Subscription/Pricing API

#### Компоненты (Frontend)
**Реализовано:**
- ✅ ProjectCard, ProjectForm
- ✅ UI Kit: Button, Card, Badge, Input, DatePicker, Select, Spinner, Skeleton, ProgressBar
- ✅ ImageUpload, IconPicker, TeamLogo
- ✅ Form components (react-hook-form + Zod)

**Отсутствует:**
- ❌ ExpenseForm, ExpenseCard, ExpenseList
- ❌ PhotoReportForm, PublicPhotoReport, ReactionButtons
- ❌ FinancialDashboard, ChartComponents
- ❌ KanbanBoard, TaskCard
- ❌ TeamSettings, MembersList, PaymentSettingsForm
- ❌ SalaryCalculator

---

## Критичные пробелы в MVP

### 🔴 Tier 1: Блокирует MVP (КРИТИЧНО)

#### 1. Учет расходов (Expenses)
**Приоритет:** 🔴🔴🔴 Максимальный
**Статус:** ❌ Полностью отсутствует
**Блокирует:** Финансовый виджет, расчет прибыли, расчет зарплаты

**Что нужно:**
- Backend: GraphQL API для расходов
- Frontend: Форма добавления расхода (modal, UX 3-5 сек)
- Frontend: Вкладка "Расходы" на странице проекта
- File Storage: Интеграция с Cloudflare R2 для фото чеков

**Impact:** Без этого нет core value proposition - "Где мои деньги?"

---

#### 2. Финансовый виджет
**Приоритет:** 🔴🔴🔴 Максимальный
**Статус:** ❌ Отсутствует
**Зависит от:** Expenses API

**Что нужно:**
- Компонент FinancialDashboard с крупными цифрами:
  - Сумма договора
  - Потрачено всего (из расходов)
  - Осталось в бюджете
  - Прибыль объекта (% и сумма)
  - Распределение прибыли (на бригаду vs чистая)
- Круговая диаграмма расходов по категориям
- Топ-5 самых дорогих статей
- **Видимость:** Только для владельца (OWNER role)

**Impact:** Это ключевая фича - показывает реальную прибыль, делает прорабов богаче на 10-20%

---

#### 3. Публичные фотоотчеты (Killer Feature #1)
**Приоритет:** 🔴🔴🔴 Максимальный
**Статус:** ❌ Полностью отсутствует
**Блокирует:** Виральный механизм роста

**Что нужно:**
- Backend: PhotoReport API с публичным endpoint (без auth)
- Frontend: Форма создания отчета (modal)
- Frontend: Публичная страница `/r/[slug]`
- Features:
  - Генерация уникального slug
  - Галерея с lightbox и зумом
  - Реакции на фото (❤️ ✅ ❓)
  - Deep links для WhatsApp/Telegram
  - SEO optimization

**Impact:**
- Виральный рост через клиентов
- Killer feature - то, за что платят сразу
- Сокращает звонки клиентов в 3 раза

---

### 🟡 Tier 2: Важно для full MVP

#### 4. Управление командой и участниками
**Приоритет:** 🟡 Высокий
**Статус:** ❌ Частично (базовая модель есть, UI нет)

**Что нужно:**
- Страница `/settings/team`
- Список участников с управлением
- Генерация invite links/QR
- Настройка типов оплаты для участников

---

#### 5. Автоматический расчет зарплаты (Killer Feature #2)
**Приоритет:** 🟡 Высокий
**Статус:** ❌ Отсутствует
**Зависит от:** Expenses API, Team Members API

**Что нужно:**
- Backend: Логика расчета для 5 типов оплаты
  - % от прибыли
  - Фикс за объект
  - За м²
  - За день
  - Почасовая
- Frontend: SalaryCalculator (modal или страница)
- Функция закрытия объекта
- Копирование расчета в WhatsApp

**Impact:** Закрывает боль "Сколько кому платить?" - экономит часы и избегает скандалов

---

### 🟢 Tier 3: Nice to have (можно отложить)

- Kanban Tasks (полезно, но не критично)
- Pricing Page (нужно для монетизации, но можно позже)
- User Profile (стандартный функционал)
- Invite Acceptance Page

---

## Рекомендуемый порядок реализации

### Фаза 1: Финансовый учет 💰
**Сроки:** 2-3 дня
**Приоритет:** 🔴 Критичный

**Последовательность:**

1. **Backend: Expenses API**
   - Создать Prisma schema для Expense
   - Реализовать GraphQL типы
   - Реализовать resolvers: `projectExpenses`, `createExpense`, `updateExpense`, `deleteExpense`
   - Интегрировать Cloudflare R2 для фото

2. **Frontend: Expenses UI**
   - ExpenseForm (modal) - UX 3-5 секунд
   - ExpenseList - хронологическая лента
   - ExpenseCard - карточка с фото, категорией, суммой
   - Вкладка "Расходы" на странице проекта

3. **Frontend: Financial Widget**
   - FinancialDashboard компонент
   - Расчет прибыли (бюджет - расходы)
   - Круговая диаграмма (recharts)
   - Условный рендеринг для OWNER

**Критичные файлы:**
```
apps/api/src/modules/expenses/ (новый)
apps/web/src/packages/api/graphql/expenses.graphql (новый)
apps/web/src/packages/components/expenses/ (новый)
apps/web/src/app/(root)/(protected)/teams/[teamId]/projects/[projectId]/page.tsx
```

**Успех измеряется:**
- ✅ Прораб может добавить расход за 3-5 секунд
- ✅ Финансовый виджет показывает реальную прибыль
- ✅ Фильтры по категориям работают
- ✅ Фото чеков загружаются и отображаются

---

### Фаза 2: Фотоотчеты клиенту 📸
**Сроки:** 2-3 дня
**Приоритет:** 🔴 Критичный (Killer Feature)

**Последовательность:**

1. **Backend: Photo Reports API**
   - Prisma schema для PhotoReport
   - GraphQL типы и resolvers
   - Генерация уникального slug (nanoid)
   - **Публичный** endpoint `photoReportBySlug` (без auth!)
   - Реакции на фото

2. **Frontend: Create Photo Report**
   - PhotoReportForm (modal)
   - Drag-to-reorder фото
   - Голосовой ввод (Web Speech API)
   - Копирование ссылки
   - Deep links WhatsApp/Telegram

3. **Frontend: Public Report Page**
   - Страница `/r/[slug]` (публичная)
   - Галерея с lightbox
   - Реакции (интерактивные)
   - Кнопка "Связаться"
   - SEO meta tags

4. **Frontend: Reports Tab**
   - Вкладка "Фотоотчеты"
   - ReportsList
   - ReportCard с preview

**Критичные файлы:**
```
apps/api/src/modules/photo-reports/ (новый)
apps/web/src/packages/api/graphql/photo-reports.graphql (новый)
apps/web/src/packages/components/photo-reports/ (новый)
apps/web/src/app/r/[slug]/page.tsx (новый - PUBLIC!)
apps/web/src/app/(root)/(protected)/teams/[teamId]/projects/[projectId]/page.tsx
```

**Успех измеряется:**
- ✅ Прораб создает отчет за 1 минуту
- ✅ Клиент открывает `/r/[slug]` без логина
- ✅ Реакции работают и видны прорабу
- ✅ Ссылка копируется и открывается в WhatsApp

---

### Фаза 3: Команда и зарплата 👥
**Сроки:** 2-3 дня
**Приоритет:** 🟡 Важный

**Последовательность:**

1. **Backend: Team Members API**
   - Расширить Team/TeamMember schemas
   - Queries: `teamMembers`
   - Mutations: `updateTeam`, `generateInviteLink`, `removeTeamMember`, `updateMemberPaymentSettings`

2. **Backend: Salary Calculation**
   - Query: `calculateProjectSalary`
   - Mutation: `closeProject`
   - Логика для 5 типов оплаты

3. **Frontend: Team Settings**
   - Страница `/settings/team`
   - TeamSettingsForm
   - MembersList
   - Invite links/QR generation

4. **Frontend: Member Payment**
   - Страница `/settings/team/members/[id]/payment`
   - PaymentSettingsForm
   - Превью расчета

5. **Frontend: Salary Calculator**
   - SalaryCalculator (modal/page)
   - Breakdown по участникам
   - Копирование в WhatsApp

**Критичные файлы:**
```
apps/api/src/modules/teams/ (расширение)
apps/api/src/modules/projects/ (добавить closeProject)
apps/web/src/app/(root)/(protected)/settings/team/ (новый)
apps/web/src/packages/components/team-settings/ (новый)
```

**Успех измеряется:**
- ✅ Прораб настраивает тип оплаты для участника
- ✅ Расчет зарплаты работает для всех типов
- ✅ Генерация WhatsApp сообщения корректна
- ✅ Объект закрывается с фиксацией расчетов

---

### Фаза 4: Дополнительные функции 📋
**Сроки:** 2-3 дня
**Приоритет:** 🟢 Средний

1. **Kanban Tasks** - вкладка на странице проекта
2. **Pricing Page** - `/pricing` с ЮKassa
3. **User Profile** - `/settings/profile`
4. **Invite Acceptance** - `/invite/[token]`

---

## Архитектурные требования

### Разделение прав доступа

**КРИТИЧНО:** Реализовать на 3 уровнях:

1. **Backend (GraphQL resolvers):**
```typescript
// Проверка роли в context
if (ctx.user.role !== 'OWNER') {
  throw new ForbiddenError('Only team owner can access financial data');
}
```

2. **Frontend (Components):**
```typescript
// Условный рендеринг
{user.role === 'OWNER' && (
  <FinancialDashboard projectId={projectId} />
)}
```

3. **Middleware:**
```typescript
// Проверка на уровне роутов
if (requiresOwner && user.role !== 'OWNER') {
  return redirect('/dashboard');
}
```

### Роли и права

| Роль | Финансы | Зарплаты | Настройки команды | Расходы | Отчеты | Задачи |
|------|---------|----------|-------------------|---------|--------|--------|
| **OWNER** | ✅ Все | ✅ Все | ✅ Все | ✅ Все | ✅ Все | ✅ Все |
| **MEMBER** | ❌ Скрыто | ❌ Скрыто | ❌ Скрыто | ✅ Добавить | ✅ Создать | ✅ Просмотр |

---

## Технические детали

### Текущий стек
- **Frontend:** Next.js 14+ (App Router), React, TypeScript
- **State:** Apollo Client, React Context, Zustand
- **Forms:** react-hook-form + Zod
- **UI:** Radix UI + Tailwind CSS
- **Backend:** Node.js, GraphQL, Prisma ORM
- **DB:** PostgreSQL
- **Storage:** Cloudflare R2

### Нужно добавить

**NPM пакеты:**
```json
{
  "recharts": "^2.x",          // Диаграммы для финансового виджета
  "@dnd-kit/core": "^6.x",     // Drag & Drop для Kanban
  "yet-another-react-lightbox": "^3.x", // Lightbox для фото
  "qrcode": "^1.x",            // QR коды для invite
  "nanoid": "^5.x"             // Генерация slug для отчетов
}
```

**Web APIs (встроенные):**
- Web Speech API - голосовой ввод
- Clipboard API - копирование ссылок

---

## Метрики успеха MVP

### После Фазы 1 (Расходы):
- ✅ Прораб добавляет расход за < 5 секунд
- ✅ Финансовый виджет показывает точную прибыль
- ✅ 0 ошибок в расчетах

### После Фазы 2 (Фотоотчеты):
- ✅ Создание отчета < 1 минуты
- ✅ Клиент открывает `/r/[slug]` без багов
- ✅ Реакции работают real-time
- ✅ 90%+ клиентов используют вместо звонков

### После Фазы 3 (Зарплата):
- ✅ Расчет зарплаты за < 2 секунды
- ✅ 0 ошибок в формулах для всех типов оплаты
- ✅ WhatsApp сообщение генерируется корректно

### После всех фаз:
- ✅ Полный MVP готов к продакшн-запуску
- ✅ Все 3 "боли прораба" закрыты
- ✅ Готово к масштабированию до 10k+ пользователей

---

## Риски и митигация

### Риск 1: Безопасность публичных отчетов
**Проблема:** `/r/[slug]` доступен всем
**Митигация:**
- Уникальные slug (nanoid 21 символов = 2^126 вариантов)
- Rate limiting на публичный endpoint
- Никаких sensitive данных (телефоны, адреса, финансы)

### Риск 2: Ошибки в расчетах зарплаты
**Проблема:** Некорректные формулы → скандалы
**Митигация:**
- Unit тесты для всех типов оплаты
- Превью расчета перед закрытием
- Логирование всех расчетов

### Риск 3: Перегрузка фото
**Проблема:** Загрузка 20 фото по 10MB каждое
**Митигация:**
- Сжатие на клиенте (browser-image-compression)
- Лимит 5MB на фото
- Cloudflare R2 для быстрой отдачи

---

## Следующие действия

1. ✅ **Анализ завершен** - документ сохранен
2. ⏳ **Ожидание:** Подтверждение пользователя о старте Фазы 1
3. ⏳ **Подготовка:** Обзор Prisma schemas для Expense
4. ⏳ **Старт:** Backend разработка Expenses API

**Рекомендация:** Начать немедленно с **Фазы 1**, так как расходы - фундамент для всех остальных фич.

---

## Приложение: Структура файлов

### Новые директории для создания

```
apps/api/src/modules/
├── expenses/                   # Фаза 1
│   ├── expenses.module.ts
│   ├── expenses.service.ts
│   ├── expenses.resolver.ts
│   └── dto/
├── photo-reports/              # Фаза 2
│   ├── photo-reports.module.ts
│   ├── photo-reports.service.ts
│   ├── photo-reports.resolver.ts
│   └── dto/

apps/web/src/packages/
├── api/graphql/
│   ├── expenses.graphql        # Фаза 1
│   └── photo-reports.graphql   # Фаза 2
├── components/
│   ├── expenses/               # Фаза 1
│   │   ├── ExpenseForm.tsx
│   │   ├── ExpenseList.tsx
│   │   └── ExpenseCard.tsx
│   ├── photo-reports/          # Фаза 2
│   │   ├── PhotoReportForm.tsx
│   │   ├── PublicPhotoReport.tsx
│   │   └── ReactionButtons.tsx
│   └── team-settings/          # Фаза 3
│       ├── TeamSettingsForm.tsx
│       ├── MembersList.tsx
│       └── PaymentSettingsForm.tsx

apps/web/src/app/
├── r/[slug]/                   # Фаза 2 - ПУБЛИЧНАЯ страница
│   └── page.tsx
└── (root)/(protected)/
    └── settings/team/          # Фаза 3
        ├── page.tsx
        └── members/[id]/payment/
            └── page.tsx
```

---

**Конец документа**
