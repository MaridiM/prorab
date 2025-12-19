# Stage 15: Admin Panel Usage Guide - Subscription Plans & Payment Providers

**Version:** v0.10.0
**Last Updated:** 2025-12-19
**Target Audience:** System Administrators

## Overview

This guide provides step-by-step instructions for managing subscription plans and payment providers through the ProRab admin panel. These features allow you to configure pricing, manage payment gateways, and monitor subscription analytics.

## Table of Contents

1. [Accessing Admin Panel](#accessing-admin-panel)
2. [Managing Subscription Plans](#managing-subscription-plans)
3. [Managing Payment Providers](#managing-payment-providers)
4. [Best Practices](#best-practices)
5. [Common Tasks](#common-tasks)
6. [Troubleshooting](#troubleshooting)

---

## Accessing Admin Panel

### Prerequisites

**Required Role:** Administrator
**Required Permissions:**
- `plans:view` - View subscription plans
- `plans:manage` - Create, edit, delete plans
- `payment_providers:view` - View payment provider settings
- `payment_providers:manage` - Configure payment providers

### Login

1. Navigate to `https://your-domain.com/admin`
2. Sign in with your admin credentials
3. If you don't have admin access, contact your system administrator

### Navigation

The admin sidebar contains two new menu items:

- **Subscription Plans** (Package icon) - `/admin/plans`
- **Payment Providers** (Wallet icon) - `/admin/payment-providers`

---

## Managing Subscription Plans

### Viewing Plans List

**Path:** `/admin/plans`

The Plans page displays:

**Stats Cards:**
- **Total Plans** - All plans in the system (active + archived)
- **Active Plans** - Currently visible to customers
- **Total Subscriptions** - Number of active subscriptions across all plans
- **Currencies** - Number of supported currencies

**Plans Table:**
- Plan name and slug
- Status badge (Active/Archived)
- Project, member, and storage limits
- Pricing in all currencies (RUB, USD, EUR)
- Number of active subscriptions
- Action menu (⋮)

---

### Filtering and Searching Plans

**Status Filter:**
1. Click the "Status" dropdown in the toolbar
2. Select:
   - **All Status** - Show all plans
   - **Active** - Show only active plans
   - **Archived** - Show only archived plans

**Search:**
1. Enter search query in the search box
2. Search matches plan name or slug (case-insensitive)
3. Clear search to show all plans

**Currency Filter:**
1. Click the "Currency" dropdown (if available)
2. Select RUB, USD, or EUR to view pricing in specific currency

---

### Understanding Plan Details

Each plan card shows:

**Basic Information:**
- **Name** - Display name (e.g., "Foreman")
- **Slug** - URL-friendly identifier (e.g., "foreman")
- **Status Badge** - Active (green) or Archived (gray)
- **Popular Badge** - "Популярный" for featured plans

**Limits:**
- **Max Projects** - Maximum active projects (null = unlimited)
- **Max Members** - Maximum team members
- **Storage** - Storage quota in GB

**Pricing:**
- **RUB** - Russian Ruble pricing
- **USD** - US Dollar pricing
- **EUR** - Euro pricing
- **Early Bird** - Discounted price (if applicable)

**Metrics:**
- **Subscriptions** - Number of teams using this plan

---

### Creating a New Plan

**Note:** Plan creation UI is planned for future release. Currently, plans must be created via:
1. Direct database insertion
2. GraphQL mutation (see API Documentation)
3. Seed script (`apps/api/prisma/seed-plans.ts`)

**Recommended Approach (Seed Script):**

```bash
cd apps/api
# Edit prisma/seed-plans.ts to add your plan
pnpm tsx prisma/seed-plans.ts
```

**Plan Data Structure:**
```typescript
{
  name: "Premium",
  slug: "premium",
  description: "For large construction companies",
  maxActiveProjects: 20,
  maxMembers: 30,
  storageGB: 50,
  isPopular: false,
  isEarlyBird: true,
  sortOrder: 2,
  prices: [
    { currency: "RUB", price: 4990, earlyBirdPrice: 3990, billingCycleDays: 30 },
    { currency: "USD", price: 49, earlyBirdPrice: 39, billingCycleDays: 30 },
    { currency: "EUR", price: 45, earlyBirdPrice: 35, billingCycleDays: 30 }
  ],
  features: [
    { name: "Priority support", description: "24/7 priority support", isIncluded: true, sortOrder: 0 },
    { name: "Advanced analytics", description: "Advanced analytics dashboard", isIncluded: true, sortOrder: 1 }
  ]
}
```

---

### Editing a Plan

**Note:** Plan editing UI is planned for future release. Currently use GraphQL mutation:

**GraphQL Mutation:**
```graphql
mutation UpdatePlan($id: String!, $input: UpdatePlanInput!) {
  adminUpdatePlan(id: $id, input: $input) {
    id
    name
    maxMembers
  }
}
```

**Variables:**
```json
{
  "id": "plan-uuid-here",
  "input": {
    "maxMembers": 15,
    "description": "Updated description"
  }
}
```

---

### Archiving a Plan

**Purpose:** Hide a plan from the public pricing page without deleting it.

**When to Archive:**
- Discontinuing a plan but want to preserve data
- Temporarily removing a plan from sale
- Plan is no longer competitive

**Steps:**
1. Locate the plan in the plans list
2. Click the "⋮" (More) button
3. Select "Archive Plan"
4. Confirm the action

**What Happens:**
- ✅ Plan is hidden from `/pricing` page
- ✅ Existing subscriptions continue unaffected
- ✅ Plan data is preserved (can be reactivated)
- ✅ Status badge changes to "Archived" (gray)

**Important:**
- Archived plans do NOT affect existing customers
- Customers on archived plans can still renew
- New customers cannot select archived plans

---

### Activating an Archived Plan

**Purpose:** Make an archived plan available for purchase again.

**Steps:**
1. Filter by "Archived" status
2. Locate the archived plan
3. Click the "⋮" (More) button
4. Select "Activate Plan"
5. Confirm the action

**What Happens:**
- ✅ Plan appears on `/pricing` page
- ✅ New customers can subscribe
- ✅ Status badge changes to "Active" (green)

---

### Deleting a Plan

**⚠️ Warning:** Deletion is permanent and cannot be undone.

**When to Delete:**
- Test plans created during development
- Plans created by mistake
- Plans with zero subscriptions and no historical value

**Restrictions:**
- Cannot delete plans with active subscriptions
- Delete button is disabled if `subscriptionsCount > 0`

**Steps:**
1. Ensure plan has 0 subscriptions
2. Archive the plan first (recommended)
3. Click the "⋮" (More) button
4. Select "Delete Plan" (only enabled if no subscriptions)
5. Confirm deletion (permanent)

**What Gets Deleted:**
- ❌ Plan record
- ❌ All associated prices (RUB, USD, EUR)
- ❌ All associated features
- ❌ Cannot be recovered

**Best Practice:**
- Use Archive instead of Delete for discontinued plans
- Only delete test/development plans
- Always verify subscription count before deleting

---

## Managing Payment Providers

### Viewing Payment Providers

**Path:** `/admin/payment-providers`

The Payment Providers page displays all configured payment gateways.

**Default Providers:**
- **ЮKassa (Yookassa)** - Russian payment gateway
- **Stripe** - International payment gateway

**Provider Information:**
- Provider name and type
- Configuration status (✓ configured, ✗ missing)
- Primary badge (for default provider)
- Webhook URL for integration
- Action menu (⋮)

---

### Understanding Provider Status

Each provider shows configuration status for:

**Yookassa:**
- ✓ **Shop ID** - Yookassa shop identifier
- ✓ **Secret Key** - API secret key (encrypted)
- ✓ **Webhook Secret** - Webhook signature verification key (encrypted)

**Stripe:**
- ✓ **Secret Key** - Stripe API secret key (encrypted)
- ✓ **Publishable Key** - Stripe publishable key (encrypted)
- ✓ **Webhook Secret** - Stripe webhook signing secret (encrypted)

**Status Indicators:**
- ✓ **Green checkmark** - Configured and stored securely
- ✗ **Red X** - Not configured (required)

---

### Setting Primary Provider

**Purpose:** Designate which payment provider to use by default for new subscriptions.

**Steps:**
1. Locate the provider you want to set as primary
2. Click the "⋮" (More) button
3. Select "Set as Primary"
4. Provider card now shows "Primary" badge

**What Happens:**
- ✅ Selected provider becomes default for new payments
- ✅ Previous primary provider loses primary status (only one can be primary)
- ✅ System uses this provider for checkout flows

**Important:**
- Only one provider can be primary at a time
- Existing subscriptions are not affected
- Changing primary affects new subscriptions only

---

### Configuring Payment Provider

**Note:** Configuration UI is planned for future release. Currently use GraphQL mutation or direct database update.

**Method 1: GraphQL Mutation**

```graphql
mutation UpdateProvider($type: PaymentProviderType!, $input: UpdatePaymentProviderInput!) {
  adminUpdatePaymentProvider(type: $type, input: $input) {
    id
    type
    configStatus {
      hasShopId
      hasSecretKey
      hasWebhookSecret
    }
  }
}
```

**Variables (Yookassa):**
```json
{
  "type": "YOOKASSA",
  "input": {
    "isActive": true,
    "isPrimary": true,
    "shopId": "123456",
    "secretKey": "live_xxxxxxxxxxxxxxxxxxxx",
    "webhookSecret": "webhook_secret_xxxxxxxxxxxxx"
  }
}
```

**Variables (Stripe):**
```json
{
  "type": "STRIPE",
  "input": {
    "isActive": true,
    "isPrimary": false,
    "secretKey": "sk_live_xxxxxxxxxxxxxxxxxxxxx",
    "publishableKey": "pk_live_xxxxxxxxxxxxxxxxxxxxx",
    "webhookSecret": "whsec_xxxxxxxxxxxxxxxxxxxxx"
  }
}
```

**Security:**
- All secrets are automatically encrypted using AES-256-GCM
- Secrets are never exposed in API responses
- Stored in SystemSettings table with encryption

**Method 2: Migration Script (First-time Setup)**

For Yookassa:
```bash
cd apps/api
# Ensure .env has YOOKASSA_SHOP_ID, YOOKASSA_SECRET_KEY, YOOKASSA_WEBHOOK_SECRET
pnpm tsx scripts/migrate-yookassa-to-systemsettings.ts
```

This reads from `.env` and migrates to encrypted SystemSettings.

---

### Webhook URL Configuration

Each provider has a unique webhook URL for receiving payment notifications.

**Yookassa Webhook URL:**
```
https://your-domain.com/api/webhooks/payments/yookassa
```

**Stripe Webhook URL:**
```
https://your-domain.com/api/webhooks/payments/stripe
```

**Setup Steps:**

**For Yookassa:**
1. Login to [Yookassa Dashboard](https://yookassa.ru/)
2. Navigate to Settings → Notifications
3. Add HTTP notification URL: `https://your-domain.com/api/webhooks/payments/yookassa`
4. Copy webhook secret and add to provider configuration

**For Stripe:**
1. Login to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Navigate to Developers → Webhooks
3. Add endpoint: `https://your-domain.com/api/webhooks/payments/stripe`
4. Select events: `checkout.session.completed`, `invoice.paid`, `customer.subscription.updated`
5. Copy webhook signing secret and add to provider configuration

---

### Testing Payment Provider

**Purpose:** Verify that provider credentials are correct and API is accessible.

**Steps:**
1. Ensure provider is configured (all fields have ✓)
2. Click the "⋮" (More) button on the provider
3. Select "Test Connection"
4. Wait for test to complete

**Success Result:**
- ✅ Green success message: "Provider connection successful"
- Provider is ready to accept payments

**Failure Result:**
- ❌ Red error message with details (e.g., "Invalid API credentials")
- Review configuration and update credentials

**What Gets Tested:**
- API endpoint connectivity
- Credential validity
- Basic API operations (list/create test objects)

---

### Clearing Provider Cache

**Purpose:** Force reload of provider configuration after making changes.

**When to Clear Cache:**
- After updating provider credentials
- After changing provider status
- Provider seems to use old configuration

**Steps:**
1. Click the "⋮" (More) button on the provider
2. Select "Clear Cache"
3. Cache is immediately cleared

**What Happens:**
- ✅ Cached provider instance is removed
- ✅ Next payment request creates fresh provider instance
- ✅ New configuration is loaded from database

---

## Best Practices

### Plan Management

**Naming Conventions:**
- Use clear, descriptive plan names (e.g., "Lite", "Foreman", "Brigade")
- Keep slugs lowercase, hyphen-separated (e.g., "lite", "foreman-pro")
- Avoid special characters in slugs

**Pricing Strategy:**
- Set prices consistently across currencies (use exchange rates)
- Offer Early Bird pricing for new features or promotions
- Update prices in all currencies simultaneously

**Feature Organization:**
- Order features by importance (use `sortOrder`)
- Group related features together
- Use clear, benefit-focused feature names
- Provide descriptions for complex features

**Plan Lifecycle:**
- Archive old plans instead of deleting them
- Keep plan data for reporting and analytics
- Monitor subscription counts before making changes

---

### Payment Provider Management

**Security:**
- Never share API credentials publicly
- Rotate secrets periodically (every 90 days recommended)
- Use environment variables for development
- Use SystemSettings (encrypted) for production

**Testing:**
- Always test provider connection after configuration
- Test webhooks using provider's dashboard tools
- Monitor webhook logs for errors

**Primary Provider:**
- Set Yookassa as primary for Russian market
- Set Stripe as primary for international market
- Document which provider is active for billing

**Backup Provider:**
- Keep both providers configured and tested
- Ability to switch quickly if one fails
- Monitor both providers for uptime

---

### Multi-Currency Support

**Currency Selection:**
- Default to RUB for Russian users
- Detect user location and suggest appropriate currency
- Allow users to switch currencies on pricing page

**Pricing Consistency:**
- Use consistent exchange rates for all plans
- Update all currencies when changing prices
- Round prices to avoid odd amounts (e.g., 990 instead of 987)

**Provider-Currency Mapping:**
- Yookassa: Supports RUB, USD, EUR
- Stripe: Supports all major currencies
- Ensure provider supports selected currency before processing

---

## Common Tasks

### Task 1: Add a New Subscription Plan

**Scenario:** Company wants to add "Enterprise" plan for large teams.

**Steps:**
1. Create plan data structure (see [Creating a New Plan](#creating-a-new-plan))
2. Add to seed script or use GraphQL mutation
3. Verify plan appears in admin panel (`/admin/plans`)
4. Check pricing page shows new plan (`/pricing`)
5. Test plan selection and checkout flow

**Checklist:**
- [ ] Plan has prices for RUB, USD, EUR
- [ ] Features are ordered correctly
- [ ] Early Bird pricing set (if applicable)
- [ ] Plan appears on public pricing page
- [ ] Checkout flow works for new plan

---

### Task 2: Discontinue a Plan

**Scenario:** "Lite" plan is being discontinued but existing customers should keep access.

**Steps:**
1. Navigate to `/admin/plans`
2. Locate "Lite" plan
3. Click "⋮" → "Archive Plan"
4. Verify plan is hidden from `/pricing`
5. Verify existing subscriptions show "Lite" in admin panel
6. Communicate change to customers

**Checklist:**
- [ ] Plan archived in admin panel
- [ ] Plan hidden from public pricing page
- [ ] Existing "Lite" subscriptions unchanged
- [ ] Customers notified of discontinuation
- [ ] Documentation updated

---

### Task 3: Switch Payment Providers

**Scenario:** Switch from Yookassa to Stripe as primary provider.

**Steps:**
1. Navigate to `/admin/payment-providers`
2. Ensure Stripe is fully configured (all ✓)
3. Test Stripe connection (⋮ → Test Connection)
4. Click ⋮ on Stripe → "Set as Primary"
5. Verify "Primary" badge moved to Stripe
6. Clear cache on both providers (⋮ → Clear Cache)
7. Test new subscription creation

**Checklist:**
- [ ] Stripe configured and tested
- [ ] Stripe set as primary provider
- [ ] Cache cleared for both providers
- [ ] New subscriptions use Stripe
- [ ] Existing subscriptions unaffected
- [ ] Monitor for errors in first 24 hours

---

### Task 4: Update Pricing for All Plans

**Scenario:** Increase prices by 10% across all plans.

**Steps:**
1. Calculate new prices for each plan and currency
2. Use GraphQL mutations to update each plan
3. Verify changes in admin panel (`/admin/plans`)
4. Verify changes on pricing page (`/pricing`)
5. Test checkout with new prices

**Example GraphQL:**
```graphql
mutation UpdatePlanPrices($id: String!, $input: UpdatePlanInput!) {
  adminUpdatePlan(id: $id, input: $input) {
    id
    prices {
      currency
      price
    }
  }
}
```

**Checklist:**
- [ ] New prices calculated correctly
- [ ] All currencies updated (RUB, USD, EUR)
- [ ] Changes verified in admin panel
- [ ] Pricing page shows new prices
- [ ] Existing subscriptions grandfathered (price locked)
- [ ] Customers notified of price changes

---

### Task 5: Configure Stripe for First Time

**Scenario:** Company expanding internationally, need to add Stripe.

**Steps:**
1. Create Stripe account at [stripe.com](https://stripe.com)
2. Activate account and complete business verification
3. Navigate to Developers → API keys
4. Copy "Secret key" and "Publishable key"
5. Navigate to Developers → Webhooks
6. Add endpoint: `https://your-domain.com/api/webhooks/payments/stripe`
7. Select events: `checkout.session.completed`, `invoice.paid`, `customer.subscription.updated`, `customer.subscription.deleted`
8. Copy "Signing secret"
9. Use GraphQL mutation to configure provider (see [Configuring Payment Provider](#configuring-payment-provider))
10. Test connection in admin panel
11. Create test subscription to verify

**Checklist:**
- [ ] Stripe account created and verified
- [ ] API keys copied (secret + publishable)
- [ ] Webhook endpoint configured
- [ ] Webhook secret copied
- [ ] Provider configured via GraphQL
- [ ] Connection test successful
- [ ] Test subscription processed successfully

---

## Troubleshooting

### Issue: Plan not showing on pricing page

**Possible Causes:**
- Plan is archived (`isActive = false`)
- Plan has no prices in selected currency
- Plan `sortOrder` is very high (pushed below fold)

**Solutions:**
1. Check plan status in admin panel
2. Verify plan has prices for RUB, USD, EUR
3. Activate plan if archived
4. Adjust `sortOrder` to control position

---

### Issue: Payment provider test fails

**Possible Causes:**
- Invalid API credentials
- Credentials from test mode used in production (or vice versa)
- Network/firewall blocking API access
- Provider account not activated

**Solutions:**
1. Verify credentials in provider dashboard
2. Ensure using correct environment (test vs live)
3. Check network connectivity to provider API
4. Activate provider account if needed
5. Clear provider cache and retry

---

### Issue: Webhook not receiving events

**Possible Causes:**
- Webhook URL not configured in provider dashboard
- Webhook secret mismatch
- SSL certificate issues
- Firewall blocking incoming webhooks

**Solutions:**
1. Verify webhook URL in provider dashboard
2. Check webhook secret matches configuration
3. Ensure HTTPS is enabled with valid certificate
4. Configure firewall to allow provider IPs
5. Check webhook logs in provider dashboard

---

### Issue: Cannot delete plan

**Cause:** Plan has active subscriptions (`subscriptionsCount > 0`)

**Solution:**
- Plans with subscriptions cannot be deleted (data integrity)
- Use Archive instead to hide plan
- Wait until all subscriptions end, then delete
- Or keep archived indefinitely for records

---

### Issue: Currency prices not displaying

**Possible Causes:**
- Price record missing for currency
- Price marked as inactive (`isActive = false`)
- Currency parameter not passed to GraphQL query

**Solutions:**
1. Check plan has price for each currency in database
2. Verify price `isActive = true`
3. Ensure GraphQL query passes currency parameter
4. Add missing price records via seed script

---

### Issue: Subscription stuck in pending

**Possible Causes:**
- Payment provider not responding
- Webhook not configured
- Payment failed but webhook not received

**Solutions:**
1. Check payment status in provider dashboard
2. Verify webhook is configured and receiving events
3. Check webhook logs for errors
4. Manually update subscription status via database (last resort)

---

## Additional Resources

- **API Documentation:** `docs/STAGE_15_API_DOCUMENTATION.md`
- **Testing Guide:** `docs/STAGE_15_TESTING_GUIDE.md`
- **Stage 15 Specification:** `docs/stages/STAGE_15_SUBSCRIPTION_PLANS_MANAGEMENT.md`
- **Migration Scripts:** `apps/api/scripts/migrate-*.ts`
- **Seed Data:** `apps/api/prisma/seed-plans.ts`

---

## Support

For technical support or questions about admin panel features:

1. **Documentation:** Check relevant docs in `/docs` folder
2. **GraphQL Playground:** Test queries at `http://localhost:4000/graphql`
3. **Database Console:** Use Prisma Studio (`pnpm prisma:studio`)
4. **Backend Team:** Contact for API-related issues
5. **Frontend Team:** Contact for UI-related issues

---

**Guide Version:** 1.0
**Last Updated:** 2025-12-19
**Next Review:** After Stage 15 completion
