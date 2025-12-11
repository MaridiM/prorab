"use client"

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, User as UserIcon, Banknote, Percent } from 'lucide-react'

import {
  Button,
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/packages/components'
import { updateMemberSalarySchema, type UpdateMemberSalaryInput } from '@/packages/schemas'

interface SalarySettingsFormProps {
  memberId: string
  memberName: string
  currentSalaryType?: 'FIXED' | 'PERCENTAGE' | 'NONE'
  currentSalaryAmount?: number | null
  onSubmit: (data: UpdateMemberSalaryInput) => Promise<void>
  onCancel?: () => void
  isLoading?: boolean
}

export function SalarySettingsForm({
  memberId,
  memberName,
  currentSalaryType = 'NONE',
  currentSalaryAmount,
  onSubmit,
  onCancel,
  isLoading = false
}: SalarySettingsFormProps) {
  const form = useForm<UpdateMemberSalaryInput>({
    resolver: zodResolver(updateMemberSalarySchema),
    defaultValues: {
      memberId,
      salaryType: currentSalaryType,
      salaryAmount: currentSalaryAmount || undefined
    },
    mode: 'onChange'
  })

  const watchSalaryType = form.watch('salaryType')

  const handleSubmit = async (data: UpdateMemberSalaryInput) => {
    try {
      await onSubmit(data)
    } catch (error) {
      console.error('Failed to update salary:', error)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Member Name Display */}
        <div className="flex items-center gap-3 p-4 rounded-xl bg-secondary/30">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
            <UserIcon className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">{memberName}</p>
            <p className="text-xs text-muted-foreground">Настройка зарплаты</p>
          </div>
        </div>

        {/* Salary Type */}
        <FormField
          control={form.control}
          name="salaryType"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium">Тип зарплаты</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="h-12 rounded-xl">
                    <SelectValue placeholder="Выберите тип зарплаты" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="NONE">
                    <div className="flex items-center gap-2">
                      <span>Нет</span>
                      <span className="text-xs text-muted-foreground">(не получает зарплату)</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="FIXED">
                    <div className="flex items-center gap-2">
                      <Banknote className="w-4 h-4" />
                      <span>Фиксированная</span>
                      <span className="text-xs text-muted-foreground">(уже учтена в расходах)</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="PERCENTAGE">
                    <div className="flex items-center gap-2">
                      <Percent className="w-4 h-4" />
                      <span>Процент от прибыли</span>
                      <span className="text-xs text-muted-foreground">(расчёт при закрытии)</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <FormDescription className="text-xs">
                {watchSalaryType === 'FIXED' && 'Зарплата уже выплачена и учтена в расходах проекта'}
                {watchSalaryType === 'PERCENTAGE' && 'Зарплата будет рассчитана от чистой прибыли при закрытии проекта'}
                {watchSalaryType === 'NONE' && 'Участник не получает зарплату (владелец получит остаток)'}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Salary Amount (only for PERCENTAGE) */}
        {watchSalaryType === 'PERCENTAGE' && (
          <FormField
            control={form.control}
            name="salaryAmount"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium flex items-center gap-2">
                  <Percent className="w-4 h-4" />
                  Процент от прибыли
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type="number"
                      placeholder="0"
                      min={0}
                      max={100}
                      step={0.1}
                      disabled={isLoading}
                      className="h-12 px-4 pr-10 rounded-xl bg-secondary/30"
                      {...field}
                      value={field.value || ''}
                      onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                      %
                    </div>
                  </div>
                </FormControl>
                <FormDescription className="text-xs">
                  Укажите процент от чистой прибыли (0-100%)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {/* Info box for FIXED */}
        {watchSalaryType === 'FIXED' && (
          <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
            <p className="text-sm text-foreground">
              💡 <strong>Совет:</strong> Добавьте фиксированную зарплату как расход в категорию "Работа бригады"
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          {onCancel && (
            <Button
              type="button"
              onClick={onCancel}
              variant="outline"
              disabled={isLoading}
              className="flex-1 h-12 rounded-xl"
            >
              Отмена
            </Button>
          )}
          <Button
            type="submit"
            disabled={isLoading || !form.formState.isValid}
            className="flex-1 h-12 rounded-xl"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Сохранение...
              </>
            ) : (
              'Сохранить'
            )}
          </Button>
        </div>
      </form>
    </Form>
  )
}
