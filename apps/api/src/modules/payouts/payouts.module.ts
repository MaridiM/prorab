import { Module, forwardRef } from '@nestjs/common';
import { PayoutsService } from './payouts.service';
import { PayoutsResolver } from './payouts.resolver';
import { AuthModule } from '../auth/auth.module';
import { TelegramModule } from '../telegram/telegram.module';

@Module({
  imports: [AuthModule, forwardRef(() => TelegramModule)],
  providers: [PayoutsService, PayoutsResolver],
  exports: [PayoutsService],
})
export class PayoutsModule {}
