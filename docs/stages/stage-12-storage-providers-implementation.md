# Stage 12: Multi-Provider File Storage System - Complete Implementation Plan

**Дата создания:** 2025-12-13
**Версия:** 1.0
**Приоритет:** P1 - High (Critical for scalability)
**Оценка времени:** 11-12 дней

---

## 📊 Executive Summary

**Цель Stage 12:** Интеграция системы хранения файлов с поддержкой трех провайдеров (Local, Cloudinary, Cloudflare R2) с централизованным управлением через админ-панель, опциональным выбором пользователя и автоматической миграцией файлов между провайдерами.

**Текущее состояние:** Локальное хранилище в `/uploads/`, обработка через Sharp
**Целевое состояние:** Гибкая multi-provider система с admin контролем

**Ключевые возможности:**
- ✅ 3 провайдера хранилища (Local, Cloudinary, R2)
- ✅ Админ контроль (глобальный выбор провайдера)
- ✅ Опциональный выбор пользователя
- ✅ Единая структура папок для всех провайдеров: `prorab-space/{userId}/{teamId}/{projectId}/{fileType}/`
- ✅ Автоматическая миграция файлов между провайдерами
- ✅ Каскадное удаление файлов при удалении сущностей

---

## 🎯 Бизнес-цели

### Проблемы текущего решения

1. **Масштабируемость**: Локальное хранилище не подходит для горизонтального масштабирования
2. **Costs**: Нет контроля над расходами на хранение и трафик
3. **Performance**: Отсутствие CDN для быстрой загрузки изображений
4. **Flexibility**: Невозможность переключаться между провайдерами
5. **Backup**: Нет автоматического резервного копирования

### Решение

**Multi-provider архитектура** с:
- **Strategy Pattern** для абстракции провайдеров
- **Factory Pattern** для выбора активного провайдера
- **Unified folder structure** для совместимости между провайдерами
- **Migration Service** для безопасной миграции данных
- **Admin Control** для централизованного управления

### KPIs

- ✅ Поддержка 3+ провайдеров хранилища
- ✅ Время миграции < 1 сек на файл
- ✅ Zero downtime при переключении провайдеров
- ✅ 99.9% успешной загрузки файлов
- ✅ Сокращение затрат на трафик на 80% (при использовании R2)
- ✅ 100% совместимость структуры между провайдерами

---

## 🏗️ Архитектура

### Strategy Pattern для провайдеров

```typescript
┌─────────────────────────────────────────────────────────┐
│                    IStorageProvider                      │
├─────────────────────────────────────────────────────────┤
│ + upload(buffer, metadata): Promise<UploadResult>       │
│ + delete(fileUrl): Promise<void>                        │
│ + deleteFolder(folderPath): Promise<void>               │
│ + testConnection(): Promise<boolean>                    │
│ + getThumbnailUrl?(url, options): string                │
└─────────────────────────────────────────────────────────┘
                          △
                          │
        ┌─────────────────┼─────────────────┐
        │                 │                 │
┌───────┴────────┐ ┌──────┴──────┐ ┌───────┴────────┐
│ LocalProvider  │ │ Cloudinary  │ │   R2Provider   │
│                │ │  Provider   │ │                │
├────────────────┤ ├─────────────┤ ├────────────────┤
│ • File system  │ │ • SDK v2    │ │ • S3 client    │
│ • Sharp proc   │ │ • Eager     │ │ • PutObject    │
│ • /uploads/    │ │ • URL trans │ │ • ListObjects  │
│ • prorab-space │ │ • CDN       │ │ • Zero egress  │
└────────────────┘ └─────────────┘ └────────────────┘
```

### Factory для выбора провайдера

