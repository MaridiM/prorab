# Stage 11: Settings Page - Complete Implementation Plan

**Дата создания:** 2025-12-12
**Версия:** 1.0
**Приоритет:** P1 - High (Important for MVP)
**Оценка времени:** 5-7 дней

---

## 📊 Executive Summary

**Текущее состояние:** 75% Complete
**Анализированный код:** 2088 строк в `apps/web/src/app/(root)/(protected)/settings/page.tsx`
**Что работает:** 5 из 7 табов полностью функциональны
**Что нужно:** Доработать 2 таба + добавить недостающие функции

**Основано на анализе:** `docs/analisys/STAGE_SETTINGS_IMPROVEMENTS.md`

---

## 🎯 Цели Stage 11

### Главная цель
Завершить реализацию Settings page до production-ready состояния с полным функционалом управления профилем, безопасностью, уведомлениями и подпиской.

### Критерии успеха
- ✅ Все 7 табов полностью функциональны (без "В разработке" заглушек)
- ✅ Загрузка аватара работает с превью и удалением
- ✅ Telegram интеграция доступна в UI
- ✅ Управление подпиской (смена плана, отмена) работает
- ✅ 2FA реализована полностью
- ✅ Детальные настройки уведомлений
- ✅ Удаление аккаунта выполняется корректно
- ✅ Все изменения логируются в Activity Log

---

## 📋 Текущее состояние (Detailed Analysis)

### ✅ Что уже работает (75%)

#### 1. Profile Tab - 80% Complete
**Работает:**
- ✅ Редактирование имени (firstName, lastName)
- ✅ Редактирование email
- ✅ Редактирование телефона
- ✅ Отображение аватара (если есть)
- ✅ GraphQL mutation `updateProfile` существует

**Не работает:**
- ❌ Загрузка аватара (показывает toast "В разработке")
- ❌ Удаление аватара
- ❌ Превью перед загрузкой
- ❌ Crop/resize изображения

#### 2. Security Tab - 90% Complete
**Работает:**
- ✅ Смена пароля (с текущим паролем)
- ✅ Показ даты последней смены пароля
- ✅ GraphQL mutation `changePassword` работает

**Не работает:**
- ❌ 2FA (Two-Factor Authentication) - полностью отсутствует
- ❌ Удаление аккаунта (кнопка показывает toast "В разработке")
- ❌ Список активных сессий
- ❌ Отзыв доступа для других устройств

#### 3. Notifications Tab - 70% Complete
**Работает:**
- ✅ Базовые переключатели (email, push, telegram)
- ✅ GraphQL mutation `updateNotificationSettings`

**Не работает:**
- ❌ Детальные настройки по типам событий
- ❌ Настройка частоты уведомлений (instant, daily, weekly)
- ❌ Превью уведомлений
- ❌ Тестовая отправка уведомления

#### 4. Subscription Tab - 85% Complete
**Работает:**
- ✅ Отображение текущего плана
- ✅ Показ даты следующего платежа
- ✅ Отображение лимитов (проекты, участники, хранилище)
- ✅ Usage progress bars

**Не работает:**
- ❌ Смена тарифного плана (нет UI для выбора)
- ❌ Отмена подписки (нет кнопки)
- ❌ История платежей (есть отдельная страница, но нет линка)
- ❌ Реактивация отменённой подписки

#### 5. Appearance Tab - 100% Complete ✅
**Полностью работает:**
- ✅ Переключение темы (light/dark/system)
- ✅ Выбор акцентного цвета
- ✅ Выбор шрифта
- ✅ Настройка размера шрифта
- ✅ Сохранение в localStorage через next-themes

#### 6. Help Tab - 100% Complete ✅
**Полностью работает:**
- ✅ FAQ categories с аккордеоном
- ✅ Контактная форма
- ✅ Ссылки на документацию
- ✅ Статус поддержки (Support Bot)

#### 7. About Tab - 100% Complete ✅
**Полностью работает:**
- ✅ Версия приложения
- ✅ Changelog ссылка
- ✅ Privacy Policy
- ✅ Terms of Service
- ✅ Лицензия

---

## 🚀 План реализации (3 Phases)

### Phase 1: Critical Features (P0) - 3 дня

#### Day 1: Avatar Upload & Management
**Время:** 1 день
**Приоритет:** P0 - Critical

