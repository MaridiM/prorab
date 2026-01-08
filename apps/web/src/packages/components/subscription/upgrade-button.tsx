'use client';

import { useQuery } from '@apollo/client/react';
import Link from 'next/link';
import { Sparkles, Crown, Zap, ArrowUp, Clock } from 'lucide-react';
import { Button } from '@/packages/components/ui/button';
import { Badge } from '@/packages/components/ui/badge';
import { MySubscriptionDocument } from '@/packages/api/graphql/__generated__/output';

/**
 * Compact upgrade button for navbar/header
 * Shows current plan and upgrade option if not on highest plan
 */
export function UpgradeButton() {
  const { data, loading, error } = useQuery(MySubscriptionDocument, {
    fetchPolicy: 'cache-and-network',
  });

  const subscription = data?.mySubscription;

  console.log('[UpgradeButton] Debug:', {
    loading,
    error: error?.message,
    subscription,
    hasData: !!data,
    mySubscription: data?.mySubscription
  });

  if (loading && !data) {
    return null;
  }

  // No subscription - show "Upgrade" button
  if (!subscription) {
    return (
      <Button
        variant="default"
        size="sm"
        asChild
        className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg shadow-purple-500/30 border-0"
      >
        <Link href="/settings?tab=subscription">
          <Sparkles className="w-4 h-4 mr-2" />
          Апгрейд
        </Link>
      </Button>
    );
  }

  // Only show for active or trial subscriptions
  const showButton = ['ACTIVE', 'TRIALING'].includes(subscription.status);

  if (!showButton) {
    return null;
  }

  // Get plan name
  const planName = subscription.planRef?.name || subscription.plan;
  const isTopPlan = subscription.plan === 'BRIGADE';
  const isTrial = subscription.status === 'TRIALING' && subscription.trialEndsAt;
  
  // Calculate days remaining for trial
  const getTrialDaysRemaining = () => {
    if (!isTrial || !subscription.trialEndsAt) return null;
    const now = new Date();
    const trialEnd = new Date(subscription.trialEndsAt);
    const daysLeft = Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return daysLeft > 0 ? daysLeft : 0;
  };
  
  const trialDaysLeft = getTrialDaysRemaining();

  // If on top plan, show current plan badge
  if (isTopPlan) {
    return (
      <div className="flex items-center gap-2">
        {isTrial && trialDaysLeft !== null && (
          <Badge variant="secondary" className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30 text-xs">
            <Clock className="w-3 h-3 mr-1" />
            {trialDaysLeft} {trialDaysLeft === 1 ? 'день' : trialDaysLeft < 5 ? 'дня' : 'дней'}
          </Badge>
        )}
        <Button
          variant="default"
          size="sm"
          asChild
          className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white border-0 shadow-lg shadow-indigo-500/20 transition-all font-semibold"
        >
          <Link href="/settings?tab=subscription">
            <Crown className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">{planName}</span>
            <span className="inline sm:hidden">👑</span>
          </Link>
        </Button>
      </div>
    );
  }

  // Show upgrade button with current plan
  return (
    <div className="flex items-center gap-2">
      {isTrial && trialDaysLeft !== null && (
        <Badge variant="secondary" className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30 text-xs">
          <Clock className="w-3 h-3 mr-1" />
          {trialDaysLeft} {trialDaysLeft === 1 ? 'день' : trialDaysLeft < 5 ? 'дня' : 'дней'}
        </Badge>
      )}
      <Button
        variant="default"
        size="sm"
        asChild
        className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white shadow-lg shadow-amber-500/25 border-0"
      >
        <Link href="/settings?tab=subscription">
          <div className="flex items-center gap-1.5">
            <Zap className="w-4 h-4" />
            <span className="hidden sm:inline">{planName}</span>
            <ArrowUp className="w-3.5 h-3.5 hidden md:inline" />
            <span className="hidden md:inline">Апгрейд</span>
            <span className="inline md:hidden">↑</span>
          </div>
        </Link>
      </Button>
    </div>
  );
}
