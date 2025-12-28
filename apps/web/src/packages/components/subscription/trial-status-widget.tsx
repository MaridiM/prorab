'use client'

import { motion } from 'framer-motion'
import { Zap, Crown, ArrowRight, Clock } from 'lucide-react'
import { Button } from '@/packages/components/ui/button'
import { Card } from '@/packages/components/ui/card'
import { ProgressBar } from '@/packages/components/ui/progress-bar'
import { Badge } from '@/packages/components/ui/badge'
import { cn } from '@/packages/utils'

interface TrialStatusWidgetProps {
	subscription: {
		id: string
		status: string
		trialEndsAt?: string | null
		planRef?: {
			id: string
			name: string
			trialDays?: number | null
		} | null
	} | null
	className?: string
}

export function TrialStatusWidget({ subscription, className }: TrialStatusWidgetProps) {
	// If no subscription or not in trial, don't show the widget
	if (!subscription || subscription.status !== 'TRIALING' || !subscription.trialEndsAt) {
		return null
	}

	// Calculate days remaining
	const now = new Date()
	const trialEnd = new Date(subscription.trialEndsAt)
	const totalMs = trialEnd.getTime() - now.getTime()
	const daysLeft = Math.ceil(totalMs / (1000 * 60 * 60 * 24))
	const totalTrialDays = subscription.planRef?.trialDays ?? 14

	// Calculate progress (inversed - starts at 100% and goes to 0%)
	const progressPercent = Math.max(0, Math.min(100, (daysLeft / totalTrialDays) * 100))

	// Get status color and message
	const isExpiringSoon = daysLeft <= 3
	const statusColor = isExpiringSoon ? 'text-destructive' : 'text-accent'
	const bgColor = isExpiringSoon ? 'bg-destructive/10' : 'bg-accent/10'
	const borderColor = isExpiringSoon ? 'border-destructive/20' : 'border-accent/20'

	// Format days text with correct Russian pluralization
	const getDaysText = (days: number): string => {
		if (days === 1) return 'день'
		if (days < 5) return 'дня'
		return 'дней'
	}

	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.5 }}
			className={cn('w-full', className)}
		>
			<Card className={cn(
				'relative overflow-hidden border-2 transition-all duration-300',
				borderColor,
				bgColor
			)}>
				{/* Decorative gradient */}
				<div className={cn(
					'absolute top-0 left-0 right-0 h-1',
					isExpiringSoon ? 'bg-gradient-to-r from-destructive to-orange-500' : 'bg-gradient-to-r from-accent to-amber-500'
				)} />

				<div className="p-6 space-y-4">
					{/* Header */}
					<div className="flex items-start justify-between gap-4">
						<div className="flex items-start gap-3">
							<div className={cn(
								'flex h-12 w-12 shrink-0 items-center justify-center rounded-xl',
								isExpiringSoon ? 'bg-destructive/20' : 'bg-accent/20'
							)}>
								{isExpiringSoon ? (
									<Clock className={cn('h-6 w-6', statusColor)} />
								) : (
									<Zap className={cn('h-6 w-6', statusColor)} />
								)}
							</div>
							<div className="space-y-1">
								<div className="flex items-center gap-2">
									<h3 className="font-semibold text-lg">Пробный период</h3>
									<Badge variant="outline" className={cn(
										'border-current',
										statusColor
									)}>
										{daysLeft} {getDaysText(daysLeft)}
									</Badge>
								</div>
								<p className="text-sm text-muted-foreground">
									{isExpiringSoon
										? 'Скоро закончится пробный период'
										: `План "${subscription.planRef?.name || 'Lite'}" активен`
									}
								</p>
							</div>
						</div>

						{/* Crown icon for premium plans */}
						{subscription.planRef?.name && subscription.planRef.name !== 'Lite' && (
							<Crown className="h-5 w-5 text-amber-500" />
						)}
					</div>

					{/* Progress Bar */}
					<div className="space-y-2">
						<div className="flex items-center justify-between text-xs">
							<span className="text-muted-foreground">Использовано</span>
							<span className={cn('font-medium', statusColor)}>
								{totalTrialDays - daysLeft} из {totalTrialDays} {getDaysText(totalTrialDays)}
							</span>
						</div>
						<ProgressBar
							value={100 - progressPercent}
							className="h-2"
							indicatorClassName={cn(
								isExpiringSoon ? 'bg-destructive' : 'bg-accent'
							)}
						/>
					</div>

					{/* Info message */}
					<div className={cn(
						'rounded-lg p-3 text-sm',
						isExpiringSoon ? 'bg-destructive/10 text-destructive-foreground' : 'bg-muted'
					)}>
						<p className="flex items-start gap-2">
							{isExpiringSoon ? (
								<>
									<Clock className="h-4 w-4 shrink-0 mt-0.5" />
									<span>
										Ваш пробный период заканчивается{' '}
										{trialEnd.toLocaleDateString('ru-RU', {
											day: 'numeric',
											month: 'long',
											year: 'numeric'
										})}.
										Выберите тарифный план, чтобы продолжить работу.
									</span>
								</>
							) : (
								<>
									<Zap className="h-4 w-4 shrink-0 mt-0.5" />
									<span>
										После окончания пробного периода выберите подходящий тарифный план для продолжения работы.
									</span>
								</>
							)}
						</p>
					</div>

					{/* CTA Button */}
					<Button
						className={cn(
							'w-full group',
							isExpiringSoon && 'bg-destructive hover:bg-destructive/90'
						)}
						size="lg"
					>
						<span>Выбрать тарифный план</span>
						<ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
					</Button>
				</div>
			</Card>
		</motion.div>
	)
}
