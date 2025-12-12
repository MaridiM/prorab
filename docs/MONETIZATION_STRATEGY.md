# ProRab.space - Comprehensive Monetization Strategy

**Дата создания:** 2025-12-12
**Версия:** 2.0
**Статус:** Ready for Implementation

---

## 📊 Executive Summary

**Бизнес-модель:** Freemium SaaS с подпиской (Subscription-based)
**Целевая аудитория:** Прорабы и бригадиры в строительстве (Россия)
**Рынок:** B2SMB (Business to Small and Medium Businesses)
**Средний чек:** 990₽/месяц
**LTV (Lifetime Value):** ~20,000₽ (при удержании 18 месяцев)

---

## 🎯 Текущая реализация (Stage 8)

### Что уже есть (100% готово):

#### Backend Infrastructure
- ✅ **Subscription Model** - Database schema готова
  - Plans: LITE, FOREMAN, BRIGADE
  - Statuses: TRIALING, ACTIVE, PAST_DUE, CANCELLED
  - Early Bird pricing (первые 500 пользователей)
  - Trial period: 14 дней

- ✅ **Payment Integration** - YooKassa
  - Инициализация платежа
  - Webhook для подтверждения
  - Автоматическое продление подписки
  - Обработка ошибок оплаты

- ✅ **Limit Enforcement** - Автоматические проверки
  - Project limits (checkProjectLimit)
  - Member limits (checkMemberLimit)
  - Storage tracking (storageUsedBytes в Team)

- ✅ **GraphQL API**
  - createSubscription
  - changePlan (scheduled)
  - cancelSubscription
  - reactivateSubscription
  - getCurrentLimits
  - getUsageStats

#### Frontend Components
- ✅ **Pricing Page** (`/pricing`)
  - 3 тарифных плана
  - Early Bird badge
  - Feature comparison
  - FAQ section

- ✅ **Subscription Management** (`/teams/[teamId]/subscription`)
  - Current plan display
  - Usage stats с progress bars
  - Payment history
  - Change plan dialog (scheduled)
  - Cancel subscription dialog

---

## 💰 Текущие тарифные планы (v1.0)

### **LITE - "Лайт"** - 490₽/мес
**Early Bird:** 290₽/мес (первые 500 пользователей)

**Лимиты:**
- ✅ 1 активный проект
- ✅ 1 участник команды
- ✅ 500 MB хранилища

**Функции:**
- ✅ Базовый функционал (проекты, расходы, фотоотчёты)
- ✅ Email поддержка

**Целевая аудитория:** Solo прорабы, тестирование продукта

---

### **FOREMAN - "Прораб"** - 990₽/мес ⭐ Популярный
**Early Bird:** 690₽/мес

**Лимиты:**
- ✅ 4 активных проекта
- ✅ 3 участника команды
- ✅ 2 GB хранилища

**Функции:**
- ✅ Все из LITE +
- ✅ Расчёты зарплаты (автоматические)
- ✅ Фотоотчёты (неограниченно)
- ✅ Задачи и Kanban доска
- ✅ Priority support (ответ за 24 часа)

**Целевая аудитория:** Прорабы с 1-2 бригадами, малый бизнес

---

### **BRIGADE - "Бригада"** - 1990₽/мес
**Early Bird:** 1490₽/мес

**Лимиты:**
- ✅ Неограниченное количество проектов
- ✅ 10 участников команды
- ✅ 10 GB хранилища

**Функции:**
- ✅ Все из FOREMAN +
- ✅ API доступ (webhook notifications)
- ✅ Dedicated support (ответ за 12 часов)
- ✅ Приоритетные обновления
- ✅ Персональный менеджер

**Целевая аудитория:** Строительные компании, крупные бригады

---

## 🚀 Улучшенная стратегия монетизации (v2.0)

### Проблемы текущей модели:

1. **Слишком большой разрыв между планами**
   - LITE (1 проект) → FOREMAN (4 проекта) = 4x скачок
   - Нет плавного перехода для роста

2. **Недостаточно гибкости**
   - Нельзя докупить участников отдельно
   - Нельзя увеличить хранилище без upgrade

