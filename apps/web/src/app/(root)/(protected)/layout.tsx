import { Toaster } from 'sonner'

export default function ProtectedLayout({
	children,
}: {
	children: React.ReactNode
}) {
	return (
		<>
			{children}
			<Toaster position="top-right" richColors />
		</>
	)
}
