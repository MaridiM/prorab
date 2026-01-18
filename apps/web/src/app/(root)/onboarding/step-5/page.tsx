'use client'

import { motion, Variants, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Check, Loader2, Crown, FolderOpen, Users, HardDrive, ChevronDown, Gift, Zap, Star } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useQuery, useMutation } from '@apollo/client/react'
import { apolloClient } from '@/packages/libs/apollo/apollo-client.config'
import { AvailablePlansDetailedDocument, CompleteOnboardingDocument, IsEarlyBirdAvailableForMeDocument, EarlyBirdStatsDocument, MeDocument, type CompleteOnboardingInput } from '@/packages/api/graphql'
import { Stepper } from '@/packages/components/ui/stepper'
import { Button, Card } from '@/packages/components'
import { Badge } from '@/packages/components/ui/badge'
import { Alert, AlertDescription } from '@/packages/components/ui/alert'
import { cn } from '@/packages/utils'
import confetti from 'canvas-confetti'

const fadeIn: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.5,
            ease: [0.22, 0.61, 0.36, 1] as const
        }
    }
}

const steps = [
    { id: 1, label: 'Название' },
    { id: 2, label: 'Логотип' },
    { id: 3, label: 'Объект' },
    { id: 4, label: 'Детали' },
    { id: 5, label: 'Тариф' },
]