3. **Лимит Early Bird слишком мал**
   - 500 пользователей = ~2 месяца при активном маркетинге
   - Нужен долгосрочный план скидок

4. **Нет годовой подписки**
   - Упускаем возможность получить prepayment
   - Нет стимула для долгосрочной лояльности

---

## 💡 Предлагаемые улучшения

### 1. Новая тарифная сетка (4 плана)

#### **FREE - "Пробный"** - 0₽/мес (NEW!)

**Лимиты:**
- ✅ 1 активный проект
- ✅ 1 участник (только владелец)
- ✅ 100 MB хранилища
- ✅ 10 задач максимум
- ✅ История за 30 дней

**Функции:**
- ✅ Базовый функционал
- ✅ Community support (форум)
- ✅ Watermark "Powered by ProRab.space"

**Цель:** Вовлечение и конверсия в платную подписку
**Триггеры upgrade:**
- Достигнут лимит задач
- Нужна история >30 дней
- Хотят убрать watermark

---

#### **STARTER - "Стартовый"** - 590₽/мес (NEW!)

**Early Bird:** 390₽/мес (первые 1000 пользователей)

**Лимиты:**
- ✅ 2 активных проекта (+1 от FREE)
- ✅ 2 участника команды (+1 от FREE)
- ✅ 1 GB хранилища (+900 MB)
- ✅ Неограниченное количество задач
- ✅ Полная история

**Функции:**
- ✅ Без watermark
- ✅ Базовые расчёты зарплаты
- ✅ Email поддержка (ответ за 48 часов)
- ✅ Экспорт данных в Excel

**Целевая аудитория:** Solo прорабы, начинающие бригадиры

---

#### **PROFESSIONAL - "Профессиональный"** - 1290₽/мес (Renamed from FOREMAN)

**Early Bird:** 890₽/мес (первые 1000)

**Лимиты:**
- ✅ 5 активных проектов (+3 от STARTER)
- ✅ 5 участников команды (+3 от STARTER)
- ✅ 5 GB хранилища (+4 GB)

**Функции:**
- ✅ Все из STARTER +
- ✅ Расширенные расчёты зарплаты (аванс, премии)
- ✅ Фотоотчёты без ограничений
- ✅ Задачи + Kanban + Gantt диаграммы
- ✅ Telegram уведомления
- ✅ Priority support (ответ за 24 часа)
- ✅ Брендирование отчётов (логотип компании)

**Целевая аудитория:** Прорабы с постоянными бригадами

---

#### **BUSINESS - "Бизнес"** - 2490₽/мес (Renamed from BRIGADE)

**Early Bird:** 1790₽/мес (первые 500)

**Лимиты:**
- ✅ Неограниченное количество проектов
- ✅ 20 участников команды (+15 от PROFESSIONAL)
- ✅ 50 GB хранилища (+45 GB)

**Функции:**
- ✅ Все из PROFESSIONAL +
- ✅ API доступ + Webhooks
- ✅ Интеграция с 1С
- ✅ Белый label (custom domain)
- ✅ Dedicated support (ответ за 4 часа)
- ✅ Персональный менеджер
- ✅ Онбординг и обучение команды
- ✅ SLA 99.9% uptime

**Целевая аудитория:** Строительные компании, холдинги

---

#### **ENTERPRISE - "Корпоративный"** - Custom pricing (NEW!)

**Индивидуальные условия:**
- ✅ Неограниченно всё
- ✅ On-premise deployment (при необходимости)
- ✅ Кастомная разработка под задачи
- ✅ Dedicated infrastructure
- ✅ 24/7 phone support
- ✅ Персональная команда разработчиков
- ✅ SLA 99.95% uptime
- ✅ Compliance (GDPR, ISO 27001)

**Целевая аудитория:** Крупные застройщики, федеральные подрядчики

---

### 2. Add-ons (Дополнительные опции)

Позволяют гибко настраивать план без полного upgrade:

#### **Extra Storage** - +10 GB хранилища
- **Цена:** 200₽/мес
- **Доступно для:** STARTER, PROFESSIONAL, BUSINESS

