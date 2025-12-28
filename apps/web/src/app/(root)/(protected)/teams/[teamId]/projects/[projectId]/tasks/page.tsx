'use client'

import { use, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useMutation, useQuery } from '@apollo/client/react'
import { Loader2Icon, CheckSquare } from 'lucide-react'
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
import { Button, PageHeader } from '@/packages/components/ui'
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
	const router = useRouter()

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

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const handleFormSubmit = async (data: any) => {
		// Prepare data for API: convert Date to ISO string, remove empty strings
		const prepareInput = (input: Record<string, unknown>) => {
			const prepared = { ...input }
			
			// Convert Date to ISO string for GraphQL
			if (prepared.dueDate instanceof Date) {
				prepared.dueDate = prepared.dueDate.toISOString()
			} else if (prepared.dueDate === undefined || prepared.dueDate === null) {
				delete prepared.dueDate
			}
			
			// Remove empty assigneeId (GraphQL expects string or null, not empty string)
			if (prepared.assigneeId === '' || prepared.assigneeId === undefined) {
				delete prepared.assigneeId
			}
			
			return prepared
		}

		if (selectedTask) {
			// Update existing task
			await updateTask({
				variables: {
					id: selectedTask.id,
					input: prepareInput(data) as UpdateTaskInput,
				},
			})
		} else {
			// Create new task
			const createData = prepareInput({
				...data,
				projectId,
			}) as CreateTaskInput

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
		<div className="min-h-screen bg-background">
			<PageHeader
				title="Задачи"
				subtitle="Управляйте задачами проекта с помощью Kanban доски"
				icon={<CheckSquare className="w-5 h-5 text-primary" />}
				backHref={`/teams/${teamId}/projects/${projectId}`}
			/>
			
			<div className="w-full max-w-[1920px] mx-auto px-4 py-6">
				<div className="flex items-center justify-end mb-6">
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
		</div>
	)
}
