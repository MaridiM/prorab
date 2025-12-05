import { Field, InputType, Int } from '@nestjs/graphql';
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { ProjectStatus } from '../models/project-status.enum';

/**
 * Input DTO для фильтрации проектов
 */
@InputType()
export class ProjectFilterInput {
  @Field(() => ProjectStatus, { nullable: true, description: 'Фильтр по статусу' })
  @IsOptional()
  status?: ProjectStatus;

  @Field(() => String, { nullable: true, description: 'Поиск по названию или адресу' })
  @IsOptional()
  @IsString()
  searchQuery?: string;

  @Field(() => Int, { nullable: true, defaultValue: 50, description: 'Количество записей' })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  take?: number;

  @Field(() => Int, { nullable: true, defaultValue: 0, description: 'Смещение' })
  @IsOptional()
  @IsInt()
  @Min(0)
  skip?: number;
}
