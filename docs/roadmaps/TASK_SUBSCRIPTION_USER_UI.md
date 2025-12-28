# Roadmap: User Subscription UI & Limits

**Goal:** Implement full user-facing subscription management, including plan selection from DB and limit enforcement.

## Steps

### Step 1: Backend - Enforce DB Limits ✅
- [x] Update `SubscriptionsService` to use DB `Plan` model for limits.
- [x] Remove hardcoded `PLAN_LIMITS` dependency (or keep as fallback).
- [x] Update `getCurrentLimits` and `getUsageStats`.
- [x] Bump version to 0.7.1.

### Step 2: Frontend - Plan Display & Selection ✅
- [x] Update `SubscriptionManagement` to fetch plans via GraphQL.
- [x] Display active plan details from DB.
- [x] Bump version to 0.7.2.

### Step 3: Frontend - Upgrade Flow & Polish ✅
- [x] Implement "Upgrade"/"Connect" button logic.
- [x] Handle UI states (success, loading).
- [x] Bump version to 0.7.3.
