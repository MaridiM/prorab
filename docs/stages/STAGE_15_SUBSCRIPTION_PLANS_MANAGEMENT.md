# Stage 15: Subscription Plans & Payment Providers Management

**Дата начала:** 2025-12-19
**Статус:** 🔄 В РАБОТЕ
**Версия:** 0.8.0
**Приоритет:** P1 (Критично для масштабирования)

---

## 📋 ОБЗОР

Полная реализация системы управления тарифными планами и платежными провайдерами с **динамическим хранением в БД**, **мультивалютностью** и **multi-provider архитектурой** для платежей.

### Бизнес-требования:
> Админ должен иметь возможность создавать, редактировать и удалять тарифные планы через UI без изменения кода.
> Система должна поддерживать несколько платежных провайдеров (Yookassa, Stripe) с возможностью переключения.
> Пользователи должны видеть цены в разных валютах (RUB, USD, EUR).

### Цели Stage 15:
1. ✅ Перенести тарифные планы из кода в БД
2. ✅ Создать CRUD для планов через Admin Panel
3. ✅ Реализовать мультивалютность (RUB, USD, EUR)
4. ✅ Создать multi-provider архитектуру для платежей
5. ✅ Интегрировать Stripe payment provider
6. ✅ Мигрировать Yookassa токены из .env в SystemSettings
7. ✅ Обновить pricing page для динамического отображения планов

---

## 🎯 SCOPE & DELIVERABLES

### Backend (NestJS + GraphQL):
- ✅ Новые Prisma модели: `SubscriptionPlan`, `PlanPrice`, `PlanFeature`, `PaymentProvider`
- ✅ AdminPlansService с полным CRUD
- ✅ AdminPlansResolver (5 queries/mutations)
- ✅ AdminPaymentProvidersService
- ✅ AdminPaymentProvidersResolver (3 queries/mutations)
- ✅ Payment Provider Factory (multi-provider pattern)
- ✅ YookassaProvider (рефакторинг)
- ✅ StripeProvider (новый)

### Frontend (Next.js + React):
- ✅ Admin Plans Management Page (`/admin/plans`)
- ✅ Plan Form Dialog (создание/редактирование планов)
- ✅ Payment Providers Page (`/admin/payment-providers`)
- ✅ Provider Config Dialog
- ✅ Обновленная Pricing Page с currency selector
- ✅ Динамический PlanCard component

### Database:
- ✅ 4 новые таблицы: `subscription_plans`, `plan_prices`, `plan_features`, `payment_providers`
- ✅ Обновление модели `Subscription` (plan enum → planId foreignKey)
- ✅ Обновление модели `Payment` (добавление providerType)
- ✅ Data migration для существующих подписок
- ✅ Migration Yookassa tokens → SystemSettings

### GraphQL Schema:
- ✅ SubscriptionPlan, PlanPrice, PlanFeature types
- ✅ PaymentProvider type
- ✅ Admin CRUD operations для планов
- ✅ Provider configuration operations

---

## 📊 TECHNICAL ARCHITECTURE

### 1. Database Schema (Prisma)

#### Новые модели:

