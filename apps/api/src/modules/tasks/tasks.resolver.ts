import { UseGuards } from '@nestjs/common'
import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql'
import { CurrentUser } from '../auth/decorators/current-user.decorator'
import { AuthGuard } from '../auth/guards/auth.guard'
import { TaskModel } from './models/task.model'
import { TasksByStatusModel } from './models/tasks-by-status.model'
import { CreateTaskInput } from './dto/create-task.input'
import { UpdateTaskInput } from './dto/update-task.input'
import { MoveTaskInput } from './dto/move-task.input'
import { TasksService } from './tasks.service'

@Resolver(() => TaskModel)
export class TasksResolver {
	constructor(private readonly tasksService: TasksService) {}

	// ========== QUERIES ==========

	@Query(() => TaskModel, { description: 'Получить задачу по ID' })
	@UseGuards(AuthGuard)
	async task(
		@Args('id', { type: () => ID }) id: string,
		@CurrentUser() user: { id: string }
	) {
		return this.tasksService.findById(id, user.id)
	}

	@Query(() => TasksByStatusModel, {
		description: 'Получить задачи проекта, сгруппированные по статусу (для Kanban)',
	})
	@UseGuards(AuthGuard)
	async projectTasks(
		@Args('projectId', { type: () => ID }) projectId: string,
		@CurrentUser() user: { id: string }
	) {
		return this.tasksService.findByProject(projectId, user.id)
	}

	@Query(() => [TaskModel], {
		description: 'Получить задачи, назначенные участнику',
	})
	@UseGuards(AuthGuard)
	async memberTasks(
		@Args('assigneeId', { type: () => ID }) assigneeId: string,
		@CurrentUser() user: { id: string }
	) {
		return this.tasksService.findByAssignee(assigneeId, user.id)
	}

	@Query(() => [TaskModel], {
		description: 'Получить все задачи пользователя (созданные или назначенные)',
	})
	@UseGuards(AuthGuard)
	async myTasks(@CurrentUser() user: { id: string }) {
		return this.tasksService.findByUser(user.id)
	}

	// ========== MUTATIONS ==========

	@Mutation(() => TaskModel, { description: 'Создать задачу' })
	@UseGuards(AuthGuard)
	async createTask(
		@Args('input') input: CreateTaskInput,
		@CurrentUser() user: { id: string }
	) {
		return this.tasksService.create(input, user.id)
	}

	@Mutation(() => TaskModel, { description: 'Обновить задачу' })
	@UseGuards(AuthGuard)
	async updateTask(
		@Args('id', { type: () => ID }) id: string,
		@Args('input') input: UpdateTaskInput,
		@CurrentUser() user: { id: string }
	) {
		return this.tasksService.update(id, input, user.id)
	}

	@Mutation(() => TaskModel, {
		description: 'Переместить задачу (drag & drop)',
	})
	@UseGuards(AuthGuard)
	async moveTask(
		@Args('input') input: MoveTaskInput,
		@CurrentUser() user: { id: string }
	) {
		return this.tasksService.moveTask(input, user.id)
	}

	@Mutation(() => TaskModel, { description: 'Удалить задачу' })
	@UseGuards(AuthGuard)
	async deleteTask(
		@Args('id', { type: () => ID }) id: string,
		@CurrentUser() user: { id: string }
	) {
		return this.tasksService.delete(id, user.id)
	}
}
