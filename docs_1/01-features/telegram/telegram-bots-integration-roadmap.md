# Telegram Bots Integration Roadmap

**Дата:** 2025-12-11
**Статус:** 🚀 Готов к реализации
**Боты:** @ProRabSpaceBot (OAuth) + @ProRabSupportBot (Support)

---

## 🎯 Цель

Полная интеграция двух Telegram ботов в приложение ProRab.space:
1. **@ProRabSpaceBot** - OAuth авторизация (уже реализован Phase 1-4, нужно настроить)
2. **@ProRabSupportBot** - Техническая поддержка (нужно реализовать Phase 1-4)

---

## 📊 Текущее состояние

### ✅ @ProRabSpaceBot (OAuth Bot)
**Статус:** Код готов (Phase 1-4), нужна конфигурация
- ✅ Backend: TelegramModule, TelegramAuthService, TelegramBot
- ✅ Frontend: TelegramLoginButton component
- ✅ Database: OAuth поля + TelegramAuthToken model
- ✅ GraphQL: initTelegramAuth + checkTelegramAuth
- ⏳ **Нужно:** Добавить TELEGRAM_BOT_TOKEN в .env и протестировать

### 📋 @ProRabSupportBot (Support Bot)
**Статус:** Полностью спланирован, код не написан
- 📋 Backend: Нужно реализовать (TelegramSupportService, TelegramSupportBot)
- 📋 Database: Нужно создать 3 модели (SupportTicket, SupportMessage, FAQEntry)
- 📋 Multi-bot config: Настроить второй бот в TelegrafModule
- 📋 **Нужно:** Реализовать Phase 1-4 (24 часа)

---

## 🗺️ Implementation Roadmap

### Phase 1: OAuth Bot Configuration & Testing (2 часа)
**Цель:** Настроить @ProRabSpaceBot и протестировать OAuth flow

**Tasks:**
1. ✅ Добавить TELEGRAM_BOT_TOKEN в .env
2. ✅ Добавить TELEGRAM_BOT_USERNAME=ProRabSpaceBot в .env
3. ✅ Запустить API сервер
4. ✅ Протестировать OAuth flow:
   - Открыть /auth/login
   - Нажать "Войти через Telegram"
   - Проверить deep link (t.me/ProRabSpaceBot?start=auth_TOKEN)
   - Нажать Start в боте
   - Проверить автоматический вход на сайте
5. ✅ Проверить логи на ошибки
6. ✅ Убедиться что chat_id сохраняется в User.telegramChatId

**Результат:**
- ✅ OAuth Bot полностью функционален
- ✅ Пользователи могут входить через Telegram
- ✅ Chat ID собирается для будущих уведомлений

**Время:** ~2 часа (включая тестирование и fix багов)

---

### Phase 2: Support Bot - Database & Backend Core (8 часов)
**Цель:** Создать database models и core services для Support Bot

**Tasks:**

#### 2.1. Database Schema (1 час)
```prisma
// apps/api/prisma/schema.prisma

model SupportTicket {
  id          String   @id @default(uuid())
  userId      String   @map("user_id")
  telegramChatId String @map("telegram_chat_id")
  subject     String?
  status      SupportTicketStatus @default(OPEN)
  priority    SupportTicketPriority @default(MEDIUM)
  category    String?
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")
  closedAt    DateTime? @map("closed_at")

  user        User @relation(fields: [userId], references: [id], onDelete: Cascade)
  messages    SupportMessage[]

  @@index([userId])
  @@index([telegramChatId])
  @@index([status])
  @@map("support_tickets")
}

model SupportMessage {
  id          String   @id @default(uuid())
  ticketId    String   @map("ticket_id")
  fromUser    Boolean  @default(true) @map("from_user")
  message     String   @db.Text
  createdAt   DateTime @default(now()) @map("created_at")

  ticket      SupportTicket @relation(fields: [ticketId], references: [id], onDelete: Cascade)

  @@index([ticketId])
  @@map("support_messages")
}

model FAQEntry {
  id          String   @id @default(uuid())
  question    String
  answer      String   @db.Text
  category    String
  keywords    String[] // Для keyword matching
  views       Int      @default(0)
  helpful     Int      @default(0)
  notHelpful  Int      @default(0)
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  @@index([category])
  @@map("faq_entries")
}

enum SupportTicketStatus {
  OPEN
  IN_PROGRESS
  WAITING_USER
  RESOLVED
  CLOSED
}

enum SupportTicketPriority {
  LOW
  MEDIUM
  HIGH
  URGENT
}
```

