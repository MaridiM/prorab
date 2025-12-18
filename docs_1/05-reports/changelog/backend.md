# Backend Changelog

## [0.5.0] - 2025-01-XX

### Changed

- **Multiple Teams Support:**
  - Подтверждена поддержка множественных команд для одного пользователя
  - Пользователь может быть владельцем нескольких команд
  - Пользователь может быть участником нескольких команд
  - При приглашении создается роль "member" в новой команде
  - Существующие членства не затрагиваются

### Security

- **Invite Code Validation:**
  - Проверка дублей через unique constraint `teamId_userId`
  - Валидация срока действия кода
  - Проверка использования кода (одноразовый)

## [0.3.0] - Previous Version

### Added

- Personnel Analytics
- Salary History
- Work Logs
- CSV Export
