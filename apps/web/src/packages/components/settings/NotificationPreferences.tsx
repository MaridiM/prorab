'use client'

import { useState } from 'react'
import { useMutation } from '@apollo/client/react'
import { gql } from '@apollo/client'
import { motion } from 'framer-motion'
import {
	Bell,
	BellOff,
	Clock,
	Zap,
	Calendar,
	CalendarDays,
	FolderPlus,
	CheckCircle2,
	Receipt,
	DollarSign,
	UserPlus,
	UserMinus,
	Users,
	ListChecks,
	Camera,
	CreditCard,
	Loader2,
	Save,
} from 'lucide-react'
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
	Switch,
	Button,
	Label,
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/packages/ui'
import { useToast } from '@/packages/hooks/use-toast'

const UPDATE_NOTIFICATION_SETTINGS = gql`
	mutation UpdateNotificationSettings($input: UpdateNotificationSettingsInput!) {
		updateNotificationSettings(input: $input) {
			id
			notifyProjectCreated
			notifyProjectCompleted
			notifyExpenseAdded
			notifyPayoutCalculated
			notifyPayoutPaid
			notifyMemberInvited
			notifyMemberJoined
			notifyMemberRemoved
			notifyTaskAssigned
			notifyTaskCompleted
			notifyPhotoReportCreated
			notifySubscriptionExpiring
			emailFrequency
			pushFrequency
			quietHoursEnabled
			quietHoursStart
			quietHoursEnd
		}
	}
`

interface NotificationPreferencesProps {
	settings: {
		notifyProjectCreated?: boolean
		notifyProjectCompleted?: boolean
		notifyExpenseAdded?: boolean
		notifyPayoutCalculated?: boolean
		notifyPayoutPaid?: boolean
		notifyMemberInvited?: boolean
		notifyMemberJoined?: boolean
		notifyMemberRemoved?: boolean
		notifyTaskAssigned?: boolean
		notifyTaskCompleted?: boolean
		notifyPhotoReportCreated?: boolean
		notifySubscriptionExpiring?: boolean
		emailFrequency?: string
		pushFrequency?: string
		quietHoursEnabled?: boolean
		quietHoursStart?: string | null
		quietHoursEnd?: string | null
	}
	onUpdate: () => void
}

