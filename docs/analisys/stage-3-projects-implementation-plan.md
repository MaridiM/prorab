# План реализации: Этап 3 - Проекты (Projects)

## Статус: 📋 Планируется

**Предыдущий этап:** Этап 2.1 (Онбординг и Teams) завершён ✅
**Текущая задача:** Реализовать полный CRUD функционал для проектов с UI
**Цель:** Пользователи могут создавать, редактировать, просматривать и архивировать проекты

---

## Текущее состояние

### ✅ Что уже реализовано:
- Database: Модель `Project` с базовыми полями (id, teamId, name, address, description, isActive)
- Backend: Минимальный ProjectsModule (закомментирован из-за конфликта типов)
- Frontend: Базовый Team Dashboard (заглушка)
- GraphQL: Тип Project в Teams модуле (полный, правильный)

### ❌ Что нужно добавить:
- Расширенные поля проекта (budget, dates, progress, status)
- Полный CRUD API (create, read, update, archive)
- Frontend страницы (dashboard, create, edit, details)
- UI компоненты (ProjectCard, ProjectForm, DatePicker)
- Валидация прав доступа (членство в команде)

---

## Критические проблемы

### 🔴 ПРОБЛЕМА #1: Конфликт GraphQL типов
**Описание:** Существуют две модели Project:
- `apps/api/src/modules/projects/models/project.model.ts` - неполная, с `Int` ID
- `apps/api/src/modules/teams/models/project.model.ts` - полная, с `String` ID

**Решение:** Удалить модель из `projects/models/`, использовать модель из Teams

### 🔴 ПРОБЛЕМА #2: ProjectsModule отключен
**Файл:** `apps/api/src/app.module.ts:17`
**Причина:** Конфликт типов
**Решение:** После исправления конфликта - включить модуль обратно

---

## Архитектура решения

### 1. DATABASE CHANGES

**Миграция:** `add_project_extended_fields`

**Добавить enum:**
```prisma
enum ProjectStatus {
  ACTIVE
  ARCHIVED
  COMPLETED
}
```

**Добавить поля в Project:**
```prisma
model Project {
  // ... существующие поля

  // Финансовые
  budget       Decimal?  @db.Decimal(12, 2)
  clientPhone  String?

  // Даты
  startDate    DateTime?
  endDate      DateTime?

  // Метаданные
  photoUrl     String?
  progress     Int       @default(0) // 0-100
  notes        String?   @db.Text
  status       ProjectStatus @default(ACTIVE)
  archivedAt   DateTime?
  completedAt  DateTime?

  @@index([teamId, status])
  @@index([status])
}
```

**Удалить:** Поле `isActive` (заменено на `status`)

---

### 2. BACKEND API

**Структура модуля:**
```
apps/api/src/modules/projects/
├── dto/
│   ├── create-project.input.ts      [UPDATE]
│   ├── update-project.input.ts      [CREATE]
│   └── project-filter.input.ts      [CREATE]
├── models/
│   ├── project.model.ts             [DELETE - использовать из Teams]
│   ├── project-stats.model.ts       [CREATE]
│   └── project-status.enum.ts       [CREATE]
├── projects.service.ts              [UPDATE]
├── projects.resolver.ts             [UPDATE]
└── projects.module.ts               [UPDATE]
```

#### 2.1 Service Layer

**Основные методы:**

**Queries:**
- `findById(id, userId)` - Получить проект по ID с проверкой доступа
- `findByTeam(teamId, userId, filter?)` - Список проектов команды с фильтрацией
- `getProjectStats(projectId, userId)` - Статистика проекта (заглушка для Этапа 4)

**Mutations:**
- `create(userId, input)` - Создать проект (с проверкой лимитов)
- `update(id, userId, input)` - Обновить проект
- `archive(id, userId)` - Архивировать проект
- `restore(id, userId)` - Восстановить из архива
- `updateProgress(id, userId, progress)` - Обновить прогресс (0-100%)

**Validation Helpers:**
- `validateTeamAccess(teamId, userId)` - Проверка членства в команде
- `validateProjectAccess(projectId, userId)` - Проверка доступа к проекту
- `checkProjectLimit(teamId)` - Проверка лимита активных проектов (10 для MVP)

