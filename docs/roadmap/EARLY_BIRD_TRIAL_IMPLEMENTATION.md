# Early Bird & Trial Period Implementation Roadmap
**Version:** v1.6.11
**Date:** 2025-12-31
**Status:** 🔧 In Progress

---

## Executive Summary

This roadmap outlines the implementation of **Variant A**: Full Early Bird pricing system with proper trial period configuration. The goal is to fix critical bugs and ensure users can only receive trial periods once per plan.

### Critical Issues to Fix

1. **Early Bird Bug**: Frontend never passes `useEarlyBird` flag → users always pay full price
2. **No Limit Validation**: `EARLY_BIRD_LIMIT = 500` constant exists but never checked
3. **Trial Uniqueness**: No tracking to prevent users from getting trial multiple times on same plan

---

## Phase 1: Frontend Early Bird Fix

### Task 1.1: Fix SubscriptionManagement.tsx

**File:** `apps/web/src/packages/components/settings/SubscriptionManagement.tsx`

**Current Code (Line 249):**
```typescript
const result = await createSubscription({
  variables: {
    input: {
      teamId: effectiveTeamId,
      planId: planId,
      // ❌ BUG: useEarlyBird NOT PASSED
    },
  },
})
```

**Fix:**
```typescript
const result = await createSubscription({
  variables: {
    input: {
      teamId: effectiveTeamId,
      planId: planId,
      useEarlyBird: selectedPlan?.isEarlyBird || false, // ✅ FIXED
    },
  },
})
```

**Impact:**
- Users will now get Early Bird discount when selecting plans marked as Early Bird
- Frontend will correctly communicate Early Bird eligibility to backend

---

## Phase 2: Backend Early Bird Validation

### Task 2.1: Create Early Bird Count Query

**File:** `apps/api/src/modules/subscriptions/subscriptions.service.ts`

**New Method:**
```typescript
async getEarlyBirdCount(): Promise<number> {
  return this.prisma.subscription.count({
    where: {
      isEarlyBird: true,
      status: {
        in: [
          SubscriptionStatus.ACTIVE,
          SubscriptionStatus.TRIALING,
          SubscriptionStatus.PENDING_PAYMENT,
        ],
      },
    },
  });
}
```

**Purpose:**
- Count active Early Bird subscriptions
- Exclude cancelled/expired subscriptions from limit

### Task 2.2: Add Validation Logic

**File:** `apps/api/src/modules/subscriptions/subscriptions.service.ts`

**Location:** `createSubscription()` method (before line 94)

**New Code:**
```typescript
// Validate Early Bird eligibility
if (input.useEarlyBird) {
  const earlyBirdCount = await this.getEarlyBirdCount();

  if (earlyBirdCount >= EARLY_BIRD_LIMIT) {
    throw new Error(
      `Early Bird программа завершена. Достигнут лимит ${EARLY_BIRD_LIMIT} подписок.`
    );
  }

  // Auto-determine eligibility from plan
  if (!planData.isEarlyBird) {
    throw new Error(
      'Этот план не участвует в программе Early Bird.'
    );
  }
}
```

**Impact:**
- Backend will reject Early Bird requests when limit reached
- Prevents client-side manipulation
- Clear error messages for users

---

## Phase 3: Trial Uniqueness Implementation

### Task 3.1: Create Trial History Tracking

**Option A: Add Field to User Model (Recommended)**

**File:** `apps/api/prisma/schema.prisma`

**Change:**
```prisma
model User {
  // ... existing fields
  trialedPlanIds String[] @default([]) @map("trialed_plan_ids")
}
```

**Migration:**
```sql
-- Add column to track which plans user has trialed
ALTER TABLE "User" ADD COLUMN "trialed_plan_ids" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- Backfill existing trial usage from subscription history
UPDATE "User" u
SET "trialed_plan_ids" = (
  SELECT ARRAY_AGG(DISTINCT s."plan_id")
  FROM "Subscription" s
  WHERE s."user_id" = u."id"
    AND s."trial_ends_at" IS NOT NULL
);
```

**Option B: Create TrialHistory Table (More Robust)**

```prisma
model TrialHistory {
  id        String   @id @default(uuid())
  userId    String   @map("user_id")
  planId    String   @map("plan_id")
  grantedAt DateTime @default(now()) @map("granted_at")

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  plan Plan @relation(fields: [planId], references: [id], onDelete: Cascade)

  @@unique([userId, planId])
  @@map("trial_history")
}
```

