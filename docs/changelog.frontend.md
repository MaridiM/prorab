# Changelog (frontend)

## Module: Onboarding

### Step: Unified Design System - Onboarding Redesign

:calendar: `2025-12-04`

**Problem**

- ❌ Дизайн онбординга не соответствовал стилю страниц авторизации и регистрации
- ❌ Отсутствовало единообразие в визуальном оформлении
- ❌ Разные стили карточек, кнопок и инпутов на разных страницах
- ❌ Нет анимированного фона и переключателя темы в layout онбординга

**Solution**

- ✅ Полностью переделан дизайн всех страниц онбординга в едином стиле с auth страницами
- ✅ Добавлен единый layout с анимированным фоном и переключателем темы
- ✅ Унифицированы все компоненты: Card, Button, Input, Form элементы
- ✅ Добавлены декоративные элементы (градиенты, логотип PR) на всех страницах
- ✅ Единые анимации и переходы с использованием Framer Motion

**Changed**

- ✅ **Onboarding Layout** (`layout.tsx`):
  - Добавлен анимированный фон с градиентными кругами (как в auth layout)
  - Добавлен переключатель темы в правом верхнем углу
  - Добавлена ссылка "На главную" в левом верхнем углу
  - Добавлен футер с ссылками на политику конфиденциальности и оферту
  - Изменен с простого градиентного фона на полноэкранный layout с анимациями

- ✅ **Start Page** (`page.tsx`):
  - Переделан в Card компонент с `bg-card/80 backdrop-blur-xl`
  - Добавлен декоративный градиент сверху (`h-1 bg-linear-to-r`)
  - Добавлен логотип PR с градиентом `from-accent to-amber-500`
  - Обновлены кнопки в едином стиле с hover эффектами и анимациями
  - Изменены стили с простых border-2 на единый стиль Card

- ✅ **Step 1: Название бригады** (`step-1/page.tsx`):
  - Переделан в Card компонент в едином стиле
  - Добавлен декоративный градиент и логотип с иконкой Building2
  - Обновлены Input поля: `h-12 rounded-xl bg-secondary/30`
  - Добавлены иконки к FormLabel (Building2)
  - Обновлены кнопки с тенями и анимациями
  - Изменены стили с простых border на единый стиль auth страниц

- ✅ **Step 2: Логотип** (`step-2/page.tsx`):
  - Переделан в Card компонент в едином стиле
  - Добавлен декоративный градиент и логотип с иконкой Image
  - Добавлен выбор цвета с blur эффектом для логотипа бригады
  - Реализован компонент IconPicker с выбором иконки и цвета
  - Выбранный цвет отображается с кольцом и blur эффектом (`ring-2 ring-primary ring-offset-2`)
  - Добавлено превью логотипа с выбранным цветом и иконкой
  - Обновлены кнопки навигации в едином стиле
  - Кнопка "Пропустить" переделана в ghost вариант
  - Добавлены анимации для всех элементов

- ✅ **Step 3: Первый объект** (`step-3/page.tsx`):
  - Переделан в Card компонент в едином стиле
  - Добавлен декоративный градиент и логотип с иконкой MapPin
  - Добавлены иконки к каждому полю (MapPin, FileText)
  - Обновлены Input поля в едином стиле
  - Заменен спиннер на Loader2 компонент
  - Обновлены кнопки с тенями и анимациями

- ✅ **Invite Page** (`invite/page.tsx`):
  - Переделан в Card компонент в едином стиле
  - Добавлен декоративный градиент и логотип с иконкой Key
  - Обновлен Input для кода: `h-14 text-2xl font-mono`
  - Обновлены кнопки в едином стиле
  - Заменен спиннер на Loader2 компонент
  - Добавлены анимации для всех элементов

**Added**

- ✅ Единые стили для всех Card компонентов:
  - `bg-card/80 backdrop-blur-xl border border-border/50 rounded-3xl shadow-2xl`
  - Декоративный градиент сверху: `h-1 bg-linear-to-r from-accent via-primary to-accent`
  - Логотип PR: `bg-linear-to-br from-accent to-amber-500` с hover анимацией

- ✅ Единые стили для Input полей:
  - `h-12 px-4 rounded-xl bg-secondary/30 border-border/50`
  - `focus:border-primary/50 focus-visible:ring-primary/20`

- ✅ Единые стили для кнопок:
  - Primary: `h-12 rounded-xl bg-primary shadow-lg shadow-primary/20`
  - Outline: `border-2 border-border/50`
  - Hover эффекты и анимации `active:scale-[0.98]`

- ✅ Иконки в заголовках страниц:
  - Building2 для Step 1
  - Image для Step 2
  - MapPin для Step 3
  - Key для Invite Page

**Fixed**

- ✅ N/A

**Removed**

- ❌ N/A

**Files Modified**

- `apps/web/src/app/(root)/onboarding/layout.tsx` — полностью переделан layout
- `apps/web/src/app/(root)/onboarding/page.tsx` — переделан в Card стиль
- `apps/web/src/app/(root)/onboarding/step-1/page.tsx` — обновлен дизайн
- `apps/web/src/app/(root)/onboarding/step-2/page.tsx` — обновлен дизайн
- `apps/web/src/app/(root)/onboarding/step-3/page.tsx` — обновлен дизайн
- `apps/web/src/app/(root)/onboarding/invite/page.tsx` — обновлен дизайн

**Benefits**

- 🎨 **Единый визуальный стиль** — все страницы онбординга теперь соответствуют стилю auth страниц
- 🎯 **Улучшенный UX** — единообразные элементы интерфейса улучшают пользовательский опыт
- 🌈 **Консистентность** — одинаковые стили карточек, кнопок, инпутов на всех страницах
- ✨ **Современный дизайн** — backdrop-blur эффекты, градиенты, тени
- 🎭 **Анимации** — плавные переходы и hover эффекты на всех элементах
- 🌓 **Тема** — переключатель темы доступен на всех страницах онбординга
- 📱 **Адаптивность** — сохранена mobile-first адаптивность

**Technical Details**

- Все Card компоненты используют одинаковые классы для единообразия
- Декоративный градиент добавлен на все страницы через `absolute top-0`
- Логотип PR с анимацией `whileHover={{ scale: 1.05, rotate: -5 }}`
- Framer Motion анимации с едиными `fadeIn` вариантами
- Импорты компонентов унифицированы через `@/packages/components`
- Все кнопки используют Button компонент с едиными вариантами (primary, outline, ghost)

