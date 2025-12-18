# Документация ProRab.space

## Структура документации

Документация организована по нумерованной структуре для легкой навигации:

### `00-product/` - Продуктовые требования
Единый источник истины о том, **ЧТО** мы делаем.
- `mvp-specification.md` - Спецификация MVP
- `user-roles.md` - Роли пользователей
- `start-here.md` - Быстрый старт
- `start-here-stage-13.md` - Стартовый гайд для Stage 13
- `roadmap.md` - Главный roadmap проекта

### `01-features/` - Детальные спецификации фич
Детализация конкретных модулей и функций.

#### Основные фичи:
- `onboarding.md` - Процесс онбординга
- `improvements.md` - Улучшения
- `payouts-guide.md` - Руководство по выплатам

#### `telegram/` - Интеграция с Telegram
- `telegram-bot.md` - Базовая реализация бота
- `telegram-advanced.md` - Продвинутые функции
- `telegram-bots-deployment.md` - Деплой ботов
- `telegram-bots-integration-roadmap.md` - Roadmap интеграции
- `telegram-bots-setup-guide.md` - Гайд по настройке
- `telegram-bots-status.md` - Статус ботов
- `telegram-bots-summary.md` - Сводка по ботам
- `telegram-integration-analysis-full.md` - Полный анализ интеграции
- `telegram-integration-ready.md` - Готовность интеграции
- `telegram-oauth-implementation-complete.md` - Завершение OAuth
- `telegram-todo.md` - TODO по Telegram

#### `invitations/` - Система приглашений
- `invitations.md` - Основная документация
- `invite-flow.md` - Процесс приглашения
- `user-invitation-flow.md` - Поток приглашения пользователей

#### `teams/` - Управление командами
- `multiple-teams.md` - Работа с несколькими командами

#### `onboarding/` - Онбординг
- `team-wizard-onboarding.md` - Мастер онбординга команды

### `02-architecture/` - Технические решения
Архитектурные решения и техническая документация.
- `pages-structure.md` - Структура страниц приложения
- `pages-structure-diagram.md` - Диаграмма структуры страниц
- `webhooks-setup.md` - Настройка webhooks

### `03-plans/` - Активные планы разработки
То, что сейчас в работе или запланировано.
- `action-plan.md` - План действий
- `admin-panel.md` - План админ-панели
- `auth-protection.md` - План защиты аутентификации
- `analysis-what-to-do-next.md` - Анализ следующих шагов
- `full-project-completion-plan.md` - План завершения проекта
- `monetization-strategy.md` - Стратегия монетизации
- `todo.md` - Список задач
- `whats-not-done.md` - Что не сделано

#### `next-steps/` - Следующие шаги
- `next-steps.md` - Основные следующие шаги
- `next-steps-2025-12-17.md` - Следующие шаги (дата)
- `next-priorities-2025-12-17.md` - Приоритеты (дата)

#### `fixes/` - Планы исправлений
- `auth-route-guards.md` - Защита маршрутов
- `image-loading.md` - Загрузка изображений
- `photo-uploader-ux.md` - UX загрузчика фото

### `04-archive/` - Завершенные этапы
Старые планы реализации, которые уже выполнены.
- `stage-1-authentication-implementation-plan.md` - Этап 1: Аутентификация ✅
- `stage-2-onboarding-teams-implementation-plan.md` - Этап 2: Онбординг ✅
- `stage-3-projects-implementation-plan.md` - Этап 3: Проекты ✅
- `stage-4-expenses-implementation-plan.md` - Этап 4: Расходы ✅
- `stage-10-admin-panel-implementation-plan.md` - Этап 10: Админ-панель ✅
- `stage-11-settings-implementation-plan.md` - Этап 11: Настройки ✅
- `stage-12-storage-providers-implementation.md` - Этап 12: Провайдеры хранилища ✅
- `stage-13-rbac-system.md` - Этап 13: RBAC система ✅
- `task-kanban-analysis.md` - Анализ Kanban задач
- `task-kanban-summary.md` - Сводка Kanban задач

### `05-reports/` - Логи и отчеты
Отчеты о реализации, тестировании и сессиях разработки.

#### `changelog/` - История изменений
- `backend.md` - Changelog бэкенда
- `frontend.md` - Changelog фронтенда

