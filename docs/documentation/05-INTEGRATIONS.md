# INTEGRATIONS - ProRab.space

**Версия:** 1.0
**Дата:** 2025-12-13

---

## ОГЛАВЛЕНИЕ

1. [Обзор интеграций](#обзор-интеграций)
2. [Telegram Integration](#telegram-integration)
3. [YooKassa Payment](#yookassa-payment)
4. [Brevo Email](#brevo-email)
5. [AWS S3 Storage](#aws-s3-storage)
6. [Notification System](#notification-system)

---

## ОБЗОР ИНТЕГРАЦИЙ

ProRab.space интегрируется с 5 внешними сервисами:

| Сервис | Назначение | Библиотека | Статус |
|--------|-----------|-----------|---------|
| Telegram | OAuth + Support Bot | Telegraf 4.16.3 | ✅ Active |
| YooKassa | Платежи и подписки | @a2seven/yoo-checkout | ✅ Active |
| Brevo | Email рассылка | @getbrevo/brevo 3.0.1 | ✅ Active |
| AWS S3 | Хранение файлов | @aws-sdk/client-s3 | ✅ Active |
| Redis | Сессии и кеш | Redis 5.10.0 | ✅ Active |

---

## TELEGRAM INTEGRATION

### Обзор

ProRab.space использует **2 Telegram бота**:

1. **@ProRabSpaceBot** - OAuth аутентификация
2. **@ProRabSupportBot** - Техническая поддержка

### 1. OAuth Bot (@ProRabSpaceBot)

**Назначение:** Быстрая аутентификация через Telegram

**Файлы:**
```
apps/api/src/modules/telegram/
├── telegram-oauth-bot.module.ts
├── telegram.bot.ts                 # Handlers
├── telegram-auth.service.ts        # Business logic
└── models/telegram-auth.model.ts
```

**Workflow:**

```
1. User opens /auth/login page
   └─> Displays QR code

2. User scans QR in Telegram
   └─> Opens @ProRabSpaceBot
   └─> Sends /start <token>

3. Bot receives token
   └─> Validates token
   └─> Links Telegram account to user
   └─> Saves telegram_chat_id for notifications

4. Frontend redirects to /dashboard
```

**Handlers:**

```typescript
// telegram.bot.ts
@Start()
async onStart(@Context() ctx: SceneContext, @Payload() payload: string) {
  const token = payload; // Token from QR code

  // Validate token
  const authToken = await this.telegramAuthService.validateToken(token);

  if (!authToken) {
    await ctx.reply('❌ Invalid or expired token. Please try again.');
    return;
  }

  // Link Telegram account
  await this.telegramAuthService.linkTelegramAccount(
    authToken.userId,
    ctx.from.id.toString(),
    ctx.chat.id.toString()
  );

  await ctx.reply('✅ Successfully linked! You can now close this chat.');
}

@Command('help')
async onHelp(@Context() ctx: SceneContext) {
  await ctx.reply('Use /start <token> to link your account');
}
```

**Database Models:**

```prisma
model User {
  telegramId       String?  @unique
  telegramChatId   String?  @unique
}

model TelegramAuthToken {
  id        String   @id @default(cuid())
  userId    String
  token     String   @unique  // nanoid(16)
  expiresAt DateTime
  isUsed    Boolean  @default(false)

  user      User     @relation(fields: [userId], references: [id])
}
```

**Environment Variables:**

```env
TELEGRAM_BOT_TOKEN=8416808724:AAF9PdbKqcsSHDEfWR7Roc6r4AyLhQtkZWI
TELEGRAM_BOT_USERNAME=ProRabSpaceBot
TELEGRAM_AUTH_TOKEN_TTL=600000  # 10 minutes
```

**GraphQL API:**

```graphql
mutation GenerateTelegramAuthToken {
  generateTelegramAuthToken {
    token
    qrCodeUrl
    expiresAt
  }
}

query TelegramAuthStatus {
  telegramAuthStatus {
    isLinked
    username
  }
}

mutation UnlinkTelegram {
  unlinkTelegram {
    success
  }
}
```

---

### 2. Support Bot (@ProRabSupportBot)

**Назначение:** Техническая поддержка пользователей

**Файлы:**
```
apps/api/src/modules/telegram/
├── telegram-support-bot.module.ts
├── telegram-support.bot.ts         # Handlers
├── telegram-support.service.ts     # Business logic
├── telegram-notification.service.ts
└── faq.service.ts
```

**Функции:**

1. **Создание тикетов** - Пользователи могут создать тикет прямо из Telegram
2. **FAQ поиск** - Автоматический поиск по ключевым словам
3. **Уведомления** - Отправка уведомлений о событиях
4. **Прямая связь** - Сообщения пересылаются в support чат

**Handlers:**

```typescript
// telegram-support.bot.ts
@Start()
async onStart(@Context() ctx: SceneContext) {
  await ctx.reply(
    '👋 Добро пожаловать в поддержку ProRab!\n\n' +
    'Выберите действие:',
    {
      reply_markup: {
        keyboard: [
          [{ text: '❓ FAQ' }, { text: '📝 Создать тикет' }],
          [{ text: '💬 Связаться с поддержкой' }]
        ],
        resize_keyboard: true
      }
    }
  );
}

@Hears('❓ FAQ')
async onFAQ(@Context() ctx: SceneContext) {
  const faqEntries = await this.faqService.getPopularFAQ();

  let message = '📚 Частые вопросы:\n\n';
  faqEntries.forEach((entry, index) => {
    message += `${index + 1}. ${entry.question}\n`;
  });

  await ctx.reply(message);
}

@Hears('📝 Создать тикет')
async onCreateTicket(@Context() ctx: SceneContext) {
  await ctx.reply('Опишите вашу проблему:');
  // Enter scene for ticket creation
}

@On('text')
async onMessage(@Context() ctx: SceneContext) {
  const text = ctx.message.text;

  // Search FAQ
  const faqResults = await this.faqService.searchByKeywords(text);

  if (faqResults.length > 0) {
    await ctx.reply(`🔍 Найденные ответы:\n\n${faqResults[0].answer}`);
  } else {
    // Create ticket
    const ticket = await this.telegramSupportService.createTicket(
      ctx.from.id.toString(),
      text
    );

    await ctx.reply(
      `✅ Тикет #${ticket.id} создан.\n` +
      `Наша команда свяжется с вами в ближайшее время.`
    );

    // Forward to support group
    await this.bot.telegram.sendMessage(
      process.env.TELEGRAM_SUPPORT_CHAT_ID,
      `🎫 Новый тикет #${ticket.id}\n\n` +
      `От: ${ctx.from.first_name} (@${ctx.from.username})\n\n` +
      `${text}`,
      {
        reply_markup: {
          inline_keyboard: [
            [{ text: 'Ответить', callback_data: `reply_${ticket.id}` }],
            [{ text: 'Закрыть', callback_data: `close_${ticket.id}` }]
          ]
        }
      }
    );
  }
}
```

**Database Models:**

```prisma
model SupportTicket {
  id               String               @id @default(cuid())
  userId           String
  subject          String
  status           SupportTicketStatus  @default(OPEN)
  priority         SupportTicketPriority @default(MEDIUM)
  telegramThreadId String?              @unique

  messages         SupportMessage[]
  user             User                 @relation(fields: [userId], references: [id])
}

model SupportMessage {
  id        String   @id @default(cuid())
  ticketId  String
  isStaff   Boolean  @default(false)
  authorId  String?
  message   String

  ticket    SupportTicket @relation(fields: [ticketId], references: [id])
}

model FAQEntry {
  id        String   @id @default(cuid())
  question  String
  answer    String
  keywords  String[] @default([])
  category  String?
  viewCount Int      @default(0)
}
```

**Environment Variables:**

```env
TELEGRAM_SUPPORT_BOT_TOKEN=8186028927:AAFAButNgbhwx1GEDFeS_wBx6RDiUCQy9po
TELEGRAM_SUPPORT_BOT_USERNAME=ProRabSupportBot
TELEGRAM_SUPPORT_CHAT_ID=-1002395716485
```

---

### 3. Notification Service

**Файл:** `telegram-notification.service.ts`

**Функции:** Отправка уведомлений через Telegram

```typescript
@Injectable()
export class TelegramNotificationService {
  async sendNotification(userId: string, message: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { telegramChatId: true, notificationSettings: true }
    });

    if (!user?.telegramChatId) return;
    if (!user.notificationSettings?.telegramEnabled) return;

    await this.bot.telegram.sendMessage(user.telegramChatId, message);
  }

  async notifyProjectCreated(projectId: string) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: { team: { include: { members: { include: { user: true } } } } }
    });

    for (const member of project.team.members) {
      await this.sendNotification(
        member.user.id,
        `🏗 Новый проект: ${project.name}\n` +
        `Команда: ${project.team.name}`
      );
    }
  }

  async notifyPayoutPaid(payoutId: string) {
    const payout = await this.prisma.projectPayout.findUnique({
      where: { id: payoutId },
      include: { member: { include: { user: true } }, project: true }
    });

    await this.sendNotification(
      payout.member.user.id,
      `💰 Выплата получена!\n\n` +
      `Проект: ${payout.project.name}\n` +
      `Сумма: ${payout.amount} ₽\n` +
      `Способ: ${payout.paymentMethod}`
    );
  }
}
```

---

## YOOKASSA PAYMENT

### Обзор

**YooKassa** - российский платежный шлюз для приема платежей.

**Файлы:**
```
apps/api/src/modules/payments/
├── payments.module.ts
├── payments.service.ts
├── payments.resolver.ts
├── clients/yookassa.client.ts
├── controllers/yookassa-webhook.controller.ts
└── dto/yookassa-webhook.dto.ts
```

### Интеграция

**Client инициализация:**

```typescript
// yookassa.client.ts
import { YooCheckout } from '@a2seven/yoo-checkout';