export function NotificationPreferences({ settings, onUpdate }: NotificationPreferencesProps) {
	const { toast } = useToast()
	const [localSettings, setLocalSettings] = useState(settings)
	const [hasChanges, setHasChanges] = useState(false)

	const [updateSettings, { loading: updating }] = useMutation(UPDATE_NOTIFICATION_SETTINGS, {
		onCompleted: () => {
			toast('Настройки уведомлений обновлены', 'success')
			setHasChanges(false)
			onUpdate()
		},
		onError: (error) => {
			toast(error.message, 'error')
		},
	})

	const handleToggle = (field: string, value: boolean) => {
		setLocalSettings({ ...localSettings, [field]: value })
		setHasChanges(true)
	}

	const handleFrequencyChange = (field: string, value: string) => {
		setLocalSettings({ ...localSettings, [field]: value })
		setHasChanges(true)
	}

	const handleTimeChange = (field: string, value: string) => {
		setLocalSettings({ ...localSettings, [field]: value })
		setHasChanges(true)
	}

	const handleSave = async () => {
		const input = {
			notifyProjectCreated: localSettings.notifyProjectCreated,
			notifyProjectCompleted: localSettings.notifyProjectCompleted,
			notifyExpenseAdded: localSettings.notifyExpenseAdded,
			notifyPayoutCalculated: localSettings.notifyPayoutCalculated,
			notifyPayoutPaid: localSettings.notifyPayoutPaid,
			notifyMemberInvited: localSettings.notifyMemberInvited,
			notifyMemberJoined: localSettings.notifyMemberJoined,
			notifyMemberRemoved: localSettings.notifyMemberRemoved,
			notifyTaskAssigned: localSettings.notifyTaskAssigned,
			notifyTaskCompleted: localSettings.notifyTaskCompleted,
			notifyPhotoReportCreated: localSettings.notifyPhotoReportCreated,
			notifySubscriptionExpiring: localSettings.notifySubscriptionExpiring,
			emailFrequency: localSettings.emailFrequency,
			pushFrequency: localSettings.pushFrequency,
			quietHoursEnabled: localSettings.quietHoursEnabled,
			quietHoursStart: localSettings.quietHoursStart,
			quietHoursEnd: localSettings.quietHoursEnd,
		}

		await updateSettings({ variables: { input } })
	}

	const eventCategories = [
		{
			title: 'Проекты',
			icon: FolderPlus,
			events: [
				{
					field: 'notifyProjectCreated',
					label: 'Создан новый проект',
					description: 'Уведомить при создании проекта в команде',
					icon: FolderPlus,
				},
				{
					field: 'notifyProjectCompleted',
					label: 'Проект завершён',
					description: 'Уведомить при завершении проекта',
					icon: CheckCircle2,
				},
			],
		},
		{
			title: 'Финансы',
			icon: DollarSign,
			events: [
				{
					field: 'notifyExpenseAdded',
					label: 'Добавлен расход',
					description: 'Уведомить о новых расходах по проекту',
					icon: Receipt,
				},
				{
					field: 'notifyPayoutCalculated',
					label: 'Рассчитаны выплаты',
					description: 'Уведомить о расчёте зарплаты',
					icon: DollarSign,
				},
				{
					field: 'notifyPayoutPaid',
					label: 'Выплата произведена',
					description: 'Уведомить о выплате зарплаты',
					icon: DollarSign,
				},
			],
		},
		{
			title: 'Команда',
			icon: Users,
			events: [
				{
					field: 'notifyMemberInvited',
					label: 'Приглашён участник',
					description: 'Уведомить о приглашении нового участника',
					icon: UserPlus,
				},
				{
					field: 'notifyMemberJoined',
					label: 'Участник присоединился',
					description: 'Уведомить когда участник присоединился к команде',
					icon: UserPlus,
				},
				{
					field: 'notifyMemberRemoved',
					label: 'Участник удалён',
					description: 'Уведомить об удалении участника из команды',
					icon: UserMinus,
				},
			],
		},
		{
			title: 'Задачи и отчёты',
			icon: ListChecks,
			events: [
				{
					field: 'notifyTaskAssigned',
					label: 'Назначена задача',
					description: 'Уведомить о назначении задачи',
					icon: ListChecks,
				},
				{
					field: 'notifyTaskCompleted',
					label: 'Задача выполнена',
					description: 'Уведомить о завершении задачи',
					icon: CheckCircle2,
				},
				{
					field: 'notifyPhotoReportCreated',
					label: 'Создан фотоотчёт',
					description: 'Уведомить о новом фотоотчёте',
					icon: Camera,
				},
			],
		},
		{
			title: 'Подписка',
			icon: CreditCard,
			events: [
				{
					field: 'notifySubscriptionExpiring',
					label: 'Истекает подписка',
					description: 'Уведомить за 3 дня до окончания подписки',
					icon: CreditCard,
				},
			],
		},
	]

	const frequencyOptions = [
		{ value: 'INSTANT', label: 'Мгновенно', icon: Zap, description: 'Отправлять сразу' },
		{ value: 'DAILY', label: 'Ежедневно', icon: Calendar, description: 'Дайджест раз в день' },
		{ value: 'WEEKLY', label: 'Еженедельно', icon: CalendarDays, description: 'Дайджест раз в неделю' },
	]

	// Generate time options (00:00 - 23:00)
	const timeOptions = Array.from({ length: 24 }, (_, i) => {
		const hour = i.toString().padStart(2, '0')
		return { value: `${hour}:00`, label: `${hour}:00` }
	})

	return (
		<div className="space-y-6">
			{/* Event-specific notifications */}
			<Card>
				<CardHeader>
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-3">
							<div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
								<Bell className="w-5 h-5 text-primary" />
							</div>
							<div>
								<CardTitle>События для уведомлений</CardTitle>
								<CardDescription>Выберите, о каких событиях вы хотите получать уведомления</CardDescription>
							</div>
						</div>
					</div>
				</CardHeader>
				<CardContent className="space-y-6">
					{eventCategories.map((category) => (
						<div key={category.title} className="space-y-3">
							<div className="flex items-center gap-2 mb-3">
								<category.icon className="w-4 h-4 text-muted-foreground" />
								<h3 className="font-medium text-sm">{category.title}</h3>
							</div>
							<div className="space-y-3">
								{category.events.map((event) => (
									<div
										key={event.field}
										className="flex items-center justify-between p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors"
									>
										<div className="flex items-center gap-3 flex-1">
											<event.icon className="w-4 h-4 text-muted-foreground flex-shrink-0" />
											<div className="flex-1 min-w-0">
												<p className="font-medium text-sm">{event.label}</p>
												<p className="text-xs text-muted-foreground">{event.description}</p>
											</div>
										</div>
										<Switch
											checked={localSettings[event.field as keyof typeof localSettings] as boolean}
											onCheckedChange={(checked) => handleToggle(event.field, checked)}
										/>
									</div>
								))}
							</div>
						</div>
					))}
				</CardContent>
			</Card>

			{/* Notification frequency */}
			<Card>
				<CardHeader>
					<div className="flex items-center gap-3">
						<div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
							<Clock className="w-5 h-5 text-primary" />
						</div>
						<div>
							<CardTitle>Частота уведомлений</CardTitle>
							<CardDescription>Как часто отправлять уведомления</CardDescription>
						</div>
					</div>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="space-y-2">
						<Label>Email уведомления</Label>
						<Select
							value={localSettings.emailFrequency || 'INSTANT'}
							onValueChange={(value) => handleFrequencyChange('emailFrequency', value)}
						>
							<SelectTrigger className="h-12 rounded-xl">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{frequencyOptions.map((option) => (
									<SelectItem key={option.value} value={option.value}>
										<div className="flex items-center gap-2">
											<option.icon className="w-4 h-4" />
											<div>
												<p className="font-medium">{option.label}</p>
												<p className="text-xs text-muted-foreground">{option.description}</p>
											</div>
										</div>
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					<div className="space-y-2">
						<Label>Push уведомления</Label>
						<Select
							value={localSettings.pushFrequency || 'INSTANT'}
							onValueChange={(value) => handleFrequencyChange('pushFrequency', value)}
						>
							<SelectTrigger className="h-12 rounded-xl">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{frequencyOptions.map((option) => (
									<SelectItem key={option.value} value={option.value}>
										<div className="flex items-center gap-2">
											<option.icon className="w-4 h-4" />
											<div>
												<p className="font-medium">{option.label}</p>
												<p className="text-xs text-muted-foreground">{option.description}</p>
											</div>
										</div>
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
				</CardContent>
			</Card>

			{/* Quiet hours */}
			<Card>
				<CardHeader>
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-3">
							<div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
								<BellOff className="w-5 h-5 text-primary" />
							</div>
							<div>
								<CardTitle>Тихие часы</CardTitle>
								<CardDescription>Не беспокоить в указанное время</CardDescription>
							</div>
						</div>
						<Switch
							checked={localSettings.quietHoursEnabled || false}
							onCheckedChange={(checked) => handleToggle('quietHoursEnabled', checked)}
						/>
					</div>
				</CardHeader>
				{localSettings.quietHoursEnabled && (
					<CardContent className="space-y-4">
						<div className="grid grid-cols-2 gap-4">
							<div className="space-y-2">
								<Label>Начало</Label>
								<Select
									value={localSettings.quietHoursStart || '22:00'}
									onValueChange={(value) => handleTimeChange('quietHoursStart', value)}
								>
									<SelectTrigger className="h-12 rounded-xl">
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										{timeOptions.map((option) => (
											<SelectItem key={option.value} value={option.value}>
												{option.label}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>

							<div className="space-y-2">
								<Label>Конец</Label>
								<Select
									value={localSettings.quietHoursEnd || '08:00'}
									onValueChange={(value) => handleTimeChange('quietHoursEnd', value)}
								>
									<SelectTrigger className="h-12 rounded-xl">
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										{timeOptions.map((option) => (
											<SelectItem key={option.value} value={option.value}>
												{option.label}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
						</div>

						<p className="text-sm text-muted-foreground">
							В это время уведомления не будут отправляться. Они будут накапливаться и отправлены после окончания тихих часов.
						</p>
					</CardContent>
				)}
			</Card>

			{/* Save button */}
			{hasChanges && (
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					className="sticky bottom-4 z-10"
				>
					<Card className="border-primary/50 bg-primary/5">
						<CardContent className="p-4">
							<div className="flex items-center justify-between">
								<p className="text-sm font-medium">У вас есть несохранённые изменения</p>
								<Button onClick={handleSave} disabled={updating} className="rounded-xl">
									{updating ? (
										<>
											<Loader2 className="w-4 h-4 mr-2 animate-spin" />
											Сохранение...
										</>
									) : (
										<>
											<Save className="w-4 h-4 mr-2" />
											Сохранить настройки
										</>
									)}
								</Button>
							</div>
						</CardContent>
					</Card>
				</motion.div>
			)}
		</div>
	)
}
