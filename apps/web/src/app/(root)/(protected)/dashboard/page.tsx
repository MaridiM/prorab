'use client'

import { useState, useMemo, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery } from '@apollo/client/react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import {
	Plus,
	Search,
	ChevronDown,
	MapPin,
	TrendingUp,
	TrendingDown,
	Crown,
	Users,
	FolderKanban,
	Wallet,
	Camera,
	Calendar,
	Building2,
	ArrowRight,
	Check,
	Sparkles,
	Receipt,
	X,
	Clock,
	ImageIcon,
	MoreHorizontal,
	Eye,
	EyeOff,
	AlertCircle,
	CheckCircle2,
	Shield,
} from 'lucide-react'

import {
	MyTeamsDocument,
	ProjectsByTeamDocument,
	ProjectStatsDocument,
	ExpensesByProjectDocument,
	ProjectPhotoReportsDocument,
	MySubscriptionDocument,
} from '@/packages/api/graphql'
import { useAuth } from '@/packages/libs/auth'
import { Button, Skeleton, Badge, ProgressBar, UserMenu, TrialStatusWidget } from '@/packages/components'
import { PageLoader, Spinner } from '@/packages/components/ui/spinner'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/packages/components/ui/tabs'
import { UpgradeWidget } from '@/packages/components/subscription/upgrade-widget'
import { UpgradeButton } from '@/packages/components/subscription/upgrade-button'
import { ProjectStatus } from '@/packages/schemas'
import { useToast } from '@/packages/hooks'
import { cn, isAuthError, handleAuthError } from '@/packages/utils'

// ============ Animation Variants ============
const fadeIn = {
	hidden: { opacity: 0, y: 20 },
	visible: {
		opacity: 1,
		y: 0,
		transition: { duration: 0.5, ease: [0.22, 0.61, 0.36, 1] as const },
	},
}

const stagger = {
	hidden: {},
	visible: {
		transition: { staggerChildren: 0.06 },
	},
}

const scaleIn = {
	hidden: { opacity: 0, scale: 0.95 },
	visible: {
		opacity: 1,
		scale: 1,
		transition: { duration: 0.4, ease: [0.22, 0.61, 0.36, 1] as const },
	},
}

const slideIn = {
	hidden: { opacity: 0, x: -20 },
	visible: {
		opacity: 1,
		x: 0,
		transition: { duration: 0.4, ease: [0.22, 0.61, 0.36, 1] as const },
	},
}

// ============ Helper Functions ============
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

const formatFullCurrency = (amount: number) => {
	return new Intl.NumberFormat('ru-RU', {
		style: 'currency',
		currency: 'RUB',
		maximumFractionDigits: 0,
	}).format(amount)
}

const formatDate = (date: string | null | undefined) => {
	if (!date) return null
	return new Date(date).toLocaleDateString('ru-RU', {
		day: 'numeric',
		month: 'short',
	})
}

const formatRelativeDate = (date: string) => {
	const now = new Date()
	const d = new Date(date)
	const diff = now.getTime() - d.getTime()
	const days = Math.floor(diff / (1000 * 60 * 60 * 24))

	if (days === 0) return 'Сегодня'
	if (days === 1) return 'Вчера'
	if (days < 7) return `${days} дн. назад`
	return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })
}

// ============ Types ============
interface Team {
	id: string
	name: string
	logoUrl?: string | null
	iconId?: string | null
	colorId?: string | null
	ownerId: string
}

interface Expense {
	id: string
	projectId: string
	amount: number
	category: string
	comment?: string | null
	photos: string[]
	createdAt: string
}

interface PhotoReport {
	id: string
	projectId: string
	title: string
	description?: string | null
	coverPhotoUrl?: string | null
	viewCount: number
	createdAt: string
	photos?: { id: string; thumbnailUrl?: string | null }[] | null
}

// ============ Constants ============
const COLORS: Record<string, string> = {
	orange: 'hsl(25, 40%, 90%)',
	blue: 'hsl(217, 35%, 88%)',
	green: 'hsl(142, 30%, 87%)',
	red: 'hsl(0, 35%, 88%)',
	purple: 'hsl(271, 35%, 89%)',
	yellow: 'hsl(48, 45%, 92%)',
	pink: 'hsl(330, 35%, 90%)',
	white: 'hsl(0, 0%, 98%)',
}

const ICONS: Record<string, string> = {
	hammer: '🔨',
	wrench: '🔧',
	construction: '🏗️',
	hardhat: '👷',
	brick: '🧱',
	tools: '🛠️',
	house: '🏠',
	building: '🏢',
	construction_zone: '🚧',
	bolt: '🔩',
}

const EXPENSE_CATEGORIES: Record<string, { label: string; icon: string; color: string }> = {
	materials: { label: 'Материалы', icon: '🧱', color: 'from-amber-500 to-orange-600' },
	labor: { label: 'Работа', icon: '👷', color: 'from-blue-500 to-indigo-600' },
	equipment: { label: 'Инструмент', icon: '🔧', color: 'from-emerald-500 to-teal-600' },
	transport: { label: 'Транспорт', icon: '🚛', color: 'from-violet-500 to-purple-600' },
	other: { label: 'Другое', icon: '📦', color: 'from-gray-500 to-slate-600' },
}

const QUICK_TIPS = [
	'Регулярно фотографируйте этапы работ — это поможет вести отчётность и избежать споров с заказчиком.',
	'Записывайте расходы сразу на месте — так вы ничего не забудете и сэкономите время на бухгалтерии.',
	'Делитесь фотоотчётами с клиентами через удобные ссылки — они оценят вашу открытость.',
	'Указывайте реалистичный бюджет — это поможет точнее рассчитать прибыль по каждому объекту.',
	'Используйте категории расходов — так легче понять, куда уходят деньги на объекте.',
	'Архивируйте завершённые объекты — так ваш дашборд останется чистым и понятным.',
	'Приглашайте участников бригады — они смогут добавлять расходы и фотоотчёты вместе с вами.',
]

// ============ Team Logo Component ============
function TeamLogo({ team, size = 'md' }: { team: Team; size?: 'sm' | 'md' | 'lg' }) {
	const sizeClass = size === 'sm' ? 'w-8 h-8' : size === 'lg' ? 'w-14 h-14' : 'w-10 h-10'
	const textSize = size === 'sm' ? 'text-base' : size === 'lg' ? 'text-2xl' : 'text-lg'

	if (team.logoUrl) {
		return (
			<div className={cn(sizeClass, 'rounded-xl overflow-hidden ring-2 ring-white/20 shadow-lg')}>
				<img
					src={team.logoUrl}
					alt={team.name}
					className="w-full h-full object-cover"
				/>
			</div>
		)
	}

	const bgColor = team.colorId ? COLORS[team.colorId] : COLORS.blue
	const emoji = team.iconId ? ICONS[team.iconId] : '🏗️'

	return (
		<div
			className={cn(sizeClass, 'rounded-xl flex items-center justify-center ring-2 ring-white/20 shadow-lg')}
			style={{ backgroundColor: bgColor }}
		>
			<span className={textSize}>{emoji}</span>
		</div>
	)
}

// ============ Stats Card Component ============
interface StatsCardProps {
	icon: React.ElementType
	label: string
	value: string
	subValue?: string
	gradient: string
	iconBg: string
	valueColor?: string
	trend?: 'up' | 'down' | null
	delay?: number
}

