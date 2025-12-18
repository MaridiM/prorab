# Отчет: План миграции форм на react-hook-form + Zod

**Дата:** 2025-12-02
**Автор:** Анализ системы форм в приложении ProRab.space

---

## Обзор задачи

Проанализировать существующие формы авторизации в клиентском приложении и спланировать миграцию на централизованный паттерн валидации с использованием react-hook-form + Zod согласно шаблону из [apps/web/docs/forms-validation-template.md](../../apps/web/docs/forms-validation-template.md).

---

## Текущее состояние

### Существующие формы (apps/web)

1. **Login** (`apps/web/src/app/(root)/auth/login/page.tsx`) - 241 строка
2. **Register** (`apps/web/src/app/(root)/auth/register/page.tsx`) - 264 строки
3. **Forgot Password** (`apps/web/src/app/(root)/auth/forgot-password/page.tsx`) - 214 строк
4. **Reset Password** (`apps/web/src/app/(root)/auth/reset-password/page.tsx`) - 196 строк

### Проблемы текущей реализации

#### ❌ Ручное управление состоянием

```typescript
// Сейчас - неэффективно
const [email, setEmail] = useState("")
const [password, setPassword] = useState("")

// Должно быть - react-hook-form
const form = useForm<TLoginSchema>({
    resolver: zodResolver(loginSchema)
})
```

#### ❌ Отсутствие валидации

- Только HTML5 валидация (`required`, `type="email"`)
- Валидация паролей только на submit (нет real-time feedback)
- Нет Zod схем

#### ❌ Дублирование кода

- **Toast компонент** дублируется во всех 4 файлах (идентичный код)
- Ручная валидация паролей повторяется в register и reset-password

#### ❌ Неконсистентность

- **Register/Login**: используют `useState`
- **Reset Password**: использует `FormData`
- Разные подходы к обработке ошибок

#### ❌ Неполная интеграция

- Forgot Password - нет GraphQL мутации (mock с setTimeout)
- Reset Password - нет GraphQL мутации (mock с setTimeout)

---

## Доступная инфраструктура

### ✅ Установленные библиотеки

```json
{
  "react-hook-form": "^7.67.0",
  "zod": "^4.1.13",
  "@hookform/resolvers": "^5.2.2"
}
```

### ✅ Готовые компоненты форм

**Файл:** `apps/web/src/packages/components/ui/form.tsx`

Полная интеграция с react-hook-form:

- `Form` - обертка FormProvider
- `FormField` - обертка Controller
- `FormItem` - контейнер поля
- `FormLabel` - label с поддержкой ошибок
- `FormControl` - обертка input с accessibility
- `FormMessage` - отображение ошибок
- `useFormField` - хук для доступа к состоянию

### ✅ Директория для схем

```text
apps/web/src/packages/schemas/
├── index.ts
└── components/
    ├── index.ts
    └── change-language.schema.ts (пример реализации)
```

### ✅ GraphQL мутации

**Файл:** `apps/web/src/packages/api/graphql/__generated__/output.ts`

Доступные документы:

- `LoginDocument` ✅
- `RegisterDocument` ✅
- `LogoutDocument` ✅
- `ForgotPasswordDocument` (нужно проверить)
- `ResetPasswordDocument` (нужно проверить)

**Input типы:**

```typescript
LoginInput { email: string, password: string }
RegisterInput { email: string, password: string, name?: string, phone?: string }
```

---

## План миграции

### Этап 1: Подготовка инфраструктуры

#### 1.1. Создать структуру для auth модуля

```text
apps/web/src/packages/schemas/auth/
├── index.ts
├── login.schema.ts
├── register.schema.ts
├── forgot-password.schema.ts
└── reset-password.schema.ts
```

#### 1.2. Создать shared Toast компонент

```text
apps/web/src/packages/components/shared/toast.tsx
```

**Причина:** Toast дублируется в 4 местах с идентичным кодом

#### 1.3. Опционально: создать хук useAutoValidateForm

```text
apps/web/src/packages/hooks/use-auto-validate-form.ts
```

**Из шаблона:** Автоматическая валидация с debounce 300ms

---

### Этап 2: Создание Zod схем валидации

#### 2.1. Login Schema

**Файл:** `apps/web/src/packages/schemas/auth/login.schema.ts`

```typescript
import { z } from 'zod'

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

export type TLoginSchema = z.infer<typeof loginSchema>
```

#### 2.2. Register Schema

**Файл:** `apps/web/src/packages/schemas/auth/register.schema.ts`

