'use client';

import { useState, useCallback, Fragment } from 'react';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/packages/components/ui/table';
import { cn } from '@/packages/utils';

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

// Helper function to determine period status
// Returns: 'completed' | 'active' | 'queued'
function getPeriodStatus(startDate: Date, endDate: Date): 'completed' | 'active' | 'queued' {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()); // Start of today
  const start = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
  const end = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());

  if (end < today) {
    // Period ended before today
    return 'completed';
  } else if (start > today) {
    // Period starts after today (queued/future)
    return 'queued';
  } else {
    // Period is active (today is between start and end)
    return 'active';
  }
}

// Status badge component for period status
function PeriodStatusBadge({ status }: { status: 'completed' | 'active' | 'queued' }) {
  switch (status) {
    case 'active':
      return (
        <Badge variant="secondary" className="text-[10px] px-1.5 py-0.5 bg-green-500/15 text-green-700 dark:text-green-400 border-green-500/30">
          Действует
        </Badge>
      );
    case 'queued':
      return (
        <Badge variant="secondary" className="text-[10px] px-1.5 py-0.5 bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/30">
          В очереди
        </Badge>
      );
    case 'completed':
    default:
      return (
        <Badge variant="secondary" className="text-[10px] px-1.5 py-0.5 bg-gray-500/15 text-gray-700 dark:text-gray-400 border-gray-500/30">
          Завершён
        </Badge>
      );
  }
}

