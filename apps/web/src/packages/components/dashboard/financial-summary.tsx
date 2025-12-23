'use client'

import { motion } from 'framer-motion'
import {
	Wallet,
	TrendingUp,
	TrendingDown,
	Receipt,
	PiggyBank,
	Users
} from 'lucide-react'
import { cn } from '@/packages/utils'

interface FinancialSummaryProps {
	/** Общая сумма договоров всех активных объектов */
	totalBudget: number
	/** Общая сумма расходов */
	totalExpenses: number
	/** Количество активных объектов */
	activeProjectsCount: number
	/** Количество участников бригады */
	membersCount: number
	/** Показывать финансы (только для владельца) */
	showFinancials?: boolean
	className?: string
}

export function FinancialSummary({
	totalBudget,
	totalExpenses,
	activeProjectsCount,
	membersCount,
	showFinancials = true,
	className,
}: FinancialSummaryProps) {
	const profit = totalBudget - totalExpenses
	const profitPercent = totalBudget > 0 ? ((profit / totalBudget) * 100) : 0
	const isProfitable = profit >= 0

	const formatCurrency = (amount: number) => {
		return new Intl.NumberFormat('ru-RU', {
			style: 'currency',
			currency: 'RUB',
			maximumFractionDigits: 0,
		}).format(amount)
	}

	const formatCompact = (amount: number) => {
		if (amount >= 1_000_000) {
			return `${(amount / 1_000_000).toFixed(1)} млн ₽`
		}
		if (amount >= 1_000) {
			return `${(amount / 1_000).toFixed(0)} тыс ₽`
		}
		return formatCurrency(amount)
	}

	const fadeIn = {
		hidden: { opacity: 0, y: 20 },
		visible: { opacity: 1, y: 0 }
	}

	const metrics = showFinancials
		? [
			{
				icon: Wallet,
				label: 'Сумма договоров',
				value: formatCompact(totalBudget),
				fullValue: formatCurrency(totalBudget),
				gradient: 'from-blue-500 to-indigo-500',
				bgGradient: 'from-blue-500/10 to-indigo-500/10',
			},
			{
				icon: Receipt,
				label: 'Потрачено',
				value: formatCompact(totalExpenses),
				fullValue: formatCurrency(totalExpenses),
				gradient: 'from-amber-500 to-orange-500',
				bgGradient: 'from-amber-500/10 to-orange-500/10',
				valueColor: 'text-amber-600 dark:text-amber-400',
			},
			{
				icon: isProfitable ? TrendingUp : TrendingDown,
				label: isProfitable ? 'Прибыль' : 'Убыток',
				value: formatCompact(Math.abs(profit)),
				fullValue: `${formatCurrency(Math.abs(profit))} (${Math.abs(profitPercent).toFixed(1)}%)`,
				gradient: isProfitable ? 'from-emerald-500 to-teal-500' : 'from-red-500 to-rose-500',
				bgGradient: isProfitable ? 'from-emerald-500/10 to-teal-500/10' : 'from-red-500/10 to-rose-500/10',
				valueColor: isProfitable ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400',
			},
		]
		: []

	return (
		<motion.div
			initial="hidden"
			animate="visible"
			variants={{
				hidden: {},
				visible: {
					transition: { staggerChildren: 0.1 }
				}
			}}
			className={cn('space-y-4', className)}
		>
			{/* Финансовые метрики (только для владельца) */}
			{showFinancials && (
				<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
					{metrics.map((metric, index) => (
						<motion.div
							key={index}
							variants={fadeIn}
							className={cn(
								'relative p-5 rounded-2xl border border-border/30 bg-card overflow-hidden group',
								'hover:shadow-lg hover:shadow-primary/5 transition-all duration-300'
							)}
						>
							{/* Градиентный фон */}
							<div className={cn(
								'absolute inset-0 opacity-50 bg-gradient-to-br',
								metric.bgGradient
							)} />

							<div className="relative z-10">
								<div className="flex items-center justify-between mb-3">
									<div className={cn(
										'w-10 h-10 rounded-xl flex items-center justify-center',
										'text-white bg-gradient-to-br shadow-lg',
										metric.gradient
									)}>
										<metric.icon className="w-5 h-5" />
									</div>
								</div>

								<div className="space-y-1">
									<p className="text-sm text-muted-foreground">{metric.label}</p>
									<p className={cn(
										'text-2xl font-bold',
										metric.valueColor
									)}>
										{metric.value}
									</p>
									<p className="text-xs text-muted-foreground">
										{metric.fullValue}
									</p>
								</div>
							</div>
						</motion.div>
					))}
				</div>
			)}

			{/* Статистика (всегда видна) */}
			<motion.div
				variants={fadeIn}
				className="flex flex-wrap gap-6 px-4 py-3 rounded-2xl bg-secondary/30 border border-border/30"
			>
				<div className="flex items-center gap-3">
					<div className="w-10 h-10 rounded-xl flex items-center justify-center bg-primary/10 text-primary">
						<PiggyBank className="w-5 h-5" />
					</div>
					<div>
						<p className="text-2xl font-bold">{activeProjectsCount}</p>
						<p className="text-xs text-muted-foreground">
							{activeProjectsCount === 1 ? 'Активный объект' :
								activeProjectsCount >= 2 && activeProjectsCount <= 4 ? 'Активных объекта' :
									'Активных объектов'}
						</p>
					</div>
				</div>

				<div className="flex items-center gap-3">
					<div className="w-10 h-10 rounded-xl flex items-center justify-center bg-violet-500/10 text-violet-500">
						<Users className="w-5 h-5" />
					</div>
					<div>
						<p className="text-2xl font-bold">{membersCount}</p>
						<p className="text-xs text-muted-foreground">
							{membersCount === 1 ? 'Участник' :
								membersCount >= 2 && membersCount <= 4 ? 'Участника' :
									'Участников'}
						</p>
					</div>
				</div>
			</motion.div>
		</motion.div>
	)
}


















