import { Field, ID, InputType, Int } from '@nestjs/graphql';
import { IsUUID, IsEmail, IsInt, Min, Max, IsOptional } from 'class-validator';

/**
 * Input для отправки приглашения по email
 */
@InputType()
export class SendInviteByEmailInput {
  @Field(() => ID, { description: 'ID команды' })
  @IsUUID()
  teamId: string;

  @Field(() => String, { description: 'Email адрес приглашаемого пользователя' })
  @IsEmail({}, { message: 'Некорректный email адрес' })
  email: string;

  @Field(() => Int, {
    description: 'Срок действия приглашения в днях (по умолчанию 7)',
    nullable: true,
    defaultValue: 7,
  })
  @IsInt()
  @Min(1)
  @Max(30)
  @IsOptional()
  expiresInDays?: number = 7;
}


