---

### Step: UI Components and Onboarding Pages

:calendar: `2025-12-04`

**Problem**

- ❌ Отсутствовали UI компоненты для онбординга (Stepper, IconPicker, TeamLogo)
- ❌ Не было страниц для прохождения онбординга (3 шага + invite)
- ❌ Нужен был flow для создания команды и присоединения по коду

**Solution**

- ✅ Созданы все необходимые UI компоненты с анимациями Framer Motion
- ✅ Реализован полный onboarding flow с 3 шагами
- ✅ Добавлена страница для присоединения по коду приглашения
- ✅ Использован sessionStorage для сохранения прогресса

**Added**

- ✅ **Stepper Component** (`stepper.tsx`):
  - Визуальный индикатор прогресса (1/3, 2/3, 3/3)
  - Анимированные переходы между шагами
  - Check-mark иконка для завершенных шагов
  - Responsive дизайн с labels под каждым шагом

- ✅ **IconPicker Component** (`icon-picker.tsx`):
  - 10 предустановленных эмодзи (🔨, 🔧, 🏗️, 👷, 🧱, 🛠️, 🏠, 🏢, 🏗️, 🚚)
  - 8 цветов фона (orange, blue, green, red, purple, yellow, pink, teal)
  - Выбор цвета с blur эффектом и кольцом для выбранного цвета
  - Визуальная индикация выбранного цвета: `ring-2 ring-primary ring-offset-2 ring-offset-background`
  - Live preview с анимацией изменения цвета и иконки
  - Grid layout с hover эффектами и плавными переходами
  - Анимированное появление элементов (stagger animation)
  - Экспорт констант TEAM_ICONS и BACKGROUND_COLORS

- ✅ **TeamLogo Component** (`team-logo.tsx`):
  - 3 режима отображения: uploaded image / emoji icon / initials
  - 4 размера: sm, md, lg, xl
  - Fallback на инициалы из названия команды
  - Next.js Image optimization для загруженных логотипов

- ✅ **Onboarding Pages**:
  - **Layout** — градиентный фон, центрированный контейнер (max-w-md)
  - **Start Page** (`/onboarding`) — 2 опции: создать бригаду / присоединиться
  - **Step 1** (`/onboarding/step-1`) — форма названия бригады с валидацией
  - **Step 2** (`/onboarding/step-2`) — выбор иконки и цвета, кнопка "Пропустить"
  - **Step 3** (`/onboarding/step-3`) — форма первого проекта (название, адрес, описание)
  - **Invite Page** (`/onboarding/invite`) — ввод 6-значного кода приглашения

**Changed**

- ✅ N/A

**Fixed**

- ✅ N/A

**Removed**

- ❌ N/A

**Files Created**

- `apps/web/src/packages/components/ui/stepper.tsx`
- `apps/web/src/packages/components/ui/icon-picker.tsx`
- `apps/web/src/packages/components/ui/team-logo.tsx`
- `apps/web/src/app/(root)/onboarding/layout.tsx`
- `apps/web/src/app/(root)/onboarding/page.tsx`
- `apps/web/src/app/(root)/onboarding/step-1/page.tsx`
- `apps/web/src/app/(root)/onboarding/step-2/page.tsx`
- `apps/web/src/app/(root)/onboarding/step-3/page.tsx`
- `apps/web/src/app/(root)/onboarding/invite/page.tsx`

**Files Modified**

- `apps/web/src/packages/components/ui/index.ts` — добавлены экспорты новых компонентов
- `docs/roadmap.md` — отмечены completed задачи UI Components и Onboarding Pages

**Benefits**

- 🎨 **Современный дизайн** — все компоненты с Framer Motion анимациями
- 📱 **Mobile-first** — адаптивный дизайн для всех экранов
- ✅ **Валидация в реальном времени** — react-hook-form + Zod на всех формах
- 💾 **Сохранение прогресса** — sessionStorage для восстановления данных при возврате
- 🚀 **Готовность к интеграции** — все формы готовы к подключению GraphQL mutations
- 🎯 **UX оптимизация** — loading states, disabled states, анимированные transitions
- ♿ **Accessibility** — ARIA labels, keyboard navigation, screen reader support

**Technical Details**

- Stepper: использует Framer Motion для анимации progress bar и шагов
- IconPicker: grid layout 5 колонок для иконок, 8 колонок для цветов
- TeamLogo: Next.js Image с fill layout и object-cover для uploaded images
- Step 1-3: sessionStorage keys `onboarding_step1/2/3` для сохранения прогресса
- Invite Page: автоматический toUpperCase для кода, font-mono для читабельности
- Validation: все формы используют zodResolver с реальными схемами валидации
- Navigation: router.push для переходов, проверка наличия данных предыдущих шагов
- Error Handling: FormMessage компоненты для отображения ошибок валидации

**Next Steps**

- ⏳ Создать ImageUpload Component для загрузки логотипов
- ⏳ Реализовать backend Teams Module (Service + Resolver)
- ⏳ Подключить GraphQL mutations к формам
- ⏳ Добавить useOnboardingGuard hook для редиректов после auth
- ⏳ Реализовать error handling для network/GraphQL errors

---

## Module: Onboarding

### Step: GraphQL Schema and Database Models for Teams

:calendar: `2025-12-04`

**Problem**

- ❌ Отсутствовала база данных для хранения команд, участников, проектов и кодов приглашений
- ❌ Не было GraphQL схемы для взаимодействия фронтенда с backend API
- ❌ User модель не имела поле для отслеживания завершения онбординга

**Solution**

- ✅ Обновлена Prisma схема с полными моделями для Teams модуля
- ✅ Создана GraphQL схема на фронтенде с queries и mutations
- ✅ Добавлено поле hasCompletedOnboarding в User модель (backend GraphQL)

**Added**

- ✅ **Prisma Models** (`apps/api/prisma/schema.prisma`):
  - `Team` — команда/бригада (id, name, logo, iconId, ownerId, timestamps)
  - `TeamMember` — участник команды (id, teamId, userId, role, joinedAt)
  - `InviteCode` — код приглашения (id, teamId, code, expiresAt, usedBy, usedAt)
  - `Project` — проект/объект (id, teamId, name, address, description, isActive)
  - `User.hasCompletedOnboarding` — флаг завершения онбординга (default: false)
  - Relations: User ↔ Team (owner), User ↔ TeamMember, Team ↔ Project, Team ↔ InviteCode
  - Индексы для оптимизации: ownerId, userId, teamId, code
  - Каскадное удаление (onDelete: Cascade) для связанных записей

