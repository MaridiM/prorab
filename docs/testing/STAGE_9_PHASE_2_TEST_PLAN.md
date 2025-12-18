# Stage 9 Phase 2 - Testing Plan

**Date:** 2025-12-17
**Status:** 100% Implemented - Ready for Testing
**Estimated Time:** 1 day (8 hours)

---

## 🎯 Scope

Test all features implemented in Stage 9 Phase 2:
- Time Tracking (Work Logs)
- Personnel Analytics
- Salary History

---

## 📋 Test Checklist

### A. Time Tracking (1 hour - Manual + Unit Tests)

**Location:** `/teams/[teamId]/projects/[projectId]/time-tracking`

#### Manual Testing (30 min)

**Display & Navigation:**
- [ ] Page loads without errors
- [ ] Tab navigation works (Table / Calendar)
- [ ] Table view shows all work logs
- [ ] Calendar view shows logs by date
- [ ] Total hours calculation correct
- [ ] Total salary calculation correct

**Add Work Log:**
- [ ] Click "Добавить запись" opens dialog
- [ ] Can select team member
- [ ] Can select date
- [ ] Can enter hours (> 0, <= 24)
- [ ] Can enter description
- [ ] Form validation works:
  - [ ] Member required
  - [ ] Date required
  - [ ] Hours required and > 0
  - [ ] Hours <= 24
- [ ] Work log created successfully
- [ ] Toast notification shows
- [ ] Table updates immediately
- [ ] Calendar updates immediately
- [ ] Hourly salary calculated correctly

**Edit Work Log:**
- [ ] Click edit icon opens dialog
- [ ] Form pre-filled with current data
- [ ] Can change date
- [ ] Can change hours
- [ ] Can change description
- [ ] Cannot change member (immutable)
- [ ] Changes save successfully
- [ ] Calculations update

**Delete Work Log:**
- [ ] Click delete shows confirmation
- [ ] Can cancel deletion
- [ ] Work log deleted successfully
- [ ] Table updates immediately
- [ ] Calendar updates immediately
- [ ] Totals recalculate

**Calendar View:**
- [ ] Logs displayed on correct dates
- [ ] Can navigate months
- [ ] Can click on date to see logs
- [ ] Today's date highlighted
- [ ] Logs with 8+ hours highlighted

**Export CSV:**
- [ ] Click "Export CSV" button
- [ ] CSV file downloads
- [ ] CSV contains columns:
  - [ ] Date
  - [ ] Member Name
  - [ ] Hours
  - [ ] Description
  - [ ] Hourly Rate
  - [ ] Total Amount
- [ ] CSV data accurate
- [ ] UTF-8 encoding correct

#### Unit Tests (30 min)

Create `apps/api/src/modules/work-logs/work-log.service.spec.ts`:

```typescript
describe('WorkLogService', () => {
  describe('createWorkLog', () => {
    it('should create work log successfully', async () => {
      const input = {
        memberId: 'member-1',
        projectId: 'project-1',
        date: new Date(),
        hours: 8,
        description: 'Test work',
      };

      const result = await service.createWorkLog(input, 'user-1');

      expect(result).toBeDefined();
      expect(result.hours).toBe(8);
    });

    it('should throw error if hours > 24', async () => {
      const input = {
        memberId: 'member-1',
        projectId: 'project-1',
        date: new Date(),
        hours: 25, // Invalid
        description: 'Test',
      };

      await expect(
        service.createWorkLog(input, 'user-1')
      ).rejects.toThrow();
    });

    it('should verify team membership', async () => {
      // Test that user must be team member
    });
  });

  describe('getTotalHours', () => {
    it('should calculate total hours correctly', async () => {
      // Create 3 logs: 8h, 6h, 4h
      const total = await service.getTotalHours({
        projectId: 'project-1',
      });

      expect(total).toBe(18);
    });
  });

  describe('calculateHourlySalary', () => {
    it('should calculate hourly salary correctly', async () => {
      // Member with 50000 RUB/month, 8 hours worked
      const salary = await service.calculateHourlySalary(
        'user-1',
        new Date('2024-01-01'),
        new Date('2024-01-31')
      );

      // 50000 / 160 hours * 8 = 2500
      expect(salary).toBeCloseTo(2500);
    });

    it('should handle percentage salary', async () => {
      // Member with 15% of revenue
    });
  });
});
```

