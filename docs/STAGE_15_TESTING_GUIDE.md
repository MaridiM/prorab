# Stage 15: Subscription Plans & Payment Providers - Testing Guide

**Stage:** 15 - Subscription Plans & Payment Providers Management
**Phase:** 7 - Testing & Documentation
**Version:** v0.10.0
**Last Updated:** 2025-12-19

## Overview

This guide provides comprehensive testing procedures for all Stage 15 features. Follow these test scenarios to verify that subscription plans management and payment provider integration are working correctly.

## Testing Prerequisites

### Required Access
- Admin user account with permissions:
  - `plans:view`
  - `plans:manage`
  - `payment_providers:view`
  - `payment_providers:manage`

### Test Data
The seed data includes:
- **3 Plans:** Lite, Foreman, Brigade
- **9 Prices:** 3 currencies (RUB, USD, EUR) × 3 plans
- **21 Features:** 7 features × 3 plans
- **2 Payment Providers:** Yookassa, Stripe

### Environment Setup
```bash
# Ensure database is seeded
cd apps/api
pnpm prisma:seed

# Start development servers
pnpm dev  # Run from root (starts both API and Web)
```

## Test Scenarios

### 1. Admin Plans Management

#### 1.1 View Plans List
**Steps:**
1. Navigate to `/admin/plans`
2. Verify the page loads without errors
3. Check stats cards show correct counts:
   - Total Plans
   - Active Plans
   - Total Subscriptions
   - Currencies

**Expected Results:**
- ✅ Page loads successfully
- ✅ 3 plans are displayed (Lite, Foreman, Brigade)
- ✅ Stats cards show accurate data
- ✅ Each plan shows pricing in multiple currencies

**Screenshot:** Admin Plans List

---

#### 1.2 Filter Plans by Status
**Steps:**
1. On `/admin/plans`, click the "Status" dropdown
2. Select "Active"
3. Verify only active plans are shown
4. Select "Archived"
5. Verify only archived plans are shown (should be empty initially)
6. Select "All Status"

**Expected Results:**
- ✅ Active filter shows all 3 plans
- ✅ Archived filter shows 0 plans
- ✅ All Status shows all plans

---

#### 1.3 Search Plans
**Steps:**
1. On `/admin/plans`, enter "Foreman" in search box
2. Verify only "Foreman" plan is shown
3. Clear search box
4. Enter "pro" in search box
5. Verify all plans containing "pro" are shown

**Expected Results:**
- ✅ Search filters plans correctly
- ✅ Search is case-insensitive
- ✅ Clearing search shows all plans again

---

#### 1.4 View Plan Details
**Steps:**
1. On `/admin/plans`, locate the "Foreman" plan
2. Verify the following details are displayed:
   - Plan name: "Foreman"
   - Slug: "foreman"
   - Status badge: "Active"
   - Max Projects: 5
   - Max Members: 10
   - Storage: 20 GB
   - Prices for RUB, USD, EUR
   - Subscriptions count

**Expected Results:**
- ✅ All plan details are visible
- ✅ Pricing shows in all 3 currencies
- ✅ Popular badge shows if `isPopular === true`

---

#### 1.5 Plan Actions Menu
**Steps:**
1. Click the "⋮" (More) button on any plan
2. Verify the dropdown menu shows:
   - Edit Plan
   - Archive Plan (or Activate Plan if archived)
   - Delete Plan (should be disabled if has subscriptions)

**Expected Results:**
- ✅ Actions menu opens correctly
- ✅ Delete is disabled for plans with active subscriptions
- ✅ Archive/Activate toggles based on plan status

---

### 2. Admin Payment Providers Management

#### 2.1 View Payment Providers List
**Steps:**
1. Navigate to `/admin/payment-providers`
2. Verify the page loads without errors
3. Check that 2 providers are shown:
   - Yookassa
   - Stripe

**Expected Results:**
- ✅ Page loads successfully
- ✅ Both providers are displayed
- ✅ Configuration status shows for each provider
- ✅ Webhook URLs are displayed

---

#### 2.2 View Provider Configuration Status
**Steps:**
1. On `/admin/payment-providers`, locate Yookassa provider
2. Check configuration status badges:
   - Shop ID: ✓ (should be green if configured)
   - Secret Key: ✓
   - Webhook Secret: ✓
3. Repeat for Stripe provider (may show ✗ if not configured)

