import { Field, ID, InputType, Int } from '@nestjs/graphql';
import { IsUUID, IsInt, Min, Max, IsOptional } from 'class-validator';

/**
 * Input для создания ссылки-приглашения в команду
 */
@InputType()
export class CreateInviteLinkInput {
  @Field(() => ID, { description: 'ID команды' })
  @IsUUID()
  teamId: string;

  @Field(() => Int, {
    description: 'Срок действия ссылки в днях (по умолчанию 7)',
    nullable: true,
    defaultValue: 7,
  })
  @IsInt()
  @Min(1)
  @Max(30)
  @IsOptional()
  expiresInDays?: number = 7;
}
