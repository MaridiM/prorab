# План реализации: Этап 8 - Монетизация (Subscriptions & Payments)

## Статус: 📋 ПЛАНИРУЕТСЯ

**Предыдущий этап:** Этап 6 (Финансы и зарплата) завершён ✅
**Текущая задача:** Интегрировать систему подписок и платежей через ЮKassa
**Цель:** Генерация дохода через тарифные планы с автоматическим управлением подписками
**Приоритет:** 🔴🔴🔴 Критический (блокирует публичный запуск)
**Оценка времени:** 2 недели (80-100 часов)
**Блокирует:** Коммерческий запуск MVP, генерация дохода

---

## Бизнес-ценность

### 💰 Impact

**Проблема которую решаем:** "Как монетизировать платформу и генерировать стабильный доход?"

**Текущая ситуация:**
- Нет системы оплаты - приложение полностью бесплатное
- Нет ограничений на использование функций
- Нет возможности генерировать доход
- Невозможно масштабировать бизнес без revenue stream

**После внедрения:**
- 3 тарифных плана под разные сегменты пользователей
- Автоматические рекуррентные платежи через ЮKassa
- Trial период 14 дней для тестирования
- Прозрачные лимиты на проекты и участников
- Возможность апгрейда/даунгрейда тарифа
- Автоматическое управление подписками

**Монетизация:**
- **MRR (Monthly Recurring Revenue):** Предсказуемый доход
- **LTV (Lifetime Value):** Долгосрочные клиенты
- **Ценовая модель:** 490₽ - 1990₽ в месяц
- **Target:** 100 платящих клиентов = 99,000₽ MRR = 1,188,000₽ ARR

**Целевые сегменты:**
1. **Лайт (490₽/мес):** Индивидуальные мастера (1 объект, 1 участник)
2. **Прораб (990₽/мес):** Средние бригады (4 объекта, 3 участника)
3. **Бригада (1990₽/мес):** Крупные бригады (безлимит объектов, 10 участников)

---

## Текущее состояние

### ✅ Что уже есть:
- Database: Team model с владельцами
- Backend: AuthModule для аутентификации
- Backend: TeamsModule для управления командами
- Backend: ProjectsModule с лимитом 10 активных проектов (хардкод)
- Frontend: /teams страница со списком команд
- Frontend: Dashboard с информацией о проектах

### ❌ Что нужно добавить:
- Database: Subscription model (подписки команд)
- Database: Payment model (история платежей)
- Database: Plan model или enum (тарифные планы)
- Backend: SubscriptionsModule с бизнес-логикой
- Backend: PaymentsModule с ЮKassa интеграцией
- Backend: Webhook handler для обработки событий ЮKassa
- Backend: Middleware для проверки лимитов по тарифу
- Frontend: /pricing страница (публичная)
- Frontend: /teams/[teamId]/subscription страница
- Frontend: UI Components для управления подпиской
- Integration: Блокировка функций при превышении лимитов

---

## Критические решения

### 🔴 РЕШЕНИЕ #1: Платёжная система

**Варианты:**
1. **ЮKassa (Юmoney)** - российская система
2. **CloudPayments** - альтернатива
3. **Stripe** - международная (не работает из РФ)

**Выбор:** ЮKassa
**Обоснование:**
- ✅ Работает в РФ без ограничений
- ✅ Поддержка рекуррентных платежей
- ✅ Webhook notifications
- ✅ REST API + SDK (@a2seven/yoo-checkout)
- ✅ Низкая комиссия (2.8% + 10₽)
- ✅ Юридическое лицо не требуется (ИП достаточно)
- ✅ Документация на русском

### 🔴 РЕШЕНИЕ #2: Модель подписки

**Варианты:**
1. **Постоплата** - платеж в конце периода
2. **Предоплата** - платеж в начале периода
3. **Гибрид** - trial + предоплата

**Выбор:** Trial 14 дней + предоплата
**Обоснование:**
- ✅ 14 дней trial без карты - снижает барьер входа
- ✅ Автоматический переход на платный после trial
- ✅ Предоплата на месяц вперёд
- ✅ Рекуррентный платёж автоматически
- ❌ Отмена в любой момент (минус LTV, но плюс к лояльности)

**Trial период:**
- Длительность: 14 дней
- Без привязки карты
- Полный доступ ко всем функциям
- Push к оплате за 3 дня до окончания
- Автоматический downgrade на FREE план (если будет)

### 🔴 РЕШЕНИЕ #3: Тарифные планы

**Бизнес-модель:**

| План | Цена/мес | Проекты | Участники | Хранилище |
|------|----------|---------|-----------|-----------|
| **Лайт** | 490₽ | 1 активный | 1 (только владелец) | 500 MB |
| **Прораб** | 990₽ | 4 активных | 3 участника | 2 GB |
| **Бригада** | 1990₽ | Безлимит | 10 участников | 10 GB |

**Почему эти цены:**
- **490₽** - психологический барьер (~$5), доступно для мастеров
- **990₽** - sweet spot для средних бригад (~$10)
- **1990₽** - премиум сегмент (~$20), профессиональные бригады

**Конкурентный анализ:**
- **Notion:** $10/мес (аналог по сложности)
- **Trello Premium:** $10/мес
- **Asana:** $10.99/мес
- **ProRab:** 490-1990₽ ($5-$20) - конкурентоспособно

**Early Bird предложение (первые 500 команд):**
- Лайт: ~~490₽~~ **290₽/мес** (-40%)
- Прораб: ~~990₽~~ **690₽/мес** (-30%)
- Бригада: ~~1990₽~~ **1490₽/мес** (-25%)
- Действует пожизненно (grandfather clause)

### 🔴 РЕШЕНИЕ #4: Рекуррентные платежи

**ЮKassa Автоплатежи:**
- **Payment token** - сохраняется после первого платежа
- **Автосписание** - каждые 30 дней
- **Webhook notifications** - статусы платежей
- **Retry logic** - 3 попытки при неудаче

**Flow:**
1. User выбирает план → redirect на ЮKassa
2. User вводит карту → first payment
3. ЮKassa сохраняет payment method
4. Return to app → subscription activated
5. Каждые 30 дней → автосписание
6. Webhook → update subscription status

### 🔴 РЕШЕНИЕ #5: Plan Limitations Enforcement

**Где проверяем лимиты:**
1. **Backend GraphQL Guards** - основная защита
2. **Frontend UI** - UX блокировка (превентивная)
3. **Database constraints** - последняя линия защиты

**Что блокируем:**
- ❌ Создание проектов (если лимит достигнут)
- ❌ Добавление участников (если лимит достигнут)
- ❌ Загрузка фото (если storage лимит)
- ✅ Чтение всегда разрешено
- ✅ Архивирование всегда разрешено

---

## Архитектура решения