#### **Extra Member** - +1 участник команды
- **Цена:** 150₽/мес за участника
- **Доступно для:** STARTER (max +2), PROFESSIONAL (max +5)

#### **Extra Project Slot** - +1 активный проект
- **Цена:** 250₽/мес
- **Доступно для:** STARTER (max +2), PROFESSIONAL (max +5)

#### **Advanced Analytics** - Расширенная аналитика
- **Цена:** 500₽/мес
- **Функции:**
  - Прогнозирование бюджета
  - AI-рекомендации по оптимизации
  - Custom dashboards
  - Экспорт в Power BI
- **Доступно для:** PROFESSIONAL, BUSINESS

#### **White Label Branding** - Персонализация
- **Цена:** 1000₽/мес
- **Функции:**
  - Custom domain (yourcompany.prorab.space)
  - Логотип компании вместо ProRab
  - Кастомные цвета интерфейса
  - Удаление всех ссылок на ProRab
- **Доступно для:** BUSINESS, ENTERPRISE

---

### 3. Годовая подписка (Annual Billing)

**Скидки при оплате за год:**
- STARTER: 5,900₽/год (вместо 7,080₽) - **экономия 17%**
- PROFESSIONAL: 12,900₽/год (вместо 15,480₽) - **экономия 17%**
- BUSINESS: 24,900₽/год (вместо 29,880₽) - **экономия 17%**

**Преимущества:**
- ✅ 2 месяца бесплатно
- ✅ Приоритет в support queue
- ✅ Ранний доступ к новым фичам
- ✅ Гарантия цены на год (не повысится)

---

### 4. Программа лояльности

#### **Referral Program** - Приведи друга
- **Вознаграждение:** Оба получают 1 месяц бесплатно
- **Условия:**
  - Друг должен быть на платном плане
  - Максимум 6 рефералов в год = 6 бесплатных месяцев
- **Цель:** Органический рост через word-of-mouth

#### **Long-term Discount** - Скидка за лояльность
- **12 месяцев подписки:** -5% навсегда
- **24 месяца подписки:** -10% навсегда
- **36+ месяцев подписки:** -15% навсегда
- **Цель:** Удержание клиентов (reduce churn)

#### **Seasonal Promotions**
- **Новый год (декабрь-январь):** -20% на первый месяц
- **1 Мая / День строителя:** -30% на годовую подписку
- **Black Friday:** -50% на первые 3 месяца
- **Цель:** Стимулировать покупки в низкий сезон

---

## 📈 Ценовая стратегия (Pricing Strategy)

### Value-Based Pricing

Цены основаны на value для клиента, а не на затратах:

#### STARTER (590₽/мес):
- **Экономия для клиента:** ~2000₽/мес (vs бумажная бухгалтерия)
- **ROI:** 3.4x за счёт сокращения времени на учёт
- **Value proposition:** "Организуй проекты без лишних затрат"

#### PROFESSIONAL (1290₽/мес):
- **Экономия:** ~5000₽/мес (vs наём бухгалтера на полставки)
- **ROI:** 3.9x + экономия на ошибках расчёта зарплаты
- **Value proposition:** "Контролируй бизнес как профи"

#### BUSINESS (2490₽/мес):
- **Экономия:** ~15,000₽/мес (vs ERP система + внедрение)
- **ROI:** 6x + масштабирование без доп. затрат
- **Value proposition:** "Управляй компанией на уровне enterprise"

---

### Psychological Pricing

#### Anchoring Effect
- **Самый дорогой план (BUSINESS)** - якорь для восприятия цены
- PROFESSIONAL кажется разумным в сравнении с BUSINESS
- STARTER выглядит как "выгодная сделка"

#### Decoy Effect
- FREE план - decoy для STARTER (дёшево, но неудобно)
- PROFESSIONAL - sweet spot между STARTER и BUSINESS

#### Price Ending Strategy
- Цены на "90" (590, 1290, 2490) - психологически ниже, чем "00"
- Исключение: round numbers для годовой подписки (12,900 вместо 12,990)

---

## 🎯 Конверсионная воронка (Conversion Funnel)

