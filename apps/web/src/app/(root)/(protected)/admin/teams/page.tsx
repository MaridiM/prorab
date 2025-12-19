'use client'

import { useState, useEffect, useMemo } from 'react'
import { useQuery, useMutation } from '@apollo/client/react'
import { Card } from '@/packages/components/ui/card'
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
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from '@/packages/components/ui/dialog'
import { Search, MoreVertical, Trash2, Ban, Users, FolderKanban, User } from 'lucide-react'
import { toast } from 'sonner'
import {
	AdminTeamsDocument,
	AdminDeleteTeamDocument,
	AdminTeamDocument,
} from '@/packages/api/graphql/__generated__/output'
import { useRouter } from 'next/navigation'

export default function AdminTeamsPage() {
	const router = useRouter()
	const [page, setPage] = useState(1)
	const [search, setSearch] = useState('')
	const [debouncedSearch, setDebouncedSearch] = useState('')
	const [planFilter, setPlanFilter] = useState<string>('')
	const [statusFilter, setStatusFilter] = useState<string>('')
	const [selectedTeam, setSelectedTeam] = useState<any>(null)
	const [isDetailsOpen, setIsDetailsOpen] = useState(false)

	// Debounce search input
	useEffect(() => {
		const timer = setTimeout(() => {
			setDebouncedSearch(search)
			setPage(1) // Reset to first page when search changes
		}, 500) // 500ms debounce delay

		return () => clearTimeout(timer)
	}, [search])

	// Reset page when filters change
	useEffect(() => {
		setPage(1)
	}, [planFilter, statusFilter])

	// Build filters with useMemo
	const filters = useMemo(() => {
		if (debouncedSearch || (planFilter && planFilter !== 'all') || (statusFilter && statusFilter !== 'all')) {
			return {
				search: debouncedSearch || null,
				planType: (planFilter && planFilter !== 'all') ? planFilter : null,
				subscriptionStatus: (statusFilter && statusFilter !== 'all') ? statusFilter : null,
				createdAfter: null,
				createdBefore: null,
				minMembers: null,
				maxMembers: null,
				minProjects: null,
				maxProjects: null,
			}
		}
		return null
	}, [debouncedSearch, planFilter, statusFilter])

	const { data, loading, refetch } = useQuery(AdminTeamsDocument, {
		variables: {
			filters,
			pagination: {
				page,
				limit: 20,
			},
		},
	})

	const [deleteTeam] = useMutation(AdminDeleteTeamDocument, {
		onCompleted: () => {
			toast.success('Team deleted successfully')
			refetch()
		},
		onError: (error) => {
			toast.error('Failed to delete team: ' + error.message)
		},
	})

	// Fetch detailed team information - MUST be before any conditional returns
	const { data: teamDetailsData, loading: teamDetailsLoading } = useQuery(AdminTeamDocument, {
		variables: { id: selectedTeam?.id || '' },
		skip: !selectedTeam?.id || !isDetailsOpen,
	})

	// TODO: Add suspend team mutation to GraphQL schema
	// const [suspendTeam] = useMutation(AdminSuspendTeamDocument, {
	// 	onCompleted: () => {
	// 		toast.success('Team suspended successfully')
	// 		refetch()
	// 	},
	// 	onError: (error) => {
	// 		toast.error('Failed to suspend team: ' + error.message)
	// 	},
	// })

	const teams = data?.adminTeams?.nodes || []

	// Early returns AFTER all hooks
	if (loading && !data) {
		return <AdminPageSkeleton />
	}
	const pageInfo = data?.adminTeams?.pageInfo
	const totalCount = data?.adminTeams?.totalCount || 0

	const handleDeleteTeam = (teamId: string) => {
		if (confirm('Are you sure you want to delete this team? This action cannot be undone.')) {
			deleteTeam({ variables: { id: teamId } })
		}
	}

	// const handleSuspendTeam = (teamId: string) => {
	// 	const reason = prompt('Enter suspension reason:')
	// 	if (reason) {
	// 		suspendTeam({ variables: { id: teamId, reason } })
	// 	}
	// }

	const handleViewDetails = (team: any) => {
		setSelectedTeam(team)
		setIsDetailsOpen(true)
	}

	const handleRowClick = (team: any) => {
		handleViewDetails(team)
	}

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-3xl font-bold">Team Management</h1>
				<p className="text-muted-foreground mt-1">Manage and monitor team accounts</p>
			</div>

			<Card className="p-6">
				<div className="flex flex-col md:flex-row gap-4 mb-6">
					<div className="flex-1 relative">
						<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
						<Input
							placeholder="Поиск по названию команды или slug..."
							value={search}
							onChange={(e) => setSearch(e.target.value)}
							className="pl-10"
						/>
					</div>
					<Select value={planFilter} onValueChange={setPlanFilter}>
						<SelectTrigger className="w-full md:w-[180px]">
							<SelectValue placeholder="План" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">Все планы</SelectItem>
							<SelectItem value="LITE">LITE</SelectItem>
							<SelectItem value="FOREMAN">FOREMAN</SelectItem>
							<SelectItem value="BRIGADE">BRIGADE</SelectItem>
						</SelectContent>
					</Select>
					<Select value={statusFilter} onValueChange={setStatusFilter}>
						<SelectTrigger className="w-full md:w-[180px]">
							<SelectValue placeholder="Статус" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">Все статусы</SelectItem>
							<SelectItem value="ACTIVE">Активна</SelectItem>
							<SelectItem value="TRIALING">Пробный период</SelectItem>
							<SelectItem value="CANCELLED">Отменена</SelectItem>
						</SelectContent>
					</Select>
				</div>

				{loading ? (
					<div className="text-center py-12">
						<div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent" />
						<p className="mt-4 text-muted-foreground">Загрузка команд...</p>
					</div>
				) : (
					<>
						<div className="rounded-md border">
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Команда</TableHead>
										<TableHead>Slug</TableHead>
										<TableHead>Владелец</TableHead>
										<TableHead>Дата создания</TableHead>
										<TableHead className="text-right">Действия</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{teams.length === 0 ? (
										<TableRow>
											<TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
												Команды не найдены
											</TableCell>
										</TableRow>
									) : (
										teams.map((team: any) => (
											<TableRow 
												key={team.id}
												className="cursor-pointer hover:bg-muted/50"
												onClick={() => handleRowClick(team)}
											>
												<TableCell>
													<div className="flex items-center gap-3">
														<div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
															{team.logoUrl ? (
																<img
																	src={team.logoUrl}
																	alt={team.name}
																	className="h-10 w-10 rounded-full object-cover"
																/>
															) : (
																<span className="text-sm font-medium">
																	{team.name[0].toUpperCase()}
																</span>
															)}
														</div>
														<div>
															<p className="font-medium">{team.name}</p>
															<p className="text-xs text-muted-foreground">{team.id.slice(0, 8)}</p>
														</div>
													</div>
												</TableCell>
												<TableCell>
													<span className="text-xs text-muted-foreground">—</span>
												</TableCell>
												<TableCell>
													{team.owner ? (
														<div className="flex items-center gap-2">
															{team.owner.avatarUrl ? (
																<img
																	src={team.owner.avatarUrl}
																	alt={team.owner.fullName || team.owner.email}
																	className="h-6 w-6 rounded-full object-cover"
																/>
															) : (
																<div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
																	<User className="h-3 w-3 text-primary" />
																</div>
															)}
															<div>
																<p className="text-sm font-medium">
																	{team.owner.fullName || team.owner.email || 'Неизвестно'}
																</p>
																{team.owner.fullName && (
																	<p className="text-xs text-muted-foreground">{team.owner.email}</p>
																)}
															</div>
														</div>
													) : (
														<span className="text-sm text-muted-foreground font-mono">
															{team.ownerId.slice(0, 8)}...
														</span>
													)}
												</TableCell>
												<TableCell className="text-muted-foreground">
													{new Date(team.createdAt).toLocaleDateString('ru-RU', {
														day: '2-digit',
														month: '2-digit',
														year: 'numeric',
													})}
												</TableCell>
												<TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
													<DropdownMenu>
														<DropdownMenuTrigger asChild>
															<Button variant="ghost" size="icon">
																<MoreVertical className="h-4 w-4" />
															</Button>
														</DropdownMenuTrigger>
														<DropdownMenuContent align="end">
															<DropdownMenuLabel>Действия</DropdownMenuLabel>
															<DropdownMenuItem onClick={() => handleViewDetails(team)}>
																Просмотр деталей
															</DropdownMenuItem>
															{/* TODO: Add suspend team mutation */}
															{/* <DropdownMenuItem onClick={() => handleSuspendTeam(team.id)}>
																<Ban className="h-4 w-4 mr-2" />
																Suspend Team
															</DropdownMenuItem> */}
															<DropdownMenuSeparator />
															<DropdownMenuItem
																onClick={() => handleDeleteTeam(team.id)}
																className="text-destructive"
															>
																<Trash2 className="h-4 w-4 mr-2" />
																Удалить команду
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

						<div className="flex items-center justify-between mt-4">
							<p className="text-sm text-muted-foreground">
								Показано {teams.length} из {totalCount} команд
							</p>
							<div className="flex gap-2">
								<Button
									variant="outline"
									size="sm"
									onClick={() => setPage(page - 1)}
									disabled={!pageInfo?.hasPreviousPage}
								>
									Назад
								</Button>
								<Button
									variant="outline"
									size="sm"
									onClick={() => setPage(page + 1)}
									disabled={!pageInfo?.hasNextPage}
								>
									Вперёд
								</Button>
							</div>
						</div>
					</>
				)}
			</Card>

			<Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
				<DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
					<DialogHeader>
						<DialogTitle>Детали команды</DialogTitle>
						<DialogDescription>Подробная информация о команде и владельце</DialogDescription>
					</DialogHeader>
					{teamDetailsLoading ? (
						<div className="flex items-center justify-center py-12">
							<div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent" />
							<p className="ml-4 text-muted-foreground">Загрузка деталей...</p>
						</div>
					) : (
						(teamDetailsData?.adminTeam || selectedTeam) && (
							<div className="space-y-6">
								{/* Team Information */}
								<div className="space-y-4">
									<h3 className="text-lg font-semibold flex items-center gap-2">
										<FolderKanban className="h-5 w-5" />
										Информация о команде
									</h3>
									<div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
													<div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
											{(teamDetailsData?.adminTeam?.team?.logoUrl || selectedTeam?.logoUrl) ? (
												<img
													src={teamDetailsData?.adminTeam?.team?.logoUrl || selectedTeam.logoUrl}
													alt={teamDetailsData?.adminTeam?.team?.name || selectedTeam.name}
													className="h-20 w-20 rounded-full object-cover"
												/>
											) : (
												<span className="text-2xl font-medium">
													{(teamDetailsData?.adminTeam?.team?.name || selectedTeam.name)[0].toUpperCase()}
												</span>
											)}
										</div>
										<div className="flex-1">
											<h3 className="text-xl font-semibold">
												{teamDetailsData?.adminTeam?.team?.name || selectedTeam.name}
											</h3>
											<p className="text-muted-foreground">
												ID: {(teamDetailsData?.adminTeam?.team?.id || selectedTeam.id).slice(0, 8)}...
											</p>
											{teamDetailsData?.adminTeam?.team && 'description' in teamDetailsData.adminTeam.team && (teamDetailsData.adminTeam.team as any).description && (
												<p className="mt-2 text-sm">{(teamDetailsData.adminTeam.team as any).description}</p>
											)}
										</div>
									</div>

									<div className="grid grid-cols-2 gap-4">
										<div>
											<p className="text-sm font-medium text-muted-foreground">ID команды</p>
											<p className="mt-1 font-mono text-sm">
												{teamDetailsData?.adminTeam?.team?.id || selectedTeam.id}
											</p>
										</div>
										<div>
											<p className="text-sm font-medium text-muted-foreground">Дата создания</p>
											<p className="mt-1">
												{new Date(
													teamDetailsData?.adminTeam?.team?.createdAt || selectedTeam.createdAt
												).toLocaleString('ru-RU', {
													day: '2-digit',
													month: '2-digit',
													year: 'numeric',
													hour: '2-digit',
													minute: '2-digit',
												})}
											</p>
										</div>
										{teamDetailsData?.adminTeam?._count && (
											<>
												<div>
													<p className="text-sm font-medium text-muted-foreground">Участников</p>
													<p className="mt-1 font-semibold">
														{teamDetailsData.adminTeam._count.members || 0}
													</p>
												</div>
												<div>
													<p className="text-sm font-medium text-muted-foreground">Проектов</p>
													<p className="mt-1 font-semibold">
														{teamDetailsData.adminTeam._count.projects || 0}
													</p>
												</div>
											</>
										)}
									</div>
								</div>

								{/* Owner Information */}
								<div className="space-y-4">
									<h3 className="text-lg font-semibold flex items-center gap-2">
										<User className="h-5 w-5" />
										Информация о владельце
									</h3>
									{teamDetailsData?.adminTeam?.owner ? (
										<div className="p-4 bg-muted/50 rounded-lg">
											<div className="flex items-center gap-4">
												{teamDetailsData.adminTeam.owner.avatarUrl ? (
													<img
														src={teamDetailsData.adminTeam.owner.avatarUrl}
														alt={teamDetailsData.adminTeam.owner.fullName || teamDetailsData.adminTeam.owner.email}
														className="h-16 w-16 rounded-full object-cover"
													/>
												) : (
													<div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
														<User className="h-8 w-8 text-primary" />
													</div>
												)}
												<div className="flex-1">
													<h4 className="text-lg font-semibold">
														{teamDetailsData.adminTeam.owner.fullName || 'Имя не указано'}
													</h4>
													<p className="text-muted-foreground">{teamDetailsData.adminTeam.owner.email}</p>
													<p className="text-xs text-muted-foreground mt-1 font-mono">
														ID: {teamDetailsData.adminTeam.owner.id}
													</p>
												</div>
											</div>
										</div>
									) : selectedTeam?.owner ? (
										<div className="p-4 bg-muted/50 rounded-lg">
											<div className="flex items-center gap-4">
												{selectedTeam.owner.avatarUrl ? (
													<img
														src={selectedTeam.owner.avatarUrl}
														alt={selectedTeam.owner.fullName || selectedTeam.owner.email}
														className="h-16 w-16 rounded-full object-cover"
													/>
												) : (
													<div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
														<User className="h-8 w-8 text-primary" />
													</div>
												)}
												<div className="flex-1">
													<h4 className="text-lg font-semibold">
														{selectedTeam.owner.fullName || 'Имя не указано'}
													</h4>
													<p className="text-muted-foreground">{selectedTeam.owner.email}</p>
													<p className="text-xs text-muted-foreground mt-1 font-mono">
														ID: {selectedTeam.owner.id}
													</p>
												</div>
											</div>
										</div>
									) : (
										<div className="p-4 bg-muted/50 rounded-lg">
											<p className="text-muted-foreground">Информация о владельце загружается...</p>
										</div>
									)}
								</div>

								{/* Subscription Information */}
								{teamDetailsData?.adminTeam?.subscription && (
									<div className="space-y-4">
										<h3 className="text-lg font-semibold">Подписка</h3>
										<div className="p-4 bg-muted/50 rounded-lg">
											<div className="grid grid-cols-2 gap-4">
												<div>
													<p className="text-sm font-medium text-muted-foreground">План</p>
													<p className="mt-1 font-semibold">{teamDetailsData.adminTeam.subscription.plan}</p>
												</div>
												<div>
													<p className="text-sm font-medium text-muted-foreground">Статус</p>
													<p className="mt-1 font-semibold">{teamDetailsData.adminTeam.subscription.status}</p>
												</div>
												{teamDetailsData.adminTeam.subscription.currentPeriodEnd && (
													<div>
														<p className="text-sm font-medium text-muted-foreground">Период до</p>
														<p className="mt-1">
															{new Date(teamDetailsData.adminTeam.subscription.currentPeriodEnd).toLocaleDateString('ru-RU')}
														</p>
													</div>
												)}
											</div>
										</div>
									</div>
								)}
							</div>
						)
					)}
				</DialogContent>
			</Dialog>
		</div>
	)
}
