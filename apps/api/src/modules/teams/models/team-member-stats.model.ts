import { Field, Float, Int, ObjectType } from '@nestjs/graphql';

/**
 * GraphQL модель статистики участника команды
 */
@ObjectType()
export class TeamMemberStats {
  @Field(() => Int, { description: 'Количество проектов, в которых участвует' })
  projectCount: number;

  @Field(() => Float, { description: 'Общая сумма всех выплат за всё время' })
  totalPayouts: number;

  @Field(() => Float, { description: 'Средняя выплата на проект' })
  averagePayoutPerProject: number;

  @Field(() => Int, { description: 'Количество завершённых выплат' })
  completedPayoutsCount: number;

  @Field(() => Int, { description: 'Количество ожидающих выплат' })
  pendingPayoutsCount: number;
}
