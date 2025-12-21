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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/packages/components/ui/select'
import {
  AdminGetAnnouncementByIdDocument,
  AdminCreateAnnouncementDocument,
  AdminUpdateAnnouncementDocument,
} from '@/packages/api/graphql/__generated__/output'
import { toast } from 'sonner'

interface AnnouncementFormDialogProps {
  announcementId: string | null
  onClose: () => void
}

export function AnnouncementFormDialog({ announcementId, onClose }: AnnouncementFormDialogProps) {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [priority, setPriority] = useState<'LOW' | 'NORMAL' | 'HIGH' | 'URGENT'>('NORMAL')
  const [type, setType] = useState<'INFO' | 'WARNING' | 'SUCCESS' | 'ERROR' | 'MAINTENANCE'>('INFO')
  const [isPinned, setIsPinned] = useState(false)
  const [publishNow, setPublishNow] = useState(false)
  const [expiresAt, setExpiresAt] = useState('')

  // Fetch existing announcement if editing
  const { data, loading } = useQuery(AdminGetAnnouncementByIdDocument, {
    variables: { id: announcementId! },
    skip: !announcementId,
    onCompleted: (data) => {
      const announcement = data.adminGetAnnouncementById
      setTitle(announcement.title)
      setContent(announcement.content)
      setPriority(announcement.priority as any)
      setType(announcement.type as any)
      setIsPinned(announcement.isPinned)
      if (announcement.expiresAt) {
        setExpiresAt(new Date(announcement.expiresAt).toISOString().split('T')[0])
      }
    },
  })

  // Create mutation
  const [createAnnouncement, { loading: creating }] = useMutation(AdminCreateAnnouncementDocument, {
    onCompleted: () => {
      toast.success('Объявление создано')
      onClose()
    },
    onError: (error) => {
      toast.error(`Ошибка создания: ${error.message}`)
    },
  })

  // Update mutation
  const [updateAnnouncement, { loading: updating }] = useMutation(AdminUpdateAnnouncementDocument, {
    onCompleted: () => {
      toast.success('Объявление обновлено')
      onClose()
    },
    onError: (error) => {
      toast.error(`Ошибка обновления: ${error.message}`)
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim() || !content.trim()) {
      toast.error('Заполните все обязательные поля')
      return
    }

    const input: any = {
      title,
      content,
      priority,
      type,
      isPinned,
      expiresAt: expiresAt ? new Date(expiresAt).toISOString() : null,
    }

    if (announcementId) {
      updateAnnouncement({
        variables: {
          input: {
            id: announcementId,
            ...input,
          },
        },
      })
    } else {
      createAnnouncement({
        variables: {
          input: {
            ...input,
            publishNow,
          },
        },
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
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {announcementId ? 'Редактировать объявление' : 'Создать объявление'}
          </DialogTitle>
          <DialogDescription>
            {announcementId
              ? 'Внесите изменения в объявление'
              : 'Создайте новое объявление для команды или глобальное'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Заголовок *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Введите заголовок объявления"
              maxLength={200}
              required
            />
          </div>

          <div>
            <Label htmlFor="content">Содержание *</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Введите текст объявления"
              rows={6}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="priority">Приоритет</Label>
              <Select value={priority} onValueChange={(value: any) => setPriority(value)}>
                <SelectTrigger id="priority">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LOW">Низкий</SelectItem>
                  <SelectItem value="NORMAL">Обычный</SelectItem>
                  <SelectItem value="HIGH">Высокий</SelectItem>
                  <SelectItem value="URGENT">Срочно</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="type">Тип</Label>
              <Select value={type} onValueChange={(value: any) => setType(value)}>
                <SelectTrigger id="type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="INFO">Информация</SelectItem>
                  <SelectItem value="WARNING">Предупреждение</SelectItem>
                  <SelectItem value="SUCCESS">Успех</SelectItem>
                  <SelectItem value="ERROR">Ошибка</SelectItem>
                  <SelectItem value="MAINTENANCE">Обслуживание</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="expiresAt">Дата истечения (необязательно)</Label>
            <Input
              id="expiresAt"
              type="date"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="isPinned"
              checked={isPinned}
              onCheckedChange={(checked) => setIsPinned(checked as boolean)}
            />
            <Label htmlFor="isPinned" className="cursor-pointer">
              Закрепить объявление
            </Label>
          </div>

          {!announcementId && (
            <div className="flex items-center space-x-2">
              <Checkbox
                id="publishNow"
                checked={publishNow}
                onCheckedChange={(checked) => setPublishNow(checked as boolean)}
              />
              <Label htmlFor="publishNow" className="cursor-pointer">
                Опубликовать сразу
              </Label>
            </div>
          )}

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
              ) : announcementId ? (
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
