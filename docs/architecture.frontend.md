# Архитектура фронтенда (Next.js + GraphQL)

## Каркас
- Next.js 16 с App Router: общий layout `src/app/layout.tsx` подключает Roboto, `ApolloClientProvider`, `NextIntlClientProvider`, `ThemeProvider` (`next-themes`) и глобальный `Toaster`.
- Глобальные стили и токены Tema/Tailwind лежат в `src/app/styles` (`_vars` для цветов/радиусов/типографики, `globals.css` для импорта tailwind v4 и анимаций).
- Конфигурация Next (`next.config.ts`): плагин next-intl, standalone build, Turbopack c правилом для svg через `@svgr/webpack`, env пробрасываются из `package.json`.

## Слои и директории
- `src/app`: маршруты и группировки. `(root)` — публичные страницы (auth, policy, ToS), `(protected)` — личный кабинет (dashboard, organization, settings). Страницы тонкие: просто реэкспортируют компоненты из модулей.
- `src/modules`: доменные модули (auth, organization, dashboard, settings) в стиле FSD:
  - `pages` — страницы и крупные сценарии (тонкие адаптеры к App Router).
  - `features` — самостоятельные куски бизнес-логики (например, формы и статусные блоки в auth).
  - `widgets` — составные блоки страницы (например, `AuthForm`, `Header`).
  - `shared` — то, что переиспользуется внутри модуля: `api`, `assets`, `components`, `libs` (i18n/store), `schemas`, `types`, `utils`, `hooks`.
  - Каждый модуль экспортирует публичное API через `index.ts` и свои переводы через `shared/libs/i18n`.
- `src/packages`: кросс-доменный слой (переиспользуемый шаблон для других проектов):
  - `components`: дизайн-система и композиции. `shared/ui` — атомы/молекулы (Button, Card, Input, Select, Dialog, Tooltip и т.д.), `shared/select` и вспомогательные компоненты, `features` (Navbar, UserInfoDropdown, Appearance настройки), `widgets/Header`, `providers` для `sonner`.
  - `api`: GraphQL-типизация (`__generated__/output.ts`) и моки (`mocks/user.ts`).
  - `config`: провайдеры (Theme), маршруты `PATHS` + типы сегментов.
  - `constants`: SEO, URL с env (`APP_URL`, `SERVER_URL`, `WEBSOCKET_URL`).
  - `libs`: `apollo` (клиент + провайдер, http+ws, multipart upload и error link), `i18n` (typed next-intl), `store` (zustand слайсы), вспомогательные утилиты.
  - `hooks`: вспомогательные хуки (debounce, auto-validate для RHF, countdown).
  - `schemas`: zod-схемы для компонентов (например, смена языка).
  - `utils`: чистые функции (merge tw-классов, sanitizeForRSC, генерация аббревиатур, цвета, возраст).
- `configs/graphql`: codegen и Apollo CLI конфиг.
- `types/`: глобальные декларации для `.graphql/.gql`, `svgr`, `apollo-upload-client`.
- Алиасы путей (tsconfig): `@/` → `src`, `@/modules/*`, `@/packages/*`, плюс шорткаты на конкретные модули (`@/auth/*`, `@/organization/*` и т.д.).

## Потоки данных и API
- Клиент: Apollo (`src/packages/libs/apollo/apollo-client.config.ts`) со split-линком (HTTP UploadLink + GraphQLWsLink для подписок), `ssrMode` учитывает среду. ErrorLink логирует GraphQL/WS/Network ошибки. Подключается в общем layout через `ApolloClientProvider`.
- Codegen: `bun run codegen`/`npm run codegen` использует `configs/graphql/graphql.config.ts`. Документы ищутся в `src/modules/**/shared/api/graphql/**/*.{ts,tsx,graphql,gql}`, результат — типы + `typed-document-node` в `src/packages/api/graphql/__generated__/output.ts` (исключён из TS include).
- Env: `NEXT_PUBLIC_SERVER_URL`/`WEBSOCKET_URL`/`APP_URL` обязательны для сборки клиента и codegen.
- Временные данные: `src/packages/api/mocks` (например, `mockUser`) подставляются в UI до готовности реальных запросов.

