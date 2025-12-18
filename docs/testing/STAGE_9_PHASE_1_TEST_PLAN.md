# Stage 9 Phase 1 - Testing Plan

**Date:** 2025-12-17
**Status:** 85% Complete - Ready for Testing
**Estimated Time:** 1 day (8 hours)

---

## 🎯 Scope

Test all features implemented in Stage 9 Phase 1:
- People Management
- Invite Links
- Payment Methods
- Payouts History

---

## 📋 Test Checklist

### A. People Management (30 minutes)

**Location:** `/teams/[teamId]/people`

#### Display & Navigation
- [ ] Page loads without errors
- [ ] Team members list displays correctly
- [ ] Avatar images load properly
- [ ] User names and emails are visible
- [ ] Roles display correctly (Owner/Member)
- [ ] Salaries display correctly (Fixed/Percentage/None)

#### Search & Filters
- [ ] Search by name works
- [ ] Search by email works
- [ ] Search is case-insensitive
- [ ] Filter by role works
- [ ] Filter by salary type works
- [ ] Combined filters work correctly

#### Add Member
- [ ] Click "Add Member" button opens form
- [ ] Can select existing user
- [ ] Can set role (Member/Owner)
- [ ] Can set salary type (Fixed/Percentage/None)
- [ ] Can set salary amount
- [ ] Form validation works:
  - [ ] Required fields validated
  - [ ] Salary amount > 0 when type != None
  - [ ] Percentage amount 0-100
- [ ] Member added successfully
- [ ] Toast notification shows
- [ ] List updates immediately

#### Edit Member
- [ ] Click edit icon opens form
- [ ] Form pre-filled with current data
- [ ] Can change role
- [ ] Can change salary type
- [ ] Can change salary amount
- [ ] Changes save successfully
- [ ] List updates immediately

#### Delete Member
- [ ] Click delete icon shows confirmation
- [ ] Can cancel deletion
- [ ] Member deleted successfully
- [ ] List updates immediately
- [ ] Cannot delete team owner

#### Permissions
- [ ] Only owner can add members
- [ ] Only owner can edit members
- [ ] Only owner can delete members
- [ ] Members see view-only mode

---

### B. Invite Links (30 minutes)

**Location:** `/teams/[teamId]/settings/invites` (or similar)

#### Create Invite Link
- [ ] Click "Create Invite Link" button
- [ ] Can set expiration date
- [ ] Can set max uses (optional)
- [ ] Can set role (Member/Owner)
- [ ] Link generated successfully
- [ ] Link copied to clipboard works
- [ ] Toast notification shows

#### View Invite Links
- [ ] List of active invite links displays
- [ ] Each link shows:
  - [ ] Invite code
  - [ ] Expiration date
  - [ ] Max uses (if set)
  - [ ] Current uses count
  - [ ] Created by user
  - [ ] Created date
- [ ] Copy link button works

#### Use Invite Link
- [ ] Open link in another browser/incognito
- [ ] Redirects to registration if not logged in
- [ ] After login, shows "Join Team" page
- [ ] Can accept invite
- [ ] Added to team successfully
- [ ] Uses count increments
- [ ] Cannot use expired link
- [ ] Cannot use link at max uses

#### Delete Invite Link
- [ ] Click delete shows confirmation
- [ ] Can cancel deletion
- [ ] Link deleted successfully
- [ ] List updates immediately
- [ ] Deleted link cannot be used

#### Edge Cases
- [ ] Expired links show as expired
- [ ] Links at max uses show as full
- [ ] Cannot create duplicate links
- [ ] Cannot join team twice with same link

---

### C. Payment Methods (20 minutes)

**Location:** `/teams/[teamId]/settings/payment-methods` (or similar)

#### Add Payment Method
- [ ] Click "Add Payment Method"
- [ ] Can select type:
  - [ ] Cash
  - [ ] Card
  - [ ] Bank Transfer
  - [ ] SBP (Faster Payment System)
- [ ] Can enter method name
- [ ] Can enter description (optional)
- [ ] Form validation works
- [ ] Method added successfully
- [ ] List updates immediately

#### View Payment Methods
- [ ] All methods display
- [ ] Each method shows:
  - [ ] Type icon/badge
  - [ ] Name
  - [ ] Description
  - [ ] Created date
- [ ] Default method marked

#### Edit Payment Method
- [ ] Click edit opens form
- [ ] Form pre-filled
- [ ] Can change name
- [ ] Can change description
- [ ] Cannot change type (immutable)
- [ ] Changes save successfully

#### Delete Payment Method
- [ ] Click delete shows confirmation
- [ ] Can cancel deletion
- [ ] Method deleted successfully
- [ ] Cannot delete method in use (has payouts)

#### Set Default Method
- [ ] Click "Set as Default"
- [ ] Method marked as default
- [ ] Previous default unmarked
- [ ] Used for new payouts by default

---

### D. Payouts History (40 minutes)

**Location:** `/teams/[teamId]/members/[memberId]/payouts`

