import { z } from 'zod'

export const loginSchema = z.object({
	email: z
		.string()
		.nonempty({ message: 'Email обязателен' })
		.email({ message: 'Неверный формат email' }),
	password: z.string().nonempty({ message: 'Пароль обязателен' }).min(8, { message: 'Минимум 8 символов' })
})

export type TLoginSchema = z.infer<typeof loginSchema>
