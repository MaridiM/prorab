'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/packages/components/ui/tabs'
import { IntegrationSettings } from './integrations/integration-settings'
import { PaymentProvidersPanel } from './payment-providers/payment-providers-panel'
import { SubscriptionPlansPanel } from './subscription-plans'
import { AdminRolesPanel } from './admin-roles'
import { AuditLogsPanel } from './audit-logs'
import { TelegramBotsPanel } from './telegram-bots'

type MainTab = 'integrations' | 'providers' | 'plans' | 'telegram-bots' | 'roles' | 'logs'

export function SystemSettingsTabs() {
	const router = useRouter()
	const searchParams = useSearchParams()

	// Get tab and subtab from URL
	const tabFromUrl = (searchParams.get('tab') as MainTab) || 'integrations'
	const subtabFromUrl = searchParams.get('subtab') || 'payment'

	const [activeTab, setActiveTab] = useState<MainTab>(tabFromUrl)
	const [activeSubTab, setActiveSubTab] = useState(subtabFromUrl)

	// Sync with URL changes
	useEffect(() => {
		const urlTab = (searchParams.get('tab') as MainTab) || 'integrations'
		const urlSubtab = searchParams.get('subtab') || 'payment'

		if (urlTab !== activeTab) {
			setActiveTab(urlTab)
		}
		if (urlSubtab !== activeSubTab) {
			setActiveSubTab(urlSubtab)
		}
	}, [searchParams])

	// Handle main tab change
	const handleTabChange = useCallback(
		(newTab: string) => {
			const tab = newTab as MainTab
			setActiveTab(tab)

			const params = new URLSearchParams(searchParams.toString())
			params.set('tab', tab)

			// Set default subtab for integrations
			if (tab === 'integrations' && !params.get('subtab')) {
				params.set('subtab', 'payment')
			} else if (tab !== 'integrations') {
				// Remove subtab param when switching away from integrations
				params.delete('subtab')
			}

			router.push(`/admin/settings?${params.toString()}`, { scroll: false })
		},
		[router, searchParams]
	)

	// Handle subtab change (from IntegrationSettings)
	const handleSubTabChange = useCallback(
		(newSubTab: string) => {
			setActiveSubTab(newSubTab)

			const params = new URLSearchParams(searchParams.toString())
			params.set('tab', 'integrations')
			params.set('subtab', newSubTab)

			router.push(`/admin/settings?${params.toString()}`, { scroll: false })
		},
		[router, searchParams]
	)

	return (
		<Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
			<TabsList className="grid w-full max-w-4xl grid-cols-6">
				<TabsTrigger value="integrations">System Integrations</TabsTrigger>
				<TabsTrigger value="providers">Payment Providers</TabsTrigger>
				<TabsTrigger value="plans">Subscription Plans</TabsTrigger>
				<TabsTrigger value="telegram-bots">Telegram Bots</TabsTrigger>
				<TabsTrigger value="roles">Admin Roles</TabsTrigger>
				<TabsTrigger value="logs">Audit Logs</TabsTrigger>
			</TabsList>

			<TabsContent value="integrations" className="mt-6">
				<IntegrationSettings selectedSubTab={activeSubTab} onSubTabChange={handleSubTabChange} />
			</TabsContent>

			<TabsContent value="providers" className="mt-6">
				<PaymentProvidersPanel />
			</TabsContent>

			<TabsContent value="plans" className="mt-6">
				<SubscriptionPlansPanel />
			</TabsContent>

			<TabsContent value="telegram-bots" className="mt-6">
				<TelegramBotsPanel />
			</TabsContent>

			<TabsContent value="roles" className="mt-6">
				<AdminRolesPanel />
			</TabsContent>

			<TabsContent value="logs" className="mt-6">
				<AuditLogsPanel />
			</TabsContent>
		</Tabs>
	)
}