**Backend (4 часа):**
1. **File Upload Setup**
   - Установить `@nestjs/platform-express` + `multer`
   - Создать `FileUploadModule` с конфигурацией
   - Настроить storage (местный или S3)
   - Добавить валидацию (max 5MB, только images)

2. **Avatar Upload Endpoint**
   ```typescript
   // apps/api/src/modules/users/users.resolver.ts
   @Mutation(() => User)
   @UseGuards(AuthGuard)
   async uploadAvatar(
     @CurrentUser() user: User,
     @Args('file', { type: () => GraphQLUpload }) file: FileUpload,
   ): Promise<User>
   ```

3. **Avatar Delete Endpoint**
   ```typescript
   @Mutation(() => User)
   @UseGuards(AuthGuard)
   async deleteAvatar(@CurrentUser() user: User): Promise<User>
   ```

4. **User Model Update**
   ```prisma
   model User {
     avatarUrl String?
   }
   ```

**Frontend (4 часа):**
1. **Avatar Upload Component**
   ```tsx
   // apps/web/src/packages/components/settings/AvatarUpload.tsx
   - File input с drag & drop
   - Image preview перед загрузкой
   - Crop modal (react-image-crop)
   - Upload progress bar
   - Delete confirmation dialog
   ```

2. **GraphQL Integration**
   ```graphql
   mutation UploadAvatar($file: Upload!) {
     uploadAvatar(file: $file) {
       id
       avatarUrl
     }
   }

   mutation DeleteAvatar {
     deleteAvatar {
       id
       avatarUrl
     }
   }
   ```

3. **Update Settings Page**
   - Заменить toast на реальную логику
   - Добавить AvatarUpload component
   - Обновить cache после upload/delete

**Acceptance Criteria:**
- ✅ Можно загрузить аватар (JPG, PNG, max 5MB)
- ✅ Превью показывается перед сохранением
- ✅ Crop modal позволяет обрезать изображение
- ✅ Аватар отображается в header после загрузки
- ✅ Можно удалить аватар с подтверждением
- ✅ Старый аватар удаляется при загрузке нового

---

#### Day 2: Telegram Integration UI
**Время:** 1 день
**Приоритет:** P0 - Critical

**Backend (2 часа):**
1. **Check Telegram Connection**
   ```typescript
   // apps/api/src/modules/users/users.resolver.ts
   @Query(() => TelegramConnectionStatus)
   @UseGuards(AuthGuard)
   async telegramConnectionStatus(
     @CurrentUser() user: User,
   ): Promise<TelegramConnectionStatus>
   ```

2. **Disconnect Telegram**
   ```typescript
   @Mutation(() => User)
   @UseGuards(AuthGuard)
   async disconnectTelegram(@CurrentUser() user: User): Promise<User>
   ```

**Frontend (6 часов):**
1. **Telegram Settings Section**
   ```tsx
   // Add to Notifications Tab
   <Card>
     <CardHeader>
       <CardTitle>Telegram Integration</CardTitle>
       <CardDescription>
         Получайте уведомления и управляйте проектами через Telegram
       </CardDescription>
     </CardHeader>
     <CardContent>
       {telegramConnected ? (
         <TelegramConnectedCard user={user} />
       ) : (
         <TelegramConnectButton />
       )}
     </CardContent>
   </Card>
   ```

2. **TelegramConnectedCard Component**
   ```tsx
   - Показывает Telegram username
   - Кнопка "Disconnect" с подтверждением
   - Статус бота (активен/неактивен)
   - Ссылка на @ProRabSpaceBot
   ```

3. **TelegramConnectButton Component**
   ```tsx
   - Кнопка "Connect Telegram"
   - Открывает @ProRabSpaceBot с deep link
   - Polling для проверки подключения
   - Success toast после подключения
   ```

**GraphQL:**
```graphql
type TelegramConnectionStatus {
  isConnected: Boolean!
  telegramUsername: String
  telegramChatId: String
  connectedAt: DateTime
}

query TelegramConnectionStatus {
  telegramConnectionStatus {
    isConnected
    telegramUsername
    connectedAt
  }
}

mutation DisconnectTelegram {
  disconnectTelegram {
    id
    telegramChatId
  }
}
```

