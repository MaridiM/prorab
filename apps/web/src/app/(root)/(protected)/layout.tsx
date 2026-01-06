'use client'

import { Suspense, useEffect, useRef } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Toaster } from 'sonner'
import { PageLoader } from '@/packages/components/ui/spinner'
import { useAuth } from '@/packages/libs/auth'
import { clearAuthCookies } from '@/packages/utils'
import { DonationFloatingButton } from '@/packages/components/donations'

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
		// This handles both cases: user === null and isAuthenticated === false
		// Including when GraphQL returns { data: { me: null } }
		if (!isAuthenticated && !user) {
			// Prevent multiple redirects
			if (pathname !== '/auth/login' && pathname !== '/auth/register') {
				hasRedirectedRef.current = true
				// Clear any stale cookies
				clearAuthCookies()
				// Redirect to login immediately
				router.replace('/auth/login')
			}
		} else {
			// Reset redirect flag if user is authenticated
			hasRedirectedRef.current = false
		}
	}, [isAuthenticated, user, isLoading, router, pathname])

	// Show loading state while checking authentication
	if (isLoading) {
		return <PageLoader text="Загрузка..." />
	}

	// Don't render content if not authenticated (show loading while redirecting)
	// But only show redirect message if we haven't redirected yet
	if ((!isAuthenticated || !user) && !hasRedirectedRef.current) {
		return <PageLoader text="Перенаправление..." />
	}

	// If we've redirected but still showing this component, show loading
	// This prevents flash of content before redirect completes
	if ((!isAuthenticated || !user) && hasRedirectedRef.current) {
		return <PageLoader text="Перенаправление..." />
	}

	// Don't show donation button on donation success page
	const showDonationButton = !pathname?.includes('/donation/success')

	return (
		<>
			<Suspense fallback={null}>
				{children}
			</Suspense>
			{showDonationButton && <DonationFloatingButton />}
			<Toaster position="top-right" richColors />
		</>
	)
}
