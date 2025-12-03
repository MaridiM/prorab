import { useEffect, useRef } from 'react'
import { FieldValues, Path, UseFormReturn } from 'react-hook-form'

interface UseAutoValidateFormOptions<TFieldValues extends FieldValues> {
	/**
	 * Время задержки (debounce) в миллисекундах перед валидацией
	 * @default 300
	 */
	debounceMs?: number
	/**
	 * Не валидировать пустые поля
	 * @default false
	 */
	validateEmpty?: boolean
	/**
	 * Ref для отключения валидации (например, во время submit)
	 */
	suppressRef?: React.MutableRefObject<boolean>
	/**
	 * Callback, вызываемый после валидации
	 */
	onValidate?: (isValid: boolean) => void
}

/**
 * Хук для автоматической валидации полей формы с debounce
 *
 * @example
 * ```tsx
 * const form = useForm<TLoginSchema>({
 *   resolver: zodResolver(loginSchema)
 * })
 *
 * // Автоматическая валидация с debounce 300ms
 * useAutoValidateForm(form, ['email', 'password'])
 *
 * // С кастомными опциями
 * useAutoValidateForm(form, ['email', 'password'], {
 *   debounceMs: 500,
 *   validateEmpty: true,
 *   onValidate: (isValid) => console.log('Valid:', isValid)
 * })
 * ```
 */
export function useAutoValidateForm<TFieldValues extends FieldValues>(
	form: UseFormReturn<TFieldValues>,
	fieldNames: Path<TFieldValues>[],
	options: UseAutoValidateFormOptions<TFieldValues> = {}
) {
	const { debounceMs = 300, validateEmpty = false, suppressRef, onValidate } = options

	const timeoutRef = useRef<NodeJS.Timeout | null>(null)

	useEffect(() => {
		const subscription = form.watch((value, { name }) => {
			// Проверяем, что изменилось одно из отслеживаемых полей
			if (!name || !fieldNames.includes(name as Path<TFieldValues>)) {
				return
			}

			// Проверяем, нужно ли подавить валидацию
			if (suppressRef?.current) {
				return
			}

			// Очищаем предыдущий таймер
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current)
			}

			// Создаем новый таймер для debounce
			timeoutRef.current = setTimeout(async () => {
				const fieldValue = value[name as string]

				// Пропускаем валидацию пустых полей, если validateEmpty = false
				if (!validateEmpty && (fieldValue === '' || fieldValue === null || fieldValue === undefined)) {
					return
				}

				// Запускаем валидацию конкретного поля
				const isValid = await form.trigger(name as Path<TFieldValues>)

				// Вызываем callback, если он предоставлен
				onValidate?.(isValid)
			}, debounceMs)
		})

		// Cleanup функция
		return () => {
			subscription.unsubscribe()
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current)
			}
		}
	}, [form, fieldNames, debounceMs, validateEmpty, suppressRef, onValidate])
}
