'use client'

import { Checkbox } from '@/packages/components/ui/checkbox'
import { Avatar, AvatarFallback, AvatarImage } from '@/packages/components/ui/avatar'
import { Badge } from '@/packages/components/ui/badge'
import { Button } from '@/packages/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/packages/components/ui/table'
import { MoreHorizontal } from 'lucide-react'
import type { TeamMemberExtendedFieldsFragment } from '@/packages/api/graphql/__generated__/output'

interface MemberTableProps {
  members: TeamMemberExtendedFieldsFragment[]
  selectedIds: string[]
  onSelectionChange: (ids: string[]) => void
  onRefresh: () => void
}

export function MemberTable({ members, selectedIds, onSelectionChange }: MemberTableProps) {
  const toggleAll = () => {
    if (selectedIds.length === members.length) {
      onSelectionChange([])
    } else {
      onSelectionChange(members.map((m) => m.id))
    }
  }

  const toggleRow = (id: string) => {
    if (selectedIds.includes(id)) {
      onSelectionChange(selectedIds.filter((i) => i !== id))
    } else {
      onSelectionChange([...selectedIds, id])
    }
  }

  const getInitials = (name: string) => {
    return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <Checkbox
                checked={selectedIds.length === members.length && members.length > 0}
                onCheckedChange={toggleAll}
              />
            </TableHead>
            <TableHead>Участник</TableHead>
            <TableHead>Роль</TableHead>
            <TableHead>Должность</TableHead>
            <TableHead>Зарплата</TableHead>
            <TableHead className="text-right">Проекты</TableHead>
            <TableHead className="text-right">Часы</TableHead>
            <TableHead className="text-right">Задачи</TableHead>
            <TableHead>Присоединился</TableHead>
            <TableHead className="w-12"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {members.length === 0 ? (
            <TableRow>
              <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                Участники не найдены
              </TableCell>
            </TableRow>
          ) : (
            members.map((member) => (
              <TableRow key={member.id}>
                <TableCell>
                  <Checkbox
                    checked={selectedIds.includes(member.id)}
                    onCheckedChange={() => toggleRow(member.id)}
                  />
                </TableCell>
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
                  {member.position || <span className="text-muted-foreground">—</span>}
                </TableCell>
                <TableCell>
                  {member.salaryType === 'fixed' && member.salaryAmount ? (
                    <span>{new Intl.NumberFormat('ru-RU').format(member.salaryAmount)} ₽</span>
                  ) : member.salaryType === 'percentage' ? (
                    <span>{member.salaryAmount}%</span>
                  ) : (
                    <span className="text-muted-foreground">Не указана</span>
                  )}
                </TableCell>
                <TableCell className="text-right">{member.projectsCount}</TableCell>
                <TableCell className="text-right">{member.hoursLogged.toFixed(1)}</TableCell>
                <TableCell className="text-right">{member.tasksCount}</TableCell>
                <TableCell>
                  {new Date(member.joinedAt).toLocaleDateString('ru-RU')}
                </TableCell>
                <TableCell>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
