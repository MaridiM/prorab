# План реорганизации документации docs/

**Дата:** 2025-12-18
**Цель:** Упорядочить структуру документации, унифицировать именование, устранить дубликаты

---

## 🔍 Анализ текущего состояния

### Проблемы:
1. **Опечатка в названии папки:** `analisys` → должно быть `analysis`
2. **Много файлов в корне docs/:** ~40+ файлов должны быть в папках
3. **Разные стили именования:** UPPER_CASE, kebab-case, mixed
4. **Дубликаты:** changelog файлы, некоторые отчеты
5. **Несоответствие README.md:** реальная структура не соответствует описанию

### Текущая структура:
```
docs/
├── 00-product/          ✅ Хорошо организовано
├── 01-features/         ✅ Хорошо организовано
├── 02-architecture/    ✅ Хорошо организовано
├── 03-plans/            ✅ Хорошо организовано
├── 04-archive/          ✅ Хорошо организовано
├── 05-reports/          ✅ Хорошо организовано
├── analisys/            ❌ Опечатка (должно быть analysis)
├── app/                  ⚠️ Неясное назначение
├── documentation/       ✅ Хорошо организовано
├── features/            ⚠️ Дублирует 01-features/
├── fixes/               ✅ Хорошо организовано
├── prompts/             ✅ Хорошо организовано
├── reports/             ⚠️ Дублирует 05-reports/
├── security/            ✅ Хорошо организовано
├── stages/              ⚠️ Дублирует 04-archive/
├── templates/           ✅ Хорошо организовано
├── testing/             ✅ Хорошо организовано
└── [40+ файлов в корне] ❌ Нужна организация
```

---

## 📋 План реорганизации

### Шаг 1: Исправить опечатку
- [x] Переименовать `analisys/` → `analysis/`

### Шаг 2: Организовать файлы по категориям

#### 2.1. Статусы и отчеты о завершении (→ `05-reports/`)
- `STAGE_*_COMPLETE.md` → `05-reports/stages/`
- `STAGE_*_SUMMARY.md` → `05-reports/stages/`
- `ADMIN_PANEL_*_COMPLETE.md` → `05-reports/admin-panel/`
- `SESSION_SUMMARY_*.md` → `05-reports/sessions/`
- `FINAL_SUMMARY_*.md` → `05-reports/sessions/`
- `SUMMARY_*.md` → `05-reports/sessions/`
- `DELIVERABLES_*.md` → `05-reports/deliverables/`
- `COMPLIANCE_CHECK_*.md` → `05-reports/compliance/`
- `VERSION_*.md` → `05-reports/releases/`

#### 2.2. Планы и задачи (→ `03-plans/`)
- `ACTION_PLAN.md` → `03-plans/action-plan.md`
- `TODO.md` → `03-plans/todo.md`
- `WHATS_NOT_DONE.md` → `03-plans/whats-not-done.md`
- `NEXT_STEPS*.md` → `03-plans/next-steps/`
- `NEXT_PRIORITIES*.md` → `03-plans/next-steps/`
- `ANALYSIS_WHAT_TO_DO_NEXT.md` → `03-plans/analysis-what-to-do-next.md`
- `FULL_PROJECT_COMPLETION_PLAN.md` → `03-plans/full-project-completion-plan.md`

#### 2.3. Стартовые гайды (→ `00-product/` или новый раздел)
- `START_HERE.md` → `00-product/start-here.md`
- `START_HERE_STAGE_13.md` → `00-product/start-here-stage-13.md`
- `roadmap.md` → `00-product/roadmap.md`

#### 2.4. Telegram документация (→ `01-features/telegram/`)
- `TELEGRAM_*.md` → `01-features/telegram/`
- Создать подпапку `01-features/telegram/`

#### 2.5. Анализы (→ `analysis/`)
- `ANALYSIS_*.md` → `analysis/` (уже там, но проверить)
- `PERSONNEL_AND_PAYMENTS_ANALYSIS.md` → `analysis/personnel-and-payments-analysis.md`
- `solution-analysis.md` → `analysis/solution-analysis.md`

#### 2.6. Changelog (→ `05-reports/changelog/`)
- `changelog.backend.md` → `05-reports/changelog/backend.md`
- `changelog.frontend.md` → `05-reports/changelog/frontend.md`