---

### B. Personnel Analytics (1 hour - Manual + Integration Tests)

**Location:** `/teams/[teamId]/analytics/personnel`

#### Manual Testing (30 min)

**KPI Cards:**
- [ ] 4 KPI cards display correctly
- [ ] Total Members count accurate
- [ ] Total Hours accurate
- [ ] Total Payouts accurate
- [ ] Average metrics accurate:
  - [ ] Avg hours per member
  - [ ] Avg payout per member
  - [ ] Avg hourly rate

**Charts:**
- [ ] Hours Worked by Member (BarChart):
  - [ ] Chart renders without errors
  - [ ] Shows top 10 members
  - [ ] Bars sized correctly
  - [ ] Tooltip shows exact hours
  - [ ] Colors distinct

- [ ] Total Payouts by Member (BarChart):
  - [ ] Chart renders
  - [ ] Shows top 10 members
  - [ ] Bars sized correctly
  - [ ] Tooltip shows exact amount
  - [ ] Currency formatted (₽)

- [ ] Salary Distribution (PieChart):
  - [ ] Chart renders
  - [ ] Shows 3 segments (Fixed/Percentage/None)
  - [ ] Percentages add up to 100%
  - [ ] Labels clear
  - [ ] Colors distinct

- [ ] Projects Performance (LineChart):
  - [ ] Chart renders
  - [ ] Shows hours trend by project
  - [ ] X-axis: months
  - [ ] Y-axis: hours
  - [ ] Lines for each project
  - [ ] Legend shows project names

**Member Performance Table:**
- [ ] Table displays all members
- [ ] Search by name works
- [ ] Search by email works
- [ ] All 9 columns display:
  1. Участник (avatar + name + email)
  2. Роль (Owner/Member badge)
  3. Должность (position or "—")
  4. Зарплата (type badge + amount)
  5. Проектов (count)
  6. Часов (total hours)
  7. Выплачено (total amount, ₽)
  8. Средняя выплата (avg, ₽)
  9. Выплат (completed + pending)
- [ ] Sorting works (if implemented)
- [ ] Data accurate

**Project Performance Table:**
- [ ] Table displays all projects
- [ ] Search by name works
- [ ] All 7 columns display:
  1. Проект (name)
  2. Статус (Active/Completed/Archived badge)
  3. Участников (count)
  4. Часов работы (total)
  5. Выплачено (total, ₽)
  6. Бюджет (amount or "Не установлен")
  7. Даты (start - end, formatted)
- [ ] Data accurate

**Export CSV:**
- [ ] Click "Export CSV" button
- [ ] CSV downloads
- [ ] CSV has 13 columns:
  1. Member Name
  2. Email
  3. Role
  4. Position
  5. Salary Type
  6. Salary Amount
  7. Projects Count
  8. Total Hours
  9. Total Payouts
  10. Average Payout
  11. Completed Payouts
  12. Pending Payouts
  13. Efficiency (if implemented)
- [ ] All data accurate
- [ ] UTF-8 encoding correct

#### Integration Tests (30 min)

Create `apps/api/src/modules/teams/teams.service.spec.ts`:

```typescript
describe('TeamsService - Personnel Analytics', () => {
  describe('getPersonnelAnalytics', () => {
    beforeEach(async () => {
      // Setup test data:
      // - Team with 3 members
      // - 2 projects
      // - Multiple work logs
      // - Multiple payouts
    });

    it('should calculate member analytics correctly', async () => {
      const analytics = await service.getPersonnelAnalytics(
        'team-1',
        'owner-id'
      );

      expect(analytics.members).toHaveLength(3);
      expect(analytics.members[0]).toMatchObject({
        totalHoursWorked: expect.any(Number),
        totalPayouts: expect.any(Number),
        projectsCount: expect.any(Number),
        completedPayoutsCount: expect.any(Number),
        pendingPayoutsCount: expect.any(Number),
      });
    });

    it('should calculate project analytics correctly', async () => {
      const analytics = await service.getPersonnelAnalytics(
        'team-1',
        'owner-id'
      );

      expect(analytics.projects).toHaveLength(2);
      expect(analytics.projects[0]).toMatchObject({
        totalHours: expect.any(Number),
        totalPayouts: expect.any(Number),
        membersCount: expect.any(Number),
      });
    });

    it('should calculate team totals correctly', async () => {
      const analytics = await service.getPersonnelAnalytics(
        'team-1',
        'owner-id'
      );

      expect(analytics.totals).toMatchObject({
        totalMembers: 3,
        totalHours: expect.any(Number),
        totalPayouts: expect.any(Number),
        averageHoursPerMember: expect.any(Number),
        averagePayoutPerMember: expect.any(Number),
      });
    });

    it('should sort members by hours worked DESC', async () => {
      const analytics = await service.getPersonnelAnalytics(
        'team-1',
        'owner-id'
      );

      const hours = analytics.members.map(m => m.totalHoursWorked);
      const sorted = [...hours].sort((a, b) => b - a);

      expect(hours).toEqual(sorted);
    });

    it('should throw if user is not owner', async () => {
      await expect(
        service.getPersonnelAnalytics('team-1', 'non-owner-id')
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('exportPersonnelAnalyticsToCsv', () => {
    it('should export CSV with 13 columns', async () => {
      const csv = await service.exportPersonnelAnalyticsToCsv(
        'team-1',
        'owner-id'
      );

      const lines = csv.split('\n');
      const headers = lines[0].split(',');

      expect(headers).toHaveLength(13);
    });

    it('should handle Russian characters correctly', async () => {
      const csv = await service.exportPersonnelAnalyticsToCsv(
        'team-1',
        'owner-id'
      );

      // Should not have corrupted Cyrillic
      expect(csv).toContain('Участник');
      expect(csv).not.toContain('Ð£Ñ‡Ð°ÑÑ‚Ð½Ð¸Ðº');
    });
  });
});
```

---

### C. Salary History (1 hour - Manual + Unit Tests)

**Location:** `/teams/[teamId]/members/[memberId]/salary`

#### Manual Testing (30 min)

**Display:**
- [ ] Page loads without errors
- [ ] Salary settings form displays
- [ ] History section displays below form
- [ ] History icon shows
- [ ] Section title correct: "История изменений зарплаты"

**Empty State:**
- [ ] When no history, shows: "Нет истории изменений"
- [ ] Empty state styled correctly (centered, muted)

**Loading State:**
- [ ] While loading, shows spinner
- [ ] Spinner centered in section

**Change Salary Type:**
- [ ] Change from "Fixed" to "Percentage"
- [ ] Save changes
- [ ] New entry appears in history table
- [ ] Entry shows:
  - [ ] Date: current date/time (dd.MM.yyyy HH:mm)
  - [ ] Who changed: your name
  - [ ] Field: "Тип зарплаты"
  - [ ] Was: "Фиксированная"
  - [ ] Became: "Процент"
  - [ ] Reason: "—" (if not provided)
- [ ] Formatting correct

**Change Salary Amount:**
- [ ] Change amount from 50000 to 60000
- [ ] Save changes
- [ ] New entry appears
- [ ] Entry shows:
  - [ ] Field: "Размер зарплаты"
  - [ ] Was: "50 000 ₽"
  - [ ] Became: "60 000 ₽"
- [ ] Number formatting correct (spaces, ₽)

**Change Percentage Amount:**
- [ ] Set salary type to Percentage
- [ ] Change from 10% to 15%
- [ ] Save changes
- [ ] Entry shows:
  - [ ] Was: "10%"
  - [ ] Became: "15%"
- [ ] Percentage symbol displays

**Sorting:**
- [ ] Make 3-4 changes
- [ ] Verify newest entries at top
- [ ] Oldest entries at bottom
- [ ] Sorting by createdAt DESC

**Reason Field:**
- [ ] If reason provided, displays in table
- [ ] If no reason, shows "—"

**Who Changed:**
- [ ] Shows correct user full name
- [ ] If user deleted, shows "Неизвестно"

**Table Responsiveness:**
- [ ] Table scrolls horizontally on mobile
- [ ] All columns visible on desktop
- [ ] Layout doesn't break

#### Unit Tests (30 min)

Create `apps/api/src/modules/payouts/payouts.service.spec.ts`:

```typescript
describe('PayoutsService - Salary History', () => {
  describe('updateMemberSalary', () => {
    it('should update salary and log history', async () => {
      const input = {
        memberId: 'member-1',
        salaryType: 'PERCENTAGE',
        salaryAmount: 15,
        reason: 'Performance increase',
      };

      await service.updateMemberSalary(input, 'owner-id');

      // Verify history entry created
      const history = await prisma.teamMemberSalaryHistory.findMany({
        where: { memberId: 'member-1' },
      });

      expect(history).toHaveLength(1);
      expect(history[0]).toMatchObject({
        previousType: 'FIXED',
        newType: 'PERCENTAGE',
        reason: 'Performance increase',
        changedByUserId: 'owner-id',
      });
    });

    it('should detect salary type change', async () => {
      const input = {
        memberId: 'member-1',
        salaryType: 'PERCENTAGE',
        salaryAmount: 50000, // same amount
      };

      await service.updateMemberSalary(input, 'owner-id');

      const history = await prisma.teamMemberSalaryHistory.findFirst({
        where: { memberId: 'member-1' },
      });

      expect(history).toBeDefined();
      expect(history.previousType).not.toBe(history.newType);
    });

    it('should detect salary amount change', async () => {
      const input = {
        memberId: 'member-1',
        salaryType: 'FIXED', // same type
        salaryAmount: 60000, // different amount
      };

      await service.updateMemberSalary(input, 'owner-id');

      const history = await prisma.teamMemberSalaryHistory.findFirst({
        where: { memberId: 'member-1' },
      });

      expect(history).toBeDefined();
      expect(history.previousAmount).not.toBe(history.newAmount);
    });

    it('should not log if nothing changed', async () => {
      const member = await prisma.teamMember.findUnique({
        where: { id: 'member-1' },
      });

      const input = {
        memberId: 'member-1',
        salaryType: member.salaryType,
        salaryAmount: member.salaryAmount?.toNumber(),
      };

      await service.updateMemberSalary(input, 'owner-id');

      const history = await prisma.teamMemberSalaryHistory.findMany({
        where: { memberId: 'member-1' },
      });

      expect(history).toHaveLength(0); // No change, no log
    });

    it('should use transaction for atomicity', async () => {
      // Mock prisma to throw error during history creation
      jest.spyOn(prisma.teamMemberSalaryHistory, 'create')
        .mockRejectedValueOnce(new Error('DB Error'));

      const input = {
        memberId: 'member-1',
        salaryType: 'PERCENTAGE',
        salaryAmount: 15,
      };

      await expect(
        service.updateMemberSalary(input, 'owner-id')
      ).rejects.toThrow();

      // Verify salary NOT updated (rolled back)
      const member = await prisma.teamMember.findUnique({
        where: { id: 'member-1' },
      });

      expect(member.salaryType).not.toBe('PERCENTAGE');
    });

    it('should send Telegram notification', async () => {
      const sendNotificationSpy = jest.spyOn(
        telegramNotificationService,
        'sendSalaryChangeNotification'
      );

      const input = {
        memberId: 'member-1',
        salaryType: 'PERCENTAGE',
        salaryAmount: 15,
      };

      await service.updateMemberSalary(input, 'owner-id');

      expect(sendNotificationSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: expect.any(String),
          previousType: 'FIXED',
          newType: 'PERCENTAGE',
        })
      );
    });

    it('should throw if user is not owner', async () => {
      const input = {
        memberId: 'member-1',
        salaryType: 'PERCENTAGE',
        salaryAmount: 15,
      };

      await expect(
        service.updateMemberSalary(input, 'non-owner-id')
      ).rejects.toThrow(ForbiddenException);
    });
  });
});
```

---

## 🧪 E2E Tests (2 hours)

Create `apps/web/e2e/stage-9-phase-2.spec.ts`:

