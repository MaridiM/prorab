# План реализации: Этап 9 - UX-полировка (UX Polish & Final Touches)

## Статус: 📋 ПЛАНИРУЕТСЯ

**Предыдущий этап:** Этап 8 (Монетизация) завершён ✅
**Текущая задача:** Улучшение пользовательского опыта перед публичным запуском
**Цель:** Доведение MVP до production-ready состояния с профессиональным UX
**Приоритет:** 🔴 Важный (перед запуском)
**Оценка времени:** 1 неделя (40-50 часов)
**Блокирует:** Публичный запуск MVP, первые пользователи

---

## Бизнес-ценность

### 💰 Impact

**Проблема которую решаем:** "Почему пользователи не понимают как пользоваться приложением?"

**Текущая ситуация:**
- Нет loading states → пользователи не понимают что происходит
- Пустые страницы без объяснений → confusion
- Ошибки падают без понятных сообщений
- Нет обратной связи о действиях пользователя
- Отсутствуют подсказки для новичков

**После внедрения:**
- Skeleton loaders на всех страницах → понятно что идёт загрузка
- Empty states с иллюстрациями и CTA → понятно что делать дальше
- User-friendly error messages → понятно что пошло не так
- Toast notifications → обратная связь на все действия
- Telegram bot для уведомлений → вовлечённость
- PWA support → установка на домашний экран

**Метрики успеха:**
- **Retention +20%** - пользователи возвращаются благодаря уведомлениям
- **Onboarding completion +30%** - понятные empty states и hints
- **Support requests -40%** - понятные error messages
- **Mobile usage +25%** - PWA установка

---

## Текущее состояние

### ✅ Что уже есть:
- Backend: Все основные модули реализованы
- Frontend: Основные страницы и компоненты
- Design System: Базовые UI компоненты (Button, Card, Input)
- Toast System: Centralizedная система уведомлений (Zustand)
- Auth System: Полная аутентификация
- GraphQL API: Все операции

### ❌ Что нужно добавить:
- Loading States: Skeleton loaders для всех страниц
- Empty States: Компоненты с иллюстрациями
- Error Handling: Error boundaries и user-friendly messages
- Telegram Bot: Webhook для уведомлений (demo)
- PWA: Manifest, Service Worker, offline support
- Accessibility: ARIA labels, keyboard navigation
- Performance: Оптимизация bundle size

---

## Архитектура решения

### 1. LOADING STATES

#### 1.1. Skeleton Loaders

**Принцип:**
- Skeleton имитирует layout финального контента
- Плавная анимация (pulse или shimmer)
- Matching dimensions с реальным контентом

**Компоненты для создания:**

```typescript
// apps/web/src/packages/components/loading/Skeleton.tsx
export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-muted",
        className
      )}
      {...props}
    />
  );
}

// apps/web/src/packages/components/loading/ProjectCardSkeleton.tsx
export function ProjectCardSkeleton() {
  return (
    <Card className="p-6 space-y-4">
      <Skeleton className="h-4 w-2/3" /> {/* Title */}
      <Skeleton className="h-3 w-full" /> {/* Address */}
      <Skeleton className="h-3 w-full" />
      <div className="flex gap-2">
        <Skeleton className="h-8 w-20" /> {/* Badge */}
        <Skeleton className="h-8 w-20" />
      </div>
      <Skeleton className="h-2 w-full" /> {/* Progress bar */}
    </Card>
  );
}

// apps/web/src/packages/components/loading/TeamCardSkeleton.tsx
export function TeamCardSkeleton() {
  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-center gap-4">
        <Skeleton className="h-12 w-12 rounded-full" /> {/* Logo */}
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-32" /> {/* Team name */}
          <Skeleton className="h-3 w-24" /> {/* Role */}
        </div>
      </div>
      <Skeleton className="h-8 w-20" /> {/* Badge */}
    </Card>
  );
}

// apps/web/src/packages/components/loading/DashboardSkeleton.tsx
export function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      <Skeleton className="h-8 w-48" /> {/* Welcome header */}
      <Skeleton className="h-32 w-full" /> {/* Financial summary */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <ProjectCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
```

