# Stage 13: RBAC System & System Settings UI

**Дата начала:** 2025-12-18
**Статус:** 🔄 В РАБОТЕ
**Версия:** 0.6.0
**Приоритет:** P1 (Важно для Post-MVP)

---

## 📋 ОБЗОР

Полная реализация **Role-Based Access Control (RBAC)** системы для Admin Panel с управлением ролями, разрешениями и System Settings UI.

### Цели:
1. ✅ Реализовать управление Admin ролями (CRUD operations)
2. ✅ Миграция системных настроек из `.env` в базу данных с шифрованием
3. ✅ Frontend UI для управления ролями и разрешениями
4. ✅ Enhanced System Settings UI с поддержкой шифрования
5. ✅ Permission-based navigation в Admin Panel

---

## 🎯 SCOPE & DELIVERABLES

### Backend (NestJS + GraphQL):
- ✅ AdminRolesResolver (6 queries/mutations)
- ✅ AdminRolesService (полная бизнес-логика)
- ✅ System Settings Migration Script
- ✅ Updated SystemSettingsService для Redis caching

### Frontend (Next.js + React):
- ✅ Admin Roles Management Page (`/admin/roles`)
- ✅ Assign Role Dialog (с выбором роли и разрешений)
- ✅ Edit Permissions Dialog (inline editing)
- ✅ Enhanced System Settings Page UI
- ✅ Permission-based sidebar filtering

### Database:
- ✅ Использование существующих моделей (AdminRole, SystemSettings)
- ✅ Migration script для переноса .env → DB

### GraphQL Schema:
- ✅ AdminRole queries/mutations
- ✅ SystemSettings enhanced operations
- ✅ Code generation для frontend

---

## 📊 TECHNICAL ARCHITECTURE

### 1. RBAC Model (Already Exists)

**AdminRole Model (Prisma):**
```prisma
model AdminRole {
  id                String   @id @default(uuid())
  userId            String   @unique
  user              User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  role              AdminRoleType
  permissions       String[]
  twoFactorEnforced Boolean  @default(false)
  ipWhitelist       String[] // Array of allowed IPs
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
}

enum AdminRoleType {
  SUPER_ADMIN
  ADMIN
  MODERATOR
  SUPPORT
}
```

**Permissions System:**
- 40+ granular permissions в `admin-permissions.ts`
- Format: `RESOURCE:ACTION` (e.g., `USERS_VIEW`, `TEAMS_DELETE`)
- Role presets: pre-defined permission sets for each role

### 2. System Settings (Already Exists)

**SystemSettings Model:**
```prisma
model SystemSettings {
  id          String                 @id @default(uuid())
  key         String                 @unique
  value       String
  isEncrypted Boolean                @default(false)
  valueType   SystemSettingValueType @default(STRING)
  description String?
  category    String?
  validation  Json?
  updatedBy   String?
  updatedByUser User? @relation(fields: [updatedBy], references: [id])
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

enum SystemSettingValueType {
  STRING
  NUMBER
  BOOLEAN
  JSON
  SECRET
}
```

---

## 🔧 IMPLEMENTATION PHASES

### **Phase 1: Backend - Admin Role Management API** (4-6 часов)

#### Files to Create:
1. `apps/api/src/modules/admin/resolvers/admin-roles.resolver.ts`
2. `apps/api/src/modules/admin/services/admin-roles.service.ts`
3. `apps/api/src/modules/admin/models/admin-role-detail.model.ts`

#### AdminRolesService Methods:
```typescript
class AdminRolesService {
  // Queries
  async findAll(): Promise<AdminRole[]>
  async findById(id: string): Promise<AdminRole>
  async findByUserId(userId: string): Promise<AdminRole | null>

  // Mutations
  async assignRole(userId: string, role: AdminRoleType, permissions?: string[]): Promise<AdminRole>
  async updatePermissions(roleId: string, permissions: string[]): Promise<AdminRole>
  async updateTwoFactorEnforcement(roleId: string, enforced: boolean): Promise<AdminRole>
  async updateIpWhitelist(roleId: string, ips: string[]): Promise<AdminRole>
  async revokeRole(roleId: string): Promise<boolean>
}
```

