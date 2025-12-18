'use client'

import { useState } from 'react'
import { useQuery, useMutation } from '@apollo/client/react'
import { Card } from '@/packages/components/ui/card'
import { Button } from '@/packages/components/ui/button'
import { Input } from '@/packages/components/ui/input'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/packages/components/ui/select'
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
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from '@/packages/components/ui/alert-dialog'
import { Search, MoreVertical, Shield, UserPlus, Edit, Trash2, Lock } from 'lucide-react'
import { toast } from 'sonner'
import {
	GetAdminRolesDocument,
	RevokeAdminRoleDocument,
	AdminRoleType,
} from '@/packages/api/graphql/__generated__/output'
import { AssignRoleDialog } from './assign-role-dialog'
import { EditPermissionsDialog } from './edit-permissions-dialog'

export default function AdminRolesPage() {
	const [search, setSearch] = useState('')
	const [roleFilter, setRoleFilter] = useState<string>('all')
	const [showAssignDialog, setShowAssignDialog] = useState(false)
	const [selectedRole, setSelectedRole] = useState<any>(null)
	const [showEditPermissions, setShowEditPermissions] = useState(false)
	const [showRevokeConfirm, setShowRevokeConfirm] = useState(false)
	const [roleToRevoke, setRoleToRevoke] = useState<string | null>(null)

	const { data, loading, refetch } = useQuery(GetAdminRolesDocument, {
		variables: {
			role: roleFilter === 'all' ? null : roleFilter,
			search: search || null,
			limit: 100,
			offset: 0,
		},
	})

	const [revokeRole] = useMutation(RevokeAdminRoleDocument, {
		onCompleted: () => {
			toast.success('Admin role revoked successfully')
			refetch()
			setShowRevokeConfirm(false)
			setRoleToRevoke(null)
		},
		onError: (error) => {
			toast.error('Failed to revoke role: ' + error.message)
		},
	})

	const roles = data?.adminRoles || []

	const handleEditPermissions = (role: any) => {
		setSelectedRole(role)
		setShowEditPermissions(true)
	}

	const handleRevokeRole = (roleId: string) => {
		setRoleToRevoke(roleId)
		setShowRevokeConfirm(true)
	}

	const confirmRevokeRole = () => {
		if (roleToRevoke) {
			revokeRole({ variables: { roleId: roleToRevoke } })
		}
	}

	const getRoleBadgeColor = (role: string) => {
		switch (role) {
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

	return (
		<div className="space-y-6">
			<div className="flex justify-between items-center">
				<div>
					<h1 className="text-3xl font-bold">Admin Roles</h1>
					<p className="text-muted-foreground mt-1">Manage admin roles and permissions</p>
				</div>
				<Button onClick={() => setShowAssignDialog(true)}>
					<UserPlus className="mr-2 h-4 w-4" />
					Assign Role
				</Button>
			</div>

			<Card className="p-6">
				<div className="flex flex-col md:flex-row gap-4 mb-6">
					<div className="flex-1 relative">
						<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
						<Input
							placeholder="Search by user name or email..."
							value={search}
							onChange={(e) => setSearch(e.target.value)}
							className="pl-10"
						/>
					</div>
					<Select value={roleFilter} onValueChange={setRoleFilter}>
						<SelectTrigger className="w-full md:w-[180px]">
							<SelectValue placeholder="Filter by role" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">All Roles</SelectItem>
							<SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
							<SelectItem value="ADMIN">Admin</SelectItem>
							<SelectItem value="MODERATOR">Moderator</SelectItem>
							<SelectItem value="SUPPORT">Support</SelectItem>
						</SelectContent>
					</Select>
				</div>

				{loading ? (
					<div className="text-center py-12">
						<div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent" />
						<p className="mt-4 text-muted-foreground">Loading roles...</p>
					</div>
				) : (
					<div className="rounded-md border">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>User</TableHead>
									<TableHead>Email</TableHead>
									<TableHead>Role</TableHead>
									<TableHead>Permissions</TableHead>
									<TableHead>2FA</TableHead>
									<TableHead>IP Whitelist</TableHead>
									<TableHead className="text-right">Actions</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{roles.length === 0 ? (
									<TableRow>
										<TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
											No admin roles found
										</TableCell>
									</TableRow>
								) : (
									roles.map((role: any) => (
										<TableRow key={role.id}>
											<TableCell>
												<div className="flex items-center gap-3">
													<div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
														<Shield className="h-5 w-5" />
													</div>
													<div>
														<p className="font-medium">{role.user?.fullName || 'Unknown'}</p>
														<p className="text-xs text-muted-foreground">{role.userId.slice(0, 8)}</p>
													</div>
												</div>
											</TableCell>
											<TableCell>
												<p className="text-sm">{role.user?.email || 'N/A'}</p>
											</TableCell>
											<TableCell>
												<Badge variant={getRoleBadgeColor(role.role)}>
													{role.role.replace('_', ' ')}
												</Badge>
											</TableCell>
											<TableCell>
												<div className="flex items-center gap-2">
													<span className="text-sm font-medium">{role.permissions.length}</span>
													<span className="text-xs text-muted-foreground">permissions</span>
												</div>
											</TableCell>
											<TableCell>
												{role.twoFactorEnforced ? (
													<div className="flex items-center gap-1 text-sm">
														<Lock className="h-3 w-3" />
														<span>Required</span>
													</div>
												) : (
													<span className="text-sm text-muted-foreground">Optional</span>
												)}
											</TableCell>
											<TableCell>
												<span className="text-sm">
													{role.ipWhitelist.length > 0
														? `${role.ipWhitelist.length} IP(s)`
														: 'All IPs'}
												</span>
											</TableCell>
											<TableCell className="text-right">
												<DropdownMenu>
													<DropdownMenuTrigger asChild>
														<Button variant="ghost" size="sm">
															<MoreVertical className="h-4 w-4" />
														</Button>
													</DropdownMenuTrigger>
													<DropdownMenuContent align="end">
														<DropdownMenuLabel>Actions</DropdownMenuLabel>
														<DropdownMenuSeparator />
														<DropdownMenuItem onClick={() => handleEditPermissions(role)}>
															<Edit className="mr-2 h-4 w-4" />
															Edit Permissions
														</DropdownMenuItem>
														<DropdownMenuItem
															onClick={() => handleRevokeRole(role.id)}
															className="text-destructive"
														>
															<Trash2 className="mr-2 h-4 w-4" />
															Revoke Role
														</DropdownMenuItem>
													</DropdownMenuContent>
												</DropdownMenu>
											</TableCell>
										</TableRow>
									))
								)}
							</TableBody>
						</Table>
					</div>
				)}

				{!loading && roles.length > 0 && (
					<div className="mt-4 text-sm text-muted-foreground">
						Showing {roles.length} admin role(s)
					</div>
				)}
			</Card>

			{/* Assign Role Dialog */}
			<AssignRoleDialog
				open={showAssignDialog}
				onOpenChange={setShowAssignDialog}
				onSuccess={() => {
					refetch()
					setShowAssignDialog(false)
				}}
			/>

			{/* Edit Permissions Dialog */}
			{selectedRole && (
				<EditPermissionsDialog
					open={showEditPermissions}
					onOpenChange={setShowEditPermissions}
					role={selectedRole}
					onSuccess={() => {
						refetch()
						setShowEditPermissions(false)
					}}
				/>
			)}

			{/* Revoke Confirmation Dialog */}
			<AlertDialog open={showRevokeConfirm} onOpenChange={setShowRevokeConfirm}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Revoke Admin Role</AlertDialogTitle>
						<AlertDialogDescription>
							Are you sure you want to revoke this admin role? This action cannot be undone.
							The user will lose all admin privileges immediately.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel onClick={() => setRoleToRevoke(null)}>Cancel</AlertDialogCancel>
						<AlertDialogAction onClick={confirmRevokeRole} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
							Revoke Role
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	)
}
