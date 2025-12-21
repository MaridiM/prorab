import { Suspense } from 'react'
import { Toaster } from 'sonner'

export default function ProtectedLayout({
	children,
}: {
	children: React.ReactNode
}) {
	return (
		<>
			<Suspense fallback={null}>
				{children}
			</Suspense>
			<Toaster position="top-right" richColors />
		</>
	)
}
