# Готовность к разработке: Система онбординга ProRab

**Дата подготовки:** 2024-12-03
**Статус:** ✅ Готово к началу разработки
**Начало разработки:** 2024-12-03

---

## 📋 Сводка проекта

### Цель
Реализовать обязательную систему онбординга для новых пользователей ProRab с созданием бригад и системой приглашений.

### Масштаб
- **Время:** 3-4 недели (~42-54 часа)
- **Приоритет:** 🔴 Критический (MVP)
- **Этапы:** 12 основных этапов
- **Файлы:** ~30 новых файлов, ~5 модифицированных

---

## ✅ Чеклист готовности

### Документация
- [x] ✅ Детальный план разработки создан ([onboarding-development-plan.md](./onboarding-development-plan.md))
- [x] ✅ Краткий план-сводка создан ([onboarding-plan-summary.md](./onboarding-plan-summary.md))
- [x] ✅ Полная спецификация создан ([onboarding.md](./onboarding.md))
- [x] ✅ План реализации создан ([onboarding-implementation-plan.md](./onboarding-implementation-plan.md))
- [x] ✅ Roadmap обновлен ([../../roadmap.md](../../roadmap.md))

### Архитектура
- [x] ✅ Анализ существующей архитектуры проведен
- [x] ✅ Backend паттерны изучены (NestJS + GraphQL + Prisma)
- [x] ✅ Frontend паттерны изучены (Next.js 15 + React Hook Form + Zod)
- [x] ✅ Модели данных спроектированы (Team, TeamMember, InviteCode, Project)
- [x] ✅ GraphQL API спроектирован (мутации и запросы)

### UI/UX Дизайн
- [x] ✅ User flow определен (2 пути: "Начать настройку" / "Меня пригласили")
- [x] ✅ Шаги онбординга определены (3 шага + invite page)
- [x] ✅ UI компоненты определены (Stepper, ImageUpload, IconPicker, TeamLogo)
- [x] ✅ Валидация форм определена (Zod schemas)
- [x] ✅ Mobile-first подход утвержден

### Технические требования
- [x] ✅ Backend: NestJS + GraphQL + Prisma + PostgreSQL + Redis
- [x] ✅ Frontend: Next.js 15 + Tailwind + shadcn/ui
- [x] ✅ Зависимости определены (sharp, graphql-upload-minimal)
- [x] ✅ Существующий код совместим (auth flow, User model)

---

## 🎯 План реализации

### Неделя 1: Backend Foundation (2024-12-03 - 2024-12-09)

#### День 1: База данных (2-3 часа)
**Задачи:**
- [ ] Обновить Prisma schema
  - [ ] Добавить модель Team
  - [ ] Добавить модель TeamMember
  - [ ] Добавить модель InviteCode
  - [ ] Обновить модель Project (добавить teamId, isDemo, и т.д.)
  - [ ] Добавить hasCompletedOnboarding в User
- [ ] Создать миграцию `add_teams_onboarding`
- [ ] Применить миграцию: `npx prisma migrate dev`
- [ ] Сгенерировать Prisma Client: `npx prisma generate`

**Файлы:**
- `apps/api/prisma/schema.prisma` (изменить)

**Критерии успеха:**
- ✅ Миграция применена без ошибок
- ✅ Prisma Client сгенерирован
- ✅ Все индексы созданы

#### День 2-3: Teams Module (6-8 часов)
**Задачи:**
- [ ] Создать структуру `apps/api/src/modules/teams/`
- [ ] Реализовать teams.service.ts (6 методов)
- [ ] Реализовать teams.resolver.ts (GraphQL API)
- [ ] Создать DTOs (create-team.input.ts, complete-onboarding.input.ts)
- [ ] Создать Models (team.model.ts, team-member.model.ts, invite-code.model.ts)
- [ ] Создать team-owner.guard.ts
- [ ] Добавить TeamsModule в app.module.ts

**Файлы:**
- `apps/api/src/modules/teams/teams.module.ts` (создать)
- `apps/api/src/modules/teams/teams.service.ts` (создать)
- `apps/api/src/modules/teams/teams.resolver.ts` (создать)
- `apps/api/src/modules/teams/dto/*.ts` (создать)
- `apps/api/src/modules/teams/models/*.ts` (создать)
- `apps/api/src/modules/teams/guards/team-owner.guard.ts` (создать)
- `apps/api/src/app.module.ts` (изменить)

**Критерии успеха:**
- ✅ Все методы реализованы с валидацией
- ✅ GraphQL schema сгенерирован
- ✅ Бизнес-логика работает корректно

#### День 4: Uploads Module + Auth Updates (3-4 часа)
**Задачи:**
- [ ] Создать структуру `apps/api/src/modules/uploads/`
- [ ] Реализовать uploads.service.ts (Sharp resize)
- [ ] Реализовать uploads.resolver.ts
- [ ] Установить зависимости: `npm install sharp graphql-upload-minimal`
- [ ] Обновить User Model (hasCompletedOnboarding)
- [ ] Обновить Auth GraphQL schema
- [ ] Обновить Me query

