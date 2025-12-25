'use client'

import { useState, useEffect } from 'react'
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/packages/components/ui/card'
import { Button } from '@/packages/components/ui/button'
import { Input } from '@/packages/components/ui/input'
import { AdminPageSkeleton } from '@/packages/components/ui/admin-page-skeleton'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/packages/components/ui/select'
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/packages/components/ui/table'
import { Badge } from '@/packages/components/ui/badge'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/packages/components/ui/dropdown-menu'
import {
	Search,
	MoreVertical,
	Plus,
	Edit,
	Archive,
	CheckCircle,
	Trash2,
	X,
	CreditCard,
	Users,
	Coins,
} from 'lucide-react'
import {
	GetAdminPlansDocument,
	GetAdminPlanDocument,
	UpdateAdminPlanDocument,
	ArchiveAdminPlanDocument,
	ActivateAdminPlanDocument,
	DeleteAdminPlanDocument,
} from '@/packages/api/graphql/__generated__/output'
import { useQuery, useMutation } from '@apollo/client/react'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/packages/components/ui/dialog'
import { Label } from '@/packages/components/ui/label'
import { Textarea } from '@/packages/components/ui/textarea'
import { Checkbox } from '@/packages/components/ui/checkbox'
import { toast } from 'sonner'

const formatCurrency = (amount: number, currency: string) => {
	return new Intl.NumberFormat('ru-RU', {
		style: 'currency',
		currency: currency,
		minimumFractionDigits: 0,
		maximumFractionDigits: 0,
	}).format(amount)
}

