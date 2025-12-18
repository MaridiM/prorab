# RBAC System - Quick Reference Card

**Version:** 0.6.0 | **Status:** 75% Complete | **Updated:** 2025-12-18

---

## 🚀 Quick Start (5 Minutes)

### 1. Start Development
```bash
# Terminal 1 - Backend
cd apps/api && npm run dev

# Terminal 2 - Frontend
cd apps/web && npm run dev
```

### 2. Create Admin User
```bash
cd apps/api
npx tsx scripts/create-admin-user.ts
# Select role: 1 (SUPER_ADMIN)
```

### 3. Test
```
Navigate to: http://localhost:3000/admin/roles
```

---

## 🎯 What It Does

**RBAC System** = Role-Based Access Control for admin panel

- ✅ 4 role types (SUPER_ADMIN, ADMIN, MODERATOR, SUPPORT)
- ✅ 60+ granular permissions (`users:view`, `teams:delete`, etc.)
- ✅ Permission-based navigation filtering
- ✅ 2FA enforcement per role
- ✅ IP whitelist per role
- ✅ Full audit logging

---

## 📁 Key Files

### Backend
```
apps/api/src/modules/admin/
├── models/admin-role-detail.model.ts    (105 LOC)
├── services/admin-roles.service.ts      (450 LOC)
└── resolvers/admin-roles.resolver.ts    (120 LOC)
```

### Frontend
```
apps/web/src/app/(root)/(protected)/admin/roles/
├── page.tsx                             (300 LOC) - Main page
├── assign-role-dialog.tsx               (320 LOC) - Assign
└── edit-permissions-dialog.tsx          (280 LOC) - Edit

apps/web/src/packages/components/admin/
└── permissions-selector.tsx             (230 LOC) - Reusable
```

### Documentation
```
docs/
├── TESTING_GUIDE_RBAC.md               ⭐ START HERE
├── START_HERE_NEXT_SESSION.md          (3 options)
├── FINAL_SESSION_REPORT_2025-12-18.md  (Complete report)
└── RBAC_QUICK_REFERENCE.md             (This file)
```

---

## 🔑 Role Types & Permissions

| Role | Permissions | Use Case |
|------|-------------|----------|
| **SUPER_ADMIN** | All 60+ | System administrators |
| **ADMIN** | 26 permissions | Day-to-day management |
| **MODERATOR** | 12 permissions | Content moderation |
| **SUPPORT** | 6 permissions | Customer support |

### Permission Examples
```
users:view, users:update, users:delete
teams:view, teams:update, teams:delete
subscriptions:view, subscriptions:cancel
payments:view, payments:refund
settings:view, settings:update
admin_roles:view, admin_roles:create
```

---

## 🎨 UI Components

### 1. Roles Page (`/admin/roles`)
- Table with 7 columns
- Filter by role type
- Search by user name/email
- Actions: Edit Permissions, Revoke Role

### 2. Assign Role Dialog
- User search (Command palette)
- Role type selector
- Permission selector (12 groups)
- 2FA toggle
- IP whitelist input

### 3. Edit Permissions Dialog
- **Permissions tab** - Edit permissions
- **Security tab** - 2FA enforcement
- **IP Whitelist tab** - Manage IPs

### 4. Permissions Selector
- 12 accordion groups
- 60+ checkboxes
- Select All / Clear All
- Permission counter

---

## 🔐 Security Features

### 1. Permission Guards
All admin mutations protected by `PermissionsGuard`

### 2. Audit Logging
Every role change logged to `AdminActionLog` table

### 3. IP Whitelist
Supports IPv4, IPv6, CIDR notation
```
192.168.1.1
10.0.0.0/24
2001:db8::1
```

### 4. 2FA Enforcement
Can require 2FA per role

### 5. SUPER_ADMIN Protection
Cannot delete last SUPER_ADMIN (prevents lockout)

---

## 📡 GraphQL Operations

### Queries
```graphql
query GetAdminRoles($role: String, $search: String)
query GetAdminRole($id: String!)
query GetAdminRoleByUserId($userId: String!)
```

### Mutations
```graphql
mutation AssignAdminRole($input: AssignAdminRoleInput!)
mutation UpdateAdminPermissions($input: UpdateAdminPermissionsInput!)
mutation UpdateTwoFactorEnforcement($input: UpdateTwoFactorInput!)
mutation UpdateIpWhitelist($input: UpdateIpWhitelistInput!)
mutation ChangeAdminRole($roleId: String!, $newRole: AdminRoleType!)
mutation RevokeAdminRole($roleId: String!)
```

---

## 🧪 Testing (12 Scenarios)

Follow: [docs/TESTING_GUIDE_RBAC.md](./TESTING_GUIDE_RBAC.md)

**Quick Test Checklist:**
- [ ] Roles page loads
- [ ] Can assign ADMIN role
- [ ] Can assign SUPPORT role
- [ ] Can edit permissions
- [ ] Can toggle 2FA
- [ ] Can manage IP whitelist
- [ ] Can revoke role
- [ ] Filter by role works
- [ ] Search works
- [ ] Navigation filters by permission
- [ ] Can't delete last SUPER_ADMIN
- [ ] Permission selector works

---

## 🐛 Troubleshooting

### Issue: "Cannot find user"
**Solution:** User must register first at `/auth/register`

### Issue: "Permission denied"
**Solution:**
- Verify you're logged in as SUPER_ADMIN
- Check `hasPermission()` in auth context
- Logout and login again

