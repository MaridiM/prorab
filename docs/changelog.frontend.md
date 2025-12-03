# Changelog (frontend)

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
