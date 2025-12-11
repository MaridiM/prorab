'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { type TaskFieldsFragment } from '@/packages/api/graphql/__generated__/output'
import { TaskCard } from './task-card'

interface SortableTaskCardProps {
	task: TaskFieldsFragment
	onClick?: () => void
}

/**
 * SortableTaskCard - Обёртка для TaskCard с поддержкой drag & drop
 * Использует @dnd-kit/sortable для перетаскивания задач между колонками
 */
export function SortableTaskCard({ task, onClick }: SortableTaskCardProps) {
	const {
		attributes,
		listeners,
		setNodeRef,
		transform,
		transition,
		isDragging,
	} = useSortable({
		id: task.id,
		data: {
			type: 'task',
			task,
		},
	})

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
	}

	return (
		<div ref={setNodeRef} style={style} {...attributes} {...listeners}>
			<TaskCard task={task} onClick={onClick} isDragging={isDragging} />
		</div>
	)
}
