import { Module } from '@nestjs/common';
import { TeamsService } from './teams.service';
import { TeamsResolver, InviteCodeResolver } from './teams.resolver';
import { StorageModule } from '../../core/storage/storage.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [StorageModule, AuthModule],
  providers: [TeamsService, TeamsResolver, InviteCodeResolver],
  exports: [TeamsService],
})
export class TeamsModule {}
