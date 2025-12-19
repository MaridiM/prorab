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
import { Search, MoreVertical, Trash2, XCircle, Clock, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import {
	AdminSubscriptionsDocument,
	AdminCancelSubscriptionDocument,
	AdminDeleteSubscriptionDocument,
} from '@/packages/api/graphql/__generated__/output'

const statusVariant: Record<string, 'default' | 'secondary' | 'success' | 'warning' | 'danger'> = {
	ACTIVE: 'success',
	TRIALING: 'default',
	PAST_DUE: 'warning',
	CANCELLED: 'secondary',
	UNPAID: 'danger',
}

export default function AdminSubscriptionsPage() {
	const [page, setPage] = useState(1)
	const [search, setSearch] = useState('')
	const [debouncedSearch, setDebouncedSearch] = useState('')
	const [planFilter, setPlanFilter] = useState<string>('')
	const [statusFilter, setStatusFilter] = useState<string>('')
	const [selectedSubscription, setSelectedSubscription] = useState<any>(null)
	const [isDetailsOpen, setIsDetailsOpen] = useState(false)

	// Debounce search input
	useEffect(() => {
		const timer = setTimeout(() => {
			setDebouncedSearch(search)
			setPage(1) // Reset to first page when search changes
		}, 500)

		return () => clearTimeout(timer)
	}, [search])

	// Reset page when filters change
	useEffect(() => {
		setPage(1)
	}, [planFilter, statusFilter])

	// Build filters with useMemo
	const filters = useMemo(() => {
		const plan = planFilter && planFilter !== 'all' ? planFilter : null
		const status = statusFilter && statusFilter !== 'all' ? statusFilter : null

		if (debouncedSearch || plan || status) {
			return {
				search: debouncedSearch || null,
				plan,
				status,
				expiringBefore: null,
				createdAfter: null,
				createdBefore: null,
			}
		}
		return null
	}, [debouncedSearch, planFilter, statusFilter])

	const { data, loading, refetch } = useQuery(AdminSubscriptionsDocument, {
		variables: {
			filters,
			pagination: {
				page,
				limit: 20,
			},
		},
	})

	const [cancelSubscription] = useMutation(AdminCancelSubscriptionDocument, {
		onCompleted: () => {
			toast.success('Subscription cancelled successfully')
			refetch()
		},
		onError: (error) => {
			toast.error('Failed to cancel subscription: ' + error.message)
		},
	})

	const [deleteSubscription] = useMutation(AdminDeleteSubscriptionDocument, {
		onCompleted: () => {
			toast.success('Subscription deleted successfully')
			refetch()
		},
		onError: (error) => {
			toast.error('Failed to delete subscription: ' + error.message)
		},
	})

	const subscriptions = data?.adminSubscriptions?.nodes || []
	const pageInfo = data?.adminSubscriptions?.pageInfo
	const totalCount = data?.adminSubscriptions?.totalCount || 0

	if (loading && !data) {
		return <AdminPageSkeleton />
	}

	const handleCancelSubscription = (subscriptionId: string) => {
		const message = 'Cancel subscription? This will take effect at the end of the current period.'
		if (confirm(message)) {
			cancelSubscription({ variables: { id: subscriptionId } })
		}
	}

	const handleDeleteSubscription = (subscriptionId: string) => {
		if (confirm('Are you sure you want to delete this subscription? This action cannot be undone.')) {
			deleteSubscription({ variables: { id: subscriptionId } })
		}
	}

	const handleViewDetails = (subscription: any) => {
		setSelectedSubscription(subscription)
		setIsDetailsOpen(true)
	}

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-3xl font-bold">Subscription Management</h1>
				<p className="text-muted-foreground mt-1">Manage and monitor subscriptions</p>
			</div>

			<Card className="p-6">
				<div className="flex flex-col md:flex-row gap-4 mb-6">
					<div className="flex-1 relative">
						<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
						<Input
							placeholder="Search by team name or subscription ID..."
							value={search}
							onChange={(e) => setSearch(e.target.value)}
							className="pl-10"
						/>
					</div>
					<Select value={planFilter} onValueChange={setPlanFilter}>
						<SelectTrigger className="w-full md:w-[180px]">
							<SelectValue placeholder="Plan" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">All Plans</SelectItem>
							<SelectItem value="LITE">LITE</SelectItem>
							<SelectItem value="FOREMAN">FOREMAN</SelectItem>
							<SelectItem value="BRIGADE">BRIGADE</SelectItem>
						</SelectContent>
					</Select>
					<Select value={statusFilter} onValueChange={setStatusFilter}>
						<SelectTrigger className="w-full md:w-[180px]">
							<SelectValue placeholder="Status" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">All Status</SelectItem>
							<SelectItem value="ACTIVE">Active</SelectItem>
							<SelectItem value="TRIALING">Trialing</SelectItem>
							<SelectItem value="PAST_DUE">Past Due</SelectItem>
							<SelectItem value="CANCELLED">Cancelled</SelectItem>
							<SelectItem value="UNPAID">Unpaid</SelectItem>
						</SelectContent>
					</Select>
				</div>

				{loading ? (
					<div className="text-center py-12">
						<div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent" />
						<p className="mt-4 text-muted-foreground">Loading subscriptions...</p>
					</div>
				) : (
					<>
						<div className="rounded-md border">
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Subscription ID</TableHead>
										<TableHead>Team ID</TableHead>
										<TableHead>Plan</TableHead>
										<TableHead>Status</TableHead>
										<TableHead>Current Period</TableHead>
										<TableHead className="text-right">Actions</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{subscriptions.length === 0 ? (
										<TableRow>
											<TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
												No subscriptions found
											</TableCell>
										</TableRow>
									) : (
										subscriptions.map((subscription: any) => (
											<TableRow key={subscription.id}>
												<TableCell className="font-mono text-xs">
													{subscription.id.slice(0, 8)}...
												</TableCell>
												<TableCell className="font-mono text-xs">
													{subscription.teamId.slice(0, 8)}...
												</TableCell>
												<TableCell>
													<Badge variant="secondary">{subscription.plan}</Badge>
												</TableCell>
												<TableCell>
													<Badge variant={statusVariant[subscription.status] || 'secondary'}>
														{subscription.status}
													</Badge>
													{subscription.cancelAtPeriodEnd && (
														<Badge variant="secondary" className="ml-2">
															<Clock className="h-3 w-3 mr-1" />
															Cancelling
														</Badge>
													)}
												</TableCell>
												<TableCell className="text-muted-foreground text-sm">
													{new Date(subscription.currentPeriodStart).toLocaleDateString()} -{' '}
													{new Date(subscription.currentPeriodEnd).toLocaleDateString()}
												</TableCell>
												<TableCell className="text-right">
													<DropdownMenu>
														<DropdownMenuTrigger asChild>
															<Button variant="ghost" size="icon">
																<MoreVertical className="h-4 w-4" />
															</Button>
														</DropdownMenuTrigger>
														<DropdownMenuContent align="end">
															<DropdownMenuLabel>Actions</DropdownMenuLabel>
															<DropdownMenuItem onClick={() => handleViewDetails(subscription)}>
																View Details
															</DropdownMenuItem>
															{subscription.status === 'ACTIVE' && (
																<>
																	<DropdownMenuItem
																		onClick={() => handleCancelSubscription(subscription.id)}
																	>
																		<XCircle className="h-4 w-4 mr-2" />
																		Cancel Subscription
																	</DropdownMenuItem>
																</>
															)}
															<DropdownMenuSeparator />
															<DropdownMenuItem
																onClick={() => handleDeleteSubscription(subscription.id)}
																className="text-destructive"
															>
																<Trash2 className="h-4 w-4 mr-2" />
																Delete Subscription
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
								Showing {subscriptions.length} of {totalCount} subscriptions
							</p>
							<div className="flex gap-2">
								<Button
									variant="outline"
									size="sm"
									onClick={() => setPage(page - 1)}
									disabled={!pageInfo?.hasPreviousPage}
								>
									Previous
								</Button>
								<Button
									variant="outline"
									size="sm"
									onClick={() => setPage(page + 1)}
									disabled={!pageInfo?.hasNextPage}
								>
									Next
								</Button>
							</div>
						</div>
					</>
				)}
			</Card>

			<Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
				<DialogContent className="max-w-2xl">
					<DialogHeader>
						<DialogTitle>Subscription Details</DialogTitle>
						<DialogDescription>Detailed information about the subscription</DialogDescription>
					</DialogHeader>
					{selectedSubscription && (
						<div className="space-y-4">
							<div className="grid grid-cols-2 gap-4">
								<div>
									<p className="text-sm font-medium text-muted-foreground">Subscription ID</p>
									<p className="mt-1 font-mono text-sm">{selectedSubscription.id}</p>
								</div>
								<div>
									<p className="text-sm font-medium text-muted-foreground">Team ID</p>
									<p className="mt-1 font-mono text-sm">{selectedSubscription.teamId}</p>
								</div>
								<div>
									<p className="text-sm font-medium text-muted-foreground">Plan</p>
									<p className="mt-1">
										<Badge variant="secondary">{selectedSubscription.plan}</Badge>
									</p>
								</div>
								<div>
									<p className="text-sm font-medium text-muted-foreground">Status</p>
									<p className="mt-1">
										<Badge variant={statusVariant[selectedSubscription.status] || 'secondary'}>
											{selectedSubscription.status}
										</Badge>
									</p>
								</div>
								<div>
									<p className="text-sm font-medium text-muted-foreground">Period Start</p>
									<p className="mt-1">
										{new Date(selectedSubscription.currentPeriodStart).toLocaleString()}
									</p>
								</div>
								<div>
									<p className="text-sm font-medium text-muted-foreground">Period End</p>
									<p className="mt-1">
										{new Date(selectedSubscription.currentPeriodEnd).toLocaleString()}
									</p>
								</div>
								<div>
									<p className="text-sm font-medium text-muted-foreground">Created</p>
									<p className="mt-1">{new Date(selectedSubscription.createdAt).toLocaleString()}</p>
								</div>
								{selectedSubscription.trialEnd && (
									<div>
										<p className="text-sm font-medium text-muted-foreground">Trial End</p>
										<p className="mt-1">
											{new Date(selectedSubscription.trialEnd).toLocaleString()}
										</p>
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
