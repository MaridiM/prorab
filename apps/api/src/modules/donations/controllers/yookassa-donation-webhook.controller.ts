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

    try {
      // Get YooKassa provider for signature verification
      const provider = await this.paymentProviderFactory.getProvider(PaymentProviderType.YOOKASSA)

      // Verify webhook signature
      const signature = headers['x-yookassa-signature'] || headers['X-Yookassa-Signature']
      const rawBody = JSON.stringify(body)

      if (!provider.verifyWebhookSignature(rawBody, signature)) {
        this.logger.warn('Invalid webhook signature')
        throw new BadRequestException('Invalid signature')
      }

      // Parse webhook event
      const event = body.event
      const paymentObject = body.object

      this.logger.log(`YooKassa event: ${event}, payment: ${paymentObject.id}`)

      // Handle payment.succeeded event
      if (event === 'payment.succeeded') {
        await this.donationsService.handleDonationSucceeded(paymentObject.id)
      }

      return { success: true }
    } catch (error) {
      this.logger.error('Failed to process YooKassa webhook:', error)
      throw error
    }
  }
}
