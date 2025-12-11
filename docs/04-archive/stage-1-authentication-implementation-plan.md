# План реализации: Этап 1 - Аутентификация (Authentication)

## Статус: ✅ Завершён

**Дата завершения:** 2025-12-03
**Цель:** Реализовать полную систему аутентификации с регистрацией, логином, восстановлением пароля и управлением сессиями

---

## Описание

Этап 1 включает реализацию безопасной системы аутентификации на базе session-based подхода с использованием Redis для хранения сессий, Argon2 для хеширования паролей и email verification через SMTP.

---

## Архитектура решения

### 1. DATABASE SCHEMA

**User Model:**
```prisma
model User {
  id                String    @id @default(uuid())
  email             String    @unique
  emailNormalized   String    @unique @map("email_normalized")
  passwordHash      String    @map("password_hash")
  name              String?
  phone             String?
  emailVerified     Boolean   @default(false) @map("email_verified")
  emailVerifiedAt   DateTime? @map("email_verified_at")
  createdAt         DateTime  @default(now()) @map("created_at")
  updatedAt         DateTime  @updatedAt @map("updated_at")

  // Relations
  verificationTokens    VerificationToken[]
  passwordResetTokens   PasswordResetToken[]

  @@index([emailNormalized])
  @@map("users")
}

model VerificationToken {
  id        String   @id @default(uuid())
  userId    String   @map("user_id")
  token     String   @unique
  expiresAt DateTime @map("expires_at")
  createdAt DateTime @default(now()) @map("created_at")

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([token])
  @@map("verification_tokens")
}

model PasswordResetToken {
  id        String   @id @default(uuid())
  userId    String   @map("user_id")
  token     String   @unique
  used      Boolean  @default(false)
  expiresAt DateTime @map("expires_at")
  createdAt DateTime @default(now()) @map("created_at")

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([token])
  @@map("password_reset_tokens")
}
```

---

### 2. BACKEND API

**Структура модуля:**
```
apps/api/src/modules/auth/
├── decorators/
│   ├── current-user.decorator.ts    # @CurrentUser() param decorator
│   └── public.decorator.ts          # @Public() route decorator
├── dto/
│   ├── login.input.ts               # LoginInput DTO
│   ├── register.input.ts            # RegisterInput DTO
│   ├── reset-password.input.ts      # ResetPasswordInput DTO
│   └── change-password.input.ts     # ChangePasswordInput DTO
├── guards/
│   └── auth.guard.ts                # AuthGuard для защиты routes
├── models/
│   └── auth.model.ts                # GraphQL User type
├── auth.service.ts                  # Business logic
├── auth.resolver.ts                 # GraphQL resolver
└── auth.module.ts                   # NestJS module
```

#### 2.1 Auth Service

**Основные методы:**

**Registration:**
```typescript
async register(input: RegisterInput, ip?: string): Promise<{
  user: User;
  sessionToken: string;
  refreshToken: string;
}> {
  // 1. Rate limiting check
  await this.checkRateLimit('register', ip)

  // 2. Normalize email (remove dots from Gmail, handle +aliases)
  const emailNormalized = this.normalizeEmail(input.email)

  // 3. Check if user exists
  const existingUser = await this.usersService.findByEmailNormalized(emailNormalized)
  if (existingUser) {
    throw new BadRequestException('Пользователь с таким email уже существует')
  }

  // 4. Hash password with Argon2
  const passwordHash = await argon2.hash(password, {
    type: argon2.argon2id,
    memoryCost: 65536,
    timeCost: 3,
    parallelism: 4,
  })

  // 5. Create user
  const user = await this.usersService.create({
    email: input.email.trim().toLowerCase(),
    emailNormalized,
    passwordHash,
    name: input.name,
    phone: input.phone,
  })

  // 6. Create verification token
  await this.createVerificationToken(user.id)

  // 7. Create session
  const { sessionToken, refreshToken } = await this.createSession(
    user.id,
    userAgent,
    ip,
  )

  return { user, sessionToken, refreshToken }
}
```

