/**
 * Payment Provider Interface
 *
 * Unified interface for all payment providers (Yookassa, Stripe)
 * Implements Strategy Pattern for flexible payment backend switching
 *
 * Similar to IStorageProvider but for payment gateways
 */

import { PaymentProviderType } from '@prisma/generated/client'

// Re-export PaymentProviderType for convenience
export { PaymentProviderType } from '@prisma/generated/client'

/**
 * Main payment provider interface
 * All payment providers must implement this interface
 */
export interface IPaymentProvider {
  /**
   * Provider type identifier
   */
  readonly type: PaymentProviderType

  /**
   * Create a payment
   * @param params - Payment creation parameters
   * @returns Payment result with confirmation URL
   */
  createPayment(params: CreatePaymentParams): Promise<PaymentResult>

  /**
   * Get payment details by provider payment ID
   * @param paymentId - Provider's payment ID
   * @returns Payment details
   */
  getPayment(paymentId: string): Promise<PaymentDetails>

  /**
   * Cancel a pending payment
   * @param paymentId - Provider's payment ID
   */
  cancelPayment(paymentId: string): Promise<void>

  /**
   * Refund a payment (full or partial)
   * @param paymentId - Provider's payment ID
   * @param amount - Refund amount (optional, defaults to full refund)
   * @returns Refund result
   */
  refundPayment(paymentId: string, amount?: number): Promise<RefundResult>

  /**
   * Verify webhook signature (for security)
   * @param body - Raw request body (string or buffer)
   * @param signature - Signature from webhook headers
   * @returns true if signature is valid
   */
  verifyWebhookSignature(body: string | Buffer, signature: string): boolean

  /**
   * Test connection to payment provider
   * Used for admin panel to verify credentials
   * @returns true if connection is successful
   */
  testConnection(): Promise<boolean>

  /**
   * Create a subscription (optional, for recurring payments)
   * Not all providers support this
   */
  createSubscription?(params: CreateSubscriptionParams): Promise<SubscriptionResult>

  /**
   * Cancel a subscription
   */
  cancelSubscription?(subscriptionId: string): Promise<void>

  /**
   * Create a donation payment
   * Optional method for donation-specific handling
   * @param params - Donation creation parameters
   * @returns Payment result with confirmation URL
   */
  createDonation?(params: CreateDonationParams): Promise<PaymentResult>

  /**
   * Create Telegram invoice for donations
   * Telegram Stars specific method
   * @param params - Telegram invoice parameters
   * @returns Invoice result with invoice link
   */
  createTelegramInvoice?(params: CreateTelegramInvoiceParams): Promise<TelegramInvoiceResult>
}

/**
 * Parameters for creating a payment
 */
export interface CreatePaymentParams {
  /** Payment amount */
  amount: number

  /** Currency code (RUB, USD, EUR) */
  currency: string

  /** Payment description */
  description: string

  /** Return URL after payment */
  returnUrl: string

  /** Metadata to attach to payment */
  metadata: {
    subscriptionId: string
    teamId: string
    plan?: string
    [key: string]: any
  }

  /** Customer email (optional) */
  customerEmail?: string

  /** Idempotency key (optional, for retries) */
  idempotencyKey?: string
}

/**
 * Payment creation result
 */
export interface PaymentResult {
  /** Provider's payment ID */
  paymentId: string

  /** URL to redirect user for payment confirmation */
  confirmationUrl: string

  /** Payment status */
  status: PaymentStatus

  /** Payment method (if known) */
  paymentMethod?: string

  /** Expires at (for pending payments) */
  expiresAt?: Date
}

/**
 * Payment details from provider
 */
export interface PaymentDetails {
  /** Provider's payment ID */
  paymentId: string

  /** Payment status */
  status: PaymentStatus

  /** Payment amount */
  amount: number

  /** Currency */
  currency: string

  /** Description */
  description?: string

  /** Payment method */
  paymentMethod?: string

