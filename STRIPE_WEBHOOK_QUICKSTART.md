# ⚡ Быстрый старт: Stripe Webhooks с ngrok

## 🚀 Запуск ngrok

### Windows (PowerShell):
```powershell
.\scripts\start-ngrok.ps1
```

### macOS/Linux:
```bash
chmod +x scripts/start-ngrok.sh
./scripts/start-ngrok.sh
```

### Или вручную:
```bash
ngrok http 8080
```

---

## 📋 Настройка Stripe Webhook

1. **Скопируйте ngrok URL** (например: `https://xxxx-xx-xxx-xxx-xx.ngrok-free.app`)

2. **Откройте Stripe Dashboard:**
   - [https://dashboard.stripe.com](https://dashboard.stripe.com)
   - **Developers** → **Webhooks**

3. **Создайте/обновите webhook endpoint:**
   - URL: `https://xxxx-xx-xxx-xxx-xx.ngrok-free.app/webhooks/stripe`
   - События:
     - ✅ `checkout.session.completed`
     - ✅ `payment_intent.succeeded`
     - ✅ `payment_intent.payment_failed`
     - ✅ `charge.refunded`
     - ✅ `customer.subscription.updated`
     - ✅ `customer.subscription.deleted`

4. **Скопируйте Webhook Secret** (начинается с `whsec_`)

5. **Обновите `.env`:**
   ```env
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```

---

## ✅ Проверка

1. В Stripe Dashboard отправьте тестовый webhook
2. Проверьте логи API сервера
3. Убедитесь, что платеж обработан

---

## 📚 Подробная инструкция

См. [docs/STRIPE_NGROK_SETUP.md](docs/STRIPE_NGROK_SETUP.md)

---

**Важно:** При каждом перезапуске ngrok URL меняется. Обновляйте webhook endpoint в Stripe!

