'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp, Check } from 'lucide-react'
import { Button } from '@/packages/components/ui/button'
import { Checkbox } from '@/packages/components/ui/checkbox'
import { Badge } from '@/packages/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/packages/components/ui/card'
import { cn } from '@/packages/lib/utils'
import type { PermissionCategoryFieldsFragment } from '@/packages/api/graphql/__generated__/output'

interface PermissionEditorProps {
  categories: PermissionCategoryFieldsFragment[]
  selectedPermissions: string[]
  onChange?: (permissions: string[]) => void
  readOnly?: boolean
  inheritedPermissions?: string[]
}

export function PermissionEditor({
  categories,
  selectedPermissions,
  onChange,
  readOnly = false,
  inheritedPermissions = [],
}: PermissionEditorProps) {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(categories.slice(0, 3).map((c) => c.key)), // Auto-expand first 3 categories
  )

  const toggleCategory = (key: string) => {
    const newExpanded = new Set(expandedCategories)
    if (newExpanded.has(key)) {
      newExpanded.delete(key)
    } else {
      newExpanded.add(key)
    }
    setExpandedCategories(newExpanded)
  }

  const togglePermission = (permissionKey: string) => {
    if (readOnly || inheritedPermissions.includes(permissionKey)) return

    const newPermissions = selectedPermissions.includes(permissionKey)
      ? selectedPermissions.filter((p) => p !== permissionKey)
      : [...selectedPermissions, permissionKey]

    onChange?.(newPermissions)
  }

  const toggleCategoryPermissions = (category: PermissionCategoryFieldsFragment) => {
    if (readOnly) return

    const categoryPermKeys = category.permissions.map((p) => p.key)
    const nonInheritedKeys = categoryPermKeys.filter((k) => !inheritedPermissions.includes(k))
    const allSelected = nonInheritedKeys.every((k) => selectedPermissions.includes(k))

    let newPermissions: string[]
    if (allSelected) {
      // Deselect all non-inherited permissions in this category
      newPermissions = selectedPermissions.filter((p) => !nonInheritedKeys.includes(p))
    } else {
      // Select all non-inherited permissions in this category
      newPermissions = [...new Set([...selectedPermissions, ...nonInheritedKeys])]
    }

    onChange?.(newPermissions)
  }

  const getCategoryStats = (category: PermissionCategoryFieldsFragment) => {
    const totalPerms = category.permissions.length
    const selectedCount = category.permissions.filter((p) =>
      selectedPermissions.includes(p.key) || inheritedPermissions.includes(p.key),
    ).length
    const inheritedCount = category.permissions.filter((p) =>
      inheritedPermissions.includes(p.key),
    ).length

    return { totalPerms, selectedCount, inheritedCount }
  }

  return (
    <div className="space-y-4">
      {categories.map((category) => {
        const isExpanded = expandedCategories.has(category.key)
        const stats = getCategoryStats(category)
        const allNonInheritedSelected =
          category.permissions
            .filter((p) => !inheritedPermissions.includes(p.key))
            .every((p) => selectedPermissions.includes(p.key))

        return (
          <Card key={category.key}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  {!readOnly && (
                    <Checkbox
                      checked={allNonInheritedSelected && stats.selectedCount > 0}
                      onCheckedChange={() => toggleCategoryPermissions(category)}
                      disabled={stats.totalPerms === stats.inheritedCount}
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-base">{category.label}</CardTitle>
                    <CardDescription className="text-sm">
                      {category.description}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={stats.selectedCount === stats.totalPerms ? 'default' : 'secondary'}>
                      {stats.selectedCount} / {stats.totalPerms}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleCategory(category.key)}
                    >
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </CardHeader>

            {isExpanded && (
              <CardContent className="pt-0">
                <div className="space-y-2">
                  {category.permissions.map((permission) => {
                    const isSelected = selectedPermissions.includes(permission.key)
                    const isInherited = inheritedPermissions.includes(permission.key)
                    const isDisabled = readOnly || isInherited

                    return (
                      <div
                        key={permission.key}
                        className={cn(
                          'flex items-start gap-3 p-3 rounded-md border transition-colors',
                          isDisabled && 'opacity-60',
                          !isDisabled && 'hover:bg-muted/50',
                          isInherited && 'bg-muted/30',
                        )}
                      >
                        <Checkbox
                          checked={isSelected || isInherited}
                          onCheckedChange={() => togglePermission(permission.key)}
                          disabled={isDisabled}
                          className="mt-0.5"
                        />
                        <div className="flex-1 min-w-0 space-y-1">
                          <div className="flex items-center gap-2">
                            <span className={cn('font-medium text-sm', isDisabled && 'text-muted-foreground')}>
                              {permission.name}
                            </span>
                            {isInherited && (
                              <Badge variant="outline" className="text-xs">
                                Унаследовано
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {permission.description}
                          </p>
                          <code className="text-xs text-muted-foreground bg-muted px-1 rounded">
                            {permission.key}
                          </code>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            )}
          </Card>
        )
      })}
    </div>
  )
}
