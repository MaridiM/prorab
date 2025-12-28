'use client'

import { useState, useMemo, useEffect, useTransition, useCallback } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { useQuery, useMutation } from '@apollo/client/react'
import { gql } from '@apollo/client'
import { motion, AnimatePresence } from 'framer-motion'
import {
	ProjectsByTeamDocument,
	MyTeamsDocument,
	ProjectStatsDocument,
	TeamMembersDocument,
	TeamStatsDocument,
	TeamRole,
} from '@/packages/api/graphql'
import { ProjectStatus } from '@/packages/schemas'
import { ProjectCardDashboard } from '@/packages/components/dashboard'
import { FinancialSummary } from '@/packages/components/dashboard'
import { Button, Skeleton, Badge, UserMenu, Dialog, DialogContent, DialogHeader, DialogTitle, Tabs, TabsList, TabsTrigger, TabsContent } from '@/packages/components/ui'
import { SalarySettingsForm, MemberSalaryBadge } from '@/packages/components/payouts'
import { useAuth } from '@/packages/libs/auth'
import { useToast } from '@/packages/hooks'
import {
	Plus,
	Search,
	ArrowLeft,
	FolderKanban,
	ChevronDown,
	ChevronUp,
	Users,
	Crown,
    Banknote,
    LayoutGrid,
	Eye,
	EyeOff,
} from 'lucide-react'

const fadeIn = {
	hidden: { opacity: 0, y: 20 },
	visible: {
		opacity: 1,
		y: 0,
		transition: { duration: 0.5, ease: [0.22, 0.61, 0.36, 1] as const },
	},
}

const TEAM_MEMBERS_QUERY = gql`
  query TeamMembers($teamId: ID!) {
    teamMembers(teamId: $teamId) {
      id
      teamId
      userId
      role
      salaryType
      salaryAmount
      joinedAt
      user {
        id
        email
        fullName
        phone
      }
    }
  }
`

const UPDATE_MEMBER_SALARY_MUTATION = gql`
  mutation UpdateMemberSalary($input: UpdateMemberSalaryInput!) {
    updateMemberSalary(input: $input) {
      id
      salaryType
      salaryAmount
      user {
        id
        fullName
        email
      }
    }
  }
`

const stagger = {
	hidden: {},
	visible: {
		transition: { staggerChildren: 0.08 },
	},
}

type StatusFilter = 'ALL' | 'ACTIVE' | 'ARCHIVED' | 'COMPLETED'

