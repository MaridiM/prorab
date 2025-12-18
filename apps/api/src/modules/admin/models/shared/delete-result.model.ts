import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class DeleteResult {
  @Field()
  success: boolean;

  @Field()
  message: string;
}