### 1. DATABASE SCHEMA

**Миграция:** `add_subscriptions_and_payments`

#### Subscription Model

```prisma
model Subscription {
  id                    String   @id @default(uuid())
  teamId                String   @unique @map("team_id")

  // Plan details
  plan                  SubscriptionPlan  // LITE, FOREMAN, BRIGADE
  status                SubscriptionStatus @default(TRIALING) // TRIALING, ACTIVE, PAST_DUE, CANCELLED, EXPIRED

  // Billing cycle
  currentPeriodStart    DateTime  @map("current_period_start")
  currentPeriodEnd      DateTime  @map("current_period_end")
  trialEndsAt           DateTime? @map("trial_ends_at")

  // YooKassa integration
  yookassaSubscriptionId String?  @unique @map("yookassa_subscription_id")
  paymentMethodId       String?   @map("payment_method_id") // Saved payment method

  // Cancellation
  cancelAtPeriodEnd     Boolean   @default(false) @map("cancel_at_period_end")
  cancelledAt           DateTime? @map("cancelled_at")

  // Metadata
  isEarlyBird           Boolean   @default(false) @map("is_early_bird") // Locked early bird pricing
  createdAt             DateTime  @default(now()) @map("created_at")
  updatedAt             DateTime  @updatedAt @map("updated_at")

  // Relations
  team                  Team      @relation(fields: [teamId], references: [id], onDelete: Cascade)
  payments              Payment[]

  @@index([teamId])
  @@index([status])
  @@index([plan])
  @@index([currentPeriodEnd])
  @@map("subscriptions")
}

enum SubscriptionPlan {
  LITE     // 490₽/мес (1 проект, 1 участник, 500MB)
  FOREMAN  // 990₽/мес (4 проекта, 3 участника, 2GB)
  BRIGADE  // 1990₽/мес (безлимит, 10 участников, 10GB)
}

enum SubscriptionStatus {
  TRIALING    // Trial период
  ACTIVE      // Активная подписка
  PAST_DUE    // Просрочена (неудачный платёж)
  CANCELLED   // Отменена пользователем
  EXPIRED     // Истекла после отмены
}
```

#### Payment Model

```prisma
model Payment {
  id                String   @id @default(uuid())
  subscriptionId    String   @map("subscription_id")
  teamId            String   @map("team_id")

  // Amount
  amount            Decimal  @db.Decimal(12,2) // 490.00, 990.00, 1990.00
  currency          String   @default("RUB") @db.VarChar(3)

  // Status
  status            PaymentStatus @default(PENDING)

  // YooKassa
  yookassaPaymentId String   @unique @map("yookassa_payment_id")
  paymentMethod     String?  @map("payment_method") // bank_card, yoomoney, etc.

  // Metadata
  description       String?  @db.Text
  failureReason     String?  @map("failure_reason") @db.Text
  paidAt            DateTime? @map("paid_at")
  refundedAt        DateTime? @map("refunded_at")

  createdAt         DateTime @default(now()) @map("created_at")
  updatedAt         DateTime @updatedAt @map("updated_at")

  // Relations
  subscription      Subscription @relation(fields: [subscriptionId], references: [id], onDelete: Cascade)

  @@index([subscriptionId])
  @@index([teamId])
  @@index([status])
  @@index([createdAt])
  @@map("payments")
}

enum PaymentStatus {
  PENDING    // Ожидает оплаты
  SUCCEEDED  // Успешно оплачен
  CANCELLED  // Отменён
  FAILED     // Неудачная попытка
  REFUNDED   // Возвращён
}
```

#### Team Model Updates

```prisma
model Team {
  // ... existing fields

  // Subscription relation
  subscription      Subscription?

  // Storage usage tracking
  storageUsedBytes  BigInt    @default(0) @map("storage_used_bytes")

  // ... rest of model
}
```

#### Plan Configuration (Code Constants)

```typescript
// apps/api/src/modules/subscriptions/constants/plans.constants.ts

export const PLAN_LIMITS = {
  LITE: {
    name: 'Лайт',
    price: 490,
    earlyBirdPrice: 290,
    maxActiveProjects: 1,
    maxMembers: 1,
    storageGB: 0.5, // 500 MB
    features: ['Базовый функционал', 'Email поддержка'],
  },
  FOREMAN: {
    name: 'Прораб',
    price: 990,
    earlyBirdPrice: 690,
    maxActiveProjects: 4,
    maxMembers: 3,
    storageGB: 2,
    features: ['Расчёты зарплаты', 'Фотоотчёты', 'Priority support'],
  },
  BRIGADE: {
    name: 'Бригада',
    price: 1990,
    earlyBirdPrice: 1490,
    maxActiveProjects: null, // unlimited
    maxMembers: 10,
    storageGB: 10,
    features: ['Все функции', 'API доступ', 'Dedicated support'],
  },
} as const;

export const TRIAL_DURATION_DAYS = 14;
export const BILLING_CYCLE_DAYS = 30;
```

---

### 2. BACKEND API

#### 2.1. Module Structure

```
apps/api/src/modules/
├── subscriptions/
│   ├── dto/
│   │   ├── create-subscription.input.ts
│   │   ├── update-subscription.input.ts
│   │   ├── change-plan.input.ts
│   │   └── cancel-subscription.input.ts
│   ├── models/
│   │   ├── subscription.model.ts
│   │   ├── plan-limits.model.ts
│   │   └── subscription-status.model.ts
│   ├── guards/
│   │   ├── check-project-limit.guard.ts
│   │   ├── check-member-limit.guard.ts
│   │   └── check-storage-limit.guard.ts
│   ├── constants/
│   │   └── plans.constants.ts
│   ├── subscriptions.service.ts
│   ├── subscriptions.resolver.ts
│   └── subscriptions.module.ts
│
├── payments/
│   ├── dto/
│   │   ├── create-payment.input.ts
│   │   └── yookassa-webhook.dto.ts
│   ├── models/
│   │   ├── payment.model.ts
│   │   └── payment-status.model.ts
│   ├── clients/
│   │   └── yookassa.client.ts
│   ├── controllers/
│   │   └── yookassa-webhook.controller.ts
│   ├── payments.service.ts
│   ├── payments.resolver.ts
│   └── payments.module.ts
```

#### 2.2. DTOs (Input Types)

**CreateSubscriptionInput:**
```typescript
@InputType()
export class CreateSubscriptionInput {
  @Field()
  teamId: string;

  @Field(() => SubscriptionPlan)
  plan: SubscriptionPlan;

  @Field({ nullable: true })
  useEarlyBird?: boolean;
}
```

**ChangePlanInput:**
```typescript
@InputType()
export class ChangePlanInput {
  @Field()
  subscriptionId: string;

  @Field(() => SubscriptionPlan)
  newPlan: SubscriptionPlan;

  @Field({ defaultValue: false })
  immediate: boolean; // true = сразу, false = с начала след. периода
}
```

