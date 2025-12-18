# Stage 12: Admin Panel Integration - TODO List

**Date:** 2025-12-13
**Current Progress:** Backend Complete (80%), Admin UI Pending (0%)

---

## 📋 Что нужно реализовать для админки

### 🔧 Backend (GraphQL API)

#### 1. Storage Admin Resolver (NEW)
**File:** `apps/api/src/modules/admin/resolvers/admin-storage.resolver.ts`

**Queries:**
```graphql
type Query {
  # Получить текущие настройки хранилища
  storageSettings: StorageSettings!

  # Получить статистику по провайдерам
  storageStats: StorageStats!

  # Протестировать подключение к провайдерам
  testStorageProviders: [ProviderTestResult!]!

  # История миграций
  storageMigrationHistory(limit: Int, offset: Int): MigrationHistoryConnection!

  # Статистика использования хранилища
  storageUsageByProvider: [StorageUsageStats!]!
}

type Mutation {
  # Обновить настройки хранилища
  updateStorageSettings(input: UpdateStorageSettingsInput!): StorageSettings!

  # Протестировать конкретный провайдер
  testStorageProvider(provider: StorageProviderType!): ProviderTestResult!

  # Запустить миграцию для пользователя
  migrateUserStorage(
    userId: String!
    fromProvider: StorageProviderType!
    toProvider: StorageProviderType!
  ): MigrationResult!

  # Массовая миграция всех пользователей
  migrateBulkStorage(
    fromProvider: StorageProviderType!
    toProvider: StorageProviderType!
    userIds: [String!]
  ): BulkMigrationResult!
}

type Subscription {
  # Прогресс миграции в реальном времени
  migrationProgress(migrationId: String!): MigrationProgress!
}
```

**Types:**
```graphql
type StorageSettings {
  adminMode: String!              # local | cloudinary | r2 | user_choice
  defaultProvider: String!        # local | cloudinary | r2
  autoMigrate: Boolean!

  # Cloudinary
  cloudinaryCloudName: String
  cloudinaryApiKey: String
  cloudinaryApiSecretSet: Boolean  # Не возвращаем сам секрет

  # R2
  r2AccountId: String
  r2AccessKeyIdSet: Boolean
  r2SecretAccessKeySet: Boolean
  r2BucketName: String
  r2PublicUrl: String
}

input UpdateStorageSettingsInput {
  adminMode: String
  defaultProvider: String
  autoMigrate: Boolean

  # Cloudinary (optional)
  cloudinaryCloudName: String
  cloudinaryApiKey: String
  cloudinaryApiSecret: String

  # R2 (optional)
  r2AccountId: String
  r2AccessKeyId: String
  r2SecretAccessKey: String
  r2BucketName: String
  r2PublicUrl: String
}

type StorageStats {
  totalFiles: Int!
  totalSize: Int!
  filesByProvider: [ProviderFileStats!]!
  filesByType: [FileTypeStats!]!
}

type ProviderFileStats {
  provider: StorageProviderType!
  fileCount: Int!
  totalSize: Int!
}

type FileTypeStats {
  fileType: String!  # avatars, team-logos, report-photos, expense-photos
  count: Int!
  totalSize: Int!
}

type ProviderTestResult {
  provider: StorageProviderType!
  success: Boolean!
  message: String!
  latency: Int  # milliseconds
}

type MigrationResult {
  migrationId: String!
  userId: String!
  fromProvider: StorageProviderType!
  toProvider: StorageProviderType!
  totalFiles: Int!
  status: MigrationStatus!
  startedAt: DateTime!
}

type BulkMigrationResult {
  migrationId: String!
  totalUsers: Int!
  totalFiles: Int!
  successCount: Int!
  failedCount: Int!
  failures: [MigrationFailure!]!
}

type MigrationProgress {
  migrationId: String!
  status: MigrationStatus!
  processedFiles: Int!
  totalFiles: Int!
  currentFile: String
  progress: Float!  # 0-100
  errors: [String!]!
}

enum MigrationStatus {
  PENDING
  IN_PROGRESS
  COMPLETED
  FAILED
  CANCELLED
}

enum StorageProviderType {
  LOCAL
  CLOUDINARY
  R2
}
```

---

#### 2. Storage Admin Service (NEW)
**File:** `apps/api/src/modules/admin/services/admin-storage.service.ts`

