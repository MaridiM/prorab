import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

@InputType()
export class DeleteAccountInput {
  @Field(() => String, { description: 'Пароль пользователя для подтверждения удаления' })
  @IsNotEmpty({ message: 'Пароль обязателен для удаления аккаунта' })
  @IsString()
  @MinLength(1)
  password: string;
}