#### 2.3. GraphQL Models

**Subscription Model:**
```typescript
@ObjectType()
export class Subscription {
  @Field(() => ID)
  id: string;

  @Field()
  teamId: string;

  @Field(() => SubscriptionPlan)
  plan: SubscriptionPlan;

  @Field(() => SubscriptionStatus)
  status: SubscriptionStatus;

  @Field()
  currentPeriodStart: Date;

  @Field()
  currentPeriodEnd: Date;

  @Field({ nullable: true })
  trialEndsAt?: Date;

  @Field({ nullable: true })
  yookassaSubscriptionId?: string;

  @Field()
  cancelAtPeriodEnd: boolean;

  @Field({ nullable: true })
  cancelledAt?: Date;

  @Field()
  isEarlyBird: boolean;

  @Field(() => PlanLimits)
  limits: PlanLimits; // Computed field

  @Field(() => Team)
  team: Team;

  @Field(() => [Payment])
  payments: Payment[];

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

@ObjectType()
export class PlanLimits {
  @Field()
  name: string;

  @Field()
  price: number;

  @Field({ nullable: true })
  maxActiveProjects?: number; // null = unlimited

  @Field()
  maxMembers: number;

  @Field()
  storageGB: number;

  @Field(() => [String])
  features: string[];
}
```

**Payment Model:**
```typescript
@ObjectType()
export class Payment {
  @Field(() => ID)
  id: string;

  @Field()
  subscriptionId: string;

  @Field()
  teamId: string;

  @Field()
  amount: number;

  @Field()
  currency: string;

  @Field(() => PaymentStatus)
  status: PaymentStatus;

  @Field()
  yookassaPaymentId: string;

  @Field({ nullable: true })
  paymentMethod?: string;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  failureReason?: string;

  @Field({ nullable: true })
  paidAt?: Date;

  @Field(() => Subscription)
  subscription: Subscription;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
```

#### 2.4. SubscriptionsService

```typescript
@Injectable()
export class SubscriptionsService {
  constructor(
    private prisma: PrismaService,
    private paymentsService: PaymentsService,
  ) {}

  /**
   * Создать подписку с trial периодом
   */
  async createSubscription(input: CreateSubscriptionInput, userId: string) {
    // 1. Validate: user is team owner
    const team = await this.prisma.team.findUnique({
      where: { id: input.teamId },
      include: { owner: true },
    });

    if (!team || team.ownerId !== userId) {
      throw new ForbiddenException('Only team owner can create subscription');
    }

    // 2. Check if subscription already exists
    const existing = await this.prisma.subscription.findUnique({
      where: { teamId: input.teamId },
    });

    if (existing) {
      throw new BadRequestException('Subscription already exists');
    }

    // 3. Calculate trial end date
    const now = new Date();
    const trialEndsAt = addDays(now, TRIAL_DURATION_DAYS);
    const currentPeriodEnd = trialEndsAt;

    // 4. Create subscription
    const subscription = await this.prisma.subscription.create({
      data: {
        teamId: input.teamId,
        plan: input.plan,
        status: SubscriptionStatus.TRIALING,
        currentPeriodStart: now,
        currentPeriodEnd,
        trialEndsAt,
        isEarlyBird: input.useEarlyBird || false,
      },
      include: { team: true, payments: true },
    });

    return subscription;
  }

  /**
   * Изменить план подписки
   */
  async changePlan(input: ChangePlanInput, userId: string) {
    const subscription = await this.findByIdWithAuth(input.subscriptionId, userId);

    // Validate plan change
    if (subscription.plan === input.newPlan) {
      throw new BadRequestException('Already on this plan');
    }

    const isUpgrade = this.isUpgrade(subscription.plan, input.newPlan);

    if (input.immediate) {
      // Immediate change: prorate and charge
      return this.changeImmediately(subscription, input.newPlan, isUpgrade);
    } else {
      // Schedule change for next billing cycle
      return this.scheduleChange(subscription, input.newPlan);
    }
  }

  /**
   * Отменить подписку (cancel at period end)
   */
  async cancelSubscription(subscriptionId: string, userId: string) {
    const subscription = await this.findByIdWithAuth(subscriptionId, userId);

    if (subscription.status === SubscriptionStatus.CANCELLED) {
      throw new BadRequestException('Subscription already cancelled');
    }

    // Mark for cancellation at period end
    return this.prisma.subscription.update({
      where: { id: subscriptionId },
      data: {
        cancelAtPeriodEnd: true,
        cancelledAt: new Date(),
      },
    });
  }

  /**
   * Проверить лимит активных проектов
   */
  async checkProjectLimit(teamId: string): Promise<boolean> {
    const subscription = await this.prisma.subscription.findUnique({
      where: { teamId },
    });

    if (!subscription || subscription.status !== SubscriptionStatus.ACTIVE) {
      // Trial or no subscription - use default limits
      const limits = PLAN_LIMITS[subscription?.plan || 'LITE'];
      const activeCount = await this.prisma.project.count({
        where: {
          teamId,
          status: ProjectStatus.ACTIVE,
        },
      });

      return activeCount < limits.maxActiveProjects;
    }

    const limits = PLAN_LIMITS[subscription.plan];

    if (!limits.maxActiveProjects) {
      return true; // Unlimited
    }

    const activeCount = await this.prisma.project.count({
      where: {
        teamId,
        status: ProjectStatus.ACTIVE,
      },
    });

    return activeCount < limits.maxActiveProjects;
  }

  /**
   * Проверить лимит участников команды
   */
  async checkMemberLimit(teamId: string): Promise<boolean> {
    const subscription = await this.prisma.subscription.findUnique({
      where: { teamId },
    });

    const limits = PLAN_LIMITS[subscription?.plan || 'LITE'];
    const memberCount = await this.prisma.teamMember.count({
      where: { teamId },
    });

    return memberCount < limits.maxMembers;
  }

  /**
   * Обработать webhook от ЮKassa
   */
  async handlePaymentSucceeded(yookassaPaymentId: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { yookassaPaymentId },
      include: { subscription: true },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    // Update payment status
    await this.prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: PaymentStatus.SUCCEEDED,
        paidAt: new Date(),
      },
    });

    // Update subscription status
    const subscription = payment.subscription;
    const nextPeriodEnd = addDays(subscription.currentPeriodEnd, BILLING_CYCLE_DAYS);

    await this.prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        status: SubscriptionStatus.ACTIVE,
        currentPeriodStart: subscription.currentPeriodEnd,
        currentPeriodEnd: nextPeriodEnd,
      },
    });
  }

  /**
   * Обработать неудачный платёж
   */
  async handlePaymentFailed(yookassaPaymentId: string, reason: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { yookassaPaymentId },
      include: { subscription: true },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    // Update payment status
    await this.prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: PaymentStatus.FAILED,
        failureReason: reason,
      },
    });

    // Mark subscription as PAST_DUE
    await this.prisma.subscription.update({
      where: { id: payment.subscriptionId },
      data: {
        status: SubscriptionStatus.PAST_DUE,
      },
    });

    // TODO: Send email notification to user
    // TODO: Retry payment after 3 days
  }

  // ... helper methods
}
```

