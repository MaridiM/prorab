# ✅ v1.6.2 Test Checklist

**Quick reference for testing the subscription system**

---

## 🚀 Before You Start

```bash
# 1. Start PostgreSQL
docker compose up -d postgres

# 2. Setup providers (one-time)
cd apps/api
pnpm prisma:seed:providers

# 3. Start services
# Terminal 1:
cd apps/api && pnpm dev

# Terminal 2:
cd apps/web && pnpm dev
```

---

## ✅ Basic Flow Test (5 min)

### 1. Database Setup

- [ ] PostgreSQL is running (`docker ps`)
- [ ] Payment providers created (2 records)
  ```bash
  cd apps/api
  pnpm exec tsx check-providers.ts
  ```
  Expected: ✅ Yookassa (Primary), ✅ Stripe (Secondary)

### 2. Application Start

- [ ] API server running on `http://localhost:4000`
- [ ] Web server running on `http://localhost:3000`
- [ ] No startup errors in console

### 3. UI Flow

- [ ] Login to application
- [ ] Navigate to Settings → Subscriptions
- [ ] See 3 plans (LITE, FOREMAN, BRIGADE)
- [ ] Click "Выбрать план" on any plan
- [ ] Redirects to URL with `?mock=true&provider=stripe`
- [ ] No error messages in UI

### 4. Console Logs

- [ ] API console shows:
  ```
  ⚠️  Stripe running in DEVELOPMENT mode - using mock implementation
  🧪 Stripe MOCK: Creating fake payment session for development
  ```
- [ ] No errors in browser console

### 5. Database Verification

- [ ] Subscription created with status `TRIALING`
- [ ] Payment record created with status `PENDING`
  ```bash
  cd apps/api
  pnpm exec tsx check-subscriptions.ts
  ```

---

## 🧪 Advanced Tests (Optional)

### Plan Changes

- [ ] User with LITE plan
- [ ] Click "Выбрать план" on FOREMAN
- [ ] Redirects to payment page
- [ ] New payment created

### Duplicate Prevention

- [ ] User with LITE plan
- [ ] Click "Выбрать план" on LITE again
- [ ] Toast: "Вы уже используете этот план"
- [ ] No redirect, stays on page

### Team Resolution

- [ ] New user without team
- [ ] Try to select plan
- [ ] Error: "Не удалось определить команду"
- [ ] Create team first
- [ ] Plan selection works

### Geolocation (VPN Required)

- [ ] Test from Russia IP → Provider: YOOKASSA
- [ ] Test from Europe IP → Provider: STRIPE
- [ ] Test from localhost → Provider: STRIPE

---

## 🔴 Known Issues (Should Be Fixed)

### ❌ Issues That Should NOT Occur:

- [ ] ❌ "Select plan" button not responding
- [ ] ❌ "Не удалось определить команду" (when user has team)
- [ ] ❌ "Argument `plan` is missing" Prisma error
- [ ] ❌ "Stripe provider not initialized" error
- [ ] ❌ "Subscription already exists" on first attempt
- [ ] ❌ Page refresh without redirect

### ✅ If You See These:

**All above issues should be FIXED in v1.6.2!**

If you encounter any, check:

1. Did you run `pnpm prisma:seed:providers`?
2. Did you restart API server after setup?
3. Is PostgreSQL running?

---

## 🐛 Troubleshooting Quick Fixes

### "ECONNREFUSED" to database

```bash
docker compose up -d postgres
# Wait 10 seconds
cd apps/api && pnpm dev
```

### "Subscription already exists"

```bash
cd apps/api
psql -h localhost -p 54320 -U prorab -d prorab -f prisma/cleanup-duplicate-subscriptions.sql
# Password: prorab
```

### Providers not configured

```bash
cd apps/api
pnpm prisma:seed:providers
pnpm dev # Restart API
```

### Mock mode not showing

Check `.env` - remove these lines if present:

```env
# STRIPE_SECRET_KEY=...  ← Comment out or delete
# YOOKASSA_SHOP_ID=...   ← Comment out or delete
```

Restart API server.

---

## 📊 Success Metrics

### Must Pass (Critical):

- ✅ Plan selection button works
- ✅ Redirect to mock URL occurs
- ✅ No errors in UI
- ✅ Database records created

### Should Pass (Important):

- ✅ Team ID automatically resolved
- ✅ Mock mode logs visible
- ✅ Plan changes work for existing users
- ✅ Duplicate plans prevented

### Nice to Have (Optional):

- ✅ Geolocation provider selection
- ✅ Multiple teams support
- ✅ Clean error messages

---

## 📝 Test Report Template

```markdown
## Test Results - v1.6.2

**Date:** _______
**Tester:** _______
**Environment:** Development

### Basic Flow
- [ ] Database setup: ✅ / ❌
- [ ] Application start: ✅ / ❌
- [ ] UI flow: ✅ / ❌
- [ ] Console logs: ✅ / ❌
- [ ] Database verification: ✅ / ❌

### Issues Found
1. _________________________________
2. _________________________________
3. _________________________________

### Notes
_____________________________________
_____________________________________
```

---

## 🎯 Quick Check (30 seconds)

**Fastest way to verify everything works:**

```bash
# 1. Check providers
cd apps/api
pnpm exec tsx check-providers.ts
# Should show: 2 active providers

# 2. Open browser
# http://localhost:3000 → Settings → Click "Выбрать план"
# Should redirect to: ?mock=true&provider=stripe&amount=990

# 3. Check logs
# API console should show: "🧪 Stripe MOCK: Creating fake payment"

# ✅ If all above work → SUCCESS!
```

---

**Status:** Ready for Testing
**Expected Duration:** 5-10 minutes
**Difficulty:** ⭐☆☆☆☆ (Very Easy)

---

*See [TESTING_v1.6.2.md](TESTING_v1.6.2.md) for detailed testing guide*
