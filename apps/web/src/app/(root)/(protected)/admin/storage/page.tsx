'use client'

import { useState, useEffect } from 'react'
import { useQuery, useMutation } from '@apollo/client/react'
import { AdminPageSkeleton } from '@/packages/components/ui/admin-page-skeleton'
import {
	GetStorageSettingsDocument,
	GetStorageStatsDocument,
	UpdateStorageSettingsDocument,
	TestStorageProvidersDocument,
	TestStorageProviderDocument,
	StorageProviderType,
} from '@/packages/api/graphql'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/packages/components/ui/card'
import { Button } from '@/packages/components/ui/button'
import { Input } from '@/packages/components/ui/input'
import { Label } from '@/packages/components/ui/label'
import { Switch } from '@/packages/components/ui/switch'
import { Badge } from '@/packages/components/ui/badge'
import { Skeleton } from '@/packages/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/packages/components/ui/tabs'
import {
	HardDrive,
	Cloud,
	Database,
	Eye,
	EyeOff,
	CheckCircle2,
	XCircle,
	Loader2,
	Save,
	AlertCircle,
	FileText,
	Image,
	Users,
	TrendingUp,
} from 'lucide-react'
import { toast } from 'sonner'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/packages/components/ui/select'

const providerIcons = {
	local: HardDrive,
	cloudinary: Cloud,
	r2: Database,
} as const

