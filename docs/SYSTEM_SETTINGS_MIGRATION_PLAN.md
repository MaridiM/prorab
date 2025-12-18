# System Settings Migration Plan

## Objective
Move hardcoded .env configuration values into database with Redis caching for better management and dynamic updates without server restarts.

## Current State Analysis

### Settings Currently in .env

1. **Authentication**
   - `JWT_SECRET` - Secret key for JWT tokens
   - `JWT_EXPIRES_IN` - Token expiration time

2. **Telegram Bots**
   - `TELEGRAM_BOT_TOKEN` - OAuth bot token
   - `TELEGRAM_SUPPORT_BOT_TOKEN` - Support bot token

3. **Email/Brevo**
   - `BREVO_API_KEY` - Email service API key
   - `BREVO_SENDER_EMAIL` - Default sender email
   - `BREVO_SENDER_NAME` - Default sender name

4. **Payment (YooKassa)**
   - `YOOKASSA_SHOP_ID` - Shop identifier
   - `YOOKASSA_SECRET_KEY` - Payment secret key

5. **Storage**
   - `CLOUDINARY_CLOUD_NAME` - Cloudinary cloud name
   - `CLOUDINARY_API_KEY` - Cloudinary API key
   - `CLOUDINARY_API_SECRET` - Cloudinary API secret
   - `R2_ACCOUNT_ID` - Cloudflare R2 account ID
   - `R2_ACCESS_KEY_ID` - R2 access key
   - `R2_SECRET_ACCESS_KEY` - R2 secret key
   - `R2_BUCKET_NAME` - R2 bucket name
   - `R2_PUBLIC_URL` - R2 public URL

6. **Redis**
   - `REDIS_URL` - Redis connection string

7. **Database**
   - `DATABASE_URL` - PostgreSQL connection string

## What Should Stay in .env

These values should NOT be moved to database (infrastructure-level):
- ✅ `DATABASE_URL` - Required to connect to DB in the first place
- ✅ `REDIS_URL` - Required to connect to Redis
- ✅ `NODE_ENV` - Environment indicator
- ✅ `PORT` / `API_PORT` - Server port configuration

## What Should Move to Database

These values can be managed dynamically:
- 🔄 `JWT_SECRET`, `JWT_EXPIRES_IN` - Auth settings
- 🔄 `TELEGRAM_BOT_TOKEN`, `TELEGRAM_SUPPORT_BOT_TOKEN` - Bot tokens
- 🔄 `BREVO_API_KEY`, `BREVO_SENDER_EMAIL`, `BREVO_SENDER_NAME` - Email settings
- 🔄 `YOOKASSA_SHOP_ID`, `YOOKASSA_SECRET_KEY` - Payment settings
- 🔄 Cloudinary settings
- 🔄 R2 settings

## Implementation Plan

### Phase 1: Database Schema (30 minutes)

#### 1.1 Create SystemSettings Model
```prisma
model SystemSettings {
  id        String   @id @default(uuid())
  category  String   // 'auth', 'telegram', 'email', 'payment', 'storage'
  key       String   @unique
  value     String   // Encrypted for sensitive values
  encrypted Boolean  @default(false)
  description String?
  updatedBy String?  // Admin user ID who last updated
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([category])
  @@map("system_settings")
}
```

#### 1.2 Create Migration
```bash
npx prisma migrate dev --name add_system_settings
```

### Phase 2: Backend Service Layer (1-2 hours)

#### 2.1 Create SystemSettingsService
Location: `apps/api/src/modules/admin/services/system-settings.service.ts`

Features:
- CRUD operations for settings
- Encryption/decryption for sensitive values (using crypto)
- Redis caching (TTL: 5 minutes)
- Cache invalidation on updates
- Fallback to .env if DB value doesn't exist

#### 2.2 Create GraphQL Resolver
Location: `apps/api/src/modules/admin/resolvers/system-settings.resolver.ts`

Mutations:
- `updateSystemSetting(category, key, value, encrypted)`
- `updateBulkSystemSettings([{category, key, value}])`

Queries:
- `systemSettings(category?): [SystemSetting]`
- `systemSetting(key): SystemSetting`

#### 2.3 Protect with Permissions
- Require `SYSTEM_SETTINGS_VIEW` to read
- Require `SYSTEM_SETTINGS_EDIT` to update
- Add to SUPER_ADMIN permissions only

### Phase 3: Settings Helper (1 hour)

