# Quick Fix: Upgrade Button in Header ✅

## What Was Done

Added an **UpgradeButton** component to the page header that displays the user's current subscription plan and provides quick access to upgrade.

---

## Files Modified

### 1. [upgrade-button.tsx](apps/web/src/packages/components/subscription/upgrade-button.tsx)

**Enhanced component** to show different states:

- **No subscription**: Shows "Начать" button with gradient
- **BRIGADE plan (top tier)**: Shows crown icon + plan name badge
- **LITE/FOREMAN plans**: Shows upgrade button with current plan name + "Апгрейд"
- **Inactive subscriptions**: Hidden (only shows for ACTIVE/TRIALING status)

**Features:**
- Responsive design (hides text on mobile, shows icons only)
- All buttons link to `/settings?tab=billing`
- Uses GraphQL `MySubscriptionDocument` query
- Beautiful gradient styling for upgrade button

### 2. [page-header.tsx](apps/web/src/packages/components/ui/page-header.tsx)

**Added** `<UpgradeButton />` to header's right side (line 91):

```tsx
<div className="flex items-center gap-3 flex-shrink-0">
  {actions}
  {children}
  <UpgradeButton />  // ← Added here
  {showUserMenu && <UserMenu avatarSize="sm" />}
</div>
```

---

## How It Looks

### For User with LITE Plan (Your Current State):
```
[⚡ Лайт → ✨ Апгрейд]  [👤 UserMenu]
```

On mobile:
```
[⚡ ↑]  [👤]
```

### For User with No Subscription:
```
[✨ Начать]  [👤 UserMenu]
```

### For User with BRIGADE Plan (Top Tier):
```
[👑 Бригада]  [👤 UserMenu]
```

---

## Testing Instructions

1. **Restart dev server** (if running):
   ```bash
   # Stop current server (Ctrl+C)
   pnpm dev
   ```

2. **Open app** in browser:
   ```
   http://localhost:3000
   ```

3. **Expected behavior**:
   - ✅ You should see upgrade button in header on all pages
   - ✅ Button should show "Лайт → Апгрейд" (since you have LITE plan)
   - ✅ Clicking button should navigate to Settings → Billing tab
   - ✅ You should be able to select FOREMAN or BRIGADE plan

---

## User Requirements (All Completed ✅)

- ✅ **"пользователь видел, какой план у него подключен"** → Shows "Лайт" in button
- ✅ **"чтобы он мог изменить его"** → Clicking button goes to billing settings
- ✅ **"На любой странице добавьте кнопку для апгрейда в хедере"** → Added to PageHeader component

---

## Next Steps

1. **Test the upgrade button** in your browser
2. If you still see "Не удалось создать подписку" error when selecting a plan:
   - Check API server console logs
   - Send me the error logs from backend
   - We'll debug the subscription creation/change logic

---

## Technical Details

**Component Logic:**
```typescript
1. Fetch subscription via GraphQL: useQuery(MySubscriptionDocument)
2. If loading → show nothing
3. If no subscription → "Начать" button
4. If subscription.status not in [ACTIVE, TRIALING] → hide
5. If plan === BRIGADE → show crown badge
6. Else → show upgrade button with current plan name
```

**Responsive Breakpoints:**
- Mobile (`< sm`): Shows only icons (⚡ ↑)
- Tablet (`sm`): Shows plan name (⚡ Лайт ↑)
- Desktop (`md+`): Shows full text (⚡ Лайт → ✨ Апгрейд)

---

## Version Info

- **Version**: v1.6.2 (patch)
- **Component**: UpgradeButton
- **Location**: Header (all pages using PageHeader)
- **Commit**: Ready for commit

---

**Need help?** Just restart the dev server and check the header! 🚀