**Методы:**
- `getStorageSettings()` - Получить настройки из SystemSettings
- `updateStorageSettings(input)` - Обновить настройки (с валидацией)
- `getStorageStats()` - Статистика файлов (запросы к БД)
- `testProvider(provider)` - Тест подключения через Factory
- `testAllProviders()` - Тест всех провайдеров
- `getMigrationHistory()` - История миграций из БД
- `getStorageUsageByProvider()` - Использование по провайдерам
- `migrateUserStorage(userId, from, to)` - Миграция через StorageMigrationService
- `migrateBulkStorage(userIds, from, to)` - Массовая миграция

---

#### 3. Migration Queue (OPTIONAL - для Bulk Migration)
**File:** `apps/api/src/modules/admin/queues/storage-migration.queue.ts`

Использовать BullMQ для фоновой обработки массовых миграций:
- Создать джобу для каждого пользователя
- Прогресс через Redis
- Подписка через GraphQL Subscription

---

### 🎨 Frontend (Admin UI)

#### 1. Storage Settings Page (NEW)
**File:** `apps/web/src/app/(root)/(protected)/admin/storage/page.tsx`

**Секции:**

**A. Current Configuration** (Read-only info)
```tsx
<Card>
  <CardHeader>
    <CardTitle>Current Storage Configuration</CardTitle>
  </CardHeader>
  <CardContent>
    <div className="grid gap-4">
      <div>
        <Label>Admin Mode</Label>
        <Badge>{settings.adminMode}</Badge>
      </div>
      <div>
        <Label>Default Provider</Label>
        <Badge>{settings.defaultProvider}</Badge>
      </div>
      <div>
        <Label>Auto-migrate</Label>
        <Badge>{settings.autoMigrate ? 'Enabled' : 'Disabled'}</Badge>
      </div>
    </div>
  </CardContent>
</Card>
```

**B. Provider Settings** (3 tabs: Local, Cloudinary, R2)
```tsx
<Tabs defaultValue="local">
  <TabsList>
    <TabsTrigger value="local">Local Storage</TabsTrigger>
    <TabsTrigger value="cloudinary">Cloudinary</TabsTrigger>
    <TabsTrigger value="r2">Cloudflare R2</TabsTrigger>
  </TabsList>

  <TabsContent value="cloudinary">
    <Card>
      <CardContent className="space-y-4 pt-6">
        <Input
          label="Cloud Name"
          value={cloudinaryCloudName}
          onChange={...}
        />
        <Input
          label="API Key"
          value={cloudinaryApiKey}
          onChange={...}
        />
        <PasswordInput
          label="API Secret"
          value={cloudinaryApiSecret}
          onChange={...}
        />
        <Button onClick={testCloudinaryConnection}>
          Test Connection
        </Button>
      </CardContent>
    </Card>
  </TabsContent>

  {/* Similar for R2 */}
</Tabs>
```

**C. Admin Mode Selector**
```tsx
<Card>
  <CardHeader>
    <CardTitle>Storage Provider Mode</CardTitle>
    <CardDescription>
      Control which storage provider is used for file uploads
    </CardDescription>
  </CardHeader>
  <CardContent>
    <RadioGroup value={adminMode} onValueChange={setAdminMode}>
      <RadioGroupItem value="local">
        Local Storage (Default)
      </RadioGroupItem>
      <RadioGroupItem value="cloudinary">
        Force Cloudinary (All users)
      </RadioGroupItem>
      <RadioGroupItem value="r2">
        Force Cloudflare R2 (All users)
      </RadioGroupItem>
      <RadioGroupItem value="user_choice">
        Allow User Choice
      </RadioGroupItem>
    </RadioGroup>
  </CardContent>
</Card>
```

**D. Save Button**
```tsx
<Button
  onClick={handleSaveSettings}
  disabled={isSaving}
>
  {isSaving ? 'Saving...' : 'Save Settings'}
</Button>
```

---

#### 2. Storage Stats Page (NEW)
**File:** `apps/web/src/app/(root)/(protected)/admin/storage/stats/page.tsx`

**Компоненты:**

