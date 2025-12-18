# 🚀 Admin Panel - TODO List

## ❌ Не реализовано (КРИТИЧНО)

### 1. Projects Admin Module
**Приоритет**: 🔴 Высокий
**Оценка**: 4-6 часов

**Нужно создать**:
```
📁 apps/web/src/app/(root)/(protected)/admin/projects/page.tsx
📁 apps/web/src/packages/api/graphql/admin/admin-projects.graphql
📁 apps/api/src/modules/admin/resolvers/admin-projects.resolver.ts
📁 apps/api/src/modules/admin/services/admin-projects.service.ts
```

**Функционал**:
- [ ] Список всех проектов в системе
- [ ] Фильтры: статус, команда, дата создания
- [ ] Модерация проектов (approve/reject)
- [ ] Удаление/архивация
- [ ] Статистика по проектам
- [ ] Детали проекта в диалоге

---

### 2. Support Tickets Module
**Приоритет**: 🟡 Средний
**Оценка**: 8-10 часов

**Нужно создать**:
```
📁 apps/web/src/app/(root)/(protected)/admin/support/page.tsx
📁 apps/web/src/packages/api/graphql/admin/admin-tickets.graphql
📁 apps/api/src/modules/admin/resolvers/admin-tickets.resolver.ts
📁 apps/api/src/modules/admin/services/admin-tickets.service.ts
📊 apps/api/prisma/schema.prisma (добавить модель SupportTicket)
```

**Функционал**:
- [ ] Создать Prisma модель `SupportTicket`
- [ ] Список тикетов с фильтрами
- [ ] Назначение тикетов админам
- [ ] Ответы на тикеты
- [ ] История переписки
- [ ] Статусы: Open, In Progress, Resolved, Closed
- [ ] Приоритеты: Low, Medium, High, Urgent
- [ ] Интеграция с Telegram Bot

---

### 3. Analytics Page
**Приоритет**: 🟡 Средний
**Оценка**: 3-4 часа

**Нужно создать**:
```
📁 apps/web/src/app/(root)/(protected)/admin/analytics/page.tsx
```

**Функционал**:
- [ ] Использовать существующие GraphQL queries
- [ ] Графики выручки (Revenue Chart)
- [ ] График роста пользователей (User Growth Chart)
- [ ] Графики по планам подписок
- [ ] Фильтры по датам (last 7 days, 30 days, 90 days, custom)
- [ ] Экспорт в CSV/PDF
- [ ] Сравнение периодов

---

## ⚠️ Частично реализовано (НУЖНО ДОДЕЛАТЬ)

### 4. Team Suspension Feature
**Приоритет**: 🔴 Высокий
**Оценка**: 2 часа

**Проблема**: Функционал закомментирован в коде

**Файл**: `apps/web/src/app/(root)/(protected)/admin/teams/page.tsx`
**Строки**: 84-93, 229-233

**Что нужно**:
- [ ] Раскомментировать код в `teams/page.tsx`
- [ ] Добавить мутацию `AdminSuspendTeam` в GraphQL
- [ ] Добавить мутацию `AdminUnsuspendTeam` в GraphQL
- [ ] Реализовать методы в `admin-teams.service.ts`:
  - `suspendTeam(teamId: string, reason: string)`
  - `unsuspendTeam(teamId: string)`
- [ ] Добавить поле `suspendedAt` и `suspendReason` в модель Team
- [ ] Обновить resolver

```typescript
// Code to uncomment:
{isSuperAdmin && (
  <Button
    variant="outline"
    size="sm"
    onClick={() => handleSuspendTeam(team.id, team.suspended)}
  >
    {team.suspended ? 'Unsuspend' : 'Suspend'}
  </Button>
)}
```

---

## 🔧 Улучшения (ЖЕЛАТЕЛЬНО)

### 5. Batch Operations
**Приоритет**: 🟢 Низкий
**Оценка**: 3-4 часа

**Что добавить**:
- [ ] Массовое удаление пользователей
- [ ] Массовая верификация email
- [ ] Массовое обновление статусов подписок
- [ ] Массовое удаление платежей
- [ ] Checkbox для выбора записей
- [ ] "Select All" функционал

