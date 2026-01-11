'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale/ru'
import {
	MapPin,
	TrendingUp,
	TrendingDown,
	MessageCircle,
	Calendar,
	ArrowRight,
	MoreVertical,
	Edit3,
	Archive,
	Trash2,
	RotateCcw,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useMutation } from '@apollo/client/react'
import { cn } from '@/packages/utils'
import { ProgressBar, Badge } from '@/packages/components/ui'
import { ProjectStatus, type ProjectStatusType } from '@/packages/schemas'
import {
	ArchiveProjectDocument,
	DeleteProjectDocument,
	ProjectDocument,
	ProjectsByTeamDocument,
	RestoreProjectDocument,
} from '@/packages/api/graphql'
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	Button,
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/packages/components/ui'
import { useToast } from '@/packages/hooks'

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
	const router = useRouter()
	const { showToast } = useToast()
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

	const statusInfo = statusConfig[status]
	const isProfitable = (profit ?? 0) >= 0

	// Mutations
	const [archiveProject] = useMutation(ArchiveProjectDocument, {
		refetchQueries: [
			{ query: ProjectsByTeamDocument, variables: { teamId } },
			{ query: ProjectDocument, variables: { id } },
		],
		onCompleted: () => {
			showToast({ type: 'success', message: 'Проект архивирован' })
		},
		onError: (error) => {
			showToast({ type: 'error', message: error.message })
		},
	})

	const [restoreProject] = useMutation(RestoreProjectDocument, {
		refetchQueries: [
			{ query: ProjectsByTeamDocument, variables: { teamId } },
			{ query: ProjectDocument, variables: { id } },
		],
		onCompleted: () => {
			showToast({ type: 'success', message: 'Проект восстановлен' })
		},
		onError: (error) => {
			showToast({ type: 'error', message: error.message })
		},
	})

	const [deleteProject] = useMutation(DeleteProjectDocument, {
		refetchQueries: [
			{ query: ProjectsByTeamDocument, variables: { teamId } },
		],
		onCompleted: () => {
			showToast({ type: 'success', message: 'Проект удалён' })
			setIsDeleteDialogOpen(false)
		},
		onError: (error) => {
			showToast({ type: 'error', message: error.message })
		},
	})

	// Handlers
	const handleEdit = (e: React.MouseEvent) => {
		e.preventDefault()
		e.stopPropagation()
		router.push(`/teams/${teamId}/projects/${id}/edit`)
	}

	const handleArchive = (e: React.MouseEvent) => {
		e.preventDefault()
		e.stopPropagation()
		archiveProject({ variables: { id } })
	}

	const handleRestore = (e: React.MouseEvent) => {
		e.preventDefault()
		e.stopPropagation()
		restoreProject({ variables: { id } })
	}

	const handleDeleteClick = (e: React.MouseEvent) => {
		e.preventDefault()
		e.stopPropagation()
		setIsDeleteDialogOpen(true)
	}

	const handleDeleteConfirm = () => {
		deleteProject({ variables: { id } })
	}

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
		<>
			<motion.div
				whileHover={{ y: -4, transition: { duration: 0.2 } }}
				onClick={() => router.push(`/teams/${teamId}/projects/${id}`)}
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

				{/* Actions Menu */}
				<div className="absolute top-3 right-3 z-20">
					<DropdownMenu>
						<div onClick={(e) => {
							e.preventDefault()
							e.stopPropagation()
						}}>
							<DropdownMenuTrigger asChild>
								<Button
									variant="secondary"
									size="icon"
									className="h-8 w-8 bg-background/80 backdrop-blur-sm border shadow-sm"
								>
									<MoreVertical className="h-4 w-4" />
								</Button>
							</DropdownMenuTrigger>
						</div>
						<DropdownMenuContent align="end" className="w-48">
							<DropdownMenuItem onClick={handleEdit}>
								<Edit3 className="mr-2 h-4 w-4" />
								Редактировать
							</DropdownMenuItem>

							{status === ProjectStatus.ARCHIVED ? (
								<DropdownMenuItem onClick={handleRestore}>
									<RotateCcw className="mr-2 h-4 w-4" />
									Восстановить
								</DropdownMenuItem>
							) : (
								<DropdownMenuItem onClick={handleArchive}>
									<Archive className="mr-2 h-4 w-4" />
									В архив
								</DropdownMenuItem>
							)}

							<DropdownMenuItem
								onClick={handleDeleteClick}
								className="text-destructive focus:text-destructive"
							>
								<Trash2 className="mr-2 h-4 w-4" />
								Удалить
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>

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
						<div className="flex-1 min-w-0 pr-8">
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

			<AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Удалить проект?</AlertDialogTitle>
						<AlertDialogDescription>
							Это действие нельзя отменить. Проект «{name}» и все связанные с ним данные (сметы, задачи, отчеты) будут безвозвратно удалены.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel onClick={(e) => {
							e.stopPropagation()
						}}>Отмена</AlertDialogCancel>
						<AlertDialogAction
							onClick={(e) => {
								e.stopPropagation()
								handleDeleteConfirm()
							}}
							className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
						>
							Удалить
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	)
}



