### Issue: GraphQL errors
**Solution:**
```bash
cd apps/web
npm run codegen  # Regenerate types
```

### Issue: TypeScript errors
**Solution:**
```bash
cd apps/web && npx tsc --noEmit
cd apps/api && npx tsc --noEmit
```

### Issue: Navigation not filtering
**Solution:**
- Check browser console
- Verify adminRole loaded in auth context
- Check permissions in admin sidebar

---

## 📊 Current Status

### Progress: 75%
```
Backend API:        90% ✅ (675 LOC)
Frontend UI:        70% ✅ (1,530 LOC)
Documentation:      95% ✅ (8 docs)
Testing:             0% ⏳ (guide ready)
System Settings:     0% ⏳ (planned)
```

### Statistics
```
Total Code:      2,205 LOC
Files Created:       79
Files Modified:      59
TypeScript Errors:    0 ✅
```

---

## 🎯 Next Steps

### This Week
1. **Browser Testing** (2-3 hours)
   - Follow TESTING_GUIDE_RBAC.md
   - Test all 12 scenarios
   - Document bugs

2. **Bug Fixes** (1-2 hours)
   - Fix critical issues
   - Retest

### Next Week
3. **System Settings Migration** (6-8 hours)
   - Move .env → database
   - Add Redis caching

4. **Write Tests** (4-6 hours)
   - Backend unit tests
   - Frontend component tests

---

## 📞 Quick Commands

### Development
```bash
# Start backend
cd apps/api && npm run dev

# Start frontend
cd apps/web && npm run dev

# Create admin
cd apps/api && npx tsx scripts/create-admin-user.ts

# Generate types
cd apps/web && npm run codegen

# Type check
npx tsc --noEmit
```

### Database
```bash
# View data
cd apps/api && npx prisma studio

# Run migration
npx prisma migrate dev --name migration_name
```

### Git
```bash
# Status
git status

# See changes
git diff --stat

# Commit (use COMMIT_MESSAGE_STAGE_13.txt)
git add .
git commit -F COMMIT_MESSAGE_STAGE_13.txt
```

---

## 🔗 Important Links

| Resource | Location | Purpose |
|----------|----------|---------|
| **Testing Guide** | [TESTING_GUIDE_RBAC.md](./TESTING_GUIDE_RBAC.md) | How to test (START HERE) |
| **Quick Start** | [START_HERE_NEXT_SESSION.md](./START_HERE_NEXT_SESSION.md) | Next session guide |
| **Deliverables** | [DELIVERABLES_2025-12-18_STAGE_13_FINAL.md](./DELIVERABLES_2025-12-18_STAGE_13_FINAL.md) | What's complete |
| **Session Report** | [FINAL_SESSION_REPORT_2025-12-18.md](./FINAL_SESSION_REPORT_2025-12-18.md) | Full report |
| **Backend Code** | `apps/api/src/modules/admin/` | Backend files |
| **Frontend Code** | `apps/web/src/app/(root)/(protected)/admin/roles/` | Frontend files |
| **Commit Message** | [COMMIT_MESSAGE_STAGE_13.txt](../COMMIT_MESSAGE_STAGE_13.txt) | Ready to use |

---

## 💡 Pro Tips

1. **Always test with multiple roles** - SUPER_ADMIN sees everything, SUPPORT sees limited
2. **Use the permission selector** - Groups make it easier to find permissions
3. **IP whitelist format** - One IP per line, supports CIDR
4. **SUPER_ADMIN protection** - System prevents deleting last admin
5. **Audit logs** - Check `AdminActionLog` table for all changes
6. **Permission format** - `resource:action` (e.g., `users:view`)
7. **Navigation filtering** - Automatically hides menu items based on permissions
8. **2FA enforcement** - When enabled, admin must have 2FA to access admin panel

---

## ⚡ Quick Facts

- **Total Development Time:** ~8 hours (2 sessions)
- **Lines of Code:** 2,205
- **Files Changed:** 138
- **Documentation Pages:** 8
- **Test Scenarios:** 12
- **Permission Groups:** 12
- **Individual Permissions:** 60+
- **Role Types:** 4
- **GraphQL Operations:** 8 (3 queries, 5 mutations)
- **TypeScript Errors:** 0 ✅

---

## 🎓 Learning Resources

### Understanding RBAC
- Full spec: [stages/STAGE_13_RBAC_SYSTEM.md](./stages/STAGE_13_RBAC_SYSTEM.md)
- Backend session: [SESSION_SUMMARY_2025-12-18_RBAC.md](./SESSION_SUMMARY_2025-12-18_RBAC.md)
- Frontend session: [SESSION_SUMMARY_2025-12-18_FRONTEND_UI.md](./SESSION_SUMMARY_2025-12-18_FRONTEND_UI.md)

### Testing
- Testing guide: [TESTING_GUIDE_RBAC.md](./TESTING_GUIDE_RBAC.md)
- 12 detailed scenarios
- Expected results
- Bug report template

### Implementation
- Backend code: `apps/api/src/modules/admin/`
- Frontend code: `apps/web/src/app/(root)/(protected)/admin/roles/`
- Permissions: `apps/api/src/shared/constants/admin-permissions.ts`

---

**Last Updated:** 2025-12-18
**Status:** ✅ Ready for Testing
**Next Action:** Follow [TESTING_GUIDE_RBAC.md](./TESTING_GUIDE_RBAC.md)

---

*This is a living document. Update as the system evolves.*
