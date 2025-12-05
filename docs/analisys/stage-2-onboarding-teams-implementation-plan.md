# План реализации: Этап 2 - Onboarding & Teams

## Статус: ✅ Завершён

**Дата завершения:** 2025-12-05
**Цель:** Реализовать 3-шаговый онбординг для создания команды и первого проекта с последующим E2E тестированием

---

## Описание

Этап 2 включает реализацию полного онбординг flow с 3 шагами: создание команды, выбор логотипа (загрузка файла или emoji picker), создание первого проекта. Включает backend атомарную транзакцию, файл-апл оад с обработкой изображений через Sharp, защиту маршрутов через middleware, и автоматические redirects на основе `hasCompletedOnboarding`.

---

## Архитектура решения

### 1. DATABASE SCHEMA UPDATES

**User Model Extensions:**
```prisma
model User {
  // ... существующие поля

  // Onboarding tracking
  hasCompletedOnboarding Boolean  @default(false) @map("has_completed_onboarding")
  onboardingCompletedAt  DateTime? @map("onboarding_completed_at")
  currentTeamId          String?   @map("current_team_id")

  // Relations
  currentTeam            Team?     @relation("CurrentTeam", fields: [currentTeamId], references: [id], onDelete: SetNull)
  ownedTeams             Team[]    @relation("OwnedTeams")
  teamMemberships        TeamMember[]

  @@index([currentTeamId])
}
```

**Team Model:**
```prisma
model Team {
  id          String    @id @default(uuid())
  name        String
  ownerId     String    @map("owner_id")
  logoType    LogoType  @default(GENERATED) @map("logo_type")
  logoUrl     String?   @map("logo_url")      // Uploaded file URL
  iconId      String?   @map("icon_id")       // Emoji icon ID
  colorId     String?   @map("color_id")      // Background color ID
  createdAt   DateTime  @default(now()) @map("created_at")
  updatedAt   DateTime  @updatedAt @map("updated_at")

  // Relations
  owner               User         @relation("OwnedTeams", fields: [ownerId], references: [id], onDelete: Cascade)
  currentForUsers     User[]       @relation("CurrentTeam")
  members             TeamMember[]
  projects            Project[]

  @@index([ownerId])
  @@map("teams")
}

enum LogoType {
  UPLOADED   // User uploaded custom image
  GENERATED  // Using iconId + colorId
  DEFAULT    // System default logo
}
```

**TeamMember Model:**
```prisma
model TeamMember {
  id        String   @id @default(uuid())
  teamId    String   @map("team_id")
  userId    String   @map("user_id")
  role      TeamRole @default(MEMBER)
  joinedAt  DateTime @default(now()) @map("joined_at")

  team Team @relation(fields: [teamId], references: [id], onDelete: Cascade)
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([teamId, userId])
  @@index([teamId])
  @@index([userId])
  @@map("team_members")
}

enum TeamRole {
  OWNER
  ADMIN
  MEMBER
}
```

**Project Model Updates:**
```prisma
model Project {
  // ... существующие поля

  createdById String @map("created_by_id")  // Who created the project

  @@index([createdById])
}
```

---

### 2. BACKEND API

**Структура модуля:**
```
apps/api/src/modules/teams/
├── dto/
│   └── complete-onboarding.input.ts    # GraphQL Input DTO
├── models/
│   ├── logo-type.enum.ts               # Enum типов логотипов
│   ├── team.model.ts                   # GraphQL Team type
│   ├── project.model.ts                # GraphQL Project type
│   └── onboarding-result.model.ts      # GraphQL Result type
├── teams.service.ts                    # Business logic
├── teams.resolver.ts                   # GraphQL resolver
└── teams.module.ts                     # NestJS module
```

#### 2.1 Storage Service (File Upload)

**Created Files:**
```
apps/api/src/core/storage/
├── storage.service.ts
└── storage.module.ts
```

