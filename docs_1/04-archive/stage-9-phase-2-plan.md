# Stage 9 Phase 2: Учёт времени и отчёты

**Дата начала:** 2025-12-16
**Срок:** 7 дней
**Статус:** 🚀 В работе

---

## 📋 Обзор

Phase 2 добавляет функционал учёта рабочего времени, аудита изменений зарплаты и отчётов по персоналу.

---

## 🎯 Цели Phase 2

1. **Учёт рабочего времени** - логирование часов работы участников
2. **Отчёты по персоналу** - аналитика и KPI по команде
3. **Аудит зарплаты** - история изменений условий оплаты
4. **Тестирование** - полное покрытие функционала

---

## 📅 План реализации

### День 8-10: Учёт рабочего времени (3 дня)

#### День 8: Database & Backend (1 день)

**1. Prisma Schema - WorkLog Model**

```prisma
model WorkLog {
  id          String   @id @default(uuid())
  userId      String
  projectId   String
  teamId      String
  date        DateTime
  hours       Float
  description String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  user    User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  project Project @relation(fields: [projectId], references: [id], onDelete: Cascade)
  team    Team    @relation(fields: [teamId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([projectId])
  @@index([teamId])
  @@index([date])
  @@map("work_logs")
}
```

**2. Backend: WorkLogService**

Файл: `apps/api/src/modules/work-logs/work-log.service.ts`

Методы:
- `createWorkLog(input: CreateWorkLogInput)` - создать запись
- `updateWorkLog(id: string, input: UpdateWorkLogInput)` - обновить запись
- `deleteWorkLog(id: string)` - удалить запись
- `getWorkLogs(filters: WorkLogFilters)` - получить записи с фильтрами
- `getWorkLogsByUser(userId: string, filters)` - записи участника
- `getWorkLogsByProject(projectId: string, filters)` - записи проекта
- `getTotalHours(filters)` - общее количество часов
- `calculateHourlySalary(userId: string, period)` - расчёт зарплаты по часам

**3. Backend: WorkLogResolver**

Файл: `apps/api/src/modules/work-logs/work-log.resolver.ts`

```graphql
type WorkLog {
  id: ID!
  user: User!
  project: Project!
  team: Team!
  date: DateTime!
  hours: Float!
  description: String
  createdAt: DateTime!
  updatedAt: DateTime!
}

input CreateWorkLogInput {
  userId: ID!
  projectId: ID!
  teamId: ID!
  date: DateTime!
  hours: Float!
  description: String
}

input UpdateWorkLogInput {
  date: DateTime
  hours: Float
  description: String
}

input WorkLogFilters {
  userId: ID
  projectId: ID
  teamId: ID
  dateFrom: DateTime
  dateTo: DateTime
}

type Query {
  workLogs(filters: WorkLogFilters!): [WorkLog!]!
  workLog(id: ID!): WorkLog
  totalHours(filters: WorkLogFilters!): Float!
}

type Mutation {
  createWorkLog(input: CreateWorkLogInput!): WorkLog!
  updateWorkLog(id: ID!, input: UpdateWorkLogInput!): WorkLog!
  deleteWorkLog(id: ID!): Boolean!
}
```

**4. Миграция базы данных**

```bash
cd apps/api
npx prisma migrate dev --name add_work_log
```

---

#### День 9: Frontend - Time Tracking Page (1 день)

**1. GraphQL Documents**

Файл: `apps/web/src/packages/api/graphql/work-logs.graphql`

```graphql
query WorkLogs($filters: WorkLogFilters!) {
  workLogs(filters: $filters) {
    id
    user {
      id
      fullName
      avatarUrl
    }
    project {
      id
      name
    }
    date
    hours
    description
    createdAt
  }
}

query TotalHours($filters: WorkLogFilters!) {
  totalHours(filters: $filters)
}

mutation CreateWorkLog($input: CreateWorkLogInput!) {
  createWorkLog(input: $input) {
    id
    date
    hours
    description
  }
}

mutation UpdateWorkLog($id: ID!, $input: UpdateWorkLogInput!) {
  updateWorkLog(id: $id, input: $input) {
    id
    date
    hours
    description
  }
}

mutation DeleteWorkLog($id: ID!) {
  deleteWorkLog(id: $id)
}
```

