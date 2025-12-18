'use client'

import { Card } from '@/packages/components/ui/card'
import { Users, Building2, FolderKanban, DollarSign, TrendingUp, AlertTriangle, Loader2 } from 'lucide-react'
import { useQuery } from '@apollo/client/react'
import {
	AdminDashboardStatsDocument,
	AdminRecentActivityDocument,
	AdminSystemHealthDocument,
} from '@/packages/api/graphql/__generated__/output'
import { formatDistanceToNow } from 'date-fns'
import { ru } from 'date-fns/locale'

interface StatCardProps {
	title: string
	value: string | number
	icon: React.ComponentType<{ className?: string }>
	trend?: {
		value: string
		isPositive: boolean
	}
}

function StatCard({ title, value, icon: Icon, trend }: StatCardProps) {
	return (
		<Card className="p-6">
			<div className="flex items-center justify-between">
				<div>
					<p className="text-sm font-medium text-muted-foreground">{title}</p>
					<p className="text-2xl font-bold mt-2">{value}</p>
					{trend && (
						<p
							className={`text-xs mt-2 flex items-center gap-1 ${
								trend.isPositive ? 'text-green-600' : 'text-red-600'
							}`}
						>
							<TrendingUp className="h-3 w-3" />
							{trend.value}
						</p>
					)}
				</div>
				<div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
					<Icon className="h-6 w-6 text-primary" />
				</div>
			</div>
		</Card>
	)
}

export default function AdminDashboardPage() {
	const { data: statsData, loading: statsLoading } = useQuery(AdminDashboardStatsDocument)
	const { data: activityData, loading: activityLoading } = useQuery(AdminRecentActivityDocument, {
		variables: { limit: 5 },
	})
	const { data: healthData, loading: healthLoading } = useQuery(AdminSystemHealthDocument)

	const stats = statsData?.adminDashboardStats
	const activities = activityData?.adminRecentActivity || []
	const health = healthData?.adminSystemHealth

	const getActionColor = (action: string) => {
		switch (action.toLowerCase()) {
			case 'create':
			case 'created':
				return 'bg-green-500'
			case 'update':
			case 'updated':
				return 'bg-blue-500'
			case 'delete':
			case 'deleted':
				return 'bg-red-500'
			case 'verify':
			case 'verified':
				return 'bg-purple-500'
			default:
				return 'bg-gray-500'
		}
	}

	const formatRevenue = (amount: number) => {
		return new Intl.NumberFormat('ru-RU', {
			style: 'currency',
			currency: 'RUB',
			minimumFractionDigits: 0,
			maximumFractionDigits: 0,
		}).format(amount)
	}

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-3xl font-bold">Admin Dashboard</h1>
				<p className="text-muted-foreground mt-1">System overview and statistics</p>
			</div>

			{statsLoading ? (
				<div className="flex items-center justify-center py-12">
					<Loader2 className="h-8 w-8 animate-spin text-primary" />
				</div>
			) : (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
					<StatCard
						title="Total Users"
						value={stats?.users.total || 0}
						icon={Users}
						trend={
							stats?.users.growthRate
								? {
										value: `${stats.users.growthRate > 0 ? '+' : ''}${stats.users.growthRate.toFixed(1)}% from last month`,
										isPositive: stats.users.growthRate > 0,
								  }
								: undefined
						}
					/>
					<StatCard
						title="Total Teams"
						value={stats?.teams.total || 0}
						icon={Building2}
						trend={
							stats?.teams.newThisMonth
								? {
										value: `+${stats.teams.newThisMonth} this month`,
										isPositive: true,
								  }
								: undefined
						}
					/>
					<StatCard
						title="Active Projects"
						value={stats?.projects.active || 0}
						icon={FolderKanban}
						trend={{
							value: `${stats?.projects.total || 0} total projects`,
							isPositive: true,
						}}
					/>
					<StatCard
						title="Monthly Revenue"
						value={formatRevenue(stats?.payments.thisMonthRevenue || 0)}
						icon={DollarSign}
					/>
				</div>
			)}

			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				<Card className="p-6">
					<h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
					{activityLoading ? (
						<div className="flex items-center justify-center py-8">
							<Loader2 className="h-6 w-6 animate-spin text-primary" />
						</div>
					) : activities.length === 0 ? (
						<p className="text-sm text-muted-foreground text-center py-8">No recent activity</p>
					) : (
						<div className="space-y-4">
							{activities.map((activity, index) => (
								<div
									key={activity.id}
									className={`flex items-start gap-3 ${index < activities.length - 1 ? 'pb-3 border-b' : ''}`}
								>
									<div className={`h-2 w-2 rounded-full ${getActionColor(activity.action)} mt-2`} />
									<div className="flex-1">
										<p className="text-sm font-medium">
											{activity.action} {activity.resource}
										</p>
										<p className="text-xs text-muted-foreground">
											{activity.adminUserEmail} -{' '}
											{formatDistanceToNow(new Date(activity.createdAt), {
												addSuffix: true,
												locale: ru,
											})}
										</p>
									</div>
								</div>
							))}
						</div>
					)}
				</Card>

				<Card className="p-6">
					<h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
						<AlertTriangle className="h-5 w-5 text-yellow-500" />
						System Status
					</h2>
					{healthLoading ? (
						<div className="flex items-center justify-center py-8">
							<Loader2 className="h-6 w-6 animate-spin text-primary" />
						</div>
					) : (
						<div className="space-y-4">
							<div
								className={`p-3 rounded-lg ${
									health?.database
										? 'bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800'
										: 'bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800'
								}`}
							>
								<p
									className={`text-sm font-medium ${
										health?.database
											? 'text-green-800 dark:text-green-200'
											: 'text-red-800 dark:text-red-200'
									}`}
								>
									Database Status
								</p>
								<p
									className={`text-xs mt-1 ${
										health?.database
											? 'text-green-600 dark:text-green-400'
											: 'text-red-600 dark:text-red-400'
									}`}
								>
									{health?.database
										? 'All database connections operational'
										: 'Database connection issues detected'}
								</p>
							</div>

							{health?.storageAvailable && (
								<div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800">
									<p className="text-sm font-medium text-blue-800 dark:text-blue-200">Storage Available</p>
									<p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
										Storage system operational
									</p>
								</div>
							)}

							{health?.lastBackup && (
								<div className="p-3 rounded-lg bg-purple-50 dark:bg-purple-950 border border-purple-200 dark:border-purple-800">
									<p className="text-sm font-medium text-purple-800 dark:text-purple-200">Last Backup</p>
									<p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
										{formatDistanceToNow(new Date(health.lastBackup), {
											addSuffix: true,
											locale: ru,
										})}
									</p>
								</div>
							)}
						</div>
					)}
				</Card>
			</div>
		</div>
	)
}
