# Stage 16: Advanced Team & Role Management

**Статус:** 🚧 В РАЗРАБОТКЕ
**Начало:** 2025-12-20
**Версия:** v1.1.0

---

## Обзор

Stage 16 расширяет административную панель продвинутыми возможностями управления командами: аналитика команд, кастомные роли с визуальным редактором, массовые операции с участниками, система коммуникаций, и инструменты аудита/комплаенса.

**Оценка объёма:** ~50 файлов, ~8,000-10,000 LOC
**Длительность:** Days 8-14 (7 дней)

---

## Прогресс по дням

| День | Функционал | Статус | LOC | Файлов |
|------|------------|--------|-----|--------|
| Day 8 | Team Analytics Dashboard | ✅ Завершено | 1,315 | 9 |
| Day 9 | Role & Permission Builder | ✅ Завершено | 1,970 | 11 |
| Day 10 | Team Member Management | ✅ Завершено | 1,440 | 8 |
| Day 11 | Team Communication Tools | ✅ Завершено | 1,535 | 9 |
| Day 12 | Advanced Team Features | ✅ Завершено | 1,955 | 10 |
| Day 13 | Team Audit & Compliance | ✅ Завершено | 1,320 | 6 |
| Day 14 | Integration & Polish | ⏳ Ожидает | 0 | 0 |

**Общий прогресс: 86% (6/7 дней) | 9,535 LOC | 53 файлов**

---

## Day 8: Team Analytics Dashboard

### Цель
Создать выделенный дашборд аналитики для индивидуальных команд с графиками роста, метриками активности участников и использованием хранилища.

### Файлы для создания

**Backend:**
- [x] `apps/api/src/modules/admin/models/admin-team-analytics.model.ts` ✅
- [x] `apps/api/src/modules/admin/services/admin-team-analytics.service.ts` ✅
- [x] `apps/api/src/modules/admin/resolvers/admin-team-analytics.resolver.ts` ✅

**Frontend:**
- [x] `apps/web/src/app/(root)/(protected)/admin/teams/[teamId]/analytics/page.tsx` ✅
- [x] `apps/web/src/packages/components/admin/team-analytics/TeamGrowthChart.tsx` ✅
- [x] `apps/web/src/packages/components/admin/team-analytics/MemberActivityTable.tsx` ✅
- [x] `apps/web/src/packages/components/admin/team-analytics/TeamCompositionCharts.tsx` ✅
- [x] `apps/web/src/packages/components/admin/team-analytics/StorageUsageCard.tsx` ✅
- [x] `apps/web/src/packages/api/graphql/admin/admin-team-analytics.graphql` ✅

### GraphQL Schema

```graphql
type TeamGrowthChart {
  labels: [String!]!
  memberData: [Int!]!
  projectData: [Int!]!
}

type MemberActivity {
  userId: String!
  userName: String!
  avatarUrl: String
  actionsCount: Int!
  lastActiveAt: DateTime
  hoursLogged: Float!
  projectsCount: Int!
}

type RoleCount {
  role: String!
  count: Int!
}

type PositionCount {
  position: String!
  count: Int!
}

type SalaryDistribution {
  fixed: Int!
  percentage: Int!
  none: Int!
  totalAmount: Float!
}

type TeamComposition {
  byRole: [RoleCount!]!
  byPosition: [PositionCount!]!
  salaryDistribution: SalaryDistribution!
}

type ProjectStorageUsage {
  projectId: String!
  projectName: String!
  usedBytes: Float!
  filesCount: Int!
}

type TeamStorageUsage {
  totalBytes: Float!
  usedBytes: Float!
  usedPercentage: Float!
  byProject: [ProjectStorageUsage!]!
}

type TeamKPIs {
  memberRetention: Float!
  projectCompletionRate: Float!
  avgProjectDurationDays: Int!
  totalRevenue: Float!
  activeProjectsCount: Int!
  completedProjectsCount: Int!
}

extend type Query {
  adminTeamGrowthChart(teamId: String!, months: Int = 12): TeamGrowthChart!
  adminTeamMemberActivity(teamId: String!): [MemberActivity!]!
  adminTeamComposition(teamId: String!): TeamComposition!
  adminTeamStorageUsage(teamId: String!): TeamStorageUsage!
  adminTeamKPIs(teamId: String!): TeamKPIs!
}
```

