# v1.6.2 Testing Guide

**Version:** v1.6.2
**Date:** 2025-12-28
**Status:** ✅ Ready for Testing

---

## 🎯 What's New

### Development Mode Mock Payments

Вы можете тестировать полный UI flow подписок **БЕЗ** настройки реальных Stripe/Yookassa credentials!

**Как это работает:**

1. Если `STRIPE_SECRET_KEY` или `YOOKASSA_SHOP_ID` не настроены в `.env`
2. И `NODE_ENV !== 'production'`
3. Провайдеры автоматически возвращают mock-данные
4. Вы перенаправляетесь на return URL с параметрами: `?mock=true&provider=stripe&amount=XXX`

**Логи при использовании mock:**

```
⚠️  Stripe running in DEVELOPMENT mode - using mock implementation
⚠️  Set STRIPE_SECRET_KEY in .env for real payment processing
🧪 Stripe MOCK: Creating fake payment session for development
```

---

## 🚀 Quick Start (Development Mode)

### 1. Подготовка базы данных

```bash
# Запустить PostgreSQL
docker compose up -d postgres

# Подождать 10 секунд, затем настроить провайдеры
cd apps/api
pnpm prisma:seed:providers
```

**Ожидаемый вывод:**

```
💳 Setting up Payment Providers...

✅ Yookassa provider configured (Primary)
✅ Stripe provider configured (Secondary)

📊 Current Providers:
🟢 Active ⭐ Primary    | ЮKassa     (YOOKASSA)
🟢 Active    Secondary | Stripe     (STRIPE)

🎉 Payment providers are ready!
```

### 2. Запуск приложения

**Терминал 1 - API:**

```bash
cd apps/api
pnpm dev
```

**Терминал 2 - Web:**

```bash
cd apps/web
pnpm dev
```

### 3. Тестирование mock-режима

1. Откройте браузер: `http://localhost:3000`
2. Войдите в систему
3. Перейдите в **Settings** → **Subscriptions**
4. Нажмите **"Выбрать план"** на любом плане
5. Вы должны быть перенаправлены на URL вида:
   ```
   http://localhost:3000/settings?mock=true&provider=stripe&amount=990
   ```
6. В логах API увидите:
   ```
   ⚠️  Stripe running in DEVELOPMENT mode - using mock implementation
   🧪 Stripe MOCK: Creating fake payment session for development
   ```

---

## 🧪 Testing Scenarios

### Scenario 1: New User First Subscription

**Steps:**

1. Create new user account
2. Navigate to Settings → Subscriptions
3. Click "Выбрать план" on **LITE** plan
4. Verify redirect to mock payment URL
5. Check database: subscription should be created with status `TRIALING`

**Expected Result:**

- ✅ No errors in UI
- ✅ Redirect to mock URL with correct plan amount
- ✅ Subscription created in database
- ✅ Payment record created with status `PENDING`

### Scenario 2: Changing Plan

**Steps:**

1. User already has LITE plan
2. Click "Выбрать план" on **FOREMAN** plan
3. Verify redirect to mock payment URL
4. Check: price should be difference between plans

**Expected Result:**

- ✅ Toast: Plan change initiated
- ✅ Redirect to payment page
- ✅ New payment created for plan change

### Scenario 3: Selecting Same Plan

**Steps:**

1. User has LITE plan
2. Click "Выбрать план" on **LITE** plan again

**Expected Result:**

- ✅ Toast: "Вы уже используете этот план"
- ❌ No redirect (stays on same page)

### Scenario 4: Geolocation Provider Selection

**Test from Russia/CIS IP:**

- Provider should be: **YOOKASSA**
- Mock URL: `?mock=true&provider=yookassa&amount=XXX`

**Test from Europe/US IP:**

- Provider should be: **STRIPE**
- Mock URL: `?mock=true&provider=stripe&amount=XXX`

**Test from localhost:**

- Default provider: **STRIPE**

---

## 🔧 Switching to Production Mode

### Option 1: Stripe Setup

**Add to `apps/api/.env`:**

