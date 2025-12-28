import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType('PlanLimits')
export class PlanLimitsModel {
  @Field()
  id: string;

  @Field()
  slug: string;

  @Field()
  name: string;

  @Field()
  price: number;

  @Field({ nullable: true })
  maxActiveProjects?: number; // null = unlimited

  @Field()
  maxMembers: number;

  @Field()
  storageGB: number;

  @Field(() => [String])
  features: string[];
}
