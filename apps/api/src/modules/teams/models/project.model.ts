import { Field, ID, ObjectType } from '@nestjs/graphql';

/**
 * GraphQL модель проекта
 */
@ObjectType()
export class Project {
  @Field(() => ID)
  id: string;

  @Field(() => ID, { description: 'ID команды' })
  teamId: string;

  @Field(() => String, { description: 'Название проекта' })
  name: string;

  @Field(() => String, { nullable: true, description: 'Адрес объекта' })
  address?: string;

  @Field(() => String, { nullable: true, description: 'Описание проекта' })
  description?: string;

  @Field(() => Boolean, { description: 'Активен ли проект' })
  isActive: boolean;

  @Field(() => ID, { description: 'ID создателя проекта' })
  createdById: string;

  @Field(() => Date, { description: 'Дата создания' })
  createdAt: Date;

  @Field(() => Date, { description: 'Дата последнего обновления' })
  updatedAt: Date;
}
