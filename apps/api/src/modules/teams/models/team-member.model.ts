import { Field, Float, ID, ObjectType } from '@nestjs/graphql';
import { Team } from './team.model';
import { User } from '../../users/models/user.model';
import { TeamMemberStats } from './team-member-stats.model';

/**
 * GraphQL модель участника команды
 */
@ObjectType()
export class TeamMember {
  @Field(() => ID)
  id: string;

  @Field(() => ID)
  teamId: string;

  @Field(() => ID)
  userId: string;

  @Field({ description: 'Роль в команде (owner/member)' })
  role: string;

  @Field({ nullable: true, description: 'Должность/специализация (например, "Прораб", "Электрик", "Маляр")' })
  position?: string;

  @Field(() => Date, { description: 'Дата присоединения к команде' })
  joinedAt: Date;

  // Salary fields
  @Field({ description: 'Тип зарплаты: fixed, percentage, none' })
  salaryType: string;

  @Field(() => Float, { nullable: true, description: 'Сумма зарплаты или процент (0-100)' })
  salaryAmount?: number;

  // Relations
  @Field(() => Team, { nullable: true, description: 'Команда' })
  team?: Team;

  @Field(() => User, { nullable: true, description: 'Пользователь' })
  user?: User;

  // Stats
  @Field(() => TeamMemberStats, { nullable: true, description: 'Статистика участника' })
  stats?: TeamMemberStats;
}
