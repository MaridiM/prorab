'use client'

import { useState } from 'react'
import { useMutation } from '@apollo/client'
import { gql } from '@apollo/client'
import { Send, Unlink, CheckCircle2, ExternalLink, Loader2 } from 'lucide-react'

import { Button } from '../ui/button'
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '../ui/card'
import { Badge } from '../ui/badge'
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from '../ui/alert-dialog'
import { useToast } from '../ui/use-toast'

const DISCONNECT_TELEGRAM = gql`
	mutation DisconnectTelegram {
		disconnectTelegram {
			id
			telegramChatId
			telegramUsername
			telegramPhotoUrl
		}
	}
`

interface TelegramIntegrationProps {
	user: {
		id: string
		telegramChatId?: string | null
		telegramUsername?: string | null
		telegramPhotoUrl?: string | null
	}
	onDisconnect?: () => void
}

export function TelegramIntegration({ user, onDisconnect }: TelegramIntegrationProps) {
	const [showDisconnectDialog, setShowDisconnectDialog] = useState(false)
	const { toast } = useToast()

	const [disconnectTelegram, { loading: disconnecting }] = useMutation(DISCONNECT_TELEGRAM, {
		onCompleted: () => {
			toast({
				title: 'Успех!',
				description: 'Telegram отключён от аккаунта',
			})
			setShowDisconnectDialog(false)
			onDisconnect?.()
		},
		onError: (error) => {
			toast({
				title: 'Ошибка',
				description: error.message || 'Не удалось отключить Telegram',
				variant: 'destructive',
			})
		},
		refetchQueries: ['Me'],
	})

	const handleConnect = () => {
		// Open Telegram bot in new window
		const botUsername = 'ProRabSpaceBot'
		const telegramUrl = `https://t.me/${botUsername}?start=connect`
		window.open(telegramUrl, '_blank')

		toast({
			title: 'Подключение к Telegram',
			description: 'Откройте бота и нажмите /start для подключения',
		})
	}

	const handleDisconnect = async () => {
		try {
			await disconnectTelegram()
		} catch (error) {
			console.error('Error disconnecting Telegram:', error)
		}
	}

	const isConnected = !!user.telegramChatId

	return (
		<Card>
			<CardHeader>
				<div className="flex items-start justify-between">
					<div>
						<CardTitle className="flex items-center gap-2">
							<Send className="w-5 h-5 text-[#0088cc]" />
							Telegram Integration
						</CardTitle>
						<CardDescription>
							Получайте уведомления и управляйте проектами через Telegram
						</CardDescription>
					</div>
					{isConnected && (
						<Badge variant="success" className="flex items-center gap-1">
							<CheckCircle2 className="w-3 h-3" />
							Подключено
						</Badge>
					)}
				</div>
			</CardHeader>

			<CardContent className="space-y-4">
				{isConnected ? (
					<>
						{/* Connected State */}
						<div className="flex items-center gap-4 p-4 rounded-lg border border-border/50 bg-muted/30">
							{user.telegramPhotoUrl && (
								<img
									src={user.telegramPhotoUrl}
									alt="Telegram Avatar"
									className="w-12 h-12 rounded-full"
								/>
							)}
							<div className="flex-1">
								<p className="font-medium">
									@{user.telegramUsername || 'Пользователь'}
								</p>
								<p className="text-sm text-muted-foreground">
									Telegram подключён к вашему аккаунту
								</p>
							</div>
						</div>

						<div className="flex flex-col sm:flex-row gap-3">
							<Button
								variant="outline"
								className="flex-1"
								onClick={() => window.open('https://t.me/ProRabSpaceBot', '_blank')}
							>
								<Send className="w-4 h-4 mr-2" />
								Открыть бота
								<ExternalLink className="w-3 h-3 ml-2" />
							</Button>

							<AlertDialog open={showDisconnectDialog} onOpenChange={setShowDisconnectDialog}>
								<AlertDialogTrigger asChild>
									<Button
										variant="outline"
										className="flex-1 text-destructive hover:text-destructive hover:bg-destructive/10"
									>
										<Unlink className="w-4 h-4 mr-2" />
										Отключить
									</Button>
								</AlertDialogTrigger>
								<AlertDialogContent>
									<AlertDialogHeader>
										<AlertDialogTitle>Отключить Telegram?</AlertDialogTitle>
										<AlertDialogDescription>
											Вы больше не будете получать уведомления через Telegram.
											Вы всегда сможете подключить бота заново.
										</AlertDialogDescription>
									</AlertDialogHeader>
									<AlertDialogFooter>
										<AlertDialogCancel>Отмена</AlertDialogCancel>
										<AlertDialogAction
											onClick={handleDisconnect}
											disabled={disconnecting}
											className="bg-destructive hover:bg-destructive/90"
										>
											{disconnecting ? (
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
						</div>
					</>
				) : (
					<>
						{/* Disconnected State */}
						<div className="space-y-4">
							<div className="p-4 rounded-lg border border-border/50 bg-muted/30">
								<h4 className="font-medium mb-2">Возможности Telegram бота:</h4>
								<ul className="space-y-2 text-sm text-muted-foreground">
									<li className="flex items-start gap-2">
										<CheckCircle2 className="w-4 h-4 mt-0.5 text-primary" />
										<span>Уведомления о новых проектах и задачах</span>
									</li>
									<li className="flex items-start gap-2">
										<CheckCircle2 className="w-4 h-4 mt-0.5 text-primary" />
										<span>Управление проектами через чат</span>
									</li>
									<li className="flex items-start gap-2">
										<CheckCircle2 className="w-4 h-4 mt-0.5 text-primary" />
										<span>Быстрый доступ к финансовой информации</span>
									</li>
									<li className="flex items-start gap-2">
										<CheckCircle2 className="w-4 h-4 mt-0.5 text-primary" />
										<span>Техническая поддержка 24/7</span>
									</li>
								</ul>
							</div>

							<Button onClick={handleConnect} className="w-full" size="lg">
								<Send className="w-4 h-4 mr-2" />
								Подключить Telegram
								<ExternalLink className="w-3 h-3 ml-2" />
							</Button>

							<p className="text-xs text-center text-muted-foreground">
								После нажатия откроется бот @ProRabSpaceBot.
								<br />
								Нажмите /start для завершения подключения.
							</p>
						</div>
					</>
				)}
			</CardContent>
		</Card>
	)
}
