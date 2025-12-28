'use client';

import { useQuery } from '@apollo/client/react';
import Link from 'next/link';
import { Sparkles, Crown, Zap, ArrowUp } from 'lucide-react';
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

  // If on top plan, show current plan badge
  if (isTopPlan) {
    return (
      <Button
        variant="outline"
        size="sm"
        asChild
        className="border-primary/30 bg-primary/5 hover:bg-primary/10"
      >
        <Link href="/settings?tab=subscription">
          <Crown className="w-4 h-4 mr-2 text-primary" />
          <span className="hidden sm:inline">{planName}</span>
          <span className="inline sm:hidden">👑</span>
        </Link>
      </Button>
    );
  }

  // Show upgrade button with current plan
  return (
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
  );
}
