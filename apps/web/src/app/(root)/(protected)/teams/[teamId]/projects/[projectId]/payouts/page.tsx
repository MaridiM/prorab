'use client'

import { useParams, useRouter } from 'next/navigation'
import { useQuery, useMutation } from '@apollo/client/react'
import { motion } from 'framer-motion'
import { ArrowLeft, Loader2 } from 'lucide-react'

import {
	PayoutSummaryDocument,
	CloseProjectDocument,
	ProjectsByTeamDocument,
} from '@/packages/api/graphql'
import { Button, Card } from '@/packages/components'
import { PayoutCalculator } from '@/packages/components/payouts'
import { useToast } from '@/packages/hooks'

export default function ProjectPayoutsPage() {
	const params = useParams()
	const router = useRouter()
	const { showToast } = useToast()
	const teamId = params.teamId as string
	const projectId = params.projectId as string

	// Загрузка данных о выплатах
	const { data, loading, error } = useQuery(PayoutSummaryDocument, {
		variables: { projectId },
	})

	// Мутация для закрытия проекта
	const [closeProject, { loading: closing }] = useMutation(CloseProjectDocument, {
		onCompleted: (data) => {
			showToast({
				message: 'Проект закрыт! Расчёты зафиксированы, проект переведён в архив',
				type: 'success',
			})
			// Перенаправляем на дашборд
			router.push('/dashboard')
		},
		onError: (error) => {
			showToast({
				message: error.message || 'Не удалось закрыть проект',
				type: 'error',
			})
		},
		refetchQueries: [
			{ query: ProjectsByTeamDocument, variables: { teamId } },
		],
	})

	const handleClose = async (projectId: string) => {
		await closeProject({
			variables: { projectId },
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

	if (error || !data?.payoutSummary) {
		return (
			<div className="container max-w-2xl mx-auto p-6">
				<Card className="p-8 text-center">
					<p className="text-destructive">Ошибка загрузки данных</p>
					<p className="text-sm text-muted-foreground mt-2">
						{error?.message || 'Не удалось загрузить расчёт выплат'}
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
					Назад к проекту
				</Button>

				{/* Calculator */}
				<Card className="p-6">
					<PayoutCalculator
						summary={data.payoutSummary as any}
						onClose={handleClose}
						isLoading={closing}
					/>
				</Card>
			</motion.div>
		</div>
	)
}
