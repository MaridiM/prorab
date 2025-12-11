import { Module } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentsResolver } from './payments.resolver';
import { YooKassaClient } from './clients/yookassa.client';
import { YooKassaWebhookController } from './controllers/yookassa-webhook.controller';
import { PrismaModule } from '../../core/prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [YooKassaWebhookController],
  providers: [PaymentsService, PaymentsResolver, YooKassaClient],
  exports: [PaymentsService],
})
export class PaymentsModule {}
