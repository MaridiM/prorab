import { ObjectType, Field } from '@nestjs/graphql'

@ObjectType()
export class TwoFactorSetup {
	@Field()
	secret: string

	@Field()
	qrCodeUrl: string

	@Field()
	manualEntryCode: string
}

@ObjectType()
export class TwoFactorEnableResponse {
	@Field()
	success: boolean

	@Field(() => [String])
	backupCodes: string[]
}

@ObjectType()
export class TwoFactorDisableResponse {
	@Field()
	success: boolean
}

@ObjectType()
export class BackupCodesResponse {
	@Field(() => [String])
	backupCodes: string[]
}

@ObjectType()
export class TwoFactorStatus {
	@Field()
	enabled: boolean

	@Field()
	backupCodesRemaining: number
}
