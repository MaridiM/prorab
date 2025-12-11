import { Field, InputType, ID } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { GraphQLUpload, FileUpload } from 'graphql-upload-minimal';

@InputType()
export class UpdateTeamInput {
  @Field(() => ID)
  @IsNotEmpty()
  teamId: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @MinLength(2, { message: 'Название должно содержать минимум 2 символа' })
  @MaxLength(100, { message: 'Название не должно превышать 100 символов' })
  name?: string;

  @Field(() => GraphQLUpload, { nullable: true })
  @IsOptional()
  logoFile?: Promise<FileUpload>;

  @Field(() => String, { nullable: true })
  @IsOptional()
  iconId?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  colorId?: string;
}



