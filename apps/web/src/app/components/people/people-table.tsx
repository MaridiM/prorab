'use client';

import { useState } from 'react';
import { useMutation } from '@apollo/client/react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale/ru';
import {
  MoreHorizontal,
  Pencil,
  Trash2,
  TrendingUp,
  Briefcase,
  Calendar,
  DollarSign,
  UserCog,
} from 'lucide-react';
import { Button } from '@/packages/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/packages/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/packages/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/packages/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/packages/components/ui/dialog';
import { Input } from '@/packages/components/ui/input';
import { Label } from '@/packages/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/packages/components/ui/avatar';
import { Badge } from '@/packages/components/ui/badge';
import { toast } from 'sonner';
import { RemoveTeamMemberDocument, UpdateMemberPositionDocument, type TeamMembersQuery, TeamRole } from '@/packages/api/graphql/__generated__/output';
import { MemberSalaryBadge } from '@/packages/components/payouts/MemberSalaryBadge';

type TeamMember = TeamMembersQuery['teamMembers'][0];

interface PeopleTableProps {
  members: TeamMember[];
  teamId: string;
  onRefetch: () => void;
}

export function PeopleTable({ members, teamId, onRefetch }: PeopleTableProps) {
  const router = useRouter();
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [memberToDelete, setMemberToDelete] = useState<TeamMember | null>(null);
  const [memberToEditPosition, setMemberToEditPosition] = useState<TeamMember | null>(null);
  const [positionValue, setPositionValue] = useState('');

  const [updatePosition, { loading: updatingPosition }] = useMutation(UpdateMemberPositionDocument, {
    onCompleted: () => {
      toast.success('Должность обновлена', {
        description: 'Должность участника успешно обновлена',
      });
      onRefetch();
      setMemberToEditPosition(null);
      setPositionValue('');
    },
    onError: (error: any) => {
      toast.error('Ошибка', {
        description: error.message,
      });
    },
  });

  const [removeTeamMember, { loading: removing }] = useMutation(RemoveTeamMemberDocument, {
    onCompleted: () => {
      toast.success('Участник удалён', {
        description: 'Участник успешно удалён из команды',
      });
      onRefetch();
      setMemberToDelete(null);
    },
    onError: (error: any) => {
      toast.error('Ошибка', {
        description: error.message,
      });
    },
  });

  const handleRemoveMember = async () => {
    if (!memberToDelete) return;

    await removeTeamMember({
      variables: {
        teamId,
        memberId: memberToDelete.id,
      },
    });
  };

  const handleUpdatePosition = async () => {
    if (!memberToEditPosition) return;

    await updatePosition({
      variables: {
        input: {
          memberId: memberToEditPosition.id,
          position: positionValue.trim() || null,
        },
      },
    });
  };

  const openPositionDialog = (member: TeamMember) => {
    setMemberToEditPosition(member);
    setPositionValue(member.position || '');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Участник</TableHead>
              <TableHead>Роль</TableHead>
              <TableHead>Должность</TableHead>
              <TableHead>Условия оплаты</TableHead>
              <TableHead>Проекты</TableHead>
              <TableHead>Выплаты</TableHead>
              <TableHead>Дата присоединения</TableHead>
              <TableHead className="w-[70px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  Нет участников в команде
                </TableCell>
              </TableRow>
            ) : (
              members.map((member) => {
                const isOwner = member.role === TeamRole.Owner;
                const stats = member.stats;

                return (
                  <TableRow key={member.id}>
                    {/* Member Info */}
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={member.user?.avatarUrl || undefined} />
                          <AvatarFallback>
                            {member.user?.fullName ? getInitials(member.user.fullName) : '??'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{member.user?.fullName || 'Неизвестно'}</p>
                          <p className="text-sm text-muted-foreground">
                            {member.user?.email || ''}
                          </p>
                        </div>
                      </div>
                    </TableCell>

                    {/* Role */}
                    <TableCell>
                      {isOwner ? (
                        <Badge variant="default">Владелец</Badge>
                      ) : (
                        <Badge variant="secondary">Участник</Badge>
                      )}
                    </TableCell>

                    {/* Position */}
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {member.position || '—'}
                      </span>
                    </TableCell>

                    {/* Salary */}
                    <TableCell>
                      <MemberSalaryBadge
                        salaryType={member.salaryType as any}
                        salaryAmount={member.salaryAmount || undefined}
                      />
                    </TableCell>

                    {/* Projects */}
                    <TableCell>
                      <div className="flex items-center gap-2 text-sm">
                        <Briefcase className="h-4 w-4 text-muted-foreground" />
                        <span>{stats?.projectCount || 0}</span>
                      </div>
                    </TableCell>

                    {/* Payouts */}
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm font-medium">
                          <DollarSign className="h-4 w-4 text-green-600" />
                          <span>{formatCurrency(stats?.totalPayouts || 0)}</span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {stats?.completedPayoutsCount || 0} выплат
                        </div>
                      </div>
                    </TableCell>

                    {/* Joined Date */}
                    <TableCell>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {format(new Date(member.joinedAt), 'dd MMM yyyy', {
                            locale: ru,
                          })}
                        </span>
                      </div>
                    </TableCell>

                    {/* Actions */}
                    <TableCell>
                      {!isOwner && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Действия</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => openPositionDialog(member)}
                            >
                              <UserCog className="mr-2 h-4 w-4" />
                              Изменить должность
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => setSelectedMember(member)}
                            >
                              <Pencil className="mr-2 h-4 w-4" />
                              Редактировать зарплату
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                router.push(`/teams/${teamId}/members/${member.id}/payouts`);
                              }}
                            >
                              <TrendingUp className="mr-2 h-4 w-4" />
                              История выплат
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => setMemberToDelete(member)}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Удалить из команды
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* TODO: Salary Edit Dialog - будет реализован позже */}
      {/* Временно отключено для тестирования */}

      {/* Position Edit Dialog */}
      <Dialog
        open={!!memberToEditPosition}
        onOpenChange={(open) => {
          if (!open) {
            setMemberToEditPosition(null);
            setPositionValue('');
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Изменить должность</DialogTitle>
            <DialogDescription>
              Измените должность или специализацию участника команды
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="position">Должность</Label>
              <Input
                id="position"
                placeholder="Например: Прораб, Электрик, Маляр..."
                value={positionValue}
                onChange={(e) => setPositionValue(e.target.value)}
                maxLength={100}
                disabled={updatingPosition}
              />
              <p className="text-xs text-muted-foreground">
                Оставьте пустым, чтобы удалить должность
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setMemberToEditPosition(null);
                setPositionValue('');
              }}
              disabled={updatingPosition}
            >
              Отмена
            </Button>
            <Button onClick={handleUpdatePosition} disabled={updatingPosition}>
              {updatingPosition ? 'Сохранение...' : 'Сохранить'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!memberToDelete}
        onOpenChange={(open) => !open && setMemberToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить участника?</AlertDialogTitle>
            <AlertDialogDescription>
              Вы уверены, что хотите удалить <strong>{memberToDelete?.user?.fullName || 'участника'}</strong> из команды? Это действие нельзя отменить.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={removing}>Отмена</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemoveMember}
              disabled={removing}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {removing ? 'Удаление...' : 'Удалить'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