**Acceptance Criteria:**
- ✅ В Notifications Tab есть секция Telegram Integration
- ✅ Показывается статус подключения (connected/disconnected)
- ✅ Кнопка "Connect" открывает @ProRabSpaceBot
- ✅ После авторизации в боте статус обновляется автоматически
- ✅ Можно отключить Telegram с подтверждением
- ✅ После отключения telegramChatId удаляется из User

---

#### Day 3: Subscription Management
**Время:** 1 день
**Приоритет:** P0 - Critical

**Backend (3 часа):**
1. **Change Plan Mutation** (уже существует, нужно проверить)
   ```typescript
   @Mutation(() => Subscription)
   @UseGuards(AuthGuard)
   async changePlan(
     @Args('input') input: ChangePlanInput,
     @CurrentUser() user: User,
   ): Promise<Subscription>
   ```

2. **Cancel Subscription Mutation** (уже существует)
   ```typescript
   @Mutation(() => Subscription)
   @UseGuards(AuthGuard)
   async cancelSubscription(
     @CurrentUser() user: User,
   ): Promise<Subscription>
   ```

3. **Reactivate Subscription Mutation**
   ```typescript
   @Mutation(() => Subscription)
   @UseGuards(AuthGuard)
   async reactivateSubscription(
     @CurrentUser() user: User,
   ): Promise<Subscription>
   ```

**Frontend (5 часов):**
1. **ChangePlanDialog Component**
   ```tsx
   // apps/web/src/packages/components/subscription/ChangePlanDialog.tsx
   - Dialog с выбором плана (LITE, FOREMAN, BRIGADE)
   - Сравнение текущего и нового плана
   - Расчёт стоимости (prorated)
   - Подтверждение смены
   - Обработка ошибок (недостаточно средств, downgrade не разрешён)
   ```

2. **CancelSubscriptionDialog Component**
   ```tsx
   // apps/web/src/packages/components/subscription/CancelSubscriptionDialog.tsx
   - Alert dialog с предупреждением
   - Выбор причины отмены (dropdown)
   - Опциональный feedback (textarea)
   - Подтверждение отмены
   - Показ даты окончания доступа
   ```

3. **Update Subscription Tab**
   ```tsx
   // Add buttons:
   - "Change Plan" → открывает ChangePlanDialog
   - "Cancel Subscription" → открывает CancelSubscriptionDialog
   - "View Payment History" → router.push('/teams/[teamId]/subscription')

   // For cancelled subscriptions:
   - "Reactivate" button
   - Countdown до окончания доступа
   ```

**GraphQL:**
```graphql
input ChangePlanInput {
  newPlan: SubscriptionPlan!
}

mutation ChangePlan($input: ChangePlanInput!) {
  changePlan(input: $input) {
    id
    plan
    status
    currentPeriodEnd
  }
}

mutation CancelSubscription {
  cancelSubscription {
    id
    status
    cancelAt
  }
}

mutation ReactivateSubscription {
  reactivateSubscription {
    id
    status
    cancelAt
  }
}
```

**Acceptance Criteria:**
- ✅ Кнопка "Change Plan" открывает диалог с выбором плана
- ✅ Показывается разница между планами (features, price)
- ✅ После смены плана подписка обновляется немедленно
- ✅ Кнопка "Cancel Subscription" с предупреждением
- ✅ После отмены показывается дата окончания доступа
- ✅ Можно реактивировать отменённую подписку
- ✅ Все ошибки обрабатываются gracefully

---

### Phase 2: Important Features (P1) - 2.5 дня

#### Day 4: Two-Factor Authentication (2FA)
**Время:** 1.5 дня
**Приоритет:** P1 - Important

**Backend (1 день):**
1. **Install Dependencies**
   ```bash
   pnpm add speakeasy qrcode
   pnpm add -D @types/speakeasy @types/qrcode
   ```

2. **User Model Update**
   ```prisma
   model User {
     twoFactorEnabled   Boolean @default(false)
     twoFactorSecret    String?
   }
   ```

3. **2FA Service**
   ```typescript
   // apps/api/src/modules/auth/two-factor.service.ts

   @Injectable()
   export class TwoFactorService {
     generateSecret(email: string): { secret: string; qrCode: string }
     verifyToken(secret: string, token: string): boolean
     enableTwoFactor(userId: string, secret: string): Promise<User>
     disableTwoFactor(userId: string): Promise<User>
   }
   ```

