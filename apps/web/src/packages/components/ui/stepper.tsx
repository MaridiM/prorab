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
		<div className={cn('w-full pb-6 mx-auto max-w-[80%] mt-4', className)}>
			<div className="relative flex items-center justify-between px-3">
				{/* Background Progress Line (connecting circles) */}
				<div className="absolute left-0 top-4 h-0.5 w-full bg-border/60" />
				
				{/* Animated Progress Line with Gradient (connecting circles) */}
				<motion.div
					className="absolute left-0 top-4 h-0.5 bg-linear-to-r from-accent via-primary to-primary"
					initial={{ width: '0%' }}
					animate={{
						width: `${((currentStep - 1) / (steps.length - 1)) * 100}%`,
					}}
					transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
				/>

				{/* Steps */}
				{steps.map((step, index) => {
					const stepNumber = index + 1
					const isCompleted = stepNumber < currentStep
					const isCurrent = stepNumber === currentStep
					const isPending = stepNumber > currentStep

					return (
						<div
							key={step.id}
							className="relative z-10 flex flex-col items-center"
						>
							{/* Circle */}
							<motion.div
								className={cn(
									'flex h-8 w-8 items-center justify-center rounded-full border-2 transition-all duration-300',
									{
										'border-primary bg-primary text-primary-foreground shadow-md shadow-primary/30':
											isCompleted || isCurrent,
										'border-border bg-background text-muted-foreground': isPending,
									}
								)}
								initial={{ scale: 0.8, opacity: 0 }}
								animate={{ 
									scale: 1, 
									opacity: 1,
								}}
								transition={{ 
									delay: index * 0.1,
								}}
							>
								{isCompleted ? (
									<motion.div
										initial={{ scale: 0, rotate: -180 }}
										animate={{ scale: 1, rotate: 0 }}
										transition={{ 
											type: 'spring', 
											stiffness: 300, 
											damping: 20,
											delay: 0.2
										}}
									>
										<Check className="h-4 w-4 stroke-[2.5]" />
									</motion.div>
								) : (
									<motion.span 
										className={cn(
											'text-xs font-semibold',
											{
												'text-primary-foreground': isCurrent,
												'text-muted-foreground': isPending,
											}
										)}
										initial={{ opacity: 0 }}
										animate={{ opacity: 1 }}
										transition={{ delay: index * 0.1 + 0.1 }}
									>
										{stepNumber}
									</motion.span>
								)}
							</motion.div>

							{/* Label */}
							<motion.span
								className={cn(
									'absolute top-10 whitespace-nowrap text-xs font-medium transition-colors duration-300',
									{
										'text-primary font-semibold': isCompleted || isCurrent,
										'text-muted-foreground': isPending,
									}
								)}
								initial={{ opacity: 0, y: -5 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: index * 0.1 + 0.15 }}
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
