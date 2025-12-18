'use client'

import { useState, useEffect } from 'react'
import { useMutation, useQuery } from '@apollo/client/react'
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
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/packages/components/ui/select'
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
} from '@/packages/components/ui/command'
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@/packages/components/ui/popover'
import { Checkbox } from '@/packages/components/ui/checkbox'
import { Textarea } from '@/packages/components/ui/textarea'
import { toast } from 'sonner'
import { Check, ChevronsUpDown } from 'lucide-react'
import { cn } from '@/packages/utils'
import {
	AdminUsersDocument,
	AssignAdminRoleDocument,
	AdminRoleType,
} from '@/packages/api/graphql/__generated__/output'
import { PermissionsSelector } from '@/packages/components/admin/permissions-selector'

interface AssignRoleDialogProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	onSuccess: () => void
}

// Default permissions for each role type
const ROLE_DEFAULTS: Record<string, string[]> = {
	SUPER_ADMIN: [], // Backend will assign all permissions
	ADMIN: [
		'users:view',
		'users:update',
		'users:export',
		'teams:view',
		'teams:update',
		'teams:export',
		'projects:view',
		'projects:update',
		'projects:export',
		'subscriptions:view',
		'subscriptions:update',
		'subscriptions:cancel',
		'payments:view',
		'payments:export',
		'settings:view',
		'storage:view',
		'storage:manage',
		'storage:migrate',
		'support_tickets:view',
		'support_tickets:reply',
		'support_tickets:close',
		'support_tickets:assign',
		'support_faq:manage',
		'analytics:view',
		'analytics:export',
		'logs:view',
		'audit_logs:view',
	],
	MODERATOR: [
		'users:view',
		'teams:view',
		'projects:view',
		'support_tickets:view',
		'support_tickets:reply',
		'support_tickets:close',
		'support_faq:manage',
		'content:view',
		'content:delete',
		'content:reports:view',
		'content:reports:handle',
		'analytics:view',
	],
	SUPPORT: [
		'support_tickets:view',
		'support_tickets:reply',
		'support_tickets:close',
		'support_faq:manage',
		'users:view',
		'analytics:view',
	],
}

