# План реализации: Этап 6 - Финансы и зарплата (Payouts & Salaries)

## Статус: 🔄 В ПРОЦЕССЕ

**Предыдущий этап:** Этап 5 (Фотоотчёты) завершён ✅
**Текущая задача:** Реализовать систему расчёта и распределения зарплат по завершении проекта
**Цель:** Автоматический расчёт выплат участникам команды с прозрачной формулой
**Приоритет:** 🔴🔴🔴 Критический (Killer Feature #2)
**Оценка времени:** 4-5 дней
**Блокирует:** Финальное закрытие проектов с расчётами

---

## Бизнес-ценность

### 💰 Impact

**Проблема которую решаем:** "Сколько кому платить в конце объекта?"

**Текущая ситуация:**
- Прораб считает зарплаты на калькуляторе/в блокноте
- Ошибки в расчётах → конфликты с бригадой
- Нет истории выплат
- Сложно объяснить откуда какая сумма
- Участники не понимают формулу распределения

**После внедрения:**
- Автоматический расчёт по формуле: `чистая прибыль - расходы`
- 3 типа зарплат: Fixed (фикс), Percentage (от прибыли), None (владелец)
- Прозрачность: каждый видит как считается
- История выплат по всем проектам
- Финальная прибыль владельца после всех выплат

**Монетизация:**
- Killer feature #2 после фотоотчётов
- Реальная экономия 10-20% прибыли (меньше ошибок)
- Уникально в СНГ - конкуренты не умеют
- Удержание пользователей (данные о зарплатах)

---

## Текущее состояние

### ✅ Что уже есть:
- Database: Project model с budget (Decimal)
- Database: Expense model для расходов
- Backend: ProjectStats API - расчёт прибыли: `profit = budget - totalExpenses`
- Backend: TeamMember model для участников команды
- Frontend: FinancialSummary компонент (бюджет, расходы, прибыль)
- Frontend: ExpenseForm/ExpenseList - полный CRUD расходов

### ❌ Что нужно добавить:
- Database: TeamMember расширение (salaryType, salaryAmount)
- Database: ProjectPayout model (история выплат)
- Database: Project расширение (closedAt, finalProfit)
- Backend: PayoutsModule с бизнес-логикой расчётов
- Backend: GraphQL API (6 queries + 5 mutations)
- Frontend: SalarySettingsForm (настройка зарплаты участника)
- Frontend: PayoutCalculator (калькулятор перед закрытием проекта)
- Frontend: PayoutHistoryList (история выплат)
- Frontend: Интеграция в Team Settings и Project Details

---

## Критические решения

### 🔴 РЕШЕНИЕ #1: Система типов зарплат

**Варианты:**
1. **Только процент** - все получают % от прибыли
2. **Только фикс** - все получают фиксированные суммы
3. **Гибридная (3 типа)** - выбор для каждого участника

**Выбор:** Гибридная система с 3 типами

**Salary Types:**

#### 1. FIXED - Фиксированная зарплата
- **Описание:** Зарплата уже выплачена и учтена в расходах
- **Пример:** Мастер получил 100,000 ₽ фиксированно
- **Учёт:** Добавляется как расход в категорию "Работа бригады"
- **При расчёте:** Не участвует (уже вычтена из прибыли)
- **Use case:** Наёмные работники, подрядчики

#### 2. PERCENTAGE - Процент от чистой прибыли
- **Описание:** Зарплата рассчитывается как % от прибыли после расходов
- **Пример:** Партнёр получает 30% от чистой прибыли
- **Формула:** `payout = netProfit * (percentage / 100)`
- **При расчёте:** Вычисляется автоматически при закрытии проекта
- **Use case:** Партнёры, доля в прибыли, мотивированные участники

#### 3. NONE - Не получает зарплату
- **Описание:** Участник не получает фиксированную или процентную зарплату
- **Пример:** Владелец бригады (получит остаток после выплат)
- **При расчёте:** Не участвует в выплатах
- **Владелец получает:** `netProfit - Σ(percentage salaries)`
- **Use case:** Владелец, временные помощники, стажёры

**Обоснование:**
- ✅ Максимальная гибкость для разных моделей оплаты
- ✅ Поддержка смешанных бригад (наёмные + партнёры)
- ✅ Прозрачный расчёт для всех участников
- ✅ Владелец получает остаток после выплат

---

### 🔴 РЕШЕНИЕ #2: Формула расчёта прибыли

**Базовая формула:**

```
Чистая прибыль (Net Profit):
netProfit = budget - totalExpenses

Где:
- budget: Сумма договора с клиентом
- totalExpenses: Σ всех расходов (включая FIXED зарплаты)
```

**Формула выплат:**

```
Выплаты PERCENTAGE участникам:
percentagePayout = netProfit * (percentage / 100)

Прибыль владельца:
ownerProfit = netProfit - Σ(percentagePayouts)
```

**Пример расчёта:**

```
Исходные данные:
- Бюджет договора: 500,000 ₽
- Расходы всего: 350,000 ₽
  - Материалы: 250,000 ₽
  - Работа бригады (FIXED зарплата мастера): 100,000 ₽

Шаг 1: Рассчитываем чистую прибыль
netProfit = 500,000 - 350,000 = 150,000 ₽

Шаг 2: Рассчитываем PERCENTAGE зарплаты
Участник 1 (FIXED 100,000): 0 ₽ (уже вычтено из расходов)
Участник 2 (20% от прибыли): 150,000 * 20% = 30,000 ₽
Участник 3 (NONE): 0 ₽

Шаг 3: Рассчитываем прибыль владельца
ownerProfit = 150,000 - 30,000 = 120,000 ₽

Итого распределение 150,000 ₽:
- Участник 1 (FIXED): 0 ₽ (получил 100,000 раньше)
- Участник 2 (20%): 30,000 ₽
- Владелец (NONE): 120,000 ₽
```

---

### 🔴 РЕШЕНИЕ #3: Snapshot данных для audit trail

**Проблема:** Если изменить настройки зарплаты, как это повлияет на прошлые выплаты?

**Решение:** Snapshot при создании выплаты

В модели `ProjectPayout` сохраняем:
- `calculatedAmount` - расчётная сумма на момент закрытия
- `actualAmount` - фактически выплаченная сумма
- `status` - статус выплаты (pending/paid)
- `createdAt` - когда был расчёт

**Обоснование:**
- ✅ История выплат не изменяется при изменении настроек
- ✅ Audit trail для бухгалтерии
- ✅ Можно пересчитать проект (создать новый пейаут)
- ✅ Возможность частичной оплаты (actualAmount < calculatedAmount)

---

### 🔴 РЕШЕНИЕ #4: Access Control Matrix

**Кто имеет доступ к операциям:**

| Operation              | Owner | Member |
|------------------------|-------|--------|
| payoutSummary          | ✅    | ❌     |
| updateMemberSalary     | ✅    | ❌     |
| calculatePayouts       | ✅    | ❌     |
| closeProject           | ✅    | ❌     |
| projectPayouts (all)   | ✅    | ❌     |
| memberPayouts (own)    | ✅    | ✅     |
| markPayoutAsPaid       | ✅    | ❌     |

**Обоснование:**
- ✅ Только владелец управляет финансами
- ✅ Участники видят свою историю выплат
- ✅ Прозрачность для участников
- ✅ Безопасность финансовых данных

---

## Техническая архитектура

### Database Schema

#### TeamMember (расширение существующей модели)

```prisma
model TeamMember {
  id        String   @id @default(uuid())
  teamId    String   @map("team_id")
  userId    String   @map("user_id")
  role      String   @default("member")
  joinedAt  DateTime @default(now()) @map("joined_at")

  // NEW: Salary fields
  salaryType   String   @default("none")  // "fixed", "percentage", "none"
  salaryAmount Decimal? @db.Decimal(12, 2) @map("salary_amount")

  team    Team           @relation(fields: [teamId], references: [id], onDelete: Cascade)
  user    User           @relation(fields: [userId], references: [id], onDelete: Cascade)
  payouts ProjectPayout[] // NEW: Relation

  @@unique([teamId, userId])
  @@index([userId])
  @@index([teamId])
  @@index([teamId, salaryType]) // NEW: Index
  @@map("team_members")
}
```

#### ProjectPayout (новая модель)

```prisma
model ProjectPayout {
  id               String    @id @default(uuid())
  projectId        String    @map("project_id")
  memberId         String    @map("member_id")
  calculatedAmount Decimal   @db.Decimal(12, 2) @map("calculated_amount")
  actualAmount     Decimal?  @db.Decimal(12, 2) @map("actual_amount")
  status           String    @default("pending") // "pending", "paid"
  paidAt           DateTime? @map("paid_at")
  notes            String?   @db.Text
  createdAt        DateTime  @default(now()) @map("created_at")
  updatedAt        DateTime  @updatedAt @map("updated_at")

  project Project    @relation(fields: [projectId], references: [id], onDelete: Cascade)
  member  TeamMember @relation(fields: [memberId], references: [id], onDelete: Cascade)

  @@index([projectId])
  @@index([memberId])
  @@index([projectId, status])
  @@map("project_payouts")
}
```

#### Project (расширение существующей модели)

```prisma
model Project {
  // ... existing fields

  // NEW: Project closure fields
  closedAt    DateTime? @map("closed_at")
  finalProfit Decimal?  @db.Decimal(12, 2) @map("final_profit")

  // ... existing relations
  payouts ProjectPayout[] // NEW: Relation
}
```

---

### Backend API Design

#### GraphQL Types

**ProjectPayout:**
```graphql
type ProjectPayout {
  id: ID!
  projectId: ID!
  memberId: ID!
  calculatedAmount: Float!
  actualAmount: Float
  status: String!
  paidAt: DateTime
  notes: String
  createdAt: DateTime!
  updatedAt: DateTime!

  # Relations
  project: Project!
  member: TeamMember!
}
```

**PayoutSummary:**
```graphql
type PayoutSummary {
  projectId: ID!
  projectName: String!
  budget: Float!
  totalExpenses: Float!
  netProfit: Float!
  totalPayouts: Float!
  ownerProfit: Float!
  members: [MemberPayout!]!
}

type MemberPayout {
  memberId: ID!
  memberName: String!
  salaryType: String!
  salaryAmount: Float
  calculatedPayout: Float!
  status: String!
}
```

#### GraphQL Operations

**Queries (6):**
1. `payoutSummary(projectId: ID!): PayoutSummary!` - Сводка для калькулятора
2. `projectPayouts(projectId: ID!): [ProjectPayout!]!` - Все выплаты по проекту
3. `memberPayouts(memberId: ID!): [ProjectPayout!]!` - История выплат участника
4. `teamMemberSalaries(teamId: ID!): [TeamMember!]!` - Зарплаты всех участников
5. `canCloseProject(projectId: ID!): Boolean!` - Можно ли закрыть проект
6. `projectFinancialStatus(projectId: ID!): ProjectFinancialStatus!` - Финансовый статус

**Mutations (5):**
1. `updateMemberSalary(input: UpdateMemberSalaryInput!): TeamMember!` - Настроить зарплату
2. `calculateProjectPayouts(projectId: ID!): PayoutSummary!` - Рассчитать выплаты
3. `createPayout(input: CreatePayoutInput!): ProjectPayout!` - Отметить как выплачено
4. `closeProject(projectId: ID!): Project!` - Закрыть проект с расчётами
5. `reopenProject(projectId: ID!): Project!` - Переоткрыть проект

---

### Backend Service Logic

#### PayoutsService Key Methods

**calculateProjectPayouts(projectId: string, userId: string)**
```typescript
async calculateProjectPayouts(projectId: string, userId: string): Promise<PayoutSummary> {
  // 1. Validate owner access
  // 2. Get project with budget
  // 3. Calculate totalExpenses
  // 4. Calculate netProfit = budget - totalExpenses
  // 5. Get all team members with salaryType/salaryAmount
  // 6. For each member:
  //    - FIXED: payout = 0 (already in expenses)
  //    - PERCENTAGE: payout = netProfit * (percentage / 100)
  //    - NONE: payout = 0
  // 7. Calculate ownerProfit = netProfit - Σ(PERCENTAGE payouts)
  // 8. Return PayoutSummary with all calculations
}
```

**updateMemberSalary(memberId: string, salaryType: string, amount: number, userId: string)**
```typescript
async updateMemberSalary(memberId, salaryType, amount, userId) {
  // 1. Validate owner access
  // 2. Validate salaryType enum
  // 3. Validate amount (0-100 for percentage, >= 0 for fixed)
  // 4. Update TeamMember record
  // 5. Return updated TeamMember
}
```

**closeProject(projectId: string, userId: string)**
```typescript
async closeProject(projectId, userId) {
  // 1. Validate owner access
  // 2. Check all payouts are PAID status
  // 3. Calculate final summary
  // 4. Transaction:
  //    - Update Project: status = COMPLETED, closedAt = now(), finalProfit = ownerProfit
  //    - Create snapshot ProjectPayout records for all members
  // 5. Return updated Project
}
```

---

### Frontend Components

#### SalarySettingsForm.tsx

**Purpose:** Форма настройки зарплаты участника команды

**Props:**
```typescript
interface SalarySettingsFormProps {
  memberId: string;
  defaultValues?: {
    salaryType: 'fixed' | 'percentage' | 'none';
    salaryAmount?: number;
  };
  onSubmit: (data: UpdateMemberSalaryInput) => void;
  isSubmitting?: boolean;
}
```

**UI:**
- Radio group: "Фиксированная" / "Процент от прибыли" / "Не установлена"
- Input: Сумма (для fixed) или процент (0-100% для percentage)
- Hints: Пояснение каждого типа зарплаты с примерами
- Submit button

---

#### PayoutCalculator.tsx

**Purpose:** Калькулятор расчёта зарплат перед закрытием проекта (modal)

**Props:**
```typescript
interface PayoutCalculatorProps {
  projectId: string;
  onClose?: () => void;
}
```

**UI Sections:**

1. **Header Card:**
   - Название проекта
   - Бюджет: 500,000 ₽
   - Расходы: 350,000 ₽
   - Чистая прибыль: 150,000 ₽ (gradient highlight)

2. **Members Table:**
   | Участник | Тип зарплаты | Расчётная сумма | Статус | Действие |
   |----------|-------------|-----------------|--------|----------|
   | Иван Иванов | Fixed 100,000 ₽ | 0 ₽ (в расходах) | - | - |
   | Пётр Петров | 20% от прибыли | 30,000 ₽ | Pending | ✅ Отметить как выплачено |

3. **Owner Profit Card:**
   - Ваша прибыль после выплат: **120,000 ₽** (large, gradient)

4. **Actions:**
   - Button: "Закрыть проект" (disabled если есть pending payouts)
   - Button: "Отмена"

---

#### PayoutHistoryList.tsx

**Purpose:** История выплат по проекту или участнику

**Props:**
```typescript
interface PayoutHistoryListProps {
  payouts: ProjectPayout[];
  emptyMessage?: string;
  showMemberColumn?: boolean; // true для истории проекта
  showProjectColumn?: boolean; // true для истории участника
}
```

**UI:**
- Table с колонками: Дата, Проект/Участник, Сумма, Статус, Комментарий
- Badge для статуса (Pending - yellow, Paid - green)
- Empty state если нет выплат

---

#### MemberSalaryBadge.tsx

**Purpose:** Компактный badge для отображения типа зарплаты

**Props:**
```typescript
interface MemberSalaryBadgeProps {
  salaryType: 'fixed' | 'percentage' | 'none';
  salaryAmount?: number;
  size?: 'sm' | 'md' | 'lg';
}
```

**UI Examples:**
- Fixed: `[₽] 50,000 ₽` (blue badge)
- Percentage: `[%] 20%` (emerald badge)
- None: `[—] Не установлена` (gray badge)

---

## Integration Points

### Team Details Page - Salary Tab

**File:** `apps/web/src/app/(root)/(protected)/teams/[teamId]/page.tsx`

**Changes:**
1. Add new tab "Зарплаты" (after "Участники")
2. Tab content:
   - List all team members in grid
   - For each member:
     - Avatar + Name + Email
     - Role badge
     - MemberSalaryBadge
     - Button "Настроить зарплату" → opens modal
   - Modal: SalarySettingsForm
   - Success toast after update
3. GraphQL: Use `TeamMemberSalariesQuery`

---

### Project Details Page - Payouts Tab

**File:** `apps/web/src/app/(root)/(protected)/teams/[teamId]/projects/[projectId]/page.tsx`

**Changes:**
1. Add new tab "Выплаты" (after "Фотоотчёты")
2. Tab content:
   - **Financial Summary Card** (existing FinancialSummary component)
   - **Payout Calculator Section:**
     - If project status === ACTIVE:
       - Button "Рассчитать выплаты" → opens PayoutCalculator modal
     - If project status === COMPLETED:
       - Display finalProfit
       - Display closedAt date
   - **Payout History:**
     - PayoutHistoryList component with project payouts
3. GraphQL: Use `PayoutSummaryQuery`, `ProjectPayoutsQuery`

---

### Dashboard Page - Owner Profit

**File:** `apps/web/src/app/(root)/(protected)/dashboard/page.tsx`

**Changes:**
1. Update FinancialSummary component:
   - Add new metric: "Ваша прибыль после выплат"
   - Calculate: Σ(finalProfit) for all COMPLETED projects
   - Display in gradient card
2. GraphQL: Extend ProjectStats with finalProfit field

---

## Testing Strategy

### Unit Tests (Backend)

**PayoutsService:**
- ✅ calculateProjectPayouts - correct formulas
- ✅ FIXED salary - not included in payouts
- ✅ PERCENTAGE salary - correct calculation
- ✅ Owner profit - remainder after PERCENTAGE payouts
- ✅ Edge case: negative profit
- ✅ Edge case: percentage > 100%
- ✅ updateMemberSalary - validation
- ✅ closeProject - transaction atomicity

### Integration Tests

**GraphQL API:**
- ✅ payoutSummary query - owner only
- ✅ updateMemberSalary mutation - owner only
- ✅ memberPayouts query - member can see own
- ✅ closeProject mutation - all payouts must be PAID

### E2E Test Scenario

**Happy Path:**
1. Create project with budget 500,000 ₽
2. Add 2 team members
3. Configure salaries:
   - Member 1: FIXED 100,000 ₽
   - Member 2: PERCENTAGE 20%
4. Add expenses:
   - Materials: 250,000 ₽
   - Работа бригады (FIXED salary): 100,000 ₽
5. Go to Payouts tab
6. Click "Рассчитать выплаты"
7. Verify calculations:
   - Net profit: 150,000 ₽
   - Member 1 payout: 0 ₽ (in expenses)
   - Member 2 payout: 30,000 ₽ (20% of 150k)
   - Owner profit: 120,000 ₽ (150k - 30k)
8. Mark Member 2 payout as PAID
9. Click "Закрыть проект"
10. Verify project status = COMPLETED
11. Verify finalProfit = 120,000 ₽ saved

---

## Implementation Phases

### Phase 1: Backend Foundation (Day 1-2)

**1.1 Database Schema** - 2 hours
- [ ] Update TeamMember model (salaryType, salaryAmount)
- [ ] Create ProjectPayout model
- [ ] Update Project model (closedAt, finalProfit)
- [ ] Create migration: `add_salary_and_payouts`
- [ ] Run `prisma generate`

**1.2 PayoutsModule Backend** - 6 hours
- [ ] Create module structure: `apps/api/src/modules/payouts/`
- [ ] GraphQL Models: ProjectPayout, PayoutSummary (2 files)
- [ ] DTOs: UpdateMemberSalary, CreatePayout (2 files)
- [ ] PayoutsService with business logic (~400 lines)
  - [ ] calculateProjectPayouts method
  - [ ] updateMemberSalary method
  - [ ] createPayout method
  - [ ] closeProject method
  - [ ] getProjectPayouts method
  - [ ] getMemberPayouts method
- [ ] PayoutsResolver with GraphQL operations
  - [ ] 6 queries
  - [ ] 5 mutations
- [ ] Update TeamsModule (add salary fields to GraphQL schema)
- [ ] Import PayoutsModule in app.module.ts
- [ ] TypeScript compilation check

---

### Phase 2: Frontend Foundation (Day 3)

**2.1 GraphQL Operations** - 2 hours
- [ ] Create `apps/web/src/packages/api/graphql/payouts.graphql`
  - [ ] Fragments: ProjectPayoutFields, PayoutSummaryFields
  - [ ] Queries: PayoutSummary, ProjectPayouts, MemberPayouts (3)
  - [ ] Mutations: UpdateMemberSalary, CreatePayout, CloseProject (3)
- [ ] Run codegen: `npm run codegen:web`
- [ ] Verify generated types

**2.2 Zod Validation Schemas** - 2 hours
- [ ] Create `apps/web/src/packages/schemas/payouts/`
- [ ] member-salary.schema.ts (validation: type enum, amount 0-100)
- [ ] payout.schema.ts (validation: amount >= 0)
- [ ] Export in schemas/index.ts

---

### Phase 3: UI Components (Day 3-4)

**3.1 SalarySettingsForm** - 3 hours
- [ ] Create component with React Hook Form + Zod
- [ ] Radio group for salary types
- [ ] Conditional input (amount or percentage)
- [ ] Hints with examples
- [ ] UpdateMemberSalary mutation integration
- [ ] Loading state + toast notifications

**3.2 PayoutCalculator** - 4 hours
- [ ] Create modal component
- [ ] Financial summary header
- [ ] Members table with calculations
- [ ] Owner profit card
- [ ] Mark as paid buttons
- [ ] Close project button
- [ ] PayoutSummary query integration
- [ ] CreatePayout, CloseProject mutations

**3.3 PayoutHistoryList** - 2 hours
- [ ] Create table component
- [ ] Columns: Date, Project/Member, Amount, Status, Notes
- [ ] Status badge (pending/paid)
- [ ] Empty state
- [ ] Responsive design

**3.4 MemberSalaryBadge** - 1 hour
- [ ] Create badge component
- [ ] 3 variants: fixed (blue), percentage (emerald), none (gray)
- [ ] Size variants: sm, md, lg
- [ ] Icons for each type

**3.5 Exports** - 0.5 hours
- [ ] Update `apps/web/src/packages/components/payouts/index.ts`
- [ ] Export all 4 components
- [ ] Update `apps/web/src/packages/components/index.ts`

---

### Phase 4: Integration (Day 4-5)

**4.1 Team Details Page - Salary Tab** - 3 hours
- [ ] Add "Зарплаты" tab to `/teams/[teamId]/page.tsx`
- [ ] List all team members with MemberSalaryBadge
- [ ] "Настроить зарплату" button → modal
- [ ] SalarySettingsForm modal integration
- [ ] GraphQL: TeamMemberSalaries query
- [ ] Success/error handling

**4.2 Project Details Page - Payouts Tab** - 4 hours
- [ ] Add "Выплаты" tab to `/teams/[teamId]/projects/[projectId]/page.tsx`
- [ ] Financial summary card (reuse existing component)
- [ ] "Рассчитать выплаты" button
- [ ] PayoutCalculator modal integration
- [ ] PayoutHistoryList integration
- [ ] GraphQL: PayoutSummary, ProjectPayouts queries
- [ ] Conditional rendering (ACTIVE vs COMPLETED)
- [ ] Loading states + empty states

**4.3 Dashboard - Owner Profit** - 2 hours
- [ ] Update Dashboard page
- [ ] Add "Ваша прибыль после выплат" metric
- [ ] Calculate Σ(finalProfit) for COMPLETED projects
- [ ] Update FinancialSummary component
- [ ] Gradient styling for owner profit

---

### Phase 5: Testing & Documentation (Day 5)

**5.1 E2E Testing** - 4 hours
- [ ] Manual E2E test (happy path scenario above)
- [ ] Test calculations accuracy
- [ ] Test edge cases (negative profit, >100%)
- [ ] Test access control (member vs owner)
- [ ] Test all GraphQL operations
- [ ] Mobile responsive check

**5.2 TypeScript & Build** - 1 hour
- [ ] Backend: `cd apps/api && npm run build` (0 errors)
- [ ] Frontend: `cd apps/web && npm run build` (0 errors)
- [ ] Fix any compilation errors
- [ ] Verify all types generated correctly

**5.3 Documentation** - 2 hours
- [ ] Update `CHANGELOG.md` - add Stage 6 section
- [ ] Update `docs/roadmap.md` - mark Stage 6 complete
- [ ] Update MVP progress to 95%
- [ ] Add timestamp and summary

---

## Success Criteria

### Backend
- ✅ All migrations applied without errors
- ✅ PayoutsModule fully integrated
- ✅ 6 GraphQL queries + 5 mutations working
- ✅ calculateProjectPayouts formula verified manually
- ✅ TypeScript compilation: 0 errors
- ✅ API starts on :8080 without errors

### Frontend
- ✅ GraphQL codegen successful
- ✅ 4 components created and working
- ✅ "Зарплаты" tab in Team Details
- ✅ "Выплаты" tab in Project Details
- ✅ SalarySettingsForm works correctly
- ✅ PayoutCalculator modal works correctly
- ✅ PayoutHistoryList displays data
- ✅ MemberSalaryBadge shows correct info
- ✅ TypeScript compilation: 0 errors
- ✅ Build successful

### Integration
- ✅ E2E happy path completed
- ✅ Calculations verified manually (sample data)
- ✅ UI/UX follows design system
- ✅ Mobile responsive
- ✅ No console errors

### Documentation
- ✅ CHANGELOG.md updated
- ✅ roadmap.md Stage 6 marked complete
- ✅ MVP progress 90% → 95%

---

## Files Summary

### Backend (12 new + 3 modifications)

**New Files:**
- `apps/api/src/modules/payouts/payouts.module.ts`
- `apps/api/src/modules/payouts/payouts.service.ts` (~400 lines)
- `apps/api/src/modules/payouts/payouts.resolver.ts`
- `apps/api/src/modules/payouts/models/project-payout.model.ts`
- `apps/api/src/modules/payouts/models/payout-summary.model.ts`
- `apps/api/src/modules/payouts/dto/update-member-salary.input.ts`
- `apps/api/src/modules/payouts/dto/create-payout.input.ts`

**Modifications:**
- `apps/api/prisma/schema.prisma` (TeamMember, ProjectPayout, Project)
- `apps/api/src/modules/teams/models/team-member.model.ts` (add salary fields)
- `apps/api/src/modules/teams/teams.service.ts` (include salary in queries)
- `apps/api/src/app.module.ts` (import PayoutsModule)

### Frontend (10 new + 3 modifications)

**New Files:**
- `apps/web/src/packages/api/graphql/payouts.graphql`
- `apps/web/src/packages/schemas/payouts/index.ts`
- `apps/web/src/packages/schemas/payouts/member-salary.schema.ts`
- `apps/web/src/packages/schemas/payouts/payout.schema.ts`
- `apps/web/src/packages/components/payouts/SalarySettingsForm.tsx`
- `apps/web/src/packages/components/payouts/PayoutCalculator.tsx`
- `apps/web/src/packages/components/payouts/PayoutHistoryList.tsx`
- `apps/web/src/packages/components/payouts/MemberSalaryBadge.tsx`
- `apps/web/src/packages/components/payouts/index.ts`

**Modifications:**
- `apps/web/src/app/(root)/(protected)/teams/[teamId]/page.tsx` (add Salary tab)
- `apps/web/src/app/(root)/(protected)/teams/[teamId]/projects/[projectId]/page.tsx` (add Payouts tab)
- `apps/web/src/packages/components/index.ts` (export payouts)

### Documentation (2 files)

- `CHANGELOG.md` (Stage 6 section)
- `docs/roadmap.md` (Stage 6 complete, MVP 95%)

---

## Risks & Mitigation

### 🔴 Высокий риск: Сложность расчётов

**Проблема:** Формула может дать неправильный результат

**Митигация:**
- Comprehensive unit tests для всех сценариев
- Manual verification с sample data
- Test cases: Fixed only, Percentage only, Mixed, Negative profit, >100% total

### 🟡 Средний риск: Edge cases

**Проблема:** Непредвиденные сценарии (reopening, concurrent close, member deletion)

**Митигация:**
- Validation на всех уровнях (Zod, class-validator, business logic)
- Prisma transactions для атомарности
- Cascade delete для связанных данных
- Status checks перед close

### 🟢 Низкий риск: Технический

**Проблема:** Интеграция с существующей системой

**Митигация:**
- Используем проверенные паттерны из Stages 1-5
- TypeScript для type safety
- GraphQL для type-safe API
- Existing ProjectStats API для расчёта расходов

---

## Post-MVP Enhancements

### Phase 6+: Advanced Features (Future)

- [ ] Reopening closed projects (only if no PAID payouts)
- [ ] Partial payouts (actualAmount < calculatedAmount)
- [ ] Multiple payout installments for one project
- [ ] Expense linking to FIXED salaries (userId in comment)
- [ ] Payout history export (PDF/Excel)
- [ ] Email notifications on payout creation
- [ ] SMS notifications for members
- [ ] Integration with accounting software
- [ ] Tax calculations (НДС, НДФЛ)
- [ ] Currency support (not just RUB)

---

## Conclusion

Stage 6 (Финансы и зарплата) - это второй killer feature после фотоотчётов. Система автоматического расчёта зарплат с прозрачной формулой решает критическую боль прорабов и экономит 10-20% прибыли за счёт исключения ошибок.

**Оценка:** 4-5 дней (20-26 часов) разработки для полной реализации всех фаз.

**MVP Progress после Stage 6:** 90% → 95% ✅
