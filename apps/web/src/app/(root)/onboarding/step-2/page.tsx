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

// Available icons and colors
const ICON_IDS = ['hammer', 'wrench', 'construction', 'hardhat', 'brick', 'tools', 'house', 'building', 'crane', 'truck']
const COLOR_IDS = ['orange', 'blue', 'green', 'red', 'purple', 'yellow', 'pink', 'teal']

export default function OnboardingStep2Page() {
	const router = useRouter()
	const [teamName, setTeamName] = useState('')
	const [isMounted, setIsMounted] = useState(false)

	// Initialize with stable default values (will be replaced after mount)
	const [selectedIcon, setSelectedIcon] = useState('hammer')
	const [selectedColor, setSelectedColor] = useState('orange')
	const [uploadedLogo, setUploadedLogo] = useState<File | null>(null)

	// Load data from sessionStorage and generate random values after mount
	useEffect(() => {
		// Only run on client side
		if (typeof window === 'undefined') return
		
		setIsMounted(true)

		const step1Data = sessionStorage.getItem('onboarding_step1')
		if (!step1Data) {
			router.push('/onboarding/step-1')
			return
		}

		try {
			const data = JSON.parse(step1Data)
			// Set team name from step 1 data
			if (data.name) {
				setTeamName(data.name)
			} else {
				console.warn('No team name found in step 1 data')
			}
		} catch (error) {
			console.error('Failed to parse step 1 data:', error)
			router.push('/onboarding/step-1')
			return
		}

		// Load step 2 data if exists (to preserve icon/color selection)
		const step2Data = sessionStorage.getItem('onboarding_step2')
		if (step2Data) {
			try {
				const data = JSON.parse(step2Data)
				if (data.iconId && !data.hasUploadedLogo) {
					setSelectedIcon(data.iconId)
				}
				if (data.colorId && !data.hasUploadedLogo) {
					setSelectedColor(data.colorId)
				}
			} catch (error) {
				console.error('Failed to parse step 2 data:', error)
			}
		} else {
			// Only generate random icon and color if no saved data
			const randomIcon = ICON_IDS[Math.floor(Math.random() * ICON_IDS.length)]
			const randomColor = COLOR_IDS[Math.floor(Math.random() * COLOR_IDS.length)]
			setSelectedIcon(randomIcon)
			setSelectedColor(randomColor)
		}
	}, [router])

	const handleLogoUpload = (file: File | null) => {
		setUploadedLogo(file)
	}

	const handleNext = () => {
		if (typeof window === 'undefined') return
		
		// Save to sessionStorage
		const step2Data: {
			iconId?: string
			colorId?: string
			hasUploadedLogo?: boolean
		} = {}

		if (uploadedLogo) {
			step2Data.hasUploadedLogo = true
			// Note: actual file will be uploaded when completing onboarding
		} else {
			step2Data.iconId = selectedIcon
			step2Data.colorId = selectedColor
		}

		sessionStorage.setItem('onboarding_step2', JSON.stringify(step2Data))
		router.push('/onboarding/step-3')
	}

	const handleSkip = () => {
		if (typeof window === 'undefined') return
		
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
			<Card className="w-full max-w-[420px] bg-card/80 backdrop-blur-xl border border-border/50 rounded-3xl shadow-2xl shadow-black/5 dark:shadow-black/20 p-6 relative overflow-hidden">
				{/* Decorative gradient */}
				<div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-accent via-primary to-accent" />

				{/* Header */}
				<motion.div
					variants={fadeIn}
					initial="hidden"
					animate="visible"
					transition={{ delay: 0.2 }}
					className="text-center mb-5"
				>
					<motion.div
						className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-accent to-amber-500 text-accent-foreground font-bold text-base mb-2 shadow-lg shadow-accent/30"
						initial={{ scale: 0.8, opacity: 0 }}
						animate={{ scale: 1, opacity: 1 }}
						transition={{ delay: 0.25, duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
						whileHover={{ scale: 1.05, rotate: -5 }}
					>
						<Image className="w-5 h-5" />
					</motion.div>
					<h1 className="text-lg font-bold tracking-tight">Логотип бригады</h1>
					<p className="text-muted-foreground mt-1 text-xs">
						для <span className="font-medium text-foreground">{teamName}</span>
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
						uploadedLogo={uploadedLogo}
						onIconSelect={setSelectedIcon}
						onColorSelect={setSelectedColor}
						onLogoUpload={handleLogoUpload}
					/>
				</motion.div>

				{/* Actions */}
				<motion.div
					variants={fadeIn}
					initial="hidden"
					animate="visible"
					transition={{ delay: 0.4 }}
					className="mt-4 space-y-2"
				>
					<div className="flex gap-2">
						<Button
							type="button"
							onClick={() => router.push('/onboarding/step-1')}
							variant="outline"
							size="sm"
							className="flex h-10 flex-1 items-center justify-center gap-1.5 rounded-xl border-2 border-border/50 bg-background font-medium transition-all hover:border-primary/50 active:scale-[0.98]"
						>
							<ArrowLeft className="h-3.5 w-3.5" />
							Назад
						</Button>

						<Button
							type="button"
							onClick={handleNext}
							size="sm"
							className="group flex h-10 flex-1 items-center justify-center gap-1.5 rounded-xl bg-primary text-primary-foreground font-semibold shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 hover:bg-primary/90 active:scale-[0.98] transition-all duration-200"
						>
							Далее
							<ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
						</Button>
					</div>

					<Button
						type="button"
						onClick={handleSkip}
						variant="ghost"
						size="sm"
						className="w-full h-8 text-xs text-muted-foreground underline-offset-4 transition-all hover:text-foreground hover:underline"
					>
						Пропустить этот шаг
					</Button>
				</motion.div>
			</Card>
		</div>
	)
}