**2. Time Tracking Page**

Файл: `apps/web/src/app/(root)/(protected)/teams/[teamId]/projects/[projectId]/time-tracking/page.tsx`

Компоненты:
- **Calendar View** - календарь для выбора даты
- **Work Log Form** - форма добавления/редактирования
- **Work Logs Table** - таблица с записями
- **Stats Cards** - статистика (общие часы, средние часы в день)
- **Filters** - фильтры по участнику, периоду

**3. Components**

`apps/web/src/app/components/work-logs/`
- `work-log-form.tsx` - форма записи
- `work-log-table.tsx` - таблица записей
- `work-log-calendar.tsx` - календарь с отметками
- `work-log-stats.tsx` - карточки статистики

---

#### День 10: Integration & Testing (1 день)

**1. Интеграция с Payouts**
- Автоматический расчёт выплат по часам
- Отображение часов в истории выплат
- Связь WorkLog → Payout

**2. Тестирование**
- Unit тесты для WorkLogService
- E2E тесты для time tracking page
- Проверка расчётов зарплаты

---

### День 11-12: Отчёты по персоналу (2 дня)

#### День 11: Backend - Personnel Analytics (1 день)

**1. Backend: PersonnelAnalyticsService**

Файл: `apps/api/src/modules/analytics/personnel-analytics.service.ts`

Методы:
- `getPersonnelStats(teamId: string, period)` - общая статистика
- `getPayoutsByMonth(teamId: string, period)` - выплаты по месяцам
- `getTopEarners(teamId: string, period, limit)` - топ по заработку
- `getPayoutsByPaymentMethod(teamId: string, period)` - распределение по методам
- `getProjectParticipation(teamId: string, period)` - участие в проектах
- `getAveragePayouts(teamId: string, period)` - средние выплаты

**2. Backend: GraphQL Queries**

```graphql
type PersonnelStats {
  totalMembers: Int!
  activeProjects: Int!
  averagePayout: Float!
  totalPayouts: Float!
  totalHours: Float!
  averageHoursPerMember: Float!
}

type PayoutsByMonth {
  month: String!
  totalAmount: Float!
  count: Int!
}

type TopEarner {
  user: User!
  totalEarned: Float!
  payoutsCount: Int!
  averagePayout: Float!
}

type PayoutsByPaymentMethod {
  method: PaymentMethod!
  totalAmount: Float!
  count: Int!
  percentage: Float!
}

input AnalyticsPeriod {
  from: DateTime!
  to: DateTime!
}

type Query {
  personnelStats(teamId: ID!, period: AnalyticsPeriod!): PersonnelStats!
  payoutsByMonth(teamId: ID!, period: AnalyticsPeriod!): [PayoutsByMonth!]!
  topEarners(teamId: ID!, period: AnalyticsPeriod!, limit: Int): [TopEarner!]!
  payoutsByPaymentMethod(teamId: ID!, period: AnalyticsPeriod!): [PayoutsByPaymentMethod!]!
}
```

---

#### День 12: Frontend - Analytics Page (1 день)

**1. Personnel Analytics Page**

Файл: `apps/web/src/app/(root)/(protected)/teams/[teamId]/analytics/personnel/page.tsx`

Секции:
- **KPI Cards** (4 карточки):
  - Общее количество участников
  - Активных проектов на участника
  - Средняя выплата
  - Общая сумма выплат за период

- **Графики** (recharts):
  - Line Chart: Выплаты по месяцам
  - Bar Chart: Топ участников по заработку
  - Pie Chart: Распределение по типам оплаты
  - Bar Chart: Участие в проектах

- **Фильтры**:
  - Date Range Picker (период)
  - Multi-Select (участники)
  - Select (проект)

**2. Components**

`apps/web/src/app/components/analytics/`
- `personnel-kpi-cards.tsx` - KPI карточки
- `payouts-by-month-chart.tsx` - график выплат
- `top-earners-chart.tsx` - топ участников
- `payment-methods-chart.tsx` - распределение методов
- `analytics-filters.tsx` - фильтры

---

### День 13: Аудит изменений зарплаты (1 день)

#### Prisma Schema - SalaryHistory Model

