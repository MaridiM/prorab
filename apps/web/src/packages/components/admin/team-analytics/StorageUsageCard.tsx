'use client'

import { HardDrive, FolderOpen } from 'lucide-react'
import { Progress } from '@/packages/components/ui/progress'
import type { TeamStorageUsageFieldsFragment } from '@/packages/api/graphql/__generated__/output'

interface StorageUsageCardProps {
  data: TeamStorageUsageFieldsFragment
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Б'

  const k = 1024
  const sizes = ['Б', 'КБ', 'МБ', 'ГБ', 'ТБ']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export function StorageUsageCard({ data }: StorageUsageCardProps) {
  const { totalBytes, usedBytes, usedPercentage, usedGB, byProject } = data

  const getProgressColor = (percentage: number): string => {
    if (percentage >= 90) return 'bg-red-500'
    if (percentage >= 70) return 'bg-amber-500'
    return 'bg-green-500'
  }

  return (
    <div className="space-y-6">
      {/* Overall Usage */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HardDrive className="h-5 w-5 text-muted-foreground" />
            <span className="font-medium">Общее использование</span>
          </div>
          <span className="text-2xl font-bold">{usedGB} ГБ</span>
        </div>
        <Progress
          value={usedPercentage}
          className={`h-3 ${getProgressColor(usedPercentage)}`}
        />
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Использовано: {formatBytes(usedBytes)}</span>
          <span>Лимит: {formatBytes(totalBytes)}</span>
        </div>
        <div className="text-center">
          <span className={`text-lg font-semibold ${
            usedPercentage >= 90
              ? 'text-red-500'
              : usedPercentage >= 70
                ? 'text-amber-500'
                : 'text-green-500'
          }`}>
            {usedPercentage}%
          </span>
          <span className="text-muted-foreground text-sm ml-1">использовано</span>
        </div>
      </div>

      {/* Projects Breakdown */}
      <div>
        <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
          <FolderOpen className="h-4 w-4" />
          Использование по проектам
        </h4>
        {byProject.length === 0 ? (
          <p className="text-center text-muted-foreground py-4">
            Нет данных о проектах
          </p>
        ) : (
          <div className="space-y-3">
            {byProject.slice(0, 5).map((project) => (
              <div key={project.projectId} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="truncate flex-1 mr-2">{project.projectName}</span>
                  <span className="text-muted-foreground whitespace-nowrap">
                    {formatBytes(project.usedBytes)} ({project.filesCount} файлов)
                  </span>
                </div>
                <Progress value={project.percentage} className="h-1.5" />
              </div>
            ))}
            {byProject.length > 5 && (
              <p className="text-sm text-muted-foreground text-center pt-2">
                и ещё {byProject.length - 5} проектов...
              </p>
            )}
          </div>
        )}
      </div>

      {/* Storage Tips */}
      {usedPercentage >= 70 && (
        <div className={`p-3 rounded-lg ${
          usedPercentage >= 90 ? 'bg-red-50 dark:bg-red-950/30' : 'bg-amber-50 dark:bg-amber-950/30'
        }`}>
          <p className={`text-sm ${
            usedPercentage >= 90 ? 'text-red-600 dark:text-red-400' : 'text-amber-600 dark:text-amber-400'
          }`}>
            {usedPercentage >= 90
              ? 'Критический уровень! Рекомендуется очистить хранилище или обновить план.'
              : 'Хранилище заполняется. Рассмотрите возможность очистки старых файлов.'}
          </p>
        </div>
      )}
    </div>
  )
}
