import { registerEnumType } from '@nestjs/graphql'

export enum TaskStatus {
	TODO = 'TODO',
	IN_PROGRESS = 'IN_PROGRESS',
	DONE = 'DONE',
}

registerEnumType(TaskStatus, {
	name: 'TaskStatus',
	description: 'Статус задачи',
})
