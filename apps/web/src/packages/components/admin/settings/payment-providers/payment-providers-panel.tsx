'use client'

import { useState } from 'react'
import { useQuery, useMutation } from '@apollo/client/react'
import { Card } from '@/packages/components/ui/card'
import {
	GetAdminPaymentProvidersDocument,
	UpdateAdminPaymentProviderDocument,
	TestPaymentProviderDocument,
	ClearProviderCacheDocument,
	PaymentProviderType,
} from '@/packages/api/graphql/__generated__/output'
import { useToast } from '@/packages/hooks/use-toast'
import { ProviderTable } from './provider-table'
import { ProviderConfigDialog } from './provider-config-dialog'
import { Skeleton } from '@/packages/components/ui/skeleton'
import { AlertCircle } from 'lucide-react'
import { Button } from '@/packages/components/ui/button'

interface ConfigFormData {
	shopId: string
	secretKey: string
	webhookSecret: string
	publishableKey: string
	isActive: boolean
	isPrimary: boolean
}

export function PaymentProvidersPanel() {
	const { toast } = useToast()
	const [configDialog, setConfigDialog] = useState<{ open: boolean; provider: any | null }>({
		open: false,
		provider: null,
	})
	const [testing, setTesting] = useState<string | null>(null)

	const { data, loading, error, refetch } = useQuery(GetAdminPaymentProvidersDocument, {
		variables: {
			baseUrl: typeof window !== 'undefined' ? window.location.origin : null,
		},
	})

	const [updateProvider, { loading: saving }] = useMutation(UpdateAdminPaymentProviderDocument)
	const [testProvider] = useMutation(TestPaymentProviderDocument)
	const [clearCache] = useMutation(ClearProviderCacheDocument)

	const providers = data?.adminPaymentProviders || []

	const handleConfigure = (provider: any) => {
		setConfigDialog({ open: true, provider })
	}

	const handleSaveConfig = async (formData: ConfigFormData) => {
		if (!configDialog.provider) return

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
			throw error
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

	const handleCopyWebhook = (url: string) => {
		navigator.clipboard.writeText(url)
		toast({
			title: 'Copied',
			description: 'Webhook URL copied to clipboard',
		})
	}

	// Loading state
	if (loading) {
		return (
			<div className="space-y-4">
				<div className="grid gap-4 md:grid-cols-3">
					<Skeleton className="h-24 w-full" />
					<Skeleton className="h-24 w-full" />
					<Skeleton className="h-24 w-full" />
				</div>
				<Skeleton className="h-96 w-full" />
			</div>
		)
	}

	// Error state
	if (error) {
		return (
			<div className="flex items-center justify-center h-96">
				<div className="text-center max-w-md">
					<div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4">
						<AlertCircle className="w-8 h-8 text-red-500" />
					</div>
					<h2 className="text-2xl font-bold mb-2">Ошибка загрузки</h2>
					<p className="text-muted-foreground mb-6">{error.message}</p>
					<Button onClick={() => refetch()}>Попробовать снова</Button>
				</div>
			</div>
		)
	}

	return (
		<div className="space-y-6">
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
				<ProviderTable
					providers={providers}
					onConfigure={handleConfigure}
					onTest={handleTestConnection}
					onToggleActive={handleToggleActive}
					onSetPrimary={handleSetPrimary}
					onClearCache={handleClearCache}
					onCopyWebhook={handleCopyWebhook}
					testingProviderId={testing}
				/>
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
			<ProviderConfigDialog
				provider={configDialog.provider}
				open={configDialog.open}
				onOpenChange={(open) => setConfigDialog({ open, provider: open ? configDialog.provider : null })}
				onSave={handleSaveConfig}
				saving={saving}
			/>
		</div>
	)
}
