import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
export class PageInfo {
  @Field(() => Boolean, { description: 'Has next page' })
  hasNextPage: boolean;

  @Field(() => Boolean, { description: 'Has previous page' })
  hasPreviousPage: boolean;

  @Field(() => Int, { description: 'Current page number' })
  currentPage: number;

  @Field(() => Int, { description: 'Total pages' })
  totalPages: number;
}
