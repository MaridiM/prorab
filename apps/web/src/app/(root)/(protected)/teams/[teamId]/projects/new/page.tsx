'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useQuery, useMutation } from '@apollo/client/react'
import { motion } from 'framer-motion'
import {
	CreateProjectDocument,
	ProjectsByTeamDocument,
	MyTeamsDocument,
} from '@/packages/api/graphql'
import { ProjectForm } from '@/packages/components/projects'
import { Card, CardContent, CardHeader, CardTitle, Skeleton } from '@/packages/components/ui'
import { useToast } from '@/packages/hooks'
import { ArrowLeft, FolderPlus, Users } from 'lucide-react'
import type { CreateProjectInput } from '@/packages/schemas'

const fadeIn = {
	hidden: { opacity: 0, y: 20 },
	visible: {
		opacity: 1,
		y: 0,
		transition: { duration: 0.5, ease: [0.22, 0.61, 0.36, 1] },
	},
}

export default function NewProjectPage() {
	const params = useParams()
	const router = useRouter()
	const { showToast } = useToast()
	const teamId = params.teamId as string

	const [isSubmitting, setIsSubmitting] = useState(false)

	// Загрузка команды
	const { data: teamsData, loading: teamsLoading } = useQuery(MyTeamsDocument)
	const team = teamsData?.myTeams?.find(t => t.id === teamId)

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

	// Loading state
	if (teamsLoading) {
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
							onClick={() => router.back()}
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
								<h1 className="text-xl font-bold">Новый проект</h1>
								<p className="text-sm text-muted-foreground">
									{team?.name || 'Команда'}
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
								<div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white bg-gradient-to-br from-emerald-500 to-teal-500">
									<FolderPlus className="w-6 h-6" />
								</div>
								<div>
									<CardTitle className="text-xl">Создание проекта</CardTitle>
									<p className="text-sm text-muted-foreground mt-1">
										Заполните информацию о строительном объекте
									</p>
								</div>
							</div>
						</CardHeader>
						<CardContent className="pt-6">
							<ProjectForm
								mode="create"
								teamId={teamId}
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
