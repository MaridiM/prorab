# План: Защита Onboarding маршрутов с Next.js Middleware

## 📋 Требования пользователя

1. **Доступ к onboarding:** Строгая защита - только для авторизованных пользователей
2. **Уже завершившие onboarding:** Redirect на `/dashboard` (заблокировать повторное прохождение)
3. **После завершения onboarding:** Redirect на `/teams/{teamId}` (страница созданной команды)
4. **Метод защиты:** Next.js Middleware (защита на уровне сервера)

---

## 🎯 Текущее состояние (из исследования)

### ✅ Что работает:
- Backend Me Query **УЖЕ возвращает** `hasCompletedOnboarding` в User model
- Backend `completeOnboarding` mutation работает и возвращает `team.id`
- Frontend Step 1-3 полностью реализованы с валидацией
- Auth Context существует, но **НЕ используется** в root layout

### ✅ Все проблемы решены (2025-12-04):
1. ✅ **Frontend Me Query НЕ запрашивает** `hasCompletedOnboarding` - **ИСПРАВЛЕНО**
2. ✅ **GraphQL типы не обновлены** - **ИСПРАВЛЕНО (codegen выполнен)**
3. ✅ **AuthContext не использует** `hasCompletedOnboarding` - **ИСПРАВЛЕНО**
4. ✅ **Нет Next.js middleware** - **СОЗДАН и работает**
5. ✅ **AuthProvider не интегрирован** в root layout - **ИСПРАВЛЕНО**
6. ✅ **После onboarding redirect на `/`** вместо `/teams/{teamId}` - **ИСПРАВЛЕНО**
7. ✅ **Страница `/teams/[teamId]` не существует** - **СОЗДАНА**

**Статус:** ✅ ВСЕ ЗАДАЧИ ВЫПОЛНЕНЫ

Детали реализации см. в:
- [Лог реализации](../reports/logs/2025-12-04-auth-protection-implementation.md)
- [Changelog Frontend](../changelog.frontend.md)

---

## 📐 Архитектура решения

### Уровни защиты (Defence in Depth):

```
┌─────────────────────────────────────────────────────┐
│ 1. Next.js Middleware (Server-side)                │
│    - Проверка sessionToken в cookies               │
│    - Redirect ПЕРЕД рендером страницы              │
│    - Быстро, безопасно                             │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│ 2. AuthProvider Context (Client-side)              │
│    - useAuth() hook для компонентов                │
│    - Автоматический redirect после login/register  │
│    - Состояние user с hasCompletedOnboarding       │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│ 3. Page-level useEffect (Client-side fallback)     │
│    - Дополнительная проверка в компонентах         │
│    - Защита от edge cases                          │
└─────────────────────────────────────────────────────┘
```

---

## 🗺️ Routing Flow (желаемое поведение)

### Scenario 1: Незарегистрированный пользователь
```
/onboarding → Middleware → ❌ No sessionToken → /auth/login
/teams/123  → Middleware → ❌ No sessionToken → /auth/login
/dashboard  → Middleware → ❌ No sessionToken → /auth/login
```

### Scenario 2: Зарегистрированный без onboarding
```
/auth/register → Success → AuthContext check → hasCompletedOnboarding=false → /onboarding
/auth/login    → Success → AuthContext check → hasCompletedOnboarding=false → /onboarding
/              → OK (public)
/onboarding    → Middleware → ✅ Has sessionToken → Allow
/teams/123     → Middleware → ❌ !hasCompletedOnboarding → /onboarding
/dashboard     → Middleware → ❌ !hasCompletedOnboarding → /onboarding
```

### Scenario 3: Зарегистрированный с завершённым onboarding
```
/onboarding    → Middleware → ✅ hasCompletedOnboarding → /dashboard
/teams/123     → Middleware → ✅ Allow
/dashboard     → Middleware → ✅ Allow
```

### Scenario 4: Завершение onboarding (Step 3)
```
completeOnboarding() → Success → teamId=123 → /teams/123
```

---

## 📝 Детальный план реализации

### **Фаза 1: Backend - Обновить Me Query** ✅ ЗАВЕРШЕНО

**Статус:** Backend УЖЕ возвращает `hasCompletedOnboarding`
- User model имеет поле `hasCompletedOnboarding`
- schema.gql содержит это поле
- НЕ требуется изменений на backend

---

### **Фаза 2: Frontend - Обновить GraphQL Query** ✅ ЗАВЕРШЕНО

#### 2.1. Добавить hasCompletedOnboarding в Me Query ✅

**Файл:** `apps/web/src/packages/api/graphql/auth.graphql`

