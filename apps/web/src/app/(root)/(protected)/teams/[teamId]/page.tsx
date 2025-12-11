'use client'

import { useState, useMemo, useEffect, useTransition } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { useQuery, useMutation } from '@apollo/client/react'
import { gql } from '@apollo/client'
import { motion, AnimatePresence } from 'framer-motion'
import {
	ProjectsByTeamDocument,
	MyTeamsDocument,
	ProjectStatsDocument,
} from '@/packages/api/graphql'
import { ProjectStatus } from '@/packages/schemas'
import { ProjectCardDashboard } from '@/packages/components/dashboard'
import { FinancialSummary } from '@/packages/components/dashboard'
import { Button, Skeleton, Badge, UserMenu, Dialog, DialogContent, DialogHeader, DialogTitle } from '@/packages/components/ui'
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
    const [editingMember, setEditingMember] = useState<any>(null)
	const [, startTransition] = useTransition()
    const { showToast } = useToast()

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
        TEAM_MEMBERS_QUERY,
        {
            variables: { teamId },
            skip: activeTab !== 'salaries'
        }
    )

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
		// Создаем новый массив при каждом изменении данных, чтобы избежать мутаций
		return projectsData?.projectsByTeam || []
	}, [projectsData])

	// Фильтрация проектов
	const filteredProjects = useMemo(() => {
		let projects = [...allProjects]

		// Фильтрация по статусу
		if (statusFilter !== 'ALL') {
			projects = projects.filter(p => p?.status === statusFilter)
		}

		// Фильтрация по поиску
		if (searchQuery) {
			const query = searchQuery.toLowerCase()
			projects = projects.filter(
				p =>
					p?.name?.toLowerCase().includes(query) ||
					p?.address?.toLowerCase().includes(query)
			)
		}

		return projects
	}, [allProjects, statusFilter, searchQuery])

	// Разделение на активные и архивные на основе текущего фильтра
	const activeProjects = useMemo(() => {
		if (statusFilter === 'COMPLETED') {
			// Для завершенных показываем только завершенные (filteredProjects уже отфильтрован)
			return filteredProjects
		} else if (statusFilter === 'ACTIVE') {
			// Для активных показываем только активные (filteredProjects уже отфильтрован)
			return filteredProjects
		} else {
			// Для "Все проекты" показываем активные и завершенные
			return filteredProjects.filter(
				p =>
					p?.status === ProjectStatus.ACTIVE ||
					p?.status === ProjectStatus.COMPLETED
			)
		}
	}, [filteredProjects, statusFilter])

	const archivedProjects = useMemo(() => {
		if (statusFilter === 'ARCHIVED') {
			// Для архива показываем все отфильтрованные проекты (они уже архивные)
			return filteredProjects
		} else {
			// Для других фильтров показываем архивные из отфильтрованных
			return filteredProjects.filter(p => p?.status === ProjectStatus.ARCHIVED)
		}
	}, [filteredProjects, statusFilter])

	// Финансовые метрики
	const financialMetrics = useMemo(() => {
		const active = allProjects.filter(
			p =>
				p?.status === ProjectStatus.ACTIVE ||
				p?.status === ProjectStatus.COMPLETED
		)

		const totalBudget = active.reduce((sum, p) => sum + (p?.budget || 0), 0)
		// TODO: Получить реальные расходы из API
		const totalExpenses = totalBudget * 0.65

		return {
			totalBudget,
			totalExpenses,
			activeProjectsCount: active.length,
			membersCount: 1, // TODO: Получить из API
		}
	}, [allProjects])

	const handleCreateProject = () => {
		router.push(`/teams/${teamId}/projects/new`)
	}

	const handleBack = () => {
		router.push('/dashboard')
	}

	// Loading state
	if ((teamsLoading || projectsLoading) && !projectsData) {
		return (
			<div className="min-h-screen bg-background">
				{/* Header Skeleton */}
				<div className="border-b border-border/30 bg-card/50">
					<div className="container mx-auto px-4 py-4">
						<Skeleton className="h-8 w-48 mb-2" />
						<Skeleton className="h-5 w-64" />
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
				<div className="container mx-auto px-4 py-4">
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
										{activeProjects.length}{' '}
										{activeProjects.length === 1
											? 'активный проект'
											: activeProjects.length >= 2 &&
											  activeProjects.length <= 4
											? 'активных проекта'
											: 'активных проектов'}
									</p>
								</div>
							</div>
						</div>

						{/* Actions */}
						<div className="flex items-center gap-2">
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
				<div className="container mx-auto px-4">
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
			<main className="container mx-auto px-4 py-6">
                {activeTab === 'projects' ? (
				<motion.div initial="hidden" animate="visible" variants={stagger}>
					{/* Financial Summary (только для владельца) */}
					{isOwner && financialMetrics.totalBudget > 0 && (
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

					{/* Filters */}
					<motion.div variants={fadeIn} className="mb-6 space-y-4">
						{/* Status Tabs */}
						<div className="flex flex-wrap gap-2">
							{[
								{ value: 'ALL' as const, label: 'Все проекты' },
								{ value: 'ACTIVE' as const, label: 'Активные' },
								{ value: 'COMPLETED' as const, label: 'Завершённые' },
								{ value: 'ARCHIVED' as const, label: 'Архив' },
							].map(tab => (
								<Button
									key={tab.value}
									variant={statusFilter === tab.value ? 'default' : 'outline'}
									onClick={() => setStatusFilter(tab.value)}
									size="sm"
									className="rounded-xl"
								>
									{tab.label}
								</Button>
							))}
						</div>

						{/* Search */}
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
					{statusFilter !== 'ARCHIVED' && (
						<motion.section variants={fadeIn} className="mb-8">
							<h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
								<span className="w-2 h-2 rounded-full bg-emerald-500" />
								{statusFilter === 'COMPLETED'
									? 'Завершённые проекты'
									: statusFilter === 'ACTIVE'
									? 'Активные проекты'
									: 'Проекты'}
								{activeProjects.length > 0 && (
									<span className="text-sm font-normal text-muted-foreground">
										({activeProjects.length})
									</span>
								)}
							</h2>

							{activeProjects.length > 0 ? (
								<motion.div
									variants={stagger}
									className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
								>
									{activeProjects.map(project =>
										project?.id ? (
											<motion.div key={project.id} variants={fadeIn}>
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
											</motion.div>
										) : null
									)}
								</motion.div>
							) : (
								<motion.div
									variants={fadeIn}
									className="text-center py-12 rounded-2xl border-2 border-dashed border-border/50 bg-secondary/20"
								>
									<FolderKanban className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
									<h3 className="text-lg font-medium mb-2">
										{searchQuery
											? 'Проекты не найдены'
											: 'Пока нет проектов'}
									</h3>
									<p className="text-muted-foreground mb-4">
										{searchQuery
											? 'Попробуйте изменить поисковый запрос'
											: 'Создайте свой первый строительный проект'}
									</p>
									{!searchQuery && (
										<Button onClick={handleCreateProject}>
											<Plus className="w-4 h-4 mr-2" />
											Создать проект
										</Button>
									)}
								</motion.div>
							)}
						</motion.section>
					)}

					{/* Archived Projects */}
					{(statusFilter === 'ALL' || statusFilter === 'ARCHIVED') &&
						archivedProjects.length > 0 && (
							<motion.section variants={fadeIn}>
								{statusFilter === 'ALL' ? (
									<>
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
													{archivedProjects.map(project =>
														project?.id ? (
															<ProjectCardDashboard
																key={project.id}
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
														) : null
													)}
												</motion.div>
											)}
										</AnimatePresence>
									</>
								) : (
									<>
										<h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
											<span className="w-2 h-2 rounded-full bg-muted-foreground" />
											Архивные проекты
											<span className="text-sm font-normal text-muted-foreground">
												({archivedProjects.length})
											</span>
										</h2>
										<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
											{archivedProjects.map(project =>
												project?.id ? (
													<ProjectCardDashboard
														key={project.id}
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
												) : null
											)}
										</div>
									</>
								)}
							</motion.section>
						)}
				</motion.div>
                ) : (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                        className="max-w-4xl mx-auto"
                    >
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
                                {membersData?.teamMembers?.map((member) => (
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
                                                    {member.role === 'owner' && (
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
                    </motion.div>
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
