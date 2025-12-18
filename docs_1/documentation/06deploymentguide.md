# DEPLOYMENT GUIDE - ProRab.space

**Версия:** 1.0
**Дата:** 2025-12-13

---

## ОГЛАВЛЕНИЕ

1. [Обзор развертывания](#обзор-развертывания)
2. [Системные требования](#системные-требования)
3. [Local Development](#local-development)
4. [Production Deployment](#production-deployment)
5. [Docker Setup](#docker-setup)
6. [Environment Variables](#environment-variables)
7. [Database Migration](#database-migration)
8. [Monitoring & Logging](#monitoring--logging)

---

## ОБЗОР РАЗВЕРТЫВАНИЯ

ProRab.space - это монорепозиторий с двумя основными приложениями:
- **API** (NestJS + GraphQL) → Backend
- **Web** (Next.js 16) → Frontend

**Рекомендуемая архитектура:**
```
┌─────────────┐
│   Nginx     │ → Reverse Proxy (SSL termination)
└──────┬──────┘
       │
       ├─────> Frontend (Next.js :3000)
       │       └─> Static files
       │
       ├─────> Backend (NestJS :8080)
       │       └─> GraphQL API
       │
       └─────> PostgreSQL (:5432)
               Redis (:6379)
```

---

## СИСТЕМНЫЕ ТРЕБОВАНИЯ

### Минимальные требования

**Server:**
- CPU: 2 cores
- RAM: 4 GB
- Storage: 20 GB SSD
- OS: Ubuntu 22.04 LTS / Debian 12

**Software:**
- Node.js: 24.x
- pnpm: 10.24.0
- PostgreSQL: 17.x
- Redis: 7.x
- Nginx: 1.24+

### Рекомендуемые требования (Production)

**Server:**
- CPU: 4 cores
- RAM: 8 GB
- Storage: 50 GB SSD
- OS: Ubuntu 22.04 LTS

**Additional:**
- SSL Certificate (Let's Encrypt)
- CDN для static файлов
- Backup система
- Monitoring (Prometheus + Grafana)

---

## LOCAL DEVELOPMENT

### 1. Установка зависимостей

```bash
# Clone repository
git clone https://github.com/your-org/prorab-v1.git
cd prorab-v1

# Install dependencies
pnpm install
```

### 2. Настройка БД

**PostgreSQL:**

```bash
# Install PostgreSQL
sudo apt install postgresql postgresql-contrib

# Create database
sudo -u postgres psql
CREATE DATABASE prorab;
CREATE USER prorab WITH PASSWORD 'prorab';
GRANT ALL PRIVILEGES ON DATABASE prorab TO prorab;
\q
```

**Redis:**

```bash
# Install Redis
sudo apt install redis-server

# Start Redis
sudo systemctl start redis
sudo systemctl enable redis
```

### 3. Environment Variables

**Backend (.env):**

```env
# apps/api/.env
PORT=8080

# Database
DATABASE_URL="postgresql://prorab:prorab@localhost:5432/prorab"

# Redis
REDIS_URL="redis://localhost:6379"

# Session
SESSION_SECRET="your-secret-key-here"
COOKIES_SECRET="your-cookies-secret"

# JWT
AUTH_SESSION_TTL=1800000
AUTH_REFRESH_TOKEN_TTL=604800000

# Encryption (2FA)
ENCRYPTION_KEY="generate-with-node-crypto"

# Email (Brevo)
BREVO_API_KEY="your-brevo-api-key"
MAIL_FROM_EMAIL="noreply@prorab.space"

# Telegram
TELEGRAM_BOT_TOKEN="your-bot-token"
TELEGRAM_SUPPORT_BOT_TOKEN="your-support-bot-token"
TELEGRAM_SUPPORT_CHAT_ID="your-chat-id"

# YooKassa
YOOKASSA_SHOP_ID="your-shop-id"
YOOKASSA_SECRET_KEY="your-secret-key"
YOOKASSA_WEBHOOK_SECRET="your-webhook-secret"

# AWS S3
AWS_REGION="us-east-1"
AWS_ACCESS_KEY_ID="your-access-key"
AWS_SECRET_ACCESS_KEY="your-secret-key"
AWS_S3_BUCKET="prorab-storage"

# Frontend URL
FRONTEND_URL="http://localhost:3000"
```

**Frontend (.env.local):**

```env
# apps/web/.env.local
NEXT_PUBLIC_API_URL=http://localhost:8080/graphql
NEXT_PUBLIC_WS_URL=ws://localhost:8080/graphql
```

### 4. Database Migration

```bash
cd apps/api

# Run migrations
npx prisma migrate dev

# Generate Prisma client
npx prisma generate

# Seed database
npx prisma db seed
```

### 5. Генерация ключей

```bash
# Encryption key (64-char hex)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Session secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 6. Запуск приложения

**Вариант 1: Turbo (оба приложения):**

```bash
pnpm dev
```

**Вариант 2: Раздельно:**

```bash
# Terminal 1: Backend
cd apps/api
pnpm dev

# Terminal 2: Frontend
cd apps/web
pnpm dev
```

**Доступ:**
- Frontend: http://localhost:3000
- Backend: http://localhost:8080
- GraphQL Playground: http://localhost:8080/graphql

---

## PRODUCTION DEPLOYMENT

### Вариант 1: Traditional (без Docker)

#### 1. Подготовка сервера

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 24
curl -fsSL https://deb.nodesource.com/setup_24.x | sudo -E bash -
sudo apt install -y nodejs

# Install pnpm
npm install -g pnpm

# Install PostgreSQL 17
sudo apt install -y postgresql-17

# Install Redis
sudo apt install -y redis-server

# Install Nginx
sudo apt install -y nginx

# Install PM2
npm install -g pm2
```

#### 2. Clone и build

```bash
# Clone repository
cd /var/www
git clone https://github.com/your-org/prorab-v1.git
cd prorab-v1

# Install dependencies
pnpm install

# Build apps
pnpm build
```

#### 3. Database setup

```bash
cd apps/api

# Run migrations
npx prisma migrate deploy

# Generate client
npx prisma generate

# Seed (optional)
npx prisma db seed
```

#### 4. PM2 Configuration

**ecosystem.config.js:**

```javascript
module.exports = {
  apps: [
    {
      name: 'prorab-api',
      cwd: './apps/api',
      script: 'dist/main.js',
      instances: 2,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 8080
      }
    },
    {
      name: 'prorab-web',
      cwd: './apps/web',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 3000',
      instances: 2,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production'
      }
    }
  ]
};
```

**Запуск:**

```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

#### 5. Nginx Configuration

```nginx
# /etc/nginx/sites-available/prorab

# Frontend
server {
    listen 80;
    server_name prorab.space www.prorab.space;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# Backend API
server {
    listen 80;
    server_name api.prorab.space;

    location / {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # GraphQL WebSocket
    location /graphql {
        proxy_pass http://localhost:8080/graphql;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

**Активация:**

```bash
sudo ln -s /etc/nginx/sites-available/prorab /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### 6. SSL Setup (Let's Encrypt)

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Get certificates
sudo certbot --nginx -d prorab.space -d www.prorab.space
sudo certbot --nginx -d api.prorab.space

# Auto-renewal
sudo systemctl enable certbot.timer
```

---

### Вариант 2: Docker Deployment

#### 1. Docker Files

**Backend Dockerfile:**

```dockerfile
# apps/api/Dockerfile
FROM node:24-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./
COPY apps/api/package.json ./apps/api/

# Install dependencies
RUN npm install -g pnpm
RUN pnpm install --frozen-lockfile

# Copy source
COPY apps/api ./apps/api
COPY turbo.json ./

# Generate Prisma
WORKDIR /app/apps/api
RUN npx prisma generate

# Build
RUN pnpm build

# Production image
FROM node:24-alpine

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy built files
COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/apps/api/node_modules ./node_modules
COPY --from=builder /app/apps/api/prisma ./prisma
COPY --from=builder /app/apps/api/package.json ./

EXPOSE 8080

CMD ["node", "dist/main.js"]
```

**Frontend Dockerfile:**

```dockerfile
# apps/web/Dockerfile
FROM node:24-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./
COPY apps/web/package.json ./apps/web/

# Install dependencies
RUN npm install -g pnpm
RUN pnpm install --frozen-lockfile

# Copy source
COPY apps/web ./apps/web
COPY turbo.json ./

# Build
WORKDIR /app/apps/web
RUN pnpm build

# Production image
FROM node:24-alpine

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy built files
COPY --from=builder /app/apps/web/.next ./.next
COPY --from=builder /app/apps/web/node_modules ./node_modules
COPY --from=builder /app/apps/web/package.json ./
COPY --from=builder /app/apps/web/public ./public

EXPOSE 3000

CMD ["pnpm", "start"]
```

#### 2. Docker Compose

```yaml
# docker-compose.yml
version: '3.8'

services:
  postgres:
    image: postgres:17-alpine
    container_name: prorab-postgres
    environment:
      POSTGRES_USER: prorab
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: prorab
    volumes:
      - postgres-data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    container_name: prorab-redis
    ports:
      - "6379:6379"
    volumes:
      - redis-data:/data
    restart: unless-stopped

  api:
    build:
      context: .
      dockerfile: apps/api/Dockerfile
    container_name: prorab-api
    depends_on:
      - postgres
      - redis
    environment:
      NODE_ENV: production
      DATABASE_URL: postgresql://prorab:${POSTGRES_PASSWORD}@postgres:5432/prorab
      REDIS_URL: redis://redis:6379
    env_file:
      - apps/api/.env.production
    ports:
      - "8080:8080"
    restart: unless-stopped

  web:
    build:
      context: .
      dockerfile: apps/web/Dockerfile
    container_name: prorab-web
    depends_on:
      - api
    environment:
      NODE_ENV: production
      NEXT_PUBLIC_API_URL: https://api.prorab.space/graphql
    ports:
      - "3000:3000"
    restart: unless-stopped

volumes:
  postgres-data:
  redis-data:
```

#### 3. Запуск Docker

```bash
# Build images
docker-compose build

# Run migrations
docker-compose run api npx prisma migrate deploy

# Start services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

---

## ENVIRONMENT VARIABLES

### Production Environment Variables

**Critical секреты:**
- `DATABASE_URL` - Connection string к PostgreSQL
- `REDIS_URL` - Connection string к Redis
- `SESSION_SECRET` - Секрет для сессий (64-char hex)
- `ENCRYPTION_KEY` - Ключ для 2FA (64-char hex)
- `YOOKASSA_SECRET_KEY` - API ключ YooKassa
- `BREVO_API_KEY` - API ключ Brevo
- `AWS_SECRET_ACCESS_KEY` - AWS секрет

**Best Practices:**
1. Использовать environment variables (не хардкодить)
2. Хранить секреты в защищенном хранилище (AWS Secrets Manager, Vault)
3. Ротация секретов каждые 90 дней
4. Разные секреты для dev/staging/production

---

## DATABASE MIGRATION

### Development

```bash
# Create migration
npx prisma migrate dev --name migration_name

# Apply migration
npx prisma migrate dev

# Reset database (DANGER!)
npx prisma migrate reset
```

### Production

```bash
# Apply migrations (non-interactive)
npx prisma migrate deploy

# Check migration status
npx prisma migrate status

# Rollback (manual)
# Edit migration files or create new migration
```

### Backup & Restore

```bash
# Backup
pg_dump -U prorab -h localhost prorab > backup.sql

# Restore
psql -U prorab -h localhost prorab < backup.sql

# Automated backups (cron)
0 2 * * * pg_dump -U prorab prorab > /backups/prorab_$(date +\%Y\%m\%d).sql
```

---

## MONITORING & LOGGING

### PM2 Monitoring

```bash
# Monitor processes
pm2 monit

# View logs
pm2 logs

# View metrics
pm2 describe prorab-api
```

### Application Logging

**Winston logger (Backend):**

```typescript
import { Logger } from '@nestjs/common';

const logger = new Logger('AppName');

logger.log('Info message');
logger.error('Error message');
logger.warn('Warning message');
logger.debug('Debug message');
```

**Log files:**
- `/var/log/pm2/prorab-api-error.log`
- `/var/log/pm2/prorab-api-out.log`

### Health Checks

**Backend health endpoint:**

```typescript
@Get('/health')
healthCheck() {
  return {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  };
}
```

**Monitoring tools:**
- PM2 Plus (monitoring dashboard)
- Prometheus + Grafana
- Sentry (error tracking)
- New Relic / DataDog

---

## CHECKLIST ПЕРЕД PRODUCTION

### Security

- [ ] Все секреты в environment variables
- [ ] SSL сертификаты установлены
- [ ] CORS настроен корректно
- [ ] Rate limiting включен
- [ ] Helmet.js для безопасности headers
- [ ] 2FA обязателен для админов
- [ ] Webhook signature verification активна

### Performance

- [ ] Database индексы оптимизированы
- [ ] Redis кеш настроен
- [ ] CDN для static файлов
- [ ] Gzip compression включен
- [ ] Image optimization
- [ ] Lazy loading компонентов

### Monitoring

- [ ] Health checks настроены
- [ ] Logging включен
- [ ] Error tracking (Sentry)
- [ ] Uptime monitoring
- [ ] Backup система активна

### Infrastructure

- [ ] Firewall настроен
- [ ] Backup database ежедневно
- [ ] PM2 auto-restart
- [ ] Nginx gzip enabled
- [ ] Let's Encrypt auto-renewal

---

## ЗАКЛЮЧЕНИЕ

ProRab.space готов к production deployment с использованием:
- ✅ PM2 для process management
- ✅ Nginx как reverse proxy
- ✅ PostgreSQL 17 для данных
- ✅ Redis для сессий
- ✅ Let's Encrypt для SSL
- ✅ Docker для контейнеризации (опционально)

**Рекомендуемая инфраструктура:**
- VPS (Digital Ocean / AWS EC2 / Hetzner)
- 4 CPU / 8GB RAM
- 50GB SSD
- Ubuntu 22.04 LTS
- Automated backups
- Monitoring & alerting
