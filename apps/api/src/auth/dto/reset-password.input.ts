import { Field, InputType } from '@nestjs/graphql'
import { IsString, MinLength } from 'class-validator'

@InputType()
export class ResetPasswordInput {
	@Field()
	@IsString()
	token: string

	@Field()
	@IsString()
	@MinLength(8, { message: 'Пароль должен содержать минимум 8 символов' })
	newPassword: string
}

