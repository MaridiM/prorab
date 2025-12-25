import { SystemSettingsTabs } from '@/packages/components/admin/settings'

export default function AdminSystemSettingsPage() {
	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-3xl font-bold">System Settings</h1>
				<p className="text-muted-foreground mt-1">
					Manage system-wide configuration and integrations
				</p>
			</div>

			<SystemSettingsTabs />
		</div>
	)
}
