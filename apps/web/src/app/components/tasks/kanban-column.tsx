'use client'

import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { PlusIcon } from 'lucide-react'
import { type TaskFieldsFragment, TaskStatus } from '@/packages/api/graphql/__generated__/output'
import { Button } from '@/packages/components/ui/button'
import { Card, CardContent, CardHeader } from '@/packages/components/ui/card'
import { getColumnTitle } from '@/packages/utils'
import { cn } from '@/packages/utils/tw-merge'
import { SortableTaskCard } from './sortable-task-card'

interface KanbanColumnProps {
	status: TaskStatus
	tasks: TaskFieldsFragment[]
	onTaskClick?: (task: TaskFieldsFragment) => void
	onAddTask?: () => void
}

/**
 * KanbanColumn - Колонка для Kanban доски
 * Содержит список задач с определённым статусом и поддерживает drag & drop
 */
export function KanbanColumn({
	status,
	tasks,
	onTaskClick,
	onAddTask,
}: KanbanColumnProps) {
	const { setNodeRef, isOver } = useDroppable({
		id: status,
		data: {
			type: 'column',
			status,
		},
	})

	const columnTitle = getColumnTitle(status)
	const taskIds = tasks.map((task) => task.id)

	// Цвета для разных статусов
	const columnColors = {
		TODO: 'border-l-slate-500',
		IN_PROGRESS: 'border-l-blue-500',
		DONE: 'border-l-green-500',
	}

	return (
		<Card
			className={cn(
				'flex flex-col h-full border-l-4 transition-colors',
				columnColors[status],
				isOver && 'bg-accent/50'
			)}
		>
			<CardHeader className="pb-3">
				<div className="flex items-center justify-between">
					<h3 className="font-semibold text-lg">
						{columnTitle}
						<span className="ml-2 text-sm font-normal text-muted-foreground">
							({tasks.length})
						</span>
					</h3>
					{onAddTask && (
						<Button
							size="sm"
							variant="ghost"
							onClick={onAddTask}
							className="h-8 w-8 p-0"
						>
							<PlusIcon className="h-4 w-4" />
							<span className="sr-only">Добавить задачу</span>
						</Button>
					)}
				</div>
			</CardHeader>

			<CardContent
				ref={setNodeRef}
				className="flex-1 space-y-2 overflow-y-auto min-h-[200px]"
			>
				<SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
					{tasks.length === 0 ? (
						<div className="flex items-center justify-center h-32 text-sm text-muted-foreground">
							Нет задач
						</div>
					) : (
						tasks.map((task) => (
							<SortableTaskCard
								key={task.id}
								task={task}
								onClick={() => onTaskClick?.(task)}
							/>
						))
					)}
				</SortableContext>
			</CardContent>
		</Card>
	)
}