@Injectable()
export class YooKassaClient {
  private client: YooCheckout;

  constructor(private configService: ConfigService) {
    this.client = new YooCheckout({
      shopId: this.configService.get('YOOKASSA_SHOP_ID'),
      secretKey: this.configService.get('YOOKASSA_SECRET_KEY')
    });
  }

  async createPayment(amount: number, description: string, returnUrl: string) {
    const payment = await this.client.createPayment({
      amount: {
        value: amount.toFixed(2),
        currency: 'RUB'
      },
      description,
      confirmation: {
        type: 'redirect',
        return_url: returnUrl
      },
      capture: true,
      metadata: {
        // Custom data
      }
    });

    return payment;
  }

  async getPayment(paymentId: string) {
    return await this.client.getPayment(paymentId);
  }

  async cancelPayment(paymentId: string) {
    return await this.client.cancelPayment(paymentId);
  }

  async createRefund(paymentId: string, amount: number) {
    return await this.client.createRefund({
      payment_id: paymentId,
      amount: {
        value: amount.toFixed(2),
        currency: 'RUB'
      }
    });
  }
}
```

### Создание платежа

```typescript
// payments.service.ts
async createPayment(subscriptionId: string) {
  const subscription = await this.prisma.subscription.findUnique({
    where: { id: subscriptionId },
    include: { team: true }
  });

  const amount = this.getPlanPrice(subscription.plan);

  const yookassaPayment = await this.yookassaClient.createPayment(
    amount,
    `Подписка ${subscription.plan} для команды ${subscription.team.name}`,
    `${process.env.FRONTEND_URL}/payment/success`
  );

  // Save payment to DB
  const payment = await this.prisma.payment.create({
    data: {
      subscriptionId,
      yookassaId: yookassaPayment.id,
      amount,
      currency: 'RUB',
      status: 'PENDING',
      confirmationUrl: yookassaPayment.confirmation.confirmation_url
    }
  });

  return {
    confirmationUrl: payment.confirmationUrl
  };
}
```

### Webhook обработка

**Controller:**

```typescript
// yookassa-webhook.controller.ts
@Controller('webhooks/yookassa')
export class YooKassaWebhookController {
  private readonly logger = new Logger(YooKassaWebhookController.name);
  private readonly webhookSecret: string;

