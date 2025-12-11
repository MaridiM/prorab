import { Field, InputType } from '@nestjs/graphql'
import {
	IsEnum,
	IsOptional,
	IsString,
	MaxLength,
	IsDateString,
} from 'class-validator'
import { TaskStatus } from '../enums/task-status.enum'
import { TaskPriority } from '../enums/task-priority.enum'

@InputType()
export class UpdateTaskInput {
	@Field(() => String, {
		nullable: true,
		description: 'Название задачи',
	})
	@IsOptional()
	@IsString()
	@MaxLength(200, {
		message: 'Название задачи не может быть длиннее 200 символов',
	})
	title?: string

	@Field(() => String, {
		nullable: true,
		description: 'Описание задачи',
	})
	@IsOptional()
	@IsString()
	description?: string

	@Field(() => TaskStatus, {
		nullable: true,
		description: 'Статус задачи',
	})
	@IsOptional()
	@IsEnum(TaskStatus)
	status?: TaskStatus

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
