import { Field, Float, Int, ObjectType } from '@nestjs/graphql';

/**
 * Статистика проекта
 * TODO: Реализовать в Этапе 4 (Expenses)
 */
@ObjectType()
export class ProjectStats {
  @Field(() => Float, { description: 'Общая сумма расходов' })
  totalExpenses: number;

  @Field(() => Float, { description: 'Прибыль (budget - totalExpenses)' })
  profit: number;

  @Field(() => Int, { description: 'Количество расходов' })
  expenseCount: number;

  @Field(() => Int, { description: 'Количество задач' })
  taskCount: number;

  @Field(() => Int, { description: 'Количество фотоотчётов' })
  reportCount: number;
}
