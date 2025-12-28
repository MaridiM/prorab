'use client';

import { useQuery } from '@apollo/client/react';
import { Badge } from '@/packages/components/ui/badge';
import { cn } from '@/packages/utils';
import { AvailablePaymentProvidersDocument, PaymentProviderType } from '@/packages/api/graphql/__generated__/output';

interface PaymentProviderSelectorProps {
  onSelect: (providerType: PaymentProviderType) => void;
  selected?: PaymentProviderType;
}

export function PaymentProviderSelector({ onSelect, selected }: PaymentProviderSelectorProps) {
  const { data, loading } = useQuery(AvailablePaymentProvidersDocument);
  const providers = data?.availablePaymentProviders || [];

  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-4">
        <div className="h-24 bg-muted animate-pulse rounded-lg" />
        <div className="h-24 bg-muted animate-pulse rounded-lg" />
      </div>
    );
  }

  if (providers.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-8">
        Платёжные системы недоступны
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {providers.map((provider) => (
        <button
          key={provider.id}
          onClick={() => onSelect(provider.type)}
          className={cn(
            'relative p-6 border-2 rounded-lg transition-all hover:shadow-md',
            'flex flex-col items-center gap-3',
            selected === provider.type
              ? 'border-primary bg-primary/5 shadow-sm'
              : 'border-border hover:border-primary/50'
          )}
        >
          {/* Provider Icon/Logo */}
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-muted">
            {provider.type === PaymentProviderType.Yookassa && (
              <span className="text-2xl font-bold text-primary">ЮК</span>
            )}
            {provider.type === PaymentProviderType.Stripe && (
              <span className="text-2xl font-bold text-primary">ST</span>
            )}
          </div>

          {/* Provider Name */}
          <div className="text-center">
            <div className="font-semibold">{provider.name}</div>
            {provider.isPrimary && (
              <Badge variant="secondary" className="mt-2">
                Рекомендуется
              </Badge>
            )}
          </div>

          {/* Selection Indicator */}
          {selected === provider.type && (
            <div className="absolute top-2 right-2">
              <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                <svg
                  className="w-3 h-3 text-primary-foreground"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
          )}
        </button>
      ))}
    </div>
  );
}
