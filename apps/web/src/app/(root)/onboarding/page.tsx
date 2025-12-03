'use client'

import { motion, Variants } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Users, Key, ArrowRight } from 'lucide-react'
import { Card } from '@/packages/components'

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

export default function OnboardingStartPage() {
	const router = useRouter()

	return (
		<Card className="w-full max-w-[420px] bg-card/80 backdrop-blur-xl border border-border/50 rounded-3xl shadow-2xl shadow-black/5 dark:shadow-black/20 p-8 relative overflow-hidden">
			{/* Decorative gradient */}
			<div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-accent via-primary to-accent" />
			
			{/* Logo Header */}
			<motion.div 
				className="text-center mb-8"
				variants={fadeIn}
				initial="hidden"
				animate="visible"
				transition={{ delay: 0.1 }}
			>
				<motion.div
					className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-linear-to-br from-accent to-amber-500 text-accent-foreground font-bold text-xl mb-4 shadow-lg shadow-accent/30"
					initial={{ scale: 0.8, opacity: 0 }}
					animate={{ scale: 1, opacity: 1 }}
					transition={{ delay: 0.15, duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
					whileHover={{ scale: 1.05, rotate: -5 }}
				>
					PR
				</motion.div>
				<h1 className="text-2xl font-bold tracking-tight">Добро пожаловать в ProRab!</h1>
				<p className="text-muted-foreground mt-2 text-sm">
					Настройте вашу бригаду за 3 простых шага
				</p>
			</motion.div>

			{/* Options */}
			<motion.div 
				variants={fadeIn}
				initial="hidden"
				animate="visible"
				transition={{ delay: 0.2 }}
				className="space-y-4"
			>
				{/* Create New Team */}
				<button
					onClick={() => router.push('/onboarding/step-1')}
					className="group relative w-full overflow-hidden rounded-2xl border-2 border-border/50 bg-secondary/30 p-6 text-left transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10 active:scale-[0.98]"
				>
					<div className="flex items-start gap-4">
						<div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-transform group-hover:scale-110">
							<Users className="h-6 w-6" />
						</div>
						<div className="flex-1">
							<h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
								Создать новую бригаду
								<ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
							</h2>
							<p className="mt-1 text-sm text-muted-foreground">
								Я владелец бригады и хочу начать настройку
							</p>
						</div>
					</div>
				</button>

				{/* Join Existing Team */}
				<button
					onClick={() => router.push('/onboarding/invite')}
					className="group relative w-full overflow-hidden rounded-2xl border-2 border-border/50 bg-secondary/30 p-6 text-left transition-all hover:border-accent/50 hover:shadow-lg hover:shadow-accent/10 active:scale-[0.98]"
				>
					<div className="flex items-start gap-4">
						<div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent transition-transform group-hover:scale-110">
							<Key className="h-6 w-6" />
						</div>
						<div className="flex-1">
							<h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
								У меня есть код приглашения
								<ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
							</h2>
							<p className="mt-1 text-sm text-muted-foreground">
								Присоединиться к существующей бригаде
							</p>
						</div>
					</div>
				</button>
			</motion.div>
		</Card>
	)
}
