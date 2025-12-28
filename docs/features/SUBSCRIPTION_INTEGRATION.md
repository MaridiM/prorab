# Subscription System Integration Guide

**Version:** 1.6.0
**Status:** ✅ Complete
**Last Updated:** 2025-12-28

---

## 📋 Overview

This document describes the complete integration of the subscription management system across the ProRab application.

---

## 🎯 Integration Points

### 1. Dashboard Integration

**File:** `apps/web/src/app/(root)/(protected)/dashboard/page.tsx`

**Components Added:**
- **UpgradeButton** - Header upgrade button
  - Location: Header actions, before admin button
  - Visibility: When not on BRIGADE plan and status is ACTIVE/TRIALING
  - Action: Links to `/settings?tab=billing`

- **UpgradeWidget** - Usage-based upgrade prompt
  - Location: Below TrialStatusWidget, before financial stats
  - Visibility: When any resource usage > 70%
  - Features:
    - Calculates highest usage resource
    - Dismissible with localStorage
    - Shows exact usage percentages

```typescript
// Import
import { UpgradeWidget } from '@/packages/components/subscription/upgrade-widget'
import { UpgradeButton } from '@/packages/components/subscription/upgrade-button'

// Header
<UpgradeButton />

// Content Area
<UpgradeWidget />
```

---

### 2. Settings/Billing Integration

**File:** `apps/web/src/packages/components/settings/SubscriptionManagement.tsx`

**Features Added:**

#### A. Payment Provider Selection
When user selects a plan:
1. Modal opens with `PaymentProviderSelector`
2. User chooses between Yookassa and Stripe
3. Primary provider shown with "Рекомендуется" badge
4. Selection highlighted with border and checkmark

#### B. Payment Flow
**For New Subscriptions:**
```typescript
1. User clicks "Выбрать" on plan
2. PaymentProviderSelector modal opens
3. User selects provider
4. createSubscription mutation executes
5. initializePayment mutation called with selected provider
6. User redirected to payment gateway
```

**For Plan Changes:**
```typescript
1. User clicks "Сменить тариф"
2. PaymentProviderSelector modal opens
3. User selects provider
4. changePlan mutation executes
5. If downgrade with exceeded limits:
   - DowngradeErrorModal displays
   - Shows exceeded limits
   - Provides recommendations
6. If successful:
   - Plan updated
   - Modal closes
```

#### C. Downgrade Protection
```typescript
// Error handling in changePlan mutation
onError: (error: any) => {
  if (error.graphQLErrors?.[0]?.extensions?.code === 'DOWNGRADE_LIMIT_EXCEEDED') {
    const extensions = error.graphQLErrors[0].extensions
    setDowngradeError({
      message: error.message,
      code: extensions.code,
      exceeds: extensions.exceeds || [],
    })
  }
}
```

**DowngradeErrorModal displays:**
- Error title and description
- List of exceeded limits:
  - "Проекты: 8 > 3"
  - "Участники: 12 > 5"
  - "Хранилище: 35.00 ГБ > 10 ГБ"
- Recommendations:
  - Archive unused projects
  - Remove inactive members
  - Clear old files
- Actions:
  - "Закрыть" - Dismiss modal
  - "Посмотреть другие планы" - Redirect to billing

---

## 🔧 Technical Implementation

### State Management

```typescript
// SubscriptionManagement component state
const [showProviderSelector, setShowProviderSelector] = useState(false)
const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null)
const [selectedProvider, setSelectedProvider] = useState<PaymentProviderType | undefined>()
const [downgradError, setDowngradeError] = useState<DowngradeError | null>(null)
```

### GraphQL Mutations Used

1. **CreateSubscription**
   ```graphql
   mutation CreateSubscription($input: CreateSubscriptionInput!) {
     createSubscription(input: $input) {
       id
       status
       plan
     }
   }
   ```

2. **ChangePlan**
   ```graphql
   mutation ChangePlan($input: ChangePlanInput!) {
     changePlan(input: $input) {
       id
       plan
     }
   }
   ```

3. **InitializePayment**
   ```graphql
   mutation InitializePayment(
     $subscriptionId: String!
     $providerType: PaymentProviderType
   ) {
     initializePayment(
       subscriptionId: $subscriptionId
       providerType: $providerType
     ) {
       url
       paymentId
     }
   }
   ```

### Error Handling

**Downgrade Protection:**
```typescript
interface DowngradeError {
  message: string
  code: string
  exceeds: string[]
}

// Extracted from GraphQL error extensions
error.graphQLErrors[0].extensions = {
  code: 'DOWNGRADE_LIMIT_EXCEEDED',
  exceeds: [
    'Проекты: 8 > 3',
    'Участники: 12 > 5',
    'Хранилище: 35.00 ГБ > 10 ГБ'
  ]
}
```

---

## 🎨 User Flows

### Flow 1: New Subscription Creation

```
1. User has no subscription
2. Navigate to /settings?tab=billing
3. See plan selection cards
4. Click "Выбрать" on desired plan
5. Modal: "Выберите способ оплаты"
6. Select Yookassa or Stripe
7. Click "Продолжить"
8. Subscription created
9. Redirect to payment gateway
10. Complete payment
11. Return to app with active subscription
```

### Flow 2: Plan Upgrade

```
1. User on LITE plan
2. Click UpgradeButton in header OR
   Click "Upgrade" in UpgradeWidget OR
   Navigate to settings
3. Click "Сменить тариф"
4. Select new plan (e.g., FOREMAN)
5. Modal: "Выберите способ оплаты"
6. Select payment provider
7. Click "Продолжить"
8. Plan changed successfully
9. Billing updated for next cycle
```

