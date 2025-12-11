import { Field, ObjectType } from '@nestjs/graphql'
import { TaskModel } from './task.model'

/**
 * GraphQL модель для задач, сгруппированных по статусу (для Kanban доски)
 */
@ObjectType('TasksByStatus')
export class TasksByStatusModel {
	@Field(() => [TaskModel], { description: 'Задачи со статусом TODO' })
	todo: TaskModel[]

	@Field(() => [TaskModel], { description: 'Задачи со статусом IN_PROGRESS' })
	inProgress: TaskModel[]

	@Field(() => [TaskModel], { description: 'Задачи со статусом DONE' })
	done: TaskModel[]
}