**Tasks:**
- ✅ Добавить 3 модели в schema.prisma
- ✅ Добавить relation в User model: `supportTickets SupportTicket[]`
- ✅ Запустить `prisma db push`
- ✅ Запустить `prisma generate`

#### 2.2. TelegramSupportService (3 часа)
```typescript
// apps/api/src/modules/telegram/telegram-support.service.ts

@Injectable()
export class TelegramSupportService {
  constructor(
    private prisma: PrismaService,
  ) {}

  // Ticket Management
  async createTicket(userId: string, chatId: string): Promise<SupportTicket>
  async getActiveTicket(chatId: string): Promise<SupportTicket | null>
  async closeTicket(ticketId: string): Promise<void>
  async getTicketById(ticketId: string): Promise<SupportTicket>

  // Message Management
  async addMessage(ticketId: string, message: string, fromUser: boolean): Promise<SupportMessage>
  async getTicketMessages(ticketId: string): Promise<SupportMessage[]>

  // Statistics
  async getUserTickets(userId: string): Promise<SupportTicket[]>
  async getTicketStats(ticketId: string): Promise<{ messageCount: number, responseTime: number }>
}
```

**Tasks:**
- ✅ Создать telegram-support.service.ts
- ✅ Реализовать все методы
- ✅ Добавить логирование

#### 2.3. FAQService (2 часа)
```typescript
// apps/api/src/modules/telegram/faq.service.ts

@Injectable()
export class FAQService {
  constructor(private prisma: PrismaService) {}

  // FAQ Search
  async searchFAQ(query: string): Promise<FAQEntry[]>
  async getFAQsByCategory(category: string): Promise<FAQEntry[]>
  async getFAQById(id: string): Promise<FAQEntry>

  // FAQ Management
  async createFAQ(data: CreateFAQInput): Promise<FAQEntry>
  async updateFAQ(id: string, data: UpdateFAQInput): Promise<FAQEntry>
  async deleteFAQ(id: string): Promise<void>

  // Analytics
  async incrementViews(id: string): Promise<void>
  async markHelpful(id: string, helpful: boolean): Promise<void>
}
```

**Tasks:**
- ✅ Создать faq.service.ts
- ✅ Реализовать keyword matching algorithm
- ✅ Создать FAQ data seed (7 entries)

#### 2.4. FAQ Data Seed (1 час)
```typescript
// apps/api/prisma/seed-faq.ts

const FAQ_DATA = [
  {
    question: 'Как создать новый проект?',
    answer: '...',
    category: 'projects',
    keywords: ['создать', 'проект', 'новый'],
  },
  // ... 6 more FAQs
]
```

**Tasks:**
- ✅ Создать seed-faq.ts
- ✅ Добавить 7 FAQ entries
- ✅ Запустить seed

#### 2.5. Update TelegramModule (1 час)
```typescript
// apps/api/src/modules/telegram/telegram.module.ts

@Module({
  imports: [
    TelegrafModule.forRootAsync({
      botName: 'oauth',
      useFactory: (config: ConfigService) => ({
        token: config.get('telegram.botToken'),
      }),
      inject: [ConfigService],
    }),
    TelegrafModule.forRootAsync({
      botName: 'support',
      useFactory: (config: ConfigService) => ({
        token: config.get('telegram.supportBotToken'),
      }),
      inject: [ConfigService],
    }),
    PrismaModule,
  ],
  providers: [
    TelegramAuthService,
    TelegramSupportService,
    FAQService,
    TelegramBot, // OAuth bot
    TelegramSupportBot, // Support bot
  ],
  exports: [TelegramAuthService, TelegramSupportService, FAQService],
})
export class TelegramModule {}
```

**Tasks:**
- ✅ Настроить multi-bot configuration
- ✅ Добавить TelegramSupportService и FAQService
- ✅ Export новые сервисы

**Результат Phase 2:**
- ✅ Database models созданы
- ✅ TelegramSupportService реализован
- ✅ FAQService реализован
- ✅ FAQ data seeded
- ✅ Multi-bot configuration настроен

**Время:** ~8 часов

---

### Phase 3: Support Bot - Bot Handlers (8 часов)
**Цель:** Реализовать TelegramSupportBot с командами и message handling

