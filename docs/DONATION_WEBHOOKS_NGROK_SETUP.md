# Настройка Webhook'ов для Донатов через ngrok

## Быстрый старт

### 1. Запуск ngrok

```bash
ngrok http 8080
```

Или с фиксированным доменом (если у вас есть платный план):
```bash
ngrok http --domain=first-cosmic-mongrel.ngrok-free.app 8080
```

После запуска вы получите публичный URL, например:
```
https://first-cosmic-mongrel.ngrok-free.app
```

### 2. Webhook URL для донатов

**YooKassa:**
```
https://first-cosmic-mongrel.ngrok-free.app/api/webhooks/donations/yookassa
```

**Stripe:**
```
https://first-cosmic-mongrel.ngrok-free.app/api/webhooks/donations/stripe
```

## Настройка YooKassa

### Шаг 1: Войти в личный кабинет YooKassa
1. Перейти на https://yookassa.ru/my
2. Войти в аккаунт

### Шаг 2: Настроить HTTP-уведомления
1. Перейти в **Настройки** → **Уведомления**
2. Включить **HTTP-уведомления**
3. Добавить URL для уведомлений:
   ```
   https://first-cosmic-mongrel.ngrok-free.app/api/webhooks/donations/yookassa
   ```

### Шаг 3: Выбрать события
Выбрать следующие события:
- ✅ `payment.succeeded` - Успешная оплата доната
- ✅ `payment.canceled` - Отмена платежа (опционально)
- ✅ `refund.succeeded` - Возврат средств (опционально)

### Шаг 4: Получить Webhook Secret
1. В настройках уведомлений найти **Пароль для уведомлений**
2. Скопировать пароль
3. Добавить в `.env`:
   ```bash
   YOOKASSA_WEBHOOK_SECRET=your_webhook_password_here
   ```
4. Или настроить через SystemSettings в админ-панели

### Шаг 5: Проверить настройки
1. Убедиться, что backend запущен на `http://localhost:8080`
2. Убедиться, что ngrok туннель активен
3. Создать тестовый донат
4. Проверить логи backend для подтверждения получения webhook'а

## Настройка Stripe

### Шаг 1: Войти в Stripe Dashboard
1. Перейти на https://dashboard.stripe.com/
2. Войти в аккаунт
3. Переключиться в **Test mode** (для тестирования) или **Live mode** (для продакшена)

### Шаг 2: Создать Webhook Endpoint
1. Перейти в **Developers** → **Webhooks**
2. Нажать **Add endpoint**
3. Ввести URL:
   ```
   https://first-cosmic-mongrel.ngrok-free.app/api/webhooks/donations/stripe
   ```

### Шаг 3: Выбрать события
Выбрать следующие события:
- ✅ `payment_intent.succeeded` - Успешная оплата через Payment Intent
- ✅ `checkout.session.completed` - Успешная оплата через Checkout

### Шаг 4: Получить Webhook Secret
1. После создания endpoint, нажать на него
2. В разделе **Signing secret** нажать **Reveal**
3. Скопировать секрет (начинается с `whsec_`)
4. Добавить в `.env`:
   ```bash
   STRIPE_WEBHOOK_SECRET=whsec_xxxxx
   ```
5. Или настроить через SystemSettings в админ-панели

### Шаг 5: Проверить настройки
1. Убедиться, что backend запущен на `http://localhost:8080`
2. Убедиться, что ngrok туннель активен
3. Создать тестовый донат
4. В Stripe Dashboard → Webhooks → ваш endpoint → **Send test webhook**
5. Проверить логи backend для подтверждения получения webhook'а

## Проверка работы Webhook'ов

### Логи Backend

При успешном получении webhook'а вы увидите в логах:

**YooKassa:**
```
[YookassaDonationWebhookController] Received YooKassa donation webhook
[YookassaDonationWebhookController] YooKassa donation webhook event: payment.succeeded, payment: xxxxx
[DonationsService] Donation xxxxx marked as succeeded
```

**Stripe:**
```
[StripeDonationWebhookController] Received Stripe donation webhook
[StripeDonationWebhookController] Stripe donation webhook event: payment_intent.succeeded
[DonationsService] Donation xxxxx marked as succeeded
```

### Проверка статуса доната

1. Открыть страницу **Настройки** → **Мои донаты**
2. Статус доната должен автоматически обновиться на **"Успешно"**
3. Если статус не обновился, можно нажать кнопку обновления рядом с донатом

## Отладка проблем

### Проблема: Webhook не приходит

**Проверки:**
1. ✅ ngrok туннель активен и показывает `online` статус
2. ✅ Backend запущен на порту 8080
3. ✅ Webhook URL правильно настроен в провайдере (без опечаток)
4. ✅ Webhook URL использует HTTPS (не HTTP)
5. ✅ Webhook Secret правильно настроен в `.env` или SystemSettings

**Решение:**
- Проверить логи ngrok: `http://127.0.0.1:4040`
- Проверить логи backend на наличие ошибок
- Попробовать отправить тестовый webhook из панели провайдера

### Проблема: Invalid signature

**Причина:** Webhook Secret не совпадает или не настроен

**Решение:**
1. Проверить, что Webhook Secret правильно скопирован (без пробелов)
2. Убедиться, что используется правильный секрет (test/live)
3. Перезапустить backend после изменения `.env`

### Проблема: Donation not found

**Причина:** `providerPaymentId` не совпадает

**Решение:**
1. Проверить логи - должен быть `providerPaymentId` из webhook'а
2. Проверить в базе данных, что донат создан с правильным `providerPaymentId`
3. Убедиться, что используется правильный провайдер (test/live)

## Продакшен настройка

Для продакшена:

1. **Использовать постоянный домен** вместо ngrok
2. **Настроить SSL сертификат** (Let's Encrypt через Certbot)
3. **Обновить Webhook URL** в панелях провайдеров:
   - YooKassa: `https://your-domain.com/api/webhooks/donations/yookassa`
   - Stripe: `https://your-domain.com/api/webhooks/donations/stripe`
4. **Использовать Live credentials** вместо Test
5. **Настроить мониторинг** webhook'ов (логи, алерты)

## Полезные ссылки

- [YooKassa Webhook Documentation](https://yookassa.ru/developers/using-api/webhooks)
- [Stripe Webhook Documentation](https://stripe.com/docs/webhooks)
- [ngrok Documentation](https://ngrok.com/docs)

