import { type TaskPriority, type TaskStatus } from '../api/graphql/__generated__/output'

/**
 * Task utility functions
 */

/**
 * Get badge variant for task priority
 */
export function getPriorityVariant(
	priority: TaskPriority
): 'default' | 'secondary' | 'success' | 'warning' | 'danger' {
	switch (priority) {
		case 'URGENT':
			return 'danger'
		case 'HIGH':
			return 'warning'
		case 'MEDIUM':
			return 'default'
		case 'LOW':
			return 'secondary'
		default:
			return 'secondary'
	}
}

/**
 * Get human-readable priority label
 */
export function getPriorityLabel(priority: TaskPriority): string {
	switch (priority) {
		case 'URGENT':
			return 'Срочно'
		case 'HIGH':
			return 'Высокий'
		case 'MEDIUM':
			return 'Средний'
		case 'LOW':
			return 'Низкий'
		default:
			return priority
	}
}

/**
 * Get human-readable status label
 */
export function getStatusLabel(status: TaskStatus): string {
	switch (status) {
		case 'TODO':
			return 'К выполнению'
		case 'IN_PROGRESS':
			return 'В работе'
		case 'DONE':
			return 'Завершено'
		default:
			return status
	}
}

/**
 * Get column title for Kanban board
 */
export function getColumnTitle(status: TaskStatus): string {
	return getStatusLabel(status)
}

/**
 * Format due date for display (relative or absolute)
 */
export function formatDueDate(dueDate: string | Date): string {
	const date = typeof dueDate === 'string' ? new Date(dueDate) : dueDate
	const now = new Date()
	const diffMs = date.getTime() - now.getTime()
	const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))

	if (diffDays < 0) {
		return `Просрочено на ${Math.abs(diffDays)} дн.`
	} else if (diffDays === 0) {
		return 'Сегодня'
	} else if (diffDays === 1) {
		return 'Завтра'
	} else if (diffDays <= 7) {
		return `Через ${diffDays} дн.`
	} else {
		return date.toLocaleDateString('ru-RU', {
			day: 'numeric',
			month: 'short',
		})
	}
}

/**
 * Check if task is overdue
 */
export function isOverdue(dueDate: string | Date | null): boolean {
	if (!dueDate) return false
	const date = typeof dueDate === 'string' ? new Date(dueDate) : dueDate
	return date.getTime() < Date.now()
}

/**
 * Get CSS class for overdue tasks
 */
export function getDueDateColor(dueDate: string | Date | null): string {
	if (!dueDate) return ''
	return isOverdue(dueDate) ? 'text-destructive' : 'text-muted-foreground'
}
