/**
 * Telegram Stars Payment Provider
 *
 * Implementation of IPaymentProvider for Telegram Stars
 * Telegram's in-app payment system
 *
 * Configuration:
 * - Requires TELEGRAM_BOT_TOKEN from environment variables
 * - Uses Telegraf for Telegram Bot API integration
 */

import { Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Telegraf } from 'telegraf'
import {
  IPaymentProvider,
  CreatePaymentParams,
  CreateDonationParams,
  CreateTelegramInvoiceParams,
  PaymentResult,
  PaymentDetails,
  RefundResult,
  TelegramInvoiceResult,
  PaymentStatus,
  PaymentProviderType,
} from '../interfaces/payment-provider.interface'

/**
 * Telegram Stars Provider
 * Handles payments via Telegram Stars (XTR currency)
 */
export class TelegramStarsProvider implements IPaymentProvider {
  readonly type = PaymentProviderType.TELEGRAM_STARS
  private bot: Telegraf | null = null
  private botToken: string | null = null

  // Exchange rate: 1 Star ≈ 2 RUB (approximate, can be adjusted)
  private readonly STARS_TO_RUB_RATE = 2

  constructor(
    private readonly configService: ConfigService,
    private readonly logger: Logger,
  ) {
    this.initializeBot()
  }

  /**
   * Initialize Telegram bot
   */
  private initializeBot() {
    try {
      this.botToken = this.configService.get<string>('TELEGRAM_SUPPORT_BOT_TOKEN')

      if (!this.botToken) {
        this.logger.warn(
          'Telegram bot token not configured. Telegram Stars provider will not be available.',
        )
        return
      }

      this.bot = new Telegraf(this.botToken)
      this.logger.log('Telegram Stars provider initialized successfully')
    } catch (error) {
      this.logger.error('Failed to initialize Telegram Stars provider:', error)
    }
  }

  /**
   * Ensure bot is initialized
   */
  private ensureInitialized() {
    if (!this.bot || !this.botToken) {
      throw new Error('Telegram Stars provider is not configured. Please set TELEGRAM_SUPPORT_BOT_TOKEN.')
    }
  }

  /**
   * Convert RUB to Telegram Stars
   */
  private convertRubToStars(amountRub: number): number {
    return Math.ceil(amountRub / this.STARS_TO_RUB_RATE)
  }

  /**
   * Convert Telegram Stars to RUB
   */
  private convertStarsToRub(amountStars: number): number {
    return amountStars * this.STARS_TO_RUB_RATE
  }

  /**
   * Create a standard payment (not typically used for Telegram Stars)
   * Telegram Stars are primarily for donations
   */
  async createPayment(params: CreatePaymentParams): Promise<PaymentResult> {
    this.ensureInitialized()

    // For Telegram Stars, we create an invoice link
    // This can be used in web contexts
    const starsAmount = this.convertRubToStars(params.amount)

    try {
      const invoiceLink = await this.bot!.telegram.createInvoiceLink({
        title: params.description.substring(0, 32), // Max 32 chars
        description: params.description,
        payload: JSON.stringify({
          subscriptionId: params.metadata.subscriptionId,
          teamId: params.metadata.teamId,
        }),
        provider_token: '', // Empty for Telegram Stars
        currency: 'XTR', // Telegram Stars currency code
        prices: [
          {
            label: params.description,
            amount: starsAmount,
          },
        ],
      })

      return {
        paymentId: `tg_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        confirmationUrl: invoiceLink,
        status: PaymentStatus.PENDING,
      }
    } catch (error) {
      this.logger.error('Failed to create Telegram Stars payment:', error)
      throw new Error('Failed to create Telegram Stars payment')
    }
  }

  /**
   * Create a donation payment
   * Primary method for Telegram Stars
   */
  async createDonation(params: CreateDonationParams): Promise<PaymentResult> {
    this.ensureInitialized()

    const starsAmount = params.currency === 'XTR'
      ? params.amount
      : this.convertRubToStars(params.amount)

    try {
      const description = params.message
        ? `Донат от ${params.donorName || 'анонима'}: ${params.message.substring(0, 100)}`
        : `Донат ProRab.space ${starsAmount} ⭐`

      const invoiceLink = await this.bot!.telegram.createInvoiceLink({
        title: 'Поддержка ProRab.space',
        description: description.substring(0, 255), // Max 255 chars
        payload: JSON.stringify({
          donationId: params.metadata?.donationId,
          userId: params.metadata?.userId,
          isAnonymous: params.isAnonymous,
        }),
        provider_token: '', // Empty for Telegram Stars
        currency: 'XTR',
        prices: [
          {
            label: `${starsAmount} Stars`,
            amount: starsAmount,
          },
        ],
      })

      return {
        paymentId: `tg_donation_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        confirmationUrl: invoiceLink,
        status: PaymentStatus.PENDING,
      }
    } catch (error) {
      this.logger.error('Failed to create Telegram Stars donation:', error)
      throw new Error('Failed to create Telegram Stars donation')
    }
  }

