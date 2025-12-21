'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import { Search, ArrowUpDown } from 'lucide-react'
import { Input } from '@/packages/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/packages/components/ui/avatar'
import { Badge } from '@/packages/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/packages/components/ui/table'
import type { MemberActivityFieldsFragment } from '@/packages/api/graphql/__generated__/output'

interface MemberActivityTableProps {
  members: MemberActivityFieldsFragment[]
}

type SortField = 'userName' | 'hoursLogged' | 'actionsCount' | 'projectsCount' | 'lastActiveAt'
type SortDirection = 'asc' | 'desc'

export function MemberActivityTable({ members }: MemberActivityTableProps) {
  const [search, setSearch] = useState('')
  const [sortField, setSortField] = useState<SortField>('hoursLogged')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')

  const filteredMembers = members
    .filter((member) => {
      const searchLower = search.toLowerCase()
      return (
        member.userName.toLowerCase().includes(searchLower) ||
        member.email?.toLowerCase().includes(searchLower) ||
        member.position?.toLowerCase().includes(searchLower)
      )
    })
    .sort((a, b) => {
      let aVal: string | number | Date = ''
      let bVal: string | number | Date = ''

      switch (sortField) {
        case 'userName':
          aVal = a.userName
          bVal = b.userName
          break
        case 'hoursLogged':
          aVal = a.hoursLogged
          bVal = b.hoursLogged
          break
        case 'actionsCount':
          aVal = a.actionsCount
          bVal = b.actionsCount
          break
        case 'projectsCount':
          aVal = a.projectsCount
          bVal = b.projectsCount
          break
        case 'lastActiveAt':
          aVal = a.lastActiveAt ? new Date(a.lastActiveAt).getTime() : 0
          bVal = b.lastActiveAt ? new Date(b.lastActiveAt).getTime() : 0
          break
      }

      if (typeof aVal === 'string') {
        return sortDirection === 'asc'
          ? aVal.localeCompare(bVal as string)
          : (bVal as string).localeCompare(aVal)
      }

      return sortDirection === 'asc'
        ? (aVal as number) - (bVal as number)
        : (bVal as number) - (aVal as number)
    })

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortField(field)
      setSortDirection('desc')
    }
  }

  const SortableHeader = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <TableHead
      className="cursor-pointer hover:bg-muted/50 select-none"
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center gap-1">
        {children}
        <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
      </div>
    </TableHead>
  )

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Поиск по имени, email или должности..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <SortableHeader field="userName">Участник</SortableHeader>
              <TableHead>Роль</TableHead>
              <TableHead>Должность</TableHead>
              <SortableHeader field="hoursLogged">Часы</SortableHeader>
              <SortableHeader field="actionsCount">Действия</SortableHeader>
              <SortableHeader field="projectsCount">Проекты</SortableHeader>
              <SortableHeader field="lastActiveAt">Последняя активность</SortableHeader>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredMembers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  {search ? 'Участники не найдены' : 'Нет данных об активности'}
                </TableCell>
              </TableRow>
            ) : (
              filteredMembers.map((member) => (
                <TableRow key={member.userId}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={member.avatarUrl || undefined} />
                        <AvatarFallback className="text-xs">
                          {getInitials(member.userName)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{member.userName}</p>
                        <p className="text-sm text-muted-foreground">{member.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={member.role === 'OWNER' ? 'default' : 'secondary'}>
                      {member.role === 'OWNER' ? 'Владелец' : 'Участник'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-muted-foreground">
                      {member.position || '—'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium">{member.hoursLogged}</span>
                    <span className="text-muted-foreground text-sm"> ч.</span>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium">{member.actionsCount}</span>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium">{member.projectsCount}</span>
                  </TableCell>
                  <TableCell>
                    {member.lastActiveAt ? (
                      <span className="text-muted-foreground">
                        {format(new Date(member.lastActiveAt), 'dd MMM yyyy', { locale: ru })}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {filteredMembers.length > 0 && (
        <p className="text-sm text-muted-foreground text-right">
          Показано {filteredMembers.length} из {members.length} участников
        </p>
      )}
    </div>
  )
}
