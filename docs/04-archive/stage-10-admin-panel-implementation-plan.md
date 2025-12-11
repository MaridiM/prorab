# План реализации: Этап 10 - Админ-панель (Admin Panel)

## Статус: 📋 ПЛАНИРУЕТСЯ

**Предыдущий этап:** Этап 9 (UX-полировка) завершён ✅
**Текущая задача:** Создать админ-панель для управления платформой ProRab.space
**Цель:** Инструменты для администрирования, мониторинга и поддержки пользователей
**Приоритет:** 🟡 Post-MVP (после коммерческого запуска)
**Оценка времени:** 3 недели (120-140 часов)
**Блокирует:** Масштабирование поддержки, аналитика бизнеса

---

## Бизнес-ценность

### 💰 Impact

**Проблема которую решаем:** "Как управлять растущей платформой без админ-панели?"

**Текущая ситуация:**
- Нет инструментов для управления пользователями
- Нет централизованной аналитики
- Невозможно отследить проблемы пользователей
- Нет системы поддержки
- Ручное управление подписками через БД
- Нет мониторинга здоровья системы

**После внедрения:**
- Централизованное управление пользователями и командами
- Real-time KPI метрики (DAU/MAU, MRR, Churn)
- Система тикетов для поддержки
- Управление подписками и платежами
- Аналитика использования функций
- Мониторинг здоровья системы
- Audit logs для всех действий админов

**Целевая аудитория админки:**
1. **Администраторы** - полный доступ ко всем функциям
2. **Модераторы** - управление контентом, поддержка
3. **Служба поддержки** - только тикеты и просмотр
4. **Продуктовая команда** - аналитика и метрики

---

## Текущее состояние

### ✅ Что уже есть:
- Database: User, Team, Project, Subscription, Payment models
- Backend: Все основные модули реализованы
- GraphQL API: Queries и mutations для бизнес-логики
- Frontend: Основное приложение работает

### ❌ Что нужно добавить:
- Database: Admin, AdminRole, SupportTicket, AdminActionLog models
- Backend: AdminModule с queries и mutations для всех сущностей
- Backend: Role-based access control (RBAC)
- Backend: Audit logging для админских действий
- Frontend: 11 страниц админ-панели
- Frontend: Компоненты для админки (таблицы, графики, формы)
- Integration: Отдельный роутинг `/admin/*`

---

## Критические решения

### 🔴 РЕШЕНИЕ #1: Авторизация администраторов

**Варианты:**
1. **Отдельная система auth** - админы входят на `/admin/login`
2. **Расширение User** - isAdmin флаг в существующей таблице
3. **Отдельная таблица Admin** - полная изоляция

**Выбор:** Расширение User + AdminRole table
**Обоснование:**
- ✅ Переиспользование auth системы (sessions, cookies)
- ✅ isAdmin Boolean флаг для быстрой проверки
- ✅ AdminRole для гибкого RBAC
- ✅ Админ может быть и пользователем (тестирование)
- ❌ Минус: админы и users в одной таблице

**Implementation:**
```prisma
model User {
  // ... existing fields
  isAdmin Boolean @default(false) @map("is_admin")
  adminRoleId String? @map("admin_role_id")
  adminRole AdminRole? @relation(fields: [adminRoleId], references: [id])
}
```

### 🔴 РЕШЕНИЕ #2: Role-Based Access Control

**Роли администраторов:**

| Роль | Права |
|------|-------|
| **SUPER_ADMIN** | Все права + управление админами |
| **ADMIN** | Управление users, teams, subscriptions, payments |
| **MODERATOR** | Управление контентом, поддержка |
| **SUPPORT** | Только просмотр + система тикетов |

**Permissions (детальные права):**
- `users.view`, `users.edit`, `users.block`
- `teams.view`, `teams.edit`, `teams.delete`
- `subscriptions.view`, `subscriptions.manage`
- `payments.view`, `payments.refund`
- `content.view`, `content.moderate`
- `support.view`, `support.respond`
- `analytics.view`
- `admins.manage`

### 🔴 РЕШЕНИЕ #3: Структура админки

**Выбор:** Отдельное Next.js App Router под `/admin`

