'use client';

import { useQuery } from '@apollo/client/react';
import Link from 'next/link';
import { Sparkles } from 'lucide-react';
import { Button } from '@/packages/components/ui/button';
import { MySubscriptionDocument } from '@/packages/api/graphql/__generated__/output';

/**
 * Compact upgrade button for navbar/header
 * Shows only if user has subscription and it's not the highest plan (BRIGADE)
 * and subscription status is ACTIVE or TRIALING
 */
export function UpgradeButton() {
  const { data } = useQuery(MySubscriptionDocument);
  const subscription = data?.mySubscription;

  // Don't show if no subscription or on highest plan (BRIGADE)
  if (!subscription || subscription.plan === 'BRIGADE') {
    return null;
  }

  // Only show for active or trial subscriptions
  const showUpgrade = ['ACTIVE', 'TRIALING'].includes(subscription.status);

  if (!showUpgrade) {
    return null;
  }

  return (
    <Button
      variant="default"
      size="sm"
      asChild
      className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white shadow-lg shadow-amber-500/25 border-0"
    >
      <Link href="/settings?tab=billing">
        <Sparkles className="w-4 h-4 mr-2" />
        Upgrade
      </Link>
    </Button>
  );
}
