# План: Реализация системы онбординга и wizard создания команды

## Обзор задачи

Реализовать систему создания и управления бригадами (Teams) для приложения ProRab.app, включающую:

1. **Обязательный онбординг** после первого входа (3 шага)
2. **Wizard создания дополнительных команд** (переиспользует логику онбординга)
3. **Система приглашений** через 6-значные коды ("Меня пригласили")

---

## Архитектурная концепция

### Ключевые принципы

**Разделение ответственности:**
- **Onboarding** - обязательный flow для новых пользователей (упрощенная версия wizard)
- **Wizard** - полноценный инструмент создания команд (доступен после онбординга)
- **Shared Logic** - оба используют одинаковые компоненты и валидацию

**Два входных потока на первом экране:**
```
┌─────────────────────────────────┐
│   Добро пожаловать в ProRab     │
├─────────────────────────────────┤
│  ┌───────────────────────────┐  │
│  │   Начать настройку        │  │ → Онбординг (3 шага)
│  └───────────────────────────┘  │
│                                 │
│  ┌───────────────────────────┐  │
│  │   Меня пригласили         │  │ → Ввод 6-значного кода
│  └───────────────────────────┘  │
└─────────────────────────────────┘
```

**Шаги онбординга:**
1. **Имя бригады** (обязательно)
2. **Логотип** (опционально - можно пропустить, будет placeholder)
3. **Первый объект** (обязательно - только название, остальное демо-данные)

---

## Backend: Модели данных (Prisma)

### 1. Team Model

**Файл:** `apps/api/prisma/schema.prisma`

```prisma
model Team {
  id        String   @id @default(cuid())
  ownerId   String
  owner     User     @relation("TeamOwner", fields: [ownerId], references: [id], onDelete: Cascade)

  name      String
  slug      String   @unique
  logoUrl   String?
  color     String?

  plan      TeamPlan @default(TRIAL)
  status    TeamStatus @default(ACTIVE)

  currency  String   @default("RUB")
  locale    String   @default("ru-RU")

  settings  Json?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  members   TeamMember[]
  invites   InviteCode[]
  projects  Project[]

  @@index([ownerId])
  @@index([slug])
}

enum TeamPlan {
  TRIAL
  LIGHT
  FOREMAN
  BRIGADE
}

enum TeamStatus {
  ACTIVE
  SUSPENDED
  ARCHIVED
}
```

### 2. TeamMember Model

```prisma
model TeamMember {
  id     String @id @default(cuid())
  teamId String
  team   Team   @relation(fields: [teamId], references: [id], onDelete: Cascade)
  userId String
  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)

  role        TeamRole   @default(MEMBER)
  status      MemberStatus @default(ACTIVE)
  permissions Json?

  joinedAt DateTime @default(now())
  leftAt   DateTime?

  paymentType   PaymentType?
  paymentAmount Decimal?     @db.Decimal(10, 2)

  @@unique([teamId, userId])
  @@index([userId])
  @@index([teamId])
}

enum TeamRole {
  OWNER
  MEMBER
}

enum MemberStatus {
  ACTIVE
  INACTIVE
  REMOVED
}

enum PaymentType {
  PERCENTAGE
  FIXED
  PER_AREA
  PER_DAY
  HOURLY
}
```

### 3. InviteCode Model

```prisma
model InviteCode {
  id     String @id @default(cuid())
  teamId String
  team   Team   @relation(fields: [teamId], references: [id], onDelete: Cascade)

  code      String @unique
  role      TeamRole   @default(MEMBER)
  createdBy String
  expiresAt DateTime
  usedAt    DateTime?
  usedBy    String?

  createdAt DateTime @default(now())

  @@index([code])
  @@index([teamId])
}
```

### 4. Project Model

```prisma
model Project {
  id     String @id @default(cuid())
  teamId String
  team   Team   @relation(fields: [teamId], references: [id], onDelete: Cascade)

  name        String
  address     String?
  clientPhone String?

  budget      Decimal  @db.Decimal(12, 2)

  startDate   DateTime?
  endDate     DateTime?

  progress    Int      @default(0)

  status      ProjectStatus @default(ACTIVE)
  isDemo      Boolean  @default(false)

  notes       String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  expenses    Expense[]
  reports     Report[]
  tasks       Task[]

  @@index([teamId])
  @@index([status])
}

enum ProjectStatus {
  ACTIVE
  ARCHIVED
  COMPLETED
}
```

