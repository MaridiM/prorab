import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class ReportPhoto {
  @Field()
  id: string;

  @Field()
  reportId: string;

  @Field()
  photoUrl: string;

  @Field({ nullable: true })
  thumbnailUrl?: string;

  @Field({ nullable: true })
  caption?: string;

  @Field(() => Int)
  orderIndex: number;

  @Field(() => Int, { nullable: true })
  width?: number;

  @Field(() => Int, { nullable: true })
  height?: number;

  @Field(() => Int, { nullable: true })
  fileSize?: number;

  @Field()
  createdAt: Date;
}
