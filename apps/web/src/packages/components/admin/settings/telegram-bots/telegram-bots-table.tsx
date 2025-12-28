'use client'

import { Button } from '@/packages/components/ui/button'
import { Badge } from '@/packages/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/packages/components/ui/avatar'
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/packages/components/ui/table'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/packages/components/ui/dropdown-menu'
import {
	MoreVertical,
	Settings,
	CheckCircle,
	XCircle,
	RefreshCw,
	RotateCw,
	Star,
	Copy,
	Loader2,
	Trash2,
	Bot,
} from 'lucide-react'
import { useToast } from '@/packages/hooks/use-toast'
import { formatDistanceToNow } from 'date-fns'

interface TelegramBot {
	id: string
	botName: string
	username: string
	displayName: string
	description?: string | null
	isActive: boolean
	isPrimary: boolean
	webhookUrl?: string | null
	avatarUrl?: string | null
	firstName?: string | null
	configStatus?: {
		hasToken: boolean
		hasWebhook: boolean
		isRegistered: boolean
	} | null
	lastSyncAt?: string | null
	createdAt: string
	updatedAt: string
}

interface TelegramBotsTableProps {
	bots: TelegramBot[]
	onConfigure: (bot: TelegramBot) => void
	onSync: (bot: TelegramBot) => void
	onReload: (bot: TelegramBot) => void
	onToggleActive: (bot: TelegramBot) => void
	onDelete: (bot: TelegramBot) => void
	syncing?: string | null
	reloading?: string | null
}

