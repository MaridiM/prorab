# 🚀 Quick Start - ProRab v1.6.2

**Welcome!** Это быстрая инструкция для тестирования системы подписок.

---

## ⚡ 3 Simple Steps

### 1️⃣ Setup Database (одноразово)

```bash
# Запустить PostgreSQL
docker compose up -d postgres

# Подождать 10 секунд, затем:
cd apps/api
pnpm prisma:seed:providers
```

**✅ Ожидаемый результат:**

```
✅ Yookassa provider configured (Primary)
✅ Stripe provider configured (Secondary)
🎉 Payment providers are ready!
```

### 2️⃣ Start Application

**Терминал 1:**

```bash
cd apps/api
pnpm dev
```

**Терминал 2:**

```bash
cd apps/web
pnpm dev
```

### 3️⃣ Test Subscription Flow

1. Откройте браузер: `http://localhost:3000`
2. Войдите в систему
3. Перейдите в **Settings** → **Subscriptions**
4. Нажмите **"Выбрать план"** на любом плане

**✅ Что должно произойти:**

- Вы перенаправляетесь на URL: `http://localhost:3000/settings?mock=true&provider=stripe&amount=990`
- В консоли API видны логи:
  ```
  ⚠️  Stripe running in DEVELOPMENT mode - using mock implementation
  🧪 Stripe MOCK: Creating fake payment session for development
  ```
- Никаких ошибок в UI ❌

---

## 🎯 What This Tests

✅ **Plan Selection** - Кнопка "Выбрать план" работает
✅ **Team ID Resolution** - Система определяет команду пользователя
✅ **Geolocation** - Автовыбор провайдера по IP (Yookassa/Stripe)
✅ **Mock Mode** - Можно тестировать БЕЗ реальных платежных credentials
✅ **Database** - Создаются записи Subscription и Payment

---

## 🧪 Mock Mode (Development)

**Текущий режим:** Mock Mode (без реальных платежей)

- ✅ Не нужны Stripe/Yookassa API keys
- ✅ Полный UI flow работает
- ✅ Редирект на mock URL с параметрами
- ✅ Безопасно для тестирования

**Для продакшена:** Добавьте credentials в `apps/api/.env`:

```env
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# OR

YOOKASSA_SHOP_ID=123456
YOOKASSA_SECRET_KEY=live_...
```

---

## 📚 Full Documentation

- **[TESTING_v1.6.2.md](TESTING_v1.6.2.md)** - Полное руководство по тестированию
- **[V1.6.2_COMPLETION_SUMMARY.md](V1.6.2_COMPLETION_SUMMARY.md)** - Что было сделано
- **[QUICK_FIX.md](QUICK_FIX.md)** - Ручные фиксы если что-то пошло не так
- **[VERSION.md](VERSION.md)** - История версий

---

## 🐛 Problems?

### "Не удалось определить команду"

→ Создайте команду: **Teams** → **"Создать команду"**

### "ECONNREFUSED" database error

→ Запустите PostgreSQL:

```bash
docker compose up -d postgres
```

### "Subscription already exists"

→ Очистите дубликаты:

```bash
cd apps/api
psql -h localhost -p 54320 -U prorab -d prorab -f prisma/cleanup-duplicate-subscriptions.sql
```

Password: `prorab`

---

## ✅ Success Checklist

После выполнения шагов выше:

- [ ] PostgreSQL запущен
- [ ] PaymentProvider записи созданы (2 штуки)
- [ ] API запущен на `http://localhost:4000`
- [ ] Web запущен на `http://localhost:3000`
- [ ] Кнопка "Выбрать план" работает
- [ ] Редирект на mock URL происходит
- [ ] Логи показывают mock mode

---

**Status:** ✅ Ready to Test
**Version:** v1.6.2
**Mode:** Development (Mock Payments)

---

*Need help? Check [TESTING_v1.6.2.md](TESTING_v1.6.2.md) for detailed instructions*
