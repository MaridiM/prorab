'use client'

import { useParams, useRouter } from 'next/navigation'
import { useQuery } from '@apollo/client'
import { ArrowLeft, Users, FolderKanban, Clock, TrendingUp, HardDrive, Wallet } from 'lucide-react'
import { Button } from '@/packages/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/packages/components/ui/card'
import { AdminDashboardSkeleton } from '@/packages/components/ui/admin-page-skeleton'
import { TeamGrowthChart } from '@/packages/components/admin/team-analytics/TeamGrowthChart'
import { MemberActivityTable } from '@/packages/components/admin/team-analytics/MemberActivityTable'
import { TeamCompositionCharts } from '@/packages/components/admin/team-analytics/TeamCompositionCharts'
import { StorageUsageCard } from '@/packages/components/admin/team-analytics/StorageUsageCard'
import { AdminTeamAnalyticsDocument } from '@/packages/api/graphql/__generated__/output'

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0,
  }).format(amount)
}

function formatNumber(num: number): string {
  return new Intl.NumberFormat('ru-RU').format(num)
}

interface StatCardProps {
  icon: React.ElementType
  label: string
  value: string | number
  subValue?: string
  gradient: string
  iconBg: string
}

function StatCard({ icon: Icon, label, value, subValue, gradient, iconBg }: StatCardProps) {
  return (
    <Card className={`${gradient} border-0 text-white`}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-white/80">{label}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
            {subValue && (
              <p className="text-sm text-white/70 mt-1">{subValue}</p>
            )}
          </div>
          <div className={`p-3 rounded-lg ${iconBg}`}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function TeamAnalyticsPage() {
  const params = useParams()
  const router = useRouter()
  const teamId = params.teamId as string

  const { data, loading, error } = useQuery(AdminTeamAnalyticsDocument, {
    variables: { teamId },
    skip: !teamId,
  })

  if (loading) {
    return <AdminDashboardSkeleton />
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-destructive/10 text-destructive p-4 rounded-lg">
          Ошибка загрузки аналитики: {error.message}
        </div>
      </div>
    )
  }

  const analytics = data?.adminTeamAnalytics
  if (!analytics) {
    return (
      <div className="p-6">
        <div className="bg-muted p-4 rounded-lg text-center">
          Данные аналитики не найдены
        </div>
      </div>
    )
  }

  const { kpis, growthChart, memberActivity, composition, storageUsage } = analytics

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push('/admin/teams')}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Аналитика команды</h1>
          <p className="text-muted-foreground">{analytics.teamName}</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Users}
          label="Участников"
          value={kpis.totalMembers}
          subValue={`Удержание: ${kpis.memberRetention}%`}
          gradient="bg-gradient-to-br from-blue-500 to-blue-600"
          iconBg="bg-blue-400/30"
        />
        <StatCard
          icon={FolderKanban}
          label="Проектов"
          value={kpis.activeProjectsCount + kpis.completedProjectsCount + kpis.archivedProjectsCount}
          subValue={`Активных: ${kpis.activeProjectsCount}, Завершено: ${kpis.completedProjectsCount}`}
          gradient="bg-gradient-to-br from-green-500 to-green-600"
          iconBg="bg-green-400/30"
        />
        <StatCard
          icon={Clock}
          label="Часов работы"
          value={formatNumber(kpis.totalHoursWorked)}
          subValue={`Среднее на участника: ${kpis.avgHoursPerMember} ч.`}
          gradient="bg-gradient-to-br from-purple-500 to-purple-600"
          iconBg="bg-purple-400/30"
        />
        <StatCard
          icon={Wallet}
          label="Прибыль"
          value={formatCurrency(kpis.profit)}
          subValue={`Бюджет: ${formatCurrency(kpis.totalBudget)}, Расходы: ${formatCurrency(kpis.totalExpenses)}`}
          gradient={kpis.profit >= 0 ? "bg-gradient-to-br from-emerald-500 to-emerald-600" : "bg-gradient-to-br from-red-500 to-red-600"}
          iconBg={kpis.profit >= 0 ? "bg-emerald-400/30" : "bg-red-400/30"}
        />
      </div>

      {/* Additional KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-amber-100 dark:bg-amber-900/30">
                <TrendingUp className="h-6 w-6 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Завершение проектов</p>
                <p className="text-2xl font-bold">{kpis.projectCompletionRate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-cyan-100 dark:bg-cyan-900/30">
                <Clock className="h-6 w-6 text-cyan-600 dark:text-cyan-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Средняя длительность проекта</p>
                <p className="text-2xl font-bold">{kpis.avgProjectDurationDays} дн.</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-indigo-100 dark:bg-indigo-900/30">
                <Wallet className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Общий доход</p>
                <p className="text-2xl font-bold">{formatCurrency(kpis.totalRevenue)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Growth Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Рост команды</CardTitle>
          <CardDescription>Динамика участников и проектов за последние 12 месяцев</CardDescription>
        </CardHeader>
        <CardContent>
          <TeamGrowthChart data={growthChart} />
        </CardContent>
      </Card>

      {/* Two column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Team Composition */}
        <Card>
          <CardHeader>
            <CardTitle>Состав команды</CardTitle>
            <CardDescription>Распределение по ролям, должностям и типам оплаты</CardDescription>
          </CardHeader>
          <CardContent>
            <TeamCompositionCharts data={composition} />
          </CardContent>
        </Card>

        {/* Storage Usage */}
        <Card>
          <CardHeader>
            <CardTitle>Использование хранилища</CardTitle>
            <CardDescription>Распределение по проектам</CardDescription>
          </CardHeader>
          <CardContent>
            <StorageUsageCard data={storageUsage} />
          </CardContent>
        </Card>
      </div>

      {/* Member Activity Table */}
      <Card>
        <CardHeader>
          <CardTitle>Активность участников</CardTitle>
          <CardDescription>Статистика работы каждого участника команды</CardDescription>
        </CardHeader>
        <CardContent>
          <MemberActivityTable members={memberActivity} />
        </CardContent>
      </Card>
    </div>
  )
}