**Где применить:**
- `/dashboard` - DashboardSkeleton
- `/teams` - TeamCardSkeleton grid
- `/teams/[teamId]` - ProjectCardSkeleton grid
- `/teams/[teamId]/projects/[projectId]` - ProjectDetailsSkeleton
- Все списки - generic ListSkeleton

**Implementation:**
```typescript
// Pattern: Suspense + loading.tsx
export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardContent />
    </Suspense>
  );
}

// Or: Apollo loading state
const { data, loading } = useQuery(PROJECT_QUERY);
if (loading) return <ProjectCardSkeleton />;
```

---

### 2. EMPTY STATES

#### 2.1. EmptyState Component

```typescript
// apps/web/src/packages/components/empty-states/EmptyState.tsx

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?: 'default' | 'outline';
  };
  illustration?: 'projects' | 'expenses' | 'photos' | 'tasks';
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  illustration
}: EmptyStateProps) {
  return (
    <Card className="p-12 text-center space-y-4">
      {/* Illustration или Icon */}
      {illustration && <IllustrationSvg type={illustration} className="mx-auto" />}
      {!illustration && icon && (
        <div className="flex justify-center">
          <div className="p-4 bg-muted rounded-full">
            {icon}
          </div>
        </div>
      )}

      {/* Title */}
      <h3 className="text-lg font-semibold">{title}</h3>

      {/* Description */}
      {description && (
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          {description}
        </p>
      )}

      {/* Action Button */}
      {action && (
        <Button
          variant={action.variant || 'default'}
          onClick={action.onClick}
        >
          {action.label}
        </Button>
      )}
    </Card>
  );
}
```

**Empty State Messages:**

```typescript
// apps/web/src/packages/components/empty-states/messages.ts

export const EMPTY_STATES = {
  projects: {
    title: 'Пока нет проектов',
    description: 'Создайте первый проект чтобы начать отслеживать расходы и прогресс работ',
    action: 'Создать проект',
  },
  expenses: {
    title: 'Нет расходов',
    description: 'Добавьте первый расход чтобы отслеживать бюджет и прибыль проекта',
    action: 'Добавить расход',
  },
  photoReports: {
    title: 'Нет фотоотчётов',
    description: 'Создайте фотоотчёт чтобы поделиться прогрессом с клиентом',
    action: 'Создать отчёт',
  },
  tasks: {
    title: 'Нет задач',
    description: 'Добавьте задачи чтобы организовать работу и отслеживать выполнение',
    action: 'Добавить задачу',
  },
  members: {
    title: 'Только вы в команде',
    description: 'Пригласите участников чтобы работать вместе над проектами',
    action: 'Пригласить участника',
  },
  payments: {
    title: 'Нет платежей',
    description: 'История ваших платежей будет отображаться здесь',
  },
  search: {
    title: 'Ничего не найдено',
    description: 'Попробуйте изменить условия поиска',
  },
} as const;
```

**Где применить:**
- Dashboard: нет проектов
- Projects List: нет проектов в команде
- Expenses Tab: нет расходов в проекте
- Photo Reports Tab: нет фотоотчётов
- Tasks Tab: нет задач (future)
- Team Members: только владелец
- Payment History: нет платежей
- Search Results: нет результатов

---

### 3. ERROR HANDLING

#### 3.1. Error Boundaries

**Global Error Boundary:**
```typescript
// apps/web/src/app/error.tsx

'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log to error tracking service (Sentry)
    console.error('Error:', error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="max-w-md p-8 space-y-4 text-center">
        <div className="flex justify-center">
          <AlertCircle className="h-12 w-12 text-destructive" />
        </div>
        <h2 className="text-2xl font-bold">Что-то пошло не так</h2>
        <p className="text-muted-foreground">
          Произошла ошибка при загрузке страницы. Попробуйте обновить страницу.
        </p>
        {error.message && (
          <details className="text-xs text-left p-4 bg-muted rounded">
            <summary className="cursor-pointer font-medium">
              Техническая информация
            </summary>
            <p className="mt-2">{error.message}</p>
          </details>
        )}
        <div className="flex gap-3">
          <Button onClick={reset} className="flex-1">
            Попробовать снова
          </Button>
          <Button variant="outline" onClick={() => window.location.href = '/'}>
            На главную
          </Button>
        </div>
      </Card>
    </div>
  );
}
```

