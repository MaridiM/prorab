# 🚀 START HERE - Stage 13 Continuation

**Текущий статус:** Stage 13 - RBAC System (65% Complete)
**Дата последней сессии:** 2025-12-18, 16:00
**Следующий шаг:** Frontend UI Implementation

---

## 📋 Быстрый обзор

### Что уже сделано ✅

**Backend (90% Complete):**
- ✅ AdminRolesResolver + Service (8 операций, 675 LOC)
- ✅ 4 типа ролей (SUPER_ADMIN, ADMIN, MODERATOR, SUPPORT)
- ✅ 40+ разрешений (users:view, teams:delete, settings:update, etc.)
- ✅ Audit logging, IP whitelist, 2FA enforcement
- ✅ GraphQL schema + TypeScript types

**Frontend (40% Complete):**
- ✅ Auth context с hasPermission() helper
- ✅ Permission-based navigation в AdminSidebar
- ✅ GraphQL operations + codegen
- ⏳ **Нужно:** UI страницы для управления ролями

---

## 🎯 Следующие задачи (Приоритет 1)

### 1. Frontend Roles Page (6-8 часов)

**Создать файлы:**

#### a) Main Page (`apps/web/src/app/(root)/(protected)/admin/roles/page.tsx`)
**Объем:** ~400 LOC

**UI Components:**
- Table с колонками: User, Email, Role, Permissions Count, 2FA, IP Whitelist, Actions
- Filter dropdown по типу роли (All, SUPER_ADMIN, ADMIN, MODERATOR, SUPPORT)
- Search input для поиска пользователей по имени/email
- "Assign Role" button → открывает AssignRoleDialog
- Row actions: Edit Permissions, Change Role, Revoke Role

**GraphQL:**
```typescript
import { useQuery, useMutation } from '@apollo/client/react'
import { GetAdminRolesDocument, RevokeAdminRoleDocument } from '@/packages/api/graphql'

const { data, loading } = useQuery(GetAdminRolesDocument, {
  variables: { role: selectedRole, search: searchQuery }
})
```

**Пример структуры:**
```typescript
export default function AdminRolesPage() {
  const [selectedRole, setSelectedRole] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [showAssignDialog, setShowAssignDialog] = useState(false)

  const { data, loading } = useQuery(GetAdminRolesDocument, {
    variables: { role: selectedRole, search: searchQuery }
  })

  return (
    <div className="space-y-6">
      {/* Header with Assign button */}
      {/* Filters (Role dropdown + Search) */}
      {/* Roles Table */}
      {/* Assign Role Dialog */}
    </div>
  )
}
```

#### b) Assign Role Dialog (`apps/web/src/app/(root)/(protected)/admin/roles/assign-role-dialog.tsx`)
**Объем:** ~250 LOC

**UI Components:**
- User search/select (Combobox или Select с поиском)
- Role type selector (SUPER_ADMIN, ADMIN, MODERATOR, SUPPORT)
- Permissions checkboxes grouped by category
- 2FA enforcement checkbox
- IP whitelist input (textarea для списка IP)
- Save/Cancel buttons

**GraphQL:**
```typescript
const [assignRole] = useMutation(AssignAdminRoleDocument)

const handleSubmit = async () => {
  await assignRole({
    variables: {
      input: {
        userId: selectedUser.id,
        role: selectedRole,
        permissions: selectedPermissions,
        twoFactorEnforced: twoFaRequired,
        ipWhitelist: ipAddresses
      }
    }
  })
}
```

#### c) Edit Permissions Dialog (`apps/web/src/app/(root)/(protected)/admin/roles/edit-permissions-dialog.tsx`)
**Объем:** ~200 LOC

**UI Components:**
- Permission groups (accordion или tabs):
  - Users Management
  - Teams Management
  - Projects Management
  - Subscriptions
  - Payments
  - Settings
  - Storage
  - Roles
  - Support
  - Content
  - Analytics
  - System
- Checkboxes для каждого разрешения
- "Select All" / "Select None" per group
- Save/Cancel buttons

**GraphQL:**
```typescript
const [updatePermissions] = useMutation(UpdateAdminPermissionsDocument)

const handleSave = async () => {
  await updatePermissions({
    variables: {
      input: {
        roleId: currentRole.id,
        permissions: selectedPermissions
      }
    }
  })
}
```

#### d) Permissions Selector Component (`apps/web/src/packages/components/admin/permissions-selector.tsx`)
**Объем:** ~150 LOC

Reusable component для выбора разрешений.

**Props:**
```typescript
interface PermissionsSelectorProps {
  selectedPermissions: string[]
  onChange: (permissions: string[]) => void
  roleType?: AdminRoleType // для показа рекомендуемых разрешений
}
```

**Permission Groups:**
```typescript
const PERMISSION_GROUPS = {
  'Users Management': [
    { id: 'users:view', label: 'View Users' },
    { id: 'users:update', label: 'Update Users' },
    { id: 'users:delete', label: 'Delete Users' },
    // ...
  ],
  'Teams Management': [
    { id: 'teams:view', label: 'View Teams' },
    // ...
  ],
  // ...
}
```

---

## 📁 Файловая структура

