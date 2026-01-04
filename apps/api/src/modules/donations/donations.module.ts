import { Module } from '@nestjs/common'
import { DonationsService } from './donations.service'
import { DonationsResolver } from './donations.resolver'
import { YookassaDonationWebhookController } from './controllers/yookassa-donation-webhook.controller'
import { StripeDonationWebhookController } from './controllers/stripe-donation-webhook.controller'
import { PrismaModule } from '../../core/prisma/prisma.module'
import { PaymentsModule } from '../payments/payments.module'
import { MailModule } from '../../core/mail/mail.module'

@Module({
  imports: [PrismaModule, PaymentsModule, MailModule],
  providers: [DonationsService, DonationsResolver],
  controllers: [YookassaDonationWebhookController, StripeDonationWebhookController],
  exports: [DonationsService],
})
export class DonationsModule {}