```typescript
┌──────────────────────────────────────────────────────┐
│           StorageProviderFactory                     │
├──────────────────────────────────────────────────────┤
│                                                      │
│  1. Check SystemSettings.storage.admin_mode         │
│     ├─ "cloudinary" → CloudinaryProvider            │
│     ├─ "r2" → R2Provider                            │
│     ├─ "local" → LocalProvider                      │
│     └─ "user_choice" → Continue to step 2           │
│                                                      │
│  2. Check User.storagePreference (if allowed)       │
│     ├─ "CLOUDINARY" → CloudinaryProvider            │
│     ├─ "R2" → R2Provider                            │
│     ├─ "LOCAL" → LocalProvider                      │
│     └─ NULL → Continue to step 3                    │
│                                                      │
│  3. Check SystemSettings.storage.default_provider   │
│     └─ Return default provider                      │
│                                                      │
│  4. Fallback: LocalProvider                         │
│                                                      │
└──────────────────────────────────────────────────────┘
```

### Единая иерархическая структура папок

**ВАЖНО:** Все три провайдера используют идентичную структуру с префиксом `prorab-space/`

```text
┌─────────────────────────────────────────────────────────┐
│  Unified Folder Hierarchy (ВСЕ провайдеры)              │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  prorab-space/                                          │
│  └── user-{userId}/                                     │
│      ├── avatars/                                       │
│      │   └── {timestamp}-{random}.webp                  │
│      │                                                   │
│      └── team-{teamId}/                                 │
│          ├── team-logos/                                │
│          │   └── {timestamp}-{random}.webp              │
│          │                                               │
│          └── project-{projectId}/                       │
│              ├── report-photos/                         │
│              │   ├── {timestamp}-{random}.webp (orig)   │
│              │   └── {timestamp}-{random}-thumb.webp    │
│              │                                           │
│              └── expense-photos/                        │
│                  └── {timestamp}-{random}.webp          │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**Преимущества единой структуры:**
- ✅ Простая миграция между провайдерами (одинаковые пути)
- ✅ Легко отследить файлы по userId/teamId/projectId
- ✅ Consistent URLs независимо от провайдера
- ✅ Упрощенная логика cascade delete

---

## 📋 Детальный функционал

### 1. LocalStorageProvider (Рефакторинг)

**Файл:** `apps/api/src/core/storage/providers/local.provider.ts`

**Функции:**
- Хранение в `/uploads/prorab-space/` директории
- Реализация интерфейса `IStorageProvider`
- Sharp обработка (resize, WebP конверсия)
- Единая структура с префиксом `prorab-space/`

**Методы:**
```typescript
class LocalStorageProvider implements IStorageProvider {
  async upload(buffer: Buffer, metadata: FileMetadata): Promise<UploadResult>
  async delete(fileUrl: string): Promise<void>
  async deleteFolder(folderPath: string): Promise<void>
  async testConnection(): Promise<boolean>

  private buildFolderPath(metadata: FileMetadata): string
  private ensureDirectoryExists(path: string): Promise<void>
}
```

**Примеры путей:**
```text
uploads/prorab-space/user-abc123/avatars/1702468800000-a1b2c3d4.webp
uploads/prorab-space/user-abc123/team-def456/team-logos/1702468900000-e5f6g7h8.webp
uploads/prorab-space/user-abc123/team-def456/project-ghi789/report-photos/1702469000000-i9j0k1l2.webp

URL: /uploads/prorab-space/user-abc123/avatars/1702468800000-a1b2c3d4.webp
```

**buildFolderPath() implementation:**
```typescript
private buildFolderPath(metadata: FileMetadata): string {
  const parts = ['prorab-space', `user-${metadata.userId}`];

  if (metadata.teamId) {
    parts.push(`team-${metadata.teamId}`);
  }

  if (metadata.projectId) {
    parts.push(`project-${metadata.projectId}`);
  }

  parts.push(metadata.fileType);

  return parts.join('/');
}