**Expected Results:**
- ✅ Yookassa shows all green checkmarks (configured via migration)
- ✅ Stripe may show red X marks (not configured by default)
- ✅ Status badges are color-coded (green = configured, red = missing)

---

#### 2.3 View Webhook URLs
**Steps:**
1. On `/admin/payment-providers`, check webhook URL for each provider
2. Verify format:
   - Yookassa: `{baseUrl}/api/webhooks/payments/yookassa`
   - Stripe: `{baseUrl}/api/webhooks/payments/stripe`

**Expected Results:**
- ✅ Webhook URLs are correctly formatted
- ✅ URLs use the application's base URL
- ✅ URLs are copyable (click to copy feature)

---

#### 2.4 Provider Actions Menu
**Steps:**
1. Click the "⋮" (More) button on Yookassa provider
2. Verify the dropdown menu shows:
   - Configure Provider
   - Test Connection
   - Set as Primary (or "Primary" badge if already primary)
   - Clear Cache

**Expected Results:**
- ✅ Actions menu opens correctly
- ✅ Primary provider shows "Primary" badge
- ✅ All actions are clickable

---

### 3. Public Pricing Page

#### 3.1 View Pricing Page
**Steps:**
1. Navigate to `/pricing` (public page, no login required)
2. Verify the page loads without errors
3. Check that all sections are visible:
   - Hero section with Early Bird banner
   - Currency selector
   - Pricing cards (3 plans)
   - Feature comparison table
   - FAQ section
   - CTA section

**Expected Results:**
- ✅ Page loads successfully for anonymous users
- ✅ All 3 plans are displayed
- ✅ Default currency is RUB
- ✅ All sections render correctly

---

#### 3.2 Currency Selection
**Steps:**
1. On `/pricing`, locate the currency selector dropdown
2. Click the dropdown (shows Globe icon)
3. Verify 3 currencies are listed:
   - ₽ Российский рубль
   - $ Доллар США
   - € Евро
4. Select "$ Доллар США"
5. Verify all prices update to USD
6. Select "€ Евро"
7. Verify all prices update to EUR
8. Select "₽ Российский рубль" to return to default

**Expected Results:**
- ✅ Currency selector opens correctly
- ✅ Prices update in real-time when currency changes
- ✅ No page reload occurs
- ✅ Pricing cards show correct currency symbol
- ✅ Feature comparison table updates (if prices shown)

---

#### 3.3 Plan Cards Display
**Steps:**
1. On `/pricing` with RUB selected
2. Verify "Foreman" plan card shows:
   - Plan name: "Foreman"
   - Price: Regular price and Early Bird price
   - Features list:
     - "5 активных проекта"
     - "До 10 участников команды"
     - "20 ГБ хранилища"
     - Additional features from database
   - "Выбрать план" button

**Expected Results:**
- ✅ All plan details are visible
- ✅ Early Bird pricing displays if `earlyBirdPrice` exists
- ✅ Features are in correct order (sortOrder)
- ✅ Russian pluralization is correct

---

#### 3.4 Popular Plan Badge
**Steps:**
1. On `/pricing`, locate the plan marked as popular (typically "Foreman")
2. Verify "Популярный" badge appears above the card

**Expected Results:**
- ✅ Popular badge shows for `isPopular === true` plans
- ✅ Badge has correct styling (primary gradient)
- ✅ Only one plan should be marked as popular

---

#### 3.5 Feature Comparison Table
**Steps:**
1. On `/pricing`, scroll to "Сравнение функций" section
2. Verify table structure:
   - Header row with plan names
   - Row for "Активные проекты"
   - Row for "Участники команды"
   - Row for "Хранилище"
   - Rows for each additional feature
3. Check that features show:
   - ✓ (green checkmark) if included
   - "—" (dash) if not included

**Expected Results:**
- ✅ Table displays all plans side-by-side
- ✅ All features are listed
- ✅ Checkmarks appear for included features
- ✅ Table is horizontally scrollable on mobile

---

#### 3.6 Call-to-Action Buttons
**Steps:**
1. On `/pricing`, click "Выбрать план" on any plan card
2. Verify redirect to `/auth/signup`
3. Go back to `/pricing`
4. Scroll to bottom CTA section
5. Click "Начать 14-дневный триал" button
6. Verify redirect to `/auth/signup`

**Expected Results:**
- ✅ Both CTA buttons redirect to signup
- ✅ No errors occur during navigation
- ✅ User can return to pricing page

---