```typescript
import { z } from 'zod'

export const registerSchema = z.object({
    name: z.string().optional(),
    email: z
        .string()
        .nonempty({ message: 'Email обязателен' })
        .email({ message: 'Неверный формат email' }),
    phone: z
        .string()
        .optional()
        .refine(
            val => !val || /^\+[1-9]\d{1,14}$/.test(val),
            { message: 'Неверный формат телефона' }
        ),
    password: z
        .string()
        .nonempty({ message: 'Пароль обязателен' })
        .min(8, { message: 'Минимум 8 символов' })
        .regex(/(?=.*[a-zA-Z])(?=.*\d)/, {
            message: 'Пароль должен содержать буквы и цифры'
        }),
    confirmPassword: z
        .string()
        .nonempty({ message: 'Подтвердите пароль' })
}).refine(data => data.password === data.confirmPassword, {
    message: 'Пароли не совпадают',
    path: ['confirmPassword']
})

export type TRegisterSchema = z.infer<typeof registerSchema>
```

#### 2.3. Forgot Password Schema

**Файл:** `apps/web/src/packages/schemas/auth/forgot-password.schema.ts`

```typescript
import { z } from 'zod'

export const forgotPasswordSchema = z.object({
    email: z
        .string()
        .nonempty({ message: 'Email обязателен' })
        .email({ message: 'Неверный формат email' })
})

export type TForgotPasswordSchema = z.infer<typeof forgotPasswordSchema>
```

#### 2.4. Reset Password Schema

**Файл:** `apps/web/src/packages/schemas/auth/reset-password.schema.ts`

```typescript
import { z } from 'zod'

export const resetPasswordSchema = z.object({
    password: z
        .string()
        .nonempty({ message: 'Пароль обязателен' })
        .min(8, { message: 'Минимум 8 символов' })
        .regex(/(?=.*[a-zA-Z])(?=.*\d)/, {
            message: 'Пароль должен содержать буквы и цифры'
        }),
    confirmPassword: z
        .string()
        .nonempty({ message: 'Подтвердите пароль' })
}).refine(data => data.password === data.confirmPassword, {
    message: 'Пароли не совпадают',
    path: ['confirmPassword']
})

export type TResetPasswordSchema = z.infer<typeof resetPasswordSchema>
```

#### 2.5. Index экспорт

**Файл:** `apps/web/src/packages/schemas/auth/index.ts`

```typescript
export * from './login.schema'
export * from './register.schema'
export * from './forgot-password.schema'
export * from './reset-password.schema'
```

---

### Этап 3: Миграция форм

#### 3.1. Login Form

**Файл:** `apps/web/src/app/(root)/auth/login/page.tsx`

**Текущее:**

```typescript
const [email, setEmail] = useState("")
const [password, setPassword] = useState("")
```

**Новое:**

```typescript
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { loginSchema, TLoginSchema } from '@/packages/schemas/auth'
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/packages/components'

const form = useForm<TLoginSchema>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
    mode: 'onTouched',
    reValidateMode: 'onChange'
})

const onSubmit = async (data: TLoginSchema) => {
    const response = await login({
        variables: { input: data }
    })
    // обработка ответа
}

return (
    <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                            <Input type="email" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
            {/* аналогично для password */}
        </form>
    </Form>
)
```

#### 3.2. Register Form

**Файл:** `apps/web/src/app/(root)/auth/register/page.tsx`

**Изменения:**

- Удалить все `useState` (email, password, confirmPassword, name, phone)
- Удалить ручную валидацию в `handleRegister`
- Использовать `registerSchema` с `.refine()` для проверки паролей
- Обернуть все поля в `FormField` с автоматической валидацией
- Использовать `form.formState.isValid` для disabled кнопки

#### 3.3. Forgot Password Form

**Файл:** `apps/web/src/app/(root)/auth/forgot-password/page.tsx`

**Изменения:**

- Удалить mock setTimeout логику
- Интегрировать реальную GraphQL мутацию (проверить `ForgotPasswordDocument`)
- Использовать `forgotPasswordSchema`
- Добавить обработку успешной отправки через `toast` или состояние

#### 3.4. Reset Password Form

**Файл:** `apps/web/src/app/(root)/auth/reset-password/page.tsx`

**Изменения:**

- Заменить `FormData` подход на `useForm`
- Удалить ручную валидацию паролей
- Использовать `resetPasswordSchema` с `.refine()`
- Интегрировать реальную GraphQL мутацию
- Получить токен из URL query параметров

---

### Этап 4: Создание shared компонентов