```prisma
// Тарифный план (хранится в БД)
model SubscriptionPlan {
  id          String   @id @default(uuid())
  slug        String   @unique  // "lite", "foreman", "brigade"
  name        String             // "Лайт", "Прораб", "Бригада"
  description String?  @db.Text

  // Лимиты
  maxActiveProjects Int?         // null = unlimited
  maxMembers        Int
  storageGB         Float

  // Метаданные
  isActive      Boolean  @default(true)
  isPopular     Boolean  @default(false)
  sortOrder     Int      @default(0)
  isEarlyBird   Boolean  @default(false)

  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  prices        PlanPrice[]
  features      PlanFeature[]
  subscriptions Subscription[]

  @@index([slug])
  @@index([isActive])
  @@map("subscription_plans")
}

// Цены плана в разных валютах
model PlanPrice {
  id       String @id @default(uuid())
  planId   String @map("plan_id")
  currency String @db.VarChar(3)  // "RUB", "USD", "EUR"

  price          Decimal @db.Decimal(10, 2)
  earlyBirdPrice Decimal @db.Decimal(10, 2) @map("early_bird_price")

  billingCycleDays Int @default(30) @map("billing_cycle_days")  // 30, 365

  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  plan SubscriptionPlan @relation(fields: [planId], references: [id], onDelete: Cascade)

  @@unique([planId, currency, billingCycleDays])
  @@index([planId])
  @@map("plan_prices")
}

// Фичи плана
model PlanFeature {
  id          String  @id @default(uuid())
  planId      String  @map("plan_id")
  name        String              // "Базовый функционал"
  description String? @db.Text    // Детальное описание
  isIncluded  Boolean @default(true) @map("is_included")
  sortOrder   Int     @default(0) @map("sort_order")

  plan SubscriptionPlan @relation(fields: [planId], references: [id], onDelete: Cascade)

  @@index([planId])
  @@map("plan_features")
}

// Платежные провайдеры
model PaymentProvider {
  id           String              @id @default(uuid())
  type         PaymentProviderType @unique
  name         String                      // "Yookassa", "Stripe"
  isActive     Boolean             @default(false) @map("is_active")
  isPrimary    Boolean             @default(false) @map("is_primary")

  // Конфигурация (зашифрована через SystemSettings)
  // Используем ключи вида: payment.yookassa.shop_id

  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  @@map("payment_providers")
}

enum PaymentProviderType {
  YOOKASSA
  STRIPE
}
```

#### Обновления существующих моделей:

```prisma
model Subscription {
  // БЫЛО: plan SubscriptionPlan
  // СТАЛО: planId String (foreignKey)
  planId String @map("plan_id")

  // Добавлено:
  currency String @default("RUB") @db.VarChar(3)

  // Связь:
  planRef SubscriptionPlan @relation(fields: [planId], references: [id])

  @@index([planId])
}

model Payment {
  // Добавлено:
  providerType PaymentProviderType @default(YOOKASSA) @map("provider_type")
  providerPaymentId String @unique @map("provider_payment_id")

  // yookassaPaymentId -> deprecated (оставлено для обратной совместимости)
}
```

---

### 2. Multi-Provider Architecture

#### Interface: IPaymentProvider

**Файл:** `apps/api/src/core/payments/interfaces/payment-provider.interface.ts`

```typescript
export interface IPaymentProvider {
  // Создание платежа
  createPayment(params: CreatePaymentParams): Promise<PaymentResult>;

  // Получение статуса платежа
  getPayment(paymentId: string): Promise<PaymentDetails>;

  // Отмена платежа
  cancelPayment(paymentId: string): Promise<void>;

  // Возврат средств
  refundPayment(paymentId: string, amount: number): Promise<RefundResult>;

  // Создание подписки (для рекуррентных платежей)
  createSubscription?(params: CreateSubscriptionParams): Promise<SubscriptionResult>;

  // Проверка webhook подписи
  verifyWebhookSignature(body: string, signature: string): boolean;

  // Тест подключения
  testConnection(): Promise<boolean>;
}

export interface CreatePaymentParams {
  amount: number;
  currency: string;
  description: string;
  returnUrl: string;
  metadata: {
    subscriptionId: string;
    teamId: string;
  };
}
```

#### Factory: PaymentProviderFactory

**Файл:** `apps/api/src/core/payments/factories/payment-provider.factory.ts`

Аналогично `StorageProviderFactory`, выбор провайдера:
1. Если type указан явно → вернуть его
2. Получить активный primary provider из БД
3. Fallback на YOOKASSA (обратная совместимость)

Кэширование провайдеров в Map для производительности.

#### Providers:

1. **YookassaProvider** (рефакторинг)
   - **Файл:** `apps/api/src/core/payments/providers/yookassa.provider.ts`
   - Приоритет конфигурации: SystemSettings > .env
   - Backward compatibility с .env токенами