4. **GraphQL Mutations**
   ```typescript
   @Mutation(() => TwoFactorSetup)
   async setup2FA(@CurrentUser() user: User): Promise<TwoFactorSetup>

   @Mutation(() => User)
   async enable2FA(
     @Args('token') token: string,
     @CurrentUser() user: User,
   ): Promise<User>

   @Mutation(() => User)
   async disable2FA(
     @Args('token') token: string,
     @CurrentUser() user: User,
   ): Promise<User>
   ```

5. **Auth Guard Update**
   - Проверять 2FA при login
   - Требовать token если 2FA включена

**Frontend (0.5 дня):**
1. **TwoFactorSetup Component**
   ```tsx
   // apps/web/src/packages/components/settings/TwoFactorSetup.tsx

   - Step 1: Generate QR code
   - Step 2: Scan with Google Authenticator
   - Step 3: Enter verification code
   - Step 4: Confirm and enable
   - Backup codes generation
   ```

2. **TwoFactorDisable Component**
   ```tsx
   - Требует ввести код для отключения
   - Предупреждение о снижении безопасности
   - Подтверждение
   ```

3. **Add to Security Tab**
   ```tsx
   <Card>
     <CardHeader>
       <CardTitle>Two-Factor Authentication</CardTitle>
     </CardHeader>
     <CardContent>
       {user.twoFactorEnabled ? (
         <TwoFactorDisable />
       ) : (
         <TwoFactorSetup />
       )}
     </CardContent>
   </Card>
   ```

**GraphQL:**
```graphql
type TwoFactorSetup {
  secret: String!
  qrCode: String!
}

mutation Setup2FA {
  setup2FA {
    secret
    qrCode
  }
}

mutation Enable2FA($token: String!) {
  enable2FA(token: $token) {
    id
    twoFactorEnabled
  }
}

mutation Disable2FA($token: String!) {
  disable2FA(token: $token) {
    id
    twoFactorEnabled
  }
}
```

**Acceptance Criteria:**
- ✅ Можно включить 2FA через QR code
- ✅ Google Authenticator генерирует коды
- ✅ При login требуется 2FA код (если включено)
- ✅ Можно отключить 2FA с подтверждением
- ✅ Backup codes генерируются и показываются
- ✅ Показывается дата включения 2FA

---

#### Day 5-5.5: Detailed Notification Settings
**Время:** 1 день
**Приоритет:** P1 - Important

**Backend (4 часа):**
1. **NotificationSettings Model Update**
   ```prisma
   model NotificationSettings {
     id        String   @id @default(cuid())
     userId    String   @unique
     user      User     @relation(fields: [userId], references: [id])

     // Channels
     emailEnabled    Boolean @default(true)
     pushEnabled     Boolean @default(false)
     telegramEnabled Boolean @default(false)

     // Event Types
     projectUpdates      Boolean @default(true)
     expenseAlerts       Boolean @default(true)
     payoutNotifications Boolean @default(true)
     taskAssignments     Boolean @default(true)
     teamInvites         Boolean @default(true)

     // Frequency
     frequency String @default("instant") // instant, daily, weekly

     // Quiet Hours
     quietHoursEnabled Boolean @default(false)
     quietHoursStart   String? // "22:00"
     quietHoursEnd     String? // "08:00"

     createdAt DateTime @default(now())
     updatedAt DateTime @updatedAt
   }
   ```

2. **GraphQL Mutations**
   ```typescript
   @Mutation(() => NotificationSettings)
   async updateNotificationSettings(
     @Args('input') input: UpdateNotificationSettingsInput,
     @CurrentUser() user: User,
   ): Promise<NotificationSettings>
   ```

**Frontend (4 часа):**
1. **NotificationChannels Component**
   ```tsx
   // Email, Push, Telegram toggles
   - Email: always available
   - Push: requires browser permission
   - Telegram: requires bot connection
   ```

2. **NotificationEvents Component**
   ```tsx
   // Individual toggles for each event type
   - Project Updates (новый проект, статус изменён)
   - Expense Alerts (новый расход, превышение бюджета)
   - Payout Notifications (новая выплата, выплата обработана)
   - Task Assignments (назначена задача, дедлайн приближается)
   - Team Invites (приглашение в команду)
   ```