**Структура роутинга:**
```
/admin/
  /login          - Авторизация (если не залогинен)
  /dashboard      - Главная (KPI + графики)
  /users          - Управление пользователями
  /teams          - Управление командами
  /projects       - Просмотр проектов
  /subscriptions  - Управление подписками
  /payments       - История платежей
  /analytics      - Аналитика и метрики
  /support        - Система тикетов
  /content        - Управление контентом
  /settings       - Настройки системы
  /logs           - Логи и мониторинг
  /admins         - Управление администраторами
```

---

## Архитектура решения

### 1. DATABASE SCHEMA

**Миграция:** `add_admin_panel_models`

#### AdminRole Model

```prisma
model AdminRole {
  id          String   @id @default(uuid())
  name        String   @unique @db.VarChar(50) // SUPER_ADMIN, ADMIN, MODERATOR, SUPPORT
  displayName String   @map("display_name") @db.VarChar(100)
  permissions String[] // Array of permission strings
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  // Relations
  users       User[]

  @@map("admin_roles")
}
```

#### SupportTicket Model

```prisma
model SupportTicket {
  id          String            @id @default(uuid())
  userId      String            @map("user_id")
  teamId      String?           @map("team_id")
  subject     String            @db.VarChar(200)
  description String            @db.Text
  status      SupportTicketStatus @default(OPEN)
  priority    SupportTicketPriority @default(MEDIUM)
  assignedToId String?          @map("assigned_to_id")
  resolvedAt  DateTime?         @map("resolved_at")
  createdAt   DateTime          @default(now()) @map("created_at")
  updatedAt   DateTime          @updatedAt @map("updated_at")

  // Relations
  user        User              @relation("UserTickets", fields: [userId], references: [id], onDelete: Cascade)
  team        Team?             @relation(fields: [teamId], references: [id], onDelete: SetNull)
  assignedTo  User?             @relation("AdminAssignedTickets", fields: [assignedToId], references: [id], onDelete: SetNull)
  messages    TicketMessage[]

  @@index([userId])
  @@index([status])
  @@index([assignedToId])
  @@index([createdAt])
  @@map("support_tickets")
}

enum SupportTicketStatus {
  OPEN
  IN_PROGRESS
  RESOLVED
  CLOSED
}

enum SupportTicketPriority {
  LOW
  MEDIUM
  HIGH
  CRITICAL
}

model TicketMessage {
  id        String   @id @default(uuid())
  ticketId  String   @map("ticket_id")
  userId    String   @map("user_id")
  message   String   @db.Text
  isInternal Boolean @default(false) @map("is_internal") // Internal note from admin
  createdAt DateTime @default(now()) @map("created_at")

  // Relations
  ticket    SupportTicket @relation(fields: [ticketId], references: [id], onDelete: Cascade)
  user      User          @relation(fields: [userId], references: [id])

  @@index([ticketId])
  @@index([createdAt])
  @@map("ticket_messages")
}
```

#### AdminActionLog Model

```prisma
model AdminActionLog {
  id          String   @id @default(uuid())
  adminId     String   @map("admin_id")
  action      String   @db.VarChar(100) // CREATE_USER, BLOCK_USER, CHANGE_PLAN, etc.
  entityType  String   @map("entity_type") @db.VarChar(50) // User, Team, Subscription, etc.
  entityId    String   @map("entity_id")
  changes     Json?    // { before: {...}, after: {...} }
  ipAddress   String?  @map("ip_address") @db.VarChar(45)
  userAgent   String?  @map("user_agent") @db.Text
  createdAt   DateTime @default(now()) @map("created_at")

  // Relations
  admin       User     @relation("AdminActions", fields: [adminId], references: [id])

  @@index([adminId])
  @@index([action])
  @@index([entityType])
  @@index([createdAt])
  @@map("admin_action_logs")
}
```

#### User Model Updates

```prisma
model User {
  // ... existing fields

  // Admin fields
  isAdmin      Boolean    @default(false) @map("is_admin")
  adminRoleId  String?    @map("admin_role_id")

  // Relations
  adminRole    AdminRole? @relation(fields: [adminRoleId], references: [id])
  supportTickets SupportTicket[] @relation("UserTickets")
  assignedTickets SupportTicket[] @relation("AdminAssignedTickets")
  ticketMessages TicketMessage[]
  adminActions AdminActionLog[] @relation("AdminActions")
}
```

---

### 2. BACKEND API

