import { Field, Float, ID, ObjectType } from '@nestjs/graphql';
import { Project } from '../../teams/models/project.model';
import { TeamMember } from '../../teams/models/team-member.model';

@ObjectType()
export class ProjectPayout {
  @Field(() => ID)
  id: string;

  @Field(() => ID)
  projectId: string;

  @Field(() => ID)
  memberId: string;

  @Field(() => Float, { description: 'Calculated payout amount' })
  calculatedAmount: number;

  @Field(() => Float, { nullable: true, description: 'Actual paid amount' })
  actualAmount?: number;

  @Field({ description: 'Payout status: pending, paid' })
  status: string;

  @Field({ nullable: true, description: 'Date when payout was paid' })
  paidAt?: Date;

  @Field({ nullable: true, description: 'Notes about the payout' })
  notes?: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  // Relations
  @Field(() => Project, { description: 'Project this payout belongs to' })
  project: Project;

  @Field(() => TeamMember, { description: 'Team member receiving this payout' })
  member: TeamMember;
}
