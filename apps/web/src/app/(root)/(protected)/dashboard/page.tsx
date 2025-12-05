'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery } from '@apollo/client/react'
import { motion, AnimatePresence } from 'framer-motion'
import {
	FolderKanban,
	Search,
	ChevronDown,
	ChevronUp,
	Settings,
	Bell,
	LogOut,
} from 'lucide-react'

import { MyTeamsDocument, ProjectsByTeamDocument } from '@/packages/api/graphql'
import { useAuth } from '@/packages/libs/auth'
import { Button, Skeleton } from '@/packages/components'
import {
	TeamSwitcher,
	FinancialSummary,
	ProjectCardDashboard,
	FabMenu,
} from '@/packages/components/dashboard'
import { ProjectStatus } from '@/packages/schemas'
import { useToast } from '@/packages/hooks'

const fadeIn = {
	hidden: { opacity: 0, y: 20 },
	visible: {
		opacity: 1,
		y: 0,
		transition: { duration: 0.5, ease: [0.22, 0.61, 0.36, 1] },
	},
}

const stagger = {
	hidden: {},
	visible: {
		transition: { staggerChildren: 0.08 },
	},
}

export default function DashboardPage() {
	const router = useRouter()
	const { user, logout } = useAuth()
	const { error: showError } = useToast()

	// Состояния
	const [currentTeamId, setCurrentTeamId] = useState<string | null>(null)
	const [searchQuery, setSearchQuery] = useState('')
	const [showArchived, setShowArchived] = useState(false)

	// Загрузка команд
	const { data: teamsData, loading: teamsLoading } = useQuery(MyTeamsDocument, {
		fetchPolicy: 'cache-and-network',
		onCompleted: (data) => {
			// Устанавливаем первую команду по умолчанию
			if (data?.myTeams?.length > 0 && !currentTeamId) {
				// Приоритет: команда где пользователь владелец
				const ownedTeam = data.myTeams.find(t => t.ownerId === user?.id)
				setCurrentTeamId(ownedTeam?.id || data.myTeams[0].id)
			}
		},
	})

	const teams = teamsData?.myTeams || []
	const currentTeam = teams.find(t => t.id === currentTeamId)
	const isOwner = currentTeam?.ownerId === user?.id

	// Загрузка проектов текущей команды
	const { data: projectsData, loading: projectsLoading } = useQuery(ProjectsByTeamDocument, {
		variables: { teamId: currentTeamId || '', filter: null },
		skip: !currentTeamId,
		fetchPolicy: 'cache-and-network',
	})

	const allProjects = projectsData?.projectsByTeam || []

	// Фильтрация проектов
	const filteredProjects = useMemo(() => {
		let projects = allProjects

		// Фильтрация по поиску
		if (searchQuery) {
			const query = searchQuery.toLowerCase()
			projects = projects.filter(p =>
				p?.name?.toLowerCase().includes(query) ||
				p?.address?.toLowerCase().includes(query)
			)
		}

		return projects
	}, [allProjects, searchQuery])

	// Разделение на активные и архивные
	const activeProjects = filteredProjects.filter(
		p => p?.status === ProjectStatus.ACTIVE || p?.status === ProjectStatus.COMPLETED
	)
	const archivedProjects = filteredProjects.filter(
		p => p?.status === ProjectStatus.ARCHIVED
	)

	// Финансовые метрики (сумма по всем активным проектам)
	const financialMetrics = useMemo(() => {
		const active = allProjects.filter(
			p => p?.status === ProjectStatus.ACTIVE || p?.status === ProjectStatus.COMPLETED
		)

		const totalBudget = active.reduce((sum, p) => sum + (p?.budget || 0), 0)
		// TODO: Добавить реальные расходы когда будет API
		const totalExpenses = totalBudget * 0.65 // Временная заглушка
		const membersCount = 1 // TODO: Получить из API

		return {
			totalBudget,
			totalExpenses,
			activeProjectsCount: active.length,
			membersCount,
		}
	}, [allProjects])

	// Обработчики
	const handleTeamChange = (teamId: string) => {
		setCurrentTeamId(teamId)
		setSearchQuery('')
	}

	const handleCreateProject = () => {
		if (currentTeamId) {
			router.push(`/teams/${currentTeamId}/projects/new`)
		}
	}

	const handleCreateExpense = () => {
		// TODO: Открыть модалку создания расхода
		showError('Функция будет доступна в ближайшее время')
	}

	const handleCreateReport = () => {
		// TODO: Открыть модалку создания фотоотчёта
		showError('Функция будет доступна в ближайшее время')
	}

	const handleLogout = async () => {
		try {
			await logout()
			router.push('/auth/login')
		} catch (err) {
			showError('Ошибка при выходе из аккаунта')
		}
	}

	// Loading state
	if (teamsLoading && !teamsData) {
		return (
			<div className="min-h-screen bg-background">
				{/* Header Skeleton */}
				<div className="border-b border-border/30 bg-card/50">
					<div className="container mx-auto px-4 py-4">
						<div className="flex items-center justify-between">
							<Skeleton className="h-12 w-64" />
							<Skeleton className="h-10 w-10 rounded-full" />
						</div>
					</div>
				</div>

				{/* Content Skeleton */}
				<div className="container mx-auto px-4 py-8">
					<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
						<Skeleton className="h-32 rounded-2xl" />
						<Skeleton className="h-32 rounded-2xl" />
						<Skeleton className="h-32 rounded-2xl" />
					</div>
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
						{[1, 2, 3, 4, 5, 6].map(i => (
							<Skeleton key={i} className="h-48 rounded-2xl" />
						))}
					</div>
				</div>
			</div>
		)
	}

	// Empty state (нет команд)
	if (teams.length === 0) {
		return (
			<div className="min-h-screen bg-background flex items-center justify-center">
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					className="text-center max-w-md mx-auto px-4"
				>
					<div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
						<FolderKanban className="w-10 h-10 text-primary" />
					</div>
					<h2 className="text-2xl font-bold mb-3">Добро пожаловать в ProRab!</h2>
					<p className="text-muted-foreground text-lg mb-8">
						Создайте свою первую бригаду, чтобы начать работу с проектами
					</p>
					<Button
						onClick={() => router.push('/onboarding')}
						size="lg"
						className="bg-primary hover:bg-primary/90"
					>
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
						<TeamSwitcher
							teams={teams as any}
							currentTeamId={currentTeamId || ''}
							userId={user?.id || ''}
							onTeamChange={handleTeamChange}
						/>

						{/* Actions */}
						<div className="flex items-center gap-2">
							<Button
								variant="ghost"
								size="icon"
								className="hidden md:flex"
								onClick={() => router.push('/settings')}
							>
								<Settings className="w-5 h-5" />
							</Button>
							<Button
								variant="ghost"
								size="icon"
								onClick={handleLogout}
							>
								<LogOut className="w-5 h-5" />
							</Button>
						</div>
					</div>
				</div>
			</motion.header>

			{/* Main Content */}
			<main className="container mx-auto px-4 py-6">
				<motion.div
					initial="hidden"
					animate="visible"
					variants={stagger}
				>
					{/* Приветствие */}
					<motion.div variants={fadeIn} className="mb-6">
						<h1 className="text-2xl md:text-3xl font-bold">
							Привет, {user?.fullName?.split(' ')[0] || 'Прораб'}! 👋
						</h1>
						<p className="text-muted-foreground mt-1">
							{activeProjects.length > 0
								? `У вас ${activeProjects.length} ${
									activeProjects.length === 1 ? 'активный объект' :
										activeProjects.length >= 2 && activeProjects.length <= 4 ? 'активных объекта' :
											'активных объектов'
								}`
								: 'Создайте свой первый объект'}
						</p>
					</motion.div>

					{/* Финансовый виджет (только для владельца) */}
					{isOwner && (
						<motion.div variants={fadeIn} className="mb-8">
							<FinancialSummary
								totalBudget={financialMetrics.totalBudget}
								totalExpenses={financialMetrics.totalExpenses}
								activeProjectsCount={financialMetrics.activeProjectsCount}
								membersCount={financialMetrics.membersCount}
								showFinancials={isOwner}
							/>
						</motion.div>
					)}

					{/* Поиск */}
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

					{/* Активные объекты */}
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
								{activeProjects.map((project, index) => (
									project?.id && (
										<motion.div key={project.id} variants={fadeIn}>
											<ProjectCardDashboard
												id={project.id}
												teamId={currentTeamId || ''}
												name={project.name || ''}
												address={project.address}
												photoUrl={project.photoUrl}
												budget={project.budget}
												progress={project.progress || 0}
												status={project.status as any}
												startDate={project.startDate}
												endDate={project.endDate}
												profit={project.budget ? project.budget * 0.35 : null} // TODO: Реальная прибыль
												showFinancials={isOwner}
											/>
										</motion.div>
									)
								))}
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
										Создать объект
									</Button>
								)}
							</motion.div>
						)}
					</motion.section>

					{/* Архивные объекты */}
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
										{archivedProjects.map(project => (
											project?.id && (
												<ProjectCardDashboard
													key={project.id}
													id={project.id}
													teamId={currentTeamId || ''}
													name={project.name || ''}
													address={project.address}
													photoUrl={project.photoUrl}
													budget={project.budget}
													progress={project.progress || 0}
													status={project.status as any}
													startDate={project.startDate}
													endDate={project.endDate}
													showFinancials={isOwner}
												/>
											)
										))}
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
				onCreateExpense={handleCreateExpense}
				onCreateReport={handleCreateReport}
				hasActiveProject={activeProjects.length > 0}
			/>
		</div>
	)
}
