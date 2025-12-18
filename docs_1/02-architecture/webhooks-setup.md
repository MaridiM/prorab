# Webhooks Setup Guide

## YooKassa Webhook Configuration

### 1. Получить Webhook Secret

1. Войти в личный кабинет YooKassa: https://yookassa.ru/my
2. Перейти в **Настройки** → **Уведомления** (Notifications/Webhooks)
3. Создать новый webhook или найти существующий
4. Скопировать **Пароль для уведомлений** (Webhook Secret/Password)

### 2. Настроить переменные окружения

Добавить в `apps/api/.env`:

```bash
# YooKassa Webhook Secret (получить из личного кабинета)
YOOKASSA_WEBHOOK_SECRET=your_webhook_password_here
```

⚠️ **Важно:** Это НЕ API ключ! Это специальный пароль для webhooks.

### 3. Настроить ngrok для локальной разработки

#### Установить ngrok (если не установлен)

```bash
# Windows (Chocolatey)
choco install ngrok

# macOS (Homebrew)
brew install ngrok

# Linux
snap install ngrok
```

#### Запустить ngrok туннель

```bash
ngrok http --url=first-cosmic-mongrel.ngrok-free.app 8080
```

Это создаст туннель:
- **Публичный URL:** https://first-cosmic-mongrel.ngrok-free.app
- **Локальный сервер:** http://localhost:8080

#### Добавить webhook URL в YooKassa

В личном кабинете YooKassa добавить webhook URL:

```
https://first-cosmic-mongrel.ngrok-free.app/api/webhooks/yookassa
```

**События для подписки:**
- ✅ `payment.succeeded` - Успешная оплата
- ✅ `payment.canceled` - Отмена платежа
- ✅ `refund.succeeded` - Успешный возврат

### 4. Тестирование webhooks

#### Запустить backend

```bash
cd apps/api
npm run start:dev
```

Backend будет доступен на `http://localhost:8080`

#### Создать тестовый платёж

```bash
# Через YooKassa API или через интерфейс приложения
# Webhook автоматически придёт на https://first-cosmic-mongrel.ngrok-free.app/api/webhooks/yookassa
```

#### Проверить логи

В консоли backend вы увидите:

```
[YooKassaWebhookController] Received webhook: payment.succeeded
[YooKassaWebhookController] Webhook signature verified successfully
[PaymentsService] Processing payment succeeded: pay_xxxxx
```

### 5. Безопасность

#### Что проверяется:

1. **Authorization Header:**
   - Формат: `Basic <base64(shopId:password)>`
   - Декодируется в `shopId:password`
   - Password сравнивается с `YOOKASSA_WEBHOOK_SECRET`

2. **Логирование:**
   - ✅ Успешная верификация: `debug` level
   - ⚠️ Отсутствует secret: `warn` level (пропускается верификация)
   - ❌ Неверная подпись: `error` level + `UnauthorizedException`

#### Пример верификации:

```typescript
// YooKassa отправляет:
Authorization: Basic czEyMzQ1Njp3ZWJob29rX3Bhc3N3b3JkXzEyMw==

// Декодируется в:
s123456:webhook_password_123

// Проверяется:
password === process.env.YOOKASSA_WEBHOOK_SECRET
```

### 6. Production Setup

#### Постоянный домен

В production используйте постоянный домен вместо ngrok:

```
https://api.prorab.space/webhooks/yookassa
```

#### Обязательно настроить:

1. **HTTPS** - YooKassa требует HTTPS для webhooks
2. **Webhook Secret** - Добавить в production переменные окружения
3. **Firewall** - Разрешить только IP адреса YooKassa (опционально)

#### YooKassa IP адреса для whitelist (опционально):

```
185.71.76.0/27
185.71.77.0/27
77.75.153.0/25
77.75.156.11
77.75.156.35
77.75.154.128/25
2a02:5180::/32
```

### 7. Troubleshooting

#### Webhook не приходит

1. Проверить ngrok работает: `curl https://first-cosmic-mongrel.ngrok-free.app/api/health`
2. Проверить URL в YooKassa точно совпадает
3. Проверить backend запущен и доступен
4. Проверить логи ngrok: `http://127.0.0.1:4040` (web interface)

#### Invalid signature error

1. Проверить `YOOKASSA_WEBHOOK_SECRET` в `.env` совпадает с паролем в личном кабинете
2. Проверить нет лишних пробелов в переменной
3. Проверить формат Authorization header в логах

#### Webhook приходит, но ничего не происходит

1. Проверить обработчик events в `handleWebhook`
2. Проверить логи backend на ошибки
3. Проверить payment ID существует в базе данных

### 8. Полезные команды

```bash
# Проверить webhook вручную (с корректной подписью)
curl -X POST https://first-cosmic-mongrel.ngrok-free.app/api/webhooks/yookassa \
  -H "Content-Type: application/json" \
  -H "Authorization: Basic $(echo -n 's123456:your_webhook_secret' | base64)" \
  -d '{
    "event": "payment.succeeded",
    "object": {
      "id": "test_payment_id",
      "status": "succeeded",
      "amount": { "value": "1000.00", "currency": "RUB" }
    }
  }'

# Посмотреть ngrok requests в реальном времени
# Открыть в браузере: http://127.0.0.1:4040

# Проверить что переменная настроена
echo $YOOKASSA_WEBHOOK_SECRET
```

### 9. Мониторинг

Рекомендуется настроить мониторинг webhooks:

1. **Логирование:** Все webhooks логируются с уровнем `log`
2. **Метрики:** Считать успешные/неудачные webhooks
3. **Алерты:** Уведомления при большом количестве failed webhooks

### 10. Дополнительные ресурсы

- **YooKassa Webhooks Docs:** https://yookassa.ru/developers/using-api/webhooks
- **ngrok Docs:** https://ngrok.com/docs
- **Тестовые данные YooKassa:** https://yookassa.ru/developers/payment-acceptance/testing-and-going-live/testing

---

## Готовность к production

- [x] ✅ Signature verification реализована
- [x] ✅ Логирование всех событий
- [x] ✅ Error handling
- [ ] 🟡 Мониторинг метрик webhooks
- [ ] 🟡 Rate limiting (опционально)
- [ ] 🟢 IP whitelist (опционально)
