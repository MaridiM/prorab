'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useQuery, useMutation } from '@apollo/client/react'
import { Card } from '@/packages/components/ui/card'
import { Button } from '@/packages/components/ui/button'
import { Alert, AlertDescription } from '@/packages/components/ui/alert'
import { Check, CheckCircle2, Download, ArrowRight, LayoutDashboard, Crown, Sparkles } from 'lucide-react'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale/ru'
import Link from 'next/link'
import { MySubscriptionDocument, ConfirmMockPaymentDocument } from '@/packages/api/graphql'
import { PageLoader } from '@/packages/components/ui/spinner'
import { motion, AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'
import { cn } from '@/packages/utils'

export default function PaymentSuccessPage() {
	const router = useRouter()
	const searchParams = useSearchParams()
	const [countdown, setCountdown] = useState(5)
	const [hasRedirected, setHasRedirected] = useState(false)
	const [isValid, setIsValid] = useState(false) // Track if page should be shown

	const { data: subscriptionData, loading: subscriptionLoading, refetch: refetchSubscription } = useQuery(MySubscriptionDocument)
	const [confirmMockPayment] = useMutation(ConfirmMockPaymentDocument)

	// Confetti effect
	const triggerConfetti = () => {
		const duration = 3000
		const animationEnd = Date.now() + duration
		const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 }

		function randomInRange(min: number, max: number) {
			return Math.random() * (max - min) + min
		}

		const interval: NodeJS.Timeout = setInterval(function () {
			const timeLeft = animationEnd - Date.now()

			if (timeLeft <= 0) {
				return clearInterval(interval)
			}

			const particleCount = 50 * (timeLeft / duration)

			// Left side
			confetti({
				...defaults,
				particleCount,
				origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
			})
			// Right side
			confetti({
				...defaults,
				particleCount,
				origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
			})
		}, 250)
	}

	// Check if payment was cancelled or if user navigated here accidentally
	useEffect(() => {
		const cancelled = searchParams.get('cancelled')
		const cancel = searchParams.get('cancel')
		const paymentId = searchParams.get('paymentId')

		// If payment was cancelled, redirect back to settings
		if (cancelled === 'true' || cancel === 'true') {
			router.replace('/settings?tab=subscription')
			return
		}

		// Only show success page if we have paymentId
		if (!paymentId) {
			router.replace('/settings?tab=subscription')
			return
		}

		const cleanPaymentId = paymentId.split('?')[0].split('&')[0].trim()

		// If we reach here, parameters are valid - allow page to show
		setIsValid(true)

		// Trigger confetti on success load
		triggerConfetti()

		// Try to confirm payment
		if (cleanPaymentId && !cleanPaymentId.startsWith('mock-')) {
			confirmMockPayment({ variables: { paymentId: cleanPaymentId } })
				.then(() => {
					refetchSubscription()
				})
				.catch((error: any) => {
					console.log('Payment confirmation result:', error?.message || error)
					refetchSubscription()
				})
		} else {
			refetchSubscription()
		}
	}, [searchParams, router, confirmMockPayment, refetchSubscription])

	// Prevent back navigation
	useEffect(() => {
		window.history.replaceState({ fromSuccess: true }, '', window.location.href)
		const handlePopState = () => {
			window.location.replace('/dashboard')
		}
		window.addEventListener('popstate', handlePopState)
		return () => {
			window.removeEventListener('popstate', handlePopState)
		}
	}, [])

	// Auto-redirect
	useEffect(() => {
		if (!isValid || hasRedirected) return

		const timer = setInterval(() => {
			setCountdown((prev) => {
				if (prev <= 1) {
					clearInterval(timer)
					setHasRedirected(true)
					setTimeout(() => {
						router.push('/dashboard')
					}, 0)
					return 0
				}
				return prev - 1
			})
		}, 1000)

		return () => clearInterval(timer)
	}, [router, hasRedirected, isValid])

	if (!isValid) {
		return <PageLoader text="Перенаправление..." />
	}

	if (subscriptionLoading) {
		return <PageLoader text="Загрузка..." />
	}

	const subscription = subscriptionData?.mySubscription

	return (
		<div className="min-h-screen flex items-center justify-center p-6 bg-background relative overflow-hidden">
			{/* Animated Background */}
			<div className="absolute inset-0 pointer-events-none overflow-hidden">
				<motion.div
					className="absolute top-0 left-1/4 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl"
					animate={{
						x: [0, 100, 0],
						y: [0, 50, 0],
						scale: [1, 1.1, 1]
					}}
					transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
				/>
				<motion.div
					className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-accent/5 rounded-full blur-3xl"
					animate={{
						x: [0, -80, 0],
						y: [0, -60, 0],
						scale: [1, 1.15, 1]
					}}
					transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
				/>
			</div>

			<AnimatePresence>
				<motion.div
					initial={{ opacity: 0, scale: 0.9, y: 20 }}
					animate={{ opacity: 1, scale: 1, y: 0 }}
					transition={{
						type: "spring",
						stiffness: 200,
						damping: 20,
						duration: 0.8
					}}
					className="relative z-10 w-full max-w-lg"
				>
					<Card className="overflow-hidden border-2 border-primary/20 bg-card/80 backdrop-blur-xl shadow-2xl relative">
						{/* Top decorative line */}
						<div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-primary via-blue-500 to-indigo-500" />

						<div className="p-8 md:p-10 flex flex-col items-center text-center space-y-6">
							{/* Success Animation Circle */}
							<motion.div
								initial={{ scale: 0 }}
								animate={{ scale: [0, 1.2, 1] }}
								transition={{ delay: 0.2, duration: 0.6 }}
								className="relative group"
							>
								<div className="absolute inset-0 bg-primary/20 rounded-full blur-xl group-hover:blur-2xl transition-all duration-500" />
								<div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-primary to-blue-600 shadow-lg shadow-primary/30">
									<Check className="h-12 w-12 text-white" strokeWidth={3} />
								</div>

								{/* Floating particles */}
								{[...Array(6)].map((_, i) => (
									<motion.div
										key={i}
										className="absolute w-2 h-2 bg-primary rounded-full"
										initial={{ opacity: 0, x: 0, y: 0 }}
										animate={{
											opacity: [0, 1, 0],
											x: (Math.random() - 0.5) * 100,
											y: (Math.random() - 0.5) * 100
										}}
										transition={{
											duration: 2,
											repeat: Infinity,
											delay: i * 0.2,
											ease: "easeOut"
										}}
										style={{ top: '50%', left: '50%' }}
									/>
								))}
							</motion.div>

							<div className="space-y-2">
								<motion.h1
									className="text-3xl font-bold tracking-tight"
									initial={{ opacity: 0, y: 10 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ delay: 0.4 }}
								>
									Оплата прошла успешно!
								</motion.h1>
								<motion.p
									className="text-muted-foreground text-lg"
									initial={{ opacity: 0, y: 10 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ delay: 0.5 }}
								>
									Подписка активирована. Спасибо за выбор ProRab.
								</motion.p>
							</div>

							{/* Subscription Details Card */}
							{subscription && (
								<motion.div
									initial={{ opacity: 0, y: 20 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ delay: 0.6 }}
									className="w-full bg-secondary/30 rounded-2xl p-4 border border-border/50 flex items-center gap-4"
								>
									<div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/20">
										<Crown className="w-6 h-6 text-white" />
									</div>
									<div className="flex-1 text-left">
										<p className="text-sm text-muted-foreground font-medium">Ваш тариф</p>
										<div className="flex items-center gap-2">
											<p className="font-bold text-lg">{subscription.plan}</p>
											<div className="px-2 py-0.5 rounded-full bg-green-500/10 text-green-600 dark:text-green-400 text-xs font-bold border border-green-500/20 flex items-center gap-1">
												<Sparkles className="w-3 h-3" />
												Активен
											</div>
										</div>
									</div>
								</motion.div>
							)}

							<motion.div
								className="w-full pt-4 space-y-4"
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: 0.7 }}
							>
								<Button
									className="w-full h-12 text-base font-semibold rounded-xl shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300"
									onClick={() => {
										setHasRedirected(true)
										router.push('/dashboard')
									}}
								>
									<LayoutDashboard className="h-5 w-5 mr-2" />
									Перейти в дашборд
								</Button>

								<p className="text-sm text-muted-foreground">
									Автоматический переход через <span className="font-mono font-bold text-primary">{countdown}</span> сек
								</p>
							</motion.div>
						</div>
					</Card>
				</motion.div>
			</AnimatePresence>
		</div>
	)
}
