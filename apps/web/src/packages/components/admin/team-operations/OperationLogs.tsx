'use client'

import { Card, CardContent } from '@/packages/components/ui/card'
import { Badge } from '@/packages/components/ui/badge'
import { Merge, Copy } from 'lucide-react'
import type {
  TeamMergeLogFieldsFragment,
  TeamCloneLogFieldsFragment,
} from '@/packages/api/graphql/__generated__/output'

interface OperationLogsProps {
  mergeLogs: TeamMergeLogFieldsFragment[]
  cloneLogs: TeamCloneLogFieldsFragment[]
}

export function OperationLogs({ mergeLogs, cloneLogs }: OperationLogsProps) {
  const combinedLogs = [
    ...mergeLogs.map((log) => ({
      ...log,
      type: 'merge' as const,
      timestamp: log.createdAt,
    })),
    ...cloneLogs.map((log) => ({
      ...log,
      type: 'clone' as const,
      timestamp: log.createdAt,
    })),
  ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

  if (combinedLogs.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">История операций пуста</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-3">
      {combinedLogs.map((log) => (
        <Card key={`${log.type}-${log.id}`}>
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              {log.type === 'merge' ? (
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Merge className="h-5 w-5 text-blue-600" />
                </div>
              ) : (
                <div className="p-2 bg-green-100 rounded-lg">
                  <Copy className="h-5 w-5 text-green-600" />
                </div>
              )}

              <div className="flex-1">
                {log.type === 'merge' ? (
                  <>
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="default">Слияние</Badge>
                      <span className="text-sm text-muted-foreground">
                        {new Date(log.timestamp).toLocaleString('ru-RU')}
                      </span>
                    </div>
                    <p className="font-medium">
                      {log.sourceTeamName} → {log.targetTeamName}
                    </p>
                    <div className="text-sm text-muted-foreground mt-2">
                      Перемещено: {(log as TeamMergeLogFieldsFragment).membersMoved} участников,{' '}
                      {(log as TeamMergeLogFieldsFragment).projectsMoved} проектов
                    </div>
                    {(log as TeamMergeLogFieldsFragment).notes && (
                      <div className="text-sm mt-1">
                        Примечание: {(log as TeamMergeLogFieldsFragment).notes}
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="secondary">Клонирование</Badge>
                      <span className="text-sm text-muted-foreground">
                        {new Date(log.timestamp).toLocaleString('ru-RU')}
                      </span>
                    </div>
                    <p className="font-medium">
                      {log.sourceTeamName} → {log.clonedTeamName}
                    </p>
                    <div className="text-sm text-muted-foreground mt-2">
                      Клонировано:{' '}
                      {[
                        (log as TeamCloneLogFieldsFragment).clonedSettings.cloneRoles && 'роли',
                        (log as TeamCloneLogFieldsFragment).clonedSettings.cloneProjects && 'проекты',
                        (log as TeamCloneLogFieldsFragment).clonedSettings.cloneMembers && 'участники',
                      ]
                        .filter(Boolean)
                        .join(', ') || 'базовая структура'}
                    </div>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
