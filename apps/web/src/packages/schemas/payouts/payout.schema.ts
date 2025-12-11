import { z } from 'zod'

/**
 * Enum для статусов выплат
 */
export const PayoutStatusEnum = z.enum(['PENDING', 'PAID'])

/**
 * Схема для создания выплаты
 */
export const createPayoutSchema = z.object({
  projectId: z.string().min(1, 'ID проекта обязателен'),
  memberId: z.string().min(1, 'ID участника обязателен'),
  calculatedAmount: z.number()
    .min(0, 'Сумма не может быть отрицательной')
    .refine(val => val > 0, 'Сумма должна быть больше 0'),
  actualAmount: z.number()
    .min(0, 'Фактическая сумма не может быть отрицательной')
    .optional()
    .nullable(),
  notes: z.string()
    .max(500, 'Заметки не могут превышать 500 символов')
    .optional()
    .nullable()
})

/**
 * Схема для закрытия проекта
 */
export const closeProjectSchema = z.object({
  projectId: z.string().min(1, 'ID проекта обязателен')
})

// TypeScript типы
export type PayoutStatus = z.infer<typeof PayoutStatusEnum>
export type CreatePayoutInput = z.infer<typeof createPayoutSchema>
export type CloseProjectInput = z.infer<typeof closeProjectSchema>
