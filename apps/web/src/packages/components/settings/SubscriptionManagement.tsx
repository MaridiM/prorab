'use client'

import { useState, useMemo, useCallback, useEffect } from 'react'
import { useQuery, useMutation } from '@apollo/client/react'
import { useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Crown, Check, Loader2, AlertCircle, TrendingUp, Users, FolderOpen, HardDrive, Sparkles, Zap, Star, Info, X, ChevronDown, RefreshCcw } from 'lucide-react'
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
	EarlyBirdStatsDocument,
	IsEarlyBirdAvailableForMeDocument,
	UsageStatsDocument,
	PaymentProviderType,
} from '@/packages/api/graphql/__generated__/output'
import {
	TrialStatusWidget,
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
	const [selectedPlanDetails, setSelectedPlanDetails] = useState<typeof plans[0] | null>(null)
	const [expandedFeatures, setExpandedFeatures] = useState(false)
	const [expandedPlanCards, setExpandedPlanCards] = useState<Set<string>>(new Set())
	const [processingPlanId, setProcessingPlanId] = useState<string | null>(null) // ID плана, который сейчас обрабатывается
	const { toast } = useToast()

	const { data: subData, loading: subLoading, refetch } = useQuery(MySubscriptionDocument, {
		fetchPolicy: 'cache-and-network', // Always refetch to get latest data
	})
	const { data: plansData, loading: plansLoading } = useQuery(AvailablePlansDetailedDocument)
	const { data: teamsData } = useQuery(MyTeamsDocument)
	const { data: earlyBirdData } = useQuery(EarlyBirdStatsDocument, {
		fetchPolicy: 'cache-and-network', // Always get fresh data
	})
	const { data: earlyBirdForMeData } = useQuery(IsEarlyBirdAvailableForMeDocument, {
		fetchPolicy: 'cache-and-network', // Always get fresh data for current user
	})

	const effectiveTeamIdComp = useMemo(() => teamId || subData?.mySubscription?.teamId || teamsData?.myTeams?.[0]?.id, [teamId, subData?.mySubscription?.teamId, teamsData?.myTeams]);

	const { data: usageData } = useQuery(UsageStatsDocument, {
		variables: { teamId: effectiveTeamIdComp || '' },
		skip: !effectiveTeamIdComp,
		fetchPolicy: 'cache-and-network',
	})
	const searchParams = useSearchParams()

	// Refetch subscription data when returning from payment page
	useEffect(() => {
		const paymentId = searchParams.get('paymentId')
		const paymentSuccess = searchParams.get('success')

		if (paymentId || paymentSuccess) {
			// User returned from payment page, refetch subscription data
			refetch()
		}
	}, [searchParams, refetch])

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
			toast(error.message || 'Не удалось изменить тариф', 'error')
		},
	})

	const [initializePayment] = useMutation(InitializePaymentDocument, {
		onCompleted: (data) => {
			// Redirect to payment checkout page (not success page)
			if (data.initializePayment.url) {
				// Ensure we're redirecting to checkout, not success page
				const url = data.initializePayment.url
				if (url.includes('/payment/success')) {
					// This shouldn't happen, but if it does, log it
					console.error('Received success URL instead of checkout URL:', url)
					toast('Ошибка: получен неправильный URL платежа', 'error')
					setProcessingPlanId(null)
					return
				}

				// Before redirecting to Stripe, ensure success page is not in browser history
				// Replace current history entry with settings to prevent back navigation to success
				// This is important because Stripe's "Back" button uses browser history
				const currentUrl = window.location.href
				if (currentUrl.includes('/payment/success')) {
					// If we're on success page, replace it with settings before going to Stripe
					window.history.replaceState({ fromSettings: true }, '', '/settings?tab=subscription')
				} else {
					// Replace current entry with settings to ensure clean history
					window.history.replaceState({ fromSettings: true }, '', '/settings?tab=subscription')
				}

				// Now redirect to Stripe checkout
				// This will add Stripe to history, but settings will be before it (not success)
				window.location.href = url
			} else {
				toast('Не удалось получить URL для оплаты', 'error')
				setProcessingPlanId(null)
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

	// Check if Early Bird is available for current user
	// This checks both:
	// 1. User hasn't used Early Bird before (one per user lifetime)
	// 2. Global Early Bird limit hasn't been reached (500 slots)
	const isEarlyBirdAvailable = useMemo(() => {
		return earlyBirdForMeData?.isEarlyBirdAvailableForMe ?? false
	}, [earlyBirdForMeData?.isEarlyBirdAvailableForMe])

	// Calculate maximum Early Bird discount across all plans
	const maxEarlyBirdDiscount = useMemo(() => {
		if (!plans || plans.length === 0) return 0

		let maxDiscount = 0

		for (const plan of plans) {
			// Get RUB price (base currency)
			const rubPrice = plan.prices?.find((p: any) => p.currency === 'RUB')

			if (rubPrice && rubPrice.price && rubPrice.earlyBirdPrice) {
				const regularPrice = Number(rubPrice.price)
				const earlyBirdPrice = Number(rubPrice.earlyBirdPrice)

				if (regularPrice > 0 && earlyBirdPrice < regularPrice) {
					const discount = ((regularPrice - earlyBirdPrice) / regularPrice) * 100
					maxDiscount = Math.max(maxDiscount, discount)
				}
			}
		}

		return Math.round(maxDiscount)
	}, [plans])

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

			// Если подписка уже существует, НЕ обновляем план до оплаты
			// План будет обновлен после успешной оплаты через webhook
			if (subscription?.id) {
				// Use existing subscription ID - plan will be updated after payment
				subscriptionId = subscription.id
			} else {
				// Create new subscription only if no subscription exists
				// For new subscription, we need teamId
				if (!effectiveTeamId) {
					toast('Не удалось определить команду. Сначала создайте команду в разделе "Команды".', 'error')
					setProcessingPlanId(null)
					return
				}

				// Find plan to get plan enum
				const selectedPlan = plans.find(p => p.id === planId)

				const result = await createSubscription({
					variables: {
						input: {
							teamId: effectiveTeamId,
							planId: planId,
							plan: selectedPlan?.slug?.toUpperCase() as any,
							// Only use Early Bird if it's available AND plan supports it
							useEarlyBird: (isEarlyBirdAvailable && selectedPlan?.isEarlyBird) || false,
						},
					},
				})

				// Check for errors first (Apollo Client returns errors in result, not as exceptions)
				if (result.error) {
					const errorMessage = result.error?.message || ''

					if (errorMessage.includes('Subscription already exists')) {
						console.log('Subscription already exists, fetching existing subscription and using changePlan')
						// Refetch subscription to get the existing one
						try {
							const { data: refetchedData } = await refetch()
							const existingSubscription = refetchedData?.mySubscription

							if (existingSubscription?.id) {
								// Use changePlan instead
								// Use existing subscription ID - plan will be updated after payment
								subscriptionId = existingSubscription.id
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

			// Initialize payment - plan will be updated after successful payment via webhook
			// Backend auto-selects provider by IP geolocation
			if (subscriptionId) {
				// Find plan to get plan enum for metadata
				const selectedPlan = plans.find(p => p.id === planId)

				await initializePayment({
					variables: {
						subscriptionId: subscriptionId,
						providerType: null, // null means backend will auto-select by IP
						targetPlanId: planId, // Desired plan ID - will be applied after payment
						targetPlan: selectedPlan?.slug?.toUpperCase() || null, // Desired plan enum - will be applied after payment
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

					{/* Early Bird Stats Banner */}
					{earlyBirdData?.earlyBirdStats && (
						<motion.div
							initial={{ opacity: 0, y: -10 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.2 }}
							className="mt-4"
						>
							<div className="bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 dark:from-amber-950/30 dark:via-orange-950/30 dark:to-amber-950/30 border border-amber-200 dark:border-amber-800/50 rounded-xl p-4">
								<div className="flex items-center justify-between gap-4 flex-wrap">
									{/* Left Side - Early Bird Info */}
									<div className="flex items-center gap-3">
										<div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
											<Sparkles className="w-5 h-5 text-white" />
										</div>
										<div>
											<h3 className="font-semibold text-amber-900 dark:text-amber-100 flex items-center gap-2">
												Early Bird предложение
												{earlyBirdData.earlyBirdStats.isAvailable ? (
													<Badge variant="secondary" className="bg-green-500/20 text-green-700 dark:text-green-400 border-green-500/40">
														Активно
													</Badge>
												) : (
													<Badge variant="secondary" className="bg-red-500/20 text-red-700 dark:text-red-400 border-red-500/40">
														Завершено
													</Badge>
												)}
											</h3>
											<p className="text-sm text-amber-700 dark:text-amber-300">
												{earlyBirdData.earlyBirdStats.isAvailable ? (
													<>
														Осталось <strong className="font-bold">{earlyBirdData.earlyBirdStats.remaining}</strong> из {earlyBirdData.earlyBirdStats.limit} мест со скидкой до {maxEarlyBirdDiscount}%
													</>
												) : (
													<>Все {earlyBirdData.earlyBirdStats.limit} мест заняты. Доступны обычные цены.</>
												)}
											</p>
										</div>
									</div>

									{/* Right Side - Social Proof */}
									{earlyBirdData.earlyBirdStats.totalTeams > 0 && (
										<div className="flex items-center gap-2 text-sm text-amber-700 dark:text-amber-300">
											<Users className="w-4 h-4" />
											<span>
												Уже <strong className="font-semibold">{earlyBirdData.earlyBirdStats.totalTeams}</strong> {' '}
												{earlyBirdData.earlyBirdStats.totalTeams === 1 ? 'команда присоединилась' :
													earlyBirdData.earlyBirdStats.totalTeams < 5 ? 'команды присоединились' :
														'команд присоединились'}
											</span>
										</div>
									)}
								</div>
							</div>
						</motion.div>
					)}
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
										// Only show Early Bird price if Early Bird is available AND plan supports it
										const shouldShowEarlyBird = isEarlyBirdAvailable && plan.isEarlyBird
										const displayPrice = rubPrice ? (shouldShowEarlyBird ? rubPrice.earlyBirdPrice : rubPrice.price) : 0
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
																	{hasTrialPeriod && (
																		<Badge variant="secondary" className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30 flex items-center gap-1">
																			<Zap className="w-3 h-3" />
																			{plan.trialDays} дней бесплатно
																		</Badge>
																	)}
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
																	{shouldShowEarlyBird && !plan.isPopular && (
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
																{shouldShowEarlyBird && rubPrice && rubPrice.price !== rubPrice.earlyBirdPrice && (
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
																<div className="space-y-2">
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
																	<motion.div
																		whileHover={processingPlanId === null ? { scale: 1.02 } : undefined}
																		whileTap={processingPlanId === null ? { scale: 0.98 } : undefined}
																	>
																		<Button
																			onClick={() => handleSelectPlan(plan.id)}
																			disabled={processingPlanId !== null}
																			variant="outline"
																			className="w-full font-semibold h-10 border-primary/50 text-primary hover:bg-primary/5"
																		>
																			{processingPlanId === plan.id ? (
																				<>
																					<Loader2 className="w-4 h-4 mr-2 animate-spin" />
																					Обработка...
																				</>
																			) : (
																				<>
																					<RefreshCcw className="w-4 h-4 mr-2" />
																					Продлить план
																				</>
																			)}
																		</Button>
																	</motion.div>
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


			{/* Current Plan Card - Compact Version */}
			<Card className="overflow-hidden border-border/60 shadow-sm transition-all hover:shadow-md">
				<div className="p-6">
					{/* Header: Plan Info & Actions */}
					<div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-6">

						{/* Left Side: Plan Details */}
						<div className="flex items-center gap-4">
							<div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/10 flex items-center justify-center flex-shrink-0">
								<Crown className="w-7 h-7 text-primary" />
							</div>
							<div>
								<div className="flex items-center gap-2 flex-wrap mb-1">
									<h3 className="text-xl font-bold tracking-tight">{subscription.limits.name}</h3>
									{getStatusBadge(subscription.status, subscription.cancelAtPeriodEnd)}
									{subscription.status === 'TRIALING' && subscription.trialEndsAt && (
										<Badge variant="secondary" className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30 flex items-center gap-1 h-5 px-1.5 text-[10px]">
											<Zap className="w-2.5 h-2.5" />
											Пробный период
										</Badge>
									)}
									{subscription.isEarlyBird && (
										<Badge variant="secondary" className="bg-amber-500/10 text-amber-600 border-amber-500/30 h-5 px-1.5 text-[10px]">
											Early Bird
										</Badge>
									)}
								</div>
								<div className="text-sm text-muted-foreground flex items-center gap-2">
									{(() => {
										// Find current plan to get full price and Early Bird price
										const currentPlan = plans.find(p => p.id === subscription.planId)
										const rubPrice = currentPlan?.prices?.find((p: any) => p.currency === 'RUB')

										// If user has Early Bird, show crossed out full price and Early Bird price
										if (subscription.isEarlyBird && rubPrice && rubPrice.price && rubPrice.earlyBirdPrice) {
											const fullPrice = Number(rubPrice.price)
											const earlyBirdPrice = Number(rubPrice.earlyBirdPrice)
											return (
												<>
													<span className="line-through opacity-70">{fullPrice}₽</span>
													<span className="font-semibold text-foreground bg-amber-500/10 text-amber-700 px-1.5 py-0.5 rounded text-xs">{earlyBirdPrice}₽/мес</span>
												</>
											)
										}

										const displayPrice = rubPrice ? Number(rubPrice.price) : subscription.limits.price
										return <span className="font-medium text-foreground">{displayPrice}₽/мес</span>
									})()}
								</div>
							</div>
						</div>

						{/* Right Side: Actions */}
						<div className="flex items-center gap-3 w-full md:w-auto">
							{!subscription.cancelAtPeriodEnd ? (
								<>
									<Button
										variant="outline"
										size="sm"
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
										className="flex-1 md:flex-none h-9"
									>
										<TrendingUp className="w-4 h-4 mr-2" />
										Сменить тариф
									</Button>

									<AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
										<AlertDialogTrigger asChild>
											<Button
												variant="ghost"
												size="sm"
												className="flex-1 md:flex-none text-muted-foreground hover:text-destructive hover:bg-destructive/10 h-9"
											>
												<X className="w-4 h-4 mr-2 md:mr-0" />
												<span className="md:hidden">Отменить</span>
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
										<Button size="sm" className="flex-1 md:flex-none h-9 bg-green-600 hover:bg-green-700">
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
					</div>

					{/* Stats Divider */}
					<div className="h-px w-full bg-border/50 mb-5" />

					{/* Grid Layout for Stats & Dates */}
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-6">

						{/* Period */}
						<div className="space-y-1.5">
							<span className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground flex items-center gap-1.5">
								<RefreshCcw className="w-3 h-3" />
								Период действия
							</span>
							<p className="font-medium text-sm">
								{(() => {
									const periodStart = new Date(subscription.currentPeriodStart);
									const now = new Date();
									const startStr = (periodStart > now)
										? format(now, 'd MMM', { locale: ru })
										: format(new Date(subscription.currentPeriodStart), 'd MMM', { locale: ru });
									const endStr = format(new Date(subscription.currentPeriodEnd), 'd MMM yyyy', { locale: ru });
									return `${startStr} — ${endStr}`;
								})()}
							</p>
							{subscription.cancelAtPeriodEnd ? (
								<p className="text-xs text-destructive font-medium">Отменена</p>
							) : (
								<p className="text-xs text-muted-foreground">
									Списание {formatDate(subscription.currentPeriodEnd)}
								</p>
							)}
						</div>

						{/* Projects Limit */}
						<div className="space-y-1.5">
							<span className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground flex items-center gap-1.5">
								<FolderOpen className="w-3 h-3" />
								Проекты
							</span>
							<div className="flex items-baseline gap-1">
								<span className="font-semibold text-sm">
									{usageData?.usageStats.activeProjects || 0}
								</span>
								<span className="text-xs text-muted-foreground">
									из {subscription.limits.maxActiveProjects === null ? '∞' : subscription.limits.maxActiveProjects}
								</span>
							</div>
							<Progress
								value={subscription.limits.maxActiveProjects
									? ((usageData?.usageStats.activeProjects || 0) / subscription.limits.maxActiveProjects) * 100
									: 0}
								className="h-1 bg-muted"
								indicatorClassName="bg-primary/60"
							/>
						</div>

						{/* Members Limit */}
						<div className="space-y-1.5">
							<span className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground flex items-center gap-1.5">
								<Users className="w-3 h-3" />
								Участники
							</span>
							<div className="flex items-baseline gap-1 flex-wrap">
								<span className="font-semibold text-sm">
									{usageData?.usageStats.totalMembers || 0}
								</span>
								<span className="text-xs text-muted-foreground">
									из {usageData?.usageStats.limits.maxMembers || subscription.limits.maxMembers}
								</span>
								<span className="text-[10px] text-muted-foreground">
									(по {subscription.limits.maxMembers} чел. на активный проект)
								</span>
							</div>
							<Progress
								value={(usageData?.usageStats.limits.maxMembers || subscription.limits.maxMembers)
									? ((usageData?.usageStats.totalMembers || 0) / (usageData?.usageStats.limits.maxMembers || subscription.limits.maxMembers)) * 100
									: 0}
								className="h-1 bg-muted"
								indicatorClassName="bg-primary/60"
							/>
						</div>

						{/* Storage Limit */}
						<div className="space-y-1.5">
							<span className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground flex items-center gap-1.5">
								<HardDrive className="w-3 h-3" />
								Хранилище
							</span>
							<div className="flex items-baseline gap-1">
								<span className="font-semibold text-sm">
									{(usageData?.usageStats.storageUsedGB || 0).toFixed(2)} ГБ
								</span>
								<span className="text-xs text-muted-foreground">
									из {subscription.limits.storageGB} ГБ
								</span>
							</div>
							<Progress
								value={subscription.limits.storageGB
									? ((usageData?.usageStats.storageUsedGB || 0) / subscription.limits.storageGB) * 100
									: 0}
								className="h-1 bg-muted"
								indicatorClassName="bg-primary/60"
							/>
						</div>
					</div>

					{/* Features List (Compact) */}
					<div className="mt-6 pt-5 border-t border-border/50">
						<div className="flex items-center gap-2 mb-3">
							<span className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">
								Включено в тариф:
							</span>
						</div>
						<ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
							{subscription.limits.features.map((feature: string) => (
								<li key={feature} className="flex items-start gap-2 text-xs text-muted-foreground/80 hover:text-foreground transition-colors group">
									<Check className="w-3.5 h-3.5 text-primary/70 group-hover:text-primary mt-0.5 flex-shrink-0" />
									<span className="leading-tight">{feature}</span>
								</li>
							))}
						</ul>
					</div>
				</div>
			</Card>


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
						// Only show Early Bird price if Early Bird is available AND plan supports it
						const shouldShowEarlyBird = isEarlyBirdAvailable && plan.isEarlyBird
						const displayPrice = rubPrice ? (shouldShowEarlyBird ? rubPrice.earlyBirdPrice : rubPrice.price) : 0
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
													{shouldShowEarlyBird && (
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
										{shouldShowEarlyBird && rubPrice && rubPrice.price !== rubPrice.earlyBirdPrice && (
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
