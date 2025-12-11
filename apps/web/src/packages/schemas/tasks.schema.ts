import { z } from 'zod'

/**
 * Zod schemas for Task validation
 */

// Enum schemas
export const taskStatusSchema = z.enum(['TODO', 'IN_PROGRESS', 'DONE'])
export const taskPrioritySchema = z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT'])

// Create Task schema
export const createTaskSchema = z.object({
	projectId: z.string().min(1, 'Проект обязателен'),
	title: z
		.string()
		.min(1, 'Название обязательно')
		.max(200, 'Название не должно превышать 200 символов'),
	description: z.string().optional(),
	assigneeId: z.string().optional(),
	priority: taskPrioritySchema.default('MEDIUM'),
	dueDate: z.date().optional(),
	checklist: z.any().optional(), // JSON field
})

// Update Task schema (all fields optional except validation)
export const updateTaskSchema = z.object({
	title: z
		.string()
		.min(1, 'Название обязательно')
		.max(200, 'Название не должно превышать 200 символов')
		.optional(),
	description: z.string().optional(),
	status: taskStatusSchema.optional(),
	assigneeId: z.string().nullable().optional(),
	priority: taskPrioritySchema.optional(),
	dueDate: z.date().nullable().optional(),
	checklist: z.any().optional(), // JSON field
})

// Move Task schema
export const moveTaskSchema = z.object({
	taskId: z.string().min(1, 'ID задачи обязателен'),
	newStatus: taskStatusSchema,
	newOrderIndex: z.number().int().min(0, 'Индекс должен быть >= 0'),
})

// Type exports
export type CreateTaskInput = z.infer<typeof createTaskSchema>
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>
export type MoveTaskInput = z.infer<typeof moveTaskSchema>
export type TaskStatus = z.infer<typeof taskStatusSchema>
export type TaskPriority = z.infer<typeof taskPrioritySchema>