### Stage 1: Awareness (Осведомленность)
**Источники трафика:**
- 🔍 SEO (органика) - 40%
- 📱 Социальные сети (Telegram, VK) - 30%
- 👥 Referral program - 20%
- 📰 Контент-маркетинг (блог, кейсы) - 10%

**Цель:** 10,000 посетителей/месяц

---

### Stage 2: Trial Sign-up (Регистрация на FREE)
**Конверсия:** 15% (1,500 sign-ups/месяц)

**Триггеры:**
- ✅ Простая регистрация (Telegram OAuth)
- ✅ Onboarding за 3 минуты
- ✅ Видео-гайд "Как создать первый проект"
- ✅ Email drip campaign (5 писем за 14 дней)

**Метрики:**
- Time to first project: <10 минут
- Activation rate (создал проект): 60%

---

### Stage 3: FREE → STARTER Conversion
**Конверсия:** 25% (375 conversions/месяц)
**Триггер:** Достигнут лимит + prompt "Upgrade за 390₽/мес"

**In-app Prompts:**
- "Хотите добавить второй проект? Переходите на STARTER!"
- "История за 30 дней заполнилась. Unlock полную историю."
- "Уберите watermark и выглядите профессионально."

**Email Campaign:**
- Day 7: "Вы уже создали 5 задач! Unlock unlimited."
- Day 14: "Последний день FREE trial. Upgrade с -50%!"

---

### Stage 4: STARTER → PROFESSIONAL Upsell
**Конверсия:** 30% (112 upsells/месяц)
**Триггер:** Нужны больше проектов/участников + seasonal discount

**Upsell Moments:**
- Добавление 3-го проекта → "Перейдите на PROFESSIONAL за 890₽"
- Приглашение 3-го участника → upgrade prompt
- 3 месяца на STARTER → "Пора масштабироваться? -20% на upgrade"

**Value Messaging:**
- "Сэкономьте 5000₽/мес на бухгалтере"
- "Получите Gantt charts и продвинутую аналитику"
- "Priority support - ответ за 24 часа"

---

### Stage 5: Long-term Retention
**Goal:** Churn rate <5%/месяц
**LTV:** 20,000₽ (18 месяцев retention)

**Retention Tactics:**
- ✅ Quarterly Business Reviews (для BUSINESS клиентов)
- ✅ Персональный менеджер (BUSINESS+)
- ✅ Loyalty discounts (-5% after 12 months)
- ✅ Early access к новым фичам
- ✅ Exclusive webinars и обучение

**Churn Reduction:**
- Exit survey при отмене
- Retention offer (-30% на 3 месяца)
- Pause subscription option (вместо cancel)

---

## 💳 Payment Gateway Strategy

### YooKassa Integration (Primary)

**Преимущества:**
- ✅ Российский платёжный шлюз (соответствие 54-ФЗ)
- ✅ Поддержка всех популярных методов оплаты
- ✅ Автоплатежи (recurring payments)
- ✅ 2.8% комиссия (договорная при обороте >1M₽/мес)

**Поддерживаемые методы:**
- 💳 Банковские карты (Visa, MasterCard, Мир)
- 📱 СБП (Система Быстрых Платежей)
- 💰 ЮMoney (бывший Яндекс.Деньги)
- 🏦 Сбербанк Онлайн
- 📲 Apple Pay / Google Pay

---

### Alternative: CloudPayments (Backup)

**Когда использовать:**
- Если YooKassa недоступна
- Для international payments (доллары/евро)
- Split payments (например, для партнёрской программы)

**Комиссия:** 2.9% + 15₽ за транзакцию

---

### Invoicing (Для BUSINESS и ENTERPRISE)

**Оплата по счёту для юридических лиц:**
- ✅ Генерация счёта в 1 клик
- ✅ Отправка на email бухгалтера
- ✅ Автоматическая сверка платежа
- ✅ Выставление актов и УПД

**Payment terms:** Net 14 (оплата в течение 14 дней)

---

## 📊 Revenue Projections (Прогноз выручки)

### Year 1 (2025)

