'use client'

import { use, useState } from 'react'
import { useQuery, useMutation } from '@apollo/client'
import { Loader2, Plus, Settings, Users, Shield, ChevronDown, ChevronRight } from 'lucide-react'
import { Button } from '@/packages/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/packages/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/packages/components/ui/tabs'
import { Badge } from '@/packages/components/ui/badge'
import {
  AdminGetTeamRolesDocument,
  AdminGetRoleHierarchyDocument,
  AdminGetPermissionCategoriesDocument,
  AdminGetRoleStatisticsDocument,
} from '@/packages/api/graphql/__generated__/output'
import { RoleHierarchyTree } from '@/packages/components/admin/role-builder/RoleHierarchyTree'
import { RoleList } from '@/packages/components/admin/role-builder/RoleList'
import { RoleFormDialog } from '@/packages/components/admin/role-builder/RoleFormDialog'
import { PermissionEditor } from '@/packages/components/admin/role-builder/PermissionEditor'

interface PageProps {
  params: Promise<{ teamId: string }>
}

export default function TeamRolesPage({ params }: PageProps) {
  const { teamId } = use(params)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null)

  // Fetch team roles
  const {
    data: rolesData,
    loading: rolesLoading,
    error: rolesError,
    refetch: refetchRoles,
  } = useQuery(AdminGetTeamRolesDocument, {
    variables: { teamId },
  })

  // Fetch role hierarchy
  const {
    data: hierarchyData,
    loading: hierarchyLoading,
    refetch: refetchHierarchy,
  } = useQuery(AdminGetRoleHierarchyDocument, {
    variables: { teamId },
  })

  // Fetch permission categories
  const {
    data: permissionsData,
    loading: permissionsLoading,
  } = useQuery(AdminGetPermissionCategoriesDocument)

  // Fetch statistics
  const {
    data: statsData,
    loading: statsLoading,
  } = useQuery(AdminGetRoleStatisticsDocument, {
    variables: { teamId },
  })

  const handleRefresh = () => {
    refetchRoles()
    refetchHierarchy()
  }

  if (rolesLoading || hierarchyLoading || permissionsLoading || statsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (rolesError) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-destructive">Ошибка загрузки</CardTitle>
            <CardDescription>{rolesError.message}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  const roles = rolesData?.adminGetTeamRoles || []
  const hierarchy = hierarchyData?.adminGetRoleHierarchy || []
  const permissionCategories = permissionsData?.adminGetPermissionCategories || []
  const stats = statsData?.adminGetRoleStatistics

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Управление ролями</h1>
          <p className="text-muted-foreground mt-1">
            Создавайте и настраивайте пользовательские роли с гибкими правами доступа
          </p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Создать роль
        </Button>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Всего ролей</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalRoles}</div>
              <p className="text-xs text-muted-foreground">
                {stats.activeRoles} активных
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Системных</CardTitle>
              <Settings className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.builtInRoles}</div>
              <p className="text-xs text-muted-foreground">
                Встроенные роли
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Участников</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalMembers}</div>
              <p className="text-xs text-muted-foreground">
                Всего в команде
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">С кастомными ролями</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.membersWithCustomRoles}</div>
              <p className="text-xs text-muted-foreground">
                {Math.round((stats.membersWithCustomRoles / stats.totalMembers) * 100)}% участников
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content */}
      <Tabs defaultValue="list" className="space-y-4">
        <TabsList>
          <TabsTrigger value="list">Список ролей</TabsTrigger>
          <TabsTrigger value="hierarchy">Иерархия</TabsTrigger>
          <TabsTrigger value="permissions">Права доступа</TabsTrigger>
        </TabsList>

        {/* Roles List Tab */}
        <TabsContent value="list" className="space-y-4">
          <RoleList
            roles={roles}
            onEdit={(roleId) => setSelectedRoleId(roleId)}
            onRefresh={handleRefresh}
          />
        </TabsContent>

        {/* Hierarchy Tab */}
        <TabsContent value="hierarchy" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Иерархия ролей</CardTitle>
              <CardDescription>
                Дочерние роли наследуют права от родительских ролей
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RoleHierarchyTree
                nodes={hierarchy}
                onSelectRole={(roleId) => setSelectedRoleId(roleId)}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Permissions Tab */}
        <TabsContent value="permissions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Справочник прав доступа</CardTitle>
              <CardDescription>
                Все доступные права доступа, сгруппированные по категориям
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PermissionEditor
                categories={permissionCategories}
                selectedPermissions={[]}
                readOnly
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Role Dialog */}
      <RoleFormDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        teamId={teamId}
        permissionCategories={permissionCategories}
        existingRoles={roles}
        onSuccess={handleRefresh}
      />

      {/* Edit Role Dialog */}
      {selectedRoleId && (
        <RoleFormDialog
          open={!!selectedRoleId}
          onOpenChange={(open) => !open && setSelectedRoleId(null)}
          teamId={teamId}
          roleId={selectedRoleId}
          permissionCategories={permissionCategories}
          existingRoles={roles}
          onSuccess={handleRefresh}
        />
      )}
    </div>
  )
}
