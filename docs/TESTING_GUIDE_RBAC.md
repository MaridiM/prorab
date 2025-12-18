# RBAC System Testing Guide

**Version:** 0.6.0
**Stage:** Stage 13 - RBAC System
**Last Updated:** 2025-12-18

---

## 🎯 Overview

This guide walks you through testing the complete RBAC (Role-Based Access Control) system including:
- Admin role assignment
- Permission management
- 2FA enforcement
- IP whitelist management
- Permission-based navigation

**Estimated Time:** 1-2 hours for full testing

---

## 🚀 Prerequisites

### 1. Start Development Servers

**Terminal 1 - Backend:**
```bash
cd apps/api
npm install  # If not done already
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd apps/web
npm install  # If not done already
npm run dev
```

**Verify servers are running:**
- Backend: `http://localhost:4000/graphql` (GraphQL Playground)
- Frontend: `http://localhost:3000`

### 2. Create Test Users

You'll need at least 3 test users for comprehensive testing:
1. A SUPER_ADMIN user (yourself)
2. A test user to assign ADMIN role
3. A test user to assign SUPPORT role

**Create first user via UI:**
1. Go to `http://localhost:3000/auth/register`
2. Register with email: `superadmin@test.com`
3. Complete registration

**Create additional test users:**
1. Register: `admin-test@test.com`
2. Register: `support-test@test.com`

### 3. Assign SUPER_ADMIN Role

```bash
cd apps/api
npx tsx scripts/create-admin-user.ts
```

**Follow prompts:**
```
Enter admin email: superadmin@test.com
Select role (1-4): 1  # SUPER_ADMIN
```

**Expected output:**
```
✅ Admin role created successfully!
📧 Email: superadmin@test.com
👤 User ID: <user-id>
🔑 Role: SUPER_ADMIN
📜 Permissions: 47 permissions
🔐 2FA Enforced: true
```

### 4. Enable 2FA (if enforced)

1. Login as `superadmin@test.com`
2. Go to Settings → Security
3. Enable Two-Factor Authentication
4. Save backup codes

---

## 📋 Test Scenarios

### Scenario 1: View Roles Page ✅

**Goal:** Verify roles table displays correctly

**Steps:**
1. Login as SUPER_ADMIN user
2. Navigate to `/admin` (Admin Panel)
3. Click "Admin Roles" in sidebar
4. **Verify:** Roles page loads
5. **Verify:** Table shows your SUPER_ADMIN role
6. **Verify:** Filter dropdown shows all role types
7. **Verify:** Search input is present
8. **Verify:** "Assign Role" button is visible

**Expected Results:**
- ✅ Page loads without errors
- ✅ Table has 7 columns: User, Email, Role, Permissions, 2FA, IP Whitelist, Actions
- ✅ Your SUPER_ADMIN role appears with:
  - Badge showing "SUPER ADMIN" (red/destructive)
  - Permissions count (47 permissions)
  - 2FA status (Required with lock icon)
  - IP Whitelist status (All IPs or X IPs)
- ✅ Actions dropdown has "Edit Permissions" and "Revoke Role"

**Screenshot Location:** Take screenshot for documentation

---

### Scenario 2: Assign ADMIN Role ✅

**Goal:** Assign ADMIN role to a test user

**Steps:**
1. Click "Assign Role" button
2. **Verify:** Dialog opens with title "Assign Admin Role"
3. Click user selector
4. Type "admin-test" in search
5. **Verify:** User "admin-test@test.com" appears
6. Select the user
7. **Verify:** User's name appears in selector
8. Click "Role Type" dropdown
9. Select "Admin (Most Permissions)"
10. **Verify:** Permissions section appears below
11. **Verify:** 26 permissions are pre-selected (ADMIN defaults)
12. Expand "User Management" group in permissions
13. **Verify:** Checkboxes for users:view, users:update, users:export are checked
14. **Verify:** "Select All" option is present
15. Toggle "Require Two-Factor Authentication"
16. **Verify:** Checkbox becomes checked
17. Scroll to IP Whitelist field
18. Enter test IP: `192.168.1.1`
19. Click "Assign Role" button
20. **Verify:** Success toast appears
21. **Verify:** Dialog closes
22. **Verify:** New role appears in table