**Global Error (catch-all):**
```typescript
// apps/web/src/app/global-error.tsx

'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <div className="flex min-h-screen items-center justify-center p-4">
          <div className="max-w-md text-center space-y-4">
            <h2 className="text-2xl font-bold">Критическая ошибка</h2>
            <p>Приложение столкнулось с критической ошибкой</p>
            <button
              className="px-4 py-2 bg-primary text-primary-foreground rounded"
              onClick={reset}
            >
              Перезагрузить приложение
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
```

#### 3.2. Apollo Error Handling

```typescript
// apps/web/src/packages/libs/apollo/error-link.ts

import { onError } from '@apollo/client/link/error';

export const errorLink = onError(({ graphQLErrors, networkError, operation }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, locations, path, extensions }) => {
      const errorMessage = getUserFriendlyMessage(message, extensions?.code);

      // Show toast notification
      toast.error(errorMessage);

      // Log to console in dev
      if (process.env.NODE_ENV === 'development') {
        console.error(
          `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`,
        );
      }
    });
  }

  if (networkError) {
    toast.error('Проблемы с сетью. Проверьте интернет-соединение.');
    console.error(`[Network error]: ${networkError}`);
  }
});

function getUserFriendlyMessage(message: string, code?: string): string {
  const errorMessages: Record<string, string> = {
    UNAUTHENTICATED: 'Требуется авторизация. Войдите в аккаунт.',
    FORBIDDEN: 'У вас нет прав для выполнения этого действия.',
    NOT_FOUND: 'Запрашиваемый ресурс не найден.',
    BAD_USER_INPUT: 'Проверьте введённые данные.',
    INTERNAL_SERVER_ERROR: 'Ошибка сервера. Попробуйте позже.',
    PROJECT_LIMIT_REACHED: 'Достигнут лимит проектов. Обновите тарифный план.',
    MEMBER_LIMIT_REACHED: 'Достигнут лимит участников. Обновите тарифный план.',
  };

  return errorMessages[code || ''] || message || 'Произошла неизвестная ошибка';
}
```

#### 3.3. Form Validation Errors

```typescript
// Pattern: React Hook Form + Zod

<FormField
  control={form.control}
  name="email"
  render={({ field, fieldState }) => (
    <FormItem>
      <FormLabel>Email</FormLabel>
      <FormControl>
        <Input {...field} type="email" />
      </FormControl>
      {fieldState.error && (
        <FormMessage className="text-destructive text-sm">
          {fieldState.error.message}
        </FormMessage>
      )}
      <FormDescription>
        Введите ваш email адрес
      </FormDescription>
    </FormItem>
  )}
/>
```

---

### 4. TELEGRAM BOT INTEGRATION (Demo)

#### 4.1. Bot Setup

**Goal:** Уведомления о важных событиях в Telegram

**Events для уведомлений:**
- Новое приглашение в команду
- Новый комментарий в проекте (future)
- Завершение задачи (future)
- Приближается дедлайн (future)
- Новый фотоотчёт опубликован

#### 4.2. Backend Module

```typescript
// apps/api/src/modules/telegram/telegram.service.ts

import TelegramBot from 'node-telegram-bot-api';

@Injectable()
export class TelegramService {
  private bot: TelegramBot;

  constructor(private configService: ConfigService) {
    const token = configService.get('TELEGRAM_BOT_TOKEN');
    this.bot = new TelegramBot(token, { polling: false });
  }

  async sendNotification(chatId: string, message: string) {
    try {
      await this.bot.sendMessage(chatId, message, {
        parse_mode: 'Markdown',
      });
    } catch (error) {
      console.error('Telegram send error:', error);
    }
  }

  async sendInviteNotification(chatId: string, teamName: string, inviteCode: string) {
    const message = `
