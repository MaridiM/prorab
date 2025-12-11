import {
  Controller,
  Post,
  Body,
  UnauthorizedException,
  Logger,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { PaymentsService } from '../payments.service';
import { YooKassaWebhookDto } from '../dto/yookassa-webhook.dto';

@Controller('webhooks/yookassa')
export class YooKassaWebhookController {
  private readonly logger = new Logger(YooKassaWebhookController.name);

  constructor(private paymentsService: PaymentsService) {}

  @Post()
  async handleWebhook(
    @Body() webhook: YooKassaWebhookDto,
    @Req() req: Request,
  ) {
    this.logger.log(`Received webhook: ${webhook.event}`);

    // TODO: Verify webhook signature
    // const isValid = this.verifySignature(req);
    // if (!isValid) {
    //   throw new UnauthorizedException('Invalid webhook signature');
    // }

    const { event, object } = webhook;

    try {
      switch (event) {
        case 'payment.succeeded':
          await this.paymentsService.handlePaymentSucceeded(object.id);
          break;

        case 'payment.canceled':
          const reason =
            object.cancellation_details?.reason || 'Unknown reason';
          await this.paymentsService.handlePaymentCanceled(object.id);
          break;

        case 'payment.waiting_for_capture':
          // Auto-capture enabled, so this shouldn't happen
          this.logger.warn(
            `Payment waiting for capture: ${object.id} (auto-capture should be enabled)`,
          );
          break;

        case 'refund.succeeded':
          // TODO: Handle refund
          this.logger.log(`Refund succeeded: ${object.id}`);
          break;

        default:
          this.logger.warn(`Unhandled webhook event: ${event}`);
      }

      return { success: true };
    } catch (error) {
      this.logger.error(`Webhook processing failed: ${error.message}`, error.stack);
      throw error;
    }
  }

  // TODO: Implement signature verification
  // https://yookassa.ru/developers/using-api/webhooks#verify
  private verifySignature(req: Request): boolean {
    // For now, return true (in production, implement proper verification)
    return true;
  }
}
