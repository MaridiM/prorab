'use client'

import { useState, useMemo } from 'react'
import {
	DndContext,
	DragOverlay,
	PointerSensor,
	useSensor,
	useSensors,
	type DragEndEvent,
	type DragStartEvent,
} from '@dnd-kit/core'
import { arrayMove } from '@dnd-kit/sortable'
import { type TaskFieldsFragment, TaskStatus } from '@/packages/api/graphql/__generated__/output'
import { KanbanColumn } from './kanban-column'
import { TaskCard } from './task-card'

interface KanbanBoardProps {
	tasks: {
		todo: TaskFieldsFragment[]
		inProgress: TaskFieldsFragment[]
		done: TaskFieldsFragment[]
	}
	onTaskMove: (taskId: string, newStatus: TaskStatus, newOrderIndex: number) => Promise<void>
	onTaskClick?: (task: TaskFieldsFragment) => void
	onAddTask?: (status: TaskStatus) => void
	isLoading?: boolean
}

/**
 * KanbanBoard - Главный компонент Kanban доски
 * Управляет drag & drop логикой и взаимодействием между колонками
 */
export function KanbanBoard({
	tasks: initialTasks,
	onTaskMove,
	onTaskClick,
	onAddTask,
	isLoading = false,
}: KanbanBoardProps) {
	const [tasks, setTasks] = useState(initialTasks)
	const [activeTask, setActiveTask] = useState<TaskFieldsFragment | null>(null)

	// Update local state when prop changes
	useMemo(() => {
		setTasks(initialTasks)
	}, [initialTasks])

	const sensors = useSensors(
		useSensor(PointerSensor, {
			activationConstraint: {
				distance: 8, // 8px movement required before drag starts
			},
		})
	)

	const handleDragStart = (event: DragStartEvent) => {
		const { active } = event
		const taskData = active.data.current

		if (taskData?.type === 'task') {
			setActiveTask(taskData.task)
		}
	}

	const handleDragEnd = async (event: DragEndEvent) => {
		const { active, over } = event
		setActiveTask(null)

		if (!over) return

		const activeTaskData = active.data.current
		const overData = over.data.current

		if (!activeTaskData?.task) return

		const activeTask = activeTaskData.task as TaskFieldsFragment
		const activeStatus = activeTask.status as TaskStatus
		const overId = over.id as string

		// Determine target status and position
		let targetStatus: TaskStatus
		let targetIndex: number

		if (overData?.type === 'column') {
			// Dropped on empty column
			targetStatus = overData.status
			targetIndex = tasks[getColumnKey(targetStatus)].length
		} else if (overData?.type === 'task') {
			// Dropped on another task
			const overTask = overData.task as TaskFieldsFragment
			targetStatus = overTask.status as TaskStatus
			const columnTasks = tasks[getColumnKey(targetStatus)]
			targetIndex = columnTasks.findIndex((t) => t.id === overTask.id)
		} else {
			return
		}

		const columnKey = getColumnKey(targetStatus)
		const sourceColumnKey = getColumnKey(activeStatus)

		// Optimistic update
		setTasks((prev) => {
			const newTasks = { ...prev }

			if (activeStatus === targetStatus) {
				// Same column reorder
				const columnTasks = [...newTasks[columnKey]]
				const oldIndex = columnTasks.findIndex((t) => t.id === activeTask.id)
				if (oldIndex !== -1) {
					const reordered = arrayMove(columnTasks, oldIndex, targetIndex)
					newTasks[columnKey] = reordered
				}
			} else {
				// Cross-column move
				const sourceColumn = newTasks[sourceColumnKey].filter(
					(t) => t.id !== activeTask.id
				)
				const targetColumn = [...newTasks[columnKey]]
				targetColumn.splice(targetIndex, 0, {
					...activeTask,
					status: targetStatus,
				})
				newTasks[sourceColumnKey] = sourceColumn
				newTasks[columnKey] = targetColumn
			}

			return newTasks
		})

		// Call mutation
		try {
			await onTaskMove(activeTask.id, targetStatus, targetIndex)
		} catch (error) {
			console.error('Failed to move task:', error)
			// Revert optimistic update on error
			setTasks(initialTasks)
		}
	}

	const handleDragCancel = () => {
		setActiveTask(null)
	}

	return (
		<DndContext
			sensors={sensors}
			onDragStart={handleDragStart}
			onDragEnd={handleDragEnd}
			onDragCancel={handleDragCancel}
		>
			<div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[calc(100vh-300px)] min-h-[600px]">
				<KanbanColumn
					status={TaskStatus.Todo}
					tasks={tasks.todo}
					onTaskClick={onTaskClick}
					onAddTask={() => onAddTask?.(TaskStatus.Todo)}
				/>
				<KanbanColumn
					status={TaskStatus.InProgress}
					tasks={tasks.inProgress}
					onTaskClick={onTaskClick}
					onAddTask={() => onAddTask?.(TaskStatus.InProgress)}
				/>
				<KanbanColumn
					status={TaskStatus.Done}
					tasks={tasks.done}
					onTaskClick={onTaskClick}
					onAddTask={() => onAddTask?.(TaskStatus.Done)}
				/>
			</div>

			<DragOverlay>
				{activeTask && <TaskCard task={activeTask} isDragging />}
			</DragOverlay>
		</DndContext>
	)
}

/**
 * Helper function to get column key from status
 */
function getColumnKey(status: TaskStatus): 'todo' | 'inProgress' | 'done' {
	switch (status) {
		case TaskStatus.Todo:
			return 'todo'
		case TaskStatus.InProgress:
			return 'inProgress'
		case TaskStatus.Done:
			return 'done'
		default:
			return 'todo'
	}
}
