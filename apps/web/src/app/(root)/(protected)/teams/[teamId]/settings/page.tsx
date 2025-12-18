'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useQuery } from '@apollo/client/react'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
	ArrowLeft,
	Settings,
	Users,
	Crown,
	Trash2,
	Loader2,
	Save,
	AlertCircle,
	Construction,
} from 'lucide-react'

import {
	MyTeamsDocument,
} from '@/packages/api/graphql'
import { useAuth } from '@/packages/libs/auth'
import { useToast } from '@/packages/hooks'
import {
	Button,
	Input,
	Skeleton,
	Badge,
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
	UserMenu,
} from '@/packages/components'
import { TeamLogo, IconPicker } from '@/packages/components/ui'
import { cn } from '@/packages/utils'

// Schema
const teamSettingsSchema = z.object({
	name: z
		.string()
		.min(2, 'Минимум 2 символа')
		.max(100, 'Максимум 100 символов'),
	iconId: z.string().optional(),
	colorId: z.string().optional(),
})

type TeamSettingsForm = z.infer<typeof teamSettingsSchema>

// Animations
const fadeIn = {
	hidden: { opacity: 0, y: 20 },
	visible: {
		opacity: 1,
		y: 0,
		transition: { duration: 0.4, ease: [0.22, 0.61, 0.36, 1] as const },
	},
}

const stagger = {
	hidden: {},
	visible: {
		transition: { staggerChildren: 0.08 },
	},
}