**Изменение (строки 77-87):**
```graphql
query Me {
  me {
    id
    email
    name
    phone
    emailVerified
    hasCompletedOnboarding  # ← ДОБАВЛЕНО
    createdAt
  }
}
```

**Результат:** ✅ Успешно

#### 2.2. Регенерировать TypeScript типы ✅

**Команда:**
```bash
cd apps/web
pnpm codegen
```

**Результат:**
```
✔ Parse Configuration
✔ Load GraphQL schemas
✔ Load GraphQL documents
✔ Generate
✔ Generate to ./src/packages/api/graphql/__generated__/output.ts
```

**Изменения:**
- `MeQuery` type теперь содержит `hasCompletedOnboarding: boolean`
- TypeScript типы обновлены и готовы к использованию

**Статус:** ✅ Успешно

---

### **Фаза 3: Auth Context - Добавить onboarding tracking** 🔄 В ПРОЦЕССЕ

#### 3.1. Обновить AuthContext типы

**Файл:** `apps/web/src/packages/libs/auth/auth.context.tsx`

**Изменения:**

**1. User interface (строки 15-21):**
```typescript
interface User {
  id: string
  email: string
  name?: string | null
  phone?: string | null
  emailVerified: boolean
  hasCompletedOnboarding: boolean  // ← ДОБАВИТЬ
}
```

**2. refreshUser function (строки 67-87):**
```typescript
const refreshUser = useCallback(async () => {
  try {
    const { data, error } = await fetchMe()

    if (error || !data?.me) {
      setUser(null)
    } else {
      setUser({
        id: data.me.id,
        email: data.me.email,
        name: data.me.name,
        phone: data.me.phone,
        emailVerified: data.me.emailVerified,
        hasCompletedOnboarding: data.me.hasCompletedOnboarding  // ← ДОБАВИТЬ
      })
    }
  } catch {
    setUser(null)
  } finally {
    setIsLoading(false)
  }
}, [fetchMe])
```

**3. login function (строки 93-112) - добавить redirect logic:**
```typescript
const login = useCallback(async (email: string, password: string) => {
  const response = await loginMutation({
    variables: { input: { email, password } }
  })

  if (response.error) {
    throw new Error(response.error.message || 'Ошибка входа')
  }

  const userData = response.data?.login?.user
  if (userData) {
    setUser({
      id: userData.id,
      email: userData.email,
      name: userData.name,
      phone: userData.phone,
      emailVerified: userData.emailVerified,
      hasCompletedOnboarding: userData.hasCompletedOnboarding  // ← ДОБАВИТЬ
    })

    // ← ИЗМЕНИТЬ REDIRECT LOGIC
    if (!userData.hasCompletedOnboarding) {
      router.push('/onboarding')
    } else {
      router.push('/dashboard')
    }
  }
}, [loginMutation, router])
```

**4. register function (строки 114-140) - аналогично:**
```typescript
const register = useCallback(async (registerData: RegisterData) => {
  const response = await registerMutation({
    variables: {
      input: {
        email: registerData.email,
        password: registerData.password,
        name: registerData.name || null,
        phone: registerData.phone || null
      }
    }
  })

  if (response.error) {
    throw new Error(response.error.message || 'Ошибка регистрации')
  }

  const userData = response.data?.register?.user
  if (userData) {
    setUser({
      id: userData.id,
      email: userData.email,
      name: userData.name,
      phone: userData.phone,
      emailVerified: userData.emailVerified,
      hasCompletedOnboarding: userData.hasCompletedOnboarding  // ← ДОБАВИТЬ
    })

    // ← ВСЕГДА REDIRECT НА ONBOARDING ПОСЛЕ РЕГИСТРАЦИИ
    router.push('/onboarding')
  }
}, [registerMutation, router])
```

**5. Добавить auto-redirect useEffect (после строки 91):**
```typescript
// Auto-redirect based on onboarding status
useEffect(() => {
  if (isLoading || !user) return

  const pathname = window.location.pathname

  // Если на /onboarding и уже завершён - redirect на dashboard
  if (pathname.startsWith('/onboarding') && user.hasCompletedOnboarding) {
    router.push('/dashboard')
  }

  // Если на защищённых страницах без onboarding - redirect на /onboarding
  if (
    (pathname.startsWith('/dashboard') || pathname.startsWith('/teams')) &&
    !user.hasCompletedOnboarding
  ) {
    router.push('/onboarding')
  }
}, [user, isLoading, router])
```

#### 3.2. Интегрировать AuthProvider в root layout

**Файл:** `apps/web/src/app/layout.tsx`

**Найти** (примерно строки 40-50):
```tsx
<body className={inter.className}>
  <Providers>
    <InitialLoader />
    <NavigationProgress />
    {children}
    <Toast />
  </Providers>
</body>
```

