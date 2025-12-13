import { InputType, Field } from '@nestjs/graphql';
import { IsArray, ValidateNested, ArrayMinSize } from 'class-validator';
import { Type } from 'class-transformer';
import { UpdateMemberSalaryInput } from './update-member-salary.input';

@InputType()
export class BulkUpdateSalaryInput {
  @Field(() => [UpdateMemberSalaryInput], {
    description: 'Array of salary updates to apply',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @ArrayMinSize(1, { message: 'At least one salary update is required' })
  @Type(() => UpdateMemberSalaryInput)
  updates: UpdateMemberSalaryInput[];

  @Field({ nullable: true, description: 'Optional reason for bulk update' })
  reason?: string;
}
