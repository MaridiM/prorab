# Логика периодов подписок

## Обзор

Система отслеживает периоды подписок на двух уровнях:
1. **Subscription** - текущий активный период подписки команды
2. **Payment** - период, который покрывает каждый платеж (для истории)

## Поля Subscription

```typescript
{
  currentPeriodStart: Date  // Начало текущего периода
  currentPeriodEnd: Date    // Конец текущего периода
  trialEndsAt: Date | null  // Конец триального периода (если есть)
  status: SubscriptionStatus // PENDING_PAYMENT | TRIALING | ACTIVE | PAST_DUE | CANCELLED
}
```

## Поля Payment

```typescript
{
  paidAt: Date              // Дата оплаты
  periodStartAt: Date       // Начало периода, который покрывает этот платеж
  periodEndAt: Date         // Конец периода, который покрывает этот платеж
}
```

## Сценарии

### 1. Создание подписки (с триалом)

**Время:** 2 января 2026, 10:00
**Триал:** 14 дней

```typescript
subscription = {
  currentPeriodStart: 2026-01-02 10:00,
  currentPeriodEnd: 2026-01-16 10:00,    // = now + 14 дней (trialEndsAt)
  trialEndsAt: 2026-01-16 10:00,
  status: PENDING_PAYMENT
}
```

**Важно:** `currentPeriodEnd` = `trialEndsAt` для триальных подписок!

### 2. Первая оплата после создания

**Время оплаты:** 2 января 2026, 12:00
**Статус до:** PENDING_PAYMENT

#### Payment запись:
```typescript
payment = {
  paidAt: 2026-01-02 12:00,
  periodStartAt: 2026-01-02 12:00,       // От момента оплаты
  periodEndAt: 2026-02-01 12:00,         // +30 дней
}
```

#### Subscription обновляется:
```typescript
subscription = {
  currentPeriodStart: 2026-01-02 12:00,  // От момента оплаты
  currentPeriodEnd: 2026-01-16 10:00,    // Остается trialEndsAt (триал активен)
  trialEndsAt: 2026-01-16 10:00,
  status: TRIALING                        // Триал активен
}
```

### 3. Продление подписки (renewal)

**Время оплаты:** 15 января 2026, 14:00
**Текущий период:** 2026-01-02 до 2026-01-16
**Статус до:** TRIALING

#### Payment запись:
```typescript
payment = {
  paidAt: 2026-01-15 14:00,
  periodStartAt: 2026-01-16 10:00,       // От ТЕКУЩЕГО currentPeriodEnd!
  periodEndAt: 2026-02-15 10:00,         // +30 дней от periodStartAt
}
```

#### Subscription обновляется:
```typescript
subscription = {
  currentPeriodStart: 2026-01-02 12:00,  // НЕ меняется!
  currentPeriodEnd: 2026-02-15 10:00,    // Расширяется на +30 дней
  trialEndsAt: null,                     // Триал завершен после оплаты
  status: ACTIVE
}
```

**Ключевой момент:** При продлении `currentPeriodStart` НЕ меняется, только `currentPeriodEnd` расширяется!

### 4. Второе продление

**Время оплаты:** 10 февраля 2026, 16:00
**Текущий период:** 2026-01-02 до 2026-02-15
**Статус:** ACTIVE

#### Payment запись:
```typescript
payment = {
  paidAt: 2026-02-10 16:00,
  periodStartAt: 2026-02-15 10:00,       // От ТЕКУЩЕГО currentPeriodEnd!
  periodEndAt: 2026-03-17 10:00,         // +30 дней
}
```

#### Subscription обновляется:
```typescript
subscription = {
  currentPeriodStart: 2026-01-02 12:00,  // ВСЕГДА остается первоначальным!
  currentPeriodEnd: 2026-03-17 10:00,    // Ещё +30 дней
  trialEndsAt: null,
  status: ACTIVE
}
```

### 5. Смена плана

**Время оплаты:** 1 марта 2026, 11:00
**Текущий период:** 2026-01-02 до 2026-03-17
**Текущий план:** LITE
**Новый план:** FOREMAN

#### Payment запись:
```typescript
payment = {
  paidAt: 2026-03-01 11:00,
  periodStartAt: 2026-03-01 11:00,       // От момента оплаты (не от currentPeriodEnd!)
  periodEndAt: 2026-03-31 11:00,         // +30 дней
}
```

#### Subscription обновляется:
```typescript
subscription = {
  currentPeriodStart: 2026-03-01 11:00,  // Сбрасывается на момент оплаты
  currentPeriodEnd: 2026-03-31 11:00,    // Новый период +30 дней
  planId: <new_plan_id>,                 // Меняется план
  plan: FOREMAN,
  trialEndsAt: null,                     // Триал убирается при смене плана
  status: ACTIVE
}
```

