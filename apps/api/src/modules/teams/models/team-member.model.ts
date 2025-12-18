import { Field, Float, ID, ObjectType, registerEnumType } from '@nestjs/graphql';
import { Team } from './team.model';
import { User } from '../../users/models/user.model';
import { TeamMemberStats } from './team-member-stats.model';

// Define enum values for GraphQL (must match Prisma enum exactly)
export enum TeamRole {
  OWNER = 'OWNER',
  MEMBER = 'MEMBER',
}

// Register enum with GraphQL
registerEnumType(TeamRole, {
  name: 'TeamRole',
  description: 'Роль участника в конкретной команде',
  valuesMap: {
    OWNER: {
      description: 'Владелец команды - полные права на управление',
    },
    MEMBER: {
      description: 'Участник команды - ограниченные права',
    },
  },
});

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

  @Field(() => TeamRole, { description: 'Роль в команде (OWNER/MEMBER)' })
  role: TeamRole;

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
