"use client"

import * as React from "react"
import { format } from "date-fns"
import { ru } from "date-fns/locale"
import { Trash2, Edit, DollarSign } from "lucide-react"

import { cn } from "@/packages/utils"
import { Card, CardContent, CardFooter } from "../ui/card"
import { Badge } from "../ui/badge"
import { Button } from "../ui/button"

export interface ExpenseCardProps {
	id: string
	amount: number
	category: string
	photos?: string[]
	comment?: string | null
	paidByClient: boolean
	createdAt: Date | string
	className?: string
	onEdit?: () => void
	onDelete?: () => void
}

const ExpenseCard = React.forwardRef<HTMLDivElement, ExpenseCardProps>(
	(
		{
			id,
			amount,
			category,
			photos = [],
			comment,
			paidByClient,
			createdAt,
			className,
			onEdit,
			onDelete,
		},
		ref
	) => {
		const formatDate = (date: Date | string) => {
			const dateObj = typeof date === "string" ? new Date(date) : date
			return format(dateObj, "dd MMM yyyy, HH:mm", { locale: ru })
		}

		const formatCurrency = (amount: number) => {
			return new Intl.NumberFormat("ru-RU", {
				style: "currency",
				currency: "RUB",
				maximumFractionDigits: 2,
			}).format(amount)
		}

		return (
			<Card
				ref={ref}
				className={cn(
					"transition-all hover:shadow-md",
					className
				)}
			>
				<CardContent className="pt-6">
					{/* Заголовок с суммой */}
					<div className="flex items-start justify-between mb-3">
						<div className="flex items-center gap-2">
							<DollarSign className="h-5 w-5 text-green-600" />
							<span className="text-2xl font-bold">
								{formatCurrency(amount)}
							</span>
						</div>
						{paidByClient && (
							<Badge variant="success">Оплачено клиентом</Badge>
						)}
					</div>

					{/* Категория */}
					<div className="mb-2">
						<Badge variant="secondary">{category}</Badge>
					</div>

					{/* Комментарий */}
					{comment && (
						<p className="text-sm text-muted-foreground mb-3 line-clamp-2">
							{comment}
						</p>
					)}

					{/* Фотографии */}
					{photos.length > 0 && (
						<div className="flex gap-2 mb-3">
							{photos.slice(0, 3).map((photo, index) => (
								<div
									key={index}
									className="w-16 h-16 rounded-md bg-muted overflow-hidden"
								>
									<img
										src={photo}
										alt={`Фото ${index + 1}`}
										className="w-full h-full object-cover"
									/>
								</div>
							))}
							{photos.length > 3 && (
								<div className="w-16 h-16 rounded-md bg-muted flex items-center justify-center text-sm text-muted-foreground">
									+{photos.length - 3}
								</div>
							)}
						</div>
					)}

					{/* Дата создания */}
					<p className="text-xs text-muted-foreground">
						{formatDate(createdAt)}
					</p>
				</CardContent>

				{/* Действия */}
				{(onEdit || onDelete) && (
					<CardFooter className="flex gap-2 border-t pt-4">
						{onEdit && (
							<Button
								variant="outline"
								size="sm"
								onClick={onEdit}
								className="flex-1"
							>
								<Edit className="h-4 w-4 mr-2" />
								Редактировать
							</Button>
						)}
						{onDelete && (
							<Button
								variant="outline"
								size="sm"
								onClick={onDelete}
								className="text-red-600 hover:text-red-700 hover:bg-red-50"
							>
								<Trash2 className="h-4 w-4" />
							</Button>
						)}
					</CardFooter>
				)}
			</Card>
		)
	}
)

ExpenseCard.displayName = "ExpenseCard"

export { ExpenseCard }
