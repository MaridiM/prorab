'use client'

import { useState, useMemo } from 'react'
import { useQuery, useMutation } from '@apollo/client/react'
import { AdminPageSkeleton } from '@/packages/components/ui/admin-page-skeleton'
import {
	SystemSettingsDocument,
	BulkUpdateSystemSettingsDocument,
	TestServiceConnectionDocument,
	SettingCategory,
} from '@/packages/api/graphql'
import { Card } from '@/packages/components/ui/card'
import { Button } from '@/packages/components/ui/button'
import { Input } from '@/packages/components/ui/input'
import { Label } from '@/packages/components/ui/label'
import { Badge } from '@/packages/components/ui/badge'
import { Skeleton } from '@/packages/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/packages/components/ui/tabs'
import {
	CreditCard,
	Mail,
	MessageSquare,
	Database,
	Brain,
	Shield,
	Settings as SettingsIcon,
	Eye,
	EyeOff,
	CheckCircle2,
	XCircle,
	Loader2,
	Save,
	AlertCircle,
} from 'lucide-react'
import { useToast } from '@/packages/hooks'

const categoryIcons: Record<SettingCategory, any> = {
	[SettingCategory.Payment]: CreditCard,
	[SettingCategory.Email]: Mail,
	[SettingCategory.Telegram]: MessageSquare,
	[SettingCategory.Storage]: Database,
	[SettingCategory.Ai]: Brain,
	[SettingCategory.Security]: Shield,
	[SettingCategory.General]: SettingsIcon,
}

