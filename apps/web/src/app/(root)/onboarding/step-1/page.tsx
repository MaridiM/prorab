'use client'

import { motion, Variants } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft, ArrowRight, Building2 } from 'lucide-react'
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
import { createTeamSchema, type CreateTeamInput } from '@/packages/schemas/teams'
import { useEffect } from 'react'

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

export default function OnboardingStep1Page() {
	const router = useRouter()

	const form = useForm<CreateTeamInput>({
		resolver: zodResolver(createTeamSchema),
		mode: 'onChange',
		defaultValues: {
			name: '',
		},
	})

	// Load from localStorage on mount
	useEffect(() => {
		const saved = localStorage.getItem('onboarding_step1')
		if (saved) {
			try {
				const data = JSON.parse(saved)
				form.reset(data)
			} catch (error) {
				console.error('Failed to parse onboarding data:', error)
			}
		}
	}, [form])

	const onSubmit = (data: CreateTeamInput) => {
		// Save to localStorage
		localStorage.setItem('onboarding_step1', JSON.stringify(data))
		// Navigate to next step
		router.push('/onboarding/step-2')
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
				<Stepper steps={steps} currentStep={1} />
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
					className="text-center mb-8"
				>
					<motion.div
						className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-linear-to-br from-accent to-amber-500 text-accent-foreground font-bold text-xl mb-4 shadow-lg shadow-accent/30"
						initial={{ scale: 0.8, opacity: 0 }}
						animate={{ scale: 1, opacity: 1 }}
						transition={{ delay: 0.25, duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
						whileHover={{ scale: 1.05, rotate: -5 }}
					>
						<Building2 className="w-7 h-7" />
					</motion.div>
					<h1 className="text-2xl font-bold tracking-tight">Название вашей бригады</h1>
					<p className="text-muted-foreground mt-2 text-sm">
						Выберите название, которое будет видно всем участникам
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
										<Building2 className="w-3.5 h-3.5" />
										Название бригады
									</FormLabel>
									<FormControl>
										<Input
											placeholder="Бригада №1"
											{...field}
											className="h-12 px-4 rounded-xl bg-secondary/30 border-border/50 focus:border-primary/50 focus-visible:ring-primary/20 transition-all"
											autoFocus
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
								onClick={() => router.push('/onboarding')}
								variant="outline"
								className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl border-2 border-border/50 bg-background font-medium transition-all hover:border-primary/50 active:scale-[0.98]"
							>
								<ArrowLeft className="h-4 w-4" />
								Назад
							</Button>

							<Button
								type="submit"
								disabled={!form.formState.isValid}
								className="group flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground font-semibold shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:shadow-none active:scale-[0.98] transition-all duration-200"
							>
								Далее
								<ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
							</Button>
						</div>
					</motion.form>
				</Form>
			</Card>
		</div>
	)
}
