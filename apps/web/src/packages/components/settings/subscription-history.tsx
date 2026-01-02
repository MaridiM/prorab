'use client';

import { useState, useCallback } from 'react';
import { useQuery, useMutation } from '@apollo/client/react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale/ru';
import { motion } from 'framer-motion';
import { Calendar, Check, Clock, Crown, Zap, XCircle, RefreshCw, Loader2 } from 'lucide-react';
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
  const { toast } = useToast();

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
  const mostRecentCurrentEntry = historyEntries.length > 0 && historyEntries[0].planSlug === currentPlanSlug
    ? historyEntries[0]
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
          {historyEntries.map((entry, index) => {
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
              </motion.div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

