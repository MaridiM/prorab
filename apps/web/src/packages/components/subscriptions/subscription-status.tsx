'use client'

import { format } from 'date-fns'
import { ru } from 'date-fns/locale/ru'
import { AlertCircle, Calendar, CreditCard, TrendingUp } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '../ui/alert'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Card } from '../ui/card'
import { Progress } from '../ui/progress'

export interface SubscriptionStatusProps {
	subscription: {
		plan: 'LITE' | 'FOREMAN' | 'BRIGADE'
		status: 'TRIALING' | 'ACTIVE' | 'PAST_DUE' | 'CANCELLED' | 'EXPIRED'
		currentPeriodEnd: string
		trialEndsAt?: string
		cancelAtPeriodEnd: boolean
		isEarlyBird: boolean
	}
	usageStats: {
		projectCount: number
		memberCount: number
		storageUsedGB: number
	}
	limits: {
		name: string
		price: number
		earlyBirdPrice?: number
		maxActiveProjects: number | null
		maxMembers: number
		storageGB: number
	}
	onUpgrade?: () => void
	onManage?: () => void
}

const STATUS_CONFIG = {
	TRIALING: {
		label: 'Триал',
		variant: 'default' as const,
		color: 'text-blue-500',
	},
	ACTIVE: {
		label: 'Активна',
		variant: 'default' as const,
		color: 'text-green-500',
	},
	PAST_DUE: {
		label: 'Просрочена',
		variant: 'destructive' as const,
		color: 'text-red-500',
	},
	CANCELLED: {
		label: 'Отменена',
		variant: 'outline' as const,
		color: 'text-muted-foreground',
	},
	EXPIRED: {
		label: 'Истекла',
		variant: 'destructive' as const,
		color: 'text-red-500',
	},
}