#### 2.5. SubscriptionsResolver

**GraphQL Operations: 6 queries + 5 mutations**

```typescript
@Resolver(() => Subscription)
export class SubscriptionsResolver {
  constructor(private subscriptionsService: SubscriptionsService) {}

  // ============ QUERIES ============

  @Query(() => Subscription, { nullable: true })
  @UseGuards(AuthGuard)
  async mySubscription(@CurrentUser() user: User): Promise<Subscription | null> {
    return this.subscriptionsService.findByUserId(user.id);
  }

  @Query(() => Subscription)
  @UseGuards(AuthGuard)
  async subscription(
    @Args('id') id: string,
    @CurrentUser() user: User,
  ): Promise<Subscription> {
    return this.subscriptionsService.findByIdWithAuth(id, user.id);
  }

  @Query(() => [PlanOption])
  async availablePlans(): Promise<PlanOption[]> {
    // Public endpoint - returns plan options
    return Object.entries(PLAN_LIMITS).map(([key, limits]) => ({
      plan: key as SubscriptionPlan,
      ...limits,
    }));
  }

  @Query(() => PlanLimits)
  @UseGuards(AuthGuard)
  async currentPlanLimits(
    @Args('teamId') teamId: string,
    @CurrentUser() user: User,
  ): Promise<PlanLimits> {
    return this.subscriptionsService.getCurrentLimits(teamId, user.id);
  }

  @Query(() => UsageStats)
  @UseGuards(AuthGuard)
  async usageStats(
    @Args('teamId') teamId: string,
    @CurrentUser() user: User,
  ): Promise<UsageStats> {
    return this.subscriptionsService.getUsageStats(teamId, user.id);
  }

  @Query(() => Boolean)
  @UseGuards(AuthGuard)
  async canAddProject(
    @Args('teamId') teamId: string,
    @CurrentUser() user: User,
  ): Promise<boolean> {
    return this.subscriptionsService.checkProjectLimit(teamId);
  }

  // ============ MUTATIONS ============

  @Mutation(() => Subscription)
  @UseGuards(AuthGuard)
  async createSubscription(
    @Args('input') input: CreateSubscriptionInput,
    @CurrentUser() user: User,
  ): Promise<Subscription> {
    return this.subscriptionsService.createSubscription(input, user.id);
  }

  @Mutation(() => PaymentUrl)
  @UseGuards(AuthGuard)
  async initializePayment(
    @Args('subscriptionId') subscriptionId: string,
    @CurrentUser() user: User,
  ): Promise<PaymentUrl> {
    return this.subscriptionsService.initializePayment(subscriptionId, user.id);
  }

  @Mutation(() => Subscription)
  @UseGuards(AuthGuard)
  async changePlan(
    @Args('input') input: ChangePlanInput,
    @CurrentUser() user: User,
  ): Promise<Subscription> {
    return this.subscriptionsService.changePlan(input, user.id);
  }

  @Mutation(() => Subscription)
  @UseGuards(AuthGuard)
  async cancelSubscription(
    @Args('subscriptionId') subscriptionId: string,
    @CurrentUser() user: User,
  ): Promise<Subscription> {
    return this.subscriptionsService.cancelSubscription(subscriptionId, user.id);
  }

  @Mutation(() => Subscription)
  @UseGuards(AuthGuard)
  async reactivateSubscription(
    @Args('subscriptionId') subscriptionId: string,
    @CurrentUser() user: User,
  ): Promise<Subscription> {
    return this.subscriptionsService.reactivateSubscription(subscriptionId, user.id);
  }
}
```

#### 2.6. YooKassa Client

```typescript
// apps/api/src/modules/payments/clients/yookassa.client.ts

import { YooCheckout } from '@a2seven/yoo-checkout';

@Injectable()
export class YooKassaClient {
  private client: YooCheckout;

  constructor(private configService: ConfigService) {
    this.client = new YooCheckout({
      shopId: configService.get('YOOKASSA_SHOP_ID'),
      secretKey: configService.get('YOOKASSA_SECRET_KEY'),
    });
  }

  async createPayment(params: {
    amount: number;
    currency: string;
    description: string;
    returnUrl: string;
    metadata: Record<string, any>;
  }) {
    const payment = await this.client.createPayment({
      amount: {
        value: params.amount.toFixed(2),
        currency: params.currency,
      },
      confirmation: {
        type: 'redirect',
        return_url: params.returnUrl,
      },
      capture: true,
      description: params.description,
      metadata: params.metadata,
      save_payment_method: true, // Save for recurring
    });

    return payment;
  }

  async getPayment(paymentId: string) {
    return this.client.getPayment(paymentId);
  }

  async capturePayment(paymentId: string) {
    return this.client.capturePayment(paymentId);
  }

  async cancelPayment(paymentId: string) {
    return this.client.cancelPayment(paymentId);
  }

  async createRefund(paymentId: string, amount: number) {
    return this.client.createRefund({
      payment_id: paymentId,
      amount: {
        value: amount.toFixed(2),
        currency: 'RUB',
      },
    });
  }
}
```

#### 2.7. Webhook Controller

```typescript
// apps/api/src/modules/payments/controllers/yookassa-webhook.controller.ts

@Controller('webhooks/yookassa')
export class YooKassaWebhookController {
  constructor(
    private subscriptionsService: SubscriptionsService,
    private paymentsService: PaymentsService,
  ) {}

  @Post()
  async handleWebhook(@Body() webhook: YooKassaWebhookDto, @Req() req: Request) {
    // Verify webhook signature
    const isValid = this.verifySignature(req);
    if (!isValid) {
      throw new UnauthorizedException('Invalid webhook signature');
    }

    const { event, object } = webhook;

    switch (event) {
      case 'payment.succeeded':
        await this.subscriptionsService.handlePaymentSucceeded(object.id);
        break;

      case 'payment.canceled':
        await this.subscriptionsService.handlePaymentCanceled(object.id);
        break;

      case 'payment.waiting_for_capture':
        // Auto-capture enabled, so this shouldn't happen
        break;

      case 'refund.succeeded':
        await this.paymentsService.handleRefundSucceeded(object.id);
        break;

      default:
        console.log('Unhandled webhook event:', event);
    }

    return { success: true };
  }

  private verifySignature(req: Request): boolean {
    // TODO: Implement signature verification
    // https://yookassa.ru/developers/using-api/webhooks#verify
    return true;
  }
}
```

