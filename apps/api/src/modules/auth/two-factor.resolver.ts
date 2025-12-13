import { Resolver, Query, Mutation, Args } from '@nestjs/graphql'
import { UseGuards } from '@nestjs/common'
import { TwoFactorService } from './two-factor.service'
import { AuthGuard } from '../../shared/guards/auth.guard'
import { CurrentUser } from './decorators/current-user.decorator'
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
	async twoFactorStatus(@CurrentUser() user: any): Promise<TwoFactorStatus> {
		const userData = await this.twoFactorService['prisma'].user.findUnique({
			where: { id: user.sub },
			select: {
				twoFactorEnabled: true,
				twoFactorBackupCodes: true,
			},
		})

		return {
			enabled: userData?.twoFactorEnabled || false,
			backupCodesRemaining: userData?.twoFactorBackupCodes?.length || 0,
		}
	}

	@Mutation(() => TwoFactorSetup)
	async generate2FASecret(@CurrentUser() user: any): Promise<TwoFactorSetup> {
		return this.twoFactorService.generateSecret(user.sub)
	}

	@Mutation(() => TwoFactorEnableResponse)
	async enable2FA(
		@CurrentUser() user: any,
		@Args('input') input: Enable2FAInput,
	): Promise<TwoFactorEnableResponse> {
		return this.twoFactorService.enable2FA(user.sub, input.secret, input.token)
	}

	@Mutation(() => TwoFactorDisableResponse)
	async disable2FA(
		@CurrentUser() user: any,
		@Args('input') input: Disable2FAInput,
	): Promise<TwoFactorDisableResponse> {
		return this.twoFactorService.disable2FA(user.sub, input.token)
	}

	@Mutation(() => BackupCodesResponse)
	async regenerate2FABackupCodes(
		@CurrentUser() user: any,
		@Args('input') input: RegenerateBackupCodesInput,
	): Promise<BackupCodesResponse> {
		return this.twoFactorService.regenerateBackupCodes(user.sub, input.token)
	}
}
