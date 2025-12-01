import { Field, InputType } from '@nestjs/graphql'
import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator'

@InputType()
export class RegisterInput {
	@Field()
	@IsEmail({}, { message: 'Некорректный email' })
	email: string

	@Field()
	@IsString()
	@MinLength(8, { message: 'Пароль должен содержать минимум 8 символов' })
	password: string

	@Field({ nullable: true })
	@IsOptional()
	@IsString()
	name?: string

	@Field({ nullable: true })
	@IsOptional()
	@IsString()
	phone?: string
}