### Flow 3: Failed Downgrade

```
1. User on FOREMAN plan (15 members, 50 GB)
2. Has 12 members, 35 GB used
3. Tries to downgrade to LITE (5 members, 10 GB)
4. Backend validates usage
5. Backend returns DOWNGRADE_LIMIT_EXCEEDED
6. DowngradeErrorModal displays
7. Shows:
   - "Участники: 12 > 5"
   - "Хранилище: 35.00 ГБ > 10 ГБ"
8. User sees recommendations
9. User can:
   - Close modal
   - View other plans
   - Take action to reduce usage
```

### Flow 4: Upgrade from Widget (High Usage)

```
1. User on LITE plan
2. Has 3/3 projects (100% usage)
3. UpgradeWidget appears in dashboard
4. Widget shows: "Вы используете 100% проектов (3 из 3)"
5. User clicks "Посмотреть планы"
6. Redirects to /settings?tab=billing
7. User can upgrade to higher plan
```

---

## 📊 Component Hierarchy

```
Dashboard
├── Header
│   ├── TeamSwitcher
│   ├── UpgradeButton ⭐ NEW
│   ├── AdminButton
│   ├── TeamsButton
│   └── UserMenu
└── Content
    ├── WelcomeHeader
    ├── TrialStatusWidget
    ├── UpgradeWidget ⭐ NEW
    ├── FinancialStats
    └── Projects

Settings (Billing Tab)
└── SubscriptionManagement
    ├── Current Subscription View
    │   ├── Plan Details
    │   ├── Usage Meters
    │   ├── Features List
    │   └── Actions
    │       ├── "Сменить тариф" → Opens plan selection
    │       └── "Отменить подписку"
    ├── Plan Selection View
    │   └── Plan Cards
    │       └── "Выбрать" → Opens PaymentProviderSelector ⭐ NEW
    ├── PaymentProviderSelector Modal ⭐ NEW
    │   ├── Provider List (Yookassa, Stripe)
    │   ├── "Отмена" button
    │   └── "Продолжить" button
    └── DowngradeErrorModal ⭐ NEW
        ├── Error Details
        ├── Exceeded Limits List
        ├── Recommendations
        └── Actions
```

---

## 🔐 Security & Validation

### Backend Validation

1. **Limit Enforcement:**
   - Projects: `CheckProjectLimitGuard`
   - Members: `CheckMemberLimitGuard`
   - Storage: `CheckStorageLimitGuard`

2. **Downgrade Protection:**
   - `SubscriptionsService.changePlan()`
   - Validates usage before plan change
   - Prevents data loss scenarios

3. **Authorization:**
   - Only team owner can manage subscription
   - GraphQL guards enforce ownership

### Frontend Validation

1. **Provider Selection:**
   - "Продолжить" button disabled until provider selected
   - Loading states during mutation

2. **Error Handling:**
   - Graceful error messages
   - Specific handling for downgrade errors
   - Toast notifications for success/failure

---

## 🎯 Testing Checklist

### Manual Testing

- [ ] Create new subscription with Yookassa
- [ ] Create new subscription with Stripe
- [ ] Upgrade plan successfully
- [ ] Try downgrade with exceeded limits (should block)
- [ ] Try downgrade without exceeded limits (should work)
- [ ] View UpgradeButton when upgradeable
- [ ] View UpgradeWidget when usage > 70%
- [ ] Dismiss UpgradeWidget (persists in localStorage)
- [ ] Cancel subscription
- [ ] Reactivate subscription

### Automated Testing

See `docs/testing/custom_tests/v1.6.0.md` for comprehensive test cases.

---

## 🚀 Deployment Notes

### Prerequisites

1. **Database:**
   - Plan table populated with plans
   - PaymentProvider table has active providers
   - At least one provider set as `isPrimary: true`

2. **Environment:**
   - `NEXT_PUBLIC_API_URL` configured
   - Payment gateway credentials configured in backend

3. **Webhooks:**
   - Yookassa webhook URL registered
   - Stripe webhook URL registered
   - Webhook secrets configured

### Post-Deployment Verification

```bash
# 1. Verify plans are visible
curl http://localhost:8080/graphql \
  -d '{"query": "{ availablePlansDetailed { id name } }"}'

# 2. Verify payment providers are active
curl http://localhost:8080/graphql \
  -d '{"query": "{ availablePaymentProviders { type isActive isPrimary } }"}'

# 3. Test upgrade button visibility
# - Login to app
# - Check dashboard header
# - Should see "Upgrade" button if not on BRIGADE

# 4. Test plan selection
# - Navigate to /settings?tab=billing
# - Click "Выбрать" on any plan
# - Should see PaymentProviderSelector modal
```

---

## 📚 Related Documentation

- **Testing Guide:** `docs/testing/custom_tests/v1.6.0.md`
- **Release Summary:** `docs/changelog/v1.6.0_SUMMARY.md`
- **API Documentation:** GraphQL Playground at `/graphql`
- **Component Docs:** Storybook (if available)

---

## 🎉 Summary

The subscription system is now fully integrated with:

✅ **Dashboard Integration**
- Upgrade button in header
- Usage-based upgrade widget
- Seamless user experience

✅ **Settings Integration**
- Complete subscription management
- Payment provider selection
- Downgrade protection with clear error handling

✅ **Error Handling**
- Graceful error messages
- Specific handling for limit errors
- User-friendly recommendations

✅ **Multi-Provider Support**
- Yookassa and Stripe supported
- Primary provider recommendation
- Flexible provider selection

The system is production-ready and provides an excellent user experience for subscription management!

---

**Version:** 1.6.0
**Status:** ✅ Production Ready
**Last Updated:** 2025-12-28