#### 2.8. Guards для проверки лимитов

**CheckProjectLimitGuard:**
```typescript
@Injectable()
export class CheckProjectLimitGuard implements CanActivate {
  constructor(private subscriptionsService: SubscriptionsService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const ctx = GqlExecutionContext.create(context);
    const { teamId } = ctx.getArgs().input;

    const canAdd = await this.subscriptionsService.checkProjectLimit(teamId);

    if (!canAdd) {
      throw new ForbiddenException(
        'Project limit reached. Upgrade your plan to add more projects.',
      );
    }

    return true;
  }
}
```

**Применение Guard:**
```typescript
@Mutation(() => Project)
@UseGuards(AuthGuard, CheckProjectLimitGuard)
async createProject(@Args('input') input: CreateProjectInput) {
  return this.projectsService.create(input);
}
```

---

### 3. FRONTEND IMPLEMENTATION

#### 3.1. Validation Schemas (Zod)

```typescript
// apps/web/src/packages/schemas/subscriptions/index.ts

import { z } from 'zod';

export const subscriptionPlanSchema = z.enum(['LITE', 'FOREMAN', 'BRIGADE']);

export const createSubscriptionSchema = z.object({
  teamId: z.string().uuid(),
  plan: subscriptionPlanSchema,
  useEarlyBird: z.boolean().optional(),
});

export const changePlanSchema = z.object({
  subscriptionId: z.string().uuid(),
  newPlan: subscriptionPlanSchema,
  immediate: z.boolean().default(false),
});

export type CreateSubscriptionInput = z.infer<typeof createSubscriptionSchema>;
export type ChangePlanInput = z.infer<typeof changePlanSchema>;
```

#### 3.2. GraphQL Operations

```graphql
# apps/web/src/packages/api/graphql/subscriptions.graphql

# ============ FRAGMENTS ============

fragment SubscriptionFields on Subscription {
  id
  teamId
  plan
  status
  currentPeriodStart
  currentPeriodEnd
  trialEndsAt
  cancelAtPeriodEnd
  cancelledAt
  isEarlyBird
  limits {
    name
    price
    maxActiveProjects
    maxMembers
    storageGB
    features
  }
  createdAt
  updatedAt
}

fragment PaymentFields on Payment {
  id
  subscriptionId
  amount
  currency
  status
  paymentMethod
  description
  paidAt
  createdAt
}

# ============ QUERIES ============

query MySubscription {
  mySubscription {
    ...SubscriptionFields
    payments {
      ...PaymentFields
    }
  }
}

query AvailablePlans {
  availablePlans {
    plan
    name
    price
    earlyBirdPrice
    maxActiveProjects
    maxMembers
    storageGB
    features
  }
}

query CurrentPlanLimits($teamId: ID!) {
  currentPlanLimits(teamId: $teamId) {
    name
    price
    maxActiveProjects
    maxMembers
    storageGB
    features
  }
}

query UsageStats($teamId: ID!) {
  usageStats(teamId: $teamId) {
    activeProjects
    totalMembers
    storageUsedGB
    limits {
      maxActiveProjects
      maxMembers
      storageGB
    }
  }
}

# ============ MUTATIONS ============

mutation CreateSubscription($input: CreateSubscriptionInput!) {
  createSubscription(input: $input) {
    ...SubscriptionFields
  }
}

mutation InitializePayment($subscriptionId: ID!) {
  initializePayment(subscriptionId: $subscriptionId) {
    url
    paymentId
  }
}

mutation ChangePlan($input: ChangePlanInput!) {
  changePlan(input: $input) {
    ...SubscriptionFields
  }
}

mutation CancelSubscription($subscriptionId: ID!) {
  cancelSubscription(subscriptionId: $subscriptionId) {
    ...SubscriptionFields
  }
}

mutation ReactivateSubscription($subscriptionId: ID!) {
  reactivateSubscription(subscriptionId: $subscriptionId) {
    ...SubscriptionFields
  }
}
```

#### 3.3. UI Components

**1. PlanCard Component**

```typescript
// apps/web/src/packages/components/subscriptions/PlanCard.tsx

interface PlanCardProps {
  plan: {
    name: string;
    price: number;
    earlyBirdPrice?: number;
    maxActiveProjects?: number;
    maxMembers: number;
    storageGB: number;
    features: string[];
  };
  isCurrentPlan?: boolean;
  isPopular?: boolean;
  onSelect: () => void;
}

export function PlanCard({ plan, isCurrentPlan, isPopular, onSelect }: PlanCardProps) {
  const hasDiscount = plan.earlyBirdPrice && plan.earlyBirdPrice < plan.price;
  const displayPrice = hasDiscount ? plan.earlyBirdPrice : plan.price;

  return (
    <Card className={cn(
      'relative p-6 border-2',
      isPopular && 'border-primary shadow-lg scale-105',
      isCurrentPlan && 'border-success'
    )}>
      {isPopular && (
        <Badge className="absolute -top-3 left-1/2 -translate-x-1/2" variant="default">
          Популярный
        </Badge>
      )}

      <div className="space-y-4">
        {/* Header */}
        <div>
          <h3 className="text-2xl font-bold">{plan.name}</h3>
        </div>

        {/* Price */}
        <div className="flex items-baseline gap-2">
          {hasDiscount && (
            <span className="text-lg text-muted-foreground line-through">
              {plan.price}₽
            </span>
          )}
          <span className="text-4xl font-bold">{displayPrice}₽</span>
          <span className="text-muted-foreground">/месяц</span>
        </div>

        {hasDiscount && (
          <Badge variant="success">
            -{Math.round((1 - displayPrice / plan.price) * 100)}% Early Bird
          </Badge>
        )}

        {/* Limits */}
        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <CheckIcon className="w-4 h-4 text-success" />
            <span>
              {plan.maxActiveProjects ? `${plan.maxActiveProjects} активных проекта` : 'Безлимит проектов'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <CheckIcon className="w-4 h-4 text-success" />
            <span>{plan.maxMembers} участников</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckIcon className="w-4 h-4 text-success" />
            <span>{plan.storageGB} GB хранилища</span>
          </div>
        </div>

        <Separator />

        {/* Features */}
        <ul className="space-y-2">
          {plan.features.map((feature, index) => (
            <li key={index} className="flex items-start gap-2 text-sm">
              <CheckIcon className="w-4 h-4 text-primary mt-0.5" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>

        {/* CTA Button */}
        <Button
          className="w-full"
          variant={isPopular ? 'default' : 'outline'}
          disabled={isCurrentPlan}
          onClick={onSelect}
        >
          {isCurrentPlan ? 'Текущий план' : 'Выбрать план'}
        </Button>
      </div>
    </Card>
  );
}
```

