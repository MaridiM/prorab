'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Zap, ArrowRight, Clock } from 'lucide-react'
import { Button } from '@/packages/components/ui/button'
import { Card } from '@/packages/components/ui/card'
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

	// Get status color and message
	const isExpiringSoon = daysLeft <= 3
	const statusColor = isExpiringSoon ? 'text-destructive' : 'text-amber-600'
	const bgColor = isExpiringSoon ? 'bg-destructive/5' : 'bg-amber-50'
	const borderColor = isExpiringSoon ? 'border-destructive/30' : 'border-amber-300'

	// Format days text with correct Russian pluralization
	const getDaysText = (days: number): string => {
		if (days === 1) return 'день'
		if (days < 5) return 'дня'
		return 'дней'
	}

	return (
		<motion.div
			initial={{ opacity: 0, y: -10 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.3 }}
			className={cn('w-full', className)}
		>
			<Card className={cn(
				'border-l-4 transition-all duration-300',
				borderColor,
				bgColor
			)}>
				<div className="p-4">
					<div className="flex items-center justify-between gap-4">
						{/* Left side - Icon and text */}
						<div className="flex items-center gap-3 flex-1 min-w-0">
							<div className={cn(
								'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg',
								isExpiringSoon ? 'bg-destructive/10' : 'bg-amber-100'
							)}>
								{isExpiringSoon ? (
									<Clock className={cn('h-5 w-5', statusColor)} />
								) : (
									<Zap className={cn('h-5 w-5', statusColor)} />
								)}
							</div>
							<div className="flex-1 min-w-0">
								<div className="flex items-center gap-2 mb-0.5">
									<h3 className="font-semibold text-sm">Пробный период</h3>
									<Badge variant="outline" className={cn(
										'border-current text-xs',
										statusColor
									)}>
										{daysLeft} {getDaysText(daysLeft)}
									</Badge>
								</div>
								<p className="text-xs text-muted-foreground truncate">
									План "{subscription.planRef?.name || 'Лайт'}" активен
									{isExpiringSoon && ' • Истекает ' + trialEnd.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}
								</p>
							</div>
						</div>

						{/* Right side - Button */}
						<Button
							className={cn(
								'shrink-0',
								isExpiringSoon ? 'bg-destructive hover:bg-destructive/90' : 'bg-amber-600 hover:bg-amber-700'
							)}
							size="sm"
							asChild
						>
							<Link href="/settings?tab=subscription&showPlans=true">
								<span className="hidden sm:inline">Выбрать тарифный план</span>
								<span className="inline sm:hidden">Выбрать план</span>
								<ArrowRight className="ml-2 h-4 w-4" />
							</Link>
						</Button>
					</div>
				</div>
			</Card>
		</motion.div>
	)
}
