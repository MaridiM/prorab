'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useQuery, useMutation } from '@apollo/client/react'
import {
	ProjectDocument,
	UpdateProjectDocument,
	ProjectsByTeamDocument,
} from '@/packages/api/graphql'
import { ProjectForm } from '@/packages/components/projects'
import { Card, CardContent, CardHeader, CardTitle, Skeleton } from '@/packages/components/ui'
import { useToast } from '@/packages/hooks'
import { ArrowLeft } from 'lucide-react'
import type { UpdateProjectInput } from '@/packages/schemas'

export default function EditProjectPage() {
	const params = useParams()
	const router = useRouter()
	const { showToast } = useToast()
	const teamId = params.teamId as string
	const projectId = params.projectId as string

	const [isSubmitting, setIsSubmitting] = useState(false)

	const { data, loading, error } = useQuery(ProjectDocument, {
		variables: { id: projectId },
	})

	const [updateProject] = useMutation(UpdateProjectDocument, {
		refetchQueries: [
			{ query: ProjectDocument, variables: { id: projectId } },
			{ query: ProjectsByTeamDocument, variables: { teamId } },
		],
	})

	const project = data?.project

	const handleSubmit = async (formData: UpdateProjectInput) => {
		setIsSubmitting(true)

		try {
			const result = await updateProject({
				variables: {
					id: projectId,
					input: {
						name: formData.name,
						address: formData.address || null,
						description: formData.description || null,
						budget: formData.budget ?? null,
						clientPhone: formData.clientPhone || null,
						startDate: formData.startDate ? formData.startDate.toISOString() : null,
						endDate: formData.endDate ? formData.endDate.toISOString() : null,
						notes: formData.notes || null,
					} as any,
				},
			})

			if (result.data?.updateProject) {
				showToast({
					type: 'success',
					message: 'Проект успешно обновлён!',
				})

				// Возврат на страницу проекта
				router.push(`/teams/${teamId}/projects/${projectId}`)
			}
		} catch (error: any) {
			console.error('Error updating project:', error)
			showToast({
				type: 'error',
				message: error.message || 'Не удалось обновить проект',
			})
		} finally {
			setIsSubmitting(false)
		}
	}

	const handleCancel = () => {
		router.push(`/teams/${teamId}/projects/${projectId}`)
	}

	// Loading state
	if (loading) {
		return (
			<div className="container mx-auto p-6 max-w-4xl">
				<Skeleton className="h-8 w-48 mb-6" />
				<Skeleton className="h-96 w-full" />
			</div>
		)
	}

	// Error state
	if (error || !project) {
		return (
			<div className="container mx-auto p-6 max-w-4xl">
				<div className="flex items-center justify-center min-h-[400px]">
					<div className="text-center">
						<h3 className="text-lg font-semibold text-destructive mb-2">
							{error ? 'Ошибка загрузки проекта' : 'Проект не найден'}
						</h3>
						<p className="text-muted-foreground">
							{error?.message || 'Не удалось загрузить данные проекта'}
						</p>
					</div>
				</div>
			</div>
		)
	}

	return (
		<div className="container mx-auto p-6 max-w-4xl">
			{/* Back Button */}
			<button
				onClick={() => router.push(`/teams/${teamId}/projects/${projectId}`)}
				className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
			>
				<ArrowLeft className="h-4 w-4" />
				Назад к проекту
			</button>

			{/* Form Card */}
			<Card>
				<CardHeader>
					<CardTitle className="text-2xl">Редактирование проекта</CardTitle>
					<p className="text-sm text-muted-foreground mt-1">
						Обновите информацию о проекте «{project.name}»
					</p>
				</CardHeader>
				<CardContent>
					<ProjectForm
						mode="edit"
						defaultValues={{
							name: project.name,
							address: project.address || '',
							description: project.description || '',
							budget: project.budget || undefined,
							clientPhone: project.clientPhone || '',
							startDate: project.startDate ? new Date(project.startDate) : undefined,
							endDate: project.endDate ? new Date(project.endDate) : undefined,
							notes: project.notes || '',
						}}
						onSubmit={handleSubmit}
						onCancel={handleCancel}
						isSubmitting={isSubmitting}
					/>
				</CardContent>
			</Card>
		</div>
	)
}
