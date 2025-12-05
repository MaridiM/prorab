'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useQuery, useMutation } from '@apollo/client/react'
import { motion, AnimatePresence } from 'framer-motion'
import {
	ProjectDocument,
	ArchiveProjectDocument,
	RestoreProjectDocument,
	ProjectsByTeamDocument,
	ExpensesByProjectDocument,
	ProjectStatsDocument,
	CreateExpenseDocument,
	UpdateExpenseDocument,
	DeleteExpenseDocument,
	ProjectPhotoReportsDocument,
	CreatePhotoReportDocument,
	UpdatePhotoReportDocument,
	DeletePhotoReportDocument,
	UploadPhotoToReportDocument,
	MyTeamsDocument,
} from '@/packages/api/graphql'
import { ProjectStatus } from '@/packages/schemas'
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	Button,
	Badge,
	ProgressBar,
	Skeleton,
} from '@/packages/components/ui'
import { ExpenseList, ExpenseForm } from '@/packages/components/expenses'
import { FinancialDashboard } from '@/packages/components/financial'
import {
	PhotoUploader,
	PhotoReportForm,
	PhotoReportCard,
} from '@/app/components/photo-reports'
import { useToast } from '@/packages/hooks'
import { useAuth } from '@/packages/libs/auth'
import {
	ArrowLeft,
	Edit,
	Archive,
	ArchiveRestore,
	MapPin,
	Calendar,
	Phone,
	Wallet,
	Plus,
	FileText,
	Camera,
	CheckSquare,
	TrendingUp,
	TrendingDown,
} from 'lucide-react'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'

const fadeIn = {
	hidden: { opacity: 0, y: 20 },
	visible: {
		opacity: 1,
		y: 0,
		transition: { duration: 0.4, ease: [0.22, 0.61, 0.36, 1] as const },
	},
}

