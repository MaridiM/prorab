# Seed Users Guide

## Quick Start

```bash
# From project root
cd apps/api
npm run prisma:seed

# Or using npx tsx directly
npx tsx prisma/seed.ts
```

## Seed Accounts

### 👑 Admin Accounts (for RBAC testing)

#### 1. Super Admin
- **Email**: `superadmin@prorab.app`
- **Password**: `super123456`
- **Role**: `SUPER_ADMIN`
- **Permissions**: All 60+ permissions
- **Use for**: Testing all admin features, assigning roles, full system access

#### 2. Admin
- **Email**: `admin@prorab.app`
- **Password**: `admin123456`
- **Role**: `ADMIN`
- **Permissions**: 26 permissions (user management, teams, subscriptions, payments, analytics)
- **Use for**: Testing most admin operations except role management

#### 3. Moderator
- **Email**: `moderator@prorab.app`
- **Password**: `mod123456`
- **Role**: `MODERATOR`
- **Permissions**: 12 permissions (content moderation, support tickets)
- **Use for**: Testing content moderation features

#### 4. Support
- **Email**: `support@prorab.app`
- **Password**: `support123456`
- **Role**: `SUPPORT`
- **Permissions**: 6 permissions (view-only access to tickets and FAQs)
- **Use for**: Testing minimal permission access

### 👤 Regular User Accounts

#### 5. Demo User (with projects and data)
- **Email**: `demo@prorab.app`
- **Password**: `demo123456`
- **Has**: 1 team, 7 projects, 27 expenses, 6 photo reports, 2 payouts
- **Use for**: Testing regular user features with realistic data

#### 6-8. Test Users (empty accounts)
- **Emails**: `user1@prorab.app`, `user2@prorab.app`, `user3@prorab.app`
- **Password**: `user123456` (all same)
- **Use for**: Testing team invites, multi-user scenarios

## What Gets Created

- ✅ **8 users** (4 admins + 4 regular users)
- ✅ **4 admin roles** (SUPER_ADMIN, ADMIN, MODERATOR, SUPPORT)
- ✅ **1 team** (СтройМастер - owned by demo user)
- ✅ **7 projects** (3 active, 2 completed, 2 archived)
- ✅ **27 expenses** across projects
- ✅ **6 photo reports** with images
- ✅ **2 payouts** for completed projects

## Testing Scenarios

### RBAC System Testing
1. Login as `superadmin@prorab.app` - verify all admin menu items visible
2. Login as `admin@prorab.app` - verify roles page is hidden
3. Login as `moderator@prorab.app` - verify limited admin access
4. Login as `support@prorab.app` - verify minimal permissions

### Regular Features Testing
1. Login as `demo@prorab.app` - explore projects, expenses, reports
2. Login as `user1@prorab.app` - create new team, invite user2
3. Test team member workflows

## Seed Behavior

### Idempotent Design
- Seed can be run multiple times safely
- Existing users are skipped (not duplicated)
- Missing admin roles are automatically added to existing users
- Only demo user gets projects/data (others remain empty)

### Updating Seeds
If database already has users:
```bash
# Seeds will skip existing users and show warnings
npx tsx prisma/seed.ts

# To reset and recreate everything:
npm run prisma:migrate:reset  # ⚠️ DELETES ALL DATA
npm run prisma:seed
```

## File Location

**Seed File**: `apps/api/prisma/seed.ts`

## Troubleshooting

### "User already exists" warnings
- This is normal - seed skips existing users
- Check if admin role is missing and adds it automatically

### Module not found errors
- Make sure you're in `apps/api` directory
- Use `npx tsx` instead of `ts-node`

### Database connection errors
- Verify `.env` has correct `DATABASE_URL`
- Check PostgreSQL is running

## Next Steps After Seeding

1. **Start development servers**:
   ```bash
   # Terminal 1: API
   cd apps/api && npm run dev

   # Terminal 2: Web
   cd apps/web && npm run dev
   ```

2. **Login and test**:
   - Open http://localhost:3000
   - Login with any seed account
   - Test RBAC by logging in as different admin levels

3. **Verify RBAC**:
   - Super Admin should see all admin menu items
   - Regular users should not see /admin routes
   - Permission-based features should work correctly
