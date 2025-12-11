'use client'

import { use, useState } from 'react'
import { useMutation, useQuery } from '@apollo/client'
import { Loader2Icon } from 'lucide-react'
import {
	ProjectTasksDocument,
	CreateTaskDocument,
	UpdateTaskDocument,
	MoveTaskDocument,
	DeleteTaskDocument,
	TeamMembersDocument,
	type TaskFieldsFragment,
	type TaskStatus,
	type CreateTaskInput,
	type UpdateTaskInput,
} from '@/packages/api/graphql/__generated__/output'
import { KanbanBoard, TaskForm } from '@/app/components/tasks'
import { Button } from '@/packages/components/ui/button'
import { toast } from 'sonner'

interface TasksPageProps {
	params: Promise<{
		teamId: string
		projectId: string
	}>
}

/**
 * TasksPage - Страница управления задачами проекта
 * Отображает Kanban доску с задачами и формы для создания/редактирования
 */
export default function TasksPage({ params }: TasksPageProps) {
	const resolvedParams = use(params)
	const { projectId, teamId } = resolvedParams

	const [selectedTask, setSelectedTask] = useState<TaskFieldsFragment | null>(null)
	const [isFormOpen, setIsFormOpen] = useState(false)
	const [initialStatus, setInitialStatus] = useState<TaskStatus | null>(null)

	// Queries
	const {
		data: tasksData,
		loading: tasksLoading,
		refetch: refetchTasks,
	} = useQuery(ProjectTasksDocument, {
		variables: { projectId },
		fetchPolicy: 'cache-and-network',
	})

	const { data: teamMembersData } = useQuery(TeamMembersDocument, {
		variables: { teamId },
	})

	// Mutations
	const [createTask] = useMutation(CreateTaskDocument, {
		onCompleted: () => {
			toast.success('Задача создана', {
				description: 'Задача успешно добавлена в проект',
			})
			refetchTasks()
		},
		onError: (error: any) => {
			toast.error('Ошибка', {
				description: error.message,
			})
		},
	})

	const [updateTask] = useMutation(UpdateTaskDocument, {
		onCompleted: () => {
			toast.success('Задача обновлена', {
				description: 'Изменения успешно сохранены',
			})
			refetchTasks()
		},
		onError: (error: any) => {
			toast.error('Ошибка', {
				description: error.message,
			})
		},
	})

	const [moveTask] = useMutation(MoveTaskDocument, {
		onCompleted: () => {
			// Silent success for drag & drop
			refetchTasks()
		},
		onError: (error: any) => {
			toast.error('Ошибка перемещения', {
				description: error.message,
			})
			refetchTasks() // Revert on error
		},
	})

	const [deleteTask] = useMutation(DeleteTaskDocument, {
		onCompleted: () => {
			toast.success('Задача удалена', {
				description: 'Задача успешно удалена из проекта',
			})
			refetchTasks()
		},
		onError: (error: any) => {
			toast.error('Ошибка', {
				description: error.message,
			})
		},
	})

	// Handlers
	const handleTaskMove = async (
		taskId: string,
		newStatus: TaskStatus,
		newOrderIndex: number
	) => {
		await moveTask({
			variables: {
				input: {
					taskId,
					newStatus,
					newOrderIndex,
				},
			},
		})
	}

	const handleTaskClick = (task: TaskFieldsFragment) => {
		setSelectedTask(task)
		setInitialStatus(null)
		setIsFormOpen(true)
	}

	const handleAddTask = (status: TaskStatus) => {
		setSelectedTask(null)
		setInitialStatus(status)
		setIsFormOpen(true)
	}

	const handleFormSubmit = async (data: CreateTaskInput | UpdateTaskInput) => {
		if (selectedTask) {
			// Update existing task
			await updateTask({
				variables: {
					id: selectedTask.id,
					input: data as UpdateTaskInput,
				},
			})
		} else {
			// Create new task
			const createData: CreateTaskInput = {
				...data,
				projectId,
			} as CreateTaskInput

			// If status is provided from column "+" button, use it
			if (initialStatus && !('status' in data)) {
				// Status is only in UpdateTaskInput, so set it via backend logic
				// Backend will use TODO as default for new tasks
			}

			await createTask({
				variables: {
					input: createData,
				},
			})
		}
	}

	if (tasksLoading && !tasksData) {
		return (
			<div className="flex items-center justify-center h-[600px]">
				<Loader2Icon className="h-8 w-8 animate-spin text-muted-foreground" />
			</div>
		)
	}

	const tasks = tasksData?.projectTasks || {
		todo: [],
		inProgress: [],
		done: [],
	}

	const teamMembers = teamMembersData?.teamMembers || []

	return (
		<div className="space-y-6 p-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">Задачи</h1>
					<p className="text-muted-foreground">
						Управляйте задачами проекта с помощью Kanban доски
					</p>
				</div>
				<Button onClick={() => handleAddTask('TODO' as TaskStatus)}>
					Создать задачу
				</Button>
			</div>

			<KanbanBoard
				tasks={tasks}
				onTaskMove={handleTaskMove}
				onTaskClick={handleTaskClick}
				onAddTask={handleAddTask}
				isLoading={tasksLoading}
			/>

			<TaskForm
				projectId={projectId}
				task={selectedTask}
				teamMembers={teamMembers}
				open={isFormOpen}
				onOpenChange={setIsFormOpen}
				onSubmit={handleFormSubmit}
			/>
		</div>
	)
}
