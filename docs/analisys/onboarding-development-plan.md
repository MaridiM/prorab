# План разработки: Система онбординга и управления командами

## 📋 Обзор проекта

**Цель:** Реализовать систему создания и управления бригадами (Teams) для приложения ProRab.app, включающую обязательный онбординг после первого входа и систему приглашений через 6-значные коды.

**Статус:** Не реализовано (0%)

**Приоритет:** Высокий (MVP)

---

## 🎯 Архитектурные принципы

### Разделение ответственности
- **Onboarding** - обязательный flow для новых пользователей (3 упрощенных шага)
- **Wizard** - полноценный инструмент создания команд (post-MVP)
- **Shared Logic** - общие компоненты и валидация

### Два входных потока
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

### Шаги онбординга
1. **Имя бригады** (обязательно)
2. **Логотип** (опционально - можно пропустить)
3. **Первый объект** (обязательно - только название, остальное демо-данные)

---

## 📊 Текущее состояние проекта

### ✅ Уже реализовано
- [x] Монорепо Turborepo
- [x] Backend: NestJS + GraphQL + Prisma + PostgreSQL
- [x] Frontend: Next.js 16 + Tailwind + shadcn/ui
- [x] Базовая авторизация (login/register/forgot-password)
- [x] Модель User в Prisma
- [x] Базовая модель Project (требует доработки)

### ❌ Не реализовано
- [ ] Модели Team, TeamMember, InviteCode в Prisma
- [ ] Поле `hasCompletedOnboarding` в User
- [ ] Backend модуль Teams
- [ ] Backend модуль Uploads
- [ ] Frontend UI компоненты (Stepper, ImageUpload, IconPicker)
- [ ] Frontend Zod схемы для онбординга
- [ ] Frontend страницы онбординга
- [ ] GraphQL API для команд
- [ ] Интеграция редиректов в auth flow

---

## 🗺️ План разработки по этапам

### Этап 1: Backend - Модели данных и миграции (Приоритет: 🔴 Критический)

**Цель:** Создать структуру данных для команд, участников и приглашений

#### Задача 1.1: Обновление Prisma Schema
**Файл:** `apps/api/prisma/schema.prisma`

**Действия:**
1. Добавить поле `hasCompletedOnboarding` в модель User
2. Создать модель Team с полями:
   - id, ownerId, name, slug, logoUrl, color
   - plan (enum: TRIAL, LIGHT, FOREMAN, BRIGADE)
   - status (enum: ACTIVE, SUSPENDED, ARCHIVED)
   - currency, locale, settings (Json)
   - timestamps
3. Создать модель TeamMember с полями:
   - id, teamId, userId
   - role (enum: OWNER, MEMBER)
   - status (enum: ACTIVE, INACTIVE, REMOVED)
   - permissions (Json), paymentType, paymentAmount
   - joinedAt, leftAt
4. Создать модель InviteCode с полями:
   - id, teamId, code (unique)
   - role, createdBy, expiresAt
   - usedAt, usedBy
5. Обновить модель Project:
   - Добавить teamId (связь с Team)
   - Добавить поля: address, clientPhone, budget, startDate, endDate
   - Добавить progress, status (enum), isDemo
   - Добавить связи с Expense, Report, Task (для будущего)
6. Добавить relations в User:
   - ownedTeams (Team[])
   - memberships (TeamMember[])

**Оценка:** 2-3 часа

#### Задача 1.2: Создание миграции
**Команды:**
```bash
cd apps/api
pnpm prisma migrate dev --name add_teams_onboarding
pnpm prisma generate
```

**Оценка:** 30 минут

**Критерии успеха:**
- ✅ Миграция применена без ошибок
- ✅ Prisma Client сгенерирован
- ✅ Все модели доступны в TypeScript

---

### Этап 2: Backend - Teams Module (Приоритет: 🔴 Критический)

**Цель:** Создать GraphQL API для управления командами

#### Задача 2.1: Структура модуля Teams
**Директория:** `apps/api/src/modules/teams/`

