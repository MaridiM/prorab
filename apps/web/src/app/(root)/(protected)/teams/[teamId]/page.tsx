'use client'

import { useParams } from 'next/navigation'
import { useQuery } from '@apollo/client/react'
import { MyTeamsDocument } from '@/packages/api/graphql'
import { Loader2 } from 'lucide-react'

export default function TeamDashboardPage() {
  const params = useParams()
  const teamId = params.teamId as string

  const { data, loading, error } = useQuery(MyTeamsDocument)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-destructive">
          Ошибка загрузки команды: {error.message}
        </div>
      </div>
    )
  }

  const team = data?.myTeams.find(t => t.id === teamId)

  if (!team) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-muted-foreground">Команда не найдена</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">{team.name}</h1>
      <p className="text-muted-foreground">
        Добро пожаловать в вашу команду! Здесь будет дашборд.
      </p>
    </div>
  )
}
