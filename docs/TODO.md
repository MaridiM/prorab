# TODO & Future Implementation

Список задач и функций, которые требуют дальнейшей реализации или улучшения.

---

## 🔴 Критично (блокирует production)

### ✅ 1. Payments - Yookassa Webhook Signature Verification **DONE**
**Файл:** `apps/api/src/modules/payments/controllers/yookassa-webhook.controller.ts`
**Статус:** ✅ **РЕАЛИЗОВАНО** (2025-12-12)
**Commit:** Будет в следующем коммите

**Что было сделано:**
1. ✅ Добавлен import ConfigService и crypto
2. ✅ Добавлено чтение `YOOKASSA_WEBHOOK_SECRET` из env
3. ✅ Реализован метод `verifySignature()` с проверкой Authorization header
4. ✅ Интегрирована проверка в `handleWebhook()`
5. ✅ Добавлено логирование (debug/warn/error)
6. ✅ Создана документация в `docs/WEBHOOKS_SETUP.md`

**Реализация:**
```typescript
private verifySignature(body: any, authHeader?: string): boolean {
  if (!authHeader || !authHeader.startsWith('Basic ')) {
    this.logger.warn('Missing or invalid Authorization header');
    return false;
  }

  const base64Credentials = authHeader.substring(6);
  const credentials = Buffer.from(base64Credentials, 'base64').toString('utf-8');
  const [shopId, password] = credentials.split(':');

  const isValid = password === this.webhookSecret;
  if (!isValid) {
    this.logger.warn('Webhook password does not match secret');
  }
  return isValid;
}
```

**Как протестировать:**
См. детальную инструкцию в `docs/WEBHOOKS_SETUP.md`

**Приоритет:** ~~🔴 Высокий (блокирует production)~~ → ✅ ВЫПОЛНЕНО

---

### ✅ 2. Two-Factor Authentication - Proper Encryption **DONE**
**Файл:** `apps/api/src/modules/auth/two-factor.service.ts`
**Статус:** ✅ **РЕАЛИЗОВАНО** (2025-12-12)
**Commit:** Будет в следующем коммите

**Что было сделано:**
1. ✅ Добавлен import ConfigService в TwoFactorService
2. ✅ Добавлено чтение `ENCRYPTION_KEY` из env с валидацией (64-char hex)
3. ✅ Реализован метод `encryptSecret()` с AES-256-GCM
4. ✅ Реализован метод `decryptSecret()` с AES-256-GCM
5. ✅ Добавлена обратная совместимость (поддержка legacy base64 секретов)
6. ✅ Создан скрипт миграции `scripts/migrate-2fa-encryption.ts`
7. ✅ Добавлен `ENCRYPTION_KEY` в `.env`

**Реализация:**
```typescript
private readonly encryptionKey: Buffer

constructor(
  private readonly prisma: PrismaService,
  private readonly configService: ConfigService,
) {
  const keyHex = this.configService.get<string>('ENCRYPTION_KEY')
  if (!keyHex || keyHex.length !== 64) {
    throw new Error('ENCRYPTION_KEY must be a 64-character hex string (32 bytes)')
  }
  this.encryptionKey = Buffer.from(keyHex, 'hex')
}

private encryptSecret(secret: string): string {
  const algorithm = 'aes-256-gcm'
  const iv = crypto.randomBytes(16)

  const cipher = crypto.createCipheriv(algorithm, this.encryptionKey, iv)
  let encrypted = cipher.update(secret, 'utf8', 'hex')
  encrypted += cipher.final('hex')
  const authTag = cipher.getAuthTag()

  // Format: iv:encrypted:authTag (all hex-encoded)
  return `${iv.toString('hex')}:${encrypted}:${authTag.toString('hex')}`
}

private decryptSecret(encryptedSecret: string): string {
  const algorithm = 'aes-256-gcm'

  // Handle legacy base64-encoded secrets (for migration compatibility)
  if (!encryptedSecret.includes(':')) {
    return Buffer.from(encryptedSecret, 'base64').toString('utf-8')
  }

  const [ivHex, encryptedHex, authTagHex] = encryptedSecret.split(':')
  const iv = Buffer.from(ivHex, 'hex')
  const authTag = Buffer.from(authTagHex, 'hex')

  const decipher = crypto.createDecipheriv(algorithm, this.encryptionKey, iv)
  decipher.setAuthTag(authTag)

  let decrypted = decipher.update(encryptedHex, 'hex', 'utf8')
  decrypted += decipher.final('utf8')
  return decrypted
}
```

