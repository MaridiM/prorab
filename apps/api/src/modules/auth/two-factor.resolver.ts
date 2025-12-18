import { Resolver, Query, Mutation, Args } from '@nestjs/graphql'
import { UseGuards } from '@nestjs/common'
import { TwoFactorService } from './two-factor.service'
import { AuthGuard } from '../../shared/guards/auth.guard'
import { CurrentUser, CurrentUserData } from '../../shared/decorators/current-user.decorator'
import {
	TwoFactorSetup,
	TwoFactorEnableResponse,
	TwoFactorDisableResponse,
	BackupCodesResponse,
	TwoFactorStatus,
} from './models/two-factor.model'
import {
	Enable2FAInput,
	Disable2FAInput,
	RegenerateBackupCodesInput,
} from './dto/two-factor.dto'

@Resolver()
@UseGuards(AuthGuard)
export class TwoFactorResolver {
	constructor(private readonly twoFactorService: TwoFactorService) {}

	@Query(() => TwoFactorStatus)
	async twoFactorStatus(@CurrentUser() user: CurrentUserData): Promise<TwoFactorStatus> {
		return this.twoFactorService.getStatus(user.id)
	}

	@Mutation(() => TwoFactorSetup)
	async generate2FASecret(@CurrentUser() user: CurrentUserData): Promise<TwoFactorSetup> {
		return this.twoFactorService.generateSecret(user.id)
	}

	@Mutation(() => TwoFactorEnableResponse)
	async enable2FA(
		@CurrentUser() user: CurrentUserData,
		@Args('input') input: Enable2FAInput,
	): Promise<TwoFactorEnableResponse> {
		return this.twoFactorService.enable2FA(user.id, input.secret, input.token)
	}

	@Mutation(() => TwoFactorDisableResponse)
	async disable2FA(
		@CurrentUser() user: CurrentUserData,
		@Args('input') input: Disable2FAInput,
	): Promise<TwoFactorDisableResponse> {
		return this.twoFactorService.disable2FA(user.id, input.token)
	}

	@Mutation(() => BackupCodesResponse)
	async regenerate2FABackupCodes(
		@CurrentUser() user: CurrentUserData,
		@Args('input') input: RegenerateBackupCodesInput,
	): Promise<BackupCodesResponse> {
		return this.twoFactorService.regenerateBackupCodes(user.id, input.token)
	}
}
