'use client'

import { useState } from 'react'
import { useQuery, useMutation } from '@apollo/client/react'
import { Card } from '@/packages/components/ui/card'
import {
	GetAdminTelegramBotsDocument,
	AdminCreateTelegramBotDocument,
	AdminUpdateTelegramBotDocument,
	AdminDeleteTelegramBotDocument,
	AdminSyncTelegramBotDocument,
	AdminTestTelegramBotDocument,
	AdminReloadTelegramBotDocument,
	AdminSetTelegramWebhookDocument,
	AdminDeleteTelegramWebhookDocument,
} from '@/packages/api/graphql/__generated__/output'
import { useToast } from '@/packages/hooks/use-toast'
import { BotConfigDialog } from './bot-config-dialog'
import { TelegramBotsTable } from './telegram-bots-table'
import { Skeleton } from '@/packages/components/ui/skeleton'
import { AlertCircle, Plus, Bot } from 'lucide-react'
import { Button } from '@/packages/components/ui/button'

interface BotFormData {
	botName: string
	token: string
	displayName: string
	description?: string
	isActive: boolean
	isPrimary: boolean
	webhookUrl?: string
}

export function TelegramBotsPanel() {
	const { toast } = useToast()
	const [configDialog, setConfigDialog] = useState<{ open: boolean; bot: any | null }>({
		open: false,
		bot: null,
	})
	const [testing, setTesting] = useState<string | null>(null)
	const [syncing, setSyncing] = useState<string | null>(null)
	const [reloading, setReloading] = useState<string | null>(null)

	const { data, loading, error, refetch } = useQuery(GetAdminTelegramBotsDocument, {
		variables: {
			includeInactive: true,
		},
	})

	const [createBot, { loading: creating }] = useMutation(AdminCreateTelegramBotDocument)
	const [updateBot, { loading: updating }] = useMutation(AdminUpdateTelegramBotDocument)
	const [deleteBot] = useMutation(AdminDeleteTelegramBotDocument)
	const [syncBot] = useMutation(AdminSyncTelegramBotDocument)
	const [testBot] = useMutation(AdminTestTelegramBotDocument)
	const [reloadBot] = useMutation(AdminReloadTelegramBotDocument)
	const [setWebhook] = useMutation(AdminSetTelegramWebhookDocument)
	const [deleteWebhook] = useMutation(AdminDeleteTelegramWebhookDocument)

	const bots = data?.adminTelegramBots || []

	const handleAddBot = () => {
		setConfigDialog({ open: true, bot: null })
	}

	const handleConfigure = (bot: any) => {
		setConfigDialog({ open: true, bot })
	}

	const handleSaveConfig = async (formData: BotFormData) => {
		try {
			if (configDialog.bot) {
				// Update existing bot
				await updateBot({
					variables: {
						botId: configDialog.bot.id,
						input: {
							token: formData.token || null,
							displayName: formData.displayName,
							description: formData.description || null,
							isActive: formData.isActive,
							isPrimary: formData.isPrimary,
							webhookUrl: formData.webhookUrl || null,
						},
					},
				})

				toast({
					title: 'Success',
					description: `Bot ${formData.displayName} updated successfully`,
				})
			} else {
				// Create new bot
				await createBot({
					variables: {
						input: {
							botName: formData.botName,
							token: formData.token,
							displayName: formData.displayName,
							description: formData.description || null,
							isActive: formData.isActive,
							isPrimary: formData.isPrimary,
						},
					},
				})

				toast({
					title: 'Success',
					description: `Bot ${formData.displayName} created successfully`,
				})
			}

			setConfigDialog({ open: false, bot: null })
			refetch()
		} catch (error: any) {
			toast({
				title: 'Error',
				description: error.message || 'Failed to save bot configuration',
				variant: 'destructive',
			})
			throw error
		}
	}

	const handleTestToken = async (token: string) => {
		try {
			const result = await testBot({
				variables: {
					input: { token },
				},
			})

			if (result.data?.adminTestTelegramBot?.valid) {
				const botInfo = result.data.adminTestTelegramBot.botInfo
				toast({
					title: 'Token Valid',
					description: botInfo
						? `Connected to @${botInfo.username} (${botInfo.firstName})`
						: 'Token is valid',
				})
				return botInfo
			} else {
				toast({
					title: 'Invalid Token',
					description: result.data?.adminTestTelegramBot?.error || 'Failed to validate token',
					variant: 'destructive',
				})
				return null
			}
		} catch (error: any) {
			toast({
				title: 'Test Failed',
				description: error.message || 'Failed to test token',
				variant: 'destructive',
			})
			return null
		}
	}

	const handleSync = async (bot: any) => {
		setSyncing(bot.id)
		try {
			await syncBot({
				variables: { botId: bot.id },
			})

			toast({
				title: 'Bot Synced',
				description: `${bot.displayName} information updated from Telegram`,
			})

			refetch()
		} catch (error: any) {
			toast({
				title: 'Sync Failed',
				description: error.message || 'Failed to sync bot information',
				variant: 'destructive',
			})
		} finally {
			setSyncing(null)
		}
	}

	const handleReload = async (bot: any) => {
		setReloading(bot.id)
		try {
			await reloadBot({
				variables: { botId: bot.id },
			})

			toast({
				title: 'Bot Reloaded',
				description: `${bot.displayName} has been reloaded successfully`,
			})

			refetch()
		} catch (error: any) {
			toast({
				title: 'Reload Failed',
				description: error.message || 'Failed to reload bot',
				variant: 'destructive',
			})
		} finally {
			setReloading(null)
		}
	}

	const handleToggleActive = async (bot: any) => {
		try {
			await updateBot({
				variables: {
					botId: bot.id,
					input: {
						isActive: !bot.isActive,
					},
				},
			})

			toast({
				title: 'Success',
				description: `Bot ${bot.isActive ? 'deactivated' : 'activated'}`,
			})

			refetch()
		} catch (error: any) {
			toast({
				title: 'Error',
				description: error.message || 'Failed to toggle bot status',
				variant: 'destructive',
			})
		}
	}

	const handleDelete = async (bot: any) => {
		if (!confirm(`Are you sure you want to delete ${bot.displayName}? This action cannot be undone.`)) {
			return
		}

		try {
			await deleteBot({
				variables: { botId: bot.id },
			})

			toast({
				title: 'Bot Deleted',
				description: `${bot.displayName} has been removed`,
			})

			refetch()
		} catch (error: any) {
			toast({
				title: 'Delete Failed',
				description: error.message || 'Failed to delete bot',
				variant: 'destructive',
			})
		}
	}

	if (loading) {
		return (
			<div className="space-y-4">
				<Skeleton className="h-32 w-full" />
				<Skeleton className="h-96 w-full" />
			</div>
		)
	}

	if (error) {
		return (
			<Card className="p-6">
				<div className="flex items-center gap-2 text-destructive">
					<AlertCircle className="h-5 w-5" />
					<p>Failed to load Telegram bots: {error.message}</p>
				</div>
				<Button onClick={() => refetch()} variant="outline" className="mt-4">
					Retry
				</Button>
			</Card>
		)
	}

	const activeBots = bots.filter((b) => b.isActive).length
	const primaryBot = bots.find((b) => b.isPrimary)

	return (
		<div className="space-y-6">
			{/* Stats Cards */}
			<div className="grid gap-4 md:grid-cols-3">
				<Card className="p-4">
					<div className="flex items-center gap-3">
						<div className="rounded-full bg-primary/10 p-2">
							<Bot className="h-5 w-5 text-primary" />
						</div>
						<div>
							<p className="text-sm text-muted-foreground">Total Bots</p>
							<p className="text-2xl font-bold">{bots.length}</p>
						</div>
					</div>
				</Card>

				<Card className="p-4">
					<div className="flex items-center gap-3">
						<div className="rounded-full bg-green-500/10 p-2">
							<Bot className="h-5 w-5 text-green-500" />
						</div>
						<div>
							<p className="text-sm text-muted-foreground">Active Bots</p>
							<p className="text-2xl font-bold">{activeBots}</p>
						</div>
					</div>
				</Card>

				<Card className="p-4">
					<div className="flex items-center gap-3">
						<div className="rounded-full bg-blue-500/10 p-2">
							<Bot className="h-5 w-5 text-blue-500" />
						</div>
						<div>
							<p className="text-sm text-muted-foreground">Primary Bot</p>
							<p className="text-lg font-semibold truncate">
								{primaryBot ? primaryBot.displayName : 'None'}
							</p>
						</div>
					</div>
				</Card>
			</div>

			{/* Bots Table */}
			<Card>
				<TelegramBotsTable
					bots={bots}
					onConfigure={handleConfigure}
					onSync={handleSync}
					onReload={handleReload}
					onToggleActive={handleToggleActive}
					onDelete={handleDelete}
					syncing={syncing}
					reloading={reloading}
				/>
			</Card>

			{/* Add Bot Button */}
			<Button onClick={handleAddBot} className="w-full sm:w-auto">
				<Plus className="mr-2 h-4 w-4" />
				Add Telegram Bot
			</Button>

			{/* Config Dialog */}
			<BotConfigDialog
				bot={configDialog.bot}
				open={configDialog.open}
				onOpenChange={(open) => setConfigDialog({ open, bot: null })}
				onSave={handleSaveConfig}
				onTestToken={handleTestToken}
				saving={creating || updating}
			/>
		</div>
	)
}
