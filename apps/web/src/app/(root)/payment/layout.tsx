import { Toaster } from 'sonner'

export default function PaymentLayout({
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
