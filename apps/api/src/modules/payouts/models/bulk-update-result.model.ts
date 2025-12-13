import { ObjectType, Field, Int } from '@nestjs/graphql';
import { GraphQLJSON } from 'graphql-scalars';

@ObjectType()
export class BulkUpdateResult {
  @Field(() => Int, { description: 'Number of successful updates' })
  success: number;

  @Field(() => Int, { description: 'Number of failed updates' })
  failed: number;

  @Field(() => GraphQLJSON, { description: 'Detailed results for each update' })
  results: any[];
}
