"use client"

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  DollarSign,
  TrendingDown,
  TrendingUp,
  Users,
  Calculator,
  Copy,
  Check,
  Loader2,
  AlertCircle
} from 'lucide-react'

import { Button, Card } from '@/packages/components'
import { MemberSalaryBadge } from './MemberSalaryBadge'

interface MemberPayoutDetail {
  memberId: string
  memberName: string
  salaryType: 'FIXED' | 'PERCENTAGE' | 'NONE'
  salaryAmount?: number | null
  calculatedPayout: number
  status: string
}

interface PayoutSummary {
  projectId: string
  projectName: string
  budget: number
  totalExpenses: number
  netProfit: number
  totalPayouts: number
  ownerProfit: number
  members: MemberPayoutDetail[]
}

interface PayoutCalculatorProps {
  summary: PayoutSummary
  onClose: (projectId: string) => Promise<void>
  isLoading?: boolean
}

export function PayoutCalculator({ summary, onClose, isLoading = false }: PayoutCalculatorProps) {
  const [copied, setCopied] = useState(false)
  const [isClosing, setIsClosing] = useState(false)

  const handleCopyToClipboard = () => {
    const text = formatPayoutText(summary)
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleClose = async () => {
    setIsClosing(true)
    try {
      await onClose(summary.projectId)
    } catch (error) {
      console.error('Failed to close project:', error)
      setIsClosing(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const formatPayoutText = (data: PayoutSummary) => {
    let text = `Объект "${data.projectName}" закрыт\n\n`

    const payingMembers = data.members.filter(m => m.calculatedPayout > 0)

    if (payingMembers.length > 0) {
      payingMembers.forEach(member => {
        const percent = member.salaryType === 'PERCENTAGE' ? ` (${member.salaryAmount}%)` : ''
        text += `${member.memberName}${percent}: ${formatCurrency(member.calculatedPayout)}\n`
      })
      text += `\n`
      text += `Итого на бригаду: ${formatCurrency(data.totalPayouts)}\n`
    }

    text += `Моя прибыль: ${formatCurrency(data.ownerProfit)}\n`

    return text
  }

  const payingMembers = summary.members.filter(m => m.calculatedPayout > 0)

  return (
    <div className="space-y-6">
      {/* Project Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">{summary.projectName}</h2>
        <p className="text-sm text-muted-foreground">Расчёт зарплаты при закрытии проекта</p>
      </div>

      {/* Financial Summary */}
      <Card className="p-6 space-y-4 bg-gradient-to-br from-secondary/20 to-background">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <DollarSign className="w-3 h-3" />
              Бюджет
            </p>
            <p className="text-lg font-semibold">{formatCurrency(summary.budget)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <TrendingDown className="w-3 h-3" />
              Расходы
            </p>
            <p className="text-lg font-semibold text-destructive">
              {formatCurrency(summary.totalExpenses)}
            </p>
          </div>
        </div>

        <div className="pt-4 border-t">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <Calculator className="w-4 h-4" />
              Чистая прибыль
            </p>
            <p className="text-3xl font-bold text-success">
              {formatCurrency(summary.netProfit)}
            </p>
          </div>
        </div>
      </Card>

      {/* Members Payouts */}
      {payingMembers.length > 0 && (
        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b">
            <Users className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">Зарплата бригаде</h3>
          </div>

          <div className="space-y-3">
            {payingMembers.map((member) => (
              <motion.div
                key={member.memberId}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between p-3 rounded-xl bg-secondary/30"
              >
                <div className="space-y-1">
                  <p className="font-medium">{member.memberName}</p>
                  <div className="flex items-center gap-2">
                    <MemberSalaryBadge
                      salaryType={member.salaryType}
                      salaryAmount={member.salaryAmount}
                    />
                    {member.salaryType === 'PERCENTAGE' && member.salaryAmount && (
                      <span className="text-xs text-muted-foreground">
                        {member.salaryAmount}% от {formatCurrency(summary.netProfit)}
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-primary">
                    {formatCurrency(member.calculatedPayout)}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="pt-3 border-t">
            <div className="flex items-center justify-between">
              <p className="font-semibold">Итого на бригаду:</p>
              <p className="text-2xl font-bold text-primary">
                {formatCurrency(summary.totalPayouts)}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Owner Profit */}
      <Card className="p-6 bg-gradient-to-br from-success/10 to-background border-success/20">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Чистая прибыль владельца
            </p>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(summary.netProfit)} - {formatCurrency(summary.totalPayouts)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-4xl font-bold text-success">
              {formatCurrency(summary.ownerProfit)}
            </p>
          </div>
        </div>
      </Card>

      {/* Warning */}
      {summary.ownerProfit < 0 && (
        <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-destructive mt-0.5" />
          <div className="space-y-1">
            <p className="text-sm font-medium text-destructive">Убыток проекта</p>
            <p className="text-xs text-muted-foreground">
              Расходы превышают бюджет. Рассмотрите пересмотр выплат или бюджета.
            </p>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="space-y-3 pt-4">
        <Button
          onClick={handleCopyToClipboard}
          variant="outline"
          className="w-full h-12 rounded-xl"
          disabled={isClosing}
        >
          <AnimatePresence mode="wait">
            {copied ? (
              <motion.div
                key="check"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="flex items-center gap-2"
              >
                <Check className="w-4 h-4" />
                Скопировано!
              </motion.div>
            ) : (
              <motion.div
                key="copy"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="flex items-center gap-2"
              >
                <Copy className="w-4 h-4" />
                Скопировать расчёт
              </motion.div>
            )}
          </AnimatePresence>
        </Button>

        <Button
          onClick={handleClose}
          disabled={isClosing}
          className="w-full h-12 rounded-xl bg-success hover:bg-success/90"
        >
          {isClosing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Закрытие проекта...
            </>
          ) : (
            'Закрыть проект и зафиксировать расчёт'
          )}
        </Button>

        <p className="text-xs text-center text-muted-foreground">
          После закрытия проект будет переведён в архив
        </p>
      </div>
    </div>
  )
}
