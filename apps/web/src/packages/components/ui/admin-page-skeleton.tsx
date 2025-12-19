import { Card } from './card'
import { Skeleton } from './skeleton'

export function AdminPageSkeleton() {
	return (
		<div className="space-y-6">
			{/* Header Skeleton */}
			<div>
				<Skeleton className="h-9 w-64 mb-2" />
				<Skeleton className="h-5 w-96" />
			</div>

			{/* Stats Cards Skeleton */}
			<div className="grid gap-4 md:grid-cols-4">
				{[1, 2, 3, 4].map((i) => (
					<Card key={i} className="p-4">
						<div className="flex items-center gap-3">
							<Skeleton className="h-10 w-10 rounded-full" />
							<div className="flex-1">
								<Skeleton className="h-4 w-20 mb-2" />
								<Skeleton className="h-8 w-16" />
							</div>
						</div>
					</Card>
				))}
			</div>

			{/* Filters Skeleton */}
			<Card className="p-4">
				<div className="flex gap-4">
					<Skeleton className="h-10 flex-1" />
					<Skeleton className="h-10 w-32" />
					<Skeleton className="h-10 w-32" />
				</div>
			</Card>

			{/* Table Skeleton */}
			<Card>
				<div className="p-6 space-y-4">
					{[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
						<div key={i} className="flex items-center gap-4">
							<Skeleton className="h-12 w-12 rounded" />
							<div className="flex-1 space-y-2">
								<Skeleton className="h-4 w-full" />
								<Skeleton className="h-3 w-3/4" />
							</div>
							<Skeleton className="h-8 w-20" />
							<Skeleton className="h-8 w-20" />
							<Skeleton className="h-8 w-8" />
						</div>
					))}
				</div>
			</Card>
		</div>
	)
}

export function AdminDashboardSkeleton() {
	return (
		<div className="space-y-6">
			{/* Header */}
			<div>
				<Skeleton className="h-9 w-48 mb-2" />
				<Skeleton className="h-5 w-64" />
			</div>

			{/* Stats Grid */}
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				{[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
					<Card key={i} className="p-6">
						<div className="space-y-2">
							<Skeleton className="h-4 w-24" />
							<Skeleton className="h-8 w-16" />
							<Skeleton className="h-3 w-32" />
						</div>
					</Card>
				))}
			</div>

			{/* Charts */}
			<div className="grid gap-6 md:grid-cols-2">
				<Card className="p-6">
					<Skeleton className="h-6 w-32 mb-4" />
					<Skeleton className="h-64 w-full" />
				</Card>
				<Card className="p-6">
					<Skeleton className="h-6 w-32 mb-4" />
					<Skeleton className="h-64 w-full" />
				</Card>
			</div>

			{/* Recent Activity */}
			<Card className="p-6">
				<Skeleton className="h-6 w-40 mb-4" />
				<div className="space-y-3">
					{[1, 2, 3, 4, 5].map((i) => (
						<div key={i} className="flex items-center gap-3">
							<Skeleton className="h-10 w-10 rounded-full" />
							<div className="flex-1 space-y-1">
								<Skeleton className="h-4 w-full" />
								<Skeleton className="h-3 w-1/2" />
							</div>
							<Skeleton className="h-3 w-24" />
						</div>
					))}
				</div>
			</Card>
		</div>
	)
}

export function AdminAnalyticsSkeleton() {
	return (
		<div className="space-y-6">
			{/* Header */}
			<div>
				<Skeleton className="h-9 w-40 mb-2" />
				<Skeleton className="h-5 w-80" />
			</div>

			{/* Revenue Chart */}
			<Card className="p-6">
				<Skeleton className="h-6 w-48 mb-6" />
				<Skeleton className="h-80 w-full" />
			</Card>

			{/* User Growth Chart */}
			<Card className="p-6">
				<Skeleton className="h-6 w-48 mb-6" />
				<Skeleton className="h-80 w-full" />
			</Card>

			{/* Summary Cards */}
			<div className="grid gap-4 md:grid-cols-3">
				{[1, 2, 3].map((i) => (
					<Card key={i} className="p-6">
						<Skeleton className="h-5 w-32 mb-4" />
						<Skeleton className="h-10 w-24 mb-2" />
						<Skeleton className="h-3 w-40" />
					</Card>
				))}
			</div>
		</div>
	)
}
