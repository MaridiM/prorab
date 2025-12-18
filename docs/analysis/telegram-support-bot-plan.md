# Telegram Support Bot - Implementation Plan

**Дата:** 2025-12-11
**Приоритет:** 🟡 Medium (Enhancement)
**Оценка:** 3-4 дня (24-32 часа)
**Статус:** Planning

---

## 📋 Оглавление

1. [Executive Summary](#executive-summary)
2. [Architecture Design](#architecture-design)
3. [Database Schema](#database-schema)
4. [Backend Implementation](#backend-implementation)
5. [Bot Handlers](#bot-handlers)
6. [Frontend Integration](#frontend-integration)
7. [Testing Strategy](#testing-strategy)
8. [Deployment](#deployment)

---

## Executive Summary

### Цель
Создать Telegram бота для технической поддержки пользователей ProRab.space с автоматическими ответами на FAQ и системой тикетов.

### Ключевые функции

**MVP (Must Have):**
- ✅ Приём обращений от пользователей
- ✅ Автоматические ответы на частые вопросы (FAQ)
- ✅ Пересылка сложных вопросов в группу поддержки
- ✅ Отслеживание статуса обращений
- ✅ История диалога с пользователем

**Future (Nice to Have):**
- 🔮 AI-powered ответы (GPT-4)
- 🔮 Multilingual support (EN/RU)
- 🔮 Satisfaction survey после решения
- 🔮 Analytics dashboard
- 🔮 Priority routing (VIP users)
- 🔮 Business hours & auto-replies

### Success Metrics

**Technical:**
- Response time < 30 seconds (auto-replies)
- Human response time < 15 minutes (business hours)
- Uptime > 99.5%
- Error rate < 1%

**Business:**
- Ticket resolution rate > 80%
- User satisfaction > 4.5/5
- FAQ usage rate > 40% (self-service)
- Average tickets per day < 20

---

## Architecture Design

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                    Telegram Support Bot                      │
└─────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┼───────────────┐
              │               │               │
              ▼               ▼               ▼
    ┌─────────────┐  ┌──────────────┐  ┌──────────────┐
    │   User      │  │   Support    │  │   Admin      │
    │   Chat      │  │   Group      │  │   Panel      │
    └─────────────┘  └──────────────┘  └──────────────┘
              │               │               │
              └───────────────┼───────────────┘
                              ▼
                    ┌──────────────────┐
                    │  Support Module  │
                    └──────────────────┘
                              │
              ┌───────────────┼───────────────┐
              ▼               ▼               ▼
    ┌─────────────┐  ┌──────────────┐  ┌──────────────┐
    │  Database   │  │     FAQ      │  │  Telegram    │
    │  (Tickets)  │  │   Engine     │  │     API      │
    └─────────────┘  └──────────────┘  └──────────────┘
```

### Flow Diagram

```
User sends message to @ProRabSupportBot
          ↓
Bot receives update
          ↓
     Is command? (/start, /help, /status)
          │
    Yes   │   No
      ↓   │   ↓
   Handle │  Check if FAQ keyword matches
   command│        │
          │   Yes  │  No
          │    ↓   │  ↓
          │  Send  │ Check if active ticket exists
          │  FAQ   │        │
          │  answer│   Yes  │  No
          │        │    ↓   │  ↓
          │        │  Add   │ Create new ticket
          │        │  to    │       ↓
          │        │ ticket │  Forward to support group
          │        │        │       ↓
          │        └────────┴──→ Send confirmation
          │                         │
          └─────────────────────────┘
                    ↓
          Store in database
                    ↓
         Log for analytics
```

---

## Database Schema

### New Models

#### 1. SupportTicket

```prisma
model SupportTicket {
  id                String             @id @default(uuid())
  ticketNumber      Int                @unique @default(autoincrement()) @map("ticket_number")
  userId            String?            @map("user_id")
  telegramChatId    String             @map("telegram_chat_id")
  telegramUsername  String?            @map("telegram_username")

  // Ticket data
  subject           String?
  description       String
  category          TicketCategory     @default(GENERAL)
  priority          TicketPriority     @default(NORMAL)
  status            TicketStatus       @default(OPEN)

  // Assignment
  assignedTo        String?            @map("assigned_to")
  supportGroupMsgId Int?               @map("support_group_msg_id")

  // Timestamps
  createdAt         DateTime           @default(now()) @map("created_at")
  updatedAt         DateTime           @updatedAt @map("updated_at")
  closedAt          DateTime?          @map("closed_at")
  firstResponseAt   DateTime?          @map("first_response_at")

  // Relations
  user              User?              @relation(fields: [userId], references: [id], onDelete: SetNull)
  messages          SupportMessage[]

  @@index([userId])
  @@index([telegramChatId])
  @@index([status])
  @@index([category])
  @@index([createdAt])
  @@map("support_tickets")
}

enum TicketCategory {
  GENERAL          // Общие вопросы
  PROJECTS         // Проекты и команды
  EXPENSES         // Расходы и финансы
  PHOTO_REPORTS    // Фотоотчёты
  PAYOUTS          // Выплаты
  SUBSCRIPTIONS    // Подписки и оплата
  TECHNICAL        // Технические проблемы
  FEATURE_REQUEST  // Запрос функции
  BUG_REPORT       // Баг репорт
}

enum TicketPriority {
  LOW
  NORMAL
  HIGH
  URGENT
}

enum TicketStatus {
  OPEN             // Открыт
  IN_PROGRESS      // В работе
  WAITING_USER     // Ждём ответа пользователя
  WAITING_SUPPORT  // Ждём ответа поддержки
  RESOLVED         // Решён
  CLOSED           // Закрыт
}
```

#### 2. SupportMessage

```prisma
model SupportMessage {
  id              String             @id @default(uuid())
  ticketId        String             @map("ticket_id")

  // Message data
  fromUserId      String?            @map("from_user_id")
  fromSupport     Boolean            @default(false) @map("from_support")
  message         String
  attachments     String[]           @default([])

  // Telegram data
  telegramMsgId   Int?               @map("telegram_msg_id")

  // Timestamps
  createdAt       DateTime           @default(now()) @map("created_at")

  // Relations
  ticket          SupportTicket      @relation(fields: [ticketId], references: [id], onDelete: Cascade)

  @@index([ticketId])
  @@index([createdAt])
  @@map("support_messages")
}
```

#### 3. FAQ Entry

```prisma
model FAQEntry {
  id              String             @id @default(uuid())

  // Content
  category        TicketCategory
  question        String
  answer          String
  keywords        String[]           @default([])

  // Metadata
  usageCount      Int                @default(0) @map("usage_count")
  isActive        Boolean            @default(true) @map("is_active")

  // Timestamps
  createdAt       DateTime           @default(now()) @map("created_at")
  updatedAt       DateTime           @updatedAt @map("updated_at")

  @@index([category])
  @@index([isActive])
  @@map("faq_entries")
}
```

### Update User Model

```prisma
model User {
  // ... existing fields

  // Support tickets
  supportTickets  SupportTicket[]
}
```

---

## Backend Implementation

### Module Structure

```
apps/api/src/modules/telegram-support/
├── telegram-support.module.ts
├── telegram-support.service.ts
├── telegram-support.bot.ts
├── faq.service.ts
├── dto/
│   ├── create-ticket.dto.ts
│   ├── update-ticket.dto.ts
│   └── send-message.dto.ts
├── models/
│   ├── support-ticket.model.ts
│   ├── support-message.model.ts
│   └── faq-entry.model.ts
└── constants/
    └── faq-data.ts
```

### TelegramSupportService

```typescript
import { Injectable, Logger } from '@nestjs/common'
import { PrismaService } from '../../core/prisma/prisma.service'
import { ConfigService } from '@nestjs/config'
import { TicketStatus, TicketCategory, TicketPriority } from '@prisma/client'

@Injectable()
export class TelegramSupportService {
  private readonly logger = new Logger(TelegramSupportService.name)

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  /**
   * Создать новый тикет
   */
  async createTicket(data: {
    telegramChatId: string
    telegramUsername?: string
    userId?: string
    description: string
    category?: TicketCategory
  }) {
    const ticket = await this.prisma.supportTicket.create({
      data: {
        telegramChatId: data.telegramChatId,
        telegramUsername: data.telegramUsername,
        userId: data.userId,
        description: data.description,
        category: data.category || TicketCategory.GENERAL,
        status: TicketStatus.OPEN,
        priority: TicketPriority.NORMAL,
      },
    })

    // Добавить первое сообщение
    await this.addMessage({
      ticketId: ticket.id,
      fromUserId: data.userId,
      fromSupport: false,
      message: data.description,
    })

    this.logger.log(`Support ticket #${ticket.ticketNumber} created`)
    return ticket
  }

  /**
   * Добавить сообщение к тикету
   */
  async addMessage(data: {
    ticketId: string
    fromUserId?: string
    fromSupport: boolean
    message: string
    telegramMsgId?: number
  }) {
    const message = await this.prisma.supportMessage.create({
      data: {
        ticketId: data.ticketId,
        fromUserId: data.fromUserId,
        fromSupport: data.fromSupport,
        message: data.message,
        telegramMsgId: data.telegramMsgId,
      },
    })

    // Обновить firstResponseAt если это первый ответ поддержки
    if (data.fromSupport) {
      await this.prisma.supportTicket.updateMany({
        where: {
          id: data.ticketId,
          firstResponseAt: null,
        },
        data: {
          firstResponseAt: new Date(),
          status: TicketStatus.IN_PROGRESS,
        },
      })
    }

    return message
  }

  /**
   * Получить активный тикет пользователя
   */
  async getActiveTicket(telegramChatId: string) {
    return this.prisma.supportTicket.findFirst({
      where: {
        telegramChatId,
        status: {
          in: [
            TicketStatus.OPEN,
            TicketStatus.IN_PROGRESS,
            TicketStatus.WAITING_SUPPORT,
          ],
        },
      },
      orderBy: { createdAt: 'desc' },
    })
  }

  /**
   * Получить тикет по номеру
   */
  async getTicketByNumber(ticketNumber: number) {
    return this.prisma.supportTicket.findUnique({
      where: { ticketNumber },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    })
  }

  /**
   * Обновить статус тикета
   */
  async updateTicketStatus(ticketId: string, status: TicketStatus) {
    const ticket = await this.prisma.supportTicket.update({
      where: { id: ticketId },
      data: {
        status,
        closedAt: status === TicketStatus.CLOSED ? new Date() : null,
      },
    })

    this.logger.log(
      `Support ticket #${ticket.ticketNumber} status changed to ${status}`,
    )
    return ticket
  }

  /**
   * Получить статистику
   */
  async getStatistics(userId?: string) {
    const where = userId ? { userId } : {}

    const [total, open, inProgress, resolved, avgResponseTime] =
      await Promise.all([
        this.prisma.supportTicket.count({ where }),
        this.prisma.supportTicket.count({
          where: { ...where, status: TicketStatus.OPEN },
        }),
        this.prisma.supportTicket.count({
          where: { ...where, status: TicketStatus.IN_PROGRESS },
        }),
        this.prisma.supportTicket.count({
          where: { ...where, status: TicketStatus.RESOLVED },
        }),
        this.calculateAverageResponseTime(userId),
      ])

    return {
      total,
      open,
      inProgress,
      resolved,
      avgResponseTime,
      resolutionRate: total > 0 ? (resolved / total) * 100 : 0,
    }
  }

  /**
   * Вычислить среднее время ответа
   */
  private async calculateAverageResponseTime(userId?: string) {
    const tickets = await this.prisma.supportTicket.findMany({
      where: userId ? { userId } : {},
      select: {
        createdAt: true,
        firstResponseAt: true,
      },
    })

    const times = tickets
      .filter((t) => t.firstResponseAt)
      .map(
        (t) =>
          (t.firstResponseAt!.getTime() - t.createdAt.getTime()) / 1000 / 60,
      ) // minutes

    return times.length > 0
      ? times.reduce((a, b) => a + b, 0) / times.length
      : 0
  }
}
```

### FAQService

```typescript
import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../core/prisma/prisma.service'
import { FAQ_DATA } from './constants/faq-data'

@Injectable()
export class FAQService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Поиск подходящего FAQ по ключевым словам
   */
  async findMatchingFAQ(message: string): Promise<FAQEntry | null> {
    const messageLower = message.toLowerCase()

    // Получить все активные FAQ
    const faqs = await this.prisma.fAQEntry.findMany({
      where: { isActive: true },
      orderBy: { usageCount: 'desc' },
    })

    // Найти лучшее совпадение
    for (const faq of faqs) {
      const hasMatch = faq.keywords.some((keyword) =>
        messageLower.includes(keyword.toLowerCase()),
      )

      if (hasMatch) {
        // Увеличить счётчик использования
        await this.prisma.fAQEntry.update({
          where: { id: faq.id },
          data: { usageCount: { increment: 1 } },
        })

        return faq
      }
    }

    return null
  }

  /**
   * Получить FAQ по категории
   */
  async getFAQByCategory(category: TicketCategory) {
    return this.prisma.fAQEntry.findMany({
      where: { category, isActive: true },
      orderBy: { usageCount: 'desc' },
    })
  }

  /**
   * Seed FAQ data (запустить один раз)
   */
  async seedFAQData() {
    const count = await this.prisma.fAQEntry.count()
    if (count > 0) return

    await this.prisma.fAQEntry.createMany({
      data: FAQ_DATA,
    })
  }
}
```

### FAQ Data Constants

```typescript
// apps/api/src/modules/telegram-support/constants/faq-data.ts
export const FAQ_DATA = [
  // PROJECTS
  {
    category: 'PROJECTS',
    question: 'Как создать новый проект?',
    answer:
      '📋 *Создание проекта:*\n\n' +
      '1. Откройте раздел "Проекты"\n' +
      '2. Нажмите кнопку "+ Новый проект"\n' +
      '3. Заполните название, адрес, бюджет\n' +
      '4. Нажмите "Создать"\n\n' +
      'После создания вы можете добавлять расходы и фотоотчёты.',
    keywords: [
      'создать проект',
      'новый проект',
      'добавить проект',
      'как создать',
    ],
  },
  {
    category: 'PROJECTS',
    question: 'Как добавить участников в команду?',
    answer:
      '👥 *Добавление участников:*\n\n' +
      '1. Откройте вашу команду\n' +
      '2. Перейдите во вкладку "Участники"\n' +
      '3. Нажмите "Пригласить участника"\n' +
      '4. Скопируйте пригласительную ссылку\n' +
      '5. Отправьте её коллеге\n\n' +
      'Участник сможет присоединиться по ссылке.',
    keywords: [
      'добавить участника',
      'пригласить',
      'команда',
      'сотрудник',
      'участники',
    ],
  },

  // EXPENSES
  {
    category: 'EXPENSES',
    question: 'Как добавить расход?',
    answer:
      '💰 *Добавление расхода:*\n\n' +
      '1. Откройте проект\n' +
      '2. Перейдите во вкладку "Расходы"\n' +
      '3. Нажмите "+ Новый расход"\n' +
      '4. Укажите название, сумму, категорию\n' +
      '5. При желании добавьте описание\n' +
      '6. Нажмите "Сохранить"\n\n' +
      'Расход автоматически вычтется из бюджета проекта.',
    keywords: ['добавить расход', 'новый расход', 'трата', 'затраты'],
  },

  // PHOTO_REPORTS
  {
    category: 'PHOTO_REPORTS',
    question: 'Как создать фотоотчёт?',
    answer:
      '📸 *Создание фотоотчёта:*\n\n' +
      '1. Откройте проект\n' +
      '2. Перейдите во вкладку "Фотоотчёты"\n' +
      '3. Нажмите "+ Новый отчёт"\n' +
      '4. Укажите название и описание\n' +
      '5. Загрузите фотографии\n' +
      '6. Нажмите "Опубликовать"\n\n' +
      'Можно поделиться публичной ссылкой с клиентом.',
    keywords: [
      'фотоотчёт',
      'фото',
      'отчёт',
      'загрузить фото',
      'добавить фото',
    ],
  },

  // SUBSCRIPTIONS
  {
    category: 'SUBSCRIPTIONS',
    question: 'Какие тарифы доступны?',
    answer:
      '💎 *Тарифные планы:*\n\n' +
      '🔹 *Лайт* - 290₽/мес (Early Bird)\n' +
      '   • 1 проект\n' +
      '   • 1 участник\n' +
      '   • 0.5 ГБ хранилища\n\n' +
      '🔸 *Прораб* - 690₽/мес (Early Bird)\n' +
      '   • 4 проекта\n' +
      '   • 3 участника\n' +
      '   • 2 ГБ хранилища\n\n' +
      '🔶 *Бригада* - 1490₽/мес (Early Bird)\n' +
      '   • Безлимит проектов\n' +
      '   • 10 участников\n' +
      '   • 10 ГБ хранилища\n\n' +
      '🎁 14 дней бесплатно для всех!',
    keywords: ['тарифы', 'цена', 'сколько стоит', 'подписка', 'планы'],
  },

  // TECHNICAL
  {
    category: 'TECHNICAL',
    question: 'Не могу войти в аккаунт',
    answer:
      '🔐 *Проблемы со входом:*\n\n' +
      '1. Проверьте правильность email и пароля\n' +
      '2. Попробуйте восстановить пароль:\n' +
      '   → Нажмите "Забыли пароль?"\n' +
      '   → Введите ваш email\n' +
      '   → Проверьте почту (в т.ч. спам)\n' +
      '3. Если не помогло - напишите нам\n\n' +
      'Мы поможем восстановить доступ.',
    keywords: ['не могу войти', 'забыл пароль', 'не заходит', 'вход'],
  },

  // GENERAL
  {
    category: 'GENERAL',
    question: 'Как связаться с поддержкой?',
    answer:
      '📞 *Контакты поддержки:*\n\n' +
      '• Telegram: @ProRabSupportBot (этот бот)\n' +
      '• Email: support@prorab.space\n' +
      '• Время работы: пн-пт 9:00-18:00 (МСК)\n\n' +
      'Опишите вашу проблему здесь, и мы обязательно поможем!',
    keywords: [
      'поддержка',
      'связаться',
      'контакт',
      'помощь',
      'support',
    ],
  },
]
```

---

## Bot Handlers

### TelegramSupportBot

```typescript
import { Injectable, Logger } from '@nestjs/common'
import { Update, Start, Help, Command, On, Ctx, InjectBot } from 'nestjs-telegraf'
import { Context, Telegraf } from 'telegraf'
import { TelegramSupportService } from './telegram-support.service'
import { FAQService } from './faq.service'
import { TicketCategory, TicketStatus } from '@prisma/client'

@Update()
@Injectable()
export class TelegramSupportBot {
  private readonly logger = new Logger(TelegramSupportBot.name)

  constructor(
    @InjectBot('support') private readonly bot: Telegraf<Context>,
    private readonly supportService: TelegramSupportService,
    private readonly faqService: FAQService,
  ) {}

  @Start()
  async onStart(@Ctx() ctx: Context) {
    const chatId = ctx.chat!.id.toString()
    const username = ctx.from?.username

    await ctx.reply(
      '👋 *Добро пожаловать в службу поддержки ProRab.space!*\n\n' +
        'Я помогу вам с любыми вопросами по использованию платформы.\n\n' +
        '*Доступные команды:*\n' +
        '/help - Часто задаваемые вопросы\n' +
        '/status - Статус моего обращения\n' +
        '/cancel - Отменить текущее обращение\n\n' +
        '📝 *Просто опишите вашу проблему*, и я постараюсь помочь!',
      { parse_mode: 'Markdown' },
    )
  }

  @Help()
  async onHelp(@Ctx() ctx: Context) {
    await ctx.reply(
      '📖 *Часто задаваемые вопросы*\n\n' +
        'Выберите категорию:',
      {
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [{ text: '📋 Проекты и команды', callback_data: 'faq_PROJECTS' }],
            [{ text: '💰 Расходы и финансы', callback_data: 'faq_EXPENSES' }],
            [
              {
                text: '📸 Фотоотчёты',
                callback_data: 'faq_PHOTO_REPORTS',
              },
            ],
            [
              {
                text: '💎 Подписки и оплата',
                callback_data: 'faq_SUBSCRIPTIONS',
              },
            ],
            [
              {
                text: '🔧 Технические проблемы',
                callback_data: 'faq_TECHNICAL',
              },
            ],
          ],
        },
      },
    )
  }

  @Command('status')
  async onStatus(@Ctx() ctx: Context) {
    const chatId = ctx.chat!.id.toString()

    const ticket = await this.supportService.getActiveTicket(chatId)

    if (!ticket) {
      await ctx.reply(
        '📊 *Статус обращений*\n\n' +
          'У вас нет активных обращений.\n\n' +
          'Если у вас есть вопрос - просто напишите его!',
        { parse_mode: 'Markdown' },
      )
      return
    }

    const statusEmoji = {
      OPEN: '🆕',
      IN_PROGRESS: '⏳',
      WAITING_USER: '⏸️',
      WAITING_SUPPORT: '⏳',
      RESOLVED: '✅',
      CLOSED: '🔒',
    }

    await ctx.reply(
      `📊 *Ваше обращение #${ticket.ticketNumber}*\n\n` +
        `Статус: ${statusEmoji[ticket.status]} ${ticket.status}\n` +
        `Создано: ${ticket.createdAt.toLocaleString('ru-RU')}\n\n` +
        `${ticket.description}`,
      { parse_mode: 'Markdown' },
    )
  }

  @Command('cancel')
  async onCancel(@Ctx() ctx: Context) {
    const chatId = ctx.chat!.id.toString()

    const ticket = await this.supportService.getActiveTicket(chatId)

    if (!ticket) {
      await ctx.reply('У вас нет активных обращений.')
      return
    }

    await this.supportService.updateTicketStatus(ticket.id, TicketStatus.CLOSED)

    await ctx.reply(
      `❌ Обращение #${ticket.ticketNumber} отменено.\n\n` +
        'Если у вас появятся вопросы - пишите в любое время!',
    )
  }

  @On('callback_query')
  async onCallbackQuery(@Ctx() ctx: any) {
    const data = ctx.callbackQuery.data

    if (data.startsWith('faq_')) {
      const category = data.replace('faq_', '') as TicketCategory

      const faqs = await this.faqService.getFAQByCategory(category)

      if (faqs.length === 0) {
        await ctx.answerCbQuery('В этой категории пока нет вопросов')
        return
      }

      const buttons = faqs.map((faq, index) => [
        {
          text: `${index + 1}. ${faq.question}`,
          callback_data: `faq_answer_${faq.id}`,
        },
      ])

      await ctx.editMessageText('Выберите вопрос:', {
        reply_markup: { inline_keyboard: buttons },
      })

      await ctx.answerCbQuery()
    } else if (data.startsWith('faq_answer_')) {
      const faqId = data.replace('faq_answer_', '')

      const faq = await this.faqService.prisma.fAQEntry.findUnique({
        where: { id: faqId },
      })

      if (faq) {
        await ctx.editMessageText(
          `*${faq.question}*\n\n${faq.answer}\n\n_Если это не помогло - опишите вашу проблему подробнее._`,
          {
            parse_mode: 'Markdown',
            reply_markup: {
              inline_keyboard: [
                [{ text: '« Назад к категориям', callback_data: 'faq_back' }],
              ],
            },
          },
        )

        // Increment usage counter (уже делается в findMatchingFAQ)
        await ctx.answerCbQuery()
      }
    } else if (data === 'faq_back') {
      await this.onHelp(ctx)
      await ctx.answerCbQuery()
    }
  }

  @On('text')
  async onText(@Ctx() ctx: any) {
    const chatId = ctx.chat.id.toString()
    const username = ctx.from?.username
    const message = ctx.message.text

    // Попробовать найти FAQ
    const faq = await this.faqService.findMatchingFAQ(message)

    if (faq) {
      await ctx.reply(
        `💡 *Возможно, это поможет:*\n\n` +
          `*${faq.question}*\n\n${faq.answer}\n\n` +
          `_Если это не то, что вы искали - опишите проблему подробнее._`,
        { parse_mode: 'Markdown' },
      )
      return
    }

    // Проверить есть ли активный тикет
    let ticket = await this.supportService.getActiveTicket(chatId)

    if (ticket) {
      // Добавить сообщение к существующему тикету
      await this.supportService.addMessage({
        ticketId: ticket.id,
        fromSupport: false,
        message,
        telegramMsgId: ctx.message.message_id,
      })

      // Переслать в группу поддержки
      await this.forwardToSupportGroup(ticket.ticketNumber, username, message)

      await ctx.reply(
        `📝 Сообщение добавлено к обращению #${ticket.ticketNumber}`,
      )
    } else {
      // Создать новый тикет
      ticket = await this.supportService.createTicket({
        telegramChatId: chatId,
        telegramUsername: username,
        description: message,
      })

      // Переслать в группу поддержки
      await this.forwardToSupportGroup(ticket.ticketNumber, username, message)

      await ctx.reply(
        `📝 *Обращение #${ticket.ticketNumber} создано*\n\n` +
          `Ваш вопрос передан в службу поддержки.\n` +
          `Мы ответим в течение 15 минут (в рабочее время).\n\n` +
          `Команда /status покажет статус обращения.`,
        { parse_mode: 'Markdown' },
      )
    }
  }

  /**
   * Переслать сообщение в группу поддержки
   */
  private async forwardToSupportGroup(
    ticketNumber: number,
    username: string | undefined,
    message: string,
  ) {
    const supportChatId = process.env.TELEGRAM_SUPPORT_CHAT_ID

    if (!supportChatId) {
      this.logger.warn('TELEGRAM_SUPPORT_CHAT_ID not set')
      return
    }

    const userInfo = username ? `@${username}` : 'Anonymous'

    await this.bot.telegram.sendMessage(
      supportChatId,
      `🆕 *Обращение #${ticketNumber}*\n` +
        `От: ${userInfo}\n\n` +
        `${message}\n\n` +
        `_Ответьте реплаем на это сообщение_`,
      { parse_mode: 'Markdown' },
    )
  }
}
```

---

## Frontend Integration

### GraphQL Schema

```graphql
type SupportTicket {
  id: ID!
  ticketNumber: Int!
  userId: ID
  category: TicketCategory!
  status: TicketStatus!
  priority: TicketPriority!
  subject: String
  description: String!
  createdAt: DateTime!
  updatedAt: DateTime!
  closedAt: DateTime
  messages: [SupportMessage!]!
}

type SupportMessage {
  id: ID!
  ticketId: ID!
  fromSupport: Boolean!
  message: String!
  createdAt: DateTime!
}

enum TicketCategory {
  GENERAL
  PROJECTS
  EXPENSES
  PHOTO_REPORTS
  PAYOUTS
  SUBSCRIPTIONS
  TECHNICAL
  FEATURE_REQUEST
  BUG_REPORT
}

enum TicketStatus {
  OPEN
  IN_PROGRESS
  WAITING_USER
  WAITING_SUPPORT
  RESOLVED
  CLOSED
}

enum TicketPriority {
  LOW
  NORMAL
  HIGH
  URGENT
}

type Query {
  # Получить мои тикеты
  myTickets(status: TicketStatus): [SupportTicket!]!

  # Получить тикет по ID
  supportTicket(id: ID!): SupportTicket

  # Статистика поддержки
  supportStatistics: SupportStatistics!
}

type SupportStatistics {
  total: Int!
  open: Int!
  inProgress: Int!
  resolved: Int!
  avgResponseTime: Float!
  resolutionRate: Float!
}

type Mutation {
  # Создать тикет (из веб-интерфейса)
  createSupportTicket(input: CreateSupportTicketInput!): SupportTicket!

  # Закрыть тикет
  closeSupportTicket(id: ID!): SupportTicket!
}

input CreateSupportTicketInput {
  category: TicketCategory!
  subject: String
  description: String!
}
```

### Support Page (Optional)

```tsx
// apps/web/src/app/(root)/(protected)/support/page.tsx
'use client'

import { useQuery, useMutation } from '@apollo/client/react'
import { Button, Card } from '@/packages/components'

export default function SupportPage() {
  const { data, loading } = useQuery(MY_TICKETS_QUERY)
  const [createTicket] = useMutation(CREATE_TICKET_MUTATION)

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Поддержка</h1>

      {/* Telegram Bot CTA */}
      <Card className="mb-6 p-6 bg-[#24A1DE]/10 border-[#24A1DE]/20">
        <h2 className="text-xl font-semibold mb-2">
          💬 Быстрая помощь в Telegram
        </h2>
        <p className="text-muted-foreground mb-4">
          Получите мгновенную помощь от нашего бота поддержки
        </p>
        <Button
          onClick={() => window.open('https://t.me/ProRabSupportBot', '_blank')}
          className="bg-[#24A1DE] hover:bg-[#24A1DE]/90"
        >
          Открыть @ProRabSupportBot
        </Button>
      </Card>

      {/* Ticket List */}
      <div className="grid gap-4">
        {data?.myTickets.map((ticket) => (
          <Card key={ticket.id} className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold">
                  #{ticket.ticketNumber} - {ticket.subject || 'Обращение'}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {ticket.description}
                </p>
                <div className="flex gap-2 mt-2">
                  <span className="text-xs px-2 py-1 bg-secondary rounded">
                    {ticket.category}
                  </span>
                  <span className="text-xs px-2 py-1 bg-primary/10 rounded">
                    {ticket.status}
                  </span>
                </div>
              </div>
              <span className="text-xs text-muted-foreground">
                {new Date(ticket.createdAt).toLocaleDateString('ru-RU')}
              </span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
```

---

## Testing Strategy

### Unit Tests

```typescript
// telegram-support.service.spec.ts
describe('TelegramSupportService', () => {
  it('should create support ticket')
  it('should add message to ticket')
  it('should get active ticket')
  it('should update ticket status')
  it('should calculate statistics')
})

// faq.service.spec.ts
describe('FAQService', () => {
  it('should find matching FAQ by keyword')
  it('should return null if no match')
  it('should increment usage count')
  it('should get FAQ by category')
})
```

### E2E Tests

```typescript
// telegram-support.e2e-spec.ts
describe('Telegram Support Bot', () => {
  it('should respond to /start command')
  it('should show FAQ categories on /help')
  it('should create ticket from user message')
  it('should add message to existing ticket')
  it('should forward message to support group')
  it('should show ticket status on /status')
  it('should close ticket on /cancel')
})
```

---

## Deployment

### Environment Variables

```env
# Support Bot
TELEGRAM_SUPPORT_BOT_TOKEN=987654321:XYZabc...
TELEGRAM_SUPPORT_BOT_USERNAME=ProRabSupportBot
TELEGRAM_SUPPORT_CHAT_ID=-1001234567890
```

### Migration

```bash
# Create tables
npx prisma migrate dev --name add_support_bot_tables

# Seed FAQ data
# Run once in production
```

### Monitoring

```typescript
// Log all support interactions
this.logger.log(`Ticket #${ticketNumber} created`)
this.logger.log(`FAQ matched: ${faq.question}`)
this.logger.log(`Message forwarded to support group`)
```

---

## Timeline & Effort

### Phase 1: Database & Core (8 hours)
- ✅ Prisma schema (SupportTicket, SupportMessage, FAQEntry)
- ✅ TelegramSupportService implementation
- ✅ FAQService implementation
- ✅ FAQ data constants

### Phase 2: Bot Handlers (8 hours)
- ✅ TelegramSupportBot commands (/start, /help, /status, /cancel)
- ✅ Message handler (FAQ matching, ticket creation)
- ✅ Callback query handler (FAQ navigation)
- ✅ Support group forwarding

### Phase 3: Integration (4 hours)
- ✅ TelegramSupportModule setup
- ✅ Multi-bot configuration (OAuth + Support)
- ✅ Environment setup
- ✅ Testing

### Phase 4: Frontend (Optional, 4 hours)
- ✅ GraphQL schema
- ✅ Support page with ticket list
- ✅ Telegram bot CTA

**Total:** 24 hours (3 days)

---

## Success Criteria

- ✅ Bot responds to all commands
- ✅ FAQ matches work correctly
- ✅ Tickets are created and tracked
- ✅ Messages forwarded to support group
- ✅ Support team can reply from group
- ✅ Statistics are accurate
- ✅ No errors in production

---

## Future Enhancements

1. **AI-Powered Responses** (GPT-4)
   - Automatic answer generation
   - Context-aware suggestions
   - Multilingual support

2. **Advanced Analytics**
   - Dashboard with metrics
   - Popular issues tracking
   - Resolution time trends
   - Customer satisfaction scores

3. **Priority Routing**
   - VIP users get faster response
   - Urgent issues flagged automatically
   - Smart category detection

4. **Business Hours**
   - Auto-reply outside business hours
   - SLA tracking
   - Escalation rules

5. **Knowledge Base**
   - Searchable FAQ
   - Video tutorials
   - Step-by-step guides

---

## Conclusion

Support Bot будет значительно улучшать user experience, снижая нагрузку на поддержку через автоматические FAQ ответы, и обеспечивая быстрый feedback loop для сложных вопросов через систему тикетов.

**Ready to implement! 🚀**