3. **NotificationFrequency Component**
   ```tsx
   // Radio group
   - Instant (получать сразу)
   - Daily Digest (раз в день в 09:00)
   - Weekly Summary (раз в неделю в понедельник)
   ```

4. **QuietHours Component**
   ```tsx
   // Toggle + Time pickers
   - Enable Quiet Hours switch
   - Start time (default: 22:00)
   - End time (default: 08:00)
   - Timezone display
   ```

5. **TestNotification Component**
   ```tsx
   // Send test notification button
   - Выбор канала (email/push/telegram)
   - Отправка тестового сообщения
   - Success/error feedback
   ```

**GraphQL:**
```graphql
input UpdateNotificationSettingsInput {
  emailEnabled: Boolean
  pushEnabled: Boolean
  telegramEnabled: Boolean
  projectUpdates: Boolean
  expenseAlerts: Boolean
  payoutNotifications: Boolean
  taskAssignments: Boolean
  teamInvites: Boolean
  frequency: NotificationFrequency
  quietHoursEnabled: Boolean
  quietHoursStart: String
  quietHoursEnd: String
}

enum NotificationFrequency {
  INSTANT
  DAILY
  WEEKLY
}
```

**Acceptance Criteria:**
- ✅ Можно включить/выключить каждый канал уведомлений
- ✅ Можно настроить типы событий по отдельности
- ✅ Можно выбрать частоту (instant/daily/weekly)
- ✅ Quiet Hours работают корректно
- ✅ Тестовое уведомление отправляется успешно
- ✅ Настройки сохраняются и применяются

---

### Phase 3: Nice to Have (P2) - 1.5 дня

#### Day 6: Account Deletion
**Время:** 0.5 дня
**Приоритет:** P2 - Nice to Have

**Backend (2 часа):**
1. **Delete Account Service**
   ```typescript
   // apps/api/src/modules/users/users.service.ts

   async deleteAccount(userId: string): Promise<void> {
     // 1. Check user owns teams
     const teams = await this.prisma.team.findMany({
       where: { ownerId: userId }
     })

     if (teams.length > 0) {
       throw new Error('Cannot delete account with owned teams')
     }

     // 2. Remove from all teams
     await this.prisma.teamMember.deleteMany({
       where: { userId }
     })

     // 3. Cancel subscriptions
     await this.subscriptionService.cancelAll(userId)

     // 4. Delete user data
     await this.prisma.user.delete({
       where: { id: userId }
     })

     // 5. Logout
     await this.authService.logout(userId)
   }
   ```

2. **GraphQL Mutation**
   ```typescript
   @Mutation(() => Boolean)
   @UseGuards(AuthGuard)
   async deleteAccount(
     @Args('password') password: string,
     @CurrentUser() user: User,
   ): Promise<boolean>
   ```

**Frontend (2 часа):**
1. **DeleteAccountDialog Component**
   ```tsx
   // Danger zone
   - Предупреждение (This action cannot be undone)
   - Список что будет удалено
   - Checkbox "I understand the consequences"
   - Ввод пароля для подтверждения
   - Кнопка "Delete Account" (красная)
   ```

2. **Update Security Tab**
   ```tsx
   <Card className="border-destructive">
     <CardHeader>
       <CardTitle className="text-destructive">Danger Zone</CardTitle>
     </CardHeader>
     <CardContent>
       <DeleteAccountDialog />
     </CardContent>
   </Card>
   ```

**GraphQL:**
```graphql
mutation DeleteAccount($password: String!) {
  deleteAccount(password: $password)
}
```

**Acceptance Criteria:**
- ✅ Кнопка в Danger Zone секции
- ✅ Нельзя удалить если есть owned teams
- ✅ Требуется ввести пароль
- ✅ Показываются warnings о необратимости
- ✅ После удаления logout и redirect на landing
- ✅ Все связанные данные удаляются

---

#### Day 6.5: Activity Log
**Время:** 0.5 дня
**Приоритет:** P2 - Nice to Have

