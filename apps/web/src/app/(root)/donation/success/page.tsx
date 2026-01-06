'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useQuery } from '@apollo/client/react'
import { gql } from '@apollo/client'
import { motion } from 'framer-motion'
import { Button } from '@/packages/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/packages/components/ui/card'
import { Skeleton } from '@/packages/components/ui/skeleton'
import { CheckCircle, Heart, ArrowLeft, Star, Loader2 } from 'lucide-react'
import Link from 'next/link'
import confetti from 'canvas-confetti'
import { PageLoader } from '@/packages/components/ui/spinner'

const GET_DONATION = gql`
	query GetDonation($id: ID!) {
		donation(id: $id) {
			id
			amount
			currency
			status
			message
			donorName
			isAnonymous
			paidAt
			createdAt
		}
	}
`

function DonationSuccessContent() {
	const router = useRouter()
	const searchParams = useSearchParams()
	const donationId = searchParams.get('donationId')
	const [showConfetti, setShowConfetti] = useState(false)
	const [isValid, setIsValid] = useState(false)
	const [countdown, setCountdown] = useState(5)
	const [hasRedirected, setHasRedirected] = useState(false)

	// Query for donation status
	const { data, loading, error, stopPolling } = useQuery(GET_DONATION, {
		variables: { id: donationId },
		skip: !donationId,
		pollInterval: 5000,
		notifyOnNetworkStatusChange: false,
	})

	// Check if page should be shown
	useEffect(() => {
		if (!donationId) {
			router.replace('/settings')
			return
		}
		setIsValid(true)
	}, [searchParams, router, donationId])

	// Stop polling once donation is succeeded or if there's an error
	useEffect(() => {
		if (data?.donation?.status === 'SUCCEEDED' || error) {
			stopPolling()
		}
	}, [data?.donation?.status, error, stopPolling])

	// Prevent back navigation from success page
	useEffect(() => {
		if (!isValid) return
		
		window.history.replaceState({ fromSuccess: true }, '', window.location.href)
		
		const handlePopState = () => {
			window.location.replace('/dashboard')
		}
		
		window.addEventListener('popstate', handlePopState)
		
		return () => {
			window.removeEventListener('popstate', handlePopState)
		}
	}, [isValid])

	// Trigger confetti on success
	useEffect(() => {
		if (data?.donation?.status === 'SUCCEEDED' && !showConfetti && isValid) {
			setShowConfetti(true)
			confetti({
				particleCount: 100,
				spread: 70,
				origin: { y: 0.6 },
				colors: ['#9333ea', '#ec4899', '#f97316', '#eab308'],
			})
		}
	}, [data?.donation?.status, showConfetti, isValid])

	// Show celebration even without donation data
	useEffect(() => {
		if (!donationId && !showConfetti && isValid) {
			setShowConfetti(true)
			confetti({
				particleCount: 100,
				spread: 70,
				origin: { y: 0.6 },
				colors: ['#9333ea', '#ec4899', '#f97316', '#eab308'],
			})
		}
	}, [donationId, showConfetti, isValid])

	// Auto-redirect countdown
	useEffect(() => {
		// Only start countdown if page is valid and not already redirected
		if (!isValid || hasRedirected || loading) return

		// Countdown timer for auto-redirect
		const timer = setInterval(() => {
			setCountdown((prev) => {
				if (prev <= 1) {
					clearInterval(timer)
					setHasRedirected(true)
					// Use setTimeout to defer router.push outside of state update
					setTimeout(() => {
						router.push('/dashboard')
					}, 0)
					return 0
				}
				return prev - 1
			})
		}, 1000)

		return () => clearInterval(timer)
	}, [router, hasRedirected, isValid, loading])

	// Don't render anything if page is not valid (will redirect)
	if (!isValid) {
		return <PageLoader text="Перенаправление..." />
	}

	const donation = data?.donation

	return (
		<div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 dark:from-gray-900 dark:via-purple-950 dark:to-gray-900 flex items-center justify-center p-4">
			<motion.div
				initial={{ opacity: 0, scale: 0.9 }}
				animate={{ opacity: 1, scale: 1 }}
				transition={{ duration: 0.5 }}
				className="w-full max-w-lg"
			>
				<Card className="border-purple-200 dark:border-purple-800 shadow-2xl shadow-purple-500/20">
					<CardHeader className="text-center pb-4">
						<motion.div
							initial={{ scale: 0 }}
							animate={{ scale: 1 }}
							transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
							className="mx-auto mb-4"
						>
							<div className="w-24 h-24 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
								{loading ? (
									<Loader2 className="w-12 h-12 text-white animate-spin" />
								) : (
									<CheckCircle className="w-14 h-14 text-white" />
								)}
							</div>
						</motion.div>

						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.3 }}
						>
							<CardTitle className="text-2xl sm:text-3xl bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
								{loading ? 'Обрабатываем платёж...' : 'Спасибо за вашу поддержку!'}
							</CardTitle>
							<CardDescription className="text-base mt-2">
								{loading
									? 'Пожалуйста, подождите...'
									: 'Ваш донат помогает нам развивать ProRab.space'}
							</CardDescription>
						</motion.div>
					</CardHeader>

					<CardContent className="space-y-6">
						{loading ? (
							<div className="space-y-4">
								<Skeleton className="h-16 w-full rounded-xl" />
								<Skeleton className="h-12 w-full rounded-xl" />
							</div>
						) : (
							<>
								{/* Donation amount display */}
								{donation && (
									<motion.div
										initial={{ opacity: 0, y: 20 }}
										animate={{ opacity: 1, y: 0 }}
										transition={{ delay: 0.4 }}
										className="text-center py-4 px-6 rounded-xl bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30"
									>
										<p className="text-sm text-muted-foreground mb-1">Сумма доната</p>
										<p className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
											{donation.amount} {donation.currency === 'RUB' ? '₽' : donation.currency}
										</p>
										{donation.message && (
											<p className="mt-3 text-sm text-muted-foreground italic">
												"{donation.message}"
											</p>
										)}
									</motion.div>
								)}

								{/* Badge notification */}
								<motion.div
									initial={{ opacity: 0, y: 20 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ delay: 0.5 }}
									className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-amber-100 to-yellow-100 dark:from-amber-900/30 dark:to-yellow-900/30 border border-amber-300 dark:border-amber-700"
								>
									<div className="w-12 h-12 rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 flex items-center justify-center flex-shrink-0">
										<Star className="w-6 h-6 text-white fill-white" />
									</div>
									<div>
										<p className="font-semibold text-amber-800 dark:text-amber-200">
											Бейдж благодарности получен!
										</p>
										<p className="text-sm text-amber-700 dark:text-amber-300">
											Теперь на вашем аватаре будет отображаться специальный бейдж
										</p>
									</div>
								</motion.div>

								{/* Thank you message */}
								<motion.div
									initial={{ opacity: 0, y: 20 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ delay: 0.6 }}
									className="text-center text-muted-foreground"
								>
									<Heart className="w-6 h-6 mx-auto mb-2 text-pink-500" />
									<p className="text-sm">
										Мы отправили благодарственное письмо на вашу почту.
										<br />
										Ваш вклад очень важен для нас!
									</p>
								</motion.div>

								{/* Back button */}
								<motion.div
									initial={{ opacity: 0, y: 20 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ delay: 0.7 }}
									className="flex flex-col gap-3"
								>
									<Button
										variant="outline"
										className="w-full"
										onClick={() => {
											setHasRedirected(true)
											router.push('/settings')
										}}
									>
										<ArrowLeft className="w-4 h-4 mr-2" />
										Вернуться в настройки
									</Button>
									<Button
										className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
										onClick={() => {
											setHasRedirected(true)
											router.push('/dashboard')
										}}
									>
										Перейти в дашборд
									</Button>
								</motion.div>

								{/* Auto-redirect Notice */}
								{!hasRedirected && (
									<motion.div
										initial={{ opacity: 0, y: 20 }}
										animate={{ opacity: 1, y: 0 }}
										transition={{ delay: 0.8 }}
										className="text-center text-sm text-muted-foreground pt-4 border-t"
									>
										Автоматический переход на дашборд через {countdown} сек...
										<br />
										<Button
											variant="link"
											size="sm"
											onClick={() => {
												setHasRedirected(true)
												router.push('/dashboard')
											}}
											className="mt-2"
										>
											Перейти сейчас
										</Button>
									</motion.div>
								)}
							</>
						)}
					</CardContent>
				</Card>
			</motion.div>
		</div>
	)
}

// Loading fallback
function DonationSuccessFallback() {
	return (
		<div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 dark:from-gray-900 dark:via-purple-950 dark:to-gray-900 flex items-center justify-center p-4">
			<Card className="w-full max-w-lg">
				<CardHeader className="text-center pb-4">
					<Skeleton className="h-24 w-24 rounded-full mx-auto mb-4" />
					<Skeleton className="h-8 w-64 mx-auto mb-2" />
					<Skeleton className="h-4 w-48 mx-auto" />
				</CardHeader>
				<CardContent className="space-y-4">
					<Skeleton className="h-16 w-full rounded-xl" />
					<Skeleton className="h-12 w-full rounded-xl" />
				</CardContent>
			</Card>
		</div>
	)
}

// Export with Suspense wrapper for useSearchParams
export default function DonationSuccessPage() {
	return (
		<Suspense fallback={<DonationSuccessFallback />}>
			<DonationSuccessContent />
		</Suspense>
	)
}
