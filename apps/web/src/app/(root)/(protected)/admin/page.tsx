'use client'

import { Card } from '@/packages/components/ui/card'
import { Users, Building2, FolderKanban, DollarSign, TrendingUp, AlertTriangle } from 'lucide-react'

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
	// TODO: Fetch real statistics from GraphQL
	const stats = {
		totalUsers: 1247,
		totalTeams: 342,
		activeProjects: 856,
		monthlyRevenue: '₽245,680',
	}

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-3xl font-bold">Admin Dashboard</h1>
				<p className="text-muted-foreground mt-1">System overview and statistics</p>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
				<StatCard
					title="Total Users"
					value={stats.totalUsers}
					icon={Users}
					trend={{ value: '+12% from last month', isPositive: true }}
				/>
				<StatCard
					title="Total Teams"
					value={stats.totalTeams}
					icon={Building2}
					trend={{ value: '+8% from last month', isPositive: true }}
				/>
				<StatCard
					title="Active Projects"
					value={stats.activeProjects}
					icon={FolderKanban}
					trend={{ value: '+15% from last month', isPositive: true }}
				/>
				<StatCard title="Monthly Revenue" value={stats.monthlyRevenue} icon={DollarSign} />
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				<Card className="p-6">
					<h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
					<div className="space-y-4">
						<div className="flex items-start gap-3 pb-3 border-b">
							<div className="h-2 w-2 rounded-full bg-green-500 mt-2" />
							<div className="flex-1">
								<p className="text-sm font-medium">New user registered</p>
								<p className="text-xs text-muted-foreground">user@example.com - 2 minutes ago</p>
							</div>
						</div>
						<div className="flex items-start gap-3 pb-3 border-b">
							<div className="h-2 w-2 rounded-full bg-blue-500 mt-2" />
							<div className="flex-1">
								<p className="text-sm font-medium">Project created</p>
								<p className="text-xs text-muted-foreground">
									"Новостройка ЖК Солнечный" - 15 minutes ago
								</p>
							</div>
						</div>
						<div className="flex items-start gap-3 pb-3 border-b">
							<div className="h-2 w-2 rounded-full bg-purple-500 mt-2" />
							<div className="flex-1">
								<p className="text-sm font-medium">Subscription upgraded</p>
								<p className="text-xs text-muted-foreground">Team "СтройГруп" - 1 hour ago</p>
							</div>
						</div>
						<div className="flex items-start gap-3">
							<div className="h-2 w-2 rounded-full bg-orange-500 mt-2" />
							<div className="flex-1">
								<p className="text-sm font-medium">Payment received</p>
								<p className="text-xs text-muted-foreground">₽2,490 - BRIGADE plan - 3 hours ago</p>
							</div>
						</div>
					</div>
				</Card>

				<Card className="p-6">
					<h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
						<AlertTriangle className="h-5 w-5 text-yellow-500" />
						System Alerts
					</h2>
					<div className="space-y-4">
						<div className="p-3 rounded-lg bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800">
							<p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
								High Storage Usage
							</p>
							<p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
								Storage usage at 85%. Consider upgrading storage capacity.
							</p>
						</div>
						<div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800">
							<p className="text-sm font-medium text-blue-800 dark:text-blue-200">
								Pending Support Tickets
							</p>
							<p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
								12 support tickets awaiting response.
							</p>
						</div>
						<div className="p-3 rounded-lg bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800">
							<p className="text-sm font-medium text-green-800 dark:text-green-200">All Systems Operational</p>
							<p className="text-xs text-green-600 dark:text-green-400 mt-1">
								All services running normally. Last check: 2 minutes ago.
							</p>
						</div>
					</div>
				</Card>
			</div>
		</div>
	)
}
