# 📊 АНАЛИЗ СИСТЕМЫ ОБРАБОТКИ ОШИБОК

**Дата:** 2025-12-03
**Версия:** 1.0
**Статус:** ✅ Частично реализовано

---

## 🎯 КРАТКОЕ РЕЗЮМЕ

Приложение использует **многоуровневую систему обработки ошибок** с валидацией на frontend и backend. На момент анализа выполнена **централизация Toast системы** — все 4 auth страницы мигрированы на глобальный Toast через Zustand store.

### Текущий статус реализации

| Компонент | Статус | Описание |
|-----------|--------|----------|
| **Глобальный Toast** | ✅ Реализовано | Zustand store + hook + UI компонент |
| **Миграция auth страниц** | ✅ Реализовано | Все 4 страницы используют `useToast()` |
| **Error Link** | ⚠️ Частично | Только логирование, нет глобальной обработки |
| **Кастомные error codes** | ❌ Не реализовано | Backend не возвращает structured error codes |
| **401/403 обработка** | ❌ Не реализовано | Нет автоматического редиректа |
| **Toast queue** | ❌ Не реализовано | Перезаписывает предыдущие уведомления |
| **Backend validation → форма** | ❌ Не реализовано | Ошибки показываются как Toast |

---

## 📋 1. ДЕТАЛЬНЫЙ АНАЛИЗ ТЕКУЩЕЙ РЕАЛИЗАЦИИ

### 1.1 Toast Notification System (✅ Реализовано)

#### **Архитектура:**

```
Toast Store (Zustand)
    ↓
useToast Hook
    ↓
Auth Pages (login, register, forgot-password, reset-password)
    ↓
Global Toast Component (в Providers)
```

#### **Файлы:**

**Store:** [`apps/web/src/packages/libs/store/toast.store.ts`](apps/web/src/packages/libs/store/toast.store.ts)
```typescript
interface ToastStore {
  toast: Toast | null
  show: (message: string, type?: ToastType) => void
  hide: () => void
}

export const useToastStore = create<ToastStore>((set) => ({
  toast: null,
  show: (message, type = 'success') => {
    const id = Date.now().toString()
    set({ toast: { id, message, type } })
    setTimeout(() => set({ toast: null }), 8080)
  },
  hide: () => set({ toast: null }),
}))
```

**Hook:** [`apps/web/src/packages/hooks/use-toast.ts`](apps/web/src/packages/hooks/use-toast.ts)
```typescript
export function useToast() {
  const show = useToastStore((state) => state.show)

  return {
    toast: show,
    success: (message: string) => show(message, 'success'),
    error: (message: string) => show(message, 'error'),
  }
}
```

**UI Component:** [`apps/web/src/packages/components/ui/toast.tsx`](apps/web/src/packages/components/ui/toast.tsx)
```typescript
export function Toast() {
  const toast = useToastStore((state) => state.toast)

  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          role="status"
          aria-live="polite"
          aria-atomic="true"
          className={...}
        >
          {toast.type === "success" ? <Check /> : <AlertCircle />}
          <span>{toast.message}</span>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
```

**Интеграция в Providers:** [`apps/web/src/packages/components/features/providers.tsx`](apps/web/src/packages/components/features/providers.tsx)
```typescript
export function Providers({ children }: ProvidersProps) {
  return (
    <ApolloProvider client={client}>
      <AuthProvider>
        {children}
        <Toast />  {/* Глобальный Toast */}
      </AuthProvider>
    </ApolloProvider>
  )
}
```

#### **Использование в auth страницах:**

