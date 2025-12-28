'use client';

import { AlertCircle } from 'lucide-react';
import Link from 'next/link';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/packages/components/ui/dialog';
import { Button } from '@/packages/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/packages/components/ui/alert';

export interface DowngradeError {
  message: string;
  code: string;
  exceeds: string[];
}

interface DowngradeErrorModalProps {
  isOpen: boolean;
  onClose: () => void;
  error: DowngradeError | null;
  newPlanName?: string;
}

/**
 * Modal that displays when user tries to downgrade to a plan
 * but their current usage exceeds the new plan's limits
 */
export function DowngradeErrorModal({
  isOpen,
  onClose,
  error,
  newPlanName,
}: DowngradeErrorModalProps) {
  if (!error) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-destructive" />
            Невозможно понизить план
          </DialogTitle>
          <DialogDescription>
            {newPlanName ? (
              <>Вы превышаете лимиты плана "{newPlanName}"</>
            ) : (
              <>Ваше текущее использование превышает лимиты нового плана</>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Превышены следующие лимиты:</AlertTitle>
            <AlertDescription>
              <ul className="list-disc pl-6 mt-3 space-y-1 text-sm">
                {error.exceeds.map((exceed, index) => (
                  <li key={index}>{exceed}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>

          <div className="mt-4 p-4 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground">
              Чтобы перейти на этот план, необходимо сначала уменьшить использование ресурсов:
            </p>
            <ul className="mt-2 space-y-1 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-muted-foreground">•</span>
                <span>Архивируйте или удалите неиспользуемые проекты</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-muted-foreground">•</span>
                <span>Удалите участников команды, которые больше не работают</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-muted-foreground">•</span>
                <span>Очистите старые файлы и фотографии, чтобы освободить место</span>
              </li>
            </ul>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={onClose} className="w-full sm:w-auto">
            Закрыть
          </Button>
          <Button asChild className="w-full sm:w-auto">
            <Link href="/settings?tab=billing">Посмотреть другие планы</Link>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
