# Stage 17: Email Notifications & Automation

**Дата начала:** TBD
**Дата завершения:** TBD
**Статус:** ⏳ PLANNED
**Версия:** v1.2.0
**Приоритет:** P0 - CRITICAL
**Длительность:** 8-10 рабочих дней (1-2 недели)

---

## 📋 ОБЗОР

Stage 17 направлен на устранение критической зависимости от Telegram как единственного канала уведомлений путём внедрения полноценной email-системы и автоматизации ключевых бизнес-процессов. Этот Stage разблокирует рост платформы, обеспечивая надёжную коммуникацию с пользователями через email и автоматизируя повторяющиеся задачи, такие как выплаты зарплат.

### Ключевые цели
1. **Внедрить email уведомления** через Resend/SendGrid
2. **Автоматизировать выплаты** (recurring payouts)
3. **Создать систему очередей** для надёжной доставки уведомлений
4. **Построить библиотеку email-шаблонов** с брендингом
5. **Дать пользователям контроль** через preference center

### Бизнес-ценность
- **Снижение зависимости** от одного канала (Telegram)
- **Повышение retention** за счёт своевременных уведомлений
- **Автоматизация** рутинных задач (экономия времени для владельцев команд)
- **Профессиональный имидж** через брендированные email
- **Compliance** - audit trail всех коммуникаций

---

## 🎯 SCOPE & DELIVERABLES

### Что БУДЕТ реализовано ✅

#### 1. Email Provider Integration
- ✅ Интеграция с Resend (основной) или SendGrid (запасной)
- ✅ SMTP конфигурация через SystemSettings
- ✅ Шифрование API ключей (AES-256-GCM)
- ✅ Email верификация отправителя (SPF, DKIM, DMARC)
- ✅ Fallback механизм при сбое провайдера

#### 2. Email Templates Library
- ✅ Базовые шаблоны (10+ типов):
  - Welcome email
  - Email verification
  - Password reset
  - Payout notification
  - Expense approved/rejected
  - Project status change
  - Team invitation
  - Subscription renewal reminder
  - Payment failed
  - Trial ending soon
- ✅ Брендирование (logo, цвета, footer)
- ✅ Поддержка переменных ({{userName}}, {{amount}}, etc.)
- ✅ HTML + plain text версии
- ✅ Мультиязычность (ru-RU основной)

#### 3. Notification Queue System
- ✅ Bull/BullMQ для очереди уведомлений
- ✅ Retry logic с экспоненциальным backoff
- ✅ Dead letter queue для failed notifications
- ✅ Priority levels (URGENT, HIGH, NORMAL, LOW)
- ✅ Rate limiting (избежать ban от провайдера)
- ✅ Batch processing для массовых рассылок

#### 4. Recurring Payouts Automation
- ✅ Cron jobs для периодических выплат (ежемесячно, еженедельно)
- ✅ Automatic payout calculation
- ✅ Payment batch processing
- ✅ Email уведомления о выплате
- ✅ Audit trail всех автоматических операций
- ✅ Manual override capability

#### 5. User Preference Center
- ✅ UI для управления уведомлениями
- ✅ Включение/выключение по каналам (email/Telegram/SMS)
- ✅ Настройка частоты (immediate, daily digest, weekly)
- ✅ Категории уведомлений (финансы, проекты, система)
- ✅ Мгновенное сохранение (без reload страницы)

### Что НЕ БУДЕТ реализовано ❌
- ❌ SMS уведомления (отложено до Stage 24)
- ❌ Push notifications (отложено до Stage 18 - Mobile App)
- ❌ Email campaigns/newsletters (маркетинг - отложено)
- ❌ A/B тестирование email шаблонов
- ❌ Advanced analytics (open rate, click rate)

---

## 📊 TECHNICAL ARCHITECTURE

### Database Models (Prisma Schema)

```prisma
// New models

model EmailLog {
  id          String   @id @default(uuid())
  userId      String   @map("user_id")
  to          String   @db.VarChar(255)
  from        String   @db.VarChar(255)
  subject     String   @db.VarChar(500)
  template    String   @db.VarChar(100)
  variables   Json?
  status      EmailStatus
  providerId  String?  @map("provider_id") @db.VarChar(100)
  error       String?  @db.Text
  sentAt      DateTime? @map("sent_at")
  createdAt   DateTime @default(now()) @map("created_at")

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([status])
  @@index([createdAt])
  @@map("email_logs")
}

enum EmailStatus {
  PENDING
  SENT
  FAILED
  BOUNCED
  DELIVERED
}

model RecurringPayout {
  id          String   @id @default(uuid())
  teamId      String   @map("team_id")
  memberId    String   @map("member_id")
  amount      Decimal  @db.Decimal(10, 2)
  frequency   PayoutFrequency
  nextRunDate DateTime @map("next_run_date")
  isActive    Boolean  @default(true) @map("is_active")
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  team   Team       @relation(fields: [teamId], references: [id], onDelete: Cascade)
  member TeamMember @relation(fields: [memberId], references: [id], onDelete: Cascade)

  @@index([teamId])
  @@index([nextRunDate])
  @@map("recurring_payouts")
}

enum PayoutFrequency {
  WEEKLY
  BIWEEKLY
  MONTHLY
  QUARTERLY
}

// Update existing NotificationSettings model
model NotificationSettings {
  // ... existing fields
  emailEnabled        Boolean @default(true) @map("email_enabled")
  emailFrequency      NotificationFrequency @default(IMMEDIATE) @map("email_frequency")
  emailCategories     String[] @default(["financial", "projects", "system"]) @map("email_categories")
}

enum NotificationFrequency {
  IMMEDIATE
  HOURLY
  DAILY
  WEEKLY
}
```