**Features:**
- ✅ Supported formats: PNG, JPG, JPEG, WEBP
- ✅ Max file size: 5MB
- ✅ Auto-resize to 512x512 (contain fit)
- ✅ Convert to WebP (quality: 90)
- ✅ Transparent background support
- ✅ Unique filename generation (timestamp + random hash)

**Image Processing Pipeline:**
```typescript
async uploadTeamLogo(file: FileUpload): Promise<string> {
  // 1. Validate file
  const allowedMimeTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp']
  if (!allowedMimeTypes.includes(file.mimetype)) {
    throw new BadRequestException('Недопустимый формат файла')
  }

  // 2. Check file size (5MB max)
  const buffer = await streamToBuffer(file.createReadStream())
  if (buffer.length > 5 * 1024 * 1024) {
    throw new BadRequestException('Файл слишком большой (макс 5MB)')
  }

  // 3. Process with Sharp
  const processed = await sharp(buffer)
    .resize(512, 512, {
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 }, // transparent
    })
    .webp({ quality: 90 })
    .toBuffer()

  // 4. Save to disk (temp, migrate to R2/S3 later)
  const filename = `team-logo-${Date.now()}-${nanoid(8)}.webp`
  const filePath = path.join(uploadsDir, 'team-logos', filename)
  await fs.promises.writeFile(filePath, processed)

  // 5. Return public URL
  return `/uploads/team-logos/${filename}`
}
```

**Security:**
- MIME type validation
- File size limits
- Safe filename generation
- Directory traversal protection

**Dependencies:**
```bash
npm install sharp@^0.34.5
```

#### 2.2 Teams Service

**Main Method: `completeOnboarding()`**

**Atomic Transaction с 5 шагами:**
```typescript
async completeOnboarding(
  userId: string,
  input: CompleteOnboardingInput,
): Promise<OnboardingResult> {
  // ========== PRE-VALIDATIONS ==========

  // 1. Check user exists
  const user = await this.prisma.user.findUnique({ where: { id: userId } })
  if (!user) {
    throw new NotFoundException('Пользователь не найден')
  }

  // 2. Check onboarding not completed
  if (user.hasCompletedOnboarding) {
    throw new BadRequestException('Онбординг уже завершён')
  }

  // 3. Check user doesn't own another team
  const existingTeam = await this.prisma.team.findFirst({
    where: { ownerId: userId },
  })
  if (existingTeam) {
    throw new BadRequestException('У вас уже есть команда')
  }

  // 4. Validate input
  if (!input.teamName || !input.projectName) {
    throw new BadRequestException('Все обязательные поля должны быть заполнены')
  }

  // ========== ATOMIC TRANSACTION ==========

  return await this.prisma.$transaction(async (tx) => {
    // 5. Process logo (uploaded file OR icon+color OR default)
    const logoData = await this.processLogo(input)

    // 6. Create team
    const team = await tx.team.create({
      data: {
        name: input.teamName,
        ownerId: userId,
        ...logoData,
      },
    })

    // 7. Add owner as team member with OWNER role
    await tx.teamMember.create({
      data: {
        teamId: team.id,
        userId: userId,
        role: 'OWNER',
      },
    })

    // 8. Create first project
    const project = await tx.project.create({
      data: {
        name: input.projectName,
        address: input.projectAddress,
        description: input.projectDescription,
        teamId: team.id,
        createdById: userId,
        isActive: true,
      },
    })

    // 9. Update user onboarding status
    await tx.user.update({
      where: { id: userId },
      data: {
        hasCompletedOnboarding: true,
        onboardingCompletedAt: new Date(),
        currentTeamId: team.id,
      },
    })

    return {
      success: true,
      message: 'Онбординг успешно завершён!',
      team,
      project,
    }
  })
}
```

