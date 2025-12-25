'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function PaymentProvidersRedirectPage() {
	const router = useRouter()

	useEffect(() => {
		// Redirect to new location with providers tab
		router.replace('/admin/settings?tab=providers')
	}, [router])

	return (
		<div className="flex items-center justify-center h-96">
			<div className="text-center">
				<p className="text-muted-foreground">Redirecting to System Settings...</p>
			</div>
		</div>
	)
}
