# Stage 15: Deployment Checklist - Subscription Plans & Payment Providers

**Version:** v0.10.0
**Last Updated:** 2025-12-19
**Target Environment:** Production

## Overview

This checklist ensures a smooth deployment of Stage 15 features to production. Follow each step carefully to avoid data loss, downtime, or payment processing issues.

## Pre-Deployment Checklist

### 1. Code Review & Testing

- [ ] **All Phase 6 code reviewed and approved**
  - [ ] Backend services reviewed
  - [ ] GraphQL resolvers reviewed
  - [ ] Frontend components reviewed
  - [ ] Migration scripts reviewed

- [ ] **All tests passing**
  - [ ] Unit tests: `pnpm test` (if applicable)
  - [ ] Build tests: `pnpm build` (both API and Web)
  - [ ] Manual testing completed (see STAGE_15_TESTING_GUIDE.md)

- [ ] **Documentation complete**
  - [ ] API documentation reviewed
  - [ ] Admin guide reviewed
  - [ ] Testing guide reviewed
  - [ ] This deployment checklist reviewed

---

### 2. Database Preparation

- [ ] **Backup production database**
  ```bash
  pg_dump -h <host> -U <user> -d <database> -F c -b -v -f backup_pre_stage15_$(date +%Y%m%d).dump
  ```
  - [ ] Verify backup file size is reasonable
  - [ ] Store backup in secure location (S3, separate server)
  - [ ] Document backup location and timestamp

- [ ] **Test database migration on staging**
  - [ ] Create staging database from production backup
  - [ ] Run migration scripts on staging
  - [ ] Verify all validations pass
  - [ ] Test rollback procedures

- [ ] **Verify Prisma schema changes**
  - [ ] Review `apps/api/prisma/schema.prisma` changes
  - [ ] Ensure no breaking changes to existing models
  - [ ] Check indexes are created for foreign keys

---

### 3. Environment Configuration

- [ ] **Environment variables set**

  **API (.env or hosting platform):**
  ```bash
  # Yookassa Configuration (Optional - will migrate to SystemSettings)
  YOOKASSA_SHOP_ID=your_shop_id
  YOOKASSA_SECRET_KEY=your_secret_key
  YOOKASSA_WEBHOOK_SECRET=your_webhook_secret

  # Stripe Configuration (Optional - will migrate to SystemSettings)
  STRIPE_SECRET_KEY=sk_live_xxxxx
  STRIPE_PUBLISHABLE_KEY=pk_live_xxxxx
  STRIPE_WEBHOOK_SECRET=whsec_xxxxx

  # Application URLs
  FRONTEND_URL=https://your-domain.com
  API_URL=https://api.your-domain.com
  ```

  **Web (.env.local or hosting platform):**
  ```bash
  NEXT_PUBLIC_API_URL=https://api.your-domain.com/graphql
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxx  # If using Stripe
  ```

- [ ] **SystemSettings encryption key**
  - [ ] Verify `ENCRYPTION_KEY` is set in production (32-byte hex)
  - [ ] Key is stored securely (Vault, AWS Secrets Manager, etc.)
  - [ ] Key is NOT in git repository

- [ ] **Webhook URLs accessible**
  - [ ] `https://your-domain.com/api/webhooks/payments/yookassa`
  - [ ] `https://your-domain.com/api/webhooks/payments/stripe`
  - [ ] Both endpoints are publicly accessible (no IP whitelist)
  - [ ] SSL certificates are valid

---

### 4. Payment Provider Setup

- [ ] **Yookassa Configuration (if using)**
  - [ ] Account created and verified
  - [ ] Shop ID obtained
  - [ ] Secret key obtained (live mode)
  - [ ] Webhook URL configured in Yookassa dashboard
  - [ ] Webhook secret obtained
  - [ ] Test payment processed successfully
  - [ ] Webhook signature verification tested

