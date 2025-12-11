import {
	ForbiddenException,
	Injectable,
	Logger,
	NotFoundException,
} from '@nestjs/common'
import { PrismaService } from '../../core/prisma/prisma.service'
import { CreateTaskInput } from './dto/create-task.input'
import { UpdateTaskInput } from './dto/update-task.input'
import { MoveTaskInput } from './dto/move-task.input'
import { TaskStatus } from './enums/task-status.enum'

@Injectable()
export class TasksService {
	private readonly logger = new Logger(TasksService.name)

	constructor(private readonly prisma: PrismaService) {}

	// ========== QUERIES ==========

	/**
	 * Получить задачу по ID с проверкой доступа
	 */
	async findById(id: string, userId: string) {
		const task = await this.prisma.task.findUnique({
			where: { id },
			include: {
				project: {
					include: {
						team: {
							include: {
								members: true,
							},
						},
					},
				},
				assignee: {
					include: {
						user: true,
					},
				},
				createdBy: true,
			},
		})

		if (!task) {
			throw new NotFoundException('Задача не найдена')
		}

		const isMember = task.project.team.members.some((m) => m.userId === userId)
		if (!isMember) {
			throw new ForbiddenException('У вас нет доступа к этой задаче')
		}

		return task
	}

	/**
	 * Получить все задачи проекта, сгруппированные по статусу (для Kanban доски)
	 */
	async findByProject(projectId: string, userId: string) {
		await this.validateProjectAccess(projectId, userId)

		const tasks = await this.prisma.task.findMany({
			where: { projectId },
			include: {
				assignee: {
					include: {
						user: true,
					},
				},
				createdBy: true,
			},
			orderBy: [
				{ status: 'asc' },
				{ orderIndex: 'asc' },
			],
		})

		// Группировка по статусам для Kanban
		return {
			todo: tasks.filter((t) => t.status === TaskStatus.TODO),
			inProgress: tasks.filter((t) => t.status === TaskStatus.IN_PROGRESS),
			done: tasks.filter((t) => t.status === TaskStatus.DONE),
		}
	}

	/**
	 * Получить задачи, назначенные участнику команды
	 */
	async findByAssignee(assigneeId: string, userId: string) {
		const tasks = await this.prisma.task.findMany({
			where: { assigneeId },
			include: {
				project: {
					include: {
						team: {
							include: {
								members: true,
							},
						},
					},
				},
				assignee: {
					include: {
						user: true,
					},
				},
				createdBy: true,
			},
			orderBy: [
				{ status: 'asc' },
				{ dueDate: 'asc' },
			],
		})

		// Проверка доступа: пользователь должен быть участником команды проекта
		return tasks.filter((task) =>
			task.project.team.members.some((m) => m.userId === userId)
		)
	}

	/**
	 * Получить все задачи пользователя (созданные или назначенные)
	 */
	async findByUser(userId: string) {
		return this.prisma.task.findMany({
			where: {
				OR: [
					{ createdById: userId },
					{
						assignee: {
							userId,
						},
					},
				],
			},
			include: {
				project: {
					select: {
						id: true,
						name: true,
					},
				},
				assignee: {
					include: {
						user: true,
					},
				},
				createdBy: true,
			},
			orderBy: [
				{ status: 'asc' },
				{ dueDate: 'asc' },
			],
		})
	}

	// ========== MUTATIONS ==========

	/**
	 * Создать новую задачу
	 */
	async create(input: CreateTaskInput, userId: string) {
		await this.validateProjectAccess(input.projectId, userId)

		// Если указан assignee, проверить что он участник команды проекта
		if (input.assigneeId) {
			await this.validateAssignee(input.assigneeId, input.projectId)
		}

		// Определить максимальный orderIndex для статуса TODO
		const maxOrderTask = await this.prisma.task.findFirst({
			where: {
				projectId: input.projectId,
				status: TaskStatus.TODO,
			},
			orderBy: {
				orderIndex: 'desc',
			},
		})

		const newOrderIndex = maxOrderTask ? maxOrderTask.orderIndex + 1 : 0

		return this.prisma.task.create({
			data: {
				title: input.title,
				description: input.description,
				projectId: input.projectId,
				assigneeId: input.assigneeId,
				priority: input.priority || 'MEDIUM',
				dueDate: input.dueDate ? new Date(input.dueDate) : undefined,
				status: TaskStatus.TODO,
				orderIndex: newOrderIndex,
				createdById: userId,
			},
			include: {
				assignee: {
					include: {
						user: true,
					},
				},
				createdBy: true,
			},
		})
	}

	/**
	 * Обновить задачу
	 */
	async update(id: string, input: UpdateTaskInput, userId: string) {
		const task = await this.findById(id, userId)

		// Если изменяется assignee, проверить что он участник команды
		if (input.assigneeId !== undefined) {
			if (input.assigneeId) {
				await this.validateAssignee(input.assigneeId, task.projectId)
			}
		}

		const updateData: any = {
			...input,
			dueDate: input.dueDate ? new Date(input.dueDate) : undefined,
		}

		// Если статус меняется на DONE, установить completedAt
		if (input.status === TaskStatus.DONE && task.status !== TaskStatus.DONE) {
			updateData.completedAt = new Date()
		}

		// Если статус меняется с DONE на другой, сбросить completedAt
		if (input.status && input.status !== TaskStatus.DONE && task.status === TaskStatus.DONE) {
			updateData.completedAt = null
		}

		return this.prisma.task.update({
			where: { id },
			data: updateData,
			include: {
				assignee: {
					include: {
						user: true,
					},
				},
				createdBy: true,
			},
		})
	}

