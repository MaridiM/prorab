import { Module, forwardRef } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentsResolver } from './payments.resolver';
import { YooKassaClient } from './clients/yookassa.client';
import { YooKassaWebhookController } from './controllers/yookassa-webhook.controller';
import { StripeWebhookController } from './controllers/stripe-webhook.controller';
import { PrismaModule } from '../../core/prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';
import { MailModule } from '../../core/mail/mail.module';
import { AdminModule } from '../admin/admin.module';
import { PaymentProviderFactory } from '../../core/payments/factories/payment-provider.factory';

@Module({
  imports: [
    PrismaModule,
    forwardRef(() => AuthModule),
    UsersModule,
    MailModule,
    forwardRef(() => AdminModule), // Required for SystemSettingsService
  ],
  controllers: [YooKassaWebhookController, StripeWebhookController],
  providers: [
    PaymentsService,
    PaymentsResolver,
    YooKassaClient,
    PaymentProviderFactory,
  ],
  exports: [PaymentsService, PaymentProviderFactory],
})
export class PaymentsModule {}
