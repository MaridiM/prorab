# Telegram Bots Setup Guide - ProRab.space

**Дата:** 2025-12-11
**Статус:** Руководство по созданию и настройке ботов

---

## 🤖 Боты для ProRab.space

Для полноценной работы ProRab.space нужно создать **2 Telegram бота**:

### 1. **ProRab OAuth Bot** (основной)
- **Назначение:** OAuth авторизация пользователей и уведомления
- **Username:** `@ProRabSpaceBot`
- **Функции:**
  - Passwordless авторизация через deep links
  - Команды: /start, /help
  - Сбор chat_id для уведомлений

### 2. **ProRab Support Bot** (поддержка)
- **Назначение:** Техническая поддержка пользователей
- **Username:** `@ProRabSupportBot`
- **Функции:**
  - Приём обращений в поддержку
  - Автоматические ответы на FAQ
  - Пересылка сложных вопросов в группу поддержки
  - Статистика обращений

---

## 📋 Создание ботов через @BotFather

### Шаг 1: Создание ProRab OAuth Bot

```
1. Открыть Telegram → найти @BotFather
2. Отправить: /newbot
3. Ввести имя: ProRab Space
4. Ввести username: ProRabSpaceBot
5. Получить токен: 123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ
6. Сохранить токен!
```

**Настройка команд:**
```
/setcommands → выбрать @ProRabSpaceBot

Отправить:
start - Начать работу с ботом
help - Справка по использованию
```

**Настройка описания:**
```
/setdescription → выбрать @ProRabSpaceBot

Отправить:
ProRab.space - управление строительными проектами.
Войдите на сайт через Telegram и получайте уведомления о важных событиях.
```

**Настройка короткого описания:**
```
/setabouttext → выбрать @ProRabSpaceBot

Отправить:
Бот для авторизации и уведомлений ProRab.space
```

**Настройка аватара (опционально):**
```
/setuserpic → выбрать @ProRabSpaceBot
→ Отправить изображение (логотип ProRab)
```

### Шаг 2: Создание ProRab Support Bot

```
1. @BotFather → /newbot
2. Имя: ProRab Support
3. Username: ProRabSupportBot
4. Получить токен: 987654321:XYZabcDEFghiJKLmnoPQRstUVWxyz
5. Сохранить токен!
```

**Настройка команд:**
```
/setcommands → выбрать @ProRabSupportBot

Отправить:
start - Начать диалог с поддержкой
help - Часто задаваемые вопросы (FAQ)
status - Статус моего обращения
cancel - Отменить текущее обращение
```

**Настройка описания:**
```
/setdescription → выбрать @ProRabSupportBot

Отправить:
Техническая поддержка ProRab.space
Отвечаем на вопросы по использованию платформы, помогаем решить проблемы.
Время работы: пн-пт 9:00-18:00 (МСК)
```

---

## 🔧 Настройка .env

**apps/api/.env:**
```env
# ProRab OAuth Bot
TELEGRAM_BOT_TOKEN=123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ
TELEGRAM_BOT_USERNAME=ProRabSpaceBot
TELEGRAM_AUTH_TOKEN_TTL=600000  # 10 минут

# ProRab Support Bot
TELEGRAM_SUPPORT_BOT_TOKEN=987654321:XYZabcDEFghiJKLmnoPQRstUVWxyz
TELEGRAM_SUPPORT_BOT_USERNAME=ProRabSupportBot
TELEGRAM_SUPPORT_CHAT_ID=-1001234567890  # ID группы поддержки (создать отдельно)
```

---

## 🎯 Использование ботов

### ProRab OAuth Bot (@ProRabSpaceBot)

**Сценарий 1: OAuth авторизация**
```
User → Сайт prorab.space/auth/login
     → Нажимает "Войти через Telegram"
     → Открывается t.me/ProRabSpaceBot?start=auth_XXXXX
     → User нажимает "Start" в боте
     → Бот: "✅ Авторизация успешна!"
     → User автоматически залогинен на сайте
```

