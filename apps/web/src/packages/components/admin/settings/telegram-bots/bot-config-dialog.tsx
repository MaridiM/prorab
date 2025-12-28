'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/packages/components/ui/button'
import { Input } from '@/packages/components/ui/input'
import { Label } from '@/packages/components/ui/label'
import { Switch } from '@/packages/components/ui/switch'
import { Textarea } from '@/packages/components/ui/textarea'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/packages/components/ui/dialog'
import { Alert, AlertDescription } from '@/packages/components/ui/alert'
import { Loader2, CheckCircle, AlertCircle, Info } from 'lucide-react'

interface TelegramBot {
	id: string
	botName: string
	username: string
	displayName: string
	description?: string | null
	isActive: boolean
	isPrimary: boolean
	webhookUrl?: string | null
	avatarUrl?: string | null
}

interface BotFormData {
	botName: string
	token: string
	displayName: string
	description?: string
	isActive: boolean
	isPrimary: boolean
	webhookUrl?: string
}

interface BotConfigDialogProps {
	bot: TelegramBot | null
	open: boolean
	onOpenChange: (open: boolean) => void
	onSave: (data: BotFormData) => Promise<void>
	onTestToken?: (token: string) => Promise<any>
	saving?: boolean
}

export function BotConfigDialog({
	bot,
	open,
	onOpenChange,
	onSave,
	onTestToken,
	saving = false,
}: BotConfigDialogProps) {
	const [formData, setFormData] = useState<BotFormData>({
		botName: '',
		token: '',
		displayName: '',
		description: '',
		isActive: true,
		isPrimary: false,
		webhookUrl: '',
	})

	const [testing, setTesting] = useState(false)
	const [testResult, setTestResult] = useState<{
		valid: boolean
		username?: string
		firstName?: string
		error?: string
	} | null>(null)

	// Reset form when bot changes or dialog opens/closes
	useEffect(() => {
		if (bot) {
			// Edit mode - populate with existing bot data
			setFormData({
				botName: bot.botName,
				token: '', // Never pre-fill token for security
				displayName: bot.displayName,
				description: bot.description || '',
				isActive: bot.isActive,
				isPrimary: bot.isPrimary,
				webhookUrl: bot.webhookUrl || '',
			})
			setTestResult(null)
		} else {
			// Create mode - reset to defaults
			setFormData({
				botName: '',
				token: '',
				displayName: '',
				description: '',
				isActive: true,
				isPrimary: false,
				webhookUrl: '',
			})
			setTestResult(null)
		}
	}, [bot, open])

	const handleTestToken = async () => {
		if (!formData.token || !onTestToken) return

		setTesting(true)
		setTestResult(null)

		try {
			const result = await onTestToken(formData.token)

			if (result) {
				setTestResult({
					valid: true,
					username: result.username,
					firstName: result.firstName,
				})

				// Auto-populate display name if empty
				if (!formData.displayName && result.firstName) {
					setFormData((prev) => ({
						...prev,
						displayName: result.firstName,
					}))
				}

				// Auto-populate bot name if empty (create mode)
				if (!bot && !formData.botName && result.username) {
					setFormData((prev) => ({
						...prev,
						botName: result.username.replace(/bot$/i, '').toLowerCase(),
					}))
				}
			} else {
				setTestResult({
					valid: false,
					error: 'Invalid token',
				})
			}
		} catch (error: any) {
			setTestResult({
				valid: false,
				error: error.message || 'Failed to test token',
			})
		} finally {
			setTesting(false)
		}
	}

	const handleSave = async () => {
		await onSave(formData)
	}

	const isCreateMode = !bot
	const canSave = isCreateMode
		? formData.botName && formData.token && formData.displayName
		: formData.displayName // In edit mode, only displayName is required

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>{isCreateMode ? 'Add Telegram Bot' : `Configure ${bot?.displayName}`}</DialogTitle>
					<DialogDescription>
						{isCreateMode
							? 'Create a new Telegram bot configuration. You can get a bot token from @BotFather.'
							: 'Update bot configuration. Leave token empty to keep existing token.'}
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-4 py-4">
					{/* Bot Name (only in create mode) */}
					{isCreateMode && (
						<div className="space-y-2">
							<Label htmlFor="botName">
								Bot Name <span className="text-destructive">*</span>
							</Label>
							<Input
								id="botName"
								placeholder="e.g., oauth, support, notifications"
								value={formData.botName}
								onChange={(e) =>
									setFormData({ ...formData, botName: e.target.value.toLowerCase() })
								}
								disabled={!isCreateMode}
							/>
							<p className="text-xs text-muted-foreground">
								Unique identifier for internal use (lowercase, no spaces)
							</p>
						</div>
					)}

					{/* Bot Token */}
					<div className="space-y-2">
						<Label htmlFor="token">
							Bot Token {isCreateMode && <span className="text-destructive">*</span>}
						</Label>
						<div className="flex gap-2">
							<Input
								id="token"
								type="password"
								placeholder={isCreateMode ? 'Enter bot token from @BotFather' : 'Leave empty to keep existing'}
								value={formData.token}
								onChange={(e) => {
									setFormData({ ...formData, token: e.target.value })
									setTestResult(null) // Clear test result when token changes
								}}
							/>
							{onTestToken && (
								<Button
									type="button"
									variant="outline"
									onClick={handleTestToken}
									disabled={!formData.token || testing}
								>
									{testing ? (
										<Loader2 className="h-4 w-4 animate-spin" />
									) : (
										'Test'
									)}
								</Button>
							)}
						</div>
						<p className="text-xs text-muted-foreground">
							Token will be encrypted before storage. Get from @BotFather on Telegram.
						</p>

						{/* Test Result */}
						{testResult && (
							<Alert variant={testResult.valid ? 'default' : 'destructive'}>
								<div className="flex items-center gap-2">
									{testResult.valid ? (
										<CheckCircle className="h-4 w-4" />
									) : (
										<AlertCircle className="h-4 w-4" />
									)}
									<AlertDescription>
										{testResult.valid ? (
											<span>
												Token valid! Bot: @{testResult.username} ({testResult.firstName})
											</span>
										) : (
											<span>{testResult.error || 'Invalid token'}</span>
										)}
									</AlertDescription>
								</div>
							</Alert>
						)}
					</div>

					{/* Display Name */}
					<div className="space-y-2">
						<Label htmlFor="displayName">
							Display Name <span className="text-destructive">*</span>
						</Label>
						<Input
							id="displayName"
							placeholder="e.g., OAuth Bot, Support Bot"
							value={formData.displayName}
							onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
						/>
						<p className="text-xs text-muted-foreground">
							Human-readable name shown in admin panel
						</p>
					</div>

					{/* Description */}
					<div className="space-y-2">
						<Label htmlFor="description">Description</Label>
						<Textarea
							id="description"
							placeholder="e.g., Handles user authentication and OAuth flow"
							value={formData.description}
							onChange={(e) => setFormData({ ...formData, description: e.target.value })}
							rows={3}
						/>
						<p className="text-xs text-muted-foreground">
							Optional description of bot's purpose
						</p>
					</div>

					{/* Webhook URL (readonly, informational) */}
					<div className="space-y-2">
						<Label htmlFor="webhookUrl">Webhook URL</Label>
						<Input
							id="webhookUrl"
							value={
								formData.webhookUrl ||
								(formData.botName
									? `https://api.prorab.space/webhooks/telegram/${formData.botName}`
									: 'Will be auto-generated')
							}
							disabled
							className="bg-muted"
						/>
						<p className="text-xs text-muted-foreground flex items-center gap-1">
							<Info className="h-3 w-3" />
							Auto-generated based on bot name. Configure via Telegram API after creation.
						</p>
					</div>

					{/* Settings */}
					<div className="border-t pt-4 space-y-4">
						<div className="flex items-center justify-between">
							<div>
								<Label>Active</Label>
								<p className="text-xs text-muted-foreground">
									Enable bot for handling requests
								</p>
							</div>
							<Switch
								checked={formData.isActive}
								onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
							/>
						</div>

						<div className="flex items-center justify-between">
							<div>
								<Label>Primary OAuth Bot</Label>
								<p className="text-xs text-muted-foreground">
									Use as default for user authentication
								</p>
							</div>
							<Switch
								checked={formData.isPrimary}
								onCheckedChange={(checked) => setFormData({ ...formData, isPrimary: checked })}
							/>
						</div>
					</div>
				</div>

				<DialogFooter>
					<Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
						Cancel
					</Button>
					<Button onClick={handleSave} disabled={!canSave || saving}>
						{saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
						{isCreateMode ? 'Create Bot' : 'Save Changes'}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}
