'use client'

import { useState } from 'react'
import { useQuery, useMutation } from '@apollo/client/react'
import { Loader2, Plus, Filter, BarChart3 } from 'lucide-react'
import { Button } from '@/packages/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/packages/components/ui/card'
import {
  AdminGetAnnouncementsDocument,
  AdminGetAnnouncementStatisticsDocument,
  AdminDeleteAnnouncementDocument,
  AdminPublishAnnouncementDocument,
  AdminUnpublishAnnouncementDocument,
  AnnouncementFilterInput,
} from '@/packages/api/graphql/__generated__/output'
import { AnnouncementList } from '@/packages/components/admin/communications/AnnouncementList'
import { AnnouncementFilters } from '@/packages/components/admin/communications/AnnouncementFilters'
import { AnnouncementFormDialog } from '@/packages/components/admin/communications/AnnouncementFormDialog'
import { toast } from 'sonner'

export default function CommunicationsPage() {
  const [filter, setFilter] = useState<AnnouncementFilterInput>({})
  const [showFilters, setShowFilters] = useState(false)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  // Fetch announcements
  const {
    data: announcementsData,
    loading: announcementsLoading,
    error: announcementsError,
    refetch: refetchAnnouncements,
  } = useQuery(AdminGetAnnouncementsDocument, {
    variables: { filter },
  })

  // Fetch statistics
  const { data: statsData, loading: statsLoading } = useQuery(AdminGetAnnouncementStatisticsDocument, {
    variables: {},
  })

  // Delete mutation
  const [deleteAnnouncement, { loading: deleting }] = useMutation(AdminDeleteAnnouncementDocument, {
    onCompleted: () => {
      toast.success('Объявление удалено')
      refetchAnnouncements()
    },
    onError: (error) => {
      toast.error(`Ошибка удаления: ${error.message}`)
    },
  })

  // Publish mutation
  const [publishAnnouncement] = useMutation(AdminPublishAnnouncementDocument, {
    onCompleted: () => {
      toast.success('Объявление опубликовано')
      refetchAnnouncements()
    },
    onError: (error) => {
      toast.error(`Ошибка публикации: ${error.message}`)
    },
  })

  // Unpublish mutation
  const [unpublishAnnouncement] = useMutation(AdminUnpublishAnnouncementDocument, {
    onCompleted: () => {
      toast.success('Объявление снято с публикации')
      refetchAnnouncements()
    },
    onError: (error) => {
      toast.error(`Ошибка: ${error.message}`)
    },
  })

  const handleDelete = (id: string) => {
    if (!confirm('Удалить это объявление?')) return
    deleteAnnouncement({ variables: { id } })
  }

  const handlePublish = (id: string) => {
    publishAnnouncement({ variables: { id } })
  }

  const handleUnpublish = (id: string) => {
    unpublishAnnouncement({ variables: { id } })
  }

  const handleEdit = (id: string) => {
    setEditingId(id)
    setShowCreateDialog(true)
  }

  const handleDialogClose = () => {
    setShowCreateDialog(false)
    setEditingId(null)
    refetchAnnouncements()
  }

  if (announcementsLoading || statsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (announcementsError) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-destructive">Ошибка загрузки</CardTitle>
            <CardDescription>{announcementsError.message}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  const announcements = announcementsData?.adminGetAnnouncements || []
  const stats = statsData?.adminGetAnnouncementStatistics

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Управление объявлениями</h1>
          <p className="text-muted-foreground mt-1">
            Создание и управление объявлениями для команд
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4 mr-2" />
            Фильтры
          </Button>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Создать объявление
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Всего объявлений</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">
                {stats.published} опубликовано
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Черновики</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.drafts}</div>
              <p className="text-xs text-muted-foreground">
                Не опубликовано
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Закреплено</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pinned}</div>
              <p className="text-xs text-muted-foreground">
                На верху списка
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Истекло</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.expired}</div>
              <p className="text-xs text-muted-foreground">
                Требуют обновления
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      {showFilters && (
        <AnnouncementFilters filter={filter} onChange={setFilter} />
      )}

      {/* Announcements List */}
      <AnnouncementList
        announcements={announcements}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onPublish={handlePublish}
        onUnpublish={handleUnpublish}
      />

      {/* Create/Edit Dialog */}
      {showCreateDialog && (
        <AnnouncementFormDialog
          announcementId={editingId}
          onClose={handleDialogClose}
        />
      )}
    </div>
  )
}
