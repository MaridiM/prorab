'use client'

import { useState } from 'react'
import { useQuery, useMutation } from '@apollo/client/react'
import { gql } from '@apollo/client'
import { Crown, Check, Loader2, AlertCircle, TrendingUp, Users, FolderOpen, HardDrive } from 'lucide-react'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale/ru'

import {
	Button,
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
	Badge,
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
	Progress,
} from '@/packages/ui'
import { useToast } from '@/packages/hooks'

// GraphQL Queries & Mutations
const MY_SUBSCRIPTION = gql`
	query MySubscription {
		mySubscription {
			id
			plan
			status
			currentPeriodStart
			currentPeriodEnd
			trialEndsAt
			cancelAtPeriodEnd
			cancelledAt
			isEarlyBird
			limits {
				name
				price
				maxActiveProjects
				maxMembers
				storageGB
				features
			}
		}
	}
`

const CANCEL_SUBSCRIPTION = gql`
	mutation CancelSubscription($subscriptionId: String!) {
		cancelSubscription(subscriptionId: $subscriptionId) {
			id
			cancelAtPeriodEnd
			cancelledAt
		}
	}
`

const REACTIVATE_SUBSCRIPTION = gql`
	mutation ReactivateSubscription($subscriptionId: String!) {
		reactivateSubscription(subscriptionId: $subscriptionId) {
			id
			cancelAtPeriodEnd
			cancelledAt
		}
	}
`

const AVAILABLE_PLANS = gql`
	query AvailablePlans {
		availablePlans {
			name
			price
			maxActiveProjects
			maxMembers
			storageGB
			features
		}
	}
`

interface SubscriptionManagementProps {
	teamId?: string
	onUpgrade?: () => void
}

