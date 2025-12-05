"use client"

import * as React from "react"
import { Plus, Filter } from "lucide-react"

import { cn } from "@/packages/utils"
import { EXPENSE_CATEGORIES, type ExpenseCategory } from "@/packages/schemas"
import { Button } from "../ui/button"
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "../ui/select"
import { ExpenseCard, type ExpenseCardProps } from "./expense-card"

export interface ExpenseListProps {
	expenses: Omit<ExpenseCardProps, "onEdit" | "onDelete">[]
	isLoading?: boolean
	className?: string
	onAdd?: () => void
	onEdit?: (id: string) => void
	onDelete?: (id: string) => void
}

const ExpenseList: React.FC<ExpenseListProps> = ({
	expenses,
	isLoading = false,
	className,
	onAdd,
	onEdit,
	onDelete,
}) => {
	const [selectedCategory, setSelectedCategory] = React.useState<string>("all")

	const filteredExpenses = React.useMemo(() => {
		if (selectedCategory === "all") {
			return expenses
		}
		return expenses.filter((expense) => expense.category === selectedCategory)
	}, [expenses, selectedCategory])

	const totalAmount = React.useMemo(() => {
		return filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0)
	}, [filteredExpenses])

	const formatCurrency = (amount: number) => {
		return new Intl.NumberFormat("ru-RU", {
			style: "currency",
			currency: "RUB",
			maximumFractionDigits: 2,
		}).format(amount)
	}

	return (
		<div className={cn("space-y-4", className)}>
			{/* Заголовок и фильтры */}
			<div className="flex items-center justify-between gap-4">
				<div>
					<h2 className="text-2xl font-bold">Расходы</h2>
					<p className="text-sm text-muted-foreground">
						Всего: {formatCurrency(totalAmount)} ({filteredExpenses.length}{" "}
						{filteredExpenses.length === 1
							? "расход"
							: filteredExpenses.length >= 2 && filteredExpenses.length <= 4
								? "расхода"
								: "расходов"}
						)
					</p>
				</div>

				<div className="flex items-center gap-2">
					{/* Фильтр по категориям */}
					<Select value={selectedCategory} onValueChange={setSelectedCategory}>
						<SelectTrigger className="w-[200px]">
							<Filter className="h-4 w-4 mr-2" />
							<SelectValue placeholder="Все категории" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">Все категории</SelectItem>
							{EXPENSE_CATEGORIES.map((category) => (
								<SelectItem key={category} value={category}>
									{category}
								</SelectItem>
							))}
						</SelectContent>
					</Select>

					{/* Кнопка добавления */}
					{onAdd && (
						<Button onClick={onAdd}>
							<Plus className="h-4 w-4 mr-2" />
							Добавить расход
						</Button>
					)}
				</div>
			</div>

			{/* Список расходов */}
			{isLoading ? (
				<div className="text-center py-12 text-muted-foreground">
					Загрузка расходов...
				</div>
			) : filteredExpenses.length === 0 ? (
				<div className="text-center py-12">
					<p className="text-muted-foreground mb-4">
						{selectedCategory === "all"
							? "Расходов пока нет"
							: `Нет расходов в категории "${selectedCategory}"`}
					</p>
					{onAdd && selectedCategory === "all" && (
						<Button onClick={onAdd} variant="outline">
							<Plus className="h-4 w-4 mr-2" />
							Добавить первый расход
						</Button>
					)}
				</div>
			) : (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
					{filteredExpenses.map((expense) => (
						<ExpenseCard
							key={expense.id}
							{...expense}
							onEdit={onEdit ? () => onEdit(expense.id) : undefined}
							onDelete={onDelete ? () => onDelete(expense.id) : undefined}
						/>
					))}
				</div>
			)}
		</div>
	)
}

export { ExpenseList }
