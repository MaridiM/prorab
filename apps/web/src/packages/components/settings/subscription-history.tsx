'use client';

import { useQuery } from '@apollo/client/react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale/ru';
import { motion } from 'framer-motion';
import { Calendar, Check, Clock, Crown, Zap, XCircle, RefreshCw, ArrowRight } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/packages/ui';
import { Badge } from '@/packages/components/ui/badge';
import { Button } from '@/packages/components/ui/button';
import { MySubscriptionHistoryDocument } from '@/packages/api/graphql/__generated__/output';
import Link from 'next/link';

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
  const { data, loading } = useQuery(MySubscriptionHistoryDocument);

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

  const subscriptions = data?.mySubscriptionHistory || [];

  if (subscriptions.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <RefreshCw className="w-5 h-5" />
          История подписок
        </CardTitle>
        <CardDescription>
          Все ваши подписки и их статусы
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {subscriptions.map((sub, index) => {
            const config = statusConfig[sub.status as keyof typeof statusConfig];
            const StatusIcon = config?.icon || Clock;
            const PlanIcon = planIcons[sub.plan as keyof typeof planIcons] || Zap;
            const isActive = ['ACTIVE', 'TRIALING'].includes(sub.status);

            return (
              <motion.div
                key={sub.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`
                  relative p-4 rounded-lg border
                  ${isActive ? 'border-primary/30 bg-primary/5' : 'border-border bg-muted/30'}
                `}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className={`
                      w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0
                      ${isActive ? 'bg-primary/10' : 'bg-muted'}
                    `}>
                      <PlanIcon className={`w-5 h-5 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold">{sub.planRef?.name || sub.plan}</h4>
                        {isActive && (
                          <Badge variant="default" className="text-xs">
                            Текущая
                          </Badge>
                        )}
                      </div>

                      <div className="space-y-1 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>
                            Создана: {format(new Date(sub.createdAt), 'd MMM yyyy', { locale: ru })}
                          </span>
                        </div>

                        {sub.trialEndsAt && (
                          <div className="flex items-center gap-2">
                            <Clock className="w-3.5 h-3.5" />
                            <span>
                              Пробный период до: {format(new Date(sub.trialEndsAt), 'd MMM yyyy', { locale: ru })}
                            </span>
                          </div>
                        )}

                        {sub.currentPeriodEnd && (
                          <div className="flex items-center gap-2">
                            <Calendar className="w-3.5 h-3.5" />
                            <span>
                              Действует до: {format(new Date(sub.currentPeriodEnd), 'd MMM yyyy', { locale: ru })}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <Badge
                      variant="outline"
                      className={`${config?.color} flex items-center gap-1 whitespace-nowrap`}
                    >
                      <StatusIcon className="w-3 h-3" />
                      {config?.label || sub.status}
                    </Badge>

                    {isActive && (
                      <Button
                        size="sm"
                        variant="outline"
                        asChild
                        className="border-primary/50 hover:bg-primary/10"
                      >
                        <Link href="/settings?tab=subscription&showPlans=true">
                          Продлить план
                          <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                        </Link>
                      </Button>
                    )}
                  </div>
                </div>

                {sub.cancelledAt && (
                  <div className="mt-2 pt-2 border-t border-border/50 text-xs text-muted-foreground">
                    Отменена: {format(new Date(sub.cancelledAt), 'd MMM yyyy, HH:mm', { locale: ru })}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