export default function ProjectDetailsPage() {
	const params = useParams()
	const router = useRouter()
	const { user } = useAuth()
	const { showToast } = useToast()
	const teamId = params.teamId as string
	const projectId = params.projectId as string

	const [activeTab, setActiveTab] = useState<
		'info' | 'expenses' | 'tasks' | 'reports'
	>('info')
	const [showExpenseForm, setShowExpenseForm] = useState(false)
	const [editingExpense, setEditingExpense] = useState<any>(null)
	const [showReportForm, setShowReportForm] = useState(false)
	const [editingReport, setEditingReport] = useState<any>(null)
	const [selectedReportId, setSelectedReportId] = useState<string | null>(null)

	// Загрузка команды для проверки владельца
	const { data: teamsData } = useQuery(MyTeamsDocument)
	const team = teamsData?.myTeams?.find(t => t.id === teamId)
	const isOwner = team?.ownerId === user?.id

	const { data, loading, error } = useQuery(ProjectDocument, {
		variables: { id: projectId },
	})

	const { data: expensesData, loading: expensesLoading } = useQuery(
		ExpensesByProjectDocument,
		{
			variables: { projectId },
			skip: activeTab !== 'expenses',
		}
	)

	const { data: statsData, loading: statsLoading } = useQuery(
		ProjectStatsDocument,
		{
			variables: { projectId },
			skip: activeTab !== 'expenses' && activeTab !== 'info',
		}
	)

	const {
		data: reportsData,
		loading: reportsLoading,
		refetch: refetchReports,
	} = useQuery(ProjectPhotoReportsDocument, {
		variables: { projectId },
		skip: activeTab !== 'reports',
	})

	const [archiveProject, { loading: archiving }] = useMutation(
		ArchiveProjectDocument,
		{
			refetchQueries: [
				{ query: ProjectDocument, variables: { id: projectId } },
				{ query: ProjectsByTeamDocument, variables: { teamId } },
			],
		}
	)

	const [restoreProject, { loading: restoring }] = useMutation(
		RestoreProjectDocument,
		{
			refetchQueries: [
				{ query: ProjectDocument, variables: { id: projectId } },
				{ query: ProjectsByTeamDocument, variables: { teamId } },
			],
		}
	)

	const [createExpense, { loading: creating }] = useMutation(
		CreateExpenseDocument,
		{
			refetchQueries: [
				{ query: ExpensesByProjectDocument, variables: { projectId } },
				{ query: ProjectStatsDocument, variables: { projectId } },
			],
		}
	)

	const [updateExpense, { loading: updating }] = useMutation(
		UpdateExpenseDocument,
		{
			refetchQueries: [
				{ query: ExpensesByProjectDocument, variables: { projectId } },
				{ query: ProjectStatsDocument, variables: { projectId } },
			],
		}
	)

	const [deleteExpense, { loading: deleting }] = useMutation(
		DeleteExpenseDocument,
		{
			refetchQueries: [
				{ query: ExpensesByProjectDocument, variables: { projectId } },
				{ query: ProjectStatsDocument, variables: { projectId } },
			],
		}
	)

	const [createPhotoReport] = useMutation(CreatePhotoReportDocument, {
		refetchQueries: [
			{ query: ProjectPhotoReportsDocument, variables: { projectId } },
		],
	})

	const [updatePhotoReport] = useMutation(UpdatePhotoReportDocument, {
		refetchQueries: [
			{ query: ProjectPhotoReportsDocument, variables: { projectId } },
		],
	})

	const [deletePhotoReport] = useMutation(DeletePhotoReportDocument, {
		refetchQueries: [
			{ query: ProjectPhotoReportsDocument, variables: { projectId } },
		],
	})

	const [uploadPhotoToReport] = useMutation(UploadPhotoToReportDocument)

	const project = data?.project
	const expenses = expensesData?.expensesByProject || []
	const stats = statsData?.projectStats
	const reports = reportsData?.projectPhotoReports || []

	const handleEdit = () => {
		router.push(`/teams/${teamId}/projects/${projectId}/edit`)
	}

	const handleArchive = async () => {
		if (!confirm('Вы уверены, что хотите архивировать этот проект?')) return

		try {
			await archiveProject({ variables: { id: projectId } })
			showToast({
				type: 'success',
				message: 'Проект успешно архивирован',
			})
		} catch (error: any) {
			showToast({
				type: 'error',
				message: error.message || 'Не удалось архивировать проект',
			})
		}
	}

	const handleRestore = async () => {
		try {
			await restoreProject({ variables: { id: projectId } })
			showToast({
				type: 'success',
				message: 'Проект восстановлен из архива',
			})
		} catch (error: any) {
			showToast({
				type: 'error',
				message: error.message || 'Не удалось восстановить проект',
			})
		}
	}

	const handleCreateExpense = async (data: any) => {
		try {
			await createExpense({
				variables: {
					input: {
						projectId,
						...data,
					},
				},
			})
			showToast({
				type: 'success',
				message: 'Расход успешно добавлен',
			})
			setShowExpenseForm(false)
		} catch (error: any) {
			showToast({
				type: 'error',
				message: error.message || 'Не удалось добавить расход',
			})
		}
	}

	const handleUpdateExpense = async (data: any) => {
		if (!editingExpense) return

		try {
			await updateExpense({
				variables: {
					input: {
						id: editingExpense.id,
						...data,
					},
				},
			})
			showToast({
				type: 'success',
				message: 'Расход успешно обновлён',
			})
			setEditingExpense(null)
		} catch (error: any) {
			showToast({
				type: 'error',
				message: error.message || 'Не удалось обновить расход',
			})
		}
	}

	const handleDeleteExpense = async (id: string) => {
		if (!confirm('Вы уверены, что хотите удалить этот расход?')) return

		try {
			await deleteExpense({ variables: { id } })
			showToast({
				type: 'success',
				message: 'Расход успешно удалён',
			})
		} catch (error: any) {
			showToast({
				type: 'error',
				message: error.message || 'Не удалось удалить расход',
			})
		}
	}

	const handleCreateReport = async (data: any) => {
		try {
			const result = await createPhotoReport({
				variables: {
					input: {
						projectId,
						...data,
					},
				},
			})
			showToast({
				type: 'success',
				message: 'Фотоотчёт успешно создан',
			})
			setShowReportForm(false)
			if (result.data?.createPhotoReport) {
				setSelectedReportId(result.data.createPhotoReport.id)
			}
		} catch (error: any) {
			showToast({
				type: 'error',
				message: error.message || 'Не удалось создать фотоотчёт',
			})
		}
	}

	const handleUpdateReport = async (data: any) => {
		if (!editingReport) return

		try {
			await updatePhotoReport({
				variables: {
					input: {
						id: editingReport.id,
						...data,
					},
				},
			})
			showToast({
				type: 'success',
				message: 'Фотоотчёт успешно обновлён',
			})
			setEditingReport(null)
		} catch (error: any) {
			showToast({
				type: 'error',
				message: error.message || 'Не удалось обновить фотоотчёт',
			})
		}
	}

	const handleDeleteReport = async (id: string) => {
		if (!confirm('Вы уверены, что хотите удалить этот фотоотчёт?')) return

		try {
			await deletePhotoReport({ variables: { id } })
			showToast({
				type: 'success',
				message: 'Фотоотчёт успешно удалён',
			})
			if (selectedReportId === id) {
				setSelectedReportId(null)
			}
		} catch (error: any) {
			showToast({
				type: 'error',
				message: error.message || 'Не удалось удалить фотоотчёт',
			})
		}
	}

	const handleUploadPhoto = async (file: File, caption?: string) => {
		if (!selectedReportId) return

		try {
			await uploadPhotoToReport({
				variables: {
					input: {
						reportId: selectedReportId,
						file,
						caption: caption || null,
						orderIndex: 0,
					},
				},
			})
			showToast({
				type: 'success',
				message: 'Фото успешно загружено',
			})
			await refetchReports()
		} catch (error: any) {
			throw new Error(error.message || 'Не удалось загрузить фото')
		}
	}

	const formatDate = (date: string | null | undefined) => {
		if (!date) return '—'
		return format(new Date(date), 'dd MMMM yyyy', { locale: ru })
	}

	const formatCurrency = (amount: number | null | undefined) => {
		if (!amount) return '—'
		return new Intl.NumberFormat('ru-RU', {
			style: 'currency',
			currency: 'RUB',
			maximumFractionDigits: 0,
		}).format(amount)
	}

	// Loading state
	if (loading) {
		return (
			<div className="min-h-screen bg-background">
				<div className="border-b border-border/30 bg-card/80">
					<div className="container mx-auto px-4 py-4">
						<Skeleton className="h-8 w-48 mb-2" />
						<Skeleton className="h-5 w-64" />
					</div>
				</div>
				<div className="container mx-auto p-6 max-w-6xl">
					<div className="space-y-6">
						<Skeleton className="h-64 w-full rounded-2xl" />
						<Skeleton className="h-96 w-full rounded-2xl" />
					</div>
				</div>
			</div>
		)
	}

	// Error state
	if (error || !project) {
		return (
			<div className="min-h-screen bg-background flex items-center justify-center">
				<div className="text-center">
					<h3 className="text-lg font-semibold text-destructive mb-2">
						{error ? 'Ошибка загрузки проекта' : 'Проект не найден'}
					</h3>
					<p className="text-muted-foreground mb-4">
						{error?.message || 'Проект с таким ID не существует'}
					</p>
					<Button onClick={() => router.push(`/teams/${teamId}`)}>
						Вернуться к проектам
					</Button>
				</div>
			</div>
		)
	}

	const statusConfig = {
		[ProjectStatus.ACTIVE]: { label: 'Активный', variant: 'success' as const },
		[ProjectStatus.ARCHIVED]: { label: 'Архив', variant: 'secondary' as const },
		[ProjectStatus.COMPLETED]: {
			label: 'Завершён',
			variant: 'success' as const,
		},
	}

	const statusInfo = statusConfig[project.status]
	const profit = stats?.profit ?? (project.budget ? project.budget * 0.35 : 0)
	const isProfitable = profit >= 0

	const tabs = [
		{ id: 'info' as const, label: 'Информация', icon: FileText },
		{ id: 'expenses' as const, label: 'Расходы', icon: Wallet },
		{ id: 'reports' as const, label: 'Фотоотчёты', icon: Camera },
		{ id: 'tasks' as const, label: 'Задачи', icon: CheckSquare, disabled: true },
	]

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
					<div className="flex items-start justify-between">
						<div className="flex items-start gap-4">
							{/* Back Button */}
							<button
								onClick={() => router.push(`/teams/${teamId}`)}
								className="p-2 rounded-xl hover:bg-secondary/50 transition-colors mt-1"
							>
								<ArrowLeft className="w-5 h-5" />
							</button>

							{/* Project Info */}
							<div>
								<div className="flex items-center gap-3 mb-1">
									<h1 className="text-xl md:text-2xl font-bold">
										{project.name}
									</h1>
									<Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
								</div>
								{project.address && (
									<div className="flex items-center gap-1.5 text-sm text-muted-foreground">
										<MapPin className="w-4 h-4" />
										<span>{project.address}</span>
									</div>
								)}
							</div>
						</div>

						{/* Actions */}
						<div className="flex gap-2">
							<Button variant="outline" size="sm" onClick={handleEdit}>
								<Edit className="h-4 w-4 mr-2" />
								<span className="hidden sm:inline">Редактировать</span>
							</Button>
							{project.status === ProjectStatus.ARCHIVED ? (
								<Button
									variant="outline"
									size="sm"
									onClick={handleRestore}
									disabled={restoring}
								>
									<ArchiveRestore className="h-4 w-4 mr-2" />
									<span className="hidden sm:inline">Восстановить</span>
								</Button>
							) : (
								<Button
									variant="outline"
									size="sm"
									onClick={handleArchive}
									disabled={archiving}
								>
									<Archive className="h-4 w-4 mr-2" />
									<span className="hidden sm:inline">В архив</span>
								</Button>
							)}
						</div>
					</div>

					{/* Progress */}
					<div className="mt-4">
						<ProgressBar value={project.progress} showLabel size="md" />
					</div>
				</div>
			</motion.header>

			{/* Tabs */}
			<div className="border-b border-border/30 bg-card/50">
				<div className="container mx-auto px-4">
					<div className="flex gap-1 overflow-x-auto">
						{tabs.map(tab => (
							<button
								key={tab.id}
								onClick={() => !tab.disabled && setActiveTab(tab.id)}
								disabled={tab.disabled}
								className={`px-4 py-3 font-medium transition-colors border-b-2 flex items-center gap-2 whitespace-nowrap ${
									activeTab === tab.id
										? 'border-primary text-primary'
										: 'border-transparent text-muted-foreground hover:text-foreground'
								} ${tab.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
							>
								<tab.icon className="w-4 h-4" />
								{tab.label}
								{tab.disabled && (
									<span className="text-xs bg-secondary px-1.5 py-0.5 rounded">
										скоро
									</span>
								)}
							</button>
						))}
					</div>
				</div>
			</div>

			{/* Main Content */}
			<main className="container mx-auto px-4 py-6 max-w-6xl">
				<AnimatePresence mode="wait">
					{/* Info Tab */}
					{activeTab === 'info' && (
						<motion.div
							key="info"
							initial="hidden"
							animate="visible"
							exit="hidden"
							variants={fadeIn}
							className="space-y-6"
						>
							{/* Financial Summary (только для владельца) */}
							{isOwner && project.budget && (
								<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
									<Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20">
										<CardContent className="p-4">
											<div className="flex items-center gap-2 mb-2">
												<Wallet className="w-4 h-4 text-blue-500" />
												<span className="text-sm text-muted-foreground">
													Бюджет
												</span>
											</div>
											<p className="text-xl font-bold">
												{formatCurrency(project.budget)}
											</p>
										</CardContent>
									</Card>

									<Card className="bg-gradient-to-br from-red-500/10 to-red-600/5 border-red-500/20">
										<CardContent className="p-4">
											<div className="flex items-center gap-2 mb-2">
												<TrendingDown className="w-4 h-4 text-red-500" />
												<span className="text-sm text-muted-foreground">
													Расходы
												</span>
											</div>
											<p className="text-xl font-bold text-red-600 dark:text-red-400">
												{formatCurrency(stats?.totalExpenses || 0)}
											</p>
										</CardContent>
									</Card>

									<Card className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border-emerald-500/20">
										<CardContent className="p-4">
											<div className="flex items-center gap-2 mb-2">
												{isProfitable ? (
													<TrendingUp className="w-4 h-4 text-emerald-500" />
												) : (
													<TrendingDown className="w-4 h-4 text-red-500" />
												)}
												<span className="text-sm text-muted-foreground">
													{isProfitable ? 'Прибыль' : 'Убыток'}
												</span>
											</div>
											<p
												className={`text-xl font-bold ${
													isProfitable
														? 'text-emerald-600 dark:text-emerald-400'
														: 'text-red-600 dark:text-red-400'
												}`}
											>
												{formatCurrency(Math.abs(profit))}
											</p>
										</CardContent>
									</Card>

									<Card className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 border-amber-500/20">
										<CardContent className="p-4">
											<div className="flex items-center gap-2 mb-2">
												<Calendar className="w-4 h-4 text-amber-500" />
												<span className="text-sm text-muted-foreground">
													Прогресс
												</span>
											</div>
											<p className="text-xl font-bold">{project.progress}%</p>
										</CardContent>
									</Card>
								</div>
							)}

							{/* Project Details */}
							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								{/* Basic Info */}
								<Card>
									<CardHeader>
										<CardTitle>Основная информация</CardTitle>
									</CardHeader>
									<CardContent className="space-y-4">
										{project.budget && (
											<div className="flex items-start gap-3">
												<Wallet className="h-5 w-5 text-muted-foreground mt-0.5" />
												<div className="flex-1">
													<p className="text-sm text-muted-foreground">
														Бюджет
													</p>
													<p className="font-semibold">
														{formatCurrency(project.budget)}
													</p>
												</div>
											</div>
										)}

										{project.clientPhone && (
											<div className="flex items-start gap-3">
												<Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
												<div className="flex-1">
													<p className="text-sm text-muted-foreground">
														Телефон клиента
													</p>
													<p className="font-semibold">
														<a
															href={`tel:${project.clientPhone}`}
															className="hover:text-primary transition-colors"
														>
															{project.clientPhone}
														</a>
													</p>
												</div>
											</div>
										)}

										{(project.startDate || project.endDate) && (
											<div className="flex items-start gap-3">
												<Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
												<div className="flex-1">
													<p className="text-sm text-muted-foreground">
														Срок выполнения
													</p>
													<p className="font-semibold">
														{formatDate(project.startDate)} —{' '}
														{formatDate(project.endDate)}
													</p>
												</div>
											</div>
										)}

										<div className="pt-2 border-t">
											<p className="text-xs text-muted-foreground">
												Создан {formatDate(project.createdAt)}
											</p>
											{project.updatedAt && (
												<p className="text-xs text-muted-foreground">
													Обновлён {formatDate(project.updatedAt)}
												</p>
											)}
										</div>
									</CardContent>
								</Card>

								{/* Description & Notes */}
								<Card>
									<CardHeader>
										<CardTitle>Описание и заметки</CardTitle>
									</CardHeader>
									<CardContent className="space-y-4">
										{project.description && (
											<div>
												<p className="text-sm text-muted-foreground mb-1">
													Описание
												</p>
												<p className="text-sm whitespace-pre-wrap">
													{project.description}
												</p>
											</div>
										)}

										{project.notes && (
											<div
												className={project.description ? 'pt-4 border-t' : ''}
											>
												<p className="text-sm text-muted-foreground mb-1">
													Заметки
												</p>
												<p className="text-sm whitespace-pre-wrap">
													{project.notes}
												</p>
											</div>
										)}

										{!project.description && !project.notes && (
											<p className="text-sm text-muted-foreground italic">
												Нет описания или заметок
											</p>
										)}
									</CardContent>
								</Card>
							</div>
						</motion.div>
					)}

					{/* Expenses Tab */}
					{activeTab === 'expenses' && (
						<motion.div
							key="expenses"
							initial="hidden"
							animate="visible"
							exit="hidden"
							variants={fadeIn}
							className="space-y-6"
						>
							{/* Financial Dashboard */}
							{stats && isOwner && (
								<FinancialDashboard
									stats={{
										totalExpenses: stats.totalExpenses,
										profit: stats.profit,
										expenseCount: stats.expenseCount,
										budget: project.budget,
									}}
									expenses={expenses}
								/>
							)}

							{/* Expense Form */}
							{(showExpenseForm || editingExpense) && (
								<Card>
									<CardHeader>
										<CardTitle>
											{editingExpense
												? 'Редактировать расход'
												: 'Добавить расход'}
										</CardTitle>
									</CardHeader>
									<CardContent>
										<ExpenseForm
											mode={editingExpense ? 'edit' : 'create'}
											projectId={projectId}
											defaultValues={editingExpense}
											onSubmit={
												editingExpense
													? handleUpdateExpense
													: handleCreateExpense
											}
											onCancel={() => {
												setShowExpenseForm(false)
												setEditingExpense(null)
											}}
											isSubmitting={creating || updating}
										/>
									</CardContent>
								</Card>
							)}

							{/* Expense List */}
							{!showExpenseForm && !editingExpense && (
								<ExpenseList
									expenses={expenses}
									isLoading={expensesLoading}
									onAdd={() => setShowExpenseForm(true)}
									onEdit={id => {
										const expense = expenses.find((e: any) => e.id === id)
										if (expense) setEditingExpense(expense)
									}}
									onDelete={handleDeleteExpense}
								/>
							)}
						</motion.div>
					)}

					{/* Tasks Tab */}
					{activeTab === 'tasks' && (
						<motion.div
							key="tasks"
							initial="hidden"
							animate="visible"
							exit="hidden"
							variants={fadeIn}
						>
							<Card>
								<CardContent className="py-12">
									<div className="text-center text-muted-foreground">
										<CheckSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
										<p className="text-lg font-medium mb-2">
											Раздел задач скоро будет доступен
										</p>
										<p className="text-sm">
											Kanban-доска для управления задачами проекта
										</p>
									</div>
								</CardContent>
							</Card>
						</motion.div>
					)}

					{/* Reports Tab */}
					{activeTab === 'reports' && (
						<motion.div
							key="reports"
							initial="hidden"
							animate="visible"
							exit="hidden"
							variants={fadeIn}
							className="space-y-6"
						>
							{/* Report Form */}
							{(showReportForm || editingReport) && (
								<Card>
									<CardHeader>
										<CardTitle>
											{editingReport
												? 'Редактировать фотоотчёт'
												: 'Создать фотоотчёт'}
										</CardTitle>
									</CardHeader>
									<CardContent>
										<PhotoReportForm
											projectId={projectId}
											report={editingReport}
											onSubmit={
												editingReport ? handleUpdateReport : handleCreateReport
											}
											onCancel={() => {
												setShowReportForm(false)
												setEditingReport(null)
											}}
										/>
									</CardContent>
								</Card>
							)}

							{/* Photo Reports List */}
							{!showReportForm && !editingReport && (
								<>
									<div className="flex items-center justify-between">
										<h2 className="text-xl font-semibold">
											Фотоотчёты ({reports.length})
										</h2>
										<Button onClick={() => setShowReportForm(true)}>
											<Plus className="h-4 w-4 mr-2" />
											Создать фотоотчёт
										</Button>
									</div>

									{reportsLoading ? (
										<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
											{[1, 2, 3].map(i => (
												<Skeleton key={i} className="h-80 rounded-2xl" />
											))}
										</div>
									) : reports.length === 0 ? (
										<Card>
											<CardContent className="py-12">
												<div className="text-center text-muted-foreground">
													<Camera className="w-12 h-12 mx-auto mb-4 opacity-50" />
													<p className="text-lg font-medium mb-2">
														Нет фотоотчётов
													</p>
													<p className="text-sm mb-4">
														Создайте фотоотчёт для отправки клиенту
													</p>
													<Button onClick={() => setShowReportForm(true)}>
														<Plus className="h-4 w-4 mr-2" />
														Создать первый фотоотчёт
													</Button>
												</div>
											</CardContent>
										</Card>
									) : (
										<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
											{reports.map((report: any) => (
												<PhotoReportCard
													key={report.id}
													report={report}
													onEdit={() => setEditingReport(report)}
													onDelete={() => handleDeleteReport(report.id)}
												/>
											))}
										</div>
									)}
								</>
							)}

							{/* Photo Uploader for selected report */}
							{selectedReportId && !showReportForm && !editingReport && (
								<Card>
									<CardHeader>
										<CardTitle>Загрузить фото в отчёт</CardTitle>
									</CardHeader>
									<CardContent>
										<PhotoUploader
											reportId={selectedReportId}
											onUpload={handleUploadPhoto}
										/>
									</CardContent>
								</Card>
							)}
						</motion.div>
					)}
				</AnimatePresence>
			</main>

			{/* FAB for adding expense (only on expenses tab) */}
			{activeTab === 'expenses' && !showExpenseForm && !editingExpense && (
				<motion.button
					initial={{ scale: 0, opacity: 0 }}
					animate={{ scale: 1, opacity: 1 }}
					transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
					onClick={() => setShowExpenseForm(true)}
					className="fixed bottom-8 right-8 h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-lg hover:shadow-xl hover:bg-primary/90 transition-all hover:scale-105 flex items-center justify-center z-50"
					aria-label="Добавить расход"
				>
					<Plus className="h-6 w-6" />
				</motion.button>
			)}
		</div>
	)
}