// Result: "prorab-space/user-abc123/team-def456/project-ghi789/report-photos"
```

---

### 2. CloudinaryProvider

**Файл:** `apps/api/src/core/storage/providers/cloudinary.provider.ts`

**Функции:**
- Интеграция с Cloudinary SDK v2
- Единая структура с префиксом `prorab-space/`
- Eager transformations для автоматических превью
- URL трансформации для динамического resize
- CDN для быстрой доставки

**Методы:**
```typescript
class CloudinaryProvider implements IStorageProvider {
  async upload(buffer: Buffer, metadata: FileMetadata): Promise<UploadResult>
  async delete(fileUrl: string): Promise<void>
  async deleteFolder(folderPath: string): Promise<void>
  async testConnection(): Promise<boolean>
  getThumbnailUrl(fileUrl: string, options: ThumbnailOptions): string

  private buildFolderPath(metadata: FileMetadata): string
  private extractPublicId(fileUrl: string): string
}
```

**Конфигурация:**
```typescript
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'prorab-space',
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
```

**Примеры путей:**
```text
Folder: prorab-space/user-abc123/avatars/
File: 1702468800000-a1b2c3d4.webp
Public ID: prorab-space/user-abc123/avatars/1702468800000-a1b2c3d4

URL: https://res.cloudinary.com/prorab-space/image/upload/prorab-space/user-abc123/avatars/1702468800000-a1b2c3d4.webp

Thumbnail URL:
https://res.cloudinary.com/prorab-space/image/upload/w_200,h_200,c_fill/prorab-space/user-abc123/avatars/1702468800000-a1b2c3d4.webp
```

**buildFolderPath() implementation:**
```typescript
private buildFolderPath(metadata: FileMetadata): string {
  // Одинаковая логика с LocalProvider
  const parts = ['prorab-space', `user-${metadata.userId}`];

  if (metadata.teamId) {
    parts.push(`team-${metadata.teamId}`);
  }

  if (metadata.projectId) {
    parts.push(`project-${metadata.projectId}`);
  }

  parts.push(metadata.fileType);

  return parts.join('/');
}

// Result: "prorab-space/user-abc123/team-def456/project-ghi789/report-photos"
```

---

### 3. R2Provider (Cloudflare R2)

**Файл:** `apps/api/src/core/storage/providers/r2.provider.ts`

**Функции:**
- S3-compatible API через AWS SDK
- **Единая структура с префиксом `prorab-space/`** (как Cloudinary)
- Zero egress fees (бесплатный исходящий трафик)
- Custom domain support
- Cloudflare CDN integration

**Методы:**
```typescript
class R2Provider implements IStorageProvider {
  async upload(buffer: Buffer, metadata: FileMetadata): Promise<UploadResult>
  async delete(fileUrl: string): Promise<void>
  async deleteFolder(folderPath: string): Promise<void>
  async testConnection(): Promise<boolean>

