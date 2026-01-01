'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Card } from '@/packages/components/ui/card'
import { Button } from '@/packages/components/ui/button'
import { Loader2, CreditCard, Lock, ArrowLeft } from 'lucide-react'

/**
 * Mock Payment Checkout Page
 *
 * This page simulates a payment provider checkout page for development/testing.
 * In production, users would be redirected to the actual payment provider (YooKassa/Stripe).
 */
export default function PaymentCheckoutPage() {
	const router = useRouter()
	const searchParams = useSearchParams()
	const [processing, setProcessing] = useState(false)

	const amount = searchParams.get('amount')
	const provider = searchParams.get('provider')
	const plan = searchParams.get('plan')
	const returnUrl = searchParams.get('return_url')
	const mock = searchParams.get('mock')

	const isMockMode = mock === 'true'

	useEffect(() => {
		// If not in mock mode, this page shouldn't be accessible
		if (!isMockMode) {
			router.push('/dashboard')
			return
		}
		
		// Replace current history entry to prevent back navigation to success page
		// This ensures that if user came from success page, it won't be in history
		window.history.replaceState({ fromCheckout: true }, '', window.location.href)
		
		// Push a dummy state before checkout to intercept back button
		// When user presses back, they'll go to this dummy state, which we'll redirect
		window.history.pushState({ interceptBack: true }, '', window.location.href)
		
		// Handle browser back button - redirect to settings instead of going back
		const handlePopState = (event: PopStateEvent) => {
			// Check if this is our intercept state
			if (event.state?.interceptBack) {
				// User pressed back - redirect to settings
				window.location.replace('/settings?tab=subscription')
				return
			}
			
			// If user somehow got here, redirect to settings
			// Use setTimeout to ensure redirect happens after popstate is processed
			setTimeout(() => {
				window.location.replace('/settings?tab=subscription')
			}, 0)
		}
		
		window.addEventListener('popstate', handlePopState)
		
		return () => {
			window.removeEventListener('popstate', handlePopState)
		}
	}, [isMockMode, router])

	const handlePayment = async () => {
		setProcessing(true)

		// Simulate payment processing
		await new Promise(resolve => setTimeout(resolve, 2000))

		// Redirect to success page using replace to prevent back navigation
		// This removes checkout page from browser history
		if (returnUrl) {
			try {
				// Parse returnUrl and ensure it has required parameters
				const url = new URL(returnUrl, window.location.origin)
				
				// Extract paymentId from existing URL if present, otherwise use mock
				let paymentId = url.searchParams.get('paymentId')
				if (!paymentId) {
					paymentId = `mock-${Date.now()}`
				}
				
				// Clean the URL path and rebuild with correct parameters
				// This prevents duplicate query parameters
				const cleanUrl = new URL('/payment/success', window.location.origin)
				cleanUrl.searchParams.set('success', 'true')
				cleanUrl.searchParams.set('paymentId', paymentId)
				cleanUrl.searchParams.set('fromCheckout', 'true')
				
				window.location.replace(cleanUrl.toString())
			} catch (error) {
				// If URL parsing fails, use fallback
				console.error('Failed to parse returnUrl:', error)
				window.location.replace(`/payment/success?success=true&paymentId=mock-${Date.now()}&fromCheckout=true`)
			}
		} else {
			// Use replace instead of push to remove checkout from history
			window.location.replace(`/payment/success?success=true&paymentId=mock-${Date.now()}&fromCheckout=true`)
		}
	}

	const handleCancel = () => {
		// Use window.location.replace to completely replace the current history entry
		// This prevents any navigation to success page from browser history
		window.location.replace('/settings?tab=subscription')
	}

	if (!isMockMode) {
		return null
	}

	return (
		<div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 relative">
			{/* Back Button */}
			{/* <Link 
				href="/settings?tab=subscription"
				className="absolute top-4 left-4 flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors z-10"
			>
				<ArrowLeft className="h-4 w-4" />
				<span>Назад</span>
			</Link> */}
			
			<Card className="max-w-md w-full p-8 space-y-6">
				{/* Mock Provider Logo */}
				<div className="flex justify-center">
					<div className="rounded-full bg-blue-100 dark:bg-blue-900 p-4">
						<CreditCard className="h-16 w-16 text-blue-600 dark:text-blue-400" />
					</div>
				</div>

				{/* Mock Provider Name */}
				<div className="text-center space-y-2">
					<h1 className="text-2xl font-bold">
						{provider === 'yookassa' ? 'ЮKassa' : provider === 'stripe' ? 'Stripe' : 'Payment'}
						{' '}(MOCK)
					</h1>
					<p className="text-muted-foreground text-sm">
						Development Mode - Имитация платежной страницы
					</p>
				</div>

				{/* Payment Details */}
				<div className="space-y-4 pt-4 border-t">
					<h2 className="font-semibold">Детали платежа</h2>
					<div className="bg-muted/50 rounded-lg p-4 space-y-2">
						{plan && (
							<div className="flex justify-between">
								<span className="text-muted-foreground">Тарифный план</span>
								<span className="font-semibold">{plan}</span>
							</div>
						)}
						<div className="flex justify-between">
							<span className="text-muted-foreground">Сумма</span>
							<span className="font-bold text-lg">{amount} ₽</span>
						</div>
						<div className="flex justify-between text-sm">
							<span className="text-muted-foreground">Провайдер</span>
							<span className="font-medium">{provider || 'unknown'}</span>
						</div>
					</div>
				</div>

				{/* Warning */}
				<div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-900 rounded-lg p-3">
					<div className="flex items-start gap-2">
						<Lock className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
						<div className="text-sm text-yellow-800 dark:text-yellow-200">
							<p className="font-semibold">Режим разработки</p>
							<p className="text-xs mt-1">
								Это имитация платежной страницы. В production здесь будет настоящая страница оплаты {provider === 'yookassa' ? 'ЮKassa' : provider === 'stripe' ? 'Stripe' : 'провайдера'}.
							</p>
						</div>
					</div>
				</div>

				{/* Action Buttons */}
				<div className="flex flex-col gap-3 pt-4">
					<Button
						onClick={handlePayment}
						disabled={processing}
						className="w-full"
						size="lg"
					>
						{processing ? (
							<>
								<Loader2 className="h-5 w-5 mr-2 animate-spin" />
								Обработка платежа...
							</>
						) : (
							<>
								<CreditCard className="h-5 w-5 mr-2" />
								Оплатить {amount} ₽
							</>
						)}
					</Button>
					<Button
						variant="outline"
						onClick={handleCancel}
						disabled={processing}
						className="w-full"
					>
						Отменить
					</Button>
				</div>

				{/* Info */}
				<div className="text-center text-xs text-muted-foreground pt-4 border-t">
					<p>Нажав "Оплатить", вы будете перенаправлены на страницу успеха.</p>
					<p className="mt-1">Реальный платеж НЕ будет произведен.</p>
				</div>
			</Card>
		</div>
	)
}
