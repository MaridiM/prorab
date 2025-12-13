'use client'

import { format } from 'date-fns'
import { ru } from 'date-fns/locale/ru'
import { Download, ExternalLink } from 'lucide-react'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Card } from '../ui/card'

export interface Payment {
	id: string
	amount: number
	currency: string
	status: 'PENDING' | 'SUCCEEDED' | 'FAILED' | 'CANCELLED' | 'REFUNDED'
	paymentMethod?: string
	description?: string
	failureReason?: string
	paidAt?: string
	refundedAt?: string
	createdAt: string
}

export interface PaymentHistoryProps {
	payments: Payment[]
	onDownloadReceipt?: (paymentId: string) => void
	emptyMessage?: string
}

const STATUS_CONFIG = {
	PENDING: {
		label: 'Ожидание',
		variant: 'outline' as const,
		color: 'text-muted-foreground',
	},
	SUCCEEDED: {
		label: 'Успешно',
		variant: 'default' as const,
		color: 'text-green-500',
	},
	FAILED: {
		label: 'Ошибка',
		variant: 'destructive' as const,
		color: 'text-red-500',
	},
	CANCELLED: {
		label: 'Отменён',
		variant: 'outline' as const,
		color: 'text-muted-foreground',
	},
	REFUNDED: {
		label: 'Возврат',
		variant: 'outline' as const,
		color: 'text-blue-500',
	},
}

export function PaymentHistory({
	payments,
	onDownloadReceipt,
	emptyMessage = 'История платежей пуста',
}: PaymentHistoryProps) {
	if (payments.length === 0) {
		return (
			<Card className="p-8 text-center">
				<p className="text-muted-foreground">{emptyMessage}</p>
			</Card>
		)
	}

	return (
		<Card className="overflow-hidden">
			{/* Header */}
			<div className="bg-muted/50 px-6 py-4 border-b">
				<h3 className="font-semibold">История платежей</h3>
			</div>

			{/* Table - Desktop */}
			<div className="hidden md:block overflow-x-auto">
				<table className="w-full">
					<thead>
						<tr className="border-b bg-muted/30">
							<th className="text-left p-4 font-medium text-sm text-muted-foreground">
								Дата
							</th>
							<th className="text-left p-4 font-medium text-sm text-muted-foreground">
								Описание
							</th>
							<th className="text-right p-4 font-medium text-sm text-muted-foreground">
								Сумма
							</th>
							<th className="text-center p-4 font-medium text-sm text-muted-foreground">
								Статус
							</th>
							<th className="text-left p-4 font-medium text-sm text-muted-foreground">
								Способ оплаты
							</th>
							<th className="text-right p-4 font-medium text-sm text-muted-foreground">
								Действия
							</th>
						</tr>
					</thead>
					<tbody>
						{payments.map((payment) => {
							const statusConfig = STATUS_CONFIG[payment.status]
							const displayDate = payment.paidAt || payment.createdAt

							return (
								<tr key={payment.id} className="border-b last:border-0 hover:bg-muted/30">
									<td className="p-4 text-sm">
										{format(new Date(displayDate), 'd MMM yyyy', { locale: ru })}
									</td>
									<td className="p-4 text-sm">
										{payment.description || 'Оплата подписки'}
										{payment.failureReason && (
											<p className="text-xs text-red-500 mt-1">{payment.failureReason}</p>
										)}
									</td>
									<td className="p-4 text-sm text-right font-medium">
										{payment.amount.toFixed(2)} {payment.currency}
									</td>
									<td className="p-4 text-center">
										<Badge variant={statusConfig.variant} className="whitespace-nowrap">
											{statusConfig.label}
										</Badge>
									</td>
									<td className="p-4 text-sm text-muted-foreground">
										{payment.paymentMethod || '—'}
									</td>
									<td className="p-4 text-right">
										{payment.status === 'SUCCEEDED' && onDownloadReceipt && (
											<Button
												variant="ghost"
												size="sm"
												onClick={() => onDownloadReceipt(payment.id)}
											>
												<Download className="h-4 w-4 mr-2" />
												Чек
											</Button>
										)}
									</td>
								</tr>
							)
						})}
					</tbody>
				</table>
			</div>

			{/* List - Mobile */}
			<div className="md:hidden divide-y">
				{payments.map((payment) => {
					const statusConfig = STATUS_CONFIG[payment.status]
					const displayDate = payment.paidAt || payment.createdAt

					return (
						<div key={payment.id} className="p-4 space-y-3">
							<div className="flex items-start justify-between">
								<div>
									<p className="font-medium">
										{payment.description || 'Оплата подписки'}
									</p>
									<p className="text-sm text-muted-foreground">
										{format(new Date(displayDate), 'd MMMM yyyy', { locale: ru })}
									</p>
									{payment.failureReason && (
										<p className="text-xs text-red-500 mt-1">{payment.failureReason}</p>
									)}
								</div>
								<Badge variant={statusConfig.variant}>
									{statusConfig.label}
								</Badge>
							</div>

							<div className="flex items-center justify-between">
								<div className="text-sm text-muted-foreground">
									{payment.paymentMethod || 'Не указан'}
								</div>
								<div className="font-medium">
									{payment.amount.toFixed(2)} {payment.currency}
								</div>
							</div>

							{payment.status === 'SUCCEEDED' && onDownloadReceipt && (
								<Button
									variant="outline"
									size="sm"
									className="w-full"
									onClick={() => onDownloadReceipt(payment.id)}
								>
									<Download className="h-4 w-4 mr-2" />
									Скачать чек
								</Button>
							)}
						</div>
					)
				})}
			</div>

			{/* Footer Notice */}
			<div className="bg-muted/30 px-6 py-3 border-t text-sm text-muted-foreground text-center">
				Чеки отправляются на email после успешной оплаты
			</div>
		</Card>
	)
}