#### 2.1. Module Structure

```
apps/api/src/modules/
├── admin/
│   ├── users/
│   │   ├── admin-users.service.ts
│   │   ├── admin-users.resolver.ts
│   │   └── dto/
│   ├── teams/
│   │   ├── admin-teams.service.ts
│   │   ├── admin-teams.resolver.ts
│   │   └── dto/
│   ├── subscriptions/
│   │   ├── admin-subscriptions.service.ts
│   │   ├── admin-subscriptions.resolver.ts
│   │   └── dto/
│   ├── analytics/
│   │   ├── admin-analytics.service.ts
│   │   ├── admin-analytics.resolver.ts
│   │   └── dto/
│   ├── support/
│   │   ├── support-tickets.service.ts
│   │   ├── support-tickets.resolver.ts
│   │   └── dto/
│   ├── guards/
│   │   ├── admin.guard.ts
│   │   ├── admin-role.guard.ts
│   │   └── permissions.guard.ts
│   ├── decorators/
│   │   ├── admin.decorator.ts
│   │   └── requires-permission.decorator.ts
│   └── admin.module.ts
```

#### 2.2. Admin Guards

**AdminGuard:**
```typescript
@Injectable()
export class AdminGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const ctx = GqlExecutionContext.create(context);
    const { user } = ctx.getContext().req;

    if (!user) {
      throw new UnauthorizedException('Authentication required');
    }

    if (!user.isAdmin) {
      throw new ForbiddenException('Admin access required');
    }

    return true;
  }
}
```

**PermissionsGuard:**
```typescript
@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.get<string[]>(
      'permissions',
      context.getHandler(),
    );

    if (!requiredPermissions) {
      return true;
    }

    const ctx = GqlExecutionContext.create(context);
    const { user } = ctx.getContext().req;

    const hasPermission = requiredPermissions.every((permission) =>
      user.adminRole?.permissions.includes(permission),
    );

    if (!hasPermission) {
      throw new ForbiddenException('Insufficient permissions');
    }

    return true;
  }
}
```

**Decorator:**
```typescript
export const RequiresPermission = (...permissions: string[]) =>
  SetMetadata('permissions', permissions);

// Usage:
@Query(() => [User])
@UseGuards(AdminGuard, PermissionsGuard)
@RequiresPermission('users.view')
async adminUsers() { ... }
```

#### 2.3. AdminUsersResolver (Sample)

```typescript
@Resolver(() => User)
@UseGuards(AdminGuard)
export class AdminUsersResolver {
  constructor(
    private adminUsersService: AdminUsersService,
    private auditService: AuditService,
  ) {}

  @Query(() => AdminUsersConnection)
  @RequiresPermission('users.view')
  async adminUsers(
    @Args('filters', { nullable: true }) filters: AdminUserFilters,
    @Args('pagination') pagination: PaginationInput,
  ): Promise<AdminUsersConnection> {
    return this.adminUsersService.findAll(filters, pagination);
  }

  @Query(() => AdminUserDetails)
  @RequiresPermission('users.view')
  async adminUser(@Args('id') id: string): Promise<AdminUserDetails> {
    return this.adminUsersService.findById(id);
  }

  @Mutation(() => User)
  @RequiresPermission('users.edit')
  async adminUpdateUser(
    @Args('id') id: string,
    @Args('input') input: AdminUpdateUserInput,
    @CurrentUser() admin: User,
  ): Promise<User> {
    const result = await this.adminUsersService.update(id, input);

    // Audit log
    await this.auditService.log({
      adminId: admin.id,
      action: 'UPDATE_USER',
      entityType: 'User',
      entityId: id,
      changes: { before: result.before, after: result.after },
    });

    return result.user;
  }

  @Mutation(() => User)
  @RequiresPermission('users.block')
  async adminBlockUser(
    @Args('id') id: string,
    @Args('reason', { nullable: true }) reason: string,
    @CurrentUser() admin: User,
  ): Promise<User> {
    const user = await this.adminUsersService.block(id, reason);

    await this.auditService.log({
      adminId: admin.id,
      action: 'BLOCK_USER',
      entityType: 'User',
      entityId: id,
      changes: { reason },
    });

    return user;
  }

  @Mutation(() => User)
  @RequiresPermission('users.block')
  async adminUnblockUser(
    @Args('id') id: string,
    @CurrentUser() admin: User,
  ): Promise<User> {
    const user = await this.adminUsersService.unblock(id);

    await this.auditService.log({
      adminId: admin.id,
      action: 'UNBLOCK_USER',
      entityType: 'User',
      entityId: id,
    });

    return user;
  }
}
```