- ✅ **GraphQL Schema** (`apps/web/src/packages/api/graphql/teams.graphql`):
  - **Types**: Team, TeamMember, Project, InviteCode, InviteCodeValidation
  - **Queries**: MyTeams, ValidateInviteCode, GetTeamInviteCode
  - **Mutations**:
    - CompleteOnboarding — завершение онбординга с созданием команды и первого проекта
    - CreateTeam, UpdateTeam — управление командой
    - UpdateTeamLogo — загрузка/обновление логотипа (Upload type)
    - CreateProject, UpdateProject — управление проектами
    - CreateInviteCode — генерация кода приглашения
    - JoinTeamByInvite — присоединение к команде по коду

- ✅ **Backend User Model** (`apps/api/src/modules/users/models/user.model.ts`):
  - Добавлено поле `hasCompletedOnboarding: boolean` с GraphQL @Field декоратором

**Changed**

- ✅ Prisma schema обновлена с новыми моделями и отношениями
- ✅ User модель расширена полем hasCompletedOnboarding и relations (ownedTeams, teamMemberships)
- ✅ Project модель изменена: id теперь String (UUID), добавлены teamId, address, isActive

**Fixed**

- ✅ N/A

**Removed**

- ❌ N/A

**Files Created**

- `apps/web/src/packages/api/graphql/teams.graphql`

**Files Modified**

- `apps/api/prisma/schema.prisma` — добавлены модели Team, TeamMember, InviteCode, обновлены User и Project
- `apps/api/src/modules/users/models/user.model.ts` — добавлено hasCompletedOnboarding
- `docs/roadmap.md` — отмечены completed задачи в Backend Database & Models, Auth Updates, Frontend GraphQL Integration

**Benefits**

- 🗄️ **Полная схема данных** — все необходимые таблицы для Teams модуля готовы
- 🔗 **Правильные связи** — отношения между User, Team, Project настроены с каскадным удалением
- ⚡ **Оптимизация** — индексы на часто используемых полях для быстрых запросов
- 🎯 **Type Safety** — GraphQL схема готова для кодогенерации TypeScript типов
- 📡 **Полное API** — все необходимые queries и mutations для онбординга и управления командами
- 🔒 **Безопасность** — уникальные коды приглашений, проверка owner/member ролей
- 🔄 **Готовность к миграции** — Prisma схема готова для создания миграции (требуется освобождение места на диске)

**Technical Details**

- Prisma models используют UUID для всех ID (кроме старых моделей для совместимости)
- snake_case для имен таблиц и колонок через @map и @@map
- Invite codes: 6-значные коды (A-Z, 0-9), уникальные, с expiration tracking
- Team ownership: один пользователь может быть owner только одной команды
- GraphQL Upload type для загрузки логотипов (через apollo-upload-client)
- Cascading deletes: при удалении Team удаляются все связанные Project, TeamMember, InviteCode

**Next Steps**

- ⏳ Освободить место на системном диске для запуска Prisma migrations
- ⏳ Выполнить `prisma migrate dev --name add_teams_onboarding`
- ⏳ Выполнить `prisma generate` для обновления Prisma Client
- ⏳ Реализовать Teams Module на backend (Service + Resolver)
- ⏳ Запустить codegen после готовности backend API

---

## Module: Onboarding

### Step: Teams Validation Schemas with Zod

:calendar: `2025-12-04`

**Problem**

- ❌ Отсутствовала валидация для форм онбординга (создание команды, проекта, приглашений)
- ❌ Нужна централизованная система валидации для всех форм teams модуля

**Solution**

- ✅ Созданы Zod схемы валидации для всех форм онбординга и управления командами
- ✅ Типобезопасность через автоматический вывод TypeScript типов из Zod схем
- ✅ Валидация на стороне клиента с детальными сообщениями об ошибках

**Added**

- ✅ `team.schema.ts` — валидация создания/обновления команды:
  - `createTeamSchema` — название команды (2-50 символов, обязательно)
  - `updateTeamLogoSchema` — загрузка логотипа (JPG/PNG/WEBP, до 5MB) или выбор иконки
  - `updateTeamSchema` — обновление названия команды
- ✅ `project.schema.ts` — валидация создания/обновления проекта:
  - `createProjectSchema` — название объекта (2-100 символов), адрес (опционально, 5-200 символов), описание (до 500 символов)
  - `updateProjectSchema` — обновление всех полей + статус isActive
- ✅ `invite.schema.ts` — валидация кодов приглашений:
  - `inviteCodeSchema` — валидация 6-значного кода (A-Z, 0-9) с автоматическим toUpperCase
  - `generateInviteCodeSchema` — валидация UUID команды
  - `joinTeamByCodeSchema` — валидация кода при присоединении к команде
- ✅ `index.ts` — централизованный экспорт всех схем teams модуля

**Changed**

- ✅ N/A

**Fixed**

- ✅ N/A

**Removed**

- ❌ N/A

**Files Created**

- `apps/web/src/packages/schemas/teams/team.schema.ts`
- `apps/web/src/packages/schemas/teams/project.schema.ts`
- `apps/web/src/packages/schemas/teams/invite.schema.ts`
- `apps/web/src/packages/schemas/teams/index.ts`

**Files Modified**

- `docs/roadmap.md` — отмечены completed задачи в секции "Frontend - Validation Schemas"

**Benefits**

- 🎯 **Типобезопасность** — автоматический вывод TypeScript типов из Zod схем (CreateTeamInput, CreateProjectInput, InviteCodeInput)
- ✅ **Централизованная валидация** — единые правила валидации для всех форм teams модуля
- 🎨 **Детальные ошибки** — понятные сообщения на русском языке для пользователя
- 🔒 **Строгая валидация** — форматы файлов, размеры, регулярные выражения для кодов приглашений
- 🚀 **Готовность к интеграции** — схемы готовы для использования с react-hook-form и zodResolver
- 📦 **Переиспользуемость** — TypeScript типы экспортируются и могут использоваться в любых компонентах

**Technical Details**

