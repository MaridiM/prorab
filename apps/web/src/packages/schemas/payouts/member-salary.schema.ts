import { z } from 'zod'

/**
 * Enum для типов зарплаты
 */
export const SalaryTypeEnum = z.enum(['FIXED', 'PERCENTAGE', 'NONE'])

/**
 * Схема для обновления зарплаты участника
 */
export const updateMemberSalarySchema = z.object({
  memberId: z.string().min(1, 'ID участника обязателен'),
  salaryType: SalaryTypeEnum,
  salaryAmount: z.number()
    .min(0, 'Сумма не может быть отрицательной')
    .max(100, 'Процент не может быть больше 100')
    .optional()
    .nullable()
}).refine(
  (data) => {
    // Если тип PERCENTAGE, сумма обязательна и должна быть 0-100
    if (data.salaryType === 'PERCENTAGE') {
      return data.salaryAmount !== null &&
             data.salaryAmount !== undefined &&
             data.salaryAmount > 0 &&
             data.salaryAmount <= 100
    }
    // Для FIXED и NONE сумма не обязательна
    return true
  },
  {
    message: 'Для процентной зарплаты укажите процент от 0 до 100',
    path: ['salaryAmount']
  }
)

// TypeScript типы
export type SalaryType = z.infer<typeof SalaryTypeEnum>
export type UpdateMemberSalaryInput = z.infer<typeof updateMemberSalarySchema>
