'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useQuery, useMutation } from '@apollo/client/react'
import { Card } from '@/packages/components/ui/card'
import { Button } from '@/packages/components/ui/button'
import { Alert, AlertDescription } from '@/packages/components/ui/alert'
import { CheckCircle2, Download, ArrowRight, Loader2 } from 'lucide-react'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale/ru'
import Link from 'next/link'
import { MySubscriptionDocument, ConfirmMockPaymentDocument } from '@/packages/api/graphql'

export default function PaymentSuccessPage() {
	const router = useRouter()
	const searchParams = useSearchParams()
	const [countdown, setCountdown] = useState(5)
	const [hasRedirected, setHasRedirected] = useState(false)
	const [isValid, setIsValid] = useState(false) // Track if page should be shown

	const { data: subscriptionData, loading: subscriptionLoading, refetch: refetchSubscription } = useQuery(MySubscriptionDocument)
	const [confirmMockPayment] = useMutation(ConfirmMockPaymentDocument)

	// Check if payment was cancelled or if user navigated here accidentally
	useEffect(() => {
		const cancelled = searchParams.get('cancelled')
		const cancel = searchParams.get('cancel')
		const success = searchParams.get('success')
		const paymentId = searchParams.get('paymentId')

		// If payment was cancelled, redirect back to settings
		if (cancelled === 'true' || cancel === 'true') {
			router.replace('/settings?tab=subscription')
			return
		}

		// Only show success page if we have paymentId (success=true is optional but preferred)
		// This prevents showing success page when user accidentally lands here
		// But allows showing page if paymentId is present (from real payment providers)
		if (!paymentId) {
			// Missing paymentId - redirect back to settings
			router.replace('/settings?tab=subscription')
			return
		}

		// Clean paymentId - remove any query parameters that might have been accidentally included
		// This handles cases where URL was malformed and paymentId contains "?success=true" etc.
		const cleanPaymentId = paymentId.split('?')[0].split('&')[0].trim()

		// If we reach here, parameters are valid - allow page to show
		setIsValid(true)
		
		// Try to confirm payment if it's still pending
		// This handles both mock payments and real payments where webhook hasn't been called yet
		if (cleanPaymentId && !cleanPaymentId.startsWith('mock-')) {
			// Only confirm real paymentIds (not mock timestamps)
			confirmMockPayment({ variables: { paymentId: cleanPaymentId } })
				.then(() => {
					// Refetch subscription to get updated plan
					refetchSubscription()
				})
				.catch((error: any) => {
					// Payment might already be confirmed or not found - that's okay
					console.log('Payment confirmation result:', error?.message || error)
					// Still refetch subscription in case payment was already confirmed
					refetchSubscription()
				})
		} else {
			// For mock payments or if paymentId is missing, just refetch subscription
			refetchSubscription()
		}
	}, [searchParams, router, confirmMockPayment, refetchSubscription])

	// Prevent back navigation from success page to checkout
	useEffect(() => {
		// Replace current history entry to prevent back navigation to checkout
		// This ensures checkout page is not in history
		window.history.replaceState({ fromSuccess: true }, '', window.location.href)
		
		// Handle browser back button - redirect to dashboard instead of going back
		const handlePopState = () => {
			// Immediately redirect to dashboard when back button is pressed
			window.location.replace('/dashboard')
		}
		
		window.addEventListener('popstate', handlePopState)
		
		return () => {
			window.removeEventListener('popstate', handlePopState)
		}
	}, [])

	useEffect(() => {
		// Only start countdown if page is valid and not already redirected
		if (!isValid || hasRedirected) return

		// Countdown timer for auto-redirect
		const timer = setInterval(() => {
			setCountdown((prev) => {
				if (prev <= 1) {
					clearInterval(timer)
					setHasRedirected(true)
					// Use setTimeout to defer router.push outside of state update
					setTimeout(() => {
						router.push('/dashboard')
					}, 0)
					return 0
				}
				return prev - 1
			})
		}, 1000)

		return () => clearInterval(timer)
	}, [router, hasRedirected, isValid])

	const handleDownloadReceipt = () => {
		// TODO: Implement receipt download
		alert('Загрузка чека скоро будет доступна')
	}

	// Don't render anything if page is not valid (will redirect)
	if (!isValid) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<Loader2 className="h-8 w-8 animate-spin text-primary" />
			</div>
		)
	}

	if (subscriptionLoading) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<Loader2 className="h-8 w-8 animate-spin text-primary" />
			</div>
		)
	}

	const subscription = subscriptionData?.mySubscription

	return (
		<div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
			<Card className="max-w-2xl w-full p-8 space-y-6">
				{/* Success Icon */}
				<div className="flex justify-center">
					<div className="rounded-full bg-green-100 dark:bg-green-900 p-4">
						<CheckCircle2 className="h-16 w-16 text-green-600 dark:text-green-400" />
					</div>
				</div>

				{/* Success Message */}
				<div className="text-center space-y-2">
					<h1 className="text-3xl font-bold text-green-600 dark:text-green-400">
						Оплата прошла успешно!
					</h1>
					<p className="text-muted-foreground text-lg">
						Спасибо за ваш платеж. Подписка активирована.
					</p>
				</div>

				{/* Payment Details - Removed: No user payment query available
				{payment && (
					<div className="space-y-4 pt-4 border-t">
						<h2 className="font-semibold text-lg">Детали платежа</h2>
						<div className="grid grid-cols-2 gap-4 text-sm">
							<div>
								<p className="text-muted-foreground">Сумма</p>
								<p className="font-semibold text-lg">
									{payment.amount.toLocaleString('ru-RU')} {payment.currency}
								</p>
							</div>
							<div>
								<p className="text-muted-foreground">Дата оплаты</p>
								<p className="font-medium">
									{payment.paidAt
										? format(new Date(payment.paidAt), 'dd MMMM yyyy, HH:mm', {
												locale: ru,
										  })
										: 'Не указано'}
								</p>
							</div>
							{payment.paymentMethod && (
								<div>
									<p className="text-muted-foreground">Способ оплаты</p>
									<p className="font-medium">{payment.paymentMethod}</p>
								</div>
							)}
							<div>
								<p className="text-muted-foreground">ID транзакции</p>
								<p className="font-mono text-xs">{payment.id}</p>
							</div>
						</div>
						{payment.description && (
							<div>
								<p className="text-muted-foreground text-sm">Описание</p>
								<p className="font-medium">{payment.description}</p>
							</div>
						)}
					</div>
				)} */}

				{/* Subscription Info */}
				{subscription && (
					<Alert>
						<CheckCircle2 className="h-4 w-4" />
						<AlertDescription>
							Ваш тариф <strong>{subscription.plan}</strong> активен до{' '}
							{format(new Date(subscription.currentPeriodEnd), 'dd MMMM yyyy', {
								locale: ru,
							})}
						</AlertDescription>
					</Alert>
				)}

				{/* Actions */}
				<div className="flex flex-col sm:flex-row gap-3 pt-4">
					<Button
						variant="outline"
						className="flex-1"
						onClick={handleDownloadReceipt}
					>
						<Download className="h-4 w-4 mr-2" />
						Скачать чек
					</Button>
					<Button
						className="flex-1"
						onClick={() => {
							setHasRedirected(true)
							router.push('/dashboard')
						}}
					>
						<ArrowRight className="h-4 w-4 mr-2" />
						Перейти в дашборд
					</Button>
				</div>

				{/* Auto-redirect Notice */}
				{!hasRedirected && (
					<div className="text-center text-sm text-muted-foreground pt-4 border-t">
						Автоматический переход на дашборд через {countdown} сек...
						<br />
						<Button
							variant="link"
							size="sm"
							onClick={() => {
								setHasRedirected(true)
								router.push('/dashboard')
							}}
							className="mt-2"
						>
							Перейти сейчас
						</Button>
					</div>
				)}
			</Card>
		</div>
	)
}
