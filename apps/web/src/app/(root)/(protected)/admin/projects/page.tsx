'use client'

import { useState, useEffect, useMemo } from 'react'
import { Card } from '@/packages/components/ui/card'
import { Input } from '@/packages/components/ui/input'
import { Button } from '@/packages/components/ui/button'
import { Badge } from '@/packages/components/ui/badge'
import { AdminPageSkeleton } from '@/packages/components/ui/admin-page-skeleton'
import {
	Loader2,
	Search,
	FolderKanban,
	Trash2,
	Archive,
	Eye,
	Calendar,
	DollarSign,
	Users,
} from 'lucide-react'
import { useQuery, useMutation } from '@apollo/client/react'
import {
	AdminProjectsDocument,
	AdminDeleteProjectDocument,
	AdminArchiveProjectDocument,
	AdminUpdateProjectStatusDocument,
} from '@/packages/api/graphql/__generated__/output'
import { formatDistanceToNow } from 'date-fns'
import { ru } from 'date-fns/locale'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/packages/components/ui/dropdown-menu'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from '@/packages/components/ui/dialog'

export default function AdminProjectsPage() {
	const [searchQuery, setSearchQuery] = useState('')
	const [debouncedSearch, setDebouncedSearch] = useState('')
	const [filterStatus, setFilterStatus] = useState<string | null>(null)
	const [selectedProject, setSelectedProject] = useState<any>(null)
	const [showDetailsDialog, setShowDetailsDialog] = useState(false)

	// Debounce search input
	useEffect(() => {
		const timer = setTimeout(() => {
			setDebouncedSearch(searchQuery)
		}, 500) // 500ms debounce delay

		return () => clearTimeout(timer)
	}, [searchQuery])

	// Build filter object with useMemo
	const filter = useMemo(() => {
		const filterObj: any = {}
		if (debouncedSearch) filterObj.search = debouncedSearch
		if (filterStatus) filterObj.status = filterStatus
		// Only include non-null values
		return Object.keys(filterObj).length > 0 ? filterObj : null
	}, [debouncedSearch, filterStatus])

	// Query for projects with filters
	const { data, loading, refetch } = useQuery(AdminProjectsDocument, {
		variables: {
			filter,
			pagination: {
				page: 1,
				limit: 50,
			},
		},
	})

	const [deleteProject] = useMutation(AdminDeleteProjectDocument, {
		onCompleted: () => {
			refetch()
		},
	})

	const [archiveProject] = useMutation(AdminArchiveProjectDocument, {
		onCompleted: () => {
			refetch()
		},
	})

	const [updateStatus] = useMutation(AdminUpdateProjectStatusDocument, {
		onCompleted: () => {
			refetch()
		},
	})

	const projects = data?.adminProjects?.projects || []
	const total = data?.adminProjects?.total || 0
	const stats = (data?.adminProjects as any)?.stats || { active: 0, completed: 0, archived: 0 }

	const statusOptions = ['active', 'planning', 'completed', 'on_hold', 'archived']

	const getStatusBadge = (status: string) => {
		const variants: Record<string, any> = {
			active: 'default',
			planning: 'secondary',
			completed: 'outline',
			on_hold: 'destructive',
			archived: 'secondary',
		}
		return variants[status] || 'secondary'
	}

	const getStatusLabel = (status: string) => {
		const labels: Record<string, string> = {
			active: 'Активный',
			planning: 'Планирование',
			completed: 'Завершен',
			on_hold: 'Приостановлен',
			archived: 'Архив',
		}
		return labels[status] || status
	}

	const handleDelete = async (projectId: string) => {
		if (confirm('Вы уверены? Это удалит проект и все связанные данные (расходы, отчеты, задачи).')) {
			await deleteProject({
				variables: { projectId },
			})
		}
	}

	const handleArchive = async (projectId: string) => {
		await archiveProject({
			variables: { projectId },
		})
	}

	const handleStatusChange = async (projectId: string, status: string) => {
		await updateStatus({
			variables: { projectId, status },
		})
	}

	const formatCurrency = (amount: number) => {
		return new Intl.NumberFormat('ru-RU', {
			style: 'currency',
			currency: 'RUB',
			minimumFractionDigits: 0,
		}).format(amount)
	}

	if (loading && !data) {
		return <AdminPageSkeleton />
	}

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-3xl font-bold">Projects Management</h1>
				<p className="text-muted-foreground mt-1">Manage all projects in the system</p>
			</div>

			{/* Filters */}
			<Card className="p-4">
				<div className="flex flex-col sm:flex-row gap-4">
					<div className="flex-1 relative">
						<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
						<Input
							placeholder="Search by project name or description..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="pl-10"
						/>
					</div>

					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant="outline" className="gap-2">
								<FolderKanban className="h-4 w-4" />
								Status: {filterStatus ? getStatusLabel(filterStatus) : 'All'}
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end" className="w-48">
							<DropdownMenuItem onClick={() => setFilterStatus(null)}>All Statuses</DropdownMenuItem>
							{statusOptions.map((status) => (
								<DropdownMenuItem key={status} onClick={() => setFilterStatus(status)}>
									{getStatusLabel(status)}
								</DropdownMenuItem>
							))}
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</Card>

			{/* Stats */}
			<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
				<Card className="p-4">
					<div className="flex items-center gap-3">
						<div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-950 flex items-center justify-center">
							<FolderKanban className="h-5 w-5 text-blue-600 dark:text-blue-400" />
						</div>
						<div>
							<p className="text-sm text-muted-foreground">Total Projects</p>
							<p className="text-2xl font-bold">{total}</p>
						</div>
					</div>
				</Card>
				<Card className="p-4">
					<div className="flex items-center gap-3">
						<div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-950 flex items-center justify-center">
							<Users className="h-5 w-5 text-green-600 dark:text-green-400" />
						</div>
						<div>
							<p className="text-sm text-muted-foreground">Active</p>
							<p className="text-2xl font-bold">{stats.active}</p>
						</div>
					</div>
				</Card>
				<Card className="p-4">
					<div className="flex items-center gap-3">
						<div className="h-10 w-10 rounded-full bg-purple-100 dark:bg-purple-950 flex items-center justify-center">
							<Calendar className="h-5 w-5 text-purple-600 dark:text-purple-400" />
						</div>
						<div>
							<p className="text-sm text-muted-foreground">Completed</p>
							<p className="text-2xl font-bold">{stats.completed}</p>
						</div>
					</div>
				</Card>
				<Card className="p-4">
					<div className="flex items-center gap-3">
						<div className="h-10 w-10 rounded-full bg-orange-100 dark:bg-orange-950 flex items-center justify-center">
							<Archive className="h-5 w-5 text-orange-600 dark:text-orange-400" />
						</div>
						<div>
							<p className="text-sm text-muted-foreground">Archived</p>
							<p className="text-2xl font-bold">{stats.archived}</p>
						</div>
					</div>
				</Card>
			</div>

			{/* Projects Table */}
			<Card>
				{loading ? (
					<div className="flex items-center justify-center py-12">
						<Loader2 className="h-8 w-8 animate-spin text-primary" />
					</div>
				) : projects.length === 0 ? (
					<div className="text-center py-12">
						<FolderKanban className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
						<p className="text-lg font-medium">No projects found</p>
						<p className="text-sm text-muted-foreground mt-1">
							{searchQuery || filterStatus ? 'Try adjusting your filters' : 'No projects in the system yet'}
						</p>
					</div>
				) : (
					<div className="overflow-x-auto">
						<table className="w-full">
							<thead>
								<tr className="border-b bg-muted/50">
									<th className="text-left p-4 font-medium">Project</th>
									<th className="text-left p-4 font-medium">Team</th>
									<th className="text-left p-4 font-medium">Status</th>
									<th className="text-left p-4 font-medium">Budget</th>
									<th className="text-left p-4 font-medium">Actual Cost</th>
									<th className="text-left p-4 font-medium">Activity</th>
									<th className="text-left p-4 font-medium">Created</th>
									<th className="text-right p-4 font-medium">Actions</th>
								</tr>
							</thead>
							<tbody>
								{projects.map((project: any) => (
									<tr key={project.id} className="border-b hover:bg-muted/30 transition-colors">
										<td className="p-4">
											<div>
												<p className="font-medium">{project.name}</p>
												{project.description && (
													<p className="text-xs text-muted-foreground line-clamp-1 mt-1">
														{project.description}
													</p>
												)}
											</div>
										</td>
										<td className="p-4">
											<div>
												<p className="text-sm font-medium">{project.team?.name || 'N/A'}</p>
												<p className="text-xs text-muted-foreground">{project.owner?.email}</p>
											</div>
										</td>
										<td className="p-4">
											<Badge variant={getStatusBadge(project.status)}>
												{getStatusLabel(project.status)}
											</Badge>
										</td>
										<td className="p-4">
											<p className="text-sm font-medium">
												{project.budget ? formatCurrency(project.budget) : '—'}
											</p>
										</td>
										<td className="p-4">
											<p className="text-sm font-medium">
												{project.actualCost ? formatCurrency(project.actualCost) : '—'}
											</p>
										</td>
										<td className="p-4">
											<div className="flex gap-2 text-xs text-muted-foreground">
												<span>{project._count?.expenses || 0} расходов</span>
												<span>·</span>
												<span>{project._count?.reports || 0} отчетов</span>
											</div>
										</td>
										<td className="p-4">
											<p className="text-sm text-muted-foreground">
												{formatDistanceToNow(new Date(project.createdAt), {
													addSuffix: true,
													locale: ru,
												})}
											</p>
										</td>
										<td className="p-4">
											<div className="flex items-center justify-end gap-2">
												<Button
													variant="ghost"
													size="sm"
													onClick={() => {
														setSelectedProject(project)
														setShowDetailsDialog(true)
													}}
												>
													<Eye className="h-4 w-4" />
												</Button>

												<DropdownMenu>
													<DropdownMenuTrigger asChild>
														<Button variant="ghost" size="sm">
															Status
														</Button>
													</DropdownMenuTrigger>
													<DropdownMenuContent align="end">
														{statusOptions.map((status) => (
															<DropdownMenuItem
																key={status}
																onClick={() => handleStatusChange(project.id, status)}
																disabled={project.status === status}
															>
																{getStatusLabel(status)}
															</DropdownMenuItem>
														))}
													</DropdownMenuContent>
												</DropdownMenu>

												{project.status !== 'archived' && (
													<Button
														variant="outline"
														size="sm"
														onClick={() => handleArchive(project.id)}
													>
														<Archive className="h-4 w-4" />
													</Button>
												)}

												<Button
													variant="destructive"
													size="sm"
													onClick={() => handleDelete(project.id)}
												>
													<Trash2 className="h-4 w-4" />
												</Button>
											</div>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				)}
			</Card>

			{/* Project Details Dialog */}
			<Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
				<DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
					<DialogHeader>
						<DialogTitle>Project Details</DialogTitle>
						<DialogDescription>Detailed information about the project</DialogDescription>
					</DialogHeader>

					{selectedProject && (
						<div className="space-y-4">
							<div>
								<h3 className="font-semibold text-lg">{selectedProject.name}</h3>
								{selectedProject.description && (
									<p className="text-sm text-muted-foreground mt-1">{selectedProject.description}</p>
								)}
							</div>

							<div className="grid grid-cols-2 gap-4">
								<div>
									<p className="text-sm font-medium">Status</p>
									<Badge variant={getStatusBadge(selectedProject.status)} className="mt-1">
										{getStatusLabel(selectedProject.status)}
									</Badge>
								</div>
								<div>
									<p className="text-sm font-medium">Team</p>
									<p className="text-sm text-muted-foreground mt-1">{selectedProject.team?.name}</p>
								</div>
								<div>
									<p className="text-sm font-medium">Budget</p>
									<p className="text-sm text-muted-foreground mt-1">
										{selectedProject.budget ? formatCurrency(selectedProject.budget) : 'Not set'}
									</p>
								</div>
								<div>
									<p className="text-sm font-medium">Actual Cost</p>
									<p className="text-sm text-muted-foreground mt-1">
										{selectedProject.actualCost ? formatCurrency(selectedProject.actualCost) : '—'}
									</p>
								</div>
							</div>

							<div className="grid grid-cols-3 gap-4 pt-4 border-t">
								<div className="text-center">
									<p className="text-2xl font-bold">{selectedProject._count?.expenses || 0}</p>
									<p className="text-sm text-muted-foreground">Expenses</p>
								</div>
								<div className="text-center">
									<p className="text-2xl font-bold">{selectedProject._count?.reports || 0}</p>
									<p className="text-sm text-muted-foreground">Reports</p>
								</div>
								<div className="text-center">
									<p className="text-2xl font-bold">{selectedProject._count?.tasks || 0}</p>
									<p className="text-sm text-muted-foreground">Tasks</p>
								</div>
							</div>

							<div className="pt-4 border-t">
								<p className="text-xs text-muted-foreground">
									Created {formatDistanceToNow(new Date(selectedProject.createdAt), { addSuffix: true, locale: ru })}
								</p>
								{selectedProject.completedAt && (
									<p className="text-xs text-muted-foreground mt-1">
										Completed{' '}
										{formatDistanceToNow(new Date(selectedProject.completedAt), { addSuffix: true, locale: ru })}
									</p>
								)}
							</div>
						</div>
					)}
				</DialogContent>
			</Dialog>
		</div>
	)
}