**Decision:** Use Option A for simplicity, unless audit trail is critical.

### Task 3.2: Check Trial Eligibility

**File:** `apps/api/src/modules/subscriptions/subscriptions.service.ts`

**New Method:**
```typescript
async hasUsedTrial(userId: string, planId: string): Promise<boolean> {
  const user = await this.prisma.user.findUnique({
    where: { id: userId },
    select: { trialedPlanIds: true },
  });

  return user?.trialedPlanIds.includes(planId) || false;
}
```

### Task 3.3: Enforce in createSubscription()

**Location:** Before trial calculation (line 48)

```typescript
// Check trial eligibility
const userId = input.userId; // Assume we add userId to CreateSubscriptionInput
const alreadyTrialed = await this.hasUsedTrial(userId, input.planId);

let trialDays = TRIAL_DURATION_DAYS;
if (planData.trialDays !== null) {
  trialDays = planData.trialDays;
}

// Disable trial if user already used it for this plan
if (alreadyTrialed) {
  this.logger.log(
    `User ${userId} already used trial for plan ${input.planId}. Disabling trial.`
  );
  trialDays = 0;
}

const trialEndsAt = trialDays > 0
  ? new Date(now.getTime() + trialDays * 24 * 60 * 60 * 1000)
  : null;
```

### Task 3.4: Track Trial Usage

**Location:** After subscription creation (line 94+)

```typescript
// Mark trial as used if granted
if (trialEndsAt) {
  await this.prisma.user.update({
    where: { id: userId },
    data: {
      trialedPlanIds: {
        push: input.planId,
      },
    },
  });
}
```

---

## Phase 4: UI Enhancements

### Task 4.1: Early Bird Availability Counter

**File:** `apps/web/src/packages/components/settings/SubscriptionManagement.tsx`

**New GraphQL Query:**
```graphql
query EarlyBirdStats {
  earlyBirdStats {
    used
    limit
    remaining
  }
}
```

**Backend Resolver:**
```typescript
@Query(() => EarlyBirdStats)
async earlyBirdStats(): Promise<EarlyBirdStats> {
  const used = await this.subscriptionsService.getEarlyBirdCount();

  return {
    used,
    limit: EARLY_BIRD_LIMIT,
    remaining: Math.max(0, EARLY_BIRD_LIMIT - used),
  };
}
```

**UI Display:**
```tsx
{plan.isEarlyBird && earlyBirdStats && (
  <Badge variant="outline" className="text-xs">
    🔥 Осталось {earlyBirdStats.remaining} из {earlyBirdStats.limit}
  </Badge>
)}
```

### Task 4.2: Trial Eligibility Indicator

**Display when trial NOT available:**
```tsx
{!isTrialEligible && (
  <p className="text-xs text-muted-foreground">
    Пробный период уже использован для этого плана
  </p>
)}
```

---

## Phase 5: Documentation & Version Update

### Task 5.1: Update VERSION.md

**Changes:**
- Update current version to v1.6.11
- Add comprehensive changelog entry
- Document Early Bird behavior
- Document trial uniqueness logic

### Task 5.2: Update Changelog Files

**Files:**
- `docs/changelog.backend.md`
- `docs/changelog.frontend.md`

**Content:**
- Early Bird fix details
- Trial uniqueness implementation
- Migration instructions
- Breaking changes (if any)

### Task 5.3: Increment Package Versions

**Files:**
- `package.json`
- `apps/api/package.json`
- `apps/web/package.json`

**Change:** v1.6.10 → v1.6.11

---

## Testing Checklist

### Early Bird Tests

- [ ] User selects Early Bird plan → receives discount
- [ ] Early Bird counter decrements correctly
- [ ] After 500 subscriptions → Early Bird disabled
- [ ] Non-Early-Bird plan → full price charged
- [ ] Backend rejects `useEarlyBird=true` if plan doesn't support it
- [ ] Backend rejects if limit exceeded

### Trial Uniqueness Tests

- [ ] First subscription on plan → gets trial
- [ ] Second subscription on SAME plan → NO trial
- [ ] Second subscription on DIFFERENT plan → gets trial
- [ ] Cancelled subscription → trial still marked as used
- [ ] Expired subscription → trial still marked as used
- [ ] Migration backfills existing trial usage correctly

### Integration Tests