**Сценарий 2: Уведомления (Stage 9 - будущее)**
```
Новый расход добавлен → Backend отправляет в бот
                       → User получает сообщение:
                          "💰 Новый расход: Кирпич - 15,000₽
                           Проект: Коттедж в Подмосковье
                           [Посмотреть] [Одобрить]"
```

**Команды:**
- `/start` - Приветствие + инструкция как войти
- `/start auth_TOKEN` - OAuth flow (автоматически)
- `/help` - Справка по боту

### ProRab Support Bot (@ProRabSupportBot)

**Сценарий 1: Пользователь задаёт вопрос**
```
User → Открывает @ProRabSupportBot
     → /start
     → Бот: "👋 Здравствуйте! Опишите вашу проблему"
     → User: "Не могу добавить фотоотчёт"
     → Бот: "📝 Обращение #1234 создано. Ожидайте ответа."
     → Support team получает уведомление в группу
     → Support отвечает → User получает ответ
```

**Сценарий 2: FAQ (автоответы)**
```
User → /help
     → Бот показывает меню:
        "Выберите категорию:
         1️⃣ Проекты и команды
         2️⃣ Расходы и финансы
         3️⃣ Фотоотчёты
         4️⃣ Технические проблемы"
     → User выбирает категорию
     → Бот показывает список FAQ
```

**Команды:**
- `/start` - Начать диалог с поддержкой
- `/help` - FAQ (часто задаваемые вопросы)
- `/status` - Статус обращения
- `/cancel` - Отменить текущее обращение

---

## 📊 Создание группы поддержки

**Для Support Bot нужна группа, куда пересылаются обращения:**

```
1. Создать Telegram группу: "ProRab Support Team"
2. Добавить @ProRabSupportBot в группу
3. Сделать бота администратором
4. Получить chat_id группы:
   - Отправить любое сообщение в группу
   - Открыть: https://api.telegram.org/bot<SUPPORT_BOT_TOKEN>/getUpdates
   - Найти "chat":{"id":-1001234567890,...}
   - Скопировать ID: -1001234567890
5. Добавить в .env: TELEGRAM_SUPPORT_CHAT_ID=-1001234567890
```

---

## 🔐 Безопасность

### Хранение токенов

**❌ НЕ ДЕЛАТЬ:**
- Не коммитить токены в Git
- Не публиковать токены в открытом доступе
- Не использовать production токены для тестирования

**✅ ДЕЛАТЬ:**
- Хранить токены в `.env` (добавлен в .gitignore)
- Использовать разные токены для dev/staging/production
- Периодически ротировать токены (через @BotFather)

### Ротация токена

```
@BotFather → /token → выбрать бота → /revoke
→ Получить новый токен
→ Обновить в .env
→ Перезапустить сервер
```

---

## 📱 Тестирование ботов

### ProRab OAuth Bot

**Local testing:**
```bash
# 1. Start API server
cd apps/api
npm run start:dev

# 2. Check logs
# Должно быть: "Nest application successfully started"
# Должно быть: "TelegramBot initialized"

# 3. Test bot manually
# Открыть @ProRabSpaceBot в Telegram
# Отправить: /start
# Проверить: Бот отвечает welcome message

# 4. Test OAuth flow
# Открыть: http://localhost:3000/auth/login
# Нажать "Войти через Telegram"
# Проверить: Открывается t.me/ProRabSpaceBot?start=auth_XXXXX
# Нажать "Start" в боте
# Проверить: Бот отвечает "✅ Авторизация успешна!"
# Проверить: Сайт автоматически логинит пользователя
```

### ProRab Support Bot

**После реализации (Stage 9):**
```bash
# 1. Open @ProRabSupportBot
# 2. /start
# 3. Отправить тестовое обращение
# 4. Проверить: Обращение пришло в группу поддержки
# 5. Ответить из группы
# 6. Проверить: User получил ответ
```

---

## 📈 Мониторинг

### Метрики для отслеживания

**ProRab OAuth Bot:**
- OAuth requests per day
- OAuth success rate (%)
- OAuth failure rate (%)
- Average auth time (seconds)
- Token expiration rate (%)

**ProRab Support Bot:**
- Tickets created per day
- Average response time (minutes)
- Ticket resolution rate (%)
- FAQ usage statistics
- User satisfaction rating