**Создать файлы:**
```
teams/
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

**Оценка:** 1 час (структура)

#### Задача 2.2: Teams Service - основная логика
**Файл:** `apps/api/src/modules/teams/teams.service.ts`

**Методы для реализации:**
1. `createTeam(userId, input)` - создание бригады
   - Валидация: Owner может иметь только одну бригаду
   - Генерация slug из name
   - Создание TeamMember с ролью OWNER
   - Возврат Team

2. `createDemoProject(teamId, projectName)` - создание демо-объекта
   - Генерация демо-данных (адрес, бюджет, прогресс)
   - Установка isDemo = true
   - Возврат Project

3. `completeOnboarding(userId)` - завершение онбординга
   - Обновление User.hasCompletedOnboarding = true
   - Возврат boolean

4. `createInviteCode(teamId, userId)` - генерация кода приглашения
   - Генерация 6-значного кода (A-Z0-9)
   - Проверка уникальности
   - Установка expiresAt (7 дней)
   - Возврат code (String)

5. `joinTeamByInvite(userId, code)` - присоединение по коду
   - Поиск InviteCode по code
   - Валидации:
     - Код существует
     - Код не использован (usedAt === null)
     - Код не истек (expiresAt > now)
     - Пользователь не Owner другой бригады
   - Создание TeamMember
   - Обновление InviteCode (usedAt, usedBy)
   - Возврат Team

6. `getTeamsByUserId(userId)` - получение всех бригад пользователя
   - Поиск по ownedTeams и memberships
   - Возврат Team[]

**Оценка:** 4-5 часов

#### Задача 2.3: GraphQL Resolver
**Файл:** `apps/api/src/modules/teams/teams.resolver.ts`

**Мутации:**
- `createTeam(input: CreateTeamInput!): Team`
- `createDemoProject(teamId: String!, projectName: String!): Project`
- `completeOnboarding(): Boolean`
- `joinTeamByInvite(code: String!): Team`
- `createInviteCode(teamId: String!): String`

**Queries:**
- `myTeams(): [Team]`

**Guards:**
- Использовать `@UseGuards(AuthGuard)` для всех методов
- Использовать `@CurrentUser()` декоратор

**Оценка:** 2-3 часа

#### Задача 2.4: DTO и Entities
**Файлы:** `dto/*.ts`, `entities/*.ts`

**Создать:**
- CreateTeamInput (name, logoUrl?, color?)
- UpdateTeamInput (name?, logoUrl?, color?)
- TeamEntity (GraphQL ObjectType)
- TeamMemberEntity
- InviteCodeEntity

**Оценка:** 1-2 часа

**Критерии успеха:**
- ✅ Все методы реализованы с валидацией
- ✅ GraphQL schema сгенерирован
- ✅ Тесты проходят (если есть)

---

### Этап 3: Backend - Upload Module (Приоритет: 🟡 Средний)

**Цель:** Реализовать загрузку и обработку логотипов команд

#### Задача 3.1: Структура модуля Uploads
**Директория:** `apps/api/src/modules/uploads/`

**Создать файлы:**
```
uploads/
├── uploads.module.ts
├── uploads.resolver.ts
├── uploads.service.ts
└── dto/
    └── file-upload.scalar.ts
```

**Оценка:** 30 минут

#### Задача 3.2: Uploads Service
**Файл:** `apps/api/src/modules/uploads/uploads.service.ts`

**Функциональность:**
1. Валидация типа файла (PNG, JPG только)
2. Валидация размера (2MB max)
3. Resize до 512x512 через Sharp
4. Сохранение в `/uploads/team-logos/{teamId}/{filename}`
5. Возврат URL файла

**Зависимости:**
- Установить `sharp`, `graphql-upload-minimal`

**Оценка:** 2-3 часа

#### Задача 3.3: GraphQL Upload Resolver
**Файл:** `apps/api/src/modules/uploads/uploads.resolver.ts`

**Мутация:**
- `uploadTeamLogo(file: Upload!): String` (возвращает URL)

**Конфигурация NestJS GraphQL:**
- Настроить `uploads: { maxFileSize: 2000000 }`

**Оценка:** 1 час

**Критерии успеха:**
- ✅ Загрузка файлов работает
- ✅ Валидация типа и размера работает
- ✅ Resize работает корректно
- ✅ Файлы сохраняются в правильной директории

---

### Этап 4: Frontend - UI Компоненты (Приоритет: 🔴 Критический)

**Цель:** Создать переиспользуемые UI компоненты для онбординга

#### Задача 4.1: Stepper Component
**Файл:** `apps/web/src/packages/components/ui/stepper.tsx`

**Функциональность:**
- Отображение прогресса 3 шагов
- Состояния: completed, current, upcoming
- Иконка Check для завершенных шагов
- Адаптивный дизайн для мобильных

**Props:**
```typescript
interface StepperProps {
  currentStep: number
  steps: Array<{ label: string; description?: string }>
}
```

**Оценка:** 2 часа

#### Задача 4.2: ImageUpload Component
**Файл:** `apps/web/src/packages/components/ui/image-upload.tsx`

**Функциональность:**
- Drag & drop или click to upload
- Валидация типа (PNG, JPG)
- Валидация размера (2MB max)
- Client-side resize до 512x512 (использовать canvas или библиотеку)
- Preview загруженного изображения
- Кнопка удаления

**Props:**
```typescript
interface ImageUploadProps {
  value?: string | File
  onChange: (file: File | null) => void
  maxSize?: number // bytes
  accept?: string
}
```

**Зависимости:**
- Возможно использовать `react-dropzone` или `browser-image-compression`

**Оценка:** 3-4 часа

#### Задача 4.3: IconPicker Component
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

**Props:**
```typescript
interface IconPickerProps {
  value?: { emoji: string; color: string }
  onChange: (icon: { emoji: string; color: string } | null) => void
}
```

**Оценка:** 2 часа

#### Задача 4.4: Экспорт компонентов
**Файл:** `apps/web/src/packages/components/ui/index.ts`

Добавить экспорты новых компонентов.

**Оценка:** 5 минут

**Критерии успеха:**
- ✅ Все компоненты работают корректно
- ✅ Адаптивный дизайн
- ✅ Интеграция с shadcn/ui стилями
- ✅ TypeScript типы корректны

---

### Этап 5: Frontend - Zod Schemas (Приоритет: 🔴 Критический)

**Цель:** Создать схемы валидации для онбординга

#### Задача 5.1: Структура директории
**Директория:** `apps/web/src/packages/schemas/onboarding/`

**Создать файлы:**
```
onboarding/
├── index.ts
├── team.schema.ts
├── project.schema.ts
└── invite.schema.ts
```

**Оценка:** 15 минут

#### Задача 5.2: Team Schema
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

**Оценка:** 15 минут

#### Задача 5.3: Project Schema
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

**Оценка:** 15 минут

#### Задача 5.4: Invite Schema
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

**Оценка:** 15 минут

#### Задача 5.5: Экспорт схем
**Файлы:** 
- `apps/web/src/packages/schemas/onboarding/index.ts`
- `apps/web/src/packages/schemas/index.ts`

Добавить экспорты всех схем.

**Оценка:** 10 минут

**Критерии успеха:**
- ✅ Все схемы валидируют корректно
- ✅ TypeScript типы генерируются
- ✅ Сообщения об ошибках на русском языке

---

### Этап 6: Frontend - GraphQL Integration (Приоритет: 🔴 Критический)

**Цель:** Создать GraphQL документы и типы для команд

#### Задача 6.1: GraphQL Document
**Файл:** `apps/web/src/packages/api/graphql/teams.graphql`

**Создать мутации и queries:**
- CreateTeam
- CreateDemoProject
- CompleteOnboarding
- JoinTeamByInvite
- CreateInviteCode
- UploadTeamLogo
- MyTeams (query)

**Оценка:** 1 час

#### Задача 6.2: Codegen
**Команда:**
```bash
pnpm --filter web run codegen
```

**Проверить:**
- Типы сгенерированы в `apps/web/src/packages/api/graphql/`
- Документы доступны для использования

**Оценка:** 15 минут

#### Задача 6.3: Apollo Client Upload Link
**Файл:** `apps/web/src/packages/api/apollo-client.ts` (или где настроен Apollo)

**Проверить/настроить:**
- Использование `createUploadLink` вместо обычного `createHttpLink`
- Установить `apollo-upload-client` если нужно

**Оценка:** 30 минут

**Критерии успеха:**
- ✅ GraphQL документы созданы
- ✅ Типы сгенерированы
- ✅ Upload работает корректно

---

### Этап 7: Frontend - Onboarding Flow (Приоритет: 🔴 Критический)

**Цель:** Реализовать страницы онбординга

#### Задача 7.1: Структура директории
**Директория:** `apps/web/src/app/(root)/onboarding/`

**Создать структуру:**
```
onboarding/
├── layout.tsx         # Layout с Stepper
├── page.tsx           # Стартовый экран
├── step-1/
│   └── page.tsx      # Название бригады
├── step-2/
│   └── page.tsx      # Логотип
├── step-3/
│   └── page.tsx      # Первый объект
└── invite/
    └── page.tsx      # Ввод кода приглашения
```

**Оценка:** 15 минут (структура)

#### Задача 7.2: Onboarding Layout
**Файл:** `apps/web/src/app/(root)/onboarding/layout.tsx`

**Функциональность:**
- Проверка авторизации (редирект на `/auth/login` если не залогинен)
- Проверка онбординга (редирект на `/dashboard` если уже прошел)
- Loading state пока идет проверка
- Отображение Stepper компонента
- Общий layout для всех шагов

**Оценка:** 2 часа

#### Задача 7.3: Стартовый экран
**Файл:** `apps/web/src/app/(root)/onboarding/page.tsx`

**Функциональность:**
- Две кнопки: "Начать настройку" и "Меня пригласили"
- "Начать настройку" → `/onboarding/step-1`
- "Меня пригласили" → `/onboarding/invite`
- Красивый дизайн с анимациями

**Оценка:** 1-2 часа

#### Задача 7.4: Шаг 1 - Название бригады
**Файл:** `apps/web/src/app/(root)/onboarding/step-1/page.tsx`

**Функциональность:**
- Форма с одним полем: название бригады
- Валидация через `teamSchema`
- Автоматическая валидация с `useAutoValidateForm`
- Сохранение в `sessionStorage` для передачи между шагами
- Кнопка "Продолжить" (disabled до валидного состояния)

**Оценка:** 1-2 часа

#### Задача 7.5: Шаг 2 - Логотип
**Файл:** `apps/web/src/app/(root)/onboarding/step-2/page.tsx`

**Функциональность:**
- Tabs: "Загрузить" vs "Выбрать иконку"
- Tab "Загрузить": ImageUpload компонент
- Tab "Выбрать иконку": IconPicker компонент
- Кнопка "Пропустить" (логотип опционален)
- Кнопка "Назад" (возврат к step-1)
- Сохранение выбора в `sessionStorage`

**Оценка:** 3-4 часа

#### Задача 7.6: Шаг 3 - Первый объект
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
- Loading state во время отправки

**Оценка:** 3-4 часа

#### Задача 7.7: Страница ввода кода приглашения
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
- Toast уведомления

**Оценка:** 2-3 часа

**Критерии успеха:**
- ✅ Все страницы работают корректно
- ✅ Валидация форм работает
- ✅ Данные сохраняются между шагами
- ✅ GraphQL мутации работают
- ✅ Редиректы работают корректно
- ✅ Обработка ошибок работает

---

### Этап 8: Frontend - Интеграция с Auth (Приоритет: 🔴 Критический)

**Цель:** Добавить редиректы на онбординг в auth flow

#### Задача 8.1: Редирект после логина
**Файл:** `apps/web/src/app/(root)/auth/login/page.tsx`

**Изменения:**
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

**Оценка:** 30 минут

#### Задача 8.2: Редирект после регистрации
**Файл:** `apps/web/src/app/(root)/auth/register/page.tsx`

**Изменения:**
```typescript
const onSubmit = async (data: TRegisterSchema) => {
  await register({ variables: { input: data } })
  router.push('/onboarding') // Всегда онбординг для новых пользователей
}
```

**Оценка:** 30 минут

**Критерии успеха:**
- ✅ После логина редирект на онбординг если не пройден
- ✅ После регистрации всегда редирект на онбординг
- ✅ После завершения онбординга редирект на dashboard

---

### Этап 9: Тестирование и полировка (Приоритет: 🟡 Средний)

**Цель:** Убедиться, что все работает корректно

#### Задача 9.1: Функциональное тестирование
**Проверить:**
1. Создание команды через онбординг
2. Пропуск шага логотипа
3. Загрузка логотипа
4. Выбор иконки вместо загрузки
5. Создание демо-объекта
6. Присоединение по коду приглашения
7. Валидация форм
8. Обработка ошибок
9. Редиректы

**Оценка:** 2-3 часа

#### Задача 9.2: UX улучшения
**Проверить:**
- Loading states везде
- Toast уведомления работают
- Адаптивный дизайн (mobile-first)
- Анимации плавные
- Сообщения об ошибках понятные

**Оценка:** 1-2 часа

#### Задача 9.3: Исправление багов
**Оценка:** 2-4 часа (зависит от найденных проблем)

**Критерии успеха:**
- ✅ Все основные сценарии работают
- ✅ Нет критических багов
- ✅ UX соответствует требованиям

---

## 📅 Временная оценка

### По этапам:
1. **Этап 1: Backend - Модели данных** - 3 часа
2. **Этап 2: Backend - Teams Module** - 8-11 часов
3. **Этап 3: Backend - Upload Module** - 3-4 часа
4. **Этап 4: Frontend - UI Компоненты** - 7-8 часов
5. **Этап 5: Frontend - Zod Schemas** - 1 час
6. **Этап 6: Frontend - GraphQL Integration** - 2 часа
7. **Этап 7: Frontend - Onboarding Flow** - 12-15 часов
8. **Этап 8: Frontend - Интеграция с Auth** - 1 час
9. **Этап 9: Тестирование и полировка** - 5-9 часов

**Итого:** ~42-54 часа (5-7 рабочих дней)

---

## 🎯 Критерии успеха MVP

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

## 🚨 Потенциальные проблемы и решения

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

### Проблема 4: Конфликт с существующей моделью Project
**Решение:**
- Обновить существующую модель Project
- Создать миграцию для добавления полей
- Обновить существующие сервисы если нужно

---

## 📝 Чеклист реализации

### Backend
- [ ] Обновить Prisma schema (Team, TeamMember, InviteCode, Project)
- [ ] Добавить поле hasCompletedOnboarding в User
- [ ] Создать миграцию
- [ ] Создать Teams module структуру
- [ ] Реализовать Teams Service
- [ ] Реализовать Teams Resolver
- [ ] Создать DTO и Entities
- [ ] Создать Uploads module
- [ ] Реализовать Uploads Service
- [ ] Реализовать Uploads Resolver
- [ ] Протестировать API

### Frontend
- [ ] Создать Stepper компонент
- [ ] Создать ImageUpload компонент
- [ ] Создать IconPicker компонент
- [ ] Создать Zod схемы (team, project, invite)
- [ ] Создать GraphQL документы
- [ ] Запустить codegen
- [ ] Создать onboarding layout
- [ ] Создать стартовый экран
- [ ] Создать step-1 страницу
- [ ] Создать step-2 страницу
- [ ] Создать step-3 страницу
- [ ] Создать invite страницу
- [ ] Обновить login page (редирект)
- [ ] Обновить register page (редирект)
- [ ] Протестировать flow

---

## 🔄 Post-MVP (Низкий приоритет)

1. Wizard для дополнительных команд (`/teams/new`)
2. Cloudflare R2 integration (вместо локального хранения)
3. E2E тесты
4. Seed данных для разработки
5. Улучшенная обработка ошибок
6. Аналитика онбординга

---

## 📚 Дополнительные ресурсы

- [Документ анализа онбординга](./onboarding.md) - детальное описание требований
- [Roadmap проекта](../roadmap.md) - общий план развития
- [Changelog Backend](../changelog.backend.md) - история изменений backend
- [Changelog Frontend](../changelog.frontend.md) - история изменений frontend

---

**Последнее обновление:** 2024-12-XX  
**Статус:** Готов к реализации  
**Приоритет:** Высокий (MVP)

