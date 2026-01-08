'use client'

import { useState } from 'react'
import { ChevronDown, ChevronRight, Shield, Users, Lock } from 'lucide-react'
import { Button } from '@/packages/components/ui/button'
import { Badge } from '@/packages/components/ui/badge'
import { cn } from '@/packages/utils'
import type { RoleHierarchyNodeFieldsFragment } from '@/packages/api/graphql/__generated__/output'

interface RoleHierarchyTreeProps {
  nodes: RoleHierarchyNodeFieldsFragment[]
  onSelectRole?: (roleId: string) => void
}

export function RoleHierarchyTree({ nodes, onSelectRole }: RoleHierarchyTreeProps) {
  if (nodes.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Нет ролей для отображения
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {nodes.map((node) => (
        <RoleTreeNode key={node.id} node={node} onSelectRole={onSelectRole} />
      ))}
    </div>
  )
}

interface RoleTreeNodeProps {
  node: RoleHierarchyNodeFieldsFragment
  onSelectRole?: (roleId: string) => void
  level?: number
}

function RoleTreeNode({ node, onSelectRole, level = 0 }: RoleTreeNodeProps) {
  const [isExpanded, setIsExpanded] = useState(level < 2) // Auto-expand first 2 levels
  const hasChildren = node.children && node.children.length > 0

  return (
    <div className="space-y-1">
      <div
        className={cn(
          'flex items-center gap-2 p-2 rounded-md hover:bg-muted/50 transition-colors',
          onSelectRole && 'cursor-pointer',
        )}
        style={{ marginLeft: `${level * 24}px` }}
        onClick={() => onSelectRole?.(node.id)}
      >
        {/* Expand/Collapse Button */}
        {hasChildren ? (
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={(e) => {
              e.stopPropagation()
              setIsExpanded(!isExpanded)
            }}
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>
        ) : (
          <div className="w-6" />
        )}

        {/* Role Color */}
        {node.color && (
          <div
            className="w-4 h-4 rounded-full border border-border flex-shrink-0"
            style={{ backgroundColor: node.color }}
          />
        )}

        {/* Role Name */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium truncate">{node.name}</span>
            {node.isBuiltIn && (
              <Lock className="h-3 w-3 text-muted-foreground flex-shrink-0" />
            )}
          </div>
        </div>

        {/* Level Badge */}
        <Badge variant="outline" className="flex-shrink-0">
          Ур. {node.level}
        </Badge>

        {/* Permissions Count */}
        <div className="flex items-center gap-1 text-sm text-muted-foreground flex-shrink-0">
          <Shield className="h-4 w-4" />
          <span>{node.permissionCount}</span>
        </div>

        {/* Members Count */}
        <div className="flex items-center gap-1 text-sm text-muted-foreground flex-shrink-0">
          <Users className="h-4 w-4" />
          <span>{node.memberCount}</span>
        </div>
      </div>

      {/* Children */}
      {hasChildren && isExpanded && (
        <div className="space-y-1">
          {node.children!.map((child) => (
            <RoleTreeNode
              key={child.id}
              node={child}
              onSelectRole={onSelectRole}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  )
}
