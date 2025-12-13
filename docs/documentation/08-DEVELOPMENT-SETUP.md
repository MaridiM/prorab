# DEVELOPMENT SETUP - ProRab.space

**Версия:** 1.0
**Дата:** 2025-12-13

---

## ОГЛАВЛЕНИЕ

1. [Быстрый старт](#быстрый-старт)
2. [Требования](#требования)
3. [Установка зависимостей](#установка-зависимостей)
4. [Настройка окружения](#настройка-окружения)
5. [Запуск приложения](#запуск-приложения)
6. [Работа с БД](#работа-с-бд)
7. [GraphQL Development](#graphql-development)
8. [Troubleshooting](#troubleshooting)

---

## БЫСТРЫЙ СТАРТ

```bash
# 1. Clone repository
git clone https://github.com/your-org/prorab-v1.git
cd prorab-v1

# 2. Install dependencies
pnpm install

# 3. Setup database
cd apps/api
cp .env.example .env
# Edit .env with your credentials

# 4. Run migrations
npx prisma migrate dev
npx prisma generate

# 5. Start dev servers
cd ../..
pnpm dev
```

**Access:**
- Frontend: http://localhost:3000
- Backend: http://localhost:8080
- GraphQL Playground: http://localhost:8080/graphql

---

## ТРЕБОВАНИЯ

### Обязательно

- **Node.js**: 24.x или выше
- **pnpm**: 10.24.0 или выше
- **PostgreSQL**: 17.x
- **Redis**: 7.x
- **Git**: Latest

### Опционально

- **Docker**: Для контейнеризации
- **ngrok**: Для тестирования webhooks
- **Postman**: Для тестирования API

---

## УСТАНОВКА ЗАВИСИМОСТЕЙ

### 1. Node.js 24

**Windows:**
- Скачать с [nodejs.org](https://nodejs.org/)
- Или через nvm: `nvm install 24`

**macOS:**
```bash
brew install node@24
```

**Linux (Ubuntu/Debian):**
```bash
curl -fsSL https://deb.nodesource.com/setup_24.x | sudo -E bash -
sudo apt install -y nodejs
```

**Проверка:**
```bash
node --version  # v24.x.x
```

---

### 2. pnpm

```bash
# Install via npm
npm install -g pnpm@10.24.0

# Verify
pnpm --version  # 10.24.0
```

---

### 3. PostgreSQL 17

**Windows:**
- Скачать с [postgresql.org](https://www.postgresql.org/download/windows/)

**macOS:**
```bash
brew install postgresql@17
brew services start postgresql@17
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt install postgresql-17 postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

**Создание БД:**
```bash
sudo -u postgres psql

CREATE DATABASE prorab;
CREATE USER prorab WITH PASSWORD 'prorab';
GRANT ALL PRIVILEGES ON DATABASE prorab TO prorab;
\q
```

---

### 4. Redis

**Windows:**
- Использовать WSL или Docker

**macOS:**
```bash
brew install redis
brew services start redis
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt install redis-server
sudo systemctl start redis
sudo systemctl enable redis
```

**Проверка:**
```bash
redis-cli ping  # PONG
```

---

## НАСТРОЙКА ОКРУЖЕНИЯ

### 1. Backend Environment Variables

**Файл:** `apps/api/.env`

```env
# Server
NODE_ENV=development
PORT=8080

# Database
DATABASE_URL="postgresql://prorab:prorab@localhost:5432/prorab"

# Redis
REDIS_URL="redis://localhost:6379"

# Session & Auth
SESSION_SECRET="dev-session-secret-change-in-production"
COOKIES_SECRET="dev-cookies-secret-change-in-production"
AUTH_SESSION_TTL=1800000
AUTH_REFRESH_TOKEN_TTL=604800000

# Encryption (2FA)
# Generate: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
ENCRYPTION_KEY="your-64-char-hex-string"

# Email (Brevo) - Optional for dev
BREVO_API_KEY="your-brevo-api-key"
MAIL_FROM_EMAIL="dev@prorab.space"

# Telegram - Optional for dev
TELEGRAM_BOT_TOKEN="your-bot-token"
TELEGRAM_SUPPORT_BOT_TOKEN="your-support-bot-token"
TELEGRAM_SUPPORT_CHAT_ID="your-chat-id"

# YooKassa - Optional for dev
YOOKASSA_SHOP_ID="your-shop-id"
YOOKASSA_SECRET_KEY="your-secret-key"
YOOKASSA_WEBHOOK_SECRET="your-webhook-secret"

# AWS S3 - Optional for dev (use local storage)
AWS_REGION="us-east-1"
AWS_ACCESS_KEY_ID="your-access-key"
AWS_SECRET_ACCESS_KEY="your-secret-key"
AWS_S3_BUCKET="prorab-storage-dev"

# Frontend URL
FRONTEND_URL="http://localhost:3000"
```

**Генерация секретов:**

```bash
# Encryption key
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Session secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

### 2. Frontend Environment Variables

**Файл:** `apps/web/.env.local`

```env
# API URL
NEXT_PUBLIC_API_URL=http://localhost:8080/graphql
NEXT_PUBLIC_WS_URL=ws://localhost:8080/graphql

# Optional: Analytics
NEXT_PUBLIC_GA_ID=
```

---

## ЗАПУСК ПРИЛОЖЕНИЯ

### Вариант 1: Turbo (Recommended)

```bash
# Root directory
pnpm dev
```

**Запускает:**
- Backend на :8080
- Frontend на :3000

---

### Вариант 2: Раздельно

**Terminal 1 - Backend:**
```bash
cd apps/api
pnpm dev
```

**Terminal 2 - Frontend:**
```bash
cd apps/web
pnpm dev
```

---

### Вариант 3: Specific App

```bash
# Only backend
pnpm dev:api

# Only frontend
pnpm dev:web
```

---

## РАБОТА С БД

### Prisma Commands

**Генерация клиента:**
```bash
cd apps/api
npx prisma generate
```

**Создание миграции:**
```bash
npx prisma migrate dev --name migration_name
```

**Применение миграций:**
```bash
npx prisma migrate dev
```

**Сброс БД (DANGER!):**
```bash
npx prisma migrate reset
```

**Prisma Studio (GUI):**
```bash
npx prisma studio
# Opens on http://localhost:5555
```

---

### Seed Database

**Запуск seed:**
```bash
npx prisma db seed
```

**Что создается:**
- Тестовый пользователь (admin@prorab.space / Admin123!)
- Тестовая команда
- FAQ записи (20+)
- Системные настройки

**Seed файлы:**
- `apps/api/prisma/seed.ts` - Основной seed
- `apps/api/prisma/seed-faq.ts` - FAQ данные

---

### Database Migrations

**Workflow:**

1. Изменить `schema.prisma`
2. Создать миграцию: `npx prisma migrate dev --name your_change`
3. Prisma автоматически:
   - Создает SQL файл
   - Применяет миграцию
   - Генерирует клиент

**Пример миграции:**

```prisma
// Add new field
model User {
  // ... existing fields
  phoneVerified Boolean @default(false)  // NEW
}
```

```bash
npx prisma migrate dev --name add_phone_verified
```

---

## GRAPHQL DEVELOPMENT

### GraphQL Playground

**URL:** http://localhost:8080/graphql

**Включен только в dev режиме:**
```typescript
// apps/api/src/core/config/graphql.config.ts
playground: process.env.NODE_ENV === 'development',
```

---

### GraphQL Codegen (Frontend)

**Генерация TypeScript типов:**

```bash
cd apps/web
pnpm codegen
```

**Что генерируется:**
- TypeScript типы для всех queries/mutations
- Hooks для Apollo Client
- Fragment типы

**Файл:** `apps/web/src/packages/api/graphql/__generated__/output.ts`

**Config:** `apps/web/codegen.ts`

```typescript
import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  schema: 'http://localhost:8080/graphql',
  documents: ['src/packages/api/graphql/**/*.graphql'],
  generates: {
    './src/packages/api/graphql/__generated__/output.ts': {
      plugins: [
        'typescript',
        'typescript-operations',
        'typescript-react-apollo'
      ]
    }
  }
};

export default config;
```

---

### Написание GraphQL операций

**Создайте файл:** `apps/web/src/packages/api/graphql/your-feature.graphql`

```graphql
query GetProjects($teamId: ID!) {
  projectsList(teamId: $teamId) {
    id
    name
    description
    status
  }
}

mutation CreateProject($input: CreateProjectInput!) {
  createProject(input: $input) {
    id
    name
  }
}
```

**Запустите codegen:**
```bash
pnpm codegen
```

**Используйте в компоненте:**
```typescript
import { useGetProjectsQuery, useCreateProjectMutation } from '@/api/graphql/__generated__/output';

function ProjectList({ teamId }: { teamId: string }) {
  const { data, loading, error } = useGetProjectsQuery({
    variables: { teamId }
  });

  const [createProject] = useCreateProjectMutation();

  // ...
}
```

---

## TROUBLESHOOTING

### Проблема: "Port 3000 already in use"

**Решение:**
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# macOS/Linux
lsof -ti:3000 | xargs kill -9
```

---

### Проблема: Prisma client out of sync

**Решение:**
```bash
cd apps/api
npx prisma generate
```

---

### Проблема: Database connection error

**Проверка:**
```bash
# Test PostgreSQL connection
psql -U prorab -d prorab -h localhost

# Check if PostgreSQL is running
sudo systemctl status postgresql
```

---

### Проблема: Redis connection error

**Проверка:**
```bash
# Test Redis connection
redis-cli ping

# Check if Redis is running
sudo systemctl status redis
```

---

### Проблема: pnpm install fails

**Решение:**
```bash
# Clear cache
pnpm store prune

# Remove node_modules and lock file
rm -rf node_modules pnpm-lock.yaml

# Reinstall
pnpm install
```

---

### Проблема: GraphQL codegen не работает

**Решение:**
```bash
# Убедитесь что backend запущен
cd apps/api
pnpm dev

# В другом терминале
cd apps/web
pnpm codegen
```

---

## ПОЛЕЗНЫЕ КОМАНДЫ

### Package Management

```bash
# Install package to specific app
pnpm add <package> --filter @prorab/api
pnpm add <package> --filter @prorab/web

# Install dev dependency
pnpm add -D <package> --filter @prorab/api

# Remove package
pnpm remove <package> --filter @prorab/api

# Update all dependencies
pnpm update
```

---

### Build Commands

```bash
# Build all apps
pnpm build

# Build specific app
pnpm build --filter @prorab/api
pnpm build --filter @prorab/web

# Clean build artifacts
pnpm clean
```

---

### Testing

```bash
# Run tests (when implemented)
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:cov
```

---

### Linting & Formatting

```bash
# Lint code
pnpm lint

# Fix lint issues
pnpm lint:fix

# Format code
pnpm format
```

---

## DEVELOPMENT WORKFLOW

### 1. Работа с новой фичей

```bash
# 1. Создать ветку
git checkout -b feature/your-feature

# 2. Внести изменения

# 3. Backend: Обновить schema.prisma если нужно
cd apps/api
npx prisma migrate dev --name your_change

# 4. Backend: Обновить GraphQL schema
# Edit resolvers, services, DTOs

# 5. Frontend: Обновить GraphQL operations
# Edit .graphql files

# 6. Frontend: Сгенерировать типы
cd apps/web
pnpm codegen

# 7. Frontend: Обновить компоненты

# 8. Commit changes
git add .
git commit -m "feat: add your feature"

# 9. Push и создать PR
git push origin feature/your-feature
```

---

### 2. Hot Reload

**Backend (NestJS):**
- Использует `nodemon` + `ts-node`
- Auto-restart при изменениях

**Frontend (Next.js):**
- Fast Refresh
- Instant HMR

---

### 3. Debugging

**VS Code launch.json:**

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Backend",
      "runtimeExecutable": "pnpm",
      "runtimeArgs": ["dev"],
      "cwd": "${workspaceFolder}/apps/api",
      "console": "integratedTerminal"
    },
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Frontend",
      "runtimeExecutable": "pnpm",
      "runtimeArgs": ["dev"],
      "cwd": "${workspaceFolder}/apps/web",
      "console": "integratedTerminal"
    }
  ]
}
```

---

## РЕКОМЕНДУЕМЫЕ РАСШИРЕНИЯ VS CODE

```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "prisma.prisma",
    "graphql.vscode-graphql",
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-typescript-next"
  ]
}
```

---

## ЗАКЛЮЧЕНИЕ

Development setup для ProRab.space включает:

- ✅ Node.js 24 + pnpm 10
- ✅ PostgreSQL 17 + Redis 7
- ✅ Prisma ORM + migrations
- ✅ GraphQL Codegen
- ✅ Hot reload (backend + frontend)
- ✅ TypeScript type safety

**Время setup:** ~15 минут
**Первый запуск:** ~2 минуты (pnpm install)
