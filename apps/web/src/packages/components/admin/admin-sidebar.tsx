'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import {
	LayoutDashboard,
	Settings,
	Users,
	Building2,
	FolderKanban,
	CreditCard,
	Ticket,
	Shield,
	FileText,
	BarChart3,
	HardDrive,
	ChevronRight,
	Repeat,
} from 'lucide-react'
import { cn } from '@/packages/utils'
import { useAuth } from '@/packages/libs/auth'

interface NavItem {
	label: string
	href: string
	icon: React.ComponentType<{ className?: string }>
	permission?: string
}

const navItems: NavItem[] = [
	{
		label: 'Dashboard',
		href: '/admin',
		icon: LayoutDashboard,
	},
	{
		label: 'System Settings',
		href: '/admin/settings',
		icon: Settings,
		permission: 'settings:view',
	},
	{
		label: 'Storage',
		href: '/admin/storage',
		icon: HardDrive,
		permission: 'storage:view',
	},
	{
		label: 'Users',
		href: '/admin/users',
		icon: Users,
		permission: 'users:view',
	},
	{
		label: 'Teams',
		href: '/admin/teams',
		icon: Building2,
		permission: 'teams:view',
	},
	{
		label: 'Projects',
		href: '/admin/projects',
		icon: FolderKanban,
		permission: 'projects:view',
	},
	{
		label: 'Subscriptions',
		href: '/admin/subscriptions',
		icon: Repeat,
		permission: 'subscriptions:view',
	},
	{
		label: 'Payments',
		href: '/admin/payments',
		icon: CreditCard,
		permission: 'payments:view',
	},
	{
		label: 'Support Tickets',
		href: '/admin/support',
		icon: Ticket,
		permission: 'support_tickets:view',
	},
	{
		label: 'Admin Roles',
		href: '/admin/roles',
		icon: Shield,
		permission: 'admin_roles:view',
	},
	{
		label: 'Audit Logs',
		href: '/admin/logs',
		icon: FileText,
		permission: 'audit_logs:view',
	},
	{
		label: 'Analytics',
		href: '/admin/analytics',
		icon: BarChart3,
		permission: 'analytics:view',
	},
]

export function AdminSidebar() {
	const pathname = usePathname()
	const { user } = useAuth()

	// Show all nav items - permissions are checked at page level
	// This allows users to see all available admin pages
	const visibleItems = navItems

	return (
		<aside className="w-64 border-r bg-card flex-shrink-0 sticky top-0 h-screen flex flex-col">
			<div className="flex h-16 items-center border-b px-6 flex-shrink-0">
				<div className="flex items-center gap-2">
					<Shield className="h-6 w-6 text-primary" />
					<div>
						<h2 className="font-semibold">Admin Panel</h2>
						<p className="text-xs text-muted-foreground">ProRab.space</p>
					</div>
				</div>
			</div>

			<nav className="space-y-1 p-4 flex-1 overflow-y-auto">
				{visibleItems.map((item) => {
					const Icon = item.icon
					// Dashboard should only be active when pathname exactly matches /admin
					// Other items are active when pathname matches or starts with their href
					const isActive = item.href === '/admin'
						? pathname === item.href
						: pathname === item.href || pathname?.startsWith(item.href + '/')

					return (
						<Link
							key={item.href}
							href={item.href}
							className={cn(
								'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
								isActive
									? 'bg-primary text-primary-foreground'
									: 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
							)}
						>
							<Icon className="h-4 w-4" />
							<span className="flex-1">{item.label}</span>
							{isActive && <ChevronRight className="h-4 w-4" />}
						</Link>
					)
				})}
			</nav>

			<div className="border-t bg-card p-4 flex-shrink-0">
				<div className="flex items-center gap-3">
					<div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium">
						{user?.fullName?.charAt(0) || 'A'}
					</div>
					<div className="flex-1 overflow-hidden">
						<p className="text-sm font-medium truncate">{user?.fullName || 'Admin'}</p>
						<p className="text-xs text-muted-foreground truncate">{user?.email}</p>
					</div>
				</div>
			</div>
		</aside>
	)
}