**A. Storage Overview Cards**
```tsx
<div className="grid gap-4 md:grid-cols-3">
  <Card>
    <CardHeader>
      <CardTitle>Total Files</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="text-3xl font-bold">{totalFiles}</div>
    </CardContent>
  </Card>

  <Card>
    <CardHeader>
      <CardTitle>Total Size</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="text-3xl font-bold">{formatBytes(totalSize)}</div>
    </CardContent>
  </Card>

  <Card>
    <CardHeader>
      <CardTitle>Active Provider</CardTitle>
    </CardHeader>
    <CardContent>
      <Badge variant="success">{activeProvider}</Badge>
    </CardContent>
  </Card>
</div>
```

**B. Files by Provider (Chart)**
```tsx
<Card>
  <CardHeader>
    <CardTitle>Files by Provider</CardTitle>
  </CardHeader>
  <CardContent>
    <BarChart
      data={filesByProvider}
      categories={['fileCount', 'totalSize']}
      index="provider"
    />
  </CardContent>
</Card>
```

**C. Files by Type (Pie Chart)**
```tsx
<Card>
  <CardHeader>
    <CardTitle>Files by Type</CardTitle>
  </CardHeader>
  <CardContent>
    <PieChart
      data={filesByType}
      category="count"
      index="fileType"
    />
  </CardContent>
</Card>
```

---

#### 3. Storage Migration Page (NEW)
**File:** `apps/web/src/app/(root)/(protected)/admin/storage/migration/page.tsx`

**Секции:**

**A. Migration Form**
```tsx
<Card>
  <CardHeader>
    <CardTitle>Migrate Storage</CardTitle>
    <CardDescription>
      Migrate files from one provider to another
    </CardDescription>
  </CardHeader>
  <CardContent className="space-y-4">
    <Select
      label="From Provider"
      value={fromProvider}
      onValueChange={setFromProvider}
    >
      <SelectItem value="local">Local</SelectItem>
      <SelectItem value="cloudinary">Cloudinary</SelectItem>
      <SelectItem value="r2">Cloudflare R2</SelectItem>
    </Select>

    <Select
      label="To Provider"
      value={toProvider}
      onValueChange={setToProvider}
    >
      <SelectItem value="local">Local</SelectItem>
      <SelectItem value="cloudinary">Cloudinary</SelectItem>
      <SelectItem value="r2">Cloudflare R2</SelectItem>
    </Select>

    <div>
      <Label>Migration Scope</Label>
      <RadioGroup value={scope} onValueChange={setScope}>
        <RadioGroupItem value="single">Single User</RadioGroupItem>
        <RadioGroupItem value="bulk">All Users</RadioGroupItem>
      </RadioGroup>
    </div>

    {scope === 'single' && (
      <Input
        label="User ID"
        value={userId}
        onChange={(e) => setUserId(e.target.value)}
        placeholder="Enter user ID"
      />
    )}

    <Button
      onClick={handleStartMigration}
      disabled={isMigrating || !canMigrate}
    >
      Start Migration
    </Button>
  </CardContent>
</Card>
```

**B. Migration Progress (Real-time)**
```tsx
{isMigrating && (
  <Card>
    <CardHeader>
      <CardTitle>Migration in Progress</CardTitle>
    </CardHeader>
    <CardContent>
      <Progress value={migrationProgress} />
      <div className="mt-2 text-sm text-muted-foreground">
        {processedFiles} / {totalFiles} files ({migrationProgress.toFixed(1)}%)
      </div>
      {currentFile && (
        <div className="mt-2 text-xs text-muted-foreground">
          Currently migrating: {currentFile}
        </div>
      )}
    </CardContent>
  </Card>
)}
```

**C. Migration History Table**
```tsx
<Card>
  <CardHeader>
    <CardTitle>Migration History</CardTitle>
  </CardHeader>
  <CardContent>
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead>User</TableHead>
          <TableHead>From</TableHead>
          <TableHead>To</TableHead>
          <TableHead>Files</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {migrationHistory.map((migration) => (
          <TableRow key={migration.id}>
            <TableCell>{formatDate(migration.startedAt)}</TableCell>
            <TableCell>{migration.userId}</TableCell>
            <TableCell>
              <Badge>{migration.fromProvider}</Badge>
            </TableCell>
            <TableCell>
              <Badge>{migration.toProvider}</Badge>
            </TableCell>
            <TableCell>{migration.totalFiles}</TableCell>
            <TableCell>
              <Badge variant={getStatusVariant(migration.status)}>
                {migration.status}
              </Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </CardContent>
</Card>
```

