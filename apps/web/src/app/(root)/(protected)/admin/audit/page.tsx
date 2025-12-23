'use client'

import { useQuery } from '@apollo/client/react'
import { Loader2, Shield, FileText, Download, BarChart3 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/packages/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/packages/components/ui/tabs'
import {
  AdminGetAuditStatisticsDocument,
  AdminGetAuditLogsDocument,
  AdminGetRetentionPoliciesDocument,
  AdminGetDataExportRequestsDocument,
} from '@/packages/api/graphql/__generated__/output'

export default function AuditPage() {
  const { data: statsData, loading: statsLoading } = useQuery(AdminGetAuditStatisticsDocument, {
    variables: {},
  })

  const { data: logsData, loading: logsLoading } = useQuery(AdminGetAuditLogsDocument, {
    variables: { pagination: { limit: 50, offset: 0 } },
  })

  const { data: policiesData } = useQuery(AdminGetRetentionPoliciesDocument, {
    variables: {},
  })

  const { data: exportsData } = useQuery(AdminGetDataExportRequestsDocument, {
    variables: {},
  })

  const stats = statsData?.adminGetAuditStatistics
  const logs = logsData?.adminGetAuditLogs?.logs || []
  const policies = policiesData?.adminGetRetentionPolicies || []
  const exports = exportsData?.adminGetDataExportRequests || []

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Аудит и соответствие</h1>
        <p className="text-muted-foreground mt-1">
          Просмотр логов, политик хранения и экспорта данных
        </p>
      </div>

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Всего логов</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalLogs}</div>
              <p className="text-xs text-muted-foreground">
                {stats.logsLast24h} за 24ч
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">За 7 дней</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.logsLast7d}</div>
              <p className="text-xs text-muted-foreground">
                Записей в логах
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Политики</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{policies.length}</div>
              <p className="text-xs text-muted-foreground">
                Хранения данных
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Экспорты</CardTitle>
              <Download className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{exports.length}</div>
              <p className="text-xs text-muted-foreground">
                Запросов
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="logs">
        <TabsList>
          <TabsTrigger value="logs">Логи аудита</TabsTrigger>
          <TabsTrigger value="policies">Политики</TabsTrigger>
          <TabsTrigger value="exports">Экспорты</TabsTrigger>
        </TabsList>

        <TabsContent value="logs" className="space-y-4">
          {logsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : logs.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">Логи не найдены</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {logs.map((log) => (
                <Card key={log.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium">{log.action}</p>
                        <p className="text-sm text-muted-foreground">
                          {log.resource} • {log.category} • {new Date(log.createdAt).toLocaleString('ru-RU')}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="policies" className="space-y-4">
          {policies.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">Политики не настроены</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {policies.map((policy) => (
                <Card key={policy.id}>
                  <CardHeader>
                    <CardTitle className="text-lg">{policy.resourceType}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">
                      Хранение: {policy.retentionDays} дней
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {policy.isActive ? 'Активно' : 'Неактивно'}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="exports" className="space-y-4">
          {exports.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">Запросы на экспорт отсутствуют</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {exports.map((exp) => (
                <Card key={exp.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium">{exp.type}</p>
                        <p className="text-sm text-muted-foreground">
                          {exp.status} • {exp.format} • {new Date(exp.createdAt).toLocaleString('ru-RU')}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