**Tasks:**

#### 3.1. TelegramSupportBot Core (2 часа)
```typescript
// apps/api/src/modules/telegram/telegram-support.bot.ts

@Update()
export class TelegramSupportBot {
  constructor(
    @InjectBot('support') private bot: Telegraf<Context>,
    private supportService: TelegramSupportService,
    private faqService: FAQService,
    private usersService: UsersService,
  ) {}

  @Start()
  async onStart(@Ctx() ctx: Context): Promise<void>

  @Help()
  async onHelp(@Ctx() ctx: Context): Promise<void>

  @Command('status')
  async onStatus(@Ctx() ctx: Context): Promise<void>

  @Command('cancel')
  async onCancel(@Ctx() ctx: Context): Promise<void>

  @On('text')
  async onText(@Ctx() ctx: Context): Promise<void>

  @On('callback_query')
  async onCallbackQuery(@Ctx() ctx: Context): Promise<void>
}
```

**Tasks:**
- ✅ Создать telegram-support.bot.ts
- ✅ Inject support bot instance
- ✅ Реализовать базовые команды

#### 3.2. /start Command (1 час)
```typescript
@Start()
async onStart(@Ctx() ctx: Context): Promise<void> {
  const chatId = ctx.chat!.id.toString()

  // Проверить есть ли пользователь с этим chat_id
  const user = await this.usersService.findByTelegramChatId(chatId)

  if (!user) {
    await ctx.reply(
      '👋 Добро пожаловать в техническую поддержку ProRab.space!\n\n' +
      '⚠️ Для использования бота, сначала авторизуйтесь на сайте через @ProRabSpaceBot\n\n' +
      'После этого вы сможете:\n' +
      '• Задавать вопросы\n' +
      '• Просматривать FAQ\n' +
      '• Отслеживать статус обращений',
    )
    return
  }

  await ctx.reply(
    '👋 Здравствуйте!\n\n' +
    'Я бот технической поддержки ProRab.space\n\n' +
    'Выберите действие:',
    Markup.inlineKeyboard([
      [Markup.button.callback('📚 FAQ (Частые вопросы)', 'faq')],
      [Markup.button.callback('💬 Задать вопрос', 'ask_question')],
      [Markup.button.callback('📊 Мои обращения', 'my_tickets')],
    ]),
  )
}
```

#### 3.3. /help & FAQ Navigation (2 часа)
```typescript
@Help()
async onHelp(@Ctx() ctx: Context): Promise<void> {
  await ctx.reply(
    '📚 *Справка по командам*\n\n' +
    '/start - Главное меню\n' +
    '/help - Эта справка\n' +
    '/status - Статус моего обращения\n' +
    '/cancel - Отменить текущее обращение\n\n' +
    '*FAQ Категории:*\n' +
    '1️⃣ Проекты и команды\n' +
    '2️⃣ Расходы и финансы\n' +
    '3️⃣ Фотоотчёты\n' +
    '4️⃣ Технические проблемы\n\n' +
    'Просто напишите свой вопрос, и я постараюсь помочь!',
    { parse_mode: 'Markdown' },
  )
}

@On('callback_query')
async onCallbackQuery(@Ctx() ctx: Context): Promise<void> {
  const callbackQuery = (ctx as any).callbackQuery
  const data = callbackQuery.data

  if (data === 'faq') {
    await this.showFAQCategories(ctx)
  } else if (data.startsWith('faq_category_')) {
    const category = data.replace('faq_category_', '')
    await this.showFAQByCategory(ctx, category)
  } else if (data.startsWith('faq_')) {
    const faqId = data.replace('faq_', '')
    await this.showFAQDetails(ctx, faqId)
  } else if (data === 'ask_question') {
    await this.startTicketCreation(ctx)
  }

  await ctx.answerCbQuery()
}
```

