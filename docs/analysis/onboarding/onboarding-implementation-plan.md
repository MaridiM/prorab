# План реализации: Система онбординга и управления командами ProRab

## Обзор

Этот план описывает поэтапную реализацию системы онбординга и управления бригадами для приложения ProRab. Реализация следует существующим архитектурным паттернам проекта (NestJS + GraphQL + Prisma на бэкенде; Next.js 15 + React Hook Form + Zod на фронтенде).

**Приоритет:** MVP (Критический)
**Расчетное время:** 3-4 недели
**Язык интерфейса:** Русский

---

## Ключевые возможности

### Обязательный онбординг (3 шага)
1. **Шаг 1:** Название бригады (обязательно)
2. **Шаг 2:** Логотип (опционально - можно пропустить)
3. **Шаг 3:** Первый объект (обязательно - только название, остальное демо-данные)

### Два пути входа
- **"Начать настройку"** → Онбординг (создание своей бригады)
- **"Меня пригласили"** → Ввод 6-значного кода приглашения

### Управление командами
- Владелец может иметь только **ОДНУ** бригаду
- Владелец **не может** присоединиться к другим бригадам
- Участники присоединяются через 6-значные коды (A-Z0-9)
- Коды истекают через 7 дней
- Демо-проекты с автогенерируемыми данными

---

## ЭТАП 1: База данных и миграции

**Время:** 2-3 часа
**Приоритет:** 🔴 Критический

### Задача 1.1: Обновление Prisma Schema

**Файл:** `apps/api/prisma/schema.prisma`

#### Изменения:

1. **Обновить модель User:**
```prisma
model User {
  // ... существующие поля
  hasCompletedOnboarding Boolean @default(false) @map("has_completed_onboarding")

  // Новые связи
  ownedTeams          Team[]       @relation("TeamOwner")
  teamMemberships     TeamMember[]
  createdInviteCodes  InviteCode[] @relation("InviteCreator")
  usedInviteCodes     InviteCode[] @relation("InviteUser")
}
```

2. **Добавить модель Team:**
```prisma
model Team {
  id        String   @id @default(uuid())
  ownerId   String   @map("owner_id")
  name      String
  slug      String   @unique
  logoUrl   String?  @map("logo_url")
  color     String?  @default("#F59E0B")
  plan      String   @default("FREE")
  status    String   @default("ACTIVE")
  currency  String   @default("RUB")
  locale    String   @default("ru")
  settings  Json?
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  owner       User         @relation("TeamOwner", fields: [ownerId], references: [id], onDelete: Cascade)
  members     TeamMember[]
  inviteCodes InviteCode[]
  projects    Project[]

  @@index([ownerId])
  @@map("teams")
}
```

3. **Добавить модель TeamMember:**
```prisma
model TeamMember {
  id            String    @id @default(uuid())
  teamId        String    @map("team_id")
  userId        String    @map("user_id")
  role          String    @default("MEMBER")
  status        String    @default("ACTIVE")
  permissions   Json?
  paymentType   String?   @map("payment_type")
  paymentAmount Float?    @map("payment_amount")
  joinedAt      DateTime  @default(now()) @map("joined_at")
  leftAt        DateTime? @map("left_at")

  team Team @relation(fields: [teamId], references: [id], onDelete: Cascade)
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([teamId, userId])
  @@index([teamId])
  @@index([userId])
  @@map("team_members")
}
```

4. **Добавить модель InviteCode:**
```prisma
model InviteCode {
  id        String    @id @default(uuid())
  teamId    String    @map("team_id")
  code      String    @unique @db.VarChar(6)
  role      String    @default("MEMBER")
  createdBy String    @map("created_by")
  expiresAt DateTime  @map("expires_at")
  usedAt    DateTime? @map("used_at")
  usedBy    String?   @map("used_by")
  createdAt DateTime  @default(now()) @map("created_at")

  team       Team  @relation(fields: [teamId], references: [id], onDelete: Cascade)
  creator    User  @relation("InviteCreator", fields: [createdBy], references: [id])
  usedByUser User? @relation("InviteUser", fields: [usedBy], references: [id])

  @@index([teamId])
  @@index([code])
  @@index([expiresAt])
  @@map("invite_codes")
}
```

