import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Team } from './team.model';

/**
 * GraphQL модель кода приглашения
 */
@ObjectType()
export class InviteCode {
  @Field(() => ID)
  id: string;

  @Field(() => ID)
  teamId: string;

  @Field({ description: 'Уникальный код приглашения' })
  code: string;

  @Field(() => Date, { description: 'Дата истечения срока действия' })
  expiresAt: Date;

  @Field(() => ID, { nullable: true, description: 'ID пользователя, использовавшего код' })
  usedBy?: string;

  @Field(() => Date, { nullable: true, description: 'Дата использования кода' })
  usedAt?: Date;

  @Field(() => Date, { description: 'Дата создания' })
  createdAt: Date;

  // Relations
  @Field(() => Team, { nullable: true, description: 'Команда' })
  team?: Team;

  // Computed fields
  @Field(() => Boolean, { description: 'Является ли код активным (не истёк и не использован)' })
  get isActive(): boolean {
    const now = new Date();
    return !this.usedBy && this.expiresAt > now;
  }

  @Field(() => String, { description: 'Полная ссылка приглашения' })
  get inviteUrl(): string {
    // URL будет формироваться на фронтенде с правильным хостом
    return `/invite/${this.code}`;
  }
}
