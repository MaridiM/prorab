'use client'

import { Card } from '@/packages/components/ui/card'
import { Loader2, TrendingUp, TrendingDown, Users, DollarSign, BarChart3 } from 'lucide-react'
import { useQuery } from '@apollo/client/react'
import { AdminAnalyticsSkeleton } from '@/packages/components/ui/admin-page-skeleton'
import {
	AdminRevenueChartDocument,
	AdminUserGrowthChartDocument,
} from '@/packages/api/graphql/__generated__/output'
import {
	LineChart,
	Line,
	BarChart,
	Bar,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	Legend,
	ResponsiveContainer,
} from 'recharts'

export default function AdminAnalyticsPage() {
	const { data: revenueData, loading: revenueLoading } = useQuery(AdminRevenueChartDocument)
	const { data: userGrowthData, loading: userGrowthLoading } = useQuery(
		AdminUserGrowthChartDocument,
	)

	const revenueChartData = revenueData?.adminRevenueChart
	const userGrowthChartData = userGrowthData?.adminUserGrowthChart

	// Transform data for recharts
	const revenueChartFormatted = revenueChartData?.labels.map((label, index) => ({
		month: label,
		revenue: revenueChartData.data[index] || 0,
	}))

	const userGrowthChartFormatted = userGrowthChartData?.labels.map((label, index) => ({
		month: label,
		users: userGrowthChartData.data[index] || 0,
	}))

	const formatCurrency = (value: number) => {
		return new Intl.NumberFormat('ru-RU', {
			style: 'currency',
			currency: 'RUB',
			minimumFractionDigits: 0,
			maximumFractionDigits: 0,
		}).format(value)
	}

	// Calculate totals and trends
	const totalRevenue = revenueChartData?.data.reduce((sum, val) => sum + val, 0) || 0
	const revenueLastMonth = revenueChartData?.data[revenueChartData.data.length - 1] || 0
	const revenuePrevMonth = revenueChartData?.data[revenueChartData.data.length - 2] || 0
	const revenueGrowth =
		revenuePrevMonth > 0 ? ((revenueLastMonth - revenuePrevMonth) / revenuePrevMonth) * 100 : 0

	const totalUsers = userGrowthChartData?.data[userGrowthChartData.data.length - 1] || 0
	const usersLastMonth = userGrowthChartData?.data[userGrowthChartData.data.length - 1] || 0
	const usersPrevMonth = userGrowthChartData?.data[userGrowthChartData.data.length - 2] || 0
	const userGrowth = usersLastMonth - usersPrevMonth

	if ((revenueLoading || userGrowthLoading) && !revenueData && !userGrowthData) {
		return <AdminAnalyticsSkeleton />
	}

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-3xl font-bold">Analytics Dashboard</h1>
				<p className="text-muted-foreground mt-1">
					Revenue and user growth analytics over time
				</p>
			</div>

			{/* Summary Cards */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
				<Card className="p-6">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
							<p className="text-2xl font-bold mt-2">{formatCurrency(totalRevenue)}</p>
							<p
								className={`text-xs mt-2 flex items-center gap-1 ${
									revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600'
								}`}
							>
								{revenueGrowth >= 0 ? (
									<TrendingUp className="h-3 w-3" />
								) : (
									<TrendingDown className="h-3 w-3" />
								)}
								{revenueGrowth >= 0 ? '+' : ''}
								{revenueGrowth.toFixed(1)}% from last month
							</p>
						</div>
						<div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-950 flex items-center justify-center">
							<DollarSign className="h-6 w-6 text-green-600 dark:text-green-400" />
						</div>
					</div>
				</Card>

				<Card className="p-6">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-sm font-medium text-muted-foreground">Total Users</p>
							<p className="text-2xl font-bold mt-2">{totalUsers}</p>
							<p className="text-xs mt-2 flex items-center gap-1 text-blue-600">
								<TrendingUp className="h-3 w-3" />+{userGrowth} this month
							</p>
						</div>
						<div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-950 flex items-center justify-center">
							<Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
						</div>
					</div>
				</Card>

				<Card className="p-6">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-sm font-medium text-muted-foreground">Last Month Revenue</p>
							<p className="text-2xl font-bold mt-2">{formatCurrency(revenueLastMonth)}</p>
							<p className="text-xs mt-2 text-muted-foreground">
								Average: {formatCurrency(totalRevenue / (revenueChartData?.data.length || 1))}
							</p>
						</div>
						<div className="h-12 w-12 rounded-full bg-purple-100 dark:bg-purple-950 flex items-center justify-center">
							<BarChart3 className="h-6 w-6 text-purple-600 dark:text-purple-400" />
						</div>
					</div>
				</Card>
			</div>

			{/* Revenue Chart */}
			<Card className="p-6">
				<h2 className="text-lg font-semibold mb-4">Revenue Over Time</h2>
				{revenueLoading ? (
					<div className="flex items-center justify-center py-12">
						<Loader2 className="h-8 w-8 animate-spin text-primary" />
					</div>
				) : revenueChartFormatted && revenueChartFormatted.length > 0 ? (
					<ResponsiveContainer width="100%" height={350}>
						<LineChart data={revenueChartFormatted}>
							<CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
							<XAxis dataKey="month" className="text-xs" />
							<YAxis className="text-xs" tickFormatter={(value) => formatCurrency(value)} />
							<Tooltip
								formatter={(value: any) => formatCurrency(Number(value) || 0)}
								contentStyle={{
									backgroundColor: 'hsl(var(--background))',
									border: '1px solid hsl(var(--border))',
									borderRadius: '8px',
								}}
							/>
							<Legend />
							<Line
								type="monotone"
								dataKey="revenue"
								stroke="hsl(var(--primary))"
								strokeWidth={2}
								name="Revenue (RUB)"
							/>
						</LineChart>
					</ResponsiveContainer>
				) : (
					<div className="text-center py-12 text-muted-foreground">No revenue data available</div>
				)}
			</Card>

			{/* User Growth Chart */}
			<Card className="p-6">
				<h2 className="text-lg font-semibold mb-4">User Growth Over Time</h2>
				{userGrowthLoading ? (
					<div className="flex items-center justify-center py-12">
						<Loader2 className="h-8 w-8 animate-spin text-primary" />
					</div>
				) : userGrowthChartFormatted && userGrowthChartFormatted.length > 0 ? (
					<ResponsiveContainer width="100%" height={350}>
						<BarChart data={userGrowthChartFormatted}>
							<CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
							<XAxis dataKey="month" className="text-xs" />
							<YAxis className="text-xs" />
							<Tooltip
								contentStyle={{
									backgroundColor: 'hsl(var(--background))',
									border: '1px solid hsl(var(--border))',
									borderRadius: '8px',
								}}
							/>
							<Legend />
							<Bar dataKey="users" fill="hsl(var(--primary))" name="Total Users" />
						</BarChart>
					</ResponsiveContainer>
				) : (
					<div className="text-center py-12 text-muted-foreground">No user growth data available</div>
				)}
			</Card>
		</div>
	)
}
