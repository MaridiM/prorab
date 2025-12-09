import { Field, InputType, Int } from '@nestjs/graphql';
import { GraphQLUpload } from 'graphql-upload-minimal';
import { IsInt, IsOptional, IsString, IsUUID, MaxLength, Min, Allow } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import type { FileUpload } from 'graphql-upload-minimal';

@InputType()
export class UploadPhotoInput {
  @Field()
  @IsUUID()
  reportId: string;

  @Field(() => GraphQLUpload)
  @Type(() => Object) // Prevent class-transformer from trying to instantiate Promise
  @Transform(({ value }) => value) // Skip transformation for GraphQLUpload
  @Allow() // ✅ Whitelist this property
  file: Promise<FileUpload>;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(1000, { message: 'Подпись не должна превышать 1000 символов' })
  caption?: string;

  @Field(() => Int, { nullable: true, defaultValue: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  orderIndex?: number;
}