### 5. Обновление User Model

```prisma
model User {
  id       String  @id @default(cuid())
  email    String  @unique
  password String?
  name     String?
  phone    String?

  hasCompletedOnboarding Boolean @default(false)

  ownedTeams   Team[]       @relation("TeamOwner")
  memberships  TeamMember[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([email])
}
```

---

## Backend: GraphQL API

### 1. Teams Module Structure

```
apps/api/src/modules/teams/
├── teams.module.ts
├── teams.resolver.ts
├── teams.service.ts
├── dto/
│   ├── create-team.input.ts
│   ├── update-team.input.ts
│   └── team-member.input.ts
├── entities/
│   ├── team.entity.ts
│   ├── team-member.entity.ts
│   └── invite-code.entity.ts
└── guards/
    └── team-owner.guard.ts
```

### 2. Teams Service (основная логика)

**Файл:** `apps/api/src/modules/teams/teams.service.ts`

**Ключевые методы:**
- `createTeam()` - создание бригады с автоматическим Owner
- `createDemoProject()` - создание первого демо-объекта
- `completeOnboarding()` - отметка завершения онбординга
- `createInviteCode()` - генерация 6-значного кода
- `joinTeamByInvite()` - присоединение по коду
- `getTeamsByUserId()` - получение всех бригад пользователя

**Валидации:**
- Owner может иметь только одну бригаду
- Owner не может присоединяться к чужим бригадам
- Проверка истечения кодов приглашения
- Проверка использования кодов

### 3. GraphQL Schema

**Файл:** `apps/api/src/modules/teams/teams.resolver.ts`

**Мутации:**
- `createTeam(input: CreateTeamInput): Team`
- `createDemoProject(teamId: String, projectName: String): Project`
- `completeOnboarding(): Boolean`
- `joinTeamByInvite(code: String): Team`
- `createInviteCode(teamId: String): String`

**Queries:**
- `myTeams(): [Team]`

---

## Backend: Upload Module

### 1. Upload Module Structure

```
apps/api/src/modules/uploads/
├── uploads.module.ts
├── uploads.resolver.ts
├── uploads.service.ts
└── dto/
    └── file-upload.scalar.ts
```

### 2. Uploads Service

**Файл:** `apps/api/src/modules/uploads/uploads.service.ts`

**Функциональность:**
- Валидация типа файла (PNG, JPG только)
- Валидация размера (2MB max)
- Resize до 512x512 через Sharp
- Сохранение в `/uploads/team-logos/`

**Note:** В production использовать Cloudflare R2/AWS S3

---

## Frontend: Компоненты UI

### 1. Stepper Component

**Файл:** `apps/web/src/packages/components/ui/stepper.tsx`

**Функциональность:**
- Отображение прогресса 3 шагов
- Состояния: completed, current, upcoming
- Иконка Check для завершенных шагов
- Адаптивный дизайн для мобильных

### 2. ImageUpload Component

**Файл:** `apps/web/src/packages/components/ui/image-upload.tsx`

**Функциональность:**
- Drag & drop или click to upload
- Валидация типа (PNG, JPG)
- Валидация размера (2MB max)
- Client-side resize до 512x512
- Preview загруженного изображения
- Кнопка удаления

### 3. Icon Picker Component

**Файл:** `apps/web/src/packages/components/ui/icon-picker.tsx`

**Функциональность:**
- 8-10 пресетных иконок (эмодзи)
- Grid layout 4 колонки
- Выделение выбранной иконки
- Каждая иконка имеет: emoji, name, color

