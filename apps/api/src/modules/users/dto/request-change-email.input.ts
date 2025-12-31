import { Field, InputType } from '@nestjs/graphql';
import { IsEmail, IsNotEmpty, IsOptional, IsString, Length } from 'class-validator';

/**
 * Input для запроса изменения email
 * Если у пользователя включена 2FA, требуется код верификации
 */
@InputType()
export class RequestChangeEmailInput {
	@Field(() => String, { description: 'Новый email адрес' })
	@IsEmail({}, { message: 'Некорректный email адрес' })
	@IsNotEmpty({ message: 'Email обязателен' })
	newEmail: string;

	@Field(() => String, {
		nullable: true,
		description: 'Код двухфакторной аутентификации (требуется, если 2FA включена)',
	})
	@IsOptional()
	@IsString()
	@Length(6, 6, { message: 'Код должен содержать 6 цифр' })
	twoFactorCode?: string;
}