#### 4.1. Toast компонент

**Файл:** `apps/web/src/packages/components/shared/toast.tsx`

**Цель:** Заменить дублированный код во всех 4 формах

**Функциональность:**

- Типы: `success`, `error`
- Анимация появления/исчезновения (Framer Motion)
- Иконки: Check (success), AlertCircle (error)
- Auto-dismiss через setTimeout

**Альтернатива:** Использовать библиотеку `sonner` (уже в зависимостях)

```typescript
import { toast } from 'sonner'

toast.success('Успешно!')
toast.error('Ошибка!')
```

#### 4.2. Опционально: Password Input с toggle visibility

**Файл:** `apps/web/src/packages/components/ui/password-input.tsx`

Сейчас логика показа/скрытия пароля дублируется в формах.

---

### Этап 5: Интеграция автоматической валидации

#### 5.1. Создать хук useAutoValidateForm

**Файл:** `apps/web/src/packages/hooks/use-auto-validate-form.ts`

**Из шаблона** - полная реализация с:

- Debounce 300ms
- Опция `validateEmpty` (не валидировать пустые поля)
- Опция `suppressRef` (отключить валидацию)
- Cleanup таймера

#### 5.2. Применить к формам

```typescript
// Login
useAutoValidateForm(form, ['email', 'password'])

// Register
useAutoValidateForm(form, ['email', 'password', 'confirmPassword', 'name', 'phone'])

// Forgot Password
useAutoValidateForm(form, ['email'])

// Reset Password
useAutoValidateForm(form, ['password', 'confirmPassword'])
```

---

### Этап 6: Проверка GraphQL интеграции

#### 6.1. Проверить наличие мутаций

**Файл:** `apps/web/src/packages/api/graphql/__generated__/output.ts`

Нужно убедиться в наличии:

- `ForgotPasswordDocument` ✅/❌
- `ResetPasswordDocument` ✅/❌

#### 6.2. Если мутаций нет - добавить в GraphQL файлы

**Создать:** `apps/web/src/packages/api/graphql/auth.graphql`

```graphql
mutation ForgotPassword($email: String!) {
  forgotPassword(email: $email)
}

mutation ResetPassword($token: String!, $password: String!) {
  resetPassword(token: $token, password: $password) {
    success
    message
  }
}
```

#### 6.3. Запустить codegen

```bash
pnpm --filter web run codegen
```

---

## Критические файлы для изменения

### Создать новые файлы

1. ✅ `apps/web/src/packages/schemas/auth/login.schema.ts`
2. ✅ `apps/web/src/packages/schemas/auth/register.schema.ts`
3. ✅ `apps/web/src/packages/schemas/auth/forgot-password.schema.ts`
4. ✅ `apps/web/src/packages/schemas/auth/reset-password.schema.ts`
5. ✅ `apps/web/src/packages/schemas/auth/index.ts`
6. ✅ `apps/web/src/packages/hooks/use-auto-validate-form.ts`
7. ✅ `apps/web/src/packages/components/shared/toast.tsx` (опционально, если не использовать sonner)

### Модифицировать существующие файлы

1. 🔄 `apps/web/src/app/(root)/auth/login/page.tsx`
2. 🔄 `apps/web/src/app/(root)/auth/register/page.tsx`
3. 🔄 `apps/web/src/app/(root)/auth/forgot-password/page.tsx`
4. 🔄 `apps/web/src/app/(root)/auth/reset-password/page.tsx`
5. 🔄 `apps/web/src/packages/schemas/index.ts` (добавить экспорт auth схем)
6. 🔄 `apps/web/src/packages/hooks/index.ts` (добавить экспорт useAutoValidateForm)

### Проверить

1. ❓ `apps/web/src/packages/api/graphql/__generated__/output.ts` - наличие ForgotPassword и ResetPassword
2. ❓ `apps/web/src/packages/api/graphql/auth.graphql` - наличие всех мутаций

---

## Преимущества после миграции

### ✅ Централизованная валидация

- Единые Zod схемы для frontend и потенциально для backend
- Типобезопасность из коробки (`z.infer`)
- Переиспользуемые правила валидации

### ✅ Real-time feedback

- Автоматическая валидация при изменении (debounce 300ms)
- Валидация при потере фокуса (`mode: 'onTouched'`)
- Немедленное отображение ошибок через `FormMessage`

### ✅ Меньше кода

- **Login:** ~240 строк → ~150 строк (экономия ~40%)
- **Register:** ~260 строк → ~180 строк (экономия ~30%)
- Удаление дублирования Toast компонента