- [ ] **Stripe Configuration (if using)**
  - [ ] Account created and verified
  - [ ] Business verification completed
  - [ ] Secret key obtained (live mode)
  - [ ] Publishable key obtained (live mode)
  - [ ] Webhook endpoint created
  - [ ] Webhook events configured:
    - [ ] `checkout.session.completed`
    - [ ] `invoice.paid`
    - [ ] `invoice.payment_failed`
    - [ ] `customer.subscription.updated`
    - [ ] `customer.subscription.deleted`
  - [ ] Webhook signing secret obtained
  - [ ] Test payment processed successfully

---

### 5. Seed Data Preparation

- [ ] **Review seed data**
  - [ ] `apps/api/prisma/seed-plans.ts` reviewed
  - [ ] Plan names, slugs, descriptions are production-ready
  - [ ] Pricing is correct for all currencies (RUB, USD, EUR)
  - [ ] Features are accurate and well-described
  - [ ] Sort order is logical

- [ ] **Customize plans for production (if needed)**
  - [ ] Update plan limits (projects, members, storage)
  - [ ] Set correct pricing based on business model
  - [ ] Mark appropriate plan as popular (`isPopular: true`)
  - [ ] Enable Early Bird pricing if running promotion

---

## Deployment Steps

### Step 1: Deploy Database Migrations

**Timing:** Deploy during maintenance window (low traffic period)

- [ ] **Announce maintenance window**
  - [ ] Notify users 24-48 hours in advance
  - [ ] Display maintenance banner on website
  - [ ] Prepare status page updates

- [ ] **Enable maintenance mode**
  ```bash
  # On hosting platform or via feature flag
  MAINTENANCE_MODE=true
  ```

- [ ] **Run Prisma migrations**
  ```bash
  cd apps/api
  pnpm prisma migrate deploy
  ```
  - [ ] Migration completes without errors
  - [ ] Note migration names and timestamps

- [ ] **Verify schema changes**
  ```sql
  -- Check new tables exist
  SELECT table_name FROM information_schema.tables
  WHERE table_schema = 'public'
  AND table_name IN ('Plan', 'PlanPrice', 'PlanFeature', 'PaymentProvider');

  -- Check new columns exist
  SELECT column_name FROM information_schema.columns
  WHERE table_name = 'Subscription'
  AND column_name IN ('planId', 'currency');

  SELECT column_name FROM information_schema.columns
  WHERE table_name = 'Payment'
  AND column_name IN ('providerType', 'providerPaymentId');
  ```

---

### Step 2: Seed Subscription Plans

- [ ] **Run seed script**
  ```bash
  cd apps/api
  pnpm tsx prisma/seed-plans.ts
  ```
  - [ ] Script completes successfully
  - [ ] No duplicate slug errors

- [ ] **Verify seeded data**
  ```sql
  -- Verify 3 plans created
  SELECT id, name, slug, "isActive" FROM "Plan" ORDER BY "sortOrder";

  -- Verify 9 prices created (3 plans × 3 currencies)
  SELECT COUNT(*) FROM "PlanPrice";

  -- Verify 21 features created (7 features × 3 plans)
  SELECT COUNT(*) FROM "PlanFeature";

  -- Verify 2 providers created
  SELECT id, type, name, "isPrimary" FROM "PaymentProvider";
  ```

---

### Step 3: Migrate Existing Data

- [ ] **Run subscription migration**
  ```bash
  cd apps/api
  pnpm tsx scripts/migrate-subscriptions-to-planid.ts
  ```
  - [ ] Script completes without errors
  - [ ] All subscriptions have `planId` set

- [ ] **Run Yookassa settings migration (if using Yookassa)**
  ```bash
  cd apps/api
  pnpm tsx scripts/migrate-yookassa-to-systemsettings.ts
  ```
  - [ ] Script completes without errors
  - [ ] SystemSettings records created
  - [ ] Credentials encrypted successfully

- [ ] **Run validation script**
  ```bash
  cd apps/api
  pnpm tsx scripts/validate-migration.ts
  ```
  - [ ] All validations pass
  - [ ] No warnings or errors
  - [ ] Summary shows "All validations passed!"

---

### Step 4: Deploy Backend (API)

- [ ] **Build API**
  ```bash
  cd apps/api
  pnpm build
  ```
  - [ ] Build completes without errors
  - [ ] No TypeScript compilation errors