	/**
	 * КРИТИЧНО: Переместить задачу (drag & drop с Prisma transactions)
	 * Обрабатывает два случая:
	 * 1. Cross-column move (изменение status)
	 * 2. Same-column reorder (изменение orderIndex)
	 */
	async moveTask(input: MoveTaskInput, userId: string) {
		const task = await this.findById(input.taskId, userId)
		const statusChanged = task.status !== input.newStatus

		return this.prisma.$transaction(async (tx) => {
			if (statusChanged) {
				// CASE 1: Перемещение между колонками (изменение status)
				this.logger.debug(
					`Moving task ${task.id} from ${task.status} (index ${task.orderIndex}) to ${input.newStatus} (index ${input.newOrderIndex})`
				)

				// 1. Удалить из старой колонки: сдвинуть вниз все задачи ниже текущей
				await tx.task.updateMany({
					where: {
						projectId: task.projectId,
						status: task.status,
						orderIndex: { gt: task.orderIndex },
					},
					data: { orderIndex: { decrement: 1 } },
				})

				// 2. Освободить место в новой колонке: сдвинуть вниз все задачи на/ниже новой позиции
				await tx.task.updateMany({
					where: {
						projectId: task.projectId,
						status: input.newStatus,
						orderIndex: { gte: input.newOrderIndex },
					},
					data: { orderIndex: { increment: 1 } },
				})

				// 3. Обновить задачу
				return tx.task.update({
					where: { id: input.taskId },
					data: {
						status: input.newStatus,
						orderIndex: input.newOrderIndex,
						completedAt: input.newStatus === TaskStatus.DONE ? new Date() : null,
					},
					include: {
						assignee: {
							include: {
								user: true,
							},
						},
						createdBy: true,
					},
				})
			} else {
				// CASE 2: Переупорядочивание внутри одной колонки
				const movingUp = input.newOrderIndex < task.orderIndex

				this.logger.debug(
					`Reordering task ${task.id} in ${task.status} from index ${task.orderIndex} to ${input.newOrderIndex} (moving ${movingUp ? 'up' : 'down'})`
				)

				if (movingUp) {
					// Перемещение вверх: сдвинуть вниз задачи между новой и старой позицией
					await tx.task.updateMany({
						where: {
							projectId: task.projectId,
							status: task.status,
							orderIndex: { gte: input.newOrderIndex, lt: task.orderIndex },
						},
						data: { orderIndex: { increment: 1 } },
					})
				} else {
					// Перемещение вниз: сдвинуть вверх задачи между старой и новой позицией
					await tx.task.updateMany({
						where: {
							projectId: task.projectId,
							status: task.status,
							orderIndex: { gt: task.orderIndex, lte: input.newOrderIndex },
						},
						data: { orderIndex: { decrement: 1 } },
					})
				}

				return tx.task.update({
					where: { id: input.taskId },
					data: { orderIndex: input.newOrderIndex },
					include: {
						assignee: {
							include: {
								user: true,
							},
						},
						createdBy: true,
					},
				})
			}
		})
	}

	/**
	 * Удалить задачу и переиндексировать оставшиеся
	 */
	async delete(id: string, userId: string) {
		const task = await this.findById(id, userId)

		return this.prisma.$transaction(async (tx) => {
			// 1. Удалить задачу
			await tx.task.delete({
				where: { id },
			})

			// 2. Сдвинуть вниз все задачи в той же колонке, которые были ниже удалённой
			await tx.task.updateMany({
				where: {
					projectId: task.projectId,
					status: task.status,
					orderIndex: { gt: task.orderIndex },
				},
				data: { orderIndex: { decrement: 1 } },
			})

			return task
		})
	}

	// ========== VALIDATION HELPERS ==========

	/**
	 * Проверить доступ пользователя к проекту
	 */
	private async validateProjectAccess(
		projectId: string,
		userId: string
	): Promise<void> {
		const project = await this.prisma.project.findUnique({
			where: { id: projectId },
			include: {
				team: {
					include: {
						members: true,
					},
				},
			},
		})

		if (!project) {
			throw new NotFoundException('Проект не найден')
		}

		const isMember = project.team.members.some((m) => m.userId === userId)
		if (!isMember) {
			throw new ForbiddenException('У вас нет доступа к этому проекту')
		}
	}

	/**
	 * Проверить что assignee является участником команды проекта
	 */
	private async validateAssignee(
		assigneeId: string,
		projectId: string
	): Promise<void> {
		const project = await this.prisma.project.findUnique({
			where: { id: projectId },
			include: {
				team: {
					include: {
						members: true,
					},
				},
			},
		})

		if (!project) {
			throw new NotFoundException('Проект не найден')
		}

		const isTeamMember = project.team.members.some((m) => m.id === assigneeId)
		if (!isTeamMember) {
			throw new ForbiddenException(
				'Назначаемый участник не является членом команды этого проекта'
			)
		}
	}
}