**Модули для апгрейда**:
- Users
- Teams
- Subscriptions
- Payments

---

### 6. Export Functionality
**Приоритет**: 🟢 Низкий
**Оценка**: 2-3 часа

**Что добавить**:
- [ ] Export to CSV для всех таблиц
- [ ] Export to Excel для финансовых данных
- [ ] Export to PDF для отчетов
- [ ] Экспорт логов за период

**Библиотеки**:
- `react-csv` или `papaparse` для CSV
- `xlsx` или `exceljs` для Excel
- `jspdf` для PDF

---

### 7. Advanced Filtering
**Приоритет**: 🟢 Низкий
**Оценка**: 3-4 часа

**Что улучшить**:
- [ ] Сохранение фильтров в localStorage
- [ ] Quick filters (preset filters)
- [ ] Date range picker для всех модулей
- [ ] Multi-select filters
- [ ] Search with autocomplete

---

### 8. Real-time Updates
**Приоритет**: 🟢 Низкий
**Оценка**: 4-5 часов

**Что добавить**:
- [ ] WebSocket subscriptions для логов
- [ ] Live уведомления о новых тикетах
- [ ] Автообновление статистики на дашборде
- [ ] Toast notifications для изменений

**Технологии**:
- GraphQL Subscriptions
- Apollo Client subscriptions
- WebSocket connection

---

### 9. Dashboard Customization
**Приоритет**: 🟢 Низкий
**Оценка**: 5-6 часов

**Что добавить**:
- [ ] Drag-and-drop виджетов
- [ ] Выбор виджетов для отображения
- [ ] Сохранение layout в базе
- [ ] Персональные дашборды для каждого админа
- [ ] Widget marketplace (?)

**Библиотеки**:
- `react-grid-layout`
- `dnd-kit`

---

## 🐛 Баги и фиксы

### 10. Missing UI Components
**Приоритет**: 🟢 Низкий
**Оценка**: 1 час

**Проблема**: Компоненты созданы но не используются

**Файлы**:
```
apps/web/src/packages/components/ui/accordion.tsx (не используется)
apps/web/src/packages/components/ui/checkbox.tsx (не используется)
apps/web/src/packages/components/ui/command.tsx (не используется)
```

**Решение**:
- [ ] Использовать или удалить неиспользуемые компоненты
- [ ] Проверить все импорты
- [ ] Очистить неиспользуемый код

---

### 11. TypeScript Build Errors
**Приоритет**: 🔴 Высокий
**Оценка**: 2-3 часа

**Проблема**: API не компилируется из-за ошибок типов

**Файлы с ошибками**:
```
apps/api/src/modules/admin/resolvers/admin-users.resolver.ts
apps/api/src/modules/auth/auth.resolver.ts
```

**Ошибки**:
- BusinessRole enum несовместимость между Prisma и GraphQL
- User type mismatch в resolvers

**Решение**:
- [ ] Синхронизировать BusinessRole enum
- [ ] Обновить типы в resolvers
- [ ] Запустить `npm run build` и исправить все ошибки

---

## 🧪 Тестирование

### 12. Write Tests
**Приоритет**: 🟡 Средний
**Оценка**: 8-10 часов

**Нужно создать**:
- [ ] Unit tests для backend services
- [ ] Integration tests для resolvers
- [ ] E2E tests для admin pages
- [ ] Permission guards tests

**Coverage цели**:
- Backend: 80%
- Frontend: 60%

---

### 13. Manual Testing
**Приоритет**: 🔴 Высокий
**Оценка**: 3-4 часа

**Что протестировать**:
- [ ] Все CRUD операции во всех модулях
- [ ] Permissions для всех 4 ролей
- [ ] Edge cases (пустые данные, errors)
- [ ] Performance (большие списки)
- [ ] Mobile responsiveness

**Тест-аккаунты** (уже созданы):
- superadmin@prorab.app / super123456
- admin@prorab.app / admin123456
- moderator@prorab.app / mod123456
- support@prorab.app / support123456

---

## 📚 Документация

### 14. API Documentation
**Приоритет**: 🟡 Средний
**Оценка**: 3-4 часа

**Что создать**:
- [ ] GraphQL schema documentation
- [ ] Permissions reference
- [ ] Example queries/mutations
- [ ] Error codes reference

