'use client';

import { useQuery } from '@apollo/client/react';
import Link from 'next/link';
import { Sparkles, X } from 'lucide-react';
import { useState } from 'react';
import { Card, CardContent } from '@/packages/components/ui/card';
import { Button } from '@/packages/components/ui/button';
import { MySubscriptionDocument, CurrentPlanLimitsDocument } from '@/packages/api/graphql/__generated__/output';

export function UpgradeWidget() {
  const [dismissed, setDismissed] = useState(false);
  const { data: subscriptionData } = useQuery(MySubscriptionDocument);
  const { data: limitsData } = useQuery(CurrentPlanLimitsDocument);

  const subscription = subscriptionData?.mySubscription;
  const limits = limitsData?.currentPlanLimits;

  // Don't show if dismissed
  if (dismissed) return null;

  // Don't show if no subscription or on highest plan (BRIGADE)
  if (!subscription || subscription.plan === 'BRIGADE') return null;

  // Don't show if no limits data
  if (!limits) return null;

  // Calculate usage percentages
  const projectUsage =
    limits.maxActiveProjects !== null
      ? (limits.currentProjects / limits.maxActiveProjects) * 100
      : 0;

  const memberUsage = (limits.currentMembers / limits.maxMembers) * 100;

  const storageUsage = (limits.currentStorageGB / limits.maxStorageGB) * 100;

  // Get max usage
  const maxUsage = Math.max(projectUsage, memberUsage, storageUsage);

  // Only show if usage > 70%
  if (maxUsage < 70) return null;

  // Determine which resource is most used
  const getHighestUsageResource = () => {
    if (storageUsage >= projectUsage && storageUsage >= memberUsage) {
      return {
        name: 'хранилища',
        current: limits.currentStorageGB.toFixed(2),
        max: limits.maxStorageGB,
        unit: 'ГБ',
      };
    }
    if (projectUsage >= memberUsage) {
      return {
        name: 'проектов',
        current: limits.currentProjects,
        max: limits.maxActiveProjects,
        unit: '',
      };
    }
    return {
      name: 'участников',
      current: limits.currentMembers,
      max: limits.maxMembers,
      unit: '',
    };
  };

  const resource = getHighestUsageResource();

  return (
    <Card className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border-amber-200 dark:border-amber-800">
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-3">
            <div className="flex items-start gap-3">
              <Sparkles className="w-6 h-6 text-amber-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-lg">
                  Скоро достигнете лимита плана {subscription.plan}
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Вы используете {maxUsage.toFixed(0)}% {resource.name} ({resource.current}
                  {resource.unit} из {resource.max}
                  {resource.unit}). Улучшите план для большего пространства.
                </p>
              </div>
            </div>

            <div className="flex gap-2 mt-4">
              <Button asChild size="sm">
                <Link href="/settings?tab=billing">Посмотреть планы</Link>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setDismissed(true);
                  // Store dismissal in localStorage (optional - resets on page reload)
                  localStorage.setItem('upgrade-widget-dismissed', Date.now().toString());
                }}
              >
                Напомнить позже
              </Button>
            </div>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="flex-shrink-0 h-8 w-8"
            onClick={() => setDismissed(true)}
          >
            <X className="w-4 h-4" />
            <span className="sr-only">Закрыть</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
