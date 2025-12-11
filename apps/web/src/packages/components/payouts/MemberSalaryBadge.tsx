import { Badge } from '@/packages/components/ui/badge'
import { Banknote, Percent, MinusCircle } from 'lucide-react'

interface MemberSalaryBadgeProps {
  salaryType: 'FIXED' | 'PERCENTAGE' | 'NONE'
  salaryAmount?: number | null
  className?: string
}

export function MemberSalaryBadge({ salaryType, salaryAmount, className }: MemberSalaryBadgeProps) {
  const getVariant = () => {
    switch (salaryType) {
      case 'FIXED':
        return 'default'
      case 'PERCENTAGE':
        return 'success'
      case 'NONE':
        return 'secondary'
      default:
        return 'secondary'
    }
  }

  const getIcon = () => {
    switch (salaryType) {
      case 'FIXED':
        return <Banknote className="w-3 h-3" />
      case 'PERCENTAGE':
        return <Percent className="w-3 h-3" />
      case 'NONE':
        return <MinusCircle className="w-3 h-3" />
      default:
        return null
    }
  }

  const getLabel = () => {
    switch (salaryType) {
      case 'FIXED':
        return 'Фикс'
      case 'PERCENTAGE':
        return salaryAmount ? `${salaryAmount}%` : 'Процент'
      case 'NONE':
        return 'Нет'
      default:
        return 'Не задано'
    }
  }

  return (
    <Badge variant={getVariant()} className={`flex items-center gap-1 ${className || ''}`}>
      {getIcon()}
      <span>{getLabel()}</span>
    </Badge>
  )
}
