# 🚀 Настройка Stripe Webhooks с ngrok

**Версия:** 1.0  
**Дата:** 2025-12-28  
**Для проекта:** ProRab Space

---

## 📋 Что нужно

- Stripe Secret Key (уже есть)
- Stripe Webhook Secret (уже есть)
- Базовый Webhook URL
- ngrok (для локальной разработки)

---

## 🔧 Шаг 1: Установка ngrok

### Windows

1. Скачайте ngrok с [https://ngrok.com/download](https://ngrok.com/download)
2. Распакуйте `ngrok.exe` в удобную папку (например, `C:\ngrok\`)
3. Добавьте путь в PATH или используйте полный путь

### macOS / Linux

```bash
# macOS (Homebrew)
brew install ngrok

# Linux
# Скачайте с https://ngrok.com/download и распакуйте
```

### Регистрация (опционально, но рекомендуется)

1. Зарегистрируйтесь на [https://dashboard.ngrok.com/signup](https://dashboard.ngrok.com/signup)
2. Получите authtoken из [https://dashboard.ngrok.com/get-started/your-authtoken](https://dashboard.ngrok.com/get-started/your-authtoken)
3. Выполните:
   ```bash
   ngrok config add-authtoken YOUR_AUTH_TOKEN
   ```

---

## 🚀 Шаг 2: Запуск ngrok

### Вариант 1: Использование скрипта (рекомендуется)

Создайте файл `scripts/start-ngrok.ps1` (Windows) или `scripts/start-ngrok.sh` (macOS/Linux):

**Windows (PowerShell):**
```powershell
# scripts/start-ngrok.ps1
$API_PORT = 8080
Write-Host "🚀 Starting ngrok tunnel on port $API_PORT..." -ForegroundColor Green
ngrok http $API_PORT
```

**macOS/Linux:**
```bash
#!/bin/bash
# scripts/start-ngrok.sh
API_PORT=8080
echo "🚀 Starting ngrok tunnel on port $API_PORT..."
ngrok http $API_PORT
```

Запустите:
```bash
# Windows
.\scripts\start-ngrok.ps1

# macOS/Linux
chmod +x scripts/start-ngrok.sh
./scripts/start-ngrok.sh
```

### Вариант 2: Ручной запуск

```bash
ngrok http 8080
```

**Важно:** Убедитесь, что ваш API сервер запущен на порту `8080` (или измените порт в команде).

---

## 📝 Шаг 3: Получение ngrok URL

После запуска ngrok вы увидите:

```
Forwarding   https://xxxx-xx-xxx-xxx-xx.ngrok-free.app -> http://localhost:8080
```

**Скопируйте URL:** `https://xxxx-xx-xxx-xxx-xx.ngrok-free.app`

Это ваш временный публичный URL для webhooks.

---

## 🔗 Шаг 4: Настройка Stripe Webhook

### 4.1. Открыть Stripe Dashboard

1. Перейдите на [https://dashboard.stripe.com](https://dashboard.stripe.com)
2. Убедитесь, что вы в **Test mode** (переключатель вверху)
3. Перейдите в **Developers** → **Webhooks**

### 4.2. Создать или обновить Webhook Endpoint

#### Если webhook уже существует:

1. Найдите существующий webhook endpoint
2. Нажмите на него для редактирования
3. Нажмите **"Update endpoint"**
4. В поле **"Endpoint URL"** введите:
   ```
   https://xxxx-xx-xxx-xxx-xx.ngrok-free.app/webhooks/stripe
   ```
   (замените на ваш ngrok URL)
5. Нажмите **"Update endpoint"**

#### Если webhook не существует:

1. Нажмите **"Add endpoint"**
2. В поле **"Endpoint URL"** введите:
   ```
   https://xxxx-xx-xxx-xxx-xx.ngrok-free.app/webhooks/stripe
   ```
3. В разделе **"Events to send"** выберите следующие события:
   - ✅ `checkout.session.completed`
   - ✅ `payment_intent.succeeded`
   - ✅ `payment_intent.payment_failed`
   - ✅ `charge.refunded`
   - ✅ `customer.subscription.updated`
   - ✅ `customer.subscription.deleted`
4. Нажмите **"Add endpoint"**

### 4.3. Получить Webhook Secret

1. После создания/обновления webhook, откройте его
2. Найдите раздел **"Signing secret"**
3. Нажмите **"Reveal"** или **"Click to reveal"**
4. Скопируйте секрет (начинается с `whsec_`)

---

## ⚙️ Шаг 5: Настройка переменных окружения

### 5.1. Обновить `.env` файл

Добавьте или обновите следующие переменные:

```env
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_51...  # Ваш Stripe Secret Key
STRIPE_WEBHOOK_SECRET=whsec_...  # Webhook Secret из Stripe Dashboard

# API Configuration
API_PORT=8080
FRONTEND_URL=http://localhost:3000
```

### 5.2. Проверить настройки

Убедитесь, что:
- ✅ `STRIPE_SECRET_KEY` установлен
- ✅ `STRIPE_WEBHOOK_SECRET` установлен (новый секрет из ngrok URL)
- ✅ API сервер запущен на порту `8080`

---

## 🧪 Шаг 6: Тестирование Webhook

### 6.1. Отправить тестовый webhook

1. В Stripe Dashboard откройте ваш webhook endpoint
2. Нажмите **"Send test webhook"**
3. Выберите событие (например, `checkout.session.completed`)
4. Нажмите **"Send test webhook"**

### 6.2. Проверить логи

В консоли вашего API сервера вы должны увидеть:

```
[StripeWebhookController] Received Stripe webhook: checkout.session.completed
[StripeWebhookController] Stripe webhook signature verified successfully
[PaymentsService] Payment succeeded: ...
```

### 6.3. Проверить в базе данных

Убедитесь, что:
- ✅ Платеж обновлен со статусом `SUCCEEDED`
- ✅ Подписка активирована

---

## 🔄 Шаг 7: Обновление Webhook URL для продакшена

Когда приложение будет развернуто в продакшене:

1. Получите постоянный URL вашего приложения (например, `https://api.prorab.space`)
2. Обновите webhook endpoint в Stripe Dashboard:
   ```
   https://api.prorab.space/webhooks/stripe
   ```
3. Получите новый Webhook Secret для продакшена
4. Обновите `STRIPE_WEBHOOK_SECRET` в продакшен `.env`

---

## ⚠️ Важные замечания

### ngrok URL меняется

- **Бесплатный ngrok:** URL меняется при каждом перезапуске
- **Платный ngrok:** Можно зарезервировать постоянный домен

### Решение проблемы с изменяющимся URL

1. **Вариант 1:** Используйте ngrok с зарезервированным доменом (платно)
2. **Вариант 2:** Обновляйте webhook URL в Stripe каждый раз при перезапуске ngrok
3. **Вариант 3:** Используйте Stripe CLI для локальной разработки (см. альтернативу ниже)

---

## 🛠️ Альтернатива: Stripe CLI (для локальной разработки)

Вместо ngrok можно использовать Stripe CLI:

### Установка Stripe CLI

```bash
# Windows (Scoop)
scoop install stripe

# macOS (Homebrew)
brew install stripe/stripe-cli/stripe

# Linux
# Скачайте с https://stripe.com/docs/stripe-cli
```

### Запуск Stripe CLI

```bash
# Логин в Stripe
stripe login

# Запуск webhook forwarding
stripe listen --forward-to localhost:8080/webhooks/stripe
```

Stripe CLI автоматически:
- ✅ Создает временный webhook endpoint
- ✅ Пересылает события на локальный сервер
- ✅ Показывает webhook secret в консоли

**Преимущества:**
- Не нужно обновлять URL в Stripe Dashboard
- Автоматическая настройка
- Удобно для разработки

---

## 📚 Полезные ссылки

- [ngrok Documentation](https://ngrok.com/docs)
- [Stripe Webhooks Guide](https://stripe.com/docs/webhooks)
- [Stripe CLI Documentation](https://stripe.com/docs/stripe-cli)

---

## ✅ Чеклист настройки

- [ ] ngrok установлен и запущен
- [ ] ngrok URL скопирован
- [ ] Webhook endpoint создан/обновлен в Stripe Dashboard
- [ ] Webhook Secret скопирован из Stripe Dashboard
- [ ] `STRIPE_WEBHOOK_SECRET` обновлен в `.env`
- [ ] API сервер запущен на порту `8080`
- [ ] Тестовый webhook отправлен и обработан успешно
- [ ] Логи показывают успешную обработку webhook

---

**Готово!** Теперь Stripe webhooks будут работать через ngrok. 🎉