#### `stages/` - Отчеты о завершении этапов
- `stage-6-complete.md` - Этап 6 завершен
- `stage-6-summary.md` - Сводка этапа 6
- `stage-8-complete.md` - Этап 8 завершен
- `stage-8-phase-1-3-complete.md` - Этап 8 фазы 1-3 завершены
- `stage-9-complete.md` - Этап 9 завершен
- `stage-9-phase-1-complete.md` - Этап 9 фаза 1 завершена
- `stage-9-phase-2-*.md` - Отчеты по этапу 9 фазе 2
- `stage-9-phase-3-complete.md` - Этап 9 фаза 3 завершена
- `stage-9-usage-guide.md` - Гайд по использованию этапа 9
- `stage-12-complete.md` - Этап 12 завершен
- `stage-13-progress-2025-12-18.md` - Прогресс этапа 13

#### `admin-panel/` - Отчеты админ-панели
- `admin-panel-complete-spec.md` - Полная спецификация
- `admin-panel-day-1-2-complete.md` - Дни 1-2 завершены
- `admin-panel-week-1-complete.md` - Неделя 1 завершена
- `admin-panel-week-2-*.md` - Отчеты по неделе 2

#### `sessions/` - Сводки сессий
- `session-summary-2025-12-17.md` - Сводка сессии
- `session-summary-2025-12-18-rbac.md` - Сводка сессии RBAC
- `session-summary-v0.5.0.md` - Сводка сессии v0.5.0
- `final-summary-2025-12-17.md` - Финальная сводка
- `summary-v0.5.0.md` - Сводка v0.5.0

#### `deliverables/` - Deliverables
- `deliverables-2025-12-17.md` - Deliverables за дату
- `deliverables-2025-12-18-stage-13.md` - Deliverables Stage 13

#### `compliance/` - Compliance проверки
- `compliance-check-v0.5.0.md` - Проверка compliance

#### `releases/` - Релизы
- `version-0.5.0-release-notes.md` - Release notes версии 0.5.0

#### `build-fixes/` - Исправления сборки
- `build-fixes-summary.md` - Сводка исправлений
- `typescript-build-fixes-2025-12-17.md` - Исправления TypeScript

#### `roadmap-updates/` - Обновления roadmap
- `roadmap-stage13-update.txt` - Обновление roadmap Stage 13

#### `logs/` - Логи по датам
- `2025-12-04-auth-protection-implementation.md` - Реализация защиты
- `2025-12-04-frontend-backend-integration.md` - Интеграция фронтенда и бэкенда
- `2025-12-05-e2e-testing-onboarding.md` - E2E тестирование онбординга

#### Прочие отчеты
- `analysis-report.md` - Аналитический отчет
- `cleanup-complete.md` - Очистка завершена
- `cleanup-report.md` - Отчет об очистке
- `comprehensive-app-audit-2025-12-16.md` - Полный аудит приложения
- `final-cleanup-status.md` - Финальный статус очистки
- `form-auth-errors-handlers.md` - Обработчики ошибок форм
- `implementation-complete.md` - Реализация завершена
- `migration-status.md` - Статус миграции
- `project-dashboard.md` - Дашборд проекта
- `ready-for-testing.md` - Готово к тестированию
- `sorting-complete.md` - Сортировка завершена
- `ui-testing-report.md` - Отчет о тестировании UI
- `whats-next.md` - Что дальше

### `analysis/` - Анализы
Аналитические документы и исследования.
- `admin-panel-plan.md` - План админ-панели
- `analysis-and-improvements.md` - Анализ и улучшения
- `auth-protection-plan.md` - План защиты аутентификации
- `design-analysis.md` - Анализ дизайна
- `expenses-implementation-summary.md` - Сводка реализации расходов
- `full-application-analysis.md` - Полный анализ приложения
- `implementation-plan.md` - План реализации
- `implementation-roadmap-detailed.md` - Детальный roadmap реализации
- `improvement-recommendations.md` - Рекомендации по улучшению
- `next-stage-summary.md` - Сводка следующего этапа
- `pages-analysis.md` - Анализ страниц
- `pages-to-implement.md` - Страницы к реализации
- `personnel-and-payments-analysis.md` - Анализ персонала и выплат
- `project-analysis-2025-12-11.md` - Анализ проекта
- `solution-analysis.md` - Анализ решений
- `stage-settings-improvements.md` - Улучшения настроек этапа
- `telegram-integration-analysis.md` - Анализ интеграции Telegram
- `telegram-oauth-implementation-plan.md` - План реализации OAuth
- `telegram-oauth-planning-complete.md` - Планирование OAuth завершено
- `telegram-support-bot-plan.md` - План бота поддержки
- `user-role-analysis.md` - Анализ ролей пользователей

