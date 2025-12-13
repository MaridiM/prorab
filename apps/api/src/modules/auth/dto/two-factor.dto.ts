import { InputType, Field } from '@nestjs/graphql'
import { IsString, Length, Matches } from 'class-validator'

@InputType()
export class Enable2FAInput {
	@Field()
	@IsString()
	@Length(32, 32)
	secret: string

	@Field()
	@IsString()
	@Length(6, 6)
	@Matches(/^[0-9]+$/, { message: 'Token must contain only digits' })
	token: string
}

@InputType()
export class Disable2FAInput {
	@Field()
	@IsString()
	@Length(6, 6)
	@Matches(/^[0-9]+$/, { message: 'Token must contain only digits' })
	token: string
}

@InputType()
export class Verify2FAInput {
	@Field()
	@IsString()
	@Length(6, 8) // 6 for TOTP, 8 for backup codes
	token: string
}

@InputType()
export class RegenerateBackupCodesInput {
	@Field()
	@IsString()
	@Length(6, 6)
	@Matches(/^[0-9]+$/, { message: 'Token must contain only digits' })
	token: string
}
