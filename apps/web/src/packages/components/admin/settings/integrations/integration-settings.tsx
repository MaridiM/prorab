'use client'

import { useState, useMemo, useEffect } from 'react'
import { useQuery, useMutation } from '@apollo/client/react'
import {
	SystemSettingsDocument,
	BulkUpdateSystemSettingsDocument,
	TestServiceConnectionDocument,
	SettingCategory,
} from '@/packages/api/graphql'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/packages/components/ui/tabs'
import { Skeleton } from '@/packages/components/ui/skeleton'
import { AlertCircle } from 'lucide-react'
import { Button } from '@/packages/components/ui/button'
import {
	CreditCard,
	Mail,
	MessageSquare,
	Database,
	Brain,
	Shield,
	Settings as SettingsIcon,
	Smartphone,
	Users,
	BarChart,
	LucideIcon,
} from 'lucide-react'
import { useToast } from '@/packages/hooks'
import { SettingsCategoryPanel } from './settings-category-panel'

interface CategoryConfig {
	id: string
	category: SettingCategory
	label: string
	icon: LucideIcon
}

const categories: CategoryConfig[] = [
	{ id: 'payment', category: SettingCategory.Payment, label: 'Payment', icon: CreditCard },
	{ id: 'email', category: SettingCategory.Email, label: 'Email', icon: Mail },
	{ id: 'telegram', category: SettingCategory.Telegram, label: 'Telegram', icon: MessageSquare },
	{ id: 'storage', category: SettingCategory.Storage, label: 'Storage', icon: Database },
	{ id: 'sms', category: SettingCategory.Sms, label: 'SMS', icon: Smartphone },
	{ id: 'social', category: SettingCategory.Social, label: 'Social', icon: Users },
	{ id: 'analytics', category: SettingCategory.Analytics, label: 'Analytics', icon: BarChart },
	{ id: 'ai', category: SettingCategory.Ai, label: 'AI', icon: Brain },
	{ id: 'security', category: SettingCategory.Security, label: 'Security', icon: Shield },
	{ id: 'general', category: SettingCategory.General, label: 'General', icon: SettingsIcon },
]

interface IntegrationSettingsProps {
	/** Currently selected sub-tab (category id) */
	selectedSubTab?: string
	/** Callback when sub-tab changes */
	onSubTabChange?: (subtab: string) => void
}

export function IntegrationSettings({
	selectedSubTab = 'payment',
	onSubTabChange,
}: IntegrationSettingsProps) {
	const [activeSubTab, setActiveSubTab] = useState(selectedSubTab)
	const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null)

	const { success: showSuccess, error: showError } = useToast()

	// Sync with prop changes
	useEffect(() => {
		if (selectedSubTab && selectedSubTab !== activeSubTab) {
			setActiveSubTab(selectedSubTab)
		}
	}, [selectedSubTab])

	// Fetch all settings
	const { data, loading, error, refetch } = useQuery(SystemSettingsDocument, {
		variables: { category: null },
		fetchPolicy: 'network-only',
	})

	// Bulk update mutation
	const [bulkUpdateSettings, { loading: saving }] = useMutation(BulkUpdateSystemSettingsDocument)

	// Test connection mutation
	const [testConnection] = useMutation(TestServiceConnectionDocument)

	// Group settings by category
	const settingsByCategory = useMemo(() => {
		if (!data?.systemSettings) return {}

		const grouped: Record<string, typeof data.systemSettings> = {}
		data.systemSettings.forEach((setting) => {
			if (!grouped[setting.category]) {
				grouped[setting.category] = []
			}
			grouped[setting.category].push(setting)
		})
		return grouped
	}, [data])

	const handleSubTabChange = (subtab: string) => {
		setActiveSubTab(subtab)
		setTestResult(null) // Clear test result when changing tabs
		onSubTabChange?.(subtab)
	}

	const handleSave = async (values: Record<string, string>) => {
		if (Object.keys(values).length === 0) {
			showError('Нет изменений для сохранения')
			return
		}

		try {
			const settings = Object.entries(values).map(([key, value]) => ({
				key,
				value,
			}))

			await bulkUpdateSettings({
				variables: {
					input: { settings },
				},
			})

			showSuccess('Настройки успешно сохранены')
			refetch()
		} catch (err: any) {
			showError(err.message || 'Ошибка при сохранении настроек')
			throw err // Re-throw to let panel handle it
		}
	}

	const handleTestConnection = async () => {
		setTestResult(null)

		// Find the category enum for the current sub-tab
		const categoryConfig = categories.find((c) => c.id === activeSubTab)
		if (!categoryConfig) return

		try {
			const { data } = await testConnection({
				variables: { category: categoryConfig.category },
			})

			if (data?.testServiceConnection) {
				setTestResult({
					success: data.testServiceConnection.success,
					message: data.testServiceConnection.message,
				})
				if (data.testServiceConnection.success) {
					showSuccess('Подключение успешно!')
				} else {
					showError(data.testServiceConnection.message)
				}
			}
		} catch (err: any) {
			setTestResult({
				success: false,
				message: err.message || 'Ошибка подключения',
			})
			showError('Ошибка при тестировании подключения')
		}
	}

	// Loading state
	if (loading) {
		return (
			<div className="space-y-4">
				<Skeleton className="h-12 w-full" />
				<Skeleton className="h-96 w-full" />
			</div>
		)
	}

	// Error state
	if (error) {
		return (
			<div className="flex items-center justify-center h-96">
				<div className="text-center max-w-md">
					<div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4">
						<AlertCircle className="w-8 h-8 text-red-500" />
					</div>
					<h2 className="text-2xl font-bold mb-2">Ошибка загрузки</h2>
					<p className="text-muted-foreground mb-6">{error.message}</p>
					<Button onClick={() => refetch()}>Попробовать снова</Button>
				</div>
			</div>
		)
	}

	return (
		<Tabs value={activeSubTab} onValueChange={handleSubTabChange}>
			<TabsList className="grid grid-cols-10 w-full mb-6">
				{categories.map((cat) => (
					<TabsTrigger key={cat.id} value={cat.id}>
						<cat.icon className="h-4 w-4 mr-2" />
						{cat.label}
					</TabsTrigger>
				))}
			</TabsList>

			{categories.map((cat) => {
				const settings = settingsByCategory[cat.category] || []

				return (
					<TabsContent key={cat.id} value={cat.id} className="mt-6">
						<SettingsCategoryPanel
							categoryName={cat.label}
							Icon={cat.icon}
							settings={settings}
							onSave={handleSave}
							onTestConnection={handleTestConnection}
							saving={saving}
							testResult={testResult}
						/>
					</TabsContent>
				)
			})}
		</Tabs>
	)
}
