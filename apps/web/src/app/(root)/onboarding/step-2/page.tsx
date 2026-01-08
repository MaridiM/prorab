'use client'

import { motion, Variants } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ArrowRight, Image, Loader2 } from 'lucide-react'
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
			ease: [0.22, 0.61, 0.36, 1] as const
		}
	}
}

const steps = [
	{ id: 1, label: 'Название' },
	{ id: 2, label: 'Логотип' },
	{ id: 3, label: 'Объект' },
]

// Available icons and colors (8 icons, 8 colors)
const ICON_IDS = ['hammer', 'wrench', 'construction', 'hardhat', 'brick', 'tools', 'house', 'building']
const COLOR_IDS = ['orange', 'blue', 'green', 'red', 'purple', 'yellow', 'pink', 'white']

export default function OnboardingStep2Page() {
	const router = useRouter()
	const [teamName, setTeamName] = useState('')
	const [isMounted, setIsMounted] = useState(false)
	const [isValidating, setIsValidating] = useState(true)

	// Initialize with stable default values (will be replaced after mount)
	const [selectedIcon, setSelectedIcon] = useState('hammer')
	const [selectedColor, setSelectedColor] = useState('orange')
	const [uploadedLogo, setUploadedLogo] = useState<File | string | null>(null)

	// Load data from localStorage and generate random values after mount
	useEffect(() => {
		// Only run on client side
		if (typeof window === 'undefined') return

		setIsMounted(true)

		// Validate Step 1 completion
		const step1Data = localStorage.getItem('onboarding_step1')
		if (!step1Data) {
			console.warn('Step 1 not completed, redirecting...')
			router.push('/onboarding/step-1')
			return
		}

		try {
			const data = JSON.parse(step1Data)
			// Validate that step 1 has team name
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

		// Load step 2 data if exists (to preserve icon/color selection and uploaded logo)
		const step2Data = localStorage.getItem('onboarding_step2')
		if (step2Data) {
			try {
				const data = JSON.parse(step2Data)
				if (data.logoBase64) {
					// Restore uploaded logo from base64
					setUploadedLogo(data.logoBase64)
				} else if (data.iconId && !data.hasUploadedLogo) {
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

		// All validations passed
		setIsValidating(false)
	}, [router])

	const handleLogoUpload = async (file: File | null) => {
		setUploadedLogo(file)

		// Save logo to localStorage as base64 when file is uploaded
		if (file && typeof window !== 'undefined') {
			try {
				const reader = new FileReader()
				reader.onloadend = () => {
					const base64String = reader.result as string
					const step2Data = localStorage.getItem('onboarding_step2')
					const data = step2Data ? JSON.parse(step2Data) : {}
					data.logoBase64 = base64String
					data.hasUploadedLogo = true
					localStorage.setItem('onboarding_step2', JSON.stringify(data))
				}
				reader.readAsDataURL(file)
			} catch (error) {
				console.error('Failed to save logo to localStorage:', error)
			}
		} else if (!file && typeof window !== 'undefined') {
			// Remove logo from localStorage when deleted
			const step2Data = localStorage.getItem('onboarding_step2')
			if (step2Data) {
				try {
					const data = JSON.parse(step2Data)
					delete data.logoBase64
					delete data.hasUploadedLogo
					localStorage.setItem('onboarding_step2', JSON.stringify(data))
				} catch (error) {
					console.error('Failed to remove logo from localStorage:', error)
				}
			}
		}
	}

	const handleNext = () => {
		if (typeof window === 'undefined') return

		// Save to localStorage (logoBase64 is already saved in handleLogoUpload)
		const step2Data: {
			iconId?: string
			colorId?: string
			hasUploadedLogo?: boolean
			logoBase64?: string
		} = {}

		if (uploadedLogo) {
			// Get existing data to preserve logoBase64
			const existingData = localStorage.getItem('onboarding_step2')
			if (existingData) {
				try {
					const existing = JSON.parse(existingData)
					if (existing.logoBase64) {
						step2Data.logoBase64 = existing.logoBase64
					}
				} catch (error) {
					console.error('Failed to parse existing step 2 data:', error)
				}
			}
			step2Data.hasUploadedLogo = true
		} else {
			step2Data.iconId = selectedIcon
			step2Data.colorId = selectedColor
		}

		localStorage.setItem('onboarding_step2', JSON.stringify(step2Data))
		router.push('/onboarding/step-3')
	}

	const handleSkip = () => {
		if (typeof window === 'undefined') return

		// Clear step 2 data
		localStorage.removeItem('onboarding_step2')
		router.push('/onboarding/step-3')
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
					className="text-center mb-8"
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
					className="mt-6"
				>
					<div className="flex gap-3 pt-2">
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
						className="w-full h-9 mt-3 text-sm text-muted-foreground hover:text-foreground transition-colors"
					>
						Пропустить этот шаг
					</Button>
				</motion.div>
			</Card>
		</div>
	)
}