**Assumptions:**
- 10,000 visitors/month by Month 6
- 15% sign-up rate → 1,500 FREE users/month
- 25% FREE → STARTER conversion
- 30% STARTER → PROFESSIONAL upsell
- 10% PROFESSIONAL → BUSINESS upsell
- 5% monthly churn

**Monthly Revenue (by Month 12):**

| Plan | Users | Price (₽) | MRR (₽) |
|------|-------|-----------|---------|
| FREE | 3,000 | 0 | 0 |
| STARTER | 750 | 390 | 292,500 |
| PROFESSIONAL | 225 | 890 | 200,250 |
| BUSINESS | 25 | 1,790 | 44,750 |
| Add-ons | 100 | 300 (avg) | 30,000 |
| **TOTAL** | **4,100** | - | **567,500** |

**Annual Revenue (Year 1):** ~3,500,000₽ (ramp-up from Month 1)

---

### Year 2 (2026)

**Growth:** 150% YoY

**Monthly Revenue (by Month 24):**

| Plan | Users | Price (₽) | MRR (₽) |
|------|-------|-----------|---------|
| FREE | 5,000 | 0 | 0 |
| STARTER | 1,250 | 590 | 737,500 |
| PROFESSIONAL | 500 | 1,290 | 645,000 |
| BUSINESS | 50 | 2,490 | 124,500 |
| ENTERPRISE | 5 | 15,000 (avg) | 75,000 |
| Add-ons | 300 | 400 (avg) | 120,000 |
| **TOTAL** | **7,105** | - | **1,702,000** |

**Annual Revenue (Year 2):** ~15,000,000₽

---

### Year 3 (2027)

**Growth:** 100% YoY (slower, but sustainable)

**Monthly Revenue (by Month 36):**

| Plan | Users | Price (₽) | MRR (₽) |
|------|-------|-----------|---------|
| FREE | 8,000 | 0 | 0 |
| STARTER | 2,000 | 590 | 1,180,000 |
| PROFESSIONAL | 900 | 1,290 | 1,161,000 |
| BUSINESS | 100 | 2,490 | 249,000 |
| ENTERPRISE | 15 | 20,000 (avg) | 300,000 |
| Add-ons | 600 | 500 (avg) | 300,000 |
| **TOTAL** | **11,615** | - | **3,190,000** |

**Annual Revenue (Year 3):** ~35,000,000₽

**Break-even:** Month 18 (при операционных расходах ~500K₽/мес)

---

## 🎁 Promotional Strategies

### 1. Launch Promo (First 3 Months)

**Offer:** -50% на первый месяц для всех платных планов
**Goal:** Быстрый набор critical mass пользователей
**Budget:** 200,000₽ (в виде скидок)
**Expected Sign-ups:** 1,000 платных пользователей

---

### 2. Early Bird Program

**Tiers:**
- First 500 users: -40% навсегда
- Users 501-1000: -30% навсегда
- Users 1001-2000: -20% на первый год

**Badge на профиле:** "Early Bird #247"
**Exclusive perks:**
- Голосование за новые фичи
- Доступ к beta features
- Персональный thank you от основателя

---

### 3. Referral Incentives

**For Referrer:**
- 1 month free за каждого приведённого платного пользователя
- Bonus: 10+ referrals = upgrade на один план выше бесплатно

**For Referee:**
- 1 month free при регистрации по реферальной ссылке
- -20% на первый платёж

**Tracking:** Уникальные referral codes (например, `IVAN-2025`)

---

### 4. Partnership Program

**Target Partners:**
- 🏗️ Строительные магазины (Leroy Merlin, OBI)
- 🛠️ Поставщики инструмента
- 📚 Курсы для прорабов
- 🏦 Банки (кредиты для ИП в строительстве)

**Offer:**
- Partner gets 20% commission за каждую подписку
- Users get -25% через партнёрскую ссылку
- Co-branded landing pages

---

## 🛡️ Risk Mitigation

### Price Increase Strategy

**Когда повышать цены:**
- Year 2: +15% для новых пользователей
- Существующие пользователи: grandfather pricing (старая цена навсегда)
- Коммуникация: 3 месяца notice

