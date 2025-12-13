import { Injectable, Logger } from '@nestjs/common';
import { InjectBot } from 'nestjs-telegraf';
import { Telegraf } from 'telegraf';
import { PrismaService } from '../../core/prisma/prisma.service';

interface NotificationMessage {
  chatId: string;
  message: string;
  parseMode?: 'Markdown' | 'HTML';
  disablePreview?: boolean;
}

@Injectable()
export class TelegramNotificationService {
  private readonly logger = new Logger(TelegramNotificationService.name);

  constructor(
    @InjectBot('oauth') private readonly bot: Telegraf,
    private readonly prisma: PrismaService,
  ) {
    this.logger.log('TelegramNotificationService initialized');
  }

  /**
   * Send notification to user via Telegram
   */
  async sendNotification(params: NotificationMessage): Promise<boolean> {
    const { chatId, message, parseMode = 'Markdown', disablePreview = true } = params;

    try {
      await this.bot.telegram.sendMessage(chatId, message, {
        parse_mode: parseMode,
        link_preview_options: { is_disabled: disablePreview },
      });

      this.logger.log(`Notification sent to chat ${chatId}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send notification to chat ${chatId}:`, error);
      return false;
    }
  }

  /**
   * Send notification to user by userId (resolves chatId from database)
   */
  async sendNotificationToUser(
    userId: string,
    message: string,
    parseMode: 'Markdown' | 'HTML' = 'Markdown',
    notificationType?: 'salary' | 'payout',
  ): Promise<boolean> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: {
          telegramChatId: true,
          notificationSettings: true,
        },
      });

      if (!user) {
        this.logger.warn(`User ${userId} not found`);
        return false;
      }

      if (!user.telegramChatId) {
        this.logger.warn(`User ${userId} has no Telegram chat ID`);
        return false;
      }

      // Check if Telegram notifications are enabled
      if (!user.notificationSettings?.telegramEnabled) {
        this.logger.log(`Telegram notifications disabled for user ${userId}`);
        return false;
      }

      // Check specific notification type
      if (notificationType === 'salary' && !user.notificationSettings?.telegramSalaryChanges) {
        this.logger.log(`Salary change notifications disabled for user ${userId}`);
        return false;
      }

      if (notificationType === 'payout' && !user.notificationSettings?.telegramPayouts) {
        this.logger.log(`Payout notifications disabled for user ${userId}`);
        return false;
      }

      return await this.sendNotification({
        chatId: user.telegramChatId,
        message,
        parseMode,
      });
    } catch (error) {
      this.logger.error(`Failed to send notification to user ${userId}:`, error);
      return false;
    }
  }

  /**
   * Send salary change notification
   */
  async sendSalaryChangeNotification(params: {
    userId: string;
    memberName: string;
    teamName: string;
    oldSalaryType?: string;
    newSalaryType?: string;
    oldAmount?: number;
    newAmount?: number;
  }): Promise<boolean> {
    const { userId, memberName, teamName, oldSalaryType, newSalaryType, oldAmount, newAmount } = params;

    let changeDescription = '';

    // Salary type change
    if (oldSalaryType && newSalaryType && oldSalaryType !== newSalaryType) {
      const oldTypeLabel = this.getSalaryTypeLabel(oldSalaryType);
      const newTypeLabel = this.getSalaryTypeLabel(newSalaryType);
      changeDescription += `📋 Тип зарплаты: ${oldTypeLabel} → ${newTypeLabel}\n`;
    }

    // Salary amount change
    if (oldAmount !== undefined && newAmount !== undefined && oldAmount !== newAmount) {
      const amountDiff = newAmount - oldAmount;
      const diffSign = amountDiff > 0 ? '+' : '';
      const diffEmoji = amountDiff > 0 ? '📈' : '📉';
      changeDescription += `${diffEmoji} Сумма: ${oldAmount.toLocaleString('ru-RU')} ₽ → ${newAmount.toLocaleString('ru-RU')} ₽ (${diffSign}${amountDiff.toLocaleString('ru-RU')} ₽)\n`;
    }

    const message =
      `💼 *Изменение зарплаты*\n\n` +
      `👤 Участник: ${memberName}\n` +
      `🏢 Команда: ${teamName}\n\n` +
      changeDescription +
      `\n📅 ${new Date().toLocaleString('ru-RU', { dateStyle: 'short', timeStyle: 'short' })}`;

    return await this.sendNotificationToUser(userId, message, 'Markdown', 'salary');
  }

  /**
   * Send payout notification
   */
  async sendPayoutNotification(params: {
    userId: string;
    memberName: string;
    projectName: string;
    amount: number;
    status: string;
    description?: string;
  }): Promise<boolean> {
    const { userId, memberName, projectName, amount, status, description } = params;

    const statusEmoji = this.getPayoutStatusEmoji(status);
    const statusLabel = this.getPayoutStatusLabel(status);

    let message =
      `${statusEmoji} *${statusLabel}*\n\n` +
      `👤 Участник: ${memberName}\n` +
      `🏗 Проект: ${projectName}\n` +
      `💰 Сумма: ${amount.toLocaleString('ru-RU')} ₽\n`;

    if (description) {
      message += `📝 Описание: ${description}\n`;
    }

    message += `\n📅 ${new Date().toLocaleString('ru-RU', { dateStyle: 'short', timeStyle: 'short' })}`;

    return await this.sendNotificationToUser(userId, message, 'Markdown', 'payout');
  }

  /**
   * Send bulk notification to multiple users
   */
  async sendBulkNotification(userIds: string[], message: string): Promise<number> {
    let successCount = 0;

    for (const userId of userIds) {
      const success = await this.sendNotificationToUser(userId, message);
      if (success) {
        successCount++;
      }
    }

    this.logger.log(`Bulk notification sent: ${successCount}/${userIds.length} successful`);
    return successCount;
  }

  // ==================== Helper Methods ====================

  private getSalaryTypeLabel(type: string): string {
    switch (type) {
      case 'FIXED':
        return 'Фиксированная';
      case 'PERCENTAGE':
        return 'Процент';
      case 'NONE':
        return 'Не установлена';
      default:
        return type;
    }
  }

  private getPayoutStatusEmoji(status: string): string {
    switch (status) {
      case 'PENDING':
        return '⏳';
      case 'COMPLETED':
        return '✅';
      case 'CANCELLED':
        return '❌';
      default:
        return '📌';
    }
  }

  private getPayoutStatusLabel(status: string): string {
    switch (status) {
      case 'PENDING':
        return 'Ожидает выплаты';
      case 'COMPLETED':
        return 'Выплата завершена';
      case 'CANCELLED':
        return 'Выплата отменена';
      default:
        return status;
    }
  }
}
