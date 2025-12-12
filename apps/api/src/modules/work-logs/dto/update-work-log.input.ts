import { Field, ID, InputType, Float } from '@nestjs/graphql';
import { IsUUID, IsDateString, IsNumber, Min, Max, IsOptional, IsString, MaxLength } from 'class-validator';

@InputType()
export class UpdateWorkLogInput {
  @Field(() => ID, { description: 'Work log ID' })
  @IsUUID()
  id: string;

  @Field({ nullable: true, description: 'Date of work (ISO string)' })
  @IsOptional()
  @IsDateString()
  date?: string;

  @Field(() => Float, { nullable: true, description: 'Hours worked (0.01 - 24.00)' })
  @IsOptional()
  @IsNumber()
  @Min(0.01)
  @Max(24)
  hours?: number;

  @Field({ nullable: true, description: 'Description of work done' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;
}
