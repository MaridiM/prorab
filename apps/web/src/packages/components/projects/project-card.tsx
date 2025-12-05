"use client"

import * as React from "react"
import { format } from "date-fns"
import { ru } from "date-fns/locale"
import Link from "next/link"

import { cn } from "@/packages/utils"
import { Card, CardContent, CardFooter } from "../ui/card"
import { Badge } from "../ui/badge"
import { ProgressBar } from "../ui/progress-bar"
import { ProjectStatus, type ProjectStatusType } from "@/packages/schemas"

export interface ProjectCardProps {
	id: string
	teamId: string
	name: string
	address?: string | null
	budget?: number | null
	progress: number
	status: ProjectStatusType
	startDate?: Date | string | null
	endDate?: Date | string | null
	photoUrl?: string | null
	createdAt: Date | string
	className?: string
	onClick?: () => void
}

const statusConfig: Record<
	ProjectStatusType,
	{ label: string; variant: "success" | "warning" | "secondary" }
> = {
	[ProjectStatus.ACTIVE]: { label: "Активный", variant: "success" },
	[ProjectStatus.ARCHIVED]: { label: "Архив", variant: "secondary" },
	[ProjectStatus.COMPLETED]: { label: "Завершён", variant: "success" },
}

const ProjectCard = React.forwardRef<HTMLDivElement, ProjectCardProps>(
	(
		{
			id,
			teamId,
			name,
			address,
			budget,
			progress,
			status,
			startDate,
			endDate,
			photoUrl,
			createdAt,
			className,
			onClick,
		},
		ref
	) => {
		const statusInfo = statusConfig[status]

		const formatDate = (date: Date | string | null | undefined) => {
			if (!date) return null
			const dateObj = typeof date === "string" ? new Date(date) : date
			return format(dateObj, "dd MMM yyyy", { locale: ru })
		}

		const formatCurrency = (amount: number | null | undefined) => {
			if (!amount) return null
			return new Intl.NumberFormat("ru-RU", {
				style: "currency",
				currency: "RUB",
				maximumFractionDigits: 0,
			}).format(amount)
		}

		const cardContent = (
			<Card
				ref={ref}
				className={cn(
					"transition-all hover:shadow-md cursor-pointer",
					className
				)}
				onClick={onClick}
			>
				{photoUrl && (
					<div className="relative w-full h-32 overflow-hidden rounded-t-lg">
						<img
							src={photoUrl}
							alt={name}
							className="w-full h-full object-cover"
						/>
					</div>
				)}
				<CardContent className={cn("p-4", photoUrl && "pt-4")}>
					<div className="flex items-start justify-between mb-2">
						<h3 className="text-lg font-semibold line-clamp-1">{name}</h3>
						<Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
					</div>

					{address && (
						<div className="flex items-start gap-2 text-sm text-muted-foreground mb-3">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="16"
								height="16"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="2"
								strokeLinecap="round"
								strokeLinejoin="round"
								className="shrink-0 mt-0.5"
							>
								<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
								<circle cx="12" cy="10" r="3" />
							</svg>
							<span className="line-clamp-1">{address}</span>
						</div>
					)}

					<div className="space-y-2 mb-3">
						{budget && (
							<div className="flex items-center justify-between text-sm">
								<span className="text-muted-foreground">Бюджет:</span>
								<span className="font-medium">{formatCurrency(budget)}</span>
							</div>
						)}

						{(startDate || endDate) && (
							<div className="flex items-center justify-between text-sm">
								<span className="text-muted-foreground">Срок:</span>
								<span className="font-medium">
									{formatDate(startDate) || "—"} —{" "}
									{formatDate(endDate) || "—"}
								</span>
							</div>
						)}
					</div>

					<div className="space-y-1">
						<ProgressBar value={progress} showLabel size="sm" />
					</div>
				</CardContent>

				<CardFooter className="p-4 pt-0 text-xs text-muted-foreground">
					Создан {formatDate(createdAt)}
				</CardFooter>
			</Card>
		)

		// Если есть onClick, возвращаем Card напрямую
		if (onClick) {
			return cardContent
		}

		// Иначе оборачиваем в Link
		return (
			<Link href={`/teams/${teamId}/projects/${id}`} className="block">
				{cardContent}
			</Link>
		)
	}
)
ProjectCard.displayName = "ProjectCard"

export { ProjectCard }
