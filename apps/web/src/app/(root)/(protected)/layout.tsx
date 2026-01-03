'use client'

import { Suspense, useEffect, useRef } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Toaster } from 'sonner'
import { Loader2 } from 'lucide-react'
import { useAuth } from '@/packages/libs/auth'
import { clearAuthCookies } from '@/packages/utils'

export default function ProtectedLayout({
	children,
}: {
	children: React.ReactNode
}) {
	const { user, isLoading, isAuthenticated } = useAuth()
	const router = useRouter()
	const pathname = usePathname()
	const hasRedirectedRef = useRef(false)

	// Block rendering and redirect if not authenticated
	useEffect(() => {
		// Don't redirect while loading
		if (isLoading) {
			hasRedirectedRef.current = false
			return
		}

		// Prevent infinite redirects
		if (hasRedirectedRef.current) {
			return
		}

		// If user is not authenticated and we're on a protected route
		if (!isAuthenticated && !user) {
			// Prevent multiple redirects
			if (pathname !== '/auth/login' && pathname !== '/auth/register') {
				hasRedirectedRef.current = true
				// Clear any stale cookies
				clearAuthCookies()
				// Redirect to login
				router.replace('/auth/login')
			}
		} else {
			// Reset redirect flag if user is authenticated
			hasRedirectedRef.current = false
		}
	}, [isAuthenticated, user, isLoading, router, pathname])

	// Show loading state while checking authentication
	if (isLoading) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-background">
				<div className="flex flex-col items-center gap-4">
					<Loader2 className="h-8 w-8 animate-spin text-primary" />
					<p className="text-sm text-muted-foreground">Загрузка...</p>
				</div>
			</div>
		)
	}

	// Don't render content if not authenticated (show loading while redirecting)
	if (!isAuthenticated || !user) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-background">
				<div className="flex flex-col items-center gap-4">
					<Loader2 className="h-8 w-8 animate-spin text-primary" />
					<p className="text-sm text-muted-foreground">Перенаправление...</p>
				</div>
			</div>
		)
	}

	return (
		<>
			<Suspense fallback={null}>
				{children}
			</Suspense>
			<Toaster position="top-right" richColors />
		</>
	)
}
