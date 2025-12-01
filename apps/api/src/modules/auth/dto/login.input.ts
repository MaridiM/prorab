import { Field, InputType } from '@nestjs/graphql'
import { IsEmail, IsString } from 'class-validator'

@InputType()
export class LoginInput {
	@Field()
	@IsEmail({}, { message: 'Некорректный email' })
	email: string

	@Field()
	@IsString()
	password: string
}

