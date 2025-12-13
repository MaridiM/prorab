import { Field, InputType, Int } from '@nestjs/graphql';

@InputType()
export class AdminActionLogFilterInput {
  @Field({ nullable: true })
  adminUserId?: string;

  @Field({ nullable: true })
  action?: string;

  @Field({ nullable: true })
  resource?: string;

  @Field({ nullable: true })
  startDate?: Date;

  @Field({ nullable: true })
  endDate?: Date;

  @Field(() => Int, { nullable: true, defaultValue: 50 })
  limit?: number;

  @Field(() => Int, { nullable: true, defaultValue: 0 })
  offset?: number;
}
