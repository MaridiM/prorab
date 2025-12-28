'use client'

import { motion, Variants, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Check, Loader2, Package, Star, Zap, Sparkles } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useQuery, useMutation } from '@apollo/client/react'
import { apolloClient } from '@/packages/libs/apollo/apollo-client.config'
import { GetAvailablePlansDocument, CompleteOnboardingDocument, type CompleteOnboardingInput } from '@/packages/api/graphql'
import { Stepper } from '@/packages/components/ui/stepper'
import { Button, Card } from '@/packages/components'
import { cn } from '@/packages/utils'
import confetti from 'canvas-confetti'

const fadeIn: Variants = {
	hidden: { opacity: 0, y: 20 },
	visible: {
		opacity: 1,
		y: 0,
		transition: {
			duration: 0.5,
			ease: [0.22, 0.61, 0.36, 1] as const
		}
	}
}

const steps = [
	{ id: 1, label: 'Название' },
	{ id: 2, label: 'Логотип' },
	{ id: 3, label: 'Объект' },
	{ id: 4, label: 'Тариф' },
]

export default function OnboardingStep4Page() {
	const router = useRouter()
	const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null)
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [isCompleted, setIsCompleted] = useState(false)
	const [teamName, setTeamName] = useState('')
	const [isValidating, setIsValidating] = useState(true)
	const [error, setError] = useState<string | null>(null)

	const { data: plansData, loading: plansLoading } = useQuery(GetAvailablePlansDocument, {
		client: apolloClient,
		variables: { currency: 'RUB' },
	})

	const [completeOnboarding] = useMutation(CompleteOnboardingDocument, {
		client: apolloClient,
	})

	// Load data from sessionStorage and validate previous steps
	useEffect(() => {
		if (typeof window === 'undefined') return

		// Validate Step 1 completion
		const step1Data = sessionStorage.getItem('onboarding_step1')
		if (!step1Data) {
			console.warn('Step 1 not completed, redirecting...')
			router.push('/onboarding/step-1')
			return
		}

		// Validate Step 2 completion
		const step2Data = sessionStorage.getItem('onboarding_step2')
		if (!step2Data) {
			console.warn('Step 2 not completed, redirecting...')
			router.push('/onboarding/step-2')
			return
		}

		// Validate Step 3 completion
		const step3Data = sessionStorage.getItem('onboarding_step3')
		if (!step3Data) {
			console.warn('Step 3 not completed, redirecting...')
			router.push('/onboarding/step-3')
			return
		}

		try {
			const data = JSON.parse(step1Data)
			if (!data.name) {
				console.warn('Step 1 incomplete: missing team name')
				router.push('/onboarding/step-1')
				return
			}
			setTeamName(data.name)
		} catch (error) {
			console.error('Failed to parse step 1 data:', error)
			router.push('/onboarding/step-1')
			return
		}

		// Load step 4 data if exists
		const step4Data = sessionStorage.getItem('onboarding_step4')
		if (step4Data) {
			try {
				const data = JSON.parse(step4Data)
				setSelectedPlanId(data.planId)
			} catch (error) {
				console.error('Failed to parse step 4 data:', error)
			}
		}

		setIsValidating(false)
	}, [router])

	// Confetti effect function
	const triggerConfetti = () => {
		const duration = 3000
		const animationEnd = Date.now() + duration
		const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 }

		function randomInRange(min: number, max: number) {
			return Math.random() * (max - min) + min
		}

		const interval: NodeJS.Timeout = setInterval(function() {
			const timeLeft = animationEnd - Date.now()

			if (timeLeft <= 0) {
				return clearInterval(interval)
			}

			const particleCount = 50 * (timeLeft / duration)

			// Left side
			confetti({
				...defaults,
				particleCount,
				origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
			})
			// Right side
			confetti({
				...defaults,
				particleCount,
				origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
			})
		}, 250)
	}

	const handlePlanSelect = (planId: string) => {
		setSelectedPlanId(planId)
	}

	const handleNext = async () => {
		if (!selectedPlanId) return

		setIsSubmitting(true)
		setError(null)

		try {
			// Save selection to sessionStorage
			sessionStorage.setItem('onboarding_step4', JSON.stringify({ planId: selectedPlanId }))

			// Get data from previous steps
			const step1Data = JSON.parse(sessionStorage.getItem('onboarding_step1') || '{}')
			const step2Data = JSON.parse(sessionStorage.getItem('onboarding_step2') || '{}')
			const step3Data = JSON.parse(sessionStorage.getItem('onboarding_step3') || '{}')

			// Prepare mutation input
			const input: CompleteOnboardingInput = {
				teamName: step1Data.name,
				projectName: step3Data.name,
				projectAddress: step3Data.address || null,
				projectDescription: step3Data.description || null,
				colorId: step2Data.colorId || null,
				iconId: step2Data.iconId || null,
				planId: selectedPlanId, // Add selected plan
			}

			// Add logo data based on step 2
			if (step2Data.hasUploadedLogo && step2Data.logoBase64) {
				// Convert base64 to File object for upload
				const base64Response = await fetch(step2Data.logoBase64)
				const blob = await base64Response.blob()
				const file = new File([blob], 'logo.png', { type: 'image/png' })
				input.logoFile = file
			} else if (step2Data.iconId && step2Data.colorId) {
				// Use generated icon + color
				input.iconId = step2Data.iconId
				input.colorId = step2Data.colorId
			}

			// Call GraphQL mutation
			const result = await completeOnboarding({
				variables: { input },
			})

			// Handle GraphQL errors
			if (result.error) {
				const errorMessage = result.error.message || 'Не удалось завершить онбординг'
				setError(errorMessage)
				setIsSubmitting(false)
				return
			}

			// Handle successful response
			if (result.data?.completeOnboarding.success) {
				// Trigger completion animation
				setIsCompleted(true)

				// Trigger confetti effect
				triggerConfetti()

				// Wait for animation to complete before redirect
				setTimeout(() => {
					// Clear sessionStorage
					sessionStorage.removeItem('onboarding_step1')
					sessionStorage.removeItem('onboarding_step2')
					sessionStorage.removeItem('onboarding_step3')
					sessionStorage.removeItem('onboarding_step4')

					// Redirect to dashboard
					router.push('/dashboard')
				}, 2000)
			} else {
				// Handle business logic error
				const errorMessage = result.data?.completeOnboarding.message || 'Не удалось завершить онбординг'
				setError(errorMessage)
				setIsSubmitting(false)
			}
		} catch (err: any) {
			// Handle network or other unexpected errors
			console.error('Failed to complete onboarding:', err)
			setError(err?.message || 'Произошла ошибка при завершении онбординга')
			setIsSubmitting(false)
		}
	}

	const handleBack = () => {
		router.push('/onboarding/step-3')
	}

	// Show loader while validating or loading plans
	if (isValidating || plansLoading) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<Loader2 className="h-8 w-8 animate-spin text-primary" />
			</div>
		)
	}

	const plans = plansData?.availablePlans || []

	return (
		<div className="space-y-6 relative">
			{/* Success Animation Overlay */}
			<AnimatePresence>
				{isCompleted && (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-md"
					>
						<motion.div
							initial={{ scale: 0, rotate: -180 }}
							animate={{ scale: 1, rotate: 0 }}
							transition={{
								type: "spring",
								stiffness: 200,
								damping: 20,
								duration: 0.8
							}}
							className="flex flex-col items-center gap-6 p-12 bg-card/90 backdrop-blur-xl rounded-3xl border-2 border-primary/50 shadow-2xl"
						>
							<motion.div
								initial={{ scale: 0 }}
								animate={{ scale: [0, 1.2, 1] }}
								transition={{ delay: 0.2, duration: 0.6 }}
								className="relative"
							>
								<div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl" />
								<div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent">
									<Check className="h-12 w-12 text-primary-foreground" strokeWidth={3} />
								</div>
							</motion.div>

							<motion.div
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: 0.4, duration: 0.5 }}
								className="text-center space-y-2"
							>
								<h2 className="text-3xl font-bold">Готово!</h2>
								<p className="text-muted-foreground text-lg">
									Онбординг успешно завершён
								</p>
							</motion.div>

							<motion.div
								initial={{ scaleX: 0 }}
								animate={{ scaleX: 1 }}
								transition={{ delay: 0.6, duration: 0.5 }}
								className="flex gap-1"
							>
								{[...Array(3)].map((_, i) => (
									<motion.div
										key={i}
										initial={{ scale: 0 }}
										animate={{ scale: [0, 1.5, 1] }}
										transition={{ delay: 0.8 + i * 0.1, duration: 0.4 }}
									>
										<Sparkles className="h-6 w-6 text-primary" />
									</motion.div>
								))}
							</motion.div>
						</motion.div>
					</motion.div>
				)}
			</AnimatePresence>

			{/* Stepper */}
			<motion.div
				variants={fadeIn}
				initial="hidden"
				animate="visible"
				transition={{ delay: 0.1 }}
			>
				<Stepper steps={steps} currentStep={4} />
			</motion.div>

			{/* Plan Selection */}
			<div className="w-full max-w-[900px]">
				{/* Header */}
				<motion.div
					variants={fadeIn}
					initial="hidden"
					animate="visible"
					transition={{ delay: 0.2 }}
					className="text-center mb-8"
				>
					<motion.div
						className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-linear-to-br from-primary to-accent text-primary-foreground font-bold text-xl mb-4 shadow-lg shadow-primary/30"
						initial={{ scale: 0.8, opacity: 0 }}
						animate={{ scale: 1, opacity: 1 }}
						transition={{ delay: 0.25, duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
						whileHover={{ scale: 1.05, rotate: -5 }}
					>
						<Package className="w-7 h-7" />
					</motion.div>
					<h1 className="text-2xl font-bold tracking-tight">Выберите тарифный план</h1>
					<p className="text-muted-foreground mt-2 text-sm">
						Тариф для команды{' '}
						<span className="font-medium text-foreground">{teamName}</span>
					</p>
				</motion.div>

				{/* Plans Grid */}
				<motion.div
					variants={fadeIn}
					initial="hidden"
					animate="visible"
					transition={{ delay: 0.3 }}
					className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6"
				>
					{plans.map((plan, index) => {
						const price = plan.prices?.find(p => p.currency === 'RUB')
						const isSelected = selectedPlanId === plan.id
						const hasTrialPeriod = plan.trialDays && plan.trialDays > 0

						return (
							<motion.div
								key={plan.id}
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: 0.4 + index * 0.1 }}
							>
								<Card
									className={cn(
										'relative cursor-pointer transition-all duration-300 hover:shadow-lg p-6',
										isSelected
											? 'border-2 border-primary shadow-lg shadow-primary/20'
											: 'border border-border/50 hover:border-primary/50',
										plan.isPopular && 'ring-2 ring-primary/20'
									)}
									onClick={() => handlePlanSelect(plan.id)}
								>
									{/* Popular Badge */}
									{plan.isPopular && (
										<div className="absolute -top-3 left-1/2 -translate-x-1/2">
											<div className="flex items-center gap-1 bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-semibold shadow-lg">
												<Star className="w-3 h-3" />
												Популярный
											</div>
										</div>
									)}

									{/* Selected Indicator */}
									{isSelected && (
										<div className="absolute top-4 right-4">
											<div className="flex items-center justify-center w-6 h-6 bg-primary text-primary-foreground rounded-full">
												<Check className="w-4 h-4" />
											</div>
										</div>
									)}

									{/* Plan Content */}
									<div className="space-y-4 mt-2">
										{/* Plan Name */}
										<div>
											<h3 className="text-xl font-bold">{plan.name}</h3>
											{plan.description && (
												<p className="text-sm text-muted-foreground mt-1">
													{plan.description}
												</p>
											)}
										</div>

										{/* Trial Period Badge */}
										{hasTrialPeriod && (
											<div className="flex items-center gap-2 p-3 bg-accent/10 border border-accent/50 rounded-lg">
												<Zap className="w-4 h-4 text-accent shrink-0" />
												<div className="text-sm">
													<span className="font-semibold text-accent">
														{plan.trialDays} {plan.trialDays === 1 ? 'день' : plan.trialDays < 5 ? 'дня' : 'дней'}{' '}
													</span>
													<span className="text-muted-foreground">бесплатно</span>
												</div>
											</div>
										)}

										{/* Price */}
										<div className="py-4 border-y">
											{price ? (
												<div className="flex items-baseline gap-2">
													<span className="text-3xl font-bold">
														{price.price.toLocaleString('ru-RU')}
													</span>
													<span className="text-muted-foreground">₽/месяц</span>
												</div>
											) : (
												<div className="text-2xl font-bold text-muted-foreground">
													Цена не указана
												</div>
											)}
											{plan.isEarlyBird && price && (
												<p className="text-xs text-accent mt-1">
													Early Bird: {price.earlyBirdPrice.toLocaleString('ru-RU')} ₽
												</p>
											)}
										</div>

										{/* Features */}
										<div className="space-y-2">
											<p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
												Возможности:
											</p>
											<ul className="space-y-2">
												{plan.features
													?.filter(f => f.isIncluded)
													?.slice(0, 5)
													?.map((feature, idx) => (
														<li key={idx} className="flex items-start gap-2 text-sm">
															<Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
															<span>{feature.name}</span>
														</li>
													))}
												{plan.maxActiveProjects && (
													<li className="flex items-start gap-2 text-sm">
														<Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
														<span>
															До {plan.maxActiveProjects} активных проектов
														</span>
													</li>
												)}
												{plan.maxMembers && (
													<li className="flex items-start gap-2 text-sm">
														<Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
														<span>
															До {plan.maxMembers} участников
														</span>
													</li>
												)}
												{plan.storageGB && (
													<li className="flex items-start gap-2 text-sm">
														<Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
														<span>
															{plan.storageGB} ГБ хранилища
														</span>
													</li>
												)}
											</ul>
										</div>

										{/* Select Button */}
										<Button
											variant={isSelected ? 'default' : 'outline'}
											className="w-full mt-4"
											onClick={() => handlePlanSelect(plan.id)}
										>
											{isSelected ? 'Выбрано' : 'Выбрать план'}
										</Button>
									</div>
								</Card>
							</motion.div>
						)
					})}
				</motion.div>

				{/* Error Display */}
				{error && (
					<motion.div
						initial={{ opacity: 0, y: -10 }}
						animate={{ opacity: 1, y: 0 }}
						className="p-4 rounded-xl bg-destructive/10 border border-destructive/50 text-destructive text-sm mb-4"
					>
						{error}
					</motion.div>
				)}

				{/* Actions */}
				<motion.div
					variants={fadeIn}
					initial="hidden"
					animate="visible"
					transition={{ delay: 0.5 }}
					className="flex gap-3"
				>
					<Button
						type="button"
						onClick={handleBack}
						variant="outline"
						disabled={isSubmitting}
						className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl"
					>
						<ArrowLeft className="h-4 w-4" />
						Назад
					</Button>

					<Button
						type="button"
						onClick={handleNext}
						disabled={!selectedPlanId || isSubmitting}
						className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl"
					>
						{isSubmitting ? (
							<>
								<Loader2 className="h-4 w-4 animate-spin" />
								Завершение...
							</>
						) : (
							<>
								<Check className="h-4 w-4" />
								Завершить
							</>
						)}
					</Button>
				</motion.div>
			</div>
		</div>
	)
}