**Важно:** При смене плана период СБРАСЫВАЕТСЯ и начинается заново от момента оплаты!

## Сводка логики

| Сценарий | currentPeriodStart | currentPeriodEnd | periodStartAt (Payment) | periodEndAt (Payment) |
|----------|-------------------|------------------|------------------------|----------------------|
| **Создание с триалом** | now | now + trialDays | - | - |
| **Первая оплата** | now | trialEndsAt OR now+30 | now | now+30 |
| **Продление (renewal)** | НЕ меняется | currentPeriodEnd+30 | currentPeriodEnd | currentPeriodEnd+30 |
| **Смена плана** | now | now+30 | now | now+30 |

## Код

### Создание подписки
`subscriptions.service.ts:106-108`
```typescript
const currentPeriodEnd = trialEndsAt || new Date(
  now.getTime() + BILLING_CYCLE_DAYS * 24 * 60 * 60 * 1000,
);
```

### Обработка платежа (Payment periods)
`payments.service.ts:533-552`
```typescript
if (currentSub.status === SubscriptionStatus.PENDING_PAYMENT) {
  // Первый платеж
  periodStartAt = paidAt;
  periodEndAt = new Date(paidAt.getTime() + 30 * 24 * 60 * 60 * 1000);
} else if (isChangingPlan) {
  // Смена плана
  periodStartAt = paidAt;
  periodEndAt = new Date(paidAt.getTime() + 30 * 24 * 60 * 60 * 1000);
} else {
  // Продление - период от ТЕКУЩЕГО currentPeriodEnd
  const currentPeriodEnd = currentSub.currentPeriodEnd || currentSub.currentPeriodStart || paidAt;
  periodStartAt = currentPeriodEnd;
  periodEndAt = new Date(currentPeriodEnd.getTime() + 30 * 24 * 60 * 60 * 1000);
}
```

### Обновление подписки
`payments.service.ts:613-639`
```typescript
if (subscription.status === SubscriptionStatus.PENDING_PAYMENT) {
  // Первый платеж
  updateData.currentPeriodStart = now;
  updateData.currentPeriodEnd = subscription.trialEndsAt || new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
} else if (isPlanChange) {
  // Смена плана - сброс периода
  updateData.currentPeriodStart = now;
  updateData.currentPeriodEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
} else {
  // Продление - только расширяем currentPeriodEnd
  const currentPeriodEnd = subscription.currentPeriodEnd || subscription.currentPeriodStart || now;
  updateData.currentPeriodEnd = new Date(currentPeriodEnd.getTime() + 30 * 24 * 60 * 60 * 1000);
  // currentPeriodStart НЕ меняется!
}
```

## Примеры из жизни

### Пример 1: Раннее продление
Пользователь платит 2 января, подписка заканчивается 8 сентября.

**Неправильно** (старая логика):
- Новый период: 2 января - 2 февраля

**Правильно** (новая логика):
- Новый период начинается с: 8 сентября
- Новый период заканчивается: 8 октября
- Подписка действует непрерывно до 8 октября

### Пример 2: Последовательные продления
1. Первая оплата 5 января → период: 5 янв - 4 фев
2. Продление 30 января → период: 4 фев - 6 мар
3. Продление 25 февраля → период: 6 мар - 5 апр

Периоды идут последовательно без пробелов и без пересечений!

## Отображение в UI

### История подписок (subscription-history.tsx)
Периоды берутся напрямую из базы:

```typescript
const renewalStartDate = renewal.periodStartAt
  ? new Date(renewal.periodStartAt)
  : new Date(renewal.paidAt);

const renewalEndDate = renewal.periodEndAt
  ? new Date(renewal.periodEndAt)
  : new Date(renewalStartDate.getTime() + 30 * 24 * 60 * 60 * 1000);
```

Fallback на расчет существует только для старых платежей до миграции.

### Текущая подписка (mySubscription query)
`subscriptions.resolver.ts:38-53`

**Важно:** Поле `currentPeriodStart` показывает начало **текущего активного периода**, а не первого платежа!

```typescript
// Находим платеж, период которого содержит "сейчас"
const now = new Date();
const currentPayment = await this.prisma.payment.findFirst({
  where: {
    subscriptionId: subscription.id,
    status: 'SUCCEEDED',
    periodStartAt: { lte: now },
    periodEndAt: { gte: now },
  },
  orderBy: { paidAt: 'desc' },
});

// Используем начало текущего платежа, а не первого
const currentPeriodStart = currentPayment?.periodStartAt || subscription.currentPeriodStart;
```

**Пример:**
- Первая оплата: 5 января → период 5 янв - 4 фев
- Продление: 30 января → период 4 фев - 6 мар (текущий!)
- Продление: 25 февраля → период 6 мар - 5 апр

**Отображение:** "Начало периода: 4 февраля" (начало ТЕКУЩЕГО платежа, а не 5 января)
