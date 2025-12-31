import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsString } from 'class-validator';

/**
 * Input для подтверждения изменения email
 */
@InputType()
export class ConfirmEmailChangeInput {
	@Field(() => String, { description: 'Токен подтверждения из email' })
	@IsNotEmpty({ message: 'Токен обязателен' })
	@IsString()
	token: string;
}










