import { Field, ID, InputType, Float } from '@nestjs/graphql';
import { IsUUID, IsDateString, IsNumber, Min, Max, IsOptional, IsString, MaxLength } from 'class-validator';

@InputType()
export class CreateWorkLogInput {
  @Field(() => ID, { description: 'Project ID' })
  @IsUUID()
  projectId: string;

  @Field(() => ID, { description: 'Team member ID' })
  @IsUUID()
  memberId: string;

  @Field({ description: 'Date of work (ISO string)' })
  @IsDateString()
  date: string;

  @Field(() => Float, { description: 'Hours worked (0.01 - 24.00)' })
  @IsNumber()
  @Min(0.01)
  @Max(24)
  hours: number;

  @Field({ nullable: true, description: 'Description of work done' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;
}
