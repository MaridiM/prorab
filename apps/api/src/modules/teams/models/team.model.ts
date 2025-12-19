import { Field, ID, ObjectType, Int } from '@nestjs/graphql';
import { LogoType } from './logo-type.enum';
import { User } from '../../users/models/user.model';

@ObjectType()
export class TeamCounts {
  @Field(() => Int, { description: 'Number of team members' })
  members: number;

  @Field(() => Int, { description: 'Number of projects' })
  projects: number;
}

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

  // Optional fields resolved by field resolvers (for admin queries)
  @Field(() => User, { nullable: true, description: 'Team owner (resolved field)' })
  owner?: User;

  @Field(() => TeamCounts, { nullable: true, description: 'Team counts (resolved field)' })
  _count?: TeamCounts;
}
