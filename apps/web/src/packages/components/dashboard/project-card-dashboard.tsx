'use client'

import { motion } from 'framer-motion'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale/ru'
import {
	MapPin,
	TrendingUp,
	TrendingDown,
	MessageCircle,
	Calendar,
	ArrowRight
} from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/packages/utils'
import { ProgressBar, Badge } from '@/packages/components/ui'
import { ProjectStatus, type ProjectStatusType } from '@/packages/schemas'

interface ProjectCardDashboardProps {
	id: string
	teamId: string
	name: string
	address?: string | null
	photoUrl?: string | null
	budget?: number | null
	progress: number
	status: ProjectStatusType
	startDate?: string | null
	endDate?: string | null
	/** Прибыль объекта (бюджет - расходы) */
	profit?: number | null
	/** Количество непрочитанных реакций от клиентов */
	unreadReactions?: number
	/** Показывать финансы (только для владельца) */
	showFinancials?: boolean
	className?: string
}

const statusConfig: Record<
	ProjectStatusType,
	{ label: string; variant: 'success' | 'warning' | 'secondary' }
> = {
	[ProjectStatus.ACTIVE]: { label: 'Активный', variant: 'success' },
	[ProjectStatus.ARCHIVED]: { label: 'Архив', variant: 'secondary' },
	[ProjectStatus.COMPLETED]: { label: 'Завершён', variant: 'success' },
}

export function ProjectCardDashboard({
	id,
	teamId,
	name,
	address,
	photoUrl,
	budget,
	progress,
	status,
	startDate,
	endDate,
	profit,
	unreadReactions = 0,
	showFinancials = false,
	className,
}: ProjectCardDashboardProps) {
	const statusInfo = statusConfig[status]
	const isProfitable = (profit ?? 0) >= 0

	const formatCurrency = (amount: number) => {
		if (Math.abs(amount) >= 1_000_000) {
			return `${(amount / 1_000_000).toFixed(1)} млн ₽`
		}
		if (Math.abs(amount) >= 1_000) {
			return `${Math.round(amount / 1_000)} тыс ₽`
		}
		return new Intl.NumberFormat('ru-RU', {
			style: 'currency',
			currency: 'RUB',
			maximumFractionDigits: 0,
		}).format(amount)
	}

	const formatDate = (date: string | null | undefined) => {
		if (!date) return null
		return format(new Date(date), 'dd MMM', { locale: ru })
	}

	return (
		<Link href={`/teams/${teamId}/projects/${id}`} className="block">
			<motion.div
				whileHover={{ y: -4, transition: { duration: 0.2 } }}
				className={cn(
					'relative rounded-2xl border border-border/30 bg-card overflow-hidden',
					'hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5',
					'transition-all duration-300 group cursor-pointer',
					status === ProjectStatus.ARCHIVED && 'opacity-60',
					className
				)}
			>
				{/* Градиентный hover эффект */}
				<div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-primary/5 to-transparent" />

				<div className="relative z-10 p-5">
					{/* Верхняя часть: фото + основная инфо */}
					<div className="flex gap-4 mb-4">
						{/* Фото объекта */}
						<div className={cn(
							'w-16 h-16 rounded-2xl overflow-hidden flex-shrink-0',
							'bg-gradient-to-br from-secondary to-muted'
						)}>
							{photoUrl ? (
								<img
									src={photoUrl}
									alt={name}
									className="w-full h-full object-cover"
								/>
							) : (
								<div className="w-full h-full flex items-center justify-center text-2xl">
									🏗️
								</div>
							)}
						</div>

						{/* Название и статус */}
						<div className="flex-1 min-w-0">
							<div className="flex items-start justify-between gap-2 mb-1">
								<h3 className="font-semibold text-lg line-clamp-1 group-hover:text-primary transition-colors">
									{name}
								</h3>
								<Badge variant={statusInfo.variant} className="flex-shrink-0">
									{statusInfo.label}
								</Badge>
							</div>

							{/* Адрес */}
							{address && (
								<div className="flex items-center gap-1.5 text-sm text-muted-foreground">
									<MapPin className="w-3.5 h-3.5 flex-shrink-0" />
									<span className="line-clamp-1">{address}</span>
								</div>
							)}

							{/* Сроки */}
							{(startDate || endDate) && (
								<div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-1">
									<Calendar className="w-3.5 h-3.5 flex-shrink-0" />
									<span>
										{formatDate(startDate) || '—'} — {formatDate(endDate) || '—'}
									</span>
								</div>
							)}
						</div>
					</div>

					{/* Прогресс */}
					<div className="mb-4">
						<ProgressBar value={progress} showLabel size="md" />
					</div>

					{/* Нижняя часть: финансы и метрики */}
					<div className="flex items-center justify-between">
						{/* Прибыль (только для владельца) */}
						{showFinancials && profit !== null && profit !== undefined ? (
							<div className="flex items-center gap-2">
								{isProfitable ? (
									<TrendingUp className="w-4 h-4 text-emerald-500" />
								) : (
									<TrendingDown className="w-4 h-4 text-red-500" />
								)}
								<span className={cn(
									'font-semibold',
									isProfitable ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
								)}>
									{isProfitable ? '+' : ''}{formatCurrency(profit)}
								</span>
							</div>
						) : budget ? (
							<div className="text-sm text-muted-foreground">
								Бюджет: <span className="font-medium text-foreground">{formatCurrency(budget)}</span>
							</div>
						) : (
							<div />
						)}

						{/* Непрочитанные реакции */}
						<div className="flex items-center gap-3">
							{unreadReactions > 0 && (
								<div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
									<MessageCircle className="w-3.5 h-3.5" />
									{unreadReactions}
								</div>
							)}

							{/* Стрелка */}
							<ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
						</div>
					</div>
				</div>
			</motion.div>
		</Link>
	)
}
















