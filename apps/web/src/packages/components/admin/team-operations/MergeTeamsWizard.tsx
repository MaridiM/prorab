'use client'

import { useState } from 'react'
import { useQuery, useMutation, useLazyQuery } from '@apollo/client'
import { Loader2, AlertTriangle } from 'lucide-react'
import { Button } from '@/packages/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/packages/components/ui/dialog'
import { Label } from '@/packages/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/packages/components/ui/select'
import { Checkbox } from '@/packages/components/ui/checkbox'
import { Card, CardContent } from '@/packages/components/ui/card'
import {
  AdminGetTeamsDocument,
  AdminGetMergePreviewDocument,
  AdminMergeTeamsDocument,
} from '@/packages/api/graphql/__generated__/output'
import { toast } from 'sonner'

interface MergeTeamsWizardProps {
  onClose: () => void
}

export function MergeTeamsWizard({ onClose }: MergeTeamsWizardProps) {
  const [sourceTeamId, setSourceTeamId] = useState('')
  const [targetTeamId, setTargetTeamId] = useState('')
  const [deleteSource, setDeleteSource] = useState(false)
  const [showPreview, setShowPreview] = useState(false)

  const { data: teamsData } = useQuery(AdminGetTeamsDocument, {
    variables: { pagination: { limit: 100, offset: 0 } },
  })

  const [getPreview, { data: previewData, loading: previewLoading }] = useLazyQuery(
    AdminGetMergePreviewDocument
  )

  const [mergeTeams, { loading: merging }] = useMutation(AdminMergeTeamsDocument, {
    onCompleted: (data) => {
      const result = data.adminMergeTeams
      if (result.success) {
        toast.success(`Команды объединены! Перемещено: ${result.membersMoved} участников, ${result.projectsMoved} проектов`)
        onClose()
      } else {
        toast.error('Ошибка объединения')
      }
    },
    onError: (error) => {
      toast.error(`Ошибка: ${error.message}`)
    },
  })

  const handleGetPreview = () => {
    if (!sourceTeamId || !targetTeamId) {
      toast.error('Выберите обе команды')
      return
    }

    getPreview({
      variables: { sourceTeamId, targetTeamId },
    })
    setShowPreview(true)
  }

  const handleMerge = () => {
    if (!sourceTeamId || !targetTeamId) return

    mergeTeams({
      variables: {
        input: {
          sourceTeamId,
          targetTeamId,
          deleteSourceTeam: deleteSource,
        },
      },
    })
  }

  const teams = teamsData?.adminGetTeams?.teams || []
  const preview = previewData?.adminGetMergePreview

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Объединение команд</DialogTitle>
          <DialogDescription>
            Переместите участников и проекты из одной команды в другую
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Исходная команда (откуда)</Label>
            <Select value={sourceTeamId} onValueChange={setSourceTeamId}>
              <SelectTrigger>
                <SelectValue placeholder="Выберите команду" />
              </SelectTrigger>
              <SelectContent>
                {teams.map((team) => (
                  <SelectItem key={team.id} value={team.id}>
                    {team.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Целевая команда (куда)</Label>
            <Select value={targetTeamId} onValueChange={setTargetTeamId}>
              <SelectTrigger>
                <SelectValue placeholder="Выберите команду" />
              </SelectTrigger>
              <SelectContent>
                {teams.filter((t) => t.id !== sourceTeamId).map((team) => (
                  <SelectItem key={team.id} value={team.id}>
                    {team.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="deleteSource"
              checked={deleteSource}
              onCheckedChange={(checked) => setDeleteSource(checked as boolean)}
            />
            <Label htmlFor="deleteSource" className="cursor-pointer">
              Удалить исходную команду после объединения
            </Label>
          </div>

          {!showPreview && (
            <Button
              onClick={handleGetPreview}
              disabled={!sourceTeamId || !targetTeamId}
              className="w-full"
            >
              Просмотреть изменения
            </Button>
          )}

          {showPreview && previewLoading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          )}

          {showPreview && preview && (
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-semibold mb-4">Предпросмотр объединения</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Участников будет перемещено:</span>
                    <span className="font-semibold">{preview.membersToMove}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Проектов будет перемещено:</span>
                    <span className="font-semibold">{preview.projectsToMove}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Конфликтов участников:</span>
                    <span className="font-semibold text-destructive">
                      {preview.conflictingMembers}
                    </span>
                  </div>
                </div>

                {preview.warnings.length > 0 && (
                  <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
                      <div className="text-sm">
                        {preview.warnings.map((warning, i) => (
                          <div key={i}>{warning}</div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Отмена
          </Button>
          {showPreview && preview?.canMerge && (
            <Button onClick={handleMerge} disabled={merging}>
              {merging ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Объединение...
                </>
              ) : (
                'Объединить команды'
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
