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
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from '@/packages/components/ui/dialog'
import { Search, MoreVertical, UserCheck, UserX, Trash2, Shield, Mail } from 'lucide-react'
import { toast } from 'sonner'
import {
	AdminUsersDocument,
	AdminVerifyUserEmailDocument,
	AdminDeleteUserDocument,
} from '@/packages/api/graphql/__generated__/output'

export default function AdminUsersPage() {
	const [page, setPage] = useState(1)
	const [search, setSearch] = useState('')
	const [roleFilter, setRoleFilter] = useState<string>('')
	const [verifiedFilter, setVerifiedFilter] = useState<string>('')
	const [selectedUser, setSelectedUser] = useState<any>(null)
	const [isDetailsOpen, setIsDetailsOpen] = useState(false)

	const { data, loading, refetch } = useQuery(AdminUsersDocument, {
		variables: {
			filters: (search || verifiedFilter) ? {
				search: search || null,
				emailVerified: verifiedFilter === 'true' ? true : verifiedFilter === 'false' ? false : null,
				createdAfter: null,
				createdBefore: null,
				lastLoginAfter: null,
				lastLoginBefore: null,
			} : null,
			pagination: {
				page,
				limit: 20,
			},
		},
	})

	const [verifyUser] = useMutation(AdminVerifyUserEmailDocument, {
		onCompleted: () => {
			toast.success('User verified successfully')
			refetch()
		},
		onError: (error) => {
			toast.error('Failed to verify user: ' + error.message)
		},
	})

	const [deleteUser] = useMutation(AdminDeleteUserDocument, {
		onCompleted: () => {
			toast.success('User deleted successfully')
			refetch()
		},
		onError: (error) => {
			toast.error('Failed to delete user: ' + error.message)
		},
	})

	const users = data?.adminUsers?.nodes || []
	const pageInfo = data?.adminUsers?.pageInfo
	const totalCount = data?.adminUsers?.totalCount || 0

	const handleVerifyUser = (userId: string) => {
		verifyUser({ variables: { id: userId } })
	}

	const handleDeleteUser = (userId: string) => {
		if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
			deleteUser({ variables: { id: userId } })
		}
	}

	const handleViewDetails = (user: any) => {
		setSelectedUser(user)
		setIsDetailsOpen(true)
	}

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-3xl font-bold">User Management</h1>
				<p className="text-muted-foreground mt-1">Manage and monitor user accounts</p>
			</div>

			<Card className="p-6">
				<div className="flex flex-col md:flex-row gap-4 mb-6">
					<div className="flex-1 relative">
						<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
						<Input
							placeholder="Search by email or name..."
							value={search}
							onChange={(e) => setSearch(e.target.value)}
							className="pl-10"
						/>
					</div>
					<Select value={verifiedFilter} onValueChange={setVerifiedFilter}>
						<SelectTrigger className="w-full md:w-[180px]">
							<SelectValue placeholder="Verification" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">All Users</SelectItem>
							<SelectItem value="true">Verified</SelectItem>
							<SelectItem value="false">Unverified</SelectItem>
						</SelectContent>
					</Select>
					<Select value={roleFilter} onValueChange={setRoleFilter}>
						<SelectTrigger className="w-full md:w-[180px]">
							<SelectValue placeholder="Role" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">All Roles</SelectItem>
							<SelectItem value="ADMIN">Admin</SelectItem>
							<SelectItem value="USER">User</SelectItem>
						</SelectContent>
					</Select>
				</div>

				{loading ? (
					<div className="text-center py-12">
						<div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent" />
						<p className="mt-4 text-muted-foreground">Loading users...</p>
					</div>
				) : (
					<>
						<div className="rounded-md border">
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>User</TableHead>
										<TableHead>Email</TableHead>
										<TableHead>Status</TableHead>
										<TableHead>Telegram</TableHead>
										<TableHead>Joined</TableHead>
										<TableHead className="text-right">Actions</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{users.length === 0 ? (
										<TableRow>
											<TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
												No users found
											</TableCell>
										</TableRow>
									) : (
										users.map((user: any) => (
											<TableRow key={user.id}>
												<TableCell>
													<div className="flex items-center gap-3">
														<div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
															{user.photoUrl ? (
																<img
																	src={user.photoUrl}
																	alt={user.name || 'User'}
																	className="h-10 w-10 rounded-full"
																/>
															) : (
																<span className="text-sm font-medium">
																	{(user.name || user.email)[0].toUpperCase()}
																</span>
															)}
														</div>
														<div>
															<p className="font-medium">{user.name || 'Anonymous'}</p>
															<p className="text-xs text-muted-foreground">{user.id.slice(0, 8)}</p>
														</div>
													</div>
												</TableCell>
												<TableCell>{user.email}</TableCell>
												<TableCell>
													<div className="flex flex-col gap-1">
														{user.verified ? (
															<Badge variant="default" className="w-fit">
																<UserCheck className="h-3 w-3 mr-1" />
																Verified
															</Badge>
														) : (
															<Badge variant="secondary" className="w-fit">
																<UserX className="h-3 w-3 mr-1" />
																Unverified
															</Badge>
														)}
														{user.emailVerified && (
															<Badge variant="secondary" className="w-fit">
																<Mail className="h-3 w-3 mr-1" />
																Email OK
															</Badge>
														)}
													</div>
												</TableCell>
												<TableCell>
													{user.telegramId ? (
														<Badge variant="secondary">Connected</Badge>
													) : (
														<span className="text-muted-foreground">-</span>
													)}
												</TableCell>
												<TableCell className="text-muted-foreground">
													{new Date(user.createdAt).toLocaleDateString()}
												</TableCell>
												<TableCell className="text-right">
													<DropdownMenu>
														<DropdownMenuTrigger asChild>
															<Button variant="ghost" size="icon">
																<MoreVertical className="h-4 w-4" />
															</Button>
														</DropdownMenuTrigger>
														<DropdownMenuContent align="end">
															<DropdownMenuLabel>Actions</DropdownMenuLabel>
															<DropdownMenuItem onClick={() => handleViewDetails(user)}>
																View Details
															</DropdownMenuItem>
															{!user.verified && (
																<DropdownMenuItem onClick={() => handleVerifyUser(user.id)}>
																	<Shield className="h-4 w-4 mr-2" />
																	Verify User
																</DropdownMenuItem>
															)}
															<DropdownMenuSeparator />
															<DropdownMenuItem
																onClick={() => handleDeleteUser(user.id)}
																className="text-destructive"
															>
																<Trash2 className="h-4 w-4 mr-2" />
																Delete User
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

						<div className="flex items-center justify-between mt-4">
							<p className="text-sm text-muted-foreground">
								Showing {users.length} of {totalCount} users
							</p>
							<div className="flex gap-2">
								<Button
									variant="secondary"
									size="sm"
									onClick={() => setPage(page - 1)}
									disabled={!pageInfo?.hasPreviousPage}
								>
									Previous
								</Button>
								<Button
									variant="secondary"
									size="sm"
									onClick={() => setPage(page + 1)}
									disabled={!pageInfo?.hasNextPage}
								>
									Next
								</Button>
							</div>
						</div>
					</>
				)}
			</Card>

			<Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
				<DialogContent className="max-w-2xl">
					<DialogHeader>
						<DialogTitle>User Details</DialogTitle>
						<DialogDescription>Detailed information about the user</DialogDescription>
					</DialogHeader>
					{selectedUser && (
						<div className="space-y-4">
							<div className="flex items-center gap-4">
								<div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
									{selectedUser.photoUrl ? (
										<img
											src={selectedUser.photoUrl}
											alt={selectedUser.name || 'User'}
											className="h-20 w-20 rounded-full"
										/>
									) : (
										<span className="text-2xl font-medium">
											{(selectedUser.name || selectedUser.email)[0].toUpperCase()}
										</span>
									)}
								</div>
								<div>
									<h3 className="text-xl font-semibold">{selectedUser.name || 'Anonymous'}</h3>
									<p className="text-muted-foreground">{selectedUser.email}</p>
								</div>
							</div>

							<div className="grid grid-cols-2 gap-4">
								<div>
									<p className="text-sm font-medium text-muted-foreground">User ID</p>
									<p className="mt-1">{selectedUser.id}</p>
								</div>
								<div>
									<p className="text-sm font-medium text-muted-foreground">Verified</p>
									<p className="mt-1">
										{selectedUser.verified ? (
											<Badge variant="default">Yes</Badge>
										) : (
											<Badge variant="secondary">No</Badge>
										)}
									</p>
								</div>
								<div>
									<p className="text-sm font-medium text-muted-foreground">Email Verified</p>
									<p className="mt-1">
										{selectedUser.emailVerified ? (
											<Badge variant="default">Yes</Badge>
										) : (
											<Badge variant="secondary">No</Badge>
										)}
									</p>
								</div>
								<div>
									<p className="text-sm font-medium text-muted-foreground">Telegram</p>
									<p className="mt-1">
										{selectedUser.telegramId ? (
											<Badge variant="secondary">Connected</Badge>
										) : (
											<span className="text-muted-foreground">Not connected</span>
										)}
									</p>
								</div>
								<div>
									<p className="text-sm font-medium text-muted-foreground">Joined</p>
									<p className="mt-1">{new Date(selectedUser.createdAt).toLocaleString()}</p>
								</div>
							</div>
						</div>
					)}
				</DialogContent>
			</Dialog>
		</div>
	)
}
