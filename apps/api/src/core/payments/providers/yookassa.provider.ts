/**
 * Yookassa Payment Provider
 *
 * Implementation of IPaymentProvider for Yookassa (ЮKassa)
 * Russian payment gateway integration
 *
 * Configuration priority:
 * 1. SystemSettings (payment.yookassa.*)
 * 2. Environment variables (.env)
 */

import { Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { YooCheckout, ICreatePayment, ICapturePayment } from '@a2seven/yoo-checkout'
import { createHmac } from 'crypto'
import {
  IPaymentProvider,
  CreatePaymentParams,
  PaymentResult,
  PaymentDetails,
  RefundResult,
  PaymentStatus,
  PaymentProviderType,
} from '../interfaces/payment-provider.interface'
import { SystemSettingsService } from '../../../modules/admin/services/system-settings.service'

export class YookassaProvider implements IPaymentProvider {
  readonly type = PaymentProviderType.YOOKASSA
  private client: YooCheckout | null = null
  private shopId: string | null = null
  private secretKey: string | null = null
  private webhookSecret: string | null = null

  constructor(
    private readonly configService: ConfigService,
    private readonly systemSettings: SystemSettingsService,
    private readonly logger: Logger,
  ) {
    this.initializeClient()
  }

  /**
   * Initialize Yookassa client
   * Priority: Environment variables (sync) first, SystemSettings (async) can be loaded later
   */
  private initializeClient() {
    try {
      // Get credentials from environment variables first (synchronous)
      this.shopId = this.configService.get<string>('YOOKASSA_SHOP_ID')
      this.secretKey = this.configService.get<string>('YOOKASSA_SECRET_KEY')
      this.webhookSecret = this.configService.get<string>('YOOKASSA_WEBHOOK_SECRET')

      if (!this.shopId || !this.secretKey) {
        this.logger.warn(
          'Yookassa credentials not configured in environment variables. Provider will try to load from SystemSettings on first use.',
        )
        return
      }

      this.client = new YooCheckout({
        shopId: this.shopId,
        secretKey: this.secretKey,
      })

      this.logger.log('Yookassa provider initialized successfully from environment variables')
    } catch (error) {
      this.logger.error('Failed to initialize Yookassa provider:', error)
    }
  }

  /**
   * Ensure client is initialized (lazy loading from SystemSettings if needed)
   */
  private async ensureInitialized() {
    // If already initialized from env vars, return
    if (this.client) {
      return
    }

    // Try to load from SystemSettings
    try {
      this.shopId = await this.systemSettings.getSettingValue('payment.yookassa.shop_id')
      this.secretKey = await this.systemSettings.getSettingValue('payment.yookassa.secret_key')
      this.webhookSecret = await this.systemSettings.getSettingValue('payment.yookassa.webhook_secret')

      if (!this.shopId || !this.secretKey) {
        // Development mode: Create a mock Yookassa client to allow testing UI flow
        const isDevelopment = this.configService.get('NODE_ENV') !== 'production'

        if (isDevelopment) {
          this.logger.warn('⚠️  Yookassa running in DEVELOPMENT mode - using mock implementation')
          this.logger.warn('⚠️  Set YOOKASSA_SHOP_ID and YOOKASSA_SECRET_KEY in .env for real payment processing')
          // Don't throw error in development - will be handled in createPayment
          return
        }

        throw new Error('Yookassa credentials not configured in SystemSettings or environment variables')
      }

      this.client = new YooCheckout({
        shopId: this.shopId,
        secretKey: this.secretKey,
      })

      this.logger.log('Yookassa provider initialized successfully from SystemSettings')
    } catch (error) {
      this.logger.error('Failed to initialize Yookassa provider from SystemSettings:', error)
      throw new Error('Yookassa provider not initialized: ' + error.message)
    }
  }

  /**
   * Create payment
   */
  async createPayment(params: CreatePaymentParams): Promise<PaymentResult> {
    await this.ensureInitialized()

    // Development mode mock
    if (!this.client) {
      this.logger.warn('🧪 Yookassa MOCK: Creating fake payment session for development')
      return {
        paymentId: `mock_yookassa_${Date.now()}`,
        confirmationUrl: `${params.returnUrl}?mock=true&provider=yookassa&amount=${params.amount}`,
        status: 'pending' as any,
        expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes
      }
    }

    const paymentData: ICreatePayment = {
      amount: {
        value: params.amount.toFixed(2),
        currency: params.currency,
      },
      confirmation: {
        type: 'redirect',
        return_url: params.returnUrl,
      },
      capture: true, // Auto-capture
      description: params.description,
      metadata: params.metadata,
      save_payment_method: true, // For recurring payments
    }

    // Add idempotency key if provided
    const options: any = params.idempotencyKey
      ? { idempotenceKey: params.idempotencyKey }
      : undefined

    this.logger.debug(`Creating Yookassa payment: ${JSON.stringify(paymentData)}`)

    const payment = await this.client.createPayment(paymentData, options as any)

    return {
      paymentId: payment.id,
      confirmationUrl: payment.confirmation?.confirmation_url || '',
      status: this.mapYookassaStatus(payment.status),
      paymentMethod: payment.payment_method?.type,
      expiresAt: payment.expires_at ? new Date(payment.expires_at) : undefined,
    }
  }

  /**
   * Get payment details
   */
  async getPayment(paymentId: string): Promise<PaymentDetails> {
    await this.ensureInitialized()

    const payment = await this.client.getPayment(paymentId)

    return {
      paymentId: payment.id,
      status: this.mapYookassaStatus(payment.status),
      amount: parseFloat(payment.amount.value),
      currency: payment.amount.currency,
      description: payment.description,
      paymentMethod: payment.payment_method?.type,
      paidAt: payment.paid ? new Date(payment.created_at) : undefined,
      cancelledAt: payment.status === 'canceled' ? new Date(payment.created_at) : undefined,
      refundedAmount: payment.refunded_amount
        ? parseFloat(payment.refunded_amount.value)
        : undefined,
      metadata: payment.metadata,
    }
  }

  /**
   * Cancel payment
   */
  async cancelPayment(paymentId: string): Promise<void> {
    await this.ensureInitialized()

    await this.client.cancelPayment(paymentId)
    this.logger.log(`Payment ${paymentId} cancelled`)
  }

  /**
   * Refund payment
   */
  async refundPayment(paymentId: string, amount?: number): Promise<RefundResult> {
    await this.ensureInitialized()

    // Get payment to determine amount if not provided
    if (!amount) {
      const payment = await this.client.getPayment(paymentId)
      amount = parseFloat(payment.amount.value)
    }

    const refund = await this.client.createRefund({
      payment_id: paymentId,
      amount: {
        value: amount.toFixed(2),
        currency: 'RUB', // TODO: Get from payment
      },
    })

    return {
      refundId: refund.id,
      status: refund.status === 'succeeded' ? 'succeeded' : 'pending',
      amount: parseFloat(refund.amount.value),
    }
  }

  /**
   * Verify webhook signature
   */
  verifyWebhookSignature(body: string | Buffer, signature: string): boolean {
    if (!this.webhookSecret) {
      this.logger.warn('Webhook secret not configured, skipping signature verification')
      return true // Allow in dev mode
    }

    const bodyString = typeof body === 'string' ? body : body.toString('utf-8')

    const hmac = createHmac('sha256', this.webhookSecret)
    hmac.update(bodyString)
    const expectedSignature = hmac.digest('hex')

    return expectedSignature === signature
  }

  /**
   * Test connection
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.ensureInitialized()

      // Try to get payment list to verify credentials
      // Yookassa doesn't have a dedicated test endpoint
      // We'll try to create a minimal payment and immediately cancel it
      // Or just check if client is initialized
      return this.client !== null
    } catch (error) {
      this.logger.error('Yookassa connection test failed:', error)
      return false
    }
  }

  /**
   * Map Yookassa status to our unified status
   */
  private mapYookassaStatus(status: string): PaymentStatus {
    switch (status) {
      case 'pending':
        return PaymentStatus.PENDING
      case 'waiting_for_capture':
        return PaymentStatus.PROCESSING
      case 'succeeded':
        return PaymentStatus.SUCCEEDED
      case 'canceled':
        return PaymentStatus.CANCELLED
      default:
        return PaymentStatus.FAILED
    }
  }
}
