"use client"

import * as React from "react"
import { TrendingUp, TrendingDown, DollarSign, Receipt, AlertCircle } from "lucide-react"

import { cn } from "@/packages/utils"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"

export interface ProjectStats {
	totalExpenses: number
	profit: number
	expenseCount: number
	budget?: number | null
}

export interface CategoryBreakdown {
	category: string
	amount: number
	count: number
}

export interface FinancialDashboardProps {
	stats: ProjectStats
	expenses: Array<{ category: string; amount: number }>
	className?: string
}

const FinancialDashboard: React.FC<FinancialDashboardProps> = ({
	stats,
	expenses,
	className,
}) => {
	const formatCurrency = (amount: number) => {
		return new Intl.NumberFormat("ru-RU", {
			style: "currency",
			currency: "RUB",
			maximumFractionDigits: 0,
		}).format(amount)
	}

	// Группировка расходов по категориям
	const categoryBreakdown = React.useMemo(() => {
		const breakdown: Record<string, CategoryBreakdown> = {}

		expenses.forEach((expense) => {
			if (!breakdown[expense.category]) {
				breakdown[expense.category] = {
					category: expense.category,
					amount: 0,
					count: 0,
				}
			}
			breakdown[expense.category].amount += expense.amount
			breakdown[expense.category].count += 1
		})

		return Object.values(breakdown).sort((a, b) => b.amount - a.amount)
	}, [expenses])

	const profitMargin = stats.budget
		? ((stats.profit / stats.budget) * 100).toFixed(1)
		: 0

	const isProfitable = stats.profit >= 0

	return (
		<div className={cn("space-y-6", className)}>
			{/* Основные метрики */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
				{/* Бюджет */}
				{stats.budget !== null && stats.budget !== undefined && (
					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">Бюджет проекта</CardTitle>
							<DollarSign className="h-4 w-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">
								{formatCurrency(stats.budget)}
							</div>
						</CardContent>
					</Card>
				)}

				{/* Расходы */}
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Всего расходов</CardTitle>
						<Receipt className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold text-red-600">
							{formatCurrency(stats.totalExpenses)}
						</div>
						<p className="text-xs text-muted-foreground">
							{stats.expenseCount}{" "}
							{stats.expenseCount === 1
								? "расход"
								: stats.expenseCount >= 2 && stats.expenseCount <= 4
									? "расхода"
									: "расходов"}
						</p>
					</CardContent>
				</Card>

				{/* Прибыль */}
				{stats.budget !== null && stats.budget !== undefined && (
					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">
								{isProfitable ? "Прибыль" : "Убыток"}
							</CardTitle>
							{isProfitable ? (
								<TrendingUp className="h-4 w-4 text-green-600" />
							) : (
								<TrendingDown className="h-4 w-4 text-red-600" />
							)}
						</CardHeader>
						<CardContent>
							<div
								className={cn(
									"text-2xl font-bold",
									isProfitable ? "text-green-600" : "text-red-600"
								)}
							>
								{formatCurrency(Math.abs(stats.profit))}
							</div>
							<p className="text-xs text-muted-foreground">
								{profitMargin}% от бюджета
							</p>
						</CardContent>
					</Card>
				)}
			</div>

			{/* Предупреждение о превышении бюджета */}
			{!isProfitable && stats.budget && (
				<Card className="border-red-200 bg-red-50">
					<CardContent className="pt-6">
						<div className="flex items-center gap-3">
							<AlertCircle className="h-5 w-5 text-red-600" />
							<div>
								<p className="font-semibold text-red-900">
									Бюджет превышен на {formatCurrency(Math.abs(stats.profit))}
								</p>
								<p className="text-sm text-red-700">
									Расходы превышают бюджет проекта на {Math.abs(Number(profitMargin))}%
								</p>
							</div>
						</div>
					</CardContent>
				</Card>
			)}

			{/* Разбивка по категориям */}
			{categoryBreakdown.length > 0 && (
				<Card>
					<CardHeader>
						<CardTitle>Расходы по категориям</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="space-y-4">
							{categoryBreakdown.map((item) => {
								const percentage = stats.totalExpenses
									? ((item.amount / stats.totalExpenses) * 100).toFixed(1)
									: 0

								return (
									<div key={item.category} className="space-y-2">
										<div className="flex items-center justify-between text-sm">
											<span className="font-medium">{item.category}</span>
											<span className="text-muted-foreground">
												{formatCurrency(item.amount)} ({percentage}%)
											</span>
										</div>
										<div className="h-2 w-full bg-muted rounded-full overflow-hidden">
											<div
												className="h-full bg-primary rounded-full transition-all"
												style={{ width: `${percentage}%` }}
											/>
										</div>
										<p className="text-xs text-muted-foreground">
											{item.count}{" "}
											{item.count === 1
												? "расход"
												: item.count >= 2 && item.count <= 4
													? "расхода"
													: "расходов"}
										</p>
									</div>
								)
							})}
						</div>
					</CardContent>
				</Card>
			)}
		</div>
	)
}

export { FinancialDashboard }
