import { Field, Float, ID, ObjectType } from '@nestjs/graphql';
import { User } from '../../users/models/user.model';
import { TeamMember } from './team-member.model';

@ObjectType()
export class TeamMemberSalaryHistory {
  @Field(() => ID)
  id: string;

  @Field(() => ID)
  memberId: string;

  @Field({ nullable: true, description: 'Previous salary type (null for first entry)' })
  previousType?: string;

  @Field(() => Float, { nullable: true, description: 'Previous salary amount' })
  previousAmount?: number;

  @Field({ description: 'New salary type' })
  newType: string;

  @Field(() => Float, { nullable: true, description: 'New salary amount' })
  newAmount?: number;

  @Field(() => ID, { description: 'User who made the change' })
  changedByUserId: string;

  @Field({ nullable: true, description: 'Reason for the change' })
  reason?: string;

  @Field()
  createdAt: Date;

  // Relations
  @Field(() => TeamMember, { nullable: true })
  member?: TeamMember;

  @Field(() => User, { nullable: true })
  changedBy?: User;
}
