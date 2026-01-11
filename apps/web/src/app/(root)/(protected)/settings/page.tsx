'use client'

import { useState, useEffect, useMemo, useCallback, Suspense, useRef } from 'react'
import { useQuery, useMutation } from '@apollo/client/react'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter, useSearchParams } from 'next/navigation'
import {
	User,
	Settings,
	Shield,
	Palette,
	Key,
	LogOut,
	Monitor,
	Smartphone,
	Globe,
	Loader2,
	AlertTriangle,
	Trash2,
	Mail,
	Phone,
	Calendar,
	Save,
	AlertCircle,
	CheckCircle2,
	Camera,
	ImagePlus,
	Moon,
	Sun,
	Send,
	Link2,
	ExternalLink,
	Bell,
	BellRing,
	BellOff,
	CreditCard,
	Crown,
	Zap,
	Star,
	HelpCircle,
	MessageCircle,
	FileText,
	ChevronRight,
	Info,
	Heart,
	Github,
	Coffee,
	Sparkles,
	Building2,
	Users,
	FolderKanban,
	Receipt,
	Camera as CameraIcon,
	Calculator,
	CheckCircle,
	Clock,
	Rocket,

	Plus,
	X,
	Check,
	Menu,
	ChevronDown,
	Video,
	RefreshCw,
	Code,
} from 'lucide-react'
import { QuickStartView, UpdatesView, UnderDevelopmentView } from '@/packages/components/settings/HelpViews'
import { TelegramConnection } from '@/packages/components/settings/telegram-connection'
import { DonationDialog, DonationsHistory } from '@/packages/components/donations'
import { useTheme } from 'next-themes'
import Link from 'next/link'
import {
	MeDocument,
	SessionsDocument,
	UpdateProfileDocument,
	UpdateNotificationSettingsDocument,
	RevokeSessionDocument,
	RevokeAllSessionsDocument,
	ChangePasswordDocument,
	ResendVerificationEmailDocument,
	InitiateEmailChangeDocument,
	TwoFactorStatusDocument,
	LoginHistoryDocument,
} from '@/packages/api/graphql/__generated__/output'
import { useAuth } from '@/packages/libs/auth'
import { useToast } from '@/packages/hooks'
import { APP_VERSION } from '@/packages/constants/app'
import {
	Button,
	Input,
	Skeleton,
	Badge,
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
	FormDescription,
	PasswordInput,
	UserAvatar,
	PageHeader,
	AvatarUpload,
	TelegramIntegration,
	SubscriptionManagement,
	SubscriptionHistory,
	TwoFactorAuth,
	NotificationPreferences,
	DeleteAccountDialog,
	Switch,
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/packages/components'
import { cn, isTelegramPlaceholderEmail, isTelegramUser, getTelegramEmailMessage } from '@/packages/utils'

// Schemas
const profileSchema = z.object({
	fullName: z
		.string()
		.min(2, 'Минимум 2 символа')
		.max(100, 'Максимум 100 символов'),
	phone: z
		.string()
		.optional()
		.refine(
			(val) => !val || /^(\+7|8)?[\s-]?\(?[0-9]{3}\)?[\s-]?[0-9]{3}[\s-]?[0-9]{2}[\s-]?[0-9]{2}$/.test(val),
			'Введите корректный номер телефона'
		),
})

const passwordSchema = z
	.object({
		currentPassword: z.string().min(1, 'Введите текущий пароль'),
		newPassword: z
			.string()
			.min(8, 'Минимум 8 символов')
			.regex(/[A-Z]/, 'Добавьте заглавную букву')
			.regex(/[a-z]/, 'Добавьте строчную букву')
			.regex(/[0-9]/, 'Добавьте цифру'),
		confirmPassword: z.string().min(1, 'Подтвердите пароль'),
	})
	.refine((data) => data.newPassword === data.confirmPassword, {
		message: 'Пароли не совпадают',
		path: ['confirmPassword'],
	})

const emailChangeSchema = z.object({
	newEmail: z.string().email('Некорректный email адрес'),
	twoFactorCode: z.string().length(6, 'Код должен содержать 6 символов').optional(),
})

type ProfileForm = z.infer<typeof profileSchema>
type PasswordForm = z.infer<typeof passwordSchema>
type EmailChangeForm = z.infer<typeof emailChangeSchema>

// Animations
const fadeIn = {
	hidden: { opacity: 0, y: 20 },
	visible: {
		opacity: 1,
		y: 0,
		transition: { duration: 0.4, ease: [0.22, 0.61, 0.36, 1] as any },
	},
	exit: {
		opacity: 0,
		y: -20,
		transition: { duration: 0.3 },
	},
}

const stagger = {
	hidden: {},
	visible: {
		transition: { staggerChildren: 0.06 },
	},
}

const listItem = {
	hidden: { opacity: 0, y: 20 },
	visible: {
		opacity: 1,
		y: 0,
		transition: { duration: 0.4, ease: [0.22, 0.61, 0.36, 1] as any },
	},
}

type TabId = 'profile' | 'security' | 'notifications' | 'subscription' | 'appearance' | 'help' | 'about'

const tabs: { id: TabId; label: string; icon: React.ElementType }[] = [
	{ id: 'profile', label: 'Профиль', icon: User },
	{ id: 'security', label: 'Безопасность', icon: Shield },
	{ id: 'notifications', label: 'Уведомления', icon: Bell },
	{ id: 'subscription', label: 'Подписка', icon: Crown },
	{ id: 'appearance', label: 'Оформление', icon: Palette },
	{ id: 'help', label: 'Справка', icon: HelpCircle },
	{ id: 'about', label: 'О приложении', icon: Info },
]

// Loading fallback for Suspense
function SettingsPageFallback() {
	return (
		<div className="min-h-screen bg-background">
			<div className="border-b border-border/30 bg-card/50">
				<div className="w-full max-w-[1920px] mx-auto px-3 sm:px-4 py-3 sm:py-4">
					<Skeleton className="h-6 sm:h-8 w-32 sm:w-48 mb-2" />
					<Skeleton className="h-4 sm:h-5 w-48 sm:w-64" />
				</div>
			</div>
			<div className="w-full max-w-[1920px] mx-auto px-3 sm:px-4 py-4 sm:py-8">
				<Skeleton className="h-10 sm:h-12 w-full mb-4 sm:mb-6" />
				<Skeleton className="h-64 sm:h-96 rounded-xl sm:rounded-2xl" />
			</div>
		</div>
	)
}

// Main settings content component
function SettingsContent() {
	const { user } = useAuth()
	const { showToast } = useToast()
	const { theme, setTheme, resolvedTheme } = useTheme()
	const router = useRouter()
	const searchParams = useSearchParams()

	// Get tab from URL, default to 'profile'
	const tabFromUrl = searchParams.get('tab') as TabId | null
	const sectionFromUrl = searchParams.get('section')
	const activeTab = useMemo(() => {
		const validTabs: TabId[] = ['profile', 'security', 'notifications', 'subscription', 'appearance', 'help', 'about']
		if (tabFromUrl && validTabs.includes(tabFromUrl)) {
			return tabFromUrl
		}
		return 'profile'
	}, [tabFromUrl])

	// Update URL when tab changes
	const setActiveTab = useCallback((newTab: TabId) => {
		const params = new URLSearchParams(searchParams.toString())
		params.set('tab', newTab)
		params.delete('section')
		router.push(`/settings?${params.toString()}`, { scroll: false })
	}, [router, searchParams])

	const [showPasswordForm, setShowPasswordForm] = useState(false)
	const [showEmailForm, setShowEmailForm] = useState(false)
	const [show2FADialog, setShow2FADialog] = useState(false)
	const [showDonationDialog, setShowDonationDialog] = useState(false)
	const [pendingNewEmail, setPendingNewEmail] = useState<string | null>(null)
	const [emailCooldown, setEmailCooldown] = useState(0)
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
	const mobileMenuRef = useRef<HTMLDivElement>(null)

	// Close mobile menu on click outside
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
				setMobileMenuOpen(false)
			}
		}
		if (mobileMenuOpen) {
			document.addEventListener('mousedown', handleClickOutside)
		}
		return () => document.removeEventListener('mousedown', handleClickOutside)
	}, [mobileMenuOpen])

	// Queries
	const { data: meData, loading: meLoading, refetch: refetchMe } = useQuery(MeDocument)
	const { data: sessionsData, loading: sessionsLoading, refetch: refetchSessions } = useQuery(
		SessionsDocument
	)
	const { data: loginHistoryData, loading: historyLoading } = useQuery(LoginHistoryDocument)

	const me = meData?.me
	const notificationSettings = me?.notificationSettings
	const sessions = sessionsData?.sessions || []
	const loginHistory = loginHistoryData?.loginHistory || []

	// Mutations
	const [updateProfile, { loading: updatingProfile }] = useMutation(UpdateProfileDocument, {
		update: (cache, { data }) => {
			if (data?.updateProfile) {
				// Update Apollo cache directly without refetching
				cache.updateQuery({ query: MeDocument }, (existingData) => {
					if (existingData?.me) {
						return {
							...existingData,
							me: {
								...existingData.me,
								fullName: data.updateProfile.fullName,
								phone: data.updateProfile.phone,
							},
						}
					}
					return existingData
				})
			}
		},
		onCompleted: (data) => {
			// Update form with new data immediately
			if (data?.updateProfile) {
				profileForm.reset({
					fullName: data.updateProfile.fullName || '',
					phone: data.updateProfile.phone || '',
				}, { keepDirty: false })
			}
			showToast({
				title: 'Профиль обновлён',
				description: 'Ваши данные успешно сохранены',
				type: 'success',
			})
		},
		onError: (error) => {
			showToast({
				title: 'Ошибка',
				description: error.message,
				type: 'error',
			})
		},
	})

	const [changePassword, { loading: changingPassword }] = useMutation(ChangePasswordDocument, {
		onCompleted: () => {
			showToast({
				title: 'Пароль изменён',
				description: 'Ваш пароль успешно обновлён',
				type: 'success',
			})
			setShowPasswordForm(false)
			passwordForm.reset()
		},
		onError: (error) => {
			showToast({
				title: 'Ошибка',
				description: error.message,
				type: 'error',
			})
		},
	})

	const [resendVerificationEmail, { loading: sendingEmail }] = useMutation(
		ResendVerificationEmailDocument,
		{
			onCompleted: () => {
				showToast({
					title: 'Письмо отправлено',
					description: 'Проверьте вашу почту для подтверждения email',
					type: 'success',
				})
				setEmailCooldown(60)
			},
			onError: (error) => {
				showToast({
					title: 'Ошибка',
					description: error.message,
					type: 'error',
				})
			},
		}
	)

	const [revokeSession] = useMutation(RevokeSessionDocument, {
		onCompleted: () => {
			showToast({
				title: 'Сессия завершена',
				description: 'Сессия была успешно завершена',
				type: 'success',
			})
			refetchSessions()
		},
		onError: (error) => {
			showToast({
				title: 'Ошибка',
				description: error.message,
				type: 'error',
			})
		},
	})

	const { data: twoFactorData } = useQuery(TwoFactorStatusDocument)
	const is2FAEnabled = twoFactorData?.twoFactorStatus?.enabled || false

	const [initiateEmailChange, { loading: changingEmail }] = useMutation(
		InitiateEmailChangeDocument,
		{
			onCompleted: (data) => {
				if (data.initiateEmailChange.success) {
					showToast({
						title: 'Письмо отправлено',
						description: data.initiateEmailChange.message,
						type: 'success',
					})
					setShowEmailForm(false)
					emailChangeForm.reset()
					setPendingNewEmail(null)
					refetchMe()
				}
			},
			onError: (error) => {
				// Check if error is about missing 2FA code
				if (error.message.includes('двухфакторной аутентификации')) {
					// Don't show error, just open 2FA dialog
					return
				}
				showToast({
					title: 'Ошибка',
					description: error.message,
					type: 'error',
				})
			},
		}
	)

	const [revokeAllSessions, { loading: revokingAll }] = useMutation(RevokeAllSessionsDocument, {
		onCompleted: () => {
			showToast({
				title: 'Сессии завершены',
				description: 'Все сессии, кроме текущей, были завершены',
				type: 'success',
			})
			refetchSessions()
		},
		onError: (error) => {
			showToast({
				title: 'Ошибка',
				description: error.message,
				type: 'error',
			})
		},
	})

	// Notifications Mutation
	const [updateNotifications] = useMutation(UpdateNotificationSettingsDocument, {
		update: (cache, { data }) => {
			if (data?.updateNotificationSettings) {
				// Update Apollo cache directly without refetching
				cache.updateQuery({ query: MeDocument }, (existingData) => {
					if (existingData?.me) {
						return {
							...existingData,
							me: {
								...existingData.me,
								notificationSettings: {
									...existingData.me.notificationSettings,
									...data.updateNotificationSettings,
								},
							},
						}
					}
					return existingData
				})
			}
		},
		onError: (error) => {
			showToast({
				title: 'Ошибка обновления настроек',
				description: error.message,
				type: 'error',
			})
		}
	})

	const onNotificationChange = (key: string, value: boolean) => {
		// Optimistic update logic could go here, but for now relying on refetch/cache update
		if (notificationSettings) {
			updateNotifications({
				variables: {
					input: {
						appEmail: notificationSettings.appEmail,
						appPush: notificationSettings.appPush,
						appSms: notificationSettings.appSms,
						marketingEmail: notificationSettings.marketingEmail,
						marketingPush: notificationSettings.marketingPush,
						[key]: value
					},
				},
			})
		}
	}

	// Email cooldown timer
	useEffect(() => {
		if (emailCooldown > 0) {
			const timer = setTimeout(() => setEmailCooldown(emailCooldown - 1), 1000)
			return () => clearTimeout(timer)
		}
	}, [emailCooldown])

	// Forms
	const profileForm = useForm<ProfileForm>({
		resolver: zodResolver(profileSchema),
		defaultValues: {
			fullName: '',
			phone: '',
		},
	})

	const passwordForm = useForm<PasswordForm>({
		resolver: zodResolver(passwordSchema),
		defaultValues: {
			currentPassword: '',
			newPassword: '',
			confirmPassword: '',
		},
	})

	const emailChangeForm = useForm<EmailChangeForm>({
		resolver: zodResolver(emailChangeSchema),
		defaultValues: {
			newEmail: '',
			twoFactorCode: '',
		},
	})

	// Set default values when user loads
	useEffect(() => {
		if (me) {
			profileForm.reset({
				fullName: me.fullName || '',
				phone: me.phone || '',
			})
		}
	}, [me, profileForm])

	const onProfileSubmit = async (data: ProfileForm) => {
		await updateProfile({
			variables: {
				input: {
					fullName: data.fullName,
					phone: data.phone || null,
				},
			},
		})
	}

	const onPasswordSubmit = async (data: PasswordForm) => {
		await changePassword({
			variables: {
				input: {
					currentPassword: data.currentPassword,
					newPassword: data.newPassword,
				},
			},
		})
	}

	const onEmailChangeSubmit = async (data: EmailChangeForm) => {
		// Submit email change (2FA code is optional in form, backend will check if required)
		try {
			await initiateEmailChange({
				variables: {
					input: {
						newEmail: data.newEmail,
						twoFactorCode: data.twoFactorCode,
					},
				},
			})
		} catch (error: any) {
			// If error is about missing 2FA code, show dialog
			if (error.message?.includes('двухфакторной аутентификации') && !data.twoFactorCode) {
				setPendingNewEmail(data.newEmail)
				setShow2FADialog(true)
			}
			// Otherwise error will be handled by mutation onError
		}
	}

	const handle2FAConfirm = async (code: string) => {
		if (!pendingNewEmail) return

		await initiateEmailChange({
			variables: {
				input: {
					newEmail: pendingNewEmail,
					twoFactorCode: code,
				},
			},
		})

		setShow2FADialog(false)
		setPendingNewEmail(null)
	}

	const handleResendEmail = async () => {
		if (emailCooldown > 0) return
		await resendVerificationEmail()
	}

	const formatDate = (date: string) => {
		return new Date(date).toLocaleDateString('ru-RU', {
			day: 'numeric',
			month: 'long',
			year: 'numeric',
		})
	}

	const formatSessionDate = (date: string) => {
		return new Date(date).toLocaleDateString('ru-RU', {
			day: 'numeric',
			month: 'short',
			hour: '2-digit',
			minute: '2-digit',
		})
	}

	const getDeviceIcon = (session: any) => {
		const deviceType = session.device?.toLowerCase() || session.userAgent?.toLowerCase() || ''
		if (deviceType.includes('mobile') || deviceType.includes('iphone') || deviceType.includes('android')) {
			return <Smartphone className="w-5 h-5" />
		}
		return <Monitor className="w-5 h-5" />
	}

	const getDeviceName = (session: any) => {
		if (session.device && session.device !== 'undefined') return session.device
		if (session.browser && session.os) return `${session.browser} на ${session.os}`

		const ua = session.userAgent || ''
		if (ua.includes('Chrome')) return 'Google Chrome'
		if (ua.includes('Firefox')) return 'Mozilla Firefox'
		if (ua.includes('Safari')) return 'Safari'
		if (ua.includes('Edge')) return 'Microsoft Edge'
		return 'Неизвестное устройство'
	}

	const getLocation = (session: any) => {
		if (session.city && session.country) {
			return `${session.city}, ${session.country}`
		}
		return formatIpAddress(session.ip)
	}

	const formatIpAddress = (ip?: string) => {
		if (!ip) return 'IP неизвестен'
		// IPv6 localhost
		if (ip === '::1' || ip === '::ffff:127.0.0.1') return 'Локальный'
		// IPv4 localhost
		if (ip === '127.0.0.1' || ip.startsWith('192.168.') || ip.startsWith('10.')) return 'Локальная сеть'
		// Remove IPv6 prefix from IPv4
		if (ip.startsWith('::ffff:')) return ip.replace('::ffff:', '')
		return ip
	}

	const getThemeIcon = () => {
		if (theme === 'system') return <Monitor className="w-5 h-5" />
		if (resolvedTheme === 'dark') return <Moon className="w-5 h-5" />
		return <Sun className="w-5 h-5" />
	}

	// Loading state
	if (meLoading) {
		return (
			<div className="min-h-screen bg-background">
				<div className="border-b border-border/30 bg-card/50">
					<div className="w-full max-w-[1920px] mx-auto px-3 sm:px-4 py-3 sm:py-4">
						<Skeleton className="h-6 sm:h-8 w-32 sm:w-48 mb-2" />
						<Skeleton className="h-4 sm:h-5 w-48 sm:w-64" />
					</div>
				</div>
				<div className="w-full max-w-[1920px] mx-auto px-3 sm:px-4 py-4 sm:py-8">
					<Skeleton className="h-10 sm:h-12 w-full mb-4 sm:mb-6" />
					<Skeleton className="h-64 sm:h-96 rounded-xl sm:rounded-2xl" />
				</div>
			</div>
		)
	}

	return (
		<div className="min-h-screen bg-background">
			<PageHeader
				title="Настройки"
				subtitle={user?.email}
				icon={<Settings className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />}
				backHref="/dashboard"
			/>

			<div className="w-full max-w-[1920px] mx-auto px-3 sm:px-4 py-4 sm:py-6">
				<div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
					{/* Desktop Sidebar Navigation */}
					<aside className="hidden lg:block w-56 xl:w-64 flex-shrink-0">
						<nav className="sticky top-24 space-y-1 p-2 bg-card rounded-xl xl:rounded-2xl border border-border/50">
							{tabs.map((tab) => (
								<button
									key={tab.id}
									onClick={() => setActiveTab(tab.id)}
									className={cn(
										'w-full flex items-center gap-2 xl:gap-3 px-3 xl:px-4 py-2.5 xl:py-3 rounded-lg xl:rounded-xl font-medium transition-all text-left text-sm xl:text-base',
										activeTab === tab.id
											? 'bg-primary text-primary-foreground shadow-md'
											: 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
									)}
								>
									<tab.icon className="w-4 h-4 xl:w-5 xl:h-5 shrink-0" />
									<span className="truncate">{tab.label}</span>
								</button>
							))}
						</nav>
					</aside>

					{/* Mobile Menu - Dropdown */}
					<div className="lg:hidden mb-4 sm:mb-6">
						<div className="relative" ref={mobileMenuRef}>
							<button
								onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
								className="w-full flex items-center justify-between gap-2 px-4 py-3 bg-card border border-border/50 rounded-xl font-medium text-sm transition-all hover:bg-secondary/50"
							>
								<div className="flex items-center gap-2">
									{(() => {
										const CurrentIcon = tabs.find(t => t.id === activeTab)?.icon || Settings
										return <CurrentIcon className="w-4 h-4 text-primary" />
									})()}
									<span>{tabs.find(t => t.id === activeTab)?.label || 'Меню'}</span>
								</div>
								<ChevronDown className={cn(
									"w-4 h-4 text-muted-foreground transition-transform",
									mobileMenuOpen && "rotate-180"
								)} />
							</button>

							<AnimatePresence>
								{mobileMenuOpen && (
									<motion.div
										initial={{ opacity: 0, y: -8 }}
										animate={{ opacity: 1, y: 0 }}
										exit={{ opacity: 0, y: -8 }}
										transition={{ duration: 0.15 }}
										className="absolute top-full left-0 right-0 mt-2 bg-card border border-border/50 rounded-xl shadow-lg overflow-hidden z-50"
									>
										{tabs.map((tab) => (
											<button
												key={tab.id}
												onClick={() => {
													setActiveTab(tab.id)
													setMobileMenuOpen(false)
												}}
												className={cn(
													'w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors text-left',
													activeTab === tab.id
														? 'bg-primary/10 text-primary'
														: 'text-foreground hover:bg-secondary/50'
												)}
											>
												<tab.icon className="w-4 h-4" />
												<span>{tab.label}</span>
												{activeTab === tab.id && (
													<Check className="w-4 h-4 ml-auto" />
												)}
											</button>
										))}
									</motion.div>
								)}
							</AnimatePresence>
						</div>
					</div>

					{/* Main Content Area */}
					<main className="flex-1 min-w-0 pb-20 sm:pb-24 lg:pb-8">
						{/* Tab Content */}
						<AnimatePresence mode="wait">
							{/* Profile Tab */}
							{activeTab === 'profile' && (
								<motion.div
									key="profile"
									initial="hidden"
									animate="visible"
									exit="exit"
									variants={fadeIn}
								>
									<motion.div variants={stagger} className="space-y-4 sm:space-y-6">
										{/* Profile Card */}
										<motion.section
											variants={fadeIn}
											className="rounded-xl sm:rounded-2xl border border-border/50 bg-card overflow-hidden"
										>
											<Form {...profileForm}>
												<form
													onSubmit={(e) => {
														e.preventDefault()
														profileForm.handleSubmit(onProfileSubmit)(e)
													}}
													className="divide-y divide-border/30"
												>
													{/* Avatar Section */}
													{me && (
														<div className="p-4 sm:p-6">
															<AvatarUpload
																user={me}
																onAvatarChange={() => refetchMe()}
															/>
														</div>
													)}

													{/* Form Fields */}
													<div className="p-4 sm:p-6 space-y-4 sm:space-y-6">


														{/* Full Name */}
														<FormField
															control={profileForm.control}
															name="fullName"
															render={({ field }) => (
																<FormItem>
																	<FormLabel className="flex items-center gap-2 text-sm">
																		<User className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground" />
																		Имя
																	</FormLabel>
																	<FormControl>
																		<Input
																			{...field}
																			placeholder="Ваше полное имя"
																			className="h-10 sm:h-12 rounded-lg sm:rounded-xl text-sm sm:text-base"
																		/>
																	</FormControl>
																	<FormMessage />
																</FormItem>
															)}
														/>

														{/* Email (Read-only) */}
														<div className="space-y-2">
															<label className="text-sm font-medium flex flex-wrap items-center gap-1.5 sm:gap-2">
																<Mail className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground" />
																<span>Email</span>
																{me?.emailVerified ? (
																	<span className="flex items-center gap-0.5 sm:gap-1 text-[9px] sm:text-[10px] uppercase font-bold text-emerald-500 bg-emerald-500/10 px-1.5 sm:px-2 py-0.5 rounded-full">
																		<CheckCircle2 className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
																		Подтверждён
																	</span>
																) : (
																	<span className="flex items-center gap-0.5 sm:gap-1 text-[9px] sm:text-[10px] uppercase font-bold text-amber-500 bg-amber-500/10 px-1.5 sm:px-2 py-0.5 rounded-full">
																		<AlertCircle className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
																		Не подтверждён
																	</span>
																)}
															</label>
															<div className="relative">
																<Input
																	value={me?.email || ''}
																	disabled
																	className="h-10 sm:h-12 rounded-lg sm:rounded-xl bg-muted/50 pr-20 sm:pr-24 text-xs sm:text-sm truncate"
																/>
																<div className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 sm:gap-2">
																	{!me?.emailVerified && (
																		<button
																			type="button"
																			onClick={handleResendEmail}
																			className="text-[10px] sm:text-xs font-medium text-amber-500 hover:text-amber-600 bg-amber-500/10 hover:bg-amber-500/20 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md transition-colors disabled:opacity-50"
																			disabled={emailCooldown > 0 || sendingEmail}
																		>
																			{emailCooldown > 0 ? `00:${emailCooldown.toString().padStart(2, '0')}` : 'Подтвердить'}
																		</button>
																	)}
																	<button
																		type="button"
																		onClick={() => setActiveTab('security')}
																		className="text-[10px] sm:text-xs font-medium text-primary hover:underline bg-background/80 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md transition-colors"
																	>
																		Изменить
																	</button>
																</div>
															</div>
															{!isTelegramPlaceholderEmail(me?.email) && (
																<p className="text-xs sm:text-[13px] text-muted-foreground px-1">
																	Для изменения email перейдите в раздел <button type="button" onClick={() => setActiveTab('security')} className="text-primary hover:underline">Безопасность</button>
																</p>
															)}
														</div>

														{/* Phone */}
														<FormField
															control={profileForm.control}
															name="phone"
															render={({ field }) => (
																<FormItem>
																	<FormLabel className="flex items-center gap-2 text-sm">
																		<Phone className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground" />
																		Телефон
																	</FormLabel>
																	<FormControl>
																		<Input
																			{...field}
																			placeholder="+7 (___) ___-__-__"
																			className="h-10 sm:h-12 rounded-lg sm:rounded-xl text-sm sm:text-base"
																		/>
																	</FormControl>
																	<FormDescription className="text-xs sm:text-sm">
																		Используется для связи с клиентами
																	</FormDescription>
																	<FormMessage />
																</FormItem>
															)}
														/>

														{/* Registration Date */}
														<div className="space-y-2">
															<label className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
																<Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
																Дата регистрации
															</label>
															<p className="text-xs sm:text-sm px-1">
																{me?.createdAt ? formatDate(me.createdAt) : 'Неизвестно'}
															</p>
														</div>
													</div>

													{/* Submit */}
													<div className="p-4 sm:p-6 bg-secondary/20">
														<Button
															type="submit"
															disabled={updatingProfile || !profileForm.formState.isDirty}
															className="w-full sm:w-auto h-10 sm:h-12 rounded-lg sm:rounded-xl px-4 sm:px-8 text-sm sm:text-base"
														>
															{updatingProfile ? (
																<>
																	<Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-2 animate-spin" />
																	Сохранение...
																</>
															) : (
																<>
																	<Save className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-2" />
																	Сохранить изменения
																</>
															)}
														</Button>
													</div>
												</form>
											</Form>
										</motion.section>

										{/* Social Connections */}
										<motion.section
											variants={fadeIn}
											className="rounded-xl sm:rounded-2xl border border-border/50 bg-card overflow-hidden"
										>
											<div className="p-4 sm:p-6 border-b border-border/30">
												<div className="flex items-center gap-2 sm:gap-3">
													<div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-primary/10 flex items-center justify-center">
														<Link2 className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
													</div>
													<div>
														<h2 className="font-semibold text-sm sm:text-base">Связанные аккаунты</h2>
														<p className="text-xs sm:text-sm text-muted-foreground">Подключите социальные сети</p>
													</div>
												</div>
											</div>

											<div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
												{/* Telegram */}
												<TelegramConnection
													isConnected={!!me?.telegramChatId}
													telegramUsername={me?.telegramUsername || undefined}
													onUnlink={refetchMe}
													onLinkSuccess={refetchMe}
												/>

												{/* Info */}
												<div className="p-3 sm:p-4 rounded-lg sm:rounded-xl bg-blue-500/5 border border-blue-500/20">
													<p className="text-xs sm:text-sm text-muted-foreground">
														<span className="font-medium text-blue-600 dark:text-blue-400">💡 Telegram Bot</span>
														{' '}позволит получать уведомления о новых расходах, фотоотчётах и изменениях в проектах прямо в мессенджер.
													</p>
												</div>
											</div>
										</motion.section>
									</motion.div>
								</motion.div>
							)}

							{/* Security Tab */}
							{activeTab === 'security' && (
								<motion.div
									key="security"
									initial="hidden"
									animate="visible"
									exit="exit"
									variants={fadeIn}
								>
									<motion.div variants={stagger} className="space-y-4 sm:space-y-6">
										{/* Password Section */}
										<motion.section
											variants={fadeIn}
											className="rounded-xl sm:rounded-2xl border border-border/50 bg-card overflow-hidden"
										>
											<div className="p-4 sm:p-6 border-b border-border/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
												<div className="flex items-center gap-2 sm:gap-3">
													<div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-primary/10 flex items-center justify-center">
														<Key className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
													</div>
													<div>
														<h2 className="font-semibold text-sm sm:text-base">Пароль</h2>
														<p className="text-xs sm:text-sm text-muted-foreground">Изменить пароль аккаунта</p>
													</div>
												</div>
												{!showPasswordForm && (
													<Button
														variant="outline"
														onClick={() => setShowPasswordForm(true)}
														className="rounded-lg sm:rounded-xl h-9 sm:h-10 text-sm self-start sm:self-auto"
													>
														Изменить
													</Button>
												)}
											</div>

											{showPasswordForm && (
												<div className="p-4 sm:p-6">
													<Form {...passwordForm}>
														<form
															onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}
															className="space-y-3 sm:space-y-4"
														>
															<FormField
																control={passwordForm.control}
																name="currentPassword"
																render={({ field }) => (
																	<FormItem>
																		<FormLabel className="text-sm">Текущий пароль</FormLabel>
																		<FormControl>
																			<PasswordInput
																				{...field}
																				placeholder="Введите текущий пароль"
																				className="h-10 sm:h-12 rounded-lg sm:rounded-xl text-sm sm:text-base"
																			/>
																		</FormControl>
																		<FormMessage />
																	</FormItem>
																)}
															/>

															<FormField
																control={passwordForm.control}
																name="newPassword"
																render={({ field }) => (
																	<FormItem>
																		<FormLabel className="text-sm">Новый пароль</FormLabel>
																		<FormControl>
																			<PasswordInput
																				{...field}
																				placeholder="Минимум 8 символов"
																				className="h-10 sm:h-12 rounded-lg sm:rounded-xl text-sm sm:text-base"
																			/>
																		</FormControl>
																		<FormMessage />
																	</FormItem>
																)}
															/>

															<FormField
																control={passwordForm.control}
																name="confirmPassword"
																render={({ field }) => (
																	<FormItem>
																		<FormLabel className="text-sm">Подтвердите пароль</FormLabel>
																		<FormControl>
																			<PasswordInput
																				{...field}
																				placeholder="Повторите новый пароль"
																				className="h-10 sm:h-12 rounded-lg sm:rounded-xl text-sm sm:text-base"
																			/>
																		</FormControl>
																		<FormMessage />
																	</FormItem>
																)}
															/>

															<div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-2">
																<Button
																	type="button"
																	variant="outline"
																	onClick={() => {
																		setShowPasswordForm(false)
																		passwordForm.reset()
																	}}
																	className="h-10 sm:h-12 rounded-lg sm:rounded-xl sm:flex-1 text-sm sm:text-base"
																>
																	Отмена
																</Button>
																<Button
																	type="submit"
																	disabled={changingPassword}
																	className="h-10 sm:h-12 rounded-lg sm:rounded-xl sm:flex-1 text-sm sm:text-base"
																>
																	{changingPassword ? (
																		<>
																			<Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-2 animate-spin" />
																			Сохранение...
																		</>
																	) : (
																		'Изменить пароль'
																	)}
																</Button>
															</div>
														</form>
													</Form>
												</div>
											)}
										</motion.section>

										{/* Email Section */}
										<motion.section
											variants={fadeIn}
											className="rounded-xl sm:rounded-2xl border border-border/50 bg-card overflow-hidden"
										>
											{isTelegramPlaceholderEmail(me?.email || '') ? (
												// Telegram User View
												<div className="p-4 sm:p-6">
													<div className="p-3 sm:p-4 rounded-lg sm:rounded-xl bg-blue-500/10 border border-blue-500/30">
														<div className="flex items-start gap-2 sm:gap-3">
															<Info className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500 flex-shrink-0 mt-0.5" />
															<div>
																<p className="font-medium text-blue-600 dark:text-blue-400 mb-1 text-sm sm:text-base">
																	Telegram-пользователь
																</p>
																<p className="text-xs sm:text-sm text-muted-foreground">
																	{getTelegramEmailMessage(me?.email || '')}
																</p>
															</div>
														</div>
													</div>
												</div>
											) : (
												// Email User View
												<>
													<div className="p-4 sm:p-6 border-b border-border/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
														<div className="flex items-center gap-2 sm:gap-3">
															<div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-primary/10 flex items-center justify-center">
																<Mail className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
															</div>
															<div className="min-w-0">
																<h2 className="font-semibold text-sm sm:text-base">Email адрес</h2>
																<div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mt-0.5">
																	<p className="text-xs sm:text-sm text-muted-foreground truncate max-w-[150px] sm:max-w-none">
																		{me?.email}
																	</p>
																	{me?.emailVerified ? (
																		<Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 h-4 sm:h-5 px-1 sm:px-1.5 text-[9px] sm:text-[10px]">
																			Подтверждён
																		</Badge>
																	) : (
																		<Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20 h-4 sm:h-5 px-1 sm:px-1.5 text-[9px] sm:text-[10px]">
																			Не подтверждён
																		</Badge>
																	)}
																</div>
															</div>
														</div>
														{!showEmailForm && (
															<Button
																variant="outline"
																onClick={() => setShowEmailForm(true)}
																className="rounded-lg sm:rounded-xl h-9 sm:h-10 text-sm self-start sm:self-auto"
															>
																Изменить
															</Button>
														)}
													</div>

													{/* Verification Alert (if not verified) */}
													{!me?.emailVerified && !showEmailForm && (
														<div className="px-4 sm:px-6 py-3 sm:py-4 bg-amber-500/5">
															<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4">
																<div className="text-xs sm:text-sm text-amber-600 dark:text-amber-400">
																	Email не подтверждён. Функция восстановления пароля недоступна.
																</div>
																<Button
																	variant="ghost"
																	size="sm"
																	onClick={handleResendEmail}
																	disabled={sendingEmail || emailCooldown > 0}
																	className="text-amber-600 hover:text-amber-700 hover:bg-amber-500/10 h-7 sm:h-8 text-[10px] sm:text-xs whitespace-nowrap self-start sm:self-auto"
																>
																	{sendingEmail ? (
																		<Loader2 className="w-3 h-3 mr-1 animate-spin" />
																	) : (
																		<Send className="w-3 h-3 mr-1" />
																	)}
																	{emailCooldown > 0
																		? `${emailCooldown}с`
																		: 'Подтвердить'
																	}
																</Button>
															</div>
														</div>
													)}

													{showEmailForm && (
														<div className="p-4 sm:p-6">
															<Form {...emailChangeForm}>
																<form
																	onSubmit={emailChangeForm.handleSubmit(onEmailChangeSubmit)}
																	className="space-y-3 sm:space-y-4"
																>
																	<FormField
																		control={emailChangeForm.control}
																		name="newEmail"
																		render={({ field }) => (
																			<FormItem>
																				<FormLabel className="text-sm">Новый email адрес</FormLabel>
																				<FormControl>
																					<Input
																						{...field}
																						type="email"
																						placeholder="example@email.com"
																						className="h-10 sm:h-12 rounded-lg sm:rounded-xl text-sm sm:text-base"
																					/>
																				</FormControl>
																				<FormMessage />
																				<FormDescription className="text-xs sm:text-sm">
																					На новый email будет отправлено письмо для подтверждения
																				</FormDescription>
																			</FormItem>
																		)}
																	/>

																	{is2FAEnabled && (
																		<FormField
																			control={emailChangeForm.control}
																			name="twoFactorCode"
																			render={({ field }) => (
																				<FormItem>
																					<FormLabel className="text-sm">Код двухфакторной аутентификации</FormLabel>
																					<FormControl>
																						<Input
																							{...field}
																							type="text"
																							placeholder="000000"
																							maxLength={6}
																							className="h-10 sm:h-12 rounded-lg sm:rounded-xl text-center text-base sm:text-lg tracking-widest font-mono"
																							onChange={(e) => {
																								const value = e.target.value.replace(/\D/g, '').slice(0, 6)
																								field.onChange(value)
																							}}
																						/>
																					</FormControl>
																					<FormMessage />
																					<FormDescription className="text-xs sm:text-sm">
																						Для изменения email требуется подтверждение 2FA
																					</FormDescription>
																				</FormItem>
																			)}
																		/>
																	)}

																	<div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-2">
																		<Button
																			type="button"
																			variant="outline"
																			onClick={() => {
																				setShowEmailForm(false)
																				emailChangeForm.reset()
																				setPendingNewEmail(null)
																			}}
																			className="h-10 sm:h-12 rounded-lg sm:rounded-xl sm:flex-1 text-sm sm:text-base"
																		>
																			Отмена
																		</Button>
																		<Button
																			type="submit"
																			disabled={changingEmail}
																			className="h-10 sm:h-12 rounded-lg sm:rounded-xl sm:flex-1 text-sm sm:text-base"
																		>
																			{changingEmail ? (
																				<>
																					<Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-2 animate-spin" />
																					Отправка...
																				</>
																			) : (
																				'Изменить email'
																			)}
																		</Button>
																	</div>
																</form>
															</Form>
														</div>
													)}
												</>
											)}
										</motion.section>

										{/* Two-Factor Authentication */}
										<TwoFactorAuth />

										{/* Sessions Section */}
										<motion.section
											variants={fadeIn}
											className="rounded-xl sm:rounded-2xl border border-border/50 bg-card overflow-hidden"
										>
											<div className="p-4 sm:p-6 border-b border-border/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
												<div className="flex items-center gap-2 sm:gap-3">
													<div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-primary/10 flex items-center justify-center">
														<Monitor className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
													</div>
													<div>
														<h2 className="font-semibold text-sm sm:text-base flex items-center gap-1.5 sm:gap-2">
															Активные сессии
															<Badge variant="secondary" className="text-[10px] sm:text-xs h-4 sm:h-5 px-1 sm:px-1.5">{sessions.length}</Badge>
														</h2>
														<p className="text-xs sm:text-sm text-muted-foreground">Устройства с доступом к аккаунту</p>
													</div>
												</div>
												{sessions.length > 1 && (
													<Button
														variant="ghost"
														size="sm"
														onClick={() => revokeAllSessions()}
														disabled={revokingAll}
														className="text-destructive hover:text-destructive hover:bg-destructive/10 rounded-lg sm:rounded-xl self-start sm:self-auto h-8 sm:h-9 text-xs sm:text-sm"
													>
														{revokingAll ? (
															<Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin" />
														) : (
															<>
																<LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
																Завершить все
															</>
														)}
													</Button>
												)}
											</div>

											<div className="divide-y divide-border/30">
												{sessionsLoading ? (
													<div className="p-3 sm:p-4 space-y-2 sm:space-y-3">
														<Skeleton className="h-12 sm:h-16 rounded-lg sm:rounded-xl" />
														<Skeleton className="h-12 sm:h-16 rounded-lg sm:rounded-xl" />
													</div>
												) : sessions.length === 0 ? (
													<div className="p-6 sm:p-8 text-center text-muted-foreground">
														<Monitor className="w-8 h-8 sm:w-10 sm:h-10 mx-auto mb-2 opacity-50" />
														<p className="text-sm sm:text-base">Нет активных сессий</p>
													</div>
												) : (
													sessions.map((session: any) => (
														<div
															key={session.id}
															className={cn(
																'p-3 sm:p-4 flex items-center justify-between gap-2 sm:gap-4',
																session.current && 'bg-primary/5'
															)}
														>
															<div className="flex items-center gap-2 sm:gap-4 min-w-0">
																<div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
																	{getDeviceIcon(session)}
																</div>
																<div className="min-w-0">
																	<div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
																		<span className="font-medium text-sm sm:text-base truncate max-w-[120px] sm:max-w-none">
																			{getDeviceName(session)}
																		</span>
																		{session.current && (
																			<Badge variant="default" className="text-[10px] sm:text-xs h-4 sm:h-5 px-1 sm:px-1.5">
																				Текущая
																			</Badge>
																		)}
																	</div>
																	<div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-muted-foreground flex-wrap">
																		<span className="flex items-center gap-0.5 sm:gap-1">
																			<Globe className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
																			{getLocation(session)}
																		</span>
																		<span className="hidden sm:inline">•</span>
																		<span>{formatSessionDate(session.createdAt)}</span>
																	</div>
																</div>
															</div>
															{!session.current && (
																<Button
																	variant="ghost"
																	size="icon"
																	onClick={() =>
																		revokeSession({ variables: { sessionId: session.id } })
																	}
																	className="text-destructive hover:text-destructive hover:bg-destructive/10 rounded-lg sm:rounded-xl flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10"
																>
																	<LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
																</Button>
															)}
														</div>
													))
												)}
											</div>
										</motion.section>

										{/* Login History */}
										<motion.section
											variants={fadeIn}
											className="rounded-xl sm:rounded-2xl border border-border/50 bg-card overflow-hidden"
										>
											<div className="p-4 sm:p-6 border-b border-border/30">
												<div className="flex items-center gap-2 sm:gap-3">
													<div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-primary/10 flex items-center justify-center">
														<FolderKanban className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
													</div>
													<div>
														<h2 className="font-semibold text-sm sm:text-base">История входов</h2>
														<p className="text-xs sm:text-sm text-muted-foreground">Последние действия в аккаунте</p>
													</div>
												</div>
											</div>

											<div className="divide-y divide-border/30">
												{historyLoading ? (
													<div className="p-3 sm:p-4 space-y-2 sm:space-y-3">
														<Skeleton className="h-10 sm:h-12 w-full rounded-lg sm:rounded-xl" />
														<Skeleton className="h-10 sm:h-12 w-full rounded-lg sm:rounded-xl" />
														<Skeleton className="h-10 sm:h-12 w-full rounded-lg sm:rounded-xl" />
													</div>
												) : loginHistory.length === 0 ? (
													<div className="p-6 sm:p-8 text-center text-muted-foreground">
														<p className="text-sm sm:text-base">История пуста</p>
													</div>
												) : (
													loginHistory.map((entry: any) => (
														<div key={entry.id} className="p-3 sm:p-4 flex items-center justify-between gap-2 sm:gap-4 text-xs sm:text-sm">
															<div className="flex items-center gap-2 sm:gap-4 min-w-0">
																<div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-secondary/50 flex items-center justify-center flex-shrink-0 text-muted-foreground">
																	{getDeviceIcon(entry)}
																</div>
																<div className="grid gap-0.5 min-w-0">
																	<div className="font-medium truncate text-sm sm:text-base max-w-[140px] sm:max-w-none">
																		{getDeviceName(entry)}
																	</div>
																	<div className="text-[10px] sm:text-xs text-muted-foreground flex items-center gap-1 sm:gap-1.5 flex-wrap">
																		<span>{formatSessionDate(entry.createdAt)}</span>
																		<span className="hidden sm:inline">•</span>
																		<span className="truncate max-w-[100px] sm:max-w-none">{getLocation(entry)}</span>
																	</div>
																</div>
															</div>
														</div>
													))
												)}
											</div>
										</motion.section>

										{/* Danger Zone - Delete Account */}
										<DeleteAccountDialog userEmail={me?.email} />
									</motion.div>
								</motion.div>
							)}

							{/* Appearance Tab */}
							{activeTab === 'appearance' && (
								<motion.div
									key="appearance"
									initial="hidden"
									animate="visible"
									exit="exit"
									variants={fadeIn}
								>
									<motion.div variants={stagger} className="space-y-4 sm:space-y-6">
										<motion.section
											variants={fadeIn}
											className="rounded-xl sm:rounded-2xl border border-border/50 bg-card overflow-hidden"
										>
											<div className="p-4 sm:p-6 flex flex-col gap-4">
												<div className="flex items-center justify-between">
													<div className="flex items-center gap-2 sm:gap-3">
														<div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
															<Palette className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
														</div>
														<div>
															<h2 className="font-semibold text-sm sm:text-base">Тема оформления</h2>
															<p className="text-xs sm:text-sm text-muted-foreground">Выберите предпочитаемую тему</p>
														</div>
													</div>

													<div className="flex items-center gap-1 sm:gap-2">
														{[
															{ id: 'light', label: 'Светлая', icon: Sun },
															{ id: 'dark', label: 'Тёмная', icon: Moon },
															{ id: 'system', label: 'Системная', icon: Monitor },
														].map((item) => (
															<button
																key={item.id}
																onClick={() => setTheme(item.id)}
																title={item.label}
																className={cn(
																	"w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center transition-all border",
																	theme === item.id
																		? "bg-primary/10 text-primary border-primary/20 ring-1 ring-primary/20"
																		: "bg-transparent text-muted-foreground border-transparent hover:bg-secondary/50 hover:text-foreground"
																)}
															>
																<item.icon className="w-4 h-4 sm:w-5 sm:h-5" />
															</button>
														))}
													</div>
												</div>

												<p className="text-xs text-muted-foreground px-1">
													{theme === 'system'
														? `Системная тема автоматически подстраивается под настройки вашего устройства (${resolvedTheme === 'dark' ? 'сейчас тёмная' : 'сейчас светлая'}).`
														: 'Выбранная тема будет использоваться на всех страницах приложения.'}
												</p>
											</div>
										</motion.section>
									</motion.div>
								</motion.div>
							)}

							{/* Notifications Tab */}
							{activeTab === 'notifications' && (
								<motion.div
									key="notifications"
									initial="hidden"
									animate="visible"
									exit="exit"
									variants={fadeIn}
								>
									<motion.div variants={stagger} className="space-y-4 sm:space-y-6">
										{/* Email Notifications */}
										<motion.section
											variants={fadeIn}
											className="rounded-xl sm:rounded-2xl border border-border/50 bg-card overflow-hidden"
										>
											<div className="p-4 sm:p-6 border-b border-border/30">
												<div className="flex items-center gap-2 sm:gap-3">
													<div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-primary/10 flex items-center justify-center">
														<Mail className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
													</div>
													<div>
														<h2 className="font-semibold text-sm sm:text-base">Email-уведомления</h2>
														<p className="text-xs sm:text-sm text-muted-foreground">Настройте уведомления на почту</p>
													</div>
												</div>
											</div>

											<div className="divide-y divide-border/30">
												{[
													{ id: 'appEmail', label: 'Системные уведомления', description: 'Важные обновления системы', icon: Receipt },
													{ id: 'marketingEmail', label: 'Маркетинговые рассылки', description: 'Новости и специальные предложения', icon: CreditCard },
												].map((item) => (
													<div key={item.id} className="p-3 sm:p-4 flex items-center justify-between gap-2 sm:gap-4">
														<div className="flex items-center gap-2 sm:gap-4 min-w-0">
															<div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-secondary flex items-center justify-center flex-shrink-0">
																<item.icon className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
															</div>
															<div className="min-w-0">
																<p className="font-medium text-sm sm:text-base truncate">{item.label}</p>
																<p className="text-xs sm:text-sm text-muted-foreground truncate">{item.description}</p>
															</div>
														</div>
														<Switch
															checked={notificationSettings ? (notificationSettings as any)[item.id] : false}
															onCheckedChange={(checked) => onNotificationChange(item.id, checked)}
															disabled={meLoading}
															className="flex-shrink-0"
														/>
													</div>
												))}
											</div>
										</motion.section>

										{/* Push Notifications */}
										<motion.section
											variants={fadeIn}
											className="rounded-xl sm:rounded-2xl border border-border/50 bg-card overflow-hidden"
										>
											<div className="p-4 sm:p-6 border-b border-border/30">
												<div className="flex items-center gap-2 sm:gap-3">
													<div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-primary/10 flex items-center justify-center">
														<BellRing className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
													</div>
													<div>
														<h2 className="font-semibold text-sm sm:text-base">Push-уведомления</h2>
														<p className="text-xs sm:text-sm text-muted-foreground">Мгновенные уведомления в браузере</p>
													</div>
												</div>
											</div>

											<div className="divide-y divide-border/30">
												{[
													{ id: 'appPush', label: 'Push-уведомления приложения', description: 'Мгновенные оповещения о событиях', icon: Bell },
													{ id: 'marketingPush', label: 'Маркетинговые Push', description: 'Новости и акции', icon: Info },
												].map((item) => (
													<div key={item.id} className="p-3 sm:p-4 flex items-center justify-between gap-2 sm:gap-4">
														<div className="flex items-center gap-2 sm:gap-4 min-w-0">
															<div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-secondary flex items-center justify-center flex-shrink-0">
																<item.icon className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
															</div>
															<div className="min-w-0">
																<p className="font-medium text-sm sm:text-base truncate">{item.label}</p>
																<p className="text-xs sm:text-sm text-muted-foreground truncate">{item.description}</p>
															</div>
														</div>
														<Switch
															checked={notificationSettings ? (notificationSettings as any)[item.id] : false}
															onCheckedChange={(checked) => onNotificationChange(item.id, checked)}
															disabled={meLoading}
															className="flex-shrink-0"
														/>
													</div>
												))}
											</div>
										</motion.section>

										{/* Telegram Integration */}
										<motion.section variants={fadeIn}>
											<TelegramIntegration
												user={{
													id: me?.id || '',
													telegramChatId: (me as any)?.telegramChatId,
													telegramUsername: (me as any)?.telegramUsername,
													telegramPhotoUrl: (me as any)?.telegramPhotoUrl,
												}}
												onDisconnect={() => refetchMe()}
											/>
										</motion.section>

										{/* Detailed Notification Preferences */}
										<motion.section variants={fadeIn}>
											<NotificationPreferences
												settings={{
													notifyProjectCreated: (notificationSettings as any)?.notifyProjectCreated,
													notifyProjectCompleted: (notificationSettings as any)?.notifyProjectCompleted,
													notifyExpenseAdded: (notificationSettings as any)?.notifyExpenseAdded,
													notifyPayoutCalculated: (notificationSettings as any)?.notifyPayoutCalculated,
													notifyPayoutPaid: (notificationSettings as any)?.notifyPayoutPaid,
													notifyMemberInvited: (notificationSettings as any)?.notifyMemberInvited,
													notifyMemberJoined: (notificationSettings as any)?.notifyMemberJoined,
													notifyMemberRemoved: (notificationSettings as any)?.notifyMemberRemoved,
													notifyTaskAssigned: (notificationSettings as any)?.notifyTaskAssigned,
													notifyTaskCompleted: (notificationSettings as any)?.notifyTaskCompleted,
													notifyPhotoReportCreated: (notificationSettings as any)?.notifyPhotoReportCreated,
													notifySubscriptionExpiring: (notificationSettings as any)?.notifySubscriptionExpiring,
													emailFrequency: (notificationSettings as any)?.emailFrequency,
													pushFrequency: (notificationSettings as any)?.pushFrequency,
													quietHoursEnabled: (notificationSettings as any)?.quietHoursEnabled,
													quietHoursStart: (notificationSettings as any)?.quietHoursStart,
													quietHoursEnd: (notificationSettings as any)?.quietHoursEnd,
												}}
												onUpdate={() => {
													// Cache is updated by mutation, no need to refetch
												}}
											/>
										</motion.section>
									</motion.div>
								</motion.div>
							)}

							{/* Subscription Tab */}
							{activeTab === 'subscription' && (
								<motion.div
									key="subscription"
									initial="hidden"
									animate="visible"
									exit="exit"
									variants={fadeIn}
								>
									<motion.div variants={stagger} className="space-y-4 sm:space-y-6">
										<motion.section variants={fadeIn}>
											<SubscriptionManagement />
										</motion.section>

										<motion.section variants={fadeIn}>
											<SubscriptionHistory />
										</motion.section>
									</motion.div>
								</motion.div>
							)}

							{/* Help Tab */}
							{activeTab === 'help' && (
								<motion.div
									key="help"
									initial="hidden"
									animate="visible"
									exit="exit"
									variants={fadeIn}
								>
									<motion.div variants={stagger} className="space-y-4 sm:space-y-6">
										<AnimatePresence mode="wait">
											{!sectionFromUrl ? (
												<motion.div
													key="help-list"
													initial="hidden"
													animate="visible"
													exit="exit"
													variants={stagger}
													className="space-y-4 sm:space-y-6"
												>
													{/* FAQ */}
													<motion.section
														variants={fadeIn}
														className="rounded-xl sm:rounded-2xl border border-border/50 bg-card overflow-hidden"
													>
														<div className="p-4 sm:p-6 border-b border-border/30">
															<div className="flex items-center gap-2 sm:gap-3">
																<div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-primary/10 flex items-center justify-center">
																	<HelpCircle className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
																</div>
																<div>
																	<h2 className="font-semibold text-sm sm:text-base">Часто задаваемые вопросы</h2>
																	<p className="text-xs sm:text-sm text-muted-foreground">Ответы на популярные вопросы</p>
																</div>
															</div>
														</div>

														<div className="divide-y divide-border/30">
															{[
																{
																	q: 'Как создать фотоотчёт для клиента?',
																	a: 'Откройте проект → вкладка "Фотоотчёты" → нажмите "+ Новый отчёт". Загрузите фото, добавьте комментарий и отправьте ссылку клиенту.',
																},
																{
																	q: 'Как рассчитывается зарплата бригады?',
																	a: 'Для каждого участника можно настроить тип оплаты: % от прибыли, фикс за объект, за м², за день или почасовая. При закрытии объекта система автоматически рассчитает зарплату.',
																},
																{
																	q: 'Как пригласить участника в бригаду?',
																	a: 'Перейдите в настройки команды → "Пригласить участника". Отправьте сгенерированную ссылку или QR-код. Участник сможет присоединиться через Telegram или email.',
																},
																{
																	q: 'Как архивировать объект?',
																	a: 'Откройте объект → нажмите "В архив". Архивные объекты не учитываются в лимите активных проектов вашего тарифа.',
																},
																{
																	q: 'Как изменить тариф?',
																	a: 'Перейдите в Настройки → Подписка. Выберите нужный тариф и подтвердите оплату. Изменения вступят в силу сразу или с нового периода.',
																},
																{
																	q: 'Что видит клиент по ссылке на фотоотчёт?',
																	a: 'Клиент видит: название бригады, логотип, название объекта, прогресс выполнения, фотографии и комментарий. Может оставить реакции на фото.',
																},
															].map((faq, i) => (
																<details key={i} className="group">
																	<summary className="p-3 sm:p-4 flex items-center justify-between cursor-pointer list-none hover:bg-secondary/30 transition-colors">
																		<span className="font-medium pr-2 sm:pr-4 text-sm sm:text-base">{faq.q}</span>
																		<ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground transition-transform group-open:rotate-90 flex-shrink-0" />
																	</summary>
																	<div className="px-3 sm:px-4 pb-3 sm:pb-4 text-xs sm:text-sm text-muted-foreground">
																		{faq.a}
																	</div>
																</details>
															))}
														</div>
													</motion.section>

													{/* Contact Support */}
													<motion.section
														variants={fadeIn}
														className="rounded-xl sm:rounded-2xl border border-border/50 bg-card overflow-hidden"
													>
														<div className="p-4 sm:p-6 border-b border-border/30">
															<div className="flex items-center gap-2 sm:gap-3">
																<div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-primary/10 flex items-center justify-center">
																	<MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
																</div>
																<div>
																	<h2 className="font-semibold text-sm sm:text-base">Связаться с поддержкой</h2>
																	<p className="text-xs sm:text-sm text-muted-foreground">Мы всегда рады помочь</p>
																</div>
															</div>
														</div>

														<div className="p-4 sm:p-6 grid gap-3 sm:gap-4 sm:grid-cols-2">
															<a
																href="https://t.me/ProRabSupportBot"
																target="_blank"
																rel="noopener noreferrer"
																className="p-3 sm:p-4 rounded-lg sm:rounded-xl border border-border/50 hover:border-[#2AABEE]/50 hover:bg-[#2AABEE]/5 transition-all flex items-center gap-2 sm:gap-4"
															>
																<div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-[#2AABEE]/10 flex items-center justify-center flex-shrink-0">
																	<svg className="w-5 h-5 sm:w-6 sm:h-6 text-[#2AABEE]" viewBox="0 0 24 24" fill="currentColor">
																		<path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
																	</svg>
																</div>
																<div className="min-w-0">
																	<p className="font-medium text-sm sm:text-base">Telegram</p>
																	<p className="text-xs sm:text-sm text-muted-foreground truncate">@ProRabSupportBot</p>
																</div>
																<ExternalLink className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground ml-auto flex-shrink-0" />
															</a>

															<a
																href="mailto:support@prorab.space"
																className="p-3 sm:p-4 rounded-lg sm:rounded-xl border border-border/50 hover:border-primary/50 hover:bg-primary/5 transition-all flex items-center gap-2 sm:gap-4"
															>
																<div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
																	<Mail className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
																</div>
																<div className="min-w-0">
																	<p className="font-medium text-sm sm:text-base">Email</p>
																	<p className="text-xs sm:text-sm text-muted-foreground truncate">support@prorab.space</p>
																</div>
																<ExternalLink className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground ml-auto flex-shrink-0" />
															</a>
														</div>

														<div className="px-4 sm:px-6 pb-4 sm:pb-6">
															<div className="p-3 sm:p-4 rounded-lg sm:rounded-xl bg-primary/5 border border-primary/20">
																<div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
																	<Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
																	<span className="text-xs sm:text-sm font-medium">Время ответа</span>
																</div>
																<p className="text-xs sm:text-sm text-muted-foreground">
																	Обычно отвечаем в течение 2-4 часов в рабочее время (10:00–19:00 МСК). В выходные — до 24 часов.
																</p>
															</div>
														</div>
													</motion.section>

													{/* Documentation */}
													<motion.section
														variants={fadeIn}
														className="rounded-xl sm:rounded-2xl border border-border/50 bg-card overflow-hidden"
													>
														<div className="p-4 sm:p-6 border-b border-border/30">
															<div className="flex items-center gap-2 sm:gap-3">
																<div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-primary/10 flex items-center justify-center">
																	<FileText className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
																</div>
																<div>
																	<h2 className="font-semibold text-sm sm:text-base">Документация</h2>
																	<p className="text-xs sm:text-sm text-muted-foreground">Полезные материалы</p>
																</div>
															</div>
														</div>

														<div className="divide-y divide-border/30">
															{[
																{ title: 'Быстрый старт', description: 'Начните работу за 5 минут', href: '/settings?tab=help&section=quick-start', icon: Zap },
																{ title: 'Видеоуроки', description: 'Пошаговые инструкции', href: '/settings?tab=help&section=videos', icon: Video },
																{ title: 'Обновления', description: 'Что нового в ProRab', href: '/settings?tab=help&section=updates', icon: RefreshCw },
																{ title: 'API (в разработке)', description: 'Для разработчиков', href: '/settings?tab=help&section=api', icon: Code },
															].map((doc) => (
																<Link
																	key={doc.title}
																	href={doc.href}
																	className="p-3 sm:p-4 flex items-center justify-between hover:bg-secondary/30 transition-colors group"
																>
																	<div className="flex items-center gap-3">
																		<div className="w-8 h-8 rounded-lg bg-secondary/50 flex items-center justify-center group-hover:bg-background transition-colors">
																			<doc.icon className="w-4 h-4 text-muted-foreground" />
																		</div>
																		<div className="min-w-0">
																			<p className="font-medium text-sm sm:text-base">{doc.title}</p>
																			<p className="text-xs sm:text-sm text-muted-foreground truncate">{doc.description}</p>
																		</div>
																	</div>
																	<ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground flex-shrink-0" />
																</Link>
															))}
														</div>
													</motion.section>
												</motion.div>
											) : (
												<motion.div
													key="help-detail"
													initial="hidden"
													animate="visible"
													exit="exit"
													variants={fadeIn}
												>
													<motion.section
														variants={fadeIn}
														className="rounded-xl sm:rounded-2xl border border-border/50 bg-card overflow-hidden p-4 sm:p-6"
													>
														{sectionFromUrl === 'quick-start' && <QuickStartView />}
														{sectionFromUrl === 'updates' && <UpdatesView />}
														{sectionFromUrl === 'videos' && <UnderDevelopmentView title="Видеоуроки" />}
														{sectionFromUrl === 'api' && <UnderDevelopmentView title="API Документация" />}
													</motion.section>
												</motion.div>
											)}
										</AnimatePresence>
									</motion.div>
								</motion.div>
							)}

							{/* About Tab */}
							{activeTab === 'about' && (
								<motion.div
									key="about"
									initial="hidden"
									animate="visible"
									exit="exit"
									variants={fadeIn}
								>
									<motion.div variants={stagger} className="space-y-4 sm:space-y-6">
										{/* App Info */}
										<motion.section
											variants={fadeIn}
											className="rounded-xl sm:rounded-2xl border border-border/50 bg-card overflow-hidden"
										>
											<div className="p-6 sm:p-8 text-center">
												<div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl sm:rounded-2xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-lg shadow-primary/20">
													<Building2 className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
												</div>
												<h1 className="text-xl sm:text-2xl font-bold mb-1">ProRab</h1>
												<p className="text-muted-foreground text-sm sm:text-base mb-3 sm:mb-4">Версия {APP_VERSION}</p>
												<p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto">
													Приложение для малых строительных и ремонтных бригад. Учёт расходов, фотоотчёты клиентам, расчёт зарплаты — всё в одном месте.
												</p>
											</div>
										</motion.section>

										{/* Features */}
										<motion.section
											variants={fadeIn}
											className="rounded-xl sm:rounded-2xl border border-border/50 bg-card overflow-hidden"
										>
											<div className="p-4 sm:p-6 border-b border-border/30">
												<h2 className="font-semibold text-sm sm:text-base flex items-center gap-1.5 sm:gap-2">
													<Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
													Возможности
												</h2>
											</div>

											<div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 p-4 sm:p-6">
												{[
													{ icon: Receipt, title: 'Учёт расходов', description: 'Контроль финансов каждого объекта' },
													{ icon: CameraIcon, title: 'Фотоотчёты', description: 'Красивые отчёты для клиентов' },
													{ icon: Calculator, title: 'Расчёт зарплаты', description: 'Автоматический расчёт для бригады' },
													{ icon: FolderKanban, title: 'Управление проектами', description: 'Все объекты в одном месте' },
													{ icon: Users, title: 'Команда', description: 'Приглашение участников бригады' },
													{ icon: Bell, title: 'Уведомления', description: 'Оповещения о важных событиях' },
												].map((feature) => (
													<div key={feature.title} className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg sm:rounded-xl bg-secondary/30">
														<div className="w-8 h-8 sm:w-10 sm:h-10 rounded-md sm:rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
															<feature.icon className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
														</div>
														<div className="min-w-0">
															<p className="font-medium text-sm sm:text-base">{feature.title}</p>
															<p className="text-xs sm:text-sm text-muted-foreground truncate">{feature.description}</p>
														</div>
													</div>
												))}
											</div>
										</motion.section>

										{/* Links */}
										<motion.section
											variants={fadeIn}
											className="rounded-xl sm:rounded-2xl border border-border/50 bg-card overflow-hidden"
										>
											<div className="p-4 sm:p-6 border-b border-border/30">
												<h2 className="font-semibold text-sm sm:text-base">Ссылки</h2>
											</div>

											<div className="divide-y divide-border/30">
												{[
													{ title: 'Политика конфиденциальности', href: '/privacy' },
													{ title: 'Пользовательское соглашение', href: '/terms' },
													{ title: 'Оферта', href: '/offer' },
												].map((link) => (
													<Link
														key={link.title}
														href={link.href}
														className="p-3 sm:p-4 flex items-center justify-between hover:bg-secondary/30 transition-colors"
													>
														<span className="text-sm sm:text-base">{link.title}</span>
														<ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground flex-shrink-0" />
													</Link>
												))}
											</div>
										</motion.section>

										{/* Social */}
										<motion.section
											variants={fadeIn}
											className="rounded-xl sm:rounded-2xl border border-border/50 bg-card overflow-hidden"
										>
											<div className="p-4 sm:p-6 border-b border-border/30">
												<h2 className="font-semibold text-sm sm:text-base">Мы в социальных сетях</h2>
											</div>

											<div className="p-4 sm:p-6 flex flex-wrap gap-2 sm:gap-3">
												<a
													href="https://t.me/prorab_app"
													target="_blank"
													rel="noopener noreferrer"
													className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl bg-[#2AABEE]/10 text-[#2AABEE] hover:bg-[#2AABEE]/20 transition-colors text-sm"
												>
													<svg className="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24" fill="currentColor">
														<path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
													</svg>
													Telegram
												</a>

												<a
													href="#"
													className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl bg-secondary hover:bg-secondary/80 transition-colors text-sm"
												>
													<Github className="w-4 h-4 sm:w-5 sm:h-5" />
													GitHub
												</a>
											</div>
										</motion.section>

										{/* Made with love */}
										<motion.section
											variants={fadeIn}
											className="rounded-xl sm:rounded-2xl border border-border/50 bg-gradient-to-br from-primary/5 to-primary/10 overflow-hidden"
										>
											<div className="p-4 sm:p-6 text-center">
												<div className="flex items-center justify-center gap-1.5 sm:gap-2 text-muted-foreground text-sm sm:text-base">
													<span>Сделано с</span>
													<Heart className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-500 fill-red-500" />
													<span>для прорабов</span>
												</div>
												<p className="text-xs sm:text-sm text-muted-foreground mt-1.5 sm:mt-2">© 2025 ProRab. Все права защищены.</p>
											</div>
										</motion.section>

										{/* Support Development */}
										<motion.section
											variants={fadeIn}
											className="rounded-xl sm:rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-500/5 to-amber-500/10 overflow-hidden"
										>
											<div className="p-4 sm:p-6 flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
												<div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-amber-500/20 flex items-center justify-center flex-shrink-0">
													<Coffee className="w-6 h-6 sm:w-7 sm:h-7 text-amber-500" />
												</div>
												<div className="text-center sm:text-left flex-1">
													<h3 className="font-semibold text-sm sm:text-base">Поддержите разработку</h3>
													<p className="text-xs sm:text-sm text-muted-foreground">
														Если ProRab помогает вам в работе — угостите разработчика кофе ☕
													</p>
												</div>
												<Button
													variant="outline"
													className="rounded-lg sm:rounded-xl border-amber-500/30 text-amber-600 hover:bg-amber-500/10 h-9 sm:h-10 text-sm"
													onClick={() => setShowDonationDialog(true)}
												>
													<Coffee className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
													Поддержать
												</Button>
											</div>
										</motion.section>

										{/* Donations History Section */}
										<motion.section
											key="donations-history"
											variants={listItem}
											className="mt-6"
										>
											<DonationsHistory />
										</motion.section>
									</motion.div>
								</motion.div>
							)}
						</AnimatePresence>
					</main>
				</div>
			</div>

			{/* 2FA Verification Dialog for Email Change */}
			{show2FADialog && (
				<Dialog open={show2FADialog} onOpenChange={setShow2FADialog}>
					<DialogContent className="max-w-md">
						<DialogHeader>
							<DialogTitle>Подтверждение двухфакторной аутентификации</DialogTitle>
							<DialogDescription>
								Для изменения email адреса требуется подтверждение через двухфакторную аутентификацию.
								Введите 6-значный код из вашего приложения аутентификации.
							</DialogDescription>
						</DialogHeader>
						<div className="space-y-4 py-4">
							<Input
								type="text"
								placeholder="000000"
								maxLength={6}
								className="text-center text-2xl tracking-widest font-mono h-14"
								onChange={(e) => {
									const value = e.target.value.replace(/\D/g, '').slice(0, 6)
									if (value.length === 6) {
										handle2FAConfirm(value)
									}
								}}
								autoFocus
							/>
							<p className="text-sm text-muted-foreground text-center">
								Введите код из приложения аутентификации
							</p>
						</div>
						<DialogFooter>
							<Button
								variant="outline"
								onClick={() => {
									setShow2FADialog(false)
									setPendingNewEmail(null)
								}}
							>
								Отмена
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
			)}

			{/* Donation Dialog */}
			<DonationDialog open={showDonationDialog} onOpenChange={setShowDonationDialog} />
		</div>
	)
}

// Export with Suspense wrapper for useSearchParams
export default function SettingsPage() {
	return (
		<Suspense fallback={<SettingsPageFallback />}>
			<SettingsContent />
		</Suspense>
	)
}

