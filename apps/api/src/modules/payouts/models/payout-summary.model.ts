import { Field, Float, ID, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class MemberPayoutDetail {
  @Field(() => ID)
  memberId: string;

  @Field()
  memberName: string;

  @Field({ description: 'Salary type: fixed, percentage, none' })
  salaryType: string;

  @Field(() => Float, { nullable: true, description: 'Salary amount or percentage' })
  salaryAmount?: number;

  @Field(() => Float, { description: 'Calculated payout for this member' })
  calculatedPayout: number;

  @Field({ description: 'Payout status: pending, paid' })
  status: string;
}

@ObjectType()
export class PayoutSummary {
  @Field(() => ID)
  projectId: string;

  @Field()
  projectName: string;

  @Field(() => Float, { description: 'Project budget' })
  budget: number;

  @Field(() => Float, { description: 'Total expenses' })
  totalExpenses: number;

  @Field(() => Float, { description: 'Net profit after expenses' })
  netProfit: number;

  @Field(() => Float, { description: 'Total payouts to members' })
  totalPayouts: number;

  @Field(() => Float, { description: 'Owner profit after all payouts' })
  ownerProfit: number;

  @Field(() => [MemberPayoutDetail], { description: 'Detailed payouts for each member' })
  members: MemberPayoutDetail[];
}
