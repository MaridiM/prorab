import { Field, Float, InputType } from '@nestjs/graphql';
import { IsBoolean, IsNotEmpty, IsOptional, IsString, Min, MaxLength, IsIn } from 'class-validator';

const EXPENSE_CATEGORIES = [
  'Материалы',
  'Работа бригады',
  'Черновые материалы',
  'Чистовые материалы',
  'Инструмент',
  'Аренда техники',
  'Транспорт',
  'Прочее',
] as const;

@InputType()
export class CreateExpenseInput {
  @Field(() => String, { description: 'ID проекта' })
  @IsNotEmpty({ message: 'ID проекта обязателен' })
  @IsString()
  projectId: string;

  @Field(() => Float, { description: 'Сумма расхода' })
  @IsNotEmpty({ message: 'Сумма расхода обязательна' })
  @Min(0.01, { message: 'Сумма должна быть больше 0' })
  amount: number;

  @Field(() => String, { description: 'Категория расхода' })
  @IsNotEmpty({ message: 'Категория обязательна' })
  @IsString()
  @IsIn(EXPENSE_CATEGORIES, {
    message: `Категория должна быть одной из: ${EXPENSE_CATEGORIES.join(', ')}`,
  })
  category: string;

  @Field(() => [String], { nullable: true, description: 'Массив URL фотографий' })
  @IsOptional()
  photos?: string[];

  @Field(() => String, { nullable: true, description: 'Комментарий к расходу' })
  @IsOptional()
  @IsString()
  @MaxLength(5000, { message: 'Комментарий не может быть длиннее 5000 символов' })
  comment?: string;

  @Field(() => Boolean, { nullable: true, description: 'Оплачено клиентом' })
  @IsOptional()
  @IsBoolean()
  paidByClient?: boolean;
}
