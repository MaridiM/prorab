import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class TeamStats {
  @Field()
  totalExpenses: number;

  @Field()
  totalBudget: number;

  @Field()
  profit: number;

  @Field(() => Int)
  activeProjectsCount: number;

  @Field(() => Int)
  membersCount: number;

  @Field()
  totalHours: number;
}
