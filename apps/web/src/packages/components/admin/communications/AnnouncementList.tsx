'use client'

import { Badge } from '@/packages/components/ui/badge'
import { Button } from '@/packages/components/ui/button'
import { Card, CardContent, CardHeader } from '@/packages/components/ui/card'
import { Pin, Eye, EyeOff, Edit, Trash2, Calendar } from 'lucide-react'
import type { TeamAnnouncementFieldsFragment } from '@/packages/api/graphql/__generated__/output'

interface AnnouncementListProps {
  announcements: TeamAnnouncementFieldsFragment[]
  onEdit: (id: string) => void
  onDelete: (id: string) => void
  onPublish: (id: string) => void
  onUnpublish: (id: string) => void
}

export function AnnouncementList({
  announcements,
  onEdit,
  onDelete,
  onPublish,
  onUnpublish,
}: AnnouncementListProps) {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT':
        return 'destructive'
      case 'HIGH':
        return 'default'
      case 'NORMAL':
        return 'secondary'
      case 'LOW':
        return 'outline'
      default:
        return 'secondary'
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'ERROR':
        return 'destructive'
      case 'WARNING':
        return 'default'
      case 'SUCCESS':
        return 'secondary'
      case 'INFO':
        return 'outline'
      case 'MAINTENANCE':
        return 'secondary'
      default:
        return 'outline'
    }
  }

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'URGENT':
        return 'Срочно'
      case 'HIGH':
        return 'Высокий'
      case 'NORMAL':
        return 'Обычный'
      case 'LOW':
        return 'Низкий'
      default:
        return priority
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'ERROR':
        return 'Ошибка'
      case 'WARNING':
        return 'Предупреждение'
      case 'SUCCESS':
        return 'Успех'
      case 'INFO':
        return 'Информация'
      case 'MAINTENANCE':
        return 'Обслуживание'
      default:
        return type
    }
  }

  if (announcements.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">Объявления не найдены</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {announcements.map((announcement) => (
        <Card key={announcement.id} className={announcement.isExpired ? 'opacity-60' : ''}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  {announcement.isPinned && (
                    <Pin className="h-4 w-4 text-primary" />
                  )}
                  <h3 className="text-lg font-semibold">{announcement.title}</h3>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant={getPriorityColor(announcement.priority)}>
                    {getPriorityLabel(announcement.priority)}
                  </Badge>
                  <Badge variant={getTypeColor(announcement.type)}>
                    {getTypeLabel(announcement.type)}
                  </Badge>
                  {announcement.isPublished ? (
                    <Badge variant="secondary">Опубликовано</Badge>
                  ) : (
                    <Badge variant="outline">Черновик</Badge>
                  )}
                  {announcement.isExpired && (
                    <Badge variant="destructive">Истекло</Badge>
                  )}
                  {announcement.teamId ? (
                    <Badge variant="outline">Команда</Badge>
                  ) : (
                    <Badge variant="default">Глобальное</Badge>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                {!announcement.isPublished ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPublish(announcement.id)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Опубликовать
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onUnpublish(announcement.id)}
                  >
                    <EyeOff className="h-4 w-4 mr-2" />
                    Снять
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(announcement.id)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => onDelete(announcement.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4 whitespace-pre-wrap">
              {announcement.content}
            </p>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                Создано: {new Date(announcement.createdAt).toLocaleDateString('ru-RU')}
              </div>
              {announcement.publishedAt && (
                <div>
                  Опубликовано: {new Date(announcement.publishedAt).toLocaleDateString('ru-RU')}
                </div>
              )}
              {announcement.expiresAt && (
                <div>
                  Истекает: {new Date(announcement.expiresAt).toLocaleDateString('ru-RU')}
                </div>
              )}
              {announcement.totalMembers > 0 && (
                <div>
                  Прочитали: {announcement.readCount} / {announcement.totalMembers}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
