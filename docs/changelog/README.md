# Changelog Structure

Эта директория содержит структурированные changelog файлы для проекта.

## Структура

```text
docs/changelog/
├── README.md (этот файл)
├── archive/                    # Архив временных и старых changelog файлов
│   ├── CHANGELOG_RBAC_UPDATE.txt
│   ├── CHANGELOG.md.backup
│   ├── CHANGELOG.md.backup2
│   ├── COMMIT_MESSAGE_STAGE_13.txt
│   └── COMMIT_MESSAGE_v0.6.0.txt
└── (основные файлы находятся в docs/)
    ├── changelog.backend.md    # Все изменения Backend (API)
    └── changelog.frontend.md   # Все изменения Frontend (Web)
```

## Основные файлы

### `docs/changelog.backend.md`
**Назначение:** Все изменения в backend (API) приложения

**Содержит:**
- Изменения в `apps/api/`
- Миграции базы данных
- GraphQL схемы и резолверы
- Backend сервисы и модули
- API endpoints и мутации

**Формат:** [Keep a Changelog](https://keepachangelog.com/en/1.0.0/)

### `docs/changelog.frontend.md`
**Назначение:** Все изменения в frontend (Web) приложения

**Содержит:**
- Изменения в `apps/web/`
- UI компоненты
- Страницы и роутинг
- GraphQL queries и mutations (клиентская часть)
- UX улучшения

**Формат:** [Keep a Changelog](https://keepachangelog.com/en/1.0.0/)

## Главный CHANGELOG.md

`CHANGELOG.md` в корне проекта является **основным файлом** и содержит:
- Полную историю всех версий
- Объединенные изменения (backend + frontend)
- Детальные описания фич и исправлений
- Ссылки на разделенные changelog файлы

## Правила ведения

1. **При добавлении новой версии:**
   - Обновить `CHANGELOG.md` (основной файл)
   - Разделить изменения на backend и frontend
   - Обновить `docs/changelog.backend.md` (только backend изменения)
   - Обновить `docs/changelog.frontend.md` (только frontend изменения)

2. **Временные файлы:**
   - Все временные changelog файлы перемещать в `archive/`
   - Не хранить backup файлы в корне проекта

3. **Формат записей:**
   - Использовать категории: `Added`, `Changed`, `Fixed`, `Removed`, `Security`
   - Указывать файлы и количество измененных строк (LOC)
   - Добавлять ссылки на связанные issues/PR если есть

## Версионирование

Проект следует [Semantic Versioning](https://semver.org/spec/v2.0.0.html):
- **MAJOR** (1.0.0) - Breaking changes
- **MINOR** (0.1.0) - Новые функции (обратно совместимые)
- **PATCH** (0.0.1) - Исправления багов

## Связь с package.json

Версии в changelog должны соответствовать версиям в:
- `package.json` (монорепо)
- `apps/api/package.json` (backend)
- `apps/web/package.json` (frontend)