#### 2.4. AdminAnalyticsService (Sample)

```typescript
@Injectable()
export class AdminAnalyticsService {
  constructor(private prisma: PrismaService) {}

  async getDashboardStats(period: DateRangeInput) {
    const { start, end } = this.parsePeriod(period);

    const [
      totalUsers,
      activeUsers,
      totalTeams,
      activeTeams,
      totalProjects,
      mrr,
      arr,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({
        where: { lastLoginAt: { gte: subDays(new Date(), 30) } },
      }),
      this.prisma.team.count(),
      this.prisma.team.count({
        where: {
          subscription: { status: SubscriptionStatus.ACTIVE },
        },
      }),
      this.prisma.project.count({
        where: { status: ProjectStatus.ACTIVE },
      }),
      this.calculateMRR(),
      this.calculateARR(),
    ]);

    return {
      users: { total: totalUsers, active: activeUsers },
      teams: { total: totalTeams, active: activeTeams },
      projects: { total: totalProjects },
      revenue: { mrr, arr },
    };
  }

  async getRegistrationsChart(period: DateRangeInput) {
    // Group by day/week/month
    const registrations = await this.prisma.user.groupBy({
      by: ['createdAt'],
      where: {
        createdAt: { gte: period.start, lte: period.end },
      },
      _count: true,
    });

    return this.formatChartData(registrations);
  }

  private async calculateMRR() {
    const subscriptions = await this.prisma.subscription.findMany({
      where: { status: SubscriptionStatus.ACTIVE },
      include: { payments: { take: 1, orderBy: { createdAt: 'desc' } } },
    });

    return subscriptions.reduce((sum, sub) => {
      const lastPayment = sub.payments[0];
      return sum + (lastPayment?.amount.toNumber() || 0);
    }, 0);
  }

  private calculateARR() {
    return this.calculateMRR().then(mrr => mrr * 12);
  }
}
```

---

### 3. FRONTEND IMPLEMENTATION

#### 3.1. Admin Layout

```typescript
// apps/web/src/app/admin/layout.tsx

export default async function AdminLayout({ children }: LayoutProps) {
  const user = await getUser(); // Server component

  if (!user?.isAdmin) {
    redirect('/dashboard');
  }

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <AdminSidebar user={user} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader user={user} />
        <main className="flex-1 overflow-y-auto p-8 bg-muted/20">
          {children}
        </main>
      </div>
    </div>
  );
}
```

**AdminSidebar:**
```typescript
const ADMIN_NAV = [
  { href: '/admin/dashboard', label: 'Дашборд', icon: LayoutDashboard },
  { href: '/admin/users', label: 'Пользователи', icon: Users },
  { href: '/admin/teams', label: 'Команды', icon: Building2 },
  { href: '/admin/subscriptions', label: 'Подписки', icon: CreditCard },
  { href: '/admin/payments', label: 'Платежи', icon: Receipt },
  { href: '/admin/analytics', label: 'Аналитика', icon: BarChart3 },
  { href: '/admin/support', label: 'Поддержка', icon: MessageSquare },
  { href: '/admin/content', label: 'Контент', icon: FileText },
  { href: '/admin/settings', label: 'Настройки', icon: Settings },
  { href: '/admin/logs', label: 'Логи', icon: ScrollText },
];
```

#### 3.2. Dashboard Page

```typescript
// apps/web/src/app/admin/dashboard/page.tsx

export default async function AdminDashboardPage() {
  const stats = await getAdminStats();

  return (
    <div className="space-y-8">
      {/* KPI Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="Всего пользователей"
          value={stats.users.total}
          change="+12% за месяц"
          icon={Users}
        />
        <KPICard
          title="Активные команды"
          value={stats.teams.active}
          change="+8% за месяц"
          icon={Building2}
        />
        <KPICard
          title="MRR"
          value={formatCurrency(stats.revenue.mrr)}
          change="+15% за месяц"
          icon={TrendingUp}
        />
        <KPICard
          title="Активные проекты"
          value={stats.projects.total}
          change="+20% за месяц"
          icon={Folder}
        />
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Регистрации</h3>
          <LineChart data={stats.registrations} />
        </Card>
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Рост MRR</h3>
          <LineChart data={stats.mrrGrowth} />
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Последние события</h3>
        <RecentActivityList activities={stats.recentActivities} />
      </Card>
    </div>
  );
}
```