### 4. GraphQL API Testing

#### 4.1 Query: GetAvailablePlans (Public)
**GraphQL Query:**
```graphql
query GetAvailablePlans($currency: String!) {
  availablePlans(currency: $currency) {
    id
    name
    slug
    description
    maxActiveProjects
    maxMembers
    storageGB
    isPopular
    isEarlyBird
    prices {
      id
      currency
      price
      earlyBirdPrice
      billingCycleDays
    }
    features {
      id
      name
      description
      isIncluded
      sortOrder
    }
  }
}
```

**Variables:**
```json
{
  "currency": "RUB"
}
```

**Steps:**
1. Open GraphQL Playground at `http://localhost:4000/graphql`
2. Execute the query with RUB currency
3. Repeat with USD and EUR

**Expected Results:**
- ✅ Query returns 3 plans
- ✅ Only active plans are returned (`isActive === true`)
- ✅ Each plan has prices for the requested currency
- ✅ Features are included with `isIncluded` flag
- ✅ Features are sorted by `sortOrder`

---

#### 4.2 Query: GetAdminPlans (Admin Only)
**GraphQL Query:**
```graphql
query GetAdminPlans($isActive: Boolean, $search: String) {
  adminPlans(isActive: $isActive, search: $search) {
    id
    name
    slug
    isActive
    maxActiveProjects
    maxMembers
    storageGB
    isPopular
    subscriptionsCount
    prices {
      id
      currency
      price
      earlyBirdPrice
    }
    features {
      id
      name
      isIncluded
    }
  }
}
```

**Variables:**
```json
{
  "isActive": null,
  "search": null
}
```

**Steps:**
1. Login as admin user
2. Execute the query without filters
3. Execute with `"isActive": true`
4. Execute with `"search": "Foreman"`

**Expected Results:**
- ✅ Query requires admin authentication
- ✅ Returns all plans when no filters applied
- ✅ Filters work correctly (status, search)
- ✅ `subscriptionsCount` field is populated

---

#### 4.3 Query: GetAdminPaymentProviders
**GraphQL Query:**
```graphql
query GetAdminPaymentProviders($baseUrl: String) {
  adminPaymentProviders(baseUrl: $baseUrl) {
    id
    type
    name
    isActive
    isPrimary
    webhookUrl
    configStatus {
      hasShopId
      hasSecretKey
      hasWebhookSecret
      hasPublishableKey
    }
  }
}
```

**Variables:**
```json
{
  "baseUrl": "http://localhost:3000"
}
```

**Steps:**
1. Login as admin user
2. Execute the query with local baseUrl

**Expected Results:**
- ✅ Query requires admin authentication
- ✅ Returns 2 providers (Yookassa, Stripe)
- ✅ Webhook URLs are correctly formatted
- ✅ Configuration status shows correct boolean values
- ✅ One provider has `isPrimary === true`

---

### 5. Database Validation

#### 5.1 Verify Plans Table
**SQL Query:**
```sql
SELECT id, name, slug, "isActive", "maxActiveProjects", "maxMembers", "storageGB", "isPopular"
FROM "Plan"
ORDER BY "sortOrder";
```

**Expected Results:**
- ✅ 3 rows returned (Lite, Foreman, Brigade)
- ✅ All plans have `isActive = true`
- ✅ `sortOrder` is sequential (0, 1, 2)

---

#### 5.2 Verify PlanPrice Table
**SQL Query:**
```sql
SELECT pp.id, p.name as plan_name, pp.currency, pp.price, pp."earlyBirdPrice"
FROM "PlanPrice" pp
JOIN "Plan" p ON pp."planId" = p.id
ORDER BY p."sortOrder", pp.currency;
```

**Expected Results:**
- ✅ 9 rows returned (3 plans × 3 currencies)
- ✅ Each plan has EUR, RUB, USD prices
- ✅ Early Bird prices are set (typically 200-500 less)
- ✅ All `billingCycleDays = 30`

---

#### 5.3 Verify PlanFeature Table
**SQL Query:**
```sql
SELECT pf.id, p.name as plan_name, pf.name as feature_name, pf."isIncluded", pf."sortOrder"
FROM "PlanFeature" pf
JOIN "Plan" p ON pf."planId" = p.id
ORDER BY p."sortOrder", pf."sortOrder";
```

**Expected Results:**
- ✅ 21 rows returned (7 features × 3 plans)
- ✅ Features are sorted correctly
- ✅ Higher-tier plans include more features (`isIncluded = true`)

