# Быстрое исправление v1.6.2

## Проблема
- "Stripe provider not configured"
- "Subscription already exists"

## Решение

### ⚠️ Сначала запустите базу данных

```bash
# Запустите Docker Desktop, затем выполните:
docker compose up -d postgres

# Подождите 5-10 секунд, чтобы база данных запустилась
```

### Вариант 1: Через pnpm seed (Самый простой)

```bash
cd apps/api
pnpm prisma:seed:providers
```

Этот скрипт автоматически:

- ✅ Создаст или обновит Yookassa (Primary)
- ✅ Создаст или обновит Stripe (Secondary)
- ✅ Покажет статус провайдеров

### Вариант 2: Через SQL файлы

Если у вас установлен `psql`, выполните готовые SQL скрипты:

```bash
# Настройка провайдеров
psql -h localhost -p 54320 -U prorab -d prorab -f apps/api/prisma/setup-payment-providers.sql

# Очистка дубликатов подписок
psql -h localhost -p 54320 -U prorab -d prorab -f apps/api/prisma/cleanup-duplicate-subscriptions.sql
```

Пароль: `prorab`

### Вариант 3: Через SQL напрямую

```bash
# Подключитесь к базе данных
psql -h localhost -p 54320 -U prorab -d prorab

# Выполните:
INSERT INTO "PaymentProvider" (id, type, name, "isActive", "isPrimary", "createdAt", "updatedAt")
VALUES
  (gen_random_uuid(), 'YOOKASSA', 'ЮKassa', true, true, NOW(), NOW()),
  (gen_random_uuid(), 'STRIPE', 'Stripe', true, false, NOW(), NOW())
ON CONFLICT (type) DO UPDATE SET "isActive" = true;

# Удалить дубликат подписки:
DELETE FROM "Subscription"
WHERE status = 'TRIALING'
  AND "createdAt" > NOW() - INTERVAL '1 hour'
  AND id NOT IN (SELECT DISTINCT "subscriptionId" FROM "Payment" WHERE status = 'SUCCEEDED');
```

### Вариант 4: Через Prisma Studio

1. Откройте Prisma Studio:
   ```bash
   cd apps/api
   pnpm prisma studio
   ```

2. Откройте таблицу `PaymentProvider`

3. Добавьте 2 записи:
   - **Yookassa:**
     - type: `YOOKASSA`
     - name: `ЮKassa`
     - isActive: `true`
     - isPrimary: `true`

   - **Stripe:**
     - type: `STRIPE`
     - name: `Stripe`
     - isActive: `true`
     - isPrimary: `false`

4. Откройте таблицу `Subscription`

5. Найдите подписку со status `TRIALING` созданную недавно

6. Удалите её

### Вариант 5: Через очистку дубликатов подписок

Если у вас остались дублирующиеся подписки после настройки провайдеров:

```bash
cd apps/api
psql -h localhost -p 54320 -U prorab -d prorab -f prisma/cleanup-duplicate-subscriptions.sql
```

Или вручную в Prisma Studio:

1. Откройте таблицу `Subscription`
2. Найдите подписки со status `TRIALING` без связанных успешных платежей
3. Удалите дублирующиеся записи

## После исправления

1. ✅ Обновите страницу
2. ✅ Нажмите "Выбрать план" снова
3. ✅ Должно работать!

## Проверка

```sql
-- Должно вернуть 2 провайдера:
SELECT * FROM "PaymentProvider";

-- Не должно быть дублей:
SELECT COUNT(*) FROM "Subscription" WHERE status = 'TRIALING';
```
