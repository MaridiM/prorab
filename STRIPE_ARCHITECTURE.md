# Stripe Architecture - Архитектура Интеграции

## 🏗️ Общая Схема

```
┌─────────────────────────────────────────────────────────────┐
│                    STRIPE DASHBOARD                          │
│                                                              │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐            │
│  │  Product   │  │  Product   │  │  Product   │            │
│  │  LITE      │  │  FOREMAN   │  │  BRIGADE   │            │
│  └────────────┘  └────────────┘  └────────────┘            │
│       │               │               │                      │
│  ┌────▼────┐     ┌────▼────┐     ┌────▼────┐               │
│  │ 6 Prices│     │ 6 Prices│     │ 6 Prices│               │
│  └─────────┘     └─────────┘     └─────────┘               │
│                                                              │
│  Total: 3 Products × 6 Prices = 18 Price IDs                │
└─────────────────────────────────────────────────────────────┘
                          │
                          │ API Calls
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                   PRORAB BACKEND (NestJS)                    │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │         StripeProvider (stripe.provider.ts)          │   │
│  │                                                       │   │
│  │  • createPayment() - создать Checkout Session       │   │
│  │  • getPayment() - получить статус                   │   │
│  │  • cancelPayment() - отменить платёж                │   │
│  │  • refundPayment() - вернуть деньги                 │   │
│  │  • verifyWebhookSignature() - проверить webhook     │   │
│  └──────────────────────────────────────────────────────┘   │
│                          │                                   │
│                          ▼                                   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │      PaymentsService (payments.service.ts)           │   │
│  │                                                       │   │
│  │  • initializePayment() - создать платёж              │   │
│  │  • Auto-select provider by IP (Stripe/Yookassa)     │   │
│  │  • Select Price ID based on:                        │   │
│  │    - Plan (lite/foreman/brigade)                    │   │
│  │    - Currency (RUB/USD/EUR)                         │   │
│  │    - Early bird (yes/no)                            │   │
│  └──────────────────────────────────────────────────────┘   │
│                          │                                   │
│                          ▼                                   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              PostgreSQL Database                      │   │
│  │                                                       │   │
│  │  Plan (3 records)                                    │   │
│  │  ├─ lite                                             │   │
│  │  ├─ foreman                                          │   │
│  │  └─ brigade                                          │   │
│  │                                                       │   │
│  │  PlanPrice (18 records)                              │   │
│  │  ├─ lite × 6 (RUB/USD/EUR × regular/earlybird)      │   │
│  │  ├─ foreman × 6                                      │   │
│  │  └─ brigade × 6                                      │   │
│  │                                                       │   │
│  │  Subscription (user subscriptions)                   │   │
│  │  Payment (payment records)                           │   │
│  │  PaymentProvider (Stripe, Yookassa)                  │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                          │
                          │ GraphQL
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                   PRORAB FRONTEND (Next.js)                  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │    SubscriptionManagement.tsx                         │   │
│  │                                                       │   │
│  │  User clicks "Выбрать план"                          │   │
│  │      │                                                │   │
│  │      ├─► createSubscription(planId)                  │   │
│  │      │                                                │   │
│  │      ├─► initializePayment(subscriptionId)           │   │
│  │      │                                                │   │
│  │      └─► Redirect to Stripe Checkout URL             │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                          │
                          │ Redirect
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                 STRIPE CHECKOUT PAGE                         │
│                                                              │
│  • User enters card details                                 │
│  • User completes payment                                   │
│  • Stripe processes payment                                 │
└─────────────────────────────────────────────────────────────┘
                          │
                          │ Webhook
                          ▼
┌─────────────────────────────────────────────────────────────┐
│              WEBHOOK ENDPOINT (Backend)                      │
│                                                              │
│  POST /webhooks/stripe                                       │
│                                                              │
│  Events:                                                     │
│  • checkout.session.completed → Update subscription         │
│  • payment_intent.succeeded → Mark payment as SUCCESS       │
│  • payment_intent.failed → Mark payment as FAILED           │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔄 Payment Flow

### 1️⃣ User Action: Выбор Плана

```typescript
// Frontend: SubscriptionManagement.tsx
const handleSelectPlan = async (planId: string) => {
  // Step 1: Create subscription
  const result = await createSubscription({
    variables: { input: { teamId, planId } }
  })

  const subscriptionId = result.data.createSubscription.id

  // Step 2: Initialize payment
  const payment = await initializePayment({
    variables: { subscriptionId }
  })

  // Step 3: Redirect to Stripe
  window.location.href = payment.data.initializePayment.confirmationUrl
}
```

### 2️⃣ Backend: Создание Checkout Session

```typescript
// Backend: stripe.provider.ts
async createPayment(params: CreatePaymentParams): Promise<PaymentResult> {
  // Get Price ID from env based on plan/currency/earlybird
  const priceId = this.getPriceId(params.planSlug, params.currency, params.isEarlyBird)

  // Create Stripe Checkout Session
  const session = await this.stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [{
      price: priceId,  // price_...
      quantity: 1,
    }],
    mode: 'subscription',  // Recurring payment
    success_url: params.returnUrl + '?success=true',
    cancel_url: params.returnUrl + '?cancelled=true',
    customer_email: params.customerEmail,
    metadata: {
      subscriptionId: params.metadata.subscriptionId,
      userId: params.metadata.userId,
      teamId: params.metadata.teamId,
    },
  })

  return {
    paymentId: session.id,
    confirmationUrl: session.url,  // Redirect URL
    status: 'pending',
  }
}
```

### 3️⃣ Stripe: Payment Processing

1. User enters card: `4242 4242 4242 4242`
2. Stripe validates card
3. Stripe processes payment
4. Stripe sends webhook to backend

### 4️⃣ Backend: Webhook Processing

```typescript
// Backend: stripe-webhook.controller.ts
@Post('/webhooks/stripe')
async handleWebhook(@Req() req, @Headers('stripe-signature') signature: string) {
  // Verify signature
  const isValid = this.stripeProvider.verifyWebhookSignature(
    req.rawBody,
    signature
  )

  if (!isValid) {
    throw new UnauthorizedException('Invalid webhook signature')
  }

  const event = req.body

  switch (event.type) {
    case 'checkout.session.completed':
      // Update subscription status to ACTIVE
      await this.subscriptionsService.activate(subscriptionId)
      break

    case 'payment_intent.succeeded':
      // Mark payment as SUCCEEDED
      await this.paymentsService.markAsSucceeded(paymentId)
      break

    case 'payment_intent.failed':
      // Mark payment as FAILED
      await this.paymentsService.markAsFailed(paymentId)
      break
  }
}
```

---

## 🗺️ Price ID Selection Logic

### Input:
- **Plan:** `lite` | `foreman` | `brigade`
- **Currency:** `RUB` | `USD` | `EUR`
- **Early Bird:** `true` | `false`

### Output:
- **Price ID:** `price_...`

### Example:

```typescript
// User from Russia selects FOREMAN plan
const plan = 'foreman'
const currency = 'RUB'  // Based on geolocation
const isEarlyBird = true  // From Plan.isEarlyBird in DB

