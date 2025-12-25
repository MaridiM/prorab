'use client'

import { useState } from 'react'
import { Card } from '@/packages/components/ui/card'
import { Button } from '@/packages/components/ui/button'
import { Input } from '@/packages/components/ui/input'
import { Label } from '@/packages/components/ui/label'
import { Badge } from '@/packages/components/ui/badge'
import {
	Eye,
	EyeOff,
	CheckCircle2,
	XCircle,
	Loader2,
	Save,
	Shield,
	LucideIcon,
} from 'lucide-react'

interface SystemSetting {
	key: string
	name: string
	description?: string | null
	value?: string | null
	defaultValue?: string | null
	isRequired: boolean
	isEncrypted: boolean
	category: string
}

interface SettingsCategoryPanelProps {
	/** Category name for display */
	categoryName: string
	/** Icon component to display */
	Icon: LucideIcon
	/** Array of settings to display */
	settings: SystemSetting[]
	/** Callback when save is clicked */
	onSave: (values: Record<string, string>) => Promise<void>
	/** Callback when test connection is clicked */
	onTestConnection: () => Promise<void>
	/** Whether the save operation is in progress */
	saving?: boolean
	/** Test result from connection test */
	testResult?: { success: boolean; message: string } | null
}

export function SettingsCategoryPanel({
	categoryName,
	Icon,
	settings,
	onSave,
	onTestConnection,
	saving = false,
	testResult = null,
}: SettingsCategoryPanelProps) {
	const [editedValues, setEditedValues] = useState<Record<string, string>>({})
	const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({})
	const [testingConnection, setTestingConnection] = useState(false)

	const toggleSecret = (key: string) => {
		setShowSecrets((prev) => ({ ...prev, [key]: !prev[key] }))
	}

	const handleValueChange = (key: string, value: string) => {
		setEditedValues((prev) => ({ ...prev, [key]: value }))
	}

	const handleSave = async () => {
		if (Object.keys(editedValues).length === 0) return

		try {
			await onSave(editedValues)
			setEditedValues({}) // Clear after successful save
		} catch (error) {
			// Error handling is done in parent component
		}
	}

	const handleTestConnection = async () => {
		setTestingConnection(true)
		try {
			await onTestConnection()
		} finally {
			setTestingConnection(false)
		}
	}

	return (
		<Card className="p-6">
			<div className="flex items-center gap-3 mb-6">
				<div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
					<Icon className="h-5 w-5 text-primary" />
				</div>
				<div>
					<h2 className="text-lg font-semibold">{categoryName} Settings</h2>
					<p className="text-sm text-muted-foreground">
						Configure {categoryName.toLowerCase()} integration and settings
					</p>
				</div>
			</div>

			{settings.length === 0 ? (
				<div className="text-center py-8 text-muted-foreground">
					<p>No settings available for this category</p>
				</div>
			) : (
				<div className="space-y-4">
					{settings.map((setting) => {
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
	)
}
