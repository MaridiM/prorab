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

    try {
      // Get Stripe provider for signature verification
      const provider = await this.paymentProviderFactory.getProvider(PaymentProviderType.STRIPE)

      // Get raw body and signature
      const signature = req.headers['stripe-signature'] as string
      const rawBody = req.rawBody

      if (!rawBody) {
        throw new BadRequestException('Missing raw body')
      }

      // Verify webhook signature
      if (!provider.verifyWebhookSignature(rawBody, signature)) {
        this.logger.warn('Invalid webhook signature')
        throw new BadRequestException('Invalid signature')
      }

      // Parse webhook event
      const event = JSON.parse(rawBody.toString())
      const eventType = event.type

      this.logger.log(`Stripe event: ${eventType}`)

      // Handle payment_intent.succeeded event
      if (eventType === 'payment_intent.succeeded') {
        const paymentIntent = event.data.object
        await this.donationsService.handleDonationSucceeded(paymentIntent.id)
      }

      // Handle checkout.session.completed event (for Checkout donations)
      if (eventType === 'checkout.session.completed') {
        const session = event.data.object
        if (session.payment_intent) {
          await this.donationsService.handleDonationSucceeded(session.payment_intent)
        }
      }

      return { success: true }
    } catch (error) {
      this.logger.error('Failed to process Stripe webhook:', error)
      throw error
    }
  }
}
