'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useQuery, useMutation } from '@apollo/client/react'
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
import { ExpenseList } from '@/packages/components/expenses'
import { FinancialDashboard } from '@/packages/components/financial'
import { ExpenseForm } from '@/packages/components/expenses'
import { useToast } from '@/packages/hooks'
import { ArrowLeft, Edit, Archive, ArchiveRestore, MapPin, Calendar, Phone, Wallet } from 'lucide-react'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'

export default function ProjectDetailsPage() {
	const params = useParams()
	const router = useRouter()
	const { showToast } = useToast()
	const teamId = params.teamId as string
	const projectId = params.projectId as string

	const [activeTab, setActiveTab] = useState<'info' | 'expenses' | 'tasks' | 'reports'>('info')
	const [showExpenseForm, setShowExpenseForm] = useState(false)
	const [editingExpense, setEditingExpense] = useState<any>(null)

	const { data, loading, error } = useQuery(ProjectDocument, {
		variables: { id: projectId },
	})

	const { data: expensesData, loading: expensesLoading } = useQuery(ExpensesByProjectDocument, {
		variables: { projectId },
		skip: activeTab !== 'expenses',
	})

	const { data: statsData, loading: statsLoading } = useQuery(ProjectStatsDocument, {
		variables: { projectId },
		skip: activeTab !== 'expenses',
	})

	const [archiveProject, { loading: archiving }] = useMutation(ArchiveProjectDocument, {
		refetchQueries: [
			{ query: ProjectDocument, variables: { id: projectId } },
			{ query: ProjectsByTeamDocument, variables: { teamId } },
		],
	})

	const [restoreProject, { loading: restoring }] = useMutation(RestoreProjectDocument, {
		refetchQueries: [
			{ query: ProjectDocument, variables: { id: projectId } },
			{ query: ProjectsByTeamDocument, variables: { teamId } },
		],
	})

	const [createExpense, { loading: creating }] = useMutation(CreateExpenseDocument, {
		refetchQueries: [
			{ query: ExpensesByProjectDocument, variables: { projectId } },
			{ query: ProjectStatsDocument, variables: { projectId } },
		],
	})

	const [updateExpense, { loading: updating }] = useMutation(UpdateExpenseDocument, {
		refetchQueries: [
			{ query: ExpensesByProjectDocument, variables: { projectId } },
			{ query: ProjectStatsDocument, variables: { projectId } },
		],
	})

	const [deleteExpense, { loading: deleting }] = useMutation(DeleteExpenseDocument, {
		refetchQueries: [
			{ query: ExpensesByProjectDocument, variables: { projectId } },
			{ query: ProjectStatsDocument, variables: { projectId } },
		],
	})

	const project = data?.project
	const expenses = expensesData?.expensesByProject || []
	const stats = statsData?.projectStats

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
			<div className="container mx-auto p-6 max-w-6xl">
				<Skeleton className="h-8 w-48 mb-6" />
				<div className="space-y-6">
					<Skeleton className="h-64 w-full" />
					<Skeleton className="h-96 w-full" />
				</div>
			</div>
		)
	}

	// Error state
	if (error || !project) {
		return (
			<div className="container mx-auto p-6 max-w-6xl">
				<div className="flex items-center justify-center min-h-[400px]">
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
			</div>
		)
	}

	const statusConfig = {
		[ProjectStatus.ACTIVE]: { label: 'Активный', variant: 'success' as const },
		[ProjectStatus.ARCHIVED]: { label: 'Архив', variant: 'secondary' as const },
		[ProjectStatus.COMPLETED]: { label: 'Завершён', variant: 'success' as const },
	}

	const statusInfo = statusConfig[project.status]

	return (
		<div className="container mx-auto p-6 max-w-6xl">
			{/* Back Button */}
			<button
				onClick={() => router.push(`/teams/${teamId}`)}
				className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
			>
				<ArrowLeft className="h-4 w-4" />
				Назад к проектам
			</button>

			{/* Header */}
			<div className="mb-6">
				<div className="flex items-start justify-between mb-4">
					<div className="flex-1">
						<div className="flex items-center gap-3 mb-2">
							<h1 className="text-3xl font-bold">{project.name}</h1>
							<Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
						</div>
						{project.address && (
							<div className="flex items-center gap-2 text-muted-foreground">
								<MapPin className="h-4 w-4" />
								<span>{project.address}</span>
							</div>
						)}
					</div>
					<div className="flex gap-2">
						<Button variant="outline" onClick={handleEdit}>
							<Edit className="h-4 w-4 mr-2" />
							Редактировать
						</Button>
						{project.status === ProjectStatus.ARCHIVED ? (
							<Button
								variant="outline"
								onClick={handleRestore}
								disabled={restoring}
							>
								<ArchiveRestore className="h-4 w-4 mr-2" />
								Восстановить
							</Button>
						) : (
							<Button
								variant="outline"
								onClick={handleArchive}
								disabled={archiving}
							>
								<Archive className="h-4 w-4 mr-2" />
								В архив
							</Button>
						)}
					</div>
				</div>

				{/* Progress */}
				<ProgressBar value={project.progress} showLabel size="md" />
			</div>

			{/* Tabs */}
			<div className="flex gap-2 mb-6 border-b">
				{[
					{ id: 'info' as const, label: 'Информация' },
					{ id: 'expenses' as const, label: 'Расходы', disabled: false },
					{ id: 'tasks' as const, label: 'Задачи', disabled: true },
					{ id: 'reports' as const, label: 'Фотоотчёты', disabled: true },
				].map(tab => (
					<button
						key={tab.id}
						onClick={() => !tab.disabled && setActiveTab(tab.id)}
						disabled={tab.disabled}
						className={`px-4 py-2 font-medium transition-colors border-b-2 ${
							activeTab === tab.id
								? 'border-primary text-primary'
								: 'border-transparent text-muted-foreground hover:text-foreground'
						} ${tab.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
					>
						{tab.label}
						{tab.disabled && <span className="text-xs ml-1">(скоро)</span>}
					</button>
				))}
			</div>

			{/* Tab Content */}
			{activeTab === 'info' && (
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
										<p className="text-sm text-muted-foreground">Бюджет</p>
										<p className="font-semibold">{formatCurrency(project.budget)}</p>
									</div>
								</div>
							)}

							{project.clientPhone && (
								<div className="flex items-start gap-3">
									<Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
									<div className="flex-1">
										<p className="text-sm text-muted-foreground">Телефон клиента</p>
										<p className="font-semibold">
											<a href={`tel:${project.clientPhone}`} className="hover:underline">
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
										<p className="text-sm text-muted-foreground">Срок выполнения</p>
										<p className="font-semibold">
											{formatDate(project.startDate)} — {formatDate(project.endDate)}
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
									<p className="text-sm text-muted-foreground mb-1">Описание</p>
									<p className="text-sm whitespace-pre-wrap">{project.description}</p>
								</div>
							)}

							{project.notes && (
								<div className={project.description ? 'pt-4 border-t' : ''}>
									<p className="text-sm text-muted-foreground mb-1">Заметки</p>
									<p className="text-sm whitespace-pre-wrap">{project.notes}</p>
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
			)}

			{activeTab === 'expenses' && (
				<div className="space-y-6">
					{/* Financial Dashboard */}
					{stats && (
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
									{editingExpense ? 'Редактировать расход' : 'Добавить расход'}
								</CardTitle>
							</CardHeader>
							<CardContent>
								<ExpenseForm
									mode={editingExpense ? 'edit' : 'create'}
									projectId={projectId}
									defaultValues={editingExpense}
									onSubmit={editingExpense ? handleUpdateExpense : handleCreateExpense}
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
							onEdit={(id) => {
								const expense = expenses.find((e: any) => e.id === id)
								if (expense) setEditingExpense(expense)
							}}
							onDelete={handleDeleteExpense}
						/>
					)}
				</div>
			)}

			{activeTab === 'tasks' && (
				<Card>
					<CardContent className="py-12">
						<div className="text-center text-muted-foreground">
							<p>Раздел задач будет доступен в следующих версиях</p>
						</div>
					</CardContent>
				</Card>
			)}

			{activeTab === 'reports' && (
				<Card>
					<CardContent className="py-12">
						<div className="text-center text-muted-foreground">
							<p>Раздел фотоотчётов будет доступен в следующих версиях</p>
						</div>
					</CardContent>
				</Card>
			)}
		</div>
	)
}