export function AssignRoleDialog({ open, onOpenChange, onSuccess }: AssignRoleDialogProps) {
	const [selectedUserId, setSelectedUserId] = useState<string>('')
	const [selectedRole, setSelectedRole] = useState<string>('')
	const [selectedPermissions, setSelectedPermissions] = useState<string[]>([])
	const [twoFactorEnforced, setTwoFactorEnforced] = useState(false)
	const [ipWhitelist, setIpWhitelist] = useState('')
	const [userSearchOpen, setUserSearchOpen] = useState(false)
	const [searchQuery, setSearchQuery] = useState('')

	// Fetch users for selection
	const { data: usersData, loading: usersLoading } = useQuery(AdminUsersDocument, {
		variables: {
			filters: searchQuery
				? {
						search: searchQuery,
						emailVerified: null,
						createdAfter: null,
						createdBefore: null,
						lastLoginAfter: null,
						lastLoginBefore: null,
				  }
				: null,
			pagination: {
				page: 1,
				limit: 50,
			},
		},
	})

	const [assignRole, { loading: assignLoading }] = useMutation(AssignAdminRoleDocument, {
		onCompleted: () => {
			toast.success('Admin role assigned successfully')
			resetForm()
			onSuccess()
		},
		onError: (error) => {
			toast.error('Failed to assign role: ' + error.message)
		},
	})

	const users = usersData?.adminUsers?.nodes || []
	const selectedUser = users.find((u: any) => u.id === selectedUserId)

	// Update permissions when role changes
	useEffect(() => {
		if (selectedRole && ROLE_DEFAULTS[selectedRole]) {
			setSelectedPermissions(ROLE_DEFAULTS[selectedRole])
		}
	}, [selectedRole])

	const resetForm = () => {
		setSelectedUserId('')
		setSelectedRole('')
		setSelectedPermissions([])
		setTwoFactorEnforced(false)
		setIpWhitelist('')
		setSearchQuery('')
	}

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()

		if (!selectedUserId || !selectedRole) {
			toast.error('Please select a user and role')
			return
		}

		// Parse IP whitelist
		const ipList = ipWhitelist
			.split('\n')
			.map((ip) => ip.trim())
			.filter((ip) => ip.length > 0)

		const input: any = {
			userId: selectedUserId,
			role: selectedRole as AdminRoleType,
			twoFactorEnforced,
		}

		if (selectedPermissions.length > 0) {
			input.permissions = selectedPermissions
		}

		if (ipList.length > 0) {
			input.ipWhitelist = ipList
		}

		await assignRole({
			variables: { input },
		})
	}

	const handleOpenChange = (newOpen: boolean) => {
		if (!newOpen) {
			resetForm()
		}
		onOpenChange(newOpen)
	}

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>Assign Admin Role</DialogTitle>
					<DialogDescription>
						Grant admin privileges to a user by assigning a role with specific permissions.
					</DialogDescription>
				</DialogHeader>

				<form onSubmit={handleSubmit} className="space-y-6">
					{/* User Selection */}
					<div className="space-y-2">
						<Label>Select User</Label>
						<Popover open={userSearchOpen} onOpenChange={setUserSearchOpen}>
							<PopoverTrigger asChild>
								<Button
									variant="outline"
									role="combobox"
									aria-expanded={userSearchOpen}
									className="w-full justify-between"
								>
									{selectedUser ? (
										<span>
											{selectedUser.fullName} ({selectedUser.email})
										</span>
									) : (
										'Select user...'
									)}
									<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
								</Button>
							</PopoverTrigger>
							<PopoverContent className="w-full p-0">
								<Command>
									<CommandInput
										placeholder="Search users..."
										value={searchQuery}
										onValueChange={setSearchQuery}
									/>
									<CommandEmpty>
										{usersLoading ? 'Loading...' : 'No users found.'}
									</CommandEmpty>
									<CommandGroup className="max-h-64 overflow-y-auto">
										{users.map((user: any) => (
											<CommandItem
												key={user.id}
												value={user.id}
												onSelect={(currentValue: string) => {
													setSelectedUserId(currentValue === selectedUserId ? '' : currentValue)
													setUserSearchOpen(false)
												}}
											>
												<Check
													className={cn(
														'mr-2 h-4 w-4',
														selectedUserId === user.id ? 'opacity-100' : 'opacity-0'
													)}
												/>
												<div className="flex flex-col">
													<span className="font-medium">{user.fullName}</span>
													<span className="text-sm text-muted-foreground">{user.email}</span>
												</div>
											</CommandItem>
										))}
									</CommandGroup>
								</Command>
							</PopoverContent>
						</Popover>
					</div>

					{/* Role Selection */}
					<div className="space-y-2">
						<Label>Role Type</Label>
						<Select value={selectedRole} onValueChange={setSelectedRole}>
							<SelectTrigger>
								<SelectValue placeholder="Select role type" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="SUPER_ADMIN">Super Admin (All Permissions)</SelectItem>
								<SelectItem value="ADMIN">Admin (Most Permissions)</SelectItem>
								<SelectItem value="MODERATOR">Moderator (Limited Permissions)</SelectItem>
								<SelectItem value="SUPPORT">Support (Basic Permissions)</SelectItem>
							</SelectContent>
						</Select>
					</div>

					{/* Permissions Selection */}
					{selectedRole && selectedRole !== 'SUPER_ADMIN' && (
						<div className="space-y-2">
							<Label>Permissions</Label>
							<p className="text-sm text-muted-foreground mb-2">
								Default permissions are pre-selected based on the role. You can customize them below.
							</p>
							<div className="border rounded-lg p-4 max-h-96 overflow-y-auto">
								<PermissionsSelector
									selectedPermissions={selectedPermissions}
									onChange={setSelectedPermissions}
								/>
							</div>
						</div>
					)}

					{/* 2FA Enforcement */}
					<div className="flex items-center space-x-2">
						<Checkbox
							id="twoFactor"
							checked={twoFactorEnforced}
							onCheckedChange={(checked: boolean) => setTwoFactorEnforced(checked)}
						/>
						<Label htmlFor="twoFactor" className="cursor-pointer">
							Require Two-Factor Authentication
						</Label>
					</div>

					{/* IP Whitelist */}
					<div className="space-y-2">
						<Label htmlFor="ipWhitelist">IP Whitelist (Optional)</Label>
						<Textarea
							id="ipWhitelist"
							placeholder="Enter IP addresses, one per line&#10;Example:&#10;192.168.1.1&#10;10.0.0.0/24&#10;2001:db8::1"
							value={ipWhitelist}
							onChange={(e) => setIpWhitelist(e.target.value)}
							rows={5}
						/>
						<p className="text-sm text-muted-foreground">
							Leave empty to allow access from any IP. Supports IPv4, IPv6, and CIDR notation.
						</p>
					</div>

					<DialogFooter>
						<Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
							Cancel
						</Button>
						<Button type="submit" disabled={assignLoading || !selectedUserId || !selectedRole}>
							{assignLoading ? 'Assigning...' : 'Assign Role'}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	)
}