**Пресеты:**
- 🔨 Молоток (#F59E0B)
- 🔧 Гаечный ключ (#6B7280)
- 🏠 Дом (#3B82F6)
- 🏢 Здание (#8B5CF6)
- 🛠️ Инструменты (#EF4444)
- 🎨 Краска (#EC4899)
- 🧱 Кирпич (#DC2626)
- ⛑️ Каска (#F59E0B)

---

## Frontend: Zod Schemas

### 1. Directory Structure

```
apps/web/src/packages/schemas/onboarding/
├── index.ts
├── team.schema.ts
├── project.schema.ts
└── invite.schema.ts
```

### 2. Team Schema

**Файл:** `apps/web/src/packages/schemas/onboarding/team.schema.ts`

```typescript
import { z } from 'zod'

export const teamSchema = z.object({
  name: z
    .string()
    .nonempty({ message: 'Название бригады обязательно' })
    .min(2, { message: 'Минимум 2 символа' })
    .max(100, { message: 'Максимум 100 символов' }),
  logoUrl: z.string().optional(),
  color: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
})

export type TTeamSchema = z.infer<typeof teamSchema>
```

### 3. Project Schema

**Файл:** `apps/web/src/packages/schemas/onboarding/project.schema.ts`

```typescript
import { z } from 'zod'

export const projectSchema = z.object({
  name: z
    .string()
    .nonempty({ message: 'Название объекта обязательно' })
    .min(2, { message: 'Минимум 2 символа' })
    .max(200, { message: 'Максимум 200 символов' }),
})

export type TProjectSchema = z.infer<typeof projectSchema>
```

### 4. Invite Code Schema

**Файл:** `apps/web/src/packages/schemas/onboarding/invite.schema.ts`

```typescript
import { z } from 'zod'

export const inviteSchema = z.object({
  code: z
    .string()
    .nonempty({ message: 'Введите код приглашения' })
    .length(6, { message: 'Код должен содержать 6 символов' })
    .regex(/^[A-Z0-9]{6}$/, { message: 'Код может содержать только буквы и цифры' })
    .transform(val => val.toUpperCase()),
})

export type TInviteSchema = z.infer<typeof inviteSchema>
```

---

## Frontend: Onboarding Flow

### 1. Directory Structure

```
apps/web/src/app/(root)/onboarding/
├── layout.tsx         # Layout с Stepper
├── page.tsx           # Стартовый экран (Начать / Меня пригласили)
├── step-1/
│   └── page.tsx      # Название бригады
├── step-2/
│   └── page.tsx      # Логотип
├── step-3/
│   └── page.tsx      # Первый объект
└── invite/
    └── page.tsx      # Ввод кода приглашения
```

### 2. Стартовый экран

**Файл:** `apps/web/src/app/(root)/onboarding/page.tsx`

**Функциональность:**
- Две кнопки: "Начать настройку" и "Меня пригласили"
- "Начать настройку" → `/onboarding/step-1`
- "Меня пригласили" → `/onboarding/invite`
- Проверка авторизации (редирект на /auth/login если не залогинен)
- Проверка онбординга (редирект на /dashboard если уже прошел)

### 3. Шаг 1: Название бригады

**Файл:** `apps/web/src/app/(root)/onboarding/step-1/page.tsx`

**Функциональность:**
- Форма с одним полем: название бригады
- Валидация через `teamSchema`
- Автоматическая валидация с `useAutoValidateForm`
- Сохранение в `sessionStorage` для передачи между шагами
- Кнопка "Продолжить" (disabled до валидного состояния)

### 4. Шаг 2: Логотип

**Файл:** `apps/web/src/app/(root)/onboarding/step-2/page.tsx`

**Функциональность:**
- Tabs: "Загрузить" vs "Выбрать иконку"
- Tab "Загрузить": ImageUpload компонент
- Tab "Выбрать иконку": IconPicker компонент
- Кнопка "Пропустить" (логотип опционален)
- Кнопка "Назад" (возврат к step-1)
- Сохранение выбора в `sessionStorage`

### 5. Шаг 3: Первый объект

**Файл:** `apps/web/src/app/(root)/onboarding/step-3/page.tsx`

**Функциональность:**
- Форма с одним полем: название объекта
- Валидация через `projectSchema`
- Превью демо-данных (адрес, бюджет, прогресс)
- Сборка данных из всех шагов (sessionStorage)
- GraphQL mutation: `createTeam` + `createDemoProject` + `completeOnboarding`
- Очистка sessionStorage после успеха
- Редирект на `/dashboard`
- Toast уведомления об успехе/ошибках

### 6. Страница ввода кода приглашения

**Файл:** `apps/web/src/app/(root)/onboarding/invite/page.tsx`

**Функциональность:**
- Форма с одним полем: 6-значный код
- Валидация через `inviteSchema`
- Автоматическое приведение к верхнему регистру
- Крупный font (2xl, monospace) для кода
- GraphQL mutation: `joinTeamByInvite`
- Обработка ошибок:
  - Неверный код
  - Срок истек
  - Код использован
  - Owner не может присоединиться
- Редирект на `/dashboard` после успеха

---

## Frontend: GraphQL Integration

### 1. GraphQL Document

**Файл:** `apps/web/src/packages/api/graphql/teams.graphql`

```graphql
mutation CreateTeam($input: CreateTeamInput!) {
  createTeam(input: $input) {
    id
    name
    slug
    logoUrl
    color
    plan
    status
    createdAt
  }
}

mutation CreateDemoProject($teamId: String!, $projectName: String!) {
  createDemoProject(teamId: $teamId, projectName: $projectName) {
    id
    name
    isDemo
  }
}

query MyTeams {
  myTeams {
    id
    name
    slug
    logoUrl
    color
    plan
    status
    members {
      id
      role
      status
      user {
        id
        name
        email
      }
    }
  }
}

mutation CompleteOnboarding {
  completeOnboarding
}

mutation JoinTeamByInvite($code: String!) {
  joinTeamByInvite(code: $code) {
    id
    name
    slug
  }
}

mutation CreateInviteCode($teamId: String!) {
  createInviteCode(teamId: $teamId)
}

mutation UploadTeamLogo($file: Upload!) {
  uploadTeamLogo(file: $file)
}
```

### 2. Codegen

После создания `.graphql` файлов:

```bash
pnpm --filter web run codegen
```

---

## Интеграция с Auth System

### 1. Onboarding Layout Guard

**Файл:** `apps/web/src/app/(root)/onboarding/layout.tsx`

**Проверки:**
- Если не авторизован → редирект на `/auth/login`
- Если уже прошел онбординг → редирект на `/dashboard`
- Loading state пока идет проверка

### 2. Редирект после логина

**Файл:** `apps/web/src/app/(root)/auth/login/page.tsx`

**Логика:**
```typescript
const onSubmit = async (data: TLoginSchema) => {
  const response = await login({ variables: { input: data } })
  const user = response.data?.login.user

  if (!user.hasCompletedOnboarding) {
    router.push('/onboarding')
  } else {
    router.push('/dashboard')
  }
}
```

### 3. Редирект после регистрации

**Файл:** `apps/web/src/app/(root)/auth/register/page.tsx`

**Логика:**
```typescript
const onSubmit = async (data: TRegisterSchema) => {
  await register({ variables: { input: data } })
  router.push('/onboarding') // Всегда онбординг для новых пользователей
}
```

---

## Wizard для дополнительных команд (Post-MVP)

**Директория:** `apps/web/src/app/(root)/teams/new/`

**Описание:** Переиспользует компоненты ImageUpload, IconPicker, Stepper из онбординга, но:
- Доступен только пользователям с ролью MEMBER (не Owner)
- Полная версия с возможностью добавления участников (не входит в MVP)

---

## Database Migration

### 1. Создание миграции

```bash
cd apps/api
pnpm prisma migrate dev --name add_teams_onboarding
```

### 2. Генерация Prisma Client

```bash
pnpm prisma generate
```

---

## Критические файлы для создания/изменения

### Backend (создать новые):
1. `apps/api/prisma/schema.prisma` - добавить Team, TeamMember, InviteCode, Project models
2. `apps/api/src/modules/teams/` - создать Teams module
3. `apps/api/src/modules/teams/teams.service.ts` - основная бизнес-логика
4. `apps/api/src/modules/teams/teams.resolver.ts` - GraphQL API
5. `apps/api/src/modules/teams/dto/create-team.input.ts` - DTO
6. `apps/api/src/modules/uploads/` - создать Uploads module
7. `apps/api/src/modules/uploads/uploads.service.ts` - обработка файлов

### Frontend (создать новые):
1. `apps/web/src/packages/components/ui/stepper.tsx`
2. `apps/web/src/packages/components/ui/image-upload.tsx`
3. `apps/web/src/packages/components/ui/icon-picker.tsx`
4. `apps/web/src/packages/schemas/onboarding/team.schema.ts`
5. `apps/web/src/packages/schemas/onboarding/project.schema.ts`
6. `apps/web/src/packages/schemas/onboarding/invite.schema.ts`
7. `apps/web/src/packages/schemas/onboarding/index.ts`
8. `apps/web/src/app/(root)/onboarding/layout.tsx`
9. `apps/web/src/app/(root)/onboarding/page.tsx`
10. `apps/web/src/app/(root)/onboarding/step-1/page.tsx`
11. `apps/web/src/app/(root)/onboarding/step-2/page.tsx`
12. `apps/web/src/app/(root)/onboarding/step-3/page.tsx`
13. `apps/web/src/app/(root)/onboarding/invite/page.tsx`
14. `apps/web/src/packages/api/graphql/teams.graphql`

### Frontend (модифицировать):
1. `apps/web/src/app/(root)/auth/login/page.tsx` - добавить редирект на онбординг
2. `apps/web/src/app/(root)/auth/register/page.tsx` - добавить редирект на онбординг
3. `apps/web/src/packages/schemas/index.ts` - добавить экспорт onboarding схем

---

## Приоритет реализации (MVP)

### Высокий приоритет:
1. ✅ Backend: Prisma модели (Team, TeamMember, InviteCode, Project)
2. ✅ Backend: User.hasCompletedOnboarding поле
3. ✅ Backend: Teams Service (createTeam, createDemoProject, completeOnboarding)
4. ✅ Backend: Invite Service (createInviteCode, joinTeamByInvite)
5. ✅ Frontend: UI компоненты (Stepper, ImageUpload, IconPicker)
6. ✅ Frontend: Zod schemas (team, project, invite)
7. ✅ Frontend: Онбординг flow (стартовый экран + 3 шага)
8. ✅ Frontend: Invite flow (ввод кода)
9. ✅ Frontend: GraphQL integration (mutations, queries)
10. ✅ Auth: Редиректы после login/register

### Средний приоритет:
11. ✅ Backend: Upload Service (файлы, resize)
12. 🔄 Frontend: Обработка ошибок и loading states
13. 🔄 Frontend: Toast notifications (sonner)

### Низкий приоритет (post-MVP):
14. 🔽 Wizard для дополнительных команд
15. 🔽 Cloudflare R2 integration (вместо локального хранения)
16. 🔽 E2E тесты
17. 🔽 Seed данных для разработки

---

## Критерии успеха

### Backend:
- ✅ Модели созданы и миграция применена
- ✅ GraphQL API работает: createTeam, joinTeamByInvite
- ✅ Валидация входных данных
- ✅ Owner не может создать вторую бригаду
- ✅ Owner не может присоединиться к чужой бригаде
- ✅ Коды приглашения работают с проверкой истечения

### Frontend:
- ✅ Онбординг открывается только для новых пользователей
- ✅ Stepper отображает прогресс
- ✅ Валидация форм в real-time
- ✅ Загрузка логотипа с resize
- ✅ Пропуск шага логотипа работает
- ✅ Создание первого объекта с демо-данными
- ✅ "Меня пригласили" flow работает
- ✅ Редирект после завершения онбординга

### UX:
- ✅ Mobile-first дизайн
- ✅ Понятные сообщения об ошибках
- ✅ Loading states
- ✅ Toast уведомления

---

## Потенциальные проблемы и решения

### Проблема 1: Upload не работает в GraphQL
**Решение:**
- Проверить `graphql-upload-minimal` установлен
- Проверить NestJS GraphQL config: `uploads: { maxFileSize: 2000000 }`
- Проверить Apollo Client использует `createUploadLink`

### Проблема 2: SessionStorage теряется
**Решение:**
- SessionStorage сохраняется при обновлении страницы
- Альтернатива: LocalStorage или сохранение в БД

### Проблема 3: Resize медленный
**Решение:**
- Показывать Loader
- Использовать Web Workers
- Альтернатива: resize на сервере

---

## Заключение

Реализация онбординга обеспечит:
- **Первое впечатление**: Плавный вход для новых пользователей
- **Снижение барьера входа**: Минимум обязательных полей
- **Гибкость**: Два сценария (владелец vs участник)
- **Масштабируемость**: Переиспользуемые компоненты

**Приоритет:** Backend модели → Teams Service → UI компоненты → Onboarding flow