---

#### 4. Update Admin Sidebar
**File:** `apps/web/src/packages/components/admin/admin-sidebar.tsx`

Добавить в `navItems`:
```tsx
{
  label: 'Storage',
  href: '/admin/storage',
  icon: HardDrive,  // import { HardDrive } from 'lucide-react'
  permission: 'storage:view',
},
```

---

#### 5. GraphQL Schema & Codegen

**A. Add to schema**
**File:** `apps/web/src/packages/graphql/admin-storage.graphql` (NEW)

```graphql
query GetStorageSettings {
  storageSettings {
    adminMode
    defaultProvider
    autoMigrate
    cloudinaryCloudName
    cloudinaryApiKey
    cloudinaryApiSecretSet
    r2AccountId
    r2AccessKeyIdSet
    r2SecretAccessKeySet
    r2BucketName
    r2PublicUrl
  }
}

mutation UpdateStorageSettings($input: UpdateStorageSettingsInput!) {
  updateStorageSettings(input: $input) {
    adminMode
    defaultProvider
    autoMigrate
  }
}

query GetStorageStats {
  storageStats {
    totalFiles
    totalSize
    filesByProvider {
      provider
      fileCount
      totalSize
    }
    filesByType {
      fileType
      count
      totalSize
    }
  }
}

mutation TestStorageProvider($provider: StorageProviderType!) {
  testStorageProvider(provider: $provider) {
    provider
    success
    message
    latency
  }
}

mutation MigrateUserStorage(
  $userId: String!
  $fromProvider: StorageProviderType!
  $toProvider: StorageProviderType!
) {
  migrateUserStorage(
    userId: $userId
    fromProvider: $fromProvider
    toProvider: $toProvider
  ) {
    migrationId
    totalFiles
    status
    startedAt
  }
}

subscription MigrationProgress($migrationId: String!) {
  migrationProgress(migrationId: $migrationId) {
    migrationId
    status
    processedFiles
    totalFiles
    progress
    currentFile
    errors
  }
}
```

**B. Run codegen**
```bash
cd apps/web
pnpm codegen
```

---

### 🗃️ Database Changes (Optional - for Migration History)

Если нужна история миграций в БД (вместо простого User.storageMigratedAt):

```prisma
model StorageMigration {
  id            String   @id @default(uuid())
  userId        String
  fromProvider  StorageProviderType
  toProvider    StorageProviderType
  totalFiles    Int
  successCount  Int
  failedCount   Int
  status        MigrationStatus
  startedAt     DateTime @default(now())
  completedAt   DateTime?
  errors        String[] @default([])

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([status])
  @@map("storage_migrations")
}

enum MigrationStatus {
  PENDING
  IN_PROGRESS
  COMPLETED
  FAILED
  CANCELLED
}
```

---

## 📊 Приоритизация задач

### Priority 1 (Must Have) - Базовый функционал:
1. ✅ Backend: AdminStorageResolver (Queries + Mutations)
2. ✅ Backend: AdminStorageService
3. ✅ Frontend: Storage Settings Page (admin/storage/page.tsx)
4. ✅ Frontend: GraphQL queries/mutations + codegen
5. ✅ Frontend: Update Admin Sidebar

### Priority 2 (Should Have) - Статистика:
6. ⏳ Frontend: Storage Stats Page
7. ⏳ Backend: Storage stats aggregation

### Priority 3 (Nice to Have) - Миграция:
8. ⏳ Frontend: Storage Migration Page
9. ⏳ Backend: Migration queue (BullMQ)
10. ⏳ Backend: Real-time subscription
11. ⏳ Database: StorageMigration model

---

## 📅 Estimated Timeline

- **Priority 1 (Basic Settings):** 3-4 часа
- **Priority 2 (Stats):** 2-3 часа
- **Priority 3 (Migration UI):** 3-4 часа

**Total:** 8-11 часов работы

---

## 🎯 Next Immediate Steps

1. Создать `AdminStorageResolver` с базовыми queries/mutations
2. Создать `AdminStorageService` с логикой
3. Обновить GraphQL схему на фронте
4. Создать Storage Settings Page
5. Добавить Storage в Admin Sidebar
6. Протестировать базовый флоу