5. **Обновить модель Project:**
```prisma
model Project {
  id          Int       @id @default(autoincrement())
  teamId      String    @map("team_id")
  name        String
  description String?
  address     String?
  clientPhone String?   @map("client_phone")
  budget      Float?
  startDate   DateTime? @map("start_date")
  endDate     DateTime? @map("end_date")
  progress    Float     @default(0)
  status      String    @default("PLANNING")
  isDemo      Boolean   @default(false) @map("is_demo")
  createdAt   DateTime  @default(now()) @map("created_at")
  updatedAt   DateTime  @updatedAt @map("updated_at")

  team Team @relation(fields: [teamId], references: [id], onDelete: Cascade)

  @@index([teamId])
  @@index([status])
  @@map("projects")
}
```

### Задача 1.2: Создание миграции

**Команды:**
```bash
cd apps/api
npx prisma migrate dev --name add_teams_onboarding
npx prisma generate
```

**Критерии успеха:**
- ✅ Миграция применена без ошибок
- ✅ Prisma Client сгенерирован
- ✅ Все индексы созданы

---

## ЭТАП 2: Backend - Модуль Teams

**Время:** 6-8 часов
**Приоритет:** 🔴 Критический

### Структура модуля

**Директория:** `apps/api/src/modules/teams/`

```
teams/
├── teams.module.ts
├── teams.service.ts
├── teams.resolver.ts
├── dto/
│   ├── create-team.input.ts
│   ├── complete-onboarding.input.ts
│   └── join-team.input.ts
├── models/
│   ├── team.model.ts
│   ├── team-member.model.ts
│   ├── invite-code.model.ts
│   └── onboarding-result.model.ts
└── guards/
    └── team-owner.guard.ts
```

### Задача 2.1: Teams Service

**Файл:** `teams.service.ts`

#### Основные методы:

1. **`createTeam(userId: string, input: CreateTeamInput): Promise<Team>`**
   - Валидация: владелец не имеет другой бригады
   - Генерация уникального slug из названия
   - Создание записи Team
   - Возврат Team

2. **`createDemoProject(teamId: string, projectName: string): Promise<Project>`**
   - Автогенерация демо-данных:
     - `address`: "г. Москва, ул. Демонстрационная, д. 1"
     - `clientPhone`: "+7 (999) 123-45-67"
     - `budget`: случайное 500000 - 5000000
     - `startDate`: сегодня
     - `endDate`: сегодня + 3 месяца
     - `progress`: случайное 5-25%
     - `status`: "IN_PROGRESS"
     - `isDemo`: true

3. **`completeOnboarding(userId: string, input: CompleteOnboardingInput): Promise<OnboardingResult>`**
   - Создание бригады
   - Загрузка/сохранение логотипа (если есть)
   - Создание демо-проекта
   - Установка `user.hasCompletedOnboarding = true`
   - Возврат `{ team, project }`

4. **`createInviteCode(teamId: string, userId: string, role?: string): Promise<InviteCode>`**
   - Валидация: userId является владельцем бригады
   - Генерация 6-значного кода (A-Z0-9, проверка уникальности)
   - Установка `expiresAt`: now + 7 дней
   - Возврат InviteCode

5. **`joinTeamByInvite(userId: string, code: string): Promise<TeamMember>`**
   - Поиск кода (case-insensitive)
   - Валидации:
     - Код не истек
     - Код не использован
     - Пользователь не владелец другой бригады
     - Пользователь не состоит в этой бригаде
   - Создание TeamMember
   - Пометка кода как использованного
   - Возврат TeamMember

