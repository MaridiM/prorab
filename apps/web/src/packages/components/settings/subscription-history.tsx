'use client';

import { useState, useCallback } from 'react';
import { useQuery, useMutation } from '@apollo/client/react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale/ru';
import { motion } from 'framer-motion';
import { Calendar, Check, Clock, Crown, Zap, XCircle, RefreshCw, Loader2, ChevronDown } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/packages/ui';
import { Badge } from '@/packages/components/ui/badge';
import { Button } from '@/packages/components/ui/button';
import { MySubscriptionHistoryFromPaymentsDocument, MySubscriptionDocument, InitializePaymentDocument } from '@/packages/api/graphql/__generated__/output';
import { useToast } from '@/packages/hooks';

const statusConfig = {
  ACTIVE: {
    label: 'Активна',
    color: 'bg-green-500/10 text-green-700 border-green-500/20',
    icon: Check,
  },
  TRIALING: {
    label: 'Пробный период',
    color: 'bg-blue-500/10 text-blue-700 border-blue-500/20',
    icon: Clock,
  },
  CANCELLED: {
    label: 'Отменена',
    color: 'bg-gray-500/10 text-gray-700 border-gray-500/20',
    icon: XCircle,
  },
  PAST_DUE: {
    label: 'Просрочена',
    color: 'bg-orange-500/10 text-orange-700 border-orange-500/20',
    icon: Clock,
  },
  EXPIRED: {
    label: 'Истекла',
    color: 'bg-red-500/10 text-red-700 border-red-500/20',
    icon: XCircle,
  },
};

const planIcons = {
  LITE: Zap,
  FOREMAN: Zap,
  BRIGADE: Crown,
};