```prisma
model TeamMemberSalaryHistory {
  id          String      @id @default(uuid())
  memberId    String
  changedBy   String
  field       String      // 'salaryType' | 'salaryAmount'
  oldValue    String?
  newValue    String?
  createdAt   DateTime    @default(now())

  member    TeamMember @relation(fields: [memberId], references: [id], onDelete: Cascade)
  changedByUser User   @relation(fields: [changedBy], references: [id], onDelete: Cascade)

  @@index([memberId])
  @@index([createdAt])
  @@map("team_member_salary_history")
}
```

#### Backend: Automatic Logging

Добавить в `TeamMembersService.updateMemberSalary()`:

```typescript
// Before update
const oldMember = await this.prisma.teamMember.findUnique({ where: { id } });

// Update member
await this.prisma.teamMember.update({ ... });

// Log changes
if (oldMember.salaryType !== input.salaryType) {
  await this.prisma.teamMemberSalaryHistory.create({
    data: {
      memberId: id,
      changedBy: userId,
      field: 'salaryType',
      oldValue: oldMember.salaryType,
      newValue: input.salaryType,
    },
  });
}

if (oldMember.salaryAmount !== input.salaryAmount) {
  await this.prisma.teamMemberSalaryHistory.create({
    data: {
      memberId: id,
      changedBy: userId,
      field: 'salaryAmount',
      oldValue: oldMember.salaryAmount?.toString(),
      newValue: input.salaryAmount?.toString(),
    },
  });
}
```

#### Frontend: History UI

Добавить в `/teams/[teamId]/members/[memberId]/salary/page.tsx`:

Секция "История изменений":
- Таблица с изменениями
- Колонки: Дата, Кто изменил, Поле, Было → Стало
- Сортировка по дате (новые сверху)

---

### День 14: Тестирование Phase 2 (1 день)

**1. Unit Tests**
- WorkLogService tests
- PersonnelAnalyticsService tests
- SalaryHistory logging tests

**2. E2E Tests**
- Time tracking page flow
- Analytics page load
- Salary history display

**3. Integration Tests**
- Hourly salary calculation
- Analytics data accuracy
- Audit log completeness

**4. Bug Fixes**
- Исправление найденных багов
- Code review
- Performance optimization

---

## 📊 Оценка трудозатрат

| Задача | Часы | Дни |
|--------|------|-----|
| День 8: Database & Backend (WorkLog) | 8h | 1 |
| День 9: Frontend (Time Tracking Page) | 8h | 1 |
| День 10: Integration & Testing | 8h | 1 |
| День 11: Backend (Analytics) | 8h | 1 |
| День 12: Frontend (Analytics Page) | 8h | 1 |
| День 13: Salary Audit | 8h | 1 |
| День 14: Testing & Bug Fixes | 8h | 1 |
| **Итого** | **56h** | **7 дней** |

---

## 🎯 Success Criteria

### Учёт времени
- ✅ Участники могут логировать часы работы
- ✅ Фильтрация по участнику, проекту, периоду
- ✅ Автоматический расчёт зарплаты по часам
- ✅ Calendar view с отметками дней

### Отчёты
- ✅ KPI карточки с реальными данными
- ✅ 4 графика работают корректно
- ✅ Фильтры применяются правильно
- ✅ Export в PDF/Excel

### Аудит
- ✅ Все изменения зарплаты логируются
- ✅ История отображается в UI
- ✅ Показывает кто, когда, что изменил

---

## 📝 Чеклист перед завершением

- [ ] Все миграции применены
- [ ] GraphQL schema сгенерирована
- [ ] Codegen выполнен
- [ ] Build успешен (0 ошибок)
- [ ] Unit тесты проходят
- [ ] E2E тесты проходят
- [ ] UI/UX проверен
- [ ] Документация обновлена
- [ ] Changelog обновлен
- [ ] Roadmap обновлен

---

## 🔗 Связанные документы

- [WHATS_NOT_DONE.md](../WHATS_NOT_DONE.md) - Что осталось сделать
- [ROADMAP.md](../ROADMAP.md) - Общий roadmap
- [stage-9-ux-polish-plan.md](../04-archive/stage-9-ux-polish-plan.md) - План Phase 3

---

**Статус:** 🚀 В работе
**Следующий шаг:** День 8 - Database & Backend (WorkLog)