  /** Paid at timestamp */
  paidAt?: Date

  /** Cancelled at timestamp */
  cancelledAt?: Date

  /** Refunded amount */
  refundedAmount?: number

  /** Metadata */
  metadata?: Record<string, any>
}

/**
 * Refund result
 */
export interface RefundResult {
  /** Refund ID */
  refundId: string

  /** Refund status */
  status: 'pending' | 'succeeded' | 'failed'

  /** Refunded amount */
  amount: number

  /** Refund reason (optional) */
  reason?: string
}

/**
 * Subscription creation parameters (for recurring payments)
 */
export interface CreateSubscriptionParams {
  /** Customer email */
  customerEmail: string

  /** Plan ID or price ID */
  planId: string

  /** Return URL */
  returnUrl: string

  /** Metadata */
  metadata: {
    teamId: string
    subscriptionId: string
    [key: string]: any
  }
}

/**
 * Subscription creation result
 */
export interface SubscriptionResult {
  /** Provider's subscription ID */
  subscriptionId: string

  /** Customer ID */
  customerId?: string

  /** Confirmation URL (for Stripe Checkout) */
  confirmationUrl?: string

  /** Subscription status */
  status: 'active' | 'trialing' | 'pending'
}

/**
 * Payment status enum
 * Unified across all providers
 */
export enum PaymentStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  SUCCEEDED = 'succeeded',
  CANCELLED = 'cancelled',
  FAILED = 'failed',
}

/**
 * Webhook event types
 * Common events across providers
 */
export enum WebhookEventType {
  PAYMENT_SUCCEEDED = 'payment.succeeded',
  PAYMENT_CANCELLED = 'payment.cancelled',
  PAYMENT_FAILED = 'payment.failed',
  REFUND_SUCCEEDED = 'refund.succeeded',
  SUBSCRIPTION_CREATED = 'subscription.created',
  SUBSCRIPTION_UPDATED = 'subscription.updated',
  SUBSCRIPTION_CANCELLED = 'subscription.cancelled',
}

/**
 * Webhook event payload
 */
export interface WebhookEvent {
  /** Event type */
  type: WebhookEventType

  /** Provider's event ID */
  eventId: string

  /** Payment or subscription data */
  data: PaymentDetails | any

  /** Created at timestamp */
  createdAt: Date
}

/**
 * Parameters for creating a donation
 */
export interface CreateDonationParams {
  /** Donation amount */
  amount: number

  /** Currency code (RUB, USD, EUR, XTR for Telegram Stars) */
  currency: string

  /** Return URL after payment */
  returnUrl: string

  /** Donor message (optional) */
  message?: string

  /** Donor name (optional) */
  donorName?: string

  /** Is anonymous donation */
  isAnonymous?: boolean

  /** Customer email (optional) */
  customerEmail?: string

  /** Metadata to attach to donation */
  metadata?: {
    donationId: string
    userId: string
    [key: string]: any
  }

  /** Idempotency key (optional, for retries) */
  idempotencyKey?: string
}

/**
 * Parameters for creating Telegram invoice
 * Used by Telegram Stars provider
 */
export interface CreateTelegramInvoiceParams {
  /** Chat ID to send invoice to */
  chatId: number

  /** Invoice title */
  title: string

  /** Invoice description */
  description: string

  /** Payment payload (for identifying payment) */
  payload: string

  /** Price in Telegram Stars */
  prices: Array<{
    label: string
    amount: number
  }>

  /** Photo URL (optional) */
  photoUrl?: string

  /** Photo size (optional) */
  photoSize?: number

  /** Photo width (optional) */
  photoWidth?: number

  /** Photo height (optional) */
  photoHeight?: number
}

/**
 * Telegram invoice creation result
 */
export interface TelegramInvoiceResult {
  /** Telegram message ID */
  messageId: number

  /** Invoice link (for web payments) */
  invoiceLink?: string

  /** Success status */
  success: boolean
}