- [ ] **Deploy to hosting platform**
  - [ ] Push code to git repository (if using Git-based deployment)
  - [ ] Trigger deployment pipeline
  - [ ] Wait for deployment to complete

- [ ] **Verify API health**
  ```bash
  curl https://api.your-domain.com/health
  # Should return 200 OK
  ```

- [ ] **Test GraphQL endpoint**
  - [ ] Navigate to `https://api.your-domain.com/graphql`
  - [ ] GraphQL Playground loads
  - [ ] Run test query:
    ```graphql
    query TestQuery {
      availablePlans(currency: "RUB") {
        id
        name
        slug
      }
    }
    ```
  - [ ] Query returns 3 plans

---

### Step 5: Deploy Frontend (Web)

- [ ] **Build Web app**
  ```bash
  cd apps/web
  pnpm build
  ```
  - [ ] Build completes without errors
  - [ ] All routes compiled successfully

- [ ] **Deploy to hosting platform**
  - [ ] Push code to git repository
  - [ ] Trigger deployment pipeline
  - [ ] Wait for deployment to complete

- [ ] **Verify Web app**
  - [ ] Navigate to `https://your-domain.com`
  - [ ] Homepage loads without errors
  - [ ] Navigate to `/pricing`
  - [ ] Pricing page shows 3 plans
  - [ ] Currency selector works
  - [ ] All prices display correctly

---

### Step 6: Configure Payment Providers

- [ ] **Configure Yookassa (if using)**
  - [ ] Use GraphQL mutation or migration script
  - [ ] Verify configuration in admin panel (`/admin/payment-providers`)
  - [ ] Test connection in admin panel
  - [ ] Green checkmarks for all config fields

- [ ] **Configure Stripe (if using)**
  - [ ] Use GraphQL mutation
  - [ ] Verify configuration in admin panel
  - [ ] Test connection in admin panel
  - [ ] Green checkmarks for all config fields

- [ ] **Set primary provider**
  - [ ] Navigate to `/admin/payment-providers`
  - [ ] Set appropriate provider as primary
  - [ ] Verify "Primary" badge appears

---

### Step 7: Test Payment Flow End-to-End

- [ ] **Test Yookassa payment (if primary)**
  - [ ] Create test user account
  - [ ] Navigate to `/pricing`
  - [ ] Select "Foreman" plan
  - [ ] Click "Выбрать план"
  - [ ] Complete signup and checkout
  - [ ] Process test payment
  - [ ] Verify subscription created in database
  - [ ] Verify webhook received and processed

- [ ] **Test Stripe payment (if primary)**
  - [ ] Create test user account
  - [ ] Navigate to `/pricing`
  - [ ] Select a plan
  - [ ] Complete checkout flow
  - [ ] Use Stripe test card: `4242 4242 4242 4242`
  - [ ] Verify subscription created
  - [ ] Verify webhook processed

- [ ] **Test subscription activation**
  - [ ] User has access to features based on plan
  - [ ] Project/member/storage limits enforced
  - [ ] Subscription shows in user's settings

---

### Step 8: Verify Admin Panel

- [ ] **Test `/admin/plans` page**
  - [ ] Login as admin user
  - [ ] Navigate to `/admin/plans`
  - [ ] Page loads without errors
  - [ ] Stats cards show correct data
  - [ ] All 3 plans displayed
  - [ ] Filters work (Active/Archived)
  - [ ] Search works

- [ ] **Test `/admin/payment-providers` page**
  - [ ] Navigate to `/admin/payment-providers`
  - [ ] Page loads without errors
  - [ ] Both providers shown
  - [ ] Configuration status correct (green checkmarks)
  - [ ] Primary badge shows on correct provider
  - [ ] Webhook URLs displayed correctly

---

### Step 9: Monitor Initial Traffic

- [ ] **Monitor application logs**
  - [ ] Check for GraphQL errors
  - [ ] Check for payment processing errors
  - [ ] Check for webhook delivery failures

- [ ] **Monitor database**
  - [ ] Check for slow queries
  - [ ] Check for foreign key constraint violations
  - [ ] Monitor subscription creation rate

