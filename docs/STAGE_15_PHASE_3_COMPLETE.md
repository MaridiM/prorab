# Stage 15 - Phase 3: Backend Services & GraphQL - COMPLETE ✅

**Date:** December 19, 2025
**Status:** ✅ 100% Complete
**Progress:** Phase 3/7 (42% of Stage 15)

## 📋 Overview

Phase 3 implements the complete backend API layer for subscription plans and payment providers management. This includes:
- Admin services for CRUD operations
- GraphQL resolvers with permission guards
- Input validation and error handling
- Audit logging for all admin actions
- Configuration management via SystemSettings

---

## ✨ What Was Implemented

### 1. **AdminPlansService** (600+ LOC)

Full CRUD service for subscription plan management.

**File:** `apps/api/src/modules/admin/services/admin-plans.service.ts`

**Methods:**
- `findAll(filters?, pagination?)` - List all plans with optional filtering and pagination
- `findOne(planId)` - Get plan by ID with prices, features, and subscription count
- `findBySlug(slug)` - Get plan by slug (e.g., "lite", "foreman")
- `create(input, adminId)` - Create new plan with nested prices and features
- `update(planId, input, adminId)` - Update plan (supports partial updates)
- `archive(planId, adminId)` - Soft delete (set isActive = false)
- `activate(planId, adminId)` - Reactivate archived plan
- `delete(planId, adminId)` - Hard delete (only if no active subscriptions)
- `getAvailablePlans(currency?)` - Public API for active plans

**Key Features:**
- Validates slug uniqueness
- Prevents deletion of plans with active subscriptions
- Audit logging for all operations
- Supports multi-currency prices (RUB, USD, EUR)
- Transaction-based updates for data consistency

**Example Usage:**
```typescript
// Create a new plan
const plan = await adminPlansService.create({
  slug: 'enterprise',
  name: 'Enterprise',
  description: 'For large construction companies',
  maxActiveProjects: null, // unlimited
  maxMembers: 100,
  storageGB: 500,
  isPopular: false,
  sortOrder: 3,
  prices: [
    { currency: 'RUB', price: 49900, earlyBirdPrice: 39900 },
    { currency: 'USD', price: 499, earlyBirdPrice: 399 },
  ],
  features: [
    { name: 'Unlimited projects', isIncluded: true, sortOrder: 0 },
    { name: 'Dedicated support', isIncluded: true, sortOrder: 1 },
  ],
}, adminUserId);
```

---

### 2. **AdminPaymentProvidersService** (350+ LOC)

Service for managing payment provider configuration and testing.

**File:** `apps/api/src/modules/admin/services/admin-payment-providers.service.ts`

**Methods:**
- `findAll(baseUrl?)` - List all providers with webhook URLs and config status
- `findByType(type, baseUrl?)` - Get specific provider (YOOKASSA or STRIPE)
- `updateProvider(type, input, adminId)` - Update provider settings and credentials
- `testProvider(type)` - Test provider connection with current credentials
- `getProviderConfig(type)` - Get provider configuration (secrets masked)
- `clearProviderCache(type?, adminId?)` - Force provider re-initialization

**Key Features:**
- Saves credentials to SystemSettings (encrypted via AES-256-GCM)
- Primary provider management (only one can be primary)
- Webhook URL generation for each provider
- Connection testing for validation
- Cache management for performance

**Configuration Priority:**
1. Database (SystemSettings)
2. Environment variables (.env)

**Example Usage:**
```typescript
// Configure Stripe provider
await adminPaymentProvidersService.updateProvider(
  PaymentProviderType.STRIPE,
  {
    isActive: true,
    isPrimary: true,
    config: {
      secretKey: 'sk_test_...',
      webhookSecret: 'whsec_...',
      publishableKey: 'pk_test_...',
    },
  },
  adminUserId
);

// Test connection
const result = await adminPaymentProvidersService.testProvider(
  PaymentProviderType.STRIPE
);
// { success: true, message: 'STRIPE connection successful' }
```

---

### 3. **GraphQL Models** (320+ LOC)

**Files:**
- `apps/api/src/modules/admin/models/admin-plan.model.ts` (220 LOC)
- `apps/api/src/modules/admin/models/admin-payment-provider.model.ts` (100 LOC)

