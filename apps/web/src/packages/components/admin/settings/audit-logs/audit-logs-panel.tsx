'use client'

import { useState } from 'react'
import { Card } from '@/packages/components/ui/card'
import { Input } from '@/packages/components/ui/input'
import { Button } from '@/packages/components/ui/button'
import { AdminPageSkeleton } from '@/packages/components/ui/admin-page-skeleton'
import { Loader2, Search, Filter, FileText, User, Calendar } from 'lucide-react'
import { useQuery } from '@apollo/client/react'
import { AdminActionLogsDocument } from '@/packages/api/graphql/__generated__/output'
import { formatDistanceToNow } from 'date-fns'
import { ru } from 'date-fns/locale'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/packages/components/ui/dropdown-menu'
import { Badge } from '@/packages/components/ui/badge'

export function AuditLogsPanel() {
	const [searchQuery, setSearchQuery] = useState('')
	const [filterAction, setFilterAction] = useState<string | null>(null)
	const [filterResource, setFilterResource] = useState<string | null>(null)

	const { data, loading, refetch } = useQuery(AdminActionLogsDocument, {
		variables: {
			filter: {
				limit: 50,
				offset: 0,
				action: null,
				adminUserId: null,
				resource: null,
				startDate: null,
				endDate: null,
			},
		},
	})

	const logs = data?.adminActionLogs?.logs || []

	if (loading && !data) {
		return <AdminPageSkeleton />
	}

	// Filter logs based on search and filters
	const filteredLogs = logs.filter((log) => {
		const matchesSearch =
			!searchQuery ||
			log.adminUserEmail?.toLowerCase().includes(searchQuery.toLowerCase()) ||
			log.action?.toLowerCase().includes(searchQuery.toLowerCase()) ||
			log.resource?.toLowerCase().includes(searchQuery.toLowerCase())

		const matchesAction = !filterAction || log.action === filterAction
		const matchesResource = !filterResource || log.resource === filterResource

		return matchesSearch && matchesAction && matchesResource
	})

	// Get unique actions and resources for filters
	const uniqueActions = Array.from(new Set(logs.map((log) => log.action))).sort()
	const uniqueResources = Array.from(new Set(logs.map((log) => log.resource))).sort()

	const getActionBadgeColor = (action: string) => {
		switch (action.toLowerCase()) {
			case 'create':
			case 'created':
				return 'default'
			case 'update':
			case 'updated':
				return 'secondary'
			case 'delete':
			case 'deleted':
				return 'destructive'
			case 'verify':
			case 'verified':
				return 'outline'
			default:
				return 'secondary'
		}
	}

	const clearFilters = () => {
		setSearchQuery('')
		setFilterAction(null)
		setFilterResource(null)
	}

	const hasActiveFilters = searchQuery || filterAction || filterResource

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-3xl font-bold">Action Logs</h1>
				<p className="text-muted-foreground mt-1">View all admin actions and system events</p>
			</div>

			{/* Filters */}
			<Card className="p-4">
				<div className="flex flex-col sm:flex-row gap-4">
					<div className="flex-1 relative">
						<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
						<Input
							placeholder="Search by email, action, or resource..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="pl-10"
						/>
					</div>

					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant="outline" className="gap-2">
								<Filter className="h-4 w-4" />
								Action: {filterAction || 'All'}
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end" className="w-48">
							<DropdownMenuItem onClick={() => setFilterAction(null)}>All Actions</DropdownMenuItem>
							{uniqueActions.map((action) => (
								<DropdownMenuItem key={action} onClick={() => setFilterAction(action)}>
									{action}
								</DropdownMenuItem>
							))}
						</DropdownMenuContent>
					</DropdownMenu>

					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant="outline" className="gap-2">
								<FileText className="h-4 w-4" />
								Resource: {filterResource || 'All'}
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end" className="w-48">
							<DropdownMenuItem onClick={() => setFilterResource(null)}>All Resources</DropdownMenuItem>
							{uniqueResources.map((resource) => (
								<DropdownMenuItem key={resource} onClick={() => setFilterResource(resource)}>
									{resource}
								</DropdownMenuItem>
							))}
						</DropdownMenuContent>
					</DropdownMenu>

					{hasActiveFilters && (
						<Button variant="ghost" onClick={clearFilters}>
							Clear
						</Button>
					)}
				</div>
			</Card>

			{/* Logs Table */}
			<Card>
				{loading ? (
					<div className="flex items-center justify-center py-12">
						<Loader2 className="h-8 w-8 animate-spin text-primary" />
					</div>
				) : filteredLogs.length === 0 ? (
					<div className="text-center py-12">
						<FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
						<p className="text-lg font-medium">No logs found</p>
						<p className="text-sm text-muted-foreground mt-1">
							{hasActiveFilters ? 'Try adjusting your filters' : 'No admin actions recorded yet'}
						</p>
					</div>
				) : (
					<div className="overflow-x-auto">
						<table className="w-full">
							<thead>
								<tr className="border-b bg-muted/50">
									<th className="text-left p-4 font-medium">Timestamp</th>
									<th className="text-left p-4 font-medium">Admin</th>
									<th className="text-left p-4 font-medium">Action</th>
									<th className="text-left p-4 font-medium">Resource</th>
									<th className="text-left p-4 font-medium">Resource ID</th>
									<th className="text-left p-4 font-medium">Details</th>
								</tr>
							</thead>
							<tbody>
								{filteredLogs.map((log) => (
									<tr key={log.id} className="border-b hover:bg-muted/30 transition-colors">
										<td className="p-4">
											<div className="flex items-center gap-2 text-sm">
												<Calendar className="h-4 w-4 text-muted-foreground" />
												<span>
													{formatDistanceToNow(new Date(log.createdAt), {
														addSuffix: true,
														locale: ru,
													})}
												</span>
											</div>
											<div className="text-xs text-muted-foreground mt-1">
												{new Date(log.createdAt).toLocaleString('ru-RU')}
											</div>
										</td>
										<td className="p-4">
											<div className="flex items-center gap-2">
												<User className="h-4 w-4 text-muted-foreground" />
												<span className="text-sm font-medium">{log.adminUserEmail}</span>
											</div>
										</td>
										<td className="p-4">
											<Badge variant={getActionBadgeColor(log.action)}>{log.action}</Badge>
										</td>
										<td className="p-4">
											<span className="text-sm font-medium">{log.resource}</span>
										</td>
										<td className="p-4">
											<code className="text-xs bg-muted px-2 py-1 rounded">{log.resourceId}</code>
										</td>
										<td className="p-4">
											{log.details ? (
												<pre className="text-xs bg-muted p-2 rounded overflow-auto max-w-md">
													{JSON.stringify(log.details, null, 2)}
												</pre>
											) : (
												<span className="text-xs text-muted-foreground">No details</span>
											)}
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				)}
			</Card>

			{/* Pagination Info */}
			{!loading && filteredLogs.length > 0 && (
				<div className="flex items-center justify-between">
					<p className="text-sm text-muted-foreground">
						Showing {filteredLogs.length} of {logs.length} logs
					</p>
					{filteredLogs.length < logs.length && hasActiveFilters && (
						<Button variant="outline" size="sm" onClick={clearFilters}>
							Show All
						</Button>
					)}
				</div>
			)}
		</div>
	)
}