- [ ] **Monitor payment providers**
  - [ ] Check Yookassa dashboard for successful payments
  - [ ] Check Stripe dashboard for events
  - [ ] Verify webhook delivery success rate

---

### Step 10: Disable Maintenance Mode

- [ ] **Verify all systems operational**
  - [ ] API responding normally
  - [ ] Web app accessible
  - [ ] Payments processing
  - [ ] Webhooks being received
  - [ ] No critical errors in logs

- [ ] **Disable maintenance mode**
  ```bash
  MAINTENANCE_MODE=false
  ```

- [ ] **Update status page**
  - [ ] Post "All systems operational" update
  - [ ] Thank users for patience during maintenance

- [ ] **Announce deployment complete**
  - [ ] Email to stakeholders
  - [ ] Internal team notification
  - [ ] Document any known issues

---

## Post-Deployment Verification

### Smoke Tests (Run within 1 hour of deployment)

- [ ] **Public pricing page**
  - [ ] Load `/pricing` as anonymous user
  - [ ] All 3 plans visible
  - [ ] Currency selector works (RUB, USD, EUR)
  - [ ] Prices update when currency changes
  - [ ] "Выбрать план" buttons work

- [ ] **Admin plans page**
  - [ ] Load `/admin/plans` as admin
  - [ ] Stats cards show correct numbers
  - [ ] Plans list displays
  - [ ] Filters and search work

- [ ] **Admin payment providers page**
  - [ ] Load `/admin/payment-providers` as admin
  - [ ] Both providers shown
  - [ ] Configuration status accurate
  - [ ] Primary provider marked correctly

- [ ] **Payment processing**
  - [ ] Create test subscription
  - [ ] Payment completes successfully
  - [ ] Subscription activated
  - [ ] Webhook received and processed
  - [ ] User has access to plan features

---

### Performance Monitoring (Monitor for 24 hours)

- [ ] **Response times**
  - [ ] `/pricing` page load time < 2s
  - [ ] GraphQL `availablePlans` query < 500ms
  - [ ] Admin pages load time < 2s
  - [ ] Payment processing < 5s

- [ ] **Database performance**
  - [ ] No N+1 query issues
  - [ ] Indexes being used effectively
  - [ ] Query cache hit rate > 80%

- [ ] **Error rates**
  - [ ] GraphQL error rate < 0.1%
  - [ ] Payment failure rate < 5% (excluding user-caused failures)
  - [ ] Webhook delivery success rate > 95%

---

### Data Integrity Checks (Run after 24 hours)

- [ ] **Subscription data**
  ```sql
  -- All subscriptions have planId
  SELECT COUNT(*) FROM "Subscription" WHERE "planId" IS NULL;
  -- Should return 0

  -- All subscriptions have currency
  SELECT COUNT(*) FROM "Subscription" WHERE currency IS NULL;
  -- Should return 0

  -- Plan enum matches planId
  SELECT s.id, s.plan, p.slug
  FROM "Subscription" s
  LEFT JOIN "Plan" p ON s."planId" = p.id
  WHERE LOWER(s.plan::text) != LOWER(p.slug)
  LIMIT 10;
  -- Should return 0 rows
  ```

- [ ] **Payment data**
  ```sql
  -- All payments have provider type
  SELECT COUNT(*) FROM "Payment" WHERE "providerType" IS NULL;
  -- Should return 0 for new payments

  -- Payments have provider payment ID
  SELECT COUNT(*) FROM "Payment"
  WHERE "createdAt" > NOW() - INTERVAL '24 hours'
  AND "providerPaymentId" IS NULL;
  -- Should be minimal (only pending/failed payments)
  ```

- [ ] **Plan data**
  ```sql
  -- All active plans have prices
  SELECT p.id, p.name, COUNT(pp.id) as price_count
  FROM "Plan" p
  LEFT JOIN "PlanPrice" pp ON p.id = pp."planId" AND pp."isActive" = true
  WHERE p."isActive" = true
  GROUP BY p.id, p.name
  HAVING COUNT(pp.id) < 3;
  -- Should return 0 rows (each plan should have 3 currencies)
  ```

