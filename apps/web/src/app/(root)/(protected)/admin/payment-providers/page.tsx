'use client'

import { useState } from 'react'
import { useQuery, useMutation } from '@apollo/client/react'
import { Card } from '@/packages/components/ui/card'
import { Button } from '@/packages/components/ui/button'
import { Input } from '@/packages/components/ui/input'
import { Label } from '@/packages/components/ui/label'
import { AdminPageSkeleton } from '@/packages/components/ui/admin-page-skeleton'
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/packages/components/ui/table'
import { Badge } from '@/packages/components/ui/badge'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/packages/components/ui/dropdown-menu'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/packages/components/ui/dialog'
import { Switch } from '@/packages/components/ui/switch'
import { MoreVertical, Settings, CheckCircle, XCircle, TestTube, RefreshCcw, Star, Copy, Loader2 } from 'lucide-react'
import {
	GetAdminPaymentProvidersDocument,
	UpdateAdminPaymentProviderDocument,
	TestPaymentProviderDocument,
	ClearProviderCacheDocument,
	PaymentProviderType,
} from '@/packages/api/graphql/__generated__/output'
import { useToast } from '@/packages/hooks/use-toast'

interface ConfigFormData {
	shopId: string
	secretKey: string
	webhookSecret: string
	publishableKey: string
	isActive: boolean
	isPrimary: boolean
}