**Login:**
```typescript
async login(input: LoginInput, ip?: string): Promise<{
  user: User;
  sessionToken: string;
  refreshToken: string;
}> {
  // 1. Rate limiting
  await this.checkRateLimit('login', ip)

  // 2. Find user by normalized email
  const emailNormalized = this.normalizeEmail(input.email)
  const user = await this.usersService.findByEmailNormalized(emailNormalized)

  if (!user) {
    await this.incrementRateLimit('login', ip)
    throw new UnauthorizedException('Неверный email или пароль')
  }

  // 3. Verify password
  const isValidPassword = await argon2.verify(user.passwordHash, input.password)
  if (!isValidPassword) {
    await this.incrementRateLimit('login', ip)
    throw new UnauthorizedException('Неверный email или пароль')
  }

  // 4. Create session
  const { sessionToken, refreshToken } = await this.createSession(
    user.id,
    userAgent,
    ip,
  )

  return { user, sessionToken, refreshToken }
}
```

**Session Management:**
```typescript
async createSession(
  userId: string,
  userAgent?: string,
  ip?: string,
): Promise<{ sessionToken: string; refreshToken: string }> {
  const sessionToken = nanoid(48)
  const refreshToken = nanoid(48)

  const sessionData: SessionData = {
    userId,
    userAgent,
    ip,
    createdAt: Date.now(),
  }

  // Store in Redis with TTL
  await this.redisService.setSession(sessionToken, sessionData, this.sessionTtl)
  await this.redisService.setRefreshToken(
    refreshToken,
    { userId, sessionToken },
    this.refreshTokenTtl,
  )

  return { sessionToken, refreshToken }
}

async validateSession(sessionToken: string): Promise<SessionData | null> {
  return this.redisService.getSession(sessionToken)
}
```

**Email Verification:**
```typescript
async createVerificationToken(userId: string): Promise<string> {
  const token = nanoid(48)
  const expiresAt = new Date(Date.now() + this.verificationTokenTtl)

  await this.usersService.createVerificationToken(userId, token, expiresAt)

  const user = await this.usersService.findById(userId)
  if (user) {
    await this.mailService.sendVerificationEmail(user.email, user.name ?? '', token)
  }

  return token
}

async verifyEmail(token: string): Promise<boolean> {
  const verificationToken = await this.usersService.findVerificationToken(token)

  if (!verificationToken) {
    throw new BadRequestException('Недействительный токен верификации')
  }

  if (verificationToken.expiresAt < new Date()) {
    throw new BadRequestException('Токен верификации истёк')
  }

  await this.usersService.verifyEmail(verificationToken.userId)
  await this.usersService.deleteVerificationToken(token)

  return true
}
```

**Password Reset:**
```typescript
async forgotPassword(email: string, ip?: string): Promise<boolean> {
  await this.checkRateLimit('forgot_password', ip)

  const emailNormalized = this.normalizeEmail(email)
  const user = await this.usersService.findByEmailNormalized(emailNormalized)

  // Always return true to prevent email enumeration
  if (!user) {
    await this.incrementRateLimit('forgot_password', ip)
    return true
  }

  const token = nanoid(48)
  const expiresAt = new Date(Date.now() + this.passwordResetTokenTtl)

  await this.usersService.createPasswordResetToken(user.id, token, expiresAt)
  await this.mailService.sendPasswordResetEmail(user.email, user.name ?? '', token)

  await this.incrementRateLimit('forgot_password', ip)
  return true
}

async resetPassword(token: string, newPassword: string): Promise<boolean> {
  const resetToken = await this.usersService.findPasswordResetToken(token)

  if (!resetToken || resetToken.expiresAt < new Date() || resetToken.used) {
    throw new BadRequestException('Недействительный токен сброса пароля')
  }

  const passwordHash = await this.hashPassword(newPassword)
  await this.usersService.updatePassword(resetToken.userId, passwordHash)
  await this.usersService.markPasswordResetTokenUsed(token)

  // Invalidate all sessions
  await this.revokeAllSessions(resetToken.userId)

  return true
}
```