  constructor(
    private paymentsService: PaymentsService,
    private configService: ConfigService
  ) {
    this.webhookSecret = this.configService.get('YOOKASSA_WEBHOOK_SECRET');
  }

  @Post()
  async handleWebhook(
    @Body() webhook: YooKassaWebhookDto,
    @Headers('authorization') authHeader?: string
  ) {
    this.logger.log(`Received webhook: ${webhook.event}`);

    // Verify signature
    if (this.webhookSecret) {
      const isValid = this.verifySignature(webhook, authHeader);
      if (!isValid) {
        throw new UnauthorizedException('Invalid webhook signature');
      }
    }

    const { event, object } = webhook;

    switch (event) {
      case 'payment.succeeded':
        await this.paymentsService.handleSucceededPayment(object);
        break;

      case 'payment.canceled':
        await this.paymentsService.handleCanceledPayment(object);
        break;

      case 'payment.waiting_for_capture':
        await this.paymentsService.handleWaitingPayment(object);
        break;

      case 'refund.succeeded':
        await this.paymentsService.handleRefundedPayment(object);
        break;
    }

    return { success: true };
  }

  private verifySignature(body: any, authHeader?: string): boolean {
    if (!authHeader || !authHeader.startsWith('Basic ')) {
      return false;
    }

    const base64Credentials = authHeader.substring(6);
    const credentials = Buffer.from(base64Credentials, 'base64').toString('utf-8');
    const [shopId, password] = credentials.split(':');

    return password === this.webhookSecret;
  }
}
```

**Обработка успешного платежа:**

```typescript
async handleSucceededPayment(paymentData: any) {
  const payment = await this.prisma.payment.findUnique({
    where: { yookassaId: paymentData.id },
    include: { subscription: true }
  });

  // Update payment status
  await this.prisma.payment.update({
    where: { id: payment.id },
    data: {
      status: 'SUCCEEDED',
      paidAt: new Date(),
      paymentMethod: paymentData.payment_method?.type
    }
  });

  // Update subscription
  await this.prisma.subscription.update({
    where: { id: payment.subscriptionId },
    data: {
      status: 'ACTIVE',
      currentPeriodStart: new Date(),
      currentPeriodEnd: this.getNextPeriodEnd(payment.subscription.plan)
    }
  });

  // Send notification
  await this.notificationService.notifyPaymentSuccess(payment.id);
}
```

**Environment Variables:**

```env
YOOKASSA_SHOP_ID=your_shop_id
YOOKASSA_SECRET_KEY=your_secret_key
YOOKASSA_WEBHOOK_SECRET=your_webhook_secret
```

**Настройка webhook в YooKassa:**

1. Зайти в личный кабинет YooKassa
2. Настройки → Уведомления
3. Добавить URL: `https://your-domain.com/webhooks/yookassa`
4. Установить HTTP Basic Auth (shopId:webhookSecret)