**2. SubscriptionStatus Component**

```typescript
// apps/web/src/packages/components/subscriptions/SubscriptionStatus.tsx

interface SubscriptionStatusProps {
  subscription: {
    plan: string;
    status: string;
    currentPeriodEnd: Date;
    trialEndsAt?: Date;
    cancelAtPeriodEnd: boolean;
    limits: {
      name: string;
      maxActiveProjects?: number;
      maxMembers: number;
      storageGB: number;
    };
  };
  usage: {
    activeProjects: number;
    totalMembers: number;
    storageUsedGB: number;
  };
}

export function SubscriptionStatus({ subscription, usage }: SubscriptionStatusProps) {
  const isTrialing = subscription.status === 'TRIALING';
  const isPastDue = subscription.status === 'PAST_DUE';
  const { limits } = subscription;

  return (
    <Card className="p-6 space-y-6">
      {/* Status Badge */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">{limits.name}</h3>
          <p className="text-sm text-muted-foreground">
            {isTrialing
              ? `Trial до ${format(subscription.trialEndsAt!, 'dd MMM yyyy', { locale: ru })}`
              : `Продлится до ${format(subscription.currentPeriodEnd, 'dd MMM yyyy', { locale: ru })}`
            }
          </p>
        </div>

        <Badge variant={
          isTrialing ? 'secondary' :
          isPastDue ? 'destructive' :
          subscription.cancelAtPeriodEnd ? 'warning' :
          'success'
        }>
          {isTrialing ? 'Пробный период' :
           isPastDue ? 'Просрочено' :
           subscription.cancelAtPeriodEnd ? 'Будет отменена' :
           'Активна'}
        </Badge>
      </div>

      {/* Usage Stats */}
      <div className="space-y-4">
        {/* Projects */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm">Активные проекты</span>
            <span className="text-sm font-medium">
              {usage.activeProjects} / {limits.maxActiveProjects || '∞'}
            </span>
          </div>
          <ProgressBar
            value={limits.maxActiveProjects ? (usage.activeProjects / limits.maxActiveProjects) * 100 : 0}
            variant={usage.activeProjects >= (limits.maxActiveProjects || Infinity) ? 'danger' : 'default'}
          />
        </div>

        {/* Members */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm">Участники</span>
            <span className="text-sm font-medium">
              {usage.totalMembers} / {limits.maxMembers}
            </span>
          </div>
          <ProgressBar
            value={(usage.totalMembers / limits.maxMembers) * 100}
            variant={usage.totalMembers >= limits.maxMembers ? 'danger' : 'default'}
          />
        </div>

        {/* Storage */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm">Хранилище</span>
            <span className="text-sm font-medium">
              {usage.storageUsedGB.toFixed(2)} / {limits.storageGB} GB
            </span>
          </div>
          <ProgressBar
            value={(usage.storageUsedGB / limits.storageGB) * 100}
            variant={usage.storageUsedGB >= limits.storageGB ? 'danger' : 'default'}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Button variant="outline" className="flex-1">
          Изменить план
        </Button>
        {!subscription.cancelAtPeriodEnd && (
          <Button variant="ghost" className="text-destructive">
            Отменить подписку
          </Button>
        )}
      </div>
    </Card>
  );
}
```

**3. PaymentHistoryList Component**

```typescript
// apps/web/src/packages/components/subscriptions/PaymentHistoryList.tsx

interface PaymentHistoryListProps {
  payments: Array<{
    id: string;
    amount: number;
    currency: string;
    status: string;
    paymentMethod?: string;
    paidAt?: Date;
    createdAt: Date;
  }>;
}

export function PaymentHistoryList({ payments }: PaymentHistoryListProps) {
  if (payments.length === 0) {
    return (
      <Card className="p-6 text-center text-muted-foreground">
        <p>История платежей пуста</p>
      </Card>
    );
  }

  return (
    <Card>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Дата</TableHead>
            <TableHead>Сумма</TableHead>
            <TableHead>Способ оплаты</TableHead>
            <TableHead>Статус</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {payments.map((payment) => (
            <TableRow key={payment.id}>
              <TableCell>
                {format(payment.paidAt || payment.createdAt, 'dd MMM yyyy HH:mm', { locale: ru })}
              </TableCell>
              <TableCell className="font-medium">
                {payment.amount}₽
              </TableCell>
              <TableCell className="text-muted-foreground">
                {payment.paymentMethod || 'Банковская карта'}
              </TableCell>
              <TableCell>
                <Badge variant={
                  payment.status === 'SUCCEEDED' ? 'success' :
                  payment.status === 'PENDING' ? 'secondary' :
                  'destructive'
                }>
                  {payment.status === 'SUCCEEDED' ? 'Оплачено' :
                   payment.status === 'PENDING' ? 'Ожидает' :
                   payment.status === 'FAILED' ? 'Ошибка' :
                   'Отменено'}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}
```

#### 3.4. Pages Integration

**1. Public Pricing Page**

```typescript
// apps/web/src/app/pricing/page.tsx

export default async function PricingPage() {
  return (
    <div className="container max-w-6xl py-12 space-y-12">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Выберите тариф</h1>
        <p className="text-lg text-muted-foreground">
          14 дней бесплатно. Отмена в любое время.
        </p>
      </div>

      {/* Plans Grid */}
      <div className="grid md:grid-cols-3 gap-6">
        <PlanCard
          plan={LITE_PLAN}
          onSelect={() => router.push('/auth/register?plan=lite')}
        />
        <PlanCard
          plan={FOREMAN_PLAN}
          isPopular
          onSelect={() => router.push('/auth/register?plan=foreman')}
        />
        <PlanCard
          plan={BRIGADE_PLAN}
          onSelect={() => router.push('/auth/register?plan=brigade')}
        />
      </div>

      {/* FAQ */}
      <div className="max-w-3xl mx-auto space-y-4">
        <h2 className="text-2xl font-bold text-center mb-6">Частые вопросы</h2>
        <Accordion type="single" collapsible>
          <AccordionItem value="trial">
            <AccordionTrigger>Что включает пробный период?</AccordionTrigger>
            <AccordionContent>
              14 дней полного доступа ко всем функциям выбранного тарифа без привязки карты.
            </AccordionContent>
          </AccordionItem>
          {/* More FAQ items... */}
        </Accordion>
      </div>
    </div>
  );
}
```

**2. Team Subscription Page**

```typescript
// apps/web/src/app/(root)/(protected)/teams/[teamId]/subscription/page.tsx

export default async function TeamSubscriptionPage({ params }: PageProps) {
  const { teamId } = await params;

  return (
    <div className="container max-w-4xl py-8 space-y-8">
      <h1 className="text-3xl font-bold">Управление подпиской</h1>

      {/* Current Subscription Status */}
      <SubscriptionStatus subscription={subscription} usage={usage} />

      {/* Payment History */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">История платежей</h2>
        <PaymentHistoryList payments={payments} />
      </div>
    </div>
  );
}
```