#### 2.2 Auth Resolver

**GraphQL Operations:**

**Mutations:**
```typescript
@Mutation(() => AuthResult, { description: 'Регистрация нового пользователя' })
async register(
  @Args('input') input: RegisterInput,
  @Context() context,
): Promise<AuthResult> {
  const { req, res } = context
  const result = await this.authService.register(
    input,
    req.headers['user-agent'],
    req.ip,
  )

  // Set HTTP-only cookies
  res.cookie('session_token', result.sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  })

  res.cookie('refresh_token', result.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  })

  return { user: result.user }
}

@Mutation(() => AuthResult, { description: 'Вход в систему' })
async login(
  @Args('input') input: LoginInput,
  @Context() context,
): Promise<AuthResult> {
  // Similar to register...
}

@Mutation(() => Boolean, { description: 'Выход из системы' })
@UseGuards(AuthGuard)
async logout(@Context() context, @CurrentUser() user): Promise<boolean> {
  const { req, res } = context
  const sessionToken = req.cookies.session_token
  const refreshToken = req.cookies.refresh_token

  await this.authService.logout(sessionToken, refreshToken, user.id)

  res.clearCookie('session_token')
  res.clearCookie('refresh_token')

  return true
}
```

**Queries:**
```typescript
@Query(() => User, { description: 'Получить текущего пользователя' })
@UseGuards(AuthGuard)
async me(@CurrentUser() user): Promise<User> {
  return this.usersService.findById(user.id)
}
```

#### 2.3 Auth Guard

**Implementation:**
```typescript
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly authService: AuthService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Check if route is public
    const isPublic = this.reflector.get<boolean>(
      IS_PUBLIC_KEY,
      context.getHandler(),
    )
    if (isPublic) return true

    const ctx = GqlExecutionContext.create(context)
    const { req } = ctx.getContext()

    const sessionToken = req.cookies?.session_token
    if (!sessionToken) {
      throw new UnauthorizedException('Not authenticated')
    }

    const session = await this.authService.validateSession(sessionToken)
    if (!session) {
      throw new UnauthorizedException('Invalid session')
    }

    // Attach user to request
    req.user = { id: session.userId }

    return true
  }
}
```

---

### 3. FRONTEND IMPLEMENTATION

**Структура:**
```
apps/web/src/
├── app/(root)/auth/
│   ├── login/page.tsx
│   ├── register/page.tsx
│   ├── forgot-password/page.tsx
│   ├── reset-password/page.tsx
│   ├── layout.tsx
│   └── loading.tsx
├── packages/libs/auth/
│   └── auth.context.tsx            # AuthProvider + hooks
├── packages/api/graphql/
│   └── auth.graphql                # GraphQL queries/mutations
└── packages/schemas/auth/
    ├── login.schema.ts             # Zod validation
    ├── register.schema.ts
    └── password-reset.schema.ts
```

#### 3.1 GraphQL Schema

**File:** `apps/web/src/packages/api/graphql/auth.graphql`

```graphql
mutation Register($input: RegisterInput!) {
  register(input: $input) {
    user {
      id
      email
      name
      emailVerified
      hasCompletedOnboarding
    }
    message
  }
}

mutation Login($input: LoginInput!) {
  login(input: $input) {
    user {
      id
      email
      name
      emailVerified
      hasCompletedOnboarding
    }
  }
}

mutation Logout {
  logout
}

mutation RefreshSession {
  refreshSession {
    user {
      id
      email
      name
      emailVerified
      hasCompletedOnboarding
    }
  }
}

query Me {
  me {
    id
    email
    name
    phone
    emailVerified
    hasCompletedOnboarding
    createdAt
  }
}

mutation ForgotPassword($email: String!) {
  forgotPassword(email: $email)
}

mutation ResetPassword($input: ResetPasswordInput!) {
  resetPassword(input: $input)
}
```

