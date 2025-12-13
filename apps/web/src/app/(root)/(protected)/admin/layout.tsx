'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery } from '@apollo/client/react'
import { SystemSettingsDocument } from '@/packages/api/graphql'
import { AdminSidebar } from '@/packages/components/admin/admin-sidebar'
import { Skeleton } from '@/packages/components/ui/skeleton'
import { AlertCircle, Shield } from 'lucide-react'
import { Button } from '@/packages/components/ui/button'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
	const router = useRouter()

	// Check if user has admin access by trying to fetch admin data
	const { data, loading, error } = useQuery(SystemSettingsDocument, {
		variables: { category: null },
		fetchPolicy: 'network-only',
		errorPolicy: 'all',
	})

	useEffect(() => {
		if (!loading && error) {
			// If query fails, user doesn't have admin access
			router.push('/dashboard')
		}
	}, [loading, error, router])

	// Show loading state while checking permissions
	if (loading) {
		return (
			<div className="flex h-screen bg-background">
				<div className="w-64 border-r border-border/30 bg-card/50">
					<Skeleton className="h-full w-full" />
				</div>
				<main className="flex-1 flex items-center justify-center">
					<div className="text-center">
						<Shield className="w-12 h-12 text-muted-foreground mx-auto mb-4 animate-pulse" />
						<p className="text-muted-foreground">Проверка доступа...</p>
					</div>
				</main>
			</div>
		)
	}

	// Show error if not authorized (before redirect)
	if (error) {
		return (
			<div className="flex h-screen bg-background items-center justify-center">
				<div className="text-center max-w-md p-6">
					<div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4">
						<AlertCircle className="w-8 h-8 text-red-500" />
					</div>
					<h2 className="text-2xl font-bold mb-2">Доступ запрещён</h2>
					<p className="text-muted-foreground mb-6">
						У вас нет прав администратора для доступа к этой странице
					</p>
					<Button onClick={() => router.push('/dashboard')}>
						Вернуться на главную
					</Button>
				</div>
			</div>
		)
	}

	// User has admin access, render admin layout
	return (
		<div className="flex h-screen bg-background">
			<AdminSidebar />
			<main className="flex-1 overflow-y-auto">
				<div className="container mx-auto p-6">{children}</div>
			</main>
		</div>
	)
}