#### AdminRolesResolver:
```typescript
@Resolver(() => AdminRole)
@UseGuards(AuthGuard, AdminGuard, PermissionsGuard)
export class AdminRolesResolver {
  @Query(() => [AdminRole])
  @RequirePermissions(ADMIN_PERMISSIONS.ROLES_VIEW)
  async adminRoles(): Promise<AdminRole[]>

  @Query(() => AdminRole)
  @RequirePermissions(ADMIN_PERMISSIONS.ROLES_VIEW)
  async adminRole(@Args('id') id: string): Promise<AdminRole>

  @Mutation(() => AdminRole)
  @RequirePermissions(ADMIN_PERMISSIONS.ROLES_ASSIGN)
  async assignAdminRole(@Args('input') input: AssignAdminRoleInput): Promise<AdminRole>

  @Mutation(() => AdminRole)
  @RequirePermissions(ADMIN_PERMISSIONS.ROLES_UPDATE)
  async updateAdminPermissions(@Args('input') input: UpdateAdminPermissionsInput): Promise<AdminRole>

  @Mutation(() => Boolean)
  @RequirePermissions(ADMIN_PERMISSIONS.ROLES_REVOKE)
  async revokeAdminRole(@Args('roleId') roleId: string): Promise<boolean>
}
```

#### Access Control:
- `ROLES_VIEW`: Просмотр списка ролей (ADMIN+)
- `ROLES_ASSIGN`: Назначение ролей (SUPER_ADMIN only)
- `ROLES_UPDATE`: Изменение разрешений (SUPER_ADMIN only)
- `ROLES_REVOKE`: Отзыв ролей (SUPER_ADMIN only)

---

### **Phase 2: Backend - System Settings Migration** (3-4 часа)

#### Migration Script:
**File:** `apps/api/src/scripts/migrate-env-to-settings.ts`

**Tokens to Migrate:**
```typescript
const ENV_TO_SETTINGS_MAP = [
  // Telegram
  { key: 'TELEGRAM_BOT_TOKEN', encrypted: true, category: 'telegram' },
  { key: 'TELEGRAM_SUPPORT_BOT_TOKEN', encrypted: true, category: 'telegram' },

  // YooKassa
  { key: 'YOOKASSA_SHOP_ID', encrypted: false, category: 'payments' },
  { key: 'YOOKASSA_SECRET_KEY', encrypted: true, category: 'payments' },

  // Email (Future)
  { key: 'SMTP_HOST', encrypted: false, category: 'email' },
  { key: 'SMTP_PASSWORD', encrypted: true, category: 'email' },
]
```

#### Updated SystemSettingsService:
```typescript
class SystemSettingsService {
  // Redis caching
  private readonly CACHE_TTL = 300 // 5 minutes

  async get(key: string): Promise<string | null> {
    // 1. Check Redis cache
    const cached = await this.redis.get(`settings:${key}`)
    if (cached) return cached

    // 2. Query DB
    const setting = await this.prisma.systemSettings.findUnique({ where: { key } })
    if (!setting) return null

    // 3. Decrypt if needed
    const value = setting.isEncrypted
      ? await this.encryptionService.decrypt(setting.value)
      : setting.value

    // 4. Cache result
    await this.redis.setex(`settings:${key}`, this.CACHE_TTL, value)

    return value
  }

  async set(key: string, value: string, encrypted: boolean): Promise<void> {
    const finalValue = encrypted
      ? await this.encryptionService.encrypt(value)
      : value

    await this.prisma.systemSettings.upsert({
      where: { key },
      create: { key, value: finalValue, isEncrypted: encrypted },
      update: { value: finalValue, isEncrypted: encrypted }
    })

    // Invalidate cache
    await this.redis.del(`settings:${key}`)
  }
}
```

#### Services Update:
- `TelegramService`: Read tokens from SystemSettings
- `PaymentsService`: Read YooKassa credentials from DB
- Fallback to `.env` if setting not found (backward compatibility)

---

### **Phase 3: Frontend - Admin Roles UI** (6-8 часов)

#### File Structure:
```
apps/web/src/app/(root)/(protected)/admin/roles/
├── page.tsx              # Main roles management page
├── assign-role-dialog.tsx  # Dialog для назначения роли
└── edit-permissions-dialog.tsx  # Dialog для редактирования разрешений
```

