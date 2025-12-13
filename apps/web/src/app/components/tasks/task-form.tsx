'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { CalendarIcon, Loader2Icon } from 'lucide-react'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale/ru'
import { type TaskFieldsFragment, TaskPriority, TaskStatus } from '@/packages/api/graphql/__generated__/output'
import { createTaskSchema, updateTaskSchema, type CreateTaskInput, type UpdateTaskInput } from '@/packages/schemas'
import { Button } from '@/packages/components/ui/button'
import { Input } from '@/packages/components/ui/input'
import { Textarea } from '@/packages/components/ui/textarea'
import { Label } from '@/packages/components/ui/label'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/packages/components/ui/select'
import { Calendar } from '@/packages/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/packages/components/ui/popover'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/packages/components/ui/dialog'
import { cn } from '@/packages/utils/tw-merge'
import { getPriorityLabel, getStatusLabel } from '@/packages/utils'

interface TaskFormProps {
	projectId: string
	task?: TaskFieldsFragment | null
	teamMembers?: Array<{ id: string; user: { id: string; fullName: string } | null }>
	open: boolean
	onOpenChange: (open: boolean) => void
	onSubmit: (data: CreateTaskInput | UpdateTaskInput) => Promise<void>
}

/**
 * TaskForm - Форма создания/редактирования задачи
 * Поддерживает все поля задачи с валидацией через Zod
 */
export function TaskForm({
	projectId,
	task,
	teamMembers = [],
	open,
	onOpenChange,
	onSubmit,
}: TaskFormProps) {
	const [isSubmitting, setIsSubmitting] = useState(false)
	const isEditing = !!task

	const schema = isEditing ? updateTaskSchema : createTaskSchema
	const {
		register,
		handleSubmit,
		formState: { errors },
		setValue,
		watch,
		reset,
	} = useForm<CreateTaskInput | UpdateTaskInput>({
		resolver: zodResolver(schema),
		defaultValues: isEditing
			? {
					title: task.title,
					description: task.description || '',
					status: task.status as TaskStatus,
					priority: task.priority as TaskPriority,
					assigneeId: task.assigneeId || '',
					dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
			  }
			: {
					projectId,
					title: '',
					description: '',
					priority: TaskPriority.Medium,
					assigneeId: '',
			  },
	})

	const selectedDate = watch('dueDate')
	const selectedPriority = watch('priority')
	const selectedStatus = watch('status')
	const selectedAssignee = watch('assigneeId')

	const handleFormSubmit = async (data: CreateTaskInput | UpdateTaskInput) => {
		setIsSubmitting(true)
		try {
			await onSubmit(data)
			reset()
			onOpenChange(false)
		} catch (error) {
			console.error('Failed to save task:', error)
		} finally {
			setIsSubmitting(false)
		}
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[525px]">
				<form onSubmit={handleSubmit(handleFormSubmit)}>
					<DialogHeader>
						<DialogTitle>{isEditing ? 'Редактировать задачу' : 'Новая задача'}</DialogTitle>
						<DialogDescription>
							{isEditing
								? 'Внесите изменения в задачу.'
								: 'Заполните информацию о новой задаче.'}
						</DialogDescription>
					</DialogHeader>

					<div className="grid gap-4 py-4">
						{/* Title */}
						<div className="grid gap-2">
							<Label htmlFor="title">
								Название <span className="text-destructive">*</span>
							</Label>
							<Input
								id="title"
								placeholder="Название задачи"
								{...register('title')}
								className={cn(errors.title && 'border-destructive')}
							/>
							{errors.title && (
								<p className="text-sm text-destructive">{errors.title.message}</p>
							)}
						</div>

						{/* Description */}
						<div className="grid gap-2">
							<Label htmlFor="description">Описание</Label>
							<Textarea
								id="description"
								placeholder="Подробное описание задачи"
								rows={3}
								{...register('description')}
							/>
						</div>

						{/* Priority & Status */}
						<div className="grid grid-cols-2 gap-4">
							<div className="grid gap-2">
								<Label htmlFor="priority">Приоритет</Label>
								<Select
									value={selectedPriority}
									onValueChange={(value) => setValue('priority', value as TaskPriority)}
								>
									<SelectTrigger>
										<SelectValue placeholder="Выберите приоритет" />
									</SelectTrigger>
									<SelectContent>
										{Object.values(TaskPriority).map((priority) => (
											<SelectItem key={priority} value={priority}>
												{getPriorityLabel(priority)}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>

							{isEditing && (
								<div className="grid gap-2">
									<Label htmlFor="status">Статус</Label>
									<Select
										value={selectedStatus}
										onValueChange={(value) => setValue('status', value as TaskStatus)}
									>
										<SelectTrigger>
											<SelectValue placeholder="Выберите статус" />
										</SelectTrigger>
										<SelectContent>
											{Object.values(TaskStatus).map((status) => (
												<SelectItem key={status} value={status}>
													{getStatusLabel(status)}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>
							)}
						</div>

						{/* Assignee & Due Date */}
						<div className="grid grid-cols-2 gap-4">
							<div className="grid gap-2">
								<Label htmlFor="assigneeId">Исполнитель</Label>
								<Select
									value={selectedAssignee || undefined}
									onValueChange={(value) => setValue('assigneeId', value)}
								>
									<SelectTrigger>
										<SelectValue placeholder="Не назначено" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="">Не назначено</SelectItem>
										{teamMembers.map((member) => (
											<SelectItem key={member.id} value={member.id}>
												{member.user?.fullName || 'Без имени'}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>

							<div className="grid gap-2">
								<Label htmlFor="dueDate">Срок выполнения</Label>
								<Popover>
									<PopoverTrigger asChild>
										<Button
											variant="outline"
											className={cn(
												'justify-start text-left font-normal',
												!selectedDate && 'text-muted-foreground'
											)}
										>
											<CalendarIcon className="mr-2 h-4 w-4" />
											{selectedDate
												? format(selectedDate, 'dd MMM yyyy', { locale: ru })
												: 'Выберите дату'}
										</Button>
									</PopoverTrigger>
									<PopoverContent className="w-auto p-0" align="start">
										<Calendar
											mode="single"
											selected={selectedDate}
											onSelect={(date) => setValue('dueDate', date)}
											initialFocus
											locale={ru}
										/>
									</PopoverContent>
								</Popover>
							</div>
						</div>
					</div>

					<DialogFooter>
						<Button
							type="button"
							variant="outline"
							onClick={() => onOpenChange(false)}
							disabled={isSubmitting}
						>
							Отмена
						</Button>
						<Button type="submit" disabled={isSubmitting}>
							{isSubmitting && <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />}
							{isEditing ? 'Сохранить' : 'Создать'}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	)
}