**Backend (2 часа):**
1. **ActivityLog Model**
   ```prisma
   model ActivityLog {
     id        String   @id @default(cuid())
     userId    String
     user      User     @relation(fields: [userId], references: [id])

     action    String   // "profile_updated", "password_changed", "2fa_enabled"
     details   Json?
     ipAddress String?
     userAgent String?

     createdAt DateTime @default(now())

     @@index([userId, createdAt])
   }
   ```

2. **Activity Logger Service**
   ```typescript
   @Injectable()
   export class ActivityLoggerService {
     async log(
       userId: string,
       action: string,
       details?: any,
       request?: Request,
     ): Promise<void>
   }
   ```

3. **GraphQL Query**
   ```typescript
   @Query(() => [ActivityLog])
   @UseGuards(AuthGuard)
   async myActivityLog(
     @CurrentUser() user: User,
     @Args('limit', { nullable: true }) limit?: number,
   ): Promise<ActivityLog[]>
   ```

**Frontend (2 часа):**
1. **ActivityLogList Component**
   ```tsx
   // apps/web/src/packages/components/settings/ActivityLogList.tsx

   - List of activities (последние 50)
   - Иконки для разных типов действий
   - Timestamp (relative time)
   - IP address и user agent
   - Фильтр по типу действия
   ```

2. **Add to Security Tab**
   ```tsx
   <Card>
     <CardHeader>
       <CardTitle>Recent Activity</CardTitle>
     </CardHeader>
     <CardContent>
       <ActivityLogList limit={10} />
       <Button variant="ghost" onClick={() => router.push('/activity-log')}>
         View All
       </Button>
     </CardContent>
   </Card>
   ```

**GraphQL:**
```graphql
type ActivityLog {
  id: ID!
  action: String!
  details: JSON
  ipAddress: String
  userAgent: String
  createdAt: DateTime!
}

query MyActivityLog($limit: Int) {
  myActivityLog(limit: $limit) {
    id
    action
    details
    ipAddress
    createdAt
  }
}
```

**Acceptance Criteria:**
- ✅ Показываются последние 10 действий
- ✅ Каждое действие имеет timestamp и details
- ✅ Можно посмотреть полный список
- ✅ Автоматически логируются все изменения настроек
- ✅ Показывается IP и user agent

---

#### Day 7: Active Sessions Management
**Время:** 0.5 дня
**Приоритет:** P2 - Nice to Have

**Backend (2 часа):**
1. **Session Model** (если нет)
   ```prisma
   model Session {
     id        String   @id @default(cuid())
     userId    String
     user      User     @relation(fields: [userId], references: [id])

     token     String   @unique
     device    String?
     ipAddress String?
     userAgent String?

     lastActive DateTime @default(now())
     expiresAt  DateTime

     createdAt DateTime @default(now())

     @@index([userId])
   }
   ```

2. **GraphQL Queries/Mutations**
   ```typescript
   @Query(() => [Session])
   async mySessions(@CurrentUser() user: User): Promise<Session[]>

   @Mutation(() => Boolean)
   async revokeSession(
     @Args('sessionId') sessionId: string,
     @CurrentUser() user: User,
   ): Promise<boolean>

   @Mutation(() => Boolean)
   async revokeAllSessions(@CurrentUser() user: User): Promise<boolean>
   ```

**Frontend (2 часа):**
1. **ActiveSessions Component**
   ```tsx
   // apps/web/src/packages/components/settings/ActiveSessions.tsx

   - List of active sessions
   - Current session badge
   - Device name (Chrome on Windows, Safari on iPhone)
   - Last active timestamp
   - IP address
   - "Revoke" button для каждой сессии
   - "Revoke All Other Sessions" button
   ```

2. **Add to Security Tab**
   ```tsx
   <Card>
     <CardHeader>
       <CardTitle>Active Sessions</CardTitle>
       <CardDescription>
         Manage devices where you're logged in
       </CardDescription>
     </CardHeader>
     <CardContent>
       <ActiveSessions />
     </CardContent>
   </Card>
   ```

**GraphQL:**
```graphql
type Session {
  id: ID!
  device: String
  ipAddress: String
  lastActive: DateTime!
  isCurrent: Boolean!
}

query MySessions {
  mySessions {
    id
    device
    ipAddress
    lastActive
    isCurrent
  }
}

mutation RevokeSession($sessionId: ID!) {
  revokeSession(sessionId: $sessionId)
}

mutation RevokeAllSessions {
  revokeAllSessions
}
```

