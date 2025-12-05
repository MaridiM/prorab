import { Field, Float, InputType, Int } from '@nestjs/graphql';
import { IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';

/**
 * Input DTO для обновления проекта
 */
@InputType()
export class UpdateProjectInput {
  @Field(() => String, { nullable: true, description: 'Название проекта' })
  @IsOptional()
  @IsString()
  @MaxLength(200, { message: 'Название проекта не может быть длиннее 200 символов' })
  name?: string;

  @Field(() => String, { nullable: true, description: 'Адрес объекта' })
  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'Адрес не может быть длиннее 500 символов' })
  address?: string;

  @Field(() => String, { nullable: true, description: 'Описание проекта' })
  @IsOptional()
  @IsString()
  @MaxLength(2000, { message: 'Описание не может быть длиннее 2000 символов' })
  description?: string;

  @Field(() => Float, { nullable: true, description: 'Бюджет проекта' })
  @IsOptional()
  @Min(0, { message: 'Бюджет не может быть отрицательным' })
  budget?: number;

  @Field(() => String, { nullable: true, description: 'Телефон клиента' })
  @IsOptional()
  @IsString()
  @MaxLength(20, { message: 'Телефон не может быть длиннее 20 символов' })
  clientPhone?: string;

  @Field(() => Date, { nullable: true, description: 'Дата начала проекта' })
  @IsOptional()
  startDate?: Date;

  @Field(() => Date, { nullable: true, description: 'Дата завершения проекта' })
  @IsOptional()
  endDate?: Date;

  @Field(() => String, { nullable: true, description: 'URL фотографии проекта' })
  @IsOptional()
  @IsString()
  photoUrl?: string;

  @Field(() => Int, { nullable: true, description: 'Прогресс выполнения (0-100)' })
  @IsOptional()
  @IsInt()
  @Min(0, { message: 'Прогресс не может быть меньше 0' })
  @Max(100, { message: 'Прогресс не может быть больше 100' })
  progress?: number;

  @Field(() => String, { nullable: true, description: 'Заметки о проекте' })
  @IsOptional()
  @IsString()
  notes?: string;
}
