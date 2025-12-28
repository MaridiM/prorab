'use client'

import { Suspense, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Toaster } from 'sonner'
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

	// Block rendering and redirect if not authenticated
	useEffect(() => {
		// Don't redirect while loading
		if (isLoading) return

		// If user is not authenticated and we're on a protected route
		if (!isAuthenticated && !user) {
			// Clear any stale cookies
			clearAuthCookies()
			// Redirect to login
			router.replace('/auth/login')
		}
	}, [isAuthenticated, user, isLoading, router, pathname])

	// Show loading state while checking authentication
	if (isLoading) {
		return null
	}

	// Don't render content if not authenticated (show nothing while redirecting)
	if (!isAuthenticated || !user) {
		return null
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
