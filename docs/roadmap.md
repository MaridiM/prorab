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
- [x] Prisma в `apps/api` (v7, pg adapter, prisma.config.ts).
- [x] Базовые миграции/схема синхронизированы (init + sync-v7, db push).

### GraphQL
- [x] Apollo Server в NestJS (code-first).
- [x] Codegen для фронта.
- [x] Apollo Client интегрирован на вебе (используется вместо TanStack Query).
- [x] Базовые страницы login/register с email/password (демо, готово подключить реальный API).

## Этап 2. Аутентификация, пользователи, команды (недели 3–5)
- [ ] Auth (SuperTokens) на backend.
- [ ] Auth (SuperTokens) на frontend.
- [ ] Email/Password вход.
- [ ] Telegram как провайдер.
- [ ] Сущности `User`, `Team`, `TeamMember`.
- [ ] API для управления командами; гварды по ролям/доступам.
- [ ] Frontend: страницы логина/регистрации, wizard создания команды (шаги: данные команды → участники).

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
- [ ] Toast-уведомления.
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