#### 3.2 Auth Context

**File:** `apps/web/src/packages/libs/auth/auth.context.tsx`

**Features:**
- Centralized authentication state management
- Auto-redirect based on `hasCompletedOnboarding`
- Session refresh on mount
- Login/logout/register functions
- User state tracking

```typescript
interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  register: (input: RegisterInput) => Promise<void>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  // Refresh user on mount
  useEffect(() => {
    refreshUser()
  }, [])

  // Auto-redirect based on onboarding status
  useEffect(() => {
    if (isLoading || !user) return
    const pathname = window.location.pathname

    if (pathname.startsWith('/onboarding') && user.hasCompletedOnboarding) {
      router.push('/dashboard')
    }

    if ((pathname.startsWith('/dashboard') || pathname.startsWith('/teams'))
        && !user.hasCompletedOnboarding) {
      router.push('/onboarding')
    }
  }, [user, isLoading, router])

  const login = async (email: string, password: string) => {
    const result = await loginMutation({ variables: { input: { email, password } } })
    const user = result.data.login.user
    setUser(user)

    // Conditional redirect
    setTimeout(() => {
      if (!user.hasCompletedOnboarding) {
        router.push('/onboarding')
      } else {
        router.push('/dashboard')
      }
    }, 100)
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, isAuthenticated, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}
```

#### 3.3 Validation Schemas

**Login Schema:**
```typescript
export const loginSchema = z.object({
  email: z
    .string()
    .email('Некорректный email адрес')
    .min(1, 'Email обязателен'),
  password: z
    .string()
    .min(8, 'Пароль должен содержать минимум 8 символов')
    .min(1, 'Пароль обязателен'),
})
```

**Register Schema:**
```typescript
export const registerSchema = z.object({
  name: z
    .string()
    .min(2, 'Имя должно содержать минимум 2 символа')
    .max(100, 'Имя слишком длинное'),
  email: z
    .string()
    .email('Некорректный email адрес'),
  phone: z
    .string()
    .regex(/^\+?[0-9]{10,15}$/, 'Некорректный формат телефона')
    .optional(),
  password: z
    .string()
    .min(8, 'Пароль должен содержать минимум 8 символов')
    .regex(/[A-Z]/, 'Пароль должен содержать заглавную букву')
    .regex(/[a-z]/, 'Пароль должен содержать строчную букву')
    .regex(/[0-9]/, 'Пароль должен содержать цифру'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Пароли не совпадают',
  path: ['confirmPassword'],
})
```

#### 3.4 Auth Pages

**Login Page:**
- Email + Password inputs
- Remember me checkbox
- Link to forgot password
- Link to register
- Form validation with Zod + React Hook Form
- Error handling with toast notifications
- Auto-redirect after successful login

**Register Page:**
- Name, Email, Phone, Password, Confirm Password inputs
- Terms & Conditions checkbox
- Form validation
- Email verification notification
- Auto-redirect to onboarding after registration

**Forgot Password Page:**
- Email input
- Submit button
- Success message with instructions
- Rate limiting protection

**Reset Password Page:**
- Token validation from URL
- New password + confirm password inputs
- Password strength indicator
- Success redirect to login

---

## Безопасность

### 1. Password Security
- ✅ Argon2id hashing (memoryCost: 65536, timeCost: 3)
- ✅ Минимум 8 символов
- ✅ Требования: uppercase, lowercase, digit
- ✅ Защита от timing attacks

### 2. Session Security
- ✅ HTTP-only cookies (защита от XSS)
- ✅ SameSite=Lax (защита от CSRF)
- ✅ Secure flag в production
- ✅ Session TTL: 7 дней
- ✅ Refresh token TTL: 30 дней
- ✅ Redis для хранения сессий
- ✅ Session invalidation после смены пароля

