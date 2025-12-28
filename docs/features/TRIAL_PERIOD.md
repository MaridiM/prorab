# Trial Period Feature

## Обзор

Система пробного периода (Trial Period) для подписок позволяет администраторам настраивать бесплатный пробный период для каждого тарифного плана индивидуально. Новые пользователи автоматически получают доступ к выбранному плану на указанное количество дней перед началом платного периода.

## Статус реализации: 80% ✅

### ✅ Реализовано (Backend + Admin UI + Onboarding + User Dashboard + Email Notifications)

#### Backend (100%) ✅
- ✅ Добавлено поле `trialDays` в модель Plan (nullable Int)
- ✅ Миграция базы данных `20251225_add_trial_days_and_primary_provider`
- ✅ GraphQL схема обновлена (AdminPlanModel, AdminCreatePlanInput, AdminUpdatePlanInput, CompleteOnboardingInput)
- ✅ Логика автоматической активации trial period в `SubscriptionsService.createSubscription()`
- ✅ Автоматическое создание подписки при завершении onboarding с выбранным планом в `TeamsService.completeOnboarding()`
- ✅ Динамический расчет trial period на основе конфигурации плана
- ✅ Обратная совместимость со старой системой

**📊 Изменения:**
- `schema.prisma`: +3 LOC (trialDays field)
- `admin-plan.model.ts`: +9 LOC (GraphQL fields)
- `subscriptions.service.ts`: +28 LOC (dynamic trial logic)
- `create-subscription.input.ts`: +3 LOC (planId field)
- `teams.service.ts`: +52 LOC (onboarding subscription creation)
- `complete-onboarding.input.ts`: +8 LOC (planId field)
- Создана миграция: `20251225_add_trial_days_and_primary_provider/migration.sql`

#### Admin UI (100%) ✅
- ✅ Поле ввода "Пробный период (дней)" в форме редактирования плана
- ✅ Отображение пробного периода в режиме просмотра плана
- ✅ Валидация и placeholder для пустого значения
- ✅ Русская локализация с правильным склонением (день/дня/дней)

**📊 Изменения:**
- `subscription-plans-panel.tsx`: +35 LOC (trial period UI)

#### User Registration Flow (100%) ✅
- ✅ UI выбора тарифного плана при регистрации/onboarding (Step 4)
- ✅ Отображение информации о trial period для каждого плана
- ✅ Автоматическая активация trial при выборе плана
- ✅ Красивые карточки планов с ценами, features, trial period badge
- ✅ Поддержка "Popular" badge для популярных планов
- ✅ Success animation с конфетти при завершении onboarding
- ✅ Обновлены GraphQL queries для включения trialDays во всех plan queries
- ✅ Интеграция с completeOnboarding mutation для передачи planId

**📊 Изменения:**
- Создан `step-4/page.tsx`: +361 LOC (plan selection page)
- Обновлен `step-3/page.tsx`: -96 LOC (cleanup, routing to step 4)
- Обновлен `admin-plans.graphql`: +7 trialDays fields в queries
- Stepper обновлен на 4 шага (было 3)

**🎯 UX Flow:**
1. Step 1: Название команды
2. Step 2: Логотип (загрузка или иконка)
3. Step 3: Первый объект
4. **Step 4: Выбор тарифного плана** ✨ (НОВЫЙ)
   - Карточки планов с trial period badge
   - Автоматическое создание subscription
5. Confetti animation → Dashboard

#### User Dashboard (100%) ✅ - Step 8

- ✅ Виджет отображения trial period в dashboard (TrialStatusWidget)
- ✅ Countdown оставшихся дней пробного периода с progress bar
- ✅ Визуальные индикаторы статуса подписки (TRIALING/ACTIVE)
- ✅ Отображение trial period в настройках профиля
- ✅ Автоматическое предупреждение когда остается < 3 дней
- ✅ CTA кнопка для выбора платного тарифа
- ✅ Красивая анимация с Framer Motion
- ✅ Правильная русская локализация (день/дня/дней)

**📊 Изменения:**
- Создан `trial-status-widget.tsx`: +150 LOC (trial status widget component)
- Создан `subscription/index.ts`: +1 LOC (barrel export)
- Обновлен `components/index.ts`: +1 LOC (export subscription components)
- Обновлен `subscriptions.graphql`: +6 LOC (planId + planRef fields)
- Обновлен `subscription.model.ts`: +3 LOC (planId, planRef fields)
- Обновлен `subscriptions.service.ts`: +16 LOC (include planRef with prices + features)
- Обновлен `subscriptions.resolver.ts`: +36 LOC (transform Decimal to number for prices)
- Обновлен `dashboard/page.tsx`: +15 LOC (subscription query + widget integration)
- Обновлен `SubscriptionManagement.tsx`: +2 LOC (widget in settings)