// Build env variable key
const envKey = `STRIPE_PRICE_${plan.toUpperCase()}_${currency}_${isEarlyBird ? 'EARLYBIRD' : 'REGULAR'}`
// → STRIPE_PRICE_FOREMAN_RUB_EARLYBIRD

// Get Price ID from env
const priceId = process.env[envKey]
// → price_1OaBC...

// Use this Price ID in Stripe Checkout
```

---

## 📊 Database Schema

```sql
-- Plan (базовые планы)
CREATE TABLE "Plan" (
  id UUID PRIMARY KEY,
  slug VARCHAR(50) UNIQUE,  -- 'lite', 'foreman', 'brigade'
  name VARCHAR(100),        -- 'Лайт', 'Прораб', 'Бригада'
  description TEXT,
  maxActiveProjects INT,    -- 1, 4, null (unlimited)
  maxMembers INT,           -- 1, 3, 10
  storageGB FLOAT,          -- 0.5, 2, 10
  isPopular BOOLEAN,        -- false, true, false
  isEarlyBird BOOLEAN,      -- true (скидка активна)
  sortOrder INT
)

-- PlanPrice (цены для каждого плана)
CREATE TABLE "PlanPrice" (
  id UUID PRIMARY KEY,
  planId UUID REFERENCES "Plan"(id),
  currency VARCHAR(3),      -- 'RUB', 'USD', 'EUR'
  price DECIMAL(10,2),      -- 490, 990, 1990
  earlyBirdPrice DECIMAL(10,2),  -- 290, 690, 1490
  billingCycleDays INT      -- 30 (monthly)
)

