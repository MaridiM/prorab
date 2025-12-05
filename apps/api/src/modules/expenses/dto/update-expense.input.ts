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
export class UpdateExpenseInput {
  @Field(() => String, { description: 'ID расхода' })
  @IsNotEmpty({ message: 'ID расхода обязателен' })
  @IsString()
  id: string;

  @Field(() => Float, { nullable: true, description: 'Сумма расхода' })
  @IsOptional()
  @Min(0.01, { message: 'Сумма должна быть больше 0' })
  amount?: number;

  @Field(() => String, { nullable: true, description: 'Категория расхода' })
  @IsOptional()
  @IsString()
  @IsIn(EXPENSE_CATEGORIES, {
    message: `Категория должна быть одной из: ${EXPENSE_CATEGORIES.join(', ')}`,
  })
  category?: string;

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