**Logo Processing Logic:**
```typescript
private async processLogo(input: CompleteOnboardingInput): Promise<{
  logoType: LogoType;
  logoUrl?: string;
  iconId?: string;
  colorId?: string;
}> {
  // Case 1: Uploaded file
  if (input.logoFile) {
    const logoUrl = await this.storageService.uploadTeamLogo(input.logoFile)
    return { logoType: 'UPLOADED', logoUrl }
  }

  // Case 2: Icon + Color
  if (input.iconId && input.colorId) {
    return {
      logoType: 'GENERATED',
      iconId: input.iconId,
      colorId: input.colorId,
    }
  }

  // Case 3: Default
  return { logoType: 'DEFAULT' }
}
```

#### 2.3 Teams Resolver

**GraphQL Schema:**
```graphql
input CompleteOnboardingInput {
  # Step 1 - Team Data
  teamName: String!

  # Step 2 - Logo Data (one of three options)
  logoFile: Upload          # Uploaded image file
  iconId: String            # Selected emoji icon (e.g., "hammer")
  colorId: String           # Selected background color (e.g., "orange")

  # Step 3 - First Project Data
  projectName: String!
  projectAddress: String
  projectDescription: String
}

type OnboardingResult {
  success: Boolean!
  team: Team!
  project: Project!
  message: String!
}

type Mutation {
  completeOnboarding(input: CompleteOnboardingInput!): OnboardingResult!
}
```

**Resolver Implementation:**
```typescript
@Mutation(() => OnboardingResult, { description: 'Завершить онбординг' })
@UseGuards(AuthGuard)
async completeOnboarding(
  @Args('input') input: CompleteOnboardingInput,
  @CurrentUser() user: { id: string },
): Promise<OnboardingResult> {
  return this.teamsService.completeOnboarding(user.id, input)
}
```

---

### 3. FRONTEND IMPLEMENTATION

**Структура:**
```
apps/web/src/
├── app/(root)/onboarding/
│   ├── step-1/page.tsx              # Team name input
│   ├── step-2/page.tsx              # Logo selection
│   ├── step-3/page.tsx              # First project creation
│   ├── layout.tsx                   # Onboarding layout
│   └── loading.tsx                  # Loading state
├── app/(root)/(protected)/
│   └── teams/[teamId]/
│       ├── page.tsx                 # Team dashboard
│       └── layout.tsx               # Protected layout
├── packages/libs/auth/
│   └── auth.context.tsx             # Auth state with onboarding redirect
├── packages/api/graphql/
│   ├── teams.graphql                # Teams queries/mutations
│   └── auth.graphql                 # Updated with hasCompletedOnboarding
├── packages/schemas/onboarding/
│   ├── step-1.schema.ts
│   ├── step-2.schema.ts
│   └── step-3.schema.ts
└── middleware.ts                     # Route protection
```

#### 3.1 Onboarding Step 1: Team Name

**File:** `apps/web/src/app/(root)/onboarding/step-1/page.tsx`

**Features:**
- Input field для названия команды
- Validation: min 2 chars, max 100 chars, required
- Save to sessionStorage
- Navigate to step-2

**Implementation:**
```typescript
'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { step1Schema } from '@/packages/schemas/onboarding'

export default function Step1Page() {
  const router = useRouter()
  const form = useForm({
    resolver: zodResolver(step1Schema),
    defaultValues: {
      name: sessionStorage.getItem('onboarding_step1')
        ? JSON.parse(sessionStorage.getItem('onboarding_step1')).name
        : '',
    },
  })

  const onSubmit = (data: { name: string }) => {
    sessionStorage.setItem('onboarding_step1', JSON.stringify(data))
    router.push('/onboarding/step-2')
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <Input
        label="Название команды"
        {...form.register('name')}
        error={form.formState.errors.name?.message}
      />
      <Button type="submit">Продолжить</Button>
    </form>
  )
}
```

#### 3.2 Onboarding Step 2: Logo Selection

**File:** `apps/web/src/app/(root)/onboarding/step-2/page.tsx`

**Features:**
- 2 опции: Upload File или Icon Picker
- File upload с preview
- Icon picker с emoji grid
- Color picker (10 предустановленных цветов)
- Image crop/resize клиент-сайд (optional)
- Base64 conversion для sessionStorage
- Navigate to step-3

