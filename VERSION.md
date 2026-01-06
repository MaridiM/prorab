# ProRab Version Information

**Current Version:** v1.7.1
**Release Date:** 2026-01-06
**Status:** 🟢 Production Ready

---

## Version History

### v1.7.1 (2026-01-06) - Personal Access Tokens (API Keys) 🔑

**NEW FEATURE:**

- 🔑 **Personal Access Tokens** - Generate API keys for external integrations
  - Users can generate, list, and revoke API tokens from Settings → API
  - Tokens start with `prorab_` prefix for easy identification
  - Optional expiration (1-365 days) or permanent tokens
  - Last used timestamp and IP tracking
  - Secure SHA256 token hashing (plaintext shown only once)

**BACKEND:**
- Added `PersonalAccessToken` model to Prisma schema
- Created `PersonalAccessTokensService` with generateToken, validateToken, revokeToken
- Created `PersonalAccessTokensResolver` with GraphQL mutations and queries
- Updated `AuthGuard` to validate API tokens alongside session cookies

**FRONTEND:**
- Created `ApiTokensSettings` component with token management UI
- Token generation dialog with copy-to-clipboard
- Token list with revoke confirmation

**FILES CREATED:**
- `apps/api/src/modules/users/personal-access-tokens.service.ts` (~150 LOC)
- `apps/api/src/modules/users/personal-access-tokens.resolver.ts` (~60 LOC)
- `apps/api/src/modules/users/models/personal-access-token.model.ts`
- `apps/api/src/modules/users/dto/generate-token.input.ts`
- `apps/web/src/packages/components/settings/ApiTokensSettings.tsx` (~330 LOC)
- `apps/web/src/packages/api/graphql/api-tokens.graphql`

---

### v1.6.16 (2026-01-02) - Fix Early Bird Display for Active Subscribers

**CRITICAL FIX:**

- 🐛 **Active Early Bird Users See Full Price** - Fixed critical bug where users with active Early Bird subscriptions saw full prices
  - Problem: Users with active Early Bird subscription couldn't see Early Bird prices when changing plans
  - Root cause: `isEarlyBirdAvailableForUser` returned `false` for users who already have Early Bird
  - Solution: Added separate check for ACTIVE Early Bird subscriptions

**HOW IT WORKS NOW:**

Three-tier check in `isEarlyBirdAvailableForUser`:

1. **First check**: Does user have ACTIVE Early Bird subscription?
   - If YES → Return `true` (can always see Early Bird prices for plan changes)

2. **Second check**: Has user EVER used Early Bird (but not active now)?
   - If YES → Return `false` (cannot get Early Bird again after cancellation)

3. **Third check**: Is user new AND are global slots available?
   - If YES → Return `true` (can get Early Bird for first time)

**USER SCENARIOS:**

| User Status | Result | Can See Early Bird? |
|-------------|--------|---------------------|
| Active Early Bird subscriber | `hasActive = true` | ✅ YES (always) |
| Cancelled Early Bird subscriber | `hasUsed = true`, `hasActive = false` | ❌ NO |
| New user (slots available) | `hasUsed = false`, `remaining > 0` | ✅ YES |
| New user (slots full) | `hasUsed = false`, `remaining = 0` | ❌ NO |

**TECHNICAL DETAILS:**

- Added new method `hasActiveEarlyBird(userId)` - checks for active Early Bird subscription
- Modified `isEarlyBirdAvailableForUser(userId)` logic:
  - Old: `!hasUsed || remaining > 0` (incorrect)
  - New: Three-step validation (correct)
