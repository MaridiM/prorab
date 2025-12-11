import { Module } from '@nestjs/common';
import { PayoutsService } from './payouts.service';
import { PayoutsResolver } from './payouts.resolver';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  providers: [PayoutsService, PayoutsResolver],
  exports: [PayoutsService],
})
export class PayoutsModule {}
