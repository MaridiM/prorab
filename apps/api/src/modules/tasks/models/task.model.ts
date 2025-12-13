import { Field, ID, Int, ObjectType } from '@nestjs/graphql'
import { GraphQLJSON } from 'graphql-scalars'
import { TaskStatus } from '../enums/task-status.enum'
import { TaskPriority } from '../enums/task-priority.enum'
import { User } from '../../users/models/user.model'
import { TeamMember } from '../../teams/models/team-member.model'

/**
 * GraphQL модель задачи
 */
@ObjectType('Task')
export class TaskModel {
	@Field(() => ID)
	id: string

	@Field(() => ID, { description: 'ID проекта' })
	projectId: string

	@Field(() => String, { description: 'Название задачи' })
	title: string

	@Field(() => String, { nullable: true, description: 'Описание задачи' })
	description?: string

	@Field(() => TaskStatus, { description: 'Статус задачи' })
	status: TaskStatus

	@Field(() => ID, { nullable: true, description: 'ID назначенного участника' })
	assigneeId?: string

	@Field(() => TeamMember, {
		nullable: true,
		description: 'Назначенный участник',
	})
	assignee?: TeamMember

	@Field(() => TaskPriority, { description: 'Приоритет задачи' })
	priority: TaskPriority

	@Field(() => Date, { nullable: true, description: 'Срок выполнения' })
	dueDate?: Date

	@Field(() => Int, { description: 'Индекс порядка для drag & drop' })
	orderIndex: number

	@Field(() => GraphQLJSON, {
		nullable: true,
		description: 'Чек-лист задачи (JSON)',
	})
	checklist?: any

	@Field(() => ID, { description: 'ID создателя задачи' })
	createdById: string

	@Field(() => User, { nullable: true, description: 'Создатель задачи' })
	createdBy?: User

	@Field(() => Date, { description: 'Дата создания' })
	createdAt: Date

	@Field(() => Date, { description: 'Дата последнего обновления' })
	updatedAt: Date

	@Field(() => Date, { nullable: true, description: 'Дата завершения' })
	completedAt?: Date
}