#### 2.7. Прочие файлы
- `INVITE_FLOW.md` → `01-features/invitations/invite-flow.md`
- `MONETIZATION_STRATEGY.md` → `03-plans/monetization-strategy.md`
- `WEBHOOKS_SETUP.md` → `02-architecture/webhooks-setup.md`
- `BUILD_FIXES_SUMMARY.md` → `05-reports/build-fixes-summary.md`
- `TYPESCRIPT_BUILD_FIXES_*.md` → `05-reports/build-fixes/`
- `USER_ROLE_ANALYSIS.md` → `analysis/user-role-analysis.md`
- `MULTIPLE_TEAMS.md` → `01-features/teams/multiple-teams.md`
- `ROADMAP_STAGE13_UPDATE.txt` → `05-reports/roadmap-updates/`

### Шаг 3: Унифицировать именование
- Все файлы → kebab-case
- Примеры:
  - `STAGE_9_COMPLETE.md` → `stage-9-complete.md`
  - `ADMIN_PANEL_WEEK_1_COMPLETE.md` → `admin-panel-week-1-complete.md`
  - `SESSION_SUMMARY_2025-12-17.md` → `session-summary-2025-12-17.md`

### Шаг 4: Объединить дубликаты
- Проверить `reports/` и `05-reports/` → объединить
- Проверить `features/` и `01-features/` → объединить
- Проверить `stages/` и `04-archive/` → решить что оставить

### Шаг 5: Обновить README.md
- Отразить новую структуру
- Добавить навигацию
- Обновить примеры путей

---

## 🎯 Итоговая структура

```
docs/
├── 00-product/
│   ├── start-here.md
│   ├── start-here-stage-13.md
│   ├── roadmap.md
│   ├── mvp-specification.md
│   └── user-roles.md
├── 01-features/
│   ├── onboarding.md
│   ├── invitations/
│   │   └── invite-flow.md
│   ├── telegram/
│   │   ├── telegram-bot.md
│   │   ├── telegram-advanced.md
│   │   ├── telegram-bots-deployment.md
│   │   ├── telegram-bots-integration-roadmap.md
│   │   ├── telegram-bots-setup-guide.md
│   │   ├── telegram-bots-status.md
│   │   ├── telegram-bots-summary.md
│   │   ├── telegram-integration-analysis-full.md
│   │   ├── telegram-integration-ready.md
│   │   └── telegram-oauth-implementation-complete.md
│   ├── teams/
│   │   └── multiple-teams.md
│   └── improvements.md
├── 02-architecture/
│   ├── pages-structure.md
│   └── webhooks-setup.md
├── 03-plans/
│   ├── action-plan.md
│   ├── todo.md
│   ├── whats-not-done.md
│   ├── analysis-what-to-do-next.md
│   ├── full-project-completion-plan.md
│   ├── monetization-strategy.md
│   ├── next-steps/
│   │   ├── next-steps.md
│   │   ├── next-steps-2025-12-17.md
│   │   └── next-priorities-2025-12-17.md
│   ├── admin-panel.md
│   └── auth-protection.md
├── 04-archive/
│   └── [старые планы этапов]
├── 05-reports/
│   ├── changelog/
│   │   ├── backend.md
│   │   └── frontend.md
│   ├── stages/
│   │   └── [отчеты о завершении этапов]
│   ├── admin-panel/
│   │   └── [отчеты админ-панели]
│   ├── sessions/
│   │   └── [сводки сессий]
│   ├── deliverables/
│   │   └── [deliverables файлы]
│   ├── compliance/
│   │   └── [compliance проверки]
│   ├── releases/
│   │   └── [версионные заметки]
│   ├── build-fixes/
│   │   └── [отчеты о фиксах сборки]
│   ├── roadmap-updates/
│   │   └── [обновления roadmap]
│   └── logs/
│       └── [логи по датам]
├── analysis/
│   ├── [все анализы]
│   └── user-role-analysis.md
├── documentation/
│   └── [техническая документация]
├── fixes/
│   └── [описания фиксов]
├── prompts/
│   └── [промпты для разработки]
├── security/
│   └── [документация по безопасности]
├── templates/
│   └── [шаблоны документации]
├── testing/
│   └── [планы тестирования]
└── README.md
```

---

## ✅ Чеклист выполнения

- [ ] Шаг 1: Переименовать analisys → analysis
- [ ] Шаг 2: Переместить файлы по категориям
- [ ] Шаг 3: Переименовать файлы в kebab-case
- [ ] Шаг 4: Объединить дубликаты
- [ ] Шаг 5: Обновить README.md
- [ ] Шаг 6: Обновить ссылки в файлах (если нужно)

---

**Примечание:** Этот план будет выполнен пошагово с сохранением всех файлов и обновлением ссылок.
