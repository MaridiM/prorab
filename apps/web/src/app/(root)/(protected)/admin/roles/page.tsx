'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function RolesRedirectPage() {
	const router = useRouter()

	useEffect(() => {
		router.replace('/admin/settings?tab=roles')
	}, [router])

	return (
		<div className="flex items-center justify-center h-screen">
			<div className="text-center">
				<div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4" />
				<p className="text-muted-foreground">Redirecting to System Settings...</p>
			</div>
		</div>
	)
}