---

### Churn Reduction Tactics

**Early Warning System:**
- Снижение активности → email "Всё ли в порядке?"
- Не создавал проектов 30 дней → offer персональной помощи
- Не логинился 60 дней → retention discount (-40% на 3 месяца)

**Win-back Campaign:**
- Cancelled users → email через 30 дней с новыми фичами
- Offer: "Вернитесь и получите 2 месяца бесплатно"

---

### Compliance & Legal

**ФЗ-54 (Онлайн-кассы):**
- ✅ Интеграция с Атол Онлайн через YooKassa
- ✅ Автоматическая отправка чеков на email

**НДС:**
- Включён в цену для юридических лиц
- ИП на упрощённой системе - без НДС

**Договор оферты:**
- Публичная оферта на сайте
- Акцепт при оплате первой подписки

---

## 📈 KPIs & Metrics

### Acquisition Metrics
- **CAC (Customer Acquisition Cost):** <1500₽
- **Conversion Rate (Visitor → Sign-up):** >15%
- **Activation Rate (Sign-up → First Project):** >60%

### Monetization Metrics
- **ARPU (Average Revenue Per User):** 450₽
- **FREE → PAID Conversion:** >25%
- **Upsell Rate (STARTER → PROFESSIONAL):** >30%
- **Annual Billing Adoption:** >40%

### Retention Metrics
- **Monthly Churn:** <5%
- **LTV (Lifetime Value):** >20,000₽
- **LTV/CAC Ratio:** >13:1 (excellent)
- **Net Revenue Retention:** >100%

### Growth Metrics
- **MRR Growth Rate:** >15%/месяц (Year 1)
- **YoY Revenue Growth:** >150% (Year 2)
- **User Base Growth:** >10,000 users by Month 12

---

## 🚀 Implementation Roadmap

### Phase 1: Foundation (Month 1-2) ✅ DONE
- ✅ Subscription database schema
- ✅ YooKassa integration
- ✅ Basic 3-tier pricing (LITE, FOREMAN, BRIGADE)
- ✅ Trial period (14 days)
- ✅ Limit enforcement

### Phase 2: Enhancement (Month 3-4) 🔄 IN PROGRESS
- [ ] Add FREE plan
- [ ] Add STARTER plan (replace LITE)
- [ ] Rename FOREMAN → PROFESSIONAL
- [ ] Rename BRIGADE → BUSINESS
- [ ] Add ENTERPRISE plan
- [ ] Annual billing option
- [ ] Add-ons implementation

### Phase 3: Optimization (Month 5-6)
- [ ] Referral program
- [ ] Loyalty discounts
- [ ] Advanced analytics add-on
- [ ] White label add-on
- [ ] In-app upgrade prompts
- [ ] Email drip campaigns

### Phase 4: Scale (Month 7-12)
- [ ] Partnership program
- [ ] Seasonal promotions
- [ ] Win-back campaigns
- [ ] Price optimization (A/B testing)
- [ ] International expansion (USD/EUR pricing)

---

## ✅ Next Steps

### Immediate Actions (This Week):
1. **Update plans.constants.ts** с новыми тарифами
2. **Update Prisma schema** добавить add-ons
3. **Update Pricing page** с 5 планами (FREE to ENTERPRISE)
4. **Implement annual billing** в subscription service
5. **Add upgrade prompts** на страницах проектов/участников

### Short-term (This Month):
6. **Referral system** - database + logic
7. **Email campaigns** - setup с Resend/SendGrid
8. **Add-ons UI** - в subscription management page
9. **Analytics dashboard** - для отслеживания MRR
10. **A/B testing setup** - для оптимизации conversion

### Medium-term (Next Quarter):
11. **Partnership program** - landing pages + tracking
12. **ENTERPRISE sales** - manual onboarding process
13. **Compliance** - договоры, НДС, ФЗ-54
14. **International** - multi-currency support

---

**Prepared by:** Claude Code
**Date:** 2025-12-12
**Version:** 2.0
**Status:** Ready for Implementation
**Estimated Impact:** +300% revenue by Year 2