2. **StripeProvider** (новый)
   - **Файл:** `apps/api/src/core/payments/providers/stripe.provider.ts`
   - Использует Stripe Checkout Sessions API
   - Поддержка webhook verification

---

### 3. Backend Services

#### AdminPlansService

**Файл:** `apps/api/src/modules/admin/services/admin-plans.service.ts`

**Методы:**
- `findAll(filters?)` - получить все планы с фильтрацией
- `findOne(id)` - получить план по ID
- `create(input, adminId)` - создать план с ценами и фичами
- `update(id, input, adminId)` - обновить план (транзакция)
- `archive(id, adminId)` - архивировать план (isActive = false)
- `activate(id, adminId)` - активировать план
- `delete(id, adminId)` - удалить план (только если нет активных подписок)

**Особенности:**
- Cascade delete для цен и фич при удалении плана
- Проверка на наличие активных подписок перед удалением
- Audit logging всех операций
- Транзакции для update операций

#### AdminPaymentProvidersService

**Файл:** `apps/api/src/modules/admin/services/admin-payment-providers.service.ts`

**Методы:**
- `findAll()` - получить все провайдеры
- `findOne(type)` - получить провайдер по типу
- `updateProvider(type, input, adminId)` - обновить настройки провайдера
- `testProvider(type)` - тестирование подключения к провайдеру
- `getWebhookUrl(type)` - получить webhook URL для провайдера

**Особенности:**
- Автоматическое снятие isPrimary с других провайдеров
- Сохранение конфигурации в SystemSettings с шифрованием
- Test connection через PaymentProviderFactory

---

### 4. GraphQL API

#### Queries:

```graphql
# Планы (Admin)
adminPlans(isActive: Boolean): [SubscriptionPlan!]!
adminPlan(id: ID!): SubscriptionPlan

# Провайдеры (Admin)
adminPaymentProviders: [PaymentProvider!]!
adminPaymentProvider(type: PaymentProviderType!): PaymentProvider

# Публичные (для пользователей)
availablePlans(currency: String = "RUB"): [SubscriptionPlan!]!
```

#### Mutations:

```graphql
# Plans CRUD
adminCreatePlan(input: AdminCreatePlanInput!): SubscriptionPlan!
adminUpdatePlan(id: ID!, input: AdminUpdatePlanInput!): SubscriptionPlan!
adminArchivePlan(id: ID!): SubscriptionPlan!
adminActivatePlan(id: ID!): SubscriptionPlan!
adminDeletePlan(id: ID!): Boolean!

# Providers
adminUpdateProvider(type: PaymentProviderType!, input: AdminUpdateProviderInput!): PaymentProvider!
adminTestProvider(type: PaymentProviderType!): TestConnectionResult!
```

---

### 5. Frontend Components

#### Admin Plans Page

**Файл:** `apps/web/src/app/(root)/(protected)/admin/plans/page.tsx`

**Функциональность:**
- Таблица со всеми планами (название, цены, лимиты, статус)
- Поиск по названию/slug
- Фильтр по статусу (Active/Archived)
- Кнопки действий: Edit, Archive/Activate, Delete
- Диалог создания плана
- Диалог редактирования плана

#### Plan Form Dialog

**Файл:** `apps/web/src/packages/components/admin/plan-form-dialog.tsx`

**Поля:**
- Basic info: slug, name, description
- Limits: maxActiveProjects, maxMembers, storageGB
- Prices (мультивалютность): RUB, USD, EUR × (price, earlyBirdPrice)
- Features: динамический список с добавлением/удалением
- Meta: isPopular, sortOrder

#### Payment Providers Page

**Файл:** `apps/web/src/app/(root)/(protected)/admin/payment-providers/page.tsx`

**Функциональность:**
- Список провайдеров с карточками
- Toggle: Active/Inactive
- Toggle: Primary (только один может быть primary)
- Кнопка "Configure" → диалог с API ключами
- Кнопка "Test Connection" → проверка подключения
- Webhook URL (readonly, с кнопкой Copy)