#### 3.3. Users Management Page

```typescript
// apps/web/src/app/admin/users/page.tsx

export default function AdminUsersPage() {
  const [filters, setFilters] = useState<AdminUserFilters>({});
  const { data, loading } = useQuery(ADMIN_USERS_QUERY, {
    variables: { filters, pagination: { page: 1, limit: 50 } },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Пользователи</h1>
        <Button onClick={() => setShowFilters(!showFilters)}>
          <Filter className="mr-2 h-4 w-4" />
          Фильтры
        </Button>
      </div>

      {/* Filters */}
      {showFilters && (
        <Card className="p-6">
          <AdminUsersFilters filters={filters} onChange={setFilters} />
        </Card>
      )}

      {/* Users Table */}
      <Card>
        <DataTable
          columns={USER_COLUMNS}
          data={data?.adminUsers.nodes || []}
          loading={loading}
          pagination={data?.adminUsers.pageInfo}
          onRowClick={(user) => router.push(`/admin/users/${user.id}`)}
        />
      </Card>
    </div>
  );
}

const USER_COLUMNS: ColumnDef<User>[] = [
  {
    accessorKey: 'email',
    header: 'Email',
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <Avatar src={row.original.avatarUrl} size="sm" />
        <div>
          <div className="font-medium">{row.original.email}</div>
          <div className="text-xs text-muted-foreground">
            {row.original.fullName}
          </div>
        </div>
      </div>
    ),
  },
  {
    accessorKey: 'emailVerified',
    header: 'Статус',
    cell: ({ row }) => (
      <Badge variant={row.original.emailVerified ? 'success' : 'secondary'}>
        {row.original.emailVerified ? 'Подтверждён' : 'Не подтверждён'}
      </Badge>
    ),
  },
  {
    accessorKey: 'createdAt',
    header: 'Дата регистрации',
    cell: ({ row }) => format(row.original.createdAt, 'dd.MM.yyyy HH:mm'),
  },
  {
    accessorKey: 'lastLoginAt',
    header: 'Последний вход',
    cell: ({ row }) =>
      row.original.lastLoginAt
        ? formatDistanceToNow(row.original.lastLoginAt, { locale: ru })
        : 'Никогда',
  },
  {
    id: 'actions',
    cell: ({ row }) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => router.push(`/admin/users/${row.original.id}`)}>
            <Eye className="mr-2 h-4 w-4" />
            Просмотр
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Edit className="mr-2 h-4 w-4" />
            Редактировать
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="text-destructive">
            <Ban className="mr-2 h-4 w-4" />
            Заблокировать
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
];
```

#### 3.4. UI Components for Admin

**DataTable (generic):**
- Pagination
- Sorting
- Row selection
- Loading states
- Empty states

**KPICard:**
- Value display
- Change indicator (+/- %)
- Icon
- Sparkline (optional)

**Charts:**
- LineChart (registrations, MRR)
- BarChart (distributions)
- PieChart (plan breakdown)
- Using recharts library

**Filters:**
- DateRangePicker
- MultiSelect
- SearchInput
- StatusSelect

---

## Пошаговая реализация

### Phase 1: Foundation (Days 1-3)

**День 1: Database & Auth**
- [ ] Обновить Prisma schema (AdminRole, SupportTicket, AdminActionLog)
- [ ] Добавить isAdmin, adminRoleId в User
- [ ] Создать миграцию `add_admin_panel_models`
- [ ] Выполнить prisma db push и generate
- [ ] Seed admin roles (SUPER_ADMIN, ADMIN, MODERATOR, SUPPORT)

**День 2: Admin Guards & Decorators**
- [ ] Создать AdminGuard
- [ ] Создать PermissionsGuard
- [ ] Создать @RequiresPermission decorator
- [ ] Создать AuditService для логирования
- [ ] Тестирование guards