**Expected Results:**
- ✅ Dialog opens smoothly
- ✅ User search works
- ✅ Role selection loads default permissions
- ✅ Permission selector shows all 12 groups
- ✅ Can expand/collapse groups
- ✅ Can toggle individual permissions
- ✅ 2FA toggle works
- ✅ IP input accepts valid IP
- ✅ Role created successfully
- ✅ Toast shows: "Admin role assigned successfully"
- ✅ Table refreshes with new role

**Verify in table:**
- ✅ User: admin-test@test.com
- ✅ Role: ADMIN badge (blue)
- ✅ Permissions: 26 permissions
- ✅ 2FA: Required (lock icon)
- ✅ IP Whitelist: 1 IP(s)

---

### Scenario 3: Edit Permissions ✅

**Goal:** Modify permissions for ADMIN role

**Steps:**
1. Find the ADMIN role in table
2. Click Actions (three dots)
3. Click "Edit Permissions"
4. **Verify:** Dialog opens with 3 tabs
5. **Verify:** Currently on "Permissions" tab
6. **Verify:** Admin user info displayed at top
7. Expand "Payment Management" group
8. **Verify:** Only "payments:view" and "payments:export" are checked
9. Check "payments:refund" permission
10. Collapse "Payment Management"
11. Expand "System Settings" group
12. **Verify:** Only "settings:view" is checked
13. Check "settings:update" permission
14. Click "Save Permissions" button
15. **Verify:** Success toast appears
16. Click "Security" tab
17. **Verify:** 2FA checkbox is checked
18. Uncheck "Require Two-Factor Authentication"
19. Click "Save Security Settings"
20. **Verify:** Success toast appears
21. Click "IP Whitelist" tab
22. **Verify:** Current IP "192.168.1.1" shown as badge
23. Add new line: `10.0.0.0/24`
24. Click "Save IP Whitelist"
25. **Verify:** Success toast appears
26. Close dialog
27. **Verify:** Table reflects changes

**Expected Results:**
- ✅ Dialog opens with correct user info
- ✅ All 3 tabs work
- ✅ Permission changes save successfully
- ✅ Security settings save successfully
- ✅ IP whitelist saves successfully
- ✅ Each tab has separate save button
- ✅ Toast notifications for each save
- ✅ Changes reflected in table after closing

**Verify permissions increased:**
- Table should now show 28 permissions (26 + 2 new)

---

### Scenario 4: Assign SUPPORT Role ✅

**Goal:** Assign minimal SUPPORT role

**Steps:**
1. Click "Assign Role" button
2. Select user "support-test@test.com"
3. Select role "Support (Basic Permissions)"
4. **Verify:** Only 6 permissions pre-selected
5. Expand "Support Management" group
6. **Verify:** All 4 support permissions checked
7. Expand "User Management" group
8. **Verify:** Only "users:view" is checked
9. Do NOT toggle 2FA
10. Do NOT add IP whitelist
11. Click "Assign Role"
12. **Verify:** Success toast
13. **Verify:** New role in table

**Expected Results:**
- ✅ SUPPORT role created
- ✅ Permissions: 6 permissions
- ✅ 2FA: Optional
- ✅ IP Whitelist: All IPs
- ✅ Badge color: outline (border only)

---

### Scenario 5: Test Permission-Based Navigation ✅

**Goal:** Verify navigation filters based on role

**Steps:**
1. Logout (or open incognito window)
2. Login as "support-test@test.com"
3. Navigate to `/admin`
4. **Verify:** Admin sidebar appears
5. **Verify:** Limited menu items visible

**Expected Visible Items for SUPPORT:**
- ✅ Dashboard (always visible)
- ✅ Users (has users:view)
- ✅ Support Tickets (has support_tickets:view)
- ✅ Analytics (has analytics:view)

**Expected HIDDEN Items for SUPPORT:**
- ❌ System Settings (no settings:view)
- ❌ Storage (no storage:view)
- ❌ Teams (no teams:view)
- ❌ Projects (no projects:view)
- ❌ Subscriptions (no subscriptions:view)
- ❌ Payments (no payments:view)
- ❌ Admin Roles (no admin_roles:view)
- ❌ Audit Logs (no audit_logs:view)