export function SubscriptionHistory() {
  const [processingRenewal, setProcessingRenewal] = useState(false);
  const [expandedEntries, setExpandedEntries] = useState<Record<string, boolean>>({});
  const { toast } = useToast();

  const toggleExpanded = useCallback((entryId: string) => {
    setExpandedEntries(prev => ({
      ...prev,
      [entryId]: !prev[entryId],
    }));
  }, []);

  // Get both history and current subscription in parallel
  const { data, loading } = useQuery(MySubscriptionHistoryFromPaymentsDocument, {
    fetchPolicy: 'cache-and-network',
  });
  const { data: currentSubData } = useQuery(MySubscriptionDocument, {
    fetchPolicy: 'cache-and-network',
  });
  const [initializePayment] = useMutation(InitializePaymentDocument, {
    onCompleted: (data) => {
      if (data.initializePayment.url) {
        // Redirect to payment URL
        window.location.replace(data.initializePayment.url);
      }
    },
    onError: (error) => {
      setProcessingRenewal(false);
      toast('Не удалось инициализировать платеж. Попробуйте еще раз.', 'error');
      console.error('Payment initialization error:', error);
    },
  });

  // Extract data after hooks
  const historyEntries = data?.mySubscriptionHistoryFromPayments || [];
  const currentSubscription = currentSubData?.mySubscription;

  // Group payments by plan - if same plan is renewed multiple times, group them together
  // This prevents showing duplicates for renewals
  const groupedHistory = historyEntries.reduce((acc: any[], entry, index) => {
    // Find if we already have an entry for this plan
    const existingEntry = acc.find(e => e.planSlug === entry.planSlug);

    if (existingEntry && entry.isRenewal) {
      // This is a renewal of existing plan - add to renewals array
      existingEntry.renewals = existingEntry.renewals || [];
      existingEntry.renewals.push({
        id: entry.id,
        amount: entry.amount,
        paidAt: entry.paidAt,
        isEarlyBird: entry.isEarlyBird,
        periodStartAt: entry.periodStartAt, // Include period info for renewals table
        periodEndAt: entry.periodEndAt,
      });

      // Update period start to earliest payment
      if (new Date(entry.paidAt) < new Date(existingEntry.periodStartAt)) {
        existingEntry.periodStartAt = entry.periodStartAt;
      }
    } else {
      // This is a new plan (not a renewal) - add as separate entry
      acc.push({
        ...entry,
        renewals: [],
      });
    }

    return acc;
  }, []);

  // Define handleRenewPlan callback - must be before any conditional returns
  const handleRenewPlan = useCallback(async () => {
    if (!currentSubscription?.id || !currentSubscription?.planId) {
      toast('Не удалось определить подписку или план. Попробуйте обновить страницу.', 'error');
      return;
    }

    setProcessingRenewal(true);

    try {
      await initializePayment({
        variables: {
          subscriptionId: currentSubscription.id,
          providerType: null, // null means backend will auto-select by IP
          targetPlanId: currentSubscription.planId,
          targetPlan: currentSubscription.plan,
        },
      });
    } catch (error) {
      setProcessingRenewal(false);
      console.error('Error initializing payment:', error);
    }
  }, [currentSubscription, initializePayment, toast]);

  // Conditional return must be after all hooks
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>История подписок</CardTitle>
          <CardDescription>Загрузка...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (historyEntries.length === 0) {
    return null;
  }

  // Get current plan slug from subscription
  const currentPlanSlug = currentSubscription?.plan?.toLowerCase();

  // Find the most recent payment (first in sorted list) that matches current plan
  // Only the most recent payment for current plan should be marked as "current"
  // History is already sorted by paidAt desc (newest first)
  const mostRecentCurrentEntry = groupedHistory.length > 0 && groupedHistory[0].planSlug === currentPlanSlug
    ? groupedHistory[0]
    : null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <RefreshCw className="w-5 h-5" />
          История подписок
        </CardTitle>
        <CardDescription>
          История всех ваших покупок планов
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {groupedHistory.map((entry, index) => {
            const PlanIcon = planIcons[entry.planSlug.toUpperCase() as keyof typeof planIcons] || Zap;
            // Only mark as current if this is the most recent entry AND it matches current plan
            // This ensures only one entry is marked as "current"
            const isCurrent = mostRecentCurrentEntry?.id === entry.id && entry.planSlug === currentPlanSlug;

            return (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`
                  relative p-4 rounded-lg border
                  ${isCurrent ? 'border-primary/30 bg-primary/5' : 'border-border bg-muted/30'}
                `}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className={`
                      w-10 h-10 rounded-lg flex items-center justify-center shrink-0
                      ${isCurrent ? 'bg-primary/10' : 'bg-muted'}
                    `}>
                      <PlanIcon className={`w-5 h-5 ${isCurrent ? 'text-primary' : 'text-muted-foreground'}`} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <h4 className={`text-lg font-bold ${isCurrent ? 'text-primary' : 'text-foreground'}`}>
                          {entry.planName}
                        </h4>
                        {isCurrent && (
                          <Badge variant="default" className="text-xs font-semibold bg-primary text-primary-foreground">
                            Текущая
                          </Badge>
                        )}
                        {entry.isEarlyBird && (
                          <Badge variant="secondary" className="text-xs font-semibold bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30">
                            Early Bird
                          </Badge>
                        )}
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Calendar className="w-3.5 h-3.5 opacity-70" />
                          <span>
                            Оплачено: {format(new Date(entry.paidAt), 'd MMM yyyy, HH:mm', { locale: ru })}
                          </span>
                        </div>
                        {entry.renewals && entry.renewals.length > 0 && (
                          <button
                            onClick={() => toggleExpanded(entry.id)}
                            className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
                          >
                            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${expandedEntries[entry.id] ? 'rotate-180' : ''}`} />
                            <span>
                              {entry.renewals.length} {entry.renewals.length === 1 ? 'продление' : entry.renewals.length < 5 ? 'продления' : 'продлений'}
                            </span>
                          </button>
                        )}
                        {entry.periodStartAt && entry.periodEndAt && (
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Clock className="w-3.5 h-3.5 opacity-70" />
                            <span>
                              {isCurrent
                                ? `Действует с ${format(new Date(entry.periodStartAt), 'd MMM yyyy', { locale: ru })} до ${format(new Date(entry.periodEndAt), 'd MMM yyyy', { locale: ru })}`
                                : `Действовала с ${format(new Date(entry.periodStartAt), 'd MMM yyyy', { locale: ru })} до ${format(new Date(entry.periodEndAt), 'd MMM yyyy', { locale: ru })}`
                              }
                            </span>
                          </div>
                        )}
                        <div className="flex items-baseline gap-2">
                          <span className={`text-xl font-bold ${isCurrent ? 'text-primary' : 'text-foreground'}`}>
                            {entry.amount}
                          </span>
                          <span className="text-sm font-medium text-muted-foreground">
                            {entry.currency}
                          </span>
                          {entry.renewals && entry.renewals.length > 0 && (
                            <span className="text-xs text-muted-foreground">
                              (Всего оплачено: {entry.amount + entry.renewals.reduce((sum: number, r: any) => sum + r.amount, 0)} {entry.currency})
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <Badge
                      variant="outline"
                      className={`${isCurrent ? 'bg-green-500/15 text-green-700 dark:text-green-400 border-green-500/30 font-semibold' : 'bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/20'} flex items-center gap-1.5 whitespace-nowrap text-xs`}
                    >
                      <Check className={`w-3.5 h-3.5 ${isCurrent ? 'text-green-600 dark:text-green-400' : ''}`} />
                      Оплачено
                    </Badge>

                    {isCurrent ? (
                      <Button
                        size="sm"
                        variant="default"
                        onClick={handleRenewPlan}
                        disabled={processingRenewal}
                        className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-md hover:shadow-lg transition-all"
                      >
                        {processingRenewal ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                            Обработка...
                          </>
                        ) : (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                            Продлить план
                          </>
                        )}
                      </Button>
                    ) : entry.isRenewal ? (
                      // If this payment was a renewal (same plan), it's part of the current period chain
                      // Don't show "completed" - it's just a previous payment in the same subscription
                      <div className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        <span>Продлена</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-sm font-medium text-red-600 dark:text-red-400">
                        <XCircle className="w-4 h-4" />
                        <span>Подписка завершена</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Renewals Table - Expandable */}
                {entry.renewals && entry.renewals.length > 0 && expandedEntries[entry.id] && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="mt-4 pt-4 border-t border-border"
                  >
                    <h5 className="text-sm font-semibold text-foreground mb-3">История продлений</h5>
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="border-b border-border">
                            <th className="text-left py-2 px-2 font-semibold text-muted-foreground">Дата оплаты</th>
                            <th className="text-left py-2 px-2 font-semibold text-muted-foreground">Период действия</th>
                            <th className="text-right py-2 px-2 font-semibold text-muted-foreground">Сумма</th>
                            <th className="text-center py-2 px-2 font-semibold text-muted-foreground">Early Bird</th>
                            <th className="text-center py-2 px-2 font-semibold text-muted-foreground">Статус</th>
                          </tr>
                        </thead>
                        <tbody>
                          {entry.renewals.map((renewal: any, renewalIndex: number) => {
                            // Use actual period data from backend instead of calculating
                            const renewalStartDate = renewal.periodStartAt ? new Date(renewal.periodStartAt) : new Date(renewal.paidAt);
                            const renewalEndDate = renewal.periodEndAt ? new Date(renewal.periodEndAt) : new Date(renewalStartDate.getTime() + 30 * 24 * 60 * 60 * 1000);

                            const isRenewalActive = new Date() <= renewalEndDate;

                            return (
                              <tr key={renewal.id} className="border-b border-border/50 last:border-0 hover:bg-muted/30">
                                <td className="py-2 px-2 text-muted-foreground">
                                  {format(new Date(renewal.paidAt), 'd MMM yyyy, HH:mm', { locale: ru })}
                                </td>
                                <td className="py-2 px-2 text-muted-foreground">
                                  {format(renewalStartDate, 'd MMM yyyy', { locale: ru })} — {format(renewalEndDate, 'd MMM yyyy', { locale: ru })}
                                </td>
                                <td className="py-2 px-2 text-right font-medium">
                                  {renewal.amount} {entry.currency}
                                </td>
                                <td className="py-2 px-2 text-center">
                                  {renewal.isEarlyBird ? (
                                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0.5 bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30">
                                      Early Bird
                                    </Badge>
                                  ) : (
                                    <span className="text-muted-foreground">—</span>
                                  )}
                                </td>
                                <td className="py-2 px-2 text-center">
                                  {isRenewalActive ? (
                                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0.5 bg-green-500/15 text-green-700 dark:text-green-400 border-green-500/30">
                                      Действует
                                    </Badge>
                                  ) : (
                                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0.5 bg-gray-500/15 text-gray-700 dark:text-gray-400 border-gray-500/30">
                                      Завершена
                                    </Badge>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                    <div className="mt-3 pt-3 border-t border-border flex justify-between items-center text-xs">
                      <span className="font-semibold text-foreground">Итого оплачено:</span>
                      <span className="font-bold text-primary">
                        {entry.amount + entry.renewals.reduce((sum: number, r: any) => sum + r.amount, 0)} {entry.currency}
                      </span>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

