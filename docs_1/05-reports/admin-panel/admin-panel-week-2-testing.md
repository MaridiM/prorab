# Admin Panel Week 2 - Testing Checklist

**Status:** Ready for Testing ✅
**Date:** 2025-12-16
**Version:** 0.3.9

---

## 🚀 Server Status

### Backend (API) - Port 4000
- ✅ **Status:** Running successfully
- ✅ **GraphQL Endpoint:** `http://localhost:4000/graphql`
- ✅ **GraphQL Schema:** Loaded without conflicts
- ✅ **All Modules:** AdminModule initialized
- ⚠️ **Port 8080:** Webhook server conflict (non-critical)

### Frontend (Web) - Port 3000
- ✅ **Status:** Already running (PID 12816)
- ✅ **URL:** `http://localhost:3000`
- ✅ **Admin Panel:** `http://localhost:3000/admin`

---

## 📋 Testing Checklist

### 1. Backend API Testing (GraphQL Playground)

**URL:** `http://localhost:4000/graphql`

#### Admin Users API Tests:
```graphql
# Test 1: Get all users with pagination
query TestAdminUsers {
  adminUsers(
    filters: { search: "" }
    pagination: { page: 1, limit: 20 }
  ) {
    nodes {
      id
      email
      fullName
      emailVerified
      createdAt
    }
    totalCount
    pageInfo {
      hasNextPage
      hasPreviousPage
      currentPage
      totalPages
    }
  }
}

# Test 2: Get specific user details
query TestAdminUser {
  adminUser(id: "USER_ID_HERE") {
    user {
      id
      email
      fullName
    }
    _count {
      ownedTeams
      payments
    }
  }
}

# Test 3: Update user
mutation TestUpdateUser {
  adminUpdateUser(
    id: "USER_ID_HERE"
    input: { emailVerified: true }
  ) {
    id
    emailVerified
  }
}
```

#### Admin Teams API Tests:
```graphql
# Test 1: Get all teams
query TestAdminTeams {
  adminTeams(
    filters: { search: "" }
    pagination: { page: 1, limit: 20 }
  ) {
    nodes {
      id
      name
      ownerId
      createdAt
    }
    totalCount
    pageInfo {
      hasNextPage
    }
  }
}

# Test 2: Get team details
query TestAdminTeam {
  adminTeam(id: "TEAM_ID_HERE") {
    team {
      id
      name
    }
    owner {
      id
      email
      fullName
    }
    _count {
      members
      projects
    }
  }
}
```

#### Admin Subscriptions API Tests:
```graphql
# Test 1: Get all subscriptions
query TestAdminSubscriptions {
  adminSubscriptions(
    filters: { plan: "FOREMAN" }
    pagination: { page: 1, limit: 20 }
  ) {
    nodes {
      id
      plan
      status
      currentPeriodEnd
    }
    totalCount
  }
}

# Test 2: Get subscription stats
query TestSubscriptionStats {
  adminSubscriptionStats {
    totalSubscriptions
    activeSubscriptions
    trialingSubscriptions
    byPlan {
      LITE
      FOREMAN
      BRIGADE
    }
  }
}
```

#### Admin Payments API Tests:
```graphql
# Test 1: Get all payments
query TestAdminPayments {
  adminPayments(
    filters: { status: "SUCCEEDED" }
    pagination: { page: 1, limit: 20 }
  ) {
    nodes {
      id
      amount
      currency
      status
      createdAt
    }
    totalCount
  }
}

# Test 2: Get payment stats
query TestPaymentStats {
  adminPaymentStats {
    totalPayments
    succeededPayments
    totalRevenue
    averagePayment
    byStatus {
      PENDING
      SUCCEEDED
      FAILED
    }
  }
}
```

#### Admin Analytics API Tests:
```graphql
# Test 1: Dashboard stats
query TestDashboardStats {
  adminDashboardStats {
    users {
      total
      verified
      newThisMonth
    }
    teams {
      total
      withActiveSubscription
    }
    payments {
      total
      totalRevenue
      thisMonthRevenue
    }
  }
}

# Test 2: Revenue chart
query TestRevenueChart {
  adminRevenueChart {
    labels
    data
  }
}

# Test 3: Recent activity
query TestRecentActivity {
  adminRecentActivity(limit: 10) {
    id
    action
    resource
    adminUserEmail
    createdAt
  }
}
```

---

### 2. Frontend UI Testing

**Base URL:** `http://localhost:3000/admin`

#### Users Page: `/admin/users`
- [ ] Page loads without errors
- [ ] Table displays users with correct columns
- [ ] Search box filters users by email/name
- [ ] Filters work (verified status)
- [ ] Pagination works (Previous/Next buttons)
- [ ] View Details modal opens with user info
- [ ] Verify Email button works
- [ ] Delete User button shows confirmation dialog
- [ ] Loading state shows spinner
- [ ] Empty state shows "No users found"
- [ ] Toast notifications show on success/error