export default function SystemSettingsPage() {
	const [selectedCategory, setSelectedCategory] = useState<SettingCategory>(SettingCategory.Payment)
	const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({})
	const [testingConnection, setTestingConnection] = useState(false)
	const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null)
	const [editedValues, setEditedValues] = useState<Record<string, string>>({})

	const { success: showSuccess, error: showError } = useToast()

	// Fetch settings
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

	const currentSettings = settingsByCategory[selectedCategory] || []

	if (loading && !data) {
		return <AdminPageSkeleton />
	}

	const toggleSecret = (key: string) => {
		setShowSecrets((prev) => ({ ...prev, [key]: !prev[key] }))
	}

	const handleValueChange = (key: string, value: string) => {
		setEditedValues((prev) => ({ ...prev, [key]: value }))
	}

	const handleTestConnection = async () => {
		setTestingConnection(true)
		setTestResult(null)

		try {
			const { data } = await testConnection({
				variables: { category: selectedCategory },
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
		} finally {
			setTestingConnection(false)
		}
	}

	const handleSave = async () => {
		if (Object.keys(editedValues).length === 0) {
			showError('Нет изменений для сохранения')
			return
		}

		try {
			const settings = Object.entries(editedValues).map(([key, value]) => ({
				key,
				value,
			}))

			await bulkUpdateSettings({
				variables: {
					input: { settings },
				},
			})

			showSuccess('Настройки успешно сохранены')
			setEditedValues({})
			refetch()
		} catch (err: any) {
			showError(err.message || 'Ошибка при сохранении настроек')
		}
	}

	const CategoryIcon = categoryIcons[selectedCategory]

	// Loading state
	if (loading) {
		return (
			<div className="space-y-6">
				<div>
					<h1 className="text-3xl font-bold">System Settings</h1>
					<p className="text-muted-foreground mt-1">Manage system-wide configuration and integrations</p>
				</div>

				<div className="space-y-4">
					<Skeleton className="h-12 w-full" />
					<Skeleton className="h-96 w-full" />
				</div>
			</div>
		)
	}

	// Error state
	if (error) {
		return (
			<div className="flex items-center justify-center h-full">
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
		<div className="space-y-6">
			<div>
				<h1 className="text-3xl font-bold">System Settings</h1>
				<p className="text-muted-foreground mt-1">Manage system-wide configuration and integrations</p>
			</div>

			<Tabs value={selectedCategory} onValueChange={(v) => setSelectedCategory(v as SettingCategory)}>
				<TabsList className="grid grid-cols-7 w-full">
					<TabsTrigger value={SettingCategory.Payment}>Payment</TabsTrigger>
					<TabsTrigger value={SettingCategory.Email}>Email</TabsTrigger>
					<TabsTrigger value={SettingCategory.Telegram}>Telegram</TabsTrigger>
					<TabsTrigger value={SettingCategory.Storage}>Storage</TabsTrigger>
					<TabsTrigger value={SettingCategory.Ai}>AI</TabsTrigger>
					<TabsTrigger value={SettingCategory.Security}>Security</TabsTrigger>
					<TabsTrigger value={SettingCategory.General}>General</TabsTrigger>
				</TabsList>

				{Object.keys(categoryIcons).map((category) => (
					<TabsContent key={category} value={category} className="space-y-4 mt-6">
						<Card className="p-6">
							<div className="flex items-center gap-3 mb-6">
								<div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
									<CategoryIcon className="h-5 w-5 text-primary" />
								</div>
								<div>
									<h2 className="text-lg font-semibold">{category.charAt(0) + category.slice(1).toLowerCase()} Settings</h2>
									<p className="text-sm text-muted-foreground">
										Configure {category.toLowerCase()} integration and settings
									</p>
								</div>
							</div>

							{currentSettings.length === 0 ? (
								<div className="text-center py-8 text-muted-foreground">
									<p>No settings available for this category</p>
								</div>
							) : (
								<div className="space-y-4">
									{currentSettings.map((setting) => {
										const currentValue =
											editedValues[setting.key] !== undefined
												? editedValues[setting.key]
												: setting.value || setting.defaultValue || ''

										return (
											<div key={setting.key} className="space-y-2">
												<div className="flex items-center justify-between">
													<Label htmlFor={setting.key} className="flex items-center gap-2">
														{setting.name}
														{setting.isRequired && <Badge variant="danger">Required</Badge>}
														{setting.isEncrypted && (
															<Badge variant="secondary" className="gap-1">
																<Shield className="h-3 w-3" />
																Encrypted
															</Badge>
														)}
													</Label>
													{setting.isEncrypted && (
														<Button
															type="button"
															variant="ghost"
															size="sm"
															onClick={() => toggleSecret(setting.key)}
														>
															{showSecrets[setting.key] ? (
																<>
																	<EyeOff className="h-4 w-4 mr-1" />
																	Hide
																</>
															) : (
																<>
																	<Eye className="h-4 w-4 mr-1" />
																	Show
																</>
															)}
														</Button>
													)}
												</div>
												{setting.description && (
													<p className="text-sm text-muted-foreground">{setting.description}</p>
												)}
												<Input
													id={setting.key}
													type={setting.isEncrypted && !showSecrets[setting.key] ? 'password' : 'text'}
													value={currentValue}
													onChange={(e) => handleValueChange(setting.key, e.target.value)}
													placeholder={setting.defaultValue || `Enter ${setting.name.toLowerCase()}`}
													className="font-mono text-sm"
												/>
											</div>
										)
									})}
								</div>
							)}

							<div className="flex items-center gap-3 mt-6 pt-6 border-t">
								<Button onClick={handleTestConnection} disabled={testingConnection} variant="outline">
									{testingConnection ? (
										<>
											<Loader2 className="h-4 w-4 mr-2 animate-spin" />
											Testing...
										</>
									) : (
										'Test Connection'
									)}
								</Button>

								<Button onClick={handleSave} disabled={saving || Object.keys(editedValues).length === 0}>
									{saving ? (
										<>
											<Loader2 className="h-4 w-4 mr-2 animate-spin" />
											Saving...
										</>
									) : (
										<>
											<Save className="h-4 w-4 mr-2" />
											Save Changes
										</>
									)}
								</Button>

								{testResult && (
									<div
										className={`flex items-center gap-2 text-sm ${
											testResult.success ? 'text-green-600' : 'text-red-600'
										}`}
									>
										{testResult.success ? (
											<CheckCircle2 className="h-4 w-4" />
										) : (
											<XCircle className="h-4 w-4" />
										)}
										{testResult.message}
									</div>
								)}

								{Object.keys(editedValues).length > 0 && !saving && (
									<Badge variant="secondary" className="ml-auto">
										{Object.keys(editedValues).length} unsaved change(s)
									</Badge>
								)}
							</div>
						</Card>
					</TabsContent>
				))}
			</Tabs>
		</div>
	)
}
