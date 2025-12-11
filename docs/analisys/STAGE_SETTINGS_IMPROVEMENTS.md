# Stage: Settings Page - Полная доработка

**Дата создания:** 2025-12-12
**Приоритет:** P1 (High)
**Оценка времени:** 5-7 дней

---

## 📋 СОДЕРЖАНИЕ

1. [Текущее состояние](#текущее-состояние)
2. [Что работает](#что-работает)
3. [Что не доделано](#что-не-доделано)
4. [План реализации](#план-реализации)
5. [Технические детали](#технические-детали)

---

## 1. ТЕКУЩЕЕ СОСТОЯНИЕ

### Структура страницы (7 табов):

Страница Settings имеет **2088 строк** и включает:

1. **Profile** - Профиль пользователя
2. **Security** - Безопасность
3. **Notifications** - Уведомления
4. **Subscription** - Подписка
5. **Appearance** - Оформление
6. **Help** - Справка
7. **About** - О приложении

### Технологии:
- React Hook Form + Zod validation
- Framer Motion (анимации)
- GraphQL (Apollo Client)
- next-themes (темы)
- Responsive design (desktop + mobile)

---

## 2. ЧТО РАБОТАЕТ (75%)

### ✅ Profile Tab (80% готово):

**Работает:**
- Просмотр профиля (имя, email, телефон, дата регистрации)
- Редактирование имени и телефона
- Email verification alert + resend email (с cooldown 60 сек)
- Валидация (Zod): имя 2-100 символов, телефон regex
- Оптимистичные обновления
- Toast уведомления

**Не работает:**
- ❌ Загрузка аватара (показывает toast "В разработке")
- ❌ Telegram подключение (показывает toast "Скоро")

### ✅ Security Tab (90% готово):

**Работает:**
- Смена пароля (валидация: min 8, A-Z, a-z, 0-9)
- Активные сессии (список с device info, IP, дата)
- Отключение отдельных сессий
- "Завершить все сессии" (кроме текущей)
- Удаление аккаунта (с подтверждением "УДАЛИТЬ")

**Не работает:**
- ❌ Удаление аккаунта (показывает toast "В разработке")

### ✅ Notifications Tab (70% готово):

**Работает:**
- Email notifications switches (appEmail, marketingEmail)
- Push notifications switches (appPush, marketingPush)
- Сохранение через mutation `updateNotificationSettings`

**Не работает:**
- ❌ SMS уведомления (есть в schema, но нет в UI)
- ❌ Telegram подключение (показывает toast "Скоро")
- ❌ Настройка типов событий (новые расходы, фотоотчёты, задачи)

### ✅ Subscription Tab (85% готово):

**Работает:**
- Показ текущей подписки (план, статус, цена, лимиты)
- Usage stats (mock data: проекты, участники, хранилище)
- Доступные тарифы (LITE, FOREMAN, BRIGADE)
- История платежей (paymentsBySubscription query)

**Не работает:**
- ❌ Смена тарифа (показывает toast "В разработке")
- ❌ Отмена подписки (показывает toast "В разработке")
- ❌ Реальные usage stats (сейчас mock данные)

### ✅ Appearance Tab (100% готово):

**Полностью работает:**
- Выбор темы (light, dark, system)
- Live preview текущей темы
- Сохранение в localStorage (next-themes)

### ✅ Help Tab (100% готово):

**Полностью работает:**
- FAQ (6 вопросов с accordion)
- Контакты поддержки (Telegram, Email)
- Время ответа
- Документация (4 ссылки - placeholders)

### ✅ About Tab (100% готово):

**Полностью работает:**
- Информация о приложении
- Версия (APP_VERSION)
- Список возможностей (6 фич)
- Ссылки (Privacy, Terms, Offer)
- Социальные сети (Telegram, GitHub)
- "Поддержите разработку" (placeholder)

---

## 3. ЧТО НЕ ДОДЕЛАНО (25%)

### 🔴 Критично (блокирует UX):

#### 1. Avatar Upload (Profile Tab)

**Проблема:**
- Кнопка "Загрузить фото" показывает toast "В разработке"
- Нет компонента для загрузки изображения
- Нет backend endpoint `updateAvatar`

**Что нужно:**
- **Backend:**
  - `updateAvatar` mutation (принимает file upload)
  - Интеграция с хранилищем (S3/Cloudinary/локально)
  - Валидация (размер <5MB, форматы: jpg, png, webp)
  - Генерация thumbnails (200x200)

- **Frontend:**
  - `AvatarUploadDialog` компонент
  - File input с drag & drop
  - Crop/resize preview (react-easy-crop)
  - Progress bar при загрузке
  - Обработка ошибок (размер, формат)

**Оценка:** 1 день (backend + frontend)

---

#### 2. Delete Account (Security Tab)

**Проблема:**
- Кнопка "Удалить навсегда" показывает toast "В разработке"
- Нет backend mutation `deleteAccount`

**Что нужно:**
- **Backend:**
  - `deleteAccount` mutation
  - Каскадное удаление всех данных:
    - TeamMembers (где user.id = userId)
    - Projects (где createdById = userId)
    - Expenses, PhotoReports, Tasks
    - Sessions, Notifications
    - Subscriptions, Payments
  - Отправка email подтверждения
  - Grace period (30 дней на восстановление)

- **Frontend:**
  - Уже есть UI (подтверждение "УДАЛИТЬ")
  - Добавить финальный confirmation dialog
  - Redirect на `/goodbye` после удаления

**Оценка:** 4 часа (backend logic + testing)

---

#### 3. Subscription Management (Subscription Tab)

**3.1. Change Plan**

**Проблема:**
- Кнопка "Выбрать" показывает toast "В разработке"
- Есть mutation `changePlan`, но нет UI flow

**Что нужно:**
- **Frontend:**
  - `ChangePlanDialog` компонент
  - Показать разницу в цене (upgrade/downgrade)
  - Proration (пропорциональный пересчёт)
  - Payment flow (redirect на YooKassa)
  - Confirmation + success screen

- **Backend:**
  - Уже есть `changePlan` mutation ✅
  - Интеграция с YooKassa для proration
  - Автоматическое создание Payment

**Оценка:** 6 часов (frontend dialog + payment flow)

**3.2. Cancel Subscription**

**Проблема:**
- Кнопка "Отменить подписку" показывает toast "В разработке"
- Есть mutation `cancelSubscription`, но нет UI

**Что нужно:**
- **Frontend:**
  - Confirmation dialog
  - Показать дату окончания доступа
  - Feedback form (почему отменяете?)
  - Success message

- **Backend:**
  - Уже есть `cancelSubscription` mutation ✅
  - Email уведомление

**Оценка:** 2 часа (frontend dialog)

**3.3. Real Usage Stats**

**Проблема:**
- Usage stats используют mock данные:
  ```typescript
  { label: 'Проектов', value: '0', max: ... }
  { label: 'Участников', value: '1', max: ... }
  ```

**Что нужно:**
- **Backend:**
  - `teamUsageStats` query:
    - activeProjectsCount
    - membersCount
    - storageUsedBytes (уже есть в Team.storageUsedBytes)
    - expensesCount

- **Frontend:**
  - Fetch real data через query
  - Progress bars для визуализации (activeProjects / maxProjects)
  - Warnings при превышении 80% лимита

**Оценка:** 3 часа (backend query + frontend integration)

---

### 🟡 Важно (улучшает UX):

#### 4. Telegram Integration (Profile + Notifications)

**Проблема:**
- Кнопка "Подключить Telegram" показывает toast "Скоро"
- Telegram OAuth Bot уже реализован ✅
- Нет UI для подключения Telegram к существующему аккаунту

**Что нужно:**
- **Backend:**
  - `linkTelegramAccount` mutation
  - Генерация deep link: `t.me/ProRabSpaceBot?start=link_TOKEN`
  - Связывание telegramChatId с userId

- **Frontend:**
  - `TelegramLinkDialog` компонент
  - QR код для быстрого подключения
  - Инструкция (1. Открыть бот 2. Нажать START)
  - Polling для проверки подключения
  - Success state (показать username, avatar)
  - Disconnect button

**Что даст:**
- Уведомления о расходах, фотоотчётах, задачах в Telegram
- Быстрая авторизация на новых устройствах
- Push notifications через Telegram

**Оценка:** 1 день (backend + frontend + QR код)

---

#### 5. Notification Settings - Детализация (Notifications Tab)

**Проблема:**
- Только 4 switcher'а (appEmail, appPush, marketingEmail, marketingPush)
- Нет детальных настроек (какие именно события отправлять)

**Что нужно:**
- **Backend:**
  - Расширить `NotificationSettings` model:
    ```prisma
    model NotificationSettings {
      // Существующие
      appPush       Boolean @default(true)
      appEmail      Boolean @default(true)
      appSms        Boolean @default(false)
      marketingPush Boolean @default(false)
      marketingEmail Boolean @default(false)

      // Новые (детализация)
      projectUpdates      Boolean @default(true)  // Изменения в проектах
      newExpenses         Boolean @default(true)  // Новые расходы
      photoReports        Boolean @default(true)  // Новые фотоотчёты
      taskReminders       Boolean @default(true)  // Напоминания о задачах
      payoutNotifications Boolean @default(true)  // Уведомления о выплатах
      teamInvites         Boolean @default(true)  // Приглашения в команду

      // По времени
      digestFrequency     String @default("daily") // none, daily, weekly
      quietHoursStart     Int? // 22 (22:00)
      quietHoursEnd       Int? // 8 (08:00)
    }
    ```

- **Frontend:**
  - Группировка настроек по категориям:
    - **Проекты:** projectUpdates, newExpenses, photoReports
    - **Команда:** taskReminders, teamInvites
    - **Финансы:** payoutNotifications
    - **Дайджесты:** digestFrequency, quietHours
  - Time picker для quietHours (react-time-picker)

**Оценка:** 1 день (backend migration + frontend UI)

---

#### 6. Two-Factor Authentication (Security Tab)

**Проблема:**
- Нет 2FA для дополнительной безопасности

**Что нужно:**
- **Backend:**
  - `enable2FA` mutation (генерирует secret, QR)
  - `verify2FA` mutation (проверяет TOTP код)
  - `disable2FA` mutation
  - Проверка при логине (если 2FA включён)

- **Frontend:**
  - `TwoFactorSetup` dialog:
    - Показать QR код (qrcode.react)
    - Backup codes (10 одноразовых кодов)
    - Verify step (ввести код из приложения)
  - Список recovery codes
  - Regenerate codes button

**Библиотеки:**
- Backend: `otplib` или `speakeasy`
- Frontend: `qrcode.react`

**Оценка:** 1.5 дня (backend + frontend + testing)

---

### 🟢 Желательно (nice to have):

#### 7. Export User Data (GDPR Compliance)

**Что нужно:**
- **Backend:**
  - `exportUserData` query
  - Генерация JSON/ZIP с всеми данными:
    - Profile data
    - Projects, Expenses, PhotoReports
    - Team memberships
    - Subscription history
  - Email download link

- **Frontend:**
  - Кнопка "Экспортировать данные" в Security tab
  - Progress indicator
  - Download link в email

**Оценка:** 6 часов

---

#### 8. Activity Log (Security Tab)

**Что нужно:**
- **Backend:**
  - `ActivityLog` model:
    ```prisma
    model ActivityLog {
      id        String   @id @default(uuid())
      userId    String
      action    String   // login, logout, password_change, etc.
      ip        String?
      userAgent String?
      metadata  Json?    // Доп данные
      createdAt DateTime @default(now())

      user User @relation(fields: [userId])
    }
    ```
  - Автоматическое логирование важных действий

- **Frontend:**
  - Таб "Активность" в Security
  - Список последних 50 действий
  - Фильтры (тип действия, дата)

**Оценка:** 1 день

---

#### 9. Language Settings (Appearance Tab)

**Что нужно:**
- **Backend:**
  - Добавить `language` поле в User model
  - Поддержка i18n

- **Frontend:**
  - Language selector (Русский, English)
  - i18n library (next-i18next)
  - Перевод всех строк

**Оценка:** 3-5 дней (полная internationalization)

---

#### 10. Theme Customization (Appearance Tab)

**Что нужно:**
- Выбор accent color
- Custom primary color picker
- Font size settings (small, medium, large)
- Compact/comfortable view density

**Оценка:** 1 день

---

## 4. ПЛАН РЕАЛИЗАЦИИ

### Phase 1 - Critical (P0) - 3 дня

**День 1:**
- ✅ Avatar Upload (backend + frontend)
  - Backend: updateAvatar mutation + S3 storage
  - Frontend: AvatarUploadDialog + crop/resize

**День 2:**
- ✅ Telegram Integration (Settings)
  - Backend: linkTelegramAccount mutation
  - Frontend: TelegramLinkDialog + QR код
  - Polling для проверки подключения

**День 3:**
- ✅ Subscription Management
  - ChangePlanDialog (6 часов)
  - CancelSubscriptionDialog (2 часов)
  - Real Usage Stats query (3 часа)
- ✅ Delete Account backend (4 часа)

---

### Phase 2 - Important (P1) - 2 дня

**День 4:**
- ✅ Notification Settings - Детализация
  - Backend: расширение NotificationSettings model
  - Frontend: детальные switches по категориям
  - Quiet hours time picker

**День 5:**
- ✅ Two-Factor Authentication
  - Backend: 2FA mutations + TOTP verification
  - Frontend: TwoFactorSetup dialog + QR код
  - Recovery codes generation

---

### Phase 3 - Nice to Have (P2) - 2 дня

**День 6:**
- ✅ Activity Log
  - Backend: ActivityLog model + auto-logging
  - Frontend: Activity tab в Security

**День 7:**
- ✅ Export User Data (GDPR)
  - Backend: exportUserData endpoint
  - Frontend: Export button + email link
- ✅ Theme Customization (если останется время)

---

## 5. ТЕХНИЧЕСКИЕ ДЕТАЛИ

### Backend GraphQL Operations

**Новые Mutations:**
```graphql
# Avatar
mutation UpdateAvatar($file: Upload!) {
  updateAvatar(file: $file) {
    id
    avatarUrl
  }
}

# Telegram
mutation LinkTelegramAccount {
  linkTelegramAccount {
    deepLink # t.me/ProRabSpaceBot?start=link_TOKEN
    token
  }
}

mutation UnlinkTelegramAccount {
  unlinkTelegramAccount {
    id
    telegramChatId # будет null
  }
}

# 2FA
mutation Enable2FA {
  enable2FA {
    secret
    qrCode # base64 или URL
    backupCodes # [string]
  }
}

mutation Verify2FA($code: String!) {
  verify2FA(code: $code) {
    success
    backupCodes
  }
}

mutation Disable2FA($password: String!) {
  disable2FA(password: $password) {
    success
  }
}

# Export
query ExportUserData {
  exportUserData {
    downloadUrl # Pre-signed S3 URL
    expiresAt
  }
}

# Usage Stats
query TeamUsageStats($teamId: String!) {
  teamUsageStats(teamId: $teamId) {
    activeProjectsCount
    membersCount
    storageUsedBytes
    expensesCount
  }
}

# Activity Log
query MyActivityLog($limit: Int, $offset: Int) {
  myActivityLog(limit: $limit, offset: $offset) {
    id
    action
    ip
    userAgent
    metadata
    createdAt
  }
}
```

---

### Frontend Components

**Новые компоненты:**

1. **AvatarUploadDialog** (~150 строк)
   - File input + drag & drop
   - react-easy-crop для кадрирования
   - Preview
   - Upload progress

2. **TelegramLinkDialog** (~200 строк)
   - QR код (qrcode.react)
   - Deep link кнопка
   - Polling (каждые 2 сек)
   - Success/Error states
   - Disconnect option

3. **ChangePlanDialog** (~250 строк)
   - Сравнение тарифов (было → станет)
   - Proration расчёт
   - Payment redirect
   - Confirmation

4. **CancelSubscriptionDialog** (~150 строк)
   - Reasons форма
   - Confirmation
   - End date info

5. **TwoFactorSetup** (~300 строк)
   - QR код генерация
   - TOTP verification
   - Backup codes display
   - Enable/Disable toggle

6. **DetailedNotificationSettings** (~200 строк)
   - Grouped switches
   - Time picker для quiet hours
   - Save/Cancel

7. **ActivityLogTable** (~180 строк)
   - Table с последними 50 активностями
   - Filters (action type, date range)
   - Pagination

---

### Database Migrations

**Новые таблицы:**

```prisma
model ActivityLog {
  id        String   @id @default(uuid())
  userId    String   @map("user_id")
  action    String   // Enum: login, logout, password_change, 2fa_enabled, etc.
  ip        String?
  userAgent String?  @map("user_agent") @db.Text
  metadata  Json?    // Доп данные (что именно изменилось)
  createdAt DateTime @default(now()) @map("created_at")

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId, createdAt])
  @@map("activity_logs")
}

model TwoFactorAuth {
  id           String   @id @default(uuid())
  userId       String   @unique @map("user_id")
  secret       String   // TOTP secret
  backupCodes  String[] @default([]) @map("backup_codes") // Encrypted
  enabled      Boolean  @default(false)
  enabledAt    DateTime? @map("enabled_at")

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("two_factor_auth")
}
```

**Расширение NotificationSettings:**
```prisma
model NotificationSettings {
  // ... existing fields ...

  // Event-specific
  projectUpdates      Boolean @default(true) @map("project_updates")
  newExpenses         Boolean @default(true) @map("new_expenses")
  photoReports        Boolean @default(true) @map("photo_reports")
  taskReminders       Boolean @default(true) @map("task_reminders")
  payoutNotifications Boolean @default(true) @map("payout_notifications")
  teamInvites         Boolean @default(true) @map("team_invites")

  // Digest
  digestFrequency  String @default("daily") @map("digest_frequency") // none, daily, weekly
  quietHoursStart  Int?   @map("quiet_hours_start") // 0-23
  quietHoursEnd    Int?   @map("quiet_hours_end")   // 0-23
}
```

---

## 6. ПРИОРИТИЗАЦИЯ

### Must Have (неделя 1):
1. ✅ Avatar Upload (UX критично)
2. ✅ Telegram Integration (уже есть бот, нужна интеграция)
3. ✅ Subscription Management (enable monetization)
4. ✅ Real Usage Stats (transparency для users)

### Should Have (неделя 2):
5. ✅ Detailed Notifications (user control)
6. ✅ 2FA (security best practice)
7. ✅ Delete Account (GDPR requirement)

### Could Have (неделя 3):
8. Activity Log (audit trail)
9. Export User Data (GDPR compliance)
10. Theme Customization (personalization)

---

## 7. МЕТРИКИ УСПЕХА

**До реализации (текущее):**
- Settings page: 75% функциональности
- Placeholders: 8 кнопок "В разработке"
- Telegram integration: 0% (есть бот, нет UI)

**После Phase 1:**
- Settings page: 90% функциональности
- Placeholders: 2 кнопки
- Telegram integration: 100%
- Avatar upload: 100%

**После Phase 2:**
- Settings page: 95% функциональности
- Placeholders: 0 кнопок
- 2FA: 100%
- Notifications: детальный контроль

**После Phase 3:**
- Settings page: 100% функциональности
- GDPR compliance: 100%
- Security features: enterprise-level

---

## 8. ЗАВИСИМОСТИ

### Требуется до начала:
1. ✅ Telegram OAuth Bot работает (уже реализовано)
2. ✅ Storage решение для avatars (S3/Cloudinary)
3. ✅ YooKassa integration (уже реализовано для подписок)
4. ⏳ Email service (для verification, export links)

### Интеграции:
- Telegram Bot API (linkTelegramAccount)
- File upload (avatar)
- QR code generation (qrcode.react)
- TOTP authentication (otplib)
- Time picker UI (для quiet hours)

---

## 9. РИСКИ

### Технические:
- **Avatar upload size** - нужно ограничение 5MB + compression
- **2FA recovery** - пользователи могут потерять коды (нужен email backup)
- **Telegram linking** - пользователь может забыть подключить (нужны reminders)

### UX:
- **Слишком много настроек** - можно перегрузить UI (решение: умные defaults)
- **Quiet hours confusion** - нужно четкое объяснение

### Безопасность:
- **2FA bypass** - защита через backup codes + email verification
- **Session hijacking** - IP tracking + suspicious activity alerts

---

## 10. ИТОГОВАЯ ОЦЕНКА

**Общая оценка:** 5-7 дней

**Breakdown:**
- Phase 1 (Critical): 3 дня
- Phase 2 (Important): 2 дня
- Phase 3 (Nice to Have): 2 дня

**Файлов к созданию:** ~15
**Строк кода:** ~2500 (backend ~800, frontend ~1700)

**Приоритет выполнения:**
1. Phase 1 (обязательно для production)
2. Phase 2 (сильно улучшит UX)
3. Phase 3 (можно после запуска)

---

## 11. СЛЕДУЮЩИЕ ШАГИ

### Сегодня:
1. Обсудить приоритеты с командой
2. Настроить S3/Cloudinary для avatars
3. Начать с Avatar Upload (самый ожидаемый feature)

### Эта неделя:
4. Реализовать Phase 1 (critical features)
5. Протестировать Telegram integration
6. Deploy на staging

### Следующая неделя:
7. Реализовать Phase 2 (2FA + detailed notifications)
8. User acceptance testing
9. Production deployment

---

**Дата:** 2025-12-12
**Статус:** Ready for implementation
**Документ:** STAGE_SETTINGS_IMPROVEMENTS.md
