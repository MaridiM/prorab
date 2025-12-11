'use client'

import { ArrowRight, TrendingUp } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '../ui/alert'
import { Button } from '../ui/button'

export type LimitType = 'projects' | 'members' | 'storage'

export interface UpgradePromptProps {
	limitType: LimitType
	currentPlan: 'LITE' | 'FOREMAN' | 'BRIGADE'
	onUpgrade: () => void
	className?: string
}

const LIMIT_CONFIG: Record<LimitType, {
	title: string
	description: string
	icon: string
}> = {
	projects: {
		title: 'Достигнут лимит проектов',
		description: 'Вы достигли максимального количества проектов для вашего тарифа',
		icon: '📁',
	},
	members: {
		title: 'Достигнут лимит участников',
		description: 'Вы достигли максимального количества участников для вашего тарифа',
		icon: '👥',
	},
	storage: {
		title: 'Достигнут лимит хранилища',
		description: 'Вы достигли лимита доступного хранилища для вашего тарифа',
		icon: '💾',
	},
}

const PLAN_UPGRADES: Record<'LITE' | 'FOREMAN', {
	nextPlan: string
	benefits: string[]
}> = {
	LITE: {
		nextPlan: 'Прораб',
		benefits: [
			'До 4 активных проектов',
			'До 3 участников команды',
			'2 ГБ хранилища',
			'Расчёты зарплаты',
			'Фотоотчёты',
		],
	},
	FOREMAN: {
		nextPlan: 'Бригада',
		benefits: [
			'Безлимитные проекты',
			'До 10 участников команды',
			'10 ГБ хранилища',
			'Все функции платформы',
			'API доступ',
			'Приоритетная поддержка',
		],
	},
}

export function UpgradePrompt({
	limitType,
	currentPlan,
	onUpgrade,
	className = '',
}: UpgradePromptProps) {
	const config = LIMIT_CONFIG[limitType]

	// BRIGADE plan can't upgrade further
	if (currentPlan === 'BRIGADE') {
		return null
	}

	const upgrade = PLAN_UPGRADES[currentPlan]

	return (
		<Alert className={`border-amber-500 bg-amber-50 dark:bg-amber-950/20 ${className}`}>
			<div className="flex items-start gap-4">
				<div className="text-3xl flex-shrink-0">{config.icon}</div>
				<div className="flex-1">
					<AlertTitle className="text-amber-800 dark:text-amber-400 mb-2">
						{config.title}
					</AlertTitle>
					<AlertDescription className="text-amber-700 dark:text-amber-300 mb-4">
						{config.description}. Улучшите тариф до <strong>{upgrade.nextPlan}</strong> для продолжения работы.
					</AlertDescription>

					<div className="space-y-2 mb-4">
						<p className="text-sm font-medium text-amber-800 dark:text-amber-400">
							Что вы получите:
						</p>
						<ul className="space-y-1">
							{upgrade.benefits.map((benefit, index) => (
								<li key={index} className="text-sm text-amber-700 dark:text-amber-300 flex items-center gap-2">
									<span className="text-green-500">✓</span>
									{benefit}
								</li>
							))}
						</ul>
					</div>

					<Button
						onClick={onUpgrade}
						className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
					>
						<TrendingUp className="h-4 w-4 mr-2" />
						Улучшить до {upgrade.nextPlan}
						<ArrowRight className="h-4 w-4 ml-2" />
					</Button>
				</div>
			</div>
		</Alert>
	)
}
