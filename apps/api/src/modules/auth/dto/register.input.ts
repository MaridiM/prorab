import { Field, InputType } from '@nestjs/graphql'
import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator'

@InputType()
export class RegisterInput {
	@Field()
	@IsEmail({}, { message: 'Некорректный email' })
	email: string

	@Field()
	@IsString()
	@MinLength(8, { message: 'Пароль должен содержать минимум 8 символов' })
	password: string

	@Field()
	@IsString()
	@IsNotEmpty({ message: 'Полное имя обязательно' })
	@MinLength(2, { message: 'Имя должно содержать минимум 2 символа' })
	fullName: string

	@Field({ nullable: true })
	@IsOptional()
	@IsString()
	phone?: string
}

