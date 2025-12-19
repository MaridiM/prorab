'use client'

import { useState, useEffect, useMemo } from 'react'
import { useQuery } from '@apollo/client/react'
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
import { Search, MoreVertical, Plus, Edit, Archive, CheckCircle, Trash2 } from 'lucide-react'
import {
	GetAdminPlansDocument,
} from '@/packages/api/graphql/__generated__/output'

const formatCurrency = (amount: number, currency: string) => {
	return new Intl.NumberFormat('ru-RU', {
		style: 'currency',
		currency: currency,
		minimumFractionDigits: 0,
		maximumFractionDigits: 0,
	}).format(amount)
}

export default function AdminPlansPage() {
	const [search, setSearch] = useState('')
	const [debouncedSearch, setDebouncedSearch] = useState('')
	const [statusFilter, setStatusFilter] = useState<string>('all')

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

	if (loading && !data) {
		return <AdminPageSkeleton />
	}

	const getStatusBadge = (isActive: boolean) => {
		if (isActive) {
			return <Badge className="bg-green-500">Active</Badge>
		}
		return <Badge variant="secondary">Archived</Badge>
	}

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex justify-between items-center">
				<div>
					<h1 className="text-3xl font-bold">Subscription Plans</h1>
					<p className="text-muted-foreground mt-1">
						Manage subscription plans, pricing, and features
					</p>
				</div>
				<Button>
					<Plus className="h-4 w-4 mr-2" />
					New Plan
				</Button>
			</div>

			{/* Stats Cards */}
			<div className="grid gap-4 md:grid-cols-4">
				<Card className="p-6">
					<div className="text-sm font-medium text-muted-foreground">Total Plans</div>
					<div className="text-2xl font-bold mt-2">{plans.length}</div>
				</Card>
				<Card className="p-6">
					<div className="text-sm font-medium text-muted-foreground">Active Plans</div>
					<div className="text-2xl font-bold mt-2">
						{plans.filter((p) => p.isActive).length}
					</div>
				</Card>
				<Card className="p-6">
					<div className="text-sm font-medium text-muted-foreground">Total Subscriptions</div>
					<div className="text-2xl font-bold mt-2">
						{plans.reduce((sum, p) => sum + (p.subscriptionsCount || 0), 0)}
					</div>
				</Card>
				<Card className="p-6">
					<div className="text-sm font-medium text-muted-foreground">Currencies</div>
					<div className="text-2xl font-bold mt-2">
						{plans.length > 0
							? new Set(plans.flatMap((p) => p.prices.map((pr) => pr.currency))).size
							: 0}
					</div>
				</Card>
			</div>

			{/* Filters */}
			<Card className="p-6">
				<div className="flex gap-4">
					<div className="flex-1 relative">
						<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
						<Input
							placeholder="Search plans..."
							value={search}
							onChange={(e) => setSearch(e.target.value)}
							className="pl-10"
						/>
					</div>
					<Select value={statusFilter} onValueChange={setStatusFilter}>
						<SelectTrigger className="w-[180px]">
							<SelectValue placeholder="Status" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">All Status</SelectItem>
							<SelectItem value="active">Active</SelectItem>
							<SelectItem value="archived">Archived</SelectItem>
						</SelectContent>
					</Select>
				</div>
			</Card>

			{/* Plans Table */}
			<Card>
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Plan Name</TableHead>
							<TableHead>Slug</TableHead>
							<TableHead>Status</TableHead>
							<TableHead>Max Projects</TableHead>
							<TableHead>Max Members</TableHead>
							<TableHead>Storage (GB)</TableHead>
							<TableHead>Prices</TableHead>
							<TableHead>Subscriptions</TableHead>
							<TableHead className="w-[50px]"></TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{plans.length === 0 ? (
							<TableRow>
								<TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
									No plans found
								</TableCell>
							</TableRow>
						) : (
							plans.map((plan) => (
								<TableRow key={plan.id}>
									<TableCell className="font-medium">
										<div className="flex items-center gap-2">
											{plan.name}
											{plan.isPopular && (
												<Badge variant="outline" className="text-xs">
													Popular
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
											<span className="text-muted-foreground">Unlimited</span>
										) : (
											plan.maxActiveProjects
										)}
									</TableCell>
									<TableCell>{plan.maxMembers}</TableCell>
									<TableCell>{plan.storageGB}</TableCell>
									<TableCell>
										<div className="flex flex-wrap gap-1">
											{plan.prices.map((price) => (
												<Badge key={price.id} variant="secondary" className="text-xs">
													{formatCurrency(price.price, price.currency)}/{price.billingCycleDays}d
												</Badge>
											))}
										</div>
									</TableCell>
									<TableCell>{plan.subscriptionsCount || 0}</TableCell>
									<TableCell>
										<DropdownMenu>
											<DropdownMenuTrigger asChild>
												<Button variant="ghost" size="sm">
													<MoreVertical className="h-4 w-4" />
												</Button>
											</DropdownMenuTrigger>
											<DropdownMenuContent align="end">
												<DropdownMenuLabel>Actions</DropdownMenuLabel>
												<DropdownMenuSeparator />
												<DropdownMenuItem>
													<Edit className="h-4 w-4 mr-2" />
													Edit Plan
												</DropdownMenuItem>
												{plan.isActive ? (
													<DropdownMenuItem>
														<Archive className="h-4 w-4 mr-2" />
														Archive Plan
													</DropdownMenuItem>
												) : (
													<DropdownMenuItem>
														<CheckCircle className="h-4 w-4 mr-2" />
														Activate Plan
													</DropdownMenuItem>
												)}
												<DropdownMenuSeparator />
												<DropdownMenuItem
													className="text-destructive"
													disabled={(plan.subscriptionsCount || 0) > 0}
												>
													<Trash2 className="h-4 w-4 mr-2" />
													Delete Plan
												</DropdownMenuItem>
											</DropdownMenuContent>
										</DropdownMenu>
									</TableCell>
								</TableRow>
							))
						)}
					</TableBody>
				</Table>
			</Card>
		</div>
	)
}