**Logo Options:**

**Option 1: Upload File**
- Drag & drop зона
- File input button
- Formats: PNG, JPG, JPEG, WEBP
- Max size: 5MB
- Preview с crop/resize
- Convert to base64 для хранения в sessionStorage

**Option 2: Icon + Color**
- Emoji grid picker (🔨, 🏗️, 🚧, 👷, etc.)
- Color palette (orange, blue, green, red, purple, etc.)
- Live preview circle

**Implementation:**
```typescript
'use client'

export default function Step2Page() {
  const [selectedOption, setSelectedOption] = useState<'upload' | 'icon'>('icon')
  const [logoBase64, setLogoBase64] = useState<string | null>(null)
  const [iconId, setIconId] = useState<string>('hammer')
  const [colorId, setColorId] = useState<string>('orange')

  const handleFileUpload = async (file: File) => {
    // Convert to base64
    const reader = new FileReader()
    reader.onload = () => {
      setLogoBase64(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const onSubmit = () => {
    const data = {
      hasUploadedLogo: selectedOption === 'upload',
      logoBase64: selectedOption === 'upload' ? logoBase64 : null,
      iconId: selectedOption === 'icon' ? iconId : null,
      colorId: selectedOption === 'icon' ? colorId : null,
    }
    sessionStorage.setItem('onboarding_step2', JSON.stringify(data))
    router.push('/onboarding/step-3')
  }

  return (
    <div>
      {/* Option Toggle */}
      <div className="flex gap-4 mb-6">
        <Button
          variant={selectedOption === 'upload' ? 'default' : 'outline'}
          onClick={() => setSelectedOption('upload')}
        >
          Загрузить файл
        </Button>
        <Button
          variant={selectedOption === 'icon' ? 'default' : 'outline'}
          onClick={() => setSelectedOption('icon')}
        >
          Выбрать иконку
        </Button>
      </div>

      {/* Upload Option */}
      {selectedOption === 'upload' && (
        <FileUploadZone onFileSelect={handleFileUpload} />
      )}

      {/* Icon Picker Option */}
      {selectedOption === 'icon' && (
        <div>
          <IconPicker value={iconId} onChange={setIconId} />
          <ColorPicker value={colorId} onChange={setColorId} />
        </div>
      )}

      <Button onClick={onSubmit}>Продолжить</Button>
    </div>
  )
}
```

#### 3.3 Onboarding Step 3: First Project

**File:** `apps/web/src/app/(root)/onboarding/step-3/page.tsx`

**Features:**
- Form для создания проекта
- Fields: name (required), address (optional), description (optional)
- Validation через Zod
- Combine data from all 3 steps
- Call `completeOnboarding` mutation
- Confetti animation on success
- Clear sessionStorage
- Redirect to `/teams/{teamId}`

