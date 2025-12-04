import { Field, ID, ObjectType } from '@nestjs/graphql';
import { LogoType } from './logo-type.enum';

/**
 * GraphQL модель команды/бригады
 */
@ObjectType()
export class Team {
  @Field(() => ID)
  id: string;

  @Field(() => String, { description: 'Название бригады' })
  name: string;

  @Field(() => LogoType, { description: 'Тип логотипа' })
  logoType: LogoType;

  @Field(() => String, { nullable: true, description: 'URL загруженного логотипа' })
  logoUrl?: string;

  @Field(() => String, { nullable: true, description: 'ID иконки (hammer, wrench, etc)' })
  iconId?: string;

  @Field(() => String, { nullable: true, description: 'ID цвета (orange, blue, etc)' })
  colorId?: string;

  @Field(() => ID, { description: 'ID владельца команды' })
  ownerId: string;

  @Field(() => Date, { description: 'Дата создания' })
  createdAt: Date;

  @Field(() => Date, { description: 'Дата последнего обновления' })
  updatedAt: Date;
}
