'use client'

import { useState } from 'react'
import { useMutation } from '@apollo/client/react'
import { Pencil, Trash2, Users, Shield, Lock } from 'lucide-react'
import { Button } from '@/packages/components/ui/button'
import { Badge } from '@/packages/components/ui/badge'
import { Card, CardContent } from '@/packages/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/packages/components/ui/table'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/packages/components/ui/alert-dialog'
import { AdminDeleteCustomRoleDocument, type CustomRoleFieldsFragment } from '@/packages/api/graphql/__generated__/output'
import { toast } from 'sonner'

interface RoleListProps {
  roles: CustomRoleFieldsFragment[]
  onEdit: (roleId: string) => void
  onRefresh: () => void
}

export function RoleList({ roles, onEdit, onRefresh }: RoleListProps) {
  const [deleteRoleId, setDeleteRoleId] = useState<string | null>(null)

  const [deleteRole, { loading: deleteLoading }] = useMutation(AdminDeleteCustomRoleDocument, {
    onCompleted: () => {
      toast.success('Роль успешно удалена')
      setDeleteRoleId(null)
      onRefresh()
    },
    onError: (error) => {
      toast.error(`Ошибка удаления: ${error.message}`)
    },
  })

  const handleDelete = () => {
    if (deleteRoleId) {
      deleteRole({ variables: { roleId: deleteRoleId } })
    }
  }

  const getColorBadge = (color?: string | null) => {
    if (!color) return null
    return (
      <div
        className="w-4 h-4 rounded-full border border-border"
        style={{ backgroundColor: color }}
      />
    )
  }

  return (
    <>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Название</TableHead>
                <TableHead>Описание</TableHead>
                <TableHead className="text-center">Уровень</TableHead>
                <TableHead className="text-center">Прав</TableHead>
                <TableHead className="text-center">Участников</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead className="text-right">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {roles.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    Нет пользовательских ролей
                  </TableCell>
                </TableRow>
              ) : (
                roles.map((role) => (
                  <TableRow key={role.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getColorBadge(role.color)}
                        <div>
                          <div className="font-medium flex items-center gap-2">
                            {role.name}
                            {role.isBuiltIn && (
                              <Lock className="h-3 w-3 text-muted-foreground" />
                            )}
                          </div>
                          {role.parentRole && (
                            <div className="text-xs text-muted-foreground">
                              Наследует от: {role.parentRole.name}
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground line-clamp-2">
                        {role.description || '—'}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline">{role.level}</Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Shield className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{role.permissions.length}</span>
                        {role.effectivePermissions && role.effectivePermissions.length > role.permissions.length && (
                          <span className="text-xs text-muted-foreground">
                            (+{role.effectivePermissions.length - role.permissions.length})
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{role.memberCount || 0}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={role.isActive ? 'default' : 'secondary'}>
                        {role.isActive ? 'Активна' : 'Неактивна'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEdit(role.id)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        {!role.isBuiltIn && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeleteRoleId(role.id)}
                            disabled={role.memberCount! > 0}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteRoleId} onOpenChange={(open) => !open && setDeleteRoleId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить роль?</AlertDialogTitle>
            <AlertDialogDescription>
              Это действие нельзя отменить. Роль будет удалена навсегда.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={deleteLoading}>
              {deleteLoading ? 'Удаление...' : 'Удалить'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