export default function TeamSettingsPage() {
	const params = useParams()
	const router = useRouter()
	const { user } = useAuth()
	const { showToast } = useToast()
	const teamId = params.teamId as string

	// Query teams to find current team
	const { data: teamsData, loading: teamsLoading } = useQuery(MyTeamsDocument)

	const team = teamsData?.myTeams?.find((t: any) => t.id === teamId)
	const isOwner = team?.ownerId === user?.id

	// Form
	const form = useForm<TeamSettingsForm>({
		resolver: zodResolver(teamSettingsSchema),
		defaultValues: {
			name: '',
			iconId: undefined,
			colorId: undefined,
		},
	})

	// Set default values when team loads
	useEffect(() => {
		if (team) {
			form.reset({
				name: team.name,
				iconId: team.iconId || undefined,
				colorId: team.colorId || undefined,
			})
		}
	}, [team, form])

	const onSubmit = async (_data: TeamSettingsForm) => {
		// TODO: Implement after GraphQL codegen
		showToast({
			title: 'В разработке',
			description: 'Обновление команды будет доступно после запуска GraphQL генерации',
			type: 'info',
		})
	}

	// Loading state
	if (teamsLoading) {
		return (
			<div className="min-h-screen bg-background">
				<div className="border-b border-border/30 bg-card/50">
					<div className="container mx-auto px-4 py-4">
						<Skeleton className="h-8 w-48 mb-2" />
						<Skeleton className="h-5 w-64" />
					</div>
				</div>
				<div className="container mx-auto px-4 py-8">
					<div className="max-w-2xl mx-auto space-y-6">
						<Skeleton className="h-40 rounded-2xl" />
						<Skeleton className="h-64 rounded-2xl" />
					</div>
				</div>
			</div>
		)
	}

	// Team not found
	if (!team) {
		return (
			<div className="min-h-screen bg-background flex items-center justify-center">
				<div className="text-center p-8">
					<AlertCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
					<h2 className="text-2xl font-bold mb-3">Команда не найдена</h2>
					<p className="text-muted-foreground mb-6">
						Возможно, команда была удалена или у вас нет к ней доступа
					</p>
					<Button onClick={() => router.push('/dashboard')}>
						<ArrowLeft className="w-4 h-4 mr-2" />
						На главную
					</Button>
				</div>
			</div>
		)
	}

	// Access denied
	if (!isOwner) {
		return (
			<div className="min-h-screen bg-background flex items-center justify-center">
				<div className="text-center p-8">
					<AlertCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
					<h2 className="text-2xl font-bold mb-3">Доступ запрещён</h2>
					<p className="text-muted-foreground mb-6">
						Только владелец команды может изменять настройки
					</p>
					<Button onClick={() => router.back()}>
						<ArrowLeft className="w-4 h-4 mr-2" />
						Назад
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
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-4">
							<button
								onClick={() => router.push(`/teams/${teamId}`)}
								className="p-2 rounded-xl hover:bg-secondary/50 transition-colors"
							>
								<ArrowLeft className="w-5 h-5" />
							</button>
							<div className="flex items-center gap-3">
								<div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
									<Settings className="w-5 h-5 text-primary" />
								</div>
								<div>
									<h1 className="text-xl font-bold">Настройки команды</h1>
									<p className="text-sm text-muted-foreground">{team?.name}</p>
								</div>
							</div>
						</div>
						<UserMenu avatarSize="sm" />
					</div>
				</div>
			</motion.header>

			{/* Main Content */}
			<main className="container mx-auto px-4 py-6">
				<motion.div
					initial="hidden"
					animate="visible"
					variants={stagger}
					className="max-w-3xl mx-auto space-y-6"
				>
					{/* Coming Soon Banner */}
					<motion.div
						variants={fadeIn}
						className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-6"
					>
						<div className="flex items-start gap-4">
							<div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center flex-shrink-0">
								<Construction className="w-6 h-6 text-amber-500" />
							</div>
							<div>
								<h3 className="font-semibold text-amber-600 dark:text-amber-400">
									Функционал в разработке
								</h3>
								<p className="text-sm text-muted-foreground mt-1">
									Настройки команды будут полностью доступны после запуска генерации GraphQL кода.
									Пока вы можете просмотреть текущие настройки.
								</p>
							</div>
						</div>
					</motion.div>

					{/* Team Info Section */}
					<motion.section
						variants={fadeIn}
						className="rounded-2xl border border-border/50 bg-card overflow-hidden"
					>
						<div className="p-6 border-b border-border/30">
							<h2 className="text-lg font-semibold flex items-center gap-2">
								<Crown className="w-5 h-5 text-amber-500" />
								Основные настройки
							</h2>
						</div>

						<Form {...form}>
							<form onSubmit={form.handleSubmit(onSubmit)} className="p-6 space-y-6">
								{/* Team Name */}
								<FormField
									control={form.control}
									name="name"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Название команды</FormLabel>
											<FormControl>
												<Input
													{...field}
													placeholder="Введите название"
													className="h-12 rounded-xl"
													disabled
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								{/* Logo Settings */}
								<div className="space-y-4">
									<FormLabel>Логотип команды</FormLabel>
									<div className="flex items-start gap-6">
										{/* Preview */}
										<div className="flex-shrink-0">
											<div className="w-20 h-20 rounded-2xl border-2 border-dashed border-border/50 flex items-center justify-center overflow-hidden bg-secondary/30">
												{team && (
													<TeamLogo
														name={team.name}
														logo={team.logoUrl}
														iconId={form.watch('iconId') || team.iconId}
														size="lg"
													/>
												)}
											</div>
										</div>

										{/* Icon Picker */}
										<div className="flex-1 opacity-50 pointer-events-none">
											<IconPicker
												selectedIcon={form.watch('iconId') || team?.iconId || undefined}
												selectedColor={form.watch('colorId') || team?.colorId || undefined}
												onIconSelect={(iconId) => form.setValue('iconId', iconId)}
												onColorSelect={(colorId) => form.setValue('colorId', colorId)}
											/>
										</div>
									</div>
								</div>

								{/* Submit */}
								<Button
									type="submit"
									disabled={true}
									className="w-full h-12 rounded-xl"
								>
									<Save className="w-4 h-4 mr-2" />
									Сохранить изменения (скоро)
								</Button>
							</form>
						</Form>
					</motion.section>

					{/* Team Members Section */}
					<motion.section
						variants={fadeIn}
						className="rounded-2xl border border-border/50 bg-card overflow-hidden"
					>
						<div className="p-6 border-b border-border/30">
							<h2 className="text-lg font-semibold flex items-center gap-2">
								<Users className="w-5 h-5 text-primary" />
								Участники команды
							</h2>
						</div>

						<div className="p-6">
							<p className="text-sm text-muted-foreground mb-4">
								Управление участниками команды будет доступно после запуска генерации GraphQL кода.
							</p>
							
							{/* Owner info */}
							<div className="p-4 rounded-xl bg-secondary/30 flex items-center gap-4">
								<div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
									{user?.fullName?.charAt(0).toUpperCase() || '?'}
								</div>
								<div>
									<div className="flex items-center gap-2">
										<span className="font-medium">{user?.fullName || 'Без имени'}</span>
										<Badge
											variant="default"
											className="bg-amber-500/10 text-amber-600 border-amber-500/20"
										>
											<Crown className="w-3 h-3 mr-1" />
											Владелец
										</Badge>
									</div>
									<p className="text-sm text-muted-foreground">{user?.email}</p>
								</div>
							</div>
						</div>

						{/* Invite Section */}
						<div className="p-6 border-t border-border/30 bg-secondary/20">
							<p className="text-sm text-muted-foreground mb-4">
								Для приглашения новых участников используйте код приглашения из онбординга.
							</p>
							<Button variant="outline" className="rounded-xl" disabled>
								Создать код приглашения (скоро)
							</Button>
						</div>
					</motion.section>

					{/* Danger Zone */}
					<motion.section
						variants={fadeIn}
						className="rounded-2xl border border-destructive/30 bg-destructive/5 overflow-hidden"
					>
						<div className="p-6 border-b border-destructive/20">
							<h2 className="text-lg font-semibold text-destructive flex items-center gap-2">
								<AlertCircle className="w-5 h-5" />
								Опасная зона
							</h2>
						</div>
						<div className="p-6">
							<p className="text-sm text-muted-foreground mb-4">
								Удаление команды приведёт к безвозвратной потере всех проектов, расходов и
								отчётов. Это действие нельзя отменить.
							</p>
							<Button variant="outline" className="rounded-xl text-destructive hover:bg-destructive/10" disabled>
								<Trash2 className="w-4 h-4 mr-2" />
								Удалить команду (скоро)
							</Button>
						</div>
					</motion.section>
				</motion.div>
			</main>
		</div>
	)
}