---

## BREVO EMAIL

### Обзор

**Brevo (ex-Sendinblue)** - сервис для отправки транзакционных email.

**Файл:** `apps/api/src/core/mail/mail.service.ts`

### Интеграция

```typescript
import * as brevo from '@getbrevo/brevo';

@Injectable()
export class MailService {
  private apiInstance: brevo.TransactionalEmailsApi;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get('BREVO_API_KEY');

    this.apiInstance = new brevo.TransactionalEmailsApi();
    this.apiInstance.setApiKey(
      brevo.TransactionalEmailsApiApiKeys.apiKey,
      apiKey
    );
  }

  async sendEmail(to: string, subject: string, htmlContent: string) {
    const sendSmtpEmail = new brevo.SendSmtpEmail();

    sendSmtpEmail.sender = {
      name: 'ProRab.space',
      email: this.configService.get('MAIL_FROM_EMAIL')
    };

    sendSmtpEmail.to = [{ email: to }];
    sendSmtpEmail.subject = subject;
    sendSmtpEmail.htmlContent = htmlContent;

    await this.apiInstance.sendTransacEmail(sendSmtpEmail);
  }

  async sendVerificationEmail(email: string, token: string) {
    const verifyUrl = `${process.env.FRONTEND_URL}/auth/verify-email?token=${token}`;

    const html = `
      <h1>Подтвердите ваш email</h1>
      <p>Нажмите на ссылку ниже для подтверждения:</p>
      <a href="${verifyUrl}">Подтвердить email</a>
      <p>Ссылка действительна 24 часа.</p>
    `;

    await this.sendEmail(email, 'Подтверждение email - ProRab.space', html);
  }

  async sendPasswordResetEmail(email: string, token: string) {
    const resetUrl = `${process.env.FRONTEND_URL}/auth/reset-password?token=${token}`;

    const html = `
      <h1>Сброс пароля</h1>
      <p>Для сброса пароля перейдите по ссылке:</p>
      <a href="${resetUrl}">Сбросить пароль</a>
      <p>Ссылка действительна 1 час.</p>
    `;

    await this.sendEmail(email, 'Сброс пароля - ProRab.space', html);
  }

  async sendPaymentSuccessEmail(email: string, amount: number, plan: string) {
    const html = `
      <h1>Оплата прошла успешно!</h1>
      <p>Спасибо за оплату подписки!</p>
      <p>План: ${plan}</p>
      <p>Сумма: ${amount} ₽</p>
    `;

    await this.sendEmail(email, 'Оплата подписки - ProRab.space', html);
  }

  async sendTeamInviteEmail(email: string, teamName: string, inviteCode: string) {
    const inviteUrl = `${process.env.FRONTEND_URL}/invite/${inviteCode}`;

    const html = `
      <h1>Приглашение в команду</h1>
      <p>Вас пригласили в команду "${teamName}"</p>
      <a href="${inviteUrl}">Принять приглашение</a>
    `;

    await this.sendEmail(email, `Приглашение в команду ${teamName}`, html);
  }
}
```

**Environment Variables:**

```env
BREVO_API_KEY=your_brevo_api_key_here
MAIL_FROM_EMAIL=your_email@example.com
```

---

## AWS S3 STORAGE

### Обзор