function StatsCard({ icon: Icon, label, value, subValue, gradient, iconBg, valueColor, trend, delay = 0 }: StatsCardProps) {
	return (
		<motion.div
			initial={{ opacity: 0, scale: 0.95 }}
			animate={{ opacity: 1, scale: 1 }}
			transition={{ duration: 0.4, delay }}
			className={cn(
				'relative p-5 rounded-2xl border border-border/30 overflow-hidden',
				'bg-card backdrop-blur-xl min-h-[140px] w-full',
				'hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 group',
				'flex flex-col'
			)}
		>
			{/* Gradient background */}
			<div className={cn(
				'absolute inset-0 opacity-40 bg-gradient-to-br',
				gradient
			)} />

			{/* Decorative circle */}
			<div className="absolute -right-4 -bottom-4 w-24 h-24 rounded-full bg-gradient-to-br from-white/5 to-transparent" />

			<div className="relative z-10 flex-1 flex flex-col">
				<div className="flex items-center justify-between mb-3">
					<div className={cn(
						'w-11 h-11 rounded-xl flex items-center justify-center',
						'text-white shadow-lg',
						iconBg
					)}>
						<Icon className="w-5 h-5" />
					</div>
					{trend && (
						<div className={cn(
							'flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full',
							trend === 'up' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-red-500/10 text-red-600'
						)}>
							{trend === 'up' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
						</div>
					)}
				</div>

				<div className="space-y-1 mt-auto">
					<p className="text-sm text-muted-foreground font-medium">{label}</p>
					<p className={cn('text-2xl font-bold tracking-tight', valueColor || 'text-foreground')}>
						{value}
					</p>
					{subValue && (
						<p className="text-xs text-muted-foreground opacity-80">
							{subValue}
						</p>
					)}
				</div>
			</div>
		</motion.div>
	)
}

// ============ Project Card Component ============
interface ProjectCardProps {
	id: string
	teamId: string
	name: string
	address?: string | null
	photoUrl?: string | null
	budget?: number | null
	progress: number
	status: string
	startDate?: string | null
	endDate?: string | null
	showFinancials?: boolean
	totalExpenses?: number
	profit?: number
}

function ProjectCard({
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
	showFinancials = false,
	totalExpenses = 0,
	profit = 0,
}: ProjectCardProps) {
	const isProfitable = profit >= 0
	const isArchived = status === ProjectStatus.ARCHIVED
	const isCompleted = status === ProjectStatus.COMPLETED

	const statusConfig: Record<string, { label: string; variant: 'success' | 'secondary' | 'warning'; icon: React.ElementType }> = {
		[ProjectStatus.ACTIVE]: { label: 'Активный', variant: 'success', icon: CheckCircle2 },
		[ProjectStatus.ARCHIVED]: { label: 'Архив', variant: 'secondary', icon: FolderKanban },
		[ProjectStatus.COMPLETED]: { label: 'Завершён', variant: 'warning', icon: Check },
	}

	const statusInfo = statusConfig[status] || { label: status, variant: 'secondary', icon: FolderKanban }

	return (
		<Link href={`/teams/${teamId}/projects/${id}`}>
			<motion.div
				whileHover={{ y: -4, transition: { duration: 0.2 } }}
				className={cn(
					'relative rounded-2xl border border-border/40 bg-card/80 backdrop-blur-xl overflow-hidden',
					'hover:border-primary/40 hover:shadow-2xl hover:shadow-primary/10',
					'transition-all duration-300 group cursor-pointer',
					isArchived && 'opacity-60'
				)}
			>
				{/* Gradient overlay on hover */}
				<div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-primary/5 via-transparent to-transparent" />

				{/* Shimmer effect */}
				<div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
					<div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-shimmer" />
				</div>

				<div className="relative z-10 p-5">
					{/* Header: Photo + Info */}
					<div className="flex gap-4 mb-4">
						{/* Project Photo */}
						<div className={cn(
							'w-16 h-16 rounded-2xl overflow-hidden shrink-0',
							'bg-gradient-to-br from-secondary to-muted',
							'ring-2 ring-border/30 shadow-lg'
						)}>
							{photoUrl ? (
								<img
									src={photoUrl}
									alt={name}
									className="w-full h-full object-cover"
								/>
							) : (
								<div className="w-full h-full flex items-center justify-center text-2xl bg-gradient-to-br from-primary/10 to-primary/5">
									🏗️
								</div>
							)}
						</div>

						{/* Name and Status */}
						<div className="flex-1 min-w-0">
							<div className="flex items-start justify-between gap-2 mb-1">
								<h3 className="font-semibold text-lg line-clamp-1 group-hover:text-primary transition-colors">
									{name}
								</h3>
								<Badge variant={statusInfo.variant} className="shrink-0 text-xs">
									{statusInfo.label}
								</Badge>
							</div>

							{/* Address */}
							{address && (
								<div className="flex items-center gap-1.5 text-sm text-muted-foreground">
									<MapPin className="w-3.5 h-3.5 shrink-0 text-primary/60" />
									<span className="line-clamp-1">{address}</span>
								</div>
							)}

							{/* Dates */}
							{(startDate || endDate) && (
								<div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-1">
									<Calendar className="w-3.5 h-3.5 shrink-0 text-primary/60" />
									<span>
										{formatDate(startDate) || '—'} — {formatDate(endDate) || '—'}
									</span>
								</div>
							)}
						</div>
					</div>

					{/* Progress Bar */}
					<div className="mb-4">
						<div className="flex items-center justify-between mb-1.5">
							<span className="text-xs text-muted-foreground font-medium">Прогресс</span>
							<span className={cn(
								"text-xs font-semibold",
								progress >= 75 ? "text-emerald-500" :
									progress >= 50 ? "text-amber-500" : "text-primary"
							)}>
								{progress}%
							</span>
						</div>
						<ProgressBar value={progress} size="sm" />
					</div>

					{/* Footer: Financials */}
					<div className="flex items-center justify-between pt-3 border-t border-border/30">
						{showFinancials && budget ? (
							<div className="flex items-center gap-3">
								<div className={cn(
									"w-9 h-9 rounded-xl flex items-center justify-center shadow-sm",
									isProfitable
										? "bg-emerald-500/10 text-emerald-500"
										: "bg-red-500/10 text-red-500"
								)}>
									{isProfitable ? (
										<TrendingUp className="w-4 h-4" />
									) : (
										<TrendingDown className="w-4 h-4" />
									)}
								</div>
								<div>
									<span
										className={cn(
											'font-bold text-sm',
											isProfitable
												? 'text-emerald-600 dark:text-emerald-400'
												: 'text-red-600 dark:text-red-400'
										)}
									>
										{isProfitable ? '+' : ''}
										{formatCurrency(profit)}
									</span>
									<p className="text-[10px] text-muted-foreground">
										{isCompleted ? 'итоговая прибыль' : 'текущая прибыль'}
									</p>
								</div>
							</div>
						) : budget ? (
							<div className="flex items-center gap-3">
								<div className="w-9 h-9 rounded-xl flex items-center justify-center bg-primary/10 text-primary shadow-sm">
									<Wallet className="w-4 h-4" />
								</div>
								<div>
									<span className="font-semibold text-sm">{formatCurrency(budget)}</span>
									<p className="text-[10px] text-muted-foreground">бюджет</p>
								</div>
							</div>
						) : (
							<div />
						)}

						{/* Arrow */}
						<div className="w-9 h-9 rounded-full flex items-center justify-center bg-secondary/50 group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
							<ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
						</div>
					</div>
				</div>
			</motion.div>
		</Link>
	)
}

// ============ Recent Expense Card ============
function RecentExpenseCard({ expense, projectName }: { expense: Expense; projectName: string }) {
	const category = EXPENSE_CATEGORIES[expense.category] || EXPENSE_CATEGORIES.other

	return (
		<div
			className="flex items-center gap-4 p-4 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-colors group"
		>
			<div className={cn(
				'w-10 h-10 rounded-xl flex items-center justify-center text-lg',
				'bg-gradient-to-br shadow-sm',
				category.color,
				'text-white'
			)}>
				{category.icon}
			</div>
			<div className="flex-1 min-w-0">
				<div className="flex items-center justify-between gap-2">
					<span className="font-semibold text-sm truncate">{category.label}</span>
					<span className="font-bold text-sm text-red-600 dark:text-red-400">
						-{formatCurrency(expense.amount)}
					</span>
				</div>
				<div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
					<span className="truncate">{projectName}</span>
					<span>•</span>
					<span className="shrink-0">{formatRelativeDate(expense.createdAt)}</span>
				</div>
			</div>
		</div>
	)
}

// ============ Recent Photo Report Card ============
function RecentPhotoReportCard({ report, projectName }: { report: PhotoReport; projectName: string }) {
	const photosCount = report.photos?.length || 0

	return (
		<div
			className="flex items-center gap-4 p-4 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-colors group cursor-pointer"
		>
			<div className={cn(
				'w-12 h-12 rounded-xl overflow-hidden',
				'bg-gradient-to-br from-violet-500/10 to-purple-500/5',
				'flex items-center justify-center shadow-sm ring-1 ring-border/30'
			)}>
				{report.coverPhotoUrl ? (
					<img
						src={report.coverPhotoUrl}
						alt={report.title}
						className="w-full h-full object-cover"
					/>
				) : (
					<ImageIcon className="w-5 h-5 text-violet-500" />
				)}
			</div>
			<div className="flex-1 min-w-0">
				<div className="flex items-center justify-between gap-2">
					<span className="font-semibold text-sm truncate">{report.title}</span>
					<div className="flex items-center gap-1.5 text-xs text-muted-foreground shrink-0">
						<Camera className="w-3 h-3" />
						{photosCount}
					</div>
				</div>
				<div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
					<span className="truncate">{projectName}</span>
					<span>•</span>
					<span className="shrink-0">{formatRelativeDate(report.createdAt)}</span>
				</div>
			</div>
		</div>
	)
}

// ============ Welcome Header Component ============
function WelcomeHeader({ userName, greeting }: { userName: string; greeting: string }) {
	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.5 }}
			className="mb-8"
		>
			<div className="flex items-center gap-3 mb-2">
				<div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-accent/20 to-amber-500/10 border border-accent/20">
					<Sparkles className="w-4 h-4 text-accent" />
					<span className="text-sm font-medium text-accent">ProRab.space</span>
				</div>
			</div>

			<h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">
				{greeting}, <span className="text-primary">{userName}</span>! 👋
			</h1>
			<p className="text-muted-foreground text-lg">
				Вот актуальная сводка по вашим объектам
			</p>
		</motion.div>
	)
}

