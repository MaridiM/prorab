'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useQuery } from '@apollo/client/react'
import { ProjectsByTeamDocument, MyTeamsDocument } from '@/packages/api/graphql'
import { ProjectStatus } from '@/packages/schemas'
import { ProjectCard } from '@/packages/components/projects'
import { Button, Skeleton } from '@/packages/components/ui'
import { Plus, Search } from 'lucide-react'

type ProjectStatusFilter = 'ALL' | 'ACTIVE' | 'ARCHIVED' | 'COMPLETED'

export default function TeamDashboardPage() {
	const params = useParams()
	const router = useRouter()
	const teamId = params.teamId as string

	const [statusFilter, setStatusFilter] = useState<ProjectStatusFilter>('ALL')
	const [searchQuery, setSearchQuery] = useState('')

	// Загрузка команды для отображения названия
	const { data: teamsData } = useQuery(MyTeamsDocument)
	const team = teamsData?.myTeams.find(t => t.id === teamId)

	// Загрузка проектов с фильтрацией
	const { data, loading, error } = useQuery(ProjectsByTeamDocument, {
		variables: {
			teamId,
			filter: (statusFilter === 'ALL' && !searchQuery
				? null
				: {
					status: statusFilter === 'ALL' ? null : (statusFilter as any),
					searchQuery: searchQuery || null,
				}) as any,
		},
		fetchPolicy: 'cache-and-network',
	})

	const projects = data?.projectsByTeam || []

	const handleCreateProject = () => {
		router.push(`/teams/${teamId}/projects/new`)
	}

	// Loading skeleton
	if (loading && !data) {
		return (
			<div className="container mx-auto p-6 max-w-7xl">
				<div className="mb-8">
					<Skeleton className="h-10 w-64 mb-2" />
					<Skeleton className="h-6 w-96" />
				</div>
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{[1, 2, 3, 4, 5, 6].map(i => (
						<Skeleton key={i} className="h-64 rounded-lg" />
					))}
				</div>
			</div>
		)
	}

	// Error state
	if (error) {
		return (
			<div className="container mx-auto p-6 max-w-7xl">
				<div className="flex items-center justify-center min-h-[400px]">
					<div className="text-center">
						<h3 className="text-lg font-semibold text-destructive mb-2">
							Ошибка загрузки проектов
						</h3>
						<p className="text-muted-foreground">{error.message}</p>
					</div>
				</div>
			</div>
		)
	}

	// Empty state
	const isEmpty = projects.length === 0

	return (
		<div className="container mx-auto p-6 max-w-7xl">
			{/* Header */}
			<div className="mb-8">
				<h1 className="text-3xl font-bold mb-2">{team?.name || 'Команда'}</h1>
				<p className="text-muted-foreground">
					Управляйте вашими строительными объектами
				</p>
			</div>

			{/* Filters */}
			<div className="mb-6 space-y-4">
				{/* Status Tabs */}
				<div className="flex flex-wrap gap-2">
					{[
						{ value: 'ALL' as const, label: 'Все проекты' },
						{ value: 'ACTIVE' as const, label: 'Активные' },
						{ value: 'COMPLETED' as const, label: 'Завершённые' },
						{ value: 'ARCHIVED' as const, label: 'Архив' },
					].map(tab => (
						<Button
							key={tab.value}
							variant={statusFilter === tab.value ? 'default' : 'outline'}
							onClick={() => setStatusFilter(tab.value)}
							size="sm"
						>
							{tab.label}
						</Button>
					))}
				</div>

				{/* Search */}
				<div className="relative max-w-md">
					<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
					<input
						type="text"
						placeholder="Поиск по названию или адресу..."
						value={searchQuery}
						onChange={e => setSearchQuery(e.target.value)}
						className="w-full pl-10 pr-4 py-2 rounded-md border border-input bg-background text-sm ring-offset-background placeholder:text-muted-foreground/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
					/>
				</div>
			</div>

			{/* Projects Grid */}
			{isEmpty ? (
				<div className="flex items-center justify-center min-h-[400px]">
					<div className="text-center max-w-md">
						<div className="mb-4">
							<svg
								className="mx-auto h-24 w-24 text-muted-foreground/40"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
								aria-hidden="true"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={1.5}
									d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
								/>
							</svg>
						</div>
						<h3 className="text-lg font-semibold mb-2">
							{searchQuery || statusFilter !== 'ALL'
								? 'Проекты не найдены'
								: 'Пока нет проектов'}
						</h3>
						<p className="text-muted-foreground mb-6">
							{searchQuery || statusFilter !== 'ALL'
								? 'Попробуйте изменить параметры поиска или фильтры'
								: 'Создайте свой первый строительный проект'}
						</p>
						{!searchQuery && statusFilter === 'ALL' && (
							<Button onClick={handleCreateProject}>
								<Plus className="h-4 w-4 mr-2" />
								Создать проект
							</Button>
						)}
					</div>
				</div>
			) : (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{projects.map(project => {
						if (!project?.id) return null
						return (
							<ProjectCard
								key={project.id}
								{...project as any}
								id={project.id}
								name={project.name || ''}
								teamId={project.teamId || teamId}
								status={project.status as any}
							/>
						)
					})}
				</div>
			)}

			{/* FAB Button */}
			{!isEmpty && (
				<button
					onClick={handleCreateProject}
					className="fixed bottom-8 right-8 h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-lg hover:shadow-xl transition-all hover:scale-105 flex items-center justify-center z-50"
					aria-label="Создать проект"
				>
					<Plus className="h-6 w-6" />
				</button>
			)}
		</div>
	)
}
