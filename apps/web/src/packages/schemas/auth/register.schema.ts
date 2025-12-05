import { z } from 'zod'

export const registerSchema = z
	.object({
		fullName: z
			.string()
			.nonempty({ message: 'Полное имя обязательно' })
			.min(2, { message: 'Имя должно содержать минимум 2 символа' }),
		email: z
			.string()
			.nonempty({ message: 'Email обязателен' })
			.email({ message: 'Неверный формат email' }),
		phone: z
			.string()
			.optional()
			.refine(val => !val || /^\+[1-9]\d{1,14}$/.test(val), {
				message: 'Неверный формат телефона'
			}),
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

export type TRegisterSchema = z.infer<typeof registerSchema>
