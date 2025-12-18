import { InputType, Field } from '@nestjs/graphql';
import { IsString, IsNotEmpty, IsNumber, IsOptional, IsDateString, Min } from 'class-validator';

@InputType()
export class CreateWorkLogInput {
  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  memberId: string;

  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  projectId: string;

  @Field(() => Date)
  @IsDateString()
  date: Date;

  @Field(() => Number)
  @IsNumber()
  @Min(0.1)
  hours: number;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  description?: string;
}

@InputType()
export class UpdateWorkLogInput {
  @Field(() => Date, { nullable: true })
  @IsDateString()
  @IsOptional()
  date?: Date;

  @Field(() => Number, { nullable: true })
  @IsNumber()
  @Min(0.1)
  @IsOptional()
  hours?: number;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  description?: string;
}

@InputType()
export class WorkLogFilters {
  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  memberId?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  projectId?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  teamId?: string;

  @Field(() => Date, { nullable: true })
  @IsDateString()
  @IsOptional()
  dateFrom?: Date;

  @Field(() => Date, { nullable: true })
  @IsDateString()
  @IsOptional()
  dateTo?: Date;
}