6. **`getTeamsByUserId(userId: string): Promise<Team[]>`**
   - Возврат бригад где пользователь владелец ИЛИ участник

#### Обработка ошибок (русский язык):
- "Вы уже создали бригаду. Владелец может иметь только одну бригаду."
- "Неверный код приглашения"
- "Код приглашения истёк"
- "Вы уже состоите в этой бригаде"
- "Владелец бригады не может присоединиться к другим бригадам"
- "Только владелец бригады может создавать коды приглашения"

### Задача 2.2: Teams Resolver

**Файл:** `teams.resolver.ts`

#### Мутации:
- `completeOnboarding(input: CompleteOnboardingInput!): OnboardingResult!`
- `createInviteCode(teamId: String!, role: String): InviteCode!`
- `joinTeamByInvite(code: String!): TeamMember!`
- `updateTeamLogo(teamId: String!, logoUrl: String!): Team!`

#### Запросы:
- `myTeams: [Team!]!`
- `team(teamId: String!): Team`
- `validateInviteCode(code: String!): InviteCodeValidation!`

Все методы используют `@UseGuards(AuthGuard)`.

### Задача 2.3: DTOs

**Файлы в `dto/`:**

1. **`create-team.input.ts`**
```typescript
@InputType()
export class CreateTeamInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  name: string

  @Field({ nullable: true })
  logoUrl?: string

  @Field({ nullable: true })
  color?: string
}
```

2. **`complete-onboarding.input.ts`**
```typescript
@InputType()
export class CompleteOnboardingInput {
  @Field()
  teamName: string

  @Field({ nullable: true })
  logoUrl?: string

  @Field({ nullable: true })
  color?: string

  @Field()
  projectName: string
}
```

### Задача 2.4: Models (GraphQL Object Types)

**Файлы в `models/`:**
- `team.model.ts`
- `team-member.model.ts`
- `invite-code.model.ts`
- `onboarding-result.model.ts`

### Задача 2.5: Интеграция модуля

**Файл:** `apps/api/src/app.module.ts`

Добавить `TeamsModule` в массив imports.

---

## ЭТАП 3: Backend - Модуль Uploads

**Время:** 3-4 часа
**Приоритет:** 🟡 Средний

### Структура

**Директория:** `apps/api/src/modules/uploads/`

```
uploads/
├── uploads.module.ts
├── uploads.service.ts
└── uploads.resolver.ts
```

### Задача 3.1: Uploads Service

**Файл:** `uploads.service.ts`

**Функциональность:**
- Прием загрузки файла (GraphQL Upload scalar)
- Валидация: PNG/JPG/WEBP, максимум 5MB
- Изменение размера до 512x512 с помощью Sharp
- Сохранение в `uploads/team-logos/`
- Возврат публичного URL

### Задача 3.2: Uploads Resolver

**Файл:** `uploads.resolver.ts`

**Мутация:**
- `uploadTeamLogo(teamId: String!, file: Upload!): String!`

### Зависимости

```bash
npm install sharp graphql-upload-minimal
```

---

## ЭТАП 4: Backend - Обновление Auth

**Время:** 1-2 часа
**Приоритет:** 🔴 Высокий

### Задача 4.1: Обновление User Model

**Файл:** `apps/api/src/modules/users/models/user.model.ts`

Добавить поле:
```typescript
@Field()
hasCompletedOnboarding: boolean
```

### Задача 4.2: Обновление Auth GraphQL

**Файл:** `apps/api/src/modules/auth/models/auth.model.ts`

Обновить `User` тип в `AuthPayload` чтобы включить `hasCompletedOnboarding`.

---

## ЭТАП 5: Frontend - Схемы валидации

**Время:** 2-3 часа
**Приоритет:** 🔴 Высокий

### Директория

`apps/web/src/packages/schemas/teams/`

```
teams/
├── index.ts
├── team.schema.ts
├── project.schema.ts
└── invite.schema.ts
```