```typescript
import { test, expect } from '@playwright/test';

test.describe('Stage 9 Phase 2 - E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.fill('[name="email"]', 'test@example.com');
    await page.fill('[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');
  });

  test('Time Tracking - Complete Flow', async ({ page }) => {
    // Navigate to time tracking
    await page.goto('/teams/test-team/projects/test-project/time-tracking');

    // Add work log
    await page.click('text=Добавить запись');
    await page.selectOption('[name="memberId"]', 'member-1');
    await page.fill('[name="date"]', '2024-01-15');
    await page.fill('[name="hours"]', '8');
    await page.fill('[name="description"]', 'Development work');
    await page.click('button[type="submit"]');

    // Verify in table
    await expect(page.locator('table')).toContainText('Development work');
    await expect(page.locator('table')).toContainText('8');

    // Export CSV
    await page.click('text=Export CSV');
    const download = await page.waitForEvent('download');
    expect(download.suggestedFilename()).toMatch(/work-logs.*\.csv/);
  });

  test('Personnel Analytics - Dashboard Load', async ({ page }) => {
    await page.goto('/teams/test-team/analytics/personnel');

    // Verify KPIs load
    await expect(page.locator('text=Total Members')).toBeVisible();
    await expect(page.locator('text=Total Hours')).toBeVisible();
    await expect(page.locator('text=Total Payouts')).toBeVisible();

    // Verify charts render
    await expect(page.locator('.recharts-wrapper')).toHaveCount(4);

    // Search members
    await page.fill('[placeholder*="Search"]', 'John');
    await expect(page.locator('table')).toContainText('John');

    // Export CSV
    await page.click('text=Export CSV');
    const download = await page.waitForEvent('download');
    expect(download.suggestedFilename()).toMatch(/analytics.*\.csv/);
  });

  test('Salary History - Change Tracking', async ({ page }) => {
    await page.goto('/teams/test-team/members/member-1/salary');

    // Check initial empty state
    await expect(page.locator('text=Нет истории изменений')).toBeVisible();

    // Change salary type
    await page.selectOption('[name="salaryType"]', 'PERCENTAGE');
    await page.fill('[name="salaryAmount"]', '15');
    await page.click('button[type="submit"]');

    // Wait for success
    await expect(page.locator('text=Salary updated')).toBeVisible();

    // Verify history entry
    await expect(page.locator('table')).toContainText('Тип зарплаты');
    await expect(page.locator('table')).toContainText('Фиксированная');
    await expect(page.locator('table')).toContainText('Процент');

    // Change amount
    await page.fill('[name="salaryAmount"]', '20');
    await page.click('button[type="submit"]');

    // Verify second entry
    await expect(page.locator('table')).toContainText('Размер зарплаты');
    await expect(page.locator('table')).toContainText('15%');
    await expect(page.locator('table')).toContainText('20%');

    // Verify sorting (newest first)
    const rows = page.locator('tbody tr');
    await expect(rows.first()).toContainText('20%');
    await expect(rows.last()).toContainText('Фиксированная');
  });
});
```

---

## 📊 Test Results Template

| Feature | Manual Tests | Unit Tests | E2E Tests | Status | Notes |
|---------|--------------|------------|-----------|--------|-------|
| **Time Tracking** | | | | | |
| - Display & Navigation | 10 | - | - | | |
| - Add/Edit/Delete | 15 | 5 | 1 | | |
| - Calendar View | 5 | - | - | | |
| - CSV Export | 5 | - | - | | |
| **Personnel Analytics** | | | | | |
| - KPI Cards | 7 | - | - | | |
| - Charts | 12 | - | - | | |
| - Tables | 15 | 3 | 1 | | |
| - CSV Export | 5 | 2 | - | | |
| **Salary History** | | | | | |
| - Display States | 3 | - | - | | |
| - Type Changes | 5 | 2 | - | | |
| - Amount Changes | 5 | 2 | - | | |
| - History Tracking | 8 | 4 | 1 | | |
| **TOTAL** | **90** | **18** | **3** | | |

---

## ✅ Acceptance Criteria

Phase 2 is considered **PRODUCTION READY** when:

- [ ] All manual tests pass (100%)
- [ ] All unit tests pass (100%)
- [ ] All E2E tests pass (100%)
- [ ] No critical bugs
- [ ] No more than 5 medium bugs
- [ ] Performance acceptable:
  - [ ] Analytics page loads < 3 seconds
  - [ ] Time tracking page loads < 2 seconds
  - [ ] CSV exports < 5 seconds
- [ ] No console errors
- [ ] No TypeScript errors
- [ ] All features work in Chrome, Firefox, Safari

---

## 🚀 After Testing

1. **Fix Bugs** (varies)
2. **Update Documentation** (1 hour)
3. **Create Release Notes** (30 min)
4. **Tag Release** (15 min): `git tag v0.4.2`
5. **Deploy to Production** (1-2 hours)

---

**Created:** 2025-12-17, 03:50
**Status:** Ready for Testing
**Estimated Time:** 1 day (8 hours)