### Логирование

```typescript
// apps/api/src/modules/telegram/telegram.bot.ts
this.logger.log(`OAuth successful for chat_id ${chatId}`)
this.logger.error(`OAuth error: ${error.message}`)

// apps/api/src/modules/telegram/telegram-support.service.ts
this.logger.log(`Support ticket #${ticketId} created by user ${userId}`)
this.logger.log(`Support ticket #${ticketId} resolved`)
```

---

## 🚀 Production Deployment

### Webhook Setup (вместо polling)

**ProRab OAuth Bot:**
```bash
curl -F "url=https://api.prorab.space/telegram/oauth/webhook" \
     https://api.telegram.org/bot<OAUTH_BOT_TOKEN>/setWebhook
```

**ProRab Support Bot:**
```bash
curl -F "url=https://api.prorab.space/telegram/support/webhook" \
     https://api.telegram.org/bot<SUPPORT_BOT_TOKEN>/setWebhook
```

**Проверка webhook:**
```bash
curl https://api.telegram.org/bot<BOT_TOKEN>/getWebhookInfo
```

### SSL Certificate

Telegram требует HTTPS для webhooks:
```json
{
  "url": "https://api.prorab.space/telegram/oauth/webhook",
  "has_custom_certificate": false,
  "pending_update_count": 0,
  "max_connections": 40
}
```

---

## 📝 Чеклист запуска

### Development (Local)

**ProRab OAuth Bot:**
- [x] Создан через @BotFather
- [x] Токен добавлен в `.env`
- [x] Команды настроены (/start, /help)
- [x] Описание настроено
- [ ] Аватар загружен
- [x] Бот работает в режиме polling
- [ ] Протестирован OAuth flow

**ProRab Support Bot:**
- [ ] Создан через @BotFather
- [ ] Токен добавлен в `.env`
- [ ] Команды настроены
- [ ] Описание настроено
- [ ] Группа поддержки создана
- [ ] Бот добавлен в группу
- [ ] Chat ID группы получен
- [ ] Реализован Support module
- [ ] Протестирован ticket flow

### Production

**ProRab OAuth Bot:**
- [ ] Production токен получен
- [ ] Webhook настроен
- [ ] SSL certificate валиден
- [ ] Мониторинг настроен
- [ ] Alerts настроены

**ProRab Support Bot:**
- [ ] Production токен получен
- [ ] Production группа создана
- [ ] Webhook настроен
- [ ] Мониторинг настроен
- [ ] SLA определён (время ответа)

---

## 🎁 Бонусные функции

### ProRab OAuth Bot (будущее)

**Stage 9 - Notifications:**
- 📊 Уведомления о новых расходах
- 📸 Уведомления о новых фотоотчётах
- 👥 Уведомления о новых участниках команды
- 💰 Уведомления о новых выплатах
- ⚠️ Уведомления о превышении бюджета

**Interactive buttons:**
```
Новый расход: Кирпич - 15,000₽
[✅ Одобрить] [❌ Отклонить] [📝 Комментарий]
```

### ProRab Support Bot (будущее)

**AI-powered responses:**
- Автоматические ответы на типичные вопросы (GPT-4)
- Классификация обращений по категориям
- Приоритизация срочных обращений
- Перевод на английский для иностранных клиентов

**Analytics:**
- Dashboard с метриками поддержки
- Топ проблемы пользователей
- Satisfaction survey после решения
- Knowledge base из resolved tickets

---

## 📞 Контакты

**Документация:**
- OAuth Implementation: `docs/TELEGRAM_OAUTH_IMPLEMENTATION_COMPLETE.md`
- Support Bot Plan: `docs/analisys/telegram-support-bot-plan.md` (создать)
- This Guide: `docs/TELEGRAM_BOTS_SETUP_GUIDE.md`

**Следующие шаги:**
1. Создать оба бота через @BotFather ✅
2. Добавить токены в .env
3. Протестировать OAuth Bot
4. Спланировать Support Bot реализацию
5. Реализовать Support Bot (Phase 5)