export default function OnboardingStep5Page() {
    const router = useRouter()
    const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isCompleted, setIsCompleted] = useState(false)
    const [teamName, setTeamName] = useState('')
    const [isValidating, setIsValidating] = useState(true)
    const [error, setError] = useState<string | null>(null)

    // Track expanded state for features accordion
    const [expandedPlanIds, setExpandedPlanIds] = useState<Set<string>>(new Set())

    const { data: plansData, loading: plansLoading } = useQuery(AvailablePlansDetailedDocument, {
        client: apolloClient,
    })

    const { data: earlyBirdForMeData } = useQuery(IsEarlyBirdAvailableForMeDocument, {
        client: apolloClient,
        fetchPolicy: 'cache-and-network',
    })

    const { data: earlyBirdStatsData } = useQuery(EarlyBirdStatsDocument, {
        client: apolloClient,
        fetchPolicy: 'cache-and-network',
    })

    const { data: meData } = useQuery(MeDocument, {
        client: apolloClient,
        fetchPolicy: 'cache-and-network',
    })

    const [completeOnboarding] = useMutation(CompleteOnboardingDocument, {
        client: apolloClient,
    })

    // Load data from localStorage and validate previous steps
    useEffect(() => {
        if (typeof window === 'undefined') return

        // Validate Step 1 completion
        const step1Data = localStorage.getItem('onboarding_step1')
        if (!step1Data) {
            console.warn('Step 1 not completed, redirecting...')
            router.push('/onboarding/step-1')
            return
        }

        // Validate Step 2 completion
        const step2Data = localStorage.getItem('onboarding_step2')
        if (!step2Data) {
            console.warn('Step 2 not completed, redirecting...')
            router.push('/onboarding/step-2')
            return
        }

        // Validate Step 3 completion
        const step3Data = localStorage.getItem('onboarding_step3')
        if (!step3Data) {
            console.warn('Step 3 not completed, redirecting...')
            router.push('/onboarding/step-3')
            return
        }

        // Validate Step 4 completion
        const step4Data = localStorage.getItem('onboarding_step4')
        if (!step4Data) {
            console.warn('Step 4 not completed, redirecting...')
            router.push('/onboarding/step-4')
            return
        }

        try {
            const data = JSON.parse(step1Data)
            if (!data.name) {
                console.warn('Step 1 incomplete: missing team name')
                router.push('/onboarding/step-1')
                return
            }
            setTeamName(data.name)
        } catch (error) {
            console.error('Failed to parse step 1 data:', error)
            router.push('/onboarding/step-1')
            return
        }

        // Load step 5 data if exists
        const step5Data = localStorage.getItem('onboarding_step5')
        if (step5Data) {
            try {
                const data = JSON.parse(step5Data)
                setSelectedPlanId(data.planId)
            } catch (error) {
                console.error('Failed to parse step 5 data:', error)
            }
        }

        setIsValidating(false)
    }, [router])

    const togglePlanExpansion = (planId: string) => {
        setExpandedPlanIds(prev => {
            const next = new Set(prev)
            if (next.has(planId)) {
                next.delete(planId)
            } else {
                next.add(planId)
            }
            return next
        })
    }

    // Confetti effect function
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

    // This function is now triggered directly by the "Select" button
    const handleSelectAndProceed = async (planId: string) => {
        if (isSubmitting) return

        setSelectedPlanId(planId)
        setIsSubmitting(true)
        setError(null)

        try {
            // Save selection to localStorage
            localStorage.setItem('onboarding_step5', JSON.stringify({ planId }))

            // Get data from previous steps
            const step1Data = JSON.parse(localStorage.getItem('onboarding_step1') || '{}')
            const step2Data = JSON.parse(localStorage.getItem('onboarding_step2') || '{}')
            const step3Data = JSON.parse(localStorage.getItem('onboarding_step3') || '{}')
            const step4Data = JSON.parse(localStorage.getItem('onboarding_step4') || '{}')

            // Prepare mutation input
            // Handle budget properly - it could be a number or string
            const parsedBudget = typeof step4Data.budget === 'number'
                ? step4Data.budget
                : parseFloat(step4Data.budget) || 0

            const input: CompleteOnboardingInput = {
                teamName: step1Data.name,
                projectName: step3Data.name,
                projectAddress: step3Data.address || null,
                projectDescription: step3Data.description || null,
                // New fields from Step 4
                projectBudget: parsedBudget,
                projectStartDate: step4Data.startDate || null,
                projectEndDate: step4Data.endDate || null,

                colorId: step2Data.colorId || null,
                iconId: step2Data.iconId || null,
                planId: planId,
                cancelUrl: window.location.href, // Redirect back to this step on cancel
                logoFile: null // Initialize properly
            }

            // Add logo data based on step 2
            if (step2Data.hasUploadedLogo && step2Data.logoBase64) {
                // Convert base64 data URL to File object for upload
                try {
                    // Extract base64 string from data URL (format: data:image/png;base64,...)
                    const base64String = step2Data.logoBase64.includes(',')
                        ? step2Data.logoBase64.split(',')[1]
                        : step2Data.logoBase64

                    // Determine MIME type from data URL or default to image/png
                    const mimeMatch = step2Data.logoBase64.match(/data:([^;]+)/)
                    const mimeType = mimeMatch ? mimeMatch[1] : 'image/png'

                    // Convert base64 to binary
                    const binaryString = atob(base64String)
                    const bytes = new Uint8Array(binaryString.length)
                    for (let i = 0; i < binaryString.length; i++) {
                        bytes[i] = binaryString.charCodeAt(i)
                    }

                    // Create Blob and File
                    const blob = new Blob([bytes], { type: mimeType })
                    const file = new File([blob], 'logo.png', { type: mimeType })
                    input.logoFile = file
                } catch (error) {
                    console.error('Failed to convert base64 to File:', error)
                    // Fallback: try to use icon/color if available
                    if (step2Data.iconId && step2Data.colorId) {
                        input.iconId = step2Data.iconId
                        input.colorId = step2Data.colorId
                    } else {
                        throw new Error('Не удалось обработать логотип. Попробуйте загрузить его снова.')
                    }
                }
            } else if (step2Data.iconId && step2Data.colorId) {
                // Use generated icon + color
                input.iconId = step2Data.iconId
                input.colorId = step2Data.colorId
            }

            // Call GraphQL mutation
            let result
            try {
                result = await completeOnboarding({
                    variables: { input },
                })
            } catch (err: any) {
                // Handle AbortError and network errors
                if (err.name === 'AbortError' || err.message?.includes('aborted')) {
                    console.warn('Request was aborted by user')
                    setIsSubmitting(false)
                    return // User aborted, don't show error
                }
                // Re-throw other errors to be handled below
                throw err
            }

            // Handle GraphQL errors
            if (result.error) {
                const errorMessage = result.error.message || 'Не удалось завершить онбординг'
                setError(errorMessage)
                setIsSubmitting(false)
                return
            }

            // Handle successful response
            if (result.data?.completeOnboarding.success) {
                // Check for paymentUrl in response
                const paymentUrl = (result.data.completeOnboarding as any).paymentUrl
                if (paymentUrl) {
                    window.location.href = paymentUrl
                    return
                }

                // If no paymentUrl (Free/Trial), show success and redirect to dashboard
                setIsCompleted(true)
                triggerConfetti()

                // Wait for animation to complete before redirect
                setTimeout(() => {
                    // Clear localStorage
                    localStorage.removeItem('onboarding_step1')
                    localStorage.removeItem('onboarding_step2')
                    localStorage.removeItem('onboarding_step3')
                    localStorage.removeItem('onboarding_step4')
                    localStorage.removeItem('onboarding_step5')

                    // Redirect to project page with onboarding flag
                    const { team, project } = result.data?.completeOnboarding || {}
                    if (team?.id && project?.id) {
                        router.push(`/teams/${team.id}/projects/${project.id}?from=onboarding`)
                    } else {
                        router.push('/dashboard')
                    }
                }, 2000)
            } else {
                // Handle business logic error
                const errorMessage = result.data?.completeOnboarding.message || 'Не удалось завершить онбординг'
                setError(errorMessage)
                setIsSubmitting(false)
            }
        } catch (err: any) {
            // Handle network or other unexpected errors
            // Don't show error if user aborted the request
            if (err.name === 'AbortError' || err.message?.includes('aborted')) {
                console.warn('Request was aborted by user')
                setIsSubmitting(false)
                return
            }

            console.error('Failed to complete onboarding:', err)
            setError(err?.message || 'Произошла ошибка при завершении онбординга')
            setIsSubmitting(false)
        }
    }

    const handleBack = () => {
        router.push('/onboarding/step-4')
    }

    // Show loader while validating or loading plans
    if (isValidating || plansLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    const plans = plansData?.availablePlansDetailed || []
    const isEarlyBirdAvailable = earlyBirdForMeData?.isEarlyBirdAvailableForMe ?? false
    const userTrialedPlanIds = meData?.me?.trialedPlanIds || []
    const hasUsedTrial = userTrialedPlanIds.length > 0

    // Check which plans have trial period available for this user
    const getPlanTrialInfo = (plan: typeof plans[0]) => {
        const hasTrialPeriod = plan.trialDays && plan.trialDays > 0
        const canUseTrial = hasTrialPeriod && !hasUsedTrial
        return { hasTrialPeriod, canUseTrial }
    }

    return (
        <div className="space-y-6 relative flex flex-col items-center">

            {/* Success Animation Overlay */}
            <AnimatePresence>
                {isCompleted && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-md"
                    >
                        <motion.div
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{
                                type: "spring",
                                stiffness: 200,
                                damping: 20,
                                duration: 0.8
                            }}
                            className="flex flex-col items-center gap-6 p-12 bg-card/90 backdrop-blur-xl rounded-3xl border-2 border-primary/50 shadow-2xl"
                        >
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: [0, 1.2, 1] }}
                                transition={{ delay: 0.2, duration: 0.6 }}
                                className="relative"
                            >
                                <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl" />
                                <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent">
                                    <Check className="h-12 w-12 text-primary-foreground" strokeWidth={3} />
                                </div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4, duration: 0.5 }}
                                className="text-center space-y-2"
                            >
                                <h2 className="text-3xl font-bold">Готово!</h2>
                                <p className="text-muted-foreground text-lg">
                                    Онбординг успешно завершён
                                </p>
                            </motion.div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Stepper */}
            <motion.div
                variants={fadeIn}
                initial="hidden"
                animate="visible"
                transition={{ delay: 0.1 }}
                className="w-full max-w-[420px] mt-8 mx-auto"
            >
                <Stepper steps={steps} currentStep={5} />
            </motion.div>

            {/* Content Container (Unlimited Width as requested) */}
            <div className="w-full px-4 md:px-8">
                {/* Header */}
                <motion.div
                    variants={fadeIn}
                    initial="hidden"
                    animate="visible"
                    transition={{ delay: 0.2 }}
                    className="relative max-w-[1400px] mx-auto flex items-center justify-center mb-10"
                >
                    {/* Back Button Positioned Absolute Left */}
                    <div className="absolute left-0">
                        <Button
                            variant="ghost"
                            onClick={handleBack}
                            className="flex items-center gap-2 text-muted-foreground hover:text-foreground pl-0 hover:bg-transparent"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Назад
                        </Button>
                    </div>

                    <div className="text-center">
                        <h1 className="text-3xl font-bold tracking-tight mb-2">Выберите тарифный план</h1>
                        <p className="text-muted-foreground text-lg">
                            Тариф для команды{' '}
                            <span className="font-semibold text-foreground px-2 py-0.5 rounded-md bg-muted/50">
                                {teamName}
                            </span>
                        </p>
                    </div>
                </motion.div>

                {/* Information Alerts */}
                <motion.div
                    variants={fadeIn}
                    initial="hidden"
                    animate="visible"
                    transition={{ delay: 0.25 }}
                    className="w-full max-w-[1400px] mx-auto space-y-3 mb-6"
                >
                    {/* Early Bird Alert */}
                    {isEarlyBirdAvailable && (
                        <Alert className="border-amber-500/30 bg-amber-50 dark:bg-amber-950/20">
                            <Gift className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                            <AlertDescription className="text-amber-900 dark:text-amber-100">
                                <span className="font-semibold">🎁 Early Bird акция доступна!</span> Вы можете получить скидку до {earlyBirdStatsData?.earlyBirdStats?.remaining || 0} подписок. Early Bird цена будет применена автоматически при выборе плана.
                            </AlertDescription>
                        </Alert>
                    )}

                    {/* Trial Period Alert */}
                    {!hasUsedTrial && plans.some(p => p.trialDays && p.trialDays > 0) && (
                        <Alert className="border-blue-500/30 bg-blue-50 dark:bg-blue-950/20">
                            <Zap className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                            <AlertDescription className="text-blue-900 dark:text-blue-100">
                                <span className="font-semibold">⚡ Тестовый период доступен!</span> Вы можете попробовать план "Лайт" бесплатно в течение {plans.find(p => p.slug === 'lite')?.trialDays || 14} дней. Тестовый период можно использовать только один раз.
                            </AlertDescription>
                        </Alert>
                    )}
                </motion.div>

                {/* Plans Grid */}
                <div className="flex justify-center pb-20">
                    <motion.div
                        variants={fadeIn}
                        initial="hidden"
                        animate="visible"
                        transition={{ delay: 0.3 }}
                        className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-[1400px] mx-auto items-start"
                    >
                        {plans.map((plan, index) => {
                            const isSelected = selectedPlanId === plan.id
                            const rubPrice = plan.prices.find((p) => p.currency === 'RUB')
                            const { hasTrialPeriod, canUseTrial } = getPlanTrialInfo(plan)

                            // Determine display price: Early Bird if available and plan supports it, otherwise regular price
                            const shouldShowEarlyBird = isEarlyBirdAvailable && plan.isEarlyBird && rubPrice?.earlyBirdPrice
                            const displayPrice = rubPrice
                                ? (shouldShowEarlyBird ? rubPrice.earlyBirdPrice : rubPrice.price)
                                : 0
                            const regularPrice = rubPrice?.price || 0
                            const earlyBirdPrice = rubPrice?.earlyBirdPrice || 0

                            const allFeatures = plan.features?.filter(f => f.isIncluded).sort((a, b) => a.sortOrder - b.sortOrder) || []
                            const initialFeaturesCount = 3
                            const visibleFeatures = allFeatures.slice(0, initialFeaturesCount)
                            const hiddenFeatures = allFeatures.slice(initialFeaturesCount)
                            const isExpanded = expandedPlanIds.has(plan.id)

                            return (
                                <motion.div
                                    key={plan.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.4 + index * 0.1 }}
                                    whileHover={undefined}
                                >
                                    <Card
                                        className={cn(
                                            'relative overflow-hidden border-2 transition-all duration-300 flex flex-col min-h-[550px] group',
                                            isSelected
                                                ? 'border-primary bg-gradient-to-br from-primary/5 via-primary/5 to-background shadow-xl ring-2 ring-primary/20 scale-[1.02]'
                                                : 'border-border/50 hover:border-primary/50 hover:shadow-xl bg-card',
                                            plan.isPopular && !isSelected && 'ring-1 ring-primary/30'
                                        )}
                                    >
                                        {/* Popular Badge Overlay */}
                                        {plan.isPopular && (
                                            <div className="absolute inset-x-0 top-0 h-1 bg-primary/30" />
                                        )}

                                        <div className="p-5 flex flex-col h-full relative z-10">
                                            {/* Header Section */}
                                            <div className="mb-4 flex-shrink-0">
                                                <div className="flex items-center justify-between mb-3">
                                                    {plan.isPopular ? (
                                                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg shadow-primary/20">
                                                            <Crown className="w-5 h-5 text-primary-foreground" />
                                                        </div>
                                                    ) : (
                                                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                                            <Zap className="w-5 h-5 text-primary" />
                                                        </div>
                                                    )}

                                                    <div className="flex flex-col items-end gap-1.5">
                                                        {plan.isPopular && (
                                                            <Badge className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-md h-5 px-2">
                                                                <Star className="w-3 h-3 mr-1 fill-current" />
                                                                Популярный
                                                            </Badge>
                                                        )}
                                                        {canUseTrial && (
                                                            <Badge variant="secondary" className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20 h-5 px-2 flex items-center gap-1">
                                                                <Zap className="w-3 h-3" />
                                                                {plan.trialDays} дней бесплатно
                                                            </Badge>
                                                        )}
                                                        {hasTrialPeriod && !canUseTrial && (
                                                            <Badge variant="outline" className="bg-muted/50 text-muted-foreground border-muted h-5 px-2 text-xs">
                                                                Тест недоступен
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </div>

                                                <h3 className="text-xl font-bold mb-1.5">{plan.name}</h3>
                                                {plan.description && (
                                                    <p className="text-sm text-muted-foreground leading-snug line-clamp-2 min-h-[2.5em]">
                                                        {plan.description}
                                                    </p>
                                                )}
                                            </div>

                                            {/* Price Section */}
                                            <div className="mb-4 pb-4 border-b border-border/50 flex-shrink-0">
                                                {rubPrice ? (
                                                    <div className="space-y-2">
                                                        {shouldShowEarlyBird && regularPrice !== earlyBirdPrice ? (
                                                            <>
                                                                <div className="flex items-baseline gap-1.5">
                                                                    <span className="text-4xl font-bold text-primary">
                                                                        {earlyBirdPrice.toLocaleString('ru-RU')}
                                                                        <span className="text-2xl ml-0.5">₽</span>
                                                                    </span>
                                                                    <span className="text-lg font-medium text-muted-foreground">
                                                                        /мес
                                                                    </span>
                                                                </div>
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-sm text-muted-foreground line-through">
                                                                        {regularPrice.toLocaleString('ru-RU')}₽/мес
                                                                    </span>
                                                                    <Badge variant="secondary" className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 text-xs px-2 py-0.5">
                                                                        <Gift className="w-3 h-3 mr-1" />
                                                                        Early Bird
                                                                    </Badge>
                                                                    <Badge variant="secondary" className="bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/30 text-xs px-2 py-0.5">
                                                                        Экономия {regularPrice - earlyBirdPrice}₽
                                                                    </Badge>
                                                                </div>
                                                            </>
                                                        ) : (
                                                            <div className="flex items-baseline gap-1.5">
                                                                <span className="text-4xl font-bold text-primary">
                                                                    {regularPrice.toLocaleString('ru-RU')}
                                                                    <span className="text-2xl ml-0.5">₽</span>
                                                                </span>
                                                                <span className="text-lg font-medium text-muted-foreground">
                                                                    /мес
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <span className="text-2xl font-bold text-muted-foreground">Цена по запросу</span>
                                                )}
                                            </div>

                                            {/* Limits Grid */}
                                            <div className="grid grid-cols-1 gap-1.5 mb-4 flex-shrink-0">
                                                {[
                                                    {
                                                        icon: FolderOpen,
                                                        text: plan.maxActiveProjects === null
                                                            ? 'Неограниченно проектов'
                                                            : `${plan.maxActiveProjects} активных проектов`,
                                                    },
                                                    {
                                                        icon: Users,
                                                        text: `До ${plan.maxMembers} участников`,
                                                    },
                                                    {
                                                        icon: HardDrive,
                                                        text: `${plan.storageGB} ГБ хранилища`,
                                                    },
                                                ].map((item, idx) => (
                                                    <div
                                                        key={idx}
                                                        className="flex items-center gap-2.5 p-2 rounded-lg bg-muted/30 group-hover:bg-muted/50 transition-colors"
                                                    >
                                                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                                                            <item.icon className="w-4 h-4 text-primary" />
                                                        </div>
                                                        <span className="text-sm font-medium">{item.text}</span>
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Features List (Accordion) */}
                                            <div className="flex flex-col flex-1 min-h-0">
                                                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                                                    Включено:
                                                </p>
                                                <ul className="space-y-1.5">
                                                    {visibleFeatures.map((feature, idx) => (
                                                        <li key={idx} className="flex items-start gap-2 text-xs">
                                                            <div className="mt-0.5 w-4 h-4 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                                                <Check className="w-2.5 h-2.5 text-primary" />
                                                            </div>
                                                            <span className="leading-snug text-muted-foreground">
                                                                {feature.name}
                                                            </span>
                                                        </li>
                                                    ))}
                                                </ul>

                                                {/* Hidden Features Accordion */}
                                                <AnimatePresence>
                                                    {isExpanded && hiddenFeatures.length > 0 && (
                                                        <motion.div
                                                            initial={{ height: 0, opacity: 0 }}
                                                            animate={{ height: 'auto', opacity: 1 }}
                                                            exit={{ height: 0, opacity: 0 }}
                                                            className="overflow-hidden"
                                                        >
                                                            <ul className="space-y-1.5 pt-1.5">
                                                                {hiddenFeatures.map((feature, idx) => (
                                                                    <li key={idx} className="flex items-start gap-2 text-xs">
                                                                        <div className="mt-0.5 w-4 h-4 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                                                            <Check className="w-2.5 h-2.5 text-primary" />
                                                                        </div>
                                                                        <span className="leading-snug text-muted-foreground">
                                                                            {feature.name}
                                                                        </span>
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>

                                                {/* Expand/Collapse Button */}
                                                {hiddenFeatures.length > 0 && (
                                                    <Button
                                                        variant="ghost"
                                                        onClick={() => togglePlanExpansion(plan.id)}
                                                        className="w-full mt-2 h-7 text-xs text-muted-foreground hover:text-foreground"
                                                    >
                                                        {isExpanded ? 'Свернуть' : `Показать все (${hiddenFeatures.length})`}
                                                        <ChevronDown className={cn("ml-1 w-3 h-3 transition-transform duration-200", isExpanded && "rotate-180")} />
                                                    </Button>
                                                )}
                                            </div>

                                            {/* Action Button */}
                                            <div className="mt-5 pt-4 border-t border-border/50">
                                                <Button
                                                    variant={isSelected ? 'outline' : 'default'}  // Inverse logic slightly: default is usually "Select"
                                                    className={cn(
                                                        "w-full h-11 text-sm font-semibold rounded-xl transition-all duration-300",
                                                        // If submitting this specific plan, assume logic handles spinner
                                                    )}
                                                    disabled={isSubmitting}
                                                    onClick={() => handleSelectAndProceed(plan.id)}
                                                >
                                                    {isSubmitting && selectedPlanId === plan.id ? (
                                                        <>
                                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                            Обработка...
                                                        </>
                                                    ) : (
                                                        'Выбрать'
                                                    )}
                                                </Button>
                                            </div>
                                        </div>
                                    </Card>
                                </motion.div>
                            )
                        })}
                    </motion.div>
                </div>
            </div>

            {/* Error Toast/Message */}
            {error && (
                <div className="fixed bottom-4 right-4 z-50">
                    <div className="bg-destructive text-destructive-foreground px-4 py-3 rounded-lg shadow-lg flex items-center gap-3">
                        <span className="font-medium">Ошибка:</span>
                        <span>{error}</span>
                        <Button variant="ghost" size="icon" onClick={() => setError(null)} className="h-6 w-6 rounded-full hover:bg-destructive-foreground/20">
                            <ChevronDown className="w-4 h-4 rotate-45" /> {/* Close icon substitution */}
                        </Button>
                    </div>
                </div>
            )}
        </div>
    )
}