### Методы сервиса

```typescript
// admin-team-analytics.service.ts
- getTeamGrowthChart(teamId: string, months: number): Promise<TeamGrowthChart>
- getMemberActivityMetrics(teamId: string): Promise<MemberActivity[]>
- getTeamComposition(teamId: string): Promise<TeamComposition>
- getStorageUsageByTeam(teamId: string): Promise<TeamStorageUsage>
- getTeamKPIs(teamId: string): Promise<TeamKPIs>
```

---

## Day 9: Role & Permission Builder

### Цель
Визуальный редактор разрешений для кастомных ролей на уровне команды с иерархией и наследованием.

### Изменения схемы БД

```prisma
model CustomRole {
  id           String   @id @default(uuid())
  teamId       String   @map("team_id")
  name         String
  description  String?
  permissions  String[] // Массив строк разрешений
  parentRoleId String?  @map("parent_role_id")
  color        String?
  icon         String?
  priority     Int      @default(0)
  isSystemRole Boolean  @default(false)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  team       Team        @relation(fields: [teamId], references: [id], onDelete: Cascade)
  parentRole CustomRole? @relation("RoleHierarchy", fields: [parentRoleId], references: [id])
  childRoles CustomRole[] @relation("RoleHierarchy")

  @@unique([teamId, name])
  @@map("custom_roles")
}
```

### Файлы для создания

**Prisma Schema:**
- [x] `CustomRole` model - Пользовательские роли с иерархией ✅
- [x] `RoleAssignmentHistory` model - История назначения ролей ✅
- [x] `TeamMember.customRoleId` - Связь участника с ролью ✅

**Backend:**
- [x] `apps/api/src/shared/constants/team-permissions.ts` ✅
- [x] `apps/api/src/modules/admin/models/admin-role-builder.model.ts` ✅
- [x] `apps/api/src/modules/admin/services/admin-role-builder.service.ts` ✅
- [x] `apps/api/src/modules/admin/resolvers/admin-role-builder.resolver.ts` ✅

**Frontend:**
- [x] `apps/web/src/app/(root)/(protected)/admin/teams/[teamId]/roles/page.tsx` ✅
- [x] `apps/web/src/packages/components/admin/role-builder/RoleList.tsx` ✅
- [x] `apps/web/src/packages/components/admin/role-builder/RoleHierarchyTree.tsx` ✅
- [x] `apps/web/src/packages/components/admin/role-builder/PermissionEditor.tsx` ✅
- [x] `apps/web/src/packages/components/admin/role-builder/RoleFormDialog.tsx` ✅
- [x] `apps/web/src/packages/components/admin/role-builder/index.ts` ✅
- [x] `apps/web/src/packages/api/graphql/admin/admin-role-builder.graphql` ✅

---

## Day 10: Team Member Management

### Цель
Массовые операции с участниками, назначение ролей, расширенная фильтрация и история активности.

### Файлы для создания

**Backend:**
- [ ] `apps/api/src/modules/admin/services/admin-team-members.service.ts`
- [ ] `apps/api/src/modules/admin/resolvers/admin-team-members.resolver.ts`
- [ ] `apps/api/src/modules/admin/dto/admin-team-members.input.ts`

**Frontend:**
- [ ] `apps/web/src/app/(root)/(protected)/admin/teams/[teamId]/members/page.tsx`
- [ ] `apps/web/src/packages/components/admin/team-members/MemberTable.tsx`
- [ ] `apps/web/src/packages/components/admin/team-members/BulkActionsToolbar.tsx`
- [ ] `apps/web/src/packages/components/admin/team-members/MemberFilters.tsx`
- [ ] `apps/web/src/packages/components/admin/team-members/MemberDetailPanel.tsx`
- [ ] `apps/web/src/packages/components/admin/team-members/ActivityTimeline.tsx`
- [ ] `apps/web/src/packages/api/graphql/admin/admin-team-members.graphql`

### Методы сервиса

