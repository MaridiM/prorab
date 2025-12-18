'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useQuery } from '@apollo/client/react'
import { Card } from '@/packages/components/ui/card'
import { Button } from '@/packages/components/ui/button'
import { Alert, AlertDescription } from '@/packages/components/ui/alert'
import { CheckCircle2, Download, ArrowRight, Loader2 } from 'lucide-react'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale/ru'
import Link from 'next/link'
import { MySubscriptionDocument } from '@/packages/api/graphql'

export default function PaymentSuccessPage() {
	const router = useRouter()
	const searchParams = useSearchParams()
	const [countdown, setCountdown] = useState(10)

	const { data: subscriptionData, loading: subscriptionLoading } = useQuery(MySubscriptionDocument)

	useEffect(() => {
		// Countdown timer for auto-redirect
		const timer = setInterval(() => {
			setCountdown((prev) => {
				if (prev <= 1) {
					clearInterval(timer)
					router.push('/dashboard')
					return 0
				}
				return prev - 1
			})
		}, 1000)

		return () => clearInterval(timer)
	}, [router])

	const handleDownloadReceipt = () => {
		// TODO: Implement receipt download
		alert('Загрузка чека скоро будет доступна')
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
					<Button asChild className="flex-1">
						<Link href="/dashboard">
							<ArrowRight className="h-4 w-4 mr-2" />
							Перейти в дашборд
						</Link>
					</Button>
				</div>

				{/* Auto-redirect Notice */}
				<div className="text-center text-sm text-muted-foreground pt-4 border-t">
					Автоматический переход на дашборд через {countdown} сек...
					<br />
					<Button
						variant="link"
						size="sm"
						onClick={() => router.push('/dashboard')}
						className="mt-2"
					>
						Перейти сейчас
					</Button>
				</div>
			</Card>
		</div>
	)
}