```env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

**Restart API:**

```bash
cd apps/api
pnpm dev
```

**Expected logs:**

```
Stripe provider initialized successfully from environment variables
```

### Option 2: Yookassa Setup

**Add to `apps/api/.env`:**

```env
YOOKASSA_SHOP_ID=123456
YOOKASSA_SECRET_KEY=test_...
YOOKASSA_WEBHOOK_SECRET=...
```

**Restart API and test with real payment flow.**

---

## 📊 Database Verification

### Check Providers

```bash
cd apps/api
pnpm prisma:studio
```

**Navigate to `PaymentProvider` table - должны быть 2 записи:**

| type      | name    | isActive | isPrimary |
| --------- | ------- | -------- | --------- |
| YOOKASSA  | ЮKassa  | true     | true      |
| STRIPE    | Stripe  | true     | false     |

### Check Subscriptions

```sql
SELECT id, status, plan, "teamId", "createdAt"
FROM "Subscription"
WHERE status = 'TRIALING'
ORDER BY "createdAt" DESC;
```

### Check Payments

```sql
SELECT id, status, amount, provider, "subscriptionId", "createdAt"
FROM "Payment"
ORDER BY "createdAt" DESC
LIMIT 10;
```

---

## 🐛 Troubleshooting

### Error: "Не удалось определить команду"

**Причина:** User has no teams
**Решение:** Create a team first:

1. Navigate to **Teams** page
2. Click **"Создать команду"**
3. Return to Subscriptions

### Error: "Subscription already exists"

**Причина:** Duplicate subscription in database
**Решение:**

```bash
cd apps/api
psql -h localhost -p 54320 -U prorab -d prorab -f prisma/cleanup-duplicate-subscriptions.sql
```

Password: `prorab`

### Error: "ECONNREFUSED" to database

**Причина:** PostgreSQL not running
**Решение:**

```bash
docker compose up -d postgres
# Wait 10 seconds
cd apps/api
pnpm dev
```

### Mock mode not working (still shows error)

**Check:**

1. `NODE_ENV` is NOT set to `production`
2. API server was restarted after code changes
3. No `STRIPE_SECRET_KEY` or `YOOKASSA_SHOP_ID` in `.env`

**Fix:**

```bash
# Remove credentials from .env temporarily
cd apps/api
# Comment out or delete:
# STRIPE_SECRET_KEY=...
# YOOKASSA_SHOP_ID=...

# Restart API
pnpm dev
```

### Provider logs show initialization errors

**Check logs for:**

```
⚠️  Stripe running in DEVELOPMENT mode - using mock implementation
```

If you see this, mock mode is working correctly!

---

## ✅ Success Criteria

### Mock Mode Testing

- [ ] User can select plan without errors
- [ ] Redirect happens to mock URL
- [ ] Correct provider selected based on IP
- [ ] Subscription created in database
- [ ] Payment record created with `PENDING` status
- [ ] Console shows mock mode warning logs

### Production Mode (Optional)

- [ ] Real Stripe/Yookassa credentials configured
- [ ] Real payment page opens
- [ ] Payment can be completed
- [ ] Webhook updates payment status
- [ ] Subscription status changes to `ACTIVE`

---

## 📝 What to Test

### High Priority

1. ✅ **Plan Selection** - Button responds, no errors
2. ✅ **Team ID Resolution** - Works for users with/without subscriptions
3. ✅ **Geolocation** - Correct provider auto-selected
4. ✅ **Mock Redirect** - URL contains `?mock=true&provider=XXX`
5. ✅ **Database Records** - Subscription and payment created

### Medium Priority

6. ✅ **Plan Changes** - Existing users can change plans
7. ✅ **Duplicate Prevention** - Cannot select same plan twice
8. ✅ **Error Handling** - Friendly error messages
9. ✅ **Logging** - Clear console output for debugging

### Low Priority

10. ✅ **Multiple Teams** - User with multiple teams
11. ✅ **Edge Cases** - No teams, no subscription, expired trial
12. ✅ **UI States** - Loading, success, error states

---

## 🎬 Demo Script

**Full flow demonstration:**

```bash
# 1. Setup
docker compose up -d postgres
cd apps/api && pnpm prisma:seed:providers

# 2. Start services
cd apps/api && pnpm dev &
cd apps/web && pnpm dev &

# 3. Test in browser
# - Open http://localhost:3000
# - Login
# - Go to Settings → Subscriptions
# - Click "Выбрать план" on any plan
# - Observe redirect to mock URL
# - Check console for mock logs
# - Verify database records

# 4. Check results
cd apps/api
pnpm exec tsx check-subscriptions.ts
pnpm exec tsx check-providers.ts
```

---

## 📞 Support

**If you encounter issues:**

1. Check [QUICK_FIX.md](QUICK_FIX.md) for manual fixes
2. Check [V1.6.2_COMPLETION_SUMMARY.md](V1.6.2_COMPLETION_SUMMARY.md) for full context
3. Review API logs for error details
4. Check browser console for frontend errors

---

**Status:** ✅ Ready for Testing
**Mock Mode:** ✅ Fully Implemented
**Database Setup Required:** ✅ Yes (run `pnpm prisma:seed:providers`)

---

*Generated: 2025-12-28*
*Version: 1.6.2*