### Задача 5.1: Team Schema

**Файл:** `team.schema.ts`

```typescript
import { z } from 'zod'

export const teamSchema = z.object({
  name: z
    .string()
    .nonempty({ message: 'Название бригады обязательно' })
    .min(2, { message: 'Минимум 2 символа' })
    .max(50, { message: 'Максимум 50 символов' })
})

export type TTeamSchema = z.infer<typeof teamSchema>
```

### Задача 5.2: Project Schema

**Файл:** `project.schema.ts`

```typescript
export const demoProjectSchema = z.object({
  name: z
    .string()
    .nonempty({ message: 'Название объекта обязательно' })
    .min(3, { message: 'Минимум 3 символа' })
    .max(100, { message: 'Максимум 100 символов' })
})

export type TDemoProjectSchema = z.infer<typeof demoProjectSchema>
```

### Задача 5.3: Invite Schema

**Файл:** `invite.schema.ts`

```typescript
export const inviteSchema = z.object({
  code: z
    .string()
    .length(6, { message: 'Код должен содержать 6 символов' })
    .regex(/^[A-Z0-9]+$/, { message: 'Только буквы A-Z и цифры' })
    .transform(val => val.toUpperCase())
})

export type TInviteSchema = z.infer<typeof inviteSchema>
```

### Задача 5.4: Экспорт

**Файл:** `index.ts`

Экспорт всех схем.

---

## ЭТАП 6: Frontend - GraphQL документы

**Время:** 1-2 часа
**Приоритет:** 🔴 Высокий

### Задача 6.1: Teams GraphQL

**Файл:** `apps/web/src/packages/api/graphql/teams.graphql`

```graphql
mutation CompleteOnboarding($input: CompleteOnboardingInput!) {
  completeOnboarding(input: $input) {
    team {
      id
      name
      slug
      logoUrl
      color
    }
    project {
      id
      name
      isDemo
    }
  }
}

mutation CreateInviteCode($teamId: String!, $role: String) {
  createInviteCode(teamId: $teamId, role: $role) {
    id
    code
    expiresAt
  }
}

mutation JoinTeamByInvite($code: String!) {
  joinTeamByInvite(code: $code) {
    id
    teamId
    role
    joinedAt
  }
}

mutation UploadTeamLogo($teamId: String!, $file: Upload!) {
  uploadTeamLogo(teamId: $teamId, file: $file)
}

query MyTeams {
  myTeams {
    id
    name
    slug
    logoUrl
    color
    ownerId
    createdAt
    members {
      id
      userId
      role
      joinedAt
    }
  }
}

query ValidateInviteCode($code: String!) {
  validateInviteCode(code: $code) {
    valid
    teamName
    role
    expiresAt
  }
}
```

### Задача 6.2: Генерация типов

```bash
cd apps/web
npm run graphql:codegen
```

---

## ЭТАП 7: Frontend - UI компоненты

**Время:** 6-8 часов
**Приоритет:** 🔴 Высокий

### Задача 7.1: Stepper Component

**Файл:** `apps/web/src/packages/components/features/stepper.tsx`

**Возможности:**
- Визуальный индикатор прогресса (1/3, 2/3, 3/3)
- Состояния: активный/завершенный/предстоящий
- Адаптивный для мобильных
- Русские метки

**Props:**
```typescript
interface StepperProps {
  steps: string[]
  currentStep: number
}
```

### Задача 7.2: ImageUpload Component

**Файл:** `apps/web/src/packages/components/features/image-upload.tsx`

**Возможности:**
- Зона drag & drop
- Резервный input для файлов
- Валидация: PNG/JPG/WEBP, макс 5MB
- Предпросмотр изменения размера на клиенте (512x512)
- Индикатор прогресса загрузки
- Русские сообщения об ошибках

### Задача 7.3: IconPicker Component

**Файл:** `apps/web/src/packages/components/features/icon-picker.tsx`