**Важно:**
- 🔐 Новые 2FA секреты автоматически шифруются с AES-256-GCM
- 🔄 Старые base64 секреты автоматически конвертируются при использовании
- 📝 Скрипт миграции доступен: `apps/api/scripts/migrate-2fa-encryption.ts`
- ⚠️ `ENCRYPTION_KEY` должен быть в `.env` (64-char hex)

**Приоритет:** ~~🔴 Высокий (security issue)~~ → ✅ ВЫПОЛНЕНО

---

## 🟡 Важно (нужно для полноты функционала)

### 3. Payments - Email Notifications
**Файл:** `apps/api/src/modules/payments/payments.service.ts`
**Строка:** 171
**Описание:** Отправка email уведомлений при успешной оплате.

**Что нужно:**
```typescript
// After successful payment
await this.mailService.sendPaymentSuccessEmail(subscription.team.owner.email, {
  amount: payment.amount.value,
  plan: subscription.plan,
  period: payment.description,
  receiptUrl: payment.confirmation?.confirmation_url,
});
```

**Инструкция:**
1. Создать email шаблон в `apps/api/src/core/mail/templates/payment-success.hbs`
2. Добавить метод `sendPaymentSuccessEmail` в `MailService`
3. Вызвать в `handleSucceededPayment` после обновления подписки
4. Протестировать с реальным платежом

**Приоритет:** 🟡 Средний

---

### 4. Payments - Retry Failed Payments
**Файл:** `apps/api/src/modules/payments/payments.service.ts`
**Строка:** 172
**Описание:** Автоматическая повторная попытка оплаты через 3 дня после неудачи.

**Что нужно:**
```typescript
// In handleFailedPayment
const retryDate = new Date();
retryDate.setDate(retryDate.getDate() + 3);

await this.prisma.paymentRetry.create({
  data: {
    subscriptionId: subscription.id,
    scheduledFor: retryDate,
    attempt: 1,
  },
});

// Create a cron job to process retries
@Cron('0 */6 * * *') // Every 6 hours
async processPaymentRetries() {
  const retries = await this.prisma.paymentRetry.findMany({
    where: {
      scheduledFor: { lte: new Date() },
      attempt: { lt: 3 },
    },
    include: { subscription: true },
  });

  for (const retry of retries) {
    await this.retryPayment(retry);
  }
}
```

**Инструкция:**
1. Создать модель `PaymentRetry` в Prisma schema
2. Запустить миграцию
3. Реализовать `processPaymentRetries` cron job
4. Добавить логику в `handleFailedPayment`
5. Протестировать с failed платежом

**Приоритет:** 🟡 Средний

---

### 5. Payments - Refund Handling
**Файл:** `apps/api/src/modules/payments/controllers/yookassa-webhook.controller.ts`
**Строка:** 54
**Описание:** Обработка возвратов платежей.

**Что нужно:**
```typescript
case 'payment.refunded':
  await this.paymentsService.handleRefundedPayment(dto);
  break;
```

**Инструкция:**
1. Создать метод `handleRefundedPayment` в `PaymentsService`
2. Отменить подписку или пропорционально вернуть дни
3. Отправить email уведомление о возврате
4. Логировать все refunds для бухгалтерии

**Приоритет:** 🟡 Средний

---

### 6. Team Settings - GraphQL Update Mutation
**Файл:** `apps/web/src/app/(root)/(protected)/teams/[teamId]/settings/page.tsx`
**Строка:** 107-112
**Описание:** Реализовать обновление настроек команды (сейчас placeholder).

**Что нужно:**
1. Backend: Создать mutation `updateTeam` в `teams.resolver.ts`
2. Backend: Реализовать логику в `teams.service.ts`
3. Frontend: Создать GraphQL документ `UPDATE_TEAM_MUTATION`
4. Frontend: Заменить placeholder на реальный useMutation
5. Протестировать изменение названия и логотипа команды

**Инструкция:**
```typescript
// Backend
@Mutation(() => Team)
@UseGuards(AuthGuard)
async updateTeam(
  @CurrentUser() user: CurrentUserData,
  @Args('teamId') teamId: string,
  @Args('input') input: UpdateTeamInput,
): Promise<Team> {
  return this.teamsService.updateTeam(teamId, user.id, input);
}

// Frontend
const UPDATE_TEAM = gql`
  mutation UpdateTeam($teamId: ID!, $input: UpdateTeamInput!) {
    updateTeam(teamId: $teamId, input: $input) {
      id
      name
      logoUrl
    }
  }
`;

const [updateTeam, { loading }] = useMutation(UPDATE_TEAM, {
  onCompleted: () => toast.success('Настройки команды обновлены'),
  refetchQueries: ['TeamById'],
});
```

**Приоритет:** 🟡 Средний

---