```typescript
- bulkUpdateMembers(teamId, memberIds, updates): Promise<BulkResult>
- bulkRemoveMembers(teamId, memberIds): Promise<BulkResult>
- bulkAssignRole(teamId, memberIds, roleId): Promise<BulkResult>
- getMemberActivityHistory(memberId, pagination): Promise<ActivityConnection>
- exportMembers(teamId, format): Promise<string>
- transferMemberToTeam(memberId, targetTeamId): Promise<TeamMember>
```

---

## Day 11: Team Communication Tools

### Цель
Система объявлений, уведомления команды, рассылки от администратора и управление шаблонами.

### Изменения схемы БД

```prisma
model TeamAnnouncement {
  id          String   @id @default(uuid())
  teamId      String?  @map("team_id") // null = глобальное
  title       String
  content     String   @db.Text
  priority    AnnouncementPriority @default(NORMAL)
  type        AnnouncementType @default(INFO)
  isPinned    Boolean  @default(false)
  expiresAt   DateTime?
  publishedAt DateTime?
  createdById String
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  team      Team? @relation(fields: [teamId], references: [id], onDelete: Cascade)
  createdBy User  @relation(fields: [createdById], references: [id])
  readBy    AnnouncementRead[]

  @@map("team_announcements")
}

model AnnouncementRead {
  id             String   @id @default(uuid())
  announcementId String
  userId         String
  readAt         DateTime @default(now())

  announcement TeamAnnouncement @relation(fields: [announcementId], references: [id], onDelete: Cascade)
  user         User             @relation(fields: [userId], references: [id])

  @@unique([announcementId, userId])
  @@map("announcement_reads")
}

model NotificationTemplate {
  id        String   @id @default(uuid())
  slug      String   @unique
  name      String
  subject   String?
  content   String   @db.Text
  channels  String[] // ["email", "push", "telegram"]
  variables Json
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("notification_templates")
}

enum AnnouncementPriority {
  LOW
  NORMAL
  HIGH
  URGENT
}

enum AnnouncementType {
  INFO
  WARNING
  SUCCESS
  ERROR
}
```

### Файлы для создания

**Prisma Schema:**
- [x] `TeamAnnouncement` model ✅
- [x] `AnnouncementRead` model ✅
- [x] `AnnouncementPriority` enum (LOW, NORMAL, HIGH, URGENT) ✅
- [x] `AnnouncementType` enum (INFO, WARNING, SUCCESS, ERROR, MAINTENANCE) ✅

**Backend:**
- [x] `apps/api/src/modules/admin/models/admin-communications.model.ts` ✅
- [x] `apps/api/src/modules/admin/services/admin-communications.service.ts` ✅
- [x] `apps/api/src/modules/admin/resolvers/admin-communications.resolver.ts` ✅

**Frontend:**
- [x] `apps/web/src/app/(root)/(protected)/admin/communications/page.tsx` ✅
- [x] `apps/web/src/packages/components/admin/communications/AnnouncementList.tsx` ✅
- [x] `apps/web/src/packages/components/admin/communications/AnnouncementFilters.tsx` ✅
- [x] `apps/web/src/packages/components/admin/communications/AnnouncementFormDialog.tsx` ✅
- [x] `apps/web/src/packages/components/admin/communications/index.ts` ✅
- [x] `apps/web/src/packages/api/graphql/admin/admin-communications.graphql` ✅

### Реализованный функционал

**Backend (3 файлов, ~620 LOC):**
- 9 методов сервиса:
  - `getAnnouncements(filter?)` - Список с фильтрацией
  - `getAnnouncementById(id)` - Получение одного
  - `createAnnouncement(input, userId)` - Создание с опцией немедленной публикации
  - `updateAnnouncement(input)` - Обновление
  - `deleteAnnouncement(id)` - Удаление
  - `publishAnnouncement(id)` - Публикация
  - `unpublishAnnouncement(id)` - Снятие с публикации
  - `markAsRead(announcementId, userId)` - Отметка о прочтении
  - `getAnnouncementStatistics(teamId?)` - Статистика
- GraphQL resolver с 3 queries и 6 mutations
- Поддержка глобальных (teamId = null) и командных объявлений
- Отслеживание прочтений с уникальным constraint

**Frontend (5 файлов, ~740 LOC):**
- Страница управления с фильтрами и статистикой
- Список объявлений с badges для приоритетов, типов и статусов
- Форма создания/редактирования с валидацией
- Фильтры (publishedOnly, pinnedOnly, activeOnly)
- Действия: publish, unpublish, edit, delete
- Цветовая маркировка по приоритетам и типам
- Отображение прогресса прочтений (readCount / totalMembers)