- Zod версия: совместима с react-hook-form через @hookform/resolvers/zod
- Валидация кодов приглашений: ровно 6 символов, только A-Z и 0-9, автоматическое приведение к uppercase
- Валидация файлов: проверка size (max 5MB) и MIME type (image/jpeg, image/png, image/webp)
- Строковые поля используют `.trim()` для удаления пробелов и `.refine()` для дополнительных проверок
- Все опциональные поля помечены `.optional()` для гибкости форм

---

## Module: Auth Pages Animations

### Step: Unified Button Animations and Telegram Button Fix

:calendar: `2025-12-03`

**Problem**

- ❌ Telegram button on login page had delayed animation (delay: 0.4) causing visual lag
- ❌ Telegram button appeared to jump up and down, not synchronized with other elements
- ❌ Inconsistent animation structure across auth pages (login, register, forgot-password, reset-password)
- ❌ Telegram button used different animation approach than "Enter" button
- ❌ Elements below "Enter" button (divider, Telegram button, register link) were not unified

**Solution**

- ✅ Unified all button animations across all auth pages using consistent `motion.div` wrapper structure
- ✅ Synchronized Telegram button animation with "Enter" button using identical `fadeIn` variant
- ✅ Combined divider, Telegram button, and register link into unified animation block
- ✅ Standardized animation delays and durations across all auth pages

**Added**

- ✅ Consistent `motion.div` wrapper structure for all submit buttons on auth pages
- ✅ Unified animation block for divider, Telegram button, and register link on login page
- ✅ Standardized `fadeIn` variant usage with `delay: 0.3` for all buttons

**Changed**

- ✅ **Login page** (`apps/web/src/app/(root)/auth/login/page.tsx`):
  - Wrapped "Enter" button in `motion.div` with `fadeIn` variant and `delay: 0.3`
  - Unified divider, Telegram button, and register link into single `motion.div` block
  - Changed Telegram button from `motion.button` to regular `button` inside `motion.div` wrapper
  - Synchronized Telegram button animation delay from `0.4` to `0.3` to match "Enter" button
  - Removed separate `hover:scale-[1.01]` from Telegram button, using only `active:scale-[0.98]` like "Enter" button
  - Added `group` class to Telegram button for consistency
- ✅ **Register page** (`apps/web/src/app/(root)/auth/register/page.tsx`):
  - Already had correct structure, no changes needed
- ✅ **Forgot Password page** (`apps/web/src/app/(root)/auth/forgot-password/page.tsx`):
  - Wrapped submit button in `motion.div` with `fadeIn` variant and `delay: 0.3`
- ✅ **Reset Password page** (`apps/web/src/app/(root)/auth/reset-password/page.tsx`):
  - Wrapped submit button in `motion.div` with `fadeIn` variant and `delay: 0.3`

**Fixed**

- ✅ Fixed Telegram button animation delay causing visual lag
- ✅ Fixed Telegram button appearing to jump by removing separate Y-axis movement
- ✅ Fixed inconsistent button animation structure across auth pages
- ✅ Fixed Telegram button not working the same way as "Enter" button
- ✅ Fixed elements below "Enter" button not appearing as unified block

**Removed**

- ❌ Removed `fadeInOnly` variant (unused after unification)
- ❌ Removed separate `hover:scale-[1.01]` from Telegram button className
- ❌ Removed individual animation delays for divider, Telegram button, and register link

**Files Modified**

- `apps/web/src/app/(root)/auth/login/page.tsx`
- `apps/web/src/app/(root)/auth/forgot-password/page.tsx`
- `apps/web/src/app/(root)/auth/reset-password/page.tsx`

**Benefits**

- 🎯 **Consistent UX** — all buttons across all auth pages now have identical animation behavior
- ⚡ **Smooth Animations** — no visual lag or jumping, all elements appear synchronously
- 🎨 **Unified Design** — Telegram button works exactly like "Enter" button
- 🔄 **Easier Maintenance** — consistent animation structure makes future updates simpler
- 📦 **Better Performance** — optimized animation structure reduces layout shifts

**Technical Details**

- All buttons use `fadeIn` variant: `{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }`
- Standard animation delay: `0.3` seconds for all buttons
- Animation duration: `0.5` seconds with easing `[0.22, 0.61, 0.36, 1]`
- All buttons wrapped in `motion.div` with `variants={fadeIn}`, `initial="hidden"`, `animate="visible"`
- Telegram button uses regular `button` element inside `motion.div` wrapper (same structure as "Enter" button)

---

## Module: UI Components

### Step: Toast System Centralization with Zustand

:calendar: `2025-12-03`

**Problem**

- ❌ Toast notification component duplicated across 4 auth pages (login, register, forgot-password, reset-password)
- ❌ 104 lines of duplicated code (26 lines × 4 files)
- ❌ Inconsistent state management with local useState in each page
- ❌ Difficult to maintain and update Toast behavior across all pages

**Solution**

- ✅ Created centralized Toast system using Zustand state management
- ✅ Single source of truth for Toast notifications across the entire application
- ✅ Global Toast component mounted once in providers.tsx
- ✅ Convenient useToast hook with success/error methods

**Added**

- ✅ `toast.types.ts` — TypeScript types for Toast system (ToastType = 'success' | 'error', Toast interface)
- ✅ `toast.store.ts` — Zustand store with auto-hide functionality (4 seconds timeout)
- ✅ `toast.tsx` — Global Toast UI component with Framer Motion animations and ARIA attributes
- ✅ `use-toast.ts` — Convenience hook with methods: toast(), success(), error()
- ✅ Toast component integrated in providers.tsx as global component
- ✅ Exports added to components/ui/index.ts and hooks/index.ts

**Changed**

- ✅ **Login page** — replaced local Toast with useToast hook, removed 26 lines of duplicated code
- ✅ **Register page** — replaced local Toast with useToast hook, removed 26 lines of duplicated code
- ✅ **Forgot Password page** — replaced local Toast with useToast hook, removed 26 lines of duplicated code
- ✅ **Reset Password page** — replaced local Toast with useToast hook, removed 26 lines of duplicated code
- ✅ **Auth context** — fixed error handling (response.error instead of response.errors for Apollo mutation result)

**Fixed**

- ✅ Removed JSX fragment wrappers (`<>` and `</>`) from auth pages
- ✅ Fixed TypeScript errors: response.errors → response.error for Apollo Client mutation results
- ✅ Fixed register page: optional fields (name, phone) now use `|| null` instead of `|| undefined` for GraphQL InputMaybe type
- ✅ Added missing Check icon import in reset-password page

