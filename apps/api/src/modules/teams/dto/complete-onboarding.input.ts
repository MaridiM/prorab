import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';
import * as GraphQLUpload from 'graphql-upload-minimal';

/**
 * Input для завершения онбординга
 * Содержит данные со всех 3 шагов онбординга
 */
@InputType()
export class CompleteOnboardingInput {
  // ===== Step 1: Team Name =====
  @Field(() => String, { description: 'Название бригады' })
  @IsNotEmpty({ message: 'Название бригады обязательно' })
  @IsString()
  @MaxLength(100)
  teamName: string;

  // ===== Step 2: Logo (одно из двух) =====
  @Field(() => GraphQLUpload.GraphQLUpload, {
    nullable: true,
    description: 'Загруженный файл логотипа',
  })
  @IsOptional()
  @Transform(({ value }) => value) // Skip transformation for GraphQLUpload
  logoFile?: GraphQLUpload.FileUpload;

  @Field(() => String, {
    nullable: true,
    description: 'ID выбранной иконки (hammer, wrench, etc)',
  })
  @IsOptional()
  @IsString()
  iconId?: string;

  @Field(() => String, {
    nullable: true,
    description: 'ID выбранного цвета (orange, blue, etc)',
  })
  @IsOptional()
  @IsString()
  colorId?: string;

  // ===== Step 3: First Project =====
  @Field(() => String, { description: 'Название первого проекта' })
  @IsNotEmpty({ message: 'Название проекта обязательно' })
  @IsString()
  @MaxLength(200)
  projectName: string;

  @Field(() => String, {
    nullable: true,
    description: 'Адрес проекта (необязательно)',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  projectAddress?: string;

  @Field(() => String, {
    nullable: true,
    description: 'Описание проекта (необязательно)',
  })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  projectDescription?: string;
}
