import { Field, InputType } from '@nestjs/graphql'
import { IsString } from 'class-validator'

@InputType()
export class VerifyEmailChangeInput {
	@Field(() => String, { description: 'Токен подтверждения изменения email' })
	@IsString()
	token: string
}











