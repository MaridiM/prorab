import { Module } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentsResolver } from './payments.resolver';
import { YooKassaClient } from './clients/yookassa.client';
import { YooKassaWebhookController } from './controllers/yookassa-webhook.controller';
import { StripeWebhookController } from './controllers/stripe-webhook.controller';
import { PrismaModule } from '../../core/prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { MailModule } from '../../core/mail/mail.module';
import { PaymentProviderFactory } from '../../core/payments/factories/payment-provider.factory';
import { SystemSettingsService } from '../admin/services/system-settings.service';

@Module({
  imports: [PrismaModule, AuthModule, MailModule],
  controllers: [YooKassaWebhookController, StripeWebhookController],
  providers: [
    PaymentsService,
    PaymentsResolver,
    YooKassaClient,
    PaymentProviderFactory,
    SystemSettingsService, // Required by PaymentProviderFactory
  ],
  exports: [PaymentsService],
})
export class PaymentsModule {}