🎉 *Вас пригласили в команду*

Команда: *${teamName}*
Код приглашения: \`${inviteCode}\`

[Принять приглашение](https://prorab.space/onboarding/invite?code=${inviteCode})
    `.trim();

    await this.sendNotification(chatId, message);
  }

  async sendPhotoReportNotification(chatId: string, projectName: string, reportSlug: string) {
    const message = `
📸 *Новый фотоотчёт*

Проект: *${projectName}*

[Посмотреть отчёт](https://prorab.space/r/${reportSlug})
    `.trim();

    await this.sendNotification(chatId, message);
  }
}
```

**Environment:**
```env
TELEGRAM_BOT_TOKEN=your_bot_token_from_botfather
```

#### 4.3. User Settings Integration

```prisma
model User {
  // ... existing fields
  telegramChatId String? @map("telegram_chat_id") // User's Telegram chat ID
  notificationsEnabled Boolean @default(false) @map("notifications_enabled")
}
```

**Settings Page:**
- Toggle: Enable/Disable Telegram notifications
- Button: Connect Telegram (OAuth or bot link)
- Instruction: Как подключить бота

---

### 5. PWA SUPPORT

#### 5.1. Web App Manifest

```json
// apps/web/public/manifest.json

{
  "name": "ProRab.space - Управление строительными бригадами",
  "short_name": "ProRab",
  "description": "Приложение для прорабов: учёт расходов, фотоотчёты, расчёт зарплат",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#3b82f6",
  "orientation": "portrait",
  "icons": [
    {
      "src": "/icons/icon-72x72.png",
      "sizes": "72x72",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-96x96.png",
      "sizes": "96x96",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-128x128.png",
      "sizes": "128x128",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-144x144.png",
      "sizes": "144x144",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-152x152.png",
      "sizes": "152x152",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-384x384.png",
      "sizes": "384x384",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ],
  "categories": ["business", "productivity"],
  "shortcuts": [
    {
      "name": "Создать проект",
      "short_name": "Проект",
      "url": "/teams?action=create-project",
      "icons": [
        {
          "src": "/icons/shortcut-project.png",
          "sizes": "96x96"
        }
      ]
    },
    {
      "name": "Добавить расход",
      "short_name": "Расход",
      "url": "/teams?action=add-expense",
      "icons": [
        {
          "src": "/icons/shortcut-expense.png",
          "sizes": "96x96"
        }
      ]
    }
  ]
}
```

#### 5.2. Service Worker (Basic)

```javascript
// apps/web/public/sw.js

const CACHE_NAME = 'prorab-v1';
const STATIC_CACHE = [
  '/',
  '/dashboard',
  '/teams',
  '/offline',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_CACHE);
    })
  );
});