#### Teams Page: `/admin/teams`
- [ ] Page loads without errors
- [ ] Table displays teams with correct columns
- [ ] Search box filters teams by name/slug
- [ ] Filters work (plan, subscription status)
- [ ] Pagination works
- [ ] View Details modal opens with team info
- [ ] Suspend Team action works
- [ ] Delete Team button shows confirmation dialog
- [ ] Team logo/avatar renders correctly
- [ ] Status badges display correctly

#### Subscriptions Page: `/admin/subscriptions`
- [ ] Page loads without errors
- [ ] Table displays subscriptions
- [ ] Search works
- [ ] Filters work (plan, status)
- [ ] Status badges show correct colors
- [ ] Cancel at Period End action works
- [ ] Cancel Immediately action works
- [ ] View Details modal shows subscription info
- [ ] Dates format correctly
- [ ] "Cancelling" badge shows when cancelAtPeriodEnd is true

#### Payments Page: `/admin/payments`
- [ ] Page loads without errors
- [ ] Table displays payments
- [ ] Search works
- [ ] Status filter works
- [ ] Amount formatting shows currency correctly
- [ ] Status badges with icons display properly
- [ ] Update Status actions work
- [ ] Refund action works
- [ ] Delete Payment shows confirmation
- [ ] YooKassa ID displays (or shows '-' if null)
- [ ] Details modal shows payment info

#### Navigation
- [ ] Admin sidebar shows all menu items
- [ ] Subscriptions link is present
- [ ] Active route highlighting works
- [ ] Clicking menu items navigates correctly
- [ ] All icons render properly (Users, Teams, Subscriptions, Payments)

---

### 3. Integration Tests

#### GraphQL Query Integration:
- [ ] Frontend queries match backend schema
- [ ] TypeScript types are correctly generated
- [ ] No GraphQL validation errors in browser console
- [ ] Apollo Client cache works correctly

#### Mutations:
- [ ] Verify User mutation updates database
- [ ] Delete User mutation removes user
- [ ] Cancel Subscription updates status
- [ ] Refund Payment updates payment record
- [ ] All mutations show success toast
- [ ] Errors show error toast with message
- [ ] Tables refresh after mutations (refetch)

#### Filters & Search:
- [ ] Search debouncing works (if implemented)
- [ ] Filters update URL query params (if implemented)
- [ ] Multiple filters work together
- [ ] Clearing filters shows all results

---

### 4. Error Handling Tests

#### Backend Errors:
- [ ] Invalid user ID returns proper error
- [ ] Unauthorized access returns 403
- [ ] Missing required fields returns validation error
- [ ] Database errors handled gracefully

#### Frontend Errors:
- [ ] Network errors show error toast
- [ ] GraphQL errors display user-friendly message
- [ ] Invalid form inputs show validation errors
- [ ] 404 errors handled (user/team not found)

---

### 5. Performance Tests

#### Load Time:
- [ ] Pages load in < 2 seconds
- [ ] GraphQL queries respond in < 1 second
- [ ] Table rendering is smooth (no janky scrolling)
- [ ] Modals open instantly

#### Data Fetching:
- [ ] Pagination doesn't re-fetch all data
- [ ] Apollo Client caches queries properly
- [ ] Refetch only happens when needed

---

### 6. Security Tests

#### Authentication:
- [ ] Non-admin users cannot access admin pages
- [ ] GraphQL queries require authentication
- [ ] Token validation works correctly

#### Authorization:
- [ ] Permission checks enforce access control
- [ ] Cannot perform actions without proper permissions
- [ ] Error messages don't leak sensitive info

#### Input Validation:
- [ ] SQL injection attempts fail
- [ ] XSS attempts are escaped
- [ ] Invalid input types rejected

---

## 🐛 Known Issues

### Non-Critical:
1. Port 8080 conflict (webhook server) - doesn't affect main functionality
2. Debouncing not implemented for search inputs - search happens on every keystroke
3. URL query params not implemented for filters - state resets on page refresh

### To Fix Later:
1. Add loading skeleton instead of spinner
2. Improve mobile responsiveness
3. Add keyboard shortcuts
4. Add ARIA labels for accessibility
5. Implement export to CSV functionality

---

## ✅ Testing Results

**Date Tested:** _______________
**Tester:** _______________
**Version:** 0.3.9

### Summary:
- Total Tests: _______________
- Passed: _______________
- Failed: _______________
- Blocked: _______________

### Critical Issues Found:
1. _______________
2. _______________
3. _______________

### Notes:
_______________________________________________
_______________________________________________
_______________________________________________

---

## 📝 Next Steps After Testing

1. **If all tests pass:**
   - Mark Admin Panel Week 2 as Production Ready
   - Create release notes
   - Deploy to staging environment
   - Move to next feature stage

2. **If tests fail:**
   - Document all failing tests
   - Create bug tickets
   - Fix critical issues first
   - Re-test after fixes
   - Repeat until all tests pass

3. **Optional improvements:**
   - Add unit tests
   - Add E2E tests with Playwright
   - Implement debouncing
   - Add URL state management
   - Improve error messages

---

**Document Status:** Ready for Use
**Last Updated:** 2025-12-16, 18:55
