'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useMutation } from '@apollo/client/react'
import { CreateProjectDocument, ProjectsByTeamDocument } from '@/packages/api/graphql'
import { ProjectForm } from '@/packages/components/projects'
import { Card, CardContent, CardHeader, CardTitle } from '@/packages/components/ui'
import { useToast } from '@/packages/hooks'
import { ArrowLeft } from 'lucide-react'
import type { CreateProjectInput } from '@/packages/schemas'

export default function NewProjectPage() {
	const params = useParams()
	const router = useRouter()
	const { showToast } = useToast()
	const teamId = params.teamId as string

	const [isSubmitting, setIsSubmitting] = useState(false)

	const [createProject] = useMutation(CreateProjectDocument, {
		refetchQueries: [
			{
				query: ProjectsByTeamDocument,
				variables: { teamId },
			},
		],
	})

	const handleSubmit = async (data: CreateProjectInput | any) => {
		setIsSubmitting(true)

		try {
			const result = await createProject({
				variables: {
					input: {
						teamId,
						name: data.name,
						address: data.address || null,
						description: data.description || null,
						budget: data.budget || null,
						clientPhone: data.clientPhone || null,
						startDate: data.startDate ? data.startDate.toISOString() : null,
						endDate: data.endDate ? data.endDate.toISOString() : null,
						notes: data.notes || null,
					},
				},
			})

			if (result.data?.createProject) {
				showToast({
					type: 'success',
					message: 'Проект успешно создан!',
				})

				// Перенаправление на страницу проекта
				router.push(`/teams/${teamId}/projects/${result.data.createProject.id}`)
			}
		} catch (error: any) {
			console.error('Error creating project:', error)
			showToast({
				type: 'error',
				message: error.message || 'Не удалось создать проект',
			})
		} finally {
			setIsSubmitting(false)
		}
	}

	const handleCancel = () => {
		router.back()
	}

	return (
		<div className="container mx-auto p-6 max-w-4xl">
			{/* Back Button */}
			<button
				onClick={() => router.back()}
				className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
			>
				<ArrowLeft className="h-4 w-4" />
				Назад к проектам
			</button>

			{/* Form Card */}
			<Card>
				<CardHeader>
					<CardTitle className="text-2xl">Создание нового проекта</CardTitle>
					<p className="text-sm text-muted-foreground mt-1">
						Заполните информацию о строительном объекте
					</p>
				</CardHeader>
				<CardContent>
					<ProjectForm
						mode="create"
						teamId={teamId}
						onSubmit={handleSubmit}
						onCancel={handleCancel}
						isSubmitting={isSubmitting}
					/>
				</CardContent>
			</Card>
		</div>
	)
}