**Test Navigation Protection:**
1. Try to navigate directly to `/admin/settings`
2. **Expected:** Redirect or error (no permission)
3. Try to navigate to `/admin/users`
4. **Expected:** Page loads (has permission)

**Now test with ADMIN role:**
1. Logout and login as "admin-test@test.com"
2. Navigate to `/admin`
3. **Verify:** More menu items visible
4. **Verify:** Can access Users, Teams, Subscriptions, Payments, Storage
5. **Verify:** Can access Admin Roles page (has admin_roles:view)

---

### Scenario 6: Filter and Search ✅

**Goal:** Test table filtering and search

**Steps:**
1. Login as SUPER_ADMIN
2. Go to `/admin/roles`
3. **Verify:** All 3 roles visible (SUPER_ADMIN, ADMIN, SUPPORT)

**Test Role Filter:**
1. Click role filter dropdown
2. Select "Admin"
3. **Verify:** Only ADMIN role shown
4. Select "Support"
5. **Verify:** Only SUPPORT role shown
6. Select "All Roles"
7. **Verify:** All 3 roles shown again

**Test User Search:**
1. Type "admin-test" in search box
2. **Verify:** Only admin-test@test.com role shown
3. Clear search
4. **Verify:** All roles shown again
5. Type "support"
6. **Verify:** Only support-test@test.com role shown

**Expected Results:**
- ✅ Filter works correctly
- ✅ Search is case-insensitive
- ✅ Search matches email and name
- ✅ Table updates in real-time

---

### Scenario 7: Revoke Role ✅

**Goal:** Remove admin role from user

**Steps:**
1. Find SUPPORT role in table
2. Click Actions → "Revoke Role"
3. **Verify:** Confirmation dialog appears
4. **Verify:** Warning message displayed
5. Click "Cancel"
6. **Verify:** Dialog closes, role still in table
7. Click Actions → "Revoke Role" again
8. Click "Revoke Role" (confirm)
9. **Verify:** Success toast appears
10. **Verify:** Role removed from table
11. Login as "support-test@test.com" (different window)
12. Try to access `/admin`
13. **Verify:** Access denied or redirect (no admin role)

**Expected Results:**
- ✅ Confirmation dialog prevents accidental deletion
- ✅ Cancel works correctly
- ✅ Revoke works correctly
- ✅ Toast shows: "Admin role revoked successfully"
- ✅ Table updates immediately
- ✅ User loses admin access

---

### Scenario 8: SUPER_ADMIN Protection ✅

**Goal:** Verify can't delete last SUPER_ADMIN

**Steps:**
1. Ensure you have only 1 SUPER_ADMIN role
2. Try to revoke your own SUPER_ADMIN role
3. Click Actions → "Revoke Role"
4. Confirm revoke
5. **Expected:** Error toast appears
6. **Verify:** Error message: "Cannot revoke the last SUPER_ADMIN role"
7. **Verify:** Role still in table

**Expected Results:**
- ✅ Backend prevents deletion
- ✅ Error toast displayed
- ✅ Role remains in table
- ✅ System protected from lockout

---

### Scenario 9: Permission Selector Features ✅

**Goal:** Test all permission selector features

**Steps:**
1. Click "Assign Role"
2. Select any user and role
3. **Test "Select All" button:**
   - Click "Select All" at top
   - **Verify:** All 60+ permissions selected
   - **Verify:** Counter shows 60+ permissions
4. **Test "Clear All" button:**
   - Click "Clear All"
   - **Verify:** All permissions deselected
   - **Verify:** Counter shows 0 permissions
5. **Test Group "Select All":**
   - Expand "User Management"
   - Click "Select All" within group
   - **Verify:** Only User Management permissions selected
   - **Verify:** Counter shows 6 permissions
6. **Test Individual Permission:**
   - Expand "Team Management"
   - Check "teams:view" only
   - **Verify:** Counter increases by 1
   - Uncheck it
   - **Verify:** Counter decreases by 1
7. **Test Multiple Groups:**
   - Expand multiple groups
   - Select permissions across groups
   - **Verify:** Counter updates correctly
   - **Verify:** Can collapse groups without losing selections

