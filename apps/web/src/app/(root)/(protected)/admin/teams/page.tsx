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
import { Search, MoreVertical, Trash2, Ban, Users, FolderKanban } from 'lucide-react'
import { toast } from 'sonner'
import {
	AdminTeamsDocument,
	AdminDeleteTeamDocument,
} from '@/packages/api/graphql/__generated__/output'

export default function AdminTeamsPage() {
	const [page, setPage] = useState(1)
	const [search, setSearch] = useState('')
	const [planFilter, setPlanFilter] = useState<string>('')
	const [statusFilter, setStatusFilter] = useState<string>('')
	const [selectedTeam, setSelectedTeam] = useState<any>(null)
	const [isDetailsOpen, setIsDetailsOpen] = useState(false)

	const { data, loading, refetch } = useQuery(AdminTeamsDocument, {
		variables: {
			filters: (search || planFilter || statusFilter) ? {
				search: search || null,
				planType: planFilter || null,
				subscriptionStatus: statusFilter || null,
				createdAfter: null,
				createdBefore: null,
				minMembers: null,
				maxMembers: null,
				minProjects: null,
				maxProjects: null,
			} : null,
			pagination: {
				page,
				limit: 20,
			},
		},
	})

	const [deleteTeam] = useMutation(AdminDeleteTeamDocument, {
		onCompleted: () => {
			toast.success('Team deleted successfully')
			refetch()
		},
		onError: (error) => {
			toast.error('Failed to delete team: ' + error.message)
		},
	})

	// TODO: Add suspend team mutation to GraphQL schema
	// const [suspendTeam] = useMutation(AdminSuspendTeamDocument, {
	// 	onCompleted: () => {
	// 		toast.success('Team suspended successfully')
	// 		refetch()
	// 	},
	// 	onError: (error) => {
	// 		toast.error('Failed to suspend team: ' + error.message)
	// 	},
	// })

	const teams = data?.adminTeams?.nodes || []
	const pageInfo = data?.adminTeams?.pageInfo
	const totalCount = data?.adminTeams?.totalCount || 0

	const handleDeleteTeam = (teamId: string) => {
		if (confirm('Are you sure you want to delete this team? This action cannot be undone.')) {
			deleteTeam({ variables: { id: teamId } })
		}
	}

	// const handleSuspendTeam = (teamId: string) => {
	// 	const reason = prompt('Enter suspension reason:')
	// 	if (reason) {
	// 		suspendTeam({ variables: { id: teamId, reason } })
	// 	}
	// }

	const handleViewDetails = (team: any) => {
		setSelectedTeam(team)
		setIsDetailsOpen(true)
	}

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-3xl font-bold">Team Management</h1>
				<p className="text-muted-foreground mt-1">Manage and monitor team accounts</p>
			</div>

			<Card className="p-6">
				<div className="flex flex-col md:flex-row gap-4 mb-6">
					<div className="flex-1 relative">
						<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
						<Input
							placeholder="Search by team name or slug..."
							value={search}
							onChange={(e) => setSearch(e.target.value)}
							className="pl-10"
						/>
					</div>
					<Select value={planFilter} onValueChange={setPlanFilter}>
						<SelectTrigger className="w-full md:w-[180px]">
							<SelectValue placeholder="Plan" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">All Plans</SelectItem>
							<SelectItem value="LITE">LITE</SelectItem>
							<SelectItem value="FOREMAN">FOREMAN</SelectItem>
							<SelectItem value="BRIGADE">BRIGADE</SelectItem>
						</SelectContent>
					</Select>
					<Select value={statusFilter} onValueChange={setStatusFilter}>
						<SelectTrigger className="w-full md:w-[180px]">
							<SelectValue placeholder="Status" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">All Status</SelectItem>
							<SelectItem value="ACTIVE">Active</SelectItem>
							<SelectItem value="TRIALING">Trialing</SelectItem>
							<SelectItem value="CANCELLED">Cancelled</SelectItem>
						</SelectContent>
					</Select>
				</div>

				{loading ? (
					<div className="text-center py-12">
						<div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent" />
						<p className="mt-4 text-muted-foreground">Loading teams...</p>
					</div>
				) : (
					<>
						<div className="rounded-md border">
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Team</TableHead>
										<TableHead>Slug</TableHead>
										<TableHead>Owner ID</TableHead>
										<TableHead>Created</TableHead>
										<TableHead className="text-right">Actions</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{teams.length === 0 ? (
										<TableRow>
											<TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
												No teams found
											</TableCell>
										</TableRow>
									) : (
										teams.map((team: any) => (
											<TableRow key={team.id}>
												<TableCell>
													<div className="flex items-center gap-3">
														<div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
															{team.logoUrl ? (
																<img
																	src={team.logoUrl}
																	alt={team.name}
																	className="h-10 w-10 rounded-full object-cover"
																/>
															) : (
																<span className="text-sm font-medium">
																	{team.name[0].toUpperCase()}
																</span>
															)}
														</div>
														<div>
															<p className="font-medium">{team.name}</p>
															<p className="text-xs text-muted-foreground">{team.id.slice(0, 8)}</p>
														</div>
													</div>
												</TableCell>
												<TableCell>
													<code className="text-xs bg-muted px-2 py-1 rounded">{team.slug}</code>
												</TableCell>
												<TableCell className="font-mono text-xs">
													{team.ownerId.slice(0, 8)}...
												</TableCell>
												<TableCell className="text-muted-foreground">
													{new Date(team.createdAt).toLocaleDateString()}
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
															<DropdownMenuItem onClick={() => handleViewDetails(team)}>
																View Details
															</DropdownMenuItem>
															{/* TODO: Add suspend team mutation */}
															{/* <DropdownMenuItem onClick={() => handleSuspendTeam(team.id)}>
																<Ban className="h-4 w-4 mr-2" />
																Suspend Team
															</DropdownMenuItem> */}
															<DropdownMenuSeparator />
															<DropdownMenuItem
																onClick={() => handleDeleteTeam(team.id)}
																className="text-destructive"
															>
																<Trash2 className="h-4 w-4 mr-2" />
																Delete Team
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
								Showing {teams.length} of {totalCount} teams
							</p>
							<div className="flex gap-2">
								<Button
									variant="outline"
									size="sm"
									onClick={() => setPage(page - 1)}
									disabled={!pageInfo?.hasPreviousPage}
								>
									Previous
								</Button>
								<Button
									variant="outline"
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
						<DialogTitle>Team Details</DialogTitle>
						<DialogDescription>Detailed information about the team</DialogDescription>
					</DialogHeader>
					{selectedTeam && (
						<div className="space-y-4">
							<div className="flex items-center gap-4">
								<div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
									{selectedTeam.logoUrl ? (
										<img
											src={selectedTeam.logoUrl}
											alt={selectedTeam.name}
											className="h-20 w-20 rounded-full object-cover"
										/>
									) : (
										<span className="text-2xl font-medium">{selectedTeam.name[0].toUpperCase()}</span>
									)}
								</div>
								<div>
									<h3 className="text-xl font-semibold">{selectedTeam.name}</h3>
									<p className="text-muted-foreground">@{selectedTeam.slug}</p>
								</div>
							</div>

							{selectedTeam.description && (
								<div>
									<p className="text-sm font-medium text-muted-foreground">Description</p>
									<p className="mt-1">{selectedTeam.description}</p>
								</div>
							)}

							<div className="grid grid-cols-2 gap-4">
								<div>
									<p className="text-sm font-medium text-muted-foreground">Team ID</p>
									<p className="mt-1 font-mono text-sm">{selectedTeam.id}</p>
								</div>
								<div>
									<p className="text-sm font-medium text-muted-foreground">Owner ID</p>
									<p className="mt-1 font-mono text-sm">{selectedTeam.ownerId}</p>
								</div>
								<div>
									<p className="text-sm font-medium text-muted-foreground">Created</p>
									<p className="mt-1">{new Date(selectedTeam.createdAt).toLocaleString()}</p>
								</div>
							</div>
						</div>
					)}
				</DialogContent>
			</Dialog>
		</div>
	)
}
