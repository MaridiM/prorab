'use client'

import { CalendarIcon, UserIcon } from 'lucide-react'
import { type TaskFieldsFragment, TaskPriority } from '@/packages/api/graphql/__generated__/output'
import { Badge } from '@/packages/components/ui/badge'
import { Card, CardContent, CardHeader } from '@/packages/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/packages/components/ui/avatar'
import {
	getPriorityVariant,
	getPriorityLabel,
	formatDueDate,
	getDueDateColor,
	isOverdue,
} from '@/packages/utils'
import { cn } from '@/packages/utils/tw-merge'

interface TaskCardProps {
	task: TaskFieldsFragment
	onClick?: () => void
	isDragging?: boolean
}

/**
 * TaskCard - Карточка задачи для Kanban доски
 * Отображает название, описание, приоритет, дедлайн, назначенного участника
 */
export function TaskCard({ task, onClick, isDragging = false }: TaskCardProps) {
	const priorityVariant = getPriorityVariant(task.priority as TaskPriority)
	const priorityLabel = getPriorityLabel(task.priority as TaskPriority)
	const dueDateColor = getDueDateColor(task.dueDate)
	const overdueFlag = task.dueDate ? isOverdue(task.dueDate) : false

	return (
		<Card
			className={cn(
				'cursor-pointer transition-all hover:shadow-md',
				isDragging && 'opacity-50 rotate-2 scale-105',
				onClick && 'active:scale-95'
			)}
			onClick={onClick}
		>
			<CardHeader className="pb-3">
				<div className="flex items-start justify-between gap-2">
					<h4 className="font-medium leading-tight line-clamp-2">{task.title}</h4>
					<Badge variant={priorityVariant} className="shrink-0 text-xs">
						{priorityLabel}
					</Badge>
				</div>
			</CardHeader>

			<CardContent className="space-y-3">
				{task.description && (
					<p className="text-sm text-muted-foreground line-clamp-2">
						{task.description}
					</p>
				)}

				<div className="flex items-center justify-between gap-2 text-xs">
					{/* Due Date */}
					{task.dueDate && (
						<div className={cn('flex items-center gap-1.5', dueDateColor)}>
							<CalendarIcon className="h-3.5 w-3.5" />
							<span className={cn(overdueFlag && 'font-semibold')}>
								{formatDueDate(task.dueDate)}
							</span>
						</div>
					)}

					{/* Assignee */}
					{task.assignee?.user ? (
						<div className="flex items-center gap-1.5">
							<Avatar className="h-6 w-6">
								<AvatarImage
									src={task.assignee.user.avatarUrl || undefined}
									alt={task.assignee.user.fullName}
								/>
								<AvatarFallback className="text-xs">
									{task.assignee.user.fullName
										.split(' ')
										.map((n) => n[0])
										.join('')
										.toUpperCase()
										.slice(0, 2)}
								</AvatarFallback>
							</Avatar>
							<span className="text-muted-foreground truncate max-w-[100px]">
								{task.assignee.user.fullName.split(' ')[0]}
							</span>
						</div>
					) : (
						!task.dueDate && (
							<div className="flex items-center gap-1.5 text-muted-foreground">
								<UserIcon className="h-3.5 w-3.5" />
								<span>Не назначено</span>
							</div>
						)
					)}
				</div>
			</CardContent>
		</Card>
	)
}
