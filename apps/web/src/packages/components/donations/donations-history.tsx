'use client'

import { useQuery, useMutation } from '@apollo/client/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/packages/components/ui/card'
import { Skeleton } from '@/packages/components/ui/skeleton'
import { Button } from '@/packages/components/ui/button'
import { CheckCircle, Clock, XCircle, Coffee, RefreshCw } from 'lucide-react'
import { gql } from '@apollo/client'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import { useEffect, useState } from 'react'

const GET_MY_DONATIONS = gql`
	query GetMyDonations {
		myDonations {
			id
			amount
			currency
			status
			message
			donorName
			isAnonymous
			paidAt
			createdAt
			providerType
			providerPaymentId
		}
	}
`

const CHECK_DONATION_STATUS = gql`
	mutation CheckDonationStatus($id: ID!) {
		checkDonationStatus(id: $id) {
			id
			status
			paidAt
		}
	}
`

interface Donation {
	id: string
	amount: number
	currency: string
	status: string
	message?: string
	donorName?: string
	isAnonymous: boolean
	paidAt?: string
	createdAt: string
	providerType?: string
	providerPaymentId?: string
}

const StatusIcon = ({ status }: { status: string }) => {
	switch (status) {
		case 'SUCCEEDED':
			return <CheckCircle className="h-5 w-5 text-green-500" />
		case 'PENDING':
			return <Clock className="h-5 w-5 text-yellow-500" />
		case 'FAILED':
		case 'CANCELLED':
			return <XCircle className="h-5 w-5 text-red-500" />
		default:
			return <Clock className="h-5 w-5 text-gray-500" />
	}
}

const StatusLabel = ({ status }: { status: string }) => {
	switch (status) {
		case 'SUCCEEDED':
			return <span className="text-green-600 dark:text-green-400">Успешно</span>
		case 'PENDING':
			return <span className="text-yellow-600 dark:text-yellow-400">В обработке</span>
		case 'FAILED':
			return <span className="text-red-600 dark:text-red-400">Ошибка</span>
		case 'CANCELLED':
			return <span className="text-gray-600 dark:text-gray-400">Отменено</span>
		case 'REFUNDED':
			return <span className="text-blue-600 dark:text-blue-400">Возврат</span>
		default:
			return <span className="text-gray-600 dark:text-gray-400">{status}</span>
	}
}

export function DonationsHistory() {
	const { data, loading, error, refetch } = useQuery(GET_MY_DONATIONS, {
		// Don't poll automatically - rely on webhooks for status updates
		// Users can manually refresh if needed
	})
	const [checkingStatus, setCheckingStatus] = useState<string | null>(null)
	const [checkDonationStatus] = useMutation(CHECK_DONATION_STATUS)

	// Note: We don't auto-check donation status on mount
	// Status should be updated via webhooks from payment providers
	// Users can manually check status using the refresh button

	const handleCheckStatus = async (donationId: string) => {
		setCheckingStatus(donationId)
		try {
			await checkDonationStatus({
				variables: { id: donationId },
			})
			await refetch()
		} catch (err) {
			console.error('Failed to check donation status:', err)
		} finally {
			setCheckingStatus(null)
		}
	}

	if (loading) {
		return (
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Coffee className="h-5 w-5" />
						Мои донаты
					</CardTitle>
					<CardDescription>История ваших добровольных пожертвований</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					{[1, 2, 3].map((i) => (
						<div key={i} className="flex items-start gap-4">
							<Skeleton className="h-12 w-12 rounded-full" />
							<div className="flex-1 space-y-2">
								<Skeleton className="h-4 w-3/4" />
								<Skeleton className="h-3 w-1/2" />
							</div>
						</div>
					))}
				</CardContent>
			</Card>
		)
	}

	if (error) {
		return (
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Coffee className="h-5 w-5" />
						Мои донаты
					</CardTitle>
				</CardHeader>
				<CardContent>
					<p className="text-destructive">Ошибка загрузки донатов: {error.message}</p>
				</CardContent>
			</Card>
		)
	}

	const donations: Donation[] = data?.myDonations || []

	if (donations.length === 0) {
		return (
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Coffee className="h-5 w-5" />
						Мои донаты
					</CardTitle>
					<CardDescription>История ваших добровольных пожертвований</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="flex flex-col items-center justify-center py-12 text-center">
						<Coffee className="h-16 w-16 text-muted-foreground mb-4 opacity-50" />
						<h3 className="text-lg font-medium mb-2">У вас пока нет донатов</h3>
						<p className="text-sm text-muted-foreground mb-4">
							Поддержите развитие платформы, сделав первый донат!
						</p>
					</div>
				</CardContent>
			</Card>
		)
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<Coffee className="h-5 w-5" />
					Мои донаты
				</CardTitle>
				<CardDescription>
					Всего донатов: {donations.length} | Успешных:{' '}
					{donations.filter((d) => d.status === 'SUCCEEDED').length}
				</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="space-y-4">
					{donations.map((donation) => (
						<div
							key={donation.id}
							className="flex items-start gap-4 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
						>
							<div className="flex-shrink-0 mt-1">
								<StatusIcon status={donation.status} />
							</div>
							<div className="flex-1 min-w-0">
								<div className="flex items-start justify-between gap-2">
									<div className="flex-1">
										<p className="font-medium">
											{donation.amount} {donation.currency === 'RUB' ? '₽' : donation.currency}
										</p>
										<p className="text-sm text-muted-foreground">
											<StatusLabel status={donation.status} />
											{' · '}
											{format(new Date(donation.paidAt || donation.createdAt), 'dd MMMM yyyy, HH:mm', {
												locale: ru,
											})}
										</p>
									</div>
									{donation.status === 'PENDING' && donation.providerType !== 'TELEGRAM_STARS' && (
										<Button
											variant="ghost"
											size="sm"
											onClick={() => handleCheckStatus(donation.id)}
											disabled={checkingStatus === donation.id}
											className="h-8 w-8 p-0"
										>
											<RefreshCw
												className={`h-4 w-4 ${checkingStatus === donation.id ? 'animate-spin' : ''}`}
											/>
										</Button>
									)}
								</div>
								{donation.message && (
									<p className="mt-2 text-sm text-muted-foreground italic">
										"{donation.message}"
									</p>
								)}
								{donation.donorName && !donation.isAnonymous && (
									<p className="mt-1 text-xs text-muted-foreground">
										От: {donation.donorName}
									</p>
								)}
								{donation.isAnonymous && (
									<p className="mt-1 text-xs text-muted-foreground">Анонимный донат</p>
								)}
							</div>
						</div>
					))}
				</div>
			</CardContent>
		</Card>
	)
}