#### 2.2 Resolver Layer

**GraphQL Queries:**
```graphql
query Project($id: ID!) {
  project(id: $id) {
    id
    teamId
    name
    address
    description
    budget
    clientPhone
    startDate
    endDate
    photoUrl
    progress
    notes
    status
    createdById
    createdAt
    updatedAt
    archivedAt
    completedAt
  }
}

query ProjectsByTeam($teamId: ID!, $filter: ProjectFilterInput) {
  projectsByTeam(teamId: $teamId, filter: $filter) {
    id
    name
    address
    budget
    progress
    status
    startDate
    endDate
    photoUrl
    createdAt
  }
}

query ProjectStats($projectId: ID!) {
  projectStats(projectId: $projectId) {
    totalExpenses
    profit
    expenseCount
    taskCount
    reportCount
  }
}
```

**GraphQL Mutations:**
```graphql
mutation CreateProject($input: CreateProjectInput!) {
  createProject(input: $input) {
    id
    name
    teamId
    createdAt
  }
}

mutation UpdateProject($id: ID!, $input: UpdateProjectInput!) {
  updateProject(id: $id, input: $input) {
    id
    name
    # ... все поля
  }
}

mutation ArchiveProject($id: ID!) {
  archiveProject(id: $id) {
    id
    status
    archivedAt
  }
}

mutation RestoreProject($id: ID!) {
  restoreProject(id: $id) {
    id
    status
    archivedAt
  }
}

mutation UpdateProjectProgress($id: ID!, $progress: Int!) {
  updateProjectProgress(id: $id, progress: $progress) {
    id
    progress
    status
    completedAt
  }
}
```

---

### 3. FRONTEND IMPLEMENTATION

#### 3.1 Dependencies

**Установить:**
```bash
cd apps/web
npm install react-day-picker date-fns
npm install recharts  # для диаграмм (опционально)
```

#### 3.2 UI Components

**DatePicker (shadcn/ui style):**
- React Day Picker integration
- Russian locale support (date-fns)
- Date range validation
- Tailwind styling

**ProjectCard:**
- Project photo display
- Name and address
- Progress bar (0-100%)
- Status badge (ACTIVE, ARCHIVED, COMPLETED)
- Click handler for navigation

**ProjectForm:**
- React Hook Form integration
- Zod validation schema
- Fields: name, address, description, budget, clientPhone, startDate, endDate, notes
- Date validation (endDate >= startDate)
- Budget validation (positive number)
- Phone validation (regex pattern)

#### 3.3 Pages Structure

```
apps/web/src/app/(root)/(protected)/
└── teams/
    └── [teamId]/
        ├── page.tsx                    [UPDATE] - Dashboard со списком
        └── projects/
            ├── new/
            │   └── page.tsx            [CREATE] - Форма создания
            └── [projectId]/
                ├── page.tsx            [CREATE] - Детали проекта
                └── edit/
                    └── page.tsx        [CREATE] - Форма редактирования
```

**Team Dashboard Page:** `/teams/[teamId]/page.tsx`
- ProjectsByTeam GraphQL query
- Grid layout для карточек проектов
- Filters: Active / Archived tabs
- FAB button "Новый проект"
- Empty state (нет проектов)
- Loading state (skeleton loaders)

**Create Project Page:** `/teams/[teamId]/projects/new/page.tsx`
- ProjectForm component
- CreateProject mutation
- Success toast + redirect на `/teams/${teamId}/projects/${projectId}`
- Error handling (лимиты, валидация)

**Project Details Page:** `/teams/[teamId]/projects/[projectId]/page.tsx`
- Project query по ID
- Tabs navigation:
  - **Инфо** - основная информация (active)
  - **Расходы** - заглушка "Будет в Этапе 4"
  - **Задачи** - заглушка "Будет в Этапе 7"
  - **Фотоотчеты** - заглушка "Будет в Этапе 5"
- Кнопка "Редактировать"
- Кнопка "В архив" / "Восстановить"

