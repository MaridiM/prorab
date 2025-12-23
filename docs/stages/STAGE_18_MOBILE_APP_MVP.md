# Stage 18: Mobile Application MVP

**Дата начала:** TBD
**Дата завершения:** TBD
**Статус:** ⏳ PLANNED
**Версия:** v1.3.0
**Приоритет:** P0 - CRITICAL
**Длительность:** 14 рабочих дней (3-4 недели)

---

## 📋 ОБЗОР

Stage 18 создаёт кроссплатформенное мобильное приложение (iOS/Android) для строителей и прорабов, работающих на объектах. Это критически важная функциональность, так как основные пользователи находятся на стройплощадках и нуждаются в мобильном доступе для логирования рабочих часов, расходов и фотоотчётов.

### Ключевые цели
1. **React Native MVP** с core функциями
2. **Offline-first architecture** для работы без интернета
3. **Камера integration** для фото расходов и отчётов
4. **Push notifications** для realtime уведомлений
5. **Синхронизация** с backend при появлении сети

### Бизнес-ценность
- **+40% feature adoption** (с мобильного доступа)
- **Realtime logging** рабочих часов прямо на объекте
- **Фото сразу** при получении чека (не теряются)
- **Competitive advantage** над конкурентами без mobile
- **Retention improvement** за счёт удобства

---

## 🎯 SCOPE & DELIVERABLES

### Что БУДЕТ реализовано ✅

#### 1. Core Screens
- ✅ **Auth Flow** (login, register, 2FA)
- ✅ **Dashboard** (финансовая сводка, текущие проекты)
- ✅ **Projects List** (мои проекты, статусы)
- ✅ **Project Details** (информация о проекте, участники)
- ✅ **Expenses List & Create** (список расходов, новый расход)
- ✅ **Time Tracking** (логирование рабочих часов)
- ✅ **Payouts History** (история выплат)
- ✅ **Settings** (профиль, нотификации, logout)

#### 2. Camera Integration
- ✅ React Native Camera для фото чеков
- ✅ Image compression перед загрузкой
- ✅ Photo preview перед отправкой
- ✅ Offline queue для фото (загрузка при сети)

#### 3. Offline-First Sync
- ✅ WatermelonDB для локального хранилища
- ✅ Automatic sync при появлении сети
- ✅ Conflict resolution
- ✅ Offline indicator в UI
- ✅ Queue для pending operations

#### 4. Push Notifications
- ✅ Firebase Cloud Messaging (FCM)
- ✅ Notification handlers
- ✅ Deep linking (открытие нужной страницы)
- ✅ Badge count для iOS

### Что НЕ БУДЕТ реализовано ❌
- ❌ Полный функционал admin panel
- ❌ Расширенная аналитика (charts/dashboards)
- ❌ Чат/messaging (Stage 21)
- ❌ Geolocation tracking (Stage 28)
- ❌ Biometric auth (Face ID/Touch ID)

---

## 📊 TECHNICAL ARCHITECTURE

### Tech Stack
- **Framework:** React Native 0.73+
- **Navigation:** React Navigation 6.x
- **State:** Zustand + TanStack Query (React Query)
- **Database:** WatermelonDB (offline sync)
- **Push:** Firebase Cloud Messaging
- **Camera:** react-native-camera
- **Image:** react-native-fast-image
- **Forms:** React Hook Form

### Database (WatermelonDB Schema)

