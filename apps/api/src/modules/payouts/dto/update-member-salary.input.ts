import { Field, Float, ID, InputType } from '@nestjs/graphql';
import { IsIn, IsNotEmpty, IsNumber, IsOptional, IsUUID, Max, Min } from 'class-validator';

@InputType()
export class UpdateMemberSalaryInput {
  @Field(() => ID, { description: 'Team member ID' })
  @IsUUID()
  @IsNotEmpty()
  memberId: string;

  @Field({ description: 'Salary type: fixed, percentage, none' })
  @IsIn(['fixed', 'percentage', 'none'], { message: 'salaryType must be one of: fixed, percentage, none' })
  @IsNotEmpty()
  salaryType: string;

  @Field(() => Float, { nullable: true, description: 'Salary amount (for fixed) or percentage (0-100)' })
  @IsNumber()
  @Min(0, { message: 'salaryAmount must be >= 0' })
  @Max(100, { message: 'salaryAmount must be <= 100 for percentage type' })
  @IsOptional()
  salaryAmount?: number;
}