#### Roles Management Page (`page.tsx`):
```typescript
export default function AdminRolesPage() {
  const { data, loading } = useQuery(GET_ADMIN_ROLES)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between">
        <h1>Admin Roles</h1>
        <Button onClick={() => setShowAssignDialog(true)}>
          Assign Role
        </Button>
      </div>

      {/* Roles Table */}
      <Table>
        <thead>
          <tr>
            <th>User</th>
            <th>Email</th>
            <th>Role</th>
            <th>Permissions</th>
            <th>2FA</th>
            <th>IP Whitelist</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {data?.adminRoles.map(role => (
            <RoleRow key={role.id} role={role} />
          ))}
        </tbody>
      </Table>
    </div>
  )
}
```

#### Assign Role Dialog:
```typescript
function AssignRoleDialog({ open, onClose }) {
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [selectedRole, setSelectedRole] = useState<AdminRoleType>('MODERATOR')
  const [permissions, setPermissions] = useState<string[]>([])

  const [assignRole] = useMutation(ASSIGN_ADMIN_ROLE)

  const handleSubmit = async () => {
    await assignRole({
      variables: {
        input: {
          userId: selectedUser.id,
          role: selectedRole,
          permissions
        }
      }
    })
    onClose()
  }

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogContent>
        <DialogTitle>Assign Admin Role</DialogTitle>

        {/* User Search */}
        <UserSearchCombobox
          value={selectedUser}
          onChange={setSelectedUser}
        />

        {/* Role Selection */}
        <Select value={selectedRole} onChange={setSelectedRole}>
          <option value="SUPPORT">Support</option>
          <option value="MODERATOR">Moderator</option>
          <option value="ADMIN">Admin</option>
          <option value="SUPER_ADMIN">Super Admin</option>
        </Select>

        {/* Permissions Checkboxes */}
        <PermissionsSelector
          role={selectedRole}
          selected={permissions}
          onChange={setPermissions}
        />

        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit}>Assign</Button>
        </DialogActions>
      </DialogContent>
    </Dialog>
  )
}
```

#### Edit Permissions Dialog:
```typescript
function EditPermissionsDialog({ roleId, currentPermissions, open, onClose }) {
  const [permissions, setPermissions] = useState(currentPermissions)
  const [updatePermissions] = useMutation(UPDATE_ADMIN_PERMISSIONS)

  const handleSave = async () => {
    await updatePermissions({
      variables: {
        input: { roleId, permissions }
      }
    })
    onClose()
  }

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogContent>
        <DialogTitle>Edit Permissions</DialogTitle>

        {/* Permission Groups */}
        {PERMISSION_GROUPS.map(group => (
          <div key={group.name}>
            <h3>{group.name}</h3>
            <div className="grid grid-cols-2 gap-2">
              {group.permissions.map(perm => (
                <Checkbox
                  key={perm.id}
                  checked={permissions.includes(perm.id)}
                  onChange={(checked) => togglePermission(perm.id, checked)}
                >
                  {perm.label}
                </Checkbox>
              ))}
            </div>
          </div>
        ))}

        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>Save</Button>
        </DialogActions>
      </DialogContent>
    </Dialog>
  )
}
```

---

### **Phase 4: Frontend - System Settings UI Enhancement** (4-5 часов)

#### Enhanced Settings Page:
**File:** `apps/web/src/app/(root)/(protected)/admin/settings/page.tsx`

**New Features:**
1. **Encryption Toggle:**
   - Show lock icon for encrypted settings
   - Toggle encryption on/off with confirmation
   - Re-encrypt on toggle change

2. **Setting Categories:**
   - Group by category (Telegram, Payments, Email, etc.)
   - Collapsible sections

3. **Change History:**
   - Show who updated each setting
   - Show last update timestamp
   - Optional: full audit log

4. **Validation:**
   - Client-side validation based on valueType
   - JSON validation for JSON settings
   - URL validation for URLs