  private buildObjectKey(metadata: FileMetadata): string
  private extractObjectKey(fileUrl: string): string
}
```

**Конфигурация:**
```typescript
const s3Client = new S3Client({
  region: 'auto',
  endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

const bucketName = process.env.R2_BUCKET_NAME || 'prorab-uploads';
```

**Примеры путей:**
```text
Object Key: prorab-space/user-abc123/avatars/1702468800000-a1b2c3d4.webp
Bucket: prorab-uploads

URL: https://uploads.prorab.space/prorab-space/user-abc123/avatars/1702468800000-a1b2c3d4.webp

(где uploads.prorab.space - custom domain, настроенный в Cloudflare)
```

**buildObjectKey() implementation:**
```typescript
private buildObjectKey(metadata: FileMetadata): string {
  // ИДЕНТИЧНАЯ логика с Local и Cloudinary
  const parts = ['prorab-space', `user-${metadata.userId}`];

  if (metadata.teamId) {
    parts.push(`team-${metadata.teamId}`);
  }

  if (metadata.projectId) {
    parts.push(`project-${metadata.projectId}`);
  }

  parts.push(metadata.fileType);
  parts.push(metadata.filename);

  return parts.join('/');
}

// Result: "prorab-space/user-abc123/team-def456/project-ghi789/report-photos/1702469000000-i9j0k1l2.webp"
```

**Полный пример upload():**
```typescript
async upload(buffer: Buffer, metadata: FileMetadata): Promise<UploadResult> {
  const objectKey = this.buildObjectKey(metadata);

  const command = new PutObjectCommand({
    Bucket: this.bucketName,
    Key: objectKey,
    Body: buffer,
    ContentType: metadata.mimetype,
    CacheControl: 'public, max-age=31536000', // 1 year
  });

  await this.s3Client.send(command);

  const url = `${this.publicUrl}/${objectKey}`;
  // → https://uploads.prorab.space/prorab-space/user-abc123/avatars/1702468800000-a1b2c3d4.webp

  return {
    url,
    size: buffer.length,
  };
}
```

---

## 🔄 Comparison: Единая структура папок

### Пример: Avatar upload для user-abc123

| Provider | Path | Full URL |
|----------|------|----------|
| **Local** | `uploads/prorab-space/user-abc123/avatars/avatar.webp` | `/uploads/prorab-space/user-abc123/avatars/avatar.webp` |
| **Cloudinary** | `prorab-space/user-abc123/avatars/avatar.webp` | `https://res.cloudinary.com/prorab-space/image/upload/prorab-space/user-abc123/avatars/avatar.webp` |
| **R2** | `prorab-space/user-abc123/avatars/avatar.webp` | `https://uploads.prorab.space/prorab-space/user-abc123/avatars/avatar.webp` |

### Пример: Team logo для team-def456

| Provider | Path | Full URL |
|----------|------|----------|
| **Local** | `uploads/prorab-space/user-abc123/team-def456/team-logos/logo.webp` | `/uploads/prorab-space/user-abc123/team-def456/team-logos/logo.webp` |
| **Cloudinary** | `prorab-space/user-abc123/team-def456/team-logos/logo.webp` | `https://res.cloudinary.com/prorab-space/image/upload/prorab-space/user-abc123/team-def456/team-logos/logo.webp` |
| **R2** | `prorab-space/user-abc123/team-def456/team-logos/logo.webp` | `https://uploads.prorab.space/prorab-space/user-abc123/team-def456/team-logos/logo.webp` |

### Преимущества

✅ **Простая миграция**: Копируем файлы с одинаковыми путями
✅ **Consistent structure**: Одинаковая логика во всех провайдерах
✅ **Easy debugging**: Легко найти файл по userId/teamId
✅ **Predictable URLs**: Структура URL предсказуема
✅ **Namespace isolation**: `prorab-space/` изолирует наши файлы

---

## 🗄️ Database Changes

### Prisma Schema Updates

**Файл:** `apps/api/prisma/schema.prisma`

```prisma
model User {
  id                  String   @id @default(cuid())
  // ... existing fields

  // Storage Provider Settings
  storagePreference   StorageProviderType?
  storageMigratedFrom StorageProviderType?
  storageMigratedAt   DateTime?

  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt
}

enum StorageProviderType {
  LOCAL
  CLOUDINARY
  R2
}
```

**Migration:**
```bash
npx prisma migrate dev --name add_user_storage_preference
```

---

## ⚙️ SystemSettings Updates

**Файл:** `apps/api/src/modules/admin/services/system-settings.service.ts`

**Новые настройки:**

```typescript
// Storage Admin Mode (CRITICAL)
{
  key: 'storage.admin_mode',
  category: 'STORAGE',
  valueType: 'STRING',
  defaultValue: 'local',
  validationRules: {
    enum: ['cloudinary', 'r2', 'local', 'user_choice']
  },
  description: 'Режим управления провайдером хранилища',
  isPublic: false
}

// Default Provider (when admin_mode = user_choice)
{
  key: 'storage.default_provider',
  category: 'STORAGE',
  valueType: 'STRING',
  defaultValue: 'local',
  validationRules: {
    enum: ['cloudinary', 'r2', 'local']
  },
  description: 'Провайдер по умолчанию для новых пользователей'
}

// Auto-migrate on provider switch
{
  key: 'storage.auto_migrate',
  category: 'STORAGE',
  valueType: 'BOOLEAN',
  defaultValue: 'false',
  description: 'Автоматически мигрировать файлы при смене провайдера'
}

// Cloudinary Settings
{
  key: 'storage.cloudinary.cloud_name',
  category: 'STORAGE',
  valueType: 'STRING',
  defaultValue: 'prorab-space',
  description: 'Cloudinary Cloud Name'
}

{
  key: 'storage.cloudinary.api_key',
  category: 'STORAGE',
  valueType: 'STRING',
  defaultValue: '',
  description: 'Cloudinary API Key'
}

{
  key: 'storage.cloudinary.api_secret',
  category: 'STORAGE',
  valueType: 'ENCRYPTED',
  defaultValue: '',
  isEncrypted: true,
  description: 'Cloudinary API Secret'
}

// R2 Settings
{
  key: 'storage.r2.account_id',
  category: 'STORAGE',
  valueType: 'STRING',
  defaultValue: '',
  description: 'Cloudflare Account ID'
}

{
  key: 'storage.r2.access_key_id',
  category: 'STORAGE',
  valueType: 'ENCRYPTED',
  defaultValue: '',
  isEncrypted: true,
  description: 'R2 Access Key ID'
}

{
  key: 'storage.r2.secret_access_key',
  category: 'STORAGE',
  valueType: 'ENCRYPTED',
  defaultValue: '',
  isEncrypted: true,
  description: 'R2 Secret Access Key'
}

{
  key: 'storage.r2.bucket_name',
  category: 'STORAGE',
  valueType: 'STRING',
  defaultValue: 'prorab-uploads',
  description: 'R2 Bucket Name'
}

{
  key: 'storage.r2.public_url',
  category: 'STORAGE',
  valueType: 'STRING',
  defaultValue: 'https://uploads.prorab.space',
  description: 'R2 Public URL (custom domain)'
}
```

---

## 📦 Dependencies

**Установить:**

```bash
cd apps/api
pnpm add cloudinary @aws-sdk/client-s3
```

**Package versions:**
- `cloudinary`: ^2.0.0
- `@aws-sdk/client-s3`: ^3.500.0

---

## 🔧 Environment Variables

**Файл:** `apps/api/.env.example`

```bash
# ==========================================
# STORAGE CONFIGURATION
# ==========================================

# Storage Provider: local | cloudinary | r2
STORAGE_PROVIDER=local

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=prorab-space
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Cloudflare R2 Configuration
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=prorab-uploads
R2_PUBLIC_URL=https://uploads.prorab.space

# File Upload Limits
MAX_FILE_SIZE=10485760  # 10MB
MAX_AVATAR_SIZE=5242880  # 5MB
MAX_REPORT_PHOTO_SIZE=10485760  # 10MB
```

---

## ✅ Definition of Done

Stage 12 считается завершённым когда:

1. ✅ Три провайдера (Local, Cloudinary, R2) полностью работают
2. ✅ Единая структура `prorab-space/` реализована во ВСЕХ провайдерах
3. ✅ Админ контроль реализован (4 режима: cloudinary, r2, local, user_choice)
4. ✅ Пользовательский выбор работает (когда разрешен админом)
5. ✅ Каскадное удаление работает корректно (User/Team/Project)
6. ✅ Миграция между провайдерами работает без потери данных
7. ✅ Sharp обработка сохранена и работает
8. ✅ Все unit tests проходят (coverage > 80%)
9. ✅ Все integration tests проходят
10. ✅ E2E tests проходят успешно
11. ✅ Документация создана (roadmap + stage 12 + diagrams)
12. ✅ Production deployment успешен

---

**Prepared by:** Claude Code
**Date:** 2025-12-13
**Version:** 1.0
**Status:** Ready for Implementation
