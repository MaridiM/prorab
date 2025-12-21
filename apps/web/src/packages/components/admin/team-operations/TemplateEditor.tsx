'use client'

import { useState, useEffect } from 'react'
import { useQuery, useMutation } from '@apollo/client'
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
import { Textarea } from '@/packages/components/ui/textarea'
import { Checkbox } from '@/packages/components/ui/checkbox'
import {
  AdminGetTeamTemplateByIdDocument,
  AdminCreateTeamTemplateDocument,
  AdminUpdateTeamTemplateDocument,
} from '@/packages/api/graphql/__generated__/output'
import { toast } from 'sonner'

interface TemplateEditorProps {
  templateId: string | null
  onClose: () => void
}

export function TemplateEditor({ templateId, onClose }: TemplateEditorProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [isPublic, setIsPublic] = useState(false)

  const { data, loading } = useQuery(AdminGetTeamTemplateByIdDocument, {
    variables: { id: templateId! },
    skip: !templateId,
    onCompleted: (data) => {
      const template = data.adminGetTeamTemplateById
      setName(template.name)
      setDescription(template.description || '')
      setIsPublic(template.isPublic)
    },
  })

  const [createTemplate, { loading: creating }] = useMutation(AdminCreateTeamTemplateDocument, {
    onCompleted: () => {
      toast.success('Шаблон создан')
      onClose()
    },
    onError: (error) => {
      toast.error(`Ошибка создания: ${error.message}`)
    },
  })

  const [updateTemplate, { loading: updating }] = useMutation(AdminUpdateTeamTemplateDocument, {
    onCompleted: () => {
      toast.success('Шаблон обновлён')
      onClose()
    },
    onError: (error) => {
      toast.error(`Ошибка обновления: ${error.message}`)
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim()) {
      toast.error('Введите название шаблона')
      return
    }

    const input: any = {
      name,
      description,
      isPublic,
      settings: {},
      roles: { roles: [] },
    }

    if (templateId) {
      updateTemplate({
        variables: {
          input: {
            id: templateId,
            ...input,
          },
        },
      })
    } else {
      createTemplate({
        variables: { input },
      })
    }
  }

  if (loading) {
    return (
      <Dialog open onOpenChange={onClose}>
        <DialogContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {templateId ? 'Редактировать шаблон' : 'Создать шаблон'}
          </DialogTitle>
          <DialogDescription>
            Настройте параметры шаблона команды
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Название *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Название шаблона"
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Описание</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Описание шаблона"
              rows={3}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="isPublic"
              checked={isPublic}
              onCheckedChange={(checked) => setIsPublic(checked as boolean)}
            />
            <Label htmlFor="isPublic" className="cursor-pointer">
              Публичный шаблон
            </Label>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Отмена
            </Button>
            <Button type="submit" disabled={creating || updating}>
              {creating || updating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Сохранение...
                </>
              ) : templateId ? (
                'Сохранить'
              ) : (
                'Создать'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