self.addEventListener('fetch', (event) => {
  // Network-first strategy for API calls
  if (event.request.url.includes('/graphql')) {
    event.respondWith(
      fetch(event.request).catch(() => {
        return new Response(
          JSON.stringify({ errors: [{ message: 'Offline' }] }),
          { headers: { 'Content-Type': 'application/json' } }
        );
      })
    );
    return;
  }

  // Cache-first strategy for static assets
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
```

#### 5.3. Offline Page

```typescript
// apps/web/src/app/offline/page.tsx

export default function OfflinePage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="max-w-md p-8 text-center space-y-4">
        <div className="flex justify-center">
          <WifiOff className="h-12 w-12 text-muted-foreground" />
        </div>
        <h2 className="text-2xl font-bold">Нет соединения</h2>
        <p className="text-muted-foreground">
          Вы находитесь в автономном режиме. Проверьте интернет-соединение.
        </p>
        <Button onClick={() => window.location.reload()}>
          Попробовать снова
        </Button>
      </Card>
    </div>
  );
}
```

#### 5.4. Install Prompt

```typescript
// apps/web/src/packages/components/pwa/InstallPrompt.tsx

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      setShowPrompt(false);
    }

    setDeferredPrompt(null);
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:w-96 z-50">
      <Card className="p-4 shadow-lg border-primary">
        <div className="flex items-start gap-4">
          <Smartphone className="h-8 w-8 text-primary shrink-0" />
          <div className="flex-1 space-y-2">
            <h3 className="font-semibold">Установить приложение</h3>
            <p className="text-sm text-muted-foreground">
              Добавьте ProRab на домашний экран для быстрого доступа
            </p>
            <div className="flex gap-2">
              <Button size="sm" onClick={handleInstall}>
                Установить
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowPrompt(false)}
              >
                Позже
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
```

---

## Пошаговая реализация

### Phase 1: Loading & Empty States (Days 1-2)

**День 1: Skeleton Loaders**
- [ ] Создать базовый Skeleton component
- [ ] Создать ProjectCardSkeleton
- [ ] Создать TeamCardSkeleton
- [ ] Создать DashboardSkeleton
- [ ] Создать TableSkeleton (для lists)
- [ ] Применить skeletons ко всем страницам
- [ ] Добавить loading.tsx файлы
- [ ] Тестирование loading states

**День 2: Empty States**
- [ ] Создать EmptyState component
- [ ] Создать EMPTY_STATES messages
- [ ] Применить empty states к Dashboard
- [ ] Применить к Projects List
- [ ] Применить к Expenses Tab
- [ ] Применить к Photo Reports Tab
- [ ] Применить к Search Results
- [ ] Опционально: Создать иллюстрации (или использовать icons)

### Phase 2: Error Handling (Days 3-4)

**День 3: Error Boundaries**
- [ ] Создать app/error.tsx (page-level)
- [ ] Создать app/global-error.tsx (app-level)
- [ ] Создать ErrorFallback component
- [ ] Интегрировать с Apollo errorLink
- [ ] Создать getUserFriendlyMessage helper
- [ ] Обновить toast error messages
- [ ] Testing error scenarios

**День 4: Form & Validation Errors**
- [ ] Проверить все forms на error handling
- [ ] Добавить FormMessage компоненты где отсутствуют
- [ ] Улучшить Zod error messages (русификация)
- [ ] Добавить inline validation hints
- [ ] Добавить field-level error icons
- [ ] Testing форм с ошибками

### Phase 3: Telegram Integration (Day 5)

**День 5: Telegram Bot (Demo)**
- [ ] Создать Telegram bot (BotFather)
- [ ] Установить node-telegram-bot-api
- [ ] Создать TelegramModule
- [ ] Реализовать TelegramService (3 методы)
- [ ] Добавить telegramChatId в User model
- [ ] Создать /settings/notifications страницу
- [ ] Интегрировать notifications в 2-3 места
- [ ] Testing Telegram уведомлений

### Phase 4: PWA Setup (Days 6-7)

**День 6: Manifest & Icons**
- [ ] Создать manifest.json
- [ ] Генерировать иконки (72px - 512px)
- [ ] Добавить manifest link в layout
- [ ] Настроить theme-color meta tags
- [ ] Настроить apple-touch-icon
- [ ] Добавить shortcuts в manifest
- [ ] Testing manifest (Chrome DevTools)

**День 7: Service Worker & Offline**
- [ ] Создать базовый sw.js
- [ ] Регистрация service worker в app
- [ ] Реализовать cache strategies
- [ ] Создать /offline страницу
- [ ] Создать InstallPrompt component
- [ ] Интегрировать InstallPrompt в layout
- [ ] Testing offline mode
- [ ] Testing installation на mobile

---

## Критические файлы

### Frontend (35 new + 12 modifications)

**New Files (35):**
- apps/web/src/packages/components/loading/ (8 файлов)
  - Skeleton.tsx
  - ProjectCardSkeleton.tsx
  - TeamCardSkeleton.tsx
  - DashboardSkeleton.tsx
  - TableSkeleton.tsx
  - ListSkeleton.tsx
  - FormSkeleton.tsx
  - index.ts
- apps/web/src/packages/components/empty-states/ (4 файла)
  - EmptyState.tsx
  - messages.ts
  - illustrations/ (optional SVGs)
  - index.ts
- apps/web/src/packages/components/pwa/ (2 файла)
  - InstallPrompt.tsx
  - index.ts
- apps/web/src/app/error.tsx
- apps/web/src/app/global-error.tsx
- apps/web/src/app/offline/page.tsx
- apps/web/src/packages/libs/apollo/error-link.ts
- apps/web/public/manifest.json
- apps/web/public/sw.js
- apps/web/public/icons/ (8 icon sizes)

**Modifications (12):**
- apps/web/src/app/(root)/(protected)/dashboard/page.tsx (skeletons, empty states)
- apps/web/src/app/(root)/(protected)/teams/page.tsx (skeletons, empty states)
- apps/web/src/app/(root)/(protected)/teams/[teamId]/page.tsx (skeletons, empty states)
- apps/web/src/app/(root)/(protected)/teams/[teamId]/projects/[projectId]/page.tsx (empty states for tabs)
- apps/web/src/app/layout.tsx (manifest link, InstallPrompt)
- apps/web/src/packages/components/index.ts (exports)
- apps/web/src/packages/libs/apollo/client.ts (add errorLink)

### Backend (5 new + 2 modifications)

**New Files (5):**
- apps/api/src/modules/telegram/ (5 файлов)
  - telegram.service.ts
  - telegram.module.ts
  - dto/send-notification.input.ts

**Modifications (2):**
- apps/api/prisma/schema.prisma (add telegramChatId to User)
- apps/api/src/app.module.ts (import TelegramModule)
- apps/api/.env (add TELEGRAM_BOT_TOKEN)

---

## Success Criteria

### Must Have (MVP)
- [ ] Skeleton loaders на всех основных страницах
- [ ] Empty states для всех пустых состояний
- [ ] Error boundaries (app-level + page-level)
- [ ] User-friendly error messages
- [ ] Apollo error handling с toast notifications
- [ ] Telegram bot создан и протестирован
- [ ] PWA manifest настроен
- [ ] Service worker работает (basic caching)
- [ ] Offline page создана
- [ ] Install prompt работает
- [ ] TypeScript: 0 ошибок
- [ ] Lighthouse: PWA score > 90

### Nice to Have (Phase 2)
- [ ] Иллюстрации для empty states
- [ ] Advanced service worker (sync, push)
- [ ] Telegram OAuth integration
- [ ] Push notifications (browser)
- [ ] Accessibility audit (Lighthouse)
- [ ] Keyboard shortcuts guide
- [ ] Onboarding tooltips
- [ ] Analytics events tracking

---

## Risks & Mitigation

### 🟡 Средний риск: PWA Installation на iOS

**Проблема:** iOS Safari ограничения для PWA
**Митигация:**
- Custom install instructions для iOS
- Fallback на web app
- Progressive enhancement подход

### 🟢 Низкий риск: Telegram Bot Limits

**Проблема:** Rate limits от Telegram API
**Митигация:**
- Queue system для notifications
- Batch notifications
- Graceful degradation (skip if fails)

---

## Технический долг

**Отложено на Phase 2:**
- [ ] Advanced offline sync
- [ ] Background sync API
- [ ] Push notifications (browser)
- [ ] Web Share API integration
- [ ] Advanced analytics
- [ ] Accessibility improvements (WCAG AA)
- [ ] Internationalization polish
- [ ] Dark mode refinements
- [ ] Haptic feedback (mobile)

---

## Документация

**Будет создано:**
- [ ] docs/analisys/stage-9-ux-polish-plan.md (этот файл)
- [ ] docs/ux/loading-states-guide.md
- [ ] docs/ux/error-handling-guide.md
- [ ] docs/pwa/installation-guide.md

**Будет обновлено:**
- [ ] docs/roadmap.md (mark Stage 9 complete)
- [ ] CHANGELOG.md (Stage 9 section)
- [ ] README.md (PWA info)

---

**Plan Created:** 2025-12-11
**Planned Start:** После завершения Stage 8
**Estimated Duration:** 7 дней (40-50 часов)
**Priority:** 🔴 Важный (перед запуском)
**Status:** 📋 Planning

---

_Детальный план готов к выполнению. Ожидает подтверждения для начала реализации._
