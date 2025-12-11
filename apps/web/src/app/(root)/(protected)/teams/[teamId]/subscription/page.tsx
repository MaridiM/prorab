'use client'

import { useQuery, useMutation } from '@apollo/client/react'
import { useParams, useRouter } from 'next/navigation'
import { useState } from 'react'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import {
	SubscriptionStatus,
	PaymentHistory,
	PlanCard,
	type Payment,
} from '@/packages/components'
import { Button } from '@/packages/components/ui/button'
import { Card } from '@/packages/components/ui/card'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/packages/components/ui/dialog'
import { Alert, AlertDescription } from '@/packages/components/ui/alert'
import { Loader2, CreditCard, Settings, AlertCircle } from 'lucide-react'
import { gql } from '@apollo/client'
import { toast } from 'sonner'

const MY_SUBSCRIPTION_QUERY = gql`
	query MySubscription {
		mySubscription {
			id
			plan
			status
			currentPeriodStart
			currentPeriodEnd
			trialEndsAt
			cancelAtPeriodEnd
			isEarlyBird
			createdAt
		}
		currentPlanLimits {
			name
			price
			earlyBirdPrice
			maxActiveProjects
			maxMembers
			storageGB
			features
		}
		usageStats {
			projectCount
			memberCount
			storageUsedGB
		}
	}
`

const PAYMENTS_QUERY = gql`
	query MyPayments {
		myPayments {
			id
			amount
			currency
			status
			paymentMethod
			description
			failureReason
			paidAt
			refundedAt
			createdAt
		}
	}
`

const AVAILABLE_PLANS_QUERY = gql`
	query AvailablePlans {
		availablePlans {
			plan
			name
			price
			earlyBirdPrice
			maxActiveProjects
			maxMembers
			storageGB
			features
			isActive
		}
	}
`

const CHANGE_PLAN_MUTATION = gql`
	mutation ChangePlan($newPlan: SubscriptionPlan!) {
		changePlan(newPlan: $newPlan) {
			id
			plan
			status
			currentPeriodEnd
		}
	}
`

const CANCEL_SUBSCRIPTION_MUTATION = gql`
	mutation CancelSubscription {
		cancelSubscription {
			id
			status
			cancelAtPeriodEnd
		}
	}
`

const REACTIVATE_SUBSCRIPTION_MUTATION = gql`
	mutation ReactivateSubscription {
		reactivateSubscription {
			id
			status
			cancelAtPeriodEnd
		}
	}
`

