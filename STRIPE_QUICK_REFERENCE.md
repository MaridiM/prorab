# Stripe Quick Reference - Быстрая Шпаргалка

## 🔑 Где Найти Ключи

### API Keys:
```
Stripe Dashboard → Developers → API keys
```

**Нужны 2 ключа:**
1. **Secret Key** (sk_test_...) - для `.env`
2. **Webhook Secret** (whsec_...) - для webhooks

---

## 💳 Структура Планов

### 3 Продукта × 3 Валюты × 2 Типа Цен = 18 Price IDs

| План | RUB (обычная) | RUB (early bird) | USD (обычная) | USD (early bird) | EUR (обычная) | EUR (early bird) |
|------|---------------|------------------|---------------|------------------|---------------|------------------|
| **LITE** | 490₽ | 290₽ | $7 | $4 | €7 | €4 |
| **FOREMAN** | 990₽ | 690₽ | $15 | $10 | €15 | €10 |
| **BRIGADE** | 1990₽ | 1490₽ | $25 | $20 | €25 | €20 |

---

## 📝 Что Создать в Stripe

### Product 1: ProRab LITE
```
Name: ProRab LITE
Description: Базовый тариф для небольших проектов
Billing: Monthly (recurring)

Prices (6 штук):
- price_... → RUB 490 (nickname: lite-rub-regular)
- price_... → RUB 290 (nickname: lite-rub-earlybird)
- price_... → USD 7 (nickname: lite-usd-regular)
- price_... → USD 4 (nickname: lite-usd-earlybird)
- price_... → EUR 7 (nickname: lite-eur-regular)
- price_... → EUR 4 (nickname: lite-eur-earlybird)
```

### Product 2: ProRab FOREMAN
```
Name: ProRab FOREMAN
Description: Оптимальный тариф для бригадиров
Billing: Monthly (recurring)

Prices (6 штук):
- price_... → RUB 990 / 690
- price_... → USD 15 / 10
- price_... → EUR 15 / 10
```

### Product 3: ProRab BRIGADE
```
Name: ProRab BRIGADE
Description: Профессиональный тариф для крупных бригад
Billing: Monthly (recurring)

Prices (6 штук):
- price_... → RUB 1990 / 1490
- price_... → USD 25 / 20
- price_... → EUR 25 / 20
```

---

## ⚙️ Environment Variables Template

Скопируйте в `apps/api/.env`:

```env
# ==================== STRIPE ====================
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# LITE Plan
STRIPE_PRICE_LITE_RUB_REGULAR=price_...
STRIPE_PRICE_LITE_RUB_EARLYBIRD=price_...
STRIPE_PRICE_LITE_USD_REGULAR=price_...
STRIPE_PRICE_LITE_USD_EARLYBIRD=price_...
STRIPE_PRICE_LITE_EUR_REGULAR=price_...
STRIPE_PRICE_LITE_EUR_EARLYBIRD=price_...

# FOREMAN Plan
STRIPE_PRICE_FOREMAN_RUB_REGULAR=price_...
STRIPE_PRICE_FOREMAN_RUB_EARLYBIRD=price_...
STRIPE_PRICE_FOREMAN_USD_REGULAR=price_...
STRIPE_PRICE_FOREMAN_USD_EARLYBIRD=price_...
STRIPE_PRICE_FOREMAN_EUR_REGULAR=price_...
STRIPE_PRICE_FOREMAN_EUR_EARLYBIRD=price_...

# BRIGADE Plan
STRIPE_PRICE_BRIGADE_RUB_REGULAR=price_...
STRIPE_PRICE_BRIGADE_RUB_EARLYBIRD=price_...
STRIPE_PRICE_BRIGADE_USD_REGULAR=price_...
STRIPE_PRICE_BRIGADE_USD_EARLYBIRD=price_...
STRIPE_PRICE_BRIGADE_EUR_REGULAR=price_...
STRIPE_PRICE_BRIGADE_EUR_EARLYBIRD=price_...
```

---

## 🧪 Тестовые Карты

### Успешная оплата:
```
Card: 4242 4242 4242 4242
Expiry: 12/34
CVC: 123
```

### Отклонена:
```
Card: 4000 0000 0000 0002
```

### 3D Secure:
```
Card: 4000 0025 0000 3155
```

---

## 🔗 Webhook Setup

```
URL (local): http://localhost:4000/webhooks/stripe
URL (prod): https://вашдомен.com/api/webhooks/stripe

Events:
✓ checkout.session.completed
✓ payment_intent.succeeded
✓ payment_intent.payment_failed
✓ customer.subscription.updated
✓ customer.subscription.deleted
```

---

## ✅ Checklist

### Setup:
- [ ] Зарегистрироваться на stripe.com
- [ ] Получить Secret Key
- [ ] Создать Webhook endpoint
- [ ] Получить Webhook Secret

### Products:
- [ ] Создать Product: ProRab LITE
- [ ] Добавить 6 цен для LITE
- [ ] Создать Product: ProRab FOREMAN
- [ ] Добавить 6 цен для FOREMAN
- [ ] Создать Product: ProRab BRIGADE
- [ ] Добавить 6 цен для BRIGADE

### Environment:
- [ ] Добавить STRIPE_SECRET_KEY в .env
- [ ] Добавить STRIPE_WEBHOOK_SECRET в .env
- [ ] Добавить все 18 STRIPE_PRICE_* в .env
- [ ] Перезапустить API сервер

### Testing:
- [ ] Проверить логи: "Stripe provider initialized"
- [ ] Открыть Settings → Subscriptions
- [ ] Нажать "Выбрать план"
- [ ] Проверить редирект на Stripe Checkout
- [ ] Оплатить тестовой картой
- [ ] Проверить статус подписки

---

## 🚨 Common Errors

### "Stripe provider not initialized"
→ Проверьте `STRIPE_SECRET_KEY` в `.env`

### "No such price: price_..."
→ Проверьте Price IDs в `.env`

### "Invalid API Key"
→ Используйте `sk_test_` для test mode

### Webhook не работает
→ Используйте Stripe CLI: `stripe listen --forward-to localhost:4000/webhooks/stripe`

---

## 📚 Links

- Dashboard: https://dashboard.stripe.com
- Docs: https://stripe.com/docs
- Test Cards: https://stripe.com/docs/testing

---

**Полное руководство:** [STRIPE_SETUP_GUIDE.md](STRIPE_SETUP_GUIDE.md)
