import { Field, Float, ID, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';

@InputType()
export class CreatePayoutInput {
  @Field(() => ID, { description: 'Project ID' })
  @IsUUID()
  @IsNotEmpty()
  projectId: string;

  @Field(() => ID, { description: 'Team member ID' })
  @IsUUID()
  @IsNotEmpty()
  memberId: string;

  @Field(() => Float, { description: 'Payout amount' })
  @IsNumber()
  @Min(0.01, { message: 'amount must be >= 0.01' })
  @IsNotEmpty()
  amount: number;

  @Field({ nullable: true, description: 'Notes about the payout' })
  @IsString()
  @IsOptional()
  notes?: string;
}