**Implementation:**
```typescript
'use client'

import { useMutation } from '@apollo/client/react'
import { CompleteOnboardingDocument } from '@/packages/api/graphql'
import confetti from 'canvas-confetti'

export default function Step3Page() {
  const router = useRouter()
  const form = useForm({
    resolver: zodResolver(step3Schema),
  })

  const [completeOnboarding, { loading, error }] = useMutation(
    CompleteOnboardingDocument,
    { client: apolloClient },
  )

  const onSubmit = async (data: CreateProjectInput) => {
    // 1. Load data from all steps
    const step1 = JSON.parse(sessionStorage.getItem('onboarding_step1'))
    const step2 = JSON.parse(sessionStorage.getItem('onboarding_step2'))

    // 2. Prepare input
    const input: CompleteOnboardingInput = {
      teamName: step1.name,
      projectName: data.name,
      projectAddress: data.address,
      projectDescription: data.description,
    }

    // 3. Add logo data (either file or icon+color)
    if (step2.hasUploadedLogo && step2.logoBase64) {
      // Convert base64 to File
      const base64Response = await fetch(step2.logoBase64)
      const blob = await base64Response.blob()
      const file = new File([blob], 'logo.png', { type: 'image/png' })
      input.logoFile = file
    } else {
      input.iconId = step2.iconId
      input.colorId = step2.colorId
    }

    // 4. Call mutation
    try {
      const result = await completeOnboarding({ variables: { input } })

      // 5. Success!
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      })

      // 6. Clear sessionStorage
      sessionStorage.removeItem('onboarding_step1')
      sessionStorage.removeItem('onboarding_step2')

      // 7. Redirect to team dashboard
      setTimeout(() => {
        router.push(`/teams/${result.data.completeOnboarding.team.id}`)
      }, 2000)
    } catch (err) {
      console.error('Onboarding failed:', err)
      setError(err.message)
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <Input
        label="Название проекта"
        {...form.register('name')}
        error={form.formState.errors.name?.message}
      />
      <Input
        label="Адрес объекта (опционально)"
        {...form.register('address')}
      />
      <Textarea
        label="Описание (опционально)"
        {...form.register('description')}
      />
      <Button type="submit" disabled={loading}>
        {loading ? 'Создание...' : 'Завершить'}
      </Button>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-4 bg-destructive/10 border border-destructive/50 rounded-md"
        >
          <p className="text-destructive text-sm">{error}</p>
        </motion.div>
      )}
    </form>
  )
}
```

#### 3.4 Auth Context Updates

**File:** `apps/web/src/packages/libs/auth/auth.context.tsx`

**Key Changes:**
- Add `hasCompletedOnboarding: boolean` to User interface
- Update `login()` with conditional redirect
- Update `register()` with auto-redirect to `/onboarding`
- Add auto-redirect useEffect

**Auto-redirect Logic:**
```typescript
useEffect(() => {
  if (isLoading || !user) return
  const pathname = window.location.pathname

  // Redirect from onboarding if completed
  if (pathname.startsWith('/onboarding') && user.hasCompletedOnboarding) {
    router.push('/dashboard')
  }

  // Redirect to onboarding if not completed
  if ((pathname.startsWith('/dashboard') || pathname.startsWith('/teams'))
      && !user.hasCompletedOnboarding) {
    router.push('/onboarding')
  }
}, [user, isLoading, router])
```

**Login with redirect:**
```typescript
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
```

#### 3.5 Middleware Protection

**File:** `apps/web/src/middleware.ts`

**Features:**
- Server-side route protection
- Check `session_token` cookie
- Public routes: `/`, `/auth/*`, `/api/*`
- Protected routes: `/onboarding`, `/dashboard`, `/teams`
- Redirect to `/auth/login` with `callbackUrl`
- Optimized matcher (exclude static files)

