import {
  Controller,
  Post,
  Body,
  UnauthorizedException,
  Logger,
  Req,
  Headers,
} from '@nestjs/common';
import { Request } from 'express';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import { PaymentsService } from '../payments.service';
import { YooKassaWebhookDto } from '../dto/yookassa-webhook.dto';

@Controller('webhooks/yookassa')
export class YooKassaWebhookController {
  private readonly logger = new Logger(YooKassaWebhookController.name);
  private readonly webhookSecret: string;

  constructor(
    private paymentsService: PaymentsService,
    private configService: ConfigService,
  ) {
    this.webhookSecret = this.configService.get<string>('YOOKASSA_WEBHOOK_SECRET') || '';
  }

  @Post()
  async handleWebhook(
    @Body() webhook: YooKassaWebhookDto,
    @Req() req: Request,
    @Headers('authorization') authHeader?: string,
  ) {
    this.logger.log(`Received webhook: ${webhook.event}`);

    // Verify webhook signature
    if (this.webhookSecret) {
      const isValid = this.verifySignature(req.body, authHeader);
      if (!isValid) {
        this.logger.error('Invalid webhook signature');
        throw new UnauthorizedException('Invalid webhook signature');
      }
      this.logger.debug('Webhook signature verified successfully');
    } else {
      this.logger.warn('Webhook secret not configured - skipping signature verification');
    }

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

  /**
   * Verify YooKassa webhook signature
   * https://yookassa.ru/developers/using-api/webhooks#verify
   *
   * YooKassa sends Authorization header with format: "Basic <base64(shopId:password)>"
   * We need to verify that the password matches our webhook secret
   */
  private verifySignature(body: any, authHeader?: string): boolean {
    if (!authHeader || !authHeader.startsWith('Basic ')) {
      this.logger.warn('Missing or invalid Authorization header');
      return false;
    }

    try {
      // Extract base64 credentials from "Basic <credentials>"
      const base64Credentials = authHeader.substring(6);
      const credentials = Buffer.from(base64Credentials, 'base64').toString('utf-8');

      // Format is "shopId:password"
      const [shopId, password] = credentials.split(':');

      if (!password) {
        this.logger.warn('Invalid credentials format');
        return false;
      }

      // Verify password matches webhook secret
      const isValid = password === this.webhookSecret;

      if (!isValid) {
        this.logger.warn('Webhook password does not match secret');
      }

      return isValid;
    } catch (error) {
      this.logger.error(`Signature verification failed: ${error.message}`);
      return false;
    }
  }
}