## Локализация
- next-intl + собственная типизация (`src/packages/libs/i18n/types`). Базовые переводы лежат в `packages/libs/i18n/locales`, доменные — в `modules/*/shared/libs/i18n/locales`.
- `request.ts` собирает сообщения: объединяет core + auth + organization и выбирает язык из cookie (`language`, см. `language.ts`, `COOKIE_NAME`). Выбор языка — `setLanguage`/`getCurrentLanguage` через `next/headers`.
- Хелперы `useTranslations/getTranslations` обёрнуты типами, чтобы `t('path.to.key')` был типобезопасным. `sanitizeForRSC` делает messages сериализуемыми для RSC.

## UI, темизация и стили
- Tailwind v4 через `@import 'tailwindcss'` в `globals.css` и `@theme inline` с кастомными брейкпоинтами. Цвета/радиусы/типы текста вынесены в CSS-переменные (`_vars/_colors.css`, `_vars/_theme/_light.css` и `_dark.css`).
- Theme переключается через `ThemeProvider` (`next-themes`, class strategy). Компоненты дизайн-системы опираются на токены (`text-`, `bg-`, `border-` классы) и не держат жёстких цветов.
- Глобальные уведомления через `sonner` (`packages/components/shared/ui/sonner.tsx` + включение в layout/некоторые layouts protected зон).

## Состояние и формы
- Zustand: общий стор `packages/libs/store/app` (например, состояние сайдбара) и модульные сторы (`auth/shared/libs/store` с срезом 2FA/статусов). Паттерн — `slices` + `types` + хук `use*Store`.
- Формы: `react-hook-form` + `zod` (`@hookform/resolvers`). Хук `useAutoValidateForm` даёт автотриггер валидации по изменению полей. Формы auth разбиты на отдельные компоненты в `modules/auth/features/forms`.

## Роутинг и навигация
- Центральный генератор путей `PATHS` (`packages/config/routes/paths.ts`) с типами сегментов. Используется для редиректов (`app/(root)/page.tsx` → `PATHS.auth()`) и навигации внутри UI.
- App Router группировки: `(root)` для публичных страниц, `(protected)` для кабинета. Специфичные лэйауты на уровне сегментов (например, `dashboard/layout.tsx` включает `Toaster`). Пока нет middleware — защита по auth должна быть добавлена отдельно (например, через middleware/route handlers).

## Шаблон создания нового модуля
1) Создать `src/modules/<domain>` с подпапками `pages`, `features`, `widgets`, `shared` (`api/graphql`, `libs` для i18n/store, `schemas`, `utils`, `assets`, `components`). Экспортировать публичные элементы через `index.ts`.
2) Переводы: добавить `shared/libs/i18n/locales/{en,ru}/index.ts`, типы `i18n.types.ts`, экспортировать `translations` и добавить их в `packages/libs/i18n/request.ts` + в `AllMessages` (см. `packages/libs/i18n/types/typed.ts`), чтобы типобезопасность сохранилась.
3) API: складывать gql-операции в `shared/api/graphql` — codegen автоматически подхватит. После добавления запустить `bun run codegen` и использовать сгенерированные DocumentNode/типы из `@/packages/api/graphql`.
4) Маршрут: создать страницу в `src/app/(root)/(protected)/<route>` или `(root)/...`, импортируя компонент из `modules/<domain>/pages`. Добавить хелпер в `PATHS`, если нужен именованный билд пути.
5) Состояние/логика: при необходимости завести slice в `shared/libs/store` по образцу auth/app. Формы строить на `react-hook-form` + zod, при повторном использовании — вынести в `modules/<domain>/shared/components` или в `packages/components` если становится кросс-доменным.
6) UI: собирать интерфейс из `packages/components/shared/ui` + `features/widgets`. Стили опираются на токены; новые цвета/шрифты добавлять в `_vars/_colors.css` и тему.

## Чек-лист переноса шаблона в другой проект
- Настроить env: `NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_SERVER_URL`, `NEXT_PUBLIC_WEBSOCKET_URL` (+ переменные для codegen).
- Подключить провайдеры в корневом layout (Apollo, next-intl, ThemeProvider, Toaster) и включить `globals.css` с токенами.
- Скопировать слои `app/modules/packages`, обновить `PATHS` и tsconfig paths под новую структуру.
- Импортировать/адаптировать дизайн-систему (`packages/components`) и токены (`styles/_vars`).
- Проверить `configs/graphql/graphql.config.ts` и `packages/libs/apollo` под свой эндпоинт, запустить `bun run codegen`.
- Добавить собственные переводы и зарегистрировать их в `packages/libs/i18n/request.ts` и `types/typed.ts`.
- При необходимости подключить реальную авторизацию/guard (middleware или server actions), опираясь на разделение `(root)/(protected)`.