### Backend Services

#### 1. `EmailService` (`apps/api/src/core/email/email.service.ts`)
```typescript
@Injectable()
export class EmailService {
  constructor(
    private prisma: PrismaService,
    private systemSettings: SystemSettingsService,
    private queue: Queue
  ) {}

  async sendEmail(dto: SendEmailDto): Promise<EmailLog>
  async sendTemplateEmail(template: string, to: string, variables: Record<string, any>): Promise<EmailLog>
  async getProvider(): Promise<EmailProvider>
  async verifyProvider(): Promise<boolean>
  async getEmailLogs(filter: EmailLogFilter): Promise<EmailLog[]>
  async retryFailedEmail(id: string): Promise<EmailLog>
}
```

#### 2. `EmailTemplateService` (`apps/api/src/core/email/email-template.service.ts`)
```typescript
@Injectable()
export class EmailTemplateService {
  async renderTemplate(name: string, variables: Record<string, any>): Promise<string>
  async getTemplate(name: string): Promise<EmailTemplate>
  async createTemplate(dto: CreateEmailTemplateDto): Promise<EmailTemplate>
  async updateTemplate(id: string, dto: UpdateEmailTemplateDto): Promise<EmailTemplate>
  async deleteTemplate(id: string): Promise<boolean>
  async listTemplates(): Promise<EmailTemplate[]>
}
```

#### 3. `NotificationQueueService` (`apps/api/src/core/notifications/notification-queue.service.ts`)
```typescript
@Injectable()
export class NotificationQueueService {
  async addToQueue(notification: NotificationDto): Promise<void>
  async processQueue(): Promise<void>
  async retryFailed(id: string): Promise<void>
  async clearQueue(): Promise<void>
  async getQueueStats(): Promise<QueueStats>
}
```

#### 4. `RecurringPayoutService` (`apps/api/src/modules/payouts/recurring-payout.service.ts`)
```typescript
@Injectable()
export class RecurringPayoutService {
  async createRecurringPayout(dto: CreateRecurringPayoutDto): Promise<RecurringPayout>
  async updateRecurringPayout(id: string, dto: UpdateRecurringPayoutDto): Promise<RecurringPayout>
  async deleteRecurringPayout(id: string): Promise<boolean>
  async getRecurringPayouts(teamId: string): Promise<RecurringPayout[]>
  async processScheduledPayouts(): Promise<ProcessResult>
  async pauseRecurring(id: string): Promise<RecurringPayout>
  async resumeRecurring(id: string): Promise<RecurringPayout>
}
```

### GraphQL API

#### Mutations
```graphql
# Email Management
sendTestEmail(to: String!): Boolean!
updateEmailSettings(input: UpdateEmailSettingsInput!): SystemSettings!

# Notification Preferences
updateNotificationPreferences(input: UpdateNotificationPreferencesInput!): NotificationSettings!

# Recurring Payouts
createRecurringPayout(input: CreateRecurringPayoutInput!): RecurringPayout!
updateRecurringPayout(id: ID!, input: UpdateRecurringPayoutInput!): RecurringPayout!
deleteRecurringPayout(id: ID!): Boolean!
pauseRecurringPayout(id: ID!): RecurringPayout!
resumeRecurringPayout(id: ID!): RecurringPayout!
```

#### Queries
```graphql
# Email Logs
emailLogs(filter: EmailLogFilterInput, pagination: PaginationInput): EmailLogsConnection!
emailLog(id: ID!): EmailLog!
emailStats: EmailStats!

# Notification Settings
myNotificationSettings: NotificationSettings!

# Recurring Payouts
recurringPayouts(teamId: ID!): [RecurringPayout!]!
recurringPayout(id: ID!): RecurringPayout!
```

### Frontend Components