**Removed**

- ❌ Local Toast component from login page (26 lines)
- ❌ Local Toast component from register page (26 lines)
- ❌ Local Toast component from forgot-password page (26 lines)
- ❌ Local Toast component from reset-password page (26 lines)
- ❌ useState for toast message and type management from all auth pages
- ❌ useCallback for showToast functions from all auth pages

**Files Created**

- `apps/web/src/packages/libs/store/toast.types.ts`
- `apps/web/src/packages/libs/store/toast.store.ts`
- `apps/web/src/packages/components/ui/toast.tsx`
- `apps/web/src/packages/hooks/use-toast.ts`
- `apps/web/src/packages/hooks/index.ts`

**Files Modified**

- `apps/web/src/packages/libs/store/index.ts` — added toast exports
- `apps/web/src/packages/components/ui/index.ts` — added Toast export
- `apps/web/src/packages/components/features/providers.tsx` — added global Toast component
- `apps/web/src/app/(root)/auth/login/page.tsx` — integrated useToast hook
- `apps/web/src/app/(root)/auth/register/page.tsx` — integrated useToast hook
- `apps/web/src/app/(root)/auth/forgot-password/page.tsx` — integrated useToast hook
- `apps/web/src/app/(root)/auth/reset-password/page.tsx` — integrated useToast hook
- `apps/web/src/packages/libs/auth/auth.context.tsx` — fixed error handling

**Benefits**

- 🎯 **DRY Principle** — eliminated 104 lines of duplicated code
- 🏗️ **Centralized Management** — single Toast system for entire application
- ⚡ **Better Performance** — single Toast component instead of 4 separate instances
- 🔄 **Easier Maintenance** — changes to Toast behavior now require updating only one file
- 🎨 **Consistent UX** — identical Toast behavior and styling across all pages
- 🧪 **Testability** — centralized Toast logic easier to test and mock
- 📦 **Scalability** — new pages can easily use Toast via simple useToast() hook

**Technical Details**

- Zustand store manages Toast state with automatic cleanup after 4 seconds
- Framer Motion AnimatePresence provides smooth enter/exit animations
- ARIA attributes (role="status", aria-live="polite", aria-atomic="true") ensure accessibility
- Toast positioned at bottom center (fixed bottom-6 left-1/2 -translate-x-1/2)
- Supports success (green with Check icon) and error (red with AlertCircle icon) types
- Z-index 50 ensures Toast appears above all content

---

## Module: Forms Validation

### Step: Forms Migration to react-hook-form + Zod

:calendar: `2025-12-03`

**Added**

- ✅ Созданы Zod схемы валидации для всех форм авторизации:
  - `apps/web/src/packages/schemas/auth/login.schema.ts` — валидация email + password (минимум 8 символов)
  - `apps/web/src/packages/schemas/auth/register.schema.ts` — валидация с проверкой совпадения паролей, regex для телефона, требования к паролю (буквы + цифры)
  - `apps/web/src/packages/schemas/auth/forgot-password.schema.ts` — валидация email
  - `apps/web/src/packages/schemas/auth/reset-password.schema.ts` — валидация паролей с проверкой совпадения и требованиями
- ✅ Создан хук `useAutoValidateForm` с debounce 300ms для автоматической валидации полей
- ✅ Экспорт всех auth схем через `apps/web/src/packages/schemas/index.ts`

**Changed**

- ✅ **Login форма** (`apps/web/src/app/(root)/auth/login/page.tsx`):
  - Заменен `useState` на `useForm` с `zodResolver`
  - Интегрирован `useAutoValidateForm` для real-time валидации
  - Формат компонентов: `Form`, `FormField`, `FormItem`, `FormLabel`, `FormControl`, `FormMessage`
  - Кнопка submit disabled до валидного состояния (`!form.formState.isValid`)
- ✅ **Register форма** (`apps/web/src/app/(root)/auth/register/page.tsx`):
  - Заменены все `useState` (email, password, confirmPassword, name, phone) на `useForm`
  - Удалена ручная валидация паролей (теперь через Zod `.refine()`)
  - Автоматическая валидация всех 5 полей с debounce
  - `confirmPassword` удаляется перед отправкой в GraphQL
- ✅ **Forgot Password форма** (`apps/web/src/app/(root)/auth/forgot-password/page.tsx`):
  - Удален mock `setTimeout`, интегрирована реальная GraphQL мутация `ForgotPasswordDocument`
  - Использована Zod схема `forgotPasswordSchema`
  - Обработка успеха/ошибок через toast с типами success/error
  - Toast компонент обновлен для поддержки иконки `AlertCircle` при ошибках
- ✅ **Reset Password форма** (`apps/web/src/app/(root)/auth/reset-password/page.tsx`):
  - Заменен `FormData` подход на `useForm` + zodResolver
  - Удалена ручная валидация паролей
  - Интегрирована реальная GraphQL мутация `ResetPasswordDocument`
  - Токен извлекается из URL query параметров через `useSearchParams`
  - Toast компонент поддерживает success/error типы

**Fixed**

- ✅ Удалена дублирующаяся логика валидации паролей во всех формах
- ✅ Toast компонент дублировался в 4 файлах — теперь с консистентной реализацией
- ✅ Forgot Password и Reset Password использовали mock логику — теперь реальные GraphQL мутации

**Removed**

- ❌ Удалены все ручные `useState` для управления полями форм
- ❌ Удалена ручная валидация (проверка совпадения паролей, длины, regex)
- ❌ Удалены HTML5 атрибуты `required`, `minLength` в пользу Zod валидации

**Files Created**

- `apps/web/src/packages/schemas/auth/login.schema.ts`
- `apps/web/src/packages/schemas/auth/register.schema.ts`
- `apps/web/src/packages/schemas/auth/forgot-password.schema.ts`
- `apps/web/src/packages/schemas/auth/reset-password.schema.ts`
- `apps/web/src/packages/schemas/auth/index.ts`
- `apps/web/src/packages/hooks/use-auto-validate-form.ts`
- `apps/web/src/packages/hooks/index.ts`

**Files Modified**

