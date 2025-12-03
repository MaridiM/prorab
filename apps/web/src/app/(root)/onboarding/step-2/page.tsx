'use client'

import { motion, Variants } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ArrowRight, Image } from 'lucide-react'
import { useState, useEffect } from 'react'
import { Stepper } from '@/packages/components/ui/stepper'
import { IconPicker } from '@/packages/components/ui/icon-picker'
import { Button, Card } from '@/packages/components'

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

export default function OnboardingStep2Page() {
	const router = useRouter()
	const [selectedIcon, setSelectedIcon] = useState('hammer')
	const [selectedColor, setSelectedColor] = useState('orange')
	const [teamName, setTeamName] = useState('')

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

		// Load step 2 data if exists
		const step2Data = sessionStorage.getItem('onboarding_step2')
		if (step2Data) {
			try {
				const data = JSON.parse(step2Data)
				if (data.iconId) setSelectedIcon(data.iconId)
				if (data.colorId) setSelectedColor(data.colorId)
			} catch (error) {
				console.error('Failed to parse step 2 data:', error)
			}
		}
	}, [router])

	const handleNext = () => {
		// Save to sessionStorage
		sessionStorage.setItem(
			'onboarding_step2',
			JSON.stringify({
				iconId: selectedIcon,
				colorId: selectedColor,
			})
		)
		router.push('/onboarding/step-3')
	}

	const handleSkip = () => {
		// Clear step 2 data
		sessionStorage.removeItem('onboarding_step2')
		router.push('/onboarding/step-3')
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
				<Stepper steps={steps} currentStep={2} />
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
						<Image className="w-7 h-7" />
					</motion.div>
					<h1 className="text-2xl font-bold tracking-tight">Логотип бригады</h1>
					<p className="text-muted-foreground mt-2 text-sm">
						Выберите иконку и цвет для{' '}
						<span className="font-medium text-foreground">{teamName}</span>
					</p>
				</motion.div>

				<motion.div
					variants={fadeIn}
					initial="hidden"
					animate="visible"
					transition={{ delay: 0.3 }}
				>
					<IconPicker
						selectedIcon={selectedIcon}
						selectedColor={selectedColor}
						onIconSelect={setSelectedIcon}
						onColorSelect={setSelectedColor}
					/>
				</motion.div>

				{/* Actions */}
				<motion.div
					variants={fadeIn}
					initial="hidden"
					animate="visible"
					transition={{ delay: 0.4 }}
					className="mt-6 space-y-3"
				>
					<div className="flex gap-3">
						<Button
							type="button"
							onClick={() => router.push('/onboarding/step-1')}
							variant="outline"
							className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl border-2 border-border/50 bg-background font-medium transition-all hover:border-primary/50 active:scale-[0.98]"
						>
							<ArrowLeft className="h-4 w-4" />
							Назад
						</Button>

						<Button
							type="button"
							onClick={handleNext}
							className="group flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground font-semibold shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 hover:bg-primary/90 active:scale-[0.98] transition-all duration-200"
						>
							Далее
							<ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
						</Button>
					</div>

					<Button
						type="button"
						onClick={handleSkip}
						variant="ghost"
						className="w-full text-sm text-muted-foreground underline-offset-4 transition-all hover:text-foreground hover:underline"
					>
						Пропустить этот шаг
					</Button>
				</motion.div>
			</Card>
		</div>
	)
}
