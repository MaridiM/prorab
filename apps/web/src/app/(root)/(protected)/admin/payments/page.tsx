'use client'

import { useState } from 'react'
import { useQuery, useMutation } from '@apollo/client/react'
import { Card } from '@/packages/components/ui/card'
import { Button } from '@/packages/components/ui/button'
import { Input } from '@/packages/components/ui/input'
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
import { Search, MoreVertical, Trash2, RotateCcw, CheckCircle2, XCircle } from 'lucide-react'
import { toast } from 'sonner'
import {
	AdminPaymentsDocument,
	AdminDeletePaymentDocument,
	AdminUpdatePaymentStatusDocument,
	type AdminPaymentsQuery,
} from '@/packages/api/graphql/__generated__/output'

const statusVariant: Record<string, 'default' | 'secondary' | 'success' | 'warning' | 'danger'> = {
	SUCCEEDED: 'success',
	PENDING: 'warning',
	FAILED: 'danger',
	CANCELLED: 'secondary',
	REFUNDED: 'secondary',
}

const statusIcon: Record<string, any> = {
	SUCCEEDED: CheckCircle2,
	FAILED: XCircle,
	CANCELLED: XCircle,
}

export default function AdminPaymentsPage() {
	const [page, setPage] = useState(1)
	const [search, setSearch] = useState('')
	const [statusFilter, setStatusFilter] = useState<string>('')
	const [selectedPayment, setSelectedPayment] = useState<any>(null)
	const [isDetailsOpen, setIsDetailsOpen] = useState(false)

	const { data, loading, refetch } = useQuery(AdminPaymentsDocument, {
		variables: {
			filters: (search || statusFilter) ? {
				search: search || null,
				status: statusFilter || null,
				createdAfter: null,
				createdBefore: null,
				minAmount: null,
				maxAmount: null,
			} : null,
			pagination: {
				page,
				limit: 20,
			},
		},
	})

	const [deletePayment] = useMutation(AdminDeletePaymentDocument, {
		onCompleted: () => {
			toast.success('Payment deleted successfully')
			refetch()
		},
		onError: (error) => {
			toast.error('Failed to delete payment: ' + error.message)
		},
	})

	const [updatePaymentStatus] = useMutation(AdminUpdatePaymentStatusDocument, {
		onCompleted: () => {
			toast.success('Payment status updated successfully')
			refetch()
		},
		onError: (error) => {
			toast.error('Failed to update payment status: ' + error.message)
		},
	})

	const payments = data?.adminPayments?.nodes || []
	const pageInfo = data?.adminPayments?.pageInfo
	const totalCount = data?.adminPayments?.totalCount || 0

	const handleDeletePayment = (paymentId: string) => {
		if (confirm('Are you sure you want to delete this payment? This action cannot be undone.')) {
			deletePayment({ variables: { id: paymentId } })
		}
	}

	const handleUpdateStatus = (paymentId: string, status: string) => {
		if (confirm(`Update payment status to ${status}?`)) {
			updatePaymentStatus({ variables: { id: paymentId, status } })
		}
	}

	const handleViewDetails = (payment: any) => {
		setSelectedPayment(payment)
		setIsDetailsOpen(true)
	}

	const formatAmount = (amount: number, currency: string) => {
		return new Intl.NumberFormat('ru-RU', {
			style: 'currency',
			currency: currency || 'RUB',
		}).format(amount)
	}

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-3xl font-bold">Payment Management</h1>
				<p className="text-muted-foreground mt-1">Manage and monitor payments</p>
			</div>

			<Card className="p-6">
				<div className="flex flex-col md:flex-row gap-4 mb-6">
					<div className="flex-1 relative">
						<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
						<Input
							placeholder="Search by payment ID or subscription ID..."
							value={search}
							onChange={(e) => setSearch(e.target.value)}
							className="pl-10"
						/>
					</div>
					<Select value={statusFilter} onValueChange={setStatusFilter}>
						<SelectTrigger className="w-full md:w-[180px]">
							<SelectValue placeholder="Status" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">All Status</SelectItem>
							<SelectItem value="PENDING">Pending</SelectItem>
							<SelectItem value="SUCCEEDED">Succeeded</SelectItem>
							<SelectItem value="FAILED">Failed</SelectItem>
							<SelectItem value="CANCELLED">Cancelled</SelectItem>
							<SelectItem value="REFUNDED">Refunded</SelectItem>
						</SelectContent>
					</Select>
				</div>

				{loading ? (
					<div className="text-center py-12">
						<div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent" />
						<p className="mt-4 text-muted-foreground">Loading payments...</p>
					</div>
				) : (
					<>
						<div className="rounded-md border">
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Payment ID</TableHead>
										<TableHead>Subscription</TableHead>
										<TableHead>Amount</TableHead>
										<TableHead>Status</TableHead>
										<TableHead>YooKassa ID</TableHead>
										<TableHead>Date</TableHead>
										<TableHead className="text-right">Actions</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{payments.length === 0 ? (
										<TableRow>
											<TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
												No payments found
											</TableCell>
										</TableRow>
									) : (
										payments.map((payment: any) => {
											const StatusIcon = statusIcon[payment.status]
											return (
												<TableRow key={payment.id}>
													<TableCell className="font-mono text-xs">
														{payment.id.slice(0, 8)}...
													</TableCell>
													<TableCell className="font-mono text-xs">
														{payment.subscriptionId.slice(0, 8)}...
													</TableCell>
													<TableCell className="font-semibold">
														{formatAmount(payment.amount, payment.currency)}
													</TableCell>
													<TableCell>
														<Badge variant={statusVariant[payment.status] || 'secondary'}>
															{StatusIcon && <StatusIcon className="h-3 w-3 mr-1" />}
															{payment.status}
														</Badge>
													</TableCell>
													<TableCell className="font-mono text-xs">
														{payment.yookassaPaymentId || '-'}
													</TableCell>
													<TableCell className="text-muted-foreground">
														{new Date(payment.createdAt).toLocaleString()}
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
																<DropdownMenuItem onClick={() => handleViewDetails(payment)}>
																	View Details
																</DropdownMenuItem>
																{payment.status === 'PENDING' && (
																	<>
																		<DropdownMenuItem
																			onClick={() =>
																				handleUpdateStatus(payment.id, 'SUCCEEDED')
																			}
																		>
																			<CheckCircle2 className="h-4 w-4 mr-2" />
																			Mark as Succeeded
																		</DropdownMenuItem>
																		<DropdownMenuItem
																			onClick={() => handleUpdateStatus(payment.id, 'FAILED')}
																		>
																			<XCircle className="h-4 w-4 mr-2" />
																			Mark as Failed
																		</DropdownMenuItem>
																	</>
																)}
																{payment.status === 'SUCCEEDED' && (
																	<DropdownMenuItem
																		onClick={() => handleUpdateStatus(payment.id, 'REFUNDED')}
																	>
																		<RotateCcw className="h-4 w-4 mr-2" />
																		Mark as Refunded
																	</DropdownMenuItem>
																)}
																<DropdownMenuSeparator />
																<DropdownMenuItem
																	onClick={() => handleDeletePayment(payment.id)}
																	className="text-destructive"
																>
																	<Trash2 className="h-4 w-4 mr-2" />
																	Delete Payment
																</DropdownMenuItem>
															</DropdownMenuContent>
														</DropdownMenu>
													</TableCell>
												</TableRow>
											)
										})
									)}
								</TableBody>
							</Table>
						</div>

						<div className="flex items-center justify-between mt-4">
							<p className="text-sm text-muted-foreground">
								Showing {payments.length} of {totalCount} payments
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
						<DialogTitle>Payment Details</DialogTitle>
						<DialogDescription>Detailed information about the payment</DialogDescription>
					</DialogHeader>
					{selectedPayment && (
						<div className="space-y-4">
							<div className="grid grid-cols-2 gap-4">
								<div>
									<p className="text-sm font-medium text-muted-foreground">Payment ID</p>
									<p className="mt-1 font-mono text-sm">{selectedPayment.id}</p>
								</div>
								<div>
									<p className="text-sm font-medium text-muted-foreground">Subscription ID</p>
									<p className="mt-1 font-mono text-sm">{selectedPayment.subscriptionId}</p>
								</div>
								<div>
									<p className="text-sm font-medium text-muted-foreground">Amount</p>
									<p className="mt-1 text-lg font-semibold">
										{formatAmount(selectedPayment.amount, selectedPayment.currency)}
									</p>
								</div>
								<div>
									<p className="text-sm font-medium text-muted-foreground">Status</p>
									<p className="mt-1">
										<Badge variant={statusVariant[selectedPayment.status] || 'secondary'}>
											{selectedPayment.status}
										</Badge>
									</p>
								</div>
								<div>
									<p className="text-sm font-medium text-muted-foreground">YooKassa Payment ID</p>
									<p className="mt-1 font-mono text-sm">
										{selectedPayment.yookassaPaymentId || 'N/A'}
									</p>
								</div>
								<div>
									<p className="text-sm font-medium text-muted-foreground">Currency</p>
									<p className="mt-1">{selectedPayment.currency}</p>
								</div>
								<div>
									<p className="text-sm font-medium text-muted-foreground">Created</p>
									<p className="mt-1">{new Date(selectedPayment.createdAt).toLocaleString()}</p>
								</div>
							</div>
						</div>
					)}
				</DialogContent>
			</Dialog>
		</div>
	)
}
