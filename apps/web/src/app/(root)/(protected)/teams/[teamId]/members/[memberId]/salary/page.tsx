'use client'

import { useParams, useRouter } from 'next/navigation'
import { useQuery, useMutation } from '@apollo/client/react'
import { motion } from 'framer-motion'
import { ArrowLeft, Loader2 } from 'lucide-react'

import {
	MyTeamsDocument,
	UpdateMemberSalaryDocument,
} from '@/packages/api/graphql'
import { Button, Card } from '@/packages/components'
import { SalarySettingsForm } from '@/packages/components/payouts'
import { useToast } from '@/packages/hooks'
import { useAuth } from '@/packages/libs/auth'
import type { UpdateMemberSalaryInput } from '@/packages/schemas'

export default function MemberSalaryPage() {
	const params = useParams()
	const router = useRouter()
	const { user } = useAuth()
	const { showToast } = useToast()
	const teamId = params.teamId as string
	const memberId = params.memberId as string

	// Загрузка данных команды
	const { data, loading, error } = useQuery(MyTeamsDocument)

	const team = data?.myTeams?.find((t) => t.id === teamId)
	const isOwner = team?.ownerId === user?.id

	// TODO: Implement TeamMembersDocument query to get actual member data
	// For now using mock data for demonstration
	const member = {
		id: memberId,
		userId: 'mock-user-id',
		role: 'MEMBER',
		salaryType: 'NONE' as const,
		salaryAmount: null,
		user: {
			id: 'mock-user-id',
			fullName: 'Участник команды',
			email: 'member@example.com'
		}
	}

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
			refetchQueries: [{ query: MyTeamsDocument }],
		}
	)

	const handleSubmit = async (data: UpdateMemberSalaryInput) => {
		await updateSalary({
			variables: {
				input: {
					memberId: data.memberId,
					salaryType: data.salaryType,
					salaryAmount: data.salaryAmount || null,
				},
			},
		})
	}

	const handleBack = () => {
		router.back()
	}

	if (loading) {
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
			</motion.div>
		</div>
	)
}
