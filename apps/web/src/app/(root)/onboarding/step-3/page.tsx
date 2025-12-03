'use client'

import { motion, Variants } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft, Check, Loader2, MapPin, FileText } from 'lucide-react'
import { useState, useEffect } from 'react'
import { Stepper } from '@/packages/components/ui/stepper'
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
	Button,
	Card,
	Input,
} from '@/packages/components'
import { createProjectSchema, type CreateProjectInput } from '@/packages/schemas/teams'

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
	const [teamName, setTeamName] = useState('')

	const form = useForm<CreateProjectInput>({
		resolver: zodResolver(createProjectSchema),
		mode: 'onChange',
		defaultValues: {
			name: '',
			address: '',
			description: '',
		},
	})

	// Load data from sessionStorage
	useEffect(() => {
		const step1Data = sessionStorage.getItem('onboarding_step1')
		if (!step1Data) {
			router.push('/onboarding/step-1')
			return
		}

		try {
			const data = JSON.parse(step1Data)
			setTeamName(data.name || '')
		} catch (error) {
			console.error('Failed to parse step 1 data:', error)
			router.push('/onboarding/step-1')
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
	}, [router, form])

	const onSubmit = async (data: CreateProjectInput) => {
		setIsSubmitting(true)

		try {
			// Save to sessionStorage
			sessionStorage.setItem('onboarding_step3', JSON.stringify(data))

			// TODO: Call GraphQL mutation CompleteOnboarding
			// const step1Data = JSON.parse(sessionStorage.getItem('onboarding_step1') || '{}')
			// const step2Data = JSON.parse(sessionStorage.getItem('onboarding_step2') || '{}')

			// await completeOnboarding({
			//   teamName: step1Data.name,
			//   iconId: step2Data.iconId,
			//   projectName: data.name,
			//   projectAddress: data.address,
			//   projectDescription: data.description,
			// })

			// Clear sessionStorage
			sessionStorage.removeItem('onboarding_step1')
			sessionStorage.removeItem('onboarding_step2')
			sessionStorage.removeItem('onboarding_step3')

			// Redirect to dashboard
			// TODO: Replace with actual dashboard route
			router.push('/')
		} catch (error) {
			console.error('Failed to complete onboarding:', error)
			setIsSubmitting(false)
		}
	}

	return (
		<div className="space-y-6">
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
			<Card className="w-full max-w-[420px] bg-card/80 backdrop-blur-xl border border-border/50 rounded-3xl shadow-2xl shadow-black/5 dark:shadow-black/20 p-8 relative overflow-hidden">
				{/* Decorative gradient */}
				<div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-accent via-primary to-accent" />
				
				{/* Header */}
				<motion.div
					variants={fadeIn}
					initial="hidden"
					animate="visible"
					transition={{ delay: 0.2 }}
					className="text-center mb-6"
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
		</div>
	)
}
