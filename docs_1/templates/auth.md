# Отчет: Система авторизации Backend

## Обзор

Система авторизации построена на **NestJS + GraphQL + Redis + PostgreSQL** с использованием современных подходов к безопасности.

---

## Основные компоненты системы

### 1. **Архитектура аутентификации**

```
┌─────────────────────────────────────────────────────────────┐
│                    GraphQL API (NestJS)                     │
├─────────────────────────────────────────────────────────────┤
│  Auth Resolver → Auth Service → Users Service → Prisma ORM  │
│       ↓              ↓                                       │
│  AuthGuard    Redis Service                                 │
│       ↓              ↓                                       │
│  Decorators     Redis Store                                 │
└─────────────────────────────────────────────────────────────┘
        ↓                    ↓
  PostgreSQL           Redis Cache
  (пользователи)      (сессии/токены)
```

---

## Ключевые файлы

### Аутентификация
- [apps/api/src/modules/auth/auth.resolver.ts](../../../apps/api/src/modules/auth/auth.resolver.ts) - GraphQL мутации (login, register, logout, refresh)
- [apps/api/src/modules/auth/auth.service.ts](../../../apps/api/src/modules/auth/auth.service.ts) - Бизнес-логика авторизации
- [apps/api/src/modules/users/users.service.ts](../../../apps/api/src/modules/users/users.service.ts) - Работа с пользователями в БД

### Безопасность и Guards
- [apps/api/src/shared/guards/auth.guard.ts](../../../apps/api/src/shared/guards/auth.guard.ts) - Глобальный guard для защиты эндпоинтов
- [apps/api/src/shared/decorators/current-user.decorator.ts](../../../apps/api/src/shared/decorators/current-user.decorator.ts) - Декораторы для извлечения данных пользователя
- [apps/api/src/shared/decorators/public.decorator.ts](../../../apps/api/src/shared/decorators/public.decorator.ts) - Маркер публичных роутов

### Управление сессиями
- [apps/api/src/core/redis/redis.service.ts](../../../apps/api/src/core/redis/redis.service.ts) - Redis сервис для сессий, refresh токенов, rate limiting

### Конфигурация
- [apps/api/src/core/config/app.config.ts](../../../apps/api/src/core/config/app.config.ts) - Настройки времени жизни токенов, rate limiting
- [apps/api/src/main.ts](../../../apps/api/src/main.ts) - Middleware (CORS, cookies, helmet, validation)

### Модели данных
- [apps/api/prisma/schema.prisma](../../../apps/api/prisma/schema.prisma) - Схема БД (User, VerificationToken, PasswordResetToken)
- [apps/api/src/modules/auth/models/auth.model.ts](../../../apps/api/src/modules/auth/models/auth.model.ts) - GraphQL типы

### Валидация
- `apps/api/src/modules/auth/inputs/` - DTOs с валидацией (login, register, reset-password и т.д.)

---

## Как работает авторизация: Пошаговые flow

### 🔐 **1. Регистрация (Register)**

```
Пользователь → register(email, password, name?)
     ↓
Rate Limit проверка (5 попыток / 15 мин) - Redis
     ↓
Нормализация email (убирает точки в Gmail, алиасы)
     ↓
Проверка на дубликаты в БД (по emailNormalized)
     ↓
Хеширование пароля (Argon2id)
     ↓
Создание User в PostgreSQL (Prisma)
     ↓
Генерация VerificationToken (nanoid(48), 24ч TTL)
     ↓
Отправка email через Brevo
     ↓
Создание сессии в Redis:
  • session_token (nanoid(48), TTL 7 дней)
  • refresh_token (nanoid(48), TTL 30 дней)
     ↓
Установка HTTP-only cookies
     ↓
Возврат данных пользователя
```

**Redis записи:**
```
session:{token} → { userId, userAgent, ip, createdAt }
refresh:{token} → { userId, sessionToken }
user_sessions:{userId} → Set[sessionToken1, sessionToken2, ...]
rate_limit:register:{ip} → counter (TTL 15 мин)
```

---

### 🔑 **2. Логин (Login)**

