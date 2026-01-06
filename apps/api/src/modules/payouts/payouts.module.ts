import { Module, forwardRef } from '@nestjs/common';
import { PayoutsService } from './payouts.service';
import { PayoutsResolver } from './payouts.resolver';
import { AuthModule } from '../auth/auth.module';
import { TelegramModule } from '../telegram/telegram.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [AuthModule, forwardRef(() => TelegramModule), UsersModule],
  providers: [PayoutsService, PayoutsResolver],
  exports: [PayoutsService],
})
export class PayoutsModule {}