// ============ Empty State Component ============
function EmptyState({
	icon: Icon,
	title,
	description,
	action
}: {
	icon: React.ElementType
	title: string
	description: string
	action?: { label: string; onClick: () => void }
}) {
	return (
		<motion.div
			variants={fadeIn}
			className="text-center py-12 rounded-2xl border-2 border-dashed border-border/50 bg-gradient-to-br from-secondary/20 to-secondary/5"
		>
			<div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mx-auto mb-4">
				<Icon className="w-8 h-8 text-primary/60" />
			</div>
			<h3 className="text-lg font-semibold mb-1">{title}</h3>
			<p className="text-muted-foreground text-sm mb-4 max-w-sm mx-auto">{description}</p>
			{action && (
				<Button onClick={action.onClick} size="sm" variant="outline">
					<Plus className="w-4 h-4 mr-2" />
					{action.label}
				</Button>
			)}
		</motion.div>
	)
}

// ============ Project Picker Modal ============
function ProjectPickerModal({
	projects,
	teamId,
	tab,
	onClose,
}: {
	projects: any[]
	teamId: string
	tab: 'expenses' | 'reports'
	onClose: () => void
}) {
	const router = useRouter()
	const title = tab === 'expenses' ? 'Выберите объект для расхода' : 'Выберите объект для фотоотчёта'

	// Block page scroll when modal is open
	useEffect(() => {
		document.body.style.overflow = 'hidden'
		return () => {
			document.body.style.overflow = 'unset'
		}
	}, [])

	return (
		<motion.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			exit={{ opacity: 0 }}
			className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
			onClick={onClose}
		>
			<motion.div
				initial={{ scale: 0.95, opacity: 0 }}
				animate={{ scale: 1, opacity: 1 }}
				exit={{ scale: 0.95, opacity: 0 }}
				onClick={(e) => e.stopPropagation()}
				className="w-full max-w-2xl bg-card border border-border/50 rounded-2xl shadow-2xl overflow-hidden"
			>
				<div className="p-4 border-b border-border/30">
					<div className="flex items-center justify-between">
						<h3 className="font-semibold">{title}</h3>
						<button onClick={onClose} className="p-1 hover:bg-secondary rounded-lg transition-colors">
							<X className="w-5 h-5" />
						</button>
					</div>
				</div>
				<div className="p-2 max-h-[600px] overflow-y-auto">
					{projects.map((project) => (
						<button
							key={project.id}
							onClick={() => {
								router.push(`/teams/${teamId}/projects/${project.id}?tab=${tab}`)
								onClose()
							}}
							className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-secondary/50 transition-colors text-left"
						>
							<div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center shrink-0">
								{project.photoUrl ? (
									<img src={project.photoUrl} alt={project.name} className="w-full h-full object-cover rounded-xl" />
								) : (
									<span className="text-lg">🏗️</span>
								)}
							</div>
							<div className="flex-1 min-w-0">
								<p className="font-medium truncate">{project.name}</p>
								{project.address && (
									<p className="text-xs text-muted-foreground truncate">{project.address}</p>
								)}
							</div>
							<ArrowRight className="w-4 h-4 text-muted-foreground" />
						</button>
					))}
				</div>
			</motion.div>
		</motion.div>
	)
}

// ============ FAB Menu Component ============
function FabMenu({
	onCreateProject,
	activeProjects,
	teamId,
	onOpenProjectPicker,
}: {
	onCreateProject: () => void
	activeProjects: any[]
	teamId: string | null
	onOpenProjectPicker: (tab: 'expenses' | 'reports') => void
}) {
	const [isOpen, setIsOpen] = useState(false)
	const menuRef = useRef<HTMLDivElement>(null)
	const router = useRouter()
	const { error: showError } = useToast()
	const hasActiveProject = activeProjects.length > 0

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
				setIsOpen(false)
			}
		}

		if (isOpen) {
			document.addEventListener('mousedown', handleClickOutside)
		}
		return () => document.removeEventListener('mousedown', handleClickOutside)
	}, [isOpen])

	const handleNavigateToProject = (tab: 'expenses' | 'reports') => {
		if (!hasActiveProject) {
			showError('Сначала создайте объект')
			return
		}

		if (activeProjects.length === 1 && teamId) {
			// Один проект — переходим сразу
			router.push(`/teams/${teamId}/projects/${activeProjects[0].id}?tab=${tab}`)
		} else {
			// Несколько проектов — открываем модальное окно выбора
			onOpenProjectPicker(tab)
		}
		setIsOpen(false)
	}

	const actions = [
		{
			id: 'project',
			icon: FolderKanban,
			label: 'Новый объект',
			gradient: 'from-blue-500 to-indigo-600',
			onClick: () => {
				onCreateProject()
				setIsOpen(false)
			},
		},
		{
			id: 'expense',
			icon: Wallet,
			label: 'Добавить расход',
			gradient: 'from-amber-500 to-orange-600',
			onClick: () => handleNavigateToProject('expenses'),
			disabled: !hasActiveProject,
		},
		{
			id: 'report',
			icon: Camera,
			label: 'Фотоотчёт',
			gradient: 'from-violet-500 to-purple-600',
			onClick: () => handleNavigateToProject('reports'),
			disabled: !hasActiveProject,
		},
	]

	return (
		<div ref={menuRef} className="fixed bottom-6 right-6 z-50">
			{/* Backdrop */}
			<AnimatePresence>
				{isOpen && (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						className="fixed inset-0 bg-background/60 backdrop-blur-sm"
						onClick={() => setIsOpen(false)}
					/>
				)}
			</AnimatePresence>

			{/* Actions */}
			<AnimatePresence>
				{isOpen && (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						transition={{ duration: 0.15 }}
						className="absolute bottom-16 right-0 flex flex-col gap-3 items-end mb-2"
					>
						{actions.map((action, index) => (
							<motion.button
								key={action.id}
								initial={{ opacity: 0, x: 20, scale: 0.8 }}
								animate={{ opacity: 1, x: 0, scale: 1 }}
								exit={{ opacity: 0, x: 20, scale: 0.8 }}
								transition={{ delay: index * 0.05, duration: 0.2 }}
								onClick={action.onClick}
								disabled={action.disabled}
								className={cn(
									'flex items-center gap-3 pl-4 pr-2 py-2 rounded-full',
									'bg-card border border-border/50 shadow-xl shadow-black/10',
									'hover:shadow-2xl hover:border-primary/30 transition-all duration-200',
									action.disabled && 'opacity-50 cursor-not-allowed'
								)}
							>
								<span className="text-sm font-medium whitespace-nowrap">
									{action.label}
								</span>
								<div className={cn(
									'w-10 h-10 rounded-full flex items-center justify-center',
									'text-white shadow-lg bg-gradient-to-br',
									action.gradient
								)}>
									<action.icon className="w-5 h-5" />
								</div>
							</motion.button>
						))}
					</motion.div>
				)}
			</AnimatePresence>

			{/* Main Button */}
			<motion.button
				onClick={() => setIsOpen(!isOpen)}
				className={cn(
					'relative w-14 h-14 rounded-full flex items-center justify-center shadow-xl',
					'transition-all duration-300',
					isOpen
						? 'bg-secondary text-foreground'
						: 'bg-gradient-to-br from-primary to-blue-600 text-white hover:shadow-2xl hover:shadow-primary/25 hover:scale-105'
				)}
				whileTap={{ scale: 0.95 }}
			>
				<motion.div
					animate={{ rotate: isOpen ? 45 : 0 }}
					transition={{ duration: 0.2 }}
				>
					{isOpen ? <X className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
				</motion.div>

				{/* Pulse effect when closed */}
				{!isOpen && (
					<motion.div
						className="absolute inset-0 rounded-full bg-primary/30"
						animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
						transition={{ duration: 2, repeat: Infinity }}
					/>
				)}
			</motion.button>
		</div>
	)
}

