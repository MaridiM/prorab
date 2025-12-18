'use client'

import { Checkbox } from '@/packages/components/ui/checkbox'
import { Label } from '@/packages/components/ui/label'
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from '@/packages/components/ui/accordion'
import { Button } from '@/packages/components/ui/button'

interface PermissionsSelectorProps {
	selectedPermissions: string[]
	onChange: (permissions: string[]) => void
	disabled?: boolean
}

// Permission groups based on admin-permissions.ts
const PERMISSION_GROUPS = {
	'User Management': [
		{ id: 'users:view', label: 'View Users' },
		{ id: 'users:create', label: 'Create Users' },
		{ id: 'users:update', label: 'Update Users' },
		{ id: 'users:delete', label: 'Delete Users' },
		{ id: 'users:impersonate', label: 'Impersonate Users' },
		{ id: 'users:export', label: 'Export Users' },
	],
	'Team Management': [
		{ id: 'teams:view', label: 'View Teams' },
		{ id: 'teams:create', label: 'Create Teams' },
		{ id: 'teams:update', label: 'Update Teams' },
		{ id: 'teams:delete', label: 'Delete Teams' },
		{ id: 'teams:export', label: 'Export Teams' },
	],
	'Project Management': [
		{ id: 'projects:view', label: 'View Projects' },
		{ id: 'projects:create', label: 'Create Projects' },
		{ id: 'projects:update', label: 'Update Projects' },
		{ id: 'projects:delete', label: 'Delete Projects' },
		{ id: 'projects:export', label: 'Export Projects' },
	],
	'Subscription Management': [
		{ id: 'subscriptions:view', label: 'View Subscriptions' },
		{ id: 'subscriptions:update', label: 'Update Subscriptions' },
		{ id: 'subscriptions:cancel', label: 'Cancel Subscriptions' },
		{ id: 'subscriptions:refund', label: 'Refund Subscriptions' },
	],
	'Payment Management': [
		{ id: 'payments:view', label: 'View Payments' },
		{ id: 'payments:refund', label: 'Refund Payments' },
		{ id: 'payments:export', label: 'Export Payments' },
	],
	'System Settings': [
		{ id: 'settings:view', label: 'View Settings' },
		{ id: 'settings:update', label: 'Update Settings' },
		{ id: 'settings:payment', label: 'Manage Payment Settings' },
		{ id: 'settings:email', label: 'Manage Email Settings' },
		{ id: 'settings:telegram', label: 'Manage Telegram Settings' },
		{ id: 'settings:storage', label: 'Manage Storage Settings' },
		{ id: 'settings:ai', label: 'Manage AI Settings' },
		{ id: 'settings:security', label: 'Manage Security Settings' },
	],
	'Storage Management': [
		{ id: 'storage:view', label: 'View Storage' },
		{ id: 'storage:manage', label: 'Manage Storage' },
		{ id: 'storage:migrate', label: 'Migrate Storage' },
	],
	'Admin Role Management': [
		{ id: 'admin_roles:view', label: 'View Admin Roles' },
		{ id: 'admin_roles:create', label: 'Create Admin Roles' },
		{ id: 'admin_roles:update', label: 'Update Admin Roles' },
		{ id: 'admin_roles:delete', label: 'Delete Admin Roles' },
	],
	'Support Management': [
		{ id: 'support_tickets:view', label: 'View Support Tickets' },
		{ id: 'support_tickets:reply', label: 'Reply to Support Tickets' },
		{ id: 'support_tickets:close', label: 'Close Support Tickets' },
		{ id: 'support_tickets:assign', label: 'Assign Support Tickets' },
		{ id: 'support_faq:manage', label: 'Manage FAQ' },
	],
	'Content Moderation': [
		{ id: 'content:view', label: 'View Content' },
		{ id: 'content:delete', label: 'Delete Content' },
		{ id: 'content:reports:view', label: 'View Content Reports' },
		{ id: 'content:reports:handle', label: 'Handle Content Reports' },
	],
	'Analytics & Logs': [
		{ id: 'analytics:view', label: 'View Analytics' },
		{ id: 'analytics:export', label: 'Export Analytics' },
		{ id: 'logs:view', label: 'View Logs' },
		{ id: 'logs:export', label: 'Export Logs' },
		{ id: 'audit_logs:view', label: 'View Audit Logs' },
	],
	'System Operations': [
		{ id: 'system:maintenance', label: 'Maintenance Mode' },
		{ id: 'system:notifications', label: 'Send System Notifications' },
		{ id: 'system:backup', label: 'Backup System' },
		{ id: 'system:restore', label: 'Restore System' },
	],
}