export function SubscriptionManagement({ teamId, onUpgrade }: SubscriptionManagementProps) {
	const [showCancelDialog, setShowCancelDialog] = useState(false)
	const [showReactivateDialog, setShowReactivateDialog] = useState(false)
	const { toast } = useToast()

	const { data: subData, loading: subLoading, refetch } = useQuery(MY_SUBSCRIPTION)
	const { data: plansData } = useQuery(AVAILABLE_PLANS)

	const [cancelSubscription, { loading: cancelling }] = useMutation(CANCEL_SUBSCRIPTION, {
		onCompleted: () => {
			toast({
				title: 'Подписка отменена',
				description: 'Подписка будет активна до конца оплаченного периода',
			})
			setShowCancelDialog(false)
			refetch()
		},
		onError: (error) => {
			toast({
				title: 'Ошибка',
				description: error.message || 'Не удалось отменить подписку',
				variant: 'destructive',
			})
		},
	})

	const [reactivateSubscription, { loading: reactivating }] = useMutation(REACTIVATE_SUBSCRIPTION, {
		onCompleted: () => {
			toast({
				title: 'Подписка возобновлена',
				description: 'Подписка снова активна',
			})
			setShowReactivateDialog(false)
			refetch()
		},
		onError: (error) => {
			toast({
				title: 'Ошибка',
				description: error.message || 'Не удалось возобновить подписку',
				variant: 'destructive',
			})
		},
	})

	const subscription = subData?.mySubscription
	const plans = plansData?.availablePlans || []

	const handleCancel = async () => {
		if (!subscription?.id) return
		await cancelSubscription({ variables: { subscriptionId: subscription.id } })
	}

	const handleReactivate = async () => {
		if (!subscription?.id) return
		await reactivateSubscription({ variables: { subscriptionId: subscription.id } })
	}

	const formatDate = (date: string) => {
		return format(new Date(date), 'dd MMMM yyyy', { locale: ru })
	}

	const getStatusBadge = (status: string, cancelAtPeriodEnd: boolean) => {
		if (cancelAtPeriodEnd) {
			return (
				<Badge variant="destructive" className="flex items-center gap-1">
					<AlertCircle className="w-3 h-3" />
					Отменена
				</Badge>
			)
		}

		switch (status) {
			case 'TRIALING':
				return (
					<Badge variant="secondary" className="flex items-center gap-1 bg-blue-500/10 text-blue-600 border-blue-500/30">
						<TrendingUp className="w-3 h-3" />
						Пробный период
					</Badge>
				)
			case 'ACTIVE':
				return (
					<Badge variant="success" className="flex items-center gap-1">
						<Check className="w-3 h-3" />
						Активна
					</Badge>
				)
			case 'PAST_DUE':
				return (
					<Badge variant="destructive">Просрочена</Badge>
				)
			case 'CANCELLED':
				return (
					<Badge variant="outline">Отменена</Badge>
				)
			default:
				return <Badge>{status}</Badge>
		}
	}

	if (subLoading) {
		return (
			<Card>
				<CardContent className="py-12">
					<div className="flex items-center justify-center">
						<Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
					</div>
				</CardContent>
			</Card>
		)
	}

	if (!subscription) {
		return (
			<Card>
				<CardHeader>
					<div className="flex items-center gap-3">
						<div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
							<Crown className="w-6 h-6 text-primary" />
						</div>
						<div>
							<CardTitle>Нет активной подписки</CardTitle>
							<CardDescription>Выберите план для начала работы</CardDescription>
						</div>
					</div>
				</CardHeader>

				<CardContent className="space-y-4">
					{plans.map((plan: any) => (
						<Card key={plan.name} className="border-2 hover:border-primary/50 transition-colors">
							<CardContent className="p-6">
								<div className="flex items-start justify-between mb-4">
									<div>
										<h3 className="text-xl font-bold">{plan.name}</h3>
										<p className="text-3xl font-bold text-primary mt-2">
											{plan.price}₽
											<span className="text-sm font-normal text-muted-foreground">/мес</span>
										</p>
									</div>
									<Button onClick={onUpgrade}>Выбрать</Button>
								</div>

								<div className="space-y-2">
									<div className="flex items-center gap-2 text-sm">
										<FolderOpen className="w-4 h-4 text-muted-foreground" />
										<span>
											{plan.maxActiveProjects === null
												? 'Неограниченно проектов'
												: `${plan.maxActiveProjects} активных проектов`}
										</span>
									</div>
									<div className="flex items-center gap-2 text-sm">
										<Users className="w-4 h-4 text-muted-foreground" />
										<span>До {plan.maxMembers} участников</span>
									</div>
									<div className="flex items-center gap-2 text-sm">
										<HardDrive className="w-4 h-4 text-muted-foreground" />
										<span>{plan.storageGB} ГБ хранилища</span>
									</div>
								</div>

								<div className="mt-4 pt-4 border-t">
									<ul className="space-y-2">
										{plan.features.map((feature: string) => (
											<li key={feature} className="flex items-start gap-2 text-sm">
												<Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
												<span>{feature}</span>
											</li>
										))}
									</ul>
								</div>
							</CardContent>
						</Card>
					))}
				</CardContent>
			</Card>
		)
	}

	return (
		<div className="space-y-6">
			{/* Current Plan Card */}
			<Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-primary/10">
				<CardHeader>
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-4">
							<div className="w-14 h-14 rounded-2xl bg-primary/20 flex items-center justify-center">
								<Crown className="w-7 h-7 text-primary" />
							</div>
							<div>
								<div className="flex items-center gap-2">
									<CardTitle className="text-2xl">{subscription.limits.name}</CardTitle>
									{getStatusBadge(subscription.status, subscription.cancelAtPeriodEnd)}
									{subscription.isEarlyBird && (
										<Badge variant="secondary" className="bg-amber-500/10 text-amber-600 border-amber-500/30">
											Early Bird
										</Badge>
									)}
								</div>
								<CardDescription className="text-base mt-1">
									{subscription.limits.price}₽/мес
								</CardDescription>
							</div>
						</div>
					</div>
				</CardHeader>

				<CardContent className="space-y-6">
					{/* Period Info */}
					<div className="rounded-xl border border-border/50 bg-card/50 p-4">
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div>
								<p className="text-sm text-muted-foreground mb-1">Начало периода</p>
								<p className="font-medium">{formatDate(subscription.currentPeriodStart)}</p>
							</div>
							<div>
								<p className="text-sm text-muted-foreground mb-1">
									{subscription.status === 'TRIALING' ? 'Конец пробного периода' : 'Следующее списание'}
								</p>
								<p className="font-medium">{formatDate(subscription.currentPeriodEnd)}</p>
							</div>
						</div>

						{subscription.cancelAtPeriodEnd && (
							<div className="mt-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
								<p className="text-sm text-destructive flex items-center gap-2">
									<AlertCircle className="w-4 h-4" />
									Подписка отменена и будет деактивирована {formatDate(subscription.currentPeriodEnd)}
								</p>
							</div>
						)}
					</div>

					{/* Features */}
					<div>
						<h4 className="font-semibold mb-3">Возможности тарифа</h4>
						<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
							<div className="p-4 rounded-xl border border-border/50 bg-card/50">
								<div className="flex items-center gap-2 mb-2">
									<FolderOpen className="w-5 h-5 text-primary" />
									<p className="font-medium">Проекты</p>
								</div>
								<p className="text-2xl font-bold">
									{subscription.limits.maxActiveProjects === null
										? '∞'
										: subscription.limits.maxActiveProjects}
								</p>
								<p className="text-xs text-muted-foreground mt-1">
									{subscription.limits.maxActiveProjects === null
										? 'Неограниченно'
										: 'Активных проектов'}
								</p>
							</div>

							<div className="p-4 rounded-xl border border-border/50 bg-card/50">
								<div className="flex items-center gap-2 mb-2">
									<Users className="w-5 h-5 text-primary" />
									<p className="font-medium">Участники</p>
								</div>
								<p className="text-2xl font-bold">{subscription.limits.maxMembers}</p>
								<p className="text-xs text-muted-foreground mt-1">Максимум участников</p>
							</div>

							<div className="p-4 rounded-xl border border-border/50 bg-card/50">
								<div className="flex items-center gap-2 mb-2">
									<HardDrive className="w-5 h-5 text-primary" />
									<p className="font-medium">Хранилище</p>
								</div>
								<p className="text-2xl font-bold">{subscription.limits.storageGB}</p>
								<p className="text-xs text-muted-foreground mt-1">ГБ доступно</p>
							</div>
						</div>
					</div>

					{/* Features List */}
					<div>
						<h4 className="font-semibold mb-3">Включено в тариф</h4>
						<ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
							{subscription.limits.features.map((feature: string) => (
								<li key={feature} className="flex items-start gap-2 text-sm">
									<Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
									<span>{feature}</span>
								</li>
							))}
						</ul>
					</div>

					{/* Actions */}
					<div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
						{!subscription.cancelAtPeriodEnd ? (
							<>
								<Button variant="outline" onClick={onUpgrade} className="flex-1">
									<TrendingUp className="w-4 h-4 mr-2" />
									Сменить тариф
								</Button>

								<AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
									<AlertDialogTrigger asChild>
										<Button
											variant="outline"
											className="flex-1 text-destructive hover:text-destructive hover:bg-destructive/10"
										>
											Отменить подписку
										</Button>
									</AlertDialogTrigger>
									<AlertDialogContent>
										<AlertDialogHeader>
											<AlertDialogTitle>Отменить подписку?</AlertDialogTitle>
											<AlertDialogDescription>
												Подписка останется активной до конца оплаченного периода (
												{formatDate(subscription.currentPeriodEnd)}). После этого доступ к функциям будет
												ограничен.
											</AlertDialogDescription>
										</AlertDialogHeader>
										<AlertDialogFooter>
											<AlertDialogCancel>Оставить подписку</AlertDialogCancel>
											<AlertDialogAction
												onClick={handleCancel}
												disabled={cancelling}
												className="bg-destructive hover:bg-destructive/90"
											>
												{cancelling ? (
													<>
														<Loader2 className="w-4 h-4 mr-2 animate-spin" />
														Отмена...
													</>
												) : (
													'Да, отменить'
												)}
											</AlertDialogAction>
										</AlertDialogFooter>
									</AlertDialogContent>
								</AlertDialog>
							</>
						) : (
							<AlertDialog open={showReactivateDialog} onOpenChange={setShowReactivateDialog}>
								<AlertDialogTrigger asChild>
									<Button className="flex-1">
										<Check className="w-4 h-4 mr-2" />
										Возобновить подписку
									</Button>
								</AlertDialogTrigger>
								<AlertDialogContent>
									<AlertDialogHeader>
										<AlertDialogTitle>Возобновить подписку?</AlertDialogTitle>
										<AlertDialogDescription>
											Подписка будет автоматически продлена после окончания текущего периода (
											{formatDate(subscription.currentPeriodEnd)}).
										</AlertDialogDescription>
									</AlertDialogHeader>
									<AlertDialogFooter>
										<AlertDialogCancel>Отмена</AlertDialogCancel>
										<AlertDialogAction onClick={handleReactivate} disabled={reactivating}>
											{reactivating ? (
												<>
													<Loader2 className="w-4 h-4 mr-2 animate-spin" />
													Возобновление...
												</>
											) : (
												'Да, возобновить'
											)}
										</AlertDialogAction>
									</AlertDialogFooter>
								</AlertDialogContent>
							</AlertDialog>
						)}
					</div>
				</CardContent>
			</Card>
		</div>
	)
}
