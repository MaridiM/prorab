# Roadmap ProRab.space (MVP)

Цели: собрать монорепо (Turborepo) с Next.js 16 (App Router) и NestJS 11 (GraphQL), Postgres + Prisma, далее развивать функциональность команд, проектов и отчётов.

## Этап 1. Инфраструктура и старт (недели 1–2)
- [x] Монорепо Turborepo.
- [x] Web: Next.js 16 + Tailwind + shadcn/ui.
- [x] API: NestJS + GraphQL.
- [ ] Пакеты `packages/ui` и `packages/db` (библиотеки общих компонентов/утилит).
- [x] Базовый Zustand-store для общих UI-состояний.
- [x] Настроен next-intl с поддержкой RU/EN (config + middleware в apps/web).
- [x] Layout обёрнут в NextIntlClientProvider, язык хранится в cookie language.


### Данные и ORM
- [x] Postgres (Docker, порт 5433).
- [x] Redis (Docker, порт 6379) — для сессий авторизации.
- [x] Prisma в `apps/api` (v7, pg adapter, prisma.config.ts).
- [x] Базовые миграции/схема синхронизированы (init + sync-v7, db push).
- [x] Модели User, VerificationToken, PasswordResetToken для авторизации.
- [x] Миграция `add_auth_models` + `db push` + `prisma generate` выполнены.

### GraphQL
- [x] Apollo Server в NestJS (code-first).
- [x] Codegen для фронта.
- [x] Apollo Client интегрирован на вебе (используется вместо TanStack Query).
- [x] Базовые страницы login/register с email/password (демо, готово подключить реальный API).

## Этап 2. Аутентификация, пользователи, команды (недели 3–5)
- [x] ~~Auth (SuperTokens)~~ → Реализована кастомная авторизация с Redis сессиями
- [x] Email/Password вход (Argon2 хеширование, Redis сессии, HTTP-only cookies)
- [x] Регистрация с нормализацией email и верификацией через Brevo
- [x] Сброс пароля (токен 1 час, инвалидация всех сессий)
- [x] Управление сессиями (список, удаление, массовая инвалидация)
- [x] Rate Limiting (5 попыток / 15 минут)
- [x] GraphQL Guards и Decorators для защиты resolvers
- [x] Сущность `User` с верификацией email
- [ ] Telegram как провайдер (запланировано)
- [ ] Сущности `Team`, `TeamMember`
- [ ] API для управления командами; гварды по ролям/доступам
- [x] Frontend: страницы логина/регистрации/восстановления пароля
- [x] Frontend: интеграция с Auth API
- [ ] Frontend: wizard создания команды (шаги: данные команды → участники)

## Этап 3. Проекты (недели 6–7)
- [ ] Entity `Project` (название, описание, бюджет, статус, сроки).
- [ ] Связь Project ↔ Team.
- [ ] API: `createProject`, `myProjects`, `updateProject`, `archiveProject`.
- [ ] Frontend: список/детали проектов, фильтры по статусу/участникам/датам, создание/архивация.

## Этап 4. Файлы и расходы (недели 8–9)
- [ ] Интеграция хранилища (Cloudflare R2/S3) + upload для GraphQL.
- [ ] Entity `Expense` (сумма, категория, вложения).
- [ ] API: создание расходов, привязка к проектам.
- [ ] Frontend: список/карточки расходов, загрузка файлов.

## Этап 5. Фотоотчёты (Wow #1, недели 10–12)
- [ ] Entity `PhotoReport` + `ReportPhoto` с `slug`.
- [ ] API: `createReport`, загрузка/управление фото.
- [ ] SSR/Next.js SSG страница `/r/[slug]` с галереей, деталями команды/проекта, шаринг в WhatsApp.
- [ ] Экспорт/превью отчёта.

## Этап 6. Финансы и роли (Wow #2–3, недели 13–15)
- [ ] Расчёт зарплат/долей для `TeamMember`.
- [ ] API: `calculateProjectSalary`, `closeProject`.
- [ ] Frontend: раздел «выплаты», графики, фильтры, история транзакций.

## Этап 7. Задачи и приглашения (недели 16–18)
- [ ] Kanban: Entity `Task`, drag&drop API, 3 статуса.
- [ ] Приглашения: JWT-приглашения, join team, обновление ролей.

## Этап 8. Монетизация (недели 19–20)
- [ ] Интеграция оплаты (например, ЮKassa) с вебхуками.
- [ ] Тарифы/подписки, ограничения по планам.
- [ ] UI для планов и состояний подписки.

## Этап 9. UX-полировка (неделя 21)
- [ ] Skeletons, улучшенные состояния загрузки/ошибок.
- [x] Toast-уведомления (реализованы на страницах авторизации, позиция внизу экрана).
- [ ] Telegram-бот (демо): уведомления о задачах/приглашениях/отчётах.

---

## Уже сделано (сводка)
- Monorepo, Next.js 16 web, NestJS GraphQL API.
- Tailwind + shadcn/ui, базовый landing.
- Postgres в Docker, Prisma v7 с pg adapter; миграции init + sync-v7, db push.
- Apollo сервер на backend, Apollo клиент на frontend; lint/сборка стабилизированы после Tailwind 4 и upload-link.
- Prisma client генерируется в `apps/api/prisma/generated`, prisma.config.ts подключен.

## Дополнительно выполнено

- [x] Tailwind v4: строительная палитра (light/dark), переменные shadcn и глобальные стили обновлены.
- [x] Лендинг обновлён под ProRab (анимации секций, мокап, плавные hover/transition глобально).
- [x] `apps/web/src/app/page.tsx` — основная страница сверстана под финальный лендинг с интерактивным мокапом и AOS‑подобными эффектами.
- [x] Auth UI: отдельные страницы `/auth/login`, `/auth/register`, `/auth/forgot-password` с полями имя/email/телефон/пароль и кнопкой входа через Telegram.
- [x] Landing Page: современный анимированный лендинг с Framer Motion, мокапами приложения, секциями проблем/возможностей/тарифов/отзывов.
- [x] Toast уведомления на страницах авторизации перемещены в нижнюю часть экрана с AnimatePresence анимацией.

### Аутентификация (2025-12-01)
- [x] **Backend Auth** — кастомная система авторизации без SuperTokens
- [x] **Redis сессии** — хранение сессий в Redis с TTL (7 дней session, 30 дней refresh)
- [x] **Argon2** — безопасное хеширование паролей
- [x] **Brevo интеграция** — отправка писем верификации и сброса пароля
- [x] **HTTP-only Cookies** — безопасное хранение токенов
- [x] **Rate Limiting** — защита от брутфорса (5 попыток / 15 минут)
- [x] **GraphQL API** — register, login, logout, verifyEmail, forgotPassword, resetPassword, changePassword, sessions, revokeSession
- [x] **Frontend интеграция** — формы авторизации подключены к API
- [x] **Docker** — добавлен Redis 8 в docker-compose.yml
- [x] **Security** — Helmet с CSP, cookie secrets, CORS credentials
- [x] **GraphQL Upload** — загрузка файлов через GraphQL (10MB / 10 files)