**UI Structure:**
```typescript
export default function SystemSettingsPage() {
  const { data } = useQuery(GET_SYSTEM_SETTINGS)

  const settingsByCategory = groupBy(data?.systemSettings, 'category')

  return (
    <div className="space-y-6">
      <h1>System Settings</h1>

      {Object.entries(settingsByCategory).map(([category, settings]) => (
        <Card key={category}>
          <CardHeader>
            <CardTitle>{category}</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <thead>
                <tr>
                  <th>Key</th>
                  <th>Value</th>
                  <th>Type</th>
                  <th>Encrypted</th>
                  <th>Updated By</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {settings.map(setting => (
                  <SettingRow key={setting.id} setting={setting} />
                ))}
              </tbody>
            </Table>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
```

---

### **Phase 5: GraphQL Schema & Code Generation** (2-3 часа)

#### Backend Schema Updates:
**File:** `apps/api/src/modules/admin/models/admin-role-detail.model.ts`

```typescript
@ObjectType()
export class AdminRoleDetail {
  @Field(() => ID)
  id: string

  @Field()
  userId: string

  @Field(() => User)
  user: User

  @Field(() => AdminRoleType)
  role: AdminRoleType

  @Field(() => [String])
  permissions: string[]

  @Field()
  twoFactorEnforced: boolean

  @Field(() => [String])
  ipWhitelist: string[]

  @Field()
  createdAt: Date

  @Field()
  updatedAt: Date
}

@InputType()
export class AssignAdminRoleInput {
  @Field()
  userId: string

  @Field(() => AdminRoleType)
  role: AdminRoleType

  @Field(() => [String], { nullable: true })
  permissions?: string[]

  @Field({ nullable: true })
  twoFactorEnforced?: boolean

  @Field(() => [String], { nullable: true })
  ipWhitelist?: string[]
}

@InputType()
export class UpdateAdminPermissionsInput {
  @Field()
  roleId: string

  @Field(() => [String])
  permissions: string[]
}
```

#### Frontend GraphQL Operations:
**File:** `apps/web/src/packages/api/graphql/admin/admin-roles.graphql`

```graphql
query GetAdminRoles {
  adminRoles {
    id
    userId
    user {
      id
      email
      name
    }
    role
    permissions
    twoFactorEnforced
    ipWhitelist
    createdAt
    updatedAt
  }
}

query GetAdminRole($id: ID!) {
  adminRole(id: $id) {
    id
    userId
    user {
      id
      email
      name
    }
    role
    permissions
    twoFactorEnforced
    ipWhitelist
    createdAt
    updatedAt
  }
}

mutation AssignAdminRole($input: AssignAdminRoleInput!) {
  assignAdminRole(input: $input) {
    id
    userId
    role
    permissions
  }
}

mutation UpdateAdminPermissions($input: UpdateAdminPermissionsInput!) {
  updateAdminPermissions(input: $input) {
    id
    permissions
  }
}

mutation RevokeAdminRole($roleId: ID!) {
  revokeAdminRole(roleId: $roleId)
}
```

#### Code Generation:
```bash
cd apps/web
npm run codegen
```

---

### **Phase 6: Permission-Based Navigation** (2-3 часа)

#### Update AuthContext:
**File:** `apps/web/src/packages/libs/auth/auth.context.tsx`

```typescript
interface User {
  id: string
  email: string
  name: string
  // Add adminRole
  adminRole?: {
    role: AdminRoleType
    permissions: string[]
  }
}

// Update ME query to include adminRole
const ME_QUERY = gql`
  query Me {
    me {
      id
      email
      name
      adminRole {
        role
        permissions
      }
    }
  }
`
```

#### Update AdminSidebar:
**File:** `apps/web/src/packages/components/admin/admin-sidebar.tsx`

**Before:**
```typescript
// TODO: Get admin role and permissions from user
// For now, show all items
const visibleItems = navItems
```

**After:**
```typescript
const { user } = useAuth()
const adminPermissions = user?.adminRole?.permissions || []

const visibleItems = navItems.filter(item => {
  // If no required permissions, show to all admins
  if (!item.requiredPermissions || item.requiredPermissions.length === 0) {
    return true
  }

  // Check if user has at least one required permission
  return item.requiredPermissions.some(perm =>
    adminPermissions.includes(perm)
  )
})
```