**День 3: Admin Module Structure**
- [ ] Создать apps/api/src/modules/admin/
- [ ] Создать AdminModule
- [ ] Настроить роутинг для админ-панели
- [ ] Добавить в app.module.ts

### Phase 2: Core Admin Resolvers (Days 4-8)

**День 4: AdminUsersResolver**
- [ ] Создать AdminUsersService (10 методов)
- [ ] Создать AdminUsersResolver (8 queries + 7 mutations)
- [ ] DTOs для admin users operations
- [ ] Audit logging integration

**День 5: AdminTeamsResolver**
- [ ] Создать AdminTeamsService
- [ ] Создать AdminTeamsResolver
- [ ] DTOs для admin teams operations
- [ ] Team stats calculation

**День 6: AdminSubscriptionsResolver**
- [ ] Создать AdminSubscriptionsService
- [ ] Создать AdminSubscriptionsResolver
- [ ] DTOs для subscription management
- [ ] Manual subscription operations

**День 7: AdminAnalyticsResolver**
- [ ] Создать AdminAnalyticsService
- [ ] Dashboard stats calculation
- [ ] Chart data aggregation (registrations, MRR, DAU/MAU)
- [ ] AdminAnalyticsResolver

**День 8: SupportTicketsResolver**
- [ ] Создать SupportTicketsService
- [ ] Создать SupportTicketsResolver
- [ ] Ticket creation, assignment, resolution
- [ ] TicketMessage CRUD

### Phase 3: Frontend Foundation (Days 9-12)

**День 9: Admin Layout & Auth**
- [ ] Создать /admin layout.tsx
- [ ] AdminSidebar component
- [ ] AdminHeader component
- [ ] Admin auth middleware
- [ ] Admin login page (if separate)

**День 10: Dashboard Page**
- [ ] GraphQL: AdminDashboardStats query
- [ ] KPICard component
- [ ] Charts integration (recharts)
- [ ] RecentActivity component
- [ ] Dashboard page implementation

**День 11: Users Page**
- [ ] GraphQL: AdminUsers query + mutations
- [ ] DataTable component (generic)
- [ ] AdminUsersFilters component
- [ ] Users list page
- [ ] User details page (basic)

**День 12: Teams & Projects Pages**
- [ ] GraphQL: AdminTeams operations
- [ ] Teams list page
- [ ] Team details page
- [ ] Projects list page (admin view)
- [ ] Project details page (admin view)

### Phase 4: Additional Pages (Days 13-16)

**День 13: Subscriptions & Payments**
- [ ] Subscriptions list page
- [ ] Subscription details page
- [ ] Payments list page
- [ ] Payment details page
- [ ] Manual actions (extend, cancel, refund)

**День 14: Support System**
- [ ] Support tickets list page
- [ ] Ticket details page
- [ ] TicketMessage component
- [ ] Reply functionality
- [ ] Status & priority management

**День 15: Analytics Page**
- [ ] Analytics dashboard
- [ ] Custom date range picker
- [ ] Multiple chart types
- [ ] Export functionality (CSV)

**День 16: Content & Settings**
- [ ] Content management page (photo reports)
- [ ] System settings page
- [ ] Plan configuration
- [ ] Email templates editor (basic)

### Phase 5: Polish & Testing (Days 17-21)

**День 17: Logs & Monitoring**
- [ ] Admin action logs page
- [ ] System logs viewer
- [ ] Monitoring dashboard (services status)
- [ ] GraphQL: AdminLogs query

**День 18: Admin Management**
- [ ] Admins list page
- [ ] Create/Edit admin
- [ ] Role assignment
- [ ] Permissions matrix UI

**День 19: UI Polish**
- [ ] Consistent styling
- [ ] Responsive design check
- [ ] Loading states
- [ ] Error handling
- [ ] Toast notifications

**День 20: Testing**
- [ ] Manual testing всех страниц
- [ ] Permission testing (разные роли)
- [ ] Audit log verification
- [ ] Performance testing

**День 21: Documentation**
- [ ] Admin guide документация
- [ ] API documentation updates
- [ ] CHANGELOG.md
- [ ] Roadmap.md updates

---

## Критические файлы

### Backend (60+ new + 3 modifications)

