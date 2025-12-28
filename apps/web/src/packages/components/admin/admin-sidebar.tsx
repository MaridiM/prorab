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
	Package,
	Wallet,
	Bell,
	Merge,
	ScrollText,
	LogOut,
	ChevronDown,
} from 'lucide-react'
import { cn } from '@/packages/utils'
import { useAuth } from '@/packages/libs/auth'
import { useRouter } from 'next/navigation'
import * as React from 'react'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/packages/components/ui/dropdown-menu'
import { UserAvatar } from '@/packages/components/ui/avatar'

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
		label: 'Team Operations',
		href: '/admin/teams/operations',
		icon: Merge,
		permission: 'teams:view',
	},
	{
		label: 'Communications',
		href: '/admin/communications',
		icon: Bell,
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
		label: 'Subscription Plans',
		href: '/admin/plans',
		icon: Package,
		permission: 'plans:view',
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
		label: 'Team Audit',
		href: '/admin/audit',
		icon: ScrollText,
		permission: 'settings:view',
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
	const router = useRouter()
	const { user, logout } = useAuth()
	const [open, setOpen] = React.useState(false)

	// Show all nav items - permissions are checked at page level
	// This allows users to see all available admin pages
	const visibleItems = navItems

	const handleLogout = async () => {
		try {
			await logout()
			router.push('/auth/login')
		} catch (error) {
			console.error('Logout failed:', error)
		}
	}

	const handleNavigate = (path: string) => {
		router.push(path)
		setOpen(false)
	}

	if (!user) return null

	return (
		<aside className="w-64 border-r bg-card shrink-0 sticky top-0 h-screen flex flex-col">
			<div className="flex h-16 items-center border-b px-6 shrink-0">
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

			<div className="border-t bg-card p-4 shrink-0 relative">
				<DropdownMenu open={open} onOpenChange={setOpen}>
					<DropdownMenuTrigger asChild>
						<button
							type="button"
							className={cn(
								"flex items-center gap-3 w-full rounded-lg p-2 transition-all cursor-pointer",
								"focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
							)}
						>
							<UserAvatar user={user} size="sm" />
							<div className="flex-1 overflow-hidden text-left min-w-0">
								<p className="text-sm font-medium truncate">{user?.fullName || 'Admin'}</p>
								<p className="text-xs text-muted-foreground truncate">{user?.email}</p>
							</div>
							<ChevronDown
								className={cn(
									"h-4 w-4 text-muted-foreground shrink-0 transition-transform",
									open && "rotate-180"
								)}
							/>
						</button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end" className="w-56 z-50" side="top" sideOffset={8}>
						{/* User Info */}
						<div className="px-3 py-2">
							<p className="text-sm font-medium truncate">
								{user?.fullName || 'Admin'}
							</p>
							<p className="text-xs text-muted-foreground truncate">
								{user?.email}
							</p>
						</div>
						
						<DropdownMenuSeparator />
						
						{/* Menu Items */}
						<DropdownMenuItem onClick={() => handleNavigate('/dashboard')}>
							<LayoutDashboard className="w-4 h-4 mr-2" />
							Дашборд
						</DropdownMenuItem>
						
						<DropdownMenuItem onClick={() => handleNavigate('/settings')}>
							<Settings className="w-4 h-4 mr-2" />
							Настройки
						</DropdownMenuItem>
						
						<DropdownMenuSeparator />
						
						<DropdownMenuItem 
							onClick={handleLogout} 
							className="text-destructive focus:text-destructive hover:bg-transparent focus:bg-transparent"
						>
							<LogOut className="w-4 h-4 mr-2" />
							Выход
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</div>
		</aside>
	)
}