#### Email Notifications (100%) ✅ - Step 9

- ✅ Email уведомление за 3 дня до окончания trial (sendTrialExpiringEmail)
- ✅ Email уведомление при окончании trial (sendTrialExpiredEmail)
- ✅ Красивые HTML email шаблоны в фирменном стиле ProRab
- ✅ Поддержка Telegram OAuth users (пропуск placeholder emails)
- ✅ Интеграция с Brevo (SendinBlue) API
- ⏳ Cron job для автоматической отправки (требует @nestjs/schedule)

**📊 Изменения:**
- Обновлен `mail.service.ts`: +209 LOC (2 новых метода + 2 email шаблона)

### ⏳ В разработке (20%)

#### Scheduled Tasks (0%) - Step 9.5

- ⏳ Установка @nestjs/schedule пакета
- ⏳ Создание TrialNotificationService
- ⏳ Cron job для ежедневной проверки trial expirations
- ⏳ Отправка уведомлений за 3 дня до окончания
- ⏳ Отправка уведомлений при окончании trial
- ⏳ Логирование отправленных уведомлений

#### Testing & Documentation (0%) - Step 10
- ⏳ E2E тесты onboarding flow с выбором плана
- ⏳ Unit тесты backend trial period logic
- ⏳ Integration тесты subscription creation
- ⏳ Обновление пользовательской документации

## Архитектура

### Database Schema

```prisma
model Plan {
  // ... other fields
  trialDays   Int?    @map("trial_days") // Number of trial days (null = no trial)
  // ... relations
}

model Subscription {
  // ... other fields
  planId      String?            @map("plan_id") // NEW: Foreign key to Plan
  status      SubscriptionStatus @default(TRIALING)
  trialEndsAt DateTime?          @map("trial_ends_at")
  planRef     Plan?              @relation(fields: [planId], references: [id])
  // ... other fields
}
```

### Backend Logic Flow

```typescript
// 1. Admin настраивает trial period для плана
Admin sets trialDays = 14 for "Lite" plan

// 2. User выбирает план при регистрации
User selects planId = "lite-plan-id"

// 3. SubscriptionsService.createSubscription()
- Load plan from DB: plan = await prisma.plan.findUnique({ where: { id: planId } })
- Get trialDays: trialDays = plan.trialDays ?? TRIAL_DURATION_DAYS (fallback)
- Calculate trial end: trialEndsAt = now + (trialDays * 24 * 60 * 60 * 1000)
- Set subscription status:
  - If trialDays > 0: status = TRIALING
  - If trialDays === 0 or null: status = ACTIVE (no trial)

// 4. Subscription created with trial period
{
  planId: "lite-plan-id",
  status: "TRIALING",
  trialEndsAt: "2025-01-08T00:00:00Z", // 14 days from now
  currentPeriodEnd: "2025-01-08T00:00:00Z"
}
```

### Frontend Configuration

**Admin Panel:**
- Путь: `/admin/settings?tab=plans`
- Компонент: `SubscriptionPlansPanel`
- Доступно: Super Admin, Admin с правами `plans:edit`

**User Flow:**
- Onboarding: `/onboarding/step-4` ✅ (реализовано)
  - Компонент: `apps/web/src/app/(root)/onboarding/step-4/page.tsx`
  - Query: `GetAvailablePlansDocument`
  - Mutation: `CompleteOnboardingDocument` с `planId`
- Dashboard: `/dashboard` - виджет trial status (планируется)
- Settings: `/settings/subscription` - детальная информация (планируется)

## Примеры использования

### Настройка trial period для плана (Admin)

1. Перейти в Admin Panel → System Settings → Subscription Plans
2. Выбрать план (например, "Лайт")
3. Нажать "Редактировать"
4. В секции "Лимиты и настройки" заполнить поле "Пробный период (дней)":
   - `14` - для двухнедельного пробного периода
   - `30` - для месячного пробного периода
   - Оставить пустым или `0` - без пробного периода
5. Сохранить изменения

### Создание подписки с trial period (Backend)