```
apps/web/src/app/(root)/(protected)/admin/roles/
├── page.tsx                        # Main roles management page (~400 LOC)
├── assign-role-dialog.tsx          # Assign role modal (~250 LOC)
├── edit-permissions-dialog.tsx     # Edit permissions modal (~200 LOC)
└── __tests__/
    └── page.test.tsx               # Tests (later)

apps/web/src/packages/components/admin/
└── permissions-selector.tsx        # Reusable selector (~150 LOC)
```

---

## 🔧 Технические детали

### GraphQL Operations (Already Created)
**File:** `apps/web/src/packages/api/graphql/admin/admin-roles.graphql`

**Queries:**
- `GetAdminRoles` - List roles with filters
- `GetAdminRole` - Get single role
- `GetAdminRoleByUserId` - Get role by user

**Mutations:**
- `AssignAdminRole` - Assign role to user
- `UpdateAdminPermissions` - Update permissions
- `UpdateTwoFactorEnforcement` - Toggle 2FA
- `UpdateIpWhitelist` - Update IP whitelist
- `ChangeAdminRole` - Change role type
- `RevokeAdminRole` - Revoke role

### TypeScript Types (Already Generated)
Импорт из `@/packages/api/graphql`:
```typescript
import {
  GetAdminRolesDocument,
  AssignAdminRoleDocument,
  UpdateAdminPermissionsDocument,
  RevokeAdminRoleDocument,
  AdminRoleType,
  // ...
} from '@/packages/api/graphql'
```

### UI Components to Use
**From shadcn/ui:**
- `Table` - для таблицы ролей
- `Dialog` - для модальных окон
- `Select` / `Combobox` - для выбора пользователя и роли
- `Checkbox` - для разрешений
- `Input` - для поиска
- `Button` - для действий
- `Accordion` / `Tabs` - для группировки разрешений
- `Badge` - для отображения роли

---

## 📚 Полезные ссылки

**Documentation:**
- [STAGE_13_RBAC_SYSTEM.md](./stages/STAGE_13_RBAC_SYSTEM.md) - Полная спецификация
- [SESSION_SUMMARY_2025-12-18_RBAC.md](./SESSION_SUMMARY_2025-12-18_RBAC.md) - Отчет о последней сессии
- [STAGE_13_PROGRESS_2025-12-18.md](./STAGE_13_PROGRESS_2025-12-18.md) - Прогресс Stage 13

**Code References:**
- Backend Service: [apps/api/src/modules/admin/services/admin-roles.service.ts](../apps/api/src/modules/admin/services/admin-roles.service.ts)
- Backend Resolver: [apps/api/src/modules/admin/resolvers/admin-roles.resolver.ts](../apps/api/src/modules/admin/resolvers/admin-roles.resolver.ts)
- GraphQL Ops: [apps/web/src/packages/api/graphql/admin/admin-roles.graphql](../apps/web/src/packages/api/graphql/admin/admin-roles.graphql)
- Admin Permissions: [apps/api/src/shared/constants/admin-permissions.ts](../apps/api/src/shared/constants/admin-permissions.ts)

**Existing Admin Pages (for reference):**
- [apps/web/src/app/(root)/(protected)/admin/users/page.tsx](../apps/web/src/app/(root)/(protected)/admin/users/page.tsx)
- [apps/web/src/app/(root)/(protected)/admin/teams/page.tsx](../apps/web/src/app/(root)/(protected)/admin/teams/page.tsx)

---

## ⚡ Quick Start Commands

```bash
# Navigate to project
cd g:/Projects/prorab/v-1

# Frontend development
cd apps/web
npm run dev

# Backend development (if needed)
cd apps/api
npm run dev

# Run codegen after GraphQL changes
cd apps/web
npm run codegen

# Check TypeScript
cd apps/api
npx tsc --noEmit

cd apps/web
npx tsc --noEmit
```

---

## 🎯 Success Criteria

**Frontend UI считается завершенным когда:**
1. ✅ Страница `/admin/roles` отображает таблицу ролей
2. ✅ Фильтрация по типу роли работает
3. ✅ Поиск пользователей работает
4. ✅ AssignRoleDialog позволяет назначить роль
5. ✅ EditPermissionsDialog позволяет редактировать разрешения
6. ✅ Можно отозвать роль
7. ✅ UI responsive и accessible
8. ✅ 0 TypeScript errors
9. ✅ Frontend build successful

---

## 📝 Notes

1. **Permission Groups:** Используйте константу `PERMISSION_GROUPS` из существующих файлов или создайте новую

2. **User Search:** Может потребоваться создать отдельный GraphQL query для поиска пользователей (если еще не существует)

3. **Role Badges:** Используйте разные цвета для разных типов ролей:
   - SUPER_ADMIN: red/destructive
   - ADMIN: blue/primary
   - MODERATOR: yellow/warning
   - SUPPORT: green/success

4. **2FA Icon:** Показывайте иконку замка если 2FA enforced

5. **IP Whitelist:** Показывайте количество IP в списке или "All IPs" если пусто

6. **Confirmations:** Используйте AlertDialog для подтверждения опасных действий (Revoke role, Change role)

7. **Toast Notifications:** Показывайте успех/ошибку после операций

8. **Loading States:** Добавьте скелетоны/спиннеры при загрузке

---

**Готовы начать?** Начните с создания файла `apps/web/src/app/(root)/(protected)/admin/roles/page.tsx`

**Estimated Time:** 6-8 hours для всех UI компонентов