**Acceptance Criteria:**
- ✅ Показываются все активные сессии
- ✅ Текущая сессия отмечена badge
- ✅ Можно отозвать любую сессию
- ✅ Можно отозвать все кроме текущей
- ✅ После отзыва сессии устройство logout

---

## 📊 Implementation Summary

### Files to Create/Modify

**Backend (~15 files, ~1200 lines):**

**New Files:**
1. `apps/api/src/modules/files/file-upload.module.ts` - File upload configuration
2. `apps/api/src/modules/files/file-upload.service.ts` - File handling service
3. `apps/api/src/modules/auth/two-factor.service.ts` - 2FA implementation
4. `apps/api/src/modules/activity/activity-logger.service.ts` - Activity logging
5. `apps/api/src/modules/activity/activity-log.resolver.ts` - Activity log GraphQL
6. `apps/api/src/modules/sessions/sessions.service.ts` - Session management

**Modified Files:**
1. `apps/api/src/modules/users/users.resolver.ts` - Add avatar, 2FA, Telegram mutations
2. `apps/api/src/modules/users/users.service.ts` - Add delete account logic
3. `apps/api/src/modules/subscriptions/subscriptions.resolver.ts` - Add reactivate
4. `apps/api/src/modules/notifications/notification-settings.resolver.ts` - Detailed settings
5. `apps/api/prisma/schema.prisma` - Add fields and models
6. `apps/api/schema.gql` - Auto-generated GraphQL schema

**Frontend (~12 files, ~1500 lines):**

**New Components:**
1. `apps/web/src/packages/components/settings/AvatarUpload.tsx` - Avatar upload
2. `apps/web/src/packages/components/settings/TelegramIntegration.tsx` - Telegram UI
3. `apps/web/src/packages/components/settings/TwoFactorSetup.tsx` - 2FA setup
4. `apps/web/src/packages/components/settings/NotificationEvents.tsx` - Event settings
5. `apps/web/src/packages/components/settings/QuietHours.tsx` - Quiet hours
6. `apps/web/src/packages/components/settings/DeleteAccountDialog.tsx` - Delete account
7. `apps/web/src/packages/components/settings/ActivityLogList.tsx` - Activity log
8. `apps/web/src/packages/components/settings/ActiveSessions.tsx` - Sessions list
9. `apps/web/src/packages/components/subscription/ChangePlanDialog.tsx` - Plan change
10. `apps/web/src/packages/components/subscription/CancelSubscriptionDialog.tsx` - Cancel

**Modified Files:**
1. `apps/web/src/app/(root)/(protected)/settings/page.tsx` - Main settings page
2. `apps/web/src/packages/api/graphql/users.graphql` - User queries/mutations

**GraphQL Files:**
3. `apps/web/src/packages/api/graphql/settings.graphql` - Settings operations
4. `apps/web/src/packages/api/graphql/subscriptions.graphql` - Subscription operations

---

## 📈 Metrics & KPIs

### Success Metrics
- ✅ 100% Settings features functional (no "В разработке" toasts)
- ✅ Avatar upload success rate > 95%
- ✅ 2FA setup completion rate > 80%
- ✅ Telegram connection rate > 60%
- ✅ Subscription plan changes success rate > 95%
- ✅ Zero critical bugs in Settings page

### Performance Targets
- ⚡ Settings page load < 1s
- ⚡ Avatar upload < 3s (for 5MB image)
- ⚡ Settings save < 500ms
- ⚡ Activity log query < 200ms

---

## 🔒 Security Considerations

1. **Avatar Upload:**
   - Validate file type (whitelist: JPG, PNG, GIF)
   - Validate file size (max 5MB)
   - Sanitize filename
   - Store in secure location (S3 or local with proper permissions)
   - Generate unique filenames to prevent overwrites

2. **2FA:**
   - Use TOTP (Time-based One-Time Password) standard
   - Store secret encrypted in database
   - Rate limit verification attempts
   - Generate backup codes for recovery

3. **Account Deletion:**
   - Require password confirmation
   - Log deletion request
   - Soft delete option (mark as deleted, delete after 30 days)
   - Notify via email before permanent deletion

4. **Session Management:**
   - Store session tokens hashed
   - Implement session timeout (7 days)
   - Update lastActive on each request
   - Clear expired sessions periodically

