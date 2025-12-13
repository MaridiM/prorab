import { Field, Float, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class MemberAnalytics {
  @Field()
  memberId: string;

  @Field()
  memberName: string;

  @Field()
  memberEmail: string;

  @Field({ nullable: true })
  avatarUrl?: string;

  @Field()
  role: string;

  @Field({ nullable: true })
  position?: string;

  @Field()
  salaryType: string;

  @Field(() => Float, { nullable: true })
  salaryAmount?: number;

  @Field(() => Int)
  projectsCount: number;

  @Field(() => Float)
  totalHoursWorked: number;

  @Field(() => Float)
  totalPayouts: number;

  @Field(() => Float)
  averagePayoutPerProject: number;

  @Field(() => Int)
  completedPayoutsCount: number;

  @Field(() => Int)
  pendingPayoutsCount: number;

  @Field()
  joinedAt: Date;
}

@ObjectType()
export class ProjectAnalytics {
  @Field()
  projectId: string;

  @Field()
  projectName: string;

  @Field(() => Float, { nullable: true })
  budget?: number;

  @Field(() => Float)
  totalHoursWorked: number;

  @Field(() => Float)
  totalPayouts: number;

  @Field(() => Int)
  membersCount: number;

  @Field()
  status: string;

  @Field({ nullable: true })
  startDate?: Date;

  @Field({ nullable: true })
  endDate?: Date;
}

@ObjectType()
export class PersonnelAnalytics {
  @Field()
  teamId: string;

  @Field()
  teamName: string;

  @Field(() => Int)
  totalMembers: number;

  @Field(() => Float)
  totalHoursWorked: number;

  @Field(() => Float)
  totalPayouts: number;

  @Field(() => Float)
  averageHoursPerMember: number;

  @Field(() => Float)
  averagePayoutPerMember: number;

  @Field(() => [MemberAnalytics])
  members: MemberAnalytics[];

  @Field(() => [ProjectAnalytics])
  projects: ProjectAnalytics[];

  @Field()
  generatedAt: Date;
}
