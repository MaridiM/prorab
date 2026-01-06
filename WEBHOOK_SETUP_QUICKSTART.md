# 🚀 Быстрая настройка Webhook'ов для донатов

## Текущий ngrok URL

```
https://first-cosmic-mongrel.ngrok-free.app
```

## Webhook URL для настройки

### YooKassa
```
https://first-cosmic-mongrel.ngrok-free.app/api/webhooks/donations/yookassa
```

### Stripe
```
https://first-cosmic-mongrel.ngrok-free.app/api/webhooks/donations/stripe
```

---

## 📋 Чеклист настройки

### ✅ YooKassa

1. [ ] Войти в https://yookassa.ru/my
2. [ ] Настройки → Уведомления
3. [ ] Добавить URL: `https://first-cosmic-mongrel.ngrok-free.app/api/webhooks/donations/yookassa`
4. [ ] Выбрать событие: `payment.succeeded`
5. [ ] Скопировать **Пароль для уведомлений**
6. [ ] Добавить в `.env`: `YOOKASSA_WEBHOOK_SECRET=your_password`

### ✅ Stripe

1. [ ] Войти в https://dashboard.stripe.com/
2. [ ] Developers → Webhooks → Add endpoint
3. [ ] URL: `https://first-cosmic-mongrel.ngrok-free.app/api/webhooks/donations/stripe`
4. [ ] Выбрать события:
   - `payment_intent.succeeded`
   - `checkout.session.completed`
5. [ ] Скопировать **Signing secret** (whsec_...)
6. [ ] Добавить в `.env`: `STRIPE_WEBHOOK_SECRET=whsec_xxxxx`

---

## 🧪 Тестирование

1. **Убедиться, что backend запущен:**
   ```bash
   cd apps/api
   pnpm start:dev
   ```

2. **Убедиться, что ngrok активен:**
   - Проверить статус: `online`
   - URL: `https://first-cosmic-mongrel.ngrok-free.app`

3. **Создать тестовый донат:**
   - Открыть приложение
   - Нажать кнопку "Поддержать"
   - Выбрать сумму и пройти оплату

4. **Проверить логи backend:**
   ```
   [YookassaDonationWebhookController] Received YooKassa donation webhook
   [DonationsService] Donation xxxxx marked as succeeded
   ```

5. **Проверить статус доната:**
   - Настройки → Мои донаты
   - Статус должен быть "Успешно"

---

## 🔍 Отладка

### Webhook не приходит?

1. Проверить ngrok логи: http://127.0.0.1:4040
2. Проверить, что URL правильный (без опечаток)
3. Проверить, что используется HTTPS (не HTTP)
4. Проверить логи backend на ошибки

### Invalid signature?

1. Проверить, что Webhook Secret правильно скопирован
2. Убедиться, что используется правильный режим (test/live)
3. Перезапустить backend после изменения `.env`

### Donation not found?

1. Проверить логи - должен быть `providerPaymentId`
2. Проверить в базе данных донат с этим ID
3. Убедиться, что используется правильный провайдер

---

## 📚 Подробная документация

См. `docs/DONATION_WEBHOOKS_NGROK_SETUP.md` для детальной инструкции.