```
Пользователь → login(email, password)
     ↓
Rate Limit проверка (5 попыток / 15 мин)
     ↓
Нормализация email + поиск в БД
     ↓
Проверка пароля (Argon2 verify)
     ↓
Создание сессии в Redis (session + refresh tokens)
     ↓
Установка HTTP-only cookies:
  • session_token (7 дней maxAge)
  • refresh_token (30 дней maxAge)
     ↓
Возврат данных пользователя
```

**Настройки cookies:**
```typescript
{
  httpOnly: true,        // Защита от XSS
  secure: true (prod),   // Только HTTPS в production
  sameSite: 'lax',       // CSRF защита
  path: '/'
}
```

---

### 🛡️ **3. Защищенные запросы (AuthGuard)**

```
GraphQL запрос → AuthGuard
     ↓
Проверка @Public() декоратора
     ↓ (если не публичный)
Извлечение session_token:
  1. Cookie: session_token (приоритет)
  2. Header: Authorization: Bearer <token> (fallback)
     ↓
Валидация в Redis (authService.validateSession)
     ↓
Получение данных пользователя из БД
     ↓
Добавление в контекст:
  • req.user (UserEntity)
  • req.sessionToken (string)
     ↓
Выполнение резолвера
```

**Использование в коде:**
```typescript
@Query(() => User)
async me(@CurrentUser() user: UserEntity) {
  return user; // Данные уже в контексте
}
```

---

### 🔄 **4. Обновление сессии (Refresh)**

```
Клиент → refreshSession()
     ↓
Извлечение refresh_token из cookie
     ↓
Валидация в Redis:
  • Проверка существования refresh_token
  • Получение связанного session_token
     ↓
Удаление старых токенов из Redis:
  • Старая сессия
  • Старый refresh token
     ↓
Создание НОВОЙ сессии (новые токены)
     ↓
Установка новых cookies
     ↓
Возврат данных пользователя
```

**Защита от replay атак:**
- Старый refresh token удаляется немедленно
- Используется rotation токенов

---

### 🚪 **5. Выход (Logout)**

```
Пользователь → logout()
     ↓
AuthGuard проверяет авторизацию
     ↓
Удаление из Redis:
  • session:{token}
  • refresh:{token}
  • Удаление из user_sessions:{userId}
     ↓
Очистка cookies (maxAge: 0)
     ↓
Возврат true
```

---

## Механизмы безопасности

### 🔒 **1. Хранение паролей**
- **Алгоритм:** Argon2id (рекомендован OWASP)
- **Параметры:**
  - Memory: 65536 KB (64 MB)
  - Iterations: 3
  - Parallelism: 4 threads
- **Защита:** Устойчив к GPU/ASIC атакам

### 🛡️ **2. Токены**
- **Генерация:** `nanoid(48)` - криптографически стойкий
- **Энтропия:** ~282 бита
- **Применение:**
  - Session tokens
  - Refresh tokens
  - Verification tokens
  - Password reset tokens

### 🚦 **3. Rate Limiting (Redis)**
- **Действия:** register, login, verify_email, forgot_password
- **Лимит:** 5 попыток / 15 минут (настраивается)
- **Идентификатор:** IP адрес или User ID
- **Реализация:** Счетчики в Redis с TTL

### 🍪 **4. Cookie Security**
```typescript
{
  httpOnly: true,     // JS не может читать (защита от XSS)
  secure: true,       // Только HTTPS (в production)
  sameSite: 'lax',    // Защита от CSRF
  path: '/'
}
```

### 📧 **5. Email Нормализация**
**Цель:** Предотвращение создания дубликатов аккаунтов

**Gmail/Googlemail:**
```
user.name+spam@gmail.com  → username@gmail.com
u.s.e.r@gmail.com        → user@gmail.com
```

**Другие провайдеры:**
```
user+alias@example.com    → user@example.com
```

**Хранение:**
- `email` - оригинальный email (для отправки писем)
- `emailNormalized` - нормализованный (для поиска дубликатов, unique индекс)

### 🔐 **6. Управление сессиями**

**Multi-device поддержка:**
- Пользователь может быть залогинен на нескольких устройствах
- Все сессии хранятся в `user_sessions:{userId}` (Redis Set)

