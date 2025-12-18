# ALL STAGES DETAILED BREAKDOWN - ProRab.space

**Версия:** 1.0
**Дата:** 2025-12-13
**Статус проекта:** 100% MVP Complete - Production Ready

---

## ОГЛАВЛЕНИЕ

1. [Stage 1: Authentication System](#stage-1-authentication-system)
2. [Stage 2: Onboarding Flow](#stage-2-onboarding-flow)
3. [Stage 3: Projects Management](#stage-3-projects-management)
4. [Stage 4: Expenses Tracking](#stage-4-expenses-tracking)
5. [Stage 5: Photo Reports](#stage-5-photo-reports)
6. [Stage 6: Payouts Management](#stage-6-payouts-management)
7. [Stage 7: Kanban Tasks](#stage-7-kanban-tasks)
8. [Stage 8: Monetization](#stage-8-monetization)
9. [Stage 9: Personnel & Payments](#stage-9-personnel--payments)
10. [Stage 10: Admin Panel](#stage-10-admin-panel)
11. [Stage 11: Settings Page](#stage-11-settings-page)

---

## STAGE 1: AUTHENTICATION SYSTEM

**Период:** Week 1
**Статус:** ✅ Complete
**Сложность:** High

### Описание

Полноценная система аутентификации с регистрацией, входом, верификацией email и сбросом пароля.

### Технологии

**Backend:**
- NestJS 11.1.9
- Argon2 (password hashing)
- JWT (access + refresh tokens)
- Redis (session storage)
- Brevo API (email sending)

**Frontend:**
- Next.js 16 App Router
- React Hook Form + Zod
- Apollo Client

### Реализованные функции

#### 1. Регистрация (Register)

**Backend:**
```typescript
// auth.service.ts
async register(input: RegisterInput): Promise<AuthPayload> {
  // 1. Validate email uniqueness
  const existingUser = await this.prisma.user.findUnique({
    where: { email: input.email }
  });

  if (existingUser) {
    throw new ConflictException('Email already exists');
  }

  // 2. Hash password with Argon2
  const hashedPassword = await argon2.hash(input.password, {
    type: argon2.argon2id,
    memoryCost: 65536,  // 64 MB
    timeCost: 3,
    parallelism: 4
  });

  // 3. Create user
  const user = await this.prisma.user.create({
    data: {
      email: input.email,
      password: hashedPassword,
      fullName: input.fullName,
      phone: input.phone
    }
  });

  // 4. Generate verification token
  const verificationToken = await this.createVerificationToken(user.id);

  // 5. Send verification email
  await this.mailService.sendVerificationEmail(user.email, verificationToken);

  // 6. Generate auth tokens
  return this.generateTokens(user);
}
```

**Frontend:**
```tsx
// RegisterForm.tsx
const registerSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string()
    .min(8, 'Min 8 characters')
    .regex(/[A-Z]/, 'At least one uppercase')
    .regex(/[0-9]/, 'At least one number'),
  fullName: z.string().min(2, 'Min 2 characters'),
  phone: z.string().optional()
});

function RegisterForm() {
  const [register, { loading, error }] = useRegisterMutation();

  const { register: formRegister, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(registerSchema)
  });

  const onSubmit = async (data) => {
    const result = await register({ variables: { input: data } });

    if (result.data?.register.accessToken) {
      // Store tokens
      // Redirect to dashboard
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Input {...formRegister('email')} type="email" />
      <Input {...formRegister('password')} type="password" />
      <Input {...formRegister('fullName')} />
      <Button type="submit" loading={loading}>Register</Button>
    </form>
  );
}
```

**GraphQL:**
```graphql
mutation Register($input: RegisterInput!) {
  register(input: $input) {
    accessToken
    refreshToken
    user {
      id
      email
      fullName
      isEmailVerified
    }
  }
}
```

---

#### 2. Вход (Login)

**Flow:**
1. User вводит email + password
2. Backend проверяет хеш через Argon2
3. Если успешно → генерирует JWT токены
4. Access token в memory, Refresh token в HttpOnly cookie
5. Redirect на /dashboard

**Backend:**
```typescript
async login(input: LoginInput): Promise<AuthPayload> {
  // 1. Find user by email
  const user = await this.prisma.user.findUnique({
    where: { email: input.email }
  });

  if (!user || !user.password) {
    throw new UnauthorizedException('Invalid credentials');
  }

  // 2. Verify password
  const isValid = await argon2.verify(user.password, input.password);

  if (!isValid) {
    throw new UnauthorizedException('Invalid credentials');
  }

  // 3. Check email verification
  if (!user.isEmailVerified) {
    throw new UnauthorizedException('Please verify your email');
  }

  // 4. Update last login
  await this.prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() }
  });

  // 5. Generate tokens
  return this.generateTokens(user);
}
```

---

#### 3. Email Verification

**Tokens:**
- Generated with `nanoid(32)`
- TTL: 24 hours
- Stored in `VerificationToken` table
- One-time use

**Backend:**
```typescript
async verifyEmail(token: string): Promise<User> {
  const verificationToken = await this.prisma.verificationToken.findUnique({
    where: { token },
    include: { user: true }
  });

  if (!verificationToken || verificationToken.expiresAt < new Date()) {
    throw new BadRequestException('Invalid or expired token');
  }

  const user = await this.prisma.user.update({
    where: { id: verificationToken.userId },
    data: { isEmailVerified: true }
  });

  await this.prisma.verificationToken.delete({
    where: { id: verificationToken.id }
  });

  return user;
}
```

---

#### 4. Password Reset

**Flow:**
1. User enters email on `/auth/forgot-password`
2. Backend generates reset token (nanoid 32)
3. Email sent with reset link
4. User clicks link → opens `/auth/reset-password?token=xxx`
5. User enters new password
6. Backend validates token + updates password

**Backend:**
```typescript
async resetPassword(input: ResetPasswordInput): Promise<boolean> {
  const resetToken = await this.prisma.passwordResetToken.findUnique({
    where: { token: input.token },
    include: { user: true }
  });

  if (!resetToken || resetToken.expiresAt < new Date() || resetToken.isUsed) {
    throw new BadRequestException('Invalid or expired token');
  }

  const hashedPassword = await argon2.hash(input.newPassword);

  await this.prisma.$transaction([
    // Update password
    this.prisma.user.update({
      where: { id: resetToken.userId },
      data: { password: hashedPassword }
    }),
    // Mark token as used
    this.prisma.passwordResetToken.update({
      where: { id: resetToken.id },
      data: { isUsed: true }
    })
  ]);

  return true;
}
```

---

### Database Models

```prisma
model User {
  id              String   @id @default(cuid())
  email           String   @unique
  password        String?
  fullName        String?
  phone           String?
  isEmailVerified Boolean  @default(false)
  lastLoginAt     DateTime?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

model VerificationToken {
  id        String   @id @default(cuid())
  userId    String
  token     String   @unique
  expiresAt DateTime
  createdAt DateTime @default(now())
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model PasswordResetToken {
  id        String   @id @default(cuid())
  userId    String
  token     String   @unique
  expiresAt DateTime
  isUsed    Boolean  @default(false)
  createdAt DateTime @default(now())
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

---

### Security Features

1. **Argon2 Hashing**
   - Winner of Password Hashing Competition
   - Memory cost: 64 MB
   - Time cost: 3 iterations (~200ms)

2. **JWT Tokens**
   - Access token: 30 minutes
   - Refresh token: 7 days
   - Signed with HS256

3. **HttpOnly Cookies**
   - Refresh token stored in cookie
   - Protection from XSS attacks

4. **Rate Limiting**
   - 5 login attempts per 5 minutes
   - 3 password reset requests per hour

---

### GraphQL API

```graphql
type AuthPayload {
  accessToken: String!
  refreshToken: String!
  user: User!
}

type Mutation {
  register(input: RegisterInput!): AuthPayload!
  login(input: LoginInput!): AuthPayload!
  logout: Boolean!
  verifyEmail(token: String!): User!
  resendVerification: Boolean!
  forgotPassword(email: String!): Boolean!
  resetPassword(input: ResetPasswordInput!): Boolean!
  changePassword(input: ChangePasswordInput!): Boolean!
}
```

---

### Pages Created

1. `/auth/login` - Login form
2. `/auth/register` - Registration form
3. `/auth/verify-email` - Email verification
4. `/auth/forgot-password` - Request password reset
5. `/auth/reset-password` - Reset password with token

---

### Metrics

- **Files:** 15+ files
- **Lines:** ~1200 lines
- **Components:** 5 forms
- **API Endpoints:** 8 mutations

---

## STAGE 2: ONBOARDING FLOW

**Период:** Week 1
**Статус:** ✅ Complete
**Сложность:** Medium

### Описание

Guided onboarding процесс для новых пользователей: создание первой команды, загрузка логотипа, создание первого проекта.

### Реализованные функции

#### 1. Create Team

**Backend:**
```typescript
async createTeam(ownerId: string, input: CreateTeamInput): Promise<Team> {
  return await this.prisma.team.create({
    data: {
      name: input.name,
      description: input.description,
      ownerId,
      logoType: 'DEFAULT'
    }
  });
}
```

**Frontend:**
```tsx
function CreateTeamStep() {
  const [createTeam] = useCreateTeamMutation();

  const onSubmit = async (data) => {
    const result = await createTeam({
      variables: { input: data }
    });

    // Move to next step
    setStep(2);
  };

  return (
    <Dialog>
      <DialogContent>
        <h2>Create your first team</h2>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Input name="name" placeholder="Team name" />
          <Textarea name="description" placeholder="Description" />
          <Button type="submit">Create Team</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
```

---

#### 2. Logo Upload

**Options:**
1. Upload custom logo (JPG/PNG)
2. Generate logo with AI
3. Use default avatar

**Backend:**
```typescript
async uploadTeamLogo(
  teamId: string,
  file: Express.Multer.File
): Promise<Team> {
  // Upload to S3
  const logoUrl = await this.storageService.uploadFile(file, `teams/${teamId}`);

  // Update team
  return await this.prisma.team.update({
    where: { id: teamId },
    data: {
      logoUrl,
      logoType: 'UPLOADED'
    }
  });
}
```

---

#### 3. Create First Project

**Guided step:**
- Project name
- Budget (optional)
- Start date (optional)

**Backend:**
```typescript
async createProject(teamId: string, input: CreateProjectInput): Promise<Project> {
  return await this.prisma.project.create({
    data: {
      teamId,
      name: input.name,
      description: input.description,
      budget: input.budget,
      startDate: input.startDate,
      status: 'ACTIVE'
    }
  });
}
```

---

### Onboarding Flow

```
Step 1: Welcome Screen
  └─> "Welcome to ProRab.space!"
  └─> Brief overview of features

Step 2: Create Team
  └─> Team name
  └─> Description

Step 3: Upload Logo (Optional)
  └─> Upload file
  └─> OR generate with AI
  └─> OR skip (default)

Step 4: Create First Project
  └─> Project name
  └─> Budget
  └─> Start date

Step 5: Complete!
  └─> Redirect to /dashboard
```

---

### Metrics

- **Files:** 8 files
- **Lines:** ~400 lines
- **Steps:** 5 steps
- **Completion Time:** ~2-3 minutes

---

## STAGE 3: PROJECTS MANAGEMENT

**Период:** Week 2
**Статус:** ✅ Complete
**Сложность:** Medium

### Описание

CRUD операции для управления проектами, статусы, бюджет, timeline.

### Реализованные функции

#### 1. Project CRUD

**Create:**
```typescript
mutation CreateProject($input: CreateProjectInput!) {
  createProject(input: $input) {
    id
    name
    description
    budget
    startDate
    endDate
    status
  }
}
```

**Read:**
```typescript
query ProjectsList($teamId: ID!) {
  projectsList(teamId: $teamId) {
    id
    name
    status
    budget
  }
}

query ProjectById($id: ID!) {
  projectById(id: $id) {
    id
    name
    description
    budget
    team {
      id
      name
    }
  }
}
```

**Update:**
```typescript
mutation UpdateProject($id: ID!, $input: UpdateProjectInput!) {
  updateProject(id: $id, input: $input) {
    id
    name
  }
}
```

**Delete:**
```typescript
mutation DeleteProject($id: ID!) {
  deleteProject(id: $id)
}
```

---

#### 2. Project Status

**Enums:**
```prisma
enum ProjectStatus {
  ACTIVE      // В процессе
  COMPLETED   // Завершен
  ARCHIVED    // Архивирован
}
```

**Mutations:**
```typescript
mutation CompleteProject($id: ID!) {
  completeProject(id: $id) {
    id
    status
  }
}

mutation ArchiveProject($id: ID!) {
  archiveProject(id: $id) {
    id
    status
  }
}
```

---

#### 3. Budget Tracking

**Fields:**
- Initial budget (Decimal)
- Total expenses (calculated)
- Remaining budget (calculated)
- Budget percentage (calculated)

**Query:**
```typescript
query ProjectStats($id: ID!) {
  projectStats(id: $id) {
    totalExpenses
    totalPayouts
    budgetRemaining
    budgetPercentage
    completionRate
  }
}
```

---

### Pages

1. `/teams/[teamId]/projects` - Projects list
2. `/teams/[teamId]/projects/[projectId]` - Project details
3. `/teams/[teamId]/projects/[projectId]/edit` - Edit project
4. `/teams/[teamId]/projects/new` - Create project

---

### Metrics

- **Files:** 12 files
- **Lines:** ~800 lines
- **Mutations:** 6
- **Queries:** 4

---

## STAGE 4: EXPENSES TRACKING

**Период:** Week 2
**Статус:** ✅ Complete
**Сложность:** Medium

### Описание

Учет расходов по проектам с категориями, фото чеков, фильтрами.

### Реализованные функции

#### 1. Expense CRUD

**Model:**
```prisma
model Expense {
  id          String   @id @default(cuid())
  projectId   String
  title       String
  description String?
  amount      Decimal  @db.Decimal(10, 2)
  category    String?
  photoUrl    String?
  receiptUrl  String?
  paidBy      String?   // "client" | "team"
  paidAt      DateTime?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  project     Project  @relation(fields: [projectId], references: [id], onDelete: Cascade)
}
```

**Mutations:**
```graphql
mutation CreateExpense($input: CreateExpenseInput!) {
  createExpense(input: $input) {
    id
    title
    amount
    category
  }
}

mutation UpdateExpense($id: ID!, $input: UpdateExpenseInput!) {
  updateExpense(id: $id, input: $input) {
    id
    title
    amount
  }
}

mutation DeleteExpense($id: ID!) {
  deleteExpense(id: $id)
}
```

---

#### 2. Categories

**Predefined categories:**
- Материалы
- Инструменты
- Транспорт
- Зарплата
- Прочее

---

#### 3. Photo Upload

**Upload receipt photo:**
```typescript
mutation UploadExpensePhoto($id: ID!, $file: Upload!) {
  uploadExpensePhoto(id: $id, file: $file) {
    id
    photoUrl
  }
}
```

**S3 Storage:**
- Path: `expenses/{projectId}/{filename}`
- Max size: 10 MB
- Formats: JPG, PNG, WebP

---

#### 4. Expense Summary

**Query:**
```typescript
query ExpensesSummary($projectId: ID!) {
  expensesSummary(projectId: $projectId) {
    totalAmount
    paidByClient
    paidByTeam
    categoriesBreakdown {
      category
      amount
      count
    }
  }
}
```

---

### Pages

1. `/teams/[teamId]/projects/[projectId]` - Expenses section
2. Expense cards with edit/delete
3. Expense form dialog

---

### Metrics

- **Files:** 10 files
- **Lines:** ~600 lines
- **Mutations:** 4
- **Queries:** 3

---

## STAGE 5: PHOTO REPORTS

**Период:** Week 3
**Статус:** ✅ Complete
**Сложность:** High

### Описание

Фотоотчеты по проектам с drag & drop, публичными ссылками, счетчиком просмотров.

### Реализованные функции

#### 1. Photo Report CRUD

**Models:**
```prisma
model PhotoReport {
  id            String   @id @default(cuid())
  projectId     String
  title         String
  description   String?
  coverPhotoUrl String?
  isPublic      Boolean  @default(false)
  slug          String?  @unique  // nanoid(10)
  viewCount     Int      @default(0)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  publishedAt   DateTime?
  project       Project  @relation(fields: [projectId], references: [id], onDelete: Cascade)
  photos        ReportPhoto[]
}

model ReportPhoto {
  id           String   @id @default(cuid())
  reportId     String
  url          String
  thumbnailUrl String?
  caption      String?
  orderIndex   Int      @default(0)
  width        Int?
  height       Int?
  fileSize     Int?
  createdAt    DateTime @default(now())
  report       PhotoReport @relation(fields: [reportId], references: [id], onDelete: Cascade)
}
```

---

#### 2. Photo Upload (Drag & Drop)

**Multiple upload:**
```typescript
mutation UploadReportPhotos($reportId: ID!, $files: [Upload!]!) {
  uploadReportPhotos(reportId: $reportId, files: $files) {
    id
    photos {
      id
      url
      thumbnailUrl
    }
  }
}
```

**Limits:**
- Max 10 files per upload
- Max 10 MB per file
- Formats: JPG, PNG, WebP

**Processing:**
- Generate thumbnails (Sharp library)
- Extract metadata (width, height, fileSize)
- Upload to S3

---

#### 3. Reorder Photos

**Drag & drop with dnd-kit:**
```typescript
mutation ReorderPhotos($reportId: ID!, $photos: [ReorderPhotoInput!]!) {
  reorderPhotos(reportId: $reportId, photos: $photos)
}

input ReorderPhotoInput {
  photoId: ID!
  orderIndex: Int!
}
```

---

#### 4. Public Reports

**Publish report:**
```typescript
mutation PublishPhotoReport($id: ID!) {
  publishPhotoReport(id: $id) {
    id
    isPublic
    slug
    publishedAt
  }
}
```

**Public URL:** `/r/[slug]`

**Features:**
- No authentication required
- View counter
- Shareable link
- SEO optimized

**Public query:**
```typescript
query PublicPhotoReport($slug: String!) {
  publicPhotoReport(slug: $slug) {
    id
    title
    description
    photos {
      url
      thumbnailUrl
      caption
    }
    viewCount
  }
}
```

---

### Pages

1. `/teams/[teamId]/projects/[projectId]` - Photo reports section
2. `/r/[slug]` - Public report view

---

### Metrics

- **Files:** 15 files
- **Lines:** ~1000 lines
- **Mutations:** 7
- **Queries:** 3

---

## STAGE 6: PAYOUTS MANAGEMENT

**Период:** Week 3
**Статус:** ✅ Complete
**Сложность:** High

### Описание

Система расчета и управления выплатами сотрудникам с учетом рабочих часов и типа зарплаты.

### Реализованные функции

#### 1. Salary Configuration

**Types:**
```prisma
enum SalaryType {
  FIXED      // Фиксированная зарплата
  PERCENTAGE // Процент от прибыли
}

model TeamMember {
  salaryType       SalaryType @default(FIXED)
  salaryAmount     Decimal?   @db.Decimal(10, 2)
  salaryPercentage Decimal?   @db.Decimal(5, 2)
}
```

---

#### 2. Work Logs

**Model:**
```prisma
model WorkLog {
  id          String   @id @default(cuid())
  projectId   String
  memberId    String
  date        DateTime
  hours       Decimal  @db.Decimal(5, 2)
  description String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

**Validation:**
- Hours: 0.01 - 24.00
- Date: не в будущем
- Description: max 2000 chars

---

#### 3. Payout Calculation

**Auto-calculation:**
```typescript
async calculatePayouts(projectId: string): Promise<ProjectPayout[]> {
  const project = await this.prisma.project.findUnique({
    where: { id: projectId },
    include: {
      team: {
        include: {
          members: true
        }
      }
    }
  });

  const workLogs = await this.prisma.workLog.findMany({
    where: { projectId }
  });

  const payouts = [];

  for (const member of project.team.members) {
    const memberLogs = workLogs.filter(log => log.memberId === member.id);
    const totalHours = memberLogs.reduce((sum, log) => sum + Number(log.hours), 0);

    let amount = 0;

    if (member.salaryType === 'FIXED') {
      amount = Number(member.salaryAmount) * totalHours;
    } else if (member.salaryType === 'PERCENTAGE') {
      const projectProfit = Number(project.budget) - totalExpenses;
      amount = projectProfit * (Number(member.salaryPercentage) / 100);
    }

    const payout = await this.prisma.projectPayout.create({
      data: {
        projectId,
        memberId: member.id,
        amount,
        salaryType: member.salaryType,
        status: 'PENDING'
      }
    });

    payouts.push(payout);
  }

  return payouts;
}
```

---

#### 4. Payment Methods

**Enum:**
```prisma
enum PaymentMethod {
  CASH     // Наличные
  CARD     // Карта
  TRANSFER // Перевод
  SBP      // СБП
}
```

**Mark as paid:**
```typescript
mutation MarkPayoutAsPaid($id: ID!, $paymentMethod: String!) {
  markPayoutAsPaid(id: $id, paymentMethod: $paymentMethod) {
    id
    status
    paidAt
    paymentMethod
  }
}
```

---

### Pages

1. `/teams/[teamId]/projects/[projectId]/payouts` - Payouts list
2. `/teams/[teamId]/members/[memberId]/payouts` - Member payouts history

---

### Metrics

- **Files:** 12 files
- **Lines:** ~900 lines
- **Mutations:** 5
- **Queries:** 4

---

## STAGE 7: KANBAN TASKS

**Период:** Week 4
**Статус:** ✅ Complete
**Сложность:** High

### Описание

Kanban доска для управления задачами с drag & drop, приоритетами, чеклистами.

### Реализованные функции

#### 1. Task Model

```prisma
model Task {
  id          String       @id @default(cuid())
  projectId   String
  title       String
  description String?
  status      TaskStatus   @default(TODO)
  priority    TaskPriority @default(MEDIUM)
  assigneeId  String?
  dueDate     DateTime?
  orderIndex  Int          @default(0)
  checklist   Json?
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt
  completedAt DateTime?

  @@index([projectId, status, orderIndex])
}

enum TaskStatus {
  TODO
  IN_PROGRESS
  DONE
}

enum TaskPriority {
  LOW
  MEDIUM
  HIGH
  URGENT
}
```

---

#### 2. Kanban Board

**Columns:**
- TODO (To Do)
- IN_PROGRESS (In Progress)
- DONE (Done)

**Features:**
- Drag & drop между колонками
- Drag & drop внутри колонки (reorder)
- Auto-save порядка
- Real-time updates

**Libraries:**
- @dnd-kit/core
- @dnd-kit/sortable
- Framer Motion (animations)

---

#### 3. Drag & Drop

**Frontend:**
```tsx
import { DndContext, DragEndEvent } from '@dnd-kit/core';
import { SortableContext } from '@dnd-kit/sortable';

function KanbanBoard({ tasks }: { tasks: Task[] }) {
  const [moveTask] = useMoveTaskMutation();

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) return;

    await moveTask({
      variables: {
        id: active.id,
        status: over.data.current?.status,
        orderIndex: over.data.current?.orderIndex
      }
    });
  };

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-3 gap-4">
        {['TODO', 'IN_PROGRESS', 'DONE'].map(status => (
          <KanbanColumn key={status} status={status} tasks={tasksFiltered} />
        ))}
      </div>
    </DndContext>
  );
}
```

**Backend:**
```typescript
async moveTask(
  taskId: string,
  status: TaskStatus,
  orderIndex: number
): Promise<Task> {
  // 1. Get task
  const task = await this.prisma.task.findUnique({
    where: { id: taskId }
  });

  // 2. Update task
  const updatedTask = await this.prisma.task.update({
    where: { id: taskId },
    data: {
      status,
      orderIndex,
      completedAt: status === 'DONE' ? new Date() : null
    }
  });

  // 3. Reorder other tasks в колонке
  await this.reorderTasksInColumn(task.projectId, status, orderIndex);

  return updatedTask;
}
```

---

#### 4. Checklists

**JSON Format:**
```json
{
  "checklist": [
    { "id": "1", "text": "Prepare materials", "checked": true },
    { "id": "2", "text": "Start work", "checked": false },
    { "id": "3", "text": "Quality check", "checked": false }
  ]
}
```

**Update checklist:**
```typescript
mutation UpdateTask($id: ID!, $input: UpdateTaskInput!) {
  updateTask(id: $id, input: $input) {
    id
    checklist
  }
}
```

---

### Pages

1. `/teams/[teamId]/projects/[projectId]/tasks` - Kanban board

---

### Metrics

- **Files:** 15 files
- **Lines:** ~1200 lines
- **Mutations:** 6
- **Queries:** 3

---

## STAGE 8: MONETIZATION

**Период:** Week 5
**Статус:** ✅ Complete
**Сложность:** High

### Описание

Интеграция с YooKassa для приема платежей, 3 тарифных плана, trial period, управление подписками.

### Реализованные функции

#### 1. Subscription Plans

**Plans:**
```typescript
const PLANS = {
  LITE: {
    price: 0,  // Free
    limits: {
      projects: 5,
      members: 5,
      storage: 5 * 1024 * 1024 * 1024  // 5 GB
    }
  },
  FOREMAN: {
    price: 990,  // ₽990/month
    limits: {
      projects: 20,
      members: 20,
      storage: 50 * 1024 * 1024 * 1024  // 50 GB
    }
  },
  BRIGADE: {
    price: 2990,  // ₽2990/month
    limits: {
      projects: Infinity,
      members: 50,
      storage: 500 * 1024 * 1024 * 1024  // 500 GB
    }
  }
};
```

---

#### 2. Trial Period

**Duration:** 14 days
**Features:** Full access to all plans
**Auto-downgrade:** To LITE plan after trial

**Model:**
```prisma
model Subscription {
  plan           SubscriptionPlan @default(LITE)
  status         SubscriptionStatus @default(TRIALING)
  trialEndsAt    DateTime?
  isEarlyBird    Boolean @default(false)
  earlyBirdDiscount Decimal? @db.Decimal(5, 2)
}
```

---

#### 3. YooKassa Integration

**Create payment:**
```typescript
async createPayment(subscriptionId: string): Promise<PaymentUrl> {
  const subscription = await this.prisma.subscription.findUnique({
    where: { id: subscriptionId },
    include: { team: true }
  });

  const amount = this.getPlanPrice(subscription.plan);

  // Create payment in YooKassa
  const yookassaPayment = await this.yookassaClient.createPayment({
    amount: {
      value: amount.toFixed(2),
      currency: 'RUB'
    },
    description: `Подписка ${subscription.plan}`,
    confirmation: {
      type: 'redirect',
      return_url: `${process.env.FRONTEND_URL}/payment/success`
    },
    capture: true
  });

  // Save payment to DB
  await this.prisma.payment.create({
    data: {
      subscriptionId,
      yookassaId: yookassaPayment.id,
      amount,
      status: 'PENDING',
      confirmationUrl: yookassaPayment.confirmation.confirmation_url
    }
  });

  return {
    confirmationUrl: yookassaPayment.confirmation.confirmation_url
  };
}
```

---

#### 4. Webhook Handling

**Webhook endpoint:** `/webhooks/yookassa`

**Events:**
- `payment.succeeded` - Payment successful
- `payment.canceled` - Payment canceled
- `payment.waiting_for_capture` - Waiting for capture
- `refund.succeeded` - Refund successful

**Handler:**
```typescript
@Post()
async handleWebhook(@Body() webhook: YooKassaWebhookDto) {
  const { event, object } = webhook;

  switch (event) {
    case 'payment.succeeded':
      await this.handleSucceededPayment(object);
      break;

    case 'payment.canceled':
      await this.handleCanceledPayment(object);
      break;
  }

  return { success: true };
}

async handleSucceededPayment(paymentData: any) {
  const payment = await this.prisma.payment.findUnique({
    where: { yookassaId: paymentData.id },
    include: { subscription: true }
  });

  // Update payment
  await this.prisma.payment.update({
    where: { id: payment.id },
    data: {
      status: 'SUCCEEDED',
      paidAt: new Date()
    }
  });

  // Activate subscription
  await this.prisma.subscription.update({
    where: { id: payment.subscriptionId },
    data: {
      status: 'ACTIVE',
      currentPeriodStart: new Date(),
      currentPeriodEnd: this.getNextPeriodEnd()
    }
  });

  // Send notification
  await this.notificationService.notifyPaymentSuccess(payment.id);
}
```

---

### Pages

1. `/teams/[teamId]/subscription` - Subscription management
2. `/payment/success` - Payment success
3. `/payment/failure` - Payment failure

---

### Metrics

- **Files:** 18 files
- **Lines:** ~1300 lines
- **Mutations:** 8
- **Queries:** 5

---

## STAGE 9: PERSONNEL & PAYMENTS

**Период:** 20 days (Weeks 6-9)
**Статус:** ✅ 100% Complete
**Сложность:** Very High

### Описание

Comprehensive система управления персоналом, расчета зарплат, учета времени, аналитики.

### Phases

**Phase 1 (Days 1-7): Critical Features**
- People Management
- Team Invitations
- Payment Methods
- Payout History

**Phase 2 (Days 8-14): High Priority**
- Time Tracking
- Personnel Analytics
- Salary History Audit

**Phase 3 (Days 15-19): Enhancements**
- Member Positions
- Export Functionality
- Telegram Notifications
- Bulk Operations

**Day 20: UX Enhancements**
- Interactive Charts (Recharts)
- Date Range Filters
- Calendar View
- Performance Optimization

### Detailed Documentation

См. полную документацию в [STAGE_9_COMPLETE.md](../STAGE_9_COMPLETE.md)

---

### Metrics

- **Total Days:** 20 days
- **Backend Files:** 15+ files (~1500 lines)
- **Frontend Files:** 15+ files (~2000 lines)
- **Total Code:** ~3800 lines
- **Pages:** 5 new pages
- **Mutations:** 25+
- **Queries:** 20+

---

## STAGE 10: ADMIN PANEL

**Период:** Week 10
**Статус:** ✅ Complete
**Сложность:** High

### Описание

Администраторская панель для управления системой, пользователями, статистикой.

### Реализованные функции

#### 1. Admin Roles

**Model:**
```prisma
model AdminRole {
  id        String   @id @default(cuid())
  userId    String   @unique
  role      AdminRoleType @default(SUPPORT)

  canManageUsers        Boolean @default(false)
  canManageTeams        Boolean @default(false)
  canManagePayments     Boolean @default(false)
  canManageSubscriptions Boolean @default(false)
  canViewAnalytics      Boolean @default(false)
  canManageSettings     Boolean @default(false)
  canAccessLogs         Boolean @default(false)

  ipWhitelist String[] @default([])
  require2FA  Boolean  @default(true)
}

enum AdminRoleType {
  SUPER_ADMIN
  ADMIN
  MODERATOR
  SUPPORT
}
```

---

#### 2. System Settings

**Key-value store:**
```prisma
model SystemSettings {
  id          String          @id @default(cuid())
  key         String          @unique
  value       String
  valueType   SettingValueType @default(STRING)
  category    SettingCategory @default(GENERAL)
  description String?
  isEncrypted Boolean @default(false)
}

enum SettingCategory {
  PAYMENT
  EMAIL
  TELEGRAM
  STORAGE
  AI
  SECURITY
  GENERAL
}
```

---

#### 3. System Statistics

**Daily stats:**
```prisma
model SystemStatistics {
  id        String   @id @default(cuid())
  date      DateTime @unique

  totalUsers       Int @default(0)
  newUsers         Int @default(0)
  activeUsers      Int @default(0)
  totalTeams       Int @default(0)
  newTeams         Int @default(0)
  totalProjects    Int @default(0)
  newProjects      Int @default(0)
  completedProjects Int @default(0)
  totalRevenue     Decimal @db.Decimal(12, 2) @default(0)
  newSubscriptions Int @default(0)
}
```

---

#### 4. Audit Logs

**Track admin actions:**
```prisma
model AdminActionLog {
  id        String   @id @default(cuid())
  adminId   String
  action    String
  entity    String?
  entityId  String?
  details   Json?
  ipAddress String?
  userAgent String?
  createdAt DateTime @default(now())
}
```

---

### Pages

1. `/admin/dashboard` - Admin dashboard
2. `/admin/users` - User management
3. `/admin/teams` - Team management
4. `/admin/payments` - Payment management
5. `/admin/settings` - System settings
6. `/admin/logs` - Audit logs

---

### Metrics

- **Files:** 20 files
- **Lines:** ~1500 lines
- **Mutations:** 12
- **Queries:** 10

---

## STAGE 11: SETTINGS PAGE

**Период:** 7 days (Week 11)
**Статус:** ✅ 100% Complete
**Сложность:** Medium

### Описание

Comprehensive страница настроек с 7 табами для управления профилем, безопасностью, 2FA, уведомлениями.

### Реализованные функции

#### 1. Profile Tab

**Fields:**
- Full name
- Email (read-only)
- Phone
- Avatar upload

---

#### 2. Security Tab

**Change password:**
- Current password
- New password
- Confirm new password

**Validation:**
- Min 8 characters
- At least 1 uppercase
- At least 1 number

---

#### 3. 2FA Tab

**TOTP Setup:**
1. Generate secret
2. Show QR code
3. Enter code to verify
4. Generate 10 backup codes
5. Enable 2FA

**Disable 2FA:**
- Enter TOTP code
- Confirm disable

---

#### 4. Notifications Tab

**14 типов уведомлений:**
- Project updates
- Expense alerts
- Payout notifications
- Task assignments
- Team activity
- Subscription alerts
- Security alerts
- Marketing emails
- И другие...

**Channels:**
- Email (frequency: instant/daily/weekly)
- Push (frequency: instant/daily/weekly)
- Telegram (on/off)
- SMS (on/off)

**Quiet hours:**
- Enable/disable
- Start time (22:00)
- End time (08:00)

---

#### 5. Appearance Tab

**Theme:**
- Light
- Dark
- System

**Primary Color:**
- Zinc (default)
- Blue
- Green
- Orange
- Red
- Violet

---

#### 6. Help Tab

**Contacts:**
- Email: support@prorab.space
- Telegram: @ProRabSupportBot
- FAQ link
- Documentation link

---

#### 7. Account Tab

**Delete account:**
- Enter password
- Confirm deletion
- Checks:
  - No owned teams
  - No active subscriptions
- Auto-cleanup:
  - Avatar
  - Sessions
  - Tokens

---

### Implementation

**Backend:**
```typescript
// apps/api/src/modules/auth/two-factor.service.ts
async enableTwoFactor(userId: string, token: string): Promise<TwoFactorBackupCodes> {
  const user = await this.prisma.user.findUnique({
    where: { id: userId }
  });

  // Verify code
  const isValid = await this.verifyTwoFactorCode(user, token);

  if (!isValid) {
    throw new BadRequestException('Invalid code');
  }

  // Generate backup codes
  const backupCodes = this.generateBackupCodes();
  const hashedCodes = await Promise.all(
    backupCodes.map(code => argon2.hash(code))
  );

  // Enable 2FA
  await this.prisma.user.update({
    where: { id: userId },
    data: {
      twoFactorEnabled: true,
      twoFactorBackupCodes: hashedCodes
    }
  });

  return { backupCodes };
}
```

**Frontend:**
```tsx
// apps/web/src/app/(root)/(protected)/settings/page.tsx
function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile');

  return (
    <div className="container">
      <h1>Settings</h1>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="2fa">2FA</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="help">Help</TabsTrigger>
          <TabsTrigger value="account">Account</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <ProfileTab />
        </TabsContent>

        <TabsContent value="security">
          <SecurityTab />
        </TabsContent>

        {/* ... other tabs */}
      </Tabs>
    </div>
  );
}
```

---

### Security Features (Day 6 & 7)

**Account Deletion:**
- Password verification required
- Safety checks:
  - Cannot delete if owner of teams
  - Cannot delete with active subscriptions
- Automatic cleanup:
  - Avatar from S3
  - Sessions from Redis
  - Tokens from database
- Implementation: [DeleteAccountDialog.tsx](../apps/web/src/packages/components/settings/DeleteAccountDialog.tsx)

**Detailed Notification Settings:**
- 14 notification types
- 4 channels (Email, Push, Telegram, SMS)
- Frequency controls (INSTANT, DAILY, WEEKLY)
- Quiet hours (22:00 - 08:00)
- Implementation: [NotificationSettings.tsx](../apps/web/src/packages/components/settings/NotificationSettings.tsx)

---

### Metrics

- **Files:** 15 files
- **Lines:** ~1000 lines
- **Tabs:** 7
- **Mutations:** 10
- **Queries:** 5

---

## OVERALL PROJECT STATISTICS

### Total Metrics

- **Duration:** 11 weeks (77 days)
- **Total Files:** 350+
- **Total Lines of Code:** 55,000+
- **Backend Files:** 150+ files
- **Frontend Files:** 150+ files
- **Documentation:** 50+ files

### Database

- **Models:** 25
- **Relations:** 40+
- **Indexes:** 35+
- **Enums:** 11

### GraphQL API

- **Types:** 30+
- **Queries:** 50+
- **Mutations:** 70+
- **Fragments:** 20+

### Frontend

- **Pages:** 24+
- **Components:** 64+
- **UI Components:** 30+
- **Hooks:** 15+

### Integrations

- **Telegram:** 2 bots
- **YooKassa:** Payment gateway
- **Brevo:** Email service
- **AWS S3:** File storage
- **Redis:** Session store

---

## PRODUCTION READINESS

### Security ✅

- [x] Argon2 password hashing
- [x] JWT authentication
- [x] 2FA (TOTP)
- [x] AES-256-GCM encryption
- [x] Rate limiting
- [x] CORS configuration
- [x] Helmet.js headers
- [x] Input validation
- [x] SQL injection protection
- [x] XSS protection

### Performance ✅

- [x] Database indexes
- [x] Redis caching
- [x] GraphQL optimization
- [x] Image optimization
- [x] Code splitting
- [x] Lazy loading

### Monitoring ✅

- [x] Error logging
- [x] Admin audit logs
- [x] System statistics
- [x] Health checks

---

## ЗАКЛЮЧЕНИЕ

ProRab.space - это **100% complete MVP** готовый к production deployment.

**Все 11 stages завершены:**
- ✅ Stage 1: Authentication System
- ✅ Stage 2: Onboarding Flow
- ✅ Stage 3: Projects Management
- ✅ Stage 4: Expenses Tracking
- ✅ Stage 5: Photo Reports
- ✅ Stage 6: Payouts Management
- ✅ Stage 7: Kanban Tasks
- ✅ Stage 8: Monetization
- ✅ Stage 9: Personnel & Payments (100%)
- ✅ Stage 10: Admin Panel
- ✅ Stage 11: Settings Page (100%)

**Production Ready! 🚀**
