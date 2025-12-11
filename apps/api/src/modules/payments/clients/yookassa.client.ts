import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { YooCheckout, ICreatePayment, ICapturePayment } from '@a2seven/yoo-checkout';

@Injectable()
export class YooKassaClient {
  private readonly logger = new Logger(YooKassaClient.name);
  private client: YooCheckout;

  constructor(private configService: ConfigService) {
    const shopId = this.configService.get<string>('YOOKASSA_SHOP_ID');
    const secretKey = this.configService.get<string>('YOOKASSA_SECRET_KEY');

    if (!shopId || !secretKey) {
      this.logger.warn(
        'YooKassa credentials not configured. Payment functionality will be disabled.',
      );
      // Don't throw error - allow app to start in dev mode without credentials
      return;
    }

    this.client = new YooCheckout({
      shopId,
      secretKey,
    });

    this.logger.log('YooKassa client initialized');
  }

  async createPayment(params: {
    amount: number;
    currency: string;
    description: string;
    returnUrl: string;
    metadata: Record<string, any>;
  }) {
    if (!this.client) {
      throw new Error('YooKassa client not initialized');
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
      capture: true,
      description: params.description,
      metadata: params.metadata,
      save_payment_method: true, // Save for recurring payments
    };

    this.logger.debug(`Creating payment: ${JSON.stringify(paymentData)}`);

    const payment = await this.client.createPayment(paymentData);

    this.logger.log(`Payment created: ${payment.id}`);

    return payment;
  }

  async getPayment(paymentId: string) {
    if (!this.client) {
      throw new Error('YooKassa client not initialized');
    }

    return this.client.getPayment(paymentId);
  }

  async capturePayment(paymentId: string, amount?: number) {
    if (!this.client) {
      throw new Error('YooKassa client not initialized');
    }

    const captureData: ICapturePayment = amount
      ? {
          amount: {
            value: amount.toFixed(2),
            currency: 'RUB',
          },
        }
      : {};

    return this.client.capturePayment(paymentId, captureData);
  }

  async cancelPayment(paymentId: string) {
    if (!this.client) {
      throw new Error('YooKassa client not initialized');
    }

    return this.client.cancelPayment(paymentId);
  }

  async createRefund(paymentId: string, amount: number) {
    if (!this.client) {
      throw new Error('YooKassa client not initialized');
    }

    return this.client.createRefund({
      payment_id: paymentId,
      amount: {
        value: amount.toFixed(2),
        currency: 'RUB',
      },
    });
  }
}