**Edit Project Page:** `/teams/[teamId]/projects/[projectId]/edit/page.tsx`
- ProjectForm с defaultValues из query
- UpdateProject mutation
- Success toast + redirect обратно
- Cancel button

#### 3.4 Validation Schemas (Zod)

```typescript
export const createProjectSchema = z.object({
  name: z
    .string()
    .min(2, 'Название должно содержать минимум 2 символа')
    .max(100, 'Название должно содержать максимум 100 символов')
    .trim(),

  address: z.string().optional(),

  description: z.string().optional(),

  budget: z
    .number()
    .positive('Бюджет должен быть больше 0')
    .optional(),

  clientPhone: z
    .string()
    .regex(/^\+?[0-9]{10,15}$/, 'Некорректный формат телефона')
    .optional(),

  startDate: z.date().optional(),

  endDate: z.date().optional(),

  notes: z.string().optional()
}).refine(
  (data) => {
    if (data.startDate && data.endDate) {
      return data.endDate >= data.startDate;
    }
    return true;
  },
  {
    message: 'Дата завершения не может быть раньше даты начала',
    path: ['endDate']
  }
);

export const updateProjectSchema = createProjectSchema.partial();
```

---

## План реализации (пошаговый)

### ФАЗА 1: Backend Foundation (3 дня)

#### День 1: Database & Models
- [ ] Создать миграцию `add_project_extended_fields`
- [ ] Добавить enum ProjectStatus
- [ ] Добавить новые поля в Project model
- [ ] Выполнить миграцию: `npx prisma migrate dev`
- [ ] Сгенерировать Prisma Client: `npx prisma generate`

#### День 2: GraphQL Schema & DTOs
- [ ] Удалить `projects/models/project.model.ts`
- [ ] Создать `project-status.enum.ts` и зарегистрировать в GraphQL
- [ ] Создать `UpdateProjectInput`
- [ ] Создать `ProjectFilterInput`
- [ ] Создать `ProjectStats` model (заглушка)
- [ ] Обновить `CreateProjectInput` (добавить новые поля)

#### День 3: Service & Resolver
- [ ] Расширить ProjectsService (все методы из плана)
- [ ] Добавить валидацию доступа (validateTeamAccess, validateProjectAccess)
- [ ] Добавить проверку лимитов (checkProjectLimit)
- [ ] Расширить ProjectsResolver (queries + mutations)
- [ ] Раскомментировать ProjectsModule в app.module.ts
- [ ] Протестировать GraphQL Playground

---

### ФАЗА 2: Frontend Foundation (2 дня)

#### День 4: Dependencies & UI Components
- [ ] Установить `react-day-picker` и `date-fns`
- [ ] Создать DatePicker component (shadcn/ui стиль)
- [ ] Создать ProjectCard component
- [ ] Создать ProjectForm component
- [ ] Создать ProjectProgressBar component

#### День 5: GraphQL & Schemas
- [ ] Создать `projects.graphql` с queries и mutations
- [ ] Запустить `npm run codegen`
- [ ] Создать `project.schema.ts` (Zod валидация)
- [ ] Протестировать queries в Apollo DevTools

---

### ФАЗА 3: Pages Implementation (4 дня)

#### День 6: Dashboard
- [ ] Обновить `/teams/[teamId]/page.tsx` (ProjectList)
- [ ] Добавить фильтры (Active/Archived tabs)
- [ ] Добавить FAB кнопку "Новый проект"
- [ ] Реализовать empty state (нет проектов)
- [ ] Реализовать loading state (skeleton)

#### День 7: Create Page
- [ ] Создать `/teams/[teamId]/projects/new/page.tsx`
- [ ] Интегрировать ProjectForm
- [ ] Реализовать CreateProject mutation
- [ ] Добавить success toast + redirect
- [ ] Обработка ошибок (лимиты, валидация)

#### День 8: Details Page
- [ ] Создать `/teams/[teamId]/projects/[projectId]/page.tsx`
- [ ] Реализовать Tabs (Инфо, Расходы, Задачи, Фотоотчеты)
- [ ] Вкладка "Инфо" с данными проекта
- [ ] Кнопка "Редактировать"
- [ ] Кнопка "В архив" (archive mutation)
- [ ] Заглушки для остальных вкладок

