'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useQuery } from '@apollo/client'
import { gql } from '@apollo/client'
import { Card } from '@/packages/components/ui/card'
import { Button } from '@/packages/components/ui/button'
import { Alert, AlertDescription } from '@/packages/components/ui/alert'
import {
	XCircle,
	RefreshCcw,
	Mail,
	AlertCircle,
	Loader2,
	ArrowLeft,
} from 'lucide-react'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale/ru'
import Link from 'next/link'

const PAYMENT_QUERY = gql`
	query Payment($paymentId: String!) {
		payment(id: $paymentId) {
			id
			amount
			currency
			status
			paymentMethod
			description
			failureReason
			createdAt
		}
	}
`

const COMMON_ERRORS: Record<string, { title: string; message: string }> = {
	insufficient_funds: {
		title: 'Недостаточно средств',
		message: 'На карте недостаточно средств для проведения операции.',
	},
	card_declined: {
		title: 'Карта отклонена',
		message: 'Банк отклонил транзакцию. Попробуйте другую карту.',
	},
	expired_card: {
		title: 'Карта просрочена',
		message: 'Срок действия карты истёк. Используйте другую карту.',
	},
	incorrect_cvc: {
		title: 'Неверный CVC',
		message: 'Код безопасности введён неправильно.',
	},
	processing_error: {
		title: 'Ошибка обработки',
		message: 'Возникла техническая ошибка. Попробуйте снова через несколько минут.',
	},
	default: {
		title: 'Ошибка оплаты',
		message:
			'К сожалению, платеж не прошёл. Попробуйте снова или используйте другой способ оплаты.',
	},
}

export default function PaymentFailurePage() {
	const router = useRouter()
	const searchParams = useSearchParams()
	const paymentId = searchParams.get('paymentId')
	const errorCode = searchParams.get('error')

	const { data: paymentData, loading: paymentLoading } = useQuery(
		PAYMENT_QUERY,
		{
			variables: { paymentId },
			skip: !paymentId,
		}
	)

	const payment = paymentData?.payment
	const errorInfo =
		COMMON_ERRORS[errorCode || ''] ||
		COMMON_ERRORS[payment?.failureReason || ''] ||
		COMMON_ERRORS.default

	const handleRetry = () => {
		// Return to pricing page to retry
		router.push('/pricing')
	}

	const handleContactSupport = () => {
		window.location.href = 'mailto:support@prorab.space?subject=Ошибка оплаты'
	}

	if (paymentLoading) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<Loader2 className="h-8 w-8 animate-spin text-primary" />
			</div>
		)
	}

	return (
		<div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-red-50 via-white to-orange-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
			<Card className="max-w-2xl w-full p-8 space-y-6">
				{/* Error Icon */}
				<div className="flex justify-center">
					<div className="rounded-full bg-red-100 dark:bg-red-900 p-4">
						<XCircle className="h-16 w-16 text-red-600 dark:text-red-400" />
					</div>
				</div>

				{/* Error Message */}
				<div className="text-center space-y-2">
					<h1 className="text-3xl font-bold text-red-600 dark:text-red-400">
						{errorInfo.title}
					</h1>
					<p className="text-muted-foreground text-lg">{errorInfo.message}</p>
				</div>

				{/* Payment Details */}
				{payment && (
					<div className="space-y-4 pt-4 border-t">
						<h2 className="font-semibold text-lg">Информация о попытке оплаты</h2>
						<div className="grid grid-cols-2 gap-4 text-sm">
							<div>
								<p className="text-muted-foreground">Сумма</p>
								<p className="font-semibold text-lg">
									{payment.amount.toLocaleString('ru-RU')} {payment.currency}
								</p>
							</div>
							<div>
								<p className="text-muted-foreground">Дата попытки</p>
								<p className="font-medium">
									{format(new Date(payment.createdAt), 'dd MMMM yyyy, HH:mm', {
										locale: ru,
									})}
								</p>
							</div>
							{payment.paymentMethod && (
								<div>
									<p className="text-muted-foreground">Способ оплаты</p>
									<p className="font-medium">{payment.paymentMethod}</p>
								</div>
							)}
							<div>
								<p className="text-muted-foreground">Статус</p>
								<p className="font-medium text-red-600 dark:text-red-400">
									{payment.status}
								</p>
							</div>
						</div>
						{payment.failureReason && (
							<Alert variant="destructive">
								<AlertCircle className="h-4 w-4" />
								<AlertDescription>
									Причина ошибки: {payment.failureReason}
								</AlertDescription>
							</Alert>
						)}
						{payment.description && (
							<div>
								<p className="text-muted-foreground text-sm">Описание</p>
								<p className="font-medium">{payment.description}</p>
							</div>
						)}
					</div>
				)}

				{/* Helpful Tips */}
				<Alert>
					<AlertCircle className="h-4 w-4" />
					<AlertDescription>
						<strong>Что можно попробовать:</strong>
						<ul className="list-disc list-inside mt-2 space-y-1 text-sm">
							<li>Проверьте баланс карты</li>
							<li>Убедитесь, что карта не заблокирована</li>
							<li>Попробуйте другую карту</li>
							<li>Проверьте правильность введённых данных</li>
							<li>Свяжитесь с вашим банком</li>
						</ul>
					</AlertDescription>
				</Alert>

				{/* Actions */}
				<div className="flex flex-col sm:flex-row gap-3 pt-4">
					<Button variant="outline" className="flex-1" asChild>
						<Link href="/dashboard">
							<ArrowLeft className="h-4 w-4 mr-2" />
							Вернуться в дашборд
						</Link>
					</Button>
					<Button className="flex-1" onClick={handleRetry}>
						<RefreshCcw className="h-4 w-4 mr-2" />
						Попробовать снова
					</Button>
				</div>

				{/* Support Contact */}
				<div className="text-center pt-4 border-t space-y-2">
					<p className="text-sm text-muted-foreground">
						Нужна помощь? Наша команда поддержки готова помочь.
					</p>
					<Button
						variant="link"
						size="sm"
						onClick={handleContactSupport}
						className="gap-2"
					>
						<Mail className="h-4 w-4" />
						support@prorab.space
					</Button>
				</div>

				{/* Transaction ID */}
				{payment && (
					<div className="text-center text-xs text-muted-foreground pt-2">
						ID транзакции для обращения в поддержку:{' '}
						<code className="font-mono bg-muted px-2 py-1 rounded">
							{payment.id}
						</code>
					</div>
				)}
			</Card>
		</div>
	)
}
