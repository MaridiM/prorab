'use client'

import { Search } from 'lucide-react'
import { Input } from '@/packages/components/ui/input'
import { Label } from '@/packages/components/ui/label'
import { Card, CardContent } from '@/packages/components/ui/card'
import type { MemberFilterInput } from '@/packages/api/graphql/__generated__/output'

interface MemberFiltersProps {
  filter: MemberFilterInput
  onChange: (filter: MemberFilterInput) => void
}

export function MemberFilters({ filter, onChange }: MemberFiltersProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Поиск</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Имя, email, должность..."
                value={filter.search || ''}
                onChange={(e) => onChange({ ...filter, search: e.target.value })}
                className="pl-10"
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
