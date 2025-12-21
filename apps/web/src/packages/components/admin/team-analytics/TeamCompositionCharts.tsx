'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import { Progress } from '@/packages/components/ui/progress'
import type { TeamCompositionFieldsFragment } from '@/packages/api/graphql/__generated__/output'

interface TeamCompositionChartsProps {
  data: TeamCompositionFieldsFragment
}

const ROLE_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444']
const POSITION_COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316', '#84cc16']
const SALARY_COLORS = {
  fixed: '#22c55e',
  percentage: '#3b82f6',
  none: '#94a3b8',
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0,
  }).format(amount)
}

export function TeamCompositionCharts({ data }: TeamCompositionChartsProps) {
  const { byRole, byPosition, salaryDistribution, totalMembers } = data

  // Prepare pie chart data for roles
  const roleData = byRole.map((item, index) => ({
    name: item.role === 'OWNER' ? 'Владелец' : item.role === 'MEMBER' ? 'Участник' : item.role,
    value: item.count,
    color: ROLE_COLORS[index % ROLE_COLORS.length],
  }))

  // Prepare salary distribution data
  const salaryData = [
    { name: 'Фиксированная', value: salaryDistribution.fixed, color: SALARY_COLORS.fixed },
    { name: 'Процент', value: salaryDistribution.percentage, color: SALARY_COLORS.percentage },
    { name: 'Не указана', value: salaryDistribution.none, color: SALARY_COLORS.none },
  ].filter((item) => item.value > 0)

  const totalSalaryMembers = salaryDistribution.fixed + salaryDistribution.percentage + salaryDistribution.none

  return (
    <div className="space-y-6">
      {/* Roles Distribution */}
      <div>
        <h4 className="text-sm font-medium mb-3">Распределение по ролям</h4>
        <div className="h-[180px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={roleData}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={70}
                paddingAngle={2}
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}`}
                labelLine={false}
              >
                {roleData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number, name: string) => [`${value} чел.`, name]}
                contentStyle={{
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Positions Distribution */}
      <div>
        <h4 className="text-sm font-medium mb-3">Распределение по должностям</h4>
        <div className="space-y-2">
          {byPosition.slice(0, 6).map((item, index) => {
            const percentage = totalMembers > 0 ? Math.round((item.count / totalMembers) * 100) : 0
            return (
              <div key={item.position} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="truncate">{item.position}</span>
                  <span className="text-muted-foreground">{item.count} ({percentage}%)</span>
                </div>
                <Progress
                  value={percentage}
                  className="h-2"
                  style={{
                    // @ts-ignore
                    '--progress-background': POSITION_COLORS[index % POSITION_COLORS.length],
                  }}
                />
              </div>
            )
          })}
          {byPosition.length > 6 && (
            <p className="text-sm text-muted-foreground text-center">
              и ещё {byPosition.length - 6} должностей...
            </p>
          )}
        </div>
      </div>

      {/* Salary Distribution */}
      <div>
        <h4 className="text-sm font-medium mb-3">Тип оплаты</h4>
        <div className="grid grid-cols-3 gap-3">
          {salaryData.map((item) => {
            const percentage = totalSalaryMembers > 0
              ? Math.round((item.value / totalSalaryMembers) * 100)
              : 0
            return (
              <div
                key={item.name}
                className="text-center p-3 rounded-lg border"
                style={{ borderColor: item.color }}
              >
                <div
                  className="text-2xl font-bold"
                  style={{ color: item.color }}
                >
                  {item.value}
                </div>
                <div className="text-xs text-muted-foreground">{item.name}</div>
                <div className="text-xs text-muted-foreground">({percentage}%)</div>
              </div>
            )
          })}
        </div>
        {salaryDistribution.totalAmount > 0 && (
          <div className="mt-3 p-3 bg-muted rounded-lg text-center">
            <p className="text-sm text-muted-foreground">Общий ФОТ (фикс.)</p>
            <p className="text-lg font-semibold">
              {formatCurrency(salaryDistribution.totalAmount)}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
