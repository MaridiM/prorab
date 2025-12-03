# Краткий план разработки: Онбординг и команды

## 🎯 Цель
Реализовать систему онбординга (3 шага) и управления командами с системой приглашений через 6-значные коды.

## 📊 Статус: 0% (Не начато)

---

## 🗓️ Этапы разработки

### Этап 1: Backend - Модели данных (3 часа)
- [ ] Обновить Prisma schema (Team, TeamMember, InviteCode, Project)
- [ ] Добавить `hasCompletedOnboarding` в User
- [ ] Создать миграцию

### Этап 2: Backend - Teams Module (8-11 часов)
- [ ] Создать структуру модуля
- [ ] Реализовать Teams Service (6 методов)
- [ ] Реализовать GraphQL Resolver
- [ ] Создать DTO и Entities

### Этап 3: Backend - Upload Module (3-4 часа)
- [ ] Создать Uploads module
- [ ] Реализовать загрузку и resize логотипов

### Этап 4: Frontend - UI Компоненты (7-8 часов)
- [ ] Stepper компонент
- [ ] ImageUpload компонент
- [ ] IconPicker компонент

### Этап 5: Frontend - Zod Schemas (1 час)
- [ ] team.schema.ts
- [ ] project.schema.ts
- [ ] invite.schema.ts

### Этап 6: Frontend - GraphQL Integration (2 часа)
- [ ] Создать teams.graphql
- [ ] Запустить codegen
- [ ] Настроить upload link

### Этап 7: Frontend - Onboarding Flow (12-15 часов)
- [ ] Layout с guard'ами
- [ ] Стартовый экран
- [ ] Step 1: Название бригады
- [ ] Step 2: Логотип
- [ ] Step 3: Первый объект
- [ ] Страница ввода кода приглашения

### Этап 8: Frontend - Интеграция с Auth (1 час)
- [ ] Редирект после login
- [ ] Редирект после register

### Этап 9: Тестирование (5-9 часов)
- [ ] Функциональное тестирование
- [ ] UX улучшения
- [ ] Исправление багов

---

## ⏱️ Общая оценка: 42-54 часа (5-7 рабочих дней)

---

## 🎯 Ключевые файлы для создания

### Backend (новые):
- `apps/api/prisma/schema.prisma` - обновить
- `apps/api/src/modules/teams/` - создать
- `apps/api/src/modules/uploads/` - создать

### Frontend (новые):
- `apps/web/src/packages/components/ui/stepper.tsx`
- `apps/web/src/packages/components/ui/image-upload.tsx`
- `apps/web/src/packages/components/ui/icon-picker.tsx`
- `apps/web/src/packages/schemas/onboarding/` - создать
- `apps/web/src/app/(root)/onboarding/` - создать
- `apps/web/src/packages/api/graphql/teams.graphql`

### Frontend (модифицировать):
- `apps/web/src/app/(root)/auth/login/page.tsx`
- `apps/web/src/app/(root)/auth/register/page.tsx`

---

## ✅ Критерии успеха MVP

- ✅ Создание команды через онбординг работает
- ✅ Присоединение по коду приглашения работает
- ✅ Валидация форм работает
- ✅ Редиректы работают корректно
- ✅ Mobile-first дизайн

---

**Подробный план:** [onboarding-development-plan.md](./onboarding-development-plan.md)

