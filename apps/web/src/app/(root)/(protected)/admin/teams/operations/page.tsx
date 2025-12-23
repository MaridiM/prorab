'use client'

import { useState } from 'react'
import { useQuery } from '@apollo/client/react'
import { Loader2, Copy, Merge, FileText, BarChart3 } from 'lucide-react'
import { Button } from '@/packages/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/packages/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/packages/components/ui/tabs'
import {
  AdminGetTeamTemplatesDocument,
  AdminGetMergeLogsDocument,
  AdminGetCloneLogsDocument,
  AdminGetTeamOperationsStatisticsDocument,
} from '@/packages/api/graphql/__generated__/output'
import { TemplateGallery } from '@/packages/components/admin/team-operations/TemplateGallery'
import { MergeTeamsWizard } from '@/packages/components/admin/team-operations/MergeTeamsWizard'
import { CloneTeamDialog } from '@/packages/components/admin/team-operations/CloneTeamDialog'
import { OperationLogs } from '@/packages/components/admin/team-operations/OperationLogs'

export default function TeamOperationsPage() {
  const [activeTab, setActiveTab] = useState('templates')
  const [showMergeWizard, setShowMergeWizard] = useState(false)
  const [showCloneDialog, setShowCloneDialog] = useState(false)

  // Fetch templates
  const { data: templatesData, loading: templatesLoading, refetch: refetchTemplates } = useQuery(
    AdminGetTeamTemplatesDocument,
    { variables: {} }
  )

  // Fetch merge logs
  const { data: mergeLogsData, loading: mergeLogsLoading } = useQuery(AdminGetMergeLogsDocument)

  // Fetch clone logs
  const { data: cloneLogsData, loading: cloneLogsLoading } = useQuery(AdminGetCloneLogsDocument)

  // Fetch statistics
  const { data: statsData, loading: statsLoading } = useQuery(AdminGetTeamOperationsStatisticsDocument)

  const stats = statsData?.adminGetTeamOperationsStatistics

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Операции с командами</h1>
        <p className="text-muted-foreground mt-1">
          Объединение, клонирование и шаблоны команд
        </p>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Всего шаблонов</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalTemplates}</div>
              <p className="text-xs text-muted-foreground">
                {stats.publicTemplates} публичных
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Слияний</CardTitle>
              <Merge className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalMerges}</div>
              <p className="text-xs text-muted-foreground">
                Всего операций
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Клонирований</CardTitle>
              <Copy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalClones}</div>
              <p className="text-xs text-muted-foreground">
                Всего операций
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Из шаблонов</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.teamsCreatedFromTemplates}</div>
              <p className="text-xs text-muted-foreground">
                Команд создано
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2">
        <Button onClick={() => setShowMergeWizard(true)}>
          <Merge className="h-4 w-4 mr-2" />
          Объединить команды
        </Button>
        <Button variant="outline" onClick={() => setShowCloneDialog(true)}>
          <Copy className="h-4 w-4 mr-2" />
          Клонировать команду
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="templates">Шаблоны</TabsTrigger>
          <TabsTrigger value="logs">История операций</TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="space-y-4">
          {templatesLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <TemplateGallery
              templates={templatesData?.adminGetTeamTemplates || []}
              onRefresh={refetchTemplates}
            />
          )}
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          {mergeLogsLoading || cloneLogsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <OperationLogs
              mergeLogs={mergeLogsData?.adminGetMergeLogs || []}
              cloneLogs={cloneLogsData?.adminGetCloneLogs || []}
            />
          )}
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      {showMergeWizard && (
        <MergeTeamsWizard onClose={() => setShowMergeWizard(false)} />
      )}

      {showCloneDialog && (
        <CloneTeamDialog onClose={() => setShowCloneDialog(false)} />
      )}
    </div>
  )
}
