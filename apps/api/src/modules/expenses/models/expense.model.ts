import { Field, Float, ID, ObjectType } from '@nestjs/graphql';

/**
 * GraphQL модель расхода
 */
@ObjectType()
export class Expense {
  @Field(() => ID)
  id: string;

  @Field(() => ID, { description: 'ID проекта' })
  projectId: string;

  @Field(() => Float, { description: 'Сумма расхода' })
  amount: number;

  @Field(() => String, { description: 'Категория расхода' })
  category: string;

  @Field(() => [String], { description: 'Массив URL фотографий' })
  photos: string[];

  @Field(() => String, { nullable: true, description: 'Комментарий к расходу' })
  comment?: string;

  @Field(() => Boolean, { description: 'Оплачено клиентом' })
  paidByClient: boolean;

  @Field(() => ID, { description: 'ID создателя расхода' })
  createdById: string;

  @Field(() => Date, { description: 'Дата создания' })
  createdAt: Date;

  @Field(() => Date, { description: 'Дата последнего обновления' })
  updatedAt: Date;
}