export default function TeamDashboardPage() {
	const params = useParams()
	const router = useRouter()
	const searchParams = useSearchParams()
	const { user } = useAuth()
	const teamId = params.teamId as string

	// Используем URL как источник правды
	const statusFilter = (searchParams.get('filter') as StatusFilter) || 'ALL'
	const [searchQuery, setSearchQuery] = useState('')
	const [showArchived, setShowArchived] = useState(false)
    const [activeTab, setActiveTab] = useState<'projects' | 'salaries'>('projects')
	const [projectsTab, setProjectsTab] = useState<'active' | 'archived'>('active')
	const [sortBy, setSortBy] = useState<'default' | 'name' | 'date' | 'status'>('default')
	const [showCompleted, setShowCompleted] = useState(false) // По умолчанию скрываем завершенные проекты
    const [editingMember, setEditingMember] = useState<any>(null)
	const [, startTransition] = useTransition()
    const { showToast } = useToast()

	// Сбрасываем состояние архива при изменении фильтра
	useEffect(() => {
		if (statusFilter !== 'ALL' && statusFilter !== 'ARCHIVED') {
			setShowArchived(false)
		}
	}, [statusFilter])

	const setStatusFilter = (filter: StatusFilter) => {
		startTransition(() => {
			const newParams = new URLSearchParams(searchParams.toString())
			newParams.set('filter', filter)
			router.replace(`?${newParams.toString()}`, { scroll: false })
		})
	}

	// Загрузка команды
	const { data: teamsData, loading: teamsLoading } = useQuery(MyTeamsDocument)
	const team = teamsData?.myTeams?.find(t => t.id === teamId)
	const isOwner = team?.ownerId === user?.id

	// Загрузка проектов
	const { data: projectsData, loading: projectsLoading } = useQuery(
		ProjectsByTeamDocument,
		{
			variables: {
				teamId,
				filter: null,
			},
			fetchPolicy: 'no-cache', // Отключаем кэш для избежания проблем при переключении фильтров
			notifyOnNetworkStatusChange: true,
            skip: activeTab !== 'projects'
		}
	)

    const { data: membersData, loading: membersLoading, refetch: refetchMembers } = useQuery(
        TeamMembersDocument,
        {
            variables: { teamId },
            skip: activeTab !== 'salaries'
        }
    )

	const { data: teamStatsData, loading: statsLoading } = useQuery(TeamStatsDocument, {
		variables: { teamId },
		skip: !isOwner || activeTab !== 'projects',
		fetchPolicy: 'cache-and-network',
	})

    const [updateSalary, { loading: updatingSalary }] = useMutation(UPDATE_MEMBER_SALARY_MUTATION)

    const handleUpdateSalary = async (data: any) => {
        try {
            await updateSalary({ 
                variables: { 
                    input: data
                } 
            })
            showToast({ type: 'success', message: 'Зарплата обновлена' })
            setEditingMember(null)
            refetchMembers()
        } catch (error: any) {
            showToast({ type: 'error', message: error.message || 'Ошибка обновления зарплаты' })
        }
    }

	const allProjects = useMemo(() => {
		return projectsData?.projectsByTeam || []
	}, [projectsData])

	// Filter projects by search query
	const filteredProjects = useMemo(() => {
		if (!searchQuery) return allProjects

		const query = searchQuery.toLowerCase()
		return allProjects.filter(
			p =>
				p?.name?.toLowerCase().includes(query) ||
				p?.address?.toLowerCase().includes(query)
		)
	}, [allProjects, searchQuery])

	// Separate active and archived projects
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
	const sortProjects = useCallback((projects: any[]) => {
		switch (sortBy) {
			case 'name':
				return [...projects].sort((a, b) => (a.name || '').localeCompare(b.name || '', 'ru'))
			case 'date':
				return [...projects].sort((a, b) => {
					const dateA = a.startDate ? new Date(a.startDate).getTime() : 0
					const dateB = b.startDate ? new Date(b.startDate).getTime() : 0
					return dateB - dateA // Newest first
				})
			case 'status':
				return [...projects].sort((a, b) => {
					const statusOrder = {
						[ProjectStatus.ACTIVE]: 1,
						[ProjectStatus.COMPLETED]: 2,
						[ProjectStatus.ARCHIVED]: 3,
					}
					return (statusOrder[a.status] || 0) - (statusOrder[b.status] || 0)
				})
			case 'default':
			default:
				// Default sort: Active (not completed), then Completed, then Archived
				return [...projects].sort((a, b) => {
					if (a.status === ProjectStatus.ACTIVE && b.status !== ProjectStatus.ACTIVE) return -1
					if (b.status === ProjectStatus.ACTIVE && a.status !== ProjectStatus.ACTIVE) return 1
					if (a.status === ProjectStatus.COMPLETED && b.status !== ProjectStatus.COMPLETED) return -1
					if (b.status === ProjectStatus.COMPLETED && a.status !== ProjectStatus.COMPLETED) return 1
					const dateA = a.startDate ? new Date(a.startDate).getTime() : 0
					const dateB = b.startDate ? new Date(b.startDate).getTime() : 0
					return dateB - dateA // Fallback to date
				})
		}
	}, [sortBy])

	const sortedActiveProjects = useMemo(() => sortProjects(allActiveProjects), [allActiveProjects, sortProjects])
	const sortedArchivedProjects = useMemo(() => sortProjects(archivedProjects), [archivedProjects, sortProjects])

	// Финансовые метрики - реальные данные из базы данных
	const financialMetrics = useMemo(() => {
		// Если данные загружаются или недоступны, показываем fallback
		if (statsLoading || !teamStatsData?.teamStats) {
			const active = allProjects.filter(
				p =>
					p?.status === ProjectStatus.ACTIVE ||
					p?.status === ProjectStatus.COMPLETED
			)
			return {
				totalBudget: active.reduce((sum, p) => sum + (p?.budget || 0), 0),
				totalExpenses: 0,
				activeProjectsCount: active.length,
				membersCount: 0,
			}
		}

		// ✅ РЕАЛЬНЫЕ ДАННЫЕ из базы данных
		return teamStatsData.teamStats
	}, [teamStatsData, statsLoading, allProjects])

	const handleCreateProject = () => {
		router.push(`/teams/${teamId}/projects/new`)
	}

	const handleBack = () => {
		router.push('/dashboard')
	}

	// Loading state
	if ((teamsLoading || projectsLoading || statsLoading) && !projectsData) {
		return (
			<div className="min-h-screen bg-background">
				{/* Header Skeleton */}
				<div className="border-b border-border/30 bg-card/50">
					<div className="w-full max-w-[1920px] mx-auto px-4 py-4">
						<Skeleton className="h-8 w-48 mb-2" />
						<Skeleton className="h-5 w-64" />
					</div>
				</div>

				{/* Content Skeleton */}
				<div className="w-full max-w-[1920px] mx-auto px-4 py-8">
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

	// Team not found
	if (!team) {
		return (
			<div className="min-h-screen bg-background flex items-center justify-center">
				<div className="text-center">
					<h2 className="text-2xl font-bold mb-3">Команда не найдена</h2>
					<p className="text-muted-foreground mb-6">
						Возможно, команда была удалена или у вас нет к ней доступа
					</p>
					<Button onClick={() => router.push('/dashboard')}>
						Вернуться на главную
					</Button>
				</div>
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
				<div className="w-full max-w-[1920px] mx-auto px-4 py-4">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-4">
							{/* Back Button */}
							<button
								onClick={handleBack}
								className="p-2 rounded-xl hover:bg-secondary/50 transition-colors"
							>
								<ArrowLeft className="w-5 h-5" />
							</button>

							{/* Team Info */}
							<div className="flex items-center gap-3">
								{team.logoUrl ? (
									<div className="w-12 h-12 rounded-xl overflow-hidden">
										<img
											src={team.logoUrl}
											alt={team.name}
											className="w-full h-full object-cover"
										/>
									</div>
								) : (
									<div className="w-12 h-12 rounded-xl flex items-center justify-center text-white bg-gradient-to-br from-blue-500 to-indigo-500">
										<Users className="w-6 h-6" />
									</div>
								)}
								<div>
									<div className="flex items-center gap-2">
										<h1 className="text-xl font-bold">{team.name}</h1>
										{isOwner && (
											<Crown className="w-4 h-4 text-amber-500" />
										)}
									</div>
									<p className="text-sm text-muted-foreground">
										{allProjects.filter(
											p => p?.status === ProjectStatus.ACTIVE || p?.status === ProjectStatus.COMPLETED
										).length}{' '}
										активных проектов
									</p>
								</div>
							</div>
						</div>

						{/* Actions */}
						<div className="flex items-center gap-2">
							<Button
								variant="outline"
								onClick={() => router.push(`/teams/${teamId}/people`)}
							>
								<Users className="w-4 h-4 mr-2" />
								Люди
							</Button>
							<Button onClick={handleCreateProject}>
								<Plus className="w-4 h-4 mr-2" />
								Новый проект
							</Button>
							<UserMenu avatarSize="sm" />
						</div>
					</div>
				</div>
			</motion.header>

            {/* Tabs Navigation */}
            <div className="border-b border-border/30 bg-card/50">
				<div className="w-full max-w-[1920px] mx-auto px-4">
					<div className="flex gap-1 overflow-x-auto">
                        <button
                            onClick={() => setActiveTab('projects')}
                            className={`px-4 py-3 font-medium transition-colors border-b-2 flex items-center gap-2 whitespace-nowrap ${
                                activeTab === 'projects'
                                    ? 'border-primary text-primary'
                                    : 'border-transparent text-muted-foreground hover:text-foreground'
                            }`}
                        >
                            <LayoutGrid className="w-4 h-4" />
                            Проекты
                        </button>
                        {isOwner && (
                            <button
                                onClick={() => setActiveTab('salaries')}
                                className={`px-4 py-3 font-medium transition-colors border-b-2 flex items-center gap-2 whitespace-nowrap ${
                                    activeTab === 'salaries'
                                        ? 'border-primary text-primary'
                                        : 'border-transparent text-muted-foreground hover:text-foreground'
                                }`}
                            >
                                <Banknote className="w-4 h-4" />
                                Зарплаты
                            </button>
                        )}
					</div>
				</div>
			</div>

			{/* Main Content */}
			<main className="w-full max-w-[1920px] mx-auto px-4 py-6">
                {activeTab === 'projects' ? (
				<div>
					{/* Financial Summary (только для владельца) */}
					{isOwner && financialMetrics.totalBudget > 0 && (
						<div className="mb-8">
							<FinancialSummary
								totalBudget={financialMetrics.totalBudget}
								totalExpenses={financialMetrics.totalExpenses}
								activeProjectsCount={financialMetrics.activeProjectsCount}
								membersCount={financialMetrics.membersCount}
								showFinancials={isOwner}
							/>
						</div>
					)}

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
								className="w-full h-12 pl-11 pr-4 rounded-2xl border border-border/50 bg-card/80 backdrop-blur-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all placeholder:text-muted-foreground/60"
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
						<Tabs value={projectsTab} onValueChange={(value) => setProjectsTab(value as 'active' | 'archived')} className="w-full">
							<div className="flex items-center justify-between mb-4">
								<TabsList className="inline-flex h-10 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground">
									<TabsTrigger 
										value="active" 
										className="inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
									>
										<span className="w-2 h-2 rounded-full bg-emerald-500 mr-2" />
										Активные объекты
										{sortedActiveProjects.length > 0 && (
											<span className="ml-2 text-xs text-muted-foreground">
												({sortedActiveProjects.length})
											</span>
										)}
									</TabsTrigger>
									{sortedArchivedProjects.length > 0 && (
										<TabsTrigger 
											value="archived"
											className="inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
										>
											<span className="w-2 h-2 rounded-full bg-muted-foreground mr-2" />
											Архив
											<span className="ml-2 text-xs text-muted-foreground">
												({sortedArchivedProjects.length})
											</span>
										</TabsTrigger>
									)}
								</TabsList>
								<div className="flex items-center gap-2">
									{/* Toggle completed projects */}
									{projectsTab === 'active' && (
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
									<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
										{[1, 2, 3, 4].map(i => (
											<Skeleton key={i} className="h-48 rounded-2xl" />
										))}
									</div>
								) : sortedActiveProjects.length > 0 ? (
									<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
										{sortedActiveProjects.map(project => {
											if (!project?.id) return null
											return (
												<div key={project.id}>
													<ProjectCardDashboard
														id={project.id}
														teamId={teamId}
														name={project.name || ''}
														address={project.address}
														photoUrl={project.photoUrl}
														budget={project.budget}
														progress={project.progress || 0}
														status={project.status as any}
														startDate={project.startDate}
														endDate={project.endDate}
														profit={
															project.budget
																? project.budget * 0.35
																: null
														}
														showFinancials={isOwner}
													/>
												</div>
											)
										})}
									</div>
								) : (
									<div className="text-center py-12 rounded-2xl border-2 border-dashed border-border/50 bg-secondary/20">
										<FolderKanban className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
										<h3 className="text-lg font-medium mb-2">
											{searchQuery ? 'Объекты не найдены' : 'Пока нет объектов'}
										</h3>
										<p className="text-muted-foreground mb-4">
											{searchQuery
												? 'Попробуйте изменить поисковый запрос'
												: 'Создайте свой первый строительный объект и начните вести учёт'}
										</p>
										{!searchQuery && (
											<Button onClick={handleCreateProject}>
												<Plus className="w-4 h-4 mr-2" />
												Создать объект
											</Button>
										)}
									</div>
								)}
							</TabsContent>

							{sortedArchivedProjects.length > 0 && (
								<TabsContent value="archived" className="mt-4">
									{sortedArchivedProjects.length > 0 ? (
										<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
											{sortedArchivedProjects.map(project => {
												if (!project?.id) return null
												return (
													<div key={project.id}>
														<ProjectCardDashboard
															id={project.id}
															teamId={teamId}
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
													</div>
												)
											})}
										</div>
									) : (
										<div className="text-center py-12 rounded-2xl border-2 border-dashed border-border/50 bg-secondary/20">
											<FolderKanban className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
											<h3 className="text-lg font-medium mb-2">
												{searchQuery ? 'Архивные объекты не найдены' : 'В архиве пока нет объектов'}
											</h3>
											<p className="text-muted-foreground">
												{searchQuery
													? 'Попробуйте изменить поисковый запрос'
													: 'Архивированные объекты будут отображаться здесь'}
											</p>
										</div>
									)}
								</TabsContent>
							)}
						</Tabs>
					</motion.section>
				</div>
                ) : (
                    <div className="max-w-4xl mx-auto">
                        <div className="bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10 rounded-3xl p-6 mb-8 border border-white/10">
                            <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
                                <Banknote className="w-5 h-5 text-indigo-400" />
                                Управление зарплатами
                            </h2>
                            <p className="text-muted-foreground text-sm">
                                Настройте условия оплаты для каждого участника команды. Эти настройки будут автоматически применяться при расчете выплат в проектах.
                            </p>
                        </div>

                        {membersLoading ? (
                            <div className="space-y-4">
                                {[1, 2, 3].map(i => (
                                    <Skeleton key={i} className="h-24 w-full rounded-2xl" />
                                ))}
                            </div>
                        ) : (
                            <div className="grid gap-4">
                                {(membersData as any)?.teamMembers?.map((member: any) => (
                                    <div 
                                        key={member.id}
                                        className="bg-card border border-border/50 rounded-2xl p-4 flex items-center justify-between hover:border-primary/30 transition-all group"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center text-lg font-bold text-muted-foreground">
                                                {member.user?.fullName?.[0] || 'U'}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <h3 className="font-semibold">{member.user?.fullName}</h3>
                                                    {member.role === TeamRole.Owner && (
                                                        <Badge variant="secondary" className="text-xs bg-amber-500/10 text-amber-500 border-amber-500/20">
                                                            Владелец
                                                        </Badge>
                                                    )}
                                                </div>
                                                <p className="text-sm text-muted-foreground">{member.user?.email}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4">
                                            <MemberSalaryBadge 
                                                salaryType={member.salaryType as any}
                                                salaryAmount={member.salaryAmount}
                                            />
                                            <Button 
                                                variant="outline" 
                                                size="sm"
                                                onClick={() => setEditingMember(member)}
                                                className="opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                Настроить
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
			</main>
            
            <Dialog open={!!editingMember} onOpenChange={(open) => !open && setEditingMember(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Настройка зарплаты</DialogTitle>
                    </DialogHeader>
                    {editingMember && (
                        <SalarySettingsForm
                            memberId={editingMember.id}
                            memberName={editingMember.user?.fullName || 'Участник'}
                            currentSalaryType={editingMember.salaryType}
                            currentSalaryAmount={editingMember.salaryAmount}
                            onSubmit={handleUpdateSalary}
                            onCancel={() => setEditingMember(null)}
                            isLoading={updatingSalary}
                        />
                    )}
                </DialogContent>
            </Dialog>

			{/* FAB Button (only show in projects tab) */}
			{activeTab === 'projects' && (
                <motion.button
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
                    onClick={handleCreateProject}
                    className="fixed bottom-8 right-8 h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-lg hover:shadow-xl hover:bg-primary/90 transition-all hover:scale-105 flex items-center justify-center z-50"
                    aria-label="Создать проект"
                >
                    <Plus className="h-6 w-6" />
                </motion.button>
            )}
		</div>
	)
}