```typescript
// GraphQL Mutation
mutation CreateSubscription {
  createSubscription(input: {
    teamId: "team-123",
    plan: LITE,
    planId: "lite-plan-id", // NEW: Use database Plan
    useEarlyBird: false
  }) {
    id
    status          # TRIALING
    trialEndsAt     # 2025-01-08T00:00:00Z (14 days from now)
    planRef {
      name          # "Лайт"
      trialDays     # 14
    }
  }
}
```

### Проверка trial period (Frontend - TODO)

```tsx
// User Dashboard Component (планируется)
function TrialStatus({ subscription }) {
  if (!subscription.trialEndsAt) {
    return <Badge>Активная подписка</Badge>
  }

  const daysLeft = calculateDaysLeft(subscription.trialEndsAt)

  return (
    <div className="trial-widget">
      <h3>Пробный период</h3>
      <p>Осталось {daysLeft} дней</p>
      <Progress value={(14 - daysLeft) / 14 * 100} />
      <Button>Выбрать тарифный план</Button>
    </div>
  )
}
```

## Конфигурация

### Backend Constants

```typescript
// apps/api/src/modules/subscriptions/constants/plans.constants.ts
export const TRIAL_DURATION_DAYS = 14; // Fallback если plan.trialDays не задан
export const BILLING_CYCLE_DAYS = 30;  // Стандартный биллинг цикл
```

### Environment Variables

Нет специфичных переменных окружения для trial period.

## Testing

### Manual Testing Checklist

**Backend:**
- [x] Создать план с `trialDays = 14`
- [x] Создать подписку с `planId`
- [x] Проверить что `trialEndsAt` = now + 14 дней
- [x] Проверить что `status = TRIALING`
- [x] Создать план с `trialDays = null`
- [x] Проверить что подписка создается без trial period

**Admin UI:**
- [x] Открыть редактирование плана
- [x] Установить `trialDays = 30`
- [x] Сохранить и проверить в БД
- [x] Проверить отображение в режиме просмотра

**Onboarding Flow:**
- [x] Пройти onboarding flow (Steps 1-4)
- [x] Выбрать план с trial period
- [x] Проверить автоматическое создание subscription
- [x] Проверить success animation с конфетти
- [x] Проверить что `planId` передается в `completeOnboarding`

**User Dashboard (TODO):**
- [ ] Проверить отображение trial status widget
- [ ] Проверить countdown в dashboard
- [ ] Проверить отображение в settings

## Migration Guide

### Для существующих подписок

Существующие подписки созданы со старым enum `plan` и не имеют связи с таблицей Plan.

**Опции:**
1. **Сохранить as-is**: Старые подписки продолжают работать с константой `TRIAL_DURATION_DAYS`
2. **Миграция данных**: Создать скрипт для связи существующих подписок с новой таблицей Plan

### Для новых подписок

Все новые подписки должны создаваться с `planId` для использования динамического trial period.

```graphql
# Рекомендуемый способ (новый)
mutation {
  createSubscription(input: {
    teamId: "..."
    planId: "lite-plan-id"  # ✅ Использует plan.trialDays
  })
}

# Старый способ (backward compatibility)
mutation {
  createSubscription(input: {
    teamId: "..."
    plan: LITE  # ⚠️ Использует TRIAL_DURATION_DAYS константу
  })
}
```

## Future Enhancements

### Phase 2 (Planned)
- [ ] Кастомные trial periods для разных регионов
- [ ] Trial period для апгрейдов между планами
- [ ] A/B тестирование разной длины trial periods
- [ ] Повторная активация trial period (admin override)

### Phase 3 (Ideas)
- [ ] Trial period с ограниченным функционалом
- [ ] Автоматическое продление trial period на основе активности
- [ ] Персонализированные trial periods на основе профиля пользователя

## Related Documentation

- [Subscription Plans](./SUBSCRIPTION_PLANS.md) (если существует)
- [Payment Integration](./PAYMENT_INTEGRATION.md) (если существует)
- Backend Changelog: `docs/changelog.backend.md`
- Frontend Changelog: `docs/changelog.frontend.md`

## Support

При возникновении вопросов или проблем:
1. Проверить логи backend на предмет ошибок при создании подписки
2. Убедиться что plan.trialDays корректно сохранен в БД
3. Проверить что `planId` передается в mutation `createSubscription`

## Changelog

**v1.4.4 (2025-12-25)** - Initial Implementation (60%)
- ✅ Backend: Database schema, GraphQL API, subscription logic
- ✅ Admin UI: Trial period configuration interface
- ⏳ User UI: Registration flow, dashboard widget, notifications
