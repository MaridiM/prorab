import { z } from 'zod'

export const subscriptionPlanSchema = z.enum(['LITE', 'FOREMAN', 'BRIGADE'], {
  message: 'Выберите тарифный план',
})

export const createSubscriptionSchema = z.object({
  teamId: z.string().uuid({
    message: 'Некорректный ID команды',
  }),
  plan: subscriptionPlanSchema,
  useEarlyBird: z.boolean().optional().default(false),
})

export const changePlanSchema = z.object({
  subscriptionId: z.string().uuid({
    message: 'Некорректный ID подписки',
  }),
  newPlan: subscriptionPlanSchema,
  immediate: z.boolean().default(false),
})

export const cancelSubscriptionSchema = z.object({
  subscriptionId: z.string().uuid({
    message: 'Некорректный ID подписки',
  }),
  reason: z.string().min(10, {
    message: 'Укажите причину отмены (минимум 10 символов)',
  }).max(500, {
    message: 'Причина слишком длинная (максимум 500 символов)',
  }).optional(),
})

export type SubscriptionPlan = z.infer<typeof subscriptionPlanSchema>
export type CreateSubscriptionInput = z.infer<typeof createSubscriptionSchema>
export type ChangePlanInput = z.infer<typeof changePlanSchema>
export type CancelSubscriptionInput = z.infer<typeof cancelSubscriptionSchema>
