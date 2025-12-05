'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useQuery, useMutation } from '@apollo/client/react'
import { motion } from 'framer-motion'
import {
	ProjectDocument,
	UpdateProjectDocument,
	ProjectsByTeamDocument,
	MyTeamsDocument,
} from '@/packages/api/graphql'
import { ProjectForm } from '@/packages/components/projects'
import { Card, CardContent, CardHeader, CardTitle, Skeleton, Button } from '@/packages/components/ui'
import { useToast } from '@/packages/hooks'
import { ArrowLeft, Edit3, Users } from 'lucide-react'
import type { UpdateProjectInput } from '@/packages/schemas'

const fadeIn = {
	hidden: { opacity: 0, y: 20 },
	visible: {
		opacity: 1,
		y: 0,
		transition: { duration: 0.5, ease: [0.22, 0.61, 0.36, 1] as const },
	},
}

export default function EditProjectPage() {
	const params = useParams()
	const router = useRouter()
	const { showToast } = useToast()
	const teamId = params.teamId as string
	const projectId = params.projectId as string

	const [isSubmitting, setIsSubmitting] = useState(false)

	// Загрузка команды
	const { data: teamsData } = useQuery(MyTeamsDocument)
	const team = teamsData?.myTeams?.find(t => t.id === teamId)

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
			<div className="min-h-screen bg-background">
				<div className="border-b border-border/30 bg-card/80">
					<div className="container mx-auto px-4 py-4">
						<Skeleton className="h-8 w-48 mb-2" />
						<Skeleton className="h-5 w-64" />
					</div>
				</div>
				<div className="container mx-auto p-6 max-w-4xl">
					<Skeleton className="h-[600px] rounded-2xl" />
				</div>
			</div>
		)
	}

	// Error state
	if (error || !project) {
		return (
			<div className="min-h-screen bg-background flex items-center justify-center">
				<div className="text-center">
					<h3 className="text-lg font-semibold text-destructive mb-2">
						{error ? 'Ошибка загрузки проекта' : 'Проект не найден'}
					</h3>
					<p className="text-muted-foreground mb-4">
						{error?.message || 'Не удалось загрузить данные проекта'}
					</p>
					<Button onClick={() => router.push(`/teams/${teamId}`)}>
						Вернуться к проектам
					</Button>
				</div>
			</div>
		)
	}

	return (
		<div className="min-h-screen bg-background pb-24">
			{/* Header */}
			<motion.header
				initial={{ opacity: 0, y: -20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5 }}
				className="sticky top-0 z-40 border-b border-border/30 bg-card/80 backdrop-blur-xl"
			>
				<div className="container mx-auto px-4 py-4">
					<div className="flex items-center gap-4">
						{/* Back Button */}
						<button
							onClick={() => router.push(`/teams/${teamId}/projects/${projectId}`)}
							className="p-2 rounded-xl hover:bg-secondary/50 transition-colors"
						>
							<ArrowLeft className="w-5 h-5" />
						</button>

						{/* Team & Page Info */}
						<div className="flex items-center gap-3">
							{team?.logoUrl ? (
								<div className="w-10 h-10 rounded-xl overflow-hidden">
									<img
										src={team.logoUrl}
										alt={team.name}
										className="w-full h-full object-cover"
									/>
								</div>
							) : (
								<div className="w-10 h-10 rounded-xl flex items-center justify-center text-white bg-gradient-to-br from-blue-500 to-indigo-500">
									<Users className="w-5 h-5" />
								</div>
							)}
							<div>
								<h1 className="text-xl font-bold">Редактирование</h1>
								<p className="text-sm text-muted-foreground">
									{project.name}
								</p>
							</div>
						</div>
					</div>
				</div>
			</motion.header>

			{/* Main Content */}
			<main className="container mx-auto px-4 py-6 max-w-4xl">
				<motion.div
					initial="hidden"
					animate="visible"
					variants={fadeIn}
				>
					<Card className="border-border/30">
						<CardHeader className="border-b border-border/30">
							<div className="flex items-center gap-3">
								<div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white bg-gradient-to-br from-amber-500 to-orange-500">
									<Edit3 className="w-6 h-6" />
								</div>
								<div>
									<CardTitle className="text-xl">Редактирование проекта</CardTitle>
									<p className="text-sm text-muted-foreground mt-1">
										Обновите информацию о проекте «{project.name}»
									</p>
								</div>
							</div>
						</CardHeader>
						<CardContent className="pt-6">
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
				</motion.div>
			</main>
		</div>
	)
}
