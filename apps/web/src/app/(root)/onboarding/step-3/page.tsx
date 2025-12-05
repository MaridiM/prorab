'use client'

import { motion, Variants, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft, Check, Loader2, MapPin, FileText, Sparkles } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useMutation } from '@apollo/client/react'
import { apolloClient } from '@/packages/libs/apollo/apollo-client.config'
import { CompleteOnboardingDocument, type CompleteOnboardingInput } from '@/packages/api/graphql'
import { Stepper } from '@/packages/components/ui/stepper'

import { createProjectSchema, type CreateProjectInput } from '@/packages/schemas/teams'
import confetti from 'canvas-confetti'
import { Button, Card, Form, FormControl, FormField, FormItem, FormLabel, FormMessage, Input } from '@/packages/components'

const fadeIn: Variants = {
	hidden: { opacity: 0, y: 20 },
	visible: {
		opacity: 1,
		y: 0,
		transition: {
			duration: 0.5,
			ease: [0.22, 0.61, 0.36, 1]
		}
	}
}

const steps = [
	{ id: 1, label: 'Название' },
	{ id: 2, label: 'Логотип' },
	{ id: 3, label: 'Объект' },
]

export default function OnboardingStep3Page() {
	const router = useRouter()
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [isCompleted, setIsCompleted] = useState(false)
	const [teamName, setTeamName] = useState('')
	const [isValidating, setIsValidating] = useState(true)
	const [error, setError] = useState<string | null>(null)

	const [completeOnboarding] = useMutation(CompleteOnboardingDocument, {
		client: apolloClient,
	})

	const form = useForm<CreateProjectInput>({
		resolver: zodResolver(createProjectSchema),
		mode: 'onChange',
		defaultValues: {
			name: '',
			address: '',
			description: '',
		},
	})

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

	// Load data from sessionStorage and validate previous steps
	useEffect(() => {
		// Only run on client side
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

		try {
			const step2 = JSON.parse(step2Data)
			// Validate that step 2 has either uploaded logo or selected icon/color
			if (!step2.hasUploadedLogo && !step2.logoBase64 && (!step2.iconId || !step2.colorId)) {
				console.warn('Step 2 incomplete: missing logo or icon selection')
				router.push('/onboarding/step-2')
				return
			}
		} catch (error) {
			console.error('Failed to parse step 2 data:', error)
			router.push('/onboarding/step-2')
			return
		}

		// Load step 3 data if exists
		const step3Data = sessionStorage.getItem('onboarding_step3')
		if (step3Data) {
			try {
				const data = JSON.parse(step3Data)
				form.reset(data)
			} catch (error) {
				console.error('Failed to parse step 3 data:', error)
			}
		}

		// All validations passed
		setIsValidating(false)
	}, [router, form])

	const onSubmit = async (data: CreateProjectInput) => {
		setIsSubmitting(true)
		setError(null)

		try {
			// Save to sessionStorage
			sessionStorage.setItem('onboarding_step3', JSON.stringify(data))

			// Get data from previous steps
			const step1Data = JSON.parse(sessionStorage.getItem('onboarding_step1') || '{}')
			const step2Data = JSON.parse(sessionStorage.getItem('onboarding_step2') || '{}')

			// Prepare mutation input
			const input: CompleteOnboardingInput = {
				teamName: step1Data.name,
				projectName: data.name,
				projectAddress: data.address || null,
				projectDescription: data.description || null,
				colorId: step2Data.colorId || null,
				iconId: step2Data.iconId || null,
				logoFile: step2Data.logoBase64 ? new File([step2Data.logoBase64], 'logo.png', { type: 'image/png' }) : undefined
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

		// Handle GraphQL errors (errorPolicy: 'all' returns errors in result.error)
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

				// Redirect to team dashboard
				const teamId = result.data?.completeOnboarding.team.id
				if (teamId) {
					router.push(`/teams/${teamId}`)
				} else {
					router.push('/dashboard')
				}
			}, 2000)
		} else {
			// Handle business logic error (success: false)
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

	// Show loader while validating
	if (isValidating) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<Loader2 className="h-8 w-8 animate-spin text-primary" />
			</div>
		)
	}

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
				<Stepper steps={steps} currentStep={3} />
			</motion.div>

			{/* Form Card */}
			<AnimatePresence mode="wait">
				{!isCompleted && (
					<motion.div
						initial={{ opacity: 1 }}
						exit={{ opacity: 0, scale: 0.95, y: 20 }}
						transition={{ duration: 0.3 }}
					>
						<Card className="w-full max-w-[420px] bg-card/80 backdrop-blur-xl border border-border/50 rounded-3xl shadow-2xl shadow-black/5 dark:shadow-black/20 p-8 relative overflow-hidden">
				{/* Decorative gradient */}
				<div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-accent via-primary to-accent" />
				
				{/* Header */}
				<motion.div
					variants={fadeIn}
					initial="hidden"
					animate="visible"
					transition={{ delay: 0.2 }}
					className="text-center mb-8"
				>
					<motion.div
						className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-linear-to-br from-accent to-amber-500 text-accent-foreground font-bold text-xl mb-4 shadow-lg shadow-accent/30"
						initial={{ scale: 0.8, opacity: 0 }}
						animate={{ scale: 1, opacity: 1 }}
						transition={{ delay: 0.25, duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
						whileHover={{ scale: 1.05, rotate: -5 }}
					>
						<MapPin className="w-7 h-7" />
					</motion.div>
					<h1 className="text-2xl font-bold tracking-tight">Первый объект</h1>
					<p className="text-muted-foreground mt-2 text-sm">
						Добавьте первый строительный объект для{' '}
						<span className="font-medium text-foreground">{teamName}</span>
					</p>
				</motion.div>

				<Form {...form}>
					<motion.form
						onSubmit={form.handleSubmit(onSubmit)}
						className="space-y-5"
						variants={fadeIn}
						initial="hidden"
						animate="visible"
						transition={{ delay: 0.3 }}
					>
						{/* Error Display */}
						{error && (
							<motion.div
								initial={{ opacity: 0, y: -10 }}
								animate={{ opacity: 1, y: 0 }}
								className="p-4 rounded-xl bg-destructive/10 border border-destructive/50 text-destructive text-sm"
							>
								{error}
							</motion.div>
						)}

						<FormField
							control={form.control}
							name="name"
							render={({ field }) => (
								<FormItem>
									<FormLabel className="text-xs font-medium text-muted-foreground ml-1 flex items-center gap-1.5">
										<MapPin className="w-3.5 h-3.5" />
										Название объекта *
									</FormLabel>
									<FormControl>
										<Input
											placeholder="Жилой комплекс 'Солнечный'"
											{...field}
											className="h-12 px-4 rounded-xl bg-secondary/30 border-border/50 focus:border-primary/50 focus-visible:ring-primary/20 transition-all"
											autoFocus
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="address"
							render={({ field }) => (
								<FormItem>
									<FormLabel className="text-xs font-medium text-muted-foreground ml-1 flex items-center gap-1.5">
										<MapPin className="w-3.5 h-3.5" />
										Адрес
									</FormLabel>
									<FormControl>
										<Input
											placeholder="ул. Строителей, 15"
											{...field}
											className="h-12 px-4 rounded-xl bg-secondary/30 border-border/50 focus:border-primary/50 focus-visible:ring-primary/20 transition-all"
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="description"
							render={({ field }) => (
								<FormItem>
									<FormLabel className="text-xs font-medium text-muted-foreground ml-1 flex items-center gap-1.5">
										<FileText className="w-3.5 h-3.5" />
										Описание
									</FormLabel>
									<FormControl>
										<Input
											placeholder="Краткое описание объекта"
											{...field}
											className="h-12 px-4 rounded-xl bg-secondary/30 border-border/50 focus:border-primary/50 focus-visible:ring-primary/20 transition-all"
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						{/* Actions */}
						<div className="flex gap-3 pt-2">
							<Button
								type="button"
								onClick={() => router.push('/onboarding/step-2')}
								variant="outline"
								disabled={isSubmitting}
								className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl border-2 border-border/50 bg-background font-medium transition-all hover:border-primary/50 disabled:cursor-not-allowed disabled:opacity-50 active:scale-[0.98]"
							>
								<ArrowLeft className="h-4 w-4" />
								Назад
							</Button>

							<Button
								type="submit"
								disabled={!form.formState.isValid || isSubmitting}
								className="group flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground font-semibold shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:shadow-none active:scale-[0.98] transition-all duration-200"
							>
								{isSubmitting ? (
									<>
										<Loader2 className="h-4 w-4 animate-spin" />
										Создание...
									</>
								) : (
									<>
										<Check className="h-4 w-4" />
										Завершить
									</>
								)}
							</Button>
						</div>
					</motion.form>
				</Form>
						</Card>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	)
}