---

## Пошаговая реализация

### Phase 1: Backend Foundation (Days 1-3)

**День 1: Database Schema & Models**
- [ ] Обновить Prisma schema (Subscription, Payment models)
- [ ] Добавить enums (SubscriptionPlan, SubscriptionStatus, PaymentStatus)
- [ ] Обновить Team model (subscription relation)
- [ ] Создать миграцию `add_subscriptions_and_payments`
- [ ] Выполнить `prisma db push` и `prisma generate`
- [ ] Создать constants/plans.constants.ts

**День 2: SubscriptionsModule**
- [ ] Создать структуру модуля `apps/api/src/modules/subscriptions/`
- [ ] Реализовать DTOs (4 input types)
- [ ] Реализовать GraphQL Models (Subscription, PlanLimits)
- [ ] Реализовать SubscriptionsService (10 методов)
- [ ] Реализовать SubscriptionsResolver (6 queries + 5 mutations)
- [ ] Добавить в app.module.ts

**День 3: Guards для лимитов**
- [ ] Создать CheckProjectLimitGuard
- [ ] Создать CheckMemberLimitGuard
- [ ] Создать CheckStorageLimitGuard
- [ ] Применить guards к ProjectsResolver.createProject
- [ ] Применить guards к TeamsResolver mutations
- [ ] Тестирование guards

### Phase 2: YooKassa Integration (Days 4-6)

**День 4: PaymentsModule Setup**
- [ ] Установить @a2seven/yoo-checkout
- [ ] Создать структуру `apps/api/src/modules/payments/`
- [ ] Реализовать YooKassaClient
- [ ] Реализовать DTOs (CreatePayment, YooKassaWebhook)
- [ ] Реализовать GraphQL Models (Payment, PaymentUrl)
- [ ] Реализовать PaymentsService (5 методов)
- [ ] Реализовать PaymentsResolver

**День 5: Payment Flow**
- [ ] Реализовать initializePayment() в SubscriptionsService
- [ ] Интеграция с YooKassaClient.createPayment()
- [ ] Создание Payment record в БД
- [ ] Return URL для redirect
- [ ] Success/Failure страницы
- [ ] Тестирование payment flow

**День 6: Webhook Handler**
- [ ] Создать YooKassaWebhookController
- [ ] Реализовать signature verification
- [ ] Обработка payment.succeeded event
- [ ] Обработка payment.canceled event
- [ ] Обработка refund.succeeded event
- [ ] Error handling и logging
- [ ] Тестирование webhooks (ngrok)

### Phase 3: Subscription Logic (Days 7-8)

**День 7: Trial & Billing Cycle**
- [ ] Реализовать createSubscription (trial logic)
- [ ] Реализовать handleTrialEnding (scheduled job)
- [ ] Реализовать handleBillingCycle (scheduled job)
- [ ] Реализовать retry logic для failed payments
- [ ] Email notifications (trial ending, payment failed)

**День 8: Plan Changes & Cancellation**
- [ ] Реализовать changePlan (immediate vs scheduled)
- [ ] Реализовать proration logic
- [ ] Реализовать cancelSubscription
- [ ] Реализовать reactivateSubscription
- [ ] Реализовать downgrade logic (at period end)
- [ ] Edge cases testing

### Phase 4: Frontend Implementation (Days 9-11)

**День 9: GraphQL & Schemas**
- [ ] Создать subscriptions.graphql (11 operations)
- [ ] Запустить codegen
- [ ] Создать Zod schemas (2 schemas)
- [ ] Экспортировать в packages/schemas/

**День 10: UI Components**
- [ ] Реализовать PlanCard component
- [ ] Реализовать SubscriptionStatus component
- [ ] Реализовать PaymentHistoryList component
- [ ] Реализовать ChangePlanDialog component
- [ ] Реализовать CancelSubscriptionDialog component
- [ ] Экспортировать в packages/components/subscriptions/

**День 11: Pages**
- [ ] Создать /pricing страница (публичная)
- [ ] Создать /teams/[teamId]/subscription страница
- [ ] Интеграция PlanCard на pricing
- [ ] Интеграция SubscriptionStatus на subscription page
- [ ] Success/Failure pages для payment redirect
- [ ] Navigation updates (link to subscription)

### Phase 5: Integration & Enforcement (Days 12-13)

**День 12: Plan Limits Enforcement**
- [ ] Блокировка createProject при лимите (UI)
- [ ] Блокировка addMember при лимите (UI)
- [ ] Блокировка uploadPhoto при storage лимите (UI)
- [ ] Upgrade prompt modals
- [ ] Error messages для limits
- [ ] Testing всех лимитов

**День 13: Onboarding Integration**
- [ ] Обновить onboarding flow (выбор плана)
- [ ] Создание subscription при завершении onboarding
- [ ] Trial start после onboarding
- [ ] Register page updates (plan parameter)
- [ ] Dashboard updates (subscription status)

### Phase 6: Testing & Documentation (Day 14)

**День 14: E2E Testing & Docs**
- [ ] E2E test: Register → Trial → Payment → Active
- [ ] E2E test: Plan change (upgrade/downgrade)
- [ ] E2E test: Cancellation flow
- [ ] E2E test: Limit enforcement
- [ ] E2E test: Webhook processing
- [ ] TypeScript compilation (0 errors)
- [ ] Update CHANGELOG.md
- [ ] Update roadmap.md
- [ ] Update API documentation

---

## Критические файлы

### Backend (45 new + 5 modifications)

**New Files (45):**
- apps/api/prisma/schema.prisma (Subscription, Payment models)
- apps/api/src/modules/subscriptions/ (15 файлов)
  - dto/create-subscription.input.ts
  - dto/update-subscription.input.ts
  - dto/change-plan.input.ts
  - dto/cancel-subscription.input.ts
  - models/subscription.model.ts
  - models/plan-limits.model.ts
  - models/subscription-status.model.ts
  - guards/check-project-limit.guard.ts
  - guards/check-member-limit.guard.ts
  - guards/check-storage-limit.guard.ts
  - constants/plans.constants.ts
  - subscriptions.service.ts
  - subscriptions.resolver.ts
  - subscriptions.module.ts
  - subscriptions.service.spec.ts
- apps/api/src/modules/payments/ (15 файлов)
  - dto/create-payment.input.ts
  - dto/yookassa-webhook.dto.ts
  - models/payment.model.ts
  - models/payment-status.model.ts
  - models/payment-url.model.ts
  - clients/yookassa.client.ts
  - controllers/yookassa-webhook.controller.ts
  - payments.service.ts
  - payments.resolver.ts
  - payments.module.ts
  - payments.service.spec.ts