#### 3.4. Message Handling & Ticket Creation (2 часа)
```typescript
@On('text')
async onText(@Ctx() ctx: Context): Promise<void> {
  const chatId = ctx.chat!.id.toString()
  const text = (ctx.message as any).text

  // Проверить авторизацию
  const user = await this.usersService.findByTelegramChatId(chatId)
  if (!user) {
    await ctx.reply('⚠️ Сначала авторизуйтесь через @ProRabSpaceBot')
    return
  }

  // Поиск в FAQ
  const faqs = await this.faqService.searchFAQ(text)

  if (faqs.length > 0) {
    await ctx.reply(
      '💡 Возможно, вам помогут эти статьи:',
      Markup.inlineKeyboard(
        faqs.slice(0, 3).map(faq => [
          Markup.button.callback(faq.question, `faq_${faq.id}`)
        ])
      )
    )

    await ctx.reply(
      'Если не нашли ответ, создам обращение в поддержку',
      Markup.inlineKeyboard([
        [Markup.button.callback('✅ Создать обращение', 'create_ticket')],
        [Markup.button.callback('❌ Отмена', 'cancel')],
      ])
    )
  } else {
    // Сразу создать тикет
    await this.createTicketFromMessage(ctx, user, text)
  }
}

async createTicketFromMessage(ctx: Context, user: User, message: string): Promise<void> {
  const chatId = ctx.chat!.id.toString()

  // Создать тикет
  const ticket = await this.supportService.createTicket(user.id, chatId)

  // Добавить первое сообщение
  await this.supportService.addMessage(ticket.id, message, true)

  await ctx.reply(
    `📝 *Обращение #${ticket.id.slice(0, 8)} создано*\n\n` +
    `Статус: ${ticket.status}\n` +
    `Приоритет: ${ticket.priority}\n\n` +
    'Специалист поддержки ответит в ближайшее время.',
    { parse_mode: 'Markdown' }
  )

  // Отправить в группу поддержки
  await this.forwardToSupportGroup(ticket, message)
}
```

#### 3.5. Support Group Integration (1 час)
```typescript
async forwardToSupportGroup(ticket: SupportTicket, message: string): Promise<void> {
  const supportChatId = this.configService.get('telegram.supportChatId')

  if (!supportChatId) {
    this.logger.warn('TELEGRAM_SUPPORT_CHAT_ID not configured')
    return
  }

  const user = await this.usersService.findById(ticket.userId)

  await this.bot.telegram.sendMessage(
    supportChatId,
    `🆕 *Новое обращение #${ticket.id.slice(0, 8)}*\n\n` +
    `👤 Пользователь: ${user.fullName || 'Без имени'}\n` +
    `📧 Email: ${user.email}\n` +
    `📱 Telegram: @${user.telegramUsername || 'нет'}\n\n` +
    `💬 Сообщение:\n${message}\n\n` +
    `Ответьте на это сообщение, чтобы ответить пользователю`,
    {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [
            { text: '✅ Взять в работу', callback_data: `ticket_take_${ticket.id}` },
            { text: '🔴 Закрыть', callback_data: `ticket_close_${ticket.id}` },
          ],
        ],
      },
    }
  )
}

