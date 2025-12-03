import { z } from 'zod'

export const forgotPasswordSchema = z.object({
	email: z.string().nonempty({ message: 'Email обязателен' }).email({ message: 'Неверный формат email' })
})

export type TForgotPasswordSchema = z.infer<typeof forgotPasswordSchema>