**Возможности:**
- 8-10 пресетных эмодзи (🏗️, 🔨, ⚒️, 🧱, 🏠, 🔧, 👷)
- 8 пресетных цветов (amber, blue, green, red, purple, pink, orange, teal)
- Grid layout
- Визуальная обратная связь выбранного состояния
- Возврат `{ emoji, color }`

### Задача 7.4: Team Logo Component

**Файл:** `apps/web/src/packages/components/features/team-logo.tsx`

**Возможности:**
- Отображение загруженного изображения ИЛИ эмодзи + цветной фон
- Адаптивные размеры (sm, md, lg)
- Скругленные углы
- Резерв на инициалы если нет логотипа

---

## ЭТАП 8: Frontend - Страницы онбординга

**Время:** 8-10 часов
**Приоритет:** 🔴 Критический

### Структура директории

```
apps/web/src/app/(root)/onboarding/
├── layout.tsx          # Guards & Stepper
├── page.tsx            # Стартовый экран
├── step-1/
│   └── page.tsx        # Название бригады
├── step-2/
│   └── page.tsx        # Загрузка/выбор логотипа
├── step-3/
│   └── page.tsx        # Название проекта & отправка
└── invite/
    └── page.tsx        # Присоединение по коду
```

### Задача 8.1: Onboarding Layout

**Файл:** `layout.tsx`

**Возможности:**
- Auth guard (редирект на /auth/login если не авторизован)
- Onboarding guard (редирект на /dashboard если завершен)
- Компонент Stepper вверху
- Центрированный card layout
- Mobile-first адаптивный дизайн

### Задача 8.2: Стартовый экран

**Файл:** `page.tsx`

**Две большие кнопки:**
1. "Начать настройку" → /onboarding/step-1
2. "Меня пригласили" → /onboarding/invite

### Задача 8.3: Шаг 1 - Название бригады

**Файл:** `step-1/page.tsx`

- Форма с одним полем (название бригады)
- Использует валидацию `teamSchema`
- Кнопка Next → /onboarding/step-2
- Сохранение в sessionStorage

### Задача 8.4: Шаг 2 - Логотип

**Файл:** `step-2/page.tsx`

- Вкладки: "Загрузить логотип" | "Выбрать иконку"
- Вкладка 1: Компонент `ImageUpload`
- Вкладка 2: Компонент `IconPicker`
- Кнопка Skip (опциональный шаг)
- Next → /onboarding/step-3

### Задача 8.5: Шаг 3 - Первый проект

**Файл:** `step-3/page.tsx`

- Форма с одним полем (название проекта)
- Использует валидацию `demoProjectSchema`
- Кнопка Submit вызывает мутацию `CompleteOnboarding`
- Объединяет все данные из шагов 1-3
- При успехе: редирект на /dashboard
- Показать спиннер во время отправки

### Задача 8.6: Ввод кода приглашения

**Файл:** `invite/page.tsx`

- Форма с 6-символьным вводом кода (авто-uppercase)
- Использует валидацию `inviteSchema`
- Опционально: валидация кода при blur (показ названия бригады)
- Submit → мутация `JoinTeamByInvite`
- При успехе: редирект на /dashboard
- Обработка ошибок для недействительных/истекших кодов

---

## ЭТАП 9: Frontend - Интеграция Auth

**Время:** 2-3 часа
**Приоритет:** 🔴 Критический

### Задача 9.1: Обновление Login Page

**Файл:** `apps/web/src/app/(root)/auth/login/page.tsx`

Обновить логику редиректа:
```typescript
const user = response.data?.login?.user
if (user) {
  success("Вход выполнен успешно")
  setTimeout(() => {
    if (!user.hasCompletedOnboarding) {
      router.push("/onboarding")
    } else {
      router.push("/dashboard")
    }
  }, 800)
}
```

### Задача 9.2: Обновление Register Page

**Файл:** `apps/web/src/app/(root)/auth/register/page.tsx`

