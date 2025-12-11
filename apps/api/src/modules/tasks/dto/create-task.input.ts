import { Field, InputType } from '@nestjs/graphql'
import {
	IsEnum,
	IsNotEmpty,
	IsOptional,
	IsString,
	MaxLength,
	IsDateString,
} from 'class-validator'
import { TaskPriority } from '../enums/task-priority.enum'

@InputType()
export class CreateTaskInput {
	@Field(() => String, { description: 'ID проекта' })
	@IsNotEmpty({ message: 'ID проекта обязателен' })
	@IsString()
	projectId: string

	@Field(() => String, { description: 'Название задачи' })
	@IsNotEmpty({ message: 'Название задачи обязательно' })
	@IsString()
	@MaxLength(200, {
		message: 'Название задачи не может быть длиннее 200 символов',
	})
	title: string

	@Field(() => String, {
		nullable: true,
		description: 'Описание задачи',
	})
	@IsOptional()
	@IsString()
	description?: string

	@Field(() => String, {
		nullable: true,
		description: 'ID назначенного участника команды',
	})
	@IsOptional()
	@IsString()
	assigneeId?: string

	@Field(() => TaskPriority, {
		nullable: true,
		description: 'Приоритет задачи',
		defaultValue: TaskPriority.MEDIUM,
	})
	@IsOptional()
	@IsEnum(TaskPriority)
	priority?: TaskPriority

	@Field(() => String, {
		nullable: true,
		description: 'Срок выполнения (ISO 8601)',
	})
	@IsOptional()
	@IsDateString()
	dueDate?: string
}
