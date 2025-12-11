'use client';

import { useState } from 'react';
import { useMutation, useQuery } from '@apollo/client/react';
import { Copy, Check, Trash2, Plus, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/packages/components/ui/dialog';
import { Button } from '@/packages/components/ui/button';
import { Input } from '@/packages/components/ui/input';
import { Label } from '@/packages/components/ui/label';
import { Badge } from '@/packages/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/packages/components/ui/select';
import { toast } from 'sonner';
import {
  CreateInviteLinkDocument,
  TeamInvitesDocument,
  DeleteInviteCodeDocument,
  type TeamInvitesQuery,
} from '@/packages/api/graphql/__generated__/output';

type InviteCode = TeamInvitesQuery['teamInvites'][0];

interface InviteLinkDialogProps {
  teamId: string;
  open: boolean;
  onClose: () => void;
}

export function InviteLinkDialog({ teamId, open, onClose }: InviteLinkDialogProps) {
  const [expiresInDays, setExpiresInDays] = useState<number>(7);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const { data, refetch } = useQuery(TeamInvitesDocument, {
    variables: { teamId },
    skip: !open,
  });

  const [createInviteLink, { loading: creating }] = useMutation(CreateInviteLinkDocument, {
    onCompleted: () => {
      toast.success('Ссылка создана', {
        description: 'Ссылка-приглашение успешно создана',
      });
      refetch();
    },
    onError: (error: any) => {
      toast.error('Ошибка', {
        description: error.message,
      });
    },
  });

  const [deleteInviteCode, { loading: deleting }] = useMutation(DeleteInviteCodeDocument, {
    onCompleted: () => {
      toast.success('Ссылка удалена', {
        description: 'Ссылка-приглашение успешно удалена',
      });
      refetch();
    },
    onError: (error: any) => {
      toast.error('Ошибка', {
        description: error.message,
      });
    },
  });

  const invites = data?.teamInvites || [];
  const activeInvites = invites.filter((invite) => invite.isActive);
  const expiredInvites = invites.filter((invite) => !invite.isActive);

  const handleCreateInvite = async () => {
    await createInviteLink({
      variables: {
        teamId,
        expiresInDays,
      },
    });
  };

  const handleCopyLink = (code: string) => {
    const fullUrl = `${window.location.origin}/invite/${code}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedCode(code);
    toast.success('Ссылка скопирована', {
      description: 'Ссылка-приглашение скопирована в буфер обмена',
    });
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleDeleteInvite = async (codeId: string) => {
    await deleteInviteCode({
      variables: { codeId },
    });
  };

  const getInviteUrl = (code: string) => {
    return `${window.location.origin}/invite/${code}`;
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Пригласить участников</DialogTitle>
          <DialogDescription>
            Создайте ссылку-приглашение для добавления новых участников в команду
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Create New Invite */}
          <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
            <h3 className="font-medium">Создать новую ссылку</h3>
            <div className="flex items-end gap-4">
              <div className="flex-1 space-y-2">
                <Label>Срок действия</Label>
                <Select
                  value={expiresInDays.toString()}
                  onValueChange={(value) => setExpiresInDays(parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 день</SelectItem>
                    <SelectItem value="3">3 дня</SelectItem>
                    <SelectItem value="7">7 дней (рекомендуется)</SelectItem>
                    <SelectItem value="14">14 дней</SelectItem>
                    <SelectItem value="30">30 дней</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleCreateInvite} disabled={creating}>
                <Plus className="mr-2 h-4 w-4" />
                Создать ссылку
              </Button>
            </div>
          </div>

          {/* Active Invites */}
          {activeInvites.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-medium">Активные ссылки ({activeInvites.length})</h3>
              <div className="space-y-2">
                {activeInvites.map((invite) => (
                  <div
                    key={invite.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <code className="text-sm font-mono bg-muted px-2 py-1 rounded">
                          {invite.code}
                        </code>
                        <Badge variant="success">Активна</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Истекает:{' '}
                        {format(new Date(invite.expiresAt), 'dd MMM yyyy, HH:mm', {
                          locale: ru,
                        })}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCopyLink(invite.code)}
                      >
                        {copiedCode === invite.code ? (
                          <>
                            <Check className="mr-2 h-4 w-4" />
                            Скопировано
                          </>
                        ) : (
                          <>
                            <Copy className="mr-2 h-4 w-4" />
                            Копировать
                          </>
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => window.open(getInviteUrl(invite.code), '_blank')}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteInvite(invite.id)}
                        disabled={deleting}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Expired/Used Invites */}
          {expiredInvites.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-medium text-muted-foreground">
                Использованные и истёкшие ({expiredInvites.length})
              </h3>
              <div className="space-y-2">
                {expiredInvites.map((invite) => (
                  <div
                    key={invite.id}
                    className="flex items-center justify-between p-3 border rounded-lg opacity-60"
                  >
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <code className="text-sm font-mono bg-muted px-2 py-1 rounded">
                          {invite.code}
                        </code>
                        <Badge variant="secondary">
                          {invite.usedBy ? 'Использована' : 'Истекла'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {invite.usedAt
                          ? `Использована: ${format(new Date(invite.usedAt), 'dd MMM yyyy', { locale: ru })}`
                          : `Истекла: ${format(new Date(invite.expiresAt), 'dd MMM yyyy', { locale: ru })}`}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteInvite(invite.id)}
                      disabled={deleting}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {invites.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <p>Нет активных ссылок-приглашений</p>
              <p className="text-sm">Создайте новую ссылку выше</p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Закрыть
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