- `apps/web/src/packages/schemas/index.ts`
- `apps/web/src/app/(root)/auth/login/page.tsx`
- `apps/web/src/app/(root)/auth/register/page.tsx`
- `apps/web/src/app/(root)/auth/forgot-password/page.tsx`
- `apps/web/src/app/(root)/auth/reset-password/page.tsx`

**Benefits**

- 🎯 Централизованная валидация — единые Zod схемы с автоматическим выводом типов
- ⚡ Real-time валидация — debounce 300ms, валидация при `onTouched` и `onChange`
- 🧹 Меньше кода — сокращение на 30-40% за счет удаления ручного управления состоянием
- ✅ Консистентность — единый подход во всех формах с shadcn/ui Form компонентами
- 🔒 Типобезопасность — автоматический вывод типов из Zod схем (`z.infer<>`)
- 🚀 UX улучшения — немедленная визуальная индикация ошибок, disabled кнопки до валидного состояния

---

## Module: Configuration

### Step: Server URL Port Update

:calendar: `2025-12-02`

**Changed**

- ✅ Updated backend API port from `3001` to `8080` in `apps/web/.env`
- ✅ `NEXT_PUBLIC_SERVER_URL` now points to `http://localhost:8080/graphql`

**Fixed**

- ✅ Fixed incorrect API endpoint configuration that prevented frontend from connecting to backend

**Files Modified**

- `apps/web/.env`

---

## Module: Auth Integration

### Step 20: Auth API Integration

:calendar: `2025-12-01`

**Added**

- ✅ Интеграция страниц авторизации с реальным GraphQL API
- ✅ Страница `/auth/login` — подключена к `login` mutation
- ✅ Страница `/auth/register` — подключена к `register` mutation
- ✅ `AuthProvider` context для управления состоянием авторизации
- ✅ GraphQL операции в `auth.graphql` — mutations и queries для авторизации
- ✅ Обработка ошибок с toast уведомлениями (success/error)
- ✅ Валидация паролей на клиенте (совпадение, минимум 8 символов)

**Changed**

- ✅ Формы логина и регистрации используют controlled inputs с useState
- ✅ Toast компонент поддерживает типы success и error с разными иконками
- ✅ Добавлена иконка `AlertCircle` для ошибок

**Files Created**

- `apps/web/src/packages/api/graphql/auth.graphql`
- `apps/web/src/packages/libs/auth/auth.context.tsx`
- `apps/web/src/packages/libs/auth/index.ts`

**Files Modified**

- `apps/web/src/app/(root)/auth/login/page.tsx`
- `apps/web/src/app/(root)/auth/register/page.tsx`

---

## Module: Auth Pages

### Step 19: Toast Notifications Repositioning

:calendar: `2025-12-01`

**Changed**

- ✅ Перемещены toast уведомления в нижнюю часть экрана (`fixed bottom-6`) на всех страницах авторизации.
- ✅ Toast больше не перекрывает контент карточки формы.
- ✅ Добавлен `AnimatePresence` из Framer Motion для плавной анимации появления/исчезновения.
- ✅ Улучшена стилизация: закруглённые углы (`rounded-2xl`), красивая тень (`shadow-2xl`), z-index 50.

**Files Modified**

- `apps/web/src/app/(root)/auth/login/page.tsx`
- `apps/web/src/app/(root)/auth/register/page.tsx`
- `apps/web/src/app/(root)/auth/reset-password/page.tsx`
- `apps/web/src/app/(root)/auth/forgot-password/page.tsx`

---

## Module: Landing Page

### Step 18: Modern Animated Landing Page

:calendar: `2025-12-01`

**Added**

- ✅ Полностью переработанный лендинг ProRab.space с современным дизайном.
- ✅ Анимации на Framer Motion: fade-in, stagger, scroll-triggered animations.
- ✅ Hero секция с интерактивным 3D мокапом телефона.
- ✅ Секция проблем — три боли прораба с gradient-карточками.
- ✅ Секция возможностей — 4 ключевые функции приложения.
- ✅ Секция фотоотчётов — демонстрация killer-feature с мокапом отчёта.
- ✅ Секция тарифов — 3 плана с выделенным спецпредложением.
- ✅ Секция отзывов и финальный CTA.
- ✅ Адаптивная навигация с мобильным меню.
- ✅ Scroll-based header с backdrop blur.

**Changed**

- ✅ Использован синтаксис Tailwind v4 (`bg-linear-to-r`, `shrink-0`, `rounded-4xl`).
- ✅ Применены глобальные стили из `globals.css` (анимации, цветовая схема).

**Files Modified**

- `apps/web/src/app/page.tsx`

---

## Module: Auth Pages

### Step 17: Auth Pages (Login, Register, Forgot Password)

:calendar: `2025-12-01`

**Added**

- ✅ Страница `/auth/login` — форма входа с email/password и кнопкой «Войти через Telegram».
- ✅ Страница `/auth/register` — форма регистрации с полями: имя, email, телефон, пароль.
- ✅ Страница `/auth/forgot-password` — форма восстановления пароля (отправка ссылки на email).
- ✅ Общий layout для auth-страниц с переключателем темы.
- ✅ UI компоненты `Input`, `Card` для форм авторизации.

**Changed**

- ✅ Разделена единая страница auth на отдельные маршруты для каждой формы.
- ✅ Обновлены экспорты из `packages/components/ui`.

**Fixed**

- ✅ N/A.

**Removed**

- ❌ Удалена объединённая страница `auth/page.tsx` в пользу отдельных маршрутов.

**Files Modified**

- `apps/web/src/packages/components/ui/index.ts`
- `docs/roadmap.md`

**Files Created**

- `apps/web/src/packages/components/ui/input.tsx`
- `apps/web/src/packages/components/ui/card.tsx`
- `apps/web/src/app/(root)/auth/layout.tsx`
- `apps/web/src/app/(root)/auth/login/page.tsx`
- `apps/web/src/app/(root)/auth/register/page.tsx`
- `apps/web/src/app/(root)/auth/forgot-password/page.tsx`

---

## Module: Landing & Motion Polish

### Step 1: AOS‑style reveal + плавные hover

:calendar: `2025-11-23`

**Added**

- ✅ AOS‑style анимации секций через IntersectionObserver (`data-animate` + `animate-fade/zoom` утилиты).
- ✅ Телефонный мокап с float/pulse и интерактивными карточками/CTA на лендинге.

**Changed**