export function SubscriptionStatus({
	subscription,
	usageStats,
	limits,
	onUpgrade,
	onManage,
}: SubscriptionStatusProps) {
	const statusConfig = STATUS_CONFIG[subscription.status]
	const isTrialing = subscription.status === 'TRIALING'
	const isCancelled = subscription.cancelAtPeriodEnd
	const displayPrice = subscription.isEarlyBird && limits.earlyBirdPrice ? limits.earlyBirdPrice : limits.price

	// Calculate usage percentages
	const projectUsage = limits.maxActiveProjects
		? (usageStats.projectCount / limits.maxActiveProjects) * 100
		: 0
	const memberUsage = (usageStats.memberCount / limits.maxMembers) * 100
	const storageUsage = (usageStats.storageUsedGB / limits.storageGB) * 100

	// Check if at limits
	const isProjectLimitReached = limits.maxActiveProjects && usageStats.projectCount >= limits.maxActiveProjects
	const isMemberLimitReached = usageStats.memberCount >= limits.maxMembers
	const isStorageLimitReached = usageStats.storageUsedGB >= limits.storageGB

	const hasAnyLimitReached = isProjectLimitReached || isMemberLimitReached || isStorageLimitReached

	// Calculate days until end
	const endDate = new Date(isTrialing && subscription.trialEndsAt ? subscription.trialEndsAt : subscription.currentPeriodEnd)
	const now = new Date()
	const daysUntilEnd = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

	return (
		<div className="space-y-4">
			{/* Status Card */}
			<Card className="p-6">
				<div className="flex items-start justify-between mb-6">
					<div>
						<div className="flex items-center gap-2 mb-2">
							<h3 className="text-2xl font-bold">{limits.name}</h3>
							<Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>
							{subscription.isEarlyBird && (
								<Badge variant="outline" className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0">
									Early Bird
								</Badge>
							)}
						</div>
						<p className="text-muted-foreground">
							{displayPrice}₽/мес
						</p>
					</div>
					<div className="flex gap-2">
						{onManage && (
							<Button variant="outline" size="sm" onClick={onManage}>
								<CreditCard className="h-4 w-4 mr-2" />
								Управление
							</Button>
						)}
						{onUpgrade && subscription.plan !== 'BRIGADE' && (
							<Button size="sm" onClick={onUpgrade}>
								<TrendingUp className="h-4 w-4 mr-2" />
								Улучшить
							</Button>
						)}
					</div>
				</div>

				{/* Trial Countdown */}
				{isTrialing && daysUntilEnd > 0 && (
					<Alert className="mb-6">
						<Calendar className="h-4 w-4" />
						<AlertTitle>Триальный период</AlertTitle>
						<AlertDescription>
							Осталось {daysUntilEnd} {daysUntilEnd === 1 ? 'день' : daysUntilEnd < 5 ? 'дня' : 'дней'} бесплатного использования.
							После окончания триала потребуется оплата {displayPrice}₽/мес.
						</AlertDescription>
					</Alert>
				)}

				{/* Cancellation Notice */}
				{isCancelled && (
					<Alert variant="destructive" className="mb-6">
						<AlertCircle className="h-4 w-4" />
						<AlertTitle>Подписка отменена</AlertTitle>
						<AlertDescription>
							Ваша подписка будет деактивирована {format(endDate, 'd MMMM yyyy', { locale: ru })}.
							До этого момента у вас есть полный доступ ко всем функциям.
						</AlertDescription>
					</Alert>
				)}

				{/* Limit Reached Alert */}
				{hasAnyLimitReached && onUpgrade && (
					<Alert className="mb-6 border-amber-500">
						<AlertCircle className="h-4 w-4 text-amber-500" />
						<AlertTitle>Достигнут лимит</AlertTitle>
						<AlertDescription className="flex items-center justify-between">
							<span>
								Вы достигли лимита по {isProjectLimitReached && 'проектам'}
								{isMemberLimitReached && 'участникам'}
								{isStorageLimitReached && 'хранилищу'}.
								Улучшите план для продолжения работы.
							</span>
							<Button size="sm" variant="outline" onClick={onUpgrade}>
								Улучшить
							</Button>
						</AlertDescription>
					</Alert>
				)}

				{/* Next Billing Date */}
				{!isTrialing && !isCancelled && (
					<div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
						<Calendar className="h-4 w-4" />
						<span>
							Следующий платёж {format(endDate, 'd MMMM yyyy', { locale: ru })}
						</span>
					</div>
				)}

				{/* Usage Stats */}
				<div className="space-y-4">
					<h4 className="font-semibold mb-3">Использование</h4>

					{/* Projects */}
					<div>
						<div className="flex justify-between text-sm mb-2">
							<span className="text-muted-foreground">Проекты</span>
							<span className={isProjectLimitReached ? 'text-red-500 font-medium' : ''}>
								{usageStats.projectCount} / {limits.maxActiveProjects === null ? '∞' : limits.maxActiveProjects}
							</span>
						</div>
						{limits.maxActiveProjects !== null && (
							<Progress value={projectUsage} className="h-2" />
						)}
					</div>

					{/* Members */}
					<div>
						<div className="flex justify-between text-sm mb-2">
							<span className="text-muted-foreground">Участники</span>
							<span className={isMemberLimitReached ? 'text-red-500 font-medium' : ''}>
								{usageStats.memberCount} / {limits.maxMembers}
							</span>
						</div>
						<Progress value={memberUsage} className="h-2" />
					</div>

					{/* Storage */}
					<div>
						<div className="flex justify-between text-sm mb-2">
							<span className="text-muted-foreground">Хранилище</span>
							<span className={isStorageLimitReached ? 'text-red-500 font-medium' : ''}>
								{usageStats.storageUsedGB.toFixed(2)} ГБ / {limits.storageGB} ГБ
							</span>
						</div>
						<Progress value={storageUsage} className="h-2" />
					</div>
				</div>
			</Card>
		</div>
	)
}
