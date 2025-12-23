'use client'

import { useState } from 'react'
import { useQuery, useMutation } from '@apollo/client/react'
import { Loader2 } from 'lucide-react'
import { Button } from '@/packages/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/packages/components/ui/dialog'
import { Input } from '@/packages/components/ui/input'
import { Label } from '@/packages/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/packages/components/ui/select'
import { Checkbox } from '@/packages/components/ui/checkbox'
import {
  AdminTeamsDocument,
  AdminCloneTeamDocument,
} from '@/packages/api/graphql/__generated__/output'
import { toast } from 'sonner'

interface CloneTeamDialogProps {
  onClose: () => void
}

export function CloneTeamDialog({ onClose }: CloneTeamDialogProps) {
  const [sourceTeamId, setSourceTeamId] = useState('')
  const [newTeamName, setNewTeamName] = useState('')
  const [cloneRoles, setCloneRoles] = useState(true)
  const [cloneProjects, setCloneProjects] = useState(false)
  const [cloneMembers, setCloneMembers] = useState(false)

  const { data: teamsData } = useQuery(AdminTeamsDocument, {
    variables: { 
      filters: null,
      pagination: { page: 1, limit: 100 } 
    },
  })

  const [cloneTeam, { loading: cloning }] = useMutation(AdminCloneTeamDocument, {
    onCompleted: (data) => {
      const result = data.adminCloneTeam
      if (result.success) {
        toast.success('Команда успешно клонирована!')
        onClose()
      } else {
        toast.error(`Ошибка: ${result.error}`)
      }
    },
    onError: (error) => {
      toast.error(`Ошибка: ${error.message}`)
    },
  })

  const handleClone = (e: React.FormEvent) => {
    e.preventDefault()

    if (!sourceTeamId || !newTeamName.trim()) {
      toast.error('Заполните все обязательные поля')
      return
    }

    cloneTeam({
      variables: {
        input: {
          sourceTeamId,
          newTeamName,
          cloneRoles,
          cloneProjects,
          cloneMembers,
        },
      },
    })
  }

  const teams = teamsData?.adminTeams?.nodes || []

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Клонирование команды</DialogTitle>
          <DialogDescription>
            Создайте копию существующей команды
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleClone} className="space-y-4">
          <div>
            <Label>Исходная команда</Label>
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
            <Label htmlFor="newTeamName">Название новой команды *</Label>
            <Input
              id="newTeamName"
              value={newTeamName}
              onChange={(e) => setNewTeamName(e.target.value)}
              placeholder="Введите название"
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Что клонировать:</Label>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="cloneRoles"
                checked={cloneRoles}
                onCheckedChange={(checked) => setCloneRoles(checked as boolean)}
              />
              <Label htmlFor="cloneRoles" className="cursor-pointer">
                Роли
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="cloneProjects"
                checked={cloneProjects}
                onCheckedChange={(checked) => setCloneProjects(checked as boolean)}
              />
              <Label htmlFor="cloneProjects" className="cursor-pointer">
                Проекты (без участников)
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="cloneMembers"
                checked={cloneMembers}
                onCheckedChange={(checked) => setCloneMembers(checked as boolean)}
              />
              <Label htmlFor="cloneMembers" className="cursor-pointer">
                Участников
              </Label>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Отмена
            </Button>
            <Button type="submit" disabled={cloning}>
              {cloning ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Клонирование...
                </>
              ) : (
                'Клонировать'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