**Ключевые возможности:**
- ✅ 4 уровня приоритета (LOW, NORMAL, HIGH, URGENT)
- ✅ 5 типов объявлений (INFO, WARNING, SUCCESS, ERROR, MAINTENANCE)
- ✅ Закрепление (pinning) объявлений
- ✅ Даты истечения с автоматической пометкой
- ✅ Черновики и публикация
- ✅ Tracking прочтений по пользователям
- ✅ Статистика (total, published, drafts, pinned, expired, breakdown по приоритетам)
- ✅ Расширенная фильтрация

---

## Day 12: Advanced Team Features

### Цель
Объединение команд, клонирование, шаблоны команд и массовая конфигурация.

### Изменения схемы БД

```prisma
model TeamTemplate {
  id          String   @id @default(uuid())
  name        String
  description String?
  settings    Json
  roles       Json     // Дефолтные кастомные роли
  projectSetup Json?
  isPublic    Boolean  @default(false)
  createdById String
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  createdBy User @relation(fields: [createdById], references: [id])

  @@map("team_templates")
}

model TeamMergeLog {
  id            String   @id @default(uuid())
  sourceTeamId  String
  targetTeamId  String
  mergedById    String
  membersMoved  Int
  projectsMoved Int
  dataSnapshot  Json
  createdAt     DateTime @default(now())

  @@map("team_merge_logs")
}
```

### Файлы для создания

**Backend:**
- [ ] `apps/api/src/modules/admin/services/admin-team-operations.service.ts`
- [ ] `apps/api/src/modules/admin/resolvers/admin-team-operations.resolver.ts`

**Frontend:**
- [ ] `apps/web/src/app/(root)/(protected)/admin/teams/operations/page.tsx`
- [ ] `apps/web/src/packages/components/admin/team-operations/MergeTeamsWizard.tsx`
- [ ] `apps/web/src/packages/components/admin/team-operations/CloneTeamDialog.tsx`
- [ ] `apps/web/src/packages/components/admin/team-operations/TemplateGallery.tsx`
- [ ] `apps/web/src/packages/components/admin/team-operations/TemplateEditor.tsx`
- [ ] `apps/web/src/packages/components/admin/team-operations/MergePreview.tsx`
- [ ] `apps/web/src/packages/api/graphql/admin/admin-team-operations.graphql`

---

## Day 13: Team Audit & Compliance

### Цель
Логи аудита команды, отчёты соответствия, политики хранения данных, экспорт GDPR.

### Изменения схемы БД

```prisma
model TeamAuditLog {
  id         String   @id @default(uuid())
  teamId     String
  userId     String?
  action     String
  category   AuditCategory
  resource   String
  resourceId String?
  oldValue   Json?
  newValue   Json?
  ipAddress  String?
  userAgent  String?
  metadata   Json?
  createdAt  DateTime @default(now())

  team Team  @relation(fields: [teamId], references: [id], onDelete: Cascade)
  user User? @relation(fields: [userId], references: [id])

  @@index([teamId, createdAt])
  @@map("team_audit_logs")
}

model DataRetentionPolicy {
  id           String   @id @default(uuid())
  teamId       String?
  resourceType String
  retentionDays Int
  isActive     Boolean  @default(true)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  team Team? @relation(fields: [teamId], references: [id], onDelete: Cascade)

  @@unique([teamId, resourceType])
  @@map("data_retention_policies")
}

model DataExportRequest {
  id            String       @id @default(uuid())
  teamId        String?
  userId        String?
  requestedById String
  type          DataExportType
  status        ExportStatus @default(PENDING)
  format        ExportFormat @default(JSON)
  fileUrl       String?
  expiresAt     DateTime?
  completedAt   DateTime?
  errorMessage  String?
  createdAt     DateTime     @default(now())

  @@map("data_export_requests")
}

enum AuditCategory {
  MEMBER_MANAGEMENT
  PROJECT_MANAGEMENT
  FINANCIAL
  SECURITY
  SETTINGS
  DATA_ACCESS
}

enum DataExportType {
  TEAM_DATA
  USER_DATA
  GDPR_FULL
}

enum ExportStatus {
  PENDING
  PROCESSING
  COMPLETED
  FAILED
  EXPIRED
}

enum ExportFormat {
  JSON
  CSV
  ZIP
}
```