#### Display & Navigation
- [ ] Page loads without errors
- [ ] Payouts list displays
- [ ] Each payout shows:
  - [ ] Amount
  - [ ] Payment method
  - [ ] Status (Pending/Completed/Cancelled)
  - [ ] Date
  - [ ] Description
  - [ ] Created by user

#### Create Payout
- [ ] Click "Create Payout" button
- [ ] Can select payment method
- [ ] Can enter amount (> 0)
- [ ] Can enter description
- [ ] Can set status
- [ ] Form validation works
- [ ] Payout created successfully
- [ ] List updates immediately

#### Filters
- [ ] Filter by payment method works
- [ ] Filter by status works
- [ ] Filter by date range works
- [ ] Combined filters work
- [ ] Clear filters works

#### Search
- [ ] Search by description works
- [ ] Search is case-insensitive
- [ ] Search with filters works

#### Export to CSV
- [ ] Click "Export CSV" button
- [ ] CSV file downloads
- [ ] CSV contains correct columns:
  - [ ] Date
  - [ ] Amount
  - [ ] Payment Method
  - [ ] Status
  - [ ] Description
  - [ ] Created By
- [ ] CSV data matches table
- [ ] CSV uses proper encoding (UTF-8)
- [ ] CSV opens correctly in Excel/Google Sheets

#### Edit Payout
- [ ] Click edit opens form
- [ ] Form pre-filled
- [ ] Can change amount
- [ ] Can change description
- [ ] Can change status
- [ ] Changes save successfully

#### Delete Payout
- [ ] Click delete shows confirmation
- [ ] Can cancel deletion
- [ ] Payout deleted successfully
- [ ] List updates immediately

#### Permissions
- [ ] Only owner can create payouts
- [ ] Only owner can edit payouts
- [ ] Only owner can delete payouts
- [ ] Members can view their own payouts

#### Pagination
- [ ] Shows 20 payouts per page
- [ ] Page navigation works
- [ ] Total count is correct
- [ ] Can navigate to last page
- [ ] Can navigate back to first page

---

## 🧪 Test Data Setup

### Prerequisites

Before testing, ensure:

1. **Test Team:**
   - Team name: "Test Team"
   - Owner: Your test account
   - 2-3 test members

2. **Test Users:**
   - User 1: test-owner@example.com
   - User 2: test-member1@example.com
   - User 3: test-member2@example.com

3. **Test Payment Methods:**
   - Cash
   - Bank Card
   - Bank Transfer

4. **Test Payouts:**
   - 10-15 payouts with different:
     - Amounts (1000, 5000, 10000, 50000)
     - Methods (Cash, Card, Transfer)
     - Statuses (Pending, Completed, Cancelled)
     - Dates (last 30 days)

---

## 🐛 Bug Tracking

Use this template for each bug found:

```markdown
**Bug ID:** P1-001
**Severity:** High/Medium/Low
**Location:** /teams/[teamId]/people
**Description:** Search by email not working
**Steps to Reproduce:**
1. Navigate to people page
2. Enter email in search box
3. Press Enter
**Expected:** Filter list by email
**Actual:** No filtering occurs
**Screenshot:** [attach screenshot]
**Browser:** Chrome 120
**Status:** Open/Fixed
```

---

## 📊 Test Results Template

| Feature | Test Cases | Passed | Failed | Pass Rate | Notes |
|---------|------------|--------|--------|-----------|-------|
| People Management | 25 | | | | |
| Invite Links | 15 | | | | |
| Payment Methods | 12 | | | | |
| Payouts History | 20 | | | | |
| **TOTAL** | **72** | | | | |

---

## ✅ Acceptance Criteria

Phase 1 is considered **COMPLETE** when:

- [ ] All test cases pass (100%)
- [ ] No critical bugs (Severity: High)
- [ ] No more than 3 medium bugs
- [ ] All features work in:
  - [ ] Chrome
  - [ ] Firefox
  - [ ] Safari (if Mac available)
- [ ] All permissions work correctly
- [ ] CSV export works correctly
- [ ] No console errors
- [ ] No network errors (500/400)

---

## 🚀 Next Steps After Testing

1. **Document Issues** (30 min)
   - Create bug reports for each issue
   - Prioritize bugs (High/Medium/Low)
   - Create GitHub issues (optional)

2. **Fix Critical Bugs** (2-4 hours)
   - Fix all High severity bugs
   - Retest fixed functionality

3. **Fix Medium Bugs** (2-4 hours)
   - Fix Medium severity bugs
   - Retest

4. **Update Documentation** (1 hour)
   - Update test results
   - Update WHATS_NOT_DONE.md
   - Update roadmap.md

5. **Prepare for Production** (1 hour)
   - Review all changes
   - Ensure all tests pass
   - Create release notes

---

## 📞 Testing Support

**Questions or Issues?**
- Check [STAGE_9_PHASE_2_FINAL_STATUS.md](../stages/STAGE_9_PHASE_2_FINAL_STATUS.md)
- Check [ANALYSIS_WHAT_TO_DO_NEXT.md](../ANALYSIS_WHAT_TO_DO_NEXT.md)

---

**Created:** 2025-12-17, 03:45
**Status:** Ready for Testing
**Estimated Time:** 1 day (8 hours)