  /**
   * Create Telegram invoice and send to specific chat
   * Used by Telegram bot /donate command
   */
  async createTelegramInvoice(params: CreateTelegramInvoiceParams): Promise<TelegramInvoiceResult> {
    this.ensureInitialized()

    try {
      const message = await this.bot!.telegram.sendInvoice({
        chat_id: params.chatId,
        title: params.title,
        description: params.description,
        payload: params.payload,
        provider_token: '', // Empty for Telegram Stars
        currency: 'XTR',
        prices: params.prices,
        photo_url: params.photoUrl,
        photo_size: params.photoSize,
        photo_width: params.photoWidth,
        photo_height: params.photoHeight,
      })

      // Create invoice link for web fallback
      const invoiceLink = await this.bot!.telegram.createInvoiceLink({
        title: params.title,
        description: params.description,
        payload: params.payload,
        provider_token: '',
        currency: 'XTR',
        prices: params.prices,
      })

      return {
        messageId: message.message_id,
        invoiceLink,
        success: true,
      }
    } catch (error) {
      this.logger.error('Failed to send Telegram invoice:', error)
      throw new Error('Failed to send Telegram invoice')
    }
  }

  /**
   * Get payment details
   * Telegram Stars doesn't provide a direct API for querying payment status
   * Status is tracked via our database and webhook updates
   */
  async getPayment(paymentId: string): Promise<PaymentDetails> {
    throw new Error('getPayment is not supported for Telegram Stars. Use webhook updates to track payment status.')
  }

  /**
   * Cancel a payment
   * Not supported for Telegram Stars - invoices expire automatically
   */
  async cancelPayment(paymentId: string): Promise<void> {
    throw new Error('cancelPayment is not supported for Telegram Stars. Invoices expire automatically.')
  }

  /**
   * Refund a payment
   * Telegram Stars refunds must be done manually through Telegram support
   */
  async refundPayment(paymentId: string, amount?: number): Promise<RefundResult> {
    throw new Error(
      'Automatic refunds are not supported for Telegram Stars. Please contact Telegram support for manual refunds.',
    )
  }

  /**
   * Verify webhook signature
   * Telegram webhooks are verified differently - using secret token in webhook URL
   */
  verifyWebhookSignature(body: string | Buffer, signature: string): boolean {
    // Telegram webhook verification is handled by Telegraf automatically
    // This method is not used for Telegram Stars
    return true
  }

  /**
   * Test connection to Telegram Bot API
   */
  async testConnection(): Promise<boolean> {
    try {
      this.ensureInitialized()
      const me = await this.bot!.telegram.getMe()
      this.logger.log(`Telegram Stars provider connected: @${me.username}`)
      return true
    } catch (error) {
      this.logger.error('Failed to test Telegram Stars connection:', error)
      return false
    }
  }
}