---

#### 5.4 Verify PaymentProvider Table
**SQL Query:**
```sql
SELECT id, type, name, "isActive", "isPrimary", "createdAt"
FROM "PaymentProvider"
ORDER BY "isPrimary" DESC, type;
```

**Expected Results:**
- ✅ 2 rows returned (YOOKASSA, STRIPE)
- ✅ Both have `isActive = true`
- ✅ Only one has `isPrimary = true` (typically Yookassa)

---

#### 5.5 Verify Subscription Migration
**SQL Query:**
```sql
SELECT
  s.id,
  s.plan as old_plan_enum,
  p.name as new_plan_name,
  s.currency
FROM "Subscription" s
LEFT JOIN "Plan" p ON s."planId" = p.id
LIMIT 10;
```

**Expected Results:**
- ✅ All subscriptions have `planId` set (not NULL)
- ✅ `plan` enum matches `new_plan_name` (LITE → Lite, etc.)
- ✅ All subscriptions have `currency` set (default RUB)

---

### 6. Migration Scripts Validation

#### 6.1 Run Subscription Migration Script
**Steps:**
```bash
cd apps/api
pnpm tsx scripts/migrate-subscriptions-to-planid.ts
```

**Expected Results:**
- ✅ Script runs without errors
- ✅ Idempotent (safe to run multiple times)
- ✅ All subscriptions have `planId` set
- ✅ Currency defaults to RUB if missing

---

#### 6.2 Run Yookassa Settings Migration Script
**Steps:**
```bash
cd apps/api
pnpm tsx scripts/migrate-yookassa-to-systemsettings.ts
```

**Expected Results:**
- ✅ Script runs without errors
- ✅ Creates SystemSettings records:
  - `payment.yookassa.shopId`
  - `payment.yookassa.secretKey` (encrypted)
  - `payment.yookassa.webhookSecret` (encrypted)
- ✅ Validates encryption by decrypting

---

#### 6.3 Run Migration Validation Script
**Steps:**
```bash
cd apps/api
pnpm tsx scripts/validate-migration.ts
```

**Expected Results:**
- ✅ All validation checks pass:
  - ✓ Plans exist with prices and features
  - ✓ All subscriptions have planId
  - ✓ Yookassa settings can be decrypted
  - ✓ Payment providers are configured
- ✅ No warnings or errors
- ✅ Summary shows "All validations passed!"

---

### 7. Error Handling & Edge Cases

#### 7.1 Plan with No Prices
**Test Scenario:** Archive all prices for a plan

**Steps:**
1. Manually update database to set `isActive = false` for all prices of one plan
2. Navigate to `/pricing`
3. Verify the plan does not appear

**Expected Results:**
- ✅ Plans without active prices are hidden from public page
- ✅ No errors or crashes occur

---

#### 7.2 Currency Not Available
**Test Scenario:** Select currency that has no prices

**Steps:**
1. On `/pricing`, select a currency (e.g., EUR)
2. If a plan has no EUR price, verify it's hidden

**Expected Results:**
- ✅ Only plans with prices in selected currency are shown
- ✅ No errors occur if plan is missing a currency

---

#### 7.3 Unauthorized Access to Admin
**Test Scenario:** Non-admin user tries to access admin pages

**Steps:**
1. Logout from admin account
2. Login as regular user (no admin permissions)
3. Navigate to `/admin/plans`

**Expected Results:**
- ✅ Access is denied
- ✅ User is redirected to `/dashboard`
- ✅ Error message is shown

---

#### 7.4 Delete Plan with Active Subscriptions
**Test Scenario:** Try to delete a plan that has subscriptions

**Steps:**
1. On `/admin/plans`, click "⋮" on a plan with subscriptions > 0
2. Verify "Delete Plan" option is disabled

**Expected Results:**
- ✅ Delete button is disabled (grayed out)
- ✅ Hover tooltip explains why (optional)
- ✅ Plan cannot be deleted via GraphQL mutation

---

### 8. Performance Testing

#### 8.1 Pricing Page Load Time
**Steps:**
1. Open DevTools (F12) → Network tab
2. Navigate to `/pricing`
3. Measure total page load time

**Expected Results:**
- ✅ Page loads in < 2 seconds
- ✅ GraphQL query completes in < 500ms
- ✅ No N+1 query issues

---

