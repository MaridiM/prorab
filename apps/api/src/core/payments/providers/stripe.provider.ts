/**
 * Stripe Payment Provider
 *
 * Implementation of IPaymentProvider for Stripe
 * International payment gateway integration
 *
 * Configuration priority:
 * 1. SystemSettings (payment.stripe.*)
 * 2. Environment variables (.env)
 */

import { Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import Stripe from 'stripe'
import {
  IPaymentProvider,
  CreatePaymentParams,
  PaymentResult,
  PaymentDetails,
  RefundResult,
  PaymentStatus,
  CreateSubscriptionParams,
  SubscriptionResult,
  PaymentProviderType,
} from '../interfaces/payment-provider.interface'
import { SystemSettingsService } from '../../../modules/admin/services/system-settings.service'

export class StripeProvider implements IPaymentProvider {
  readonly type = PaymentProviderType.STRIPE
  private stripe: Stripe | null = null
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
   * Initialize Stripe client
   * Priority: Environment variables (sync) first, SystemSettings (async) can be loaded later
   */
  private initializeClient() {
    try {
      // Get credentials from environment variables first (synchronous)
      // SystemSettings will be checked lazily when first payment is created
      this.secretKey = this.configService.get<string>('STRIPE_SECRET_KEY')
      this.webhookSecret = this.configService.get<string>('STRIPE_WEBHOOK_SECRET')

      if (!this.secretKey) {
        this.logger.warn(
          'Stripe secret key not configured in environment variables. Provider will try to load from SystemSettings on first use.',
        )
        return
      }

      this.stripe = new Stripe(this.secretKey, {
        apiVersion: '2025-12-15.clover', // Latest stable API version
        typescript: true,
      })

      this.logger.log('Stripe provider initialized successfully from environment variables')
    } catch (error) {
      this.logger.error('Failed to initialize Stripe provider:', error)
    }
  }

  /**
   * Ensure client is initialized (lazy loading from SystemSettings if needed)
   */
  private async ensureInitialized() {
    // If already initialized from env vars, return
    if (this.stripe) {
      return
    }

    // Try to load from SystemSettings
    try {
      this.secretKey = await this.systemSettings.getSettingValue('payment.stripe.secret_key')
      this.webhookSecret = await this.systemSettings.getSettingValue('payment.stripe.webhook_secret')

      if (!this.secretKey) {
        // Development mode: Create a mock Stripe client to allow testing UI flow
        const isDevelopment = this.configService.get('NODE_ENV') !== 'production'

        if (isDevelopment) {
          this.logger.warn('⚠️  Stripe running in DEVELOPMENT mode - using mock implementation')
          this.logger.warn('⚠️  Set STRIPE_SECRET_KEY in .env for real payment processing')
          // Don't throw error in development - will be handled in createPayment
          return
        }

        throw new Error('Stripe secret key not configured in SystemSettings or environment variables')
      }

      this.stripe = new Stripe(this.secretKey, {
        apiVersion: '2025-12-15.clover',
        typescript: true,
      })

      this.logger.log('Stripe provider initialized successfully from SystemSettings')
    } catch (error) {
      this.logger.error('Failed to initialize Stripe provider from SystemSettings:', error)
      throw new Error('Stripe provider not initialized: ' + error.message)
    }
  }

  /**
   * Create payment using Stripe Checkout
   */
  async createPayment(params: CreatePaymentParams): Promise<PaymentResult> {
    await this.ensureInitialized()

    // Development mode mock
    if (!this.stripe) {
      this.logger.warn('🧪 Stripe MOCK: Creating fake payment session for development')
      // Extract base URL from returnUrl (remove query params and path after /payment)
      const baseUrl = params.returnUrl.split('/payment')[0]
      // Extract plan name from description (format: "Оплата подписки "Plan Name" за месяц")
      // Remove technical JSON metadata if present (everything after "|")
      const cleanDescription = params.description?.split(' | ')[0] || params.description || ''
      const planMatch = cleanDescription.match(/"([^"]+)"/)
      const planName = planMatch ? planMatch[1] : 'Unknown Plan'
      return {
        paymentId: `mock_stripe_${Date.now()}`,
        // Redirect to mock checkout page instead of directly to success
        confirmationUrl: `${baseUrl}/payment/checkout?mock=true&provider=stripe&amount=${params.amount}&plan=${encodeURIComponent(planName)}&return_url=${encodeURIComponent(params.returnUrl)}`,
        status: 'pending' as any,
        expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes
      }
    }

    this.logger.debug(`Creating Stripe Checkout Session: ${JSON.stringify(params)}`)

    // Clean description - remove any technical JSON metadata (everything after "|")
    const cleanDescription = params.description?.split(' | ')[0] || params.description || 'Оплата подписки'

    // Create Checkout Session
    const session = await this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: params.currency.toLowerCase(),
            product_data: {
              name: cleanDescription, // Use cleaned description without JSON
            },
            unit_amount: Math.round(params.amount * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: params.returnUrl + '?success=true',
      cancel_url: params.returnUrl + '?cancelled=true',
      customer_email: params.customerEmail,
      metadata: params.metadata,
      client_reference_id: params.metadata.subscriptionId,
    })

    return {
      paymentId: session.id,
      confirmationUrl: session.url || '',
      status: this.mapStripeStatus(session.payment_status),
      expiresAt: new Date(session.expires_at * 1000),
    }
  }

  /**
   * Get payment details
   * For Stripe, we need to get the Checkout Session first, then the Payment Intent
   */
  async getPayment(paymentId: string): Promise<PaymentDetails> {
    await this.ensureInitialized()

    // Check if it's a Checkout Session or Payment Intent
    if (paymentId.startsWith('cs_')) {
      // Checkout Session
      const session = await this.stripe.checkout.sessions.retrieve(paymentId, {
        expand: ['payment_intent'],
      })

      const paymentIntent = session.payment_intent as Stripe.PaymentIntent | null

      return {
        paymentId: session.id,
        status: this.mapStripeStatus(session.payment_status),
        amount: session.amount_total ? session.amount_total / 100 : 0,
        currency: session.currency?.toUpperCase() || 'USD',
        description: session.metadata?.description,
        paymentMethod: paymentIntent?.payment_method_types?.[0],
        paidAt: paymentIntent?.created ? new Date(paymentIntent.created * 1000) : undefined,
        metadata: session.metadata,
      }
    } else {
      // Payment Intent
      const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentId)

      return {
        paymentId: paymentIntent.id,
        status: this.mapStripeStatus(paymentIntent.status),
        amount: paymentIntent.amount / 100,
        currency: paymentIntent.currency.toUpperCase(),
        description: paymentIntent.description || undefined,
        paymentMethod: paymentIntent.payment_method_types?.[0],
        paidAt: paymentIntent.created ? new Date(paymentIntent.created * 1000) : undefined,
        cancelledAt: paymentIntent.canceled_at
          ? new Date(paymentIntent.canceled_at * 1000)
          : undefined,
        refundedAmount: (paymentIntent as any).amount_refunded
          ? (paymentIntent as any).amount_refunded / 100
          : undefined,
        metadata: paymentIntent.metadata,
      }
    }
  }

  /**
   * Cancel payment
   */
  async cancelPayment(paymentId: string): Promise<void> {
    await this.ensureInitialized()

    // Get the session to find payment intent
    if (paymentId.startsWith('cs_')) {
      const session = await this.stripe.checkout.sessions.retrieve(paymentId)
      if (session.payment_intent) {
        await this.stripe.paymentIntents.cancel(session.payment_intent as string)
      }
    } else {
      await this.stripe.paymentIntents.cancel(paymentId)
    }

    this.logger.log(`Stripe payment ${paymentId} cancelled`)
  }

  /**
   * Refund payment
   */
  async refundPayment(paymentId: string, amount?: number): Promise<RefundResult> {
    await this.ensureInitialized()

    // Get payment intent ID if we have a session ID
    let paymentIntentId = paymentId

    if (paymentId.startsWith('cs_')) {
      const session = await this.stripe.checkout.sessions.retrieve(paymentId)
      paymentIntentId = session.payment_intent as string

      if (!paymentIntentId) {
        throw new Error('No payment intent found for this session')
      }
    }

    // Create refund
    const refundData: Stripe.RefundCreateParams = {
      payment_intent: paymentIntentId,
    }

    if (amount) {
      refundData.amount = Math.round(amount * 100) // Convert to cents
    }

    const refund = await this.stripe.refunds.create(refundData)

    return {
      refundId: refund.id,
      status: refund.status === 'succeeded' ? 'succeeded' : 'pending',
      amount: refund.amount / 100,
      reason: refund.reason || undefined,
    }
  }

  /**
   * Verify webhook signature
   */
  verifyWebhookSignature(body: string | Buffer, signature: string): boolean {
    if (!this.stripe || !this.webhookSecret) {
      this.logger.warn('Stripe webhook secret not configured, skipping signature verification')
      return true // Allow in dev mode
    }

    try {
      const bodyString = typeof body === 'string' ? body : body.toString('utf-8')

      // Stripe's constructEvent will throw if signature is invalid
      this.stripe.webhooks.constructEvent(bodyString, signature, this.webhookSecret)

      return true
    } catch (error) {
      this.logger.error('Stripe webhook signature verification failed:', error)
      return false
    }
  }

  /**
   * Test connection
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.ensureInitialized()

      // Retrieve account information to test credentials
      await this.stripe.accounts.retrieve()

      return true
    } catch (error) {
      this.logger.error('Stripe connection test failed:', error)
      return false
    }
  }

  /**
   * Create subscription (recurring payments)
   */
  async createSubscription(params: CreateSubscriptionParams): Promise<SubscriptionResult> {
    await this.ensureInitialized()

    // Create Checkout Session for subscription
    const session = await this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: params.planId, // Stripe Price ID
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: params.returnUrl + '?success=true',
      cancel_url: params.returnUrl + '?cancelled=true',
      customer_email: params.customerEmail,
      metadata: params.metadata,
      client_reference_id: params.metadata.subscriptionId,
    })

    return {
      subscriptionId: session.subscription as string,
      customerId: session.customer as string,
      confirmationUrl: session.url || '',
      status: 'pending',
    }
  }

  /**
   * Cancel subscription
   */
  async cancelSubscription(subscriptionId: string): Promise<void> {
    await this.ensureInitialized()

    await this.stripe.subscriptions.cancel(subscriptionId)
    this.logger.log(`Stripe subscription ${subscriptionId} cancelled`)
  }

  /**
   * Map Stripe status to our unified status
   */
  private mapStripeStatus(status: string | null): PaymentStatus {
    switch (status) {
      case 'unpaid':
      case 'no_payment_required':
        return PaymentStatus.PENDING
      case 'requires_action':
      case 'requires_capture':
      case 'requires_confirmation':
      case 'requires_payment_method':
      case 'processing':
        return PaymentStatus.PROCESSING
      case 'paid':
      case 'succeeded':
      case 'complete':
        return PaymentStatus.SUCCEEDED
      case 'canceled':
      case 'expired':
        return PaymentStatus.CANCELLED
      case 'failed':
        return PaymentStatus.FAILED
      default:
        return PaymentStatus.PENDING
    }
  }
}