```javascript
// apps/mobile/src/database/schema.js
export const schema = appSchema({
  version: 1,
  tables: [
    tableSchema({
      name: 'projects',
      columns: [
        { name: 'remote_id', type: 'string', isIndexed: true },
        { name: 'team_id', type: 'string', isIndexed: true },
        { name: 'name', type: 'string' },
        { name: 'description', type: 'string' },
        { name: 'status', type: 'string' },
        { name: 'budget', type: 'number' },
        { name: 'synced_at', type: 'number' },
      ]
    }),
    tableSchema({
      name: 'expenses',
      columns: [
        { name: 'remote_id', type: 'string', isIndexed: true },
        { name: 'project_id', type: 'string', isIndexed: true },
        { name: 'amount', type: 'number' },
        { name: 'category', type: 'string' },
        { name: 'description', type: 'string' },
        { name: 'photo_uri', type: 'string', isOptional: true },
        { name: 'is_synced', type: 'boolean' },
        { name: 'created_at', type: 'number' },
      ]
    }),
    tableSchema({
      name: 'work_logs',
      columns: [
        { name: 'remote_id', type: 'string', isIndexed: true },
        { name: 'project_id', type: 'string', isIndexed: true },
        { name: 'hours', type: 'number' },
        { name: 'description', type: 'string' },
        { name: 'logged_at', type: 'number' },
        { name: 'is_synced', type: 'boolean' },
      ]
    }),
  ]
})
```

### Backend Changes

#### GraphQL для Mobile
```graphql
# New queries/mutations optimized for mobile
type Query {
  mobileProjects(teamId: ID!): [ProjectMobile!]!
  mobileExpenses(projectId: ID!, limit: Int): [ExpenseMobile!]!
  mobileWorkLogs(projectId: ID!): [WorkLogMobile!]!
  mobileDashboard: DashboardMobile!
}

type Mutation {
  mobileCreateExpense(input: CreateExpenseMobileInput!): ExpenseMobile!
  mobileLogWorkHours(input: LogWorkHoursMobileInput!): WorkLogMobile!
  mobileSyncData(input: SyncDataInput!): SyncResult!
}

# Lightweight types для минимизации трафика
type ProjectMobile {
  id: ID!
  name: String!
  status: ProjectStatus!
  budget: Float!
  totalExpenses: Float!
}

type ExpenseMobile {
  id: ID!
  amount: Float!
  category: String!
  description: String
  photoUrl: String
  createdAt: DateTime!
}
```

### Folder Structure
```
apps/mobile/
├── src/
│   ├── screens/
│   │   ├── Auth/
│   │   │   ├── LoginScreen.tsx
│   │   │   └── RegisterScreen.tsx
│   │   ├── Dashboard/
│   │   │   └── DashboardScreen.tsx
│   │   ├── Projects/
│   │   │   ├── ProjectsListScreen.tsx
│   │   │   └── ProjectDetailsScreen.tsx
│   │   ├── Expenses/
│   │   │   ├── ExpensesListScreen.tsx
│   │   │   └── CreateExpenseScreen.tsx
│   │   ├── TimeTracking/
│   │   │   └── LogHoursScreen.tsx
│   │   └── Settings/
│   │       └── SettingsScreen.tsx
│   ├── components/
│   ├── navigation/
│   ├── database/
│   ├── services/
│   ├── hooks/
│   └── utils/
├── android/
├── ios/
└── package.json
```

---

## 🔧 IMPLEMENTATION PHASES

### Day 1-3: React Native Setup & Auth Flow
**Tasks:**
- [ ] Init React Native project (`npx react-native init ProRabMobile`)
- [ ] Setup TypeScript configuration
- [ ] Install dependencies (navigation, icons, etc.)
- [ ] Configure React Navigation
- [ ] Create Login/Register screens
- [ ] Implement JWT auth with AsyncStorage
- [ ] 2FA code input screen
- [ ] Биометрия (optional)

**Deliverables:** Auth flow working end-to-end

**Estimated:** ~18-24 hours

---

### Day 4-6: Core Screens (Dashboard, Projects, Expenses)
**Tasks:**
- [ ] Dashboard screen (финансовая сводка)
- [ ] Projects list screen с pull-to-refresh
- [ ] Project details screen
- [ ] Expenses list screen
- [ ] "Create Expense" bottom sheet
- [ ] GraphQL queries integration
- [ ] Loading states & error handling

**Deliverables:** Users can view projects & expenses

**Estimated:** ~20-24 hours

---