- [ ] End-to-end: New user → Early Bird plan with trial → payment → activation
- [ ] Mock payment mode works with Early Bird
- [ ] Real payment (Stripe/Yookassa) charges correct Early Bird price
- [ ] UI shows correct prices throughout flow
- [ ] Success page reflects Early Bird discount

---

## Rollout Plan

### Step 1: Database Migration
```bash
cd apps/api
npx prisma migrate dev --name add_trial_tracking
npx prisma generate
```

### Step 2: Backend Deploy
- Deploy backend with validation logic
- Monitor error logs for Early Bird rejections
- Verify count query performance

### Step 3: Frontend Deploy
- Deploy frontend with `useEarlyBird` fix
- Clear CDN cache
- Test in staging first

### Step 4: Data Validation
- Check Early Bird count: `SELECT COUNT(*) FROM "Subscription" WHERE "is_early_bird" = true`
- Verify trial tracking: `SELECT "trialed_plan_ids" FROM "User" LIMIT 10`

### Step 5: Monitoring
- Watch for errors related to Early Bird validation
- Monitor conversion rate for Early Bird plans
- Track trial → paid conversion

---

## Success Metrics

### Early Bird
- **Target:** 500 Early Bird subscriptions
- **Metric:** Early Bird adoption rate (% of new users)
- **KPI:** Revenue from Early Bird customers

### Trial
- **Target:** 0% duplicate trial usage per plan
- **Metric:** Trial → Paid conversion rate
- **KPI:** Average trial duration before conversion

---

## Risk Mitigation

### Risk 1: Early Bird Limit Race Condition
**Problem:** Multiple simultaneous requests could exceed 500 limit

**Solution:** Database-level unique partial index
```sql
CREATE UNIQUE INDEX idx_early_bird_limit ON "Subscription" ("is_early_bird")
WHERE "is_early_bird" = true
  AND "status" IN ('ACTIVE', 'TRIALING', 'PENDING_PAYMENT')
  AND (SELECT COUNT(*) FROM "Subscription" WHERE "is_early_bird" = true) < 500;
```

### Risk 2: Trial Backfill Accuracy
**Problem:** Migration might incorrectly mark trials as used

**Solution:**
- Dry-run migration first
- Log all backfill changes
- Allow manual override in admin panel

### Risk 3: Breaking Change for Existing Users
**Problem:** Current users might lose Early Bird eligibility

**Solution:**
- Grandfather existing subscriptions (isEarlyBird preserved)
- Only apply new validation to NEW subscriptions
- Email notification to Early Bird users

---

## Timeline

| Phase | Duration | Dependencies |
|-------|----------|--------------|
| Phase 1: Frontend Fix | 1 hour | None |
| Phase 2: Backend Validation | 2 hours | Phase 1 |
| Phase 3: Trial Uniqueness | 3 hours | Database migration |
| Phase 4: UI Enhancements | 2 hours | Phase 2, 3 |
| Phase 5: Documentation | 1 hour | All phases |
| Testing | 2 hours | All phases |
| **Total** | **11 hours** | - |

---

## Appendix

### A. Early Bird Pricing Table

| Plan | Regular Price | Early Bird Price | Savings | % Off |
|------|---------------|------------------|---------|-------|
| Лайт | 490₽/мес | 290₽/мес | 200₽ | 41% |
| Прораб | 990₽/мес | 690₽/мес | 300₽ | 30% |
| Бригада | 1990₽/мес | 1490₽/мес | 500₽ | 25% |

### B. Trial Configuration

| Plan | Default Trial | Configurable | Max Duration |
|------|---------------|--------------|--------------|
| Лайт | 14 days | Yes (via admin) | 30 days |
| Прораб | 14 days | Yes (via admin) | 30 days |
| Бригада | 14 days | Yes (via admin) | 30 days |

### C. Status Transitions

```
New User
  ↓
Select Plan (isEarlyBird=true, first time trial)
  ↓
Create Subscription (status=PENDING_PAYMENT, isEarlyBird=true, trialEndsAt=+14d)
  ↓
Initialize Payment (amount=earlyBirdPrice)
  ↓
User Pays
  ↓
Webhook Activation (status=TRIALING)
  ↓
14 days later
  ↓
Trial Expires (status=ACTIVE, billing starts)
  ↓
Monthly renewal (continues at Early Bird price)
```

---

**Document Status:** ✅ Complete
**Last Updated:** 2025-12-31
**Next Review:** After v1.6.11 deployment