export function TelegramBotsTable({
	bots,
	onConfigure,
	onSync,
	onReload,
	onToggleActive,
	onDelete,
	syncing,
	reloading,
}: TelegramBotsTableProps) {
	const { toast } = useToast()

	const handleCopyWebhook = (url: string) => {
		navigator.clipboard.writeText(url)
		toast({
			title: 'Copied',
			description: 'Webhook URL copied to clipboard',
		})
	}

	const getStatusBadge = (isActive: boolean) => {
		if (isActive) {
			return (
				<Badge className="bg-green-500">
					<CheckCircle className="h-3 w-3 mr-1" />
					Active
				</Badge>
			)
		}
		return (
			<Badge variant="secondary">
				<XCircle className="h-3 w-3 mr-1" />
				Inactive
			</Badge>
		)
	}

	const getConfigStatusBadge = (configStatus: any) => {
		if (!configStatus) {
			return <Badge variant="destructive">Unknown</Badge>
		}

		const { hasToken, hasWebhook, isRegistered } = configStatus

		if (hasToken && hasWebhook && isRegistered) {
			return <Badge className="bg-blue-500">Fully Configured</Badge>
		}

		if (hasToken && hasWebhook) {
			return <Badge className="bg-yellow-500">Webhook Set</Badge>
		}

		if (hasToken) {
			return <Badge className="bg-orange-500">Token Only</Badge>
		}

		return <Badge variant="destructive">Not Configured</Badge>
	}

	const formatLastSync = (lastSyncAt: string | null | undefined) => {
		if (!lastSyncAt) {
			return <span className="text-muted-foreground text-xs">Never</span>
		}

		return (
			<span className="text-muted-foreground text-xs">
				{formatDistanceToNow(new Date(lastSyncAt), { addSuffix: true })}
			</span>
		)
	}

	return (
		<Table>
			<TableHeader>
				<TableRow>
					<TableHead>Bot</TableHead>
					<TableHead>Username</TableHead>
					<TableHead>Description</TableHead>
					<TableHead>Status</TableHead>
					<TableHead>Configuration</TableHead>
					<TableHead>Primary</TableHead>
					<TableHead>Webhook URL</TableHead>
					<TableHead>Last Sync</TableHead>
					<TableHead className="w-[50px]"></TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{bots.length === 0 ? (
					<TableRow>
						<TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
							No Telegram bots found. Click "Add Telegram Bot" to create one.
						</TableCell>
					</TableRow>
				) : (
					bots.map((bot) => (
						<TableRow key={bot.id}>
							<TableCell>
								<div className="flex items-center gap-3">
									<Avatar className="h-10 w-10">
										<AvatarImage src={bot.avatarUrl || undefined} alt={bot.displayName} />
										<AvatarFallback>
											<Bot className="h-5 w-5" />
										</AvatarFallback>
									</Avatar>
									<div>
										<p className="font-medium">{bot.displayName}</p>
										<code className="text-xs text-muted-foreground">{bot.botName}</code>
									</div>
								</div>
							</TableCell>
							<TableCell>
								<code className="text-xs bg-muted px-2 py-1 rounded">@{bot.username}</code>
							</TableCell>
							<TableCell>
								<p className="text-sm max-w-[200px] truncate">
									{bot.description || (
										<span className="text-muted-foreground">No description</span>
									)}
								</p>
							</TableCell>
							<TableCell>{getStatusBadge(bot.isActive)}</TableCell>
							<TableCell>{getConfigStatusBadge(bot.configStatus)}</TableCell>
							<TableCell>
								{bot.isPrimary ? (
									<Badge variant="outline">
										<Star className="h-3 w-3 mr-1 fill-current" />
										Primary
									</Badge>
								) : (
									<span className="text-muted-foreground text-sm">—</span>
								)}
							</TableCell>
							<TableCell>
								{bot.webhookUrl ? (
									<div className="flex items-center gap-1">
										<code className="text-xs bg-muted px-2 py-1 rounded block max-w-[200px] truncate">
											{bot.webhookUrl}
										</code>
										<Button
											variant="ghost"
											size="sm"
											onClick={() => handleCopyWebhook(bot.webhookUrl || '')}
										>
											<Copy className="h-3 w-3" />
										</Button>
									</div>
								) : (
									<span className="text-muted-foreground text-sm">—</span>
								)}
							</TableCell>
							<TableCell>{formatLastSync(bot.lastSyncAt)}</TableCell>
							<TableCell>
								<DropdownMenu>
									<DropdownMenuTrigger asChild>
										<Button variant="ghost" size="sm">
											<MoreVertical className="h-4 w-4" />
										</Button>
									</DropdownMenuTrigger>
									<DropdownMenuContent align="end">
										<DropdownMenuLabel>Actions</DropdownMenuLabel>
										<DropdownMenuSeparator />
										<DropdownMenuItem onClick={() => onConfigure(bot)}>
											<Settings className="h-4 w-4 mr-2" />
											Configure
										</DropdownMenuItem>
										<DropdownMenuItem
											onClick={() => onSync(bot)}
											disabled={syncing === bot.id}
										>
											{syncing === bot.id ? (
												<Loader2 className="h-4 w-4 mr-2 animate-spin" />
											) : (
												<RefreshCw className="h-4 w-4 mr-2" />
											)}
											Sync from Telegram
										</DropdownMenuItem>
										<DropdownMenuItem
											onClick={() => onReload(bot)}
											disabled={reloading === bot.id || !bot.isActive}
										>
											{reloading === bot.id ? (
												<Loader2 className="h-4 w-4 mr-2 animate-spin" />
											) : (
												<RotateCw className="h-4 w-4 mr-2" />
											)}
											Reload Bot
										</DropdownMenuItem>
										<DropdownMenuSeparator />
										<DropdownMenuItem onClick={() => onToggleActive(bot)}>
											{bot.isActive ? (
												<>
													<XCircle className="h-4 w-4 mr-2" />
													Deactivate
												</>
											) : (
												<>
													<CheckCircle className="h-4 w-4 mr-2" />
													Activate
												</>
											)}
										</DropdownMenuItem>
										<DropdownMenuItem
											onClick={() => onDelete(bot)}
											className="text-destructive focus:text-destructive"
										>
											<Trash2 className="h-4 w-4 mr-2" />
											Delete Bot
										</DropdownMenuItem>
									</DropdownMenuContent>
								</DropdownMenu>
							</TableCell>
						</TableRow>
					))
				)}
			</TableBody>
		</Table>
	)
}
