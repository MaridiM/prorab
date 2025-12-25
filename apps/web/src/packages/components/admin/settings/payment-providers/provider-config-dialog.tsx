'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/packages/components/ui/button'
import { Input } from '@/packages/components/ui/input'
import { Label } from '@/packages/components/ui/label'
import { Switch } from '@/packages/components/ui/switch'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/packages/components/ui/dialog'
import { Loader2 } from 'lucide-react'

interface PaymentProvider {
	id: string
	name: string
	type: string
	isActive: boolean
	isPrimary: boolean
}

interface ConfigFormData {
	shopId: string
	secretKey: string
	webhookSecret: string
	publishableKey: string
	isActive: boolean
	isPrimary: boolean
}

interface ProviderConfigDialogProps {
	provider: PaymentProvider | null
	open: boolean
	onOpenChange: (open: boolean) => void
	onSave: (data: ConfigFormData) => Promise<void>
	saving?: boolean
}

export function ProviderConfigDialog({
	provider,
	open,
	onOpenChange,
	onSave,
	saving = false,
}: ProviderConfigDialogProps) {
	const [formData, setFormData] = useState<ConfigFormData>({
		shopId: '',
		secretKey: '',
		webhookSecret: '',
		publishableKey: '',
		isActive: true,
		isPrimary: false,
	})

	// Reset form when provider changes
	useEffect(() => {
		if (provider) {
			setFormData({
				shopId: '',
				secretKey: '',
				webhookSecret: '',
				publishableKey: '',
				isActive: provider.isActive,
				isPrimary: provider.isPrimary,
			})
		}
	}, [provider])

	const handleSave = async () => {
		await onSave(formData)
	}

	if (!provider) return null

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[500px]">
				<DialogHeader>
					<DialogTitle>Configure {provider.name}</DialogTitle>
					<DialogDescription>
						Enter your {provider.name} API credentials. Leave fields empty to keep existing values.
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-4 py-4">
					{/* Yookassa-specific fields */}
					{provider.type === 'YOOKASSA' && (
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
					{provider.type === 'STRIPE' && (
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
					<Button variant="outline" onClick={() => onOpenChange(false)}>
						Cancel
					</Button>
					<Button onClick={handleSave} disabled={saving}>
						{saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
						Save Configuration
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}
