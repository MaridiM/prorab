import { Field, InputType, Int } from '@nestjs/graphql'
import { IsEnum, IsInt, IsNotEmpty, IsString, Min } from 'class-validator'
import { TaskStatus } from '../enums/task-status.enum'

@InputType()
export class MoveTaskInput {
	@Field(() => String, { description: 'ID перемещаемой задачи' })
	@IsNotEmpty({ message: 'ID задачи обязателен' })
	@IsString()
	taskId: string

	@Field(() => TaskStatus, { description: 'Новый статус задачи' })
	@IsNotEmpty({ message: 'Новый статус обязателен' })
	@IsEnum(TaskStatus)
	newStatus: TaskStatus

	@Field(() => Int, { description: 'Новый индекс позиции (orderIndex)' })
	@IsNotEmpty({ message: 'Новый индекс позиции обязателен' })
	@IsInt()
	@Min(0)
	newOrderIndex: number
}
