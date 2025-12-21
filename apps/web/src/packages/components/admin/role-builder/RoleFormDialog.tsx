'use client'

import { useState, useEffect } from 'react'
import { useQuery, useMutation } from '@apollo/client'
import { Loader2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/packages/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/packages/components/ui/dialog'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/packages/components/ui/form'
import { Input } from '@/packages/components/ui/input'
import { Textarea } from '@/packages/components/ui/textarea'
import { Switch } from '@/packages/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/packages/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/packages/components/ui/tabs'
import { PermissionEditor } from './PermissionEditor'
import {
  AdminGetRoleByIdDocument,
  AdminCreateCustomRoleDocument,
  AdminUpdateCustomRoleDocument,
  type CustomRoleFieldsFragment,
  type PermissionCategoryFieldsFragment,
} from '@/packages/api/graphql/__generated__/output'
import { toast } from 'sonner'

const roleFormSchema = z.object({
  name: z.string().min(1, 'Название обязательно').max(100, 'Максимум 100 символов'),
  description: z.string().max(500, 'Максимум 500 символов').optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Неверный формат цвета').optional().or(z.literal('')),
  permissions: z.array(z.string()).min(1, 'Выберите хотя бы одно право'),
  parentRoleId: z.string().optional().nullable(),
  isActive: z.boolean().default(true),
  sortOrder: z.number().int().min(0).default(0),
})

type RoleFormValues = z.infer<typeof roleFormSchema>

interface RoleFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  teamId: string
  roleId?: string
  permissionCategories: PermissionCategoryFieldsFragment[]
  existingRoles: CustomRoleFieldsFragment[]
  onSuccess: () => void
}

export function RoleFormDialog({
  open,
  onOpenChange,
  teamId,
  roleId,
  permissionCategories,
  existingRoles,
  onSuccess,
}: RoleFormDialogProps) {
  const [inheritedPermissions, setInheritedPermissions] = useState<string[]>([])
  const isEdit = !!roleId

  // Fetch role data if editing
  const { data: roleData, loading: roleLoading } = useQuery(AdminGetRoleByIdDocument, {
    variables: { roleId: roleId! },
    skip: !roleId,
  })

  const [createRole, { loading: createLoading }] = useMutation(AdminCreateCustomRoleDocument, {
    onCompleted: () => {
      toast.success('Роль успешно создана')
      onSuccess()
      onOpenChange(false)
    },
    onError: (error) => {
      toast.error(`Ошибка создания: ${error.message}`)
    },
  })

  const [updateRole, { loading: updateLoading }] = useMutation(AdminUpdateCustomRoleDocument, {
    onCompleted: () => {
      toast.success('Роль успешно обновлена')
      onSuccess()
      onOpenChange(false)
    },
    onError: (error) => {
      toast.error(`Ошибка обновления: ${error.message}`)
    },
  })

  const form = useForm<RoleFormValues>({
    resolver: zodResolver(roleFormSchema),
    defaultValues: {
      name: '',
      description: '',
      color: '#3b82f6',
      permissions: [],
      parentRoleId: null,
      isActive: true,
      sortOrder: 0,
    },
  })

  // Load role data into form
  useEffect(() => {
    if (roleData?.adminGetRoleById) {
      const role = roleData.adminGetRoleById
      form.reset({
        name: role.name,
        description: role.description || '',
        color: role.color || '#3b82f6',
        permissions: role.permissions,
        parentRoleId: role.parentRoleId || null,
        isActive: role.isActive,
        sortOrder: role.sortOrder,
      })

      // Set inherited permissions from parent
      if (role.parentRole) {
        setInheritedPermissions(role.parentRole.permissions || [])
      }
    }
  }, [roleData, form])

  // Update inherited permissions when parent role changes
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === 'parentRoleId' && value.parentRoleId) {
        const parentRole = existingRoles.find((r) => r.id === value.parentRoleId)
        if (parentRole) {
          setInheritedPermissions(parentRole.effectivePermissions || parentRole.permissions)
        } else {
          setInheritedPermissions([])
        }
      } else if (name === 'parentRoleId' && !value.parentRoleId) {
        setInheritedPermissions([])
      }
    })
    return () => subscription.unsubscribe()
  }, [form, existingRoles])

  const onSubmit = (values: RoleFormValues) => {
    if (isEdit && roleId) {
      updateRole({
        variables: {
          input: {
            id: roleId,
            name: values.name,
            description: values.description || null,
            color: values.color || null,
            permissions: values.permissions,
            parentRoleId: values.parentRoleId || null,
            isActive: values.isActive,
            sortOrder: values.sortOrder,
          },
        },
      })
    } else {
      createRole({
        variables: {
          input: {
            teamId,
            name: values.name,
            description: values.description || undefined,
            color: values.color || undefined,
            permissions: values.permissions,
            parentRoleId: values.parentRoleId || undefined,
            sortOrder: values.sortOrder,
          },
        },
      })
    }
  }

  const loading = createLoading || updateLoading || roleLoading

  // Available parent roles (exclude current role and its descendants to prevent circular references)
  const availableParentRoles = existingRoles.filter((r) => r.id !== roleId && !r.isBuiltIn)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Редактировать роль' : 'Создать новую роль'}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Измените настройки роли и права доступа'
              : 'Создайте новую пользовательскую роль с гибкими правами доступа'}
          </DialogDescription>
        </DialogHeader>

        {roleLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <Tabs defaultValue="basic" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="basic">Основная информация</TabsTrigger>
                  <TabsTrigger value="permissions">Права доступа</TabsTrigger>
                </TabsList>

                {/* Basic Information Tab */}
                <TabsContent value="basic" className="space-y-4 mt-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Название роли *</FormLabel>
                        <FormControl>
                          <Input placeholder="Старший прораб" {...field} />
                        </FormControl>
                        <FormDescription>
                          Уникальное название роли в пределах команды
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Описание</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Описание роли и её ответственности"
                            {...field}
                            rows={3}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="color"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Цвет</FormLabel>
                          <FormControl>
                            <div className="flex items-center gap-2">
                              <Input type="color" {...field} className="w-20 h-10 p-1" />
                              <Input
                                type="text"
                                value={field.value || ''}
                                onChange={field.onChange}
                                placeholder="#3b82f6"
                                className="flex-1"
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="sortOrder"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Порядок сортировки</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormDescription>Порядок отображения в списке</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="parentRoleId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Родительская роль</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value || undefined}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Выберите родительскую роль (опционально)" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="__none__">Без родительской роли</SelectItem>
                            {availableParentRoles.map((role) => (
                              <SelectItem key={role.id} value={role.id}>
                                {role.name} (Уровень {role.level})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Роль унаследует все права от родительской роли
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="isActive"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Активна</FormLabel>
                          <FormDescription>
                            Неактивные роли нельзя назначить участникам
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </TabsContent>

                {/* Permissions Tab */}
                <TabsContent value="permissions" className="mt-4">
                  <FormField
                    control={form.control}
                    name="permissions"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Права доступа *</FormLabel>
                        <FormControl>
                          <PermissionEditor
                            categories={permissionCategories}
                            selectedPermissions={field.value}
                            onChange={field.onChange}
                            inheritedPermissions={inheritedPermissions}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TabsContent>
              </Tabs>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={loading}
                >
                  Отмена
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isEdit ? 'Сохранить' : 'Создать роль'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  )
}
