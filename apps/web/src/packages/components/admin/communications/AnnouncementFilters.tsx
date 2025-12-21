'use client'

import { Card, CardContent } from '@/packages/components/ui/card'
import { Label } from '@/packages/components/ui/label'
import { Checkbox } from '@/packages/components/ui/checkbox'
import type { AnnouncementFilterInput } from '@/packages/api/graphql/__generated__/output'

interface AnnouncementFiltersProps {
  filter: AnnouncementFilterInput
  onChange: (filter: AnnouncementFilterInput) => void
}

export function AnnouncementFilters({ filter, onChange }: AnnouncementFiltersProps) {
  const togglePublished = () => {
    onChange({ ...filter, publishedOnly: !filter.publishedOnly })
  }

  const togglePinned = () => {
    onChange({ ...filter, pinnedOnly: !filter.pinnedOnly })
  }

  const toggleActive = () => {
    onChange({ ...filter, activeOnly: !filter.activeOnly })
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="publishedOnly"
              checked={filter.publishedOnly || false}
              onCheckedChange={togglePublished}
            />
            <Label htmlFor="publishedOnly" className="cursor-pointer">
              Только опубликованные
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="pinnedOnly"
              checked={filter.pinnedOnly || false}
              onCheckedChange={togglePinned}
            />
            <Label htmlFor="pinnedOnly" className="cursor-pointer">
              Только закрепленные
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="activeOnly"
              checked={filter.activeOnly || false}
              onCheckedChange={toggleActive}
            />
            <Label htmlFor="activeOnly" className="cursor-pointer">
              Только активные
            </Label>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