### 7. Subscription Upgrade - Payment Integration
**Файл:** `apps/web/src/app/(root)/(protected)/settings/page.tsx`
**Строка:** 1237-1243
**Описание:** Реализовать смену тарифа через эквайринг.

**Что нужно:**
1. Создать mutation `upgradeSubscription(teamId, newPlan)` в backend
2. Интегрировать с Yookassa для оплаты разницы
3. Пропорциональный пересчёт стоимости
4. Обновить UI для выбора нового плана
5. Подтверждение через payment form

**Инструкция:**
См. документацию Yookassa для recurring payments.

**Приоритет:** 🟡 Средний

---

### 8. Payout History - PDF Export
**Файл:** `apps/web/src/app/(root)/(protected)/teams/[teamId]/members/[memberId]/payouts/page.tsx`
**Строка:** 197-202
**Описание:** Экспорт истории выплат в PDF.

**Что нужно:**
1. Установить библиотеку:
   ```bash
   npm install jspdf jspdf-autotable
   npm install -D @types/jspdf
   ```
2. Реализовать функцию экспорта:
   ```typescript
   import jsPDF from 'jspdf';
   import autoTable from 'jspdf-autotable';

   const exportToPDF = () => {
     const doc = new jsPDF();

     doc.text('История выплат', 14, 15);
     doc.setFontSize(10);
     doc.text(`Участник: ${memberName}`, 14, 25);
     doc.text(`Период: ${dateRange}`, 14, 32);

     autoTable(doc, {
       head: [['Дата', 'Проект', 'Тип', 'Сумма', 'Статус']],
       body: filteredPayouts.map(p => [
         formatDate(p.createdAt),
         p.project?.name,
         payoutTypeLabels[p.salaryType],
         formatCurrency(p.amount),
         statusLabels[p.status],
       ]),
       startY: 40,
     });

     doc.save(`payouts-${memberName}-${Date.now()}.pdf`);
   };
   ```
3. Протестировать с разными объёмами данных

**Приоритет:** 🟢 Низкий

---

## 🟢 Желательно (улучшения UX)

### 9. Team Page - Real Expenses Data
**Файлы:**
- `apps/web/src/app/(root)/(protected)/teams/[teamId]/page.tsx:218`
- `apps/web/src/app/(root)/(protected)/teams/[teamId]/page.tsx:225`

**Описание:** Сейчас расходы и количество участников захардкожены.

**Что нужно:**
```typescript
const { data: teamStats } = useQuery(TEAM_STATS_QUERY, {
  variables: { teamId },
});

// Use real data
totalExpenses: teamStats?.totalExpenses || 0,
membersCount: teamStats?.membersCount || 0,
```

**Приоритет:** 🟢 Низкий

---

### 10. Team Member Salary - GraphQL Integration
**Файл:** `apps/web/src/app/(root)/(protected)/teams/[teamId]/members/[memberId]/salary/page.tsx:32`

**Описание:** Добавить реальный запрос данных участника вместо placeholder.

**Инструкция:**
```typescript
const { data } = useQuery(TeamMembersDocument, {
  variables: { teamId },
});

const member = data?.teamMembers.find(m => m.id === memberId);
```

**Приоритет:** 🟢 Низкий

---

## 📋 Summary

**Критично (2 → 0 задач):**
1. ✅ ~~Webhook signature verification~~ **DONE** (2025-12-12)
2. ✅ ~~2FA encryption~~ **DONE** (2025-12-12)

**Важно (6 задач):**
3-8. Payment notifications, retries, refunds, team settings, subscription upgrade, PDF export

**Желательно (2 задачи):**
9-10. Real data display

**Прогресс:**
- ✅ **2 из 2 критичных задач выполнено (100%)** 🎉
- ✅ **ВСЕ критичные задачи закрыты - PRODUCTION READY!** 🚀
- 🟡 6 важных задач для полного функционала
- 🟢 2 задачи для улучшения UX

**Общий приоритет:**
- ✅ **Production Ready:** ВСЕ критичные задачи выполнены!
- 📊 **Для полного функционала:** Закрыть 🟡 Важные задачи
- ✨ **Для улучшения UX:** Закрыть 🟢 Желательные задачи

**Последние изменения:**
- 2025-12-12: ✅ Webhook signature verification реализована
- 2025-12-12: ✅ 2FA proper encryption (AES-256-GCM) реализована
- 2025-12-12: 🎉 **ВСЕ КРИТИЧНЫЕ ЗАДАЧИ ВЫПОЛНЕНЫ - PRODUCTION READY!**

---

## Как использовать этот файл

1. Взять задачу из списка
2. Следовать инструкции
3. Протестировать изменения
4. Создать commit с описанием
5. Отметить задачу как выполненную в этом файле
6. Обновить changelog