**Файлы:**
- `apps/api/src/modules/uploads/uploads.module.ts` (создать)
- `apps/api/src/modules/uploads/uploads.service.ts` (создать)
- `apps/api/src/modules/uploads/uploads.resolver.ts` (создать)
- `apps/api/src/modules/users/models/user.model.ts` (изменить)
- `apps/api/src/modules/auth/models/auth.model.ts` (изменить)

**Критерии успеха:**
- ✅ Upload файлов работает
- ✅ Resize изображений корректный
- ✅ hasCompletedOnboarding возвращается в Me query

### Неделя 2: Frontend Implementation (2024-12-10 - 2024-12-16)

#### День 1: Schemas + GraphQL (2-3 часа)
**Задачи:**
- [ ] Создать `apps/web/src/packages/schemas/teams/`
- [ ] Реализовать team.schema.ts
- [ ] Реализовать project.schema.ts
- [ ] Реализовать invite.schema.ts
- [ ] Экспортировать схемы
- [ ] Создать teams.graphql
- [ ] Запустить codegen
- [ ] Проверить Apollo upload link

**Файлы:**
- `apps/web/src/packages/schemas/teams/team.schema.ts` (создать)
- `apps/web/src/packages/schemas/teams/project.schema.ts` (создать)
- `apps/web/src/packages/schemas/teams/invite.schema.ts` (создать)
- `apps/web/src/packages/schemas/teams/index.ts` (создать)
- `apps/web/src/packages/api/graphql/teams.graphql` (создать)

**Критерии успеха:**
- ✅ Схемы валидируют корректно
- ✅ GraphQL типы сгенерированы
- ✅ Upload link настроен

#### День 2-3: UI Components (6-8 часов)
**Задачи:**
- [ ] Создать Stepper Component
- [ ] Создать ImageUpload Component
- [ ] Создать IconPicker Component
- [ ] Создать TeamLogo Component
- [ ] Экспортировать компоненты

**Файлы:**
- `apps/web/src/packages/components/features/stepper.tsx` (создать)
- `apps/web/src/packages/components/features/image-upload.tsx` (создать)
- `apps/web/src/packages/components/features/icon-picker.tsx` (создать)
- `apps/web/src/packages/components/features/team-logo.tsx` (создать)

**Критерии успеха:**
- ✅ Все компоненты работают
- ✅ Адаптивный дизайн
- ✅ Интеграция с shadcn/ui

#### День 4-5: Onboarding Pages (8-10 часов)
**Задачи:**
- [ ] Создать структуру `apps/web/src/app/(root)/onboarding/`
- [ ] Реализовать layout.tsx (guards + Stepper)
- [ ] Реализовать page.tsx (стартовый экран)
- [ ] Реализовать step-1/page.tsx (название бригады)
- [ ] Реализовать step-2/page.tsx (логотип)
- [ ] Реализовать step-3/page.tsx (первый проект)
- [ ] Реализовать invite/page.tsx (код приглашения)

**Файлы:**
- `apps/web/src/app/(root)/onboarding/layout.tsx` (создать)
- `apps/web/src/app/(root)/onboarding/page.tsx` (создать)
- `apps/web/src/app/(root)/onboarding/step-1/page.tsx` (создать)
- `apps/web/src/app/(root)/onboarding/step-2/page.tsx` (создать)
- `apps/web/src/app/(root)/onboarding/step-3/page.tsx` (создать)
- `apps/web/src/app/(root)/onboarding/invite/page.tsx` (создать)

**Критерии успеха:**
- ✅ Все страницы работают
- ✅ Валидация форм
- ✅ SessionStorage работает
- ✅ GraphQL мутации работают

### Неделя 3: Integration & Polish (2024-12-17 - 2024-12-20)

#### День 1: Auth Integration (2-3 часа)
**Задачи:**
- [ ] Обновить Login Page (редирект)
- [ ] Обновить Register Page (редирект)
- [ ] Создать useOnboardingGuard hook

**Файлы:**
- `apps/web/src/app/(root)/auth/login/page.tsx` (изменить)
- `apps/web/src/app/(root)/auth/register/page.tsx` (изменить)
- `apps/web/src/packages/hooks/use-onboarding-guard.ts` (создать)

**Критерии успеха:**
- ✅ Редиректы работают
- ✅ Guard работает корректно

#### День 2-3: Error Handling & Testing (5-7 часов)
**Задачи:**
- [ ] Backend валидации
- [ ] Frontend error handling
- [ ] Happy path тестирование
- [ ] Edge cases тестирование
- [ ] UX проверка

**Критерии успеха:**
- ✅ Все валидации работают
- ✅ Ошибки обрабатываются корректно
- ✅ Toast уведомления работают
- ✅ Mobile responsive

#### День 4: Documentation (2-3 часа)
**Задачи:**
- [ ] Обновить roadmap.md (✅ уже сделано)
- [ ] Обновить changelog.md
- [ ] Создать API документацию

---

## 📝 Критические файлы

### 5 самых важных файлов

1. **`apps/api/prisma/schema.prisma`**
   - Основа для всей функции
   - Определяет модели Team, TeamMember, InviteCode, Project