export default function StorageSettingsPage() {
	const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({})
	const [testResults, setTestResults] = useState<Record<string, { success: boolean; message: string; latency?: number }>>({})

	// Queries
	const { data: settingsData, loading: settingsLoading, refetch: refetchSettings } = useQuery(GetStorageSettingsDocument)
	const { data: statsData, loading: statsLoading } = useQuery(GetStorageStatsDocument)

	// Mutations
	const [updateSettings, { loading: updating }] = useMutation(UpdateStorageSettingsDocument, {
		onCompleted: () => {
			toast.success('Storage provider settings успешно сохранены')
			refetchSettings()
		},
		onError: (error) => {
			toast.error('Ошибка: ' + error.message)
		},
	})

	const [testAllProviders, { loading: testingAll }] = useMutation(TestStorageProvidersDocument, {
		onCompleted: (data) => {
			const results: Record<string, { success: boolean; message: string; latency?: number }> = {}
			data.testStorageProviders.forEach((result) => {
				results[result.provider] = {
					success: result.success,
					message: result.message,
					latency: result.latency || undefined,
				}
			})
			setTestResults(results)
		},
	})

	const [testProvider, { loading: testingSingle }] = useMutation(TestStorageProviderDocument)

	// Form state
	const [formData, setFormData] = useState({
		adminMode: '',
		defaultProvider: '',
		autoMigrate: false,
		cloudinaryCloudName: '',
		cloudinaryApiKey: '',
		cloudinaryApiSecret: '',
		r2AccountId: '',
		r2AccessKeyId: '',
		r2SecretAccessKey: '',
		r2BucketName: '',
		r2PublicUrl: '',
	})

	// Initialize form data - MUST be before any conditional returns
	useEffect(() => {
		if (settingsData?.storageSettings) {
			const s = settingsData.storageSettings
			setFormData({
				adminMode: s.adminMode,
				defaultProvider: s.defaultProvider,
				autoMigrate: s.autoMigrate,
				cloudinaryCloudName: s.cloudinaryCloudName || '',
				cloudinaryApiKey: s.cloudinaryApiKey || '',
				cloudinaryApiSecret: '',
				r2AccountId: s.r2AccountId || '',
				r2AccessKeyId: '',
				r2SecretAccessKey: '',
				r2BucketName: s.r2BucketName || '',
				r2PublicUrl: s.r2PublicUrl || '',
			})
		}
	}, [settingsData])

	// Early returns AFTER all hooks
	if (settingsLoading && !settingsData) {
		return <AdminPageSkeleton />
	}

	const handleSave = async () => {
		await updateSettings({
			variables: {
				input: formData,
			},
		})
	}

	const handleTestProvider = async (provider: StorageProviderType) => {
		const result = await testProvider({
			variables: { provider },
		})

		if (result.data?.testStorageProvider) {
			const r = result.data.testStorageProvider
			setTestResults((prev) => ({
				...prev,
				[provider]: {
					success: r.success,
					message: r.message,
					latency: r.latency || undefined,
				},
			}))

			if (r.success) {
				toast.success(r.message)
			} else {
				toast.error(r.message)
			}
		}
	}

	const formatBytes = (bytes: number) => {
		if (bytes === 0) return '0 Bytes'
		const k = 1024
		const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
		const i = Math.floor(Math.log(bytes) / Math.log(k))
		return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
	}

	const toggleSecret = (key: string) => {
		setShowSecrets((prev) => ({ ...prev, [key]: !prev[key] }))
	}

	const settings = settingsData?.storageSettings
	const stats = statsData?.storageStats

	// Early return for loading state (after all hooks)
	if (settingsLoading) {
		return (
			<div className="w-full py-6 space-y-6">
				<Skeleton className="h-12 w-64" />
				<Skeleton className="h-96" />
			</div>
		)
	}

	return (
		<div className="w-full py-6 space-y-6">
			<div>
				<h1 className="text-3xl font-bold">Storage Management</h1>
				<p className="text-muted-foreground mt-1">Manage storage provider settings and monitor usage</p>
			</div>

			{/* Statistics Cards */}
			{stats && (
				<div className="grid gap-4 md:grid-cols-3">
					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">Total Files</CardTitle>
							<FileText className="h-4 w-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">{stats.totalFiles.toLocaleString()}</div>
							<p className="text-xs text-muted-foreground">Across all types</p>
						</CardContent>
					</Card>

					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">Total Size</CardTitle>
							<Database className="h-4 w-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">{formatBytes(stats.totalSize)}</div>
							<p className="text-xs text-muted-foreground">Estimated storage usage</p>
						</CardContent>
					</Card>

					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">Active Provider</CardTitle>
							<HardDrive className="h-4 w-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold capitalize">{settings?.adminMode}</div>
							<p className="text-xs text-muted-foreground">Current storage mode</p>
						</CardContent>
					</Card>
				</div>
			)}

			{/* Files by Type */}
			{stats?.filesByType && (
				<Card>
					<CardHeader>
						<CardTitle>Files by Type</CardTitle>
						<CardDescription>Distribution of files across different types</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="space-y-4">
							{stats.filesByType.map((type) => (
								<div key={type.fileType} className="flex items-center justify-between">
									<div className="flex items-center gap-3">
										<Image className="h-5 w-5 text-muted-foreground" />
										<div>
											<p className="font-medium capitalize">{type.fileType.replace(/-/g, ' ')}</p>
											<p className="text-sm text-muted-foreground">{type.count} files</p>
										</div>
									</div>
									<Badge variant="secondary">{formatBytes(type.totalSize)}</Badge>
								</div>
							))}
						</div>
					</CardContent>
				</Card>
			)}

			{/* Settings Tabs */}
			<Tabs defaultValue="general" className="space-y-4">
				<TabsList>
					<TabsTrigger value="general">General</TabsTrigger>
					<TabsTrigger value="cloudinary">Cloudinary</TabsTrigger>
					<TabsTrigger value="r2">Cloudflare R2</TabsTrigger>
					<TabsTrigger value="test">Test Connections</TabsTrigger>
				</TabsList>

				{/* General Settings */}
				<TabsContent value="general" className="space-y-4">
					<Card>
						<CardHeader>
							<CardTitle>General Settings</CardTitle>
							<CardDescription>Configure storage provider mode and defaults</CardDescription>
						</CardHeader>
						<CardContent className="space-y-6">
							<div className="space-y-2">
								<Label htmlFor="adminMode">Admin Mode</Label>
								<Select
									value={formData.adminMode}
									onValueChange={(value) => setFormData({ ...formData, adminMode: value })}
								>
									<SelectTrigger id="adminMode">
										<SelectValue placeholder="Select mode" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="local">Local Storage</SelectItem>
										<SelectItem value="cloudinary">Force Cloudinary</SelectItem>
										<SelectItem value="r2">Force R2</SelectItem>
										<SelectItem value="user_choice">User Choice</SelectItem>
									</SelectContent>
								</Select>
								<p className="text-sm text-muted-foreground">
									Controls which storage provider to use system-wide
								</p>
							</div>

							<div className="space-y-2">
								<Label htmlFor="defaultProvider">Default Provider</Label>
								<Select
									value={formData.defaultProvider}
									onValueChange={(value) => setFormData({ ...formData, defaultProvider: value })}
								>
									<SelectTrigger id="defaultProvider">
										<SelectValue placeholder="Select provider" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="local">Local</SelectItem>
										<SelectItem value="cloudinary">Cloudinary</SelectItem>
										<SelectItem value="r2">R2</SelectItem>
									</SelectContent>
								</Select>
								<p className="text-sm text-muted-foreground">
									Default provider when admin_mode is "user_choice"
								</p>
							</div>

							<div className="flex items-center space-x-2">
								<Switch
									id="autoMigrate"
									checked={formData.autoMigrate}
									onCheckedChange={(checked) => setFormData({ ...formData, autoMigrate: checked })}
								/>
								<Label htmlFor="autoMigrate" className="cursor-pointer">
									Auto-migrate files when switching providers
								</Label>
							</div>
						</CardContent>
					</Card>
				</TabsContent>

				{/* Cloudinary Settings */}
				<TabsContent value="cloudinary" className="space-y-4">
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Cloud className="h-5 w-5" />
								Cloudinary Configuration
							</CardTitle>
							<CardDescription>Configure Cloudinary cloud storage with CDN</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="space-y-2">
								<Label htmlFor="cloudinaryCloudName">Cloud Name</Label>
								<Input
									id="cloudinaryCloudName"
									value={formData.cloudinaryCloudName}
									onChange={(e) => setFormData({ ...formData, cloudinaryCloudName: e.target.value })}
									placeholder="prorab-space"
								/>
							</div>

							<div className="space-y-2">
								<Label htmlFor="cloudinaryApiKey">API Key</Label>
								<Input
									id="cloudinaryApiKey"
									value={formData.cloudinaryApiKey}
									onChange={(e) => setFormData({ ...formData, cloudinaryApiKey: e.target.value })}
									placeholder="Enter API key"
								/>
							</div>

							<div className="space-y-2">
								<Label htmlFor="cloudinaryApiSecret">API Secret</Label>
								<div className="flex gap-2">
									<Input
										id="cloudinaryApiSecret"
										type={showSecrets.cloudinaryApiSecret ? 'text' : 'password'}
										value={formData.cloudinaryApiSecret}
										onChange={(e) => setFormData({ ...formData, cloudinaryApiSecret: e.target.value })}
										placeholder={settings?.cloudinaryApiSecretSet ? '••••••••••••' : 'Enter API secret'}
									/>
									<Button
										type="button"
										variant="outline"
										size="icon"
										onClick={() => toggleSecret('cloudinaryApiSecret')}
									>
										{showSecrets.cloudinaryApiSecret ? (
											<EyeOff className="h-4 w-4" />
										) : (
											<Eye className="h-4 w-4" />
										)}
									</Button>
								</div>
								{settings?.cloudinaryApiSecretSet && (
									<p className="text-sm text-muted-foreground">Secret is already set. Leave empty to keep current.</p>
								)}
							</div>

							{testResults.cloudinary && (
								<div
									className={`flex items-center gap-2 p-3 rounded-md ${
										testResults.cloudinary.success ? 'bg-green-50 text-green-900' : 'bg-red-50 text-red-900'
									}`}
								>
									{testResults.cloudinary.success ? (
										<CheckCircle2 className="h-4 w-4" />
									) : (
										<XCircle className="h-4 w-4" />
									)}
									<span className="text-sm">{testResults.cloudinary.message}</span>
									{testResults.cloudinary.latency && (
										<Badge variant="secondary" className="ml-auto">
											{testResults.cloudinary.latency}ms
										</Badge>
									)}
								</div>
							)}

							<Button
								onClick={() => handleTestProvider(StorageProviderType.Cloudinary)}
								variant="outline"
								disabled={testingSingle}
								className="w-full"
							>
								{testingSingle ? (
									<>
										<Loader2 className="mr-2 h-4 w-4 animate-spin" />
										Testing...
									</>
								) : (
									'Test Connection'
								)}
							</Button>
						</CardContent>
					</Card>
				</TabsContent>

				{/* R2 Settings */}
				<TabsContent value="r2" className="space-y-4">
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Database className="h-5 w-5" />
								Cloudflare R2 Configuration
							</CardTitle>
							<CardDescription>Configure S3-compatible storage with zero egress fees</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="space-y-2">
								<Label htmlFor="r2AccountId">Account ID</Label>
								<Input
									id="r2AccountId"
									value={formData.r2AccountId}
									onChange={(e) => setFormData({ ...formData, r2AccountId: e.target.value })}
									placeholder="Your Cloudflare account ID"
								/>
							</div>

							<div className="space-y-2">
								<Label htmlFor="r2AccessKeyId">Access Key ID</Label>
								<div className="flex gap-2">
									<Input
										id="r2AccessKeyId"
										type={showSecrets.r2AccessKeyId ? 'text' : 'password'}
										value={formData.r2AccessKeyId}
										onChange={(e) => setFormData({ ...formData, r2AccessKeyId: e.target.value })}
										placeholder={settings?.r2AccessKeyIdSet ? '••••••••••••' : 'Enter access key ID'}
									/>
									<Button
										type="button"
										variant="outline"
										size="icon"
										onClick={() => toggleSecret('r2AccessKeyId')}
									>
										{showSecrets.r2AccessKeyId ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
									</Button>
								</div>
								{settings?.r2AccessKeyIdSet && (
									<p className="text-sm text-muted-foreground">Key is already set. Leave empty to keep current.</p>
								)}
							</div>

							<div className="space-y-2">
								<Label htmlFor="r2SecretAccessKey">Secret Access Key</Label>
								<div className="flex gap-2">
									<Input
										id="r2SecretAccessKey"
										type={showSecrets.r2SecretAccessKey ? 'text' : 'password'}
										value={formData.r2SecretAccessKey}
										onChange={(e) => setFormData({ ...formData, r2SecretAccessKey: e.target.value })}
										placeholder={settings?.r2SecretAccessKeySet ? '••••••••••••' : 'Enter secret access key'}
									/>
									<Button
										type="button"
										variant="outline"
										size="icon"
										onClick={() => toggleSecret('r2SecretAccessKey')}
									>
										{showSecrets.r2SecretAccessKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
									</Button>
								</div>
								{settings?.r2SecretAccessKeySet && (
									<p className="text-sm text-muted-foreground">Key is already set. Leave empty to keep current.</p>
								)}
							</div>

							<div className="space-y-2">
								<Label htmlFor="r2BucketName">Bucket Name</Label>
								<Input
									id="r2BucketName"
									value={formData.r2BucketName}
									onChange={(e) => setFormData({ ...formData, r2BucketName: e.target.value })}
									placeholder="prorab-uploads"
								/>
							</div>

							<div className="space-y-2">
								<Label htmlFor="r2PublicUrl">Public URL</Label>
								<Input
									id="r2PublicUrl"
									value={formData.r2PublicUrl}
									onChange={(e) => setFormData({ ...formData, r2PublicUrl: e.target.value })}
									placeholder="https://uploads.prorab.space"
								/>
								<p className="text-sm text-muted-foreground">Custom domain for R2 bucket</p>
							</div>

							{testResults.r2 && (
								<div
									className={`flex items-center gap-2 p-3 rounded-md ${
										testResults.r2.success ? 'bg-green-50 text-green-900' : 'bg-red-50 text-red-900'
									}`}
								>
									{testResults.r2.success ? (
										<CheckCircle2 className="h-4 w-4" />
									) : (
										<XCircle className="h-4 w-4" />
									)}
									<span className="text-sm">{testResults.r2.message}</span>
									{testResults.r2.latency && (
										<Badge variant="secondary" className="ml-auto">
											{testResults.r2.latency}ms
										</Badge>
									)}
								</div>
							)}

							<Button
								onClick={() => handleTestProvider(StorageProviderType.R2)}
								variant="outline"
								disabled={testingSingle}
								className="w-full"
							>
								{testingSingle ? (
									<>
										<Loader2 className="mr-2 h-4 w-4 animate-spin" />
										Testing...
									</>
								) : (
									'Test Connection'
								)}
							</Button>
						</CardContent>
					</Card>
				</TabsContent>

				{/* Test Connections */}
				<TabsContent value="test" className="space-y-4">
					<Card>
						<CardHeader>
							<CardTitle>Test All Providers</CardTitle>
							<CardDescription>Test connection to all configured storage providers</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							<Button onClick={() => testAllProviders()} disabled={testingAll} className="w-full">
								{testingAll ? (
									<>
										<Loader2 className="mr-2 h-4 w-4 animate-spin" />
										Testing All Providers...
									</>
								) : (
									'Test All Providers'
								)}
							</Button>

							{Object.keys(testResults).length > 0 && (
								<div className="space-y-3 mt-4">
									{(['local', 'cloudinary', 'r2'] as const).map((provider) => {
										const result = testResults[provider]
										if (!result) return null

										const Icon = providerIcons[provider]

										return (
											<div
												key={provider}
												className={`flex items-center gap-3 p-4 rounded-lg border ${
													result.success
														? 'bg-green-50 border-green-200'
														: 'bg-red-50 border-red-200'
												}`}
											>
												<Icon className="h-5 w-5" />
												<div className="flex-1">
													<p className="font-medium capitalize">{provider}</p>
													<p className="text-sm text-muted-foreground">{result.message}</p>
												</div>
												{result.success ? (
													<CheckCircle2 className="h-5 w-5 text-green-600" />
												) : (
													<XCircle className="h-5 w-5 text-red-600" />
												)}
												{result.latency && (
													<Badge variant="secondary">{result.latency}ms</Badge>
												)}
											</div>
										)
									})}
								</div>
							)}
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>

			{/* Save Button */}
			<div className="flex justify-end">
				<Button onClick={handleSave} disabled={updating} size="lg">
					{updating ? (
						<>
							<Loader2 className="mr-2 h-4 w-4 animate-spin" />
							Saving...
						</>
					) : (
						<>
							<Save className="mr-2 h-4 w-4" />
							Save Settings
						</>
					)}
				</Button>
			</div>
		</div>
	)
}