// ============ Project Card with Real Stats ============
function ProjectCardWithStats({
	project,
	teamId,
	isOwner,
	showFinancials,
}: {
	project: any
	teamId: string
	isOwner: boolean
	showFinancials: boolean
}) {
	const { data: statsData } = useQuery(ProjectStatsDocument, {
		variables: { projectId: project.id },
		skip: !isOwner || !showFinancials || !project.id,
		fetchPolicy: 'cache-and-network',
	})

	const stats = statsData?.projectStats

	return (
		<ProjectCard
			id={project.id}
			teamId={teamId}
			name={project.name}
			address={project.address}
			photoUrl={project.photoUrl}
			budget={project.budget}
			progress={project.progress || 0}
			status={project.status}
			startDate={project.startDate}
			endDate={project.endDate}
			showFinancials={showFinancials && isOwner}
			totalExpenses={stats?.totalExpenses || 0}
			profit={stats?.profit || (project.budget ? project.budget * 0.35 : 0)}
		/>
	)
}

// ============ Dashboard Aggregate Stats Component ============
// This component fetches stats for a single project and passes them up via callback
function ProjectStatsLoader({
	projectId,
	isOwner,
	onStatsLoaded
}: {
	projectId: string
	isOwner: boolean
	onStatsLoaded: (projectId: string, stats: any) => void
}) {
	const { data } = useQuery(ProjectStatsDocument, {
		variables: { projectId },
		skip: !isOwner || !projectId,
		fetchPolicy: 'cache-and-network',
	})

	useEffect(() => {
		if (data?.projectStats) {
			onStatsLoaded(projectId, data.projectStats)
		}
	}, [data, projectId, onStatsLoaded])

	return null
}