**Операции:**
- `getUserSessions()` - Список всех активных сессий
- `revokeSession(sessionToken)` - Отозвать конкретную сессию
- `revokeAllSessions(exceptCurrent)` - Выход со всех устройств (кроме текущего)

**Device Fingerprinting:**
```typescript
{
  userId: string,
  userAgent: string,  // Браузер/устройство
  ip: string,         // IP адрес
  createdAt: number   // Timestamp создания
}
```

---

## Дополнительные Flow

### ✅ **Верификация Email**

```
Регистрация → Генерация VerificationToken (БД, 24ч TTL)
     ↓
Отправка email (Brevo)
     ↓
Пользователь кликает ссылку → verifyEmail(token)
     ↓
Проверка токена в БД (не истек, не использован)
     ↓
User.emailVerified = true
     ↓
Удаление токена из БД
```

---

### 🔑 **Сброс пароля**

```
forgotPassword(email) → Rate Limit Check
     ↓
Поиск пользователя (всегда возвращает success - защита от enumeration)
     ↓ (если найден)
Генерация PasswordResetToken (БД, 1ч TTL)
     ↓
Отправка email
     ↓
Пользователь → resetPassword(token, newPassword)
     ↓
Проверка токена (не истек, не использован)
     ↓
Хеширование нового пароля
     ↓
Обновление passwordHash
     ↓
Маркировка токена как used
     ↓
Удаление ВСЕХ сессий пользователя (безопасность)
```

---

### 🔄 **Смена пароля (залогиненный пользователь)**

```
changePassword(currentPassword, newPassword) → AuthGuard
     ↓
Проверка текущего пароля
     ↓
Хеширование нового пароля
     ↓
Обновление passwordHash
     ↓
Удаление всех сессий КРОМЕ текущей
     ↓
Возврат success
```

---

## Конфигурация (Переменные окружения)

```env
# Session
SESSION_SECRET=<случайная строка для подписи cookies>

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# Database (PostgreSQL)
DATABASE_URL=postgresql://user:password@localhost:5432/dbname

# Email (Brevo)
BREVO_API_KEY=<ключ>
BREVO_SENDER_EMAIL=noreply@yourdomain.com
BREVO_SENDER_NAME=YourApp

# Frontend URL (для CORS)
FRONTEND_URL=http://localhost:3000

# Node Environment
NODE_ENV=development | production
```

---

## Time-To-Live (TTL) настройки

```typescript
auth: {
  sessionTtl: 604800000,          // 7 дней (session token)
  refreshTokenTtl: 2592000000,    // 30 дней (refresh token)
  verificationTokenTtl: 86400000, // 24 часа (email verification)
  passwordResetTokenTtl: 3600000, // 1 час (password reset)
  rateLimitWindow: 900000,        // 15 минут (rate limit window)
  rateLimitAttempts: 5,           // 5 попыток (rate limit)
}
```

---

## Схема данных (PostgreSQL)

### **User**
```prisma
model User {
  id               String    @id @default(uuid())
  email            String    @unique        // Оригинальный email
  emailNormalized  String    @unique        // Для поиска дубликатов
  emailVerified    Boolean   @default(false)
  passwordHash     String                   // Argon2id hash
  name             String?
  phone            String?
  createdAt        DateTime  @default(now())
  updatedAt        DateTime  @updatedAt
}
```

### **VerificationToken**
```prisma
model VerificationToken {
  id        String   @id @default(uuid())
  token     String   @unique
  userId    String
  expiresAt DateTime                      // 24 часа от создания
  user      User     @relation(onDelete: Cascade)
}
```

### **PasswordResetToken**
```prisma
model PasswordResetToken {
  id        String   @id @default(uuid())
  token     String   @unique
  userId    String
  expiresAt DateTime                      // 1 час от создания
  used      Boolean  @default(false)      // Предотвращает reuse
  user      User     @relation(onDelete: Cascade)
}
```

---

## Middleware и Глобальные настройки