#### `onboarding/` - Анализ онбординга
- `onboarding-development-plan.md` - План разработки онбординга
- `onboarding-implementation-plan.md` - План реализации онбординга
- `onboarding-plan-summary.md` - Сводка плана онбординга
- `onboarding.md` - Основной документ
- `ready-to-dev.md` - Готово к разработке

### `documentation/` - Техническая документация
Полная техническая документация проекта.
- `00-project-overview.md` - Обзор проекта
- `01-all-stages-complete.md` - Все этапы завершены
- `02-database-schema.md` - Схема базы данных
- `03-graphql-api.md` - GraphQL API
- `04-frontend-pages.md` - Страницы фронтенда
- `05-integrations.md` - Интеграции
- `06-deployment-guide.md` - Гайд по деплою
- `07-security-guide.md` - Гайд по безопасности
- `08-development-setup.md` - Настройка разработки
- `09-all-stages-detailed.md` - Все этапы детально
- `README.md` - README документации

### `fixes/` - Описания фиксов
Документация по исправлениям багов.
- `complete-onboarding-error-fix.md` - Исправление ошибки онбординга

### `prompts/` - Промпты для разработки
Промпты для использования с AI помощниками.
- `enterprise_backend_prompt.md` - Промпт для enterprise бэкенда
- `get-code.md` - Промпт для получения кода
- `git_commit_prompt.md` - Промпт для commit сообщений
- `roadmap.md` - Промпт для roadmap

### `security/` - Документация по безопасности
- `modern-standards-analysis.md` - Анализ современных стандартов
- `security_app.md` - Безопасность приложения

### `templates/` - Шаблоны документации
Шаблоны для создания новой документации.
- `architecture.backend.md` - Шаблон архитектуры бэкенда
- `architecture.frontend.md` - Шаблон архитектуры фронтенда
- `auth.md` - Шаблон аутентификации
- `form_migrate.md` - Шаблон миграции форм
- `gql.md` - Шаблон GraphQL
- `i18n.backend.md` - Шаблон i18n бэкенда
- `i18n.frontend.md` - Шаблон i18n фронтенда

### `testing/` - Планы тестирования
- `stage-9-phase-1-test-plan.md` - План тестирования Stage 9 Phase 1
- `stage-9-phase-2-test-plan.md` - План тестирования Stage 9 Phase 2

## Конвенции именования

- **Файлы:** Используют kebab-case: `user-roles.md`, `auth-protection.md`
- **Директории:** Используют kebab-case с префиксом номера: `00-product/`, `01-features/`
- **Отчеты:** Содержат даты в формате `YYYY-MM-DD` или версии в формате `v0.5.0`
- **Этапы:** Используют префикс `stage-` для планов и отчетов

## Как использовать

1. **Для понимания продукта:** Начните с `00-product/start-here.md` или `00-product/mvp-specification.md`
2. **Для изучения фич:** Смотрите `01-features/` и соответствующие подпапки
3. **Для архитектуры:** Смотрите `02-architecture/`
4. **Для планов:** Смотрите `03-plans/`
5. **Для истории:** Смотрите `04-archive/` и `05-reports/`
6. **Для анализа:** Смотрите `analysis/`
7. **Для технической документации:** Смотрите `documentation/`

## Обновление документации

При добавлении новой документации:
- Продуктовые требования → `00-product/`
- Описания фич → `01-features/` (с соответствующими подпапками)
- Технические решения → `02-architecture/`
- Планы разработки → `03-plans/`
- Завершенные этапы → `04-archive/`
- Отчеты и логи → `05-reports/` (с соответствующими подпапками)
- Анализы → `analysis/`
- Техническая документация → `documentation/`

## Навигация

- **Быстрый старт:** `00-product/start-here.md`
- **Roadmap:** `00-product/roadmap.md`
- **Планы:** `03-plans/action-plan.md`
- **Отчеты:** `05-reports/`
- **Техническая документация:** `documentation/00-project-overview.md`
