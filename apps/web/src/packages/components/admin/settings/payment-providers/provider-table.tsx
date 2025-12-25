'use client'

import { Button } from '@/packages/components/ui/button'
import { Badge } from '@/packages/components/ui/badge'
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
	TestTube,
	RefreshCcw,
	Star,
	Copy,
	Loader2,
} from 'lucide-react'

interface PaymentProvider {
	id: string
	name: string
	type: string
	isActive: boolean
	isPrimary: boolean
	webhookUrl?: string | null
	configStatus?: {
		hasSecretKey?: boolean
	} | null
}

interface ProviderTableProps {
	providers: PaymentProvider[]
	onConfigure: (provider: PaymentProvider) => void
	onTest: (provider: PaymentProvider) => void
	onToggleActive: (provider: PaymentProvider) => void
	onSetPrimary: (provider: PaymentProvider) => void
	onClearCache: (provider: PaymentProvider) => void
	onCopyWebhook: (url: string) => void
	testingProviderId?: string | null
}

export function ProviderTable({
	providers,
	onConfigure,
	onTest,
	onToggleActive,
	onSetPrimary,
	onClearCache,
	onCopyWebhook,
	testingProviderId,
}: ProviderTableProps) {
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
		const hasRequired = configStatus?.hasSecretKey

		if (hasRequired) {
			return <Badge className="bg-blue-500">Configured</Badge>
		}
		return <Badge variant="destructive">Not Configured</Badge>
	}

	return (
		<Table>
			<TableHeader>
				<TableRow>
					<TableHead>Provider</TableHead>
					<TableHead>Type</TableHead>
					<TableHead>Status</TableHead>
					<TableHead>Configuration</TableHead>
					<TableHead>Primary</TableHead>
					<TableHead>Webhook URL</TableHead>
					<TableHead className="w-[50px]"></TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{providers.length === 0 ? (
					<TableRow>
						<TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
							No payment providers found
						</TableCell>
					</TableRow>
				) : (
					providers.map((provider) => (
						<TableRow key={provider.id}>
							<TableCell className="font-medium">{provider.name}</TableCell>
							<TableCell>
								<code className="text-xs bg-muted px-2 py-1 rounded">{provider.type}</code>
							</TableCell>
							<TableCell>{getStatusBadge(provider.isActive)}</TableCell>
							<TableCell>{getConfigStatusBadge(provider.configStatus)}</TableCell>
							<TableCell>
								{provider.isPrimary ? (
									<Badge variant="outline">
										<Star className="h-3 w-3 mr-1 fill-current" />
										Primary
									</Badge>
								) : (
									<span className="text-muted-foreground text-sm">—</span>
								)}
							</TableCell>
							<TableCell>
								{provider.webhookUrl ? (
									<div className="flex items-center gap-1">
										<code className="text-xs bg-muted px-2 py-1 rounded block max-w-[200px] truncate">
											{provider.webhookUrl}
										</code>
										<Button
											variant="ghost"
											size="sm"
											onClick={() => onCopyWebhook(provider.webhookUrl || '')}
										>
											<Copy className="h-3 w-3" />
										</Button>
									</div>
								) : (
									<span className="text-muted-foreground text-sm">—</span>
								)}
							</TableCell>
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
										<DropdownMenuItem onClick={() => onConfigure(provider)}>
											<Settings className="h-4 w-4 mr-2" />
											Configure
										</DropdownMenuItem>
										<DropdownMenuItem
											onClick={() => onTest(provider)}
											disabled={testingProviderId === provider.type}
										>
											{testingProviderId === provider.type ? (
												<Loader2 className="h-4 w-4 mr-2 animate-spin" />
											) : (
												<TestTube className="h-4 w-4 mr-2" />
											)}
											Test Connection
										</DropdownMenuItem>
										<DropdownMenuItem onClick={() => onClearCache(provider)}>
											<RefreshCcw className="h-4 w-4 mr-2" />
											Clear Cache
										</DropdownMenuItem>
										<DropdownMenuSeparator />
										<DropdownMenuItem onClick={() => onToggleActive(provider)}>
											{provider.isActive ? (
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
										{!provider.isPrimary && provider.isActive && (
											<DropdownMenuItem onClick={() => onSetPrimary(provider)}>
												<Star className="h-4 w-4 mr-2" />
												Set as Primary
											</DropdownMenuItem>
										)}
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