Обновить редирект:
```typescript
if (responseData?.user) {
  success(responseData.message || "Аккаунт создан!")
  setTimeout(() => {
    router.push("/onboarding")  // Всегда на онбординг
  }, 1000)
}
```

### Задача 9.3: Хук Onboarding Guard

**Файл:** `apps/web/src/packages/hooks/use-onboarding-guard.ts`

```typescript
export function useOnboardingGuard(redirectIfCompleted = false) {
  const router = useRouter()
  const { data, loading } = useQuery(MeDocument)

  useEffect(() => {
    if (!loading && data?.me) {
      const hasCompleted = data.me.hasCompletedOnboarding
      if (redirectIfCompleted && hasCompleted) {
        router.push('/dashboard')
      } else if (!redirectIfCompleted && !hasCompleted) {
        router.push('/onboarding')
      }
    }
  }, [data, loading, redirectIfCompleted, router])

  return { user: data?.me, loading }
}
```

---

## ЭТАП 10: Граничные случаи и обработка ошибок

**Время:** 3-4 часа
**Приоритет:** 🔴 Высокий

### Backend валидации

1. **Создание бригады**
   - Владелец уже имеет бригаду → "Вы уже создали бригаду"
   - Коллизия slug → Авто-добавление nanoid
   - Название слишком короткое/длинное → Ошибка валидации

2. **Коды приглашения**
   - Коллизия кода → Регенерация (макс 5 попыток)
   - Пользователь владелец → "Владелец бригады не может присоединиться к другим бригадам"
   - Пользователь уже в бригаде → "Вы уже состоите в этой бригаде"
   - Код истек → "Код приглашения истёк"
   - Код использован → "Код уже был использован"

3. **Онбординг**
   - Уже завершен → Вернуть существующую бригаду
   - Отсутствуют обязательные поля → Ошибка валидации

### Frontend обработка ошибок

1. **Сетевые ошибки**
   - Показать toast: "Ошибка соединения. Проверьте интернет."
   - Кнопка повтора

2. **Ошибки валидации**
   - Показать inline ошибки полей
   - Отключить submit до валидности

3. **GraphQL ошибки**
   - Парсить сообщение об ошибке с бэкенда
   - Показать русскую ошибку в toast

---

## ЭТАП 11: Тестирование

**Время:** 4-5 часов
**Приоритет:** 🟡 Средний

### Тест-кейсы

1. **Happy Path: Новый пользователь онбординг**
   - Регистрация → Онбординг → Шаги 1-3 → Dashboard

2. **Happy Path: Присоединение по приглашению**
   - Регистрация → Код приглашения → Dashboard

3. **Граничный случай: Владелец создает вторую бригаду**
   - Попытка создать → Показать ошибку

4. **Граничный случай: Истекший код приглашения**
   - Ввести код → Показать ошибку

5. **Граничный случай: Онбординг уже завершен**
   - Доступ к /onboarding → Редирект на /dashboard

6. **Загрузка логотипа**
   - Загрузка слишком большого → Показать ошибку
   - Загрузка недопустимого типа → Показать ошибку
   - Успешная загрузка → Предпросмотр + сохранение

7. **Выбор иконки**
   - Выбрать emoji + цвет → Сохранить
   - Пропустить логотип → Использовать только цвет/emoji

---

## ЭТАП 12: Документация и Roadmap

**Время:** 2-3 часа
**Приоритет:** 🟢 Низкий

### Файлы для создания/обновления

1. **`docs/onboarding-implementation.md`**
   - Обзор архитектуры
   - Документация API
   - Примеры использования компонентов

2. **`docs/roadmap.md`**
   - Отметить Фазу 1 (Онбординг) как завершенную
   - Запланировать Фазу 2 (Wizard для дополнительных бригад - post-MVP)
   - Запланировать миграцию Cloudflare R2