**New Files (60+):**
- apps/api/prisma/schema.prisma (AdminRole, SupportTicket, AdminActionLog)
- apps/api/src/modules/admin/ (60+ файлов across 8 submodules)
  - guards/ (3 файла)
  - decorators/ (2 файла)
  - users/ (10 файлов)
  - teams/ (10 файлов)
  - subscriptions/ (8 файлов)
  - analytics/ (8 файлов)
  - support/ (10 файлов)
  - content/ (5 файлов)
  - audit/ (5 файлов)

**Modifications (3):**
- apps/api/src/app.module.ts (import AdminModule)
- apps/api/src/auth/auth.service.ts (check isAdmin)

### Frontend (45+ new + 5 modifications)

**New Files (45+):**
- apps/web/src/app/admin/ (45+ файлов)
  - layout.tsx
  - dashboard/page.tsx
  - users/ (5 файлов)
  - teams/ (4 файла)
  - subscriptions/ (3 файла)
  - payments/ (3 файла)
  - analytics/ (2 файла)
  - support/ (5 файлов)
  - content/ (3 файла)
  - settings/ (3 файла)
  - logs/ (3 файла)
  - admins/ (3 файла)
- apps/web/src/packages/components/admin/ (15+ компонентов)
  - AdminSidebar.tsx
  - AdminHeader.tsx
  - DataTable.tsx
  - KPICard.tsx
  - Charts/ (5 типов)
  - Filters/ (4 компонента)
- apps/web/src/packages/api/graphql/admin.graphql

**Modifications (5):**
- apps/web/src/middleware.ts (admin route protection)
- apps/web/src/packages/components/index.ts (exports)

---

## Success Criteria

### Must Have (MVP Admin Panel)
- [ ] 11 основных страниц реализованы
- [ ] RBAC работает (4 роли, permissions)
- [ ] Dashboard с KPI метриками
- [ ] Users management (просмотр, редактирование, блокировка)
- [ ] Teams management (просмотр, изменение тарифа)
- [ ] Subscriptions management (продление, отмена)
- [ ] Support tickets system (create, assign, resolve)
- [ ] Audit logging для всех админских действий
- [ ] Analytics charts (registrations, MRR, DAU/MAU)
- [ ] TypeScript: 0 ошибок
- [ ] Permission testing пройден

### Nice to Have (Phase 2)
- [ ] Advanced analytics (cohort analysis, retention)
- [ ] Email notifications to admins
- [ ] Bulk operations (mass update, mass delete)
- [ ] Export to CSV/Excel
- [ ] Advanced search (full-text)
- [ ] Custom dashboards per role
- [ ] Dark mode для админки
- [ ] Mobile-optimized admin panel

---

## Risks & Mitigation

### 🔴 Высокий риск: Security Vulnerabilities

**Проблема:** Админ-панель - критическая точка безопасности
**Митигация:**
- Строгие permission checks на всех endpoints
- Audit logging для всех действий
- Rate limiting на admin endpoints
- 2FA для super admins (future)
- IP whitelist (future)

### 🟡 Средний риск: Performance на больших данных

**Проблема:** Таблицы с тысячами записей
**Митигация:**
- Pagination everywhere
- Indexes на все filter fields
- Lazy loading для heavy queries
- Background jobs для reports

---

## Технический долг

**Отложено на Phase 2:**
- [ ] 2FA для администраторов
- [ ] IP whitelist
- [ ] Advanced audit log search
- [ ] Real-time notifications (websockets)
- [ ] Scheduled reports (email)
- [ ] Data export в различных форматах
- [ ] Bulk operations UI
- [ ] Custom dashboard builder

---

## Документация

**Будет создано:**
- [ ] docs/analisys/stage-10-admin-panel-implementation-plan.md (этот файл)
- [ ] docs/admin/admin-guide.md
- [ ] docs/admin/permissions-matrix.md
- [ ] docs/admin/audit-logging.md

**Будет обновлено:**
- [ ] docs/roadmap.md (mark Stage 10 complete)
- [ ] CHANGELOG.md (Stage 10 section)
- [ ] API documentation (admin endpoints)

---

**Plan Created:** 2025-12-11
**Planned Start:** После Stage 8 и Stage 9
**Estimated Duration:** 21 день (120-140 часов)
**Priority:** 🟡 Post-MVP
**Status:** 📋 Planning

---

_Детальный план готов к выполнению. Ожидает завершения коммерческого запуска для начала реализации._