### **main.ts**
```typescript
// Cookie parsing
app.use(cookieParser(sessionSecret))

// CORS (важно для cookies)
app.enableCors({
  origin: [frontendUrl, 'http://localhost:3000'],
  credentials: true,              // Разрешает отправку cookies
  exposedHeaders: ['set-cookie'], // Браузер может видеть Set-Cookie
})

// Security headers
app.use(helmet({
  contentSecurityPolicy: {...},
  crossOriginEmbedderPolicy: false
}))

// Global validation
app.useGlobalPipes(new ValidationPipe({
  whitelist: true,        // Убирает неизвестные поля
  transform: true,        // Преобразует типы (DTO)
  forbidNonWhitelisted: true
}))

// Global AuthGuard (применяется ко всем роутам)
// Используй @Public() чтобы обойти
```

---

## Декораторы для удобства

```typescript
// В резолверах
@CurrentUser()        // Получить текущего пользователя
@SessionToken()       // Получить session token
@RefreshToken()       // Получить refresh token из cookie
@ClientIp()           // IP адрес (с учетом proxy)
@UserAgent()          // User-Agent header
@Public()             // Пометить роут как публичный
```

---

## Graceful Degradation (Redis)

**Поведение при отсутствии Redis:**
- Приложение **запускается** и работает
- Функции, требующие Redis, **отключены**:
  - Сессии (нельзя авторизоваться)
  - Rate limiting (нет защиты)
- Логи предупреждают о проблемах
- Стратегия переподключения (до 10 попыток)

---

## Безопасность: Чек-лист

✅ **Password Security:** Argon2id с сильными параметрами
✅ **XSS Protection:** HttpOnly cookies + Helmet headers
✅ **CSRF Protection:** SameSite cookies + CORS
✅ **Brute Force Protection:** Rate limiting (Redis)
✅ **Session Security:** TTL, device tracking, multi-device support
✅ **Token Security:** nanoid(48) - криптографически стойкий
✅ **Email Enumeration Prevention:** Всегда success на forgot password
✅ **Token Reuse Prevention:** Password reset tokens marked as used
✅ **Replay Attack Prevention:** Rotation refresh tokens
✅ **SQL Injection Protection:** Prisma ORM (prepared statements)
✅ **Email Duplication Prevention:** Нормализация + unique индекс

---

## Зависимости

```json
{
  "@nestjs/core": "^11.1.9",
  "@nestjs/graphql": "^13.2.0",
  "@nestjs/apollo": "^13.2.0",
  "redis": "^5.10.0",
  "@prisma/client": "^7.0.0",
  "argon2": "^0.44.0",
  "nanoid": "^5.1.6",
  "cookie-parser": "^1.4.7",
  "helmet": "^8.0.0",
  "class-validator": "^0.14.1",
  "class-transformer": "^0.5.1"
}
```

---

## Итоговая диаграмма потоков данных

```
                  ┌─────────────────┐
                  │   Frontend      │
                  │  (Next.js)      │
                  └────────┬────────┘
                           │ GraphQL + Cookies
                  ┌────────▼────────┐
                  │  AuthGuard      │◄─── @Public() Decorator
                  │  (проверка      │
                  │   токенов)      │
                  └────────┬────────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
   ┌────▼─────┐    ┌──────▼──────┐    ┌─────▼─────┐
   │  Auth    │    │   Users     │    │   Redis   │
   │ Resolver │◄───┤   Service   │◄───┤  Service  │
   └────┬─────┘    └──────┬──────┘    └─────┬─────┘
        │                 │                  │
        │          ┌──────▼──────┐    ┌─────▼─────┐
        │          │   Prisma    │    │   Redis   │
        │          │     ORM     │    │   Store   │
        │          └──────┬──────┘    └───────────┘
        │                 │              (sessions,
        │          ┌──────▼──────┐      refresh tokens,
        │          │ PostgreSQL  │      rate limits)
        │          │  Database   │
        │          └─────────────┘
        │           (users, tokens)
        │
   ┌────▼─────┐
   │  Brevo   │
   │  Email   │
   └──────────┘
  (verification,
   password reset)
```

---

## Заключение

Система авторизации реализует современные best practices:
- **Stateless токены** (session + refresh) в Redis
- **Безопасное хранение паролей** (Argon2id)
- **Multi-device поддержка** с управлением сессиями
- **Rate limiting** от brute force
- **Email верификация** и сброс пароля
- **Graceful degradation** при падении Redis
- **OWASP Top 10 защита** (XSS, CSRF, SQL Injection, etc.)

Все критичные операции логируются и защищены rate limiting.