// ============ Activity Loader Component ============
// Loads expenses and photo reports for a single project and passes them up
function ActivityLoader({
	projectId,
	onExpensesLoaded,
	onReportsLoaded,
}: {
	projectId: string
	onExpensesLoaded: (projectId: string, expenses: Expense[]) => void
	onReportsLoaded: (projectId: string, reports: PhotoReport[]) => void
}) {
	const expensesLoadedRef = useRef(false)
	const reportsLoadedRef = useRef(false)

	const { data: expensesData, error: expensesError, loading: expensesLoading } = useQuery(ExpensesByProjectDocument, {
		variables: { projectId },
		skip: !projectId,
		fetchPolicy: 'cache-and-network',
	})

	const { data: reportsData, error: reportsError, loading: reportsLoading } = useQuery(ProjectPhotoReportsDocument, {
		variables: { projectId },
		skip: !projectId,
		fetchPolicy: 'cache-and-network',
	})

	// Reset refs when projectId changes
	useEffect(() => {
		expensesLoadedRef.current = false
		reportsLoadedRef.current = false
	}, [projectId])

	useEffect(() => {
		if (expensesData?.expensesByProject && !expensesLoading && !expensesLoadedRef.current) {
			expensesLoadedRef.current = true
			onExpensesLoaded(projectId, expensesData.expensesByProject as Expense[])
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [expensesData?.expensesByProject, projectId, expensesLoading])

	useEffect(() => {
		if (reportsData?.projectPhotoReports && !reportsLoading && !reportsLoadedRef.current) {
			reportsLoadedRef.current = true
			onReportsLoaded(projectId, reportsData.projectPhotoReports as PhotoReport[])
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [reportsData?.projectPhotoReports, projectId, reportsLoading])

	return null
}

// ============ Main Dashboard Component ============
export default function DashboardPage() {
	const router = useRouter()
	const { user } = useAuth()
	const { error: showError } = useToast()

	// State
	const [currentTeamId, setCurrentTeamId] = useState<string | null>(null)
	const [searchQuery, setSearchQuery] = useState('')
	const [activeTab, setActiveTab] = useState<'active' | 'archived'>('active')
	const [sortBy, setSortBy] = useState<'default' | 'name' | 'date' | 'status'>('default')
	const [showCompleted, setShowCompleted] = useState(false) // По умолчанию скрываем завершенные проекты
	const [teamDropdownOpen, setTeamDropdownOpen] = useState(false)
	const [projectStatsMap, setProjectStatsMap] = useState<Map<string, any>>(new Map())
	const [projectPickerTab, setProjectPickerTab] = useState<'expenses' | 'reports' | null>(null)
	const [allExpenses, setAllExpenses] = useState<Map<string, Expense[]>>(new Map())
	const [allReports, setAllReports] = useState<Map<string, PhotoReport[]>>(new Map())
	const dropdownRef = useRef<HTMLDivElement>(null)

	// Random tip (selected once on mount)
	const dailyTip = useMemo(() => {
		return QUICK_TIPS[Math.floor(Math.random() * QUICK_TIPS.length)]
	}, [])

	// Get greeting based on time
	const greeting = useMemo(() => {
		const hour = new Date().getHours()
		if (hour < 6) return 'Доброй ночи'
		if (hour < 12) return 'Доброе утро'
		if (hour < 18) return 'Добрый день'
		return 'Добрый вечер'
	}, [])

	// Load teams
	const {
		data: teamsData,
		loading: teamsLoading,
		error: teamsError,
		refetch: refetchTeams,
	} = useQuery(MyTeamsDocument, {
		fetchPolicy: 'cache-and-network',
	})

	const teams = (teamsData?.myTeams || []) as Team[]

	// Check for authentication errors and redirect
	useEffect(() => {
		if (teamsError && isAuthError(teamsError)) {
			// Session not found, expired, deleted, or invalid - clear cookies and redirect
			// handleAuthError has built-in protection against multiple redirects
			handleAuthError('/auth/login');
		}
	}, [teamsError]);

	// Set default team
	useEffect(() => {
		if (teams.length > 0 && !currentTeamId) {
			const ownedTeam = teams.find(t => t.ownerId === user?.id)
			setCurrentTeamId(ownedTeam?.id || teams[0].id)
		}
	}, [teams, currentTeamId, user?.id])

	// Close dropdown on click outside
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
				setTeamDropdownOpen(false)
			}
		}

		if (teamDropdownOpen) {
			document.addEventListener('mousedown', handleClickOutside)
			return () => document.removeEventListener('mousedown', handleClickOutside)
		}
	}, [teamDropdownOpen])

	const currentTeam = teams.find(t => t.id === currentTeamId)
	const isOwner = currentTeam?.ownerId === user?.id

	// Load subscription
	const {
		data: subscriptionData,
		loading: subscriptionLoading,
	} = useQuery(MySubscriptionDocument, {
		fetchPolicy: 'cache-and-network',
	})

	const subscription = subscriptionData?.mySubscription || null

	// Load projects
	const {
		data: projectsData,
		loading: projectsLoading,
	} = useQuery(ProjectsByTeamDocument, {
		variables: { teamId: currentTeamId || '', filter: null },
		skip: !currentTeamId,
		fetchPolicy: 'cache-and-network',
	})

	const allProjects = projectsData?.projectsByTeam || []

	// Filter projects
	const filteredProjects = useMemo(() => {
		if (!searchQuery) return allProjects

		const query = searchQuery.toLowerCase()
		return allProjects.filter(
			p =>
				p?.name?.toLowerCase().includes(query) ||
				p?.address?.toLowerCase().includes(query)
		)
	}, [allProjects, searchQuery])

	// Separate active and archived
	// Filter completed projects based on showCompleted state
	const allActiveProjects = filteredProjects.filter(
		p => {
			if (p?.status === ProjectStatus.ACTIVE) return true
			if (p?.status === ProjectStatus.COMPLETED) return showCompleted
			return false
		}
	)
	const archivedProjects = filteredProjects.filter(
		p => p?.status === ProjectStatus.ARCHIVED
	)

	// Smart sorting: active/incomplete first, then completed
	const activeProjects = useMemo(() => {
		const sorted = [...allActiveProjects].sort((a, b) => {
			// First sort by status: ACTIVE first, then COMPLETED
			if (a.status === ProjectStatus.ACTIVE && b.status === ProjectStatus.COMPLETED) return -1
			if (a.status === ProjectStatus.COMPLETED && b.status === ProjectStatus.ACTIVE) return 1

			// Then apply additional sorting if specified
			if (sortBy === 'name') {
				return (a.name || '').localeCompare(b.name || '', 'ru')
			}
			if (sortBy === 'date') {
				const dateA = a.startDate ? new Date(a.startDate).getTime() : 0
				const dateB = b.startDate ? new Date(b.startDate).getTime() : 0
				return dateB - dateA // Newest first
			}
			if (sortBy === 'status') {
				return (a.status || '').localeCompare(b.status || '', 'ru')
			}

			// Default: keep original order (already sorted by status above)
			return 0
		})
		return sorted
	}, [allActiveProjects, sortBy, showCompleted])

	// Sort archived projects
	const sortedArchivedProjects = useMemo(() => {
		const sorted = [...archivedProjects].sort((a, b) => {
			if (sortBy === 'name') {
				return (a.name || '').localeCompare(b.name || '', 'ru')
			}
			if (sortBy === 'date') {
				const dateA = a.archivedAt ? new Date(a.archivedAt).getTime() : (a.updatedAt ? new Date(a.updatedAt).getTime() : 0)
				const dateB = b.archivedAt ? new Date(b.archivedAt).getTime() : (b.updatedAt ? new Date(b.updatedAt).getTime() : 0)
				return dateB - dateA // Newest first
			}
			return 0
		})
		return sorted
	}, [archivedProjects, sortBy])

	// Track loaded projects for loading state
	const [loadedProjects, setLoadedProjects] = useState<Set<string>>(new Set())

	// Callback to handle activity data from individual projects
	const handleExpensesLoaded = useCallback((projectId: string, expenses: Expense[]) => {
		setAllExpenses(prev => {
			// Skip if already loaded to prevent infinite loops
			if (prev.has(projectId)) return prev
			const newMap = new Map(prev)
			newMap.set(projectId, expenses)
			return newMap
		})
		setLoadedProjects(prev => {
			// Skip if already marked as loaded
			if (prev.has(`${projectId}-expenses`)) return prev
			return new Set(prev).add(`${projectId}-expenses`)
		})
	}, [])

	const handleReportsLoaded = useCallback((projectId: string, reports: PhotoReport[]) => {
		setAllReports(prev => {
			// Skip if already loaded to prevent infinite loops
			if (prev.has(projectId)) return prev
			const newMap = new Map(prev)
			newMap.set(projectId, reports)
			return newMap
		})
		setLoadedProjects(prev => {
			// Skip if already marked as loaded
			if (prev.has(`${projectId}-reports`)) return prev
			return new Set(prev).add(`${projectId}-reports`)
		})
	}, [])

	// Check if expenses and reports are loading
	// Show loading if projects are still loading OR if we have projects but data is not loaded yet
	const isLoadingExpenses = useMemo(() => {
		// If projects are still loading, show skeleton
		if (projectsLoading) return true
		// If no projects, don't show loading
		if (activeProjects.length === 0) return false
		// If we have projects, check if all are loaded
		return activeProjects.some(project => !loadedProjects.has(`${project.id}-expenses`))
	}, [activeProjects, loadedProjects, projectsLoading])

	const isLoadingReports = useMemo(() => {
		// If projects are still loading, show skeleton
		if (projectsLoading) return true
		// If no projects, don't show loading
		if (activeProjects.length === 0) return false
		// If we have projects, check if all are loaded
		return activeProjects.some(project => !loadedProjects.has(`${project.id}-reports`))
	}, [activeProjects, loadedProjects, projectsLoading])

	// Aggregate and sort recent expenses from all projects (last 3)
	const recentExpenses = useMemo(() => {
		const allExpensesList: Expense[] = []
		allExpenses.forEach((expenses) => {
			allExpensesList.push(...expenses)
		})
		return allExpensesList
			.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
			.slice(0, 3)
	}, [allExpenses])

	// Aggregate and sort recent photo reports from all projects (last 3)
	const recentReports = useMemo(() => {
		const allReportsList: PhotoReport[] = []
		allReports.forEach((reports) => {
			allReportsList.push(...reports)
		})
		return allReportsList
			.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
			.slice(0, 3)
	}, [allReports])

	// Create a map of projectId -> projectName for displaying in recent cards
	const projectNameMap = useMemo(() => {
		const map = new Map<string, string>()
		allProjects.forEach(project => {
			if (project?.id && project?.name) {
				map.set(project.id, project.name)
			}
		})
		return map
	}, [allProjects])

	// Callback to handle stats loaded from individual projects
	const handleStatsLoaded = useCallback((projectId: string, stats: any) => {
		setProjectStatsMap(prev => {
			const newMap = new Map(prev)
			newMap.set(projectId, stats)
			return newMap
		})
	}, [])

	// Calculate aggregate stats from all loaded project stats
	const stats = useMemo(() => {
		const totalBudget = activeProjects.reduce((sum, p) => sum + (p?.budget || 0), 0)

		// Sum up expenses and profit from all project stats
		let totalExpenses = 0
		let totalProfit = 0

		activeProjects.forEach(project => {
			const projectStats = projectStatsMap.get(project.id)
			if (projectStats) {
				totalExpenses += projectStats.totalExpenses || 0
				totalProfit += projectStats.profit || 0
			}
		})

		// If no stats loaded yet (initial load), use estimation
		const hasStats = projectStatsMap.size > 0
		if (!hasStats && totalBudget > 0) {
			totalExpenses = totalBudget * 0.65
			totalProfit = totalBudget - totalExpenses
		}

		return {
			totalBudget,
			totalExpenses,
			profit: totalProfit,
			activeCount: activeProjects.length,
			isProfitable: totalProfit >= 0,
			loading: false,
		}
	}, [activeProjects, projectStatsMap])

	// Reset loading state when team changes (not when projects list changes to avoid infinite loops)
	useEffect(() => {
		setLoadedProjects(new Set())
		setAllExpenses(new Map())
		setAllReports(new Map())
	}, [currentTeamId])

	// Handlers
	const handleTeamChange = (teamId: string) => {
		setCurrentTeamId(teamId)
		setSearchQuery('')
		setTeamDropdownOpen(false)
	}

	const handleCreateProject = () => {
		if (currentTeamId) {
			router.push(`/teams/${currentTeamId}/projects/new`)
		} else {
			showError('Сначала выберите команду')
		}
	}

	// Loading state
	if (teamsLoading && !teamsData) {
		return <PageLoader text="Загрузка..." />
	}

	// Error state
	if (teamsError) {
		// Check if it's an authentication error (session not found, expired, deleted, or invalid)
		const authError = isAuthError(teamsError);
		const errorMessage = teamsError.message || '';
		const isNetworkError = errorMessage === 'Failed to fetch' ||
			errorMessage.includes('Failed to fetch');

		const displayMessage = isNetworkError
			? 'Не удалось подключиться к серверу. Проверьте, что API сервер запущен на порту 8080.'
			: authError
				? 'Сессия истекла или недействительна'
				: errorMessage || 'Произошла ошибка при загрузке данных';

		return (
			<div className="min-h-screen bg-background flex items-center justify-center p-4">
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					className="text-center max-w-md"
				>
					<div className="w-20 h-20 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-6">
						<AlertCircle className="w-10 h-10 text-red-500" />
					</div>
					<h2 className="text-2xl font-bold mb-3">Ошибка загрузки</h2>
					<p className="text-muted-foreground mb-2">{displayMessage}</p>
					{isNetworkError && teamsError.message && (
						<p className="text-sm text-muted-foreground/70 mb-6 font-mono bg-muted/50 p-2 rounded">
							{teamsError.message}
						</p>
					)}
					<div className="flex flex-col gap-2 mb-4">
						{!authError && (
							<Button
								onClick={() => refetchTeams()}
								size="lg"
							>
								Попробовать снова
							</Button>
						)}
						{authError && (
							<Button
								onClick={() => handleAuthError('/auth/login')}
								size="lg"
							>
								Войти снова
							</Button>
						)}
						{isNetworkError && (
							<Button
								onClick={() => window.location.reload()}
								variant="outline"
								size="lg"
							>
								Перезагрузить страницу
							</Button>
						)}
					</div>
					{isNetworkError && (
						<div className="mt-6 p-4 bg-muted/30 rounded-lg text-left">
							<p className="text-sm font-semibold mb-2">Возможные причины:</p>
							<ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
								<li>API сервер не запущен (проверьте порт 8080)</li>
								<li>Проблема с CORS настройками</li>
								<li>Проблемы с сетью или файрволом</li>
								<li>Неправильный URL сервера в настройках</li>
							</ul>
							{process.env.NODE_ENV === 'development' && (
								<p className="text-xs text-muted-foreground mt-3 pt-3 border-t">
									<strong>Для разработки:</strong> Запустите API сервер командой <code className="bg-background px-1 rounded">pnpm --filter api dev</code>
								</p>
							)}
						</div>
					)}
				</motion.div>
			</div>
		)
	}

	// No teams state
	if (teams.length === 0) {
		const isAdmin = user?.adminRole

		return (
			<div className="min-h-screen bg-background flex flex-col items-center justify-center relative p-4">
				{/* Back Button (Left) */}
				<div className="absolute top-4 left-4 md:top-6 md:left-6">
					<Button
						variant="ghost"
						size="sm"
						onClick={() => router.push('/')}
						className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
					>
						<ArrowRight className="w-4 h-4 rotate-180" />
						<span className="hidden sm:inline">На главную</span>
					</Button>
				</div>

				{/* User Menu (Right) */}
				<div className="absolute top-4 right-4 md:top-6 md:right-6">
					<UserMenu />
				</div>

				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					className="text-center max-w-md w-full"
				>
					<div className="relative w-24 h-24 mx-auto mb-8">
						<div className="absolute inset-0 bg-gradient-to-br from-primary to-blue-600 rounded-3xl rotate-6 opacity-20 blur-xl" />
						<div className="absolute inset-0 bg-gradient-to-br from-primary to-blue-600 rounded-3xl rotate-6" />
						<div className="absolute inset-0 bg-card rounded-3xl flex items-center justify-center shadow-xl border border-border/50">
							<Building2 className="w-12 h-12 text-primary" />
						</div>
					</div>
					<h2 className="text-3xl font-bold mb-3 tracking-tight">Добро пожаловать!</h2>
					<p className="text-muted-foreground text-lg mb-8 leading-relaxed">
						Создайте свою первую бригаду, чтобы начать вести учёт объектов и расходов
					</p>
					<div className="flex flex-col sm:flex-row gap-3 justify-center w-full sm:w-auto">
						<Button
							onClick={() => router.push('/onboarding')}
							size="lg"
							className="bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 shadow-lg shadow-primary/25 w-full sm:w-auto"
						>
							<Plus className="w-5 h-5 mr-2" />
							Создать бригаду
						</Button>
						{isAdmin && (
							<Button
								onClick={() => router.push('/admin')}
								size="lg"
								variant="outline"
								className="border-2 border-primary/20 hover:border-primary/40 hover:bg-primary/5 shadow-lg w-full sm:w-auto"
							>
								<Shield className="w-5 h-5 mr-2" />
								Войти в админ панель
							</Button>
						)}
					</div>
				</motion.div>
			</div>
		)
	}

	return (
		<div className="min-h-screen bg-background pb-24">
			{/* Hidden components to load stats for each active project */}
			{isOwner && activeProjects.map(project => (
				<ProjectStatsLoader
					key={project.id}
					projectId={project.id}
					isOwner={isOwner}
					onStatsLoaded={handleStatsLoaded}
				/>
			))}

			{/* Hidden components to load activity (expenses, reports) for each active project */}
			{activeProjects.map(project => (
				<ActivityLoader
					key={`activity-${project.id}`}
					projectId={project.id}
					onExpensesLoaded={handleExpensesLoaded}
					onReportsLoaded={handleReportsLoaded}
				/>
			))}

			{/* Project Picker Modal */}
			<AnimatePresence>
				{projectPickerTab && currentTeamId && (
					<ProjectPickerModal
						projects={activeProjects}
						teamId={currentTeamId}
						tab={projectPickerTab}
						onClose={() => setProjectPickerTab(null)}
					/>
				)}
			</AnimatePresence>

			{/* Header */}
			<motion.header
				initial={{ opacity: 0, y: -20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5 }}
				className="sticky top-0 z-40 border-b border-border/30 bg-card/80 backdrop-blur-xl"
			>
				<div className="w-full max-w-[1920px] mx-auto px-4 py-3">
					<div className="flex items-center justify-between">
						{/* Logo + Team Switcher */}
						<div className="flex items-center gap-4">
							{/* App Logo */}
							<Link href="/dashboard" className="flex items-center gap-2 shrink-0">
								<div className="h-10 w-10 rounded-xl bg-gradient-to-br from-accent to-amber-500 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-accent/30">
									PR
								</div>
								<span className="font-bold text-lg hidden sm:block">ProRab</span>
							</Link>

							{/* Divider */}
							<div className="h-8 w-px bg-border/50 hidden sm:block" />

							{/* Team Switcher */}
							<div className="relative" ref={dropdownRef}>
								<button
									onClick={() => setTeamDropdownOpen(!teamDropdownOpen)}
									className={cn(
										'flex items-center gap-3 px-3 py-2 rounded-xl',
										'bg-secondary/50 border border-border/30',
										'hover:border-primary/30 hover:bg-secondary/80 transition-all duration-200'
									)}
								>
									{currentTeam && <TeamLogo team={currentTeam} size="sm" />}
									<div className="text-left hidden sm:block">
										<div className="flex items-center gap-1.5">
											<span className="font-medium text-sm">{currentTeam?.name || 'Бригада'}</span>
											{isOwner && <Crown className="w-3.5 h-3.5 text-amber-500" />}
										</div>
									</div>
									{teams.length > 1 && (
										<ChevronDown
											className={cn(
												'w-4 h-4 text-muted-foreground transition-transform',
												teamDropdownOpen && 'rotate-180'
											)}
										/>
									)}
								</button>

								{/* Team Dropdown */}
								<AnimatePresence>
									{teamDropdownOpen && teams.length > 1 && (
										<motion.div
											initial={{ opacity: 0, y: -10, scale: 0.95 }}
											animate={{ opacity: 1, y: 0, scale: 1 }}
											exit={{ opacity: 0, y: -10, scale: 0.95 }}
											transition={{ duration: 0.15 }}
											className="absolute top-full left-0 mt-2 w-72 bg-card border border-border/50 rounded-2xl shadow-xl shadow-black/10 overflow-hidden z-50"
										>
											<div className="p-2">
												<div className="px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
													Ваши бригады
												</div>
												{teams.map(team => (
													<button
														key={team.id}
														onClick={() => handleTeamChange(team.id)}
														className={cn(
															'w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all',
															team.id === currentTeamId
																? 'bg-primary/10 text-primary'
																: 'hover:bg-secondary/50'
														)}
													>
														<TeamLogo team={team} size="sm" />
														<div className="flex-1 text-left">
															<div className="flex items-center gap-2">
																<span className="font-medium">{team.name}</span>
																{team.ownerId === user?.id && (
																	<Crown className="w-3.5 h-3.5 text-amber-500" />
																)}
															</div>
															<span className="text-xs text-muted-foreground">
																{team.ownerId === user?.id ? 'Владелец' : 'Участник'}
															</span>
														</div>
														{team.id === currentTeamId && (
															<Check className="w-5 h-5 text-primary" />
														)}
													</button>
												))}
											</div>
										</motion.div>
									)}
								</AnimatePresence>
							</div>
						</div>

						{/* Actions */}
						<div className="flex items-center gap-3">
							{/* Upgrade Button */}
							<UpgradeButton />

							{user?.adminRole && (
								<Button
									variant="outline"
									onClick={() => router.push('/admin')}
									className="hidden md:flex items-center gap-2 border-primary/20 hover:border-primary/40 hover:bg-primary/5"
								>
									<Shield className="w-4 h-4" />
									<span>Админ панель</span>
								</Button>
							)}
							<Button
								variant="ghost"
								onClick={() => router.push('/teams')}
								className="hidden md:flex items-center gap-2"
							>
								<Users className="w-5 h-5" />
								<span>Мои команды</span>
							</Button>
							<UserMenu avatarSize="sm" />
						</div>
					</div>
				</div>
			</motion.header>

			{/* Main Content */}
			<main className="w-full max-w-[1920px] mx-auto px-4 py-6">
				<motion.div initial="hidden" animate="visible" variants={stagger}>
					{/* Welcome Header */}
					<WelcomeHeader
						userName={user?.fullName?.split(' ')[0] || 'Прораб'}
						greeting={greeting}
					/>

					{/* Trial Status Widget */}
					{subscription && (
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.5, delay: 0.1 }}
							className="mb-6"
						>
							<TrialStatusWidget subscription={subscription} />
						</motion.div>
					)}

					{/* Upgrade Widget (shows when usage > 70%) */}
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5, delay: 0.15 }}
						className="mb-6"
					>
						<UpgradeWidget />
					</motion.div>

					{/* Financial Stats (only for owner with projects) */}
					{isOwner && stats.totalBudget > 0 && (
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.5 }}
							className="mb-8 w-full"
						>
							<div className="grid grid-cols-2 lg:grid-cols-4 gap-4 w-full auto-rows-fr">
								<StatsCard
									icon={Wallet}
									label="Сумма договоров"
									value={formatCurrency(stats.totalBudget)}
									subValue={formatFullCurrency(stats.totalBudget)}
									gradient="from-blue-500/10 to-indigo-500/5"
									iconBg="bg-gradient-to-br from-blue-500 to-indigo-600"
									delay={0.1}
								/>
								<StatsCard
									icon={Receipt}
									label="Потрачено"
									value={formatCurrency(stats.totalExpenses)}
									subValue={formatFullCurrency(stats.totalExpenses)}
									gradient="from-amber-500/10 to-orange-500/5"
									iconBg="bg-gradient-to-br from-amber-500 to-orange-600"
									valueColor="text-amber-600 dark:text-amber-400"
									delay={0.2}
								/>
								<StatsCard
									icon={stats.isProfitable ? TrendingUp : TrendingDown}
									label={stats.isProfitable ? 'Прибыль' : 'Убыток'}
									value={formatCurrency(Math.abs(stats.profit))}
									subValue={`${Math.abs((stats.profit / stats.totalBudget) * 100).toFixed(1)}% от бюджета`}
									gradient={stats.isProfitable ? 'from-emerald-500/10 to-teal-500/5' : 'from-red-500/10 to-rose-500/5'}
									iconBg={stats.isProfitable ? 'bg-gradient-to-br from-emerald-500 to-teal-600' : 'bg-gradient-to-br from-red-500 to-rose-600'}
									valueColor={stats.isProfitable ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}
									trend={stats.isProfitable ? 'up' : 'down'}
									delay={0.3}
								/>
								<StatsCard
									icon={Building2}
									label="Активных объектов"
									value={String(stats.activeCount)}
									subValue={stats.activeCount === 1 ? '1 объект' : stats.activeCount >= 2 && stats.activeCount <= 4 ? `${stats.activeCount} объекта` : `${stats.activeCount} объектов`}
									gradient="from-violet-500/10 to-purple-500/5"
									iconBg="bg-gradient-to-br from-violet-500 to-purple-600"
									delay={0.4}
								/>
							</div>
						</motion.div>
					)}

					{/* Two Column Layout: Projects + Sidebar */}
					<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
						{/* Main Column: Projects */}
						<div className="lg:col-span-2">
							{/* Search */}
							<motion.div
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.5, delay: 0.1 }}
								className="mb-6"
							>
								<div className="relative">
									<Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
									<input
										type="text"
										placeholder="Поиск по названию или адресу..."
										value={searchQuery}
										onChange={e => setSearchQuery(e.target.value)}
										className={cn(
											'w-full h-12 pl-11 pr-4 rounded-2xl border border-border/50 bg-card/80 backdrop-blur-xl text-sm',
											'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all',
											'placeholder:text-muted-foreground/60'
										)}
									/>
								</div>
							</motion.div>

							{/* Projects Tabs */}
							<motion.section
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.5, delay: 0.2 }}
								className="mb-8"
							>
								<Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'active' | 'archived')} className="w-full">
									<div className="flex items-center justify-between mb-4">
										<TabsList className="inline-flex h-10 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground">
											<TabsTrigger
												value="active"
												className="inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
											>
												<span className="w-2 h-2 rounded-full bg-emerald-500 mr-2" />
												Активные объекты
												{activeProjects.length > 0 && (
													<span className="ml-2 text-xs text-muted-foreground">
														({activeProjects.length})
													</span>
												)}
											</TabsTrigger>
											{archivedProjects.length > 0 && (
												<TabsTrigger
													value="archived"
													className="inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
												>
													<span className="w-2 h-2 rounded-full bg-muted-foreground mr-2" />
													Архив
													<span className="ml-2 text-xs text-muted-foreground">
														({archivedProjects.length})
													</span>
												</TabsTrigger>
											)}
										</TabsList>
										<div className="flex items-center gap-2">
											{/* Toggle completed projects */}
											{activeTab === 'active' && (
												<Button
													variant="ghost"
													size="sm"
													onClick={() => setShowCompleted(!showCompleted)}
													className="text-muted-foreground hover:text-foreground"
													title={showCompleted ? 'Скрыть завершенные проекты' : 'Показать завершенные проекты'}
												>
													{showCompleted ? (
														<>
															<EyeOff className="w-4 h-4 mr-1" />
															Скрыть завершенные
														</>
													) : (
														<>
															<Eye className="w-4 h-4 mr-1" />
															Показать завершенные
														</>
													)}
												</Button>
											)}
											{/* Sort dropdown */}
											<select
												value={sortBy}
												onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
												className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
											>
												<option value="default">По умолчанию</option>
												<option value="name">По названию</option>
												<option value="date">По дате</option>
												<option value="status">По статусу</option>
											</select>
											<Button
												variant="ghost"
												size="sm"
												onClick={handleCreateProject}
												className="text-primary hover:text-primary/80"
											>
												<Plus className="w-4 h-4 mr-1" />
												Добавить
											</Button>
										</div>
									</div>

									<TabsContent value="active" className="mt-4">
										{projectsLoading && !projectsData ? (
											<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
												{Array.from({ length: 4 }).map((_, i) => (
													<div
														key={i}
														className="rounded-2xl border border-border/40 bg-card/80 backdrop-blur-xl p-5"
													>
														<div className="flex gap-4 mb-4">
															<Skeleton className="w-16 h-16 rounded-2xl" />
															<div className="flex-1 space-y-2">
																<div className="flex items-start justify-between gap-2">
																	<Skeleton className="h-5 w-32" />
																	<Skeleton className="h-5 w-16 rounded-full" />
																</div>
																<Skeleton className="h-4 w-40" />
																<Skeleton className="h-4 w-36" />
															</div>
														</div>
														<div className="mb-4">
															<div className="flex items-center justify-between mb-1.5">
																<Skeleton className="h-3 w-16" />
																<Skeleton className="h-3 w-12" />
															</div>
															<Skeleton className="h-2 w-full rounded-full" />
														</div>
														<div className="flex items-center justify-between pt-3 border-t border-border/30">
															<div className="flex items-center gap-3">
																<Skeleton className="w-9 h-9 rounded-xl" />
																<div className="space-y-1">
																	<Skeleton className="h-4 w-20" />
																	<Skeleton className="h-3 w-24" />
																</div>
															</div>
														</div>
													</div>
												))}
											</div>
										) : activeProjects.length > 0 ? (
											<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
												{activeProjects.map(project => {
													if (!project?.id) return null
													return (
														<ProjectCardWithStats
															key={project.id}
															project={project}
															teamId={currentTeamId || ''}
															isOwner={isOwner}
															showFinancials={isOwner}
														/>
													)
												})}
											</div>
										) : (
											<EmptyState
												icon={FolderKanban}
												title={searchQuery ? 'Объекты не найдены' : 'Пока нет объектов'}
												description={searchQuery
													? 'Попробуйте изменить поисковый запрос'
													: 'Создайте свой первый строительный объект и начните вести учёт'
												}
												action={!searchQuery ? { label: 'Создать объект', onClick: handleCreateProject } : undefined}
											/>
										)}
									</TabsContent>

									{archivedProjects.length > 0 && (
										<TabsContent value="archived" className="mt-4">
											{sortedArchivedProjects.length > 0 ? (
												<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
													{sortedArchivedProjects.map(project => {
														if (!project?.id) return null
														return (
															<ProjectCardWithStats
																key={project.id}
																project={project}
																teamId={currentTeamId || ''}
																isOwner={isOwner}
																showFinancials={isOwner}
															/>
														)
													})}
												</div>
											) : (
												<EmptyState
													icon={FolderKanban}
													title="Нет архивных объектов"
													description="Архивные объекты будут отображаться здесь"
												/>
											)}
										</TabsContent>
									)}
								</Tabs>
							</motion.section>
						</div>

						{/* Sidebar: Recent Activity */}
						<div className="lg:col-span-1 space-y-6">
							{/* Recent Expenses */}
							<motion.section initial="hidden" animate="visible" variants={fadeIn}>
								<div className="rounded-2xl border border-border/30 bg-card/80 backdrop-blur-xl overflow-hidden">
									<div className="p-4 border-b border-border/30">
										<div className="flex items-center justify-between">
											<h3 className="font-semibold flex items-center gap-2">
												<Receipt className="w-4 h-4 text-amber-500" />
												Последние расходы
											</h3>
											{!isLoadingExpenses && recentExpenses.length > 0 && (
												<span className="text-xs text-muted-foreground">
													{recentExpenses.length} записей
												</span>
											)}
										</div>
									</div>
									<div className="p-3 min-h-[200px]">
										{isLoadingExpenses ? (
											<div className="space-y-2">
												{Array.from({ length: 3 }).map((_, i) => (
													<div
														key={i}
														className="flex items-center gap-4 p-4 rounded-xl bg-secondary/30"
													>
														<Skeleton className="w-10 h-10 rounded-xl" />
														<div className="flex-1 space-y-2">
															<div className="flex items-center justify-between gap-2">
																<Skeleton className="h-4 w-32" />
																<Skeleton className="h-4 w-20" />
															</div>
															<div className="flex items-center gap-2">
																<Skeleton className="h-3 w-24" />
																<Skeleton className="h-3 w-1" />
																<Skeleton className="h-3 w-16" />
															</div>
														</div>
													</div>
												))}
											</div>
										) : recentExpenses.length > 0 ? (
											<>
												<div className="space-y-2">
													{recentExpenses.map((expense) => (
														<div
															key={expense.id}
															onClick={() => currentTeamId && router.push(`/teams/${currentTeamId}/projects/${expense.projectId}?tab=expenses`)}
															className="flex items-center gap-4 p-4 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-colors cursor-pointer group"
														>
															<div className={cn(
																'w-10 h-10 rounded-xl flex items-center justify-center text-lg',
																'bg-gradient-to-br shadow-sm',
																(EXPENSE_CATEGORIES[expense.category] || EXPENSE_CATEGORIES.other).color,
																'text-white'
															)}>
																{(EXPENSE_CATEGORIES[expense.category] || EXPENSE_CATEGORIES.other).icon}
															</div>
															<div className="flex-1 min-w-0">
																<div className="flex items-center justify-between gap-2">
																	<span className="font-semibold text-sm truncate">
																		{(EXPENSE_CATEGORIES[expense.category] || EXPENSE_CATEGORIES.other).label}
																	</span>
																	<span className="font-bold text-sm text-red-600 dark:text-red-400">
																		-{formatCurrency(expense.amount)}
																	</span>
																</div>
																<div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
																	<span className="truncate">{projectNameMap.get(expense.projectId) || 'Проект'}</span>
																	<span>•</span>
																	<span className="shrink-0">{formatRelativeDate(expense.createdAt)}</span>
																</div>
															</div>
														</div>
													))}
												</div>
												{currentTeamId && activeProjects.length > 0 && (
													<button
														onClick={() => {
															if (activeProjects.length === 1) {
																router.push(`/teams/${currentTeamId}/projects/${activeProjects[0].id}?tab=expenses`)
															} else {
																setProjectPickerTab('expenses')
															}
														}}
														className="w-full mt-3 px-4 py-2 text-xs font-medium text-primary hover:text-primary/80 transition-colors flex items-center justify-center gap-1.5"
													>
														<span>Все расходы</span>
														<ArrowRight className="w-3 h-3" />
													</button>
												)}
											</>
										) : (
											<div className="text-center py-8">
												<Receipt className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
												<p className="text-sm text-muted-foreground">Нет расходов</p>
												<p className="text-xs text-muted-foreground/60 mt-1">
													Добавьте расход в проекте
												</p>
											</div>
										)}
									</div>
								</div>
							</motion.section>

							{/* Recent Photo Reports */}
							<motion.section initial="hidden" animate="visible" variants={fadeIn}>
								<div className="rounded-2xl border border-border/30 bg-card/80 backdrop-blur-xl overflow-hidden">
									<div className="p-4 border-b border-border/30">
										<div className="flex items-center justify-between">
											<h3 className="font-semibold flex items-center gap-2">
												<Camera className="w-4 h-4 text-violet-500" />
												Фотоотчёты
											</h3>
											{!isLoadingReports && recentReports.length > 0 && (
												<span className="text-xs text-muted-foreground">
													{recentReports.length} отчётов
												</span>
											)}
										</div>
									</div>
									<div className="p-3 min-h-[200px]">
										{isLoadingReports ? (
											<div className="space-y-2">
												{Array.from({ length: 3 }).map((_, i) => (
													<div
														key={i}
														className="flex items-center gap-4 p-4 rounded-xl bg-secondary/30"
													>
														<Skeleton className="w-12 h-12 rounded-xl" />
														<div className="flex-1 space-y-2">
															<div className="flex items-center justify-between gap-2">
																<Skeleton className="h-4 w-40" />
																<Skeleton className="h-3 w-16" />
															</div>
															<div className="flex items-center gap-2">
																<Skeleton className="h-3 w-24" />
																<Skeleton className="h-3 w-1" />
																<Skeleton className="h-3 w-16" />
															</div>
														</div>
													</div>
												))}
											</div>
										) : recentReports.length > 0 ? (
											<>
												<div className="space-y-2">
													{recentReports.map((report) => {
														const photosCount = report.photos?.length || 0
														return (
															<div
																key={report.id}
																onClick={() => currentTeamId && router.push(`/teams/${currentTeamId}/projects/${report.projectId}?tab=reports&report=${report.id}`)}
																className="flex items-center gap-4 p-4 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-colors group cursor-pointer"
															>
																<div className={cn(
																	'w-12 h-12 rounded-xl overflow-hidden',
																	'bg-gradient-to-br from-violet-500/10 to-purple-500/5',
																	'flex items-center justify-center shadow-sm ring-1 ring-border/30'
																)}>
																	{report.coverPhotoUrl ? (
																		<img
																			src={report.coverPhotoUrl}
																			alt={report.title}
																			className="w-full h-full object-cover"
																		/>
																	) : (
																		<ImageIcon className="w-5 h-5 text-violet-500" />
																	)}
																</div>
																<div className="flex-1 min-w-0">
																	<div className="flex items-center justify-between gap-2">
																		<span className="font-semibold text-sm truncate">{report.title}</span>
																		<div className="flex items-center gap-1.5 text-xs text-muted-foreground shrink-0">
																			<Camera className="w-3 h-3" />
																			{photosCount}
																		</div>
																	</div>
																	<div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
																		<span className="truncate">{projectNameMap.get(report.projectId) || 'Проект'}</span>
																		<span>•</span>
																		<span className="shrink-0">{formatRelativeDate(report.createdAt)}</span>
																	</div>
																</div>
															</div>
														)
													})}
												</div>
												{currentTeamId && activeProjects.length > 0 && (
													<button
														onClick={() => {
															if (activeProjects.length === 1) {
																router.push(`/teams/${currentTeamId}/projects/${activeProjects[0].id}?tab=reports`)
															} else {
																setProjectPickerTab('reports')
															}
														}}
														className="w-full mt-3 px-4 py-2 text-xs font-medium text-primary hover:text-primary/80 transition-colors flex items-center justify-center gap-1.5"
													>
														<span>Все фотоотчёты</span>
														<ArrowRight className="w-3 h-3" />
													</button>
												)}
											</>
										) : (
											<div className="text-center py-8">
												<Camera className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
												<p className="text-sm text-muted-foreground">Нет фотоотчётов</p>
												<p className="text-xs text-muted-foreground/60 mt-1">
													Создайте отчёт в проекте
												</p>
											</div>
										)}
									</div>
								</div>
							</motion.section>

							{/* Quick Tips */}
							<motion.section initial="hidden" animate="visible" variants={fadeIn}>
								<div className="rounded-2xl border border-border/30 bg-gradient-to-br from-primary/5 to-blue-500/5 p-4">
									<div className="flex items-start gap-3">
										<div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
											<Sparkles className="w-5 h-5 text-primary" />
										</div>
										<div>
											<h4 className="font-semibold text-sm mb-1">Совет дня</h4>
											<p className="text-xs text-muted-foreground leading-relaxed">
												{dailyTip}
											</p>
										</div>
									</div>
								</div>
							</motion.section>
						</div>
					</div>
				</motion.div>
			</main>

			{/* FAB Menu */}
			<FabMenu
				onCreateProject={handleCreateProject}
				activeProjects={activeProjects}
				teamId={currentTeamId}
				onOpenProjectPicker={setProjectPickerTab}
			/>
		</div>
	)
}