export function SubscriptionPlansPanel() {
	const [search, setSearch] = useState('')
	const [debouncedSearch, setDebouncedSearch] = useState('')
	const [statusFilter, setStatusFilter] = useState<string>('all')
	const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null)
	const [isEditing, setIsEditing] = useState(false)

	// Debounce search input
	useEffect(() => {
		const timer = setTimeout(() => {
			setDebouncedSearch(search)
		}, 500) // 500ms debounce delay

		return () => clearTimeout(timer)
	}, [search])

	const { data, loading, refetch } = useQuery(GetAdminPlansDocument, {
		variables: {
			isActive: statusFilter === 'all' ? null : statusFilter === 'active',
			search: debouncedSearch || null,
		},
	})

	const plans = data?.adminPlans || []

	// Mutations
	const [archivePlan] = useMutation(ArchiveAdminPlanDocument, {
		onCompleted: () => {
			toast.success('План успешно архивирован')
			setSelectedPlanId(null)
			refetch()
		},
		onError: (error) => {
			toast.error(`Ошибка архивирования плана: ${error.message}`)
		},
	})

	const [activatePlan] = useMutation(ActivateAdminPlanDocument, {
		onCompleted: () => {
			toast.success('План успешно активирован')
			setSelectedPlanId(null)
			refetch()
		},
		onError: (error) => {
			toast.error(`Ошибка активации плана: ${error.message}`)
		},
	})

	const [deletePlan] = useMutation(DeleteAdminPlanDocument, {
		onCompleted: () => {
			toast.success('План успешно удален')
			setSelectedPlanId(null)
			refetch()
		},
		onError: (error) => {
			toast.error(`Ошибка удаления плана: ${error.message}`)
		},
	})

	if (loading && !data) {
		return <AdminPageSkeleton />
	}

	const getStatusBadge = (isActive: boolean) => {
		if (isActive) {
			return <Badge className="bg-green-500 hover:bg-green-600">Активен</Badge>
		}
		return <Badge variant="secondary">Архивный</Badge>
	}

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex justify-between items-start">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">Тарифные планы</h1>
					<p className="text-muted-foreground mt-2">
						Управление тарифными планами, ценами и функциями
					</p>
				</div>
				<Button>
					<Plus className="h-4 w-4 mr-2" />
					Создать план
				</Button>
			</div>

			{/* Stats Cards */}
			<div className="grid gap-4 md:grid-cols-4">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Всего планов</CardTitle>
						<CreditCard className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{plans.length}</div>
						<p className="text-xs text-muted-foreground mt-1">Всего тарифных планов</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Активных планов</CardTitle>
						<CheckCircle className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{plans.filter((p) => p.isActive).length}
						</div>
						<p className="text-xs text-muted-foreground mt-1">
							из {plans.length} доступны
						</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Подписок</CardTitle>
						<Users className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{plans.reduce((sum, p) => sum + (p.subscriptionsCount || 0), 0)}
						</div>
						<p className="text-xs text-muted-foreground mt-1">Активных подписок</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Валют</CardTitle>
						<Coins className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{plans.length > 0
								? new Set(plans.flatMap((p) => p.prices.map((pr) => pr.currency))).size
								: 0}
						</div>
						<p className="text-xs text-muted-foreground mt-1">Поддерживаемых валют</p>
					</CardContent>
				</Card>
			</div>

			{/* Filters */}
			<Card>
				<CardHeader>
					<CardTitle>Фильтры</CardTitle>
					<CardDescription>Поиск и фильтрация тарифных планов</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="flex gap-4">
						<div className="flex-1 relative">
							<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
							<Input
								placeholder="Поиск по названию или slug..."
								value={search}
								onChange={(e) => setSearch(e.target.value)}
								className="pl-10"
							/>
						</div>
						<Select value={statusFilter} onValueChange={setStatusFilter}>
							<SelectTrigger className="w-[180px]">
								<SelectValue placeholder="Статус" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">Все статусы</SelectItem>
								<SelectItem value="active">Активные</SelectItem>
								<SelectItem value="archived">Архивные</SelectItem>
							</SelectContent>
						</Select>
					</div>
				</CardContent>
			</Card>

			{/* Plans Table */}
			<Card>
				<CardHeader>
					<CardTitle>Тарифные планы</CardTitle>
					<CardDescription>
						Список всех тарифных планов. Нажмите на строку для просмотра деталей.
					</CardDescription>
				</CardHeader>
				<CardContent className="p-0">
					<div className="overflow-x-auto">
						<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Название</TableHead>
							<TableHead>Slug</TableHead>
							<TableHead>Статус</TableHead>
							<TableHead>Проекты</TableHead>
							<TableHead>Участники</TableHead>
							<TableHead>Хранилище</TableHead>
							<TableHead>Цены</TableHead>
							<TableHead>Подписки</TableHead>
							<TableHead className="w-[50px]"></TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{plans.length === 0 ? (
							<TableRow>
								<TableCell colSpan={9} className="text-center py-12 text-muted-foreground">
									<div className="flex flex-col items-center gap-2">
										<CreditCard className="h-8 w-8 text-muted-foreground/50" />
										<p>Планы не найдены</p>
									</div>
								</TableCell>
							</TableRow>
						) : (
							plans.map((plan) => (
								<TableRow
									key={plan.id}
									className="cursor-pointer hover:bg-muted/50"
									onClick={(e) => {
										// Don't open dialog if clicking on dropdown or button
										if (
											(e.target as HTMLElement).closest('[role="menu"]') ||
											(e.target as HTMLElement).closest('button')
										) {
											return
										}
										setSelectedPlanId(plan.id)
										setIsEditing(false)
									}}
								>
									<TableCell className="font-medium">
										<div className="flex items-center gap-2">
											{plan.name}
											{plan.isPopular && (
												<Badge variant="outline" className="text-xs">
													Популярный
												</Badge>
											)}
										</div>
									</TableCell>
									<TableCell>
										<code className="text-xs bg-muted px-2 py-1 rounded">{plan.slug}</code>
									</TableCell>
									<TableCell>{getStatusBadge(plan.isActive)}</TableCell>
									<TableCell>
										{plan.maxActiveProjects === null ? (
											<span className="text-muted-foreground">Без ограничений</span>
										) : (
											plan.maxActiveProjects
										)}
									</TableCell>
									<TableCell>{plan.maxMembers}</TableCell>
									<TableCell>{plan.storageGB} ГБ</TableCell>
									<TableCell>
										<div className="flex flex-wrap gap-1.5">
											{plan.prices.map((price) => (
												<Badge
													key={price.id}
													variant="secondary"
													className="text-xs font-medium"
												>
													{formatCurrency(price.price, price.currency)}/{price.billingCycleDays}д
												</Badge>
											))}
										</div>
									</TableCell>
									<TableCell>{plan.subscriptionsCount || 0}</TableCell>
									<TableCell onClick={(e) => e.stopPropagation()}>
										<DropdownMenu>
											<DropdownMenuTrigger asChild>
												<Button variant="ghost" size="sm">
													<MoreVertical className="h-4 w-4" />
												</Button>
											</DropdownMenuTrigger>
											<DropdownMenuContent align="end">
												<DropdownMenuLabel>Действия</DropdownMenuLabel>
												<DropdownMenuSeparator />
												<DropdownMenuItem
													onSelect={(e) => {
														e.preventDefault()
														setSelectedPlanId(plan.id)
														setIsEditing(true)
													}}
												>
													<Edit className="h-4 w-4 mr-2" />
													Редактировать
												</DropdownMenuItem>
												{plan.isActive ? (
													<DropdownMenuItem
														onSelect={(e) => {
															e.preventDefault()
															if (
																confirm('Вы уверены, что хотите архивировать этот план?')
															) {
																archivePlan({ variables: { id: plan.id } })
															}
														}}
													>
														<Archive className="h-4 w-4 mr-2" />
														Архивировать
													</DropdownMenuItem>
												) : (
													<DropdownMenuItem
														onSelect={(e) => {
															e.preventDefault()
															activatePlan({ variables: { id: plan.id } })
														}}
													>
														<CheckCircle className="h-4 w-4 mr-2" />
														Активировать
													</DropdownMenuItem>
												)}
												<DropdownMenuSeparator />
												<DropdownMenuItem
													className="text-destructive focus:text-destructive"
													disabled={(plan.subscriptionsCount || 0) > 0}
													onSelect={(e) => {
														e.preventDefault()
														if (
															confirm(
																'Вы уверены, что хотите удалить этот план? Это действие нельзя отменить.'
															)
														) {
															deletePlan({ variables: { id: plan.id } })
														}
													}}
												>
													<Trash2 className="h-4 w-4 mr-2" />
													Удалить
												</DropdownMenuItem>
											</DropdownMenuContent>
										</DropdownMenu>
									</TableCell>
								</TableRow>
							))
						)}
					</TableBody>
						</Table>
					</div>
				</CardContent>
			</Card>

			{/* Plan Detail Dialog */}
			{selectedPlanId && (
				<PlanDetailDialog
					planId={selectedPlanId}
					isEditing={isEditing}
					onClose={() => {
						setSelectedPlanId(null)
						setIsEditing(false)
					}}
					onSuccess={() => {
						setSelectedPlanId(null)
						setIsEditing(false)
						refetch()
					}}
					onArchive={(planId) => {
						if (confirm('Are you sure you want to archive this plan?')) {
							archivePlan({ variables: { id: planId } })
						}
					}}
					onActivate={(planId) => {
						activatePlan({ variables: { id: planId } })
					}}
					onDelete={(planId) => {
						if (confirm('Are you sure you want to delete this plan? This action cannot be undone.')) {
							deletePlan({ variables: { id: planId } })
						}
					}}
				/>
			)}
		</div>
	)
}