### Day 7-9: Camera & Offline Sync
**Tasks:**
- [ ] Install WatermelonDB
- [ ] Define local schema (projects, expenses, work_logs)
- [ ] Implement sync service
- [ ] Camera integration (react-native-camera)
- [ ] Image compression (react-native-image-resizer)
- [ ] Photo upload to S3/Cloudinary
- [ ] Offline queue для operations
- [ ] Conflict resolution logic

**Deliverables:** Offline-first expenses with photos

**Estimated:** ~22-26 hours

---

### Day 10-12: Time Tracking & Payouts
**Tasks:**
- [ ] Log work hours screen
- [ ] Quick log widget (1 click для 8 hours)
- [ ] Work log history
- [ ] Payouts history screen
- [ ] Notification when payout received

**Deliverables:** Workers can log hours from mobile

**Estimated:** ~16-20 hours

---

### Day 13-14: Push Notifications & Final Polish
**Tasks:**
- [ ] Firebase setup (iOS + Android)
- [ ] FCM integration
- [ ] Push notification handlers
- [ ] Deep linking setup
- [ ] App icons & splash screens
- [ ] App Store/Google Play metadata
- [ ] Beta testing (TestFlight/Google Play Internal)
- [ ] Bug fixes & polish

**Deliverables:** Production-ready mobile app

**Estimated:** ~16-20 hours

---

## 📊 METRICS & DELIVERABLES

### Code Metrics
- **New Files:** ~40 files
- **Lines of Code:** ~4,500 LOC
  - Screens: ~2,000 LOC
  - Components: ~1,200 LOC
  - Services/Utils: ~800 LOC
  - Database schema: ~300 LOC
  - Tests: ~200 LOC

### Platform Support
- **iOS:** 13.0+
- **Android:** API 24+ (Android 7.0)

### Features
- **8 core screens**
- **Offline sync**
- **Camera integration**
- **Push notifications**

---

## 📝 DEPLOYMENT CHECKLIST

### Pre-Deployment
- [ ] Apple Developer account ($99/year)
- [ ] Google Play Developer account ($25 one-time)
- [ ] Firebase project created
- [ ] Push notification certificates (iOS/Android)
- [ ] App icons/splash screens designed
- [ ] Privacy policy URL
- [ ] App Store/Play Store metadata

### iOS Deployment
1. [ ] Configure Xcode project
2. [ ] Generate provisioning profiles
3. [ ] Setup push certificates
4. [ ] Build for TestFlight
5. [ ] Submit for review

### Android Deployment
1. [ ] Generate signing key
2. [ ] Configure Gradle
3. [ ] Build APK/AAB
4. [ ] Upload to Play Console (Internal Testing)
5. [ ] Submit for review

---

## ✅ SUCCESS CRITERIA

### Functional
- ✅ Users can log in from mobile
- ✅ Projects/expenses visible offline
- ✅ Camera captures expense photos
- ✅ Work hours logged successfully
- ✅ Push notifications delivered

### Performance
- ✅ App launch < 2 seconds
- ✅ Screens render < 500ms
- ✅ Sync completes < 5 seconds
- ✅ Image upload < 10 seconds (on 3G)

### Business
- ✅ 40%+ of users adopt mobile app
- ✅ Mobile expense logging increases 3x
- ✅ App Store rating > 4.5 stars

---

## 🔄 ROLLBACK PLAN

### Critical Issues
1. **App crashes on launch** → Hotfix release
2. **Sync failures** → Disable offline mode temporarily
3. **Push not working** → Fallback to pull notifications

---

## 📚 REFERENCES

- [React Native Documentation](https://reactnative.dev/)
- [WatermelonDB](https://watermelondb.dev/)
- [Firebase Cloud Messaging](https://firebase.google.com/docs/cloud-messaging)
- [Stage 17: Email Automation](./STAGE_17_EMAIL_AUTOMATION.md)

---

**Дата создания:** 2025-12-23
**Версия:** 1.0
**Автор:** ProRab.space Development Team