export default function SubscriptionPage() {
	const params = useParams()
	const router = useRouter()
	const teamId = params.teamId as string

	const [showChangePlanDialog, setShowChangePlanDialog] = useState(false)
	const [showCancelDialog, setShowCancelDialog] = useState(false)
	const [selectedPlan, setSelectedPlan] = useState<string | null>(null)

	// Queries
	const {
		data: subscriptionData,
		loading: subscriptionLoading,
		refetch: refetchSubscription,
	} = useQuery(MY_SUBSCRIPTION_QUERY)

	const {
		data: paymentsData,
		loading: paymentsLoading,
		refetch: refetchPayments,
	} = useQuery(PAYMENTS_QUERY)

	const { data: plansData, loading: plansLoading } = useQuery(
		AVAILABLE_PLANS_QUERY
	)

	// Mutations
	const [changePlan, { loading: changingPlan }] = useMutation(
		CHANGE_PLAN_MUTATION,
		{
			onCompleted: () => {
				toast.success('Тариф успешно изменён!')
				setShowChangePlanDialog(false)
				setSelectedPlan(null)
				refetchSubscription()
			},
			onError: (error) => {
				toast.error(`Ошибка изменения тарифа: ${error.message}`)
			},
		}
	)

	const [cancelSubscription, { loading: cancelling }] = useMutation(
		CANCEL_SUBSCRIPTION_MUTATION,
		{
			onCompleted: () => {
				toast.success('Подписка будет отменена в конце периода')
				setShowCancelDialog(false)
				refetchSubscription()
			},
			onError: (error) => {
				toast.error(`Ошибка отмены подписки: ${error.message}`)
			},
		}
	)

	const [reactivateSubscription, { loading: reactivating }] = useMutation(
		REACTIVATE_SUBSCRIPTION_MUTATION,
		{
			onCompleted: () => {
				toast.success('Подписка восстановлена!')
				refetchSubscription()
			},
			onError: (error) => {
				toast.error(`Ошибка восстановления: ${error.message}`)
			},
		}
	)

	const handleDownloadReceipt = async (paymentId: string) => {
		// TODO: Implement receipt download
		toast.info('Загрузка чека скоро будет доступна')
	}

	const handleChangePlan = () => {
		if (!selectedPlan) return
		changePlan({ variables: { newPlan: selectedPlan } })
	}

	const handleCancelSubscription = () => {
		cancelSubscription()
	}

	const handleReactivate = () => {
		reactivateSubscription()
	}

	const handleUpgrade = () => {
		setShowChangePlanDialog(true)
	}

	if (subscriptionLoading || plansLoading) {
		return (
			<div className="flex items-center justify-center min-h-[400px]">
				<Loader2 className="h-8 w-8 animate-spin text-primary" />
			</div>
		)
	}

	const subscription = subscriptionData?.mySubscription
	const limits = subscriptionData?.currentPlanLimits
	const usageStats = subscriptionData?.usageStats
	const payments = paymentsData?.myPayments || []
	const availablePlans = plansData?.availablePlans || []

	if (!subscription) {
		return (
			<div className="container mx-auto p-6 max-w-4xl">
				<Alert>
					<AlertCircle className="h-4 w-4" />
					<AlertDescription>
						У вас нет активной подписки.{' '}
						<Button
							variant="link"
							className="p-0 h-auto"
							onClick={() => router.push('/pricing')}
						>
							Выбрать тариф
						</Button>
					</AlertDescription>
				</Alert>
			</div>
		)
	}

	return (
		<div className="container mx-auto p-6 max-w-6xl space-y-8">
			{/* Page Header */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">
						Управление подпиской
					</h1>
					<p className="text-muted-foreground mt-2">
						Ваш тариф, использование и история платежей
					</p>
				</div>
				<Button
					variant="outline"
					onClick={() => router.push(`/teams/${teamId}`)}
				>
					Назад к команде
				</Button>
			</div>

			{/* Subscription Status */}
			<SubscriptionStatus
				subscription={{
					plan: subscription.plan,
					status: subscription.status,
					currentPeriodEnd: subscription.currentPeriodEnd,
					trialEndsAt: subscription.trialEndsAt,
					cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
					isEarlyBird: subscription.isEarlyBird,
				}}
				usageStats={{
					projectCount: usageStats?.projectCount || 0,
					memberCount: usageStats?.memberCount || 0,
					storageUsedGB: usageStats?.storageUsedGB || 0,
				}}
				limits={{
					name: limits?.name || '',
					price: limits?.price || 0,
					earlyBirdPrice: limits?.earlyBirdPrice,
					maxActiveProjects: limits?.maxActiveProjects,
					maxMembers: limits?.maxMembers || 1,
					storageGB: limits?.storageGB || 0.5,
				}}
				onUpgrade={handleUpgrade}
				onManage={() => setShowChangePlanDialog(true)}
			/>

			{/* Subscription Management Actions */}
			<Card className="p-6">
				<div className="flex items-start justify-between">
					<div className="space-y-1">
						<h3 className="text-lg font-semibold flex items-center gap-2">
							<Settings className="h-5 w-5" />
							Управление тарифом
						</h3>
						<p className="text-sm text-muted-foreground">
							Измените тариф или отмените подписку
						</p>
					</div>
					<div className="flex gap-3">
						<Button
							variant="outline"
							onClick={() => setShowChangePlanDialog(true)}
						>
							<CreditCard className="h-4 w-4 mr-2" />
							Изменить тариф
						</Button>
						{subscription.cancelAtPeriodEnd ? (
							<Button
								variant="default"
								onClick={handleReactivate}
								disabled={reactivating}
							>
								{reactivating ? (
									<Loader2 className="h-4 w-4 mr-2 animate-spin" />
								) : null}
								Возобновить подписку
							</Button>
						) : (
							<Button
								variant="destructive"
								onClick={() => setShowCancelDialog(true)}
							>
								Отменить подписку
							</Button>
						)}
					</div>
				</div>
			</Card>

			{/* Payment History */}
			<div className="space-y-4">
				<div>
					<h2 className="text-2xl font-semibold">История платежей</h2>
					<p className="text-muted-foreground mt-1">
						Все ваши транзакции и чеки
					</p>
				</div>
				<PaymentHistory
					payments={payments.map((p: any) => ({
						id: p.id,
						amount: p.amount,
						currency: p.currency,
						status: p.status,
						paymentMethod: p.paymentMethod,
						description: p.description,
						failureReason: p.failureReason,
						paidAt: p.paidAt,
						refundedAt: p.refundedAt,
						createdAt: p.createdAt,
					}))}
					onDownloadReceipt={handleDownloadReceipt}
				/>
			</div>

			{/* Change Plan Dialog */}
			<Dialog open={showChangePlanDialog} onOpenChange={setShowChangePlanDialog}>
				<DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
					<DialogHeader>
						<DialogTitle>Изменить тариф</DialogTitle>
						<DialogDescription>
							Выберите новый тариф. Изменения вступят в силу немедленно.
						</DialogDescription>
					</DialogHeader>
					<div className="grid md:grid-cols-3 gap-4 py-4">
						{availablePlans
							.filter((p: any) => p.isActive)
							.map((plan: any) => (
								<PlanCard
									key={plan.plan}
									name={plan.name}
									price={plan.price}
									earlyBirdPrice={plan.earlyBirdPrice}
									maxActiveProjects={plan.maxActiveProjects}
									maxMembers={plan.maxMembers}
									storageGB={plan.storageGB}
									features={plan.features}
									isCurrentPlan={subscription.plan === plan.plan}
									isEarlyBird={subscription.isEarlyBird}
									onSelect={() => setSelectedPlan(plan.plan)}
									disabled={subscription.plan === plan.plan}
								/>
							))}
					</div>
					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => {
								setShowChangePlanDialog(false)
								setSelectedPlan(null)
							}}
						>
							Отмена
						</Button>
						<Button
							onClick={handleChangePlan}
							disabled={!selectedPlan || changingPlan}
						>
							{changingPlan ? (
								<Loader2 className="h-4 w-4 mr-2 animate-spin" />
							) : null}
							Изменить тариф
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Cancel Subscription Dialog */}
			<Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Отменить подписку?</DialogTitle>
						<DialogDescription>
							Ваша подписка будет активна до{' '}
							{format(new Date(subscription.currentPeriodEnd), 'dd MMMM yyyy', {
								locale: ru,
							})}
							. После этого доступ к платным функциям будет ограничен.
						</DialogDescription>
					</DialogHeader>
					<div className="py-4">
						<Alert>
							<AlertCircle className="h-4 w-4" />
							<AlertDescription>
								Вы всегда можете возобновить подписку до окончания периода.
							</AlertDescription>
						</Alert>
					</div>
					<DialogFooter>
						<Button variant="outline" onClick={() => setShowCancelDialog(false)}>
							Не отменять
						</Button>
						<Button
							variant="destructive"
							onClick={handleCancelSubscription}
							disabled={cancelling}
						>
							{cancelling ? (
								<Loader2 className="h-4 w-4 mr-2 animate-spin" />
							) : null}
							Да, отменить подписку
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	)
}