**Implementation:**
```typescript
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const publicPaths = [
  '/',
  '/auth/login',
  '/auth/register',
  '/auth/forgot-password',
  '/auth/reset-password',
  '/api',
]

const protectedPaths = [
  '/onboarding',
  '/dashboard',
  '/teams',
]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Get sessionToken from cookies
  const sessionToken = request.cookies.get('session_token')?.value

  // Check if route is public
  const isPublic = publicPaths.some(path =>
    pathname === path || pathname.startsWith(`${path}/`)
  )

  // If public route - allow access
  if (isPublic) {
    return NextResponse.next()
  }

  // Check if route is protected
  const isProtected = protectedPaths.some(path =>
    pathname.startsWith(path)
  )

  if (isProtected) {
    // No token → redirect to login
    if (!sessionToken) {
      const loginUrl = new URL('/auth/login', request.url)
      loginUrl.searchParams.set('callbackUrl', pathname)
      return NextResponse.redirect(loginUrl)
    }

    // Has token - allow access
    // hasCompletedOnboarding check is done on client side (AuthProvider)
    return NextResponse.next()
  }

  // All other routes - allow access
  return NextResponse.next()
}

// Matcher configuration for optimization
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

---

## E2E Testing & Bug Fixes

**Дата тестирования:** 2025-12-05
**Время тестирования:** 37 минут
**Найдено багов:** 7
**Исправлено:** 7 (100%)

### Bug #1: Database Schema Mismatch
**Проблема:** Prisma schema не синхронизирована с БД
**Fix:** Выполнен `npx prisma db push`
**Impact:** Регистрация теперь работает

### Bug #2: Redirect после регистрации
**Location:** [auth.context.tsx:170-195](../apps/web/src/packages/libs/auth/auth.context.tsx#L170-L195)
**Проблема:** Redirect на `/login` вместо `/onboarding`
**Fix:** Добавлена логика с `setTimeout()` + проверка `hasCompletedOnboarding`
**Impact:** Новые пользователи сразу попадают на онбординг

### Bug #3: Нет редиректа после логина
**Location:** [login/page.tsx:46](../apps/web/src/app/(root)/auth/login/page.tsx#L46)
**Проблема:** Login page использовал прямой GraphQL вызов вместо `AuthContext.login()`
**Fix:** Заменён `useMutation(LoginDocument)` на `useAuth().login()`
**Impact:** Автоматический redirect после логина работает

### Bug #4: Неправильная передача параметров
**Location:** [login/page.tsx:46](../apps/web/src/app/(root)/auth/login/page.tsx#L46)
**Проблема:** `authLogin(data)` вместо `authLogin(data.email, data.password)`
**Fix:** Деструктуризация объекта при вызове функции
**Impact:** GraphQL ошибка устранена

### Bug #5: Отсутствие hasCompletedOnboarding в GraphQL
**Location:** [auth.graphql:23,10,39](../apps/web/src/packages/api/graphql/auth.graphql)
**Проблема:** Login/Register/RefreshSession mutations не запрашивали `hasCompletedOnboarding`
**Fix:** Добавлено поле в queries, запущен `pnpm codegen`
**Impact:** AuthContext получает корректное значение для redirect logic

### Bug #6: Несовпадение названий cookie
**Location:** [middleware.ts:25](../apps/web/src/middleware.ts#L25)
**Проблема:** Middleware проверял `sessionToken`, API устанавливал `session_token`
**Fix:** Изменено на `request.cookies.get('session_token')`
**Impact:** Middleware корректно проверяет сессию

### Bug #7: Неправильный импорт Apollo
**Location:** [teams/[teamId]/page.tsx:4](../apps/web/src/app/(root)/(protected)/teams/[teamId]/page.tsx#L4)
**Проблема:** `import { useQuery } from '@apollo/client'` → Build Error в Next.js 16
**Fix:** Изменено на `'@apollo/client/react'`
**Impact:** Страница команды загружается без ошибок

### E2E Test Results:
- ✅ Регистрация → автоматический redirect на `/onboarding`
- ✅ Логин → автоматический redirect на `/onboarding` (если не завершён) или `/dashboard`
- ✅ Onboarding Step 1 → ввод названия команды работает
- ✅ Onboarding Step 2 → выбор логотипа работает
- ✅ Onboarding Step 3 → создание проекта + confetti + redirect на `/teams/{teamId}`
- ✅ Team Dashboard → отображает данные команды

**Test Report:** [docs/reports/logs/2025-12-05-e2e-testing-onboarding.md](../docs/reports/logs/2025-12-05-e2e-testing-onboarding.md)

---

## Архитектура защиты (Defence in Depth)

### Level 1: Next.js Middleware (Server-side)
- Проверка `session_token` перед рендером
- Redirect на `/auth/login` для неавторизованных
- Public/protected routes configuration

### Level 2: AuthProvider Context (Client-side)
- Автоматические redirects на основе `hasCompletedOnboarding`
- Session refresh на mount
- User state management

### Level 3: Page-level useEffect (Fallback)
- Дополнительная проверка в layout компонентах
- Защита от race conditions

---

## Routing Flow

```
Незарегистрированный
  → Попытка доступа к /onboarding
  → Middleware redirect
  → /auth/login?callbackUrl=/onboarding

