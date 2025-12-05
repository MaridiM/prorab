import { z } from 'zod'

/**
 * Enum для статуса проекта (синхронизирован с backend ProjectStatus)
 */
export const ProjectStatus = {
	ACTIVE: 'ACTIVE',
	ARCHIVED: 'ARCHIVED',
	COMPLETED: 'COMPLETED',
} as const

export type ProjectStatusType = (typeof ProjectStatus)[keyof typeof ProjectStatus]

/**
 * Схема валидации для создания проекта
 * Синхронизирована с backend CreateProjectInput
 */
export const createProjectSchema = z
	.object({
		teamId: z.string().nonempty({ message: 'ID команды обязателен' }),
		name: z
			.string()
			.nonempty({ message: 'Название проекта обязательно' })
			.max(200, { message: 'Название проекта не должно превышать 200 символов' })
			.trim(),
		address: z
			.string()
			.max(500, { message: 'Адрес проекта не должен превышать 500 символов' })
			.trim()
			.optional()
			.or(z.literal('')),
		description: z
			.string()
			.max(2000, { message: 'Описание проекта не должно превышать 2000 символов' })
			.trim()
			.optional()
			.or(z.literal('')),
		budget: z
			.number()
			.min(0, { message: 'Бюджет не может быть отрицательным' })
			.optional()
			.nullable(),
		clientPhone: z
			.string()
			.optional()
			.refine(val => !val || /^\+?[1-9]\d{1,14}$/.test(val), {
				message: 'Неверный формат телефона',
			})
			.or(z.literal('')),
		startDate: z.date().optional().nullable(),
		endDate: z.date().optional().nullable(),
		notes: z
			.string()
			.max(2000, { message: 'Заметки не должны превышать 2000 символов' })
			.trim()
			.optional()
			.or(z.literal('')),
	})
	.refine(
		data => {
			// Валидация дат: endDate должен быть >= startDate
			if (data.startDate && data.endDate) {
				return data.endDate >= data.startDate
			}
			return true
		},
		{
			message: 'Дата завершения не может быть раньше даты начала',
			path: ['endDate'],
		}
	)

/**
 * Схема валидации для обновления проекта
 * Все поля опциональны
 */
export const updateProjectSchema = z
	.object({
		name: z
			.string()
			.nonempty({ message: 'Название проекта обязательно' })
			.max(200, { message: 'Название проекта не должно превышать 200 символов' })
			.trim()
			.optional(),
		address: z
			.string()
			.max(500, { message: 'Адрес проекта не должен превышать 500 символов' })
			.trim()
			.optional()
			.or(z.literal('')),
		description: z
			.string()
			.max(2000, { message: 'Описание проекта не должно превышать 2000 символов' })
			.trim()
			.optional()
			.or(z.literal('')),
		budget: z
			.number()
			.min(0, { message: 'Бюджет не может быть отрицательным' })
			.optional()
			.nullable(),
		clientPhone: z
			.string()
			.optional()
			.refine(val => !val || /^\+?[1-9]\d{1,14}$/.test(val), {
				message: 'Неверный формат телефона',
			})
			.or(z.literal('')),
		startDate: z.date().optional().nullable(),
		endDate: z.date().optional().nullable(),
		notes: z
			.string()
			.max(2000, { message: 'Заметки не должны превышать 2000 символов' })
			.trim()
			.optional()
			.or(z.literal('')),
	})
	.refine(
		data => {
			// Валидация дат: endDate должен быть >= startDate
			if (data.startDate && data.endDate) {
				return data.endDate >= data.startDate
			}
			return true
		},
		{
			message: 'Дата завершения не может быть раньше даты начала',
			path: ['endDate'],
		}
	)

/**
 * Схема валидации для фильтрации проектов
 */
export const projectFilterSchema = z.object({
	status: z
		.enum([ProjectStatus.ACTIVE, ProjectStatus.ARCHIVED, ProjectStatus.COMPLETED])
		.optional(),
	searchQuery: z.string().trim().optional(),
	take: z.number().min(1).max(100).optional().default(50),
	skip: z.number().min(0).optional().default(0),
})

/**
 * Схема валидации для обновления прогресса
 */
export const updateProgressSchema = z.object({
	progress: z
		.number()
		.min(0, { message: 'Прогресс не может быть меньше 0' })
		.max(100, { message: 'Прогресс не может быть больше 100' }),
})

/**
 * TypeScript типы из схем
 */
export type CreateProjectInput = z.infer<typeof createProjectSchema>
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>
export type ProjectFilterInput = z.infer<typeof projectFilterSchema>
export type UpdateProgressInput = z.infer<typeof updateProgressSchema>