**Object Types:**
- `AdminPlanModel` - Plan with prices, features, subscriptions count
- `AdminPlanPriceModel` - Price in specific currency
- `AdminPlanFeatureModel` - Plan feature
- `AdminPlansConnection` - Paginated list with page info
- `AdminPaymentProviderModel` - Provider with webhook URL and config status
- `PaymentProviderConfigStatus` - Which settings are configured
- `TestConnectionResult` - Test result with success/error

**Input Types:**
- `AdminPlanFilters` - Search, isActive, currency filters
- `AdminCreatePlanInput` - Create plan with prices and features
- `AdminUpdatePlanInput` - Update plan (all fields optional)
- `AdminPlanPriceInput` - Price input
- `AdminPlanFeatureInput` - Feature input
- `UpdatePaymentProviderInput` - Update provider settings
- `PaymentProviderConfigInput` - Provider credentials

---

### 4. **GraphQL Resolvers** (240+ LOC)

**Files:**
- `apps/api/src/modules/admin/resolvers/admin-plans.resolver.ts` (140 LOC)
- `apps/api/src/modules/admin/resolvers/admin-payment-providers.resolver.ts` (100 LOC)

**Plans Queries:**
- `adminPlans(filters?)` - List all plans (no pagination)
- `adminPlansPaginated(filters, pagination)` - Paginated list
- `adminPlan(id)` - Get plan by ID
- `adminPlanBySlug(slug)` - Get plan by slug
- `availablePlans(currency?)` - Public API (no auth required)

**Plans Mutations:**
- `adminCreatePlan(input)` - Create plan
- `adminUpdatePlan(id, input)` - Update plan
- `adminArchivePlan(id)` - Archive plan
- `adminActivatePlan(id)` - Activate plan
- `adminDeletePlan(id)` - Delete plan

**Payment Providers Queries:**
- `adminPaymentProviders(baseUrl?)` - List all providers
- `adminPaymentProvider(type, baseUrl?)` - Get specific provider
- `adminPaymentProviderConfig(type)` - Get provider config (secrets masked)

**Payment Providers Mutations:**
- `adminUpdatePaymentProvider(type, input)` - Update provider
- `adminTestPaymentProvider(type)` - Test provider connection
- `adminClearPaymentProviderCache(type?)` - Clear cache

**Security:**
- All queries/mutations require authentication (`@UseGuards(AuthGuard)`)
- Admin-only access (`@UseGuards(AdminGuard)`)
- Permission-based access control (`@UseGuards(PermissionsGuard)`)
- Permissions: `PLANS_VIEW`, `PLANS_MANAGE`, `PAYMENT_PROVIDERS_VIEW`, `PAYMENT_PROVIDERS_MANAGE`

---

### 5. **Permissions System** (4 new permissions)

**File:** `apps/api/src/shared/constants/admin-permissions.ts`

**New Permissions:**
```typescript
// Plan Management
PLANS_VIEW: 'plans:view',
PLANS_MANAGE: 'plans:manage', // Create, update, archive, delete

// Payment Provider Management
PAYMENT_PROVIDERS_VIEW: 'payment_providers:view',
PAYMENT_PROVIDERS_MANAGE: 'payment_providers:manage',
```

**Role Assignment:**
- SUPER_ADMIN: All permissions (automatic)
- ADMIN: All 4 new permissions included in preset

---

### 6. **Module Integration**

**File:** `apps/api/src/modules/admin/admin.module.ts`

**Added:**
- `PaymentProviderFactory` (dependency for AdminPaymentProvidersService)
- `AdminPlansService`
- `AdminPaymentProvidersService`
- `AdminPlansResolver`
- `AdminPaymentProvidersResolver`

**Exports:**
- All services exported for use in other modules

---

## 📊 Files Summary

### Created (7 files, 1,510 LOC)

| File | LOC | Description |
|------|-----|-------------|
| `admin-plans.service.ts` | 600 | Plans CRUD service |
| `admin-payment-providers.service.ts` | 350 | Providers configuration service |
| `admin-plan.model.ts` | 220 | GraphQL models for plans |
| `admin-payment-provider.model.ts` | 100 | GraphQL models for providers |
| `admin-plans.resolver.ts` | 140 | Plans GraphQL resolver |
| `admin-payment-providers.resolver.ts` | 100 | Providers GraphQL resolver |

