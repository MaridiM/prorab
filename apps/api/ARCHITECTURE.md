# Архитектура API

Этот документ описывает текущую архитектуру `apps/api` и план миграции к шаблону из `docs/templates/architecture.backend.md`.

## Текущая структура

```
apps/api/src/
├── app.module.ts          # Главный модуль приложения
├── app.resolver.ts        # GraphQL резолвер приложения
├── main.ts                # Bootstrap приложения
├── core/                  # Инфраструктурные модули
│   ├── core.module.ts     # Собирает инфраструктурные модули
│   ├── core.service.ts    # Базовый сервис с Prisma/Redis/Config
│   ├── config/            # Конфигурации (app, graphql)
│   │   ├── app.config.ts
│   │   └── graphql.config.ts
│   ├── mail/              # Модуль почты
│   │   ├── mail.module.ts
│   │   └── mail.service.ts
│   ├── prisma/            # PrismaService и модуль
│   │   ├── prisma.module.ts
│   │   └── prisma.service.ts
│   └── redis/             # RedisService и модуль
│       ├── redis.module.ts
│       └── redis.service.ts
├── modules/               # Бизнес-модули
│   ├── auth/              # Модуль аутентификации
│   │   ├── auth.module.ts
│   │   ├── auth.resolver.ts
│   │   ├── auth.service.ts
│   │   ├── decorators/     # ⚠️ Дубликаты (не используются, можно удалить)
│   │   ├── dto/
│   │   ├── guards/        # ⚠️ Дубликаты (не используются, можно удалить)
│   │   └── models/
│   ├── users/              # Модуль пользователей
│   │   ├── users.module.ts
│   │   ├── users.resolver.ts
│   │   ├── users.service.ts
│   │   └── models/
│   └── projects/          # Модуль проектов
│       ├── projects.module.ts
│       ├── projects.resolver.ts
│       ├── projects.service.ts
│       ├── dto/
│       └── models/
└── shared/                # Переиспользуемые элементы
    ├── decorators/        # @CurrentUser, @Public, @UserAgent, @ClientIp и др.
    │   ├── current-user.decorator.ts
    │   ├── public.decorator.ts
    │   └── index.ts
    ├── guards/            # AuthGuard
    │   ├── auth.guard.ts
    │   └── index.ts
    ├── pipes/             # Готово для будущих pipes
    └── utils/             # Готово для будущих утилит
```

## Целевая структура (по шаблону)

```
apps/api/src/
├── main.ts
├── app.module.ts
├── core/
│   ├── core.module.ts     # Собирает все инфраструктурные модули
│   ├── core.service.ts    # Базовый сервис с Prisma/Redis/Config/i18n ✅
│   ├── config/            # Конфигурации (GraphQL, Helmet, session, mailer, app, i18n) ✅ (частично)
│   ├── i18n/              # i18n сервис, декораторы, typed-ключи (TODO)
│   ├── prisma/            # PrismaService, модуль, seed ✅
│   ├── redis/             # RedisService ✅
│   ├── mail/              # Модуль почты ✅ (перемещен в core)
│   ├── provider/          # Модули почты (React Email + Brevo/SendGrid/SMTP) и SMS (TODO)
│   └── middleware/        # GraphQL logger (TODO)
├── shared/                # Переиспользуемые элементы ✅
│   ├── decorators/        # @CurrentUser, @Public, @UserAgent, @Lang и др. ✅
│   ├── guards/            # AuthGuard ✅, RateLimitGuard (TODO)
│   ├── pipes/             # Валидация файлов (TODO)
│   ├── middlewares/       # Raw body (TODO)
│   └── utils/             # hash/token/ms/session metadata/errors/url (TODO)
└── modules/               # Бизнес-модули ✅
    ├── auth/              ✅
    ├── users/              ✅
    └── projects/           ✅
```

## Выполненные изменения

✅ **Структура директорий:**
- Создана структура `src/shared/` с поддиректориями
- Создана структура `src/modules/` для бизнес-модулей
- Бизнес-модули перемещены в `src/modules/` (auth, users, projects)
- MailModule перемещен в `src/core/mail/`

✅ **CoreService:**
- Создан базовый сервис с доступом к Prisma/Redis/Config
- Добавлены helper методы для работы с Redis (строки, JSON, sets, rate limiting)

✅ **Переиспользуемые элементы:**
- Декораторы перемещены в `shared/decorators/`
- Guards перемещены в `shared/guards/`
- Все модули используют декораторы и guards из `shared/`

✅ **Импорты:**
- Обновлены импорты в `app.module.ts`
- Обновлены импорты в резолверах (auth, users)
- `AuthGuard` используется глобально через `APP_GUARD`

## Текущее состояние

