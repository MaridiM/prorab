'use client'

import { useState } from 'react'
import { useMutation } from '@apollo/client/react'
import { gql } from '@apollo/client'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { AlertTriangle, Trash2, Loader2 } from 'lucide-react'
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
	Button,
	Input,
	Label,
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from '@/packages/ui'
import { useToast } from '@/packages/hooks/use-toast'

const DELETE_ACCOUNT = gql`
	mutation DeleteAccount($input: DeleteAccountInput!) {
		deleteAccount(input: $input)
	}
`

interface DeleteAccountDialogProps {
	userEmail?: string
}

export function DeleteAccountDialog({ userEmail }: DeleteAccountDialogProps) {
	const router = useRouter()
	const { toast, success, error: showError } = useToast()
	const [password, setPassword] = useState('')
	const [confirmationOpen, setConfirmationOpen] = useState(false)
	const [finalConfirmOpen, setFinalConfirmOpen] = useState(false)

	const [deleteAccount, { loading }] = useMutation(DELETE_ACCOUNT, {
		onCompleted: () => {
			success('Аккаунт удалён и будет перенаправлен на главную страницу')
			// Redirect to home page after 2 seconds
			setTimeout(() => {
				router.push('/')
			}, 2000)
		},
		onError: (err) => {
			showError(err.message || 'Не удалось удалить аккаунт')
			setPassword('')
			setFinalConfirmOpen(false)
		},
	})

	const handleInitialConfirm = () => {
		setConfirmationOpen(false)
		setFinalConfirmOpen(true)
	}

	const handleFinalDelete = async () => {
		if (!password.trim()) {
			showError('Введите пароль для подтверждения удаления')
			return
		}

		await deleteAccount({
			variables: {
				input: {
					password,
				},
			},
		})
	}

	return (
		<>
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.3 }}
			>
				<Card className="border-destructive">
					<CardHeader>
						<div className="flex items-center gap-3">
							<div className="rounded-lg bg-destructive/10 p-2">
								<AlertTriangle className="h-5 w-5 text-destructive" />
							</div>
							<div>
								<CardTitle>Опасная зона</CardTitle>
								<CardDescription>
									Необратимые действия с вашим аккаунтом
								</CardDescription>
							</div>
						</div>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4">
							<div className="flex items-start gap-3">
								<AlertTriangle className="h-5 w-5 text-destructive mt-0.5 shrink-0" />
								<div className="space-y-2">
									<h4 className="font-medium text-destructive">Удаление аккаунта</h4>
									<p className="text-sm text-muted-foreground">
										Это действие необратимо. Все ваши данные будут безвозвратно удалены:
									</p>
									<ul className="text-sm text-muted-foreground space-y-1 ml-4 list-disc">
										<li>Профиль и персональная информация</li>
										<li>Все команды, где вы являетесь владельцем (без других участников)</li>
										<li>История активности и уведомления</li>
										<li>Настройки 2FA и привязки Telegram</li>
										<li>Активные подписки (будут автоматически отменены)</li>
									</ul>
									<p className="text-sm font-medium text-destructive mt-3">
										⚠️ Если у вас есть команды с участниками или проектами, сначала передайте право владения или удалите команды.
									</p>
								</div>
							</div>
						</div>

						<div className="flex justify-end">
							<Button
								variant="default"
								onClick={() => setConfirmationOpen(true)}
								className="gap-2 bg-destructive text-destructive-foreground hover:bg-destructive/90"
							>
								<Trash2 className="h-4 w-4" />
								Удалить аккаунт
							</Button>
						</div>
					</CardContent>
				</Card>
			</motion.div>

			{/* First confirmation dialog */}
			<AlertDialog open={confirmationOpen} onOpenChange={setConfirmationOpen}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle className="flex items-center gap-2">
							<AlertTriangle className="h-5 w-5 text-destructive" />
							Вы уверены?
						</AlertDialogTitle>
						<div className="text-sm text-muted-foreground space-y-3">
							<AlertDialogDescription>
								Вы собираетесь удалить свой аккаунт. Это действие нельзя будет отменить.
							</AlertDialogDescription>
							<AlertDialogDescription className="font-medium">
								Все ваши данные, команды и проекты будут безвозвратно удалены.
							</AlertDialogDescription>
							{userEmail && (
								<AlertDialogDescription className="text-sm">
									Аккаунт: <span className="font-mono">{userEmail}</span>
								</AlertDialogDescription>
							)}
						</div>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Отмена</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleInitialConfirm}
							className="bg-destructive hover:bg-destructive/90"
						>
							Продолжить
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>

			{/* Final confirmation dialog with password */}
			<AlertDialog open={finalConfirmOpen} onOpenChange={setFinalConfirmOpen}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle className="flex items-center gap-2">
							<AlertTriangle className="h-5 w-5 text-destructive" />
							Подтвердите удаление
						</AlertDialogTitle>
						<div className="text-sm text-muted-foreground space-y-4">
							<AlertDialogDescription className="font-medium text-destructive">
								Это последнее предупреждение!
							</AlertDialogDescription>
							<AlertDialogDescription>
								Для подтверждения удаления аккаунта введите свой пароль:
							</AlertDialogDescription>
							<div className="space-y-2">
								<Label htmlFor="delete-password">Пароль</Label>
								<Input
									id="delete-password"
									type="password"
									placeholder="Введите пароль"
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									disabled={loading}
									onKeyDown={(e) => {
										if (e.key === 'Enter' && !loading) {
											handleFinalDelete()
										}
									}}
								/>
							</div>
						</div>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel disabled={loading}>Отмена</AlertDialogCancel>
						<Button
							onClick={handleFinalDelete}
							disabled={loading || !password.trim()}
							className="bg-destructive hover:bg-destructive/90"
						>
							{loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
							Удалить аккаунт навсегда
						</Button>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	)
}