**navItems with permissions:**
```typescript
const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  {
    href: '/admin/users',
    label: 'Users',
    icon: Users,
    requiredPermissions: [ADMIN_PERMISSIONS.USERS_VIEW]
  },
  {
    href: '/admin/teams',
    label: 'Teams',
    icon: Building,
    requiredPermissions: [ADMIN_PERMISSIONS.TEAMS_VIEW]
  },
  {
    href: '/admin/roles',
    label: 'Roles',
    icon: Shield,
    requiredPermissions: [ADMIN_PERMISSIONS.ROLES_VIEW]
  },
  // ...
]
```

---

### **Phase 7: Testing & Documentation** (3-4 часа)

#### Backend Tests:
**File:** `apps/api/src/modules/admin/services/admin-roles.service.spec.ts`

```typescript
describe('AdminRolesService', () => {
  it('should assign admin role', async () => {
    const result = await service.assignRole(userId, 'MODERATOR')
    expect(result.role).toBe('MODERATOR')
  })

  it('should prevent non-SUPER_ADMIN from assigning SUPER_ADMIN role', async () => {
    await expect(
      service.assignRole(userId, 'SUPER_ADMIN', { requestingUser: moderatorUser })
    ).rejects.toThrow()
  })

  it('should update permissions', async () => {
    const result = await service.updatePermissions(roleId, [USERS_VIEW, TEAMS_VIEW])
    expect(result.permissions).toContain(USERS_VIEW)
  })
})
```

#### Frontend Tests:
**File:** `apps/web/src/app/(root)/(protected)/admin/roles/__tests__/page.test.tsx`

```typescript
describe('Admin Roles Page', () => {
  it('renders roles table', async () => {
    render(<AdminRolesPage />)
    expect(screen.getByText('Admin Roles')).toBeInTheDocument()
  })

  it('opens assign role dialog', async () => {
    render(<AdminRolesPage />)
    await userEvent.click(screen.getByText('Assign Role'))
    expect(screen.getByText('Assign Admin Role')).toBeInTheDocument()
  })
})
```

#### Documentation:
1. **ADMIN_ROLES_GUIDE.md** - How to manage admin roles
2. **SYSTEM_SETTINGS_MIGRATION_GUIDE.md** - Migration process
3. Update **README.md** with RBAC features

---

## 📦 FILES TO CREATE/MODIFY

### Backend (NestJS):
**Create:**
1. `apps/api/src/modules/admin/resolvers/admin-roles.resolver.ts` (200 LOC)
2. `apps/api/src/modules/admin/services/admin-roles.service.ts` (350 LOC)
3. `apps/api/src/modules/admin/models/admin-role-detail.model.ts` (100 LOC)
4. `apps/api/src/modules/admin/dto/assign-admin-role.input.ts` (50 LOC)
5. `apps/api/src/modules/admin/dto/update-admin-permissions.input.ts` (30 LOC)
6. `apps/api/src/scripts/migrate-env-to-settings.ts` (200 LOC)
7. `apps/api/src/modules/admin/services/admin-roles.service.spec.ts` (150 LOC)

**Modify:**
8. `apps/api/src/modules/admin/admin.module.ts` (+20 LOC)
9. `apps/api/src/modules/admin/services/system-settings.service.ts` (+100 LOC)
10. `apps/api/src/modules/telegram/telegram.service.ts` (+30 LOC)
11. `apps/api/src/modules/payments/payments.service.ts` (+30 LOC)

### Frontend (Next.js):
**Create:**
12. `apps/web/src/app/(root)/(protected)/admin/roles/page.tsx` (400 LOC)
13. `apps/web/src/app/(root)/(protected)/admin/roles/assign-role-dialog.tsx` (250 LOC)
14. `apps/web/src/app/(root)/(protected)/admin/roles/edit-permissions-dialog.tsx` (200 LOC)
15. `apps/web/src/packages/api/graphql/admin/admin-roles.graphql` (80 LOC)
16. `apps/web/src/packages/components/admin/permissions-selector.tsx` (150 LOC)
17. `apps/web/src/app/(root)/(protected)/admin/roles/__tests__/page.test.tsx` (100 LOC)

