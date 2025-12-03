'use client'

import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import { cn } from  '@/packages/utils'

interface Step {
	id: number
	label: string
}

interface StepperProps {
	steps: Step[]
	currentStep: number
	className?: string
}

export function Stepper({ steps, currentStep, className }: StepperProps) {
	return (
		<div className={cn('w-full', className)}>
			<div className="relative flex items-center justify-between">
				{/* Progress Line */}
				<div className="absolute left-0 top-5 h-0.5 w-full bg-border">
					<motion.div
						className="h-full bg-primary"
						initial={{ width: '0%' }}
						animate={{
							width: `${((currentStep - 1) / (steps.length - 1)) * 100}%`,
						}}
						transition={{ duration: 0.3, ease: 'easeInOut' }}
					/>
				</div>

				{/* Steps */}
				{steps.map((step, index) => {
					const stepNumber = index + 1
					const isCompleted = stepNumber < currentStep
					const isCurrent = stepNumber === currentStep
					const isPending = stepNumber > currentStep

					return (
						<div
							key={step.id}
							className="relative z-10 flex flex-col items-center gap-2"
						>
							{/* Circle */}
							<motion.div
								className={cn(
									'flex h-10 w-10 items-center justify-center rounded-full border-2 bg-background transition-colors',
									{
										'border-primary bg-primary text-primary-foreground':
											isCompleted || isCurrent,
										'border-border text-muted-foreground': isPending,
									}
								)}
								initial={{ scale: 0.8, opacity: 0 }}
								animate={{ scale: 1, opacity: 1 }}
								transition={{ delay: index * 0.1 }}
							>
								{isCompleted ? (
									<motion.div
										initial={{ scale: 0 }}
										animate={{ scale: 1 }}
										transition={{ type: 'spring', stiffness: 200, damping: 15 }}
									>
										<Check className="h-5 w-5" />
									</motion.div>
								) : (
									<span className="text-sm font-semibold">{stepNumber}</span>
								)}
							</motion.div>

							{/* Label */}
							<motion.span
								className={cn(
									'absolute top-12 whitespace-nowrap text-xs font-medium transition-colors',
									{
										'text-primary': isCompleted || isCurrent,
										'text-muted-foreground': isPending,
									}
								)}
								initial={{ opacity: 0, y: -10 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: index * 0.1 + 0.1 }}
							>
								{step.label}
							</motion.span>
						</div>
					)
				})}
			</div>
		</div>
	)
}
