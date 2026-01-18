'use client'

import { motion, Variants } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft, Loader2, Calendar, Banknote, CalendarDays } from 'lucide-react'
import { useState, useEffect } from 'react'
import { Stepper } from '@/packages/components/ui/stepper'
import * as z from 'zod'

import { Button, Card, Form, FormControl, FormField, FormItem, FormLabel, FormMessage, Input } from '@/packages/components'

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
	{ id: 4, label: 'Детали' },
	{ id: 5, label: 'Тариф' },
]

// Validation Schema
const projectDetailsSchema = z.object({
	budget: z.coerce.number().min(0, 'Бюджет не может быть отрицательным').min(1, 'Укажите бюджет проекта'),
	startDate: z.string().min(1, 'Укажите дату начала'),
	endDate: z.string().optional(),
})

type ProjectDetailsInput = z.infer<typeof projectDetailsSchema>

export default function OnboardingStep4Page() {
	const router = useRouter()
	const [isValidating, setIsValidating] = useState(true)
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [projectName, setProjectName] = useState('')

	const form = useForm<ProjectDetailsInput>({
		resolver: zodResolver(projectDetailsSchema) as any,
		defaultValues: {
			budget: 0,
			startDate: new Date().toISOString().split('T')[0], // Today
			endDate: '',
		},
	})

	// Load data and validate previous steps
	useEffect(() => {
		if (typeof window === 'undefined') return

		// Validate Step 1
		if (!localStorage.getItem('onboarding_step1')) {
			router.push('/onboarding/step-1')
			return
		}

		// Validate Step 2
		if (!localStorage.getItem('onboarding_step2')) {
			router.push('/onboarding/step-2')
			return
		}

		// Validate Step 3 and get project name
		const step3Data = localStorage.getItem('onboarding_step3')
		if (!step3Data) {
			router.push('/onboarding/step-3')
			return
		}

		try {
			const data = JSON.parse(step3Data)
			setProjectName(data.name || 'проекта')
		} catch (e) {
			console.error(e)
		}

		// Load saved data for this step if any
		const savedData = localStorage.getItem('onboarding_step4')
		if (savedData) {
			try {
				form.reset(JSON.parse(savedData))
			} catch (e) {
				console.error(e)
			}
		}

		setIsValidating(false)
	}, [router, form])

	const onSubmit = async (data: ProjectDetailsInput) => {
		setIsSubmitting(true)
		setError(null)

		try {
			// Save to localStorage
			localStorage.setItem('onboarding_step4', JSON.stringify(data))

			// Navigate to next step
			router.push('/onboarding/step-5')
		} catch (err: any) {
			console.error('Failed to save data:', err)
			setError(err?.message || 'Произошла ошибка при сохранении данных')
			setIsSubmitting(false)
		}
	}

	if (isValidating) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<Loader2 className="h-8 w-8 animate-spin text-primary" />
			</div>
		)
	}

	return (
		<div className="space-y-6 relative">
			{/* Stepper */}
			<motion.div
				variants={fadeIn}
				initial="hidden"
				animate="visible"
				transition={{ delay: 0.1 }}
			>
				<Stepper steps={steps} currentStep={4} />
			</motion.div>

			{/* Form Card */}
			<Card className="w-full max-w-[420px] bg-card/80 backdrop-blur-xl border border-border/50 rounded-3xl shadow-2xl shadow-black/5 dark:shadow-black/20 p-8 relative overflow-hidden">
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
						className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-linear-to-br from-green-500 to-emerald-600 text-white font-bold text-xl mb-4 shadow-lg shadow-green-500/30"
						initial={{ scale: 0.8, opacity: 0 }}
						animate={{ scale: 1, opacity: 1 }}
						transition={{ delay: 0.25, duration: 0.4 }}
					>
						<Banknote className="w-7 h-7" />
					</motion.div>
					<h1 className="text-2xl font-bold tracking-tight">Детали проекта</h1>
					<p className="text-muted-foreground mt-2 text-sm">
						Укажите бюджет и сроки для <span className="font-medium text-foreground">"{projectName}"</span>
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
							<div className="p-4 rounded-xl bg-destructive/10 border border-destructive/50 text-destructive text-sm">
								{error}
							</div>
						)}

						{/* Budget Field */}
						<FormField
							control={form.control}
							name="budget"
							render={({ field }) => (
								<FormItem>
									<FormLabel className="text-xs font-medium text-muted-foreground ml-1 flex items-center gap-1.5">
										<Banknote className="w-3.5 h-3.5" />
										Бюджет (₽) *
									</FormLabel>
									<FormControl>
										<Input
											type="number"
											placeholder="1 000 000"
											{...field}
											onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
											className="h-12 px-4 rounded-xl bg-secondary/30 border-border/50 focus:border-primary/50 focus-visible:ring-primary/20 transition-all font-mono"
											autoFocus
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						{/* Start Date Field */}
						<FormField
							control={form.control}
							name="startDate"
							render={({ field }) => (
								<FormItem>
									<FormLabel className="text-xs font-medium text-muted-foreground ml-1 flex items-center gap-1.5">
										<Calendar className="w-3.5 h-3.5" />
										Дата начала *
									</FormLabel>
									<FormControl>
										<Input
											type="date"
											{...field}
											onClick={(e) => {
												try {
													e.currentTarget.showPicker()
												} catch (e) {
													// Fallback or ignore if not supported
												}
											}}
											className="h-12 px-4 rounded-xl bg-secondary/30 border-border/50 focus:border-primary/50 focus-visible:ring-primary/20 transition-all cursor-pointer"
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						{/* End Date Field */}
						<FormField
							control={form.control}
							name="endDate"
							render={({ field }) => (
								<FormItem>
									<FormLabel className="text-xs font-medium text-muted-foreground ml-1 flex items-center gap-1.5">
										<CalendarDays className="w-3.5 h-3.5" />
										Дата окончания (опционально)
									</FormLabel>
									<FormControl>
										<Input
											type="date"
											{...field}
											onClick={(e) => {
												try {
													e.currentTarget.showPicker()
												} catch (e) {
													// Fallback or ignore if not supported
												}
											}}
											className="h-12 px-4 rounded-xl bg-secondary/30 border-border/50 focus:border-primary/50 focus-visible:ring-primary/20 transition-all cursor-pointer"
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
								onClick={() => router.push('/onboarding/step-3')}
								variant="outline"
								disabled={isSubmitting}
								className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl border-2 border-border/50 bg-background font-medium transition-all hover:border-primary/50"
							>
								<ArrowLeft className="h-4 w-4" />
								Назад
							</Button>

							<Button
								type="submit"
								disabled={!form.formState.isValid || isSubmitting}
								className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground font-semibold shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 hover:bg-primary/90 transition-all"
							>
								Продолжить
							</Button>
						</div>
					</motion.form>
				</Form>
			</Card>
		</div>
	)
}
