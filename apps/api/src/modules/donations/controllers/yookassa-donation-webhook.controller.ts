import { Controller, Post, Body, Headers, Logger, BadRequestException } from '@nestjs/common'
import { DonationsService } from '../donations.service'
import { PaymentProviderFactory } from '../../../core/payments/factories/payment-provider.factory'
import { PaymentProviderType } from '@prisma/generated/client'

/**
 * YooKassa webhook controller for donations
 * Handles webhook notifications from YooKassa
 */
@Controller('webhooks/donations/yookassa')
export class YookassaDonationWebhookController {
  private readonly logger = new Logger(YookassaDonationWebhookController.name)

  constructor(
    private readonly donationsService: DonationsService,
    private readonly paymentProviderFactory: PaymentProviderFactory,
  ) {}

  @Post()
  async handleWebhook(@Body() body: any, @Headers() headers: Record<string, string>) {
    this.logger.log('Received YooKassa donation webhook')
    this.logger.debug(`Headers: ${JSON.stringify(headers)}`)
    this.logger.debug(`Body: ${JSON.stringify(body)}`)

    try {
      // Get YooKassa provider for signature verification
      const provider = await this.paymentProviderFactory.getProvider(PaymentProviderType.YOOKASSA)

      // Verify webhook signature
      const signature = headers['x-yookassa-signature'] || headers['X-Yookassa-Signature']
      
      if (!signature) {
        this.logger.warn('Missing x-yookassa-signature header')
        // In development, allow without signature
        const isDevelopment = process.env.NODE_ENV !== 'production'
        if (!isDevelopment) {
          throw new BadRequestException('Missing signature')
        }
      }

      const rawBody = JSON.stringify(body)

      if (signature && !provider.verifyWebhookSignature(rawBody, signature)) {
        this.logger.warn('Invalid webhook signature')
        this.logger.debug(`Signature received: ${signature.substring(0, 20)}...`)
        throw new BadRequestException('Invalid signature')
      }

      // Parse webhook event
      const event = body.event
      const paymentObject = body.object

      if (!event || !paymentObject) {
        this.logger.error('Invalid webhook payload structure')
        throw new BadRequestException('Invalid webhook payload')
      }

      this.logger.log(`YooKassa donation webhook event: ${event}, payment: ${paymentObject.id}`)

      // Handle payment.succeeded event
      if (event === 'payment.succeeded') {
        this.logger.log(`Processing succeeded payment: ${paymentObject.id}`)
        await this.donationsService.handleDonationSucceeded(paymentObject.id)
      } else {
        this.logger.debug(`Unhandled YooKassa event: ${event}`)
      }

      this.logger.log('YooKassa donation webhook processed successfully')
      return { success: true }
    } catch (error) {
      this.logger.error('Failed to process YooKassa donation webhook:', error)
      this.logger.error(`Error stack: ${error.stack}`)
      throw error
    }
  }
}