export function SubscriptionHistory() {
  const [processingRenewal, setProcessingRenewal] = useState(false);
  const [expandedEntries, setExpandedEntries] = useState<Record<string, boolean>>({});
  const [currentPage, setCurrentPage] = useState(1);
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
  // Important: history is sorted DESC (newest first), so we process from newest to oldest
  // Grouping logic: payments for the same plan that are consecutive (renewals) should be grouped
  const groupedHistory = historyEntries.reduce((acc: any[], entry, index) => {
    // Check if this entry is a renewal of the previous entry in the sorted list
    // If previous entry (index - 1) has the same planSlug, this is a renewal
    const isRenewalOfPrevious = index > 0 &&
      historyEntries[index - 1].planSlug === entry.planSlug;

    // Find if we already have an entry for this plan (from previous iterations)
    // Only group if it's a renewal of the most recent entry for this plan
    const existingEntry = acc.find(e => e.planSlug === entry.planSlug);

    if (existingEntry && isRenewalOfPrevious) {
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

      // Track the EARLIEST periodStartAt (this is when the subscription on this plan started)
      if (entry.periodStartAt) {
        const entryStart = new Date(entry.periodStartAt).getTime();
        const existingStart = existingEntry.firstPeriodStart
          ? new Date(existingEntry.firstPeriodStart).getTime()
          : Infinity;
        if (entryStart < existingStart) {
          existingEntry.firstPeriodStart = entry.periodStartAt;
        }
      }

      // Track the LATEST periodEndAt (this is when the subscription will end after all renewals)
      if (entry.periodEndAt) {
        const existingEnd = existingEntry.lastPeriodEnd
          ? new Date(existingEntry.lastPeriodEnd).getTime()
          : 0;
        const newEnd = new Date(entry.periodEndAt).getTime();
        if (newEnd > existingEnd) {
          existingEntry.lastPeriodEnd = entry.periodEndAt;
        }
      }
    } else {
      // This is a new plan (not a renewal) - add as separate entry
      acc.push({
        ...entry,
        renewals: [],
        // Track period boundaries for this plan
        firstPeriodStart: entry.periodStartAt,
        lastPeriodEnd: entry.periodEndAt,
      });
    }

    return acc;
  }, []);

  // Sort renewals by status priority, then by date
  // Order: 1. Future (queued) - top, 2. Current (active) - middle, 3. Past (completed) - bottom
  groupedHistory.forEach(entry => {
    if (entry.renewals && entry.renewals.length > 0) {
      entry.renewals.sort((a: any, b: any) => {
        const startA = a.periodStartAt ? new Date(a.periodStartAt) : new Date(a.paidAt);
        const endA = a.periodEndAt ? new Date(a.periodEndAt) : new Date(startA.getTime() + 30 * 24 * 60 * 60 * 1000);
        const startB = b.periodStartAt ? new Date(b.periodStartAt) : new Date(b.paidAt);
        const endB = b.periodEndAt ? new Date(b.periodEndAt) : new Date(startB.getTime() + 30 * 24 * 60 * 60 * 1000);

        const statusA = getPeriodStatus(startA, endA);
        const statusB = getPeriodStatus(startB, endB);

        // Priority: queued (0) > active (1) > completed (2)
        const priorityMap = { queued: 0, active: 1, completed: 2 };
        const priorityA = priorityMap[statusA];
        const priorityB = priorityMap[statusB];

        if (priorityA !== priorityB) {
          return priorityA - priorityB; // Lower priority number = higher in list
        }

        // Within same status, sort by start date descending (newest first)
        return startB.getTime() - startA.getTime();
      });
    }

    // Set display period dates:
    // - periodStartAt = earliest period start (when subscription on this plan began)
    // - periodEndAt = latest period end (when subscription will end after all renewals)
    if (entry.firstPeriodStart) {
      entry.periodStartAt = entry.firstPeriodStart;
    }
    if (entry.lastPeriodEnd) {
      entry.periodEndAt = entry.lastPeriodEnd;
    }
  });

  // Sort grouped history by latest period end date (newest first)
  // Plans with most recent activity appear at the top
  groupedHistory.sort((a, b) => {
    const dateA = a.lastPeriodEnd ? new Date(a.lastPeriodEnd).getTime() : new Date(a.paidAt).getTime();
    const dateB = b.lastPeriodEnd ? new Date(b.lastPeriodEnd).getTime() : new Date(b.paidAt).getTime();
    return dateB - dateA; // Descending order (newest first)
  });

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

  // For current subscription, use the period from the subscription itself (which is updated correctly)
  // instead of calculating from grouped payments. This ensures we show the correct period
  // that reflects all renewals
  if (mostRecentCurrentEntry && currentSubscription) {
    // Use subscription's currentPeriodEnd - this is the correct end date after all renewals
    if (currentSubscription.currentPeriodEnd) {
      mostRecentCurrentEntry.periodEndAt = currentSubscription.currentPeriodEnd;
    }
    // Use subscription's currentPeriodStart - this is when the current plan started
    // (not the first payment ever, but when user switched to this specific plan)
    if (currentSubscription.currentPeriodStart) {
      mostRecentCurrentEntry.periodStartAt = currentSubscription.currentPeriodStart;
    }
  }

  // Pagination constants
  const ITEMS_PER_PAGE = 10;

  // Calculate pagination
  const totalPages = Math.ceil(groupedHistory.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedHistory = groupedHistory.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setExpandedEntries({}); // Collapse all expanded entries when changing page
  };

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
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[250px]">План</TableHead>
                <TableHead>Дата оплаты</TableHead>
                <TableHead>Период действия</TableHead>
                <TableHead>Сумма</TableHead>
                <TableHead className="text-center">Статус</TableHead>
                <TableHead className="text-right">Действие</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedHistory.map((entry) => {
                const PlanIcon = planIcons[entry.planSlug.toUpperCase() as keyof typeof planIcons] || Zap;
                const isCurrent = mostRecentCurrentEntry?.id === entry.id && entry.planSlug === currentPlanSlug;
                const isExpanded = expandedEntries[entry.id];
                const hasRenewals = entry.renewals && entry.renewals.length > 0;

                return (
                  <Fragment key={entry.id}>
                    <TableRow
                      className={cn(
                        "cursor-pointer transition-colors",
                        isCurrent ? "bg-primary/5 hover:bg-primary/10" : "hover:bg-muted/50"
                      )}
                      onClick={() => hasRenewals && toggleExpanded(entry.id)}
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                            isCurrent ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                          )}>
                            <PlanIcon className="w-4 h-4" />
                          </div>
                          <div className="flex flex-col">
                            <span className="font-semibold text-sm flex items-center gap-2">
                              {entry.planName}
                              {isCurrent && (
                                <Badge variant="default" className="h-5 px-1.5 text-[10px] bg-primary/20 text-primary hover:bg-primary/30 border-0">Текущая</Badge>
                              )}
                            </span>
                            {entry.isEarlyBird && (
                              <span className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">Early Bird</span>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        {format(new Date(entry.paidAt), 'd MMM yyyy', { locale: ru })}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {entry.periodStartAt && entry.periodEndAt ? (
                          <>
                            {format(new Date(entry.periodStartAt), 'd MMM yyyy', { locale: ru })} — {format(new Date(entry.periodEndAt), 'd MMM yyyy', { locale: ru })}
                          </>
                        ) : '—'}
                      </TableCell>
                      <TableCell className="font-medium">
                        {entry.amount} {entry.currency}
                      </TableCell>
                      <TableCell className="text-center">
                        {isCurrent ? (
                          <Badge variant="secondary" className="bg-green-500/15 text-green-700 dark:text-green-400 border-green-500/30">
                            Активна
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="bg-gray-500/15 text-gray-600 dark:text-gray-400 border-gray-500/20">
                            Завершена
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {isCurrent && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => { e.stopPropagation(); handleRenewPlan(); }}
                            disabled={processingRenewal}
                            className="h-8 text-primary hover:text-primary hover:bg-primary/20 px-2"
                            title="Продлить план"
                          >
                            {processingRenewal ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
                            {!processingRenewal && "Продлить"}
                          </Button>
                        )}
                      </TableCell>
                      <TableCell>
                        {hasRenewals && (
                          <ChevronDown className={cn("w-4 h-4 text-muted-foreground transition-transform", isExpanded && "rotate-180")} />
                        )}
                      </TableCell>
                    </TableRow>

                    {/* Expanded Details Row */}
                    {isExpanded && hasRenewals && (
                      <TableRow className="bg-muted/10 hover:bg-muted/10">
                        <TableCell colSpan={7} className="p-0">
                          <div className="p-4 pl-14">
                            <h5 className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wider bg-muted/50 w-fit px-2 py-1 rounded">История продлений</h5>
                            <div className="rounded-md border bg-card">
                              <Table>
                                <TableHeader>
                                  <TableRow className="hover:bg-transparent">
                                    <TableHead className="h-9 text-xs">Дата оплаты</TableHead>
                                    <TableHead className="h-9 text-xs">Период действия</TableHead>
                                    <TableHead className="h-9 text-xs text-right">Сумма</TableHead>
                                    <TableHead className="h-9 text-xs text-center">Статус</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {(() => {
                                    const originalPayment = historyEntries.find((e: any) => e.id === entry.id);
                                    const allPayments = [
                                      {
                                        id: entry.id,
                                        paidAt: entry.paidAt,
                                        periodStartAt: originalPayment?.periodStartAt || entry.periodStartAt,
                                        periodEndAt: originalPayment?.periodEndAt || entry.periodEndAt,
                                        amount: entry.amount,
                                        isEarlyBird: entry.isEarlyBird,
                                      },
                                      ...entry.renewals,
                                    ].sort((a: any, b: any) => new Date(b.paidAt).getTime() - new Date(a.paidAt).getTime());

                                    return allPayments.map((payment: any) => {
                                      const paymentStartDate = payment.periodStartAt ? new Date(payment.periodStartAt) : new Date(payment.paidAt);
                                      const paymentEndDate = payment.periodEndAt ? new Date(payment.periodEndAt) : new Date(paymentStartDate.getTime() + 30 * 24 * 60 * 60 * 1000);
                                      const periodStatus = getPeriodStatus(paymentStartDate, paymentEndDate);

                                      return (
                                        <TableRow key={payment.id} className="hover:bg-muted/50 border-0">
                                          <TableCell className="py-2 text-xs">
                                            {format(new Date(payment.paidAt), 'd MMM yyyy, HH:mm', { locale: ru })}
                                          </TableCell>
                                          <TableCell className="py-2 text-xs text-muted-foreground">
                                            {format(paymentStartDate, 'd MMM yyyy', { locale: ru })} — {format(paymentEndDate, 'd MMM yyyy', { locale: ru })}
                                          </TableCell>
                                          <TableCell className="py-2 text-xs font-medium text-right">
                                            {payment.amount} {entry.currency}
                                          </TableCell>
                                          <TableCell className="py-2 text-center">
                                            <PeriodStatusBadge status={periodStatus} />
                                          </TableCell>
                                        </TableRow>
                                      );
                                    });
                                  })()}
                                </TableBody>
                              </Table>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </Fragment>
                );
              })}
            </TableBody>
          </Table>
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-4 select-none">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="h-8 w-8 p-0"
            >
              &lt;
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => handlePageChange(page)}
                  className="h-8 w-8 p-0 text-xs"
                >
                  {page}
                </Button>
              ))}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="h-8 w-8 p-0"
            >
              &gt;
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

