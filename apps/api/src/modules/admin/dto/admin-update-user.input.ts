import { InputType, Field } from '@nestjs/graphql'
import { IsEmail, IsOptional, IsBoolean, IsString } from 'class-validator'

@InputType()
export class AdminUpdateUserInput {
	@Field(() => String, { nullable: true, description: 'User email address' })
	@IsOptional()
	@IsEmail()
	email?: string

	@Field(() => String, { nullable: true, description: 'User full name' })
	@IsOptional()
	@IsString()
	fullName?: string

	@Field(() => String, { nullable: true, description: 'User phone number' })
	@IsOptional()
	@IsString()
	phone?: string

	@Field(() => String, { nullable: true, description: 'User avatar URL' })
	@IsOptional()
	@IsString()
	avatarUrl?: string

	@Field(() => Boolean, { nullable: true, description: 'Email verification status' })
	@IsOptional()
	@IsBoolean()
	emailVerified?: boolean
}