### Файлы для создания

**Backend:**
- [ ] `apps/api/src/modules/admin/services/admin-audit.service.ts`
- [ ] `apps/api/src/modules/admin/resolvers/admin-audit.resolver.ts`

**Frontend:**
- [ ] `apps/web/src/app/(root)/(protected)/admin/teams/[teamId]/audit/page.tsx`
- [ ] `apps/web/src/packages/components/admin/audit/AuditLogViewer.tsx`
- [ ] `apps/web/src/packages/components/admin/audit/AuditFilters.tsx`
- [ ] `apps/web/src/packages/components/admin/audit/ComplianceReportCard.tsx`
- [ ] `apps/web/src/packages/components/admin/audit/RetentionPolicyEditor.tsx`
- [ ] `apps/web/src/packages/components/admin/audit/DataExportPanel.tsx`
- [ ] `apps/web/src/packages/api/graphql/admin/admin-audit.graphql`

---

## Day 14: Integration & Polish

### Цель
Финальное тестирование, оптимизация производительности, документация.

### Задачи

1. **Обновление навигации**
   - [ ] Обновить `apps/web/src/packages/components/admin/admin-sidebar.tsx`
   - [ ] Добавить Communications, Team Operations
   - [ ] Добавить под-навигацию для детальных страниц команд

2. **Разрешения**
   - [ ] Обновить `apps/api/src/shared/constants/admin-permissions.ts`
   - [ ] Добавить 15+ новых разрешений для Week 2

3. **Производительность**
   - [ ] Добавить индексы БД для новых таблиц
   - [ ] Реализовать кэширование запросов
   - [ ] Добавить skeleton loading states

4. **Документация**
   - [ ] Создать `docs/STAGE_16_COMPLETE.md`
   - [ ] Обновить `docs/roadmap.md`
   - [ ] Обновить `CHANGELOG.md`

---

## Новые разрешения

```typescript
// Добавить в admin-permissions.ts
export const AdminPermissions = {
  // ... существующие ...

  // Stage 16 - Week 2
  TEAM_ANALYTICS_VIEW: 'team_analytics:view',
  CUSTOM_ROLES_VIEW: 'custom_roles:view',
  CUSTOM_ROLES_MANAGE: 'custom_roles:manage',
  TEAM_MEMBERS_BULK: 'team_members:bulk',
  COMMUNICATIONS_VIEW: 'communications:view',
  COMMUNICATIONS_MANAGE: 'communications:manage',
  COMMUNICATIONS_BROADCAST: 'communications:broadcast',
  TEAM_OPERATIONS_MERGE: 'team_operations:merge',
  TEAM_OPERATIONS_CLONE: 'team_operations:clone',
  TEAM_TEMPLATES_VIEW: 'team_templates:view',
  TEAM_TEMPLATES_MANAGE: 'team_templates:manage',
  TEAM_AUDIT_VIEW: 'team_audit:view',
  COMPLIANCE_VIEW: 'compliance:view',
  DATA_RETENTION_MANAGE: 'data_retention:manage',
  DATA_EXPORT_REQUEST: 'data_export:request',
}
```

---

## Критические файлы для модификации

| Файл | Изменения |
|------|-----------|
| `apps/api/prisma/schema.prisma` | +8 моделей, +4 enum |
| `apps/web/src/packages/components/admin/admin-sidebar.tsx` | +2 nav items |
| `apps/api/src/shared/constants/admin-permissions.ts` | +15 разрешений |
| `apps/api/src/modules/admin/admin.module.ts` | +6 сервисов, +6 резолверов |

---

## Changelog Stage 16

### [Unreleased]

#### Day 8 - Team Analytics Dashboard
- 🚧 В разработке...

---

## Технологический стек

- **Backend:** NestJS 11, GraphQL, Prisma, PostgreSQL
- **Frontend:** Next.js 16, Apollo Client, Recharts, Tailwind CSS
- **UI Components:** Radix UI, Lucide icons, Framer Motion
- **Locale:** Russian (ru-RU)
