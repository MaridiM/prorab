'use client'

import { useState, useEffect } from 'react'
import { useMutation } from '@apollo/client/react'
import { gql } from '@apollo/client'
import { Button } from '../ui/button'
import { Spinner } from '../ui/spinner'
import { toast } from 'sonner'

const INIT_TELEGRAM_AUTH = gql`
	mutation InitTelegramAuth {
		initTelegramAuth {
			token
			deepLink
			expiresAt
		}
	}
`

const CHECK_TELEGRAM_AUTH = gql`
	mutation CheckTelegramAuth($input: CheckTelegramAuthInput!) {
		checkTelegramAuth(input: $input) {
			completed
			user {
				id
				email
				fullName
				hasCompletedOnboarding
			}
			sessionToken
			refreshToken
		}
	}
`

interface TelegramLoginButtonProps {
	onSuccess: (user: any) => void
	isLoading?: boolean
	className?: string
}

export function TelegramLoginButton({
	onSuccess,
	isLoading = false,
	className = '',
}: TelegramLoginButtonProps) {
	const [authToken, setAuthToken] = useState<string | null>(null)
	const [pollingActive, setPollingActive] = useState(false)

	const [initAuth, { loading: initLoading }] = useMutation(INIT_TELEGRAM_AUTH)
	const [checkAuth, { loading: checkLoading }] = useMutation(CHECK_TELEGRAM_AUTH)

	// Polling logic
	useEffect(() => {
		if (!authToken || !pollingActive) return

		let interval: NodeJS.Timeout
		let timeout: NodeJS.Timeout

		const startPolling = () => {
			interval = setInterval(async () => {
				try {
					const { data } = await checkAuth({
						variables: { input: { token: authToken } },
					})

					if (data?.checkTelegramAuth?.completed) {
						clearInterval(interval)
						clearTimeout(timeout)
						setPollingActive(false)

						toast.success('Вход выполнен успешно!')

						// Вызываем колбэк с данными пользователя
						onSuccess(data.checkTelegramAuth.user)
					}
				} catch (error) {
					console.error('Telegram auth polling error:', error)
				}
			}, 2000) // Проверяем каждые 2 секунды

			// Таймаут 10 минут
			timeout = setTimeout(() => {
				clearInterval(interval)
				setPollingActive(false)
				setAuthToken(null)
				toast.error('Время ожидания истекло. Попробуйте снова.')
			}, 600000)
		}

		startPolling()

		return () => {
			clearInterval(interval)
			clearTimeout(timeout)
		}
	}, [authToken, pollingActive, checkAuth, onSuccess])

	const handleTelegramLogin = async () => {
		try {
			const { data } = await initAuth()

			if (data?.initTelegramAuth) {
				const { token, deepLink } = data.initTelegramAuth
				setAuthToken(token)
				setPollingActive(true)

				// Открыть deep link в новом окне
				window.open(deepLink, '_blank')

				toast.info('Откройте Telegram и нажмите Start в боте', {
					duration: 5000,
				})
			}
		} catch (error: any) {
			console.error('Telegram auth init error:', error)
			toast.error(
				error.message || 'Ошибка инициализации авторизации через Telegram',
			)
		}
	}

	const loading = isLoading || initLoading || checkLoading || pollingActive

	return (
		<Button
			type="button"
			variant="outline"
			className={`w-full ${className}`}
			onClick={handleTelegramLogin}
			disabled={loading}
		>
			{loading ? (
				<>
					<Spinner className="mr-2 h-4 w-4" />
					{pollingActive
						? 'Ожидание подтверждения в Telegram...'
						: 'Загрузка...'}
				</>
			) : (
				<>
					<svg
						className="mr-2 h-5 w-5"
						fill="currentColor"
						viewBox="0 0 24 24"
						xmlns="http://www.w3.org/2000/svg"
					>
						<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.27-.02-.12.02-1.96 1.25-5.54 3.67-.52.36-.99.53-1.42.52-.47-.01-1.37-.26-2.03-.48-.82-.27-1.47-.42-1.42-.88.03-.24.37-.48 1.02-.73 3.98-1.73 6.64-2.87 7.97-3.43 3.8-1.58 4.58-1.86 5.1-1.86.11 0 .36.03.52.17.14.12.17.28.19.39.01.11.03.36.01.56z" />
					</svg>
					Войти через Telegram
				</>
			)}
		</Button>
	)
}