---

## Rollback Procedures

### When to Rollback

Rollback if any of these conditions occur:
- Critical payment processing failures (> 20% failure rate)
- Database integrity issues (constraint violations)
- Unable to create new subscriptions
- Severe performance degradation (> 50% slower)
- Security vulnerabilities discovered

### Rollback Steps

1. **Enable maintenance mode immediately**
   ```bash
   MAINTENANCE_MODE=true
   ```

2. **Revert application code**
   - [ ] Redeploy previous version of API
   - [ ] Redeploy previous version of Web
   - [ ] Verify old version is running

3. **Restore database (if necessary)**
   - [ ] Stop all application servers
   - [ ] Restore from pre-deployment backup:
     ```bash
     pg_restore -h <host> -U <user> -d <database> -c backup_pre_stage15_YYYYMMDD.dump
     ```
   - [ ] Verify restoration completed successfully
   - [ ] Restart application servers

4. **Verify system stability**
   - [ ] Test critical user flows
   - [ ] Check payment processing
   - [ ] Monitor error rates

5. **Communicate rollback**
   - [ ] Notify stakeholders
   - [ ] Update status page
   - [ ] Plan next deployment attempt

---

## Known Issues & Workarounds

### Issue: Subscription migration fails for some records

**Workaround:**
```sql
-- Manually set planId for failed subscriptions
UPDATE "Subscription"
SET "planId" = (SELECT id FROM "Plan" WHERE slug = 'lite')
WHERE plan = 'LITE' AND "planId" IS NULL;

UPDATE "Subscription"
SET "planId" = (SELECT id FROM "Plan" WHERE slug = 'foreman')
WHERE plan = 'FOREMAN' AND "planId" IS NULL;

UPDATE "Subscription"
SET "planId" = (SELECT id FROM "Plan" WHERE slug = 'brigade')
WHERE plan = 'BRIGADE' AND "planId" IS NULL;
```

### Issue: Yookassa webhook signature verification fails

**Workaround:**
1. Check webhook secret matches in both Yookassa dashboard and SystemSettings
2. Clear provider cache: `/admin/payment-providers` → ⋮ → Clear Cache
3. Test webhook with Yookassa's dashboard tools
4. Verify `ENCRYPTION_KEY` is consistent across deployments

---

## Success Criteria

Deployment is considered successful when:

- ✅ All 3 subscription plans visible on `/pricing`
- ✅ Multi-currency support working (RUB, USD, EUR)
- ✅ Admin panel pages load without errors
- ✅ At least one payment provider fully configured and tested
- ✅ Test payment processed successfully end-to-end
- ✅ Webhook delivery and processing working
- ✅ Existing subscriptions migrated with `planId` set
- ✅ No increase in error rates or performance degradation
- ✅ All data integrity checks pass
- ✅ Zero critical bugs reported within 24 hours

---

## Post-Deployment Tasks

### Within 1 week:

- [ ] Monitor conversion rates on new pricing page
- [ ] Gather user feedback on pricing display
- [ ] Review payment success/failure rates
- [ ] Optimize slow queries (if any identified)
- [ ] Update internal documentation with production learnings

### Within 1 month:

- [ ] Implement plan CRUD UI in admin panel (Phase 7 optional)
- [ ] Implement payment provider config UI (Phase 7 optional)
- [ ] Add plan pricing history tracking
- [ ] Add automated tests for critical payment flows
- [ ] Review and optimize payment provider fees

---

## Contacts & Support

**Deployment Team:**
- DevOps Lead: [Name/Contact]
- Backend Lead: [Name/Contact]
- Frontend Lead: [Name/Contact]
- Database Admin: [Name/Contact]

**Emergency Contacts:**
- On-Call Engineer: [Contact]
- CTO/Technical Director: [Contact]

**External Support:**
- Yookassa Support: support@yookassa.ru
- Stripe Support: https://support.stripe.com

---

**Checklist Version:** 1.0
**Last Updated:** 2025-12-19
**Next Review:** After deployment completion