#### Provider Config Dialog

**Файл:** `apps/web/src/packages/components/admin/provider-config-dialog.tsx`

**Поля (для Yookassa):**
- Shop ID
- Secret Key (masked input)
- Webhook Secret (masked input)

**Поля (для Stripe):**
- Publishable Key
- Secret Key (masked input)
- Webhook Secret (masked input)

#### Public Pricing Page

**Файл:** `apps/web/src/app/(root)/pricing/page.tsx`

**Обновления:**
- Currency selector (RUB / USD / EUR)
- Динамическая загрузка планов из GraphQL
- Отображение цен в выбранной валюте
- Обновленный PlanCard с мультивалютностью

---

## 🔄 DATA MIGRATION STRATEGY

### Migration 1: Create New Tables

**Файл:** `apps/api/prisma/migrations/XXX_create_subscription_plans/migration.sql`

```sql
-- Create subscription_plans table
CREATE TABLE subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  max_active_projects INT,
  max_members INT NOT NULL,
  storage_gb DECIMAL(10,2) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  is_popular BOOLEAN DEFAULT FALSE,
  sort_order INT DEFAULT 0,
  is_early_bird BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_subscription_plans_slug ON subscription_plans(slug);
CREATE INDEX idx_subscription_plans_is_active ON subscription_plans(is_active);

-- Create plan_prices table
CREATE TABLE plan_prices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID NOT NULL REFERENCES subscription_plans(id) ON DELETE CASCADE,
  currency VARCHAR(3) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  early_bird_price DECIMAL(10,2) NOT NULL,
  billing_cycle_days INT DEFAULT 30,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(plan_id, currency, billing_cycle_days)
);

CREATE INDEX idx_plan_prices_plan_id ON plan_prices(plan_id);

-- Create plan_features table
CREATE TABLE plan_features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID NOT NULL REFERENCES subscription_plans(id) ON DELETE CASCADE,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  is_included BOOLEAN DEFAULT TRUE,
  sort_order INT DEFAULT 0
);

CREATE INDEX idx_plan_features_plan_id ON plan_features(plan_id);

-- Create payment_providers table
CREATE TABLE payment_providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type VARCHAR(20) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  is_active BOOLEAN DEFAULT FALSE,
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Migration 2: Seed Default Plans

**Файл:** `apps/api/prisma/seeds/plans.seed.ts`

```typescript
export async function seedPlans(prisma: PrismaClient) {
  const plans = [
    {
      slug: 'lite',
      name: 'Лайт',
      maxActiveProjects: 1,
      maxMembers: 1,
      storageGB: 0.5,
      sortOrder: 1,
      prices: [
        { currency: 'RUB', price: 490, earlyBirdPrice: 290 },
        { currency: 'USD', price: 5, earlyBirdPrice: 3 },
        { currency: 'EUR', price: 5, earlyBirdPrice: 3 },
      ],
      features: [
        { name: 'Базовый функционал', sortOrder: 1 },
        { name: 'Email поддержка', sortOrder: 2 },
      ],
    },
    {
      slug: 'foreman',
      name: 'Прораб',
      maxActiveProjects: 4,
      maxMembers: 3,
      storageGB: 2,
      isPopular: true,
      sortOrder: 2,
      prices: [
        { currency: 'RUB', price: 990, earlyBirdPrice: 690 },
        { currency: 'USD', price: 10, earlyBirdPrice: 7 },
        { currency: 'EUR', price: 10, earlyBirdPrice: 7 },
      ],
      features: [
        { name: 'Расчёты зарплаты', sortOrder: 1 },
        { name: 'Фотоотчёты', sortOrder: 2 },
        { name: 'Priority support', sortOrder: 3 },
      ],
    },
    {
      slug: 'brigade',
      name: 'Бригада',
      maxActiveProjects: null, // unlimited
      maxMembers: 10,
      storageGB: 10,
      sortOrder: 3,
      prices: [
        { currency: 'RUB', price: 1990, earlyBirdPrice: 1490 },
        { currency: 'USD', price: 20, earlyBirdPrice: 15 },
        { currency: 'EUR', price: 20, earlyBirdPrice: 15 },
      ],
      features: [
        { name: 'Все функции', sortOrder: 1 },
        { name: 'API доступ', sortOrder: 2 },
        { name: 'Dedicated support', sortOrder: 3 },
      ],
    },
  ];

  for (const planData of plans) {
    await prisma.subscriptionPlan.create({
      data: {
        slug: planData.slug,
        name: planData.name,
        maxActiveProjects: planData.maxActiveProjects,
        maxMembers: planData.maxMembers,
        storageGB: planData.storageGB,
        isPopular: planData.isPopular || false,
        sortOrder: planData.sortOrder,
        prices: {
          create: planData.prices,
        },
        features: {
          create: planData.features,
        },
      },
    });
  }

  console.log('✅ Seeded 3 subscription plans with prices and features');
}
```

### Migration 3: Migrate Existing Subscriptions

**Файл:** `apps/api/scripts/migrate-subscriptions-to-planid.ts`

**Стратегия:**
1. Добавить временную колонку `plan_id` в `subscriptions`
2. Получить ID планов по slug из новой таблицы
3. UPDATE subscriptions SET plan_id = ... WHERE plan = 'LITE/FOREMAN/BRIGADE'
4. Создать foreign key constraint
5. После тестирования: DROP COLUMN plan (старый enum)

### Migration 4: Seed Payment Providers

**Файл:** `apps/api/prisma/seeds/payment-providers.seed.ts`

```typescript
export async function seedPaymentProviders(prisma: PrismaClient) {
  await prisma.paymentProvider.createMany({
    data: [
      {
        type: 'YOOKASSA',
        name: 'Yookassa',
        isActive: true,
        isPrimary: true,
      },
      {
        type: 'STRIPE',
        name: 'Stripe',
        isActive: false,
        isPrimary: false,
      },
    ],
  });

  console.log('✅ Seeded 2 payment providers (Yookassa active by default)');
}
```

### Migration 5: Yookassa Tokens to SystemSettings

**Файл:** `apps/api/scripts/migrate-yookassa-to-db.ts`

**Действия:**
1. Считать токены из .env (YOOKASSA_SHOP_ID, YOOKASSA_SECRET_KEY, YOOKASSA_WEBHOOK_SECRET)
2. Создать SystemSettings записи с шифрованием (isEncrypted: true для секретов)
3. Ключи: `payment.yookassa.shop_id`, `payment.yookassa.secret_key`, `payment.yookassa.webhook_secret`
4. Category: PAYMENT

---

## 📝 IMPLEMENTATION CHECKLIST

### Phase 1: Database Schema ⏳
- [ ] Обновить Prisma schema (добавить 4 модели)
- [ ] Создать Prisma migration
- [ ] Выполнить migration на dev БД
- [ ] Создать seed файлы (plans, providers)
- [ ] Выполнить seeds

**Оценка:** 2-3 часа

### Phase 2: Multi-Provider Architecture ⏳
- [ ] Создать IPaymentProvider interface
- [ ] Создать PaymentProviderFactory
- [ ] Рефакторинг YookassaProvider
- [ ] Создать StripeProvider
- [ ] Установить `stripe` пакет
- [ ] Обновить PaymentsService

**Оценка:** 3-4 часа

### Phase 3: Backend Services & GraphQL ⏳
- [ ] Создать AdminPlansService
- [ ] Создать AdminPlansResolver
- [ ] Создать AdminPaymentProvidersService
- [ ] Создать AdminPaymentProvidersResolver
- [ ] Добавить GraphQL models
- [ ] Добавить permissions

**Оценка:** 2-3 часа

### Phase 4: Data Migration ⏳
- [ ] Создать migration script для subscriptions
- [ ] Создать migration script для yookassa tokens
- [ ] Выполнить миграцию на dev БД
- [ ] Тестирование миграции
- [ ] Создать rollback plan

**Оценка:** 1-2 часа

### Phase 5: Frontend - Admin Panel ⏳
- [ ] Создать GraphQL операции (plans, providers)
- [ ] Создать страницу `/admin/plans`
- [ ] Создать PlanFormDialog
- [ ] Создать страницу `/admin/payment-providers`
- [ ] Создать ProviderConfigDialog
- [ ] Обновить admin navigation

**Оценка:** 2-3 часа

### Phase 6: Frontend - Public Pages ⏳
- [ ] Обновить pricing page
- [ ] Добавить currency selector
- [ ] Обновить PlanCard component
- [ ] Обновить subscription page
- [ ] Frontend codegen

**Оценка:** 1-2 часа

### Phase 7: Testing & Documentation ⏳
- [ ] Тестирование CRUD планов
- [ ] Тестирование мультивалютности
- [ ] Тестирование провайдеров
- [ ] Backend build test
- [ ] Frontend build test
- [ ] Обновить CHANGELOG.md
- [ ] Обновить roadmap.md

**Оценка:** 1-2 часа

---

## ⚠️ KNOWN ISSUES & CONSIDERATIONS

### 1. Обратная совместимость
**Проблема:** Старые подписки используют enum `SubscriptionPlan`
**Решение:**
- Сохранить обе колонки временно (`plan` + `plan_id`)
- Migration script для конвертации
- После тестирования удалить старую колонку

### 2. Stripe Webhook Verification
**Проблема:** Требует HTTPS для продакшена
**Решение:**
- ngrok для локальной разработки
- Настроить webhooks только на production environment

### 3. Currency Conversion
**Проблема:** Нет автоматической конвертации валют
**Решение:**
- Админ вручную устанавливает цены в каждой валюте
- В будущем: интеграция с API для курсов валют (опционально)

### 4. Active Subscriptions Protection
**Проблема:** Нельзя удалить план с активными подписками
**Решение:**
- Архивирование вместо удаления (isActive = false)
- Проверка перед delete операцией
- UI предупреждение

### 5. Payment Provider Failover
**Проблема:** Что если primary provider недоступен?
**Решение:**
- TODO для будущего: fallback на secondary provider
- Сейчас: manual switching через admin panel

---

## 🎯 SUCCESS CRITERIA

- ✅ Админ может создавать/редактировать/удалять планы через UI
- ✅ Планы хранятся в БД, не в коде
- ✅ Поддержка 3 валют (RUB, USD, EUR) для каждого плана
- ✅ Yookassa и Stripe интегрированы через multi-provider
- ✅ Yookassa токены в SystemSettings (зашифровано)
- ✅ Лендинг отображает планы из БД динамически
- ✅ Пользователи видят цены в выбранной валюте
- ✅ Админ может переключать активный/primary провайдер
- ✅ Админ может тестировать подключение к провайдеру
- ✅ Все builds успешны (backend + frontend)
- ✅ Миграция существующих подписок прошла успешно
- ✅ Backward compatibility с .env токенами сохранена

---

## 📚 DEPENDENCIES

**Backend:**
- `stripe@^14.0.0` - Stripe SDK для Node.js
- `@a2seven/yoo-checkout@^1.1.4` - Yookassa SDK (уже установлен)

**Frontend:**
- Нет новых зависимостей (используем существующие)

---

## 📈 METRICS & MONITORING

После завершения Stage 15 отслеживать:
- Количество созданных планов через админку
- Распределение пользователей по валютам
- Использование Yookassa vs Stripe провайдеров
- Время отклика multi-provider factory
- Количество failed payments по провайдерам

---

## 🔗 RELATED STAGES

- **Stage 12:** Multi-Provider Storage (аналогичная архитектура)
- **Stage 13:** RBAC System (permissions для admin operations)
- **Stage 14:** Role System Normalization (enum patterns)

---

**Статус:** 🔄 В РАБОТЕ
**Следующий шаг:** Phase 1 - Database Schema
**ETA:** 12-16 часов работы
