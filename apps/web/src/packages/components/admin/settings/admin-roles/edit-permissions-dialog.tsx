'use client'

import { useState, useEffect } from 'react'
import { useMutation } from '@apollo/client/react'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/packages/components/ui/dialog'
import { Button } from '@/packages/components/ui/button'
import { Label } from '@/packages/components/ui/label'
import { Checkbox } from '@/packages/components/ui/checkbox'
import { Textarea } from '@/packages/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/packages/components/ui/tabs'
import { Badge } from '@/packages/components/ui/badge'
import { toast } from 'sonner'
import { Lock, Shield } from 'lucide-react'
import {
	UpdateAdminPermissionsDocument,
	UpdateTwoFactorEnforcementDocument,
	UpdateIpWhitelistDocument,
} from '@/packages/api/graphql/__generated__/output'
import { PermissionsSelector } from '@/packages/components/admin/permissions-selector'

interface EditPermissionsDialogProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	role: any
	onSuccess: () => void
}

export function EditPermissionsDialog({
	open,
	onOpenChange,
	role,
	onSuccess,
}: EditPermissionsDialogProps) {
	const [selectedPermissions, setSelectedPermissions] = useState<string[]>([])
	const [twoFactorEnforced, setTwoFactorEnforced] = useState(false)
	const [ipWhitelist, setIpWhitelist] = useState('')
	const [activeTab, setActiveTab] = useState('permissions')

	// Initialize form with role data
	useEffect(() => {
		if (role) {
			setSelectedPermissions(role.permissions || [])
			setTwoFactorEnforced(role.twoFactorEnforced || false)
			setIpWhitelist(role.ipWhitelist?.join('\n') || '')
		}
	}, [role])

	const [updatePermissions, { loading: permissionsLoading }] = useMutation(
		UpdateAdminPermissionsDocument,
		{
			onCompleted: () => {
				toast.success('Permissions updated successfully')
				onSuccess()
			},
			onError: (error) => {
				toast.error('Failed to update permissions: ' + error.message)
			},
		}
	)

	const [updateTwoFactor, { loading: twoFactorLoading }] = useMutation(
		UpdateTwoFactorEnforcementDocument,
		{
			onCompleted: () => {
				toast.success('2FA requirement updated successfully')
				onSuccess()
			},
			onError: (error) => {
				toast.error('Failed to update 2FA requirement: ' + error.message)
			},
		}
	)

	const [updateIpWhitelist, { loading: ipWhitelistLoading }] = useMutation(
		UpdateIpWhitelistDocument,
		{
			onCompleted: () => {
				toast.success('IP whitelist updated successfully')
				onSuccess()
			},
			onError: (error) => {
				toast.error('Failed to update IP whitelist: ' + error.message)
			},
		}
	)

	const handleUpdatePermissions = async () => {
		if (!role?.id) return

		await updatePermissions({
			variables: {
				input: {
					roleId: role.id,
					permissions: selectedPermissions,
				},
			},
		})
	}

	const handleUpdateTwoFactor = async () => {
		if (!role?.id) return

		await updateTwoFactor({
			variables: {
				input: {
					roleId: role.id,
					enforced: twoFactorEnforced,
				},
			},
		})
	}

	const handleUpdateIpWhitelist = async () => {
		if (!role?.id) return

		const ipList = ipWhitelist
			.split('\n')
			.map((ip) => ip.trim())
			.filter((ip) => ip.length > 0)

		await updateIpWhitelist({
			variables: {
				input: {
					roleId: role.id,
					ipAddresses: ipList,
				},
			},
		})
	}

	const getRoleBadgeColor = (roleType: string) => {
		switch (roleType) {
			case 'SUPER_ADMIN':
				return 'destructive'
			case 'ADMIN':
				return 'default'
			case 'MODERATOR':
				return 'secondary'
			case 'SUPPORT':
				return 'outline'
			default:
				return 'outline'
		}
	}

	if (!role) return null

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<Shield className="h-5 w-5" />
						Edit Admin Role
					</DialogTitle>
					<DialogDescription>
						Manage permissions and security settings for {role.user?.fullName || 'this admin'}
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-4">
					{/* Role Info */}
					<div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
						<div className="flex-1">
							<p className="font-medium">{role.user?.fullName}</p>
							<p className="text-sm text-muted-foreground">{role.user?.email}</p>
						</div>
						<Badge variant={getRoleBadgeColor(role.role)}>
							{role.role.replace('_', ' ')}
						</Badge>
					</div>

					{/* Tabs for different settings */}
					<Tabs value={activeTab} onValueChange={setActiveTab}>
						<TabsList className="grid w-full grid-cols-3">
							<TabsTrigger value="permissions">Permissions</TabsTrigger>
							<TabsTrigger value="security">Security</TabsTrigger>
							<TabsTrigger value="ip-whitelist">IP Whitelist</TabsTrigger>
						</TabsList>

						{/* Permissions Tab */}
						<TabsContent value="permissions" className="space-y-4">
							<div className="space-y-2">
								<Label>Manage Permissions</Label>
								{role.role === 'SUPER_ADMIN' ? (
									<div className="p-4 bg-muted rounded-lg text-center">
										<Shield className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
										<p className="font-medium">Super Admin Role</p>
										<p className="text-sm text-muted-foreground">
											This role has all permissions and cannot be edited.
										</p>
									</div>
								) : (
									<div className="border rounded-lg p-4 max-h-96 overflow-y-auto">
										<PermissionsSelector
											selectedPermissions={selectedPermissions}
											onChange={setSelectedPermissions}
										/>
									</div>
								)}
							</div>
							{role.role !== 'SUPER_ADMIN' && (
								<DialogFooter>
									<Button
										type="button"
										onClick={handleUpdatePermissions}
										disabled={permissionsLoading}
									>
										{permissionsLoading ? 'Saving...' : 'Save Permissions'}
									</Button>
								</DialogFooter>
							)}
						</TabsContent>

						{/* Security Tab */}
						<TabsContent value="security" className="space-y-4">
							<div className="space-y-4">
								<div className="space-y-2">
									<Label>Two-Factor Authentication</Label>
									<div className="flex items-center space-x-2 p-4 border rounded-lg">
										<Checkbox
											id="twoFactor"
											checked={twoFactorEnforced}
											onCheckedChange={(checked: boolean) => setTwoFactorEnforced(checked)}
										/>
										<div className="flex-1">
											<Label htmlFor="twoFactor" className="cursor-pointer">
												Require Two-Factor Authentication
											</Label>
											<p className="text-sm text-muted-foreground">
												When enabled, this admin must use 2FA to access admin features
											</p>
										</div>
										<Lock className="h-5 w-5 text-muted-foreground" />
									</div>
								</div>
								<DialogFooter>
									<Button
										type="button"
										onClick={handleUpdateTwoFactor}
										disabled={twoFactorLoading}
									>
										{twoFactorLoading ? 'Saving...' : 'Save Security Settings'}
									</Button>
								</DialogFooter>
							</div>
						</TabsContent>

						{/* IP Whitelist Tab */}
						<TabsContent value="ip-whitelist" className="space-y-4">
							<div className="space-y-2">
								<Label htmlFor="ipWhitelist">IP Whitelist</Label>
								<Textarea
									id="ipWhitelist"
									placeholder="Enter IP addresses, one per line&#10;Example:&#10;192.168.1.1&#10;10.0.0.0/24&#10;2001:db8::1"
									value={ipWhitelist}
									onChange={(e) => setIpWhitelist(e.target.value)}
									rows={10}
								/>
								<p className="text-sm text-muted-foreground">
									Leave empty to allow access from any IP. Supports IPv4, IPv6, and CIDR notation.
								</p>
								{role.ipWhitelist && role.ipWhitelist.length > 0 && (
									<div className="p-3 bg-muted rounded-lg">
										<p className="text-sm font-medium mb-2">Current whitelist:</p>
										<div className="flex flex-wrap gap-2">
											{role.ipWhitelist.map((ip: string) => (
												<Badge key={ip} variant="outline">
													{ip}
												</Badge>
											))}
										</div>
									</div>
								)}
							</div>
							<DialogFooter>
								<Button
									type="button"
									onClick={handleUpdateIpWhitelist}
									disabled={ipWhitelistLoading}
								>
									{ipWhitelistLoading ? 'Saving...' : 'Save IP Whitelist'}
								</Button>
							</DialogFooter>
						</TabsContent>
					</Tabs>
				</div>
			</DialogContent>
		</Dialog>
	)
}
