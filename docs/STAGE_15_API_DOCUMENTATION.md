# Stage 15: Subscription Plans & Payment Providers - API Documentation

**Version:** v0.10.0
**Last Updated:** 2025-12-19
**GraphQL Endpoint:** `http://localhost:4000/graphql`

## Overview

This document provides complete API documentation for all GraphQL queries and mutations added in Stage 15. The API supports subscription plan management, payment provider configuration, and public pricing display with multi-currency support.

## Table of Contents

1. [Public Queries](#public-queries)
2. [Admin Queries](#admin-queries)
3. [Admin Mutations](#admin-mutations)
4. [Object Types](#object-types)
5. [Input Types](#input-types)
6. [Enums](#enums)
7. [Usage Examples](#usage-examples)
8. [Error Handling](#error-handling)

---

## Public Queries

### `availablePlans`

Fetches all active subscription plans with prices and features. Public query, no authentication required.

**Signature:**
```graphql
availablePlans(currency: String!): [AvailablePlan!]!
```

**Arguments:**
- `currency` (String!, required): Currency code (RUB, USD, EUR)

**Returns:** Array of `AvailablePlan` objects

**Example Request:**
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
    sortOrder
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

**Example Variables:**
```json
{
  "currency": "RUB"
}
```

**Example Response:**
```json
{
  "data": {
    "availablePlans": [
      {
        "id": "uuid-lite",
        "name": "Lite",
        "slug": "lite",
        "description": "Для индивидуальных прорабов...",
        "maxActiveProjects": 1,
        "maxMembers": 3,
        "storageGB": 5,
        "isPopular": false,
        "isEarlyBird": true,
        "sortOrder": 0,
        "prices": [
          {
            "id": "uuid-price",
            "currency": "RUB",
            "price": 990,
            "earlyBirdPrice": 790,
            "billingCycleDays": 30
          }
        ],
        "features": [
          {
            "id": "uuid-feature",
            "name": "Базовые отчеты",
            "description": "Простые отчеты по проектам",
            "isIncluded": true,
            "sortOrder": 0
          }
        ]
      }
    ]
  }
}
```

**Notes:**
- Only returns plans where `isActive = true`
- Filters prices by currency (only returns matching currency price)
- Features are sorted by `sortOrder` ascending
- Plans are sorted by `sortOrder` ascending

---

## Admin Queries

All admin queries require authentication and appropriate permissions.

### `adminPlans`

Fetches all subscription plans with optional filtering. Includes subscription counts and archived plans.

**Signature:**
```graphql
adminPlans(isActive: Boolean, search: String): [AdminPlan!]!
```

**Arguments:**
- `isActive` (Boolean, optional): Filter by active status. `null` returns all plans
- `search` (String, optional): Search by plan name or slug (case-insensitive)

**Required Permission:** `plans:view`

**Returns:** Array of `AdminPlan` objects

**Example Request:**
```graphql
query GetAdminPlans($isActive: Boolean, $search: String) {
  adminPlans(isActive: $isActive, search: $search) {
    id
    name
    slug
    description
    isActive
    maxActiveProjects
    maxMembers
    storageGB
    isPopular
    isEarlyBird
    sortOrder
    subscriptionsCount
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
    createdAt
    updatedAt
  }
}
```

**Example Variables:**
```json
{
  "isActive": true,
  "search": "Foreman"
}
```

---

### `adminPlan`

Fetches a single plan by ID.

**Signature:**
```graphql
adminPlan(id: String!): AdminPlan
```

**Arguments:**
- `id` (String!, required): Plan UUID

**Required Permission:** `plans:view`

**Returns:** `AdminPlan` object or `null` if not found

**Example Request:**
```graphql
query GetAdminPlan($id: String!) {
  adminPlan(id: $id) {
    id
    name
    slug
    description
    isActive
    maxActiveProjects
    maxMembers
    storageGB
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

---

### `adminPlanBySlug`

Fetches a single plan by slug.

**Signature:**
```graphql
adminPlanBySlug(slug: String!): AdminPlan
```

**Arguments:**
- `slug` (String!, required): Plan slug (e.g., "lite", "foreman")

**Required Permission:** `plans:view`

**Returns:** `AdminPlan` object or `null` if not found

---

### `adminPlansPaginated`

Fetches plans with pagination support.

**Signature:**
```graphql
adminPlansPaginated(
  page: Int
  limit: Int
  isActive: Boolean
  search: String
): AdminPlansPaginated!
```

**Arguments:**
- `page` (Int, optional): Page number (1-indexed), default: 1
- `limit` (Int, optional): Items per page, default: 10
- `isActive` (Boolean, optional): Filter by active status
- `search` (String, optional): Search query

**Required Permission:** `plans:view`

**Returns:** `AdminPlansPaginated` object with `plans`, `total`, `page`, `limit`

**Example Request:**
```graphql
query GetAdminPlansPaginated($page: Int, $limit: Int) {
  adminPlansPaginated(page: $page, limit: $limit) {
    plans {
      id
      name
      slug
      isActive
      subscriptionsCount
    }
    total
    page
    limit
  }
}
```

---

### `adminPaymentProviders`

Fetches all payment providers with configuration status.

**Signature:**
```graphql
adminPaymentProviders(baseUrl: String): [AdminPaymentProvider!]!
```

**Arguments:**
- `baseUrl` (String, optional): Base URL for webhook URL generation (e.g., "https://prorab.space")

**Required Permission:** `payment_providers:view`

**Returns:** Array of `AdminPaymentProvider` objects

**Example Request:**
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
    createdAt
    updatedAt
  }
}
```

**Example Variables:**
```json
{
  "baseUrl": "https://prorab.space"
}
```

**Example Response:**
```json
{
  "data": {
    "adminPaymentProviders": [
      {
        "id": "uuid-yookassa",
        "type": "YOOKASSA",
        "name": "ЮKassa (Yookassa)",
        "isActive": true,
        "isPrimary": true,
        "webhookUrl": "https://prorab.space/api/webhooks/payments/yookassa",
        "configStatus": {
          "hasShopId": true,
          "hasSecretKey": true,
          "hasWebhookSecret": true,
          "hasPublishableKey": false
        },
        "createdAt": "2025-12-19T10:00:00Z",
        "updatedAt": "2025-12-19T10:00:00Z"
      },
      {
        "id": "uuid-stripe",
        "type": "STRIPE",
        "name": "Stripe",
        "isActive": true,
        "isPrimary": false,
        "webhookUrl": "https://prorab.space/api/webhooks/payments/stripe",
        "configStatus": {
          "hasShopId": false,
          "hasSecretKey": false,
          "hasWebhookSecret": false,
          "hasPublishableKey": false
        },
        "createdAt": "2025-12-19T10:00:00Z",
        "updatedAt": "2025-12-19T10:00:00Z"
      }
    ]
  }
}
```

---

### `adminPaymentProvider`

Fetches a single payment provider by type.

**Signature:**
```graphql
adminPaymentProvider(type: PaymentProviderType!, baseUrl: String): AdminPaymentProvider
```

**Arguments:**
- `type` (PaymentProviderType!, required): Provider type (YOOKASSA or STRIPE)
- `baseUrl` (String, optional): Base URL for webhook URL generation

**Required Permission:** `payment_providers:view`

**Returns:** `AdminPaymentProvider` object or `null` if not found

---

### `adminPaymentProviderConfig`

Fetches configuration details for a provider (safe view, no secrets exposed).

**Signature:**
```graphql
adminPaymentProviderConfig(type: PaymentProviderType!): ProviderConfig!
```

**Arguments:**
- `type` (PaymentProviderType!, required): Provider type

**Required Permission:** `payment_providers:view`

**Returns:** `ProviderConfig` object

**Example Request:**
```graphql
query GetProviderConfig($type: PaymentProviderType!) {
  adminPaymentProviderConfig(type: $type) {
    shopId
    hasSecretKey
    hasWebhookSecret
    hasPublishableKey
  }
}
```

**Example Response:**
```json
{
  "data": {
    "adminPaymentProviderConfig": {
      "shopId": "123456",
      "hasSecretKey": true,
      "hasWebhookSecret": true,
      "hasPublishableKey": false
    }
  }
}
```

**Notes:**
- `shopId` is returned in plain text (not sensitive)
- Secret fields return boolean flags only (never expose secrets)

---

## Admin Mutations

### `adminCreatePlan`

Creates a new subscription plan with prices and features.

**Signature:**
```graphql
adminCreatePlan(input: CreatePlanInput!): AdminPlan!
```

**Arguments:**
- `input` (CreatePlanInput!, required): Plan data

**Required Permission:** `plans:manage`

**Returns:** Created `AdminPlan` object

**Example Request:**
```graphql
mutation CreatePlan($input: CreatePlanInput!) {
  adminCreatePlan(input: $input) {
    id
    name
    slug
    isActive
    prices {
      id
      currency
      price
    }
  }
}
```

**Example Variables:**
```json
{
  "input": {
    "name": "Enterprise",
    "slug": "enterprise",
    "description": "Для крупных строительных компаний",
    "maxActiveProjects": null,
    "maxMembers": 50,
    "storageGB": 100,
    "isPopular": false,
    "isEarlyBird": false,
    "sortOrder": 3,
    "prices": [
      {
        "currency": "RUB",
        "price": 9990,
        "earlyBirdPrice": 7990,
        "billingCycleDays": 30
      },
      {
        "currency": "USD",
        "price": 99,
        "earlyBirdPrice": 79,
        "billingCycleDays": 30
      }
    ],
    "features": [
      {
        "name": "Безлимитные проекты",
        "description": "Нет ограничений на количество проектов",
        "isIncluded": true,
        "sortOrder": 0
      }
    ]
  }
}
```

---

### `adminUpdatePlan`

Updates an existing plan.

**Signature:**
```graphql
adminUpdatePlan(id: String!, input: UpdatePlanInput!): AdminPlan!
```

**Arguments:**
- `id` (String!, required): Plan UUID
- `input` (UpdatePlanInput!, required): Updated plan data

**Required Permission:** `plans:manage`

**Returns:** Updated `AdminPlan` object

**Example Request:**
```graphql
mutation UpdatePlan($id: String!, $input: UpdatePlanInput!) {
  adminUpdatePlan(id: $id, input: $input) {
    id
    name
    description
    maxMembers
    updatedAt
  }
}
```

---

### `adminArchivePlan`

Archives a plan (sets `isActive = false`).

**Signature:**
```graphql
adminArchivePlan(id: String!): AdminPlan!
```

**Arguments:**
- `id` (String!, required): Plan UUID

**Required Permission:** `plans:manage`

**Returns:** Archived `AdminPlan` object

**Notes:**
- Plan remains in database but is hidden from public pricing page
- Existing subscriptions continue unaffected

---

### `adminActivatePlan`

Activates an archived plan (sets `isActive = true`).

**Signature:**
```graphql
adminActivatePlan(id: String!): AdminPlan!
```

**Arguments:**
- `id` (String!, required): Plan UUID

**Required Permission:** `plans:manage`

**Returns:** Activated `AdminPlan` object

---

### `adminDeletePlan`

Permanently deletes a plan.

**Signature:**
```graphql
adminDeletePlan(id: String!): Boolean!
```

**Arguments:**
- `id` (String!, required): Plan UUID

**Required Permission:** `plans:manage`

**Returns:** `true` if successful

**Error Conditions:**
- Throws error if plan has active subscriptions (`subscriptionsCount > 0`)
- Returns `false` if plan not found

**Notes:**
- This is a destructive operation - cannot be undone
- All associated prices and features are also deleted (CASCADE)
- Use `adminArchivePlan` instead to preserve data

---

### `adminUpdatePaymentProvider`

Updates payment provider configuration.

**Signature:**
```graphql
adminUpdatePaymentProvider(
  type: PaymentProviderType!
  input: UpdatePaymentProviderInput!
): AdminPaymentProvider!
```

**Arguments:**
- `type` (PaymentProviderType!, required): Provider type
- `input` (UpdatePaymentProviderInput!, required): Updated configuration

**Required Permission:** `payment_providers:manage`

**Returns:** Updated `AdminPaymentProvider` object

**Example Request:**
```graphql
mutation UpdateProvider($type: PaymentProviderType!, $input: UpdatePaymentProviderInput!) {
  adminUpdatePaymentProvider(type: $type, input: $input) {
    id
    type
    isActive
    isPrimary
    configStatus {
      hasShopId
      hasSecretKey
      hasWebhookSecret
    }
  }
}
```

**Example Variables:**
```json
{
  "type": "YOOKASSA",
  "input": {
    "isActive": true,
    "isPrimary": true,
    "shopId": "123456",
    "secretKey": "live_xxxxxxxxxxxx",
    "webhookSecret": "webhook_secret_xxxxxxxxxxxx"
  }
}
```

**Notes:**
- Credentials are automatically encrypted before storage
- Uses AES-256-GCM encryption via SystemSettings
- Setting `isPrimary = true` automatically sets all other providers to `false`

---

### `adminTestPaymentProvider`

Tests payment provider connectivity.

**Signature:**
```graphql
adminTestPaymentProvider(type: PaymentProviderType!): TestProviderResult!
```

**Arguments:**
- `type` (PaymentProviderType!, required): Provider type to test

**Required Permission:** `payment_providers:manage`

**Returns:** `TestProviderResult` object

**Example Request:**
```graphql
mutation TestProvider($type: PaymentProviderType!) {
  adminTestPaymentProvider(type: $type) {
    success
    message
    error
  }
}
```

**Example Response (Success):**
```json
{
  "data": {
    "adminTestPaymentProvider": {
      "success": true,
      "message": "Yookassa provider connection successful",
      "error": null
    }
  }
}
```

**Example Response (Failure):**
```json
{
  "data": {
    "adminTestPaymentProvider": {
      "success": false,
      "message": null,
      "error": "Invalid API credentials"
    }
  }
}
```

---

### `adminClearPaymentProviderCache`

Clears cached provider instances (useful after configuration changes).

**Signature:**
```graphql
adminClearPaymentProviderCache(type: PaymentProviderType): Boolean!
```

**Arguments:**
- `type` (PaymentProviderType, optional): Specific provider to clear. If `null`, clears all providers

**Required Permission:** `payment_providers:manage`

**Returns:** `true` if successful

**Example Request:**
```graphql
mutation ClearCache($type: PaymentProviderType) {
  adminClearPaymentProviderCache(type: $type)
}
```

**Notes:**
- Call this after updating provider credentials
- Factory pattern caches provider instances for performance
- Clearing cache forces re-initialization on next request

---

## Object Types

### `AvailablePlan`

Public-facing plan object (filtered for non-admin users).

```graphql
type AvailablePlan {
  id: ID!
  name: String!
  slug: String!
  description: String
  maxActiveProjects: Int       # null = unlimited
  maxMembers: Int!
  storageGB: Int!
  isPopular: Boolean!
  isEarlyBird: Boolean!
  sortOrder: Int!
  prices: [PlanPrice!]!        # Filtered by currency
  features: [PlanFeature!]!
}
```

---

### `AdminPlan`

Admin-facing plan object with additional fields.

```graphql
type AdminPlan {
  id: ID!
  name: String!
  slug: String!
  description: String
  isActive: Boolean!
  maxActiveProjects: Int       # null = unlimited
  maxMembers: Int!
  storageGB: Int!
  isPopular: Boolean!
  isEarlyBird: Boolean!
  sortOrder: Int!
  subscriptionsCount: Int!     # Count of active subscriptions
  prices: [PlanPrice!]!        # All prices (all currencies)
  features: [PlanFeature!]!
  createdAt: DateTime!
  updatedAt: DateTime!
}
```

---

### `PlanPrice`

Pricing information for a specific currency.

```graphql
type PlanPrice {
  id: ID!
  planId: String!
  currency: String!            # RUB, USD, EUR
  price: Int!                  # Price in minor units (cents/kopecks)
  earlyBirdPrice: Int          # Early Bird price (optional)
  billingCycleDays: Int!       # Usually 30 for monthly
  isActive: Boolean!
  createdAt: DateTime!
  updatedAt: DateTime!
}
```

---

### `PlanFeature`

Feature included in a plan.

```graphql
type PlanFeature {
  id: ID!
  planId: String!
  name: String!
  description: String
  isIncluded: Boolean!         # true = included, false = not included
  sortOrder: Int!
  createdAt: DateTime!
  updatedAt: DateTime!
}
```

---

### `AdminPaymentProvider`

Payment provider configuration and status.

```graphql
type AdminPaymentProvider {
  id: ID!
  type: PaymentProviderType!
  name: String!
  isActive: Boolean!
  isPrimary: Boolean!
  webhookUrl: String!
  configStatus: ProviderConfigStatus!
  createdAt: DateTime!
  updatedAt: DateTime!
}
```

---

### `ProviderConfigStatus`

Provider configuration status flags.

```graphql
type ProviderConfigStatus {
  hasShopId: Boolean!
  hasSecretKey: Boolean!
  hasWebhookSecret: Boolean!
  hasPublishableKey: Boolean!
}
```

**Notes:**
- Flags indicate whether sensitive fields are configured
- Never exposes actual secret values

---

### `ProviderConfig`

Safe view of provider configuration (no secrets).

```graphql
type ProviderConfig {
  shopId: String               # Plain text (not sensitive)
  hasSecretKey: Boolean!
  hasWebhookSecret: Boolean!
  hasPublishableKey: Boolean!
}
```

---

### `TestProviderResult`

Result of payment provider connectivity test.

```graphql
type TestProviderResult {
  success: Boolean!
  message: String
  error: String
}
```

---

### `AdminPlansPaginated`

Paginated plans response.

```graphql
type AdminPlansPaginated {
  plans: [AdminPlan!]!
  total: Int!
  page: Int!
  limit: Int!
}
```

---

## Input Types

### `CreatePlanInput`

Input for creating a new plan.

```graphql
input CreatePlanInput {
  name: String!
  slug: String!
  description: String
  maxActiveProjects: Int       # null = unlimited
  maxMembers: Int!
  storageGB: Int!
  isPopular: Boolean = false
  isEarlyBird: Boolean = false
  sortOrder: Int = 0
  prices: [CreatePlanPriceInput!]!
  features: [CreatePlanFeatureInput!]!
}
```

---

### `UpdatePlanInput`

Input for updating a plan.

```graphql
input UpdatePlanInput {
  name: String
  description: String
  maxActiveProjects: Int
  maxMembers: Int
  storageGB: Int
  isPopular: Boolean
  isEarlyBird: Boolean
  sortOrder: Int
  prices: [UpdatePlanPriceInput!]
  features: [UpdatePlanFeatureInput!]
}
```

**Notes:**
- All fields are optional (partial updates supported)
- `slug` cannot be updated (immutable)

---

### `CreatePlanPriceInput`

Input for creating a plan price.

```graphql
input CreatePlanPriceInput {
  currency: String!            # RUB, USD, EUR
  price: Int!
  earlyBirdPrice: Int
  billingCycleDays: Int = 30
}
```

---

### `UpdatePlanPriceInput`

Input for updating a plan price.

```graphql
input UpdatePlanPriceInput {
  id: String                   # If provided, updates existing price
  currency: String!
  price: Int
  earlyBirdPrice: Int
  billingCycleDays: Int
  isActive: Boolean
}
```

---

### `CreatePlanFeatureInput`

Input for creating a plan feature.

```graphql
input CreatePlanFeatureInput {
  name: String!
  description: String
  isIncluded: Boolean = true
  sortOrder: Int = 0
}
```

---

### `UpdatePlanFeatureInput`

Input for updating a plan feature.

```graphql
input UpdatePlanFeatureInput {
  id: String                   # If provided, updates existing feature
  name: String
  description: String
  isIncluded: Boolean
  sortOrder: Int
}
```

---

### `UpdatePaymentProviderInput`

Input for updating payment provider configuration.

```graphql
input UpdatePaymentProviderInput {
  isActive: Boolean
  isPrimary: Boolean
  shopId: String
  secretKey: String            # Encrypted before storage
  webhookSecret: String        # Encrypted before storage
  publishableKey: String       # Encrypted before storage (for Stripe)
}
```

**Notes:**
- All fields are optional
- Secrets are automatically encrypted using AES-256-GCM
- Setting `isPrimary = true` sets all other providers to `false`

---

## Enums

### `PaymentProviderType`

Supported payment providers.

```graphql
enum PaymentProviderType {
  YOOKASSA
  STRIPE
}
```

---

## Usage Examples

### Example 1: Display Pricing Page

**Frontend Code:**
```typescript
import { useQuery } from '@apollo/client'
import { GetAvailablePlansDocument } from '@/graphql/__generated__/output'

function PricingPage() {
  const [currency, setCurrency] = useState('RUB')

  const { data, loading } = useQuery(GetAvailablePlansDocument, {
    variables: { currency }
  })

  if (loading) return <Spinner />

  return (
    <div>
      <CurrencySelector value={currency} onChange={setCurrency} />
      {data?.availablePlans.map(plan => (
        <PlanCard key={plan.id} plan={plan} />
      ))}
    </div>
  )
}
```

---

### Example 2: Admin Plans List with Search

**Frontend Code:**
```typescript
import { useQuery } from '@apollo/client'
import { GetAdminPlansDocument } from '@/graphql/__generated__/output'

function AdminPlansPage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<boolean | null>(null)

  const { data, loading } = useQuery(GetAdminPlansDocument, {
    variables: {
      isActive: statusFilter,
      search: search || null
    }
  })

  return (
    <div>
      <Input value={search} onChange={(e) => setSearch(e.target.value)} />
      <Select value={statusFilter} onChange={setStatusFilter}>
        <option value={null}>All</option>
        <option value={true}>Active</option>
        <option value={false}>Archived</option>
      </Select>

      <Table>
        {data?.adminPlans.map(plan => (
          <TableRow key={plan.id}>
            <TableCell>{plan.name}</TableCell>
            <TableCell>{plan.subscriptionsCount}</TableCell>
          </TableRow>
        ))}
      </Table>
    </div>
  )
}
```

---

### Example 3: Test Payment Provider

**Frontend Code:**
```typescript
import { useMutation } from '@apollo/client'
import { TestPaymentProviderDocument } from '@/graphql/__generated__/output'

function TestProviderButton({ type }: { type: 'YOOKASSA' | 'STRIPE' }) {
  const [testProvider, { loading }] = useMutation(TestPaymentProviderDocument)

  const handleTest = async () => {
    const { data } = await testProvider({ variables: { type } })

    if (data?.adminTestPaymentProvider.success) {
      toast.success(data.adminTestPaymentProvider.message)
    } else {
      toast.error(data?.adminTestPaymentProvider.error)
    }
  }

  return (
    <Button onClick={handleTest} disabled={loading}>
      {loading ? 'Testing...' : 'Test Connection'}
    </Button>
  )
}
```

---

## Error Handling

### Authentication Errors

```json
{
  "errors": [
    {
      "message": "Unauthorized",
      "extensions": {
        "code": "UNAUTHENTICATED"
      }
    }
  ]
}
```

**HTTP Status:** 401

---

### Permission Errors

```json
{
  "errors": [
    {
      "message": "Insufficient permissions",
      "extensions": {
        "code": "FORBIDDEN",
        "requiredPermission": "plans:manage"
      }
    }
  ]
}
```

**HTTP Status:** 403

---

### Validation Errors

```json
{
  "errors": [
    {
      "message": "Cannot delete plan with active subscriptions",
      "extensions": {
        "code": "BAD_USER_INPUT",
        "subscriptionsCount": 5
      }
    }
  ]
}
```

**HTTP Status:** 400

---

### Not Found Errors

```json
{
  "errors": [
    {
      "message": "Plan not found",
      "extensions": {
        "code": "NOT_FOUND",
        "resourceId": "uuid-xxx"
      }
    }
  ]
}
```

**HTTP Status:** 404

---

## Rate Limiting

No rate limiting is currently implemented. Consider adding rate limiting for:
- Public queries: 100 requests/minute per IP
- Admin queries: 1000 requests/minute per user
- Mutations: 100 requests/minute per user

---

## Deprecations

### Deprecated Fields
- `Subscription.plan` (enum) - Use `Subscription.planId` instead. Will be removed in v1.0.0

### Migration Guide
Replace enum-based plan access with FK-based:

**Before:**
```graphql
query GetSubscription {
  subscription(id: $id) {
    plan  # LITE, FOREMAN, BRIGADE
  }
}
```

**After:**
```graphql
query GetSubscription {
  subscription(id: $id) {
    planId
    planDetails {
      name
      slug
    }
  }
}
```

---

## Changelog

### v0.10.0 (2025-12-19)
- **Added:** `availablePlans` public query
- **Added:** `adminPlans`, `adminPlan`, `adminPlanBySlug` queries
- **Added:** `adminPlansPaginated` query with pagination
- **Added:** `adminPaymentProviders`, `adminPaymentProvider`, `adminPaymentProviderConfig` queries
- **Added:** `adminCreatePlan`, `adminUpdatePlan`, `adminArchivePlan`, `adminActivatePlan`, `adminDeletePlan` mutations
- **Added:** `adminUpdatePaymentProvider`, `adminTestPaymentProvider`, `adminClearPaymentProviderCache` mutations
- **Added:** 13 new object types for plans and payment providers
- **Added:** 8 new input types for plan and provider management
- **Added:** `PaymentProviderType` enum
- **Deprecated:** `Subscription.plan` enum field (use `planId` instead)

---

## Support

For API questions or issues:
1. Check this documentation first
2. Review GraphQL schema in Playground (`http://localhost:4000/graphql`)
3. Check Stage 15 testing guide (`docs/STAGE_15_TESTING_GUIDE.md`)
4. Contact backend team

---

**Documentation Version:** 1.0
**API Version:** v0.10.0
**Last Updated:** 2025-12-19
