import { Field, InputType } from '@nestjs/graphql'
import { IsEmail, IsString, IsOptional, Length } from 'class-validator'

@InputType()
export class ChangeEmailInput {
	@Field(() => String, { description: 'Новый email адрес' })
	@IsEmail({}, { message: 'Некорректный email адрес' })
	newEmail: string

	@Field(() => String, {
		description: 'Код двухфакторной аутентификации (требуется, если 2FA включена)',
		nullable: true,
	})
	@IsOptional()
	@IsString()
	@Length(6, 6, { message: 'Код двухфакторной аутентификации должен содержать 6 символов' })
	twoFactorCode?: string
}