-- Subscription (подписки пользователей)
CREATE TABLE "Subscription" (
  id UUID PRIMARY KEY,
  teamId UUID REFERENCES "Team"(id),
  planId UUID REFERENCES "Plan"(id),
  status VARCHAR(20),       -- 'TRIALING', 'ACTIVE', 'CANCELLED'
  currentPeriodStart TIMESTAMP,
  currentPeriodEnd TIMESTAMP,
  cancelAtPeriodEnd BOOLEAN
)

-- Payment (платежи)
CREATE TABLE "Payment" (
  id UUID PRIMARY KEY,
  subscriptionId UUID REFERENCES "Subscription"(id),
  provider VARCHAR(20),     -- 'STRIPE', 'YOOKASSA'
  externalId VARCHAR(255),  -- Stripe session ID or payment ID
  amount DECIMAL(10,2),
  currency VARCHAR(3),
  status VARCHAR(20),       -- 'PENDING', 'SUCCEEDED', 'FAILED'
  paidAt TIMESTAMP
)
```

---

## 🔐 Security Flow

### Webhook Signature Verification

```typescript
// Stripe sends signature in header
const signature = req.headers['stripe-signature']

// Verify using webhook secret
const isValid = stripe.webhooks.constructEvent(
  req.rawBody,
  signature,
  process.env.STRIPE_WEBHOOK_SECRET
)

if (!isValid) {
  throw new UnauthorizedException()
}

// Process webhook only if signature is valid
```

**Why this is important:**
- Prevents fake webhooks from attackers
- Ensures webhook is really from Stripe
- Required for PCI compliance

---

## 🌍 Geolocation Provider Selection

```typescript
// Extract user IP
const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress

// Determine country
const geo = geoip.lookup(ip)
const country = geo.country  // 'RU', 'US', 'UA', etc.

// Select provider
const provider = YOOKASSA_COUNTRIES.includes(country)
  ? PaymentProviderType.YOOKASSA
  : PaymentProviderType.STRIPE

// Russia/Belarus/Kazakhstan → Yookassa (RUB currency)
// Europe/USA/Ukraine → Stripe (USD/EUR currency)
```

---

## 📈 Monitoring & Analytics

### What to Track:

1. **Conversion Rate:**
   - Views of pricing page
   - Clicks on "Выбрать план"
   - Started checkouts
   - Completed payments

2. **Revenue:**
   - MRR (Monthly Recurring Revenue)
   - By plan (LITE vs FOREMAN vs BRIGADE)
   - By currency (RUB vs USD vs EUR)

3. **Churn:**
   - Cancelled subscriptions
   - Cancellation reasons
   - Retention rate

### Where to See:

**Stripe Dashboard:**
- Home → Revenue overview
- Payments → All payments
- Subscriptions → Active/cancelled

**ProRab Admin:**
- `/admin/analytics` → Custom dashboard
- `/admin/payments` → Payment list
- `/admin/subscriptions` → Subscription list

---

## 🚀 Production Checklist

- [ ] Switch to Live Mode in Stripe
- [ ] Get Live API Keys (`sk_live_...`)
- [ ] Create Live Products & Prices
- [ ] Update `.env` with live keys
- [ ] Configure production webhook URL (HTTPS!)
- [ ] Test with real card
- [ ] Monitor first payments
- [ ] Set up Stripe Radar (fraud prevention)
- [ ] Configure email receipts
- [ ] Set up billing alerts

---

**See Also:**
- [STRIPE_SETUP_GUIDE.md](STRIPE_SETUP_GUIDE.md) - Полное руководство
- [STRIPE_QUICK_REFERENCE.md](STRIPE_QUICK_REFERENCE.md) - Быстрая шпаргалка
