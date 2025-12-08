import { Field, Int, ObjectType } from '@nestjs/graphql';
import { ReportPhoto } from './report-photo.model';

@ObjectType()
export class PublicProject {
  @Field()
  name: string;

  @Field({ nullable: true })
  address?: string;
}

@ObjectType()
export class PhotoReport {
  @Field()
  id: string;

  @Field()
  slug: string;

  @Field()
  projectId: string;

  @Field()
  title: string;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  coverPhotoUrl?: string;

  @Field()
  isPublic: boolean;

  @Field(() => Int)
  viewCount: number;

  @Field()
  createdById: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field({ nullable: true })
  publishedAt?: Date;

  @Field(() => [ReportPhoto], { nullable: true })
  photos?: ReportPhoto[];
}

@ObjectType()
export class PublicPhotoReport {
  @Field()
  slug: string;

  @Field()
  title: string;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  coverPhotoUrl?: string;

  @Field(() => Int)
  viewCount: number;

  @Field()
  createdAt: Date;

  @Field({ nullable: true })
  publishedAt?: Date;

  @Field(() => PublicProject)
  project: PublicProject;

  @Field(() => [ReportPhoto])
  photos: ReportPhoto[];
}