### Modified (7 files)

| File | Changes |
|------|---------|
| `admin.module.ts` | Added new services and resolvers |
| `admin-permissions.ts` | Added 4 new permissions |
| `payment-provider.factory.ts` | Fixed import paths, type exports |
| `payment-provider.interface.ts` | Export PaymentProviderType as value |
| `stripe.provider.ts` | Updated API version to 2025-12-15.clover |
| `yookassa.provider.ts` | Fixed idempotency key type casting |
| `admin-plans.resolver.ts` | Fixed return type for findAll method |

---

## 🔧 Technical Details

### Architecture Patterns

1. **Service Layer Pattern**
   - Business logic in services
   - Resolvers are thin, delegate to services
   - Services use PrismaService for database operations

2. **DTO Pattern**
   - GraphQL input types for data validation
   - Type-safe interfaces for service methods
   - Auto-generated Prisma types for database models

3. **Audit Pattern**
   - All admin actions logged via AdminActionLogService
   - Includes before/after state for updates
   - Tracks admin user ID and timestamp

4. **Validation Pattern**
   - Business rule validation in services
   - Unique constraint checks (slug uniqueness)
   - Relationship validation (prevent deletion with active subscriptions)

### Security Features

1. **Multi-Layer Authentication**
   - AuthGuard: Verifies JWT token
   - AdminGuard: Checks if user is admin
   - PermissionsGuard: Validates specific permissions

2. **Encryption**
   - Payment provider credentials encrypted via AES-256-GCM
   - Stored in SystemSettings table
   - Decryption on-the-fly when needed

3. **Audit Trail**
   - All CRUD operations logged
   - Includes resource type, resource ID, admin user
   - Stores detailed changes for updates

### Performance Optimizations

1. **Caching**
   - PaymentProviderFactory caches provider instances
   - Cache invalidation on configuration updates
   - Manual cache clear via admin API

2. **Pagination**
   - Cursor-based pagination support
   - Default to all results if pagination not provided
   - Efficient counting with separate count query

3. **Optimized Queries**
   - Single query with includes for relations
   - Aggregation counts via `_count`
   - Ordered results for consistent UI

---

## 🧪 Testing Recommendations

### Unit Tests

```typescript
describe('AdminPlansService', () => {
  it('should create plan with prices and features', async () => {
    const plan = await service.create(createInput, adminId);
    expect(plan.prices).toHaveLength(3);
    expect(plan.features).toHaveLength(5);
  });

  it('should prevent deletion of plan with active subscriptions', async () => {
    await expect(service.delete(planId, adminId))
      .rejects.toThrow('Cannot delete plan with active subscriptions');
  });

  it('should archive plan successfully', async () => {
    const plan = await service.archive(planId, adminId);
    expect(plan.isActive).toBe(false);
  });
});

describe('AdminPaymentProvidersService', () => {
  it('should save encrypted credentials to SystemSettings', async () => {
    await service.updateProvider(type, { config }, adminId);
    const setting = await systemSettings.getSetting('payment.stripe.secret_key');
    expect(setting.isEncrypted).toBe(true);
  });

  it('should test provider connection', async () => {
    const result = await service.testProvider(type);
    expect(result.success).toBe(true);
  });
});
```

### Integration Tests

```typescript
describe('AdminPlansResolver', () => {
  it('should require PLANS_VIEW permission', async () => {
    const result = await executeQuery(adminPlansQuery, {}, userWithoutPermission);
    expect(result.errors).toBeDefined();
  });

  it('should return paginated plans', async () => {
    const result = await executeQuery(adminPlansPaginatedQuery, { pagination: { page: 1, limit: 10 } });
    expect(result.data.adminPlansPaginated.nodes).toHaveLength(3);
  });
});
```

### E2E Tests