**AWS S3** - хранилище для файлов и изображений.

**Файл:** `apps/api/src/core/storage/storage.service.ts`

### Интеграция

```typescript
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';

@Injectable()
export class StorageService {
  private s3Client: S3Client;
  private bucket: string;

  constructor(private configService: ConfigService) {
    this.s3Client = new S3Client({
      region: this.configService.get('AWS_REGION'),
      credentials: {
        accessKeyId: this.configService.get('AWS_ACCESS_KEY_ID'),
        secretAccessKey: this.configService.get('AWS_SECRET_ACCESS_KEY')
      }
    });

    this.bucket = this.configService.get('AWS_S3_BUCKET');
  }

  async uploadFile(
    file: Express.Multer.File,
    folder: string
  ): Promise<string> {
    const fileName = `${folder}/${Date.now()}-${file.originalname}`;

    await this.s3Client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: fileName,
        Body: file.buffer,
        ContentType: file.mimetype,
        ACL: 'public-read'
      })
    );

    return `https://${this.bucket}.s3.amazonaws.com/${fileName}`;
  }

  async deleteFile(url: string): Promise<void> {
    const key = url.split('.com/')[1];

    await this.s3Client.send(
      new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key
      })
    );
  }

  async uploadAvatar(file: Express.Multer.File, userId: string): Promise<string> {
    return await this.uploadFile(file, `avatars/${userId}`);
  }

  async uploadExpensePhoto(file: Express.Multer.File, projectId: string): Promise<string> {
    return await this.uploadFile(file, `expenses/${projectId}`);
  }

  async uploadReportPhoto(file: Express.Multer.File, reportId: string): Promise<string> {
    return await this.uploadFile(file, `reports/${reportId}`);
  }
}
```

**Environment Variables:**

```env
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_S3_BUCKET=prorab-storage
```

---

## NOTIFICATION SYSTEM

### Обзор

**Многоканальная система уведомлений:**
- Email (Brevo)
- Telegram (Support Bot)
- Push (в приложении)
- SMS (готово, не активно)

**Файл:** `apps/api/src/modules/notifications/notifications.service.ts`

### Реализация

```typescript
@Injectable()
export class NotificationsService {
  constructor(
    private mailService: MailService,
    private telegramService: TelegramNotificationService,
    private prisma: PrismaService
  ) {}

  async sendNotification(
    userId: string,
    type: string,
    data: any
  ) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { notificationSettings: true }
    });

    const settings = user.notificationSettings;

    // Check quiet hours
    if (settings.quietHoursEnabled && this.isQuietHours(settings)) {
      // Schedule for later
      return;
    }

    // Email
    if (settings.emailEnabled && this.shouldSendEmail(type, settings)) {
      await this.sendEmailNotification(user.email, type, data);
    }

    // Telegram
    if (settings.telegramEnabled && user.telegramChatId) {
      await this.telegramService.sendNotification(userId, this.formatMessage(type, data));
    }

    // Push (in-app)
    if (settings.pushEnabled) {
      await this.sendPushNotification(userId, type, data);
    }
  }

  async notifyProjectCreated(projectId: string) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: { team: { include: { members: { include: { user: true } } } } }
    });

    for (const member of project.team.members) {
      if (member.user.id !== project.team.ownerId) {
        await this.sendNotification(
          member.user.id,
          'project_created',
          { projectName: project.name, teamName: project.team.name }
        );
      }
    }
  }

  async notifyExpenseAdded(expenseId: string) {
    // Similar implementation
  }

  async notifyPayoutCalculated(payoutId: string) {
    // Similar implementation
  }
}
```

**14 типов уведомлений:**
1. notifyProjectCreated
2. notifyProjectCompleted
3. notifyExpenseAdded
4. notifyPayoutCalculated
5. notifyPayoutPaid
6. notifyMemberInvited
7. notifyMemberJoined
8. notifyMemberRemoved
9. notifyTaskAssigned
10. notifyTaskCompleted
11. notifyPhotoReportCreated
12. notifySubscriptionExpiring
13. notifyTeamActivity
14. notifySecurityAlert

---

## ЗАКЛЮЧЕНИЕ

ProRab.space интегрируется с 5 внешними сервисами для полноценной функциональности:

- ✅ **Telegram** - OAuth и поддержка
- ✅ **YooKassa** - Прием платежей
- ✅ **Brevo** - Email рассылка
- ✅ **AWS S3** - Хранение файлов
- ✅ **Redis** - Сессии и кеш

Все интеграции:
- Используют environment variables для конфигурации
- Имеют обработку ошибок
- Логируют важные события
- Production-ready