- apps/api/src/shared/guards/ (3 файла)
  - subscription-required.guard.ts
  - plan-feature.guard.ts

**Modifications (5):**
- apps/api/src/app.module.ts (import SubscriptionsModule, PaymentsModule)
- apps/api/src/modules/projects/projects.resolver.ts (add CheckProjectLimitGuard)
- apps/api/src/modules/teams/teams.resolver.ts (add CheckMemberLimitGuard)
- apps/api/.env (add YOOKASSA_SHOP_ID, YOOKASSA_SECRET_KEY)
- package.json (add @a2seven/yoo-checkout)

### Frontend (20 new + 8 modifications)

**New Files (20):**
- apps/web/src/packages/api/graphql/subscriptions.graphql
- apps/web/src/packages/schemas/subscriptions/ (2 файла)
  - index.ts
  - subscription.schema.ts
- apps/web/src/packages/components/subscriptions/ (8 файлов)
  - PlanCard.tsx
  - SubscriptionStatus.tsx
  - PaymentHistoryList.tsx
  - ChangePlanDialog.tsx
  - CancelSubscriptionDialog.tsx
  - UpgradePrompt.tsx
  - UsageBar.tsx
  - index.ts
- apps/web/src/app/pricing/ (2 файла)
  - page.tsx
  - layout.tsx
- apps/web/src/app/(root)/(protected)/teams/[teamId]/subscription/ (2 файла)
  - page.tsx
  - loading.tsx
- apps/web/src/app/payment/ (3 файла)
  - success/page.tsx
  - failure/page.tsx
  - layout.tsx

**Modifications (8):**
- apps/web/src/packages/components/index.ts (export subscriptions components)
- apps/web/src/packages/schemas/index.ts (export subscription schemas)
- apps/web/src/app/(root)/(protected)/teams/[teamId]/page.tsx (add subscription link)
- apps/web/src/app/(root)/(protected)/dashboard/page.tsx (add subscription status)
- apps/web/src/app/(root)/(protected)/teams/[teamId]/projects/new/page.tsx (add limit check)
- apps/web/src/app/auth/register/page.tsx (add plan parameter handling)
- apps/web/src/app/onboarding/step-3/page.tsx (add subscription creation)
- apps/web/src/packages/api/graphql/__generated__/output.ts (codegen)

---

## Success Criteria

### Must Have (MVP)
- [ ] Subscription model создана в БД
- [ ] Payment model создана в БД
- [ ] 3 тарифных плана настроены (LITE, FOREMAN, BRIGADE)
- [ ] Trial период 14 дней работает
- [ ] YooKassa интеграция подключена
- [ ] Payment flow: выбор плана → redirect → оплата → success
- [ ] Webhook handler обрабатывает события ЮKassa
- [ ] Рекуррентные платежи настроены
- [ ] Plan limits enforcement работает (projects, members)
- [ ] /pricing страница публичная
- [ ] /teams/[teamId]/subscription страница
- [ ] PlanCard, SubscriptionStatus, PaymentHistoryList компоненты
- [ ] TypeScript: 0 ошибок компиляции
- [ ] GraphQL API протестирован
- [ ] E2E flow протестирован

### Nice to Have (Phase 2)
- [ ] Storage limit enforcement
- [ ] Early Bird автоматическая активация (первые 500)
- [ ] Email notifications (trial ending, payment failed)
- [ ] Retry logic для failed payments (3 попытки)
- [ ] Proration при immediate plan change
- [ ] Refund API
- [ ] Annual billing option (скидка 20%)
- [ ] Coupon codes support
- [ ] Invoice generation (PDF)
- [ ] Admin panel для управления подписками

---

## Risks & Mitigation

### 🔴 Высокий риск: ЮKassa Webhook Failures

**Проблема:** Webhook может не дойти из-за network issues
**Митигация:**
- Idempotency key для webhook events
- Manual retry button в админке
- Polling fallback (check payment status каждые 5 мин)
- Alert monitoring для missed webhooks

### 🟡 Средний риск: Plan Change Edge Cases

**Проблема:** Сложная логика upgrade/downgrade, proration
**Митигация:**
- Detailed unit tests для всех сценариев
- Manual testing всех edge cases
- Phase 1: Только change at period end (no immediate)
- Phase 2: Добавить immediate с proration

### 🟡 Средний риск: Failed Recurring Payments

**Проблема:** Карта expired, недостаточно средств
**Митигация:**
- 3 retry attempts (день 1, 3, 7)
- Email notifications перед блокировкой
- Grace period 7 дней (read-only mode)
- Easy reactivation flow

### 🟢 Низкий риск: Early Bird Limit Tracking

**Проблема:** Нужно отслеживать первые 500 команд
**Митигация:**
- Simple counter в Redis
- Atomic increment при создании subscription
- Admin override в случае ошибки

---

## Технический долг

**Отложено на Phase 2:**
- [ ] Annual billing (скидка 20%)
- [ ] Coupon codes system
- [ ] Affiliate program
- [ ] Invoice PDF generation
- [ ] Tax handling (НДС)
- [ ] Multi-currency support
- [ ] Mobile app payments (In-App Purchase)
- [ ] Telegram-based payments
- [ ] Cryptocurrency payments

---

## Dependencies

**Backend:**
- ✅ @a2seven/yoo-checkout (YooKassa SDK)
- ✅ date-fns (date calculations)
- 🆕 @nestjs/schedule (для cron jobs)
- 🆕 node-cron (alternative)

**Frontend:**
- ✅ Existing dependencies sufficient
- ✅ react-hook-form, zod
- ✅ @apollo/client

---

## Environment Variables

```env
# .env
YOOKASSA_SHOP_ID=your_shop_id
YOOKASSA_SECRET_KEY=your_secret_key
YOOKASSA_WEBHOOK_SECRET=your_webhook_secret

# Optional
YOOKASSA_TEST_MODE=true # for development
EARLY_BIRD_LIMIT=500
```

---

## Документация

**Будет создано:**
- [ ] docs/analisys/stage-8-monetization-plan.md (этот файл)
- [ ] docs/api/subscriptions.md (GraphQL API docs)
- [ ] docs/integration/yookassa.md (ЮKassa integration guide)

**Будет обновлено:**
- [ ] docs/roadmap.md (mark Stage 8 complete)
- [ ] CHANGELOG.md (Stage 8 section)
- [ ] README.md (subscription info)

---

**Plan Created:** 2025-12-11
**Planned Start:** После завершения Stage 6
**Estimated Duration:** 14 дней (80-100 часов)
**Priority:** 🔴🔴🔴 Критический (блокирует запуск)
**Status:** 📋 Planning

---

_Детальный план готов к выполнению. Ожидает подтверждения и завершения Stage 6 для начала реализации._
