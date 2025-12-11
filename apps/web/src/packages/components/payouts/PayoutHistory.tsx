"use client"

import { formatDistanceToNow } from 'date-fns'
import { ru } from 'date-fns/locale'
import { Calendar, CheckCircle2, Clock } from 'lucide-react'

import { Card, Badge } from '@/packages/components'
import { MemberSalaryBadge } from './MemberSalaryBadge'

interface PayoutHistoryItem {
  id: string
  projectName: string
  memberName: string
  salaryType: 'FIXED' | 'PERCENTAGE' | 'NONE'
  salaryAmount?: number | null
  calculatedAmount: number
  actualAmount?: number | null
  status: 'PENDING' | 'PAID'
  paidAt?: Date | null
  createdAt: Date
  notes?: string | null
}

interface PayoutHistoryProps {
  payouts: PayoutHistoryItem[]
  emptyMessage?: string
}

export function PayoutHistory({ payouts, emptyMessage = 'Нет истории выплат' }: PayoutHistoryProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const formatDate = (date: Date) => {
    return formatDistanceToNow(new Date(date), { addSuffix: true, locale: ru })
  }

  if (payouts.length === 0) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        <p>{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {payouts.map((payout) => (
        <Card key={payout.id} className="p-4 hover:shadow-md transition-shadow">
          <div className="space-y-3">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="font-medium">{payout.memberName}</p>
                <p className="text-sm text-muted-foreground">{payout.projectName}</p>
              </div>
              <div className="text-right space-y-1">
                <p className="text-xl font-bold text-foreground">
                  {formatCurrency(payout.actualAmount || payout.calculatedAmount)}
                </p>
                {payout.actualAmount && payout.actualAmount !== payout.calculatedAmount && (
                  <p className="text-xs text-muted-foreground line-through">
                    {formatCurrency(payout.calculatedAmount)}
                  </p>
                )}
              </div>
            </div>

            {/* Badges */}
            <div className="flex flex-wrap items-center gap-2">
              <MemberSalaryBadge
                salaryType={payout.salaryType}
                salaryAmount={payout.salaryAmount}
              />
              {payout.status === 'PAID' ? (
                <Badge variant="success" className="flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Выплачено
                </Badge>
              ) : (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Ожидает
                </Badge>
              )}
            </div>

            {/* Date */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Calendar className="w-3 h-3" />
              {payout.status === 'PAID' && payout.paidAt ? (
                <span>Выплачено {formatDate(payout.paidAt)}</span>
              ) : (
                <span>Создано {formatDate(payout.createdAt)}</span>
              )}
            </div>

            {/* Notes */}
            {payout.notes && (
              <p className="text-sm text-muted-foreground bg-secondary/30 p-2 rounded-lg">
                {payout.notes}
              </p>
            )}
          </div>
        </Card>
      ))}
    </div>
  )
}
