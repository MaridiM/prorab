'use client';

import { useState } from 'react';
import { useMutation, useQuery } from '@apollo/client/react';
import { Copy, Check, Trash2, Plus, ExternalLink, Mail, Link2, Loader2, QrCode, Download } from 'lucide-react';
import QRCode from 'react-qr-code';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale/ru';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/packages/components/ui/tabs';
import { toast } from 'sonner';
import {
  CreateInviteLinkDocument,
  TeamInvitesDocument,
  DeleteInviteCodeDocument,
  SendInviteByEmailDocument,
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
  const [inviteEmail, setInviteEmail] = useState<string>('');
  const [inviteEmailExpiresInDays, setInviteEmailExpiresInDays] = useState<number>(7);
  const [showQrCode, setShowQrCode] = useState<string | null>(null);

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

  const [sendInviteByEmail, { loading: sendingEmail }] = useMutation(SendInviteByEmailDocument, {
    onCompleted: (data) => {
      if (data.sendInviteByEmail.emailSent) {
        toast.success('Приглашение отправлено', {
          description: `Приглашение успешно отправлено на ${inviteEmail}`,
        });
      } else {
        toast.warning('Код создан, но письмо не отправлено', {
          description: 'Код приглашения создан, но не удалось отправить email. Вы можете скопировать ссылку вручную.',
        });
      }
      setInviteEmail('');
      refetch();
    },
    onError: (error: any) => {
      toast.error('Ошибка отправки', {
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

  const handleSendInviteByEmail = async () => {
    if (!inviteEmail.trim()) {
      toast.error('Ошибка', {
        description: 'Введите email адрес',
      });
      return;
    }

    // Простая валидация email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(inviteEmail.trim())) {
      toast.error('Ошибка', {
        description: 'Некорректный email адрес',
      });
      return;
    }

    await sendInviteByEmail({
      variables: {
        input: {
          teamId,
          email: inviteEmail.trim(),
          expiresInDays: inviteEmailExpiresInDays,
        },
      },
    });
  };

  const getInviteUrl = (invite: InviteCode) => {
    // Используем inviteUrl из API, если доступен (полный URL)
    // Иначе формируем на основе window.location.origin
    if (invite.inviteUrl && invite.inviteUrl.startsWith('http')) {
      return invite.inviteUrl;
    }
    return `${window.location.origin}/invite/${invite.code}`;
  };

  const handleCopyLink = (invite: InviteCode) => {
    const fullUrl = getInviteUrl(invite);
    navigator.clipboard.writeText(fullUrl);
    setCopiedCode(invite.code);
    toast.success('Ссылка скопирована', {
      description: 'Ссылка-приглашение скопирована в буфер обмена',
    });
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleShowQrCode = (code: string) => {
    setShowQrCode(code);
  };

  const handleDownloadQrCode = (invite: InviteCode) => {
    const fullUrl = getInviteUrl(invite);
    const qrSvg = document.getElementById(`qr-code-${invite.code}`);
    if (!qrSvg) return;

    const svgData = new XMLSerializer().serializeToString(qrSvg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.download = `invite-${invite.code}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
      toast.success('QR-код скачан', {
        description: 'QR-код приглашения успешно сохранен',
      });
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  const handleDeleteInvite = async (codeId: string) => {
    await deleteInviteCode({
      variables: { codeId },
    });
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
          {/* Tabs for invite methods */}
          <Tabs defaultValue="link" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="link" className="flex items-center gap-2">
                <Link2 className="h-4 w-4" />
                Ссылка-приглашение
              </TabsTrigger>
              <TabsTrigger value="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Отправить по email
              </TabsTrigger>
            </TabsList>

            {/* Link Invite Tab */}
            <TabsContent value="link" className="space-y-4">
              <div className="p-4 bg-muted/50 rounded-lg">
                <h3 className="font-medium mb-4">Создать новую ссылку</h3>
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
                <p className="text-sm text-muted-foreground mt-3">
                  Создайте ссылку-приглашение, которую можно отправить вручную через мессенджер или социальные сети
                </p>
              </div>
            </TabsContent>

            {/* Email Invite Tab */}
            <TabsContent value="email" className="space-y-4">
              <div className="p-4 bg-muted/50 rounded-lg">
                <h3 className="font-medium mb-4">Отправить приглашение по email</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="invite-email">Email адрес</Label>
                    <Input
                      id="invite-email"
                      type="email"
                      placeholder="example@email.com"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      disabled={sendingEmail}
                    />
                    <p className="text-sm text-muted-foreground">
                      На этот адрес будет отправлено приглашение с кодом и ссылкой для присоединения
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label>Срок действия приглашения</Label>
                    <Select
                      value={inviteEmailExpiresInDays.toString()}
                      onValueChange={(value) => setInviteEmailExpiresInDays(parseInt(value))}
                      disabled={sendingEmail}
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
                  <Button 
                    onClick={handleSendInviteByEmail} 
                    disabled={sendingEmail || !inviteEmail.trim()}
                    className="w-full"
                  >
                    {sendingEmail ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Отправка...
                      </>
                    ) : (
                      <>
                        <Mail className="mr-2 h-4 w-4" />
                        Отправить приглашение
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>

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
                        onClick={() => handleCopyLink(invite)}
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
                        variant="outline"
                        size="sm"
                        onClick={() => handleShowQrCode(invite.code)}
                      >
                        <QrCode className="mr-2 h-4 w-4" />
                        QR-код
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => window.open(getInviteUrl(invite), '_blank')}
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

        {/* QR Code Modal */}
        {showQrCode && (
          <Dialog open={!!showQrCode} onOpenChange={(open) => !open && setShowQrCode(null)}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>QR-код приглашения</DialogTitle>
                <DialogDescription>
                  Отсканируйте QR-код, чтобы присоединиться к команде
                </DialogDescription>
              </DialogHeader>
              <div className="flex flex-col items-center space-y-4 py-4">
                {(() => {
                  const invite = activeInvites.find(i => i.code === showQrCode) || expiredInvites.find(i => i.code === showQrCode);
                  const qrUrl = invite ? getInviteUrl(invite) : `${window.location.origin}/invite/${showQrCode}`;
                  
                  return (
                    <>
                      <div className="p-6 bg-white rounded-2xl shadow-lg border-2 border-primary/20">
                        <QRCode
                          id={`qr-code-${showQrCode}`}
                          value={qrUrl}
                          size={256}
                          level="M"
                          className="w-full h-full"
                        />
                      </div>
                      <div className="text-center space-y-2">
                        <p className="text-sm font-medium">Код приглашения</p>
                        <code className="text-lg font-mono bg-muted px-3 py-1 rounded">
                          {showQrCode}
                        </code>
                      </div>
                      <div className="flex gap-2 w-full">
                        <Button
                          variant="outline"
                          className="flex-1"
                          onClick={() => {
                            if (invite) {
                              handleCopyLink(invite);
                            } else {
                              navigator.clipboard.writeText(qrUrl);
                              toast.success('Ссылка скопирована');
                            }
                            setShowQrCode(null);
                          }}
                        >
                          <Copy className="mr-2 h-4 w-4" />
                          Копировать ссылку
                        </Button>
                        <Button
                          variant="outline"
                          className="flex-1"
                          onClick={() => {
                            if (invite) {
                              handleDownloadQrCode(invite);
                            } else {
                              const qrSvg = document.getElementById(`qr-code-${showQrCode}`);
                              if (qrSvg) {
                                const svgData = new XMLSerializer().serializeToString(qrSvg);
                                const canvas = document.createElement('canvas');
                                const ctx = canvas.getContext('2d');
                                const img = new Image();
                                img.onload = () => {
                                  canvas.width = img.width;
                                  canvas.height = img.height;
                                  ctx?.drawImage(img, 0, 0);
                                  const pngFile = canvas.toDataURL('image/png');
                                  const downloadLink = document.createElement('a');
                                  downloadLink.download = `invite-${showQrCode}.png`;
                                  downloadLink.href = pngFile;
                                  downloadLink.click();
                                  toast.success('QR-код скачан');
                                };
                                img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
                              }
                            }
                          }}
                        >
                          <Download className="mr-2 h-4 w-4" />
                          Скачать QR
                        </Button>
                      </div>
                    </>
                  );
                })()}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowQrCode(null)}>
                  Закрыть
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Закрыть
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