### 3. Email Security
- ✅ Email normalization (Gmail dots, +aliases)
- ✅ Email enumeration protection (всегда return true)
- ✅ Verification tokens (48-char nanoid)
- ✅ Token expiration (24 hours)

### 4. Rate Limiting
- ✅ Login attempts: 5/15 минут
- ✅ Register attempts: 3/15 минут
- ✅ Password reset: 3/15 минут
- ✅ Email verification: 3/15 минут

### 5. Input Validation
- ✅ Backend: class-validator decorators
- ✅ Frontend: Zod schemas
- ✅ SQL injection protection (Prisma ORM)
- ✅ XSS protection (sanitization)

---

## Технологии

### Backend:
- **Framework:** NestJS 11
- **GraphQL:** Apollo Server
- **Database:** PostgreSQL + Prisma ORM
- **Cache:** Redis (sessions)
- **Password Hashing:** Argon2
- **Tokens:** nanoid (48 chars)
- **Email:** Nodemailer + SMTP
- **Validation:** class-validator

### Frontend:
- **Framework:** Next.js 16 (App Router)
- **GraphQL Client:** Apollo Client 3
- **Forms:** React Hook Form + Zod
- **State:** React Context API
- **Styling:** Tailwind CSS v4 + shadcn/ui
- **Routing:** Next.js App Router

---

## Файлы реализации

### Backend (11 файлов):
1. `apps/api/src/modules/auth/auth.service.ts` - Business logic
2. `apps/api/src/modules/auth/auth.resolver.ts` - GraphQL resolver
3. `apps/api/src/modules/auth/auth.module.ts` - Module configuration
4. `apps/api/src/modules/auth/guards/auth.guard.ts` - Route protection
5. `apps/api/src/modules/auth/decorators/current-user.decorator.ts` - User injection
6. `apps/api/src/modules/auth/decorators/public.decorator.ts` - Public routes
7. `apps/api/src/modules/auth/dto/login.input.ts` - Login DTO
8. `apps/api/src/modules/auth/dto/register.input.ts` - Register DTO
9. `apps/api/src/modules/auth/dto/reset-password.input.ts` - Reset DTO
10. `apps/api/src/modules/auth/dto/change-password.input.ts` - Change DTO
11. `apps/api/src/modules/auth/models/auth.model.ts` - GraphQL types

### Frontend (10 файлов):
1. `apps/web/src/packages/libs/auth/auth.context.tsx` - Auth provider
2. `apps/web/src/packages/api/graphql/auth.graphql` - GraphQL schema
3. `apps/web/src/packages/schemas/auth/login.schema.ts` - Login validation
4. `apps/web/src/packages/schemas/auth/register.schema.ts` - Register validation
5. `apps/web/src/packages/schemas/auth/password-reset.schema.ts` - Reset validation
6. `apps/web/src/app/(root)/auth/login/page.tsx` - Login page
7. `apps/web/src/app/(root)/auth/register/page.tsx` - Register page
8. `apps/web/src/app/(root)/auth/forgot-password/page.tsx` - Forgot password
9. `apps/web/src/app/(root)/auth/reset-password/page.tsx` - Reset password
10. `apps/web/src/app/(root)/auth/layout.tsx` - Auth layout

---

## Критерии успеха

- ✅ Пользователь может зарегистрироваться с email и паролем
- ✅ Пользователь получает verification email
- ✅ Пользователь может войти в систему
- ✅ Сессия сохраняется в HTTP-only cookies
- ✅ Пользователь может выйти из системы
- ✅ Пользователь может восстановить пароль
- ✅ Пользователь может сменить пароль
- ✅ AuthGuard защищает защищённые routes
- ✅ Rate limiting работает
- ✅ Email normalization работает
- ✅ Validation работает на backend и frontend
- ✅ Session refresh работает автоматически

---

## Следующий этап

**Этап 2: Onboarding & Teams** ✅ Завершён
- Онбординг с 3 шагами
- Создание команды
- Загрузка логотипа (file upload + emoji picker)
- Создание первого проекта