---

## 🧪 Testing Strategy

### Unit Tests
- Avatar upload service (file validation, storage)
- 2FA service (secret generation, token verification)
- Activity logger (correct action logging)
- Notification settings validation

### Integration Tests
- Avatar upload flow (upload → save → display → delete)
- 2FA flow (setup → verify → login with 2FA → disable)
- Telegram connection flow (connect → disconnect)
- Subscription management (change plan → cancel → reactivate)

### E2E Tests
```typescript
// Settings Page E2E Tests
describe('Settings Page', () => {
  test('should upload avatar successfully', async () => {})
  test('should enable 2FA with QR code', async () => {})
  test('should connect Telegram bot', async () => {})
  test('should change subscription plan', async () => {})
  test('should update notification settings', async () => {})
  test('should delete account with confirmation', async () => {})
})
```

---

## 📦 Dependencies

### New Dependencies

**Backend:**
```json
{
  "@nestjs/platform-express": "^11.0.0",
  "multer": "^1.4.5-lts.1",
  "speakeasy": "^2.0.0",
  "qrcode": "^1.5.3"
}
```

**DevDependencies:**
```json
{
  "@types/multer": "^1.4.11",
  "@types/speakeasy": "^2.0.10",
  "@types/qrcode": "^1.5.5"
}
```

**Frontend:**
```json
{
  "react-image-crop": "^11.0.0",
  "react-dropzone": "^14.2.0"
}
```

---

## 🎯 Rollout Plan

### Phase 1 Release (Day 3)
**Version:** 0.4.0-beta.1
**Features:**
- ✅ Avatar upload & management
- ✅ Telegram integration UI
- ✅ Subscription management

**Announcement:**
> "Settings page improvements: Upload your avatar, connect Telegram bot, and manage your subscription directly from Settings!"

### Phase 2 Release (Day 5.5)
**Version:** 0.4.0-beta.2
**Features:**
- ✅ Two-Factor Authentication
- ✅ Detailed notification settings

**Announcement:**
> "Enhanced security: Enable 2FA to protect your account. Fine-tune notification preferences for each event type."

### Phase 3 Release (Day 7)
**Version:** 0.4.0
**Features:**
- ✅ Account deletion
- ✅ Activity log
- ✅ Active sessions management

**Announcement:**
> "Complete settings overhaul: View your activity history, manage active sessions, and full control over your account."

---

## 📚 Documentation Updates

### User Documentation
- **Avatar Upload Guide** - How to upload and crop avatar
- **2FA Setup Guide** - Step-by-step 2FA configuration
- **Telegram Bot Connection** - How to connect @ProRabSpaceBot
- **Subscription Management** - How to change or cancel plan
- **Privacy & Security** - Best practices for account security

### Developer Documentation
- **File Upload Architecture** - How file upload works
- **2FA Implementation** - TOTP flow diagram
- **Activity Logging** - What actions are logged
- **Session Management** - Session lifecycle

---

## ✅ Definition of Done

Stage 11 считается завершённым когда:

1. ✅ Все 7 табов Settings page полностью функциональны
2. ✅ Нет ни одного toast "В разработке"
3. ✅ Все GraphQL mutations работают корректно
4. ✅ Unit tests покрытие > 80%
5. ✅ E2E tests проходят успешно
6. ✅ Code review completed
7. ✅ Documentation updated
8. ✅ User acceptance testing passed
9. ✅ No critical or high-priority bugs
10. ✅ Performance targets met

---

## 🚀 Next Steps After Completion

После завершения Stage 11:

1. **Deploy to Production**
   - Release version 0.4.0
   - Announce new features
   - Monitor user feedback

2. **Gather Analytics**
   - Track avatar upload rate
   - Monitor 2FA adoption
   - Analyze subscription changes

3. **Iterate Based on Feedback**
   - Add requested features
   - Fix reported bugs
   - Optimize performance

4. **Move to Next Stage**
   - Stage 10: Admin Panel (if prioritized)
   - Stage 9 Phase 2: Time tracking & reports
   - Stage 12: Mobile app (future)

---

**Prepared by:** Claude Code
**Date:** 2025-12-12
**Version:** 1.0
**Status:** Ready for Implementation
