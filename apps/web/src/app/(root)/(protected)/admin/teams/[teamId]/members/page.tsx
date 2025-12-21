'use client'

import { use, useState } from 'react'
import { useQuery, useMutation } from '@apollo/client'
import { Loader2, Download, Users, UserPlus, Trash2, Edit } from 'lucide-react'
import { Button } from '@/packages/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/packages/components/ui/card'
import {
  AdminGetTeamMembersDocument,
  AdminGetMemberStatisticsDocument,
  AdminBulkRemoveMembersDocument,
  MemberFilterInput,
} from '@/packages/api/graphql/__generated__/output'
import { MemberTable } from '@/packages/components/admin/team-members/MemberTable'
import { MemberFilters } from '@/packages/components/admin/team-members/MemberFilters'
import { toast } from 'sonner'

interface PageProps {
  params: Promise<{ teamId: string }>
}

export default function TeamMembersPage({ params }: PageProps) {
  const { teamId } = use(params)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [filter, setFilter] = useState<MemberFilterInput>({})

  // Fetch members
  const {
    data: membersData,
    loading: membersLoading,
    error: membersError,
    refetch: refetchMembers,
  } = useQuery(AdminGetTeamMembersDocument, {
    variables: { teamId, filter },
  })

  // Fetch statistics
  const { data: statsData, loading: statsLoading } = useQuery(AdminGetMemberStatisticsDocument, {
    variables: { teamId },
  })

  // Bulk remove mutation
  const [bulkRemove, { loading: removing }] = useMutation(AdminBulkRemoveMembersDocument, {
    onCompleted: (data) => {
      const result = data.adminBulkRemoveMembers
      if (result.successCount > 0) {
        toast.success(`Удалено участников: ${result.successCount}`)
        setSelectedIds([])
        refetchMembers()
      }
      if (result.failedCount > 0) {
        toast.error(`Ошибок: ${result.failedCount}`)
      }
    },
    onError: (error) => {
      toast.error(`Ошибка удаления: ${error.message}`)
    },
  })

  const handleBulkRemove = () => {
    if (selectedIds.length === 0) return
    if (!confirm(`Удалить ${selectedIds.length} участников?`)) return

    bulkRemove({
      variables: {
        input: {
          memberIds: selectedIds,
          reason: 'Bulk removal from admin panel',
        },
      },
    })
  }

  if (membersLoading || statsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (membersError) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-destructive">Ошибка загрузки</CardTitle>
            <CardDescription>{membersError.message}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  const members = membersData?.adminGetTeamMembers || []
  const stats = statsData?.adminGetMemberStatistics

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Управление участниками</h1>
          <p className="text-muted-foreground mt-1">
            Просмотр, фильтрация и массовые операции с участниками команды
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Экспорт
          </Button>
          <Button>
            <UserPlus className="h-4 w-4 mr-2" />
            Пригласить
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Всего участников</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalMembers}</div>
              <p className="text-xs text-muted-foreground">
                {stats.activeMembers} активных
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">С кастомными ролями</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.withCustomRoles}</div>
              <p className="text-xs text-muted-foreground">
                {Math.round((stats.withCustomRoles / stats.totalMembers) * 100)}% участников
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Средние часы</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.averageHours.toFixed(1)}</div>
              <p className="text-xs text-muted-foreground">
                Часов на участника
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Общий ФОТ</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 }).format(stats.totalPayroll)}
              </div>
              <p className="text-xs text-muted-foreground">
                {stats.withFixedSalary} с фикс. зарплатой
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <MemberFilters filter={filter} onChange={setFilter} />

      {/* Bulk Actions Toolbar */}
      {selectedIds.length > 0 && (
        <Card className="bg-muted">
          <CardContent className="flex items-center justify-between py-3">
            <span className="font-medium">
              Выбрано: {selectedIds.length} участников
            </span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Edit className="h-4 w-4 mr-2" />
                Изменить
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleBulkRemove}
                disabled={removing}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Удалить
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Members Table */}
      <MemberTable
        members={members}
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        onRefresh={refetchMembers}
      />
    </div>
  )
}