**Expected Results:**
- ✅ Global Select All works
- ✅ Global Clear All works
- ✅ Group Select All works
- ✅ Individual checkboxes work
- ✅ Counter accurate
- ✅ Selections persist when collapsing groups
- ✅ Accordion allows multiple groups open

---

### Scenario 10: IP Whitelist Validation ✅

**Goal:** Test IP whitelist input validation

**Steps:**
1. Click "Assign Role"
2. Select user and role
3. In IP Whitelist field, enter:

**Valid IPs to test:**
```
192.168.1.1
10.0.0.0/24
2001:0db8:85a3::8a2e:0370:7334
```
4. Click "Assign Role"
5. **Verify:** Role created successfully

**Invalid IPs to test (in Edit dialog):**
1. Edit a role's IP whitelist
2. Try entering:
```
999.999.999.999
not-an-ip
192.168.1.1/99
```
3. Click "Save IP Whitelist"
4. **Expected:** Error toast or validation message

**Expected Results:**
- ✅ Valid IPv4 accepted
- ✅ Valid IPv6 accepted
- ✅ Valid CIDR notation accepted
- ✅ Invalid IPs rejected
- ✅ Clear error messages

---

### Scenario 11: SUPER_ADMIN Special Behavior ✅

**Goal:** Verify SUPER_ADMIN can't be edited

**Steps:**
1. Find SUPER_ADMIN role in table
2. Click Actions → "Edit Permissions"
3. Go to Permissions tab
4. **Verify:** Permissions selector is disabled
5. **Verify:** Info message displayed
6. **Verify:** Message says "Super Admin Role - This role has all permissions and cannot be edited"
7. **Verify:** Shield icon displayed
8. **Verify:** No save button for permissions tab
9. Switch to Security tab
10. **Verify:** Can still toggle 2FA
11. Switch to IP Whitelist tab
12. **Verify:** Can still manage IP whitelist

**Expected Results:**
- ✅ SUPER_ADMIN permissions cannot be changed
- ✅ Clear explanation shown
- ✅ Security settings still editable
- ✅ IP whitelist still editable
- ✅ User understands why permissions locked

---

### Scenario 12: Real-time Updates ✅

**Goal:** Verify table updates without refresh

**Steps:**
1. Open two browser windows side-by-side
2. Both windows logged in as SUPER_ADMIN
3. Both on `/admin/roles` page
4. **Window 1:** Assign a new role
5. **Window 2:** Click refresh or wait
6. **Verify:** New role appears (may need manual refresh)
7. **Window 1:** Edit permissions
8. **Window 2:** Refresh
9. **Verify:** Permission count updated

**Note:** Real-time updates via refetch() only work within the same window/tab. Other tabs need manual refresh.

**Expected Results:**
- ✅ Same window: immediate updates
- ✅ Other tabs: updates on refresh
- ✅ No data loss
- ✅ No stale data shown

---

## 🐛 Common Issues & Solutions

### Issue 1: "Cannot find user"
**Solution:** Make sure user is registered first via `/auth/register`

### Issue 2: "Permission denied" errors
**Solution:**
- Verify you're logged in as SUPER_ADMIN
- Check backend console for detailed error
- Verify adminRole is loaded in auth context

### Issue 3: Navigation items not filtering
**Solution:**
- Check browser console for errors
- Verify `hasPermission()` function in auth context
- Logout and login again to refresh permissions

### Issue 4: IP whitelist not saving
**Solution:**
- Check format (one IP per line)
- Verify valid IP addresses
- Check backend validation logs

### Issue 5: Permissions selector laggy
**Solution:**
- Too many groups expanded at once
- Close some accordion groups
- Consider performance optimization for many permissions

### Issue 6: GraphQL errors
**Solution:**
```bash
cd apps/web
npm run codegen  # Regenerate types
```

### Issue 7: Can't revoke role
**Solution:**
- Check if trying to revoke last SUPER_ADMIN (protected)
- Verify permission: `admin_roles:delete`
- Check backend logs

---

## ✅ Testing Checklist

Use this checklist to track your testing progress:

