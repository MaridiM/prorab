'use client'

import { useState } from 'react'
import { useMutation, useQuery } from '@apollo/client/react'
import { motion } from 'framer-motion'
import {
	Shield,
	ShieldCheck,
	ShieldAlert,
	Key,
	Download,
	RefreshCw,
	AlertCircle,
	Check,
	Copy,
	X,
	Smartphone,
	QrCode,
	Loader2,
} from 'lucide-react'
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
	Button,
	Input,
	Badge,
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
import {
	TwoFactorStatusDocument,
	Generate2FaSecretDocument,
	Enable2FaDocument,
	Disable2FaDocument,
	Regenerate2FaBackupCodesDocument,
} from '@/packages/api/graphql/__generated__/output'

interface TwoFactorAuthProps {
	className?: string
}

export function TwoFactorAuth({ className }: TwoFactorAuthProps) {
	const { success: toastSuccess, error: toastError } = useToast()
	const [setupStep, setSetupStep] = useState<'idle' | 'qr' | 'verify' | 'backup'>('idle')
	const [verificationCode, setVerificationCode] = useState('')
	const [disableCode, setDisableCode] = useState('')
	const [regenerateCode, setRegenerateCode] = useState('')
	const [qrData, setQrData] = useState<{
		secret: string
		qrCodeUrl: string
		manualEntryCode: string
	} | null>(null)
	const [backupCodes, setBackupCodes] = useState<string[]>([])
	const [showDisableDialog, setShowDisableDialog] = useState(false)
	const [showRegenerateDialog, setShowRegenerateDialog] = useState(false)
	const [copiedCode, setCopiedCode] = useState<string | null>(null)

	const { data, loading, refetch } = useQuery(TwoFactorStatusDocument)

	const [generateSecret, { loading: generating }] = useMutation(Generate2FaSecretDocument, {
		onCompleted: (data) => {
			setQrData(data.generate2FASecret)
			setSetupStep('qr')
		},
		onError: (error) => {
			toastError(error.message || 'Ошибка генерации секрета')
		},
	})

	const [enable2FA, { loading: enabling }] = useMutation(Enable2FaDocument, {
		onCompleted: (data) => {
			setBackupCodes(data.enable2FA.backupCodes)
			setSetupStep('backup')
			refetch()
			toastSuccess('Двухфакторная аутентификация включена. Сохраните резервные коды в безопасном месте')
		},
		onError: (error) => {
			toastError(error.message || 'Неверный код подтверждения')
		},
	})

	const [disable2FA, { loading: disabling }] = useMutation(Disable2FaDocument, {
		onCompleted: () => {
			setShowDisableDialog(false)
			setDisableCode('')
			refetch()
			toastSuccess('Двухфакторная аутентификация отключена. Вы можете включить её снова в любое время')
		},
		onError: (error) => {
			toastError(error.message || 'Неверный код подтверждения')
		},
	})

	const [regenerateBackupCodes, { loading: regenerating }] = useMutation(
		Regenerate2FaBackupCodesDocument,
		{
			onCompleted: (data) => {
				setBackupCodes(data.regenerate2FABackupCodes.backupCodes)
				setShowRegenerateDialog(false)
				setRegenerateCode('')
				refetch()
				toastSuccess('Резервные коды обновлены. Сохраните новые коды в безопасном месте')
			},
			onError: (error) => {
				toastError(error.message || 'Ошибка обновления кодов')
			},
		},
	)

	const handleStartSetup = async () => {
		await generateSecret()
	}

	const handleVerify = async () => {
		if (!qrData || verificationCode.length !== 6) {
			toastError('Введите 6-значный код')
			return
		}

		await enable2FA({
			variables: {
				input: {
					secret: qrData.secret,
					token: verificationCode,
				},
			},
		})
	}

	const handleDisable = async () => {
		if (disableCode.length !== 6) {
			toastError('Введите 6-значный код')
			return
		}

		await disable2FA({
			variables: {
				input: { token: disableCode },
			},
		})
	}

	const handleRegenerate = async () => {
		if (regenerateCode.length !== 6) {
			toastError('Введите 6-значный код')
			return
		}

		await regenerateBackupCodes({
			variables: {
				input: { token: regenerateCode },
			},
		})
	}

	const handleCopyCode = (code: string) => {
		navigator.clipboard.writeText(code)
		setCopiedCode(code)
		setTimeout(() => setCopiedCode(null), 2000)
		toastSuccess('Код скопирован в буфер обмена')
	}

	const handleDownloadCodes = () => {
		const content = `Prorab - Резервные коды двухфакторной аутентификации\n\nДата: ${new Date().toLocaleDateString('ru-RU')}\n\n${backupCodes.join('\n')}\n\nСохраните эти коды в безопасном месте. Каждый код можно использовать только один раз.`
		const blob = new Blob([content], { type: 'text/plain' })
		const url = URL.createObjectURL(blob)
		const a = document.createElement('a')
		a.href = url
		a.download = `prorab-backup-codes-${Date.now()}.txt`
		a.click()
		URL.revokeObjectURL(url)
	}

	const handleFinishSetup = () => {
		setSetupStep('idle')
		setQrData(null)
		setVerificationCode('')
		setBackupCodes([])
	}

	const handleCancelSetup = () => {
		setSetupStep('idle')
		setQrData(null)
		setVerificationCode('')
		setBackupCodes([])
	}

	if (loading) {
		return (
			<Card className={className}>
				<CardHeader>
					<div className="flex items-center justify-center py-8">
						<Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
					</div>
				</CardHeader>
			</Card>
		)
	}

	const is2FAEnabled = data?.twoFactorStatus?.enabled
	const backupCodesRemaining = data?.twoFactorStatus?.backupCodesRemaining || 0

	// Setup Flow
	if (setupStep !== 'idle') {
		return (
			<Card className={className}>
				<CardHeader>
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-3">
							<div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
								<ShieldCheck className="w-5 h-5 text-primary" />
							</div>
							<div>
								<CardTitle>Настройка двухфакторной аутентификации</CardTitle>
								<CardDescription>
									{setupStep === 'qr' && 'Сканируйте QR-код в приложении'}
									{setupStep === 'verify' && 'Введите код подтверждения'}
									{setupStep === 'backup' && 'Сохраните резервные коды'}
								</CardDescription>
							</div>
						</div>
						{setupStep !== 'backup' && (
							<Button variant="ghost" size="icon" onClick={handleCancelSetup}>
								<X className="w-4 h-4" />
							</Button>
						)}
					</div>
				</CardHeader>

				<CardContent className="space-y-6">
					{setupStep === 'qr' && qrData && (
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							className="space-y-6"
						>
							<div className="p-6 rounded-2xl border bg-card/50 text-center space-y-4">
								<div className="flex justify-center">
									<div className="p-4 bg-white rounded-xl">
										<QrCode className="w-48 h-48 text-gray-800" />
										<p className="text-xs text-muted-foreground mt-2">{qrData.qrCodeUrl}</p>
									</div>
								</div>

								<div className="space-y-2">
									<p className="text-sm font-medium">Или введите код вручную:</p>
									<div className="flex items-center gap-2 justify-center">
										<code className="px-3 py-2 rounded-lg bg-muted font-mono text-sm">
											{qrData.manualEntryCode}
										</code>
										<Button
											variant="ghost"
											size="icon"
											onClick={() => handleCopyCode(qrData.manualEntryCode)}
										>
											{copiedCode === qrData.manualEntryCode ? (
												<Check className="w-4 h-4 text-green-600" />
											) : (
												<Copy className="w-4 h-4" />
											)}
										</Button>
									</div>
								</div>
							</div>

							<div className="space-y-3">
								<div className="flex items-start gap-3 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
									<Smartphone className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
									<div className="space-y-1 text-sm">
										<p className="font-medium text-blue-900 dark:text-blue-100">
											Рекомендуемые приложения:
										</p>
										<ul className="text-blue-800 dark:text-blue-200 space-y-1">
											<li>• Google Authenticator</li>
											<li>• Microsoft Authenticator</li>
											<li>• Authy</li>
										</ul>
									</div>
								</div>

								<Button onClick={() => setSetupStep('verify')} className="w-full rounded-xl">
									Продолжить
								</Button>
							</div>
						</motion.div>
					)}

					{setupStep === 'verify' && (
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							className="space-y-4"
						>
							<div className="space-y-2">
								<label className="text-sm font-medium">Код из приложения</label>
								<Input
									type="text"
									placeholder="000000"
									value={verificationCode}
									onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
									maxLength={6}
									className="text-center text-2xl tracking-widest font-mono"
								/>
								<p className="text-xs text-muted-foreground">
									Введите 6-значный код из вашего приложения аутентификации
								</p>
							</div>

							<Button
								onClick={handleVerify}
								disabled={enabling || verificationCode.length !== 6}
								className="w-full rounded-xl"
							>
								{enabling ? (
									<>
										<Loader2 className="w-4 h-4 mr-2 animate-spin" />
										Проверка...
									</>
								) : (
									'Подтвердить и включить'
								)}
							</Button>
						</motion.div>
					)}

					{setupStep === 'backup' && backupCodes.length > 0 && (
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							className="space-y-4"
						>
							<div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
								<div className="flex items-start gap-3">
									<AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
									<div className="space-y-1 text-sm">
										<p className="font-medium text-amber-900 dark:text-amber-100">
											Важно! Сохраните эти коды
										</p>
										<p className="text-amber-800 dark:text-amber-200">
											Каждый код можно использовать только один раз для входа, если у вас нет доступа к
											приложению аутентификации.
										</p>
									</div>
								</div>
							</div>

							<div className="grid grid-cols-2 gap-2 p-4 rounded-xl bg-muted/50">
								{backupCodes.map((code) => (
									<div
										key={code}
										className="flex items-center justify-between p-2 rounded-lg bg-background"
									>
										<code className="font-mono text-sm">{code}</code>
										<Button
											variant="ghost"
											size="icon"
											className="h-8 w-8"
											onClick={() => handleCopyCode(code)}
										>
											{copiedCode === code ? (
												<Check className="w-3 h-3 text-green-600" />
											) : (
												<Copy className="w-3 h-3" />
											)}
										</Button>
									</div>
								))}
							</div>

							<div className="flex gap-2">
								<Button onClick={handleDownloadCodes} variant="outline" className="flex-1 rounded-xl">
									<Download className="w-4 h-4 mr-2" />
									Скачать коды
								</Button>
								<Button onClick={handleFinishSetup} className="flex-1 rounded-xl">
									Готово
								</Button>
							</div>
						</motion.div>
					)}
				</CardContent>
			</Card>
		)
	}

	// Main View
	return (
		<>
			<Card className={className}>
				<CardHeader>
					<div className="flex items-center gap-3">
						<div
							className={`w-10 h-10 rounded-xl flex items-center justify-center ${
								is2FAEnabled ? 'bg-green-500/10' : 'bg-muted'
							}`}
						>
							{is2FAEnabled ? (
								<ShieldCheck className="w-5 h-5 text-green-600" />
							) : (
								<Shield className="w-5 h-5 text-muted-foreground" />
							)}
						</div>
						<div className="flex-1">
							<div className="flex items-center gap-2">
								<CardTitle>Двухфакторная аутентификация</CardTitle>
								{is2FAEnabled && (
									<Badge variant="success" className="flex items-center gap-1">
										<Check className="w-3 h-3" />
										Включена
									</Badge>
								)}
							</div>
							<CardDescription>
								{is2FAEnabled
									? 'Дополнительный уровень защиты вашего аккаунта'
									: 'Повысьте безопасность вашего аккаунта'}
							</CardDescription>
						</div>
					</div>
				</CardHeader>

				<CardContent className="space-y-4">
					{is2FAEnabled ? (
						<>
							<div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20">
								<div className="flex items-start gap-3">
									<ShieldCheck className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
									<div className="space-y-1 text-sm">
										<p className="font-medium text-green-900 dark:text-green-100">
											Аккаунт защищён двухфакторной аутентификацией
										</p>
										<p className="text-green-800 dark:text-green-200">
											При входе потребуется код из приложения аутентификации
										</p>
									</div>
								</div>
							</div>

							<div className="flex items-center justify-between p-4 rounded-xl bg-muted/50">
								<div className="flex items-center gap-3">
									<Key className="w-5 h-5 text-muted-foreground" />
									<div>
										<p className="font-medium">Резервные коды</p>
										<p className="text-sm text-muted-foreground">
											Осталось кодов: {backupCodesRemaining}
										</p>
									</div>
								</div>
								<Button
									variant="outline"
									size="sm"
									onClick={() => setShowRegenerateDialog(true)}
									className="rounded-xl"
								>
									<RefreshCw className="w-4 h-4 mr-2" />
									Обновить
								</Button>
							</div>

							<Button
								variant="default"
								onClick={() => setShowDisableDialog(true)}
								className="w-full rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90"
							>
								<ShieldAlert className="w-4 h-4 mr-2" />
								Отключить двухфакторную аутентификацию
							</Button>
						</>
					) : (
						<>
							<div className="space-y-3">
								<p className="text-sm text-muted-foreground">
									Защитите свой аккаунт с помощью приложения аутентификации. При входе потребуется код
									из приложения в дополнение к паролю.
								</p>

								<ul className="space-y-2 text-sm">
									{[
										'Дополнительный уровень безопасности',
										'Защита от несанкционированного доступа',
										'Резервные коды для восстановления доступа',
									].map((item) => (
										<li key={item} className="flex items-start gap-2">
											<Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
											<span>{item}</span>
										</li>
									))}
								</ul>
							</div>

							<Button onClick={handleStartSetup} disabled={generating} className="w-full rounded-xl">
								{generating ? (
									<>
										<Loader2 className="w-4 h-4 mr-2 animate-spin" />
										Подготовка...
									</>
								) : (
									<>
										<ShieldCheck className="w-4 h-4 mr-2" />
										Включить двухфакторную аутентификацию
									</>
								)}
							</Button>
						</>
					)}
				</CardContent>
			</Card>

			{/* Disable 2FA Dialog */}
			<AlertDialog open={showDisableDialog} onOpenChange={setShowDisableDialog}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Отключить двухфакторную аутентификацию?</AlertDialogTitle>
						<AlertDialogDescription className="space-y-4">
							<p>
								Это снизит уровень безопасности вашего аккаунта. Для подтверждения введите код из
								приложения аутентификации.
							</p>
							<Input
								type="text"
								placeholder="000000"
								value={disableCode}
								onChange={(e) => setDisableCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
								maxLength={6}
								className="text-center text-lg tracking-widest font-mono"
							/>
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel onClick={() => setDisableCode('')}>Отмена</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleDisable}
							disabled={disabling || disableCode.length !== 6}
							className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
						>
							{disabling ? (
								<>
									<Loader2 className="w-4 h-4 mr-2 animate-spin" />
									Отключение...
								</>
							) : (
								'Отключить'
							)}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>

			{/* Regenerate Backup Codes Dialog */}
			<AlertDialog open={showRegenerateDialog} onOpenChange={setShowRegenerateDialog}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Обновить резервные коды?</AlertDialogTitle>
						<AlertDialogDescription className="space-y-4">
							<p>
								Все текущие резервные коды будут аннулированы. Для подтверждения введите код из
								приложения аутентификации.
							</p>
							<Input
								type="text"
								placeholder="000000"
								value={regenerateCode}
								onChange={(e) => setRegenerateCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
								maxLength={6}
								className="text-center text-lg tracking-widest font-mono"
							/>
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel onClick={() => setRegenerateCode('')}>Отмена</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleRegenerate}
							disabled={regenerating || regenerateCode.length !== 6}
						>
							{regenerating ? (
								<>
									<Loader2 className="w-4 h-4 mr-2 animate-spin" />
									Обновление...
								</>
							) : (
								'Обновить коды'
							)}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	)
}