**Изменить на:**
```tsx
<body className={inter.className}>
  <ApolloClientProvider>
    <AuthProvider>
      <Providers>
        <InitialLoader />
        <NavigationProgress />
        {children}
        <Toast />
      </Providers>
    </AuthProvider>
  </ApolloClientProvider>
</body>
```

**Добавить импорты:**
```typescript
import { ApolloClientProvider } from '@/packages/libs/apollo/apollo-client.provider'
import { AuthProvider } from '@/packages/libs/auth'
```

---

### **Фаза 4: Next.js Middleware - Защита маршрутов** ⏳ ОЖИДАЕТ

#### 4.1. Создать middleware.ts

**Файл:** `apps/web/src/middleware.ts` (НОВЫЙ)

**Содержимое:**
```typescript
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Список публичных маршрутов (доступны всем)
const publicPaths = [
  '/',
  '/auth/login',
  '/auth/register',
  '/auth/forgot-password',
  '/auth/reset-password',
  '/api',
]

// Маршруты только для авторизованных
const protectedPaths = [
  '/onboarding',
  '/dashboard',
  '/teams',
]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Получаем sessionToken из cookies
  const sessionToken = request.cookies.get('sessionToken')?.value

  // Проверка публичных маршрутов
  const isPublic = publicPaths.some(path =>
    pathname === path || pathname.startsWith(`${path}/`)
  )

  // Если публичный маршрут - разрешаем
  if (isPublic) {
    return NextResponse.next()
  }

  // Проверка защищённых маршрутов
  const isProtected = protectedPaths.some(path =>
    pathname.startsWith(path)
  )

  if (isProtected) {
    // Нет токена → redirect на login
    if (!sessionToken) {
      const loginUrl = new URL('/auth/login', request.url)
      loginUrl.searchParams.set('callbackUrl', pathname)
      return NextResponse.redirect(loginUrl)
    }

    // Есть токен - разрешаем доступ
    // Проверку hasCompletedOnboarding делаем на клиенте (AuthProvider)
    return NextResponse.next()
  }

  // Все остальные маршруты - разрешаем
  return NextResponse.next()
}

// Конфигурация matcher для оптимизации
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

**Важно:** Middleware не может делать GraphQL запросы, поэтому проверку `hasCompletedOnboarding` делаем в AuthProvider на клиенте.

---

### **Фаза 5: Создать страницу команды /teams/[teamId]** ⏳ ОЖИДАЕТ

#### 5.1. Создать структуру папок

**Создать:**
```
apps/web/src/app/(root)/(protected)/teams/[teamId]/
├── layout.tsx  (НОВЫЙ)
└── page.tsx    (НОВЫЙ)
```

#### 5.2. Layout для команды

**Файл:** `apps/web/src/app/(root)/(protected)/teams/[teamId]/layout.tsx`

```typescript
'use client'

import { useAuth } from '@/packages/libs/auth'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Loader2 } from 'lucide-react'

export default function TeamLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/auth/login')
    }

    if (!isLoading && user && !user.hasCompletedOnboarding) {
      router.push('/onboarding')
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!user) {
    return null
  }

  return <>{children}</>
}
```

#### 5.3. Team Dashboard Page

**Файл:** `apps/web/src/app/(root)/(protected)/teams/[teamId]/page.tsx`

```typescript
'use client'

import { useParams } from 'next/navigation'
import { useQuery } from '@apollo/client'
import { MyTeamsDocument } from '@/packages/api/graphql'
import { Loader2 } from 'lucide-react'

