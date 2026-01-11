"use client"

import * as React from "react"
import { format } from "date-fns"
import { ru } from "date-fns/locale/ru"
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

import { useState } from "react"
import {
	MoreVertical,
	Edit3,
	Archive,
	Trash2,
	RotateCcw,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useMutation } from "@apollo/client/react"

import {
	ArchiveProjectDocument,
	DeleteProjectDocument,
	ProjectDocument,
	ProjectsByTeamDocument,
	RestoreProjectDocument,
} from "@/packages/api/graphql"
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	Button,
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "../ui"
import { useToast } from "@/packages/hooks"

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
		const router = useRouter()
		const { showToast } = useToast()
		const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

		// Mutations
		const [archiveProject] = useMutation(ArchiveProjectDocument, {
			refetchQueries: [
				{ query: ProjectsByTeamDocument, variables: { teamId } },
				{ query: ProjectDocument, variables: { id } },
			],
			onCompleted: () => {
				showToast({ type: "success", message: "Проект архивирован" })
			},
			onError: (error) => {
				showToast({ type: "error", message: error.message })
			},
		})

		const [restoreProject] = useMutation(RestoreProjectDocument, {
			refetchQueries: [
				{ query: ProjectsByTeamDocument, variables: { teamId } },
				{ query: ProjectDocument, variables: { id } },
			],
			onCompleted: () => {
				showToast({ type: "success", message: "Проект восстановлен" })
			},
			onError: (error) => {
				showToast({ type: "error", message: error.message })
			},
		})

		const [deleteProject] = useMutation(DeleteProjectDocument, {
			refetchQueries: [
				{ query: ProjectsByTeamDocument, variables: { teamId } },
			],
			onCompleted: () => {
				showToast({ type: "success", message: "Проект удалён" })
				setIsDeleteDialogOpen(false)
			},
			onError: (error) => {
				showToast({ type: "error", message: error.message })
			},
		})

		// Handlers
		const handleEdit = (e: React.MouseEvent) => {
			e.preventDefault()
			e.stopPropagation()
			router.push(`/teams/${teamId}/projects/${id}/edit`)
		}

		const handleArchive = (e: React.MouseEvent) => {
			e.preventDefault()
			e.stopPropagation()
			archiveProject({ variables: { id } })
		}

		const handleRestore = (e: React.MouseEvent) => {
			e.preventDefault()
			e.stopPropagation()
			restoreProject({ variables: { id } })
		}

		const handleDeleteClick = (e: React.MouseEvent) => {
			e.preventDefault()
			e.stopPropagation()
			setIsDeleteDialogOpen(true)
		}

		const handleDeleteConfirm = () => {
			deleteProject({ variables: { id } })
		}

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

		return (
			<>
				<Card
					ref={ref}
					className={cn(
						"group relative transition-all hover:shadow-md cursor-pointer",
						className
					)}
					onClick={onClick || (() => router.push(`/teams/${teamId}/projects/${id}`))}
				>
					{/* Actions Menu */}
					<div className="absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button
									variant="secondary"
									size="icon"
									className="h-8 w-8 bg-background/80 backdrop-blur-sm border shadow-sm"
									onClick={(e) => {
										e.preventDefault()
										e.stopPropagation()
									}}
								>
									<MoreVertical className="h-4 w-4" />
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end" className="w-48">
								<DropdownMenuItem onClick={handleEdit}>
									<Edit3 className="mr-2 h-4 w-4" />
									Редактировать
								</DropdownMenuItem>

								{status === ProjectStatus.ARCHIVED ? (
									<DropdownMenuItem onClick={handleRestore}>
										<RotateCcw className="mr-2 h-4 w-4" />
										Восстановить
									</DropdownMenuItem>
								) : (
									<DropdownMenuItem onClick={handleArchive}>
										<Archive className="mr-2 h-4 w-4" />
										В архив
									</DropdownMenuItem>
								)}

								<DropdownMenuItem
									onClick={handleDeleteClick}
									className="text-destructive focus:text-destructive"
								>
									<Trash2 className="mr-2 h-4 w-4" />
									Удалить
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</div>

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
						<div className="flex items-start justify-between mb-2 pr-8">
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

				<AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
					<AlertDialogContent>
						<AlertDialogHeader>
							<AlertDialogTitle>Удалить проект?</AlertDialogTitle>
							<AlertDialogDescription>
								Это действие нельзя отменить. Проект «{name}» и все связанные с ним данные (сметы, задачи, отчеты) будут безвозвратно удалены.
							</AlertDialogDescription>
						</AlertDialogHeader>
						<AlertDialogFooter>
							<AlertDialogCancel onClick={(e) => {
								e.stopPropagation()
							}}>Отмена</AlertDialogCancel>
							<AlertDialogAction
								onClick={(e) => {
									e.stopPropagation()
									handleDeleteConfirm()
								}}
								className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
							>
								Удалить
							</AlertDialogAction>
						</AlertDialogFooter>
					</AlertDialogContent>
				</AlertDialog>
			</>
		)
	}
)

ProjectCard.displayName = "ProjectCard"

export { ProjectCard }
