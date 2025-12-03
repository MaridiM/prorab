'use client'

import { motion, Variants } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Users, Key } from 'lucide-react'

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
		<motion.div
			className="space-y-8"
			initial="hidden"
			animate="visible"
			transition={{ staggerChildren: 0.1 }}
		>
			{/* Header */}
			<motion.div variants={fadeIn} className="text-center">
				<h1 className="text-3xl font-bold text-foreground">
					Добро пожаловать в ProRab!
				</h1>
				<p className="mt-2 text-muted-foreground">
					Настройте вашу бригаду за 3 простых шага
				</p>
			</motion.div>

			{/* Options */}
			<motion.div variants={fadeIn} className="space-y-4">
				{/* Create New Team */}
				<button
					onClick={() => router.push('/onboarding/step-1')}
					className="group relative w-full overflow-hidden rounded-2xl border-2 border-border bg-card p-6 text-left transition-all hover:border-primary hover:shadow-lg active:scale-[0.98]"
				>
					<div className="flex items-start gap-4">
						<div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-transform group-hover:scale-110">
							<Users className="h-6 w-6" />
						</div>
						<div className="flex-1">
							<h2 className="text-lg font-semibold text-foreground">
								Создать новую бригаду
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
					className="group relative w-full overflow-hidden rounded-2xl border-2 border-border bg-card p-6 text-left transition-all hover:border-primary hover:shadow-lg active:scale-[0.98]"
				>
					<div className="flex items-start gap-4">
						<div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent transition-transform group-hover:scale-110">
							<Key className="h-6 w-6" />
						</div>
						<div className="flex-1">
							<h2 className="text-lg font-semibold text-foreground">
								У меня есть код приглашения
							</h2>
							<p className="mt-1 text-sm text-muted-foreground">
								Присоединиться к существующей бригаде
							</p>
						</div>
					</div>
				</button>
			</motion.div>
		</motion.div>
	)
}
