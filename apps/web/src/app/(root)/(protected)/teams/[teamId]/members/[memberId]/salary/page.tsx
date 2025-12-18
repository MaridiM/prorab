'use client'

import { useParams, useRouter } from 'next/navigation'
import { useQuery, useMutation } from '@apollo/client/react'
import { motion } from 'framer-motion'
import { ArrowLeft, Loader2, History } from 'lucide-react'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale/ru'

import {
	MyTeamsDocument,
	UpdateMemberSalaryDocument,
	MemberSalaryHistoryDocument,
	TeamMembersDocument,
	type UpdateMemberSalaryInput,
} from '@/packages/api/graphql'
import {
	Button,
	Card,
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/packages/components'
import { SalarySettingsForm } from '@/packages/components/payouts'
import { useToast } from '@/packages/hooks'
import { useAuth } from '@/packages/libs/auth'

export default function MemberSalaryPage() {
	const params = useParams()
	const router = useRouter()
	const { user } = useAuth()
	const { showToast } = useToast()
	const teamId = params.teamId as string
	const memberId = params.memberId as string

	// Загрузка данных команды
	const { data, loading, error } = useQuery(MyTeamsDocument)

	// Загрузка участников команды
	const { data: teamMembersData, loading: membersLoading } = useQuery(
		TeamMembersDocument,
		{
			variables: { teamId },
			skip: !teamId,
		}
	)

	// Загрузка истории изменений зарплаты
	const { data: historyData, loading: historyLoading } = useQuery(
		MemberSalaryHistoryDocument,
		{
			variables: { memberId },
			skip: !memberId,
		}
	)

	const team = data?.myTeams?.find((t) => t.id === teamId)
	const isOwner = team?.ownerId === user?.id

	// Найти участника по memberId из загруженных данных
	const member = teamMembersData?.teamMembers?.find((m) => m.id === memberId)

	// Мутация для обновления зарплаты
	const [updateSalary, { loading: updating }] = useMutation(
		UpdateMemberSalaryDocument,
		{
			onCompleted: () => {
				showToast({
					message: 'Настройки зарплаты успешно сохранены',
					type: 'success',
				})
				router.back()
			},
			onError: (error) => {
				showToast({
					message: error.message || 'Не удалось обновить зарплату',
					type: 'error',
				})
			},
			refetchQueries: [
				{ query: MyTeamsDocument },
				{ query: TeamMembersDocument, variables: { teamId } },
				{ query: MemberSalaryHistoryDocument, variables: { memberId } },
			],
		}
	)

	const handleSubmit = async (data: { memberId: string; salaryType: 'FIXED' | 'PERCENTAGE' | 'NONE'; salaryAmount?: number | null }) => {
		await updateSalary({
			variables: {
				input: {
					memberId: data.memberId,
					salaryType: data.salaryType,
					salaryAmount: data.salaryAmount ?? null,
					reason: null,
				},
			},
		})
	}

	const handleBack = () => {
		router.back()
	}

	// Helper functions for formatting salary history
	const formatSalaryType = (type: string | null) => {
		if (!type) return '—'
		const typeMap: Record<string, string> = {
			fixed: 'Фиксированная',
			percentage: 'Процент',
			none: 'Не установлена',
		}
		return typeMap[type.toLowerCase()] || type
	}

	const formatSalaryAmount = (amount: number | null, type: string | null) => {
		if (!amount) return '—'
		if (type?.toLowerCase() === 'percentage') {
			return `${amount}%`
		}
		return `${amount.toLocaleString('ru-RU')} ₽`
	}

	const formatChange = (
		oldType: string | null,
		oldAmount: number | null,
		newType: string | null,
		newAmount: number | null
	) => {
		const oldTypeLabel = formatSalaryType(oldType)
		const newTypeLabel = formatSalaryType(newType)

		// If type changed
		if (oldType !== newType) {
			return {
				field: 'Тип зарплаты',
				oldValue: oldTypeLabel,
				newValue: newTypeLabel,
			}
		}

		// If amount changed
		if (oldAmount !== newAmount) {
			return {
				field: 'Размер зарплаты',
				oldValue: formatSalaryAmount(oldAmount, oldType),
				newValue: formatSalaryAmount(newAmount, newType),
			}
		}

		// Fallback
		return {
			field: 'Изменение',
			oldValue: `${oldTypeLabel} ${formatSalaryAmount(oldAmount, oldType)}`,
			newValue: `${newTypeLabel} ${formatSalaryAmount(newAmount, newType)}`,
		}
	}

	if (loading || membersLoading) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<Loader2 className="w-8 h-8 animate-spin text-primary" />
			</div>
		)
	}

	if (error || !team || !member) {
		return (
			<div className="container max-w-2xl mx-auto p-6">
				<Card className="p-8 text-center">
					<p className="text-destructive">Ошибка загрузки данных</p>
					<p className="text-sm text-muted-foreground mt-2">
						{error?.message || 'Участник не найден'}
					</p>
					<Button onClick={handleBack} variant="outline" className="mt-4">
						<ArrowLeft className="w-4 h-4 mr-2" />
						Назад
					</Button>
				</Card>
			</div>
		)
	}

	if (!isOwner) {
		return (
			<div className="container max-w-2xl mx-auto p-6">
				<Card className="p-8 text-center">
					<p className="text-destructive">Доступ запрещён</p>
					<p className="text-sm text-muted-foreground mt-2">
						Только владелец команды может настраивать зарплаты
					</p>
					<Button onClick={handleBack} variant="outline" className="mt-4">
						<ArrowLeft className="w-4 h-4 mr-2" />
						Назад
					</Button>
				</Card>
			</div>
		)
	}

	return (
		<div className="container max-w-2xl mx-auto p-6">
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				className="space-y-6"
			>
				{/* Back Button */}
				<Button
					onClick={handleBack}
					variant="ghost"
					className="flex items-center gap-2"
				>
					<ArrowLeft className="w-4 h-4" />
					Назад к команде
				</Button>

				{/* Salary Settings Form */}
				<Card className="p-6">
					<SalarySettingsForm
						memberId={member.id}
						memberName={member.user?.fullName || 'Участник'}
						currentSalaryType={member.salaryType as any}
						currentSalaryAmount={member.salaryAmount}
						onSubmit={handleSubmit}
						onCancel={handleBack}
						isLoading={updating}
					/>
				</Card>

				{/* Salary History Section */}
				<Card className="p-6">
					<div className="flex items-center gap-2 mb-4">
						<History className="w-5 h-5 text-muted-foreground" />
						<h3 className="text-lg font-semibold">История изменений зарплаты</h3>
					</div>

					{historyLoading ? (
						<div className="flex items-center justify-center py-8">
							<Loader2 className="w-6 h-6 animate-spin text-primary" />
						</div>
					) : !historyData?.memberSalaryHistory ||
					  historyData.memberSalaryHistory.length === 0 ? (
						<p className="text-muted-foreground text-center py-8">
							Нет истории изменений
						</p>
					) : (
						<div className="overflow-x-auto">
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Дата</TableHead>
										<TableHead>Кто изменил</TableHead>
										<TableHead>Поле</TableHead>
										<TableHead>Было</TableHead>
										<TableHead>Стало</TableHead>
										<TableHead>Причина</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{historyData.memberSalaryHistory.map((entry) => {
										const change = formatChange(
											entry.previousType,
											entry.previousAmount,
											entry.newType,
											entry.newAmount
										)
										return (
											<TableRow key={entry.id}>
												<TableCell>
													{format(
														new Date(entry.createdAt),
														'dd.MM.yyyy HH:mm',
														{ locale: ru }
													)}
												</TableCell>
												<TableCell>
													{entry.changedBy?.fullName || 'Неизвестно'}
												</TableCell>
												<TableCell>{change.field}</TableCell>
												<TableCell className="text-muted-foreground">
													{change.oldValue}
												</TableCell>
												<TableCell className="font-medium">
													{change.newValue}
												</TableCell>
												<TableCell className="text-sm text-muted-foreground">
													{entry.reason || '—'}
												</TableCell>
											</TableRow>
										)
									})}
								</TableBody>
							</Table>
						</div>
					)}
				</Card>
			</motion.div>
		</div>
	)
}
