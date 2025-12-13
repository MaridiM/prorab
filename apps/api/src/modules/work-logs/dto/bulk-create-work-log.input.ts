import { InputType, Field } from '@nestjs/graphql';
import { IsArray, ValidateNested, ArrayMinSize } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateWorkLogInput } from './create-work-log.input';

@InputType()
export class BulkCreateWorkLogInput {
  @Field(() => [CreateWorkLogInput], {
    description: 'Array of work logs to create',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @ArrayMinSize(1, { message: 'At least one work log is required' })
  @Type(() => CreateWorkLogInput)
  workLogs: CreateWorkLogInput[];
}