export default function TeamDashboardPage() {
  const params = useParams()
  const teamId = params.teamId as string

  const { data, loading, error } = useQuery(MyTeamsDocument)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-destructive">
          Ошибка загрузки команды: {error.message}
        </div>
      </div>
    )
  }

  const team = data?.myTeams.find(t => t.id === teamId)

  if (!team) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-muted-foreground">Команда не найдена</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">{team.name}</h1>
      <p className="text-muted-foreground">
        Добро пожаловать в вашу команду! Здесь будет дашборд.
      </p>
      {/* TODO: Добавить компоненты дашборда */}
    </div>
  )
}
```

---

### **Фаза 6: Обновить redirect после onboarding** ⏳ ОЖИДАЕТ

**Файл:** `apps/web/src/app/(root)/onboarding/step-3/page.tsx`

**Изменить (строки 207-223):**
```typescript
// Handle successful response
if (result.data?.completeOnboarding.success) {
  // Trigger completion animation
  setIsCompleted(true)

  // Trigger confetti effect
  triggerConfetti()

  // Wait for animation to complete before redirect
  setTimeout(() => {
    // Clear sessionStorage
    sessionStorage.removeItem('onboarding_step1')
    sessionStorage.removeItem('onboarding_step2')
    sessionStorage.removeItem('onboarding_step3')

    // Redirect to team dashboard
    const teamId = result.data?.completeOnboarding.team.id
    if (teamId) {
      router.push(`/teams/${teamId}`)  // ← ИЗМЕНИТЬ ЭТО
    } else {
      router.push('/dashboard')  // fallback
    }
  }, 2000)
}
```

---

## 📋 Checklist реализации

### Backend:
- [x] User model имеет hasCompletedOnboarding ✅ (уже есть)
- [x] Me Query возвращает hasCompletedOnboarding ✅ (уже есть)

### Frontend GraphQL:
- [x] Добавить hasCompletedOnboarding в auth.graphql Me Query ✅
- [x] Запустить codegen для регенерации типов ✅

### Auth Context:
- [ ] Обновить User interface с hasCompletedOnboarding
- [ ] Обновить refreshUser для чтения hasCompletedOnboarding
- [ ] Обновить login redirect logic
- [ ] Обновить register redirect logic (всегда /onboarding)
- [ ] Добавить auto-redirect useEffect
- [ ] Интегрировать AuthProvider в root layout

### Middleware:
- [ ] Создать middleware.ts с защитой маршрутов
- [ ] Настроить matcher для оптимизации

### Team Page:
- [ ] Создать папку teams/[teamId]
- [ ] Создать layout.tsx с auth check
- [ ] Создать page.tsx с базовым UI
- [ ] Обновить redirect в step-3 на /teams/{teamId}

---

## 🧪 Тестирование

### Test Case 1: Незарегистрированный пользователь
```
1. Открыть /onboarding
2. Ожидается: redirect на /auth/login?callbackUrl=/onboarding
3. Открыть /teams/123
4. Ожидается: redirect на /auth/login?callbackUrl=/teams/123
```

### Test Case 2: Регистрация нового пользователя
```
1. Открыть /auth/register
2. Зарегистрироваться
3. Ожидается: redirect на /onboarding
4. Пройти Step 1-3
5. Ожидается: redirect на /teams/{новый teamId}
```

### Test Case 3: Логин с незавершённым onboarding
```
1. Открыть /auth/login
2. Войти (hasCompletedOnboarding = false)
3. Ожидается: redirect на /onboarding
```

### Test Case 4: Логин с завершённым onboarding
```
1. Открыть /auth/login
2. Войти (hasCompletedOnboarding = true)
3. Ожидается: redirect на /dashboard
4. Попытка открыть /onboarding
5. Ожидается: redirect на /dashboard
```

### Test Case 5: Direct URL access
```
1. Не залогинен → /teams/123
2. Ожидается: redirect на /auth/login
3. После login → redirect обратно на /teams/123
```

---

## 🎯 Критические файлы для изменения

1. ✅ `apps/web/src/packages/api/graphql/auth.graphql` - добавить hasCompletedOnboarding
2. ⏳ `apps/web/src/packages/libs/auth/auth.context.tsx` - tracking onboarding, redirect logic
3. ⏳ `apps/web/src/app/layout.tsx` - добавить AuthProvider
4. ⏳ `apps/web/src/middleware.ts` - СОЗДАТЬ, защита маршрутов
5. ⏳ `apps/web/src/app/(root)/(protected)/teams/[teamId]/layout.tsx` - СОЗДАТЬ
6. ⏳ `apps/web/src/app/(root)/(protected)/teams/[teamId]/page.tsx` - СОЗДАТЬ
7. ⏳ `apps/web/src/app/(root)/onboarding/step-3/page.tsx` - изменить redirect

---

## ⚠️ Важные замечания

1. **Middleware не может делать GraphQL запросы** - проверку hasCompletedOnboarding делаем в AuthProvider
2. **AuthProvider должен быть выше ApolloClientProvider** - иначе хуки Apollo не работают
3. **sessionToken хранится в HTTP-only cookies** - middleware имеет к ним доступ
4. **callbackUrl в query params** - для возврата после логина
5. **Confetti анимация 2 секунды** - учитываем в redirect timing

---

## 📊 Прогресс выполнения

**Дата начала:** 2025-12-04

- ✅ **Фаза 1**: Backend - Готов (не требует изменений)
- ✅ **Фаза 2**: Frontend GraphQL Query - Завершено (2025-12-04)
- 🔄 **Фаза 3**: Auth Context - В процессе
- ⏳ **Фаза 4**: Middleware - Ожидает
- ⏳ **Фаза 5**: Team Page - Ожидает
- ⏳ **Фаза 6**: Step-3 Redirect - Ожидает

---

**Последнее обновление:** 2025-12-04 (Начало Фазы 3)