**Инструменты**:
- GraphQL Playground
- Swagger (если есть REST endpoints)

---

### 15. User Guide
**Приоритет**: 🟢 Низкий
**Оценка**: 2-3 часа

**Что создать**:
- [ ] Admin Panel User Guide
- [ ] Screenshots для каждого модуля
- [ ] Best practices
- [ ] Troubleshooting guide

---

## ⚡ Performance Optimization

### 16. Caching
**Приоритет**: 🟡 Средний
**Оценка**: 3-4 часа

**Что добавить**:
- [ ] Redis caching для частых запросов
- [ ] Apollo Client cache policies
- [ ] Стратегия invalidation
- [ ] CDN для статики

---

### 17. Database Optimization
**Приоритет**: 🟡 Средний
**Оценка**: 2-3 часа

**Что проверить**:
- [ ] Database indexes на часто запрашиваемых полях
- [ ] N+1 queries проблемы
- [ ] Slow query log анализ
- [ ] Connection pooling настройки

---

### 18. Pagination & Lazy Loading
**Приоритет**: 🟡 Средний
**Оценка**: 3-4 часа

**Что улучшить**:
- [ ] Cursor-based pagination
- [ ] Infinite scroll для логов
- [ ] Virtual scrolling для больших списков
- [ ] Lazy loading изображений

---

## 🔒 Security Enhancements

### 19. Rate Limiting
**Приоритет**: 🔴 Высокий
**Оценка**: 2-3 часа

**Что добавить**:
- [ ] Rate limiting на все endpoints
- [ ] IP-based throttling
- [ ] User-based throttling
- [ ] DDoS protection

**Библиотеки**:
- `@nestjs/throttler`
- `express-rate-limit`

---

### 20. Enhanced Audit Logging
**Приоритет**: 🟡 Средний
**Оценка**: 3-4 часа

**Что улучшить**:
- [ ] Логирование всех админских действий автоматически
- [ ] Diff changes (before/after)
- [ ] Request/response logging
- [ ] Failed login attempts tracking

---

## 📊 Итоговая статистика

### По приоритетам:
- 🔴 **Высокий**: 4 задачи (13-17 часов)
- 🟡 **Средний**: 9 задач (33-41 час)
- 🟢 **Низкий**: 7 задач (23-29 часов)

### По категориям:
- ❌ **Не реализовано**: 3 модуля
- ⚠️ **Частично**: 1 модуль
- 🔧 **Улучшения**: 5 задач
- 🐛 **Баги**: 2 задачи
- 🧪 **Тестирование**: 2 задачи
- 📚 **Документация**: 2 задачи
- ⚡ **Performance**: 3 задачи
- 🔒 **Security**: 2 задачи

### Общая оценка:
**69-87 часов** работы для полного завершения всех задач

---

## 🎯 Рекомендуемый порядок выполнения

### Sprint 1 (2 недели) - Критические задачи
1. ✅ Fix TypeScript build errors (2-3h)
2. ✅ Team Suspension feature (2h)
3. ✅ Projects Admin Module (4-6h)
4. ✅ Analytics Page (3-4h)
5. ✅ Manual Testing (3-4h)

**Итого Sprint 1**: ~14-19 часов

### Sprint 2 (2 недели) - Важные задачи
6. Support Tickets Module (8-10h)
7. Rate Limiting (2-3h)
8. Enhanced Audit Logging (3-4h)
9. Write Tests (8-10h)

**Итого Sprint 2**: ~21-27 часов

### Sprint 3 (2 недели) - Улучшения
10. Batch Operations (3-4h)
11. Export Functionality (2-3h)
12. Caching (3-4h)
13. Database Optimization (2-3h)
14. API Documentation (3-4h)

**Итого Sprint 3**: ~13-18 часов

### Sprint 4+ - Дополнительно
15. Advanced Filtering (3-4h)
16. Real-time Updates (4-5h)
17. Dashboard Customization (5-6h)
18. Pagination Improvements (3-4h)
19. User Guide (2-3h)
20. Cleanup unused components (1h)

**Итого Sprint 4+**: ~18-23 часа

---

*Последнее обновление: 2025-12-18*