#### День 9: Edit Page
- [ ] Создать `/teams/[teamId]/projects/[projectId]/edit/page.tsx`
- [ ] Интегрировать ProjectForm с defaultValues
- [ ] Реализовать UpdateProject mutation
- [ ] Автосохранение (debounced, опционально)
- [ ] Success toast + redirect обратно

---

### ФАЗА 4: Polish & Testing (2 дня)

#### День 10: UX Improvements
- [ ] Оптимизация loading states (skeleton loaders)
- [ ] Error boundaries для страниц
- [ ] Toast notifications для всех операций
- [ ] Mobile responsive проверка
- [ ] Dark mode проверка

#### День 11: Testing & Documentation
- [ ] E2E тест: создание → редактирование → архивация → восстановление
- [ ] Проверка лимитов тарифа
- [ ] Проверка прав доступа (только члены команды)
- [ ] Обновить roadmap.md (отметить Этап 3 как завершённый)
- [ ] Обновить changelog.md
- [ ] Создать тестовый лог `docs/reports/logs/2025-12-XX-e2e-testing-projects.md`

---

## Критические файлы для изменения

### Backend:
1. `apps/api/prisma/schema.prisma` - добавить поля + enum
2. `apps/api/src/modules/projects/models/project.model.ts` - УДАЛИТЬ
3. `apps/api/src/modules/projects/dto/create-project.input.ts` - обновить
4. `apps/api/src/modules/projects/projects.service.ts` - расширить
5. `apps/api/src/modules/projects/projects.resolver.ts` - расширить
6. `apps/api/src/app.module.ts` - раскомментировать ProjectsModule

### Frontend:
1. `apps/web/src/packages/api/graphql/projects.graphql` - создать
2. `apps/web/src/packages/schemas/projects/project.schema.ts` - создать
3. `apps/web/src/packages/components/ui/date-picker.tsx` - создать
4. `apps/web/src/packages/components/projects/project-card.tsx` - создать
5. `apps/web/src/packages/components/projects/project-form.tsx` - создать
6. `apps/web/src/app/(root)/(protected)/teams/[teamId]/page.tsx` - обновить
7. Создать 3 новые страницы: new, [projectId], [projectId]/edit

---

## Риски и митигация

### Риск 1: Конфликт GraphQL типов
**Решение:** Удалить старую модель из `projects/models/`, использовать из Teams
**Приоритет:** Критичный, блокирует старт

### Риск 2: Финансовый виджет без модели Expense
**Решение:** Реализовать заглушку ProjectStats с нулями
**Приоритет:** Средний, можно отложить на Этап 4

### Риск 3: Миграция существующих проектов (created via onboarding)
**Решение:** Default значения для новых полей, manual update через UI
**Приоритет:** Низкий, данных пока мало

---

## Критерии успеха

- [ ] Пользователь может создать проект с полными данными
- [ ] Пользователь может редактировать все поля проекта
- [ ] Пользователь видит список проектов своей команды
- [ ] Пользователь может фильтровать по статусу (активные/архивные)
- [ ] Пользователь может архивировать/восстанавливать проекты
- [ ] Пользователь видит детальную страницу проекта с вкладками
- [ ] Валидация лимитов тарифа работает
- [ ] Права доступа работают (только члены команды)
- [ ] Mobile responsive
- [ ] E2E тест пройден

---

## Следующий этап

После завершения Этапа 3 → **Этап 4: Файлы и расходы**
- Модель Expense
- Загрузка чеков/документов (Cloudflare R2)
- Финансовый виджет с реальными данными
- Категории расходов

---

## Заметки

- Для Этапа 3 финансовый виджет будет заглушкой (mock данные)
- Вкладки "Расходы", "Задачи", "Фотоотчеты" - заглушки с текстом "Будет в Этапе N"
- Лимиты тарифа hardcoded (10 активных проектов), интеграция с Subscription в Этапе 8
- DatePicker использует react-day-picker (совместим с next-intl через date-fns/locale)
