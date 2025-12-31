'use client'

import { useState, useMemo, useCallback, useEffect } from 'react'
import { useQuery, useMutation } from '@apollo/client/react'
import { useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Crown, Check, Loader2, AlertCircle, TrendingUp, Users, FolderOpen, HardDrive, Sparkles, Zap, Star, Info, X, ChevronDown } from 'lucide-react'
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
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/packages/ui'
import { useToast } from '@/packages/hooks'
import {
	MySubscriptionDocument,
	MyTeamsDocument,
	CancelSubscriptionDocument,
	ReactivateSubscriptionDocument,
	AvailablePlansDetailedDocument,
	CreateSubscriptionDocument,
	ChangePlanDocument,
	InitializePaymentDocument,
	PaymentProviderType,
} from '@/packages/api/graphql/__generated__/output'
import {
	TrialStatusWidget,
	DowngradeErrorModal,
	type DowngradeError,
} from '@/packages/components'
import { cn } from '@/packages/utils'

interface SubscriptionManagementProps {
	teamId?: string
	onUpgrade?: () => void
}

export function SubscriptionManagement({ teamId, onUpgrade }: SubscriptionManagementProps) {
	const [showCancelDialog, setShowCancelDialog] = useState(false)
	const [showReactivateDialog, setShowReactivateDialog] = useState(false)
	const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null)
	const [downgradError, setDowngradeError] = useState<DowngradeError | null>(null)
	const [selectedPlanDetails, setSelectedPlanDetails] = useState<typeof plans[0] | null>(null)
	const [expandedFeatures, setExpandedFeatures] = useState(false)
	const [expandedPlanCards, setExpandedPlanCards] = useState<Set<string>>(new Set())
	const [processingPlanId, setProcessingPlanId] = useState<string | null>(null) // ID плана, который сейчас обрабатывается
	const { toast } = useToast()

	const { data: subData, loading: subLoading, refetch } = useQuery(MySubscriptionDocument)
	const { data: plansData, loading: plansLoading } = useQuery(AvailablePlansDetailedDocument)
	const { data: teamsData } = useQuery(MyTeamsDocument)
	const searchParams = useSearchParams()

	const [isChangingPlan, setIsChangingPlan] = useState(false)

	// Check URL parameter to show plans section
	useEffect(() => {
		const showPlans = searchParams.get('showPlans')
		if (showPlans === 'true') {
			setIsChangingPlan(true)
			// Scroll to plans after a short delay
			setTimeout(() => {
				const plansSection = document.getElementById('plans-section')
				if (plansSection) {
					plansSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
				}
			}, 100)
		}
	}, [searchParams])

	const [createSubscription, { loading: creating }] = useMutation(CreateSubscriptionDocument, {
		onCompleted: () => {
			toast('Подписка успешно оформлена', 'success')
			setProcessingPlanId(null) // Очищаем состояние обработки
			refetch()
		},
		onError: (error) => {
			setProcessingPlanId(null) // Очищаем состояние обработки при ошибке
			// Если подписка уже существует, это нормально - пользователь может выбрать другой план
			if (error.message?.includes('Subscription already exists')) {
				// Не показываем ошибку, так как это обрабатывается в handleSelectPlan
				console.log('Subscription already exists, will use changePlan instead')
				return
			}
			toast(error.message || 'Не удалось оформить подписку', 'error')
		},
	})

	const [changePlan, { loading: changing }] = useMutation(ChangePlanDocument, {
		onCompleted: () => {
			toast('Тариф успешно изменен', 'success')
			setIsChangingPlan(false)
			setProcessingPlanId(null) // Очищаем состояние обработки
			refetch()
		},
		onError: (error: any) => {
			setProcessingPlanId(null) // Очищаем состояние обработки при ошибке
			// Check for downgrade protection error
			if (error.graphQLErrors?.[0]?.extensions?.code === 'DOWNGRADE_LIMIT_EXCEEDED') {
				const extensions = error.graphQLErrors[0].extensions
				setDowngradeError({
					message: error.message,
					code: extensions.code,
					exceeds: extensions.exceeds || [],
				})
			} else {
				toast(error.message || 'Не удалось изменить тариф', 'error')
			}
		},
	})

	const [initializePayment] = useMutation(InitializePaymentDocument, {
		onCompleted: (data) => {
			// Redirect to payment page
			if (data.initializePayment.url) {
				window.location.href = data.initializePayment.url
			}
			// Не очищаем processingPlanId здесь, так как происходит редирект
		},
		onError: (error) => {
			setProcessingPlanId(null) // Очищаем состояние обработки при ошибке
			toast(error.message || 'Не удалось инициализировать платёж', 'error')
		},
	})

	const [cancelSubscription, { loading: cancelling }] = useMutation(CancelSubscriptionDocument, {
		onCompleted: () => {
			toast('Подписка будет активна до конца оплаченного периода', 'success')
			setShowCancelDialog(false)
			refetch()
		},
		onError: (error) => {
			toast(error.message || 'Не удалось отменить подписку', 'error')
		},
	})

	const [reactivateSubscription, { loading: reactivating }] = useMutation(ReactivateSubscriptionDocument, {
		onCompleted: () => {
			toast('Подписка снова активна', 'success')
			setShowReactivateDialog(false)
			refetch()
		},
		onError: (error) => {
			toast(error.message || 'Не удалось возобновить подписку', 'error')
		},
	})

	const subscription = subData?.mySubscription
	const plans = useMemo(() => plansData?.availablePlansDetailed || [], [plansData?.availablePlansDetailed])
	const teams = useMemo(() => teamsData?.myTeams || [], [teamsData?.myTeams])

	// Debug: Log subscription data
	console.log('[SubscriptionManagement] Subscription data:', {
		subscription,
		subscriptionId: subscription?.id,
		planId: subscription?.planId,
		planRefId: subscription?.planRef?.id,
		status: subscription?.status,
		hasSubscription: !!subscription,
	})

	// Get teamId from multiple sources:
	// 1. Prop (if passed from parent)
	// 2. Current subscription
	// 3. First team from myTeams
	const effectiveTeamId = useMemo(() => 
		teamId || subscription?.teamId || teams[0]?.id,
		[teamId, subscription?.teamId, teams]
	)

	const handleSelectPlan = useCallback(async (planId: string) => {
		console.log('handleSelectPlan called', {
			planId,
			effectiveTeamId,
			subscription,
			subscriptionId: subscription?.id,
			subscriptionPlanId: subscription?.planId,
			teams,
			teamId: teamId,
			subscriptionTeamId: subscription?.teamId,
			firstTeamId: teams[0]?.id
		})

		// Устанавливаем состояние обработки для конкретного плана
		setProcessingPlanId(planId)

		// Proceed directly to payment (provider auto-selected by backend based on IP)
		try {
			let subscriptionId: string | undefined

			// Если подписка уже существует, всегда используем changePlan (даже если план тот же - это продление)
			if (subscription?.id) {
				// Check if user already has this plan
				if (subscription.planId === planId) {
					// Same plan - this is a renewal, use existing subscription ID
					subscriptionId = subscription.id
				} else {
					// Change to different plan
					const result = await changePlan({
						variables: {
							input: {
								subscriptionId: subscription.id,
								newPlanId: planId,
								immediate: false,
							},
						},
					})

					// Use new subscription ID for payment
					subscriptionId = result.data?.changePlan?.id || subscription.id
					
					if (!subscriptionId) {
						console.error('changePlan returned no subscription ID')
						setProcessingPlanId(null)
						return // Error will be handled by mutation onError
					}
				}
			} else {
				// Create new subscription only if no subscription exists
				// For new subscription, we need teamId
				if (!effectiveTeamId) {
					toast('Не удалось определить команду. Сначала создайте команду в разделе "Команды".', 'error')
					setProcessingPlanId(null)
					return
				}

				const result = await createSubscription({
					variables: {
						input: {
							teamId: effectiveTeamId,
							planId: planId,
						},
					},
				})

				// Check for errors first (Apollo Client returns errors in result, not as exceptions)
				if (result.errors || result.error) {
					const errorMessage = result.errors?.[0]?.message || 
					                   result.error?.message || 
					                   result.error?.graphQLErrors?.[0]?.message || 
					                   ''
					
					if (errorMessage.includes('Subscription already exists')) {
						console.log('Subscription already exists, fetching existing subscription and using changePlan')
						// Refetch subscription to get the existing one
						try {
							const { data: refetchedData } = await refetch()
							const existingSubscription = refetchedData?.mySubscription
							
							if (existingSubscription?.id) {
								// Use changePlan instead
								if (existingSubscription.planId === planId) {
									// Same plan - renewal
									subscriptionId = existingSubscription.id
								} else {
									// Different plan - change it
									const changeResult = await changePlan({
										variables: {
											input: {
												subscriptionId: existingSubscription.id,
												newPlanId: planId,
												immediate: false,
											},
										},
									})
									subscriptionId = changeResult.data?.changePlan?.id || existingSubscription.id
								}
							} else {
								setProcessingPlanId(null)
								toast('Не удалось получить информацию о подписке. Попробуйте обновить страницу.', 'error')
								return
							}
						} catch (refetchError) {
							console.error('Error refetching subscription:', refetchError)
							setProcessingPlanId(null)
							toast('Не удалось получить информацию о подписке. Попробуйте обновить страницу.', 'error')
							return
						}
					} else {
						// Other error - will be handled by mutation onError callback
						setProcessingPlanId(null)
						return
					}
				} else {
					// Success - get subscription ID
					subscriptionId = result.data?.createSubscription?.id
					
					if (!subscriptionId) {
						console.error('createSubscription returned no subscription ID', result)
						setProcessingPlanId(null)
						// Error message is already shown by mutation onError callback
						return
					}
				}
			}

			// Initialize payment for BOTH new subscriptions AND plan changes
			// Backend auto-selects provider by IP geolocation
			if (subscriptionId) {
				await initializePayment({
					variables: {
						subscriptionId: subscriptionId,
						// providerType not specified - backend will auto-select by IP
					},
				})
			}
		} catch (e: any) {
			console.error('Error in handleSelectPlan:', e)
			setProcessingPlanId(null)
			// Error handling is done in mutation onError callbacks
			// But we also handle here if mutation didn't throw but returned no data
			if (e.graphQLErrors) {
				// GraphQL errors are handled by mutation onError
				return
			}
			// For other errors, show generic message
			toast(e.message || 'Произошла ошибка при обработке запроса', 'error')
		}
	}, [effectiveTeamId, subscription, teams, teamId, createSubscription, changePlan, initializePayment, toast])

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
				<Badge variant="danger" className="flex items-center gap-1">
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
					<Badge variant="danger">Просрочена</Badge>
				)
			case 'CANCELLED':
				return (
					<Badge variant="secondary">Отменена</Badge>
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

	if (!subscription || isChangingPlan) {
		return (
			<Card id="plans-section">
				<CardHeader>
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-3">
							<div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
								<Crown className="w-6 h-6 text-primary" />
							</div>
							<div>
								<CardTitle>{isChangingPlan ? 'Смена тарифа' : 'Нет активной подписки'}</CardTitle>
								<CardDescription>Выберите подходящий план</CardDescription>
							</div>
						</div>
						{isChangingPlan && (
							<Button variant="ghost" onClick={() => setIsChangingPlan(false)}>
								Отмена
							</Button>
						)}
					</div>
				</CardHeader>

				<CardContent>
					{plansLoading ? (
						<div className="flex justify-center">
							<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl w-full">
								{[1, 2, 3].map((i) => (
									<div key={i} className="h-[520px] rounded-xl border-2 border-border/50 bg-card animate-pulse" />
								))}
							</div>
						</div>
					) : (
						<div className="flex justify-center">
							<motion.div 
								className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl w-full items-start"
							initial="hidden"
							animate="visible"
							variants={{
								visible: {
									transition: {
										staggerChildren: 0.1,
									},
								},
							}}
						>
							<AnimatePresence mode="popLayout">
								{plans.map((plan, index) => {
									const isCurrent = subscription?.planId === plan.id

									// Debug: Log isCurrent check
									console.log(`[Plan ${plan.name}] isCurrent check:`, {
										planId: plan.id,
										planName: plan.name,
										subscriptionPlanId: subscription?.planId,
										isCurrent,
										subscriptionStatus: subscription?.status,
									})

									const rubPrice = plan.prices.find((p) => p.currency === 'RUB')
									const displayPrice = rubPrice ? (plan.isEarlyBird ? rubPrice.earlyBirdPrice : rubPrice.price) : 0
									const hasTrialPeriod = plan.trialDays && plan.trialDays > 0

									return (
										<motion.div
											key={plan.id}
											layoutId={`plan-card-${plan.id}`}
											initial={{ opacity: 0, y: 20, scale: 0.95 }}
											animate={{ 
												opacity: 1, 
												y: 0, 
												scale: 1,
											}}
											exit={{ opacity: 0, scale: 0.95 }}
											transition={{
												duration: 0.4,
												ease: [0.4, 0, 0.2, 1],
												delay: index * 0.1,
											}}
											whileHover={processingPlanId === null ? { 
												y: -8,
												transition: { duration: 0.2 }
											} : undefined}
											layout={false}
										>
											<Card
												className={cn(
													'relative overflow-hidden border-2 transition-all duration-300 flex flex-col',
													'hover:shadow-2xl',
													isCurrent 
														? 'border-primary bg-gradient-to-br from-primary/10 via-primary/5 to-background shadow-lg ring-2 ring-primary/20' 
														: 'border-border/50 hover:border-primary/50 bg-card',
													plan.isPopular && 'ring-2 ring-primary/30 shadow-xl',
													expandedPlanCards.has(plan.id) ? 'h-auto' : 'h-full min-h-[600px]'
												)}
											>
									{/* Popular Gradient Background */}
									{plan.isPopular && (
										<motion.div 
											className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none"
											initial={{ opacity: 0 }}
											animate={{ opacity: 1 }}
											transition={{ duration: 0.5 }}
										/>
									)}

									<CardContent className="p-5 flex flex-col h-full relative z-0 min-h-[600px]">
										{/* Plan Name with Icon */}
										<div className="mb-3 flex-shrink-0">
											<div className="flex items-center gap-2.5 mb-1.5">
												{plan.isPopular ? (
													<motion.div 
														className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg"
														whileHover={{ scale: 1.1, rotate: 5 }}
														transition={{ type: "spring", stiffness: 400 }}
													>
														<Crown className="w-5 h-5 text-primary-foreground" />
													</motion.div>
												) : (
													<motion.div 
														className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center"
														whileHover={{ scale: 1.1, rotate: -5 }}
														transition={{ type: "spring", stiffness: 400 }}
													>
														<Zap className="w-5 h-5 text-primary" />
													</motion.div>
												)}
												<h3 className="text-xl font-bold">{plan.name}</h3>
												
												{/* Badges - на уровне названия */}
												<div className="ml-auto flex items-center gap-2">
													{plan.isPopular && (
														<motion.div 
															initial={{ scale: 0, rotate: -180 }}
															animate={{ scale: 1, rotate: 0 }}
															transition={{ 
																type: "spring",
																stiffness: 200,
																damping: 15,
																delay: 0.2
															}}
														>
															<Badge className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-lg flex items-center gap-1.5">
																<Star className="w-3 h-3 fill-current" />
																Популярный
															</Badge>
														</motion.div>
													)}
													{plan.isEarlyBird && !plan.isPopular && (
														<motion.div 
															initial={{ opacity: 0, scale: 0 }}
															animate={{ opacity: 1, scale: 1 }}
															transition={{ delay: 0.1 }}
														>
															<Badge variant="secondary" className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-700 dark:text-amber-400 border-amber-500/40 shadow-sm text-xs px-2 py-0.5">
																<Sparkles className="w-2.5 h-2.5 mr-1" />
																Early Bird
															</Badge>
														</motion.div>
													)}
												</div>
											</div>
											
											{/* Description */}
											{plan.description && (
												<p className="text-sm text-muted-foreground leading-snug line-clamp-2">{plan.description}</p>
											)}
										</div>

										{/* Pricing Section */}
										<div className="mb-3 pb-3 border-b border-border/50 flex-shrink-0">
											<div className="flex items-baseline gap-1.5 mb-1.5">
												<motion.p 
													className="text-4xl font-bold text-primary"
													initial={{ scale: 0.8 }}
													animate={{ scale: 1 }}
													transition={{ 
														type: "spring",
														stiffness: 200,
														damping: 15,
														delay: 0.4
													}}
												>
													{displayPrice}₽
												</motion.p>
												<span className="text-lg font-medium text-muted-foreground">/мес</span>
											</div>
											<AnimatePresence>
												{plan.isEarlyBird && rubPrice && rubPrice.price !== rubPrice.earlyBirdPrice && (
													<motion.div 
														className="flex items-center gap-2 flex-wrap"
														initial={{ opacity: 0 }}
														animate={{ opacity: 1 }}
														exit={{ opacity: 0 }}
														transition={{ delay: 0.5 }}
													>
														<p className="text-xs text-muted-foreground line-through">
															Обычная цена: {rubPrice.price}₽/мес
														</p>
														<Badge variant="secondary" className="bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/30 text-xs px-2 py-0.5">
															Экономия {rubPrice.price - displayPrice}₽
														</Badge>
													</motion.div>
												)}
											</AnimatePresence>
										</div>

										{/* Limits - Compact Grid */}
										<div className="grid grid-cols-1 gap-1.5 mb-3 flex-shrink-0">
											{[
												{ 
													icon: FolderOpen, 
													text: plan.maxActiveProjects === null
														? 'Неограниченно проектов'
														: `${plan.maxActiveProjects} активных проектов`,
													delay: 0.5
												},
												{ 
													icon: Users, 
													text: `До ${plan.maxMembers} участников`,
													delay: 0.6
												},
												{ 
													icon: HardDrive, 
													text: `${plan.storageGB} ГБ хранилища`,
													delay: 0.7
												},
											].map((item, idx) => (
												<motion.div
													key={idx}
													className="flex items-center gap-2 p-2 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
													initial={{ opacity: 0, x: -10 }}
													animate={{ opacity: 1, x: 0 }}
													transition={{ delay: item.delay }}
													whileHover={{ x: 4, transition: { duration: 0.2 } }}
												>
													<motion.div 
														className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0"
														whileHover={{ scale: 1.1, rotate: 5 }}
														transition={{ type: "spring", stiffness: 400 }}
													>
														<item.icon className="w-4 h-4 text-primary" />
													</motion.div>
													<div className="flex-1 min-w-0">
														<p className="text-sm font-medium truncate">{item.text}</p>
													</div>
												</motion.div>
											))}
										</div>

										{/* Features - Compact with accordion */}
										<div className="flex flex-col flex-1 min-h-0">
											{plan.features.length > 0 && (() => {
												const allFeatures = plan.features
													.filter((f) => f.isIncluded)
													.sort((a, b) => a.sortOrder - b.sortOrder)
												const initialFeaturesCount = 3
												const isExpanded = expandedPlanCards.has(plan.id)
												const visibleFeatures = allFeatures.slice(0, initialFeaturesCount)
												const hiddenFeatures = allFeatures.slice(initialFeaturesCount)

												return (
													<div className="pt-3 border-t border-border/50 flex-1 min-h-0 flex flex-col">
														<p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 flex-shrink-0">
															Включено:
														</p>
														<div className="flex-1 min-h-0 overflow-hidden flex flex-col">
															<ul className="space-y-1.5 flex-shrink-0">
																{visibleFeatures.map((feature, idx) => (
																	<motion.li 
																		key={feature.id} 
																		className="flex items-start gap-2 text-xs"
																		initial={{ opacity: 0, x: -10 }}
																		animate={{ opacity: 1, x: 0 }}
																		transition={{ delay: idx * 0.03, duration: 0.2 }}
																	>
																		<motion.div 
																			className="w-4 h-4 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5"
																			whileHover={{ scale: 1.2, rotate: 180 }}
																			transition={{ type: "spring", stiffness: 400 }}
																		>
																			<Check className="w-2.5 h-2.5 text-primary" />
																		</motion.div>
																		<div className="flex-1 min-w-0">
																			<span className="font-medium">{feature.name}</span>
																			{feature.description && (
																				<p className="text-muted-foreground text-[10px] mt-0.5 leading-relaxed line-clamp-1">
																					{feature.description}
																				</p>
																			)}
																		</div>
																	</motion.li>
																))}
															</ul>
															
															{/* Раскрывающийся контент как гармошка */}
															<AnimatePresence>
																{isExpanded && hiddenFeatures.length > 0 && (
																	<motion.div
																		className="overflow-hidden"
																		initial={{ height: 0, opacity: 0 }}
																		animate={{ height: 'auto', opacity: 1 }}
																		exit={{ height: 0, opacity: 0 }}
																		transition={{ duration: 0.3, ease: "easeInOut" }}
																	>
																		<ul className="space-y-1.5 pt-1.5">
																			{hiddenFeatures.map((feature, idx) => (
																				<motion.li 
																					key={feature.id} 
																					className="flex items-start gap-2 text-xs"
																					initial={{ opacity: 0, x: -10 }}
																					animate={{ opacity: 1, x: 0 }}
																					exit={{ opacity: 0, x: -10 }}
																					transition={{ delay: idx * 0.03, duration: 0.2 }}
																				>
																					<motion.div 
																						className="w-4 h-4 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5"
																						whileHover={{ scale: 1.2, rotate: 180 }}
																						transition={{ type: "spring", stiffness: 400 }}
																					>
																						<Check className="w-2.5 h-2.5 text-primary" />
																					</motion.div>
																					<div className="flex-1 min-w-0">
																						<span className="font-medium">{feature.name}</span>
																						{feature.description && (
																							<p className="text-muted-foreground text-[10px] mt-0.5 leading-relaxed line-clamp-1">
																								{feature.description}
																							</p>
																						)}
																					</div>
																				</motion.li>
																			))}
																		</ul>
																	</motion.div>
																)}
															</AnimatePresence>
														</div>
													</div>
												)
											})()}
										</div>

										{/* Action Buttons */}
										<div className="mt-auto pt-3 border-t border-border/50 space-y-2 flex-shrink-0">
											{/* Expand/Collapse Features Button */}
											{plan.features.filter((f) => f.isIncluded).length > 3 && (
												<Button
													variant="ghost"
													className="w-full h-8 text-xs text-muted-foreground hover:text-foreground relative z-10"
													onClick={() => {
														setExpandedPlanCards(prev => {
															const newSet = new Set(prev)
															if (newSet.has(plan.id)) {
																// Закрываем текущую карточку
																newSet.delete(plan.id)
															} else {
																// Открываем эту карточку, не закрывая другие
																newSet.add(plan.id)
															}
															return newSet
														})
													}}
												>
													{expandedPlanCards.has(plan.id) ? (
														<>
															Свернуть
															<motion.div
																animate={{ rotate: 180 }}
																transition={{ duration: 0.3 }}
															>
																<ChevronDown className="w-3 h-3 ml-1" />
															</motion.div>
														</>
													) : (
														<>
															Показать все возможности
															<motion.div
																animate={{ rotate: 0 }}
																transition={{ duration: 0.3 }}
															>
																<ChevronDown className="w-3 h-3 ml-1" />
															</motion.div>
														</>
													)}
												</Button>
											)}

											{isCurrent ? (
												<div className="w-full p-3 rounded-lg border border-primary/30 bg-primary/5 text-center">
													<div className="flex items-center justify-center gap-2 text-primary font-semibold">
														<Check className="w-5 h-5" />
														<span>Текущий план</span>
													</div>
													<p className="text-xs text-muted-foreground mt-1">
														Активна до {subscription?.currentPeriodEnd
															? format(new Date(subscription.currentPeriodEnd), 'd MMMM yyyy', { locale: ru })
															: '—'
														}
													</p>
												</div>
											) : (
												<motion.div
													whileHover={processingPlanId === null ? { scale: 1.02 } : undefined}
													whileTap={processingPlanId === null ? { scale: 0.98 } : undefined}
												>
													<Button 
														onClick={() => handleSelectPlan(plan.id)} 
														disabled={processingPlanId !== null}
														className={cn(
															'w-full font-semibold shadow-md transition-all h-10',
															plan.isPopular 
																? 'bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-primary/20' 
																: 'hover:shadow-lg'
														)}
													>
														{processingPlanId === plan.id ? (
															<>
																<Loader2 className="w-4 h-4 mr-2 animate-spin" />
																Обработка...
															</>
														) : (
															<>
																Выбрать план
																{plan.isPopular && (
																	<motion.span
																		animate={{ rotate: [0, 10, -10, 0] }}
																		transition={{ 
																			duration: 2,
																			repeat: Infinity,
																			repeatDelay: 1
																		}}
																	>
																		<Star className="w-4 h-4 ml-2 fill-current" />
																	</motion.span>
																)}
															</>
														)}
													</Button>
												</motion.div>
											)}
										</div>
									</CardContent>
											</Card>
										</motion.div>
									)
								})}
							</AnimatePresence>
							</motion.div>
						</div>
					)}
				</CardContent>
			</Card>
		)
	}

	return (
		<div className="space-y-6">
			{/* Trial Status Widget */}
			<TrialStatusWidget subscription={subscription} />
			{/* ... rest of active subscription view ... */}


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
								<Button
									variant="outline"
									onClick={() => {
										if (onUpgrade) {
											onUpgrade()
										} else {
											setIsChangingPlan(true)
											// Scroll to plans section
											setTimeout(() => {
												const plansSection = document.getElementById('plans-section')
												if (plansSection) {
													plansSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
												}
											}, 100)
										}
									}}
									className="flex-1"
								>
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

			{/* Downgrade Error Modal */}
			<DowngradeErrorModal
				isOpen={!!downgradError}
				onClose={() => setDowngradeError(null)}
				error={downgradError}
				newPlanName={plans.find(p => p.id === selectedPlanId)?.name}
			/>

			{/* Plan Details Dialog */}
			<Dialog open={!!selectedPlanDetails} onOpenChange={(open) => {
				if (!open) {
					setSelectedPlanDetails(null)
					setExpandedFeatures(false)
				}
			}}>
				<DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
					{selectedPlanDetails && (() => {
						const plan = selectedPlanDetails
						const isCurrent = subscription?.planId === plan.id
						const rubPrice = plan.prices.find((p) => p.currency === 'RUB')
						const displayPrice = rubPrice ? (plan.isEarlyBird ? rubPrice.earlyBirdPrice : rubPrice.price) : 0
						const hasTrialPeriod = plan.trialDays && plan.trialDays > 0
						const allFeatures = plan.features
							.filter((f) => f.isIncluded)
							.sort((a, b) => a.sortOrder - b.sortOrder)
						const initialFeaturesCount = 6
						const visibleFeatures = expandedFeatures ? allFeatures : allFeatures.slice(0, initialFeaturesCount)
						const hasMoreFeatures = allFeatures.length > initialFeaturesCount

						return (
							<>
								<DialogHeader>
									<div className="flex items-start justify-between">
										<div className="flex items-center gap-3">
											{plan.isPopular ? (
												<div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg">
													<Crown className="w-6 h-6 text-primary-foreground" />
												</div>
											) : (
												<div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
													<Zap className="w-6 h-6 text-primary" />
												</div>
											)}
											<div>
												<div className="flex items-center gap-2">
													<DialogTitle className="text-2xl">{plan.name}</DialogTitle>
													{plan.isPopular && (
														<Badge className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-md">
															<Star className="w-3 h-3 mr-1 fill-current" />
															Популярный
														</Badge>
													)}
													{plan.isEarlyBird && (
														<Badge variant="secondary" className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-700 dark:text-amber-400 border-amber-500/40">
															<Sparkles className="w-3 h-3 mr-1" />
															Early Bird
														</Badge>
													)}
													{isCurrent && (
														<Badge className="bg-primary text-primary-foreground">
															<Check className="w-3 h-3 mr-1" />
															Текущий
														</Badge>
													)}
												</div>
												<DialogDescription className="text-base mt-1">
													{plan.description}
												</DialogDescription>
											</div>
										</div>
										<Button
											variant="ghost"
											size="icon"
											onClick={() => setSelectedPlanDetails(null)}
											className="h-8 w-8"
										>
											<X className="w-4 h-4" />
										</Button>
									</div>
								</DialogHeader>

								<div className="space-y-6 py-4 overflow-y-auto flex-1 pr-2">
									{/* Pricing Section */}
									<div className="rounded-xl border border-border/50 bg-card/50 p-5">
										<div className="flex items-baseline gap-2 mb-3">
											<p className="text-5xl font-bold text-primary">
												{displayPrice}₽
											</p>
											<span className="text-xl font-medium text-muted-foreground">/мес</span>
										</div>
										{plan.isEarlyBird && rubPrice && rubPrice.price !== rubPrice.earlyBirdPrice && (
											<div className="flex items-center gap-3 flex-wrap">
												<p className="text-sm text-muted-foreground line-through">
													Обычная цена: {rubPrice.price}₽/мес
												</p>
												<Badge variant="secondary" className="bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/30">
													Экономия {rubPrice.price - displayPrice}₽
												</Badge>
											</div>
										)}
										{hasTrialPeriod && (
											<Badge variant="secondary" className="mt-2 bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30">
												<Zap className="w-3 h-3 mr-1" />
												{plan.trialDays} дней бесплатно
											</Badge>
										)}
									</div>

									{/* Limits */}
									<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
										<div className="p-4 rounded-xl border border-border/50 bg-card/50">
											<div className="flex items-center gap-2 mb-2">
												<FolderOpen className="w-5 h-5 text-primary" />
												<p className="font-semibold">Проекты</p>
											</div>
											<p className="text-3xl font-bold">
												{plan.maxActiveProjects === null ? '∞' : plan.maxActiveProjects}
											</p>
											<p className="text-sm text-muted-foreground mt-1">
												{plan.maxActiveProjects === null ? 'Неограниченно' : 'Активных проектов'}
											</p>
										</div>

										<div className="p-4 rounded-xl border border-border/50 bg-card/50">
											<div className="flex items-center gap-2 mb-2">
												<Users className="w-5 h-5 text-primary" />
												<p className="font-semibold">Участники</p>
											</div>
											<p className="text-3xl font-bold">{plan.maxMembers}</p>
											<p className="text-sm text-muted-foreground mt-1">Максимум участников</p>
										</div>

										<div className="p-4 rounded-xl border border-border/50 bg-card/50">
											<div className="flex items-center gap-2 mb-2">
												<HardDrive className="w-5 h-5 text-primary" />
												<p className="font-semibold">Хранилище</p>
											</div>
											<p className="text-3xl font-bold">{plan.storageGB}</p>
											<p className="text-sm text-muted-foreground mt-1">ГБ доступно</p>
										</div>
									</div>

									{/* All Features */}
									<div>
										<h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
											<Check className="w-5 h-5 text-primary" />
											Все возможности тарифа
										</h3>
										<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
											<AnimatePresence mode="popLayout">
												{visibleFeatures.map((feature, idx) => (
													<motion.div
														key={feature.id}
														className="flex items-start gap-3 p-4 rounded-lg border border-border/50 bg-card/50 hover:bg-card transition-colors"
														initial={{ opacity: 0, y: 10, height: 0 }}
														animate={{ opacity: 1, y: 0, height: 'auto' }}
														exit={{ opacity: 0, y: -10, height: 0 }}
														transition={{ delay: idx * 0.03, duration: 0.3 }}
													>
														<div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
															<Check className="w-4 h-4 text-primary" />
														</div>
														<div className="flex-1 min-w-0">
															<p className="font-semibold text-sm mb-1">{feature.name}</p>
															{feature.description && (
																<p className="text-sm text-muted-foreground leading-relaxed">
																	{feature.description}
																</p>
															)}
														</div>
													</motion.div>
												))}
											</AnimatePresence>
										</div>
										
										{/* Expand/Collapse Button */}
										{hasMoreFeatures && (
											<motion.div
												className="mt-4 flex justify-center"
												initial={{ opacity: 0 }}
												animate={{ opacity: 1 }}
												transition={{ delay: 0.2 }}
											>
												<Button
													variant="outline"
													onClick={() => setExpandedFeatures(!expandedFeatures)}
													className="w-full sm:w-auto gap-2"
												>
													{expandedFeatures ? (
														<>
															Свернуть
															<motion.div
																animate={{ rotate: 180 }}
																transition={{ duration: 0.3 }}
															>
																<ChevronDown className="w-4 h-4" />
															</motion.div>
														</>
													) : (
														<>
															Показать все возможности ({allFeatures.length - initialFeaturesCount} ещё)
															<motion.div
																animate={{ rotate: 0 }}
																transition={{ duration: 0.3 }}
															>
																<ChevronDown className="w-4 h-4" />
															</motion.div>
														</>
													)}
												</Button>
											</motion.div>
										)}
									</div>
								</div>

								<DialogFooter className="flex-col sm:flex-row gap-2">
									<Button
										variant="outline"
										onClick={() => setSelectedPlanDetails(null)}
										className="w-full sm:w-auto"
									>
										Закрыть
									</Button>
									{!isCurrent && (
										<Button
											onClick={() => {
												setSelectedPlanDetails(null)
												handleSelectPlan(plan.id)
											}}
											disabled={processingPlanId !== null}
											className={cn(
												'w-full sm:w-auto font-semibold',
												plan.isPopular && 'bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary'
											)}
										>
											{processingPlanId === plan.id ? (
												<>
													<Loader2 className="w-4 h-4 mr-2 animate-spin" />
													Обработка...
												</>
											) : (
												<>
													Выбрать план
													{plan.isPopular && <Star className="w-4 h-4 ml-2 fill-current" />}
												</>
											)}
										</Button>
									)}
								</DialogFooter>
							</>
						)
					})()}
				</DialogContent>
			</Dialog>
		</div>
	)
}