3. **Обновить `changelog.md`**
   - Добавить запись о функции онбординга

---

## Порядок реализации

### Неделя 1: Backend основа
1. **День 1:** Этап 1 - База данных Schema
2. **День 2-3:** Этап 2 - Teams Module
3. **День 4:** Этап 3 - Uploads Module
4. **День 4:** Этап 4 - Auth обновления

### Неделя 2: Frontend реализация
5. **День 1:** Этап 5 - Схемы валидации
6. **День 1:** Этап 6 - GraphQL документы
7. **День 2-3:** Этап 7 - UI компоненты
8. **День 4-5:** Этап 8 - Страницы онбординга

### Неделя 3: Интеграция и доработка
9. **День 1:** Этап 9 - Интеграция Auth
10. **День 2-3:** Этап 10 - Граничные случаи
11. **День 4:** Этап 11 - Тестирование
12. **День 5:** Этап 12 - Документация

---

## Критические файлы

Эти 5 файлов формируют критический путь реализации:

1. **`apps/api/prisma/schema.prisma`**
   Основа для всей функции; определяет модели Team, TeamMember, InviteCode и обновленный Project

2. **`apps/api/src/modules/teams/teams.service.ts`**
   Основная бизнес-логика со всеми валидациями, создание бригады, генерация кодов

3. **`apps/web/src/app/(root)/onboarding/step-3/page.tsx`**
   Финальный шаг, оркеструющий полный поток онбординга через мутацию CompleteOnboarding

4. **`apps/api/src/modules/teams/teams.resolver.ts`**
   GraphQL API слой, предоставляющий все мутации и запросы для фронтенда

5. **`apps/web/src/packages/api/graphql/teams.graphql`**
   Контракт между фронтендом и бэкендом; определяет все GraphQL операции

---

## Post-MVP улучшения

1. **Wizard для дополнительных бригад**
   - Позволить участникам создавать свои бригады
   - Полноценная настройка проекта (не демо-данные)

2. **Cloudflare R2 хранилище**
   - Миграция с локальных файлов на R2
   - CDN для доставки логотипов

3. **Email приглашения**
   - Отправка кодов приглашения через email
   - Magic links вместо кодов

4. **Страница настроек бригады**
   - Редактирование названия бригады, логотипа
   - Передача владения
   - Удаление бригады

5. **E2E тесты**
   - Playwright тесты для потока онбординга

---

## Соображения безопасности

1. **Коды приглашения**
   - 6 символов = 2.2 млрд комбинаций (A-Z0-9)
   - Истечение через 7 дней
   - Только одноразовое использование

2. **Загрузка файлов**
   - Валидация MIME типа с помощью Sharp
   - Ограничение размера файла 5MB
   - Санитизация имен файлов

3. **Авторизация**
   - Только владелец бригады может создавать коды приглашения
   - Только владелец может обновлять настройки бригады
   - Участники могут только просматривать данные бригады

---

## Критерии успеха MVP

### Backend:
- ✅ Модели созданы и миграция применена
- ✅ GraphQL API работает: createTeam, joinTeamByInvite
- ✅ Валидация входных данных
- ✅ Владелец не может создать вторую бригаду
- ✅ Владелец не может присоединиться к другой бригаде
- ✅ Коды приглашения работают с проверкой истечения

### Frontend:
- ✅ Онбординг открывается только для новых пользователей
- ✅ Stepper отображает прогресс
- ✅ Валидация форм в реальном времени
- ✅ Загрузка логотипа с изменением размера
- ✅ Пропуск шага логотипа работает
- ✅ Создание первого объекта с демо-данными
- ✅ Поток "Меня пригласили" работает
- ✅ Редирект после завершения онбординга

### UX:
- ✅ Mobile-first дизайн
- ✅ Понятные сообщения об ошибках
- ✅ Loading состояния
- ✅ Toast уведомления

---

**Статус:** Готов к реализации
**Последнее обновление:** 2024-12-03