// Handle replies from support group
@Hears(/^#(\w+)/)
async onSupportReply(@Ctx() ctx: Context): Promise<void> {
  const chatId = ctx.chat!.id.toString()
  const supportChatId = this.configService.get('telegram.supportChatId')

  if (chatId !== supportChatId) return

  const replyTo = (ctx.message as any).reply_to_message
  if (!replyTo) return

  const ticketIdMatch = replyTo.text.match(/#(\w+)/)
  if (!ticketIdMatch) return

  const ticketId = ticketIdMatch[1]
  const message = (ctx.message as any).text

  // Добавить ответ в тикет
  await this.supportService.addMessage(ticketId, message, false)

  // Отправить пользователю
  const ticket = await this.supportService.getTicketById(ticketId)
  await this.bot.telegram.sendMessage(
    ticket.telegramChatId,
    `💬 *Ответ от поддержки:*\n\n${message}`,
    { parse_mode: 'Markdown' }
  )

  await ctx.reply(`✅ Ответ отправлен пользователю`)
}
```

**Результат Phase 3:**
- ✅ TelegramSupportBot реализован
- ✅ 7 команд работают
- ✅ FAQ navigation с inline buttons
- ✅ Ticket creation flow
- ✅ Support group integration
- ✅ Reply routing работает

**Время:** ~8 часов

---

### Phase 4: GraphQL API (Optional) (4 часа)
**Цель:** Добавить GraphQL API для support tickets (опционально)

**Tasks:**

#### 4.1. GraphQL Types & DTOs (1 час)
```typescript
// apps/api/src/modules/telegram/models/support-ticket.model.ts
@ObjectType()
export class SupportTicket {
  @Field(() => ID)
  id: string

  @Field()
  userId: string

  @Field()
  status: SupportTicketStatus

  @Field()
  priority: SupportTicketPriority

  @Field(() => [SupportMessage])
  messages: SupportMessage[]

  @Field()
  createdAt: Date

  @Field({ nullable: true })
  closedAt?: Date
}

// DTOs
export class CreateSupportTicketInput {
  @Field()
  message: string

  @Field({ nullable: true })
  category?: string
}
```

#### 4.2. TelegramResolver (2 часа)
```typescript
// apps/api/src/modules/telegram/telegram.resolver.ts
@Resolver()
export class TelegramResolver {
  constructor(
    private supportService: TelegramSupportService,
    private faqService: FAQService,
  ) {}

  @Query(() => [SupportTicket])
  @UseGuards(AuthGuard)
  async myTickets(@CurrentUser() user: User): Promise<SupportTicket[]> {
    return this.supportService.getUserTickets(user.id)
  }

  @Query(() => SupportTicket)
  @UseGuards(AuthGuard)
  async ticket(@Args('id') id: string): Promise<SupportTicket> {
    return this.supportService.getTicketById(id)
  }

  @Mutation(() => SupportTicket)
  @UseGuards(AuthGuard)
  async createSupportTicket(
    @CurrentUser() user: User,
    @Args('input') input: CreateSupportTicketInput,
  ): Promise<SupportTicket> {
    // Create via service
  }

  @Mutation(() => Boolean)
  @UseGuards(AuthGuard)
  async closeTicket(@Args('id') id: string): Promise<boolean> {
    await this.supportService.closeTicket(id)
    return true
  }
}
```

#### 4.3. Frontend GraphQL Queries (1 час)
```graphql
# apps/web/src/packages/api/graphql/support.graphql

query MyTickets {
  myTickets {
    id
    status
    priority
    createdAt
    closedAt
    messages {
      id
      fromUser
      message
      createdAt
    }
  }
}

mutation CreateSupportTicket($input: CreateSupportTicketInput!) {
  createSupportTicket(input: $input) {
    id
    status
  }
}
```

**Результат Phase 4:**
- ✅ GraphQL API для tickets
- ✅ Frontend может показать список обращений
- ⏳ UI страница /support (optional)

**Время:** ~4 часа (optional)

---

### Phase 5: Testing & Deployment (4 часа)
**Цель:** Протестировать оба бота и задеплоить

**Tasks:**

#### 5.1. Local Testing (2 часа)
**OAuth Bot (@ProRabSpaceBot):**
- ✅ Test /start command
- ✅ Test OAuth flow (полный цикл)
- ✅ Test chat_id сохранение
- ✅ Test session creation

**Support Bot (@ProRabSupportBot):**
- ✅ Test /start (unauthorized user)
- ✅ Test /start (authorized user)
- ✅ Test FAQ search
- ✅ Test FAQ navigation (inline buttons)
- ✅ Test ticket creation
- ✅ Test support group forwarding
- ✅ Test reply routing (support → user)
- ✅ Test /status command
- ✅ Test /cancel command

#### 5.2. Environment Configuration (1 час)
```env
# apps/api/.env

# OAuth Bot
TELEGRAM_BOT_TOKEN=<your_oauth_bot_token>
TELEGRAM_BOT_USERNAME=ProRabSpaceBot
TELEGRAM_AUTH_TOKEN_TTL=600000

# Support Bot
TELEGRAM_SUPPORT_BOT_TOKEN=<your_support_bot_token>
TELEGRAM_SUPPORT_BOT_USERNAME=ProRabSupportBot
TELEGRAM_SUPPORT_CHAT_ID=<your_support_group_chat_id>
```

**Tasks:**
- ✅ Добавить все env variables
- ✅ Создать support группу
- ✅ Добавить @ProRabSupportBot в группу
- ✅ Сделать бота админом группы
- ✅ Получить chat_id группы

#### 5.3. Production Deployment (1 час)
- ✅ Setup webhooks (вместо polling)
- ✅ Configure SSL certificates
- ✅ Deploy to production
- ✅ Test production bots
- ✅ Monitor logs

**Результат Phase 5:**
- ✅ Оба бота протестированы
- ✅ Production deployment complete
- ✅ Monitoring настроен

**Время:** ~4 часа

---

## 📊 Итоговая оценка

### Временные затраты

| Phase | Описание | Время | Статус |
|-------|----------|-------|--------|
| Phase 1 | OAuth Bot Configuration & Testing | 2 часа | ⏳ To Do |
| Phase 2 | Support Bot - Database & Backend | 8 часов | ⏳ To Do |
| Phase 3 | Support Bot - Bot Handlers | 8 часов | ⏳ To Do |
| Phase 4 | GraphQL API (Optional) | 4 часа | 📋 Optional |
| Phase 5 | Testing & Deployment | 4 часов | ⏳ To Do |
| **ИТОГО** | **Обязательные фазы** | **22 часа** | **~3 дня** |
| **С Optional** | **Все фазы** | **26 часов** | **~3.5 дня** |

### Файловая структура

**Новые файлы (Phase 2-3):**
```
apps/api/
├── prisma/
│   ├── schema.prisma (updated)
│   └── seed-faq.ts (new)
├── src/modules/telegram/
│   ├── telegram.module.ts (updated)
│   ├── telegram-support.service.ts (new)
│   ├── telegram-support.bot.ts (new)
│   ├── faq.service.ts (new)
│   ├── models/
│   │   ├── support-ticket.model.ts (new)
│   │   └── support-message.model.ts (new)
│   ├── dto/
│   │   ├── create-support-ticket.input.ts (new)
│   │   └── create-faq.input.ts (new)
│   └── enums/
│       ├── support-ticket-status.enum.ts (new)
│       └── support-ticket-priority.enum.ts (new)
```

**Оценка:**
- ~15 новых файлов
- ~1500 lines of code
- 3 новые database models

---

## 🎯 Порядок выполнения

### Сегодня (2025-12-11):

**1. Phase 1: OAuth Bot Configuration (2 часа)**
- ✅ Добавить TELEGRAM_BOT_TOKEN в .env
- ✅ Запустить API
- ✅ Протестировать OAuth flow
- ✅ Fix любые баги

**2. Phase 2.1: Database Schema (1 час)**
- ✅ Добавить 3 модели в schema.prisma
- ✅ Запустить migration

**3. Phase 2.2-2.5: Backend Core (7 часов)**
- ✅ TelegramSupportService
- ✅ FAQService
- ✅ FAQ seed data
- ✅ Multi-bot configuration

### Завтра (2025-12-12):

**4. Phase 3: Bot Handlers (8 часов)**
- ✅ TelegramSupportBot
- ✅ Commands (/start, /help, /status, /cancel)
- ✅ Message handling
- ✅ FAQ navigation
- ✅ Ticket creation
- ✅ Support group integration

### Послезавтра (2025-12-13):

**5. Phase 4: GraphQL API (4 часа, optional)**
- ✅ GraphQL types & DTOs
- ✅ TelegramResolver
- ✅ Frontend queries

**6. Phase 5: Testing & Deployment (4 часа)**
- ✅ Full testing
- ✅ Production deployment

---

## 🚀 Следующий шаг

**СЕЙЧАС:** Начинаем с Phase 1 - OAuth Bot Configuration

1. Добавить TELEGRAM_BOT_TOKEN в .env
2. Запустить API сервер
3. Протестировать OAuth flow
4. Проверить что всё работает

После успешного тестирования OAuth Bot → переходим к Phase 2 (Support Bot Backend)

---

## 📝 Notes

**Environment Variables Needed:**
```env
# OAuth Bot
TELEGRAM_BOT_TOKEN=<от @BotFather для @ProRabSpaceBot>
TELEGRAM_BOT_USERNAME=ProRabSpaceBot
TELEGRAM_AUTH_TOKEN_TTL=600000

# Support Bot
TELEGRAM_SUPPORT_BOT_TOKEN=<от @BotFather для @ProRabSupportBot>
TELEGRAM_SUPPORT_BOT_USERNAME=ProRabSupportBot
TELEGRAM_SUPPORT_CHAT_ID=<ID группы поддержки>
```

**Как получить TELEGRAM_SUPPORT_CHAT_ID:**
1. Создать группу "ProRab Support Team"
2. Добавить @ProRabSupportBot
3. Сделать бота админом
4. Отправить сообщение в группу
5. Открыть: `https://api.telegram.org/bot<SUPPORT_BOT_TOKEN>/getUpdates`
6. Найти `"chat":{"id":-1001234567890,...}`
7. Скопировать ID: `-1001234567890`

---

**Готово к реализации! 🎉**