После регистрации
  → AuthContext
  → redirect /onboarding

После логина (без onboarding)
  → AuthContext
  → redirect /onboarding

После логина (с onboarding)
  → AuthContext
  → redirect /dashboard

После завершения onboarding
  → redirect /teams/{teamId}

Попытка повторного onboarding
  → AuthProvider auto-redirect
  → /dashboard
```

---

## Файлы реализации

### Backend (10 файлов):
1. `apps/api/src/modules/teams/teams.service.ts` - Business logic
2. `apps/api/src/modules/teams/teams.resolver.ts` - GraphQL resolver
3. `apps/api/src/modules/teams/teams.module.ts` - Module configuration
4. `apps/api/src/modules/teams/dto/complete-onboarding.input.ts` - Input DTO
5. `apps/api/src/modules/teams/models/team.model.ts` - GraphQL Team type
6. `apps/api/src/modules/teams/models/project.model.ts` - GraphQL Project type
7. `apps/api/src/modules/teams/models/onboarding-result.model.ts` - Result type
8. `apps/api/src/modules/teams/models/logo-type.enum.ts` - LogoType enum
9. `apps/api/src/core/storage/storage.service.ts` - File upload service
10. `apps/api/src/core/storage/storage.module.ts` - Storage module

### Frontend (15 файлов):
1. `apps/web/src/app/(root)/onboarding/step-1/page.tsx` - Step 1 page
2. `apps/web/src/app/(root)/onboarding/step-2/page.tsx` - Step 2 page
3. `apps/web/src/app/(root)/onboarding/step-3/page.tsx` - Step 3 page
4. `apps/web/src/app/(root)/onboarding/layout.tsx` - Onboarding layout
5. `apps/web/src/app/(root)/onboarding/loading.tsx` - Loading state
6. `apps/web/src/app/(root)/(protected)/teams/[teamId]/page.tsx` - Team dashboard
7. `apps/web/src/app/(root)/(protected)/teams/[teamId]/layout.tsx` - Team layout
8. `apps/web/src/middleware.ts` - Route protection
9. `apps/web/src/packages/libs/auth/auth.context.tsx` - Updated AuthProvider
10. `apps/web/src/packages/api/graphql/teams.graphql` - Teams GraphQL schema
11. `apps/web/src/packages/api/graphql/auth.graphql` - Updated Auth schema
12. `apps/web/src/packages/schemas/onboarding/step-1.schema.ts` - Step 1 validation
13. `apps/web/src/packages/schemas/onboarding/step-2.schema.ts` - Step 2 validation
14. `apps/web/src/packages/schemas/onboarding/step-3.schema.ts` - Step 3 validation
15. `apps/web/src/app/layout.tsx` - Integrated AuthProvider

---

## Критерии успеха

- ✅ Пользователь может пройти 3 шага онбординга
- ✅ Пользователь может ввести название команды (Step 1)
- ✅ Пользователь может загрузить логотип или выбрать emoji (Step 2)
- ✅ Пользователь может создать первый проект (Step 3)
- ✅ Backend создаёт Team, TeamMember, Project атомарно
- ✅ File upload работает (обработка через Sharp)
- ✅ Confetti анимация показывается при успехе
- ✅ SessionStorage очищается после завершения
- ✅ Redirect на `/teams/{teamId}` работает
- ✅ Middleware защищает защищённые routes
- ✅ AuthContext автоматически redirects на основе onboarding status
- ✅ Повторное прохождение онбординга невозможно
- ✅ E2E тест пройден (7 багов найдено и исправлено)

---

## Следующий этап

**Этап 3: Projects Module** 📋 Планируется
- Расширенные поля проекта (budget, dates, progress, status)
- Полный CRUD API
- Frontend страницы (dashboard, create, edit, details)
- UI компоненты (ProjectCard, ProjectForm, DatePicker)
