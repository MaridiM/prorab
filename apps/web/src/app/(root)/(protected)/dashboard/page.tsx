'use client'

import { useState, useMemo, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery } from '@apollo/client/react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import {
	Plus,
	Search,
	ChevronDown,
	ChevronUp,
	LogOut,
	Settings,
	MapPin,
	TrendingUp,
	TrendingDown,
	Crown,
	Users,
	FolderKanban,
	Wallet,
	Camera,
	MessageCircle,
	Calendar,
	Building2,
	ArrowRight,
	Check,
} from 'lucide-react'

import { MyTeamsDocument, ProjectsByTeamDocument } from '@/packages/api/graphql'
import { useAuth } from '@/packages/libs/auth'
import { Button, Skeleton, Badge, ProgressBar } from '@/packages/components'
import { ProjectStatus } from '@/packages/schemas'
import { useToast } from '@/packages/hooks'
import { cn } from '@/packages/utils'

// ============ Animation Variants ============
const fadeIn = {
	hidden: { opacity: 0, y: 20 },
	visible: {
		opacity: 1,
		y: 0,
		transition: { duration: 0.4 },
	},
}

const stagger = {
	hidden: {},
	visible: {
		transition: { staggerChildren: 0.08 },
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

const formatDate = (date: string | null | undefined) => {
	if (!date) return null
	return new Date(date).toLocaleDateString('ru-RU', {
		day: 'numeric',
		month: 'short',
	})
}

// ============ Team Switcher Component ============
interface Team {
	id: string
	name: string
	logoUrl?: string | null
	iconId?: string | null
	colorId?: string | null
	ownerId: string
}

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

function TeamLogo({ team, size = 'md' }: { team: Team; size?: 'sm' | 'md' }) {
	const sizeClass = size === 'sm' ? 'w-8 h-8' : 'w-10 h-10'

	if (team.logoUrl) {
		return (
			<div className={cn(sizeClass, 'rounded-xl overflow-hidden')}>
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
			className={cn(sizeClass, 'rounded-xl flex items-center justify-center')}
			style={{ backgroundColor: bgColor }}
		>
			<span className={size === 'sm' ? 'text-base' : 'text-lg'}>{emoji}</span>
		</div>
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
}: ProjectCardProps) {
	// Временная прибыль (35% от бюджета) - будет заменена реальными данными
	const profit = budget ? budget * 0.35 : 0
	const isProfitable = profit >= 0
	const isArchived = status === ProjectStatus.ARCHIVED

	const statusConfig: Record<string, { label: string; variant: 'success' | 'secondary' }> = {
		[ProjectStatus.ACTIVE]: { label: 'Активный', variant: 'success' },
		[ProjectStatus.ARCHIVED]: { label: 'Архив', variant: 'secondary' },
		[ProjectStatus.COMPLETED]: { label: 'Завершён', variant: 'success' },
	}

	const statusInfo = statusConfig[status] || { label: status, variant: 'secondary' }

	return (
		<Link href={`/teams/${teamId}/projects/${id}`}>
			<motion.div
				whileHover={{ y: -4, transition: { duration: 0.2 } }}
				className={cn(
					'relative rounded-2xl border border-border/30 bg-card overflow-hidden',
					'hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5',
					'transition-all duration-300 group cursor-pointer',
					isArchived && 'opacity-60'
				)}
			>
				{/* Hover gradient */}
				<div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-linear-to-br from-primary/5 to-transparent" />

				<div className="relative z-10 p-5">
					{/* Header: Photo + Info */}
					<div className="flex gap-4 mb-4">
						{/* Project Photo */}
						<div className="w-16 h-16 rounded-2xl overflow-hidden shrink-0 bg-linear-to-br from-secondary to-muted">
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
									<MapPin className="w-3.5 h-3.5 shrink-0" />
									<span className="line-clamp-1">{address}</span>
								</div>
							)}

							{/* Dates */}
							{(startDate || endDate) && (
								<div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-1">
									<Calendar className="w-3.5 h-3.5 shrink-0" />
									<span>
										{formatDate(startDate) || '—'} — {formatDate(endDate) || '—'}
									</span>
								</div>
							)}
						</div>
					</div>

					{/* Progress Bar */}
					<div className="mb-4">
						<ProgressBar value={progress} showLabel size="md" />
					</div>

					{/* Footer: Profit + Arrow */}
					<div className="flex items-center justify-between">
						{/* Profit (only for owner) */}
						{showFinancials && budget ? (
							<div className="flex items-center gap-2">
								{isProfitable ? (
									<TrendingUp className="w-4 h-4 text-emerald-500" />
								) : (
									<TrendingDown className="w-4 h-4 text-red-500" />
								)}
								<span
									className={cn(
										'font-semibold',
										isProfitable
											? 'text-emerald-600 dark:text-emerald-400'
											: 'text-red-600 dark:text-red-400'
									)}
								>
									{isProfitable ? '+' : ''}
									{formatCurrency(profit)}
								</span>
							</div>
						) : budget ? (
							<div className="text-sm text-muted-foreground">
								Бюджет:{' '}
								<span className="font-medium text-foreground">
									{formatCurrency(budget)}
								</span>
							</div>
						) : (
							<div />
						)}

						{/* Arrow */}
						<ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
					</div>
				</div>
			</motion.div>
		</Link>
	)
}

// ============ Financial Summary Component ============
interface FinancialSummaryProps {
	totalBudget: number
	totalExpenses: number
	activeCount: number
}

function FinancialSummary({ totalBudget, totalExpenses, activeCount }: FinancialSummaryProps) {
	const profit = totalBudget - totalExpenses
	const profitPercent = totalBudget > 0 ? (profit / totalBudget) * 100 : 0
	const isProfitable = profit >= 0

	return (
		<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
			{/* Total Budget */}
			<motion.div
				variants={fadeIn}
				className="p-4 rounded-2xl border border-border/30 bg-linear-to-br from-blue-500/10 to-indigo-500/10"
			>
				<div className="flex items-center gap-2 mb-2">
					<div className="w-8 h-8 rounded-lg flex items-center justify-center bg-blue-500 text-white">
						<Wallet className="w-4 h-4" />
					</div>
					<span className="text-sm text-muted-foreground">Сумма договоров</span>
				</div>
				<p className="text-xl font-bold">{formatCurrency(totalBudget)}</p>
			</motion.div>

			{/* Total Expenses */}
			<motion.div
				variants={fadeIn}
				className="p-4 rounded-2xl border border-border/30 bg-linear-to-br from-amber-500/10 to-orange-500/10"
			>
				<div className="flex items-center gap-2 mb-2">
					<div className="w-8 h-8 rounded-lg flex items-center justify-center bg-amber-500 text-white">
						<TrendingDown className="w-4 h-4" />
					</div>
					<span className="text-sm text-muted-foreground">Потрачено</span>
				</div>
				<p className="text-xl font-bold text-amber-600 dark:text-amber-400">
					{formatCurrency(totalExpenses)}
				</p>
			</motion.div>

			{/* Profit */}
			<motion.div
				variants={fadeIn}
				className={cn(
					'p-4 rounded-2xl border border-border/30',
					isProfitable
						? 'bg-linear-to-br from-emerald-500/10 to-teal-500/10'
						: 'bg-linear-to-br from-red-500/10 to-rose-500/10'
				)}
			>
				<div className="flex items-center gap-2 mb-2">
					<div
						className={cn(
							'w-8 h-8 rounded-lg flex items-center justify-center text-white',
							isProfitable ? 'bg-emerald-500' : 'bg-red-500'
						)}
					>
						{isProfitable ? (
							<TrendingUp className="w-4 h-4" />
						) : (
							<TrendingDown className="w-4 h-4" />
						)}
					</div>
					<span className="text-sm text-muted-foreground">
						{isProfitable ? 'Прибыль' : 'Убыток'}
					</span>
				</div>
				<p
					className={cn(
						'text-xl font-bold',
						isProfitable
							? 'text-emerald-600 dark:text-emerald-400'
							: 'text-red-600 dark:text-red-400'
					)}
				>
					{formatCurrency(Math.abs(profit))}
				</p>
				<p className="text-xs text-muted-foreground">
					{Math.abs(profitPercent).toFixed(1)}% от бюджета
				</p>
			</motion.div>

			{/* Active Projects */}
			<motion.div
				variants={fadeIn}
				className="p-4 rounded-2xl border border-border/30 bg-linear-to-br from-violet-500/10 to-purple-500/10"
			>
				<div className="flex items-center gap-2 mb-2">
					<div className="w-8 h-8 rounded-lg flex items-center justify-center bg-violet-500 text-white">
						<Building2 className="w-4 h-4" />
					</div>
					<span className="text-sm text-muted-foreground">Активных объектов</span>
				</div>
				<p className="text-xl font-bold">{activeCount}</p>
			</motion.div>
		</div>
	)
}

// ============ FAB Menu Component ============
interface FabMenuProps {
	onCreateProject: () => void
	hasActiveProject: boolean
}

function FabMenu({ onCreateProject, hasActiveProject }: FabMenuProps) {
	const [isOpen, setIsOpen] = useState(false)
	const { error: showError } = useToast()

	const handleCreateExpense = () => {
		if (!hasActiveProject) {
			showError('Сначала создайте объект')
			return
		}
		showError('Перейдите в объект для добавления расхода')
		setIsOpen(false)
	}

	const handleCreateReport = () => {
		if (!hasActiveProject) {
			showError('Сначала создайте объект')
			return
		}
		showError('Перейдите в объект для создания фотоотчёта')
		setIsOpen(false)
	}

	return (
		<div className="fixed bottom-6 right-6 z-50">
			{/* Actions */}
			<AnimatePresence>
				{isOpen && (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						className="absolute bottom-16 right-0 flex flex-col gap-3 items-end mb-2"
					>
						{/* Create Project */}
						<motion.button
							initial={{ opacity: 0, y: 20, scale: 0.8 }}
							animate={{ opacity: 1, y: 0, scale: 1 }}
							exit={{ opacity: 0, y: 20, scale: 0.8 }}
							transition={{ delay: 0, duration: 0.2 }}
							onClick={() => {
								onCreateProject()
								setIsOpen(false)
							}}
							className="flex items-center gap-3 pl-4 pr-2 py-2 rounded-full bg-card border border-border/50 shadow-xl hover:shadow-2xl transition-all"
						>
							<span className="text-sm font-medium whitespace-nowrap">Новый объект</span>
							<div className="w-10 h-10 rounded-full flex items-center justify-center bg-linear-to-br from-blue-500 to-indigo-500 text-white shadow-lg">
								<FolderKanban className="w-5 h-5" />
							</div>
						</motion.button>

						{/* Create Expense */}
						<motion.button
							initial={{ opacity: 0, y: 20, scale: 0.8 }}
							animate={{ opacity: 1, y: 0, scale: 1 }}
							exit={{ opacity: 0, y: 20, scale: 0.8 }}
							transition={{ delay: 0.05, duration: 0.2 }}
							onClick={handleCreateExpense}
							className={cn(
								'flex items-center gap-3 pl-4 pr-2 py-2 rounded-full bg-card border border-border/50 shadow-xl hover:shadow-2xl transition-all',
								!hasActiveProject && 'opacity-50'
							)}
						>
							<span className="text-sm font-medium whitespace-nowrap">Добавить расход</span>
							<div className="w-10 h-10 rounded-full flex items-center justify-center bg-linear-to-br from-amber-500 to-orange-500 text-white shadow-lg">
								<Wallet className="w-5 h-5" />
							</div>
						</motion.button>

						{/* Create Report */}
						<motion.button
							initial={{ opacity: 0, y: 20, scale: 0.8 }}
							animate={{ opacity: 1, y: 0, scale: 1 }}
							exit={{ opacity: 0, y: 20, scale: 0.8 }}
							transition={{ delay: 0.1, duration: 0.2 }}
							onClick={handleCreateReport}
							className={cn(
								'flex items-center gap-3 pl-4 pr-2 py-2 rounded-full bg-card border border-border/50 shadow-xl hover:shadow-2xl transition-all',
								!hasActiveProject && 'opacity-50'
							)}
						>
							<span className="text-sm font-medium whitespace-nowrap">Фотоотчёт</span>
							<div className="w-10 h-10 rounded-full flex items-center justify-center bg-linear-to-br from-violet-500 to-purple-500 text-white shadow-lg">
								<Camera className="w-5 h-5" />
							</div>
						</motion.button>
					</motion.div>
				)}
			</AnimatePresence>

			{/* Main Button */}
			<motion.button
				onClick={() => setIsOpen(!isOpen)}
				className={cn(
					'w-14 h-14 rounded-full flex items-center justify-center shadow-xl hover:shadow-2xl transition-all duration-300',
					isOpen
						? 'bg-secondary text-foreground rotate-45'
						: 'bg-linear-to-br from-primary to-blue-600 text-white hover:scale-105'
				)}
				whileTap={{ scale: 0.95 }}
			>
				<Plus className="w-6 h-6" />
			</motion.button>
		</div>
	)
}

// ============ Main Dashboard Component ============
export default function DashboardPage() {
	const router = useRouter()
	const { user, logout } = useAuth()
	const { error: showError, success: showSuccess } = useToast()

	// State
	const [currentTeamId, setCurrentTeamId] = useState<string | null>(null)
	const [searchQuery, setSearchQuery] = useState('')
	const [showArchived, setShowArchived] = useState(false)
	const [teamDropdownOpen, setTeamDropdownOpen] = useState(false)

	// Load teams
	const {
		data: teamsData,
		loading: teamsLoading,
		error: teamsError,
	} = useQuery(MyTeamsDocument, {
		fetchPolicy: 'cache-and-network',
	})

	const teams = (teamsData?.myTeams || []) as Team[]

	// Set default team
	useEffect(() => {
		if (teams.length > 0 && !currentTeamId) {
			const ownedTeam = teams.find(t => t.ownerId === user?.id)
			setCurrentTeamId(ownedTeam?.id || teams[0].id)
		}
	}, [teams, currentTeamId, user?.id])

	const currentTeam = teams.find(t => t.id === currentTeamId)
	const isOwner = currentTeam?.ownerId === user?.id

	// Load projects
	const {
		data: projectsData,
		loading: projectsLoading,
		error: projectsError,
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
	const activeProjects = filteredProjects.filter(
		p => p?.status === ProjectStatus.ACTIVE || p?.status === ProjectStatus.COMPLETED
	)
	const archivedProjects = filteredProjects.filter(
		p => p?.status === ProjectStatus.ARCHIVED
	)

	// Financial metrics
	const financialMetrics = useMemo(() => {
		const active = allProjects.filter(
			p => p?.status === ProjectStatus.ACTIVE || p?.status === ProjectStatus.COMPLETED
		)

		const totalBudget = active.reduce((sum, p) => sum + (p?.budget || 0), 0)
		// TODO: Replace with real expenses from API
		const totalExpenses = totalBudget * 0.65

		return {
			totalBudget,
			totalExpenses,
			activeCount: active.length,
		}
	}, [allProjects])

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

	const handleLogout = async () => {
		try {
			await logout()
			router.push('/auth/login')
		} catch {
			showError('Ошибка при выходе')
		}
	}

	// Loading state
	if (teamsLoading && !teamsData) {
		return (
			<div className="min-h-screen bg-background">
				<div className="border-b border-border/30 bg-card/50">
					<div className="container mx-auto px-4 py-4">
						<div className="flex items-center justify-between">
							<Skeleton className="h-12 w-48" />
							<Skeleton className="h-10 w-10 rounded-full" />
						</div>
					</div>
				</div>
				<div className="container mx-auto px-4 py-8">
					<Skeleton className="h-8 w-64 mb-2" />
					<Skeleton className="h-5 w-48 mb-8" />
					<div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
						{[1, 2, 3, 4].map(i => (
							<Skeleton key={i} className="h-28 rounded-2xl" />
						))}
					</div>
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
						{[1, 2, 3, 4, 5, 6].map(i => (
							<Skeleton key={i} className="h-48 rounded-2xl" />
						))}
					</div>
				</div>
			</div>
		)
	}

	// Error state
	if (teamsError) {
		return (
			<div className="min-h-screen bg-background flex items-center justify-center">
				<div className="text-center max-w-md px-4">
					<div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4">
						<FolderKanban className="w-8 h-8 text-red-500" />
					</div>
					<h2 className="text-xl font-bold mb-2">Ошибка загрузки</h2>
					<p className="text-muted-foreground mb-4">{teamsError.message}</p>
					<Button onClick={() => window.location.reload()}>Попробовать снова</Button>
				</div>
			</div>
		)
	}

	// No teams state
	if (teams.length === 0) {
		return (
			<div className="min-h-screen bg-background flex items-center justify-center">
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					className="text-center max-w-md px-4"
				>
					<div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
						<Building2 className="w-10 h-10 text-primary" />
					</div>
					<h2 className="text-2xl font-bold mb-3">Добро пожаловать в ProRab!</h2>
					<p className="text-muted-foreground text-lg mb-8">
						Создайте свою первую бригаду, чтобы начать вести учёт объектов и расходов
					</p>
					<Button
						onClick={() => router.push('/onboarding')}
						size="lg"
						className="bg-primary hover:bg-primary/90"
					>
						<Plus className="w-5 h-5 mr-2" />
						Создать бригаду
					</Button>
				</motion.div>
			</div>
		)
	}

	return (
		<div className="min-h-screen bg-background pb-24">
			{/* Header */}
			<motion.header
				initial={{ opacity: 0, y: -20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5 }}
				className="sticky top-0 z-40 border-b border-border/30 bg-card/80 backdrop-blur-xl"
			>
				<div className="container mx-auto px-4 py-3">
					<div className="flex items-center justify-between">
						{/* Team Switcher */}
						<div className="relative">
							<button
								onClick={() => setTeamDropdownOpen(!teamDropdownOpen)}
								className="flex items-center gap-3 px-4 py-2 rounded-2xl bg-card border border-border/50 hover:border-primary/30 transition-all"
							>
								{currentTeam && <TeamLogo team={currentTeam} />}
								<div className="text-left">
									<div className="flex items-center gap-2">
										<span className="font-semibold">{currentTeam?.name || 'Выберите бригаду'}</span>
										{isOwner && <Crown className="w-4 h-4 text-amber-500" />}
									</div>
									<span className="text-xs text-muted-foreground">
										{isOwner ? 'Владелец' : 'Участник'}
									</span>
								</div>
								{teams.length > 1 && (
									<ChevronDown
										className={cn(
											'w-5 h-5 text-muted-foreground transition-transform',
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
										className="absolute top-full left-0 mt-2 w-72 bg-card border border-border/50 rounded-2xl shadow-xl overflow-hidden z-50"
									>
										<div className="p-2">
											<div className="px-3 py-2 text-xs font-medium text-muted-foreground uppercase">
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

						{/* Actions */}
						<div className="flex items-center gap-2">
							<Button
								variant="ghost"
								size="icon"
								className="hidden md:flex"
								onClick={() => router.push('/teams')}
							>
								<Users className="w-5 h-5" />
							</Button>
							<Button variant="ghost" size="icon" onClick={handleLogout}>
								<LogOut className="w-5 h-5" />
							</Button>
						</div>
					</div>
				</div>
			</motion.header>

			{/* Main Content */}
			<main className="container mx-auto px-4 py-6">
				<motion.div initial="hidden" animate="visible" variants={stagger}>
					{/* Greeting */}
					<motion.div variants={fadeIn} className="mb-6">
						<h1 className="text-2xl md:text-3xl font-bold">
							Привет, {user?.fullName?.split(' ')[0] || 'Прораб'}! 👋
						</h1>
						<p className="text-muted-foreground mt-1">
							{activeProjects.length > 0
								? `У вас ${activeProjects.length} ${
										activeProjects.length === 1
											? 'активный объект'
											: activeProjects.length >= 2 && activeProjects.length <= 4
											? 'активных объекта'
											: 'активных объектов'
								  }`
								: 'Создайте свой первый объект'}
						</p>
					</motion.div>

					{/* Financial Summary (only for owner) */}
					{isOwner && financialMetrics.totalBudget > 0 && (
						<motion.div variants={fadeIn} className="mb-8">
							<FinancialSummary {...financialMetrics} />
						</motion.div>
					)}

					{/* Search */}
					<motion.div variants={fadeIn} className="mb-6">
						<div className="relative max-w-md">
							<Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
							<input
								type="text"
								placeholder="Поиск по названию или адресу..."
								value={searchQuery}
								onChange={e => setSearchQuery(e.target.value)}
								className="w-full h-12 pl-11 pr-4 rounded-2xl border border-border/50 bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all"
							/>
						</div>
					</motion.div>

					{/* Active Projects */}
					<motion.section variants={fadeIn} className="mb-8">
						<h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
							<span className="w-2 h-2 rounded-full bg-emerald-500" />
							Активные объекты
							{activeProjects.length > 0 && (
								<span className="text-sm font-normal text-muted-foreground">
									({activeProjects.length})
								</span>
							)}
						</h2>

						{projectsLoading && !projectsData ? (
							<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
								{[1, 2, 3].map(i => (
									<Skeleton key={i} className="h-48 rounded-2xl" />
								))}
							</div>
						) : activeProjects.length > 0 ? (
							<motion.div
								variants={stagger}
								className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
							>
								{activeProjects.map(
									project =>
										project?.id && (
											<motion.div key={project.id} variants={fadeIn}>
												<ProjectCard
													id={project.id}
													teamId={currentTeamId || ''}
													name={project.name || ''}
													address={project.address}
													photoUrl={project.photoUrl}
													budget={project.budget}
													progress={project.progress || 0}
													status={project.status}
													startDate={project.startDate}
													endDate={project.endDate}
													showFinancials={isOwner}
												/>
											</motion.div>
										)
								)}
							</motion.div>
						) : (
							<motion.div
								variants={fadeIn}
								className="text-center py-12 rounded-2xl border-2 border-dashed border-border/50 bg-secondary/20"
							>
								<FolderKanban className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
								<h3 className="text-lg font-medium mb-2">
									{searchQuery ? 'Объекты не найдены' : 'Пока нет объектов'}
								</h3>
								<p className="text-muted-foreground mb-4">
									{searchQuery
										? 'Попробуйте изменить поисковый запрос'
										: 'Создайте свой первый строительный объект'}
								</p>
								{!searchQuery && (
									<Button onClick={handleCreateProject}>
										<Plus className="w-4 h-4 mr-2" />
										Создать объект
									</Button>
								)}
							</motion.div>
						)}
					</motion.section>

					{/* Archived Projects */}
					{archivedProjects.length > 0 && (
						<motion.section variants={fadeIn}>
							<button
								onClick={() => setShowArchived(!showArchived)}
								className="w-full flex items-center justify-between p-4 rounded-2xl bg-secondary/30 border border-border/30 hover:bg-secondary/50 transition-colors mb-4"
							>
								<div className="flex items-center gap-2">
									<span className="w-2 h-2 rounded-full bg-muted-foreground" />
									<span className="font-medium">Архив</span>
									<span className="text-sm text-muted-foreground">
										({archivedProjects.length})
									</span>
								</div>
								{showArchived ? (
									<ChevronUp className="w-5 h-5 text-muted-foreground" />
								) : (
									<ChevronDown className="w-5 h-5 text-muted-foreground" />
								)}
							</button>

							<AnimatePresence>
								{showArchived && (
									<motion.div
										initial={{ opacity: 0, height: 0 }}
										animate={{ opacity: 1, height: 'auto' }}
										exit={{ opacity: 0, height: 0 }}
										transition={{ duration: 0.3 }}
										className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
									>
										{archivedProjects.map(
											project =>
												project?.id && (
													<ProjectCard
														key={project.id}
														id={project.id}
														teamId={currentTeamId || ''}
														name={project.name || ''}
														address={project.address}
														photoUrl={project.photoUrl}
														budget={project.budget}
														progress={project.progress || 0}
														status={project.status}
														startDate={project.startDate}
														endDate={project.endDate}
														showFinancials={isOwner}
													/>
												)
										)}
									</motion.div>
								)}
							</AnimatePresence>
						</motion.section>
					)}
				</motion.div>
			</main>

			{/* FAB Menu */}
			<FabMenu
				onCreateProject={handleCreateProject}
				hasActiveProject={activeProjects.length > 0}
			/>
		</div>
	)
}
