'use client'

import { useState } from 'react'
import { useMutation } from '@apollo/client/react'
import { Plus, Edit, Trash2, Globe, Lock } from 'lucide-react'
import { Button } from '@/packages/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/packages/components/ui/card'
import { Badge } from '@/packages/components/ui/badge'
import {
  AdminDeleteTeamTemplateDocument,
  type TeamTemplateFieldsFragment,
} from '@/packages/api/graphql/__generated__/output'
import { TemplateEditor } from './TemplateEditor'
import { toast } from 'sonner'

interface TemplateGalleryProps {
  templates: TeamTemplateFieldsFragment[]
  onRefresh: () => void
}

export function TemplateGallery({ templates, onRefresh }: TemplateGalleryProps) {
  const [showEditor, setShowEditor] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  const [deleteTemplate, { loading: deleting }] = useMutation(AdminDeleteTeamTemplateDocument, {
    onCompleted: () => {
      toast.success('Шаблон удалён')
      onRefresh()
    },
    onError: (error) => {
      toast.error(`Ошибка удаления: ${error.message}`)
    },
  })

  const handleDelete = (id: string) => {
    if (!confirm('Удалить этот шаблон?')) return
    deleteTemplate({ variables: { id } })
  }

  const handleEdit = (id: string) => {
    setEditingId(id)
    setShowEditor(true)
  }

  const handleCreate = () => {
    setEditingId(null)
    setShowEditor(true)
  }

  const handleEditorClose = () => {
    setShowEditor(false)
    setEditingId(null)
    onRefresh()
  }

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Шаблоны команд</h2>
        <Button onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Создать шаблон
        </Button>
      </div>

      {templates.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Шаблоны не найдены</p>
            <Button className="mt-4" onClick={handleCreate}>
              <Plus className="h-4 w-4 mr-2" />
              Создать первый шаблон
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map((template) => (
            <Card key={template.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    <CardDescription className="mt-1">
                      {template.description || 'Без описания'}
                    </CardDescription>
                  </div>
                  {template.isPublic ? (
                    <Badge variant="default">
                      <Globe className="h-3 w-3 mr-1" />
                      Публичный
                    </Badge>
                  ) : (
                    <Badge variant="secondary">
                      <Lock className="h-3 w-3 mr-1" />
                      Приватный
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground mb-4">
                  <div>Автор: {template.createdByName}</div>
                  <div>Создан: {new Date(template.createdAt).toLocaleDateString('ru-RU')}</div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleEdit(template.id)}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Редактировать
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(template.id)}
                    disabled={deleting}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {showEditor && (
        <TemplateEditor
          templateId={editingId}
          onClose={handleEditorClose}
        />
      )}
    </>
  )
}