#### 3.1 Create Settings Helper
Location: `apps/api/src/shared/helpers/settings.helper.ts`

```typescript
export class SettingsHelper {
  static async get(key: string, fallbackEnvKey?: string): Promise<string>
  static async getEncrypted(key: string): Promise<string>
  static async set(key: string, value: string, encrypted: boolean): Promise<void>
  static async invalidateCache(key: string): Promise<void>
}
```

#### 3.2 Integrate into Existing Services
Update these services to use SettingsHelper:
- `AuthService` - JWT settings
- `TelegramBot` - Bot tokens
- `MailService` - Brevo settings
- `YooKassaClient` - Payment settings
- `CloudinaryProvider` - Storage settings
- `R2Provider` - Storage settings

### Phase 4: Seed Initial Settings (30 minutes)

#### 4.1 Create Settings Seed
Location: `apps/api/prisma/seed-settings.ts`

Seed initial values from current .env:
- Read from process.env
- Insert into database with encryption where needed
- Mark as encrypted appropriately

#### 4.2 Update Main Seed
Add to `prisma/seed.ts`:
```typescript
import { seedSettings } from './seed-settings'
await seedSettings(prisma)
```

### Phase 5: Frontend UI (2-3 hours)

#### 5.1 Create System Settings Page
Location: `apps/web/src/app/(root)/(protected)/admin/settings/page.tsx`

Features:
- Tabbed interface for categories (Auth, Telegram, Email, Payment, Storage)
- Masked input for encrypted values
- Save/Cancel actions
- Real-time validation
- Success/error toasts
- Audit log of changes

#### 5.2 Add to Admin Sidebar
Update `apps/web/src/packages/components/admin/admin-sidebar.tsx`:
```tsx
{hasPermission('system:settings:view') && (
  <Link href="/admin/settings">
    <Settings className="mr-2 h-4 w-4" />
    System Settings
  </Link>
)}
```

### Phase 6: Testing (1 hour)

#### 6.1 Backend Tests
- Test settings CRUD operations
- Test encryption/decryption
- Test Redis caching
- Test fallback to .env
- Test permission guards

#### 6.2 Frontend Tests
- Test settings page loads
- Test updating settings
- Test validation
- Test permission-based access

### Phase 7: Migration & Deployment (30 minutes)

#### 7.1 Migration Steps
1. Run database migration
2. Run settings seed
3. Verify all services still work
4. Gradually remove .env values (keep as fallback initially)
5. Monitor for issues

#### 7.2 Rollback Plan
- Keep .env values as fallback
- Can disable DB settings lookup with feature flag
- Can revert migration if needed

## Estimated Timeline

- **Phase 1**: Database Schema - 30 min
- **Phase 2**: Backend Service - 2 hours
- **Phase 3**: Settings Helper - 1 hour
- **Phase 4**: Seed Initial Settings - 30 min
- **Phase 5**: Frontend UI - 3 hours
- **Phase 6**: Testing - 1 hour
- **Phase 7**: Migration - 30 min

**Total**: ~8.5 hours

## Security Considerations

1. **Encryption**: Use AES-256-GCM for sensitive values
2. **Key Management**: Store encryption key in .env (never in DB)
3. **Access Control**: Only SUPER_ADMIN can modify system settings
4. **Audit Trail**: Log all changes with user ID and timestamp
5. **Validation**: Validate format before saving (e.g., URL format, email format)

## Benefits

1. ✅ No server restart needed for config changes
2. ✅ Centralized configuration management
3. ✅ Audit trail for all changes
4. ✅ Role-based access control
5. ✅ Redis caching for performance
6. ✅ Encrypted sensitive values
7. ✅ Fallback to .env for safety

## Risks & Mitigation

| Risk | Mitigation |
|------|------------|
| DB unavailable = no config | Fallback to .env values |
| Encryption key lost | Keep backup of encryption key |
| Wrong value breaks service | Validation before save + rollback capability |
| Performance impact | Redis caching with 5-min TTL |
| Security breach | Encrypt sensitive values + RBAC |

## Next Steps

1. Create Prisma schema for SystemSettings
2. Run migration
3. Implement SystemSettingsService
4. Create GraphQL resolver
5. Build settings helper
6. Create seed for initial values
7. Build frontend UI
8. Test thoroughly
9. Deploy and monitor

---

**Status**: Ready to implement
**Priority**: Medium (improves ops but not blocking)
**Dependencies**: RBAC system (Stage 13) - ✅ Complete