export function PermissionsSelector({
	selectedPermissions,
	onChange,
	disabled = false,
}: PermissionsSelectorProps) {
	const togglePermission = (permissionId: string) => {
		if (disabled) return

		if (selectedPermissions.includes(permissionId)) {
			onChange(selectedPermissions.filter((p) => p !== permissionId))
		} else {
			onChange([...selectedPermissions, permissionId])
		}
	}

	const toggleGroupPermissions = (groupPermissions: { id: string; label: string }[]) => {
		if (disabled) return

		const groupPermissionIds = groupPermissions.map((p) => p.id)
		const allSelected = groupPermissionIds.every((id) => selectedPermissions.includes(id))

		if (allSelected) {
			// Deselect all in group
			onChange(selectedPermissions.filter((p) => !groupPermissionIds.includes(p)))
		} else {
			// Select all in group
			const newPermissions = [...selectedPermissions]
			groupPermissionIds.forEach((id) => {
				if (!newPermissions.includes(id)) {
					newPermissions.push(id)
				}
			})
			onChange(newPermissions)
		}
	}

	const isGroupFullySelected = (groupPermissions: { id: string; label: string }[]) => {
		return groupPermissions.every((p) => selectedPermissions.includes(p.id))
	}

	const isGroupPartiallySelected = (groupPermissions: { id: string; label: string }[]) => {
		const selected = groupPermissions.filter((p) => selectedPermissions.includes(p.id))
		return selected.length > 0 && selected.length < groupPermissions.length
	}

	return (
		<div className="space-y-4">
			<div className="flex justify-between items-center">
				<p className="text-sm font-medium">
					Selected: {selectedPermissions.length} permissions
				</p>
				<div className="flex gap-2">
					<Button
						type="button"
						variant="outline"
						size="sm"
						onClick={() => {
							const allPermissions = Object.values(PERMISSION_GROUPS).flat().map((p) => p.id)
							onChange(allPermissions)
						}}
						disabled={disabled}
					>
						Select All
					</Button>
					<Button
						type="button"
						variant="outline"
						size="sm"
						onClick={() => onChange([])}
						disabled={disabled}
					>
						Clear All
					</Button>
				</div>
			</div>

			<Accordion type="multiple" className="w-full">
				{Object.entries(PERMISSION_GROUPS).map(([groupName, permissions]) => (
					<AccordionItem key={groupName} value={groupName}>
						<AccordionTrigger className="text-sm font-medium">
							<div className="flex items-center gap-2">
								<span>{groupName}</span>
								<span className="text-xs text-muted-foreground">
									({permissions.filter((p) => selectedPermissions.includes(p.id)).length}/
									{permissions.length})
								</span>
							</div>
						</AccordionTrigger>
						<AccordionContent>
							<div className="space-y-3 pl-4">
								<div className="flex items-center gap-2">
									<Checkbox
										id={`${groupName}-all`}
										checked={isGroupFullySelected(permissions)}
										onCheckedChange={() => toggleGroupPermissions(permissions)}
										disabled={disabled}
										className={
											isGroupPartiallySelected(permissions) ? 'data-[state=checked]:bg-primary/50' : ''
										}
									/>
									<Label
										htmlFor={`${groupName}-all`}
										className="text-sm font-medium cursor-pointer"
									>
										Select All
									</Label>
								</div>
								<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
									{permissions.map((permission) => (
										<div key={permission.id} className="flex items-center gap-2">
											<Checkbox
												id={permission.id}
												checked={selectedPermissions.includes(permission.id)}
												onCheckedChange={() => togglePermission(permission.id)}
												disabled={disabled}
											/>
											<Label htmlFor={permission.id} className="text-sm cursor-pointer">
												{permission.label}
											</Label>
										</div>
									))}
								</div>
							</div>
						</AccordionContent>
					</AccordionItem>
				))}
			</Accordion>
		</div>
	)
}
