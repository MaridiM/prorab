# System Settings Expansion - Technical Documentation

**Version:** v1.4.3
**Date:** 2025-12-25
**Status:** In Progress

---

## Executive Summary

This document describes the comprehensive expansion of the System Settings admin panel to consolidate all configuration management into a single, unified interface.

### Goals

1. **Add 3 new integration categories**: SMS, Social (OAuth), Analytics
2. **Consolidate admin pages**: Move Subscription Plans, Admin Roles, and Audit Logs into System Settings tabs
3. **Implement environment variable synchronization**: Automatically sync .env values to database on startup
4. **Maintain dynamic form generation**: All settings use database-driven forms

### Impact

- **Navigation**: 2 → 5 main tabs in System Settings
- **Integration Categories**: 7 → 10 categories
- **Code Changes**: ~2,200 LOC added, ~1,800 LOC removed (net +400 lines)
- **User Experience**: Single entry point for all admin configuration

---

## Architecture Overview

### Current State (v1.4.2)

```
System Settings
├── System Integrations (7 sub-tabs)
│   ├── Payment (Yookassa)
│   ├── Email (Brevo)
│   ├── Telegram
│   ├── Storage (R2)
│   ├── AI
│   ├── Security
│   └── General
└── Payment Providers

Separate Pages:
- /admin/plans (Subscription Plans)
- /admin/roles (Admin Roles)
- /admin/logs (Audit Logs)
```

### Target State (v1.4.3)

```
System Settings (Unified)
├── System Integrations (10 sub-tabs)
│   ├── Payment
│   ├── Email
│   ├── Telegram
│   ├── Storage
│   ├── SMS (NEW)
│   ├── Social (NEW)
│   ├── Analytics (NEW)
│   ├── AI
│   ├── Security
│   └── General
├── Payment Providers
├── Subscription Plans (MOVED)
├── Admin Roles (MOVED)
└── Audit Logs (MOVED)

Old URLs redirect to System Settings tabs
```

---

## Technical Implementation

### Phase 1: Backend - Database Schema

#### 1.1 Prisma Schema Extension

**File**: `apps/api/prisma/schema.prisma`

**Changes**: Add 3 new enum values to `SettingCategory`

```prisma
enum SettingCategory {
  PAYMENT
  EMAIL
  TELEGRAM
  STORAGE
  SMS        // NEW
  SOCIAL     // NEW
  ANALYTICS  // NEW
  AI
  SECURITY
  GENERAL
}
```

#### 1.2 Database Migration

**Command**: `npx prisma migrate dev --name add-sms-social-analytics-categories`

**Generated SQL**:
```sql
ALTER TYPE "SettingCategory" ADD VALUE 'SMS';
ALTER TYPE "SettingCategory" ADD VALUE 'SOCIAL';
ALTER TYPE "SettingCategory" ADD VALUE 'ANALYTICS';
```

#### 1.3 TypeScript Enum Update

**File**: `apps/api/src/modules/admin/models/setting-category.enum.ts`

```typescript
export enum SettingCategory {
  PAYMENT = 'PAYMENT',
  EMAIL = 'EMAIL',
  TELEGRAM = 'TELEGRAM',
  STORAGE = 'STORAGE',
  SMS = 'SMS',        // NEW
  SOCIAL = 'SOCIAL',  // NEW
  ANALYTICS = 'ANALYTICS', // NEW
  AI = 'AI',
  SECURITY = 'SECURITY',
  GENERAL = 'GENERAL',
}
```

---

### Phase 2: Default Settings & Environment Sync

#### 2.1 New Default Settings

**File**: `apps/api/src/modules/admin/services/system-settings.service.ts`

**SMS Settings** (Twilio integration):
- `sms.twilio.account_sid` (STRING)
- `sms.twilio.auth_token` (ENCRYPTED)
- `sms.twilio.phone_number` (STRING)

**Social Settings** (OAuth providers):
- `social.google.client_id` (STRING)
- `social.google.client_secret` (ENCRYPTED)
- `social.github.client_id` (STRING)
- `social.github.client_secret` (ENCRYPTED)

