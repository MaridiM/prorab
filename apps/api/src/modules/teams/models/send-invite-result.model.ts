import { Field, ObjectType } from '@nestjs/graphql';
import { InviteCode } from './invite-code.model';

/**
 * Результат отправки приглашения по email
 */
@ObjectType()
export class SendInviteResult {
  @Field(() => InviteCode, { description: 'Созданный код приглашения' })
  inviteCode: InviteCode;

  @Field(() => Boolean, { description: 'Было ли письмо успешно отправлено' })
  emailSent: boolean;
}