export default function AdminPaymentProvidersPage() {
	const { toast } = useToast()
	const [configDialog, setConfigDialog] = useState<{ open: boolean; provider: any | null }>({
		open: false,
		provider: null,
	})
	const [formData, setFormData] = useState<ConfigFormData>({
		shopId: '',
		secretKey: '',
		webhookSecret: '',
		publishableKey: '',
		isActive: true,
		isPrimary: false,
	})
	const [saving, setSaving] = useState(false)
	const [testing, setTesting] = useState<string | null>(null)

	const { data, loading, refetch } = useQuery(GetAdminPaymentProvidersDocument, {
		variables: {
			baseUrl: typeof window !== 'undefined' ? window.location.origin : null,
		},
	})

	const [updateProvider] = useMutation(UpdateAdminPaymentProviderDocument)
	const [testProvider] = useMutation(TestPaymentProviderDocument)
	const [clearCache] = useMutation(ClearProviderCacheDocument)

	const providers = data?.adminPaymentProviders || []

	if (loading && !data) {
		return <AdminPageSkeleton />
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
		const hasRequired = configStatus?.hasSecretKey

		if (hasRequired) {
			return <Badge className="bg-blue-500">Configured</Badge>
		}
		return <Badge variant="destructive">Not Configured</Badge>
	}

	const openConfigDialog = (provider: any) => {
		setFormData({
			shopId: '',
			secretKey: '',
			webhookSecret: '',
			publishableKey: '',
			isActive: provider.isActive,
			isPrimary: provider.isPrimary,
		})
		setConfigDialog({ open: true, provider })
	}

	const handleSaveConfig = async () => {
		if (!configDialog.provider) return

		setSaving(true)
		try {
			// Build config object with credentials
			const config: any = {}
			if (formData.shopId) config.shopId = formData.shopId
			if (formData.secretKey) config.secretKey = formData.secretKey
			if (formData.webhookSecret) config.webhookSecret = formData.webhookSecret
			if (formData.publishableKey) config.publishableKey = formData.publishableKey

			const input = {
				isActive: formData.isActive,
				isPrimary: formData.isPrimary,
				config: Object.keys(config).length > 0 ? config : null,
			}

			await updateProvider({
				variables: {
					type: configDialog.provider.type as PaymentProviderType,
					input,
				},
			})

			toast({
				title: 'Success',
				description: `${configDialog.provider.name} configuration updated`,
			})

			setConfigDialog({ open: false, provider: null })
			refetch()
		} catch (error: any) {
			toast({
				title: 'Error',
				description: error.message || 'Failed to update provider configuration',
				variant: 'destructive',
			})
		} finally {
			setSaving(false)
		}
	}

	const handleTestConnection = async (provider: any) => {
		setTesting(provider.type)
		try {
			const result = await testProvider({
				variables: { type: provider.type as PaymentProviderType },
			})

			if (result.data?.adminTestPaymentProvider?.success) {
				toast({
					title: 'Connection Successful',
					description: result.data.adminTestPaymentProvider.message || `${provider.name} is working correctly`,
				})
			} else {
				toast({
					title: 'Connection Failed',
					description: result.data?.adminTestPaymentProvider?.error || 'Failed to connect to provider',
					variant: 'destructive',
				})
			}
		} catch (error: any) {
			toast({
				title: 'Test Failed',
				description: error.message || 'Failed to test connection',
				variant: 'destructive',
			})
		} finally {
			setTesting(null)
		}
	}

	const handleClearCache = async (provider: any) => {
		try {
			await clearCache({
				variables: { type: provider.type as PaymentProviderType },
			})

			toast({
				title: 'Cache Cleared',
				description: `${provider.name} cache has been cleared`,
			})
		} catch (error: any) {
			toast({
				title: 'Error',
				description: error.message || 'Failed to clear cache',
				variant: 'destructive',
			})
		}
	}

	const handleSetPrimary = async (provider: any) => {
		try {
			await updateProvider({
				variables: {
					type: provider.type as PaymentProviderType,
					input: { isPrimary: true, isActive: null, config: null },
				},
			})

			toast({
				title: 'Primary Provider Set',
				description: `${provider.name} is now the primary provider`,
			})

			refetch()
		} catch (error: any) {
			toast({
				title: 'Error',
				description: error.message || 'Failed to set primary provider',
				variant: 'destructive',
			})
		}
	}

	const handleToggleActive = async (provider: any) => {
		try {
			await updateProvider({
				variables: {
					type: provider.type as PaymentProviderType,
					input: { isActive: !provider.isActive, isPrimary: null, config: null },
				},
			})

			toast({
				title: provider.isActive ? 'Provider Deactivated' : 'Provider Activated',
				description: `${provider.name} has been ${provider.isActive ? 'deactivated' : 'activated'}`,
			})

			refetch()
		} catch (error: any) {
			toast({
				title: 'Error',
				description: error.message || 'Failed to toggle provider status',
				variant: 'destructive',
			})
		}
	}

	const copyToClipboard = (text: string) => {
		navigator.clipboard.writeText(text)
		toast({
			title: 'Copied',
			description: 'Webhook URL copied to clipboard',
		})
	}

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex justify-between items-center">
				<div>
					<h1 className="text-3xl font-bold">Payment Providers</h1>
					<p className="text-muted-foreground mt-1">
						Manage payment gateway configurations and settings
					</p>
				</div>
			</div>

			{/* Stats Cards */}
			<div className="grid gap-4 md:grid-cols-3">
				<Card className="p-6">
					<div className="text-sm font-medium text-muted-foreground">Total Providers</div>
					<div className="text-2xl font-bold mt-2">{providers.length}</div>
				</Card>
				<Card className="p-6">
					<div className="text-sm font-medium text-muted-foreground">Active Providers</div>
					<div className="text-2xl font-bold mt-2">
						{providers.filter((p) => p.isActive).length}
					</div>
				</Card>
				<Card className="p-6">
					<div className="text-sm font-medium text-muted-foreground">Primary Provider</div>
					<div className="text-2xl font-bold mt-2">
						{providers.find((p) => p.isPrimary)?.name || 'None'}
					</div>
				</Card>
			</div>

			{/* Providers Table */}
			<Card>
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
													onClick={() => copyToClipboard(provider.webhookUrl || '')}
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
												<DropdownMenuItem onClick={() => openConfigDialog(provider)}>
													<Settings className="h-4 w-4 mr-2" />
													Configure
												</DropdownMenuItem>
												<DropdownMenuItem
													onClick={() => handleTestConnection(provider)}
													disabled={testing === provider.type}
												>
													{testing === provider.type ? (
														<Loader2 className="h-4 w-4 mr-2 animate-spin" />
													) : (
														<TestTube className="h-4 w-4 mr-2" />
													)}
													Test Connection
												</DropdownMenuItem>
												<DropdownMenuItem onClick={() => handleClearCache(provider)}>
													<RefreshCcw className="h-4 w-4 mr-2" />
													Clear Cache
												</DropdownMenuItem>
												<DropdownMenuSeparator />
												<DropdownMenuItem onClick={() => handleToggleActive(provider)}>
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
													<DropdownMenuItem onClick={() => handleSetPrimary(provider)}>
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
			</Card>

			{/* Information Card */}
			<Card className="p-6">
				<h3 className="font-semibold mb-2">About Payment Providers</h3>
				<div className="text-sm text-muted-foreground space-y-2">
					<p>
						Payment providers handle payment processing for subscriptions. You can configure multiple
						providers and switch between them.
					</p>
					<ul className="list-disc list-inside space-y-1">
						<li>
							<strong>Active:</strong> Provider is enabled and can process payments
						</li>
						<li>
							<strong>Primary:</strong> Default provider for new subscriptions
						</li>
						<li>
							<strong>Webhook URL:</strong> Used by the provider to send payment notifications
						</li>
					</ul>
				</div>
			</Card>

			{/* Configuration Dialog */}
			<Dialog open={configDialog.open} onOpenChange={(open) => setConfigDialog({ open, provider: open ? configDialog.provider : null })}>
				<DialogContent className="sm:max-w-[500px]">
					<DialogHeader>
						<DialogTitle>Configure {configDialog.provider?.name}</DialogTitle>
						<DialogDescription>
							Enter your {configDialog.provider?.name} API credentials. Leave fields empty to keep existing values.
						</DialogDescription>
					</DialogHeader>

					<div className="space-y-4 py-4">
						{/* Yookassa-specific fields */}
						{configDialog.provider?.type === 'YOOKASSA' && (
							<>
								<div className="space-y-2">
									<Label htmlFor="shopId">Shop ID</Label>
									<Input
										id="shopId"
										placeholder="Enter Shop ID"
										value={formData.shopId}
										onChange={(e) => setFormData({ ...formData, shopId: e.target.value })}
									/>
									<p className="text-xs text-muted-foreground">
										Your Yookassa Shop ID (found in Yookassa dashboard)
									</p>
								</div>

								<div className="space-y-2">
									<Label htmlFor="secretKey">Secret Key</Label>
									<Input
										id="secretKey"
										type="password"
										placeholder="Enter Secret Key"
										value={formData.secretKey}
										onChange={(e) => setFormData({ ...formData, secretKey: e.target.value })}
									/>
									<p className="text-xs text-muted-foreground">
										Your API Secret Key (will be encrypted)
									</p>
								</div>

								<div className="space-y-2">
									<Label htmlFor="webhookSecret">Webhook Secret</Label>
									<Input
										id="webhookSecret"
										type="password"
										placeholder="Enter Webhook Secret"
										value={formData.webhookSecret}
										onChange={(e) => setFormData({ ...formData, webhookSecret: e.target.value })}
									/>
									<p className="text-xs text-muted-foreground">
										Secret for webhook signature verification
									</p>
								</div>
							</>
						)}

						{/* Stripe-specific fields */}
						{configDialog.provider?.type === 'STRIPE' && (
							<>
								<div className="space-y-2">
									<Label htmlFor="secretKey">Secret Key</Label>
									<Input
										id="secretKey"
										type="password"
										placeholder="sk_live_..."
										value={formData.secretKey}
										onChange={(e) => setFormData({ ...formData, secretKey: e.target.value })}
									/>
									<p className="text-xs text-muted-foreground">
										Stripe Secret Key (starts with sk_live_ or sk_test_)
									</p>
								</div>

								<div className="space-y-2">
									<Label htmlFor="publishableKey">Publishable Key</Label>
									<Input
										id="publishableKey"
										placeholder="pk_live_..."
										value={formData.publishableKey}
										onChange={(e) => setFormData({ ...formData, publishableKey: e.target.value })}
									/>
									<p className="text-xs text-muted-foreground">
										Stripe Publishable Key (starts with pk_live_ or pk_test_)
									</p>
								</div>

								<div className="space-y-2">
									<Label htmlFor="webhookSecret">Webhook Secret</Label>
									<Input
										id="webhookSecret"
										type="password"
										placeholder="whsec_..."
										value={formData.webhookSecret}
										onChange={(e) => setFormData({ ...formData, webhookSecret: e.target.value })}
									/>
									<p className="text-xs text-muted-foreground">
										Stripe Webhook Signing Secret (starts with whsec_)
									</p>
								</div>
							</>
						)}

						<div className="border-t pt-4 space-y-4">
							<div className="flex items-center justify-between">
								<div>
									<Label>Active</Label>
									<p className="text-xs text-muted-foreground">
										Enable this provider for payment processing
									</p>
								</div>
								<Switch
									checked={formData.isActive}
									onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
								/>
							</div>

							<div className="flex items-center justify-between">
								<div>
									<Label>Primary Provider</Label>
									<p className="text-xs text-muted-foreground">
										Use as default for new subscriptions
									</p>
								</div>
								<Switch
									checked={formData.isPrimary}
									onCheckedChange={(checked) => setFormData({ ...formData, isPrimary: checked })}
								/>
							</div>
						</div>
					</div>

					<DialogFooter>
						<Button variant="outline" onClick={() => setConfigDialog({ open: false, provider: null })}>
							Cancel
						</Button>
						<Button onClick={handleSaveConfig} disabled={saving}>
							{saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
							Save Configuration
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	)
}