**Analytics Settings**:
- `analytics.google_analytics.measurement_id` (STRING)
- `analytics.yandex_metrika.counter_id` (STRING)
- `analytics.posthog.api_key` (ENCRYPTED)
- `analytics.posthog.host` (STRING, default: `https://app.posthog.com`)

**Total**: 11 new settings (160 LOC)

#### 2.2 Environment Variable Synchronization

**New Method**: `syncEnvToDatabase()`

**Functionality**:
1. Reads environment variables on application startup
2. Maps .env vars to SystemSettings keys
3. Populates database if setting exists but has no value
4. Never overwrites existing database values
5. Encrypts sensitive values automatically
6. Logs sync operations

**Environment Variable Mappings**:

| Category | .env Variable | DB Setting Key | Encrypted |
|----------|---------------|----------------|-----------|
| Payment | `YOOKASSA_SHOP_ID` | `payment.yookassa.shop_id` | No |
| Payment | `YOOKASSA_SECRET_KEY` | `payment.yookassa.secret_key` | Yes |
| Email | `BREVO_API_KEY` | `email.brevo.api_key` | Yes |
| Email | `MAIL_FROM_EMAIL` | `email.brevo.sender_email` | No |
| Email | `MAIL_FROM_NAME` | `email.brevo.sender_name` | No |
| Telegram | `TELEGRAM_BOT_TOKEN` | `telegram.bot_token` | Yes |
| Storage | `R2_ACCOUNT_ID` | `storage.r2.account_id` | No |
| Storage | `R2_ACCESS_KEY_ID` | `storage.r2.access_key_id` | Yes |
| Storage | `R2_SECRET_ACCESS_KEY` | `storage.r2.secret_access_key` | Yes |
| Storage | `R2_BUCKET_NAME` | `storage.r2.bucket_name` | No |
| Storage | `R2_PUBLIC_URL` | `storage.r2.public_url` | No |
| SMS | `TWILIO_ACCOUNT_SID` | `sms.twilio.account_sid` | No |
| SMS | `TWILIO_AUTH_TOKEN` | `sms.twilio.auth_token` | Yes |
| SMS | `TWILIO_PHONE_NUMBER` | `sms.twilio.phone_number` | No |
| Social | `GOOGLE_CLIENT_ID` | `social.google.client_id` | No |
| Social | `GOOGLE_CLIENT_SECRET` | `social.google.client_secret` | Yes |
| Social | `GITHUB_CLIENT_ID` | `social.github.client_id` | No |
| Social | `GITHUB_CLIENT_SECRET` | `social.github.client_secret` | Yes |
| Analytics | `GA_MEASUREMENT_ID` | `analytics.google_analytics.measurement_id` | No |
| Analytics | `YM_COUNTER_ID` | `analytics.yandex_metrika.counter_id` | No |
| Analytics | `POSTHOG_API_KEY` | `analytics.posthog.api_key` | Yes |
| Analytics | `POSTHOG_HOST` | `analytics.posthog.host` | No |

**Code Added**: ~75 lines

#### 2.3 Application Startup Integration

**File**: `apps/api/src/main.ts`

**Logic**:
```typescript
const systemSettingsService = app.get('SystemSettingsService');
await systemSettingsService.initializeDefaultSettings();
await systemSettingsService.syncEnvToDatabase();
logger.log('✅ System settings initialized and synchronized');
```

