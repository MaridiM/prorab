import { Field, InputType } from '@nestjs/graphql';
import { IsString, Length, Matches } from 'class-validator';

/**
 * Input для присоединения к команде по коду приглашения
 */
@InputType()
export class JoinTeamByInviteInput {
  @Field({ description: 'Код приглашения' })
  @IsString()
  @Length(8, 12)
  @Matches(/^[A-Z0-9]+$/, {
    message: 'Код приглашения должен содержать только заглавные буквы и цифры',
  })
  code: string;
}
