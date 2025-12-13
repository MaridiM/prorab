import { Field, ID, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

@InputType()
export class UpdateMemberPositionInput {
  @Field(() => ID, { description: 'Team member ID' })
  @IsUUID()
  @IsNotEmpty()
  memberId: string;

  @Field({ nullable: true, description: 'Position/specialization (null to remove)' })
  @IsString()
  @MaxLength(100, { message: 'position must be <= 100 characters' })
  @IsOptional()
  position?: string;
}
