'use client'

import { motion, Variants } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft, Check, Loader2, Key } from 'lucide-react'
import { useState } from 'react'
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
	FormDescription,
	Button,
	Card,
	Input,
} from '@/packages/components'
import { inviteCodeSchema, type InviteCodeInput } from '@/packages/schemas/teams'

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

export default function OnboardingInvitePage() {
	const router = useRouter()
	const [isSubmitting, setIsSubmitting] = useState(false)

	const form = useForm<InviteCodeInput>({
		resolver: zodResolver(inviteCodeSchema),
		mode: 'onChange',
		defaultValues: {
			code: '',
		},
	})

	const onSubmit = async (data: InviteCodeInput) => {
		setIsSubmitting(true)

		try {
			// Redirect to invite page with code
			router.push(`/invite/${data.code}`)
		} catch (error) {
			console.error('Failed to join team:', error)
			setIsSubmitting(false)
		}
	}

	return (
		<Card className="w-full max-w-[420px] bg-card/80 backdrop-blur-xl border border-border/50 rounded-3xl shadow-2xl shadow-black/5 dark:shadow-black/20 p-8 relative overflow-hidden">
			{/* Decorative gradient */}
			<div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-accent via-primary to-accent" />
			
			{/* Logo Header */}
			<motion.div
				variants={fadeIn}
				initial="hidden"
				animate="visible"
				transition={{ delay: 0.1 }}
				className="text-center mb-8"
			>
				<motion.div
					className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-linear-to-br from-accent to-amber-500 text-accent-foreground font-bold text-xl mb-4 shadow-lg shadow-accent/30"
					initial={{ scale: 0.8, opacity: 0 }}
					animate={{ scale: 1, opacity: 1 }}
					transition={{ delay: 0.15, duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
					whileHover={{ scale: 1.05, rotate: -5 }}
				>
					<Key className="w-7 h-7" />
				</motion.div>
				<h1 className="text-2xl font-bold tracking-tight">Присоединиться к бригаде</h1>
				<p className="text-muted-foreground mt-2 text-sm">
					Введите код приглашения, который вам отправили
				</p>
			</motion.div>

			<Form {...form}>
				<motion.form
					onSubmit={form.handleSubmit(onSubmit)}
					className="space-y-5"
					variants={fadeIn}
					initial="hidden"
					animate="visible"
					transition={{ delay: 0.2 }}
				>
					<FormField
						control={form.control}
						name="code"
						render={({ field }) => (
							<FormItem>
								<FormLabel className="text-xs font-medium text-muted-foreground ml-1 flex items-center gap-1.5">
									<Key className="w-3.5 h-3.5" />
									Код приглашения
								</FormLabel>
								<FormControl>
									<Input
										placeholder="ABC12345"
										{...field}
										className="h-14 text-center text-xl font-mono uppercase tracking-widest rounded-xl bg-secondary/30 border-border/50 focus:border-primary/50 focus-visible:ring-primary/20 transition-all"
										maxLength={8}
										autoFocus
										onChange={(e) => {
											// Filter out I, O, 1, 0 characters
											const filtered = e.target.value
												.toUpperCase()
												.replace(/[IO10]/g, '')
											field.onChange(filtered)
										}}
									/>
								</FormControl>
								<FormDescription className="text-xs text-center">
									Введите 8-значный код (буквы A-Z, кроме I и O, цифры 2-9)
								</FormDescription>
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
									Проверка...
								</>
							) : (
								<>
									<Check className="h-4 w-4" />
									Присоединиться
								</>
							)}
						</Button>
					</div>
				</motion.form>
			</Form>

			{/* Help Text */}
			<motion.div
				variants={fadeIn}
				initial="hidden"
				animate="visible"
				transition={{ delay: 0.3 }}
				className="mt-6 text-center text-sm text-muted-foreground"
			>
				Код приглашения можно получить у владельца бригады
			</motion.div>
		</Card>
	)
}