### ✅ Реализовано

1. **Структура проекта:**
   - Модули организованы по слоям (core, modules, shared)
   - Бизнес-логика отделена от инфраструктуры

2. **CoreService:**
   - Базовый сервис для наследования
   - Типизированный доступ к Prisma, Redis, Config
   - Helper методы для работы с Redis

3. **Shared элементы:**
   - Декораторы: `@CurrentUser`, `@Public`, `@UserAgent`, `@ClientIp`, `@SessionToken`, `@RefreshToken`
   - Guards: `AuthGuard` (глобальный)

4. **Инфраструктура:**
   - PrismaService с PostgreSQL
   - RedisService с полным набором операций
   - MailService в core
   - ConfigModule с типизированной конфигурацией

### ⚠️ Требует внимания

1. **Дубликаты в модуле auth:**
   - `modules/auth/decorators/` и `modules/auth/guards/` не используются
   - Все импорты идут из `shared/`
   - Рекомендуется удалить дубликаты

2. **Дубликаты в модуле auth:**
   - `modules/auth/decorators/` и `modules/auth/guards/` не используются
   - Все импорты идут из `shared/`
   - Рекомендуется удалить дубликаты для чистоты кодовой базы

### 📋 План миграции

#### Этап 1: Очистка (в процессе)
- [x] Переместить бизнес-модули в `src/modules/`
- [x] Переместить MailModule в `src/core/mail/`
- [x] Обновить импорт в `app.resolver.ts`
- [ ] Удалить дубликаты декораторов и guards из `modules/auth/`

#### Этап 2: Инфраструктура (TODO)
- [ ] Добавить i18n модуль (`core/i18n/`)
  - Сервис, декораторы (`@Lang`), typed-ключи переводов
  - Инициализация в `main.ts`
  - I18nValidationPipe для локализованных сообщений
- [ ] Добавить ProviderModule для почты/SMS (`core/provider/`)
  - React Email шаблоны
  - Провайдеры Brevo/SendGrid/SMTP
  - SMS через Twilio
- [ ] Добавить ScheduleModule в CoreModule
- [ ] Добавить GraphQL logger middleware (`core/middleware/`)
- [ ] Добавить сессии на Redis в `main.ts` (express-session + connect-redis)
- [ ] Добавить i18n middleware в `main.ts`

#### Этап 3: Безопасность (TODO)
- [ ] Создать SecurityModule
- [ ] Создать RateLimitGuard (Redis sliding window)
- [ ] Создать AccountLockService (блокировка аккаунтов)
- [ ] Создать SecurityEventModule (аудит действий)

#### Этап 4: Уведомления (TODO)
- [ ] Создать NotificationModule
- [ ] Интегрировать с Mail/SMS провайдерами
- [ ] Дедупликация в Redis
- [ ] Трекинг отправок

#### Этап 5: RBAC (TODO)
- [ ] Создать RbacModule
- [ ] Добавить декораторы и guards для ролей/прав

## Использование CoreService

Сервисы могут наследоваться от `CoreService` для получения типизированного доступа к инфраструктуре:

```typescript
import { Injectable } from '@nestjs/common'
import { CoreService } from '../core/core.service'

@Injectable()
export class MyService extends CoreService {
  async myMethod() {
    // Доступ к Prisma
    const users = await this.prisma.user.findMany()
    
    // Доступ к Redis
    await this.redis.set('key', 'value', 1000)
    const value = await this.redis.get('key')
    
    // Доступ к Config
    const port = this.config.get<number>('port')
    
    // Redis helpers
    await this.redisSetJson('session:token', { userId: '123' }, 3600000)
    const session = await this.redisGetJson<{ userId: string }>('session:token')
    
    // Rate limiting
    const count = await this.redisIncrementRateLimit('action:user', 60000)
  }
}
```

## Поток запроса (текущий)

1. Express middleware цепочка из `main.ts`:
   - Helmet (security headers) ✅
   - Cookie parser ✅
   - GraphQL upload ✅
   - Глобальный ValidationPipe ✅
   - CORS ✅

2. Nest → `AuthGuard` (глобальный через `APP_GUARD`) ✅

3. GraphQL слой:
   - Резолвер → сервис → инфраструктура (Prisma, Redis, Mail) → клиент ✅

## Примечания

- ✅ Модули перемещены в `src/modules/` согласно шаблону
- ✅ MailModule перемещен в `src/core/mail/` как инфраструктурный модуль
- ⚠️ В `modules/auth/` остались неиспользуемые дубликаты декораторов и guards
- 📝 i18n и другие инфраструктурные модули будут добавлены постепенно
- 📝 Сессии на Redis пока не интегрированы в `main.ts` (используются напрямую через RedisService)