#### 1. `NotificationPreferences` (`apps/web/src/app/(root)/(protected)/settings/notifications/page.tsx`)
- Toggles для каналов (email, Telegram, SMS)
- Частота уведомлений (immediate, daily, weekly)
- Категории (финансы, проекты, система)

#### 2. `RecurringPayoutsList` (`apps/web/src/packages/components/payouts/RecurringPayoutsList.tsx`)
- Список автоматических выплат
- Кнопки pause/resume/delete
- Создание новой выплаты

#### 3. `EmailLogsViewer` (`apps/web/src/app/(root)/(protected)/admin/email-logs/page.tsx`)
- Таблица отправленных email
- Фильтры (статус, дата, получатель)
- Retry кнопка для failed

---

## 🔧 IMPLEMENTATION PHASES

### Day 1-2: Email Provider Setup & Integration
**Backend:**
- [ ] Install dependencies (`@resend/node` or `@sendgrid/mail`, `nodemailer`)
- [ ] Create `EmailService` with provider abstraction
- [ ] Add SMTP configuration to `SystemSettings`
- [ ] Implement encryption for API keys
- [ ] Test email sending (basic SMTP test)

**Configuration:**
- [ ] Setup Resend account + API key
- [ ] Configure DNS records (SPF, DKIM, DMARC)
- [ ] Verify sender domain

**Estimated:** ~12-16 hours

---

### Day 3-4: Email Templates & Queue System
**Backend:**
- [ ] Create `EmailTemplateService`
- [ ] Build 10 base templates (Handlebars/EJS)
- [ ] Add branding support (logo, colors, footer)
- [ ] Setup Bull/BullMQ for notification queue
- [ ] Implement retry logic с exponential backoff
- [ ] Create dead letter queue

**Database:**
- [ ] Run migration for `EmailLog` model
- [ ] Add indexes for performance

**Estimated:** ~14-18 hours

---

### Day 5-6: Recurring Payouts Automation
**Backend:**
- [ ] Create `RecurringPayoutService`
- [ ] Implement cron jobs (`@nestjs/schedule`)
- [ ] Auto-calculation logic
- [ ] Batch payment processing
- [ ] Email notifications on payout
- [ ] Audit logging

**Database:**
- [ ] Run migration for `RecurringPayout` model
- [ ] Add `Team.recurringPayouts` relation

**GraphQL:**
- [ ] Add mutations/queries for recurring payouts
- [ ] Create GraphQL types

**Estimated:** ~12-16 hours

---

### Day 7: User Preference Center UI
**Frontend:**
- [ ] Create `NotificationPreferences` page
- [ ] Channel toggles (email/Telegram/SMS)
- [ ] Frequency selector (immediate/hourly/daily/weekly)
- [ ] Category checkboxes (финансы, проекты, система)
- [ ] "Test email" button
- [ ] Auto-save на change

**GraphQL:**
- [ ] `updateNotificationPreferences` mutation
- [ ] `myNotificationSettings` query

**Estimated:** ~6-8 hours

---

### Day 8: Recurring Payouts UI
**Frontend:**
- [ ] Create `RecurringPayoutsList` component
- [ ] Table с колонками (member, amount, frequency, next run)
- [ ] "Create Recurring Payout" dialog
- [ ] Pause/Resume/Delete actions
- [ ] Confirmation dialogs

**GraphQL:**
- [ ] Frontend operations file
- [ ] Code generation

**Estimated:** ~6-8 hours

---

### Day 9: Admin Email Logs Viewer
**Frontend:**
- [ ] Create `/admin/email-logs` page
- [ ] Table с фильтрами (status, date, recipient)
- [ ] Search by email/subject
- [ ] "Retry" button для failed
- [ ] Email preview modal

**Backend:**
- [ ] Admin resolver methods
- [ ] Permission guards

**Estimated:** ~4-6 hours

---

### Day 10: Testing & Deployment
**Testing:**
- [ ] Unit tests для EmailService
- [ ] Integration tests для queue system
- [ ] E2E tests для UI flows
- [ ] Load testing (queue processing)

**Deployment:**
- [ ] Environment variables setup (`.env.production`)
- [ ] Database migration на production
- [ ] Smoke tests на staging
- [ ] Production deployment
- [ ] Monitoring setup (email delivery rate)

**Documentation:**
- [ ] Update README с новыми env vars
- [ ] Create email template guide
- [ ] Admin guide для email logs

**Estimated:** ~8-10 hours

---

## 📊 METRICS & DELIVERABLES

### Code Metrics
- **New Files:** ~15 files
- **Lines of Code:** ~2,500 LOC
  - Backend services: ~1,200 LOC
  - Frontend components: ~800 LOC
  - Email templates: ~400 LOC
  - Tests: ~100 LOC

### Database Changes
- **New Models:** 2 (EmailLog, RecurringPayout)
- **Updated Models:** 1 (NotificationSettings)
- **New Enums:** 2 (EmailStatus, PayoutFrequency, NotificationFrequency)
- **Migrations:** 1 migration file

