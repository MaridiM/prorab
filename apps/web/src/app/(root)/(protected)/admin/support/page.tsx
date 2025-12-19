'use client'

import { useState } from 'react'
import { Card } from '@/packages/components/ui/card'
import { Input } from '@/packages/components/ui/input'
import { Button } from '@/packages/components/ui/button'
import { Badge } from '@/packages/components/ui/badge'
import { AdminPageSkeleton } from '@/packages/components/ui/admin-page-skeleton'
import {
	Loader2,
	Search,
	Ticket,
	Trash2,
	Eye,
	MessageSquare,
	Clock,
	CheckCircle2,
	XCircle,
	AlertCircle,
} from 'lucide-react'
import { useQuery, useMutation } from '@apollo/client/react'
import {
	AdminSupportTicketsDocument,
	AdminDeleteSupportTicketDocument,
	AdminUpdateSupportTicketDocument,
	AdminSupportStatisticsDocument,
	SupportTicketStatus,
	SupportTicketPriority,
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

export default function AdminSupportPage() {
	const [searchQuery, setSearchQuery] = useState('')
	const [filterStatus, setFilterStatus] = useState<SupportTicketStatus | null>(null)
	const [filterPriority, setFilterPriority] = useState<SupportTicketPriority | null>(null)
	const [selectedTicket, setSelectedTicket] = useState<any>(null)
	const [showDetailsDialog, setShowDetailsDialog] = useState(false)

	const { data, loading, refetch } = useQuery(AdminSupportTicketsDocument, {
		variables: {
			filter: {
				search: searchQuery || null,
				status: filterStatus,
				priority: filterPriority,
				category: null,
				userId: null,
				startDate: null,
				endDate: null,
			},
			pagination: {
				page: 1,
				limit: 50,
			},
		},
	})

	const { data: statsData } = useQuery(AdminSupportStatisticsDocument)

	const [deleteTicket] = useMutation(AdminDeleteSupportTicketDocument, {
		onCompleted: () => {
			refetch()
		},
	})

	const [updateTicket] = useMutation(AdminUpdateSupportTicketDocument, {
		onCompleted: () => {
			refetch()
		},
	})

	const tickets = data?.adminSupportTickets?.tickets || []
	const total = data?.adminSupportTickets?.total || 0
	const stats = statsData?.adminSupportStatistics

	const statusOptions: SupportTicketStatus[] = [
		SupportTicketStatus.Open,
		SupportTicketStatus.InProgress,
		SupportTicketStatus.WaitingUser,
		SupportTicketStatus.Resolved,
		SupportTicketStatus.Closed,
	]

	const priorityOptions: SupportTicketPriority[] = [
		SupportTicketPriority.Low,
		SupportTicketPriority.Medium,
		SupportTicketPriority.High,
		SupportTicketPriority.Urgent,
	]

	const getStatusBadge = (status: SupportTicketStatus) => {
		const variants: Record<SupportTicketStatus, { variant: any; icon: any }> = {
			[SupportTicketStatus.Open]: { variant: 'default', icon: AlertCircle },
			[SupportTicketStatus.InProgress]: { variant: 'secondary', icon: Clock },
			[SupportTicketStatus.WaitingUser]: { variant: 'outline', icon: Clock },
			[SupportTicketStatus.Resolved]: { variant: 'default', icon: CheckCircle2 },
			[SupportTicketStatus.Closed]: { variant: 'secondary', icon: XCircle },
		}
		const config = variants[status]
		const Icon = config.icon
		return (
			<Badge variant={config.variant as any} className="gap-1">
				<Icon className="h-3 w-3" />
				{status}
			</Badge>
		)
	}

	const getPriorityBadge = (priority: SupportTicketPriority) => {
		const colors: Record<SupportTicketPriority, string> = {
			[SupportTicketPriority.Low]: 'bg-green-100 text-green-800',
			[SupportTicketPriority.Medium]: 'bg-yellow-100 text-yellow-800',
			[SupportTicketPriority.High]: 'bg-orange-100 text-orange-800',
			[SupportTicketPriority.Urgent]: 'bg-red-100 text-red-800',
		}
		return <Badge className={colors[priority]}>{priority}</Badge>
	}

	const handleDelete = async (ticketId: string) => {
		if (confirm('Вы уверены, что хотите удалить этот тикет?')) {
			await deleteTicket({ variables: { ticketId } })
		}
	}

	const handleStatusChange = async (ticketId: string, status: SupportTicketStatus) => {
		await updateTicket({
			variables: {
				ticketId,
				input: { status, category: null, priority: null },
			},
		})
	}

	const handlePriorityChange = async (ticketId: string, priority: SupportTicketPriority) => {
		await updateTicket({
			variables: {
				ticketId,
				input: { priority, category: null, status: null },
			},
		})
	}

	if (loading && !data) {
		return <AdminPageSkeleton />
	}

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">Поддержка</h1>
					<p className="text-muted-foreground">Управление тикетами поддержки</p>
				</div>
			</div>

			{/* Statistics Cards */}
			{stats && (
				<div className="grid gap-4 md:grid-cols-5">
					<Card className="p-4">
						<div className="flex items-center gap-2">
							<Ticket className="h-4 w-4 text-muted-foreground" />
							<div className="text-sm font-medium text-muted-foreground">Всего</div>
						</div>
						<div className="mt-2 text-2xl font-bold">{stats.totalTickets}</div>
					</Card>
					<Card className="p-4">
						<div className="flex items-center gap-2">
							<AlertCircle className="h-4 w-4 text-blue-600" />
							<div className="text-sm font-medium text-muted-foreground">Открыто</div>
						</div>
						<div className="mt-2 text-2xl font-bold">{stats.openTickets}</div>
					</Card>
					<Card className="p-4">
						<div className="flex items-center gap-2">
							<Clock className="h-4 w-4 text-yellow-600" />
							<div className="text-sm font-medium text-muted-foreground">В работе</div>
						</div>
						<div className="mt-2 text-2xl font-bold">{stats.inProgressTickets}</div>
					</Card>
					<Card className="p-4">
						<div className="flex items-center gap-2">
							<CheckCircle2 className="h-4 w-4 text-green-600" />
							<div className="text-sm font-medium text-muted-foreground">Решено</div>
						</div>
						<div className="mt-2 text-2xl font-bold">{stats.resolvedTickets}</div>
					</Card>
					<Card className="p-4">
						<div className="flex items-center gap-2">
							<XCircle className="h-4 w-4 text-gray-600" />
							<div className="text-sm font-medium text-muted-foreground">Закрыто</div>
						</div>
						<div className="mt-2 text-2xl font-bold">{stats.closedTickets}</div>
					</Card>
				</div>
			)}

			{/* Filters */}
			<Card className="p-4">
				<div className="flex flex-col gap-4 md:flex-row">
					<div className="relative flex-1">
						<Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
						<Input
							placeholder="Поиск по тикетам..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="pl-9"
						/>
					</div>
					<div className="flex gap-2">
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button variant="outline">
									Статус: {filterStatus || 'Все'}
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent>
								<DropdownMenuItem onClick={() => setFilterStatus(null)}>
									Все
								</DropdownMenuItem>
								{statusOptions.map((status) => (
									<DropdownMenuItem key={status} onClick={() => setFilterStatus(status)}>
										{status}
									</DropdownMenuItem>
								))}
							</DropdownMenuContent>
						</DropdownMenu>

						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button variant="outline">
									Приоритет: {filterPriority || 'Все'}
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent>
								<DropdownMenuItem onClick={() => setFilterPriority(null)}>
									Все
								</DropdownMenuItem>
								{priorityOptions.map((priority) => (
									<DropdownMenuItem
										key={priority}
										onClick={() => setFilterPriority(priority)}
									>
										{priority}
									</DropdownMenuItem>
								))}
							</DropdownMenuContent>
						</DropdownMenu>
					</div>
				</div>
			</Card>

			{/* Tickets Table */}
			<Card>
				<div className="overflow-x-auto">
					{loading ? (
						<div className="flex items-center justify-center p-8">
							<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
						</div>
					) : tickets.length === 0 ? (
						<div className="p-8 text-center text-muted-foreground">
							<Ticket className="mx-auto h-12 w-12 opacity-50" />
							<p className="mt-2">Тикеты не найдены</p>
						</div>
					) : (
						<table className="w-full">
							<thead className="border-b bg-muted/50">
								<tr>
									<th className="p-4 text-left text-sm font-medium">Тикет</th>
									<th className="p-4 text-left text-sm font-medium">Пользователь</th>
									<th className="p-4 text-left text-sm font-medium">Статус</th>
									<th className="p-4 text-left text-sm font-medium">Приоритет</th>
									<th className="p-4 text-left text-sm font-medium">Сообщений</th>
									<th className="p-4 text-left text-sm font-medium">Создан</th>
									<th className="p-4 text-right text-sm font-medium">Действия</th>
								</tr>
							</thead>
							<tbody>
								{tickets.map((ticket: any) => (
									<tr key={ticket.id} className="border-b transition-colors hover:bg-muted/50">
										<td className="p-4">
											<div>
												<div className="font-medium">{ticket.subject || 'Без темы'}</div>
												<div className="text-sm text-muted-foreground">
													ID: {ticket.id.slice(0, 8)}
												</div>
											</div>
										</td>
										<td className="p-4">
											<div>
												<div className="font-medium">{ticket.userFullName}</div>
												<div className="text-sm text-muted-foreground">{ticket.userEmail}</div>
											</div>
										</td>
										<td className="p-4">
											<DropdownMenu>
												<DropdownMenuTrigger asChild>
													<Button variant="ghost" size="sm" className="h-auto p-0">
														{getStatusBadge(ticket.status)}
													</Button>
												</DropdownMenuTrigger>
												<DropdownMenuContent>
													{statusOptions.map((status) => (
														<DropdownMenuItem
															key={status}
															onClick={() => handleStatusChange(ticket.id, status)}
														>
															{status}
														</DropdownMenuItem>
													))}
												</DropdownMenuContent>
											</DropdownMenu>
										</td>
										<td className="p-4">
											<DropdownMenu>
												<DropdownMenuTrigger asChild>
													<Button variant="ghost" size="sm" className="h-auto p-0">
														{getPriorityBadge(ticket.priority)}
													</Button>
												</DropdownMenuTrigger>
												<DropdownMenuContent>
													{priorityOptions.map((priority) => (
														<DropdownMenuItem
															key={priority}
															onClick={() => handlePriorityChange(ticket.id, priority)}
														>
															{priority}
														</DropdownMenuItem>
													))}
												</DropdownMenuContent>
											</DropdownMenu>
										</td>
										<td className="p-4">
											<div className="flex items-center gap-1">
												<MessageSquare className="h-4 w-4 text-muted-foreground" />
												<span>{ticket.messageCount || 0}</span>
											</div>
										</td>
										<td className="p-4 text-sm text-muted-foreground">
											{formatDistanceToNow(new Date(ticket.createdAt), {
												addSuffix: true,
												locale: ru,
											})}
										</td>
										<td className="p-4 text-right">
											<DropdownMenu>
												<DropdownMenuTrigger asChild>
													<Button variant="ghost" size="sm">
														•••
													</Button>
												</DropdownMenuTrigger>
												<DropdownMenuContent align="end">
													<DropdownMenuItem
														onClick={() => {
															setSelectedTicket(ticket)
															setShowDetailsDialog(true)
														}}
													>
														<Eye className="mr-2 h-4 w-4" />
														Просмотр
													</DropdownMenuItem>
													<DropdownMenuItem
														onClick={() => handleDelete(ticket.id)}
														className="text-destructive"
													>
														<Trash2 className="mr-2 h-4 w-4" />
														Удалить
													</DropdownMenuItem>
												</DropdownMenuContent>
											</DropdownMenu>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					)}
				</div>
				{tickets.length > 0 && (
					<div className="border-t p-4 text-sm text-muted-foreground">
						Показано {tickets.length} из {total} тикетов
					</div>
				)}
			</Card>

			{/* Details Dialog */}
			<Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
				<DialogContent className="max-w-2xl">
					<DialogHeader>
						<DialogTitle>Детали тикета</DialogTitle>
						<DialogDescription>
							Просмотр информации о тикете поддержки
						</DialogDescription>
					</DialogHeader>
					{selectedTicket && (
						<div className="space-y-4">
							<div>
								<div className="text-sm font-medium text-muted-foreground">Тема</div>
								<div className="text-lg font-semibold">
									{selectedTicket.subject || 'Без темы'}
								</div>
							</div>
							<div className="grid grid-cols-2 gap-4">
								<div>
									<div className="text-sm font-medium text-muted-foreground">Пользователь</div>
									<div>{selectedTicket.userFullName}</div>
									<div className="text-sm text-muted-foreground">
										{selectedTicket.userEmail}
									</div>
								</div>
								<div>
									<div className="text-sm font-medium text-muted-foreground">Telegram Chat ID</div>
									<div className="font-mono text-sm">{selectedTicket.telegramChatId}</div>
								</div>
							</div>
							<div className="grid grid-cols-2 gap-4">
								<div>
									<div className="text-sm font-medium text-muted-foreground">Статус</div>
									<div>{getStatusBadge(selectedTicket.status)}</div>
								</div>
								<div>
									<div className="text-sm font-medium text-muted-foreground">Приоритет</div>
									<div>{getPriorityBadge(selectedTicket.priority)}</div>
								</div>
							</div>
							{selectedTicket.category && (
								<div>
									<div className="text-sm font-medium text-muted-foreground">Категория</div>
									<div>{selectedTicket.category}</div>
								</div>
							)}
							<div className="grid grid-cols-2 gap-4">
								<div>
									<div className="text-sm font-medium text-muted-foreground">Создан</div>
									<div className="text-sm">
										{new Date(selectedTicket.createdAt).toLocaleString('ru-RU')}
									</div>
								</div>
								{selectedTicket.closedAt && (
									<div>
										<div className="text-sm font-medium text-muted-foreground">Закрыт</div>
										<div className="text-sm">
											{new Date(selectedTicket.closedAt).toLocaleString('ru-RU')}
										</div>
									</div>
								)}
							</div>
						</div>
					)}
				</DialogContent>
			</Dialog>
		</div>
	)
}