### ✅ Консистентность

- Единый подход во всех формах
- Стандартизированная обработка ошибок
- Единая структура компонентов

### ✅ Лучший UX

- Валидация на лету с debounce
- Понятные сообщения об ошибках
- Disabled кнопки до валидного состояния
- Визуальная индикация ошибок (красные label)

### ✅ Поддерживаемость

- Легко добавлять новые правила валидации
- Изолированные схемы от UI логики
- Простое тестирование схем

---

## Потенциальные проблемы и решения

### Проблема 1: Отсутствие GraphQL мутаций

**Симптом:** ForgotPasswordDocument и ResetPasswordDocument не существуют

**Решение:**

1. Создать `auth.graphql` с мутациями
2. Запустить `pnpm --filter web run codegen`
3. Проверить backend - убедиться что мутации существуют

### Проблема 2: Конфликт типов GraphQL Input vs Zod Schema

**Симптом:** RegisterInput не совпадает с TRegisterSchema (confirmPassword)

**Решение:**

```typescript
const onSubmit = async (data: TRegisterSchema) => {
    const { confirmPassword, ...input } = data
    await register({ variables: { input } })
}
```

### Проблема 3: Toast vs sonner

**Симптом:** Дублированный код Toast компонента

**Решения:**

1. **Опция A:** Создать shared Toast компонент
2. **Опция B:** Использовать `sonner` библиотеку (уже установлена)

   ```typescript
   import { toast } from 'sonner'
   toast.success('Успех!')
   ```

### Проблема 4: Переводы (i18n)

**Симптом:** Шаблон использует функции `make{Schema}(t)` с переводами

**Текущее состояние:** Хардкод русских сообщений

**Решение:**

- **Краткосрочное:** Использовать хардкод на русском
- **Долгосрочное:** Интегрировать с next-intl (уже установлен)

---

## Порядок выполнения (приоритет)

### Высокий приоритет

1. ✅ Создать Zod схемы (Этап 2)
2. ✅ Мигрировать Login форму (Этап 3.1)
3. ✅ Мигрировать Register форму (Этап 3.2)

### Средний приоритет

4. ✅ Создать useAutoValidateForm хук (Этап 5)
5. ✅ Решить проблему Toast (Этап 4.1)
6. ✅ Мигрировать Forgot Password (Этап 3.3)
7. ✅ Мигрировать Reset Password (Этап 3.4)

### Низкий приоритет

8. 🔽 Создать PasswordInput компонент (Этап 4.2)
9. 🔽 Интегрировать переводы через next-intl

---

## Критерии успеха

### Функциональность

- ✅ Все 4 формы работают с react-hook-form
- ✅ Валидация работает в real-time (debounce)
- ✅ Сообщения об ошибках отображаются корректно
- ✅ Кнопки submit disabled до валидного состояния
- ✅ GraphQL мутации выполняются успешно

### Качество кода

- ✅ Удалены все `useState` для полей форм
- ✅ Удалена ручная валидация
- ✅ Удален дублированный Toast код
- ✅ Типобезопасность через Zod schemas
- ✅ Консистентная структура во всех формах

### Производительность

- ✅ Debounce предотвращает избыточные ререндеры
- ✅ Мемоизация схем через useMemo (если нужны переводы)

---

## Дополнительные улучшения (после миграции)

### 1. Добавить password strength индикатор

```typescript
// Визуальная индикация сложности пароля
<PasswordStrength value={password} />
```

### 2. Добавить показ требований к паролю

```typescript
<FormDescription>
  Минимум 8 символов, должен содержать буквы и цифры
</FormDescription>
```

### 3. Интегрировать email verification в register flow

```typescript
// После успешной регистрации показать форму верификации OTP
```

### 4. Добавить "Запомнить меня" в login форме

```typescript
rememberMe: z.boolean().optional()
```

### 5. Добавить rate limiting feedback

```typescript
// Если сервер возвращает "Too many requests"
toast.error('Слишком много попыток. Попробуйте позже.')
```

---

## Заключение

Миграция на централизованный паттерн с react-hook-form + Zod обеспечит:

- **Консистентность** - единый подход во всех формах
- **Типобезопасность** - автоматический вывод типов из схем
- **UX** - real-time валидация с debounce
- **Поддерживаемость** - изолированные схемы, переиспользуемая логика
- **Масштабируемость** - легко добавлять новые формы по шаблону

**Приоритет:** сначала Login и Register (самые критичные), затем Forgot/Reset Password.