- Located in [subscriptions.service.ts](apps/api/src/modules/subscriptions/subscriptions.service.ts#L619-L670)

**FILES MODIFIED:**

Backend:
- [apps/api/src/modules/subscriptions/subscriptions.service.ts](apps/api/src/modules/subscriptions/subscriptions.service.ts#L619-L670)

Package versions:
- [package.json](package.json#L3)
- [apps/api/package.json](apps/api/package.json#L3)
- [apps/web/package.json](apps/web/package.json#L2)

---

### v1.6.15 (2026-01-02) - User-Specific Early Bird Eligibility

**FEATURE:**

- ✨ **User-Specific Early Bird Check** - Early Bird pricing now checks individual user eligibility
  - Each user can only use Early Bird once in their lifetime (one Early Bird per user)
  - System checks both global availability (500 slots) AND user eligibility
  - If user already used Early Bird, shows full price instead
  - Early Bird badge and pricing only shown if user is eligible

**HOW IT WORKS:**

Before:
- Showed Early Bird price to everyone if global limit not reached (500 users)
- Problem: User saw Early Bird price in plans, but got full price at checkout

After:
- Backend tracks which users already used Early Bird (`isEarlyBird` flag on subscription)
- New GraphQL query `isEarlyBirdAvailableForMe` checks user eligibility
- Frontend shows Early Bird price ONLY if user hasn't used it before
- Full price displayed for users who already got Early Bird

**USER EXPERIENCE:**

1. **First-time user (slots available)**: Sees Early Bird price and badge → Can purchase at Early Bird price
2. **First-time user (slots full)**: Sees full price, no badge → Purchases at full price
3. **Returning user (already used Early Bird)**: Sees full price, no badge → Cannot get Early Bird again
4. **Current Early Bird subscriber**: Keeps their Early Bird price forever

**TECHNICAL DETAILS:**

Backend (API):
- Added `hasUsedEarlyBird(userId)` - checks if user has subscription with `isEarlyBird=true`
- Added `isEarlyBirdAvailableForUser(userId)` - checks user + global availability
- New GraphQL query `isEarlyBirdAvailableForMe` - authenticated, user-specific
- Located in [subscriptions.service.ts](apps/api/src/modules/subscriptions/subscriptions.service.ts#L600-L634)

Frontend (Web):
- Updated `SubscriptionManagement` to use `IsEarlyBirdAvailableForMeDocument`
- Changed `isEarlyBirdAvailable` from global to user-specific check
- Early Bird badge and pricing hide automatically if user ineligible
- Located in [SubscriptionManagement.tsx](apps/web/src/packages/components/settings/SubscriptionManagement.tsx#L78-L80)

**FILES MODIFIED:**

Backend:
- [apps/api/src/modules/subscriptions/subscriptions.service.ts](apps/api/src/modules/subscriptions/subscriptions.service.ts#L595-L634)
- [apps/api/src/modules/subscriptions/subscriptions.resolver.ts](apps/api/src/modules/subscriptions/subscriptions.resolver.ts#L118-L129)

Frontend:
- [apps/web/src/packages/api/graphql/subscriptions.graphql](apps/web/src/packages/api/graphql/subscriptions.graphql#L179-L181)
- [apps/web/src/packages/components/settings/SubscriptionManagement.tsx](apps/web/src/packages/components/settings/SubscriptionManagement.tsx#L47)

Package versions:
- [package.json](package.json#L3)
- [apps/api/package.json](apps/api/package.json#L3)
- [apps/web/package.json](apps/web/package.json#L2)

---

### v1.6.14 (2025-12-31) - Stripe Checkout Cancel Button Fix

**FIXES:**

- 🐛 **Stripe Cancel Button Redirect** - Fixed back button on Stripe checkout page
  - Cancel button now redirects to `/settings?tab=subscription` instead of success page
  - Applied to both one-time payments and recurring subscriptions
  - Extracts base URL from `returnUrl` to build correct cancel URL
  - Improves user experience when canceling payment

**TECHNICAL DETAILS:**

- Modified `stripe.provider.ts` in `createPayment()` and `createSubscription()` methods
- Extracts base URL: `params.returnUrl.split('/payment')[0]`
- Builds cancel URL: `${baseUrl}/settings?tab=subscription`
- Sets `cancel_url` parameter in Stripe Checkout session

**NOTE ON METADATA IN CHECKOUT:**

The technical metadata (targetPlanId, targetPlan JSON) that was appearing in Stripe checkout description has been addressed:
- Description cleaning logic (`cleanDescription`) already exists in the code
- Splits description by ` | ` to remove any appended metadata
- If you still see metadata, restart the API server to load the latest code
- Create a new payment to test - old Stripe sessions (up to 24h) will show old description

**FILES MODIFIED:**

Backend:
- [apps/api/src/core/payments/providers/stripe.provider.ts](apps/api/src/core/payments/providers/stripe.provider.ts#L144-L145)

Package versions:
- [package.json](package.json#L3)
- [apps/api/package.json](apps/api/package.json#L3)
- [apps/web/package.json](apps/web/package.json#L2)

---

### v1.6.13 (2025-12-31) - Payment Flow & Plan Update Critical Fixes

**CRITICAL FIXES:**

- 🐛 **Success Page Instant Redirect** - Fixed success page disappearing immediately
  - Removed overly strict `fromCheckout` validation check
  - Success page now properly displays for 5 seconds with countdown timer
  - Users can see payment confirmation before auto-redirect to dashboard
  - Manual redirect button still available

- 🐛 **Plan Not Updating After Payment** - Fixed plan remaining unchanged after upgrade
  - Added plan update logic in `handlePaymentSucceededByPaymentId` webhook handler
  - Checks payment metadata for `targetPlanId` and `targetPlan`
  - Updates `subscription.planId` and `subscription.plan` after successful payment
  - Automatic mapping of plan slug to SubscriptionPlan enum
  - Detailed logging for plan changes

**HOW IT WORKS:**

1. User selects new plan (e.g., Brigade while on Foreman)
2. `initializePayment` stores `targetPlanId` and `targetPlan` in payment metadata
3. Payment provider webhook calls `handlePaymentSucceeded` with metadata
4. Webhook handler updates subscription plan after payment confirmation
5. User sees updated plan immediately after payment

**BACKEND:**

- Updated `handlePaymentSucceededByPaymentId()` in PaymentsService
- Added plan change detection from metadata
- Added plan slug → enum mapping logic
- Enhanced logging for debugging plan updates

**FRONTEND:**

- Removed strict `fromCheckout` check in success page
- Success page validation now only requires `success=true` and `paymentId`

**FILES MODIFIED:**

Backend:
- `apps/api/src/modules/payments/payments.service.ts` - Plan update logic in webhook handler

Frontend:
- `apps/web/src/app/(root)/payment/success/page.tsx` - Removed strict validation

**STATISTICS:**

- Backend: +35 LOC (plan update logic, logging)
- Frontend: -5 LOC (removed strict check)
- Total: ~30 LOC net

**BREAKING CHANGES:** None

---

### v1.6.12 (2025-12-31) - Early Bird UI Indicators & Landing Page Integration

**NEW FEATURES:**

- ✅ **Early Bird Stats Counter** - Real-time tracking of Early Bird program
  - Shows remaining slots out of 500 total
  - Active/Completed status badge
  - Beautiful amber/orange gradient banner in subscription settings
  - Framer Motion animations for polish

- ✅ **Social Proof Counter** - "Already N teams joined"
  - Displays total active teams count
  - Enhances FOMO marketing effect
  - Real data from database

- ✅ **Public REST API for Landing Page** - `/api/public/stats/early-bird`
  - No authentication required
  - Returns: used, limit, remaining, isAvailable, totalTeams
  - Designed for landing page integration with real data

**BACKEND:**

- New GraphQL type: `EarlyBirdStatsModel`
- New GraphQL query: `earlyBirdStats` (public, no auth)
- New REST endpoint: `GET /api/public/stats/early-bird`
- New service method: `getEarlyBirdStats()` in SubscriptionsService
- New controller: `PublicStatsController`

**FRONTEND:**

- Updated `SubscriptionManagement.tsx` with Early Bird banner
- Added social proof display with Users icon
- Beautiful gradient design (amber-50 to orange-50)
- Responsive layout for mobile

**FILES MODIFIED:**

Backend:
- `apps/api/src/modules/subscriptions/subscriptions.service.ts` - Added getEarlyBirdStats()
- `apps/api/src/modules/subscriptions/subscriptions.resolver.ts` - Added earlyBirdStats query
- `apps/api/src/modules/subscriptions/subscriptions.module.ts` - Registered PublicStatsController

Frontend:
- `apps/web/src/packages/components/settings/SubscriptionManagement.tsx` - Added banner UI
- `apps/web/src/packages/api/graphql/subscriptions.graphql` - Added EarlyBirdStats query

**FILES CREATED:**

- `apps/api/src/modules/subscriptions/models/early-bird-stats.model.ts` - GraphQL type
- `apps/api/src/modules/subscriptions/controllers/public-stats.controller.ts` - REST API

**STATISTICS:**

- Backend: +85 LOC (models, service, resolver, controller)
- Frontend: +65 LOC (UI banner, GraphQL query)
- Total: ~150 LOC

**BREAKING CHANGES:** None

---

### v1.6.11 (2025-12-31) - Early Bird & Trial Period Implementation

**CRITICAL FIXES:**

- 🐛 **Early Bird Not Working** - Fixed critical bug where users always paid full price
  - Frontend correctly passes `useEarlyBird` flag (already fixed in v1.6.10)
  - Backend validates Early Bird eligibility and enforces 500-subscription limit
  - Price calculation now works: users get 290₽/690₽/1490₽ instead of full price

**NEW FEATURES:**

- ✅ **Trial Uniqueness** - Users can only get trial once per plan
  - Added `trialedPlanIds` field to track trial usage per user
  - Automatic backfill from existing subscriptions
  - Users can trial different plans, but only once each

- ✅ **Early Bird Validation** - Enforces 500-subscription limit
  - Backend counts active Early Bird subscriptions
  - Rejects requests when limit reached
  - Clear error messages for users

**DATABASE MIGRATIONS:**

- `20251231_add_trial_tracking` - Added `trialed_plan_ids` column
- Automatic backfill of trial history
- Fully backward compatible

**UPGRADE PATH:**

```bash
cd apps/api
npx prisma generate
npx prisma db execute --file "prisma\migrations\20251231_add_trial_tracking\migration.sql"
```

**BREAKING CHANGES:** None

---

### v1.6.5 (2025-12-31) - CRITICAL SECURITY FIX: Payment Authorization

**CRITICAL SECURITY FIX:**

- 🚨 **Subscription Activation Without Payment** - Fixed critical vulnerability
  - **SEVERITY**: HIGH - Users could access paid features without payment
  - Subscriptions NO LONGER activate automatically upon creation
  - Added `PENDING_PAYMENT` status for new subscriptions
  - Activation occurs ONLY after payment confirmation via webhook
  - Users cannot bypass payment to gain access

**Bug Fixes:**

- 🐛 **Payment Creation Error** - Fixed "Unique constraint failed on yookassa_payment_id"
  - Changed `yookassaPaymentId` from `'pending'` to `null` during payment creation
  - Field is DEPRECATED and only set for YooKassa payments
  - Users can now create multiple payments without conflicts

**New Features:**

- ✅ **PENDING_PAYMENT Status** - New subscription status for payment flow
  - Added to `SubscriptionStatus` enum
  - Database migration: `20251231_add_pending_payment_status`
  - Subscriptions await payment confirmation before activation
  - `mySubscription` query filters out pending subscriptions

- ✅ **Plan Renewal Feature** - Added "Продлить план" button for current active plans
  - Users can now renew their existing subscription directly from the plan card
  - Button appears below "Текущий план" information block
  - Uses same `handleSelectPlan` logic for seamless renewal
  - Added `RefreshCcw` icon for visual clarity

**UI Enhancements:**

- 🎨 Button styling with `variant="outline"` and primary theme colors
- 📍 Proper spacing with `space-y-2` container
- ⚡ Motion animations on hover and tap for better UX
- ⏱️ Improved auto-redirect on payment success page (10s → 5s)
- 🔒 Added protection against multiple redirects with `hasRedirected` flag

**Security Impact:**

- **BEFORE**: Users gained immediate access without payment
- **AFTER**: Access granted ONLY after successful payment verification

**Files Modified:**

- `apps/api/prisma/schema.prisma`
- `apps/api/prisma/migrations/20251231_add_pending_payment_status/migration.sql`
- `apps/api/src/modules/subscriptions/subscriptions.service.ts`
- `apps/api/src/modules/payments/payments.service.ts`
- `apps/web/src/packages/components/settings/SubscriptionManagement.tsx`
- `apps/web/src/app/(root)/payment/success/page.tsx`

---

### v1.6.4 (2025-12-29) - Subscription Buttons & Navigation Fix

**Bug Fixes:**

- ✅ Fixed "Выбрать тарифный план" button - now properly shows plans section
- ✅ Fixed "Продлить план" button - redirects to plans with showPlans parameter
- ✅ Fixed plans visibility when user has active subscription
- ✅ Added URL parameter `showPlans=true` for programmatic plans display

**Improvements:**

- 🔗 **URL-based Navigation** - All subscription buttons now use URL parameters
  - Added `useSearchParams` hook to SubscriptionManagement
  - Automatic `isChangingPlan=true` when `showPlans=true` in URL
  - Smooth scroll to plans section after state update

- 🔄 **Unified Button Behavior** - All buttons redirect to `/settings?tab=subscription&showPlans=true`
  - "Выбрать тарифный план" (trial widget)
  - "Продлить план" (subscription history)
  - "Сменить тариф" (current plan card) - uses internal state

**Modified Files:**

Frontend:
- `apps/web/src/packages/components/settings/SubscriptionManagement.tsx` - Added URL parameter support
- `apps/web/src/packages/components/subscription/trial-status-widget.tsx` - Changed to Link component
- `apps/web/src/packages/components/settings/subscription-history.tsx` - Updated href with showPlans
- `apps/web/src/app/(root)/(protected)/settings/page.tsx` - Removed onUpgrade prop

**Statistics:**

- Frontend: ~30 LOC changed
- Bug fixes: 3 critical navigation issues resolved

**Breaking Changes:** None

---

### v1.6.3 (2025-12-29) - Subscription UX Polish & Navigation Improvements

**Bug Fixes:**

- ✅ Fixed "Сменить тариф" button - now scrolls to plans section
- ✅ Fixed current plan detection using `planId` instead of `planRef.id`
- ✅ Fixed `mySubscription` query to find active subscriptions across all user teams
- ✅ Removed unused `PaymentProviderSelector` dialog (provider now auto-selected)
- ✅ Fixed tab navigation from `?tab=billing` to `?tab=subscription`

**UI/UX Improvements:**

- 🎨 **Compact Trial Period Widget** - Redesigned from large card to compact horizontal banner
  - Reduced padding from p-6 to p-4
  - Removed progress bar for cleaner look
  - Made responsive with mobile-friendly text
  - Added scroll-to-plans functionality on button click
  - Changed colors: amber theme instead of blue accent

- 🔄 **Better Plan Change Flow** - "Сменить тариф" button now smoothly scrolls to plans
  - Added `id="plans-section"` to plans card
  - Smooth scroll animation with `scrollIntoView`
  - 100ms delay for smooth state transition

- 🔍 **Improved Current Plan Detection** - Status box shows correctly for active plan
  - Fixed comparison logic to use `subscription.planId`
  - Added debug logging for troubleshooting
  - Shows "Текущий план" with expiration date

**Modified Files:**

Frontend:
- `apps/web/src/packages/components/settings/SubscriptionManagement.tsx` - Added scroll-to-plans, removed provider dialog
- `apps/web/src/packages/components/subscription/trial-status-widget.tsx` - Compact redesign
- `apps/web/src/packages/components/subscription/upgrade-button.tsx` - Fixed tab navigation

Backend:
- `apps/api/src/modules/subscriptions/subscriptions.service.ts` - Fixed `findByUserId` to search all teams

**Statistics:**

- Frontend: ~50 LOC changed (compact widget design, scroll functionality)
- Backend: ~10 LOC changed (active subscription search logic)
- Bug fixes: 5 critical UX issues resolved

**Breaking Changes:** None

---

### v1.6.2 (2025-12-28) - Payment Provider Auto-Selection & Subscription UX Improvements

**Bug Fixes:**

- ✅ Fixed "Select plan" button not responding for new users
- ✅ Fixed team ID resolution for users without existing subscriptions
- ✅ Fixed Prisma validation error for plan enum field
- ✅ Fixed payment provider database initialization
- ✅ Fixed async provider initialization (constructors can't await)
- ✅ Fixed payment flow for existing subscriptions (plan changes)

**Improvements:**

- 🌍 Automatic payment provider selection based on IP geolocation
  - Russia/Belarus/CIS → Yookassa
  - Europe/Ukraine/International → Stripe
- 🚀 Direct redirect to payment without manual provider selection
- 🧪 Development mode mock payments (test UI without real credentials)
- 📦 Added `pnpm prisma:seed:providers` script for easy setup
- 📝 Comprehensive fix documentation in [QUICK_FIX.md](QUICK_FIX.md)
- 🔧 Lazy initialization pattern for payment providers
- 🎨 **NEW:** Enhanced subscription UX with better visual feedback
- 🔄 **NEW:** Subscription history with detailed status tracking
- 🔔 **NEW:** Upgrade button in header showing current plan
- 💳 **NEW:** "Renew" button for current subscription plan

**New Features:**

- **Development Mode Mock Payments**
  - Test subscription flow without Stripe/Yookassa credentials
  - Mock payment URLs: `?mock=true&provider=stripe&amount=XXX`
  - Automatic detection of missing credentials in dev environment
  - Warning logs indicate when running in mock mode
  - Production mode still requires real credentials

- **Subscription History**
  - New `mySubscriptionHistory` GraphQL query
  - Beautiful UI showing all past and current subscriptions
  - Status badges with color coding (Active, Trial, Cancelled, Expired)
  - Timeline with creation dates, trial periods, expiration dates
  - "Current" badge for active subscription

- **Upgrade Button in Header**
  - Shows current plan name on all pages
  - "Начать" button for users without subscription
  - "Лайт/Прораб → Апгрейд" for upgradeable plans
  - "👑 Бригада" badge for top-tier plan
  - Responsive design (mobile shows icons only)
  - Direct link to billing settings

- **Improved Current Plan Display**
  - Changed disabled "Current Plan" button to active "Renew" button
  - Clicking renew creates new payment for subscription extension
  - Visual distinction for current plan card with border/background
  - "Текущий" badge on plan card

**New Files:**

- `apps/api/src/modules/payments/utils/geo-provider.util.ts` - IP-based provider detection
- `apps/api/prisma/seed-payment-providers.ts` - Provider setup script
- `apps/api/prisma/setup-payment-providers.sql` - SQL provider setup
- `apps/api/prisma/cleanup-duplicate-subscriptions.sql` - Cleanup script
- `apps/web/src/packages/components/settings/subscription-history.tsx` - History component
- `QUICK_FIX.md` - Manual fix instructions
- `TESTING_v1.6.2.md` - Complete testing guide

**Modified Files:**

Backend:

- `apps/api/src/core/payments/providers/stripe.provider.ts` - Added lazy init + mock mode
- `apps/api/src/core/payments/providers/yookassa.provider.ts` - Added lazy init + mock mode
- `apps/api/src/modules/payments/payments.service.ts` - Auto-provider selection
- `apps/api/src/modules/payments/payments.resolver.ts` - IP extraction
- `apps/api/src/modules/subscriptions/subscriptions.service.ts` - Plan enum mapping + history query
- `apps/api/src/modules/subscriptions/subscriptions.resolver.ts` - Added mySubscriptionHistory query

Frontend:

- `apps/web/src/packages/components/settings/SubscriptionManagement.tsx` - Renew button + team ID resolution
- `apps/web/src/packages/components/subscription/upgrade-button.tsx` - Enhanced display + debug logging
- `apps/web/src/packages/components/ui/page-header.tsx` - Added UpgradeButton
- `apps/web/src/packages/components/settings/index.ts` - Added SubscriptionHistory export
- `apps/web/src/packages/api/graphql/subscriptions.graphql` - Added MySubscriptionHistory query
- `apps/web/src/app/(root)/(protected)/settings/page.tsx` - Integrated SubscriptionHistory

**Statistics:**

- Backend: +180 LOC (geolocation utilities, provider seeding, mock implementations, subscription history)
- Frontend: +220 LOC (subscription history UI, upgrade button enhancements, renew functionality)
- Documentation: 3 comprehensive guides (QUICK_FIX.md, TESTING_v1.6.2.md, VERSION.md updates)

**Breaking Changes:** None

**Upgrade Path:**

```bash
# 1. Setup payment providers
cd apps/api
pnpm prisma:seed:providers

# 2. Restart services
pnpm dev

# 3. Test mock mode (no credentials needed)
# OR configure real credentials in .env
```

---

### v1.6.0 (2025-12-28) - Full Subscription System with Multi-Provider Payments

**Major Features:**
- ✅ Multi-provider payment support (Yookassa + Stripe)
- ✅ Complete subscription management UI
- ✅ Comprehensive limit enforcement (Projects, Members, Storage)
- ✅ Upgrade experience (Button + Widget + Prompts)
- ✅ Downgrade protection with detailed error handling

**Statistics:**
- Backend: ~525 LOC across 7 components
- Frontend: ~650 LOC across 7 components
- Documentation: 4 comprehensive documents
- Tests: 17+ test cases

**Breaking Changes:** None

---

### v1.5.0 - Payment System Foundation

**Features:**
- Yookassa payment integration
- Payment webhook processing
- Subscription trials
- Basic limit enforcement

---

### v1.4.5 - Admin Panel & Team Management

**Features:**
- Advanced admin panel
- Team management
- Role-based permissions
- Analytics dashboard

---

### v1.4.2 - Enhanced Admin Features

**Features:**
- Announcement handling
- User role management
- Improved UX

---

## Package Versions

### Monorepo
- **Package:** `prorab-monorepo`
- **Version:** `1.6.13`
- **Location:** `./package.json`

### Backend API
- **Package:** `api`
- **Version:** `1.6.13`
- **Location:** `./apps/api/package.json`
- **Framework:** NestJS 11
- **Database:** PostgreSQL + Prisma

### Frontend Web
- **Package:** `web`
- **Version:** `1.6.13`
- **Location:** `./apps/web/package.json`
- **Framework:** Next.js 16
- **UI:** React 19

---

## Environment Variables

### Frontend (.env)
```env
NEXT_PUBLIC_SERVER_URL=http://localhost:8080/graphql
NEXT_PUBLIC_APP_VERSION=1.6.13
```

### Backend (.env)
```env
# Database
DATABASE_URL=postgresql://...

# JWT & Cookies
JWT_SECRET=...
COOKIE_SECRET=...

# Payment Providers
YOOKASSA_SHOP_ID=...
YOOKASSA_SECRET_KEY=...
STRIPE_SECRET_KEY=...
STRIPE_WEBHOOK_SECRET=...

# Email
SMTP_HOST=...
SMTP_PORT=...
SMTP_USER=...
SMTP_PASS=...
```

---

## Git Tags

```bash
# List all version tags
git tag -l "v*"

# Show tag details
git show v1.6.0

# Checkout specific version
git checkout v1.6.0
```

---

## Deployment

### Current Production Version
**Version:** v1.6.2
**Deployed:** TBD
**Environment:** Production

### Staging
**Version:** v1.6.2
**Environment:** Staging
**URL:** https://staging.prorab.space

---

## Upgrade Path

### From v1.6.0 to v1.6.2

**No breaking changes** - Safe to upgrade directly.

**Steps:**

1. Pull latest code: `git pull origin main`
2. Install dependencies: `pnpm install`
3. Update environment variables: `NEXT_PUBLIC_APP_VERSION=1.6.2`
4. **Setup payment providers:**

   ```bash
   cd apps/api
   pnpm prisma:seed:providers
   ```

5. Build: `pnpm build`
6. Restart services

**Database Setup Required:**

- Run `pnpm prisma:seed:providers` to create payment provider records
- Or follow instructions in [QUICK_FIX.md](QUICK_FIX.md) for manual setup

**Database Migrations:** None required (schema unchanged)

### From v1.5.0 to v1.6.0

**No breaking changes** - Safe to upgrade directly.

**Steps:**

1. Pull latest code: `git pull origin main`
2. Install dependencies: `pnpm install`
3. Update environment variables (add `NEXT_PUBLIC_APP_VERSION`)
4. Build: `pnpm build`
5. Restart services

**Database Migrations:** None required (schema unchanged)

**Configuration Required:**

- Set up payment providers in admin panel
- Configure at least one provider as primary
- Test payment flow on staging

---

## Version Scheme

ProRab follows **Semantic Versioning** (SemVer):

**Format:** `MAJOR.MINOR.PATCH`

- **MAJOR:** Breaking changes, major rewrites
- **MINOR:** New features, backward compatible
- **PATCH:** Bug fixes, minor improvements

**Examples:**
- `1.6.0` → New features (subscription system)
- `1.6.1` → Bug fix
- `2.0.0` → Breaking changes

---

## Release Checklist

Before tagging a new version:

- [ ] Update `package.json` in root
- [ ] Update `apps/api/package.json`
- [ ] Update `apps/web/package.json`
- [ ] Update `apps/web/.env` with `NEXT_PUBLIC_APP_VERSION`
- [ ] Update this `VERSION.md` file
- [ ] Update changelog documents
- [ ] Create git tag: `git tag -a vX.Y.Z -m "Release message"`
- [ ] Push tag: `git push origin vX.Y.Z`

---

## Documentation

For detailed information about v1.6.0:

- **Testing Guide:** `docs/testing/custom_tests/v1.6.0.md`
- **Release Summary:** `docs/changelog/v1.6.0_SUMMARY.md`
- **Integration Guide:** `docs/features/SUBSCRIPTION_INTEGRATION.md`
- **Production Readiness:** `docs/PRODUCTION_READINESS_v1.6.0.md`

---

## Support

**Issues:** https://github.com/your-org/prorab/issues
**Changelog:** `docs/changelog/`
**Documentation:** `docs/`

---

**Last Updated:** 2025-12-28
**Next Version:** v1.7.0 (TBD)