**Login:** [`apps/web/src/app/(root)/auth/login/page.tsx`](apps/web/src/app/(root)/auth/login/page.tsx#L24)
```typescript
const { success, error } = useToast()

// В onSubmit:
if (response.error) {
  error(errorMessage)
  return
}

if (user) {
  success("Вход выполнен успешно")
  router.push("/dashboard")
}
```

**Register:** [`apps/web/src/app/(root)/auth/register/page.tsx`](apps/web/src/app/(root)/auth/register/page.tsx#L23)
**Forgot Password:** [`apps/web/src/app/(root)/auth/forgot-password/page.tsx`](apps/web/src/app/(root)/auth/forgot-password/page.tsx#L23)
**Reset Password:** [`apps/web/src/app/(root)/auth/reset-password/page.tsx`](apps/web/src/app/(root)/auth/reset-password/page.tsx#L25)

✅ **Все страницы мигрированы на глобальный Toast**

---

### 1.2 Apollo Client Error Handling (⚠️ Частично реализовано)

#### **Конфигурация:**

**Файл:** [`apps/web/src/packages/libs/apollo/apollo-client.config.ts`](apps/web/src/packages/libs/apollo/apollo-client.config.ts)

**Error Policy (строки 70-74):**
```typescript
defaultOptions: {
  watchQuery: { errorPolicy: 'all' },
  query: { errorPolicy: 'all' },
  mutate: { errorPolicy: 'all' },
}
```

⚠️ **Что это значит:**
- Ошибки возвращаются в `response.error`, но НЕ бросаются как исключения
- Нужна ручная проверка в каждом компоненте

**Error Link (строки 52-64):**
```typescript
const errorLink = new ErrorLink(({ error, operation }) => {
  if (CombinedGraphQLErrors.is(error)) {
    error.errors.forEach(({ message, locations, path }) =>
      console.log(`[GraphQL error]: Message: ${message}, ...`)
    )
  } else if (CombinedProtocolErrors.is(error)) {
    error.errors.forEach(({ message, extensions }) =>
      console.log(`[Protocol error]: Message: ${message}, ...`)
    )
  } else {
    console.error(`[Network error]: ${error}`)
  }
})
```

❌ **Проблемы:**
1. **Только логирует в консоль** — пользователь не видит ошибки
2. **Нет глобальной обработки** — каждая страница дублирует логику
3. **Нет обработки 401/403** — нет редиректа на `/auth/login`
4. **Нет retry для network errors**

#### **Текущая обработка в компонентах:**

**Паттерн (пример из login/page.tsx):**
```typescript
// 1. onError callback в useMutation
const [login, { loading }] = useMutation(LoginDocument, {
  errorPolicy: 'all',
  onError: (apolloError) => {
    error(apolloError.message || 'Ошибка входа')
  }
})

// 2. Ручная проверка в onSubmit
try {
  const response = await login({ variables: { input: data }})

  if (response.error) {
    error(response.error.message || 'Ошибка входа')
    return
  }

  // Success handling...
} catch (err: any) {
  error(err?.message || 'Ошибка входа')
}
```

⚠️ **Дублирование:**
Этот код повторяется на всех 4 auth страницах

---

### 1.3 Backend Error Responses (✅ Реализовано базово)

#### **Типы исключений:**

**Файл:** [`apps/api/src/modules/auth/auth.service.ts`](apps/api/src/modules/auth/auth.service.ts)

| Строка | HTTP Code | Тип Exception | Сообщение | Сценарий |
|--------|-----------|---------------|-----------|----------|
| 54 | 400 | `BadRequestException` | `"Слишком много попыток. Попробуйте через 15 минут."` | Rate limit |
| 102 | 400 | `BadRequestException` | `"Пользователь с таким email уже существует"` | Duplicate email |
| 144 | 401 | `UnauthorizedException` | `"Неверный email или пароль"` | User not found |
| 150 | 401 | `UnauthorizedException` | `"Неверный email или пароль"` | Invalid password |
| 265 | 400 | `BadRequestException` | `"Недействительный токен верификации"` | Invalid token |
| 269 | 400 | `BadRequestException` | `"Токен верификации истёк"` | Expired token |
| 324 | 400 | `BadRequestException` | `"Недействительный токен сброса пароля"` | Invalid reset token |
| 328 | 400 | `BadRequestException` | `"Токен сброса пароля истёк"` | Expired reset token |
| 332 | 400 | `BadRequestException` | `"Токен уже был использован"` | Token reuse |
| 358 | 401 | `UnauthorizedException` | `"Неверный текущий пароль"` | Wrong password |

#### **Auth Guard:**

**Файл:** [`apps/api/src/shared/guards/auth.guard.ts`](apps/api/src/shared/guards/auth.guard.ts)

| Строка | HTTP Code | Сообщение | Сценарий |
|--------|-----------|-----------|----------|
| 36 | 401 | `"Требуется авторизация"` | No token |
| 41 | 401 | `"Сессия истекла или недействительна"` | Invalid session |

#### **GraphQL Error Format:**

❌ **Проблема:** Нет кастомных error codes

Стандартный формат NestJS/Apollo:
```json
{
  "errors": [{
    "message": "Неверный email или пароль",
    "extensions": {
      "code": "UNAUTHENTICATED"
    }
  }]
}
```

**Нет:**
- Кастомных `errorCode` для различения типов ошибок
- `fieldErrors` для привязки к полям формы
- Структурированных метаданных

---

### 1.4 Validation Errors (✅ Frontend / ❌ Backend)

#### **Frontend Validation (Zod + React Hook Form):**

**Schema:** [`apps/web/src/packages/schemas/auth/login.schema.ts`](apps/web/src/packages/schemas/auth/login.schema.ts)
```typescript
export const loginSchema = z.object({
  email: z
    .string()
    .nonempty({ message: 'Email обязателен' })
    .email({ message: 'Неверный формат email' }),
  password: z
    .string()
    .nonempty({ message: 'Пароль обязателен' })
    .min(8, { message: 'Минимум 8 символов' })
})
```

**Отображение:** [`apps/web/src/packages/components/ui/form.tsx`](apps/web/src/packages/components/ui/form.tsx#L144-L166)
```typescript
const FormMessage = ({ className, children, ...props }) => {
  const { error, formMessageId } = useFormField()
  const body = error ? String(error?.message) : children

  return body ? (
    <p className="text-sm font-medium text-destructive">
      {body}
    </p>
  ) : null
}
```

✅ **Работает отлично:**
- Client-side validation с `useAutoValidateForm` (debounce 300ms)
- Мгновенная обратная связь
- Красные сообщения под полями

#### **Backend Validation:**

**DTO:** [`apps/api/src/modules/auth/dto/login.input.ts`](apps/api/src/modules/auth/dto/login.input.ts)
```typescript
@InputType()
export class LoginInput {
  @Field()
  @IsEmail({}, { message: 'Некорректный email' })
  email: string

  @Field()
  @IsString()
  password: string
}
```

❌ **Проблема:**
- Backend validation errors показываются как **Toast**
- **Не привязаны к полям формы**
- Нет маппинга на `form.setError()`

---

## 🔴 2. ВЫЯВЛЕННЫЕ ПРОБЛЕМЫ

### Критические (HIGH Priority)

#### 🔴 2.1 Error Link только логирует
**Файл:** [`apps/web/src/packages/libs/apollo/apollo-client.config.ts:52-64`](apps/web/src/packages/libs/apollo/apollo-client.config.ts#L52-L64)

```typescript
// ❌ Текущее поведение:
console.log(`[GraphQL error]: ...`)  // Только в консоль!
console.error(`[Network error]: ...`)  // Пользователь не видит
```

**Последствия:**
- Ошибки "теряются" для пользователя
- Нет глобальной обработки
- Дублирование кода в каждом компоненте

#### 🔴 2.2 Нет обработки 401/403

**Сценарий:**
1. Пользователь залогинен
2. Сессия истекает (TTL закончился)
3. Делается GraphQL запрос → 401
4. ❌ **Ничего не происходит** — нет редиректа на `/auth/login`

**Ожидаемое поведение:**
```typescript
if (error.extensions?.code === 'UNAUTHENTICATED') {
  // Очистить cookies
  clearAuthCookies()
  // Показать Toast
  showToast('Сессия истекла. Войдите снова', 'error')
  // Редирект
  router.push('/auth/login')
}
```

#### 🔴 2.3 Нет кастомных error codes на backend

**Проблема:**
Все 400 ошибки выглядят одинаково:

```json
{
  "errors": [{
    "message": "Пользователь с таким email уже существует",
    "extensions": { "code": "BAD_REQUEST" }
  }]
}
```

**Невозможно различить:**
- Rate limit exceeded
- Email already exists
- Invalid token
- Validation error

**Нужно:**
```json
{
  "errors": [{
    "message": "Пользователь с таким email уже существует",
    "extensions": {
      "code": "BAD_REQUEST",
      "errorCode": "EMAIL_ALREADY_EXISTS"  // ← Кастомный код
    }
  }]
}
```

---

### Средние (MEDIUM Priority)

#### 🟡 2.4 Toast queue отсутствует

**Текущая реализация:**
```typescript
show: (message, type = 'success') => {
  const id = Date.now().toString()
  set({ toast: { id, message, type } })  // Перезаписывает предыдущий
  setTimeout(() => set({ toast: null }), 8080)
}
```

**Проблема:**
При быстрых последовательных ошибках показывается только последняя:

```typescript
error('Ошибка 1')  // Показывается
error('Ошибка 2')  // Перезаписывает предыдущую
error('Ошибка 3')  // Перезаписывает предыдущую
// Пользователь видит только "Ошибка 3"
```

#### 🟡 2.5 Backend validation в Toast, не под полями

**Сценарий:**
1. Backend возвращает validation error: `"Некорректный email"`
2. Показывается как Toast внизу экрана
3. ❌ Поле email не подсвечивается красным

**Ожидаемое:**
```typescript
// Маппинг backend ошибки на поле формы
if (error.extensions?.fieldErrors) {
  Object.entries(error.extensions.fieldErrors).forEach(([field, message]) => {
    form.setError(field, { message })
  })
}
```

#### 🟡 2.6 Дублирование error handling логики

**Код повторяется 4 раза:**
- [`login/page.tsx:40-78`](apps/web/src/app/(root)/auth/login/page.tsx#L40-L78)
- [`register/page.tsx:45-91`](apps/web/src/app/(root)/auth/register/page.tsx#L45-L91)
- [`forgot-password/page.tsx:39-74`](apps/web/src/app/(root)/auth/forgot-password/page.tsx#L39-L74)
- [`reset-password/page.tsx:44-91`](apps/web/src/app/(root)/auth/reset-password/page.tsx#L44-L91)

---

## ✅ 3. ПЛАН УЛУЧШЕНИЙ

### Phase 1: Улучшение Error Link (HIGH Priority)

**Цель:** Глобальная обработка всех типов ошибок

#### Задача 1.1: Добавить интеграцию с Toast

**Файл:** [`apps/web/src/packages/libs/apollo/apollo-client.config.ts`](apps/web/src/packages/libs/apollo/apollo-client.config.ts)

```typescript
import { ErrorLink } from '@apollo/client/link/error'
import { useToastStore } from '@/packages/libs/store'

const errorLink = new ErrorLink(({ graphQLErrors, networkError, operation }) => {
  const { show } = useToastStore.getState()

  // GraphQL Errors
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, extensions }) => {
      console.error('[GraphQL error]:', message, extensions)

      // Не показываем Toast для auth mutations (они обрабатывают сами)
      const isAuthMutation = ['login', 'register', 'forgotPassword', 'resetPassword']
        .includes(operation.operationName)

      if (!isAuthMutation) {
        show(message, 'error')
      }
    })
  }

  // Network Errors
  if (networkError) {
    console.error('[Network error]:', networkError)
    show('Ошибка соединения с сервером', 'error')
  }
})
```

**Результат:**
- ✅ Все ошибки автоматически показываются пользователю
- ✅ Auth страницы продолжают работать как сейчас
- ✅ Другие страницы получают автоматическую обработку

---

#### Задача 1.2: Добавить обработку 401/403

**Файл:** [`apps/web/src/packages/libs/apollo/apollo-client.config.ts`](apps/web/src/packages/libs/apollo/apollo-client.config.ts)

```typescript
import { ErrorLink } from '@apollo/client/link/error'
import { useToastStore } from '@/packages/libs/store'

const errorLink = new ErrorLink(({ graphQLErrors, networkError }) => {
  const { show } = useToastStore.getState()

  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, extensions }) => {
      const code = extensions?.code

      // Обработка 401: Session expired
      if (code === 'UNAUTHENTICATED') {
        // Очистить cookies
        document.cookie = 'session_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
        document.cookie = 'refresh_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'

        // Показать Toast
        show('Сессия истекла. Войдите снова', 'error')

        // Редирект на login (если не на auth странице)
        if (!window.location.pathname.startsWith('/auth')) {
          setTimeout(() => {
            window.location.href = '/auth/login'
          }, 1000)
        }
        return
      }

      // Обработка 403: Forbidden
      if (code === 'FORBIDDEN') {
        show('Недостаточно прав для выполнения операции', 'error')
        return
      }

      // Остальные ошибки
      const isAuthMutation = ['login', 'register', 'forgotPassword', 'resetPassword']
        .includes(operation.operationName)

      if (!isAuthMutation) {
        show(message, 'error')
      }
    })
  }
})
```

**Результат:**
- ✅ Автоматический редирект при истечении сессии
- ✅ Очистка cookies
- ✅ Уведомление пользователя

---

### Phase 2: Кастомные Error Codes на Backend (HIGH Priority)

**Цель:** Структурированные коды ошибок для frontend

#### Задача 2.1: Создать enum ErrorCode

**Новый файл:** `apps/api/src/shared/errors/error-codes.enum.ts`

```typescript
export enum ErrorCode {
  // Authentication
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  SESSION_EXPIRED = 'SESSION_EXPIRED',
  UNAUTHORIZED = 'UNAUTHORIZED',

  // Rate Limiting
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',

  // Registration
  EMAIL_ALREADY_EXISTS = 'EMAIL_ALREADY_EXISTS',

  // Tokens
  TOKEN_INVALID = 'TOKEN_INVALID',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  TOKEN_ALREADY_USED = 'TOKEN_ALREADY_USED',

  // Validation
  VALIDATION_ERROR = 'VALIDATION_ERROR',

  // User
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  EMAIL_NOT_VERIFIED = 'EMAIL_NOT_VERIFIED',
  EMAIL_ALREADY_VERIFIED = 'EMAIL_ALREADY_VERIFIED',
}
```

#### Задача 2.2: Создать кастомные exception классы

**Новый файл:** `apps/api/src/shared/errors/custom-exceptions.ts`

```typescript
import { BadRequestException, UnauthorizedException } from '@nestjs/common'
import { ErrorCode } from './error-codes.enum'

export class AppBadRequestException extends BadRequestException {
  constructor(
    message: string,
    errorCode: ErrorCode,
    fieldErrors?: Record<string, string[]>
  ) {
    super({
      message,
      errorCode,
      fieldErrors,
    })
  }
}

export class AppUnauthorizedException extends UnauthorizedException {
  constructor(message: string, errorCode: ErrorCode) {
    super({
      message,
      errorCode,
    })
  }
}
```

#### Задача 2.3: Обновить AuthService

**Файл:** [`apps/api/src/modules/auth/auth.service.ts`](apps/api/src/modules/auth/auth.service.ts)

```typescript
import { AppBadRequestException, AppUnauthorizedException } from '@/shared/errors/custom-exceptions'
import { ErrorCode } from '@/shared/errors/error-codes.enum'

// Было:
throw new BadRequestException('Слишком много попыток. Попробуйте через 15 минут.')

// Стало:
throw new AppBadRequestException(
  'Слишком много попыток. Попробуйте через 15 минут.',
  ErrorCode.RATE_LIMIT_EXCEEDED
)

// Было:
throw new UnauthorizedException('Неверный email или пароль')

// Стало:
throw new AppUnauthorizedException(
  'Неверный email или пароль',
  ErrorCode.INVALID_CREDENTIALS
)
```

#### Задача 2.4: Настроить GraphQL formatError

**Файл:** [`apps/api/src/core/config/graphql.config.ts`](apps/api/src/core/config/graphql.config.ts)

```typescript
import { ApolloDriverConfig } from '@nestjs/apollo'
import { GraphQLError, GraphQLFormattedError } from 'graphql'

export const graphqlConfig: ApolloDriverConfig = {
  // ... existing config

  formatError: (error: GraphQLError): GraphQLFormattedError => {
    const originalError = error.extensions?.originalError as any

    return {
      message: error.message,
      extensions: {
        code: error.extensions?.code,
        errorCode: originalError?.errorCode,
        fieldErrors: originalError?.fieldErrors,
      },
    }
  },
}
```

**Результат:**

Frontend получает:
```json
{
  "errors": [{
    "message": "Неверный email или пароль",
    "extensions": {
      "code": "UNAUTHENTICATED",
      "errorCode": "INVALID_CREDENTIALS"
    }
  }]
}
```

---

### Phase 3: Toast Queue System (MEDIUM Priority)

**Цель:** Показывать множественные уведомления

#### Задача 3.1: Обновить Toast Store

**Файл:** [`apps/web/src/packages/libs/store/toast.store.ts`](apps/web/src/packages/libs/store/toast.store.ts)

```typescript
import { create } from 'zustand'
import { nanoid } from 'nanoid'
import { Toast, ToastType } from './toast.types'

interface ToastStore {
  toasts: Toast[]  // Изменено с toast: Toast | null
  add: (message: string, type?: ToastType) => void
  remove: (id: string) => void
  clear: () => void
}

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],

  add: (message, type = 'success') => {
    const id = nanoid()
    const toast: Toast = { id, message, type }

    set((state) => ({
      toasts: [...state.toasts, toast].slice(-3)  // Максимум 3 Toast
    }))

    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter(t => t.id !== id)
      }))
    }, 8080)
  },

  remove: (id) => set((state) => ({
    toasts: state.toasts.filter(t => t.id !== id)
  })),

  clear: () => set({ toasts: [] }),
}))
```

#### Задача 3.2: Обновить useToast hook

**Файл:** [`apps/web/src/packages/hooks/use-toast.ts`](apps/web/src/packages/hooks/use-toast.ts)

```typescript
import { useToastStore } from '@/packages/libs/store'

export function useToast() {
  const add = useToastStore((state) => state.add)
  const remove = useToastStore((state) => state.remove)

  return {
    toast: add,
    success: (message: string) => add(message, 'success'),
    error: (message: string) => add(message, 'error'),
    dismiss: remove,
  }
}
```

#### Задача 3.3: Обновить Toast UI Component

**Файл:** [`apps/web/src/packages/components/ui/toast.tsx`](apps/web/src/packages/components/ui/toast.tsx)

```typescript
"use client"

import { AnimatePresence, motion } from "framer-motion"
import { Check, AlertCircle, X } from "lucide-react"
import { useToastStore } from "@/packages/libs/store"

export function Toast() {
  const toasts = useToastStore((state) => state.toasts)
  const remove = useToastStore((state) => state.remove)

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2">
      <AnimatePresence>
        {toasts.map((toast, index) => (
          <motion.div
            key={toast.id}
            role="status"
            aria-live="polite"
            aria-atomic="true"
            className={`px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 ${
              toast.type === "success"
                ? "bg-success text-success-foreground shadow-success/25"
                : "bg-destructive text-destructive-foreground shadow-destructive/25"
            }`}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            style={{ marginBottom: index > 0 ? '8px' : 0 }}
          >
            {toast.type === "success" ? (
              <Check className="w-4 h-4" />
            ) : (
              <AlertCircle className="w-4 h-4" />
            )}
            <span className="text-sm font-medium whitespace-nowrap">
              {toast.message}
            </span>
            <button
              onClick={() => remove(toast.id)}
              className="ml-2 hover:opacity-70 transition-opacity"
              aria-label="Закрыть"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
```

**Результат:**
- ✅ Показываются до 3 уведомлений одновременно
- ✅ Стек сверху вниз
- ✅ Кнопка закрытия на каждом Toast

---

### Phase 4: Backend Validation → Form Fields (MEDIUM Priority)

**Цель:** Привязать backend ошибки к полям формы

#### Задача 4.1: Обновить validation errors на backend

**Файл:** [`apps/api/src/modules/auth/auth.service.ts`](apps/api/src/modules/auth/auth.service.ts)

```typescript
// Пример для метода login
async login(input: LoginInput, userAgent?: string, ip?: string) {
  await this.checkRateLimit('login', ip ?? 'unknown')

  const emailNormalized = this.normalizeEmail(input.email)
  const user = await this.usersService.findByEmailNormalized(emailNormalized)

  if (!user) {
    await this.incrementRateLimit('login', ip ?? 'unknown')

    // Было:
    // throw new UnauthorizedException('Неверный email или пароль')

    // Стало:
    throw new AppUnauthorizedException(
      'Неверный email или пароль',
      ErrorCode.INVALID_CREDENTIALS,
      { email: ['Пользователь не найден'] }  // fieldErrors
    )
  }

  const isValidPassword = await this.verifyPassword(user.passwordHash, input.password)
  if (!isValidPassword) {
    await this.incrementRateLimit('login', ip ?? 'unknown')

    throw new AppUnauthorizedException(
      'Неверный email или пароль',
      ErrorCode.INVALID_CREDENTIALS,
      { password: ['Неверный пароль'] }  // fieldErrors
    )
  }

  // ...
}
```

#### Задача 4.2: Создать utility для маппинга ошибок на форму

**Новый файл:** `apps/web/src/packages/utils/map-graphql-errors-to-form.ts`

```typescript
import { UseFormReturn, FieldValues, Path } from 'react-hook-form'
import { ApolloError } from '@apollo/client'

export function mapGraphQLErrorsToForm<T extends FieldValues>(
  error: ApolloError,
  form: UseFormReturn<T>
): boolean {
  const fieldErrors = error.graphQLErrors?.[0]?.extensions?.fieldErrors as Record<string, string[]> | undefined

  if (!fieldErrors) {
    return false
  }

  let hasMappedErrors = false

  Object.entries(fieldErrors).forEach(([field, messages]) => {
    if (messages && messages.length > 0) {
      form.setError(field as Path<T>, {
        type: 'server',
        message: messages[0]
      })
      hasMappedErrors = true
    }
  })

  return hasMappedErrors
}
```

#### Задача 4.3: Использовать в auth страницах

**Файл:** [`apps/web/src/app/(root)/auth/login/page.tsx`](apps/web/src/app/(root)/auth/login/page.tsx)

```typescript
import { mapGraphQLErrorsToForm } from '@/packages/utils/map-graphql-errors-to-form'

const [login, { loading }] = useMutation(LoginDocument, {
  errorPolicy: 'all',
  onError: (apolloError) => {
    // Попробовать замапить на поля формы
    const mapped = mapGraphQLErrorsToForm(apolloError, form)

    // Если не удалось, показать Toast
    if (!mapped) {
      error(apolloError.message || 'Ошибка входа')
    }
  }
})

const onSubmit = async (data: TLoginSchema) => {
  try {
    const response = await login({ variables: { input: data }})

    if (response.error) {
      const mapped = mapGraphQLErrorsToForm(response.error, form)

      if (!mapped) {
        error(response.error.message || 'Ошибка входа')
      }
      return
    }

    // Success...
  } catch (err: any) {
    error(err?.message || 'Ошибка входа')
  }
}
```

**Результат:**
- ✅ Backend validation errors показываются **под полями формы**
- ✅ Поля подсвечиваются красным
- ✅ Общие ошибки (rate limit, network) — в Toast

---

### Phase 5: Удаление дублирования (LOW Priority)

**Цель:** Создать переиспользуемый хук для auth mutations

#### Задача 5.1: Создать useAuthMutation hook

**Новый файл:** `apps/web/src/packages/hooks/use-auth-mutation.ts`

```typescript
import { useMutation, MutationHookOptions, DocumentNode } from '@apollo/client'
import { UseFormReturn, FieldValues } from 'react-hook-form'
import { useToast } from './use-toast'
import { mapGraphQLErrorsToForm } from '@/packages/utils/map-graphql-errors-to-form'

export function useAuthMutation<
  TData = any,
  TVariables = any,
  TFormValues extends FieldValues = any
>(
  mutation: DocumentNode,
  form?: UseFormReturn<TFormValues>,
  options?: MutationHookOptions<TData, TVariables>
) {
  const { error: showError } = useToast()

  return useMutation<TData, TVariables>(mutation, {
    errorPolicy: 'all',
    ...options,
    onError: (apolloError) => {
      // Попробовать замапить на форму
      if (form) {
        const mapped = mapGraphQLErrorsToForm(apolloError, form)
        if (mapped) return
      }

      // Показать Toast
      showError(apolloError.message || 'Произошла ошибка')

      // Вызвать пользовательский onError если есть
      options?.onError?.(apolloError)
    },
  })
}
```

#### Задача 5.2: Упростить auth страницы

**Файл:** [`apps/web/src/app/(root)/auth/login/page.tsx`](apps/web/src/app/(root)/auth/login/page.tsx)

```typescript
// Было:
const [login, { loading }] = useMutation(LoginDocument, {
  errorPolicy: 'all',
  onError: (apolloError) => {
    error(apolloError.message || 'Ошибка входа')
  }
})

// Стало:
const [login, { loading }] = useAuthMutation(LoginDocument, form)

const onSubmit = async (data: TLoginSchema) => {
  const response = await login({ variables: { input: data }})

  if (response.data?.login?.user) {
    success("Вход выполнен успешно")
    router.push("/dashboard")
  }
}
```

**Результат:**
- ✅ Удалено ~40 строк повторяющегося кода
- ✅ Единообразная обработка ошибок
- ✅ Легко поддерживать

---

## 📊 4. ПРИОРИТИЗАЦИЯ ЗАДАЧ

### Критические (Делать первыми)

| Приоритет | Задача | Файлы | Время | Эффект |
|-----------|--------|-------|-------|--------|
| 🔴 1 | Улучшить Error Link + 401/403 | `apollo-client.config.ts` | 1-2ч | HIGH |
| 🔴 2 | Кастомные error codes на backend | `error-codes.enum.ts`, `auth.service.ts` | 2-3ч | HIGH |

### Важные (Делать после критических)

| Приоритет | Задача | Файлы | Время | Эффект |
|-----------|--------|-------|-------|--------|
| 🟡 3 | Toast queue system | `toast.store.ts`, `toast.tsx` | 1-2ч | MEDIUM |
| 🟡 4 | Backend validation → form fields | `auth.service.ts`, `login/page.tsx` | 2-3ч | MEDIUM |

### Желательные (Опционально)

| Приоритет | Задача | Файлы | Время | Эффект |
|-----------|--------|-------|-------|--------|
| 🟢 5 | useAuthMutation hook | `use-auth-mutation.ts` | 1ч | LOW |
| 🟢 6 | Error tracking (Sentry) | `apollo-client.config.ts` | 1ч | LOW |

---

## 🎯 5. РЕКОМЕНДУЕМЫЙ ПОРЯДОК ВЫПОЛНЕНИЯ

### Этап 1: Критические исправления (1 день)

1. **Утро:** Phase 2 → Кастомные error codes на backend
   - Создать `error-codes.enum.ts`
   - Создать кастомные exceptions
   - Обновить `auth.service.ts`
   - Настроить `formatError` в GraphQL

2. **День:** Phase 1 → Улучшить Error Link
   - Добавить интеграцию с Toast
   - Добавить обработку 401/403
   - Протестировать на всех страницах

### Этап 2: Улучшения UX (1 день)

3. **Утро:** Phase 3 → Toast queue system
   - Обновить `toast.store.ts`
   - Обновить `toast.tsx`
   - Протестировать множественные уведомления

4. **День:** Phase 4 → Backend validation → form fields
   - Добавить `fieldErrors` в backend exceptions
   - Создать `mapGraphQLErrorsToForm` utility
   - Интегрировать в auth страницы

### Этап 3: Рефакторинг (опционально)

5. **Phase 5:** Создать `useAuthMutation` hook
6. **Добавить:** Error tracking (Sentry)

---

## 📈 6. МЕТРИКИ УСПЕХА

### До улучшений

| Метрика | Значение |
|---------|----------|
| Дублирование Toast кода | 4 копии |
| Ошибки без уведомления | ~30% (network, 500) |
| Обработка 401/403 | ❌ Нет |
| Backend error codes | ❌ Нет |
| Toast queue | ❌ Нет |
| Validation в форме | Только frontend |

### После улучшений

| Метрика | Значение |
|---------|----------|
| Дублирование Toast кода | ✅ 0 (глобальный) |
| Ошибки без уведомления | ✅ 0% (все в Toast) |
| Обработка 401/403 | ✅ Автоматический редирект |
| Backend error codes | ✅ Структурированные |
| Toast queue | ✅ До 3 одновременно |
| Validation в форме | ✅ Frontend + Backend |

---

## 🔄 7. АРХИТЕКТУРНАЯ ДИАГРАММА

### Текущая (Частично реализовано)

```
┌─────────────────────────────────────────────────────────────┐
│                     USER ACTION                             │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              Frontend Validation (Zod)                      │
│  ✅ useAutoValidateForm (debounce 300ms)                    │
│  ✅ FormMessage под полями                                  │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              Apollo Client Mutation                         │
│  ✅ errorPolicy: 'all'                                      │
│  ⚠️ onError: локальный Toast                               │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│               Backend (NestJS GraphQL)                      │
│  ✅ ValidationPipe (class-validator)                        │
│  ✅ AuthGuard (JWT/Session)                                 │
│  ✅ AuthService (Business Logic)                            │
│  ❌ Нет кастомных error codes                              │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              GraphQL Error Response                         │
│  { errors: [{ message, extensions: { code } }] }            │
│  ❌ Нет errorCode, fieldErrors                             │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              Error Link (Apollo)                            │
│  ⚠️ console.log/console.error                              │
│  ❌ Не показывает Toast                                     │
│  ❌ Нет обработки 401/403                                   │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│            Local Error Handling (onError)                   │
│  ⚠️ Дублируется на 4 страницах                             │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              Global Toast (Zustand)                         │
│  ✅ useToast() hook                                         │
│  ✅ Framer Motion анимации                                  │
│  ❌ Перезаписывает предыдущие                              │
└─────────────────────────────────────────────────────────────┘
```

### Целевая (После улучшений)

```
┌─────────────────────────────────────────────────────────────┐
│                     USER ACTION                             │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              Frontend Validation (Zod)                      │
│  ✅ useAutoValidateForm (debounce 300ms)                    │
│  ✅ FormMessage под полями                                  │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              Apollo Client Mutation                         │
│  ✅ errorPolicy: 'all'                                      │
│  ✅ useAuthMutation hook (unified handling)                 │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│               Backend (NestJS GraphQL)                      │
│  ✅ ValidationPipe                                          │
│  ✅ AuthGuard                                               │
│  ✅ AuthService                                             │
│  ✅ Кастомные error codes (ErrorCode enum)                 │
│  ✅ fieldErrors для form mapping                           │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              GraphQL Error Response                         │
│  {                                                          │
│    errors: [{                                               │
│      message: "...",                                        │
│      extensions: {                                          │
│        code: "UNAUTHENTICATED",                             │
│        errorCode: "INVALID_CREDENTIALS",                    │
│        fieldErrors: { email: [...] }                        │
│      }                                                      │
│    }]                                                       │
│  }                                                          │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              Error Link (Apollo)                            │
│  ✅ Интеграция с Toast store                               │
│  ✅ Обработка 401 → редирект на /login                     │
│  ✅ Обработка 403 → Toast "Недостаточно прав"              │
│  ✅ Network errors → Toast                                  │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ├──────────────┬──────────────────────────┐
                     │              │                          │
                     ▼              ▼                          ▼
         ┌───────────────────────────────┐      ┌──────────────────┐
         │  mapGraphQLErrorsToForm       │      │  Global Toast    │
         │  ✅ fieldErrors → form        │      │  ✅ Queue (3 max)│
         │  ✅ Подсветка полей           │      │  ✅ Кнопка Close │
         └───────────────────────────────┘      └──────────────────┘
```

---

## 📝 8. ЧЕКЛИСТ РЕАЛИЗАЦИИ

### Phase 1: Error Link ✅

- [ ] Добавить интеграцию с Toast store
- [ ] Добавить обработку 401/403 с редиректом
- [ ] Добавить обработку network errors
- [ ] Протестировать на всех типах ошибок

### Phase 2: Backend Error Codes ✅

- [ ] Создать `error-codes.enum.ts`
- [ ] Создать кастомные exception классы
- [ ] Обновить `auth.service.ts` (все методы)
- [ ] Обновить `auth.guard.ts`
- [ ] Настроить `formatError` в GraphQL config
- [ ] Протестировать все сценарии ошибок

### Phase 3: Toast Queue ✅

- [ ] Обновить `toast.store.ts` (массив вместо одного)
- [ ] Обновить `useToast` hook
- [ ] Обновить `toast.tsx` (рендер массива)
- [ ] Добавить кнопку закрытия
- [ ] Протестировать множественные уведомления

### Phase 4: Form Field Mapping ✅

- [ ] Добавить `fieldErrors` в backend exceptions
- [ ] Создать `mapGraphQLErrorsToForm` utility
- [ ] Интегрировать в `login/page.tsx`
- [ ] Интегрировать в `register/page.tsx`
- [ ] Интегрировать в остальные auth страницы
- [ ] Протестировать backend validation

### Phase 5: Рефакторинг (Опционально) ✅

- [ ] Создать `useAuthMutation` hook
- [ ] Рефакторить все auth страницы
- [ ] Удалить дублирующийся код
- [ ] Добавить Sentry integration

---

## 🚀 9. НАЧАЛО РАБОТЫ

Для начала реализации выполните:

```bash
# 1. Создать ветку
git checkout -b feature/improve-error-handling

# 2. Backend: создать файлы error codes
mkdir -p apps/api/src/shared/errors
touch apps/api/src/shared/errors/error-codes.enum.ts
touch apps/api/src/shared/errors/custom-exceptions.ts

# 3. Frontend: создать utilities
touch apps/web/src/packages/utils/map-graphql-errors-to-form.ts

# 4. Начать с Phase 2 (backend error codes)
# Открыть apps/api/src/shared/errors/error-codes.enum.ts
```

---

## 📞 10. КОНТАКТЫ И РЕСУРСЫ

- **Документация Apollo Error Link:** https://www.apollographql.com/docs/react/api/link/apollo-link-error
- **NestJS Exception Filters:** https://docs.nestjs.com/exception-filters
- **Zustand Best Practices:** https://github.com/pmndrs/zustand
- **React Hook Form setError:** https://react-hook-form.com/docs/useform/seterror

---

**Дата последнего обновления:** 2025-12-03
**Автор:** Claude Code Analysis
**Версия документа:** 1.0