2. **`apps/api/src/modules/teams/teams.service.ts`**
   - Основная бизнес-логика
   - Все валидации и создание данных

3. **`apps/web/src/app/(root)/onboarding/step-3/page.tsx`**
   - Финальный шаг онбординга
   - Оркестрирует CompleteOnboarding мутацию

4. **`apps/api/src/modules/teams/teams.resolver.ts`**
   - GraphQL API слой
   - Все мутации и запросы

5. **`apps/web/src/packages/api/graphql/teams.graphql`**
   - Контракт между frontend и backend
   - Определяет все GraphQL операции

---

## 🛠️ Инструменты и команды

### Установка зависимостей

```bash
# Backend
cd apps/api
npm install sharp graphql-upload-minimal

# Frontend (зависимости уже установлены)
cd apps/web
# react-hook-form, zod, @apollo/client уже есть
```

### Миграция базы данных

```bash
cd apps/api
npx prisma migrate dev --name add_teams_onboarding
npx prisma generate
```

### Кодогенерация GraphQL

```bash
cd apps/web
npm run graphql:codegen
```

### Запуск проекта

```bash
# Root directory
pnpm dev

# Или отдельно
pnpm --filter api dev
pnpm --filter web dev
```

---

## 🎨 UI/UX Guidelines

### Онбординг Flow

```
┌─────────────────────────────────┐
│   Добро пожаловать в ProRab     │
├─────────────────────────────────┤
│  ┌───────────────────────────┐  │
│  │   Начать настройку        │  │ → Step 1-3
│  └───────────────────────────┘  │
│                                 │
│  ┌───────────────────────────┐  │
│  │   Меня пригласили         │  │ → Invite Page
│  └───────────────────────────┘  │
└─────────────────────────────────┘
```

### Шаги онбординга

1. **Шаг 1:** Название бригады (обязательно)
   - Input field
   - Real-time validation
   - Next button

2. **Шаг 2:** Логотип (опционально)
   - Tabs: Upload / Icon Picker
   - Skip button
   - Back button

3. **Шаг 3:** Первый проект (обязательно)
   - Input field
   - Demo data preview
   - Submit button

### Цвета и эмодзи для IconPicker

**Эмодзи:**
- 🏗️ Стройка
- 🔨 Молоток
- ⚒️ Инструменты
- 🧱 Кирпич
- 🏠 Дом
- 🔧 Гаечный ключ
- 👷 Строитель
- 🎨 Краска

**Цвета:**
- Amber: #F59E0B
- Blue: #3B82F6
- Green: #10B981
- Red: #EF4444
- Purple: #8B5CF6
- Pink: #EC4899
- Orange: #F97316
- Teal: #14B8A6

---

## 🚨 Критические валидации

### Backend

1. **Owner ограничения:**
   - Владелец может иметь только 1 бригаду
   - Владелец не может присоединиться к другим бригадам

2. **Invite codes:**
   - 6 символов (A-Z0-9)
   - Истечение через 7 дней
   - Одноразовое использование
   - Проверка существования

3. **Slug generation:**
   - Уникальность
   - Транслитерация из кириллицы
   - Fallback на nanoid при коллизии

### Frontend

1. **Form validation:**
   - Название бригады: 2-50 символов
   - Название проекта: 3-100 символов
   - Код приглашения: ровно 6 символов, только A-Z0-9

2. **File upload:**
   - Типы: PNG, JPG, WEBP
   - Размер: максимум 5MB
   - Resize preview: 512x512

---

## 🎯 Критерии успеха MVP

### Backend
- ✅ Модели созданы и миграция применена
- ✅ GraphQL API работает
- ✅ Валидация входных данных
- ✅ Owner ограничения работают
- ✅ Коды приглашения с истечением

### Frontend
- ✅ Онбординг только для новых пользователей
- ✅ Stepper отображает прогресс
- ✅ Валидация форм в реальном времени
- ✅ Загрузка логотипа с resize
- ✅ Демо-проект создается
- ✅ Invite flow работает
- ✅ Редиректы корректны

### UX
- ✅ Mobile-first дизайн
- ✅ Понятные сообщения об ошибках
- ✅ Loading states везде
- ✅ Toast уведомления

---

## 📚 Дополнительные ресурсы

- **Детальный план:** [onboarding-development-plan.md](./onboarding-development-plan.md)
- **Спецификация:** [onboarding.md](./onboarding.md)
- **Roadmap:** [../../roadmap.md](../../roadmap.md)
- **Changelog Backend:** [../../changelog.backend.md](../../changelog.backend.md)
- **Changelog Frontend:** [../../changelog.frontend.md](../../changelog.frontend.md)

---

## ✅ Финальная проверка

- [x] Документация подготовлена
- [x] Архитектура спроектирована
- [x] UI/UX определен
- [x] Технические требования ясны
- [x] План реализации готов
- [x] Roadmap обновлен
- [x] Команда готова к старту

**🎉 Проект готов к началу разработки!**

---

**Подготовил:** Claude (AI Assistant)
**Дата:** 2024-12-03
**Версия:** 1.0
