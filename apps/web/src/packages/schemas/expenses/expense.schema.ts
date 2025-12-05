import { z } from 'zod'

/**
 * Категории расходов (синхронизированы с backend)
 */
export const EXPENSE_CATEGORIES = [
	'Материалы',
	'Работа бригады',
	'Черновые материалы',
	'Чистовые материалы',
	'Инструмент',
	'Аренда техники',
	'Транспорт',
	'Прочее',
] as const

export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number]

/**
 * Схема валидации для создания расхода
 * Синхронизирована с backend CreateExpenseInput
 */
export const createExpenseSchema = z.object({
	projectId: z.string().min(1, 'ID проекта обязателен'),
	amount: z
		.number({ message: 'Сумма расхода обязательна' })
		.min(0.01, 'Сумма должна быть больше 0'),
	category: z.enum(EXPENSE_CATEGORIES, { message: 'Категория обязательна' }),
	photos: z.array(z.string().url('Неверный формат URL')).default([]),
	comment: z
		.string()
		.max(5000, 'Комментарий не может быть длиннее 5000 символов')
		.trim()
		.optional()
		.or(z.literal('')),
	paidByClient: z.boolean().default(false),
})

/**
 * Схема валидации для обновления расхода
 * Все поля опциональны, кроме id
 */
export const updateExpenseSchema = z.object({
	id: z.string().min(1, 'ID расхода обязателен'),
	amount: z.number().min(0.01, 'Сумма должна быть больше 0').optional(),
	category: z.enum(EXPENSE_CATEGORIES, { message: 'Неверная категория' }).optional(),
	photos: z.array(z.string().url('Неверный формат URL')).optional(),
	comment: z
		.string()
		.max(5000, 'Комментарий не может быть длиннее 5000 символов')
		.trim()
		.optional()
		.or(z.literal('')),
	paidByClient: z.boolean().optional(),
})

/**
 * TypeScript типы из схем
 */
export type CreateExpenseInput = z.infer<typeof createExpenseSchema>
export type UpdateExpenseInput = z.infer<typeof updateExpenseSchema>
