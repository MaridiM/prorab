# Telegram Bots Deployment - Quick Guide

**Время выполнения:** 15 минут
**Статус:** Код 100% готов, нужны только токены

---

## 🎯 Цель

Развернуть два Telegram бота:
1. **@ProRabSpaceBot** - OAuth авторизация
2. **@ProRabSupportBot** - Техническая поддержка

---

## 📋 Пошаговая инструкция

### Шаг 1: Создать OAuth Bot (5 минут)

1. Откройте Telegram
2. Найдите @BotFather
3. Отправьте команду `/newbot`
4. Введите имя бота: `ProRab Space`
5. Введите username: `ProRabSpaceBot`
6. **Скопируйте токен** (формат: `1234567890:ABCdefGHIjklMNOpqrsTUVwxyz`)

**Пример диалога:**
```
You: /newbot
BotFather: Alright, a new bot. How are we going to call it?
You: ProRab Space
BotFather: Good. Now let's choose a username for your bot.
You: ProRabSpaceBot
BotFather: Done! Congratulations on your new bot. You will find it at t.me/ProRabSpaceBot
Here is your token: 1234567890:ABCdefGHIjklMNOpqrsTUVwxyz
```

### Шаг 2: Создать Support Bot (5 минут)

1. В том же чате с @BotFather
2. Отправьте команду `/newbot`
3. Введите имя бота: `ProRab Support`
4. Введите username: `ProRabSupportBot`
5. **Скопируйте токен**

**Пример диалога:**
```
You: /newbot
BotFather: Alright, a new bot. How are we going to call it?
You: ProRab Support
BotFather: Good. Now let's choose a username for your bot.
You: ProRabSupportBot
BotFather: Done! Congratulations on your new bot. You will find it at t.me/ProRabSupportBot
Here is your token: 0987654321:ZYXwvuTSRqponMLKjiHGfedCBA
```

### Шаг 3: Добавить токены в .env (2 минуты)

1. Откройте файл `apps/api/.env`
2. Добавьте или обновите следующие строки:

```env
# Telegram Bots
TELEGRAM_BOT_TOKEN=1234567890:ABCdefGHIjklMNOpqrsTUVwxyz
TELEGRAM_SUPPORT_BOT_TOKEN=0987654321:ZYXwvuTSRqponMLKjiHGfedCBA
```

3. Сохраните файл

### Шаг 4: Запустить сервер (3 минуты)

1. Откройте терминал в корневой директории проекта
2. Запустите API сервер:

```bash
npm run dev:api
```

3. Проверьте логи - должны увидеть:

```
[Nest] INFO [TelegramAuthService] Telegram OAuth Bot initialized
[Nest] INFO [TelegramSupportService] Telegram Support Bot initialized
[Nest] INFO [TelegramAuthService] Bot commands set successfully
[Nest] INFO [TelegramSupportService] Bot commands set successfully
```

### Шаг 5: Протестировать OAuth Bot (3 минуты)

1. Откройте Telegram
2. Найдите `@ProRabSpaceBot`
3. Отправьте `/start`
4. Должны увидеть приветственное сообщение с меню
5. Попробуйте команды:
   - `/login` - должна вернуть login кнопку
   - `/help` - должна показать список команд
   - `/profile` - должна показать профиль (если авторизован)

**Ожидаемый результат:**
```
👋 Добро пожаловать в ProRab.space!

Я помогу вам войти в систему через Telegram.

Используйте /login для входа или /help для списка команд.
```

### Шаг 6: Протестировать Support Bot (3 минуты)

1. Найдите `@ProRabSupportBot`
2. Отправьте `/start`
3. Должны увидеть приветственное сообщение
4. Попробуйте команды:
   - `/faq` - должна показать список часто задаваемых вопросов
   - `/help` - список команд
   - Отправьте любое сообщение - должно создать тикет

**Ожидаемый результат:**
```
👋 Добро пожаловать в службу поддержки ProRab.space!

Я здесь, чтобы помочь вам с любыми вопросами.

Используйте /faq для часто задаваемых вопросов или просто напишите свой вопрос.
```

---

## ✅ Проверка успешности

После выполнения всех шагов:

- [ ] OAuth Bot отвечает на команды
- [ ] Support Bot отвечает на команды
- [ ] В логах API нет ошибок
- [ ] Боты отображают корректные меню
- [ ] FAQ база данных загружена (8 статей)

---

## 🔍 Troubleshooting

### Проблема: "Error: 401 Unauthorized"

**Причина:** Неверный токен

**Решение:**
1. Проверьте токен в `.env`
2. Убедитесь, что скопировали полностью (включая цифры до двоеточия)
3. Перезапустите API сервер

### Проблема: "Bot commands set failed"

**Причина:** Проблема с сетью или API Telegram

**Решение:**
1. Проверьте интернет соединение
2. Подождите 1-2 минуты и перезапустите
3. Проверьте, не заблокирован ли Telegram API вашим файрволом

### Проблема: "FAQ not found"

**Причина:** База данных FAQ не заполнена

**Решение:**
```bash
cd apps/api
npx tsx prisma/seed-faq.ts
```

---

## 📝 Команды ботов

### OAuth Bot (@ProRabSpaceBot)

| Команда | Описание |
|---------|----------|
| `/start` | Приветственное сообщение |
| `/login` | Получить ссылку для авторизации |
| `/profile` | Показать профиль пользователя |
| `/help` | Показать список команд |

### Support Bot (@ProRabSupportBot)

| Команда | Описание |
|---------|----------|
| `/start` | Приветственное сообщение |
| `/faq` | Показать FAQ |
| `/help` | Показать список команд |
| Текст | Создать тикет в поддержку |

---

## 🎯 Следующие шаги

После успешного деплоя ботов:

1. ✅ Telegram Bots - Готово
2. ⏳ Stage 9 Phase 1 Testing (1 день)
3. ⏳ Stage 9 Phase 2 Testing (1 день)
4. ⏳ Production Deployment

---

## 🔐 Security Notes

**ВАЖНО:**
- ✅ Токены добавлены только в `.env` (не коммитьте!)
- ✅ `.env` уже в `.gitignore`
- ✅ Для production используйте environment variables
- ✅ Храните токены в безопасном месте (1Password, AWS Secrets Manager, etc.)

---

## 📞 Support

**Если возникли проблемы:**
- Проверьте [TELEGRAM_BOTS_STATUS.md](TELEGRAM_BOTS_STATUS.md)
- Проверьте [TELEGRAM_TODO.md](TELEGRAM_TODO.md)
- Проверьте логи API сервера

**Документация:**
- [Telegram Bot API](https://core.telegram.org/bots/api)
- [BotFather Commands](https://core.telegram.org/bots#6-botfather)

---

**Создано:** 2025-12-17, 03:40
**Статус:** Ready to deploy
**Время выполнения:** ~15 минут
