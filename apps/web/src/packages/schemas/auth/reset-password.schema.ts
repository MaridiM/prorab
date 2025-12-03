import { z } from 'zod'

export const resetPasswordSchema = z
	.object({
		password: z
			.string()
			.nonempty({ message: 'Пароль обязателен' })
			.min(8, { message: 'Минимум 8 символов' })
			.regex(/(?=.*[a-zA-Z])(?=.*\d)/, {
				message: 'Пароль должен содержать буквы и цифры'
			}),
		confirmPassword: z.string().nonempty({ message: 'Подтвердите пароль' })
	})
	.refine(data => data.password === data.confirmPassword, {
		message: 'Пароли не совпадают',
		path: ['confirmPassword']
	})

export type TResetPasswordSchema = z.infer<typeof resetPasswordSchema>