```typescript
describe('Plans Management Flow', () => {
  it('should complete full CRUD cycle', async () => {
    // Create
    const created = await createPlan();

    // Read
    const fetched = await getPlan(created.id);
    expect(fetched.name).toBe(created.name);

    // Update
    const updated = await updatePlan(created.id, { name: 'New Name' });
    expect(updated.name).toBe('New Name');

    // Archive
    const archived = await archivePlan(created.id);
    expect(archived.isActive).toBe(false);

    // Delete
    const deleted = await deletePlan(created.id);
    expect(deleted).toBe(true);
  });
});
```

---

## 🚀 API Usage Examples

### GraphQL Queries

```graphql
# Get all active plans with RUB prices
query GetPlans {
  adminPlans(filters: { isActive: true, currency: "RUB" }) {
    id
    slug
    name
    description
    maxMembers
    storageGB
    prices {
      currency
      price
      earlyBirdPrice
    }
    features {
      name
      isIncluded
    }
    subscriptionsCount
  }
}

# Get payment providers with configuration status
query GetProviders {
  adminPaymentProviders(baseUrl: "https://api.prorab.space") {
    id
    type
    name
    isActive
    isPrimary
    webhookUrl
    configStatus {
      hasSecretKey
      hasWebhookSecret
    }
  }
}
```

### GraphQL Mutations

```graphql
# Create a new plan
mutation CreatePlan {
  adminCreatePlan(input: {
    slug: "custom"
    name: "Custom Plan"
    maxMembers: 50
    storageGB: 100
    prices: [
      { currency: "RUB", price: 9900, earlyBirdPrice: 7900 }
    ]
    features: [
      { name: "Custom feature", isIncluded: true }
    ]
  }) {
    id
    slug
    name
  }
}

# Configure Stripe provider
mutation ConfigureStripe {
  adminUpdatePaymentProvider(
    type: STRIPE
    input: {
      isActive: true
      isPrimary: true
      config: {
        secretKey: "sk_test_..."
        webhookSecret: "whsec_..."
        publishableKey: "pk_test_..."
      }
    }
  ) {
    type
    isActive
    isPrimary
  }
}

# Test provider connection
mutation TestStripe {
  adminTestPaymentProvider(type: STRIPE) {
    success
    message
    error
  }
}
```

---

## 📝 Next Steps (Phase 4)

### Data Migration

1. **Migrate Existing Subscriptions**
   - Link subscriptions to Plan records
   - Set currency field based on current payment history
   - Preserve existing plan enum for backward compatibility

2. **Migrate Yookassa Tokens**
   - Move YOOKASSA_SHOP_ID to SystemSettings
   - Move YOOKASSA_SECRET_KEY to SystemSettings (encrypted)
   - Move YOOKASSA_WEBHOOK_SECRET to SystemSettings (encrypted)
   - Update PaymentsService to use new configuration

3. **Validation Script**
   - Verify all subscriptions have valid plan references
   - Check that all active providers have valid credentials
   - Ensure SystemSettings are properly encrypted

**Command:**
```bash
# Run migration script
pnpm --filter @prorab/api prisma migrate deploy

# Run validation
pnpm --filter @prorab/api ts-node scripts/validate-migration.ts
```

---

## 🎯 Success Metrics

- ✅ **7 files created** (1,510 LOC)
- ✅ **7 files modified** (import fixes, permission additions)
- ✅ **4 new permissions** added to RBAC system
- ✅ **15 GraphQL queries/mutations** implemented
- ✅ **100% type-safe** with auto-generated Prisma types
- ✅ **Build successful** with 0 new TypeScript errors
- ✅ **Audit logging** for all admin operations
- ✅ **Encrypted credentials** via SystemSettings
- ✅ **Permission guards** on all admin endpoints

---

## 📚 Documentation

- [Stage 15 Overview](./stages/STAGE_15_SUBSCRIPTION_PLANS_MANAGEMENT.md)
- [Phase 1 Report](./STAGE_15_PHASE_1_COMPLETE.md)
- [Phase 2 Report](./STAGE_15_PHASE_2_COMPLETE.md)
- [Phase 3 Report](./STAGE_15_PHASE_3_COMPLETE.md) ← **This document**

---

**Phase 3 Status:** ✅ **COMPLETE**
**Next Phase:** Phase 4 - Data Migration
**Overall Progress:** 42% (3/7 phases)