### Basic Functionality
- [ ] Roles page loads
- [ ] Table displays correctly
- [ ] Can assign ADMIN role
- [ ] Can assign SUPPORT role
- [ ] Can edit permissions
- [ ] Can toggle 2FA enforcement
- [ ] Can manage IP whitelist
- [ ] Can revoke role
- [ ] Filter by role type works
- [ ] Search by user works

### Permission System
- [ ] SUPER_ADMIN has all menu items
- [ ] ADMIN has most menu items
- [ ] SUPPORT has limited menu items
- [ ] Navigation filtering works
- [ ] Direct URL access blocked for no permission
- [ ] Permission defaults load correctly
- [ ] Can customize permissions
- [ ] Permission counter accurate

### Security Features
- [ ] Can't delete last SUPER_ADMIN
- [ ] 2FA enforcement works
- [ ] IP whitelist accepts valid IPs
- [ ] IP whitelist rejects invalid IPs
- [ ] SUPER_ADMIN permissions can't be edited
- [ ] Audit logging works (check DB)

### UI/UX
- [ ] Loading states work
- [ ] Empty states work
- [ ] Toast notifications appear
- [ ] Error messages clear
- [ ] Confirmation dialogs work
- [ ] Forms validate correctly
- [ ] Responsive design (mobile/tablet)

### Edge Cases
- [ ] Assigning role to user without 2FA
- [ ] Empty IP whitelist
- [ ] Very long user lists
- [ ] Concurrent edits
- [ ] Network errors handled
- [ ] Invalid data rejected

---

## 📊 Performance Benchmarks

Test with realistic data volumes:

- [ ] 100 roles in table (performance acceptable?)
- [ ] 1000+ users in search (search fast?)
- [ ] All 12 permission groups expanded (UI responsive?)
- [ ] Multiple concurrent assignments (no conflicts?)

**Expected Performance:**
- Table render: < 500ms
- User search: < 1s
- Permission save: < 2s
- Role assignment: < 3s

---

## 🎯 Success Criteria

**Before marking Stage 13 as complete:**

✅ **Must Pass:**
- All 12 scenarios pass
- 0 TypeScript errors
- 0 runtime errors
- All basic functionality works
- Security features work
- Navigation filtering works

✅ **Should Pass:**
- Performance acceptable
- Edge cases handled
- Error messages helpful
- UI responsive

✅ **Nice to Have:**
- Audit logs viewable
- Analytics on role usage
- Export role list
- Bulk operations

---

## 📝 Test Report Template

After testing, create a report:

```markdown
# RBAC Testing Report

**Date:** YYYY-MM-DD
**Tester:** Your Name
**Duration:** X hours

## Summary
- Total Scenarios: 12
- Passed: X
- Failed: X
- Skipped: X

## Passed Scenarios
1. Scenario 1 ✅
2. Scenario 2 ✅
...

## Failed Scenarios
1. Scenario X ❌
   - Issue: Description
   - Expected: ...
   - Actual: ...
   - Screenshot: path/to/screenshot

## Bugs Found
1. [BUG-001] Description
   - Severity: High/Medium/Low
   - Steps to reproduce:
   - Expected behavior:
   - Actual behavior:

## Performance Issues
1. Issue description
   - Metric: X ms
   - Expected: Y ms

## Recommendations
1. ...
2. ...

## Conclusion
Ready for production: Yes/No
Next steps: ...
```

---

## 🚀 Next Steps After Testing

1. **Fix Critical Bugs** - Any bugs that break core functionality
2. **Fix High Priority Bugs** - UX issues, validation problems
3. **Performance Optimization** - If benchmarks fail
4. **Create User Guide** - ADMIN_ROLES_GUIDE.md for end users
5. **Deploy to Staging** - Test in production-like environment
6. **Monitor Metrics** - Watch for errors and performance
7. **Deploy to Production** - When all tests pass

---

**Questions or Issues?**
- Check backend logs: `apps/api/` console
- Check frontend console: Browser DevTools
- Review documentation: `docs/stages/STAGE_13_RBAC_SYSTEM.md`
- Check GraphQL Playground: `http://localhost:4000/graphql`

**Happy Testing! 🎉**