- ✅ Глобальные hover/transition эффекты для ссылок, кнопок и карточек (0.3s cubic-bezier).
- ✅ Лендинг обновлён в `apps/web/src/app/page.tsx` с hover подчёркиваниями меню, скейлами и тенями.
- ✅ Итоговая верстка хранится в `apps/web/src/app/page.tsx` (Next.js App Router).

**Files Modified**

- `apps/web/src/app/page.tsx`
- `apps/web/src/app/styles/globals.css`

# Changelog (frontend)

## Module: Frontend Monorepo Setup

### Step 1: Next.js + Tailwind + shadcn Scaffold

:calendar: `2025-11-21`

**Added**

- ✅ Next.js 16 app scaffolded under `apps/web` with pnpm workspace wiring.
- ✅ Tailwind 3 + shadcn/ui configuration (`tailwind.config.ts`, theme tokens, animate plugin).
- ✅ Base UI button component and `cn` helper utilities.
- ✅ Hero landing page highlighting stack links and GraphQL examples.

**Changed**

- ✅ Updated global styles to design system tokens and dark mode support.
- ✅ PostCSS pipeline switched to Tailwind + Autoprefixer config.

**Fixed**

- ✅ Resolved lint warning for anonymous default export in `postcss.config.mjs`.

**Removed**

- ❌ Default Next.js starter hero content.

**Files Modified**

- `apps/web/src/app/globals.css`
- `apps/web/src/app/layout.tsx`
- `apps/web/src/app/page.tsx`
- `apps/web/postcss.config.mjs`
- `apps/web/package.json`
- `apps/web/tailwind.config.ts`

**Files Created**

- `apps/web/components.json`
- `apps/web/src/components/ui/button.tsx`
- `apps/web/src/lib/utils.ts`
- `pnpm-workspace.yaml`
- `package.json`
- `.gitignore`
- `changelog.frontend.md`

---

## Module: Frontend Monorepo Setup

### Step 4: Apollo GraphQL Client Setup

:calendar: `2025-11-21`

**Added**

- ✅ Apollo client stack (`@apollo/client`, `graphql`, `graphql-ws`, upload link) and typed document node support.
- ✅ Apollo CLI config and GraphQL docs mirroring prescribed pattern.
- ✅ URL constants with sensible localhost defaults for HTTP/WS/App endpoints.
- ✅ Type declarations for `.gql/.graphql` imports and upload link module.

**Changed**

- ✅ Layout wraps the app with `ApolloClientProvider` to enable GraphQL across pages.

**Fixed**

- ✅ N/A.

**Removed**

- ❌ N/A.

**Files Modified**

- `apps/web/package.json`
- `apps/web/src/app/layout.tsx`

**Files Created**

- `apps/web/configs/graphql/apollo.config.cjs`
- `apps/web/src/constants/url.ts`
- `apps/web/src/lib/apollo/apollo-client.config.ts`
- `apps/web/src/lib/apollo/apollo-client.provider.tsx`
- `apps/web/types/apollo.d.ts`
- `apps/web/types/graphql.d.ts`
- `apps/web/docs/gql.md`

---

### Step 5: Dependency Refresh & Version Bump

:calendar: `2025-11-21`

**Added**

- ✅ Updated UI deps (`lucide-react`, `tailwind-merge`) and Node types to current majors.

**Changed**

- ✅ Web app version set to `0.0.2`.

**Fixed**

- ✅ N/A.

**Removed**

- ❌ N/A.

**Files Modified**

- `apps/web/package.json`

**Files Created**

- N/A

---

### Step 6: Frontend Skeleton per Architecture

:calendar: `2025-11-21`

**Added**

- ✅ Created base module/package directories (`src/modules`, `src/packages/*`) with README pointers for components, API, libs.

**Changed**

- ✅ Web app version set to `0.0.3` to reflect new skeleton.

**Fixed**

- ✅ N/A.

**Removed**

- ❌ N/A.

**Files Modified**

- `apps/web/package.json`

**Files Created**

- `apps/web/src/modules/.gitkeep`
- `apps/web/src/packages/api/.gitkeep`
- `apps/web/src/packages/components/.gitkeep`
- `apps/web/src/packages/config/.gitkeep`
- `apps/web/src/packages/constants/.gitkeep`
- `apps/web/src/packages/hooks/.gitkeep`
- `apps/web/src/packages/libs/.gitkeep`
- `apps/web/src/packages/schemas/.gitkeep`
- `apps/web/src/packages/utils/.gitkeep`
- `apps/web/src/packages/api/README.md`
- `apps/web/src/packages/components/README.md`
- `apps/web/src/packages/libs/README.md`

---

### Step 7: Fix Apollo Upload Link Resolution & Lint

:calendar: `2025-11-21`

**Added**

- ✅ Installed `apollo-upload-client` dependency and added upload link type declaration.

**Changed**

- ✅ ESLint config simplified and override added for `.cjs` configs; web version set to `0.0.3`.

**Fixed**

- ✅ Resolved build error “Can't resolve apollo-upload-client/UploadHttpLink.mjs”.
- ✅ Lint now passes after removing unused FlatCompat imports and allowing require in config files.

**Removed**

- ❌ N/A.

**Files Modified**

- `apps/web/package.json`
- `apps/web/eslint.config.mjs`
- `apps/web/src/lib/apollo/apollo-client.config.ts`

**Files Created**

- `apps/web/types/upload.d.ts`

---

### Step 8: Install Apollo Upload Client

:calendar: `2025-11-22`

**Added**

- ✅ Installed `apollo-upload-client` into the web workspace to satisfy runtime module resolution.

**Changed**

- ✅ N/A.

**Fixed**

- ✅ Resolved `Module not found: Can't resolve 'apollo-upload-client'` during web dev build.

**Removed**

- ❌ N/A.

**Files Modified**

- `apps/web/package.json`

**Files Created**

- N/A

---

### Step 9: Apollo Error Handler Compatibility

:calendar: `2025-11-22`

**Added**

- ✅ Simplified Apollo ErrorLink to rely on `graphQLErrors` and `networkError`.

**Changed**

- ✅ Removed references to non-existent `CombinedGraphQLErrors`/`CombinedProtocolErrors`.

**Fixed**

- ✅ TypeScript errors about missing exports from `@apollo/client/errors`.

**Removed**

- ❌ N/A.

**Files Modified**

- `apps/web/src/lib/apollo/apollo-client.config.ts`

**Files Created**

- N/A

