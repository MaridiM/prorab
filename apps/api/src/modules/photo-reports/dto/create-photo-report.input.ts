import { Field, InputType } from '@nestjs/graphql';
import { IsBoolean, IsOptional, IsString, IsUUID, MaxLength, MinLength } from 'class-validator';

@InputType()
export class CreatePhotoReportInput {
  @Field()
  @IsUUID()
  projectId: string;

  @Field()
  @IsString()
  @MinLength(3, { message: 'Название должно содержать минимум 3 символа' })
  @MaxLength(200, { message: 'Название не должно превышать 200 символов' })
  title: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(2000, { message: 'Описание не должно превышать 2000 символов' })
  description?: string;

  @Field({ nullable: true, defaultValue: true })
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;
}