**Modify:**
18. `apps/web/src/packages/libs/auth/auth.context.tsx` (+30 LOC)
19. `apps/web/src/packages/components/admin/admin-sidebar.tsx` (+50 LOC)
20. `apps/web/src/app/(root)/(protected)/admin/settings/page.tsx` (+200 LOC)
21. `apps/web/src/packages/api/graphql/auth.graphql` (+15 LOC)

### Documentation:
**Create:**
22. `docs/ADMIN_ROLES_GUIDE.md`
23. `docs/SYSTEM_SETTINGS_MIGRATION_GUIDE.md`

---

## ⚡ SUCCESS CRITERIA

### Functional Requirements:
- ✅ SUPER_ADMIN может назначать/отзывать любые роли
- ✅ ADMIN может управлять MODERATOR и SUPPORT ролями
- ✅ Permissions можно редактировать индивидуально
- ✅ System Settings хранятся в DB с шифрованием
- ✅ Redis кэширует настройки (TTL 5 мин)
- ✅ Sidebar показывает только доступные пункты меню
- ✅ Migration script успешно переносит .env → DB

### Non-Functional Requirements:
- ✅ Zero TypeScript compilation errors
- ✅ All tests pass (backend + frontend)
- ✅ GraphQL schema валидна
- ✅ Encrypted settings недоступны в plaintext
- ✅ Audit log записывает изменения ролей
- ✅ UI responsive и accessible

---

## 🚀 DEPLOYMENT CHECKLIST

### Pre-Deployment:
- [ ] Run migration script на staging
- [ ] Verify encrypted settings can be read
- [ ] Test role assignment flow
- [ ] Test permission-based navigation
- [ ] Backup existing .env file

### Deployment:
- [ ] Deploy backend with new resolvers
- [ ] Run migration script на production
- [ ] Deploy frontend with roles UI
- [ ] Verify Redis caching works
- [ ] Test critical flows

### Post-Deployment:
- [ ] Assign SUPER_ADMIN role to primary admin
- [ ] Test all permission levels
- [ ] Monitor Redis cache hit rate
- [ ] Document any issues

---

## 📊 ESTIMATED EFFORT

| Phase | Description | Estimated Hours |
|-------|-------------|----------------|
| 1 | Backend - Admin Roles API | 4-6 hours |
| 2 | Backend - Settings Migration | 3-4 hours |
| 3 | Frontend - Roles UI | 6-8 hours |
| 4 | Frontend - Settings UI | 4-5 hours |
| 5 | GraphQL Schema & Codegen | 2-3 hours |
| 6 | Permission-Based Navigation | 2-3 hours |
| 7 | Testing & Documentation | 3-4 hours |

**Total:** 24-33 hours (~3-4 days)

---

## 🔄 ROLLBACK PLAN

### If Migration Fails:
1. Restore .env file from backup
2. Revert services to read from .env
3. Clear SystemSettings table
4. Restart API server

### If Frontend Issues:
1. Hide /admin/roles route
2. Revert sidebar to show all items
3. Deploy previous frontend version

### Database Rollback:
```sql
-- Clear all admin roles (if needed)
DELETE FROM "AdminRole" WHERE role != 'SUPER_ADMIN';

-- Clear system settings (if needed)
DELETE FROM "SystemSettings";
```

---

## 📚 REFERENCES

### Existing Code:
- `apps/api/src/shared/constants/admin-permissions.ts` - All permissions
- `apps/api/src/shared/guards/permissions.guard.ts` - Permission checking
- `apps/api/src/modules/admin/services/system-settings.service.ts` - Settings CRUD
- `apps/api/src/shared/services/encryption.service.ts` - AES-256-GCM encryption
- `apps/web/src/packages/components/admin/admin-sidebar.tsx` - Sidebar with TODO

### Documentation:
- [ADMIN_PANEL_WEEK_1_COMPLETE.md](ADMIN_PANEL_WEEK_1_COMPLETE.md) - Week 1 implementation
- [ADMIN_PANEL_WEEK_2_TESTING.md](ADMIN_PANEL_WEEK_2_TESTING.md) - Week 2 completion
- [STAGE_9_PHASE_2_FINAL_STATUS.md](STAGE_9_PHASE_2_FINAL_STATUS.md) - Personnel analytics

---

**Дата создания:** 2025-12-18
**Автор:** Claude Code Assistant
**Статус:** 🔄 IN PROGRESS
