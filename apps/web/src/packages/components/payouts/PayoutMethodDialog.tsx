'use client';

import { useState } from 'react';
import { useMutation } from '@apollo/client/react';
import { FileUp, CreditCard, Banknote, Building2, Smartphone } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/packages/components/ui/dialog';
import { Button } from '@/packages/components/ui/button';
import { Label } from '@/packages/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/packages/components/ui/select';
import { Input } from '@/packages/components/ui/input';
import { toast } from 'sonner';
import {
  UpdatePayoutPaymentDocument,
  PaymentMethod,
  type ProjectPayoutsQuery,
} from '@/packages/api/graphql/__generated__/output';

type ProjectPayout = ProjectPayoutsQuery['projectPayouts'][0];

interface PayoutMethodDialogProps {
  payout: ProjectPayout | null;
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const PAYMENT_METHODS = [
  {
    value: PaymentMethod.Cash,
    label: 'Наличные',
    icon: Banknote,
    description: 'Оплата наличными деньгами',
  },
  {
    value: PaymentMethod.Card,
    label: 'Банковская карта',
    icon: CreditCard,
    description: 'Перевод на банковскую карту',
  },
  {
    value: PaymentMethod.Transfer,
    label: 'Банковский перевод',
    icon: Building2,
    description: 'Перевод на расчётный счёт',
  },
  {
    value: PaymentMethod.Sbp,
    label: 'СБП',
    icon: Smartphone,
    description: 'Система быстрых платежей',
  },
];

export function PayoutMethodDialog({
  payout,
  open,
  onClose,
  onSuccess,
}: PayoutMethodDialogProps) {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(
    payout?.paymentMethod || PaymentMethod.Cash
  );
  const [receiptUrl, setReceiptUrl] = useState<string>(payout?.receiptUrl || '');

  const [updatePayoutPayment, { loading }] = useMutation(UpdatePayoutPaymentDocument, {
    onCompleted: () => {
      toast.success('Метод оплаты обновлён', {
        description: 'Информация о способе оплаты успешно сохранена',
      });
      onSuccess?.();
      onClose();
    },
    onError: (error: any) => {
      toast.error('Ошибка', {
        description: error.message,
      });
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!payout) return;

    await updatePayoutPayment({
      variables: {
        input: {
          payoutId: payout.id,
          paymentMethod,
          receiptUrl: receiptUrl || null,
        },
      },
    });
  };

  const selectedMethod = PAYMENT_METHODS.find((m) => m.value === paymentMethod);

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Метод оплаты выплаты</DialogTitle>
            <DialogDescription>
              Укажите способ оплаты для выплаты{' '}
              <strong>{payout?.member?.user?.fullName}</strong>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Payment Method Selection */}
            <div className="space-y-2">
              <Label>Способ оплаты</Label>
              <Select
                value={paymentMethod}
                onValueChange={(value) => setPaymentMethod(value as PaymentMethod)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PAYMENT_METHODS.map((method) => {
                    const Icon = method.icon;
                    return (
                      <SelectItem key={method.value} value={method.value}>
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4" />
                          <div>
                            <p className="font-medium">{method.label}</p>
                            <p className="text-xs text-muted-foreground">
                              {method.description}
                            </p>
                          </div>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              {selectedMethod && (
                <p className="text-sm text-muted-foreground">
                  {selectedMethod.description}
                </p>
              )}
            </div>

            {/* Amount Display */}
            <div className="rounded-lg bg-muted p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Сумма выплаты:</span>
                <span className="text-lg font-bold">
                  {new Intl.NumberFormat('ru-RU', {
                    style: 'currency',
                    currency: 'RUB',
                    minimumFractionDigits: 0,
                  }).format(payout?.actualAmount || payout?.calculatedAmount || 0)}
                </span>
              </div>
            </div>

            {/* Receipt URL */}
            <div className="space-y-2">
              <Label htmlFor="receiptUrl">
                Ссылка на чек/квитанцию <span className="text-muted-foreground">(необязательно)</span>
              </Label>
              <div className="flex gap-2">
                <Input
                  id="receiptUrl"
                  type="url"
                  placeholder="https://example.com/receipt.pdf"
                  value={receiptUrl}
                  onChange={(e) => setReceiptUrl(e.target.value)}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    // TODO: Implement file upload
                    toast.info('Загрузка файлов', {
                      description: 'Функция загрузки файлов будет добавлена позже',
                    });
                  }}
                >
                  <FileUp className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Добавьте ссылку на чек, квитанцию или подтверждение оплаты
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Отмена
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Сохранение...' : 'Сохранить'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
