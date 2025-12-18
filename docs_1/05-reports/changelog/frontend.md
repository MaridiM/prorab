# Frontend Changelog

## [0.5.0] - 2025-01-XX

### Added

- **Invite Flow Improvements:**
  - Кнопка "Создать аккаунт и присоединиться" для незарегистрированных
  - Автоматический возврат на страницу приглашения после auth
  - Параметр `redirect` в URL для сохранения контекста
  - Пропуск онбординга для приглашенных пользователей

### Fixed

- **Apollo Client Imports:**
  - Исправлены импорты в admin панели (4 файла)
  - Изменено с `@apollo/client` на `@apollo/client/react`

- **Projects Display:**
  - Полностью переписана логика фильтрации проектов
  - Удалены анимации framer-motion для стабильности
  - Добавлен debug panel
  - Исправлено исчезновение проектов при переключении фильтров

### Changed

- **Team Switcher:**
  - Показывает все команды пользователя (owner + member)
  - Визуальное отличие владелец/участник

## [0.3.0] - 2025-01-XX

### Added

- Time Tracking UI
- Personnel Analytics UI
- Salary History UI
- CSV Export buttons

## [0.2.8] - Previous Version

### Added

- Admin Panel Week 2
- Settings Page
- Multi-Provider Storage UI
