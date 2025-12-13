import { Field, ID, Int, ObjectType } from '@nestjs/graphql';
import { GraphQLJSON } from 'graphql-scalars';

@ObjectType()
export class AdminActionLog {
  @Field(() => ID)
  id: string;

  @Field(() => ID)
  adminUserId: string;

  @Field()
  action: string;

  @Field()
  resource: string;

  @Field({ nullable: true })
  resourceId?: string;

  @Field(() => GraphQLJSON, { nullable: true })
  details?: any;

  @Field({ nullable: true })
  ipAddress?: string;

  @Field({ nullable: true })
  userAgent?: string;

  @Field()
  createdAt: Date;
}

@ObjectType()
export class AdminActionLogsResult {
  @Field(() => [AdminActionLog])
  logs: AdminActionLog[];

  @Field(() => Int)
  total: number;
}

@ObjectType()
export class AdminActionStatistics {
  @Field(() => Int)
  totalActions: number;

  @Field(() => GraphQLJSON)
  actionsByType: Record<string, number>;

  @Field(() => GraphQLJSON)
  actionsByResource: Record<string, number>;

  @Field(() => GraphQLJSON)
  actionsByAdmin: Record<string, number>;
}