// Plan Detail Dialog Component
function PlanDetailDialog({
	planId,
	isEditing,
	onClose,
	onSuccess,
	onArchive,
	onActivate,
	onDelete,
}: {
	planId: string
	isEditing: boolean
	onClose: () => void
	onSuccess: () => void
	onArchive: (planId: string) => void
	onActivate: (planId: string) => void
	onDelete: (planId: string) => void
}) {
	const [editMode, setEditMode] = useState(isEditing)
	const { data, loading } = useQuery(GetAdminPlanDocument, {
		variables: { id: planId },
	})

	const [name, setName] = useState('')
	const [slug, setSlug] = useState('')
	const [description, setDescription] = useState('')
	const [maxActiveProjects, setMaxActiveProjects] = useState<number | null>(null)
	const [maxMembers, setMaxMembers] = useState(1)
	const [storageGB, setStorageGB] = useState(0)
	const [isPopular, setIsPopular] = useState(false)
	const [isActive, setIsActive] = useState(true)
	const [isEarlyBird, setIsEarlyBird] = useState(false)
	const [sortOrder, setSortOrder] = useState(0)
	const [prices, setPrices] = useState<
		Array<{
			currency: string
			price: number
			earlyBirdPrice: number
			billingCycleDays: number
		}>
	>([])
	const [features, setFeatures] = useState<
		Array<{
			name: string
			description?: string
			isIncluded: boolean
			sortOrder: number
		}>
	>([])

	const plan = data?.adminPlan

	// Load plan data
	useEffect(() => {
		if (plan) {
			setName(plan.name)
			setSlug(plan.slug)
			setDescription(plan.description || '')
			setMaxActiveProjects(plan.maxActiveProjects)
			setMaxMembers(plan.maxMembers)
			setStorageGB(plan.storageGB)
			setIsPopular(plan.isPopular)
			setIsActive(plan.isActive)
			setIsEarlyBird(plan.isEarlyBird)
			setSortOrder(plan.sortOrder)
			setPrices(
				plan.prices.map((p) => ({
					currency: p.currency,
					price: p.price,
					earlyBirdPrice: p.earlyBirdPrice,
					billingCycleDays: p.billingCycleDays,
				}))
			)
			setFeatures(
				plan.features.map((f) => ({
					name: f.name,
					description: f.description || '',
					isIncluded: f.isIncluded,
					sortOrder: f.sortOrder,
				}))
			)
		}
	}, [plan])

	const [updatePlan, { loading: updating }] = useMutation(UpdateAdminPlanDocument, {
		onCompleted: () => {
			toast.success('План успешно обновлен')
			setEditMode(false)
			onSuccess()
		},
		onError: (error) => {
			toast.error(`Ошибка обновления плана: ${error.message}`)
		},
	})

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault()

		if (!name.trim() || !slug.trim()) {
			toast.error('Название и slug обязательны для заполнения')
			return
		}

		if (prices.length === 0) {
			toast.error('Необходимо добавить хотя бы одну цену')
			return
		}

		updatePlan({
			variables: {
				id: planId,
				input: {
					name,
					slug,
					description: description || undefined,
					maxActiveProjects: maxActiveProjects ?? undefined,
					maxMembers,
					storageGB,
					isPopular,
					isActive,
					sortOrder,
					prices: prices.map((p) => ({
						currency: p.currency,
						price: p.price,
						earlyBirdPrice: p.earlyBirdPrice,
						billingCycleDays: p.billingCycleDays || 30,
					})),
					features: features.map((f, index) => ({
						name: f.name,
						description: f.description || undefined,
						isIncluded: f.isIncluded,
						sortOrder: f.sortOrder || index + 1,
					})),
				},
			},
		})
	}

	if (loading) {
		return (
			<Dialog open onOpenChange={onClose}>
				<DialogContent className="max-w-3xl">
					<div className="flex items-center justify-center py-12">
						<div className="flex flex-col items-center gap-3">
							<div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
							<p className="text-sm text-muted-foreground">Загрузка данных плана...</p>
						</div>
					</div>
				</DialogContent>
			</Dialog>
		)
	}

	if (!plan) {
		return null
	}

	return (
		<Dialog open onOpenChange={onClose}>
			<DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<div className="flex items-center justify-between">
						<div>
							<DialogTitle className="text-2xl">
								{editMode ? 'Редактирование плана' : plan.name}
							</DialogTitle>
							<DialogDescription className="mt-2">
								{editMode
									? 'Измените параметры тарифного плана, цены и функции'
									: 'Просмотр детальной информации о тарифном плане'}
							</DialogDescription>
						</div>
						{!editMode && (
							<Button variant="outline" size="sm" onClick={() => setEditMode(true)}>
								<Edit className="h-4 w-4 mr-2" />
								Редактировать
							</Button>
						)}
					</div>
				</DialogHeader>

				{editMode ? (
					<form onSubmit={handleSubmit} className="space-y-6">
						{/* Basic Information */}
						<Card>
							<CardHeader>
								<CardTitle className="text-lg">Основная информация</CardTitle>
								<CardDescription>Название, идентификатор и описание плана</CardDescription>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="grid grid-cols-2 gap-4">
									<div className="space-y-2">
										<Label htmlFor="name">Название плана *</Label>
										<Input
											id="name"
											value={name}
											onChange={(e) => setName(e.target.value)}
											required
											placeholder="Например: Лайт"
										/>
									</div>
									<div className="space-y-2">
										<Label htmlFor="slug">Slug *</Label>
										<Input
											id="slug"
											value={slug}
											onChange={(e) => setSlug(e.target.value)}
											required
											placeholder="Например: lite"
										/>
									</div>
								</div>
								<div className="space-y-2">
									<Label htmlFor="description">Описание</Label>
									<Textarea
										id="description"
										value={description}
										onChange={(e) => setDescription(e.target.value)}
										rows={3}
										placeholder="Описание тарифного плана..."
									/>
								</div>
							</CardContent>
						</Card>

						{/* Limits and Settings */}
						<Card>
							<CardHeader>
								<CardTitle className="text-lg">Лимиты и настройки</CardTitle>
								<CardDescription>Ограничения и параметры тарифного плана</CardDescription>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
									<div className="space-y-2">
										<Label htmlFor="maxProjects">Макс. проектов</Label>
										<Input
											id="maxProjects"
											type="number"
											value={maxActiveProjects ?? ''}
											onChange={(e) =>
												setMaxActiveProjects(e.target.value ? parseInt(e.target.value) : null)
											}
											placeholder="Без ограничений"
										/>
									</div>
									<div className="space-y-2">
										<Label htmlFor="maxMembers">Макс. участников *</Label>
										<Input
											id="maxMembers"
											type="number"
											value={maxMembers}
											onChange={(e) => setMaxMembers(parseInt(e.target.value) || 1)}
											required
											min={1}
										/>
									</div>
									<div className="space-y-2">
										<Label htmlFor="storageGB">Хранилище (ГБ) *</Label>
										<Input
											id="storageGB"
											type="number"
											step="0.1"
											value={storageGB}
											onChange={(e) => setStorageGB(parseFloat(e.target.value) || 0)}
											required
											min={0}
										/>
									</div>
									<div className="space-y-2">
										<Label htmlFor="sortOrder">Порядок сортировки</Label>
										<Input
											id="sortOrder"
											type="number"
											value={sortOrder}
											onChange={(e) => setSortOrder(parseInt(e.target.value) || 0)}
											min={0}
										/>
									</div>
								</div>
								<div className="flex flex-wrap items-center gap-6 pt-2">
									<div className="flex items-center space-x-2">
										<Checkbox
											id="isPopular"
											checked={isPopular}
											onCheckedChange={(checked) => setIsPopular(checked as boolean)}
										/>
										<Label htmlFor="isPopular" className="cursor-pointer font-normal">
											Популярный план
										</Label>
									</div>
									<div className="flex items-center space-x-2">
										<Checkbox
											id="isActive"
											checked={isActive}
											onCheckedChange={(checked) => setIsActive(checked as boolean)}
										/>
										<Label htmlFor="isActive" className="cursor-pointer font-normal">
											Активен
										</Label>
									</div>
									<div className="flex items-center space-x-2">
										<Checkbox
											id="isEarlyBird"
											checked={isEarlyBird}
											onCheckedChange={(checked) => setIsEarlyBird(checked as boolean)}
											disabled
										/>
										<Label
											htmlFor="isEarlyBird"
											className="cursor-pointer font-normal text-muted-foreground"
										>
											Раннее бронирование
										</Label>
									</div>
								</div>
							</CardContent>
						</Card>

						{/* Prices Section */}
						<Card>
							<CardHeader>
								<div className="flex items-center justify-between">
									<div>
										<CardTitle className="text-lg">Цены *</CardTitle>
										<CardDescription>Настройка цен в разных валютах</CardDescription>
									</div>
									<Button
										type="button"
										variant="outline"
										size="sm"
										onClick={() => {
											setPrices([
												...prices,
												{
													currency: 'RUB',
													price: 0,
													earlyBirdPrice: 0,
													billingCycleDays: 30,
												},
											])
										}}
									>
										<Plus className="h-4 w-4 mr-2" />
										Добавить цену
									</Button>
								</div>
							</CardHeader>
							<CardContent>
								<div className="space-y-3">
									{prices.map((price, index) => (
										<Card key={index} className="border-2">
											<CardContent className="pt-4">
												<div className="grid grid-cols-1 md:grid-cols-5 gap-4">
													<div className="space-y-2">
														<Label>Валюта</Label>
														<Select
															value={price.currency}
															onValueChange={(value) => {
																const newPrices = [...prices]
																newPrices[index].currency = value
																setPrices(newPrices)
															}}
														>
															<SelectTrigger>
																<SelectValue />
															</SelectTrigger>
															<SelectContent>
																<SelectItem value="RUB">RUB (₽)</SelectItem>
																<SelectItem value="USD">USD ($)</SelectItem>
																<SelectItem value="EUR">EUR (€)</SelectItem>
															</SelectContent>
														</Select>
													</div>
													<div className="space-y-2">
														<Label>Обычная цена *</Label>
														<Input
															type="number"
															step="0.01"
															value={price.price}
															onChange={(e) => {
																const newPrices = [...prices]
																newPrices[index].price = parseFloat(e.target.value) || 0
																setPrices(newPrices)
															}}
															required
															min={0}
															placeholder="0.00"
														/>
													</div>
													<div className="space-y-2">
														<Label>Ранняя цена *</Label>
														<Input
															type="number"
															step="0.01"
															value={price.earlyBirdPrice}
															onChange={(e) => {
																const newPrices = [...prices]
																newPrices[index].earlyBirdPrice =
																	parseFloat(e.target.value) || 0
																setPrices(newPrices)
															}}
															required
															min={0}
															placeholder="0.00"
														/>
													</div>
													<div className="space-y-2">
														<Label>Период (дни)</Label>
														<Input
															type="number"
															value={price.billingCycleDays}
															onChange={(e) => {
																const newPrices = [...prices]
																newPrices[index].billingCycleDays =
																	parseInt(e.target.value) || 30
																setPrices(newPrices)
															}}
															min={1}
															placeholder="30"
														/>
													</div>
													<div className="flex items-end">
														<Button
															type="button"
															variant="ghost"
															size="sm"
															onClick={() => {
																setPrices(prices.filter((_, i) => i !== index))
															}}
															disabled={prices.length === 1}
															className="text-destructive hover:text-destructive"
														>
															<X className="h-4 w-4" />
														</Button>
													</div>
												</div>
											</CardContent>
										</Card>
									))}
								</div>
							</CardContent>
						</Card>

						{/* Features Section */}
						<Card>
							<CardHeader>
								<div className="flex items-center justify-between">
									<div>
										<CardTitle className="text-lg">Функции</CardTitle>
										<CardDescription>Список функций, включенных в план</CardDescription>
									</div>
									<Button
										type="button"
										variant="outline"
										size="sm"
										onClick={() => {
											setFeatures([
												...features,
												{
													name: '',
													description: '',
													isIncluded: true,
													sortOrder: features.length + 1,
												},
											])
										}}
									>
										<Plus className="h-4 w-4 mr-2" />
										Добавить функцию
									</Button>
								</div>
							</CardHeader>
							<CardContent>
								<div className="space-y-3">
									{features.map((feature, index) => (
										<Card key={index} className="border-2">
											<CardContent className="pt-4">
												<div className="space-y-3">
													<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
														<div className="md:col-span-2 space-y-2">
															<Label>Название функции *</Label>
															<Input
																value={feature.name}
																onChange={(e) => {
																	const newFeatures = [...features]
																	newFeatures[index].name = e.target.value
																	setFeatures(newFeatures)
																}}
																required
																placeholder="Например: Базовый функционал"
															/>
														</div>
														<div className="space-y-2">
															<Label>Порядок сортировки</Label>
															<Input
																type="number"
																value={feature.sortOrder}
																onChange={(e) => {
																	const newFeatures = [...features]
																	newFeatures[index].sortOrder =
																		parseInt(e.target.value) || index + 1
																	setFeatures(newFeatures)
																}}
																min={0}
																placeholder="1"
															/>
														</div>
														<div className="flex items-end gap-2">
															<div className="flex items-center space-x-2 flex-1">
																<Checkbox
																	id={`feature-${index}-included`}
																	checked={feature.isIncluded}
																	onCheckedChange={(checked) => {
																		const newFeatures = [...features]
																		newFeatures[index].isIncluded = checked as boolean
																		setFeatures(newFeatures)
																	}}
																/>
																<Label
																	htmlFor={`feature-${index}-included`}
																	className="text-sm font-normal cursor-pointer"
																>
																	Включена
																</Label>
															</div>
															<Button
																type="button"
																variant="ghost"
																size="sm"
																onClick={() => {
																	setFeatures(features.filter((_, i) => i !== index))
																}}
																className="text-destructive hover:text-destructive"
															>
																<X className="h-4 w-4" />
															</Button>
														</div>
													</div>
													<div className="space-y-2">
														<Label>Описание</Label>
														<Textarea
															value={feature.description || ''}
															onChange={(e) => {
																const newFeatures = [...features]
																newFeatures[index].description = e.target.value
																setFeatures(newFeatures)
															}}
															rows={2}
															placeholder="Описание функции (необязательно)"
														/>
													</div>
												</div>
											</CardContent>
										</Card>
									))}
									{features.length === 0 && (
										<div className="text-center py-8 text-muted-foreground">
											<p className="text-sm">Нет функций. Добавьте первую функцию.</p>
										</div>
									)}
								</div>
							</CardContent>
						</Card>

						<DialogFooter className="gap-2 sm:gap-0">
							<Button
								type="button"
								variant="outline"
								onClick={() => {
									setEditMode(false)
									// Reset form to original values
									if (plan) {
										setName(plan.name)
										setSlug(plan.slug)
										setDescription(plan.description || '')
										setMaxActiveProjects(plan.maxActiveProjects)
										setMaxMembers(plan.maxMembers)
										setStorageGB(plan.storageGB)
										setIsPopular(plan.isPopular)
										setIsActive(plan.isActive)
										setIsEarlyBird(plan.isEarlyBird)
										setSortOrder(plan.sortOrder)
										setPrices(
											plan.prices.map((p) => ({
												currency: p.currency,
												price: p.price,
												earlyBirdPrice: p.earlyBirdPrice,
												billingCycleDays: p.billingCycleDays,
											}))
										)
										setFeatures(
											plan.features.map((f) => ({
												name: f.name,
												description: f.description || '',
												isIncluded: f.isIncluded,
												sortOrder: f.sortOrder,
											}))
										)
									}
								}}
								disabled={updating}
							>
								Отмена
							</Button>
							<Button type="submit" disabled={updating}>
								{updating ? (
									<>
										<div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
										Сохранение...
									</>
								) : (
									'Сохранить изменения'
								)}
							</Button>
						</DialogFooter>
					</form>
				) : (
					<div className="space-y-6">
						{/* Plan Info */}
						<Card>
							<CardHeader>
								<CardTitle className="text-lg">Основная информация</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<div className="space-y-1">
										<Label className="text-sm text-muted-foreground">Название плана</Label>
										<p className="text-lg font-semibold">{plan.name}</p>
									</div>
									<div className="space-y-1">
										<Label className="text-sm text-muted-foreground">Slug</Label>
										<p>
											<code className="bg-muted px-2 py-1 rounded text-sm font-mono">
												{plan.slug}
											</code>
										</p>
									</div>
									{plan.description && (
										<div className="md:col-span-2 space-y-1">
											<Label className="text-sm text-muted-foreground">Описание</Label>
											<p className="text-sm leading-relaxed">{plan.description}</p>
										</div>
									)}
								</div>
							</CardContent>
						</Card>

						{/* Limits and Status */}
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<Card>
								<CardHeader>
									<CardTitle className="text-lg">Лимиты</CardTitle>
								</CardHeader>
								<CardContent className="space-y-3">
									<div className="flex items-center justify-between">
										<span className="text-sm text-muted-foreground">Макс. проектов</span>
										<span className="font-semibold">
											{plan.maxActiveProjects === null ? (
												<span className="text-muted-foreground">Без ограничений</span>
											) : (
												plan.maxActiveProjects
											)}
										</span>
									</div>
									<div className="flex items-center justify-between">
										<span className="text-sm text-muted-foreground">Макс. участников</span>
										<span className="font-semibold">{plan.maxMembers}</span>
									</div>
									<div className="flex items-center justify-between">
										<span className="text-sm text-muted-foreground">Хранилище</span>
										<span className="font-semibold">{plan.storageGB} ГБ</span>
									</div>
								</CardContent>
							</Card>

							<Card>
								<CardHeader>
									<CardTitle className="text-lg">Статус и настройки</CardTitle>
								</CardHeader>
								<CardContent className="space-y-3">
									<div className="flex items-center justify-between">
										<span className="text-sm text-muted-foreground">Статус</span>
										{plan.isActive ? (
											<Badge className="bg-green-500">Активен</Badge>
										) : (
											<Badge variant="secondary">Архивный</Badge>
										)}
									</div>
									{plan.isPopular && (
										<div className="flex items-center justify-between">
											<span className="text-sm text-muted-foreground">Метка</span>
											<Badge variant="outline">Популярный</Badge>
										</div>
									)}
									{plan.isEarlyBird && (
										<div className="flex items-center justify-between">
											<span className="text-sm text-muted-foreground">Ценообразование</span>
											<Badge variant="outline">Раннее бронирование</Badge>
										</div>
									)}
									<div className="flex items-center justify-between">
										<span className="text-sm text-muted-foreground">Порядок сортировки</span>
										<span className="font-semibold">{plan.sortOrder}</span>
									</div>
								</CardContent>
							</Card>
						</div>

						{/* Prices */}
						<Card>
							<CardHeader>
								<CardTitle className="text-lg">Цены</CardTitle>
								<CardDescription>Цены в разных валютах</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
									{plan.prices.map((price) => (
										<Card key={price.id} className="border-2">
											<CardContent className="pt-4">
												<div className="space-y-2">
													<div className="flex items-center justify-between">
														<span className="text-sm font-medium">{price.currency}</span>
														<Badge variant="secondary" className="text-xs">
															{price.billingCycleDays} дн.
														</Badge>
													</div>
													<div className="space-y-1">
														<div>
															<span className="text-xs text-muted-foreground">Обычная:</span>
															<p className="text-lg font-bold">
																{formatCurrency(price.price, price.currency)}
															</p>
														</div>
														{plan.isEarlyBird && (
															<div>
																<span className="text-xs text-muted-foreground">Ранняя:</span>
																<p className="text-base font-semibold text-primary">
																	{formatCurrency(price.earlyBirdPrice, price.currency)}
																</p>
															</div>
														)}
													</div>
												</div>
											</CardContent>
										</Card>
									))}
								</div>
							</CardContent>
						</Card>

						{/* Features */}
						<Card>
							<CardHeader>
								<CardTitle className="text-lg">Функции</CardTitle>
								<CardDescription>
									Список функций, включенных в тарифный план ({plan.features.length})
								</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
									{plan.features.map((feature) => (
										<div
											key={feature.id}
											className="flex items-start gap-3 p-3 rounded-lg border bg-muted/30"
										>
											<CheckCircle className="h-5 w-5 mt-0.5 text-green-500 shrink-0" />
											<div className="flex-1 min-w-0">
												<div className="font-medium">{feature.name}</div>
												{feature.description && (
													<div className="text-sm text-muted-foreground mt-1">
														{feature.description}
													</div>
												)}
											</div>
										</div>
									))}
								</div>
							</CardContent>
						</Card>

						{/* Stats */}
						<Card>
							<CardHeader>
								<CardTitle className="text-lg">Статистика</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="flex items-center justify-between">
									<span className="text-sm text-muted-foreground">Активных подписок</span>
									<span className="text-2xl font-bold">{plan.subscriptionsCount || 0}</span>
								</div>
							</CardContent>
						</Card>

						{/* Actions */}
						<DialogFooter className="flex flex-col sm:flex-row justify-between gap-2">
							<div className="flex flex-wrap gap-2">
								{plan.isActive ? (
									<Button variant="outline" onClick={() => onArchive(planId)}>
										<Archive className="h-4 w-4 mr-2" />
										Архивировать
									</Button>
								) : (
									<Button variant="outline" onClick={() => onActivate(planId)}>
										<CheckCircle className="h-4 w-4 mr-2" />
										Активировать
									</Button>
								)}
								<Button
									variant="destructive"
									onClick={() => onDelete(planId)}
									disabled={(plan.subscriptionsCount || 0) > 0}
								>
									<Trash2 className="h-4 w-4 mr-2" />
									Удалить
								</Button>
							</div>
							<Button variant="outline" onClick={onClose}>
								Закрыть
							</Button>
						</DialogFooter>
					</div>
				)}
			</DialogContent>
		</Dialog>
	)
}