---

### Step 10: Tailwind v4 Alignment

:calendar: `2025-11-22`

**Added**

- ✅ Installed `@tailwindcss/postcss` for Tailwind 4 PostCSS integration.

**Changed**

- ✅ Updated Tailwind to `^4.1.17`, adjusted globals to include `@tailwind` directives, removed legacy animation import, and bumped web version to `0.0.4`.

**Fixed**

- ✅ Build error about missing `@tailwind base` and PostCSS plugin mismatch with Tailwind 4.

**Removed**

- ❌ Removed `tailwindcss-animate` dependency (incompatible with Tailwind 4 stack).

**Files Modified**

- `package.json`
- `apps/web/package.json`
- `apps/web/src/app/globals.css`
- `apps/web/postcss.config.mjs`

**Files Created**

- N/A

---

### Step 11: GraphQL Codegen Setup

:calendar: `2025-11-22`

**Added**

- ✅ Codegen config (`configs/graphql/graphql.config.ts`) aligned with docs.
- ✅ Codegen script in web package and dev deps for codegen plugins.
- ✅ Output path scaffolded under `src/packages/api/graphql/__generated__/`.

**Changed**

- ✅ Web roadmap GraphQL section marked with completed codegen task.

**Fixed**

- ✅ N/A.

**Removed**

- ❌ N/A.

**Files Modified**

- `apps/web/package.json`

**Files Created**

- `apps/web/configs/graphql/graphql.config.ts`
- `apps/web/src/packages/api/graphql/__generated__/output.ts` (generated)

---

### Step 12: Apollo-First Client & Zustand Store

:calendar: `2025-11-22`

**Added**

- ✅ Integrated Zustand base store slice (`useAppStore`) under `src/packages/libs/store`.

**Changed**

- ✅ Apollo Client confirmed as primary data client (replacing TanStack Query in roadmap); web version set to `0.0.4`.

**Fixed**

- ✅ N/A.

**Removed**

- ❌ N/A.

**Files Modified**

- `apps/web/package.json`
- `docs/roadmap.md`

**Files Created**

- `apps/web/src/packages/libs/store/app.ts`

---

### Step 13: GraphQL Client Test Script

:calendar: `2025-11-22`

**Added**

- ✅ Node fetch script (`scripts/test-gql.js`) to hit GraphQL health endpoint using `NEXT_PUBLIC_SERVER_URL`.
- ✅ npm script `test:gql` to run the client-side check.

**Changed**

- ✅ N/A.

**Fixed**

- ✅ Verified health query from client side returns data.

**Removed**

- ❌ N/A.

**Files Modified**

- `apps/web/package.json`

**Files Created**

- `apps/web/scripts/test-gql.js`

---

### Step 14: Auth Pages (Email/Password)

:calendar: `2025-11-22`

**Added**

- ✅ Login and Register pages with email/password inputs and client-side validation (demo stub handlers).

**Changed**

- ✅ Roadmap updated to reflect delivered auth pages and Apollo client as primary.

**Fixed**

- ✅ N/A.

**Removed**

- ❌ N/A.

**Files Modified**

- `docs/roadmap.md`

**Files Created**

- `apps/web/src/app/(auth)/login/page.tsx`
- `apps/web/src/app/(auth)/register/page.tsx`

---

### Step 3: Turborepo Schema Update

:calendar: `2025-11-21`

**Added**

- ✅ N/A.

**Changed**

- ✅ Updated `turbo.json` to new `tasks` schema (was `pipeline`) for Turbo 2.6 compatibility.

**Fixed**

- ✅ Dev command `pnpm dev` now runs without Turbo schema error.

**Removed**

- ❌ N/A.

**Files Modified**

- `turbo.json`

**Files Created**

- N/A

---

### Step 2: Turborepo Integration for Frontend Pipelines

:calendar: `2025-11-21`

**Added**

- ✅ Turborepo configuration to orchestrate frontend dev/build/lint tasks.

**Changed**

- ✅ Root scripts now run through Turborepo (`dev`, `build`, `lint`) with parallel dev support.
- ✅ `.gitignore` updated to exclude Turborepo caches.

**Fixed**

- ✅ N/A.

**Removed**

- ❌ N/A.

**Files Modified**

- `package.json`
- `.gitignore`

**Files Created**

- `turbo.json`

---

## Module: Frontend Monorepo Setup

### Step 15: next-intl Config & Locale Middleware

:calendar: `2025-11-22`

**Added**

- ✅ Добавлен `next-intl.config.ts` с загрузкой RU/EN сообщений и дефолтным языком.
- ✅ Middleware для детекции локали и префиксов (`apps/web/middleware.ts`).

**Changed**

- ✅ Плагин next-intl в `next.config.ts` теперь указывает на новый config-файл и устраняет ошибку "Couldn't find next-intl config file".
- ✅ Корневой layout остаётся обёрнутым в `NextIntlClientProvider` (куки `language`).

**Fixed**

- ✅ Исправлен runtime 500 при заходе на `/ru/login` из-за отсутствия next-intl config.

**Removed**

- ❌ N/A.

**Files Modified**

- `apps/web/next.config.ts`
- `apps/web/src/app/layout.tsx`

**Files Created**

- `apps/web/next-intl.config.ts`
- `apps/web/middleware.ts`

---

## Module: Frontend Monorepo Setup

### Step 16: Tailwind v4 Construction Theme

:calendar: `2025-11-22`

**Added**

- ✅ Новая глобальная палитра для строительной темы (light/dark) в `globals.css` с HSL-переменными shadcn.
- ✅ Tailwind v4 синтаксис (`@import "tailwindcss"`, `@plugin "tailwindcss-animate"`) и шрифтовые переменные Geist.

**Changed**

- ✅ Маппинг цветов в `@theme inline` для утилит Tailwind/shadcn, контрастные foreground для primary/accent/success/destructive.
- ✅ Базовые стили body/бордеров обновлены под новую схему.
- ✅ Добавлена зависимость `tailwindcss-animate` под стандарт shadcn.

**Fixed**

- ✅ Цветовые утилиты теперь корректно работают с прозрачностью (`bg-primary/20` и т.п.) и обеими темами.

**Removed**

- ❌ Удалён старый tw-animate-css импорт и дефолтные shadcn переменные.

**Files Modified**

- `apps/web/src/app/styles/globals.css`

**Files Created**

- N/A

---
