import { Controller, Post, Body, Headers, Logger, BadRequestException, RawBodyRequest, Req } from '@nestjs/common'
import { Request } from 'express'
import { DonationsService } from '../donations.service'
import { PaymentProviderFactory } from '../../../core/payments/factories/payment-provider.factory'
import { PaymentProviderType } from '@prisma/generated/client'

/**
 * Stripe webhook controller for donations
 * Handles webhook notifications from Stripe
 */
@Controller('webhooks/donations/stripe')
export class StripeDonationWebhookController {
  private readonly logger = new Logger(StripeDonationWebhookController.name)

  constructor(
    private readonly donationsService: DonationsService,
    private readonly paymentProviderFactory: PaymentProviderFactory,
  ) {}

  @Post()
  async handleWebhook(@Req() req: RawBodyRequest<Request>) {
    this.logger.log('Received Stripe donation webhook')
    this.logger.debug(`Headers: ${JSON.stringify(req.headers)}`)

    try {
      // Get Stripe provider for signature verification
      const provider = await this.paymentProviderFactory.getProvider(PaymentProviderType.STRIPE)

      // Get raw body and signature
      const signature = req.headers['stripe-signature'] as string
      const rawBody = req.rawBody

      if (!rawBody) {
        this.logger.error('Missing raw body in request')
        throw new BadRequestException('Missing raw body')
      }

      if (!signature) {
        this.logger.error('Missing stripe-signature header')
        throw new BadRequestException('Missing signature')
      }

      // Convert rawBody to Buffer if it's a string (for Stripe signature verification)
      const rawBodyBuffer = Buffer.isBuffer(rawBody) 
        ? rawBody 
        : Buffer.from(typeof rawBody === 'string' ? rawBody : JSON.stringify(rawBody), 'utf-8')

      // Verify webhook signature
      if (!provider.verifyWebhookSignature(rawBodyBuffer, signature)) {
        this.logger.warn('Invalid webhook signature')
        this.logger.debug(`Signature received: ${signature.substring(0, 20)}...`)
        throw new BadRequestException('Invalid signature')
      }

      // Parse webhook event
      const event = JSON.parse(rawBodyBuffer.toString('utf-8'))
      const eventType = event.type

      this.logger.log(`Stripe donation webhook event: ${eventType}`)
      this.logger.debug(`Event data: ${JSON.stringify(event.data?.object?.id || 'N/A')}`)

      // Handle payment_intent.succeeded event
      if (eventType === 'payment_intent.succeeded') {
        const paymentIntent = event.data.object
        this.logger.log(`Processing succeeded payment intent: ${paymentIntent.id}`)
        await this.donationsService.handleDonationSucceeded(paymentIntent.id)
      }

      // Handle checkout.session.completed event (for Checkout donations)
      if (eventType === 'checkout.session.completed') {
        const session = event.data.object
        if (session.payment_intent) {
          this.logger.log(`Processing checkout session completed: ${session.id}, payment_intent: ${session.payment_intent}`)
          await this.donationsService.handleDonationSucceeded(session.payment_intent)
        } else {
          this.logger.warn(`Checkout session ${session.id} completed but no payment_intent found`)
        }
      }

      this.logger.log('Stripe donation webhook processed successfully')
      return { success: true }
    } catch (error) {
      this.logger.error('Failed to process Stripe donation webhook:', error)
      this.logger.error(`Error stack: ${error.stack}`)
      throw error
    }
  }
}
