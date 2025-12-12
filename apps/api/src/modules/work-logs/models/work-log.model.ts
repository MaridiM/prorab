import { Field, ID, ObjectType, Float } from '@nestjs/graphql';
import { Project } from '../../teams/models/project.model';
import { TeamMember } from '../../teams/models/team-member.model';

@ObjectType()
export class WorkLog {
  @Field(() => ID)
  id: string;

  @Field(() => ID)
  projectId: string;

  @Field(() => ID)
  memberId: string;

  @Field()
  date: Date;

  @Field(() => Float, { description: 'Hours worked (max 999.99)' })
  hours: number;

  @Field({ nullable: true, description: 'Description of work done' })
  description?: string;

  @Field(() => ID)
  createdById: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field(() => Project, { nullable: true })
  project?: Project;

  @Field(() => TeamMember, { nullable: true })
  member?: TeamMember;
}
