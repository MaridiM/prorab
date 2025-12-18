# Browser Testing - Ready to Start!

## ✅ Completed

### 1. Seeds Created & Tested
- ✅ Created comprehensive seed file with 8 users (4 admins + 4 regular users)
- ✅ Successfully tested seed execution
- ✅ All user accounts created with proper roles
- ✅ Demo data created (1 team, 7 projects, 27 expenses, 6 reports)

### 2. Development Servers
- ✅ **API Server**: Running on **http://localhost:8080**
  - GraphQL Playground: http://localhost:8080/graphql
  - All modules loaded successfully
  - Redis connected
  - Database connected
  - Telegram bots initialized

- ⚠️ **Web Server**: Needs manual start
  - Configured for port **3001** (port 3000 is occupied)
  - Ready to start

## 🚀 Next Steps: Start Browser Testing

### 1. Start Web Server (Manual)
```bash
# Open new terminal
cd apps/web

# Remove lock file if exists
rmdir /s /q .next\dev

# Start server
npm run dev

# Should start on http://localhost:3001
```

### 2. Login with Seed Accounts

All passwords are in format: `{role}123456`

#### Test Admin Accounts:

**1. Super Admin** (Full access to everything)
```
Email: superadmin@prorab.app
Password: super123456
```

**2. Admin** (Most admin features, no role management)
```
Email: admin@prorab.app
Password: admin123456
```

**3. Moderator** (Content moderation only)
```
Email: moderator@prorab.app
Password: mod123456
```

**4. Support** (View-only support tickets)
```
Email: support@prorab.app
Password: support123456
```

#### Test Regular Users:

**5. Demo User** (Has projects and data)
```
Email: demo@prorab.app
Password: demo123456
```

**6-8. Test Users** (Empty accounts for team testing)
```
Email: user1@prorab.app, user2@prorab.app, user3@prorab.app
Password: user123456
```

## 📋 Testing Scenarios

### RBAC Testing Checklist

#### Scenario 1: Super Admin Access
1. Login as `superadmin@prorab.app`
2. ✅ Verify /admin menu appears in sidebar
3. ✅ Navigate to /admin/roles
4. ✅ Verify can see all users and their roles
5. ✅ Try assigning a new role to user1@prorab.app
6. ✅ Try editing permissions for a role
7. ✅ Try revoking a role

#### Scenario 2: Admin Limited Access
1. Login as `admin@prorab.app`
2. ✅ Verify /admin menu appears
3. ❌ Verify /admin/roles is NOT accessible (should show 403 or redirect)
4. ✅ Verify can access /admin/users
5. ✅ Verify can access /admin/teams
6. ✅ Verify can access /admin/subscriptions

#### Scenario 3: Moderator Access
1. Login as `moderator@prorab.app`
2. ✅ Verify limited admin menu (only support tickets, FAQs)
3. ❌ Verify cannot access /admin/users
4. ❌ Verify cannot access /admin/roles
5. ✅ Verify can view support tickets

#### Scenario 4: Support Access
1. Login as `support@prorab.app`
2. ✅ Verify minimal admin access
3. ✅ Verify can only view (no edit/delete)
4. ❌ Verify cannot access any admin management pages

#### Scenario 5: Regular User Access
1. Login as `demo@prorab.app`
2. ❌ Verify /admin menu does NOT appear
3. ❌ Verify cannot access /admin/* routes at all
4. ✅ Verify normal app features work (projects, teams, etc.)

### Regular Features Testing

#### Demo User Projects
1. Login as `demo@prorab.app`
2. ✅ Verify dashboard shows 7 projects
3. ✅ Navigate to active projects
4. ✅ Check expenses are displayed
5. ✅ Check photo reports are accessible
6. ✅ Check team members and payouts

#### Team Invites
1. Login as `user1@prorab.app`
2. ✅ Create a new team
3. ✅ Invite `user2@prorab.app` to team
4. Login as `user2@prorab.app`
5. ✅ Accept team invite
6. ✅ Verify appears in team members

## 📊 Current Status

### What's Working
- ✅ Backend API fully functional
- ✅ GraphQL schema with RBAC queries/mutations
- ✅ Database seeded with test users
- ✅ Admin roles assigned correctly
- ✅ Permission system implemented
- ✅ All 8 seed users created successfully

### What to Test
- 🔄 Frontend RBAC UI components
- 🔄 Permission-based navigation
- 🔄 Role assignment flow
- 🔄 Permission editing
- 🔄 IP whitelist management
- 🔄 2FA enforcement
- 🔄 Admin action logging

## 🐛 Known Issues

1. **Port 3000 occupied**: Web server configured for port 3001
2. **Next.js lock file**: May need manual removal before starting web server
3. **CORS**: Make sure API allows http://localhost:3001

## 📚 Documentation

- **Seed Users Guide**: [docs/SEED_USERS_GUIDE.md](./SEED_USERS_GUIDE.md)
- **RBAC Testing Guide**: [docs/TESTING_GUIDE_RBAC.md](./TESTING_GUIDE_RBAC.md)
- **RBAC Quick Reference**: [docs/RBAC_QUICK_REFERENCE.md](./RBAC_QUICK_REFERENCE.md)

## 🎯 Success Criteria

Browser testing is successful when:
- ✅ All 4 admin roles show appropriate access levels
- ✅ Regular users cannot access /admin routes
- ✅ Super admin can assign/revoke roles
- ✅ Permission-based features work correctly
- ✅ Navigation menu adapts to user permissions
- ✅ No console errors on login/navigation
- ✅ GraphQL queries return expected data

## 📞 Support

If you encounter issues:
1. Check API server logs (should be running without errors)
2. Check browser console for frontend errors
3. Verify GraphQL Playground works: http://localhost:8080/graphql
4. Test a query manually in playground:
   ```graphql
   query {
     me {
       id
       email
       fullName
       adminRole {
         role
         permissions
       }
     }
   }
   ```

## ⏭️ After Browser Testing

Once browser testing is complete and working:
1. Document any bugs found
2. Fix critical issues
3. Proceed to **Option B: System Settings Migration**
