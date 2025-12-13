# Admin Panel - Полная спецификация с управлением конфигурациями

**Версия:** 1.0
**Дата создания:** 2025-12-12
**Статус:** Ready for Implementation

---

## Executive Summary

Admin Panel для ProRab.space - это comprehensive система управления платформой с:
- **RBAC** (Role-Based Access Control) - 4 роли с granular permissions
- **System Settings UI** - управление всеми токенами и конфигурациями через интерфейс
- **User Management** - полное управление пользователями и командами
- **Analytics Dashboard** - KPI метрики, графики, отчёты
- **Support System** - тикеты, FAQ, live chat (будущее)
- **Audit Logging** - логирование всех админских действий
- **Security** - 2FA обязательно для админов, IP whitelist, session management

---

## Table of Contents

1. [Database Schema](#1-database-schema)
2. [RBAC System](#2-rbac-system)
3. [System Settings Module](#3-system-settings-module)
4. [Backend API](#4-backend-api)
5. [Frontend Architecture](#5-frontend-architecture)
6. [Security Requirements](#6-security-requirements)
7. [Implementation Plan](#7-implementation-plan)

---

## 1. Database Schema

### 1.1 Admin Roles & Permissions

```prisma
// AdminRole - роли администраторов
model AdminRole {
  id          String   @id @default(uuid())
  name        String   @unique // SUPER_ADMIN, ADMIN, MODERATOR, SUPPORT
  displayName String
  description String?
  permissions Json     // Array of permission strings
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  users       User[]

  @@map("admin_roles")
}

// Расширяем User model
model User {
  // ... existing fields ...

  // Admin fields
  isAdmin       Boolean     @default(false)
  adminRoleId   String?
  adminRole     AdminRole?  @relation(fields: [adminRoleId], references: [id])

  // Admin security
  adminTwoFactorEnabled Boolean @default(false)
  adminLastLoginAt      DateTime?
  adminLastLoginIp      String?

  // Admin actions logging
  adminActions  AdminActionLog[] @relation("AdminActor")
  affectedByActions AdminActionLog[] @relation("AffectedUser")
}
```

### 1.2 System Settings

```prisma
// SystemSettings - конфигурации платформы
model SystemSettings {
  id          String   @id @default(uuid())
  key         String   @unique // уникальный ключ настройки
  category    String   // Payment, Email, Telegram, Storage, AI, etc.
  name        String   // Отображаемое название
  description String?
  valueType   String   // string, number, boolean, json, encrypted
  value       String?  // Значение (encrypted для токенов)
  defaultValue String?
  isEncrypted Boolean  @default(false)
  isRequired  Boolean  @default(false)
  updatedAt   DateTime @updatedAt
  updatedBy   String?  // Admin user ID

  @@index([category])
  @@map("system_settings")
}

// Примеры записей:
// Payment Settings
{
  key: "yookassa.shop_id"
  category: "Payment"
  name: "Yookassa Shop ID"
  valueType: "string"
  value: "123456"
  isEncrypted: false
  isRequired: true
}
{
  key: "yookassa.secret_key"
  category: "Payment"
  name: "Yookassa Secret Key"
  valueType: "encrypted"
  value: "<encrypted-value>"
  isEncrypted: true
  isRequired: true
}

// Email Settings
{
  key: "brevo.api_key"
  category: "Email"
  name: "Brevo API Key"
  valueType: "encrypted"
  value: "<encrypted-value>"
  isEncrypted: true
}
{
  key: "brevo.sender_email"
  category: "Email"
  name: "Sender Email"
  valueType: "string"
  value: "noreply@prorab.space"
}

// Telegram Settings
{
  key: "telegram.bot_token"
  category: "Telegram"
  name: "Bot Token"
  valueType: "encrypted"
  value: "<encrypted-value>"
  isEncrypted: true
}
{
  key: "telegram.support_group_id"
  category: "Telegram"
  name: "Support Group ID"
  valueType: "string"
  value: "-100123456789"
}

// Storage Settings (Cloudflare R2)
{
  key: "r2.endpoint"
  category: "Storage"
  name: "R2 Endpoint"
  valueType: "string"
  value: "https://abc.r2.cloudflarestorage.com"
}
{
  key: "r2.access_key_id"
  category: "Storage"
  name: "R2 Access Key ID"
  valueType: "encrypted"
  value: "<encrypted-value>"
  isEncrypted: true
}

// AI Settings (будущее)
{
  key: "openai.api_key"
  category: "AI"
  name: "OpenAI API Key"
  valueType: "encrypted"
  value: "<encrypted-value>"
  isEncrypted: true
}
```

### 1.3 Support System

```prisma
// SupportTicket - тикеты поддержки
model SupportTicket {
  id          String   @id @default(uuid())
  userId      String?
  user        User?    @relation(fields: [userId], references: [id])
  teamId      String?
  team        Team?    @relation(fields: [teamId], references: [id])

  // Ticket info
  subject     String
  description String   @db.Text
  category    String   // Technical, Billing, Feature Request, Bug Report
  priority    String   @default("MEDIUM") // LOW, MEDIUM, HIGH, CRITICAL
  status      String   @default("OPEN") // OPEN, IN_PROGRESS, RESOLVED, CLOSED

  // Assignment
  assignedToId String?
  assignedTo   User?   @relation("AssignedTickets", fields: [assignedToId], references: [id])

  // Metadata
  source      String?  // email, telegram, web, api
  tags        String[] // ["payment", "bug", "urgent"]

  // Dates
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  resolvedAt  DateTime?
  closedAt    DateTime?

  // Relations
  messages    SupportMessage[]

  @@index([userId])
  @@index([assignedToId])
  @@index([status])
  @@index([priority])
  @@map("support_tickets")
}

// SupportMessage - сообщения в тикете
model SupportMessage {
  id        String   @id @default(uuid())
  ticketId  String
  ticket    SupportTicket @relation(fields: [ticketId], references: [id], onDelete: Cascade)

  senderId  String?
  sender    User?    @relation(fields: [senderId], references: [id])

  message   String   @db.Text
  isStaff   Boolean  @default(false)

  createdAt DateTime @default(now())

  @@index([ticketId])
  @@map("support_messages")
}
```

### 1.4 Audit Logging

```prisma
// AdminActionLog - логирование админских действий
model AdminActionLog {
  id          String   @id @default(uuid())

  // Actor (кто выполнил)
  adminId     String
  admin       User     @relation("AdminActor", fields: [adminId], references: [id])

  // Action details
  action      String   // user.block, team.delete, subscription.refund, settings.update
  resource    String   // users, teams, subscriptions, settings
  resourceId  String?  // ID affected resource

  // Affected user (если действие на пользователя)
  affectedUserId String?
  affectedUser   User?   @relation("AffectedUser", fields: [affectedUserId], references: [id])

  // Details
  details     Json?    // Дополнительная информация
  changes     Json?    // Old/new values

  // Metadata
  ipAddress   String?
  userAgent   String?

  createdAt   DateTime @default(now())

  @@index([adminId])
  @@index([action])
  @@index([resource])
  @@index([createdAt])
  @@map("admin_action_logs")
}
```

### 1.5 System Analytics

```prisma
// SystemStatistics - кешированная статистика
model SystemStatistics {
  id        String   @id @default(uuid())

  // Metrics
  totalUsers      Int
  activeUsers     Int      // Last 30 days
  totalTeams      Int
  activeTeams     Int
  totalProjects   Int
  totalRevenue    Decimal  @db.Decimal(12, 2)
  mrr             Decimal  @db.Decimal(12, 2) // Monthly Recurring Revenue

  // Subscriptions
  activeSubscriptions    Int
  trialingSubscriptions  Int
  cancelledSubscriptions Int

  // By plan
  liteSubscriptions     Int
  foremanSubscriptions  Int
  brigadeSubscriptions  Int

  // Dates
  calculatedAt DateTime @default(now())

  @@map("system_statistics")
}
```

---

## 2. RBAC System

### 2.1 Roles Definition

```typescript
enum AdminRoleType {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  MODERATOR = 'MODERATOR',
  SUPPORT = 'SUPPORT',
}

interface RoleDefinition {
  name: AdminRoleType;
  displayName: string;
  description: string;
  permissions: Permission[];
}

const ROLES: RoleDefinition[] = [
  {
    name: 'SUPER_ADMIN',
    displayName: 'Super Administrator',
    description: 'Full platform access, can manage admins',
    permissions: ['*'], // All permissions
  },
  {
    name: 'ADMIN',
    displayName: 'Administrator',
    description: 'Manage users, teams, subscriptions',
    permissions: [
      'users.view',
      'users.edit',
      'users.block',
      'teams.view',
      'teams.edit',
      'teams.delete',
      'subscriptions.view',
      'subscriptions.edit',
      'subscriptions.refund',
      'payments.view',
      'payments.refund',
      'analytics.view',
      'settings.view',
      'support.view',
      'support.respond',
      'audit.view',
    ],
  },
  {
    name: 'MODERATOR',
    displayName: 'Moderator',
    description: 'Content moderation and user management',
    permissions: [
      'users.view',
      'users.edit',
      'teams.view',
      'projects.view',
      'projects.delete',
      'content.moderate',
      'support.view',
      'support.respond',
    ],
  },
  {
    name: 'SUPPORT',
    displayName: 'Support Specialist',
    description: 'Customer support and ticket management',
    permissions: [
      'users.view',
      'teams.view',
      'subscriptions.view',
      'support.view',
      'support.respond',
      'support.assign',
    ],
  },
];
```

### 2.2 Permissions List (60+ permissions)

```typescript
type Permission =
  // Users
  | 'users.view'
  | 'users.edit'
  | 'users.block'
  | 'users.unblock'
  | 'users.delete'
  | 'users.impersonate'

  // Teams
  | 'teams.view'
  | 'teams.edit'
  | 'teams.delete'
  | 'teams.transfer'

  // Projects
  | 'projects.view'
  | 'projects.edit'
  | 'projects.delete'

  // Subscriptions
  | 'subscriptions.view'
  | 'subscriptions.edit'
  | 'subscriptions.cancel'
  | 'subscriptions.refund'

  // Payments
  | 'payments.view'
  | 'payments.edit'
  | 'payments.refund'

  // Support
  | 'support.view'
  | 'support.respond'
  | 'support.assign'
  | 'support.close'
  | 'support.delete'

  // Analytics
  | 'analytics.view'
  | 'analytics.export'

  // Content Moderation
  | 'content.moderate'
  | 'content.delete'

  // Settings
  | 'settings.view'
  | 'settings.edit'
  | 'settings.delete'

  // Admins
  | 'admins.view'
  | 'admins.create'
  | 'admins.edit'
  | 'admins.delete'
  | 'admins.permissions'

  // Audit
  | 'audit.view'
  | 'audit.export'

  // Special
  | '*'; // All permissions (SUPER_ADMIN only)
```

### 2.3 Permission Guards

```typescript
// apps/api/src/shared/guards/admin.guard.ts
@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const ctx = GqlExecutionContext.create(context);
    const user = ctx.getContext().req.user;

    if (!user || !user.isAdmin) {
      throw new ForbiddenException('Admin access required');
    }

    return true;
  }
}

// apps/api/src/shared/guards/permissions.guard.ts
@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.get<string[]>(
      'permissions',
      context.getHandler(),
    );

    if (!requiredPermissions) {
      return true;
    }

    const ctx = GqlExecutionContext.create(context);
    const user = ctx.getContext().req.user;

    if (!user || !user.isAdmin) {
      return false;
    }

    // Load admin role with permissions
    const adminRole = await this.prisma.adminRole.findUnique({
      where: { id: user.adminRoleId },
    });

    if (!adminRole) {
      return false;
    }

    const userPermissions = adminRole.permissions as string[];

    // SUPER_ADMIN has all permissions
    if (userPermissions.includes('*')) {
      return true;
    }

    // Check if user has all required permissions
    return requiredPermissions.every(permission =>
      userPermissions.includes(permission)
    );
  }
}

// Decorator
export const RequirePermissions = (...permissions: string[]) =>
  SetMetadata('permissions', permissions);
```

---

## 3. System Settings Module

### 3.1 Settings Categories

```typescript
enum SettingsCategory {
  PAYMENT = 'Payment',
  EMAIL = 'Email',
  TELEGRAM = 'Telegram',
  STORAGE = 'Storage',
  AI = 'AI',
  SECURITY = 'Security',
  GENERAL = 'General',
}

interface SettingDefinition {
  key: string;
  category: SettingsCategory;
  name: string;
  description?: string;
  valueType: 'string' | 'number' | 'boolean' | 'json' | 'encrypted';
  defaultValue?: any;
  isEncrypted: boolean;
  isRequired: boolean;
  validator?: (value: any) => boolean;
  hint?: string;
}

const SETTINGS_DEFINITIONS: SettingDefinition[] = [
  // Payment (Yookassa)
  {
    key: 'yookassa.shop_id',
    category: 'Payment',
    name: 'Yookassa Shop ID',
    description: 'Shop ID от Yookassa (обязательно)',
    valueType: 'string',
    isEncrypted: false,
    isRequired: true,
    hint: '6-значный номер магазина',
  },
  {
    key: 'yookassa.secret_key',
    category: 'Payment',
    name: 'Yookassa Secret Key',
    description: 'Secret Key для API запросов',
    valueType: 'encrypted',
    isEncrypted: true,
    isRequired: true,
    hint: 'Начинается с test_ или live_',
  },
  {
    key: 'yookassa.webhook_secret',
    category: 'Payment',
    name: 'Webhook Secret',
    description: 'Секрет для проверки подписи webhook',
    valueType: 'encrypted',
    isEncrypted: true,
    isRequired: true,
  },
  {
    key: 'yookassa.return_url',
    category: 'Payment',
    name: 'Return URL',
    description: 'URL возврата после оплаты',
    valueType: 'string',
    defaultValue: 'https://prorab.space/payment/success',
    isEncrypted: false,
    isRequired: true,
  },

  // Email (Brevo)
  {
    key: 'brevo.api_key',
    category: 'Email',
    name: 'Brevo API Key',
    description: 'API ключ от Brevo (Sendinblue)',
    valueType: 'encrypted',
    isEncrypted: true,
    isRequired: true,
  },
  {
    key: 'brevo.sender_email',
    category: 'Email',
    name: 'Sender Email',
    description: 'Email отправителя',
    valueType: 'string',
    defaultValue: 'noreply@prorab.space',
    isEncrypted: false,
    isRequired: true,
  },
  {
    key: 'brevo.sender_name',
    category: 'Email',
    name: 'Sender Name',
    description: 'Имя отправителя',
    valueType: 'string',
    defaultValue: 'ProRab.space',
    isEncrypted: false,
    isRequired: true,
  },

  // Telegram
  {
    key: 'telegram.bot_token',
    category: 'Telegram',
    name: 'Bot Token',
    description: 'Токен бота от @BotFather',
    valueType: 'encrypted',
    isEncrypted: true,
    isRequired: true,
    hint: 'Формат: 123456:ABC-DEF...',
  },
  {
    key: 'telegram.oauth_bot_token',
    category: 'Telegram',
    name: 'OAuth Bot Token',
    description: 'Токен OAuth бота (@ProRabSpaceBot)',
    valueType: 'encrypted',
    isEncrypted: true,
    isRequired: true,
  },
  {
    key: 'telegram.support_group_id',
    category: 'Telegram',
    name: 'Support Group ID',
    description: 'ID группы поддержки для пересылки тикетов',
    valueType: 'string',
    isEncrypted: false,
    isRequired: false,
    hint: 'Формат: -100123456789',
  },

  // Storage (Cloudflare R2)
  {
    key: 'r2.endpoint',
    category: 'Storage',
    name: 'R2 Endpoint',
    description: 'Endpoint Cloudflare R2',
    valueType: 'string',
    isEncrypted: false,
    isRequired: true,
    hint: 'https://<account-id>.r2.cloudflarestorage.com',
  },
  {
    key: 'r2.access_key_id',
    category: 'Storage',
    name: 'Access Key ID',
    description: 'R2 Access Key ID',
    valueType: 'encrypted',
    isEncrypted: true,
    isRequired: true,
  },
  {
    key: 'r2.secret_access_key',
    category: 'Storage',
    name: 'Secret Access Key',
    description: 'R2 Secret Access Key',
    valueType: 'encrypted',
    isEncrypted: true,
    isRequired: true,
  },
  {
    key: 'r2.bucket_name',
    category: 'Storage',
    name: 'Bucket Name',
    description: 'Название bucket',
    valueType: 'string',
    defaultValue: 'prorab-files',
    isEncrypted: false,
    isRequired: true,
  },
  {
    key: 'r2.public_url',
    category: 'Storage',
    name: 'Public URL',
    description: 'Публичный URL для доступа к файлам',
    valueType: 'string',
    defaultValue: 'https://files.prorab.space',
    isEncrypted: false,
    isRequired: true,
  },

  // AI (будущее)
  {
    key: 'openai.api_key',
    category: 'AI',
    name: 'OpenAI API Key',
    description: 'API ключ OpenAI для AI features',
    valueType: 'encrypted',
    isEncrypted: true,
    isRequired: false,
  },
  {
    key: 'openai.model',
    category: 'AI',
    name: 'Model',
    description: 'Модель для использования',
    valueType: 'string',
    defaultValue: 'gpt-4',
    isEncrypted: false,
    isRequired: false,
  },

  // Security
  {
    key: 'security.jwt_secret',
    category: 'Security',
    name: 'JWT Secret',
    description: 'Секрет для подписи JWT токенов',
    valueType: 'encrypted',
    isEncrypted: true,
    isRequired: true,
    hint: '32+ случайных символа',
  },
  {
    key: 'security.encryption_key',
    category: 'Security',
    name: 'Encryption Key',
    description: 'Ключ для шифрования данных (AES-256)',
    valueType: 'encrypted',
    isEncrypted: true,
    isRequired: true,
    hint: '32-byte hex string (64 символа)',
  },
  {
    key: 'security.session_duration',
    category: 'Security',
    name: 'Session Duration (hours)',
    description: 'Длительность сессии в часах',
    valueType: 'number',
    defaultValue: '168', // 7 дней
    isEncrypted: false,
    isRequired: true,
  },

  // General
  {
    key: 'general.app_url',
    category: 'General',
    name: 'App URL',
    description: 'URL приложения',
    valueType: 'string',
    defaultValue: 'https://prorab.space',
    isEncrypted: false,
    isRequired: true,
  },
  {
    key: 'general.support_email',
    category: 'General',
    name: 'Support Email',
    description: 'Email для поддержки',
    valueType: 'string',
    defaultValue: 'support@prorab.space',
    isEncrypted: false,
    isRequired: true,
  },
];
```

### 3.2 Encryption Service

```typescript
// apps/api/src/core/encryption/encryption.service.ts
import * as crypto from 'crypto';

@Injectable()
export class EncryptionService {
  private algorithm = 'aes-256-gcm';
  private keyLength = 32;
  private ivLength = 16;
  private saltLength = 64;
  private tagLength = 16;

  constructor(private config: ConfigService) {}

  private getEncryptionKey(): Buffer {
    const key = this.config.get<string>('ENCRYPTION_KEY');
    if (!key || key.length !== 64) {
      throw new Error('ENCRYPTION_KEY must be 64 hex characters (32 bytes)');
    }
    return Buffer.from(key, 'hex');
  }

  encrypt(text: string): string {
    const key = this.getEncryptionKey();
    const iv = crypto.randomBytes(this.ivLength);

    const cipher = crypto.createCipheriv(this.algorithm, key, iv);

    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const tag = cipher.getAuthTag();

    // Format: iv:tag:encrypted
    return `${iv.toString('hex')}:${tag.toString('hex')}:${encrypted}`;
  }

  decrypt(encryptedData: string): string {
    const key = this.getEncryptionKey();
    const parts = encryptedData.split(':');

    if (parts.length !== 3) {
      throw new Error('Invalid encrypted data format');
    }

    const iv = Buffer.from(parts[0], 'hex');
    const tag = Buffer.from(parts[1], 'hex');
    const encrypted = parts[2];

    const decipher = crypto.createDecipheriv(this.algorithm, key, iv);
    decipher.setAuthTag(tag);

    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }

  // Generate random key (для первоначальной setup)
  generateKey(): string {
    return crypto.randomBytes(this.keyLength).toString('hex');
  }
}
```

### 3.3 Settings Service

```typescript
// apps/api/src/modules/admin/settings/settings.service.ts
@Injectable()
export class SettingsService {
  constructor(
    private prisma: PrismaService,
    private encryption: EncryptionService,
  ) {}

  async getSetting(key: string): Promise<any> {
    const setting = await this.prisma.systemSettings.findUnique({
      where: { key },
    });

    if (!setting) {
      return null;
    }

    let value = setting.value;

    // Decrypt if encrypted
    if (setting.isEncrypted && value) {
      value = this.encryption.decrypt(value);
    }

    // Parse by type
    switch (setting.valueType) {
      case 'number':
        return parseFloat(value);
      case 'boolean':
        return value === 'true';
      case 'json':
        return JSON.parse(value);
      default:
        return value;
    }
  }

  async setSetting(
    key: string,
    value: any,
    updatedBy: string,
  ): Promise<SystemSettings> {
    const definition = SETTINGS_DEFINITIONS.find(d => d.key === key);

    if (!definition) {
      throw new Error(`Unknown setting key: ${key}`);
    }

    // Convert value to string
    let stringValue: string;

    if (definition.valueType === 'json') {
      stringValue = JSON.stringify(value);
    } else {
      stringValue = String(value);
    }

    // Encrypt if needed
    if (definition.isEncrypted) {
      stringValue = this.encryption.encrypt(stringValue);
    }

    // Validate
    if (definition.validator && !definition.validator(value)) {
      throw new Error(`Invalid value for setting ${key}`);
    }

    // Upsert
    return this.prisma.systemSettings.upsert({
      where: { key },
      create: {
        key,
        category: definition.category,
        name: definition.name,
        description: definition.description,
        valueType: definition.valueType,
        value: stringValue,
        isEncrypted: definition.isEncrypted,
        isRequired: definition.isRequired,
        updatedBy,
      },
      update: {
        value: stringValue,
        updatedBy,
        updatedAt: new Date(),
      },
    });
  }

  async getAllSettings(category?: string): Promise<SystemSettings[]> {
    return this.prisma.systemSettings.findMany({
      where: category ? { category } : undefined,
      orderBy: [{ category: 'asc' }, { key: 'asc' }],
    });
  }

  async getSettingsForDisplay(
    category?: string,
  ): Promise<SettingForDisplay[]> {
    const settings = await this.getAllSettings(category);

    return settings.map(setting => {
      const definition = SETTINGS_DEFINITIONS.find(d => d.key === setting.key);

      return {
        key: setting.key,
        category: setting.category,
        name: setting.name,
        description: setting.description,
        valueType: setting.valueType,
        value: setting.isEncrypted
          ? '••••••••' // Маскируем encrypted values
          : setting.value,
        isEncrypted: setting.isEncrypted,
        isRequired: setting.isRequired,
        hint: definition?.hint,
        updatedAt: setting.updatedAt,
      };
    });
  }

  async testConnection(category: string): Promise<{ success: boolean; message: string }> {
    switch (category) {
      case 'Payment':
        return this.testYookassaConnection();
      case 'Email':
        return this.testBrevoConnection();
      case 'Telegram':
        return this.testTelegramConnection();
      case 'Storage':
        return this.testR2Connection();
      default:
        throw new Error(`No test available for category: ${category}`);
    }
  }

  private async testYookassaConnection(): Promise<{ success: boolean; message: string }> {
    try {
      const shopId = await this.getSetting('yookassa.shop_id');
      const secretKey = await this.getSetting('yookassa.secret_key');

      // Try to get shop info from Yookassa API
      const response = await fetch(`https://api.yookassa.ru/v3/me`, {
        headers: {
          'Authorization': `Basic ${Buffer.from(`${shopId}:${secretKey}`).toString('base64')}`,
        },
      });

      if (response.ok) {
        return { success: true, message: 'Yookassa connection successful' };
      } else {
        return { success: false, message: `Yookassa error: ${response.statusText}` };
      }
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  // Similar test methods for other services...
}

interface SettingForDisplay {
  key: string;
  category: string;
  name: string;
  description?: string;
  valueType: string;
  value: string | null;
  isEncrypted: boolean;
  isRequired: boolean;
  hint?: string;
  updatedAt: Date;
}
```

---

## 4. Backend API

### 4.1 Admin Settings Resolver

```typescript
// apps/api/src/modules/admin/settings/settings.resolver.ts
@Resolver()
export class AdminSettingsResolver {
  constructor(
    private settingsService: SettingsService,
    private auditService: AuditService,
  ) {}

  // ==================== QUERIES ====================

  @Query(() => [SettingType])
  @UseGuards(AdminGuard, PermissionsGuard)
  @RequirePermissions('settings.view')
  async systemSettings(
    @Args('category', { nullable: true }) category?: string,
  ): Promise<SettingType[]> {
    return this.settingsService.getSettingsForDisplay(category);
  }

  @Query(() => [String])
  @UseGuards(AdminGuard, PermissionsGuard)
  @RequirePermissions('settings.view')
  async settingsCategories(): Promise<string[]> {
    return Object.values(SettingsCategory);
  }

  @Query(() => TestConnectionResult)
  @UseGuards(AdminGuard, PermissionsGuard)
  @RequirePermissions('settings.view')
  async testSettingsConnection(
    @Args('category') category: string,
  ): Promise<TestConnectionResult> {
    return this.settingsService.testConnection(category);
  }

  // ==================== MUTATIONS ====================

  @Mutation(() => SettingType)
  @UseGuards(AdminGuard, PermissionsGuard)
  @RequirePermissions('settings.edit')
  async updateSetting(
    @Args('input') input: UpdateSettingInput,
    @CurrentUser() user: any,
  ): Promise<SettingType> {
    const updated = await this.settingsService.setSetting(
      input.key,
      input.value,
      user.id,
    );

    // Log audit
    await this.auditService.log({
      adminId: user.id,
      action: 'settings.update',
      resource: 'settings',
      resourceId: input.key,
      details: {
        key: input.key,
        category: updated.category,
      },
    });

    return updated;
  }

  @Mutation(() => Boolean)
  @UseGuards(AdminGuard, PermissionsGuard)
  @RequirePermissions('settings.edit')
  async bulkUpdateSettings(
    @Args('input') input: BulkUpdateSettingsInput,
    @CurrentUser() user: any,
  ): Promise<boolean> {
    for (const setting of input.settings) {
      await this.settingsService.setSetting(
        setting.key,
        setting.value,
        user.id,
      );
    }

    await this.auditService.log({
      adminId: user.id,
      action: 'settings.bulk_update',
      resource: 'settings',
      details: {
        count: input.settings.length,
        category: input.category,
      },
    });

    return true;
  }

  @Mutation(() => Boolean)
  @UseGuards(AdminGuard, PermissionsGuard)
  @RequirePermissions('settings.edit')
  async resetSettingToDefault(
    @Args('key') key: string,
    @CurrentUser() user: any,
  ): Promise<boolean> {
    const definition = SETTINGS_DEFINITIONS.find(d => d.key === key);

    if (!definition || !definition.defaultValue) {
      throw new Error('No default value available');
    }

    await this.settingsService.setSetting(
      key,
      definition.defaultValue,
      user.id,
    );

    await this.auditService.log({
      adminId: user.id,
      action: 'settings.reset',
      resource: 'settings',
      resourceId: key,
    });

    return true;
  }
}

// GraphQL Types
@ObjectType()
class SettingType {
  @Field()
  key: string;

  @Field()
  category: string;

  @Field()
  name: string;

  @Field({ nullable: true })
  description?: string;

  @Field()
  valueType: string;

  @Field({ nullable: true })
  value?: string;

  @Field()
  isEncrypted: boolean;

  @Field()
  isRequired: boolean;

  @Field({ nullable: true })
  hint?: string;

  @Field()
  updatedAt: Date;
}

@InputType()
class UpdateSettingInput {
  @Field()
  key: string;

  @Field()
  value: string;
}

@InputType()
class BulkUpdateSettingsInput {
  @Field(() => [UpdateSettingInput])
  settings: UpdateSettingInput[];

  @Field({ nullable: true })
  category?: string;
}

@ObjectType()
class TestConnectionResult {
  @Field()
  success: boolean;

  @Field()
  message: string;
}
```

### 4.2 Admin Users Resolver

```typescript
// apps/api/src/modules/admin/users/admin-users.resolver.ts
@Resolver()
export class AdminUsersResolver {
  constructor(
    private usersService: UsersService,
    private auditService: AuditService,
  ) {}

  // Queries
  @Query(() => [User])
  @UseGuards(AdminGuard, PermissionsGuard)
  @RequirePermissions('users.view')
  async adminUsers(
    @Args('filters', { nullable: true }) filters?: UserFilters,
  ): Promise<User[]> {
    return this.usersService.findAll(filters);
  }

  @Query(() => UserStatistics)
  @UseGuards(AdminGuard, PermissionsGuard)
  @RequirePermissions('users.view')
  async userStatistics(): Promise<UserStatistics> {
    return this.usersService.getStatistics();
  }

  // Mutations
  @Mutation(() => User)
  @UseGuards(AdminGuard, PermissionsGuard)
  @RequirePermissions('users.block')
  async blockUser(
    @Args('userId') userId: string,
    @Args('reason') reason: string,
    @CurrentUser() admin: any,
  ): Promise<User> {
    const user = await this.usersService.blockUser(userId, reason);

    await this.auditService.log({
      adminId: admin.id,
      action: 'user.block',
      resource: 'users',
      resourceId: userId,
      affectedUserId: userId,
      details: { reason },
    });

    return user;
  }

  // ... more mutations
}
```

---

## 5. Frontend Architecture

### 5.1 Admin Layout

```tsx
// apps/web/src/app/(root)/(protected)/admin/layout.tsx
'use client';

import { useRouter } from 'next/navigation';
import { useQuery } from '@apollo/client';
import { ME_QUERY } from '@/packages/api/graphql/auth';
import {
  LayoutDashboard,
  Users,
  Building2,
  CreditCard,
  Headphones,
  BarChart3,
  Settings,
  Shield,
  FileText,
} from 'lucide-react';

const ADMIN_NAV_ITEMS = [
  {
    label: 'Dashboard',
    href: '/admin',
    icon: LayoutDashboard,
    permission: 'analytics.view',
  },
  {
    label: 'Users',
    href: '/admin/users',
    icon: Users,
    permission: 'users.view',
  },
  {
    label: 'Teams',
    href: '/admin/teams',
    icon: Building2,
    permission: 'teams.view',
  },
  {
    label: 'Subscriptions',
    href: '/admin/subscriptions',
    icon: CreditCard,
    permission: 'subscriptions.view',
  },
  {
    label: 'Payments',
    href: '/admin/payments',
    icon: CreditCard,
    permission: 'payments.view',
  },
  {
    label: 'Support',
    href: '/admin/support',
    icon: Headphones,
    permission: 'support.view',
  },
  {
    label: 'Analytics',
    href: '/admin/analytics',
    icon: BarChart3,
    permission: 'analytics.view',
  },
  {
    label: 'Settings',
    href: '/admin/settings',
    icon: Settings,
    permission: 'settings.view',
  },
  {
    label: 'Admins',
    href: '/admin/admins',
    icon: Shield,
    permission: 'admins.view',
  },
  {
    label: 'Audit Logs',
    href: '/admin/logs',
    icon: FileText,
    permission: 'audit.view',
  },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { data, loading } = useQuery(ME_QUERY);

  // Check if user is admin
  if (!loading && (!data?.me?.isAdmin)) {
    router.push('/');
    return null;
  }

  const userPermissions = data?.me?.adminRole?.permissions || [];

  // Filter nav items by permissions
  const visibleNavItems = ADMIN_NAV_ITEMS.filter(item => {
    if (userPermissions.includes('*')) return true;
    return userPermissions.includes(item.permission);
  });

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-card border-r">
        <div className="p-4">
          <h1 className="text-xl font-bold">Admin Panel</h1>
          <p className="text-sm text-muted-foreground">{data?.me?.adminRole?.displayName}</p>
        </div>

        <nav className="p-2">
          {visibleNavItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-accent"
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </a>
          ))}
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
```

### 5.2 Settings Page

```tsx
// apps/web/src/app/(root)/(protected)/admin/settings/page.tsx
'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import {
  SYSTEM_SETTINGS_QUERY,
  UPDATE_SETTING_MUTATION,
  TEST_CONNECTION_MUTATION,
} from '@/packages/api/graphql/admin/settings';
import {
  Card,
  Input,
  Button,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Badge,
  Alert,
} from '@/packages/components';
import { Save, TestTube, Eye, EyeOff, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminSettingsPage() {
  const [selectedCategory, setSelectedCategory] = useState('Payment');
  const [showEncrypted, setShowEncrypted] = useState<Record<string, boolean>>({});

  const { data, loading, refetch } = useQuery(SYSTEM_SETTINGS_QUERY, {
    variables: { category: selectedCategory },
  });

  const [updateSetting] = useMutation(UPDATE_SETTING_MUTATION, {
    onCompleted: () => {
      toast.success('Setting updated');
      refetch();
    },
    onError: (error) => {
      toast.error('Failed to update', { description: error.message });
    },
  });

  const [testConnection, { loading: testing }] = useMutation(TEST_CONNECTION_MUTATION, {
    onCompleted: (data) => {
      if (data.testSettingsConnection.success) {
        toast.success('Connection successful', {
          description: data.testSettingsConnection.message,
        });
      } else {
        toast.error('Connection failed', {
          description: data.testSettingsConnection.message,
        });
      }
    },
  });

  const settings = data?.systemSettings || [];

  const handleUpdate = async (key: string, value: string) => {
    await updateSetting({
      variables: {
        input: { key, value },
      },
    });
  };

  const handleTestConnection = async () => {
    await testConnection({
      variables: { category: selectedCategory },
    });
  };

  const toggleShowEncrypted = (key: string) => {
    setShowEncrypted(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">System Settings</h1>
          <p className="text-muted-foreground">
            Manage platform configurations and integrations
          </p>
        </div>

        <Button
          onClick={handleTestConnection}
          disabled={testing}
          variant="outline"
        >
          <TestTube className="w-4 h-4 mr-2" />
          Test Connection
        </Button>
      </div>

      {/* Category tabs */}
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
        <TabsList>
          <TabsTrigger value="Payment">Payment</TabsTrigger>
          <TabsTrigger value="Email">Email</TabsTrigger>
          <TabsTrigger value="Telegram">Telegram</TabsTrigger>
          <TabsTrigger value="Storage">Storage</TabsTrigger>
          <TabsTrigger value="AI">AI</TabsTrigger>
          <TabsTrigger value="Security">Security</TabsTrigger>
          <TabsTrigger value="General">General</TabsTrigger>
        </TabsList>

        <TabsContent value={selectedCategory} className="space-y-4 mt-6">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <Card key={i} className="p-4 animate-pulse">
                  <div className="h-4 bg-muted rounded w-1/4 mb-2" />
                  <div className="h-10 bg-muted rounded" />
                </Card>
              ))}
            </div>
          ) : (
            settings.map((setting: any) => (
              <Card key={setting.key} className="p-4">
                <div className="space-y-2">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{setting.name}</h3>
                        {setting.isRequired && (
                          <Badge variant="destructive" className="text-xs">
                            Required
                          </Badge>
                        )}
                        {setting.isEncrypted && (
                          <Badge variant="secondary" className="text-xs">
                            Encrypted
                          </Badge>
                        )}
                      </div>
                      {setting.description && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {setting.description}
                        </p>
                      )}
                      {setting.hint && (
                        <p className="text-xs text-muted-foreground mt-1">
                          💡 {setting.hint}
                        </p>
                      )}
                    </div>

                    {/* Reset to default */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        // TODO: Reset to default mutation
                      }}
                    >
                      <RotateCcw className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Input */}
                  <div className="flex items-center gap-2">
                    <div className="flex-1 relative">
                      <Input
                        type={
                          setting.isEncrypted && !showEncrypted[setting.key]
                            ? 'password'
                            : setting.valueType === 'number'
                            ? 'number'
                            : 'text'
                        }
                        defaultValue={setting.value || ''}
                        placeholder={`Enter ${setting.name.toLowerCase()}...`}
                        onBlur={(e) => {
                          if (e.target.value !== setting.value) {
                            handleUpdate(setting.key, e.target.value);
                          }
                        }}
                      />

                      {/* Show/Hide for encrypted */}
                      {setting.isEncrypted && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="absolute right-2 top-1/2 -translate-y-1/2"
                          onClick={() => toggleShowEncrypted(setting.key)}
                        >
                          {showEncrypted[setting.key] ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Updated at */}
                  <p className="text-xs text-muted-foreground">
                    Last updated: {new Date(setting.updatedAt).toLocaleString()}
                  </p>
                </div>
              </Card>
            ))
          )}

          {/* Empty state */}
          {!loading && settings.length === 0 && (
            <Alert>
              <p>No settings found for this category</p>
            </Alert>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
```

---

## 6. Security Requirements

### 6.1 Admin Access Control

1. **2FA Обязательно:**
   - Все админы должны включить 2FA
   - Проверка при каждом входе
   - Backup codes для восстановления

2. **IP Whitelist (опционально):**
   - Список разрешённых IP для админ-панели
   - Блокировка подозрительных входов

3. **Session Management:**
   - Короткие сессии (2 часа)
   - Auto-logout при неактивности (30 минут)
   - Concurrent session limit (1 активная сессия)

4. **Password Policy:**
   - Минимум 12 символов
   - Uppercase + lowercase + numbers + special chars
   - Не должен совпадать с предыдущими 3 паролями

### 6.2 Audit Requirements

1. **Log Everything:**
   - Все admin actions
   - Settings changes (old/new values)
   - Permission changes
   - Login attempts (success/failure)

2. **Retention:**
   - Logs хранятся 1 год
   - Export в CSV/JSON
   - Search & filter by date/admin/action

### 6.3 Encryption

1. **All secrets encrypted:**
   - API keys
   - Tokens
   - Passwords (Argon2)
   - Sensitive settings

2. **Key Management:**
   - ENCRYPTION_KEY в environment (не в БД)
   - Key rotation support (будущее)

---

## 7. Implementation Plan

### Week 1: Database & Backend Foundation (5 дней)

**Day 1: Database Schema**
- [ ] Create AdminRole model
- [ ] Create SystemSettings model
- [ ] Create SupportTicket & SupportMessage models
- [ ] Create AdminActionLog model
- [ ] Run migrations
- [ ] Seed initial roles (SUPER_ADMIN, ADMIN, MODERATOR, SUPPORT)
- [ ] Seed settings definitions

**Day 2: Encryption & Settings Service**
- [ ] Implement EncryptionService (AES-256-GCM)
- [ ] Implement SettingsService (CRUD + encryption)
- [ ] Write tests for encryption
- [ ] Add settings validation

**Day 3: RBAC Guards**
- [ ] Implement AdminGuard
- [ ] Implement PermissionsGuard
- [ ] Add @RequirePermissions decorator
- [ ] Test guards with different roles

**Day 4: Settings Resolver**
- [ ] Implement AdminSettingsResolver
- [ ] Add queries (systemSettings, settingsCategories)
- [ ] Add mutations (updateSetting, bulkUpdate, reset)
- [ ] Add testConnection mutation

**Day 5: Audit Service**
- [ ] Implement AuditService (logging)
- [ ] Add audit.log() method
- [ ] Add queries (adminLogs, userActionHistory)
- [ ] Test audit logging

---

### Week 2: Admin Resolvers (5 дней)

**Day 6: Users Management**
- [ ] AdminUsersResolver (queries + mutations)
- [ ] User statistics
- [ ] Block/unblock users
- [ ] Delete users (with confirmation)

**Day 7: Teams Management**
- [ ] AdminTeamsResolver
- [ ] Team statistics
- [ ] Transfer ownership
- [ ] Delete teams

**Day 8: Subscriptions & Payments**
- [ ] AdminSubscriptionsResolver
- [ ] Subscription statistics
- [ ] Cancel/refund subscriptions
- [ ] AdminPaymentsResolver (view, refund)

**Day 9: Support System**
- [ ] SupportTicketsResolver
- [ ] Ticket CRUD
- [ ] Assign tickets
- [ ] Respond to tickets

**Day 10: Analytics**
- [ ] AdminAnalyticsResolver
- [ ] Calculate system statistics
- [ ] DAU/MAU metrics
- [ ] MRR/ARR calculations
- [ ] Cache statistics (hourly refresh)

---

### Week 3: Frontend (7 дней)

**Day 11: Admin Layout & Navigation**
- [ ] Admin layout component
- [ ] Sidebar with role-based filtering
- [ ] Permission checks на frontend

**Day 12: Dashboard Page**
- [ ] KPI cards (users, teams, MRR, etc.)
- [ ] Charts (recharts): DAU/MAU, revenue
- [ ] Quick actions

**Day 13: Settings Page**
- [ ] Category tabs
- [ ] Settings cards with inputs
- [ ] Test connection button
- [ ] Encrypted field toggle (show/hide)

**Day 14: Users & Teams Pages**
- [ ] Users table (search, filter, pagination)
- [ ] User details modal
- [ ] Teams table
- [ ] Team details modal

**Day 15: Subscriptions & Support Pages**
- [ ] Subscriptions table
- [ ] Cancel/refund dialogs
- [ ] Support tickets table
- [ ] Ticket details with messages
- [ ] Respond to ticket form

**Day 16: Analytics & Logs Pages**
- [ ] Analytics page with charts
- [ ] Export buttons (CSV/PDF)
- [ ] Audit logs table
- [ ] Log filters (date, admin, action)

**Day 17: Admins Management Page**
- [ ] Admins table
- [ ] Create admin dialog
- [ ] Edit permissions
- [ ] Delete admin

---

### Week 4: Testing & Polish (3 дня)

**Day 18: Integration Testing**
- [ ] Test all admin mutations
- [ ] Test RBAC permissions
- [ ] Test audit logging
- [ ] Test encryption/decryption

**Day 19: Security Audit**
- [ ] Penetration testing
- [ ] XSS/CSRF checks
- [ ] SQL injection checks
- [ ] Audit log review

**Day 20: Documentation & Deployment**
- [ ] API documentation (GraphQL schema)
- [ ] Admin guide (how to use)
- [ ] Deployment checklist
- [ ] Production rollout

---

## Estimated Timeline

**Total:** 20 дней (4 недели)

**Backend:** 10 дней
**Frontend:** 7 дней
**Testing & Polish:** 3 дня

**Team:** 1 full-stack developer

---

## Success Criteria

✅ **Functionality:**
- [ ] All RBAC roles working correctly
- [ ] All settings editable через UI
- [ ] Encrypted settings secure
- [ ] Test connections working
- [ ] Audit logging complete

✅ **Security:**
- [ ] 2FA enforced for admins
- [ ] All secrets encrypted
- [ ] No XSS/CSRF vulnerabilities
- [ ] Audit trail complete

✅ **Performance:**
- [ ] Dashboard loads < 1s
- [ ] Settings page loads < 500ms
- [ ] Analytics calculations cached

✅ **UX:**
- [ ] Intuitive navigation
- [ ] Clear error messages
- [ ] Toast notifications
- [ ] Responsive design

---

## Future Enhancements

1. **Advanced Analytics:**
   - Cohort analysis
   - Retention graphs
   - Funnel analysis

2. **AI Features:**
   - AI-powered FAQ suggestions
   - Sentiment analysis on tickets
   - Anomaly detection

3. **Mobile App:**
   - Admin mobile app (React Native)
   - Push notifications for critical alerts

4. **Advanced Security:**
   - Biometric auth
   - Hardware keys (YubiKey)
   - Zero-trust architecture

---

**Document Version:** 1.0
**Last Updated:** 2025-12-12
**Status:** ✅ Ready for Implementation
