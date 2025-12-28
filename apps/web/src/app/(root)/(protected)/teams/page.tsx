'use client'

import { useRouter } from 'next/navigation'
import { useQuery } from '@apollo/client/react'
import { motion } from 'framer-motion'
import { Users, Plus, ArrowRight, Crown, ArrowLeft, FolderKanban } from 'lucide-react'

import { MyTeamsDocument } from '@/packages/api/graphql'
import { Button, Skeleton, UserMenu } from '@/packages/components'
import { useAuth } from '@/packages/libs/auth'

const fadeIn = {
	hidden: { opacity: 0, y: 20 },
	visible: {
		opacity: 1,
		y: 0,
		transition: { duration: 0.5, ease: [0.22, 0.61, 0.36, 1] as const },
	},
}

const stagger = {
	hidden: {},
	visible: {
		transition: {
			staggerChildren: 0.1,
		},
	},
}

export default function TeamsPage() {
	const router = useRouter()
	const { user } = useAuth()
	const { data, loading, error } = useQuery(MyTeamsDocument, {
		fetchPolicy: 'cache-and-network',
	})

	const teams = data?.myTeams || []

	const handleTeamClick = (teamId: string) => {
		router.push(`/teams/${teamId}`)
	}

	const handleCreateTeam = () => {
		router.push('/onboarding')
	}

	const handleBack = () => {
		router.push('/dashboard')
	}

	// Loading state
	if (loading && !data) {
		return (
			<div className="min-h-screen bg-background">
				{/* Header Skeleton */}
				<div className="border-b border-border/30 bg-card/80 backdrop-blur-xl">
					<div className="w-full max-w-[1920px] mx-auto px-4 py-4">
						<div className="flex items-center gap-4">
							<Skeleton className="h-10 w-10 rounded-xl" />
							<div>
								<Skeleton className="h-7 w-40 mb-2" />
								<Skeleton className="h-5 w-64" />
							</div>
						</div>
					</div>
				</div>

				{/* Content Skeleton */}
				<div className="w-full max-w-[1920px] mx-auto px-4 py-8">
					<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
						{[1, 2, 3].map(i => (
							<Skeleton key={i} className="h-64 rounded-2xl" />
						))}
					</div>
				</div>
			</div>
		)
	}

	// Error state
	if (error) {
		return (
			<div className="min-h-screen bg-background flex items-center justify-center">
				<div className="text-center">
					<p className="text-destructive text-lg mb-4">
						Ошибка загрузки команд
					</p>
					<Button onClick={() => window.location.reload()}>
						Попробовать снова
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
				<div className="w-full max-w-[1920px] mx-auto px-4 py-4">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-4">
							{/* Back Button */}
							<button
								onClick={handleBack}
								className="p-2 rounded-xl hover:bg-secondary/50 transition-colors"
							>
								<ArrowLeft className="w-5 h-5" />
							</button>

							<div>
								<h1 className="text-xl font-bold flex items-center gap-2">
									<Users className="w-5 h-5 text-primary" />
									Мои команды
								</h1>
								<p className="text-sm text-muted-foreground">
									{teams.length === 0
										? 'У вас пока нет команд'
										: `${teams.length} ${
												teams.length === 1
													? 'команда'
													: teams.length >= 2 && teams.length <= 4
													? 'команды'
													: 'команд'
										  }`}
								</p>
							</div>
						</div>

						<div className="flex items-center gap-3">
							<Button onClick={handleCreateTeam}>
								<Plus className="w-4 h-4 mr-2" />
								Создать команду
							</Button>
							<UserMenu avatarSize="sm" />
						</div>
					</div>
				</div>
			</motion.header>

			{/* Main Content */}
			<main className="w-full max-w-[1920px] mx-auto px-4 py-8">
				<motion.div initial="hidden" animate="visible" variants={stagger}>
					{teams.length === 0 ? (
						// Empty state
						<motion.div
							className="max-w-2xl mx-auto text-center py-20"
							variants={fadeIn}
						>
							<div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
								<FolderKanban className="w-10 h-10 text-primary" />
							</div>
							<h2 className="text-2xl font-bold mb-3">
								Создайте свою первую команду
							</h2>
							<p className="text-muted-foreground text-lg mb-8">
								Команды помогают организовать работу бригады и управлять
								проектами вместе
							</p>
							<Button onClick={handleCreateTeam} size="lg">
								<Plus className="w-5 h-5 mr-2" />
								Создать первую команду
								<ArrowRight className="w-5 h-5 ml-2" />
							</Button>
						</motion.div>
					) : (
						// Teams grid
						<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
							{teams.map(team => (
								<motion.div
									key={team.id}
									variants={fadeIn}
									whileHover={{ y: -4, transition: { duration: 0.2 } }}
									onClick={() => handleTeamClick(team.id)}
									className="p-6 rounded-2xl border border-border/30 bg-card cursor-pointer hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 relative overflow-hidden group"
								>
									{/* Gradient background on hover */}
									<div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-blue-500/5 to-indigo-500/5" />

									<div className="relative z-10">
										{/* Team Logo or Icon */}
										{team.logoUrl ? (
											<div className="w-14 h-14 rounded-2xl overflow-hidden mb-4 shadow-lg">
												<img
													src={team.logoUrl}
													alt={team.name}
													className="w-full h-full object-cover"
												/>
											</div>
										) : (
											<div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 text-white bg-gradient-to-br from-blue-500 to-indigo-500 shadow-lg">
												<Users className="w-7 h-7" />
											</div>
										)}

										{/* Team Info */}
										<div className="mb-4">
											<div className="flex items-center gap-2 mb-1">
												<h3 className="text-lg font-bold group-hover:text-primary transition-colors">
													{team.name}
												</h3>
												{user?.id === team.ownerId && (
													<Crown className="w-4 h-4 text-amber-500" />
												)}
											</div>
											<p className="text-sm text-muted-foreground">
												Создана{' '}
												{new Date(team.createdAt).toLocaleDateString('ru-RU')}
											</p>
										</div>

										{/* Owner badge and Arrow */}
										<div className="flex items-center justify-between">
											{user?.id === team.ownerId ? (
												<span className="px-3 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-600 dark:text-amber-400">
													Владелец
												</span>
											) : (
												<span className="px-3 py-1 rounded-full text-xs font-medium bg-secondary text-muted-foreground">
													Участник
												</span>
											)}

											{/* Arrow */}
											<div className="flex items-center gap-2 text-primary font-medium text-sm group-hover:gap-3 transition-all">
												<span className="opacity-0 group-hover:opacity-100 transition-opacity">
													Открыть
												</span>
												<ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
											</div>
										</div>
									</div>
								</motion.div>
							))}

							{/* Create new team card */}
							<motion.div
								variants={fadeIn}
								whileHover={{ y: -4, transition: { duration: 0.2 } }}
								onClick={handleCreateTeam}
								className="p-6 rounded-2xl border-2 border-dashed border-border/50 bg-secondary/20 cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all duration-300 relative overflow-hidden group flex items-center justify-center min-h-[220px]"
							>
								<div className="text-center">
									<div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 text-primary bg-primary/10 mx-auto group-hover:scale-110 transition-transform">
										<Plus className="w-7 h-7" />
									</div>
									<h3 className="text-lg font-bold mb-2">
										Создать новую команду
									</h3>
									<p className="text-sm text-muted-foreground">
										Добавьте ещё одну команду для работы
									</p>
								</div>
							</motion.div>
						</div>
					)}
				</motion.div>
			</main>
		</div>
	)
}