**Behavior**:
- Runs once on application startup
- Non-blocking (warns on failure, doesn't crash app)
- Idempotent (safe to run multiple times)

---

### Phase 3: Frontend Component Extraction

#### 3.1 Subscription Plans Panel

**Source**: `apps/web/src/app/(root)/(protected)/admin/plans/page.tsx` (1,272 LOC)
**Destination**: `apps/web/src/packages/components/admin/settings/subscription-plans/subscription-plans-panel.tsx`

**Changes**:
- Remove `'use client'` (parent manages client boundary)
- Export as `export function SubscriptionPlansPanel()`
- Preserve all GraphQL queries, mutations, and dialogs
- Keep `PlanDetailDialog` embedded (optional: extract to separate file)

**GraphQL Operations**:
- `GetAdminPlansDocument`
- `UpdateAdminPlanDocument`
- `ArchiveAdminPlanDocument`
- `ActivateAdminPlanDocument`
- `DeleteAdminPlanDocument`

#### 3.2 Admin Roles Panel

**Source**: `apps/web/src/app/(root)/(protected)/admin/roles/page.tsx` (322 LOC)
**Destination**: `apps/web/src/packages/components/admin/settings/admin-roles/admin-roles-panel.tsx`

**Supporting Dialogs** (moved):
- `assign-role-dialog.tsx` (350 LOC)
- `edit-permissions-dialog.tsx` (299 LOC)

**GraphQL Operations**:
- `GetAdminRolesDocument`
- `AssignAdminRoleDocument`
- `UpdateAdminPermissionsDocument`
- `UpdateTwoFactorEnforcementDocument`
- `UpdateIpWhitelistDocument`
- `RevokeAdminRoleDocument`

#### 3.3 Audit Logs Panel

**Source**: `apps/web/src/app/(root)/(protected)/admin/logs/page.tsx` (245 LOC)
**Destination**: `apps/web/src/packages/components/admin/settings/audit-logs/audit-logs-panel.tsx`

**GraphQL Operations**:
- `AdminActionLogsDocument`
- `AdminActionStatisticsDocument`

#### 3.4 Barrel Exports

**New Files**:
- `subscription-plans/index.ts`
- `admin-roles/index.ts`
- `audit-logs/index.ts`

**Updated**:
- `settings/index.ts` - Export all new panels

---

### Phase 4: Integration Settings Update

**File**: `apps/web/src/packages/components/admin/settings/integrations/integration-settings.tsx`

**Changes**:
1. Add icons import: `import { Smartphone, BarChart } from 'lucide-react'`
2. Add 3 new categories to array:
   - SMS (Smartphone icon)
   - Social (Users icon)
   - Analytics (BarChart icon)
3. Update TabsList grid: `grid-cols-7` → `grid-cols-10`

**Result**: 7 → 10 integration categories

---

### Phase 5: System Settings Tabs Expansion

**File**: `apps/web/src/packages/components/admin/settings/system-settings-tabs.tsx`

**Changes**:

1. **Type Update**:
   ```typescript
   type MainTab = 'integrations' | 'providers' | 'plans' | 'roles' | 'logs'
   ```

2. **Import New Panels**:
   ```typescript
   import { SubscriptionPlansPanel } from './subscription-plans'
   import { AdminRolesPanel } from './admin-roles'
   import { AuditLogsPanel } from './audit-logs'
   ```

3. **TabsList Update**:
   ```typescript
   <TabsList className="grid w-full max-w-4xl grid-cols-5">
     <TabsTrigger value="integrations">System Integrations</TabsTrigger>
     <TabsTrigger value="providers">Payment Providers</TabsTrigger>
     <TabsTrigger value="plans">Subscription Plans</TabsTrigger>
     <TabsTrigger value="roles">Admin Roles</TabsTrigger>
     <TabsTrigger value="logs">Audit Logs</TabsTrigger>
   </TabsList>
   ```

4. **Add TabsContent**:
   ```typescript
   <TabsContent value="plans"><SubscriptionPlansPanel /></TabsContent>
   <TabsContent value="roles"><AdminRolesPanel /></TabsContent>
   <TabsContent value="logs"><AuditLogsPanel /></TabsContent>
   ```

5. **URL Handling**:
   ```typescript
   // Remove subtab param for non-integration tabs
   if (tab !== 'integrations') {
     params.delete('subtab')
   }
   ```

---

### Phase 6: Navigation & Backward Compatibility

#### 6.1 Redirect Pages

Replace entire content of:
- `apps/web/src/app/(root)/(protected)/admin/plans/page.tsx`
- `apps/web/src/app/(root)/(protected)/admin/roles/page.tsx`
- `apps/web/src/app/(root)/(protected)/admin/logs/page.tsx`

**Pattern**:
```typescript
'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function [Feature]RedirectPage() {
  const router = useRouter()
  useEffect(() => {
    router.replace('/admin/settings?tab=[feature]')
  }, [router])

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4" />
        <p className="text-muted-foreground">Redirecting to System Settings...</p>
      </div>
    </div>
  )
}
```

**URL Mappings**:
- `/admin/plans` → `/admin/settings?tab=plans`
- `/admin/roles` → `/admin/settings?tab=roles`
- `/admin/logs` → `/admin/settings?tab=logs`

#### 6.2 Admin Sidebar Cleanup

**File**: `apps/web/src/packages/components/admin/admin-sidebar.tsx`

**Remove Navigation Items**:
- "Subscription Plans" (lines 84-88)
- "Admin Roles" (lines 108-112)
- "Audit Logs" (lines 114-118)

**Keep**:
- "System Settings" → Single entry point

**Result**: Cleaner navigation, all settings in one place

---

### Phase 7: GraphQL Type Regeneration

#### 7.1 Backend Schema

**Command**: `npm run generate` (in `apps/api`)

**Updates**: `apps/api/schema.gql`

**Expected Change**:
```graphql
enum SettingCategory {
  AI
  ANALYTICS  # NEW
  EMAIL
  GENERAL
  PAYMENT
  SECURITY
  SMS        # NEW
  SOCIAL     # NEW
  STORAGE
  TELEGRAM
}
```

#### 7.2 Frontend Types

**Command**: `npm run codegen` (in `apps/web`)

**Updates**: `apps/web/src/packages/api/graphql/__generated__/output.ts`

**Expected Change**:
```typescript
export enum SettingCategory {
  Ai = 'AI',
  Analytics = 'ANALYTICS',  // NEW
  Email = 'EMAIL',
  General = 'GENERAL',
  Payment = 'PAYMENT',
  Security = 'SECURITY',
  Sms = 'SMS',              // NEW
  Social = 'SOCIAL',        // NEW
  Storage = 'STORAGE',
  Telegram = 'TELEGRAM'
}
```

---

## Security Considerations

### Encryption

- **Algorithm**: AES-256-GCM (authenticated encryption)
- **Key Derivation**: PBKDF2 (100,000 iterations, SHA256)
- **Encrypted Fields**: All fields with `isEncrypted: true`
- **Storage**: Encrypted values stored in database, decrypted on read

### Permissions

**Required Permissions**:
- `settings:view` - Read system settings
- `settings:update` - Modify system settings

**Access Control**:
- Only SUPER_ADMIN has full settings access by default
- Regular ADMIN role lacks `settings:update` permission
- All mutations logged via `AdminActionLogService`

### Environment Variables

**Security Model**:
- .env values only sync if DB value is empty
- Database values take precedence over .env
- Changes through UI persist in DB only (never write to .env)
- Sensitive values encrypted before storage

---

## Testing Strategy

### Backend Testing

**Unit Tests**:
- [ ] `syncEnvToDatabase()` populates empty settings
- [ ] `syncEnvToDatabase()` never overwrites existing values
- [ ] Encrypted fields properly encrypted/decrypted
- [ ] New categories return from GraphQL queries

**Integration Tests**:
- [ ] Migration runs successfully
- [ ] Default settings created on first startup
- [ ] Env sync logs correct number of synced settings
- [ ] Test connection mutations accept new categories

### Frontend Testing

**Component Tests**:
- [ ] SubscriptionPlansPanel renders correctly
- [ ] AdminRolesPanel renders correctly
- [ ] AuditLogsPanel renders correctly
- [ ] Dynamic forms generate for SMS/Social/Analytics

**E2E Tests**:
- [ ] Navigate to `/admin/settings`
- [ ] Click through all 5 main tabs
- [ ] Click through all 10 integration sub-tabs
- [ ] Create SMS setting, verify saved
- [ ] Old URLs redirect correctly
- [ ] Admin sidebar no longer shows redundant items

### Security Testing

- [ ] Non-SUPER_ADMIN cannot access settings mutations
- [ ] Encrypted values properly masked in UI
- [ ] Audit logs record all settings changes
- [ ] Permission checks enforced at GraphQL layer

---

## Deployment Plan

### Pre-Deployment Checklist

**Backend**:
- [ ] Prisma migration created
- [ ] TypeScript compiles without errors
- [ ] Unit tests pass
- [ ] Integration tests pass

**Frontend**:
- [ ] GraphQL types regenerated
- [ ] TypeScript compiles without errors
- [ ] Build succeeds (`npm run build`)
- [ ] No console errors in dev mode

### Deployment Steps

**Step 1: Database Migration**
```bash
cd apps/api
npx prisma migrate deploy  # Production
```

**Step 2: Deploy Backend**
```bash
# Build and deploy API
npm run build
# Start application
npm run start:prod
```

**Verify**:
- Check logs for "✅ System settings initialized and synchronized"
- Test GraphQL endpoint: `query { systemSettings(category: SMS) { key name } }`

**Step 3: Deploy Frontend**
```bash
cd apps/web
npm run build
# Deploy build to hosting
```

**Verify**:
- Navigate to `/admin/settings`
- Verify 5 tabs visible
- Test redirect URLs
- Check browser console for errors

### Rollback Plan

**If Issues Occur**:

1. **Database Rollback**:
   ```bash
   npx prisma migrate rollback
   ```

2. **Code Rollback**:
   ```bash
   git revert <commit-hash>
   git push
   ```

3. **Data Safety**:
   - Only enum values added (no data loss)
   - Existing settings remain intact
   - Users can still access old URLs (redirects work)

---

## Performance Considerations

### Database

- **New Indexes**: None required (existing indexes sufficient)
- **Query Impact**: Minimal (category filtering already indexed)
- **Migration Time**: <1 second (enum value addition)

### Frontend

- **Bundle Size**: +1,922 LOC but -1,797 LOC from redirects (net +125 LOC)
- **Component Count**: +3 panels (lazy-loaded via tabs)
- **Initial Load**: No change (tabs load on demand)

### Backend

- **Startup Time**: +50-100ms (env sync once on startup)
- **Memory**: Negligible (<1MB for additional settings)
- **API Response**: No change (same query patterns)

---

## Monitoring & Observability

### Logs to Monitor

**Startup Logs**:
```
✅ System settings initialized and synchronized
✅ Environment sync completed: X settings synced to database
```

**Error Scenarios**:
```
⚠️  Failed to initialize/sync system settings: [error]
```

### Metrics to Track

- Number of settings per category
- Env sync success rate on startup
- Settings mutation frequency
- Failed permission checks

### Alerts

- Migration failures
- Env sync failures on startup
- Unauthorized settings access attempts
- GraphQL schema generation failures

---

## Future Enhancements

### Potential Improvements

1. **Real-time Sync**: WebSocket updates when settings change
2. **Validation Rules**: Use `validationRules` JSON field for complex validation
3. **Setting History**: Track change history per setting
4. **Bulk Import/Export**: JSON/YAML import for settings
5. **Environment Profiles**: Dev/Staging/Prod setting profiles
6. **Setting Dependencies**: Mark settings that depend on others
7. **Test Connection Implementation**: Actual connection tests for each category

### Integration Opportunities

- **Twilio SMS**: Implement actual SMS sending
- **OAuth Providers**: Add Google/GitHub OAuth flows
- **Analytics**: Inject analytics scripts based on settings
- **Feature Flags**: Use settings system for feature toggles

---

## References

### Related Documentation

- [Prisma Schema](../apps/api/prisma/schema.prisma)
- [SystemSettings Service](../apps/api/src/modules/admin/services/system-settings.service.ts)
- [Settings GraphQL Operations](../apps/web/src/packages/api/graphql/admin/admin-settings.graphql)
- [Implementation Plan](C:\Users\User\.claude\plans\shiny-stargazing-feigenbaum.md)

### External Resources

- [Twilio API Documentation](https://www.twilio.com/docs)
- [Google OAuth 2.0](https://developers.google.com/identity/protocols/oauth2)
- [GitHub OAuth Apps](https://docs.github.com/en/developers/apps/building-oauth-apps)
- [Google Analytics 4](https://developers.google.com/analytics/devguides/collection/ga4)
- [PostHog Documentation](https://posthog.com/docs)

---

## Changelog

**v1.4.3** (2025-12-25):
- Added SMS, Social, Analytics integration categories
- Implemented environment variable synchronization
- Consolidated admin pages into System Settings
- Created comprehensive technical documentation

---

**End of Document**