### API Changes
- **New Mutations:** 7
- **New Queries:** 5
- **GraphQL Types:** 8 new ObjectTypes, 4 InputTypes

### UI Changes
- **New Pages:** 2 (`/settings/notifications`, `/admin/email-logs`)
- **New Components:** 3 (NotificationPreferences, RecurringPayoutsList, EmailLogsViewer)

---

## 📝 DEPLOYMENT CHECKLIST

### Pre-Deployment
- [ ] Resend/SendGrid account created & verified
- [ ] DNS records configured (SPF, DKIM, DMARC)
- [ ] Environment variables documented
- [ ] Database migration tested on staging
- [ ] Bull/BullMQ Redis instance configured
- [ ] Cron jobs schedule validated

### Deployment Steps
1. [ ] Deploy database migration
2. [ ] Update environment variables (RESEND_API_KEY, SMTP_HOST, etc.)
3. [ ] Deploy backend API
4. [ ] Deploy frontend
5. [ ] Run smoke tests
6. [ ] Monitor email logs for first 24h

### Post-Deployment
- [ ] Verify email delivery (send test emails)
- [ ] Check queue processing (Bull dashboard)
- [ ] Monitor cron job execution
- [ ] Setup alerts (failed email threshold)
- [ ] Update user-facing documentation

---

## ✅ SUCCESS CRITERIA

### Functional
- ✅ Email уведомления доставляются успешно (>95% delivery rate)
- ✅ Recurring payouts выполняются по расписанию
- ✅ Users могут управлять своими предпочтениями
- ✅ Queue обрабатывает 1000+ emails/hour
- ✅ Failed emails автоматически retry

### Non-Functional
- ✅ Email delivery latency < 30 секунд (p95)
- ✅ Queue processing latency < 5 минут (p95)
- ✅ Zero data loss в очереди (persistent storage)
- ✅ Admin может просматривать все email logs
- ✅ GDPR compliance (user can opt-out)

### Business
- ✅ Снижение зависимости от Telegram на 50%+
- ✅ Автоматизация 80%+ recurring payouts
- ✅ Профессиональные branded emails
- ✅ Audit trail всех коммуникаций

---

## 🔄 ROLLBACK PLAN

### Критические проблемы
1. **Email provider unavailable** → Fallback to Telegram notifications
2. **Queue overload** → Pause new jobs, process backlog
3. **Cron job failures** → Manual payout processing
4. **Data corruption** → Restore from backup, disable feature

### Rollback Steps
1. [ ] Disable cron jobs (`@nestjs/schedule`)
2. [ ] Pause email queue processing
3. [ ] Revert database migration (если необходимо)
4. [ ] Switch notification channel to Telegram only
5. [ ] Notify users of temporary service disruption
6. [ ] Investigate root cause
7. [ ] Deploy fix
8. [ ] Gradually re-enable features

### Monitoring
- Email delivery rate dashboard
- Queue depth alerts (>1000 pending jobs)
- Cron job execution logs
- Failed email threshold alerts (>5% failure rate)

---

## 📚 REFERENCES

### Related Documentation
- [Stage 16: Advanced Team & Role Management](./STAGE_16_ADVANCED_TEAM_MANAGEMENT.md)
- [ROADMAP: Short-term (v1.x)](../roadmaps/ROADMAP_SHORT_TERM_v1.x.md)

### External Resources
- [Resend Documentation](https://resend.com/docs)
- [Bull Documentation](https://docs.bullmq.io/)
- [NestJS Scheduling](https://docs.nestjs.com/techniques/task-scheduling)

### Critical Files
- `apps/api/src/core/email/email.service.ts` - Email sending service
- `apps/api/src/core/notifications/notification-queue.service.ts` - Queue management
- `apps/api/src/modules/payouts/recurring-payout.service.ts` - Recurring payouts
- `apps/web/src/app/(root)/(protected)/settings/notifications/page.tsx` - User preferences UI

---

## 📈 RISK ASSESSMENT

### High Risk
- 🔴 **Email deliverability issues** - Mitigation: Proper DNS config, warm-up period
- 🔴 **Queue overwhelm on launch** - Mitigation: Rate limiting, batch processing
- 🔴 **Cron job timezone issues** - Mitigation: UTC timestamps, thorough testing

### Medium Risk
- 🟡 **Template rendering bugs** - Mitigation: Extensive test coverage
- 🟡 **Provider API changes** - Mitigation: Version pinning, abstraction layer

### Low Risk
- 🟢 **UI/UX preferences complexity** - Mitigation: Simple, intuitive interface

---

**Дата создания документа:** 2025-12-23
**Версия документа:** 1.0
**Автор:** ProRab.space Development Team