#### 8.2 Currency Switch Performance
**Steps:**
1. On `/pricing`, open DevTools → Network tab
2. Switch currency from RUB to USD
3. Measure GraphQL query time

**Expected Results:**
- ✅ Query completes in < 300ms
- ✅ UI updates smoothly without flicker
- ✅ Loading spinner appears briefly

---

#### 8.3 Admin Plans List Load Time
**Steps:**
1. Login as admin
2. Open DevTools → Network tab
3. Navigate to `/admin/plans`
4. Measure total page load time

**Expected Results:**
- ✅ Page loads in < 2 seconds
- ✅ GraphQL query completes in < 500ms
- ✅ All stats cards populate correctly

---

## Test Results Checklist

Use this checklist to track your testing progress:

### Admin Plans Management
- [ ] 1.1 View Plans List
- [ ] 1.2 Filter Plans by Status
- [ ] 1.3 Search Plans
- [ ] 1.4 View Plan Details
- [ ] 1.5 Plan Actions Menu

### Admin Payment Providers Management
- [ ] 2.1 View Payment Providers List
- [ ] 2.2 View Provider Configuration Status
- [ ] 2.3 View Webhook URLs
- [ ] 2.4 Provider Actions Menu

### Public Pricing Page
- [ ] 3.1 View Pricing Page
- [ ] 3.2 Currency Selection
- [ ] 3.3 Plan Cards Display
- [ ] 3.4 Popular Plan Badge
- [ ] 3.5 Feature Comparison Table
- [ ] 3.6 Call-to-Action Buttons

### GraphQL API Testing
- [ ] 4.1 Query: GetAvailablePlans (Public)
- [ ] 4.2 Query: GetAdminPlans (Admin Only)
- [ ] 4.3 Query: GetAdminPaymentProviders

### Database Validation
- [ ] 5.1 Verify Plans Table
- [ ] 5.2 Verify PlanPrice Table
- [ ] 5.3 Verify PlanFeature Table
- [ ] 5.4 Verify PaymentProvider Table
- [ ] 5.5 Verify Subscription Migration

### Migration Scripts Validation
- [ ] 6.1 Run Subscription Migration Script
- [ ] 6.2 Run Yookassa Settings Migration Script
- [ ] 6.3 Run Migration Validation Script

### Error Handling & Edge Cases
- [ ] 7.1 Plan with No Prices
- [ ] 7.2 Currency Not Available
- [ ] 7.3 Unauthorized Access to Admin
- [ ] 7.4 Delete Plan with Active Subscriptions

### Performance Testing
- [ ] 8.1 Pricing Page Load Time
- [ ] 8.2 Currency Switch Performance
- [ ] 8.3 Admin Plans List Load Time

## Known Issues & Limitations

### Current Limitations
1. **Plan CRUD Operations:** Admin UI shows action buttons but mutations are not yet implemented
2. **Payment Provider Configuration:** UI shows configuration status but edit form is not implemented
3. **Stripe Integration:** Stripe provider is seeded but not fully configured (requires API keys)

### Future Enhancements
- Implement plan creation/edit modals in admin panel
- Add payment provider configuration forms
- Add plan pricing history tracking
- Implement plan feature templates
- Add bulk operations for plans

## Troubleshooting

### Issue: Plans not showing on pricing page
**Solution:** Check that plans have `isActive = true` and have prices in the selected currency

### Issue: Currency selector not working
**Solution:** Verify GraphQL query has currency parameter and Apollo Client cache is not stale

### Issue: Admin pages showing 403 error
**Solution:** Verify user has admin permissions (`plans:view`, `payment_providers:view`)

### Issue: Migration scripts fail
**Solution:** Check database connection and ensure seed data exists (`pnpm prisma:seed`)

### Issue: Webhook URLs showing incorrect domain
**Solution:** Pass correct `baseUrl` parameter to GraphQL query (e.g., production domain)

## Reporting Issues

When reporting issues, include:
1. Test scenario number (e.g., "3.2 Currency Selection")
2. Steps to reproduce
3. Expected vs actual results
4. Screenshots (if applicable)
5. Browser console errors
6. GraphQL query/response (if applicable)

## Conclusion

This testing guide covers all major features of Stage 15. Complete all test scenarios before deploying to production. Use the checklist to track progress and ensure comprehensive coverage.

---

**Testing Guide Version:** 1.0
**Last Updated:** 2025-12-19
**Next Review:** Before Stage 15 production deployment
