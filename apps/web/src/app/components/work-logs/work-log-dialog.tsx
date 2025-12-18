'use client';

import { useState, useEffect } from 'react';
import { useMutation, useQuery } from '@apollo/client/react';
import { format } from 'date-fns';
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
import { Textarea } from '@/packages/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/packages/components/ui/select';
import { toast } from 'sonner';
import {
  CreateWorkLogDocument,
  UpdateWorkLogDocument,
  TeamMembersDocument,
  type ProjectWorkLogsQuery,
} from '@/packages/api/graphql/__generated__/output';

type WorkLog = ProjectWorkLogsQuery['projectWorkLogs'][0];

interface WorkLogDialogProps {
  projectId: string;
  teamId: string;
  workLog?: WorkLog | null;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function WorkLogDialog({
  projectId,
  teamId,
  workLog,
  open,
  onClose,
  onSuccess,
}: WorkLogDialogProps) {
  const [memberId, setMemberId] = useState('');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [hours, setHours] = useState('');
  const [description, setDescription] = useState('');

  // Get team members
  const { data: teamData } = useQuery(TeamMembersDocument, {
    variables: { teamId },
    skip: !teamId || !open,
  });

  useEffect(() => {
    if (workLog) {
      setMemberId(workLog.memberId);
      setDate(format(new Date(workLog.date), 'yyyy-MM-dd'));
      setHours(workLog.hours.toString());
      setDescription(workLog.description || '');
    } else {
      // Reset form
      setMemberId('');
      setDate(format(new Date(), 'yyyy-MM-dd'));
      setHours('');
      setDescription('');
    }
  }, [workLog, open]);

  const [createWorkLog, { loading: creating }] = useMutation(CreateWorkLogDocument, {
    onCompleted: () => {
      toast.success('Запись добавлена');
      onSuccess();
    },
    onError: (error: any) => {
      toast.error('Ошибка', { description: error.message });
    },
  });

  const [updateWorkLog, { loading: updating }] = useMutation(UpdateWorkLogDocument, {
    onCompleted: () => {
      toast.success('Запись обновлена');
      onSuccess();
    },
    onError: (error: any) => {
      toast.error('Ошибка', { description: error.message });
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const hoursNum = parseFloat(hours);

    if (!memberId) {
      toast.error('Выберите участника');
      return;
    }

    if (!date) {
      toast.error('Укажите дату');
      return;
    }

    if (!hours || hoursNum <= 0 || hoursNum > 24) {
      toast.error('Укажите корректное количество часов (0.01-24)');
      return;
    }

    if (workLog) {
      // Update existing
      await updateWorkLog({
        variables: {
          input: {
            id: workLog.id,
            date,
            hours: hoursNum,
            description: description || null,
          },
        },
      });
    } else {
      // Create new
      await createWorkLog({
        variables: {
          input: {
            projectId,
            memberId,
            date,
            hours: hoursNum,
            description: description || null,
          },
        },
      });
    }
  };

  const loading = creating || updating;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{workLog ? 'Редактировать запись' : 'Добавить запись о времени'}</DialogTitle>
            <DialogDescription>
              {workLog
                ? 'Измените данные о рабочем времени'
                : 'Укажите количество часов работы участника'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Member Selection - Only for new records */}
            {!workLog && (
              <div className="space-y-2">
                <Label htmlFor="member">Участник *</Label>
                <Select value={memberId} onValueChange={setMemberId}>
                  <SelectTrigger id="member">
                    <SelectValue placeholder="Выберите участника" />
                  </SelectTrigger>
                  <SelectContent>
                    {teamData?.teamMembers && teamData.teamMembers.length > 0 ? (
                      teamData.teamMembers.map((member) => (
                        <SelectItem key={member.id} value={member.id}>
                          {member.user?.fullName || 'Unknown'} ({member.user?.email || ''})
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="__no_members__" disabled>
                        Нет участников
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Date */}
            <div className="space-y-2">
              <Label htmlFor="date">Дата *</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>

            {/* Hours */}
            <div className="space-y-2">
              <Label htmlFor="hours">Часы *</Label>
              <Input
                id="hours"
                type="number"
                step="0.01"
                min="0.01"
                max="24"
                value={hours}
                onChange={(e) => setHours(e.target.value)}
                placeholder="8.00"
                required
              />
              <p className="text-xs text-muted-foreground">
                Укажите количество часов (от 0.01 до 24)
              </p>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Описание</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Что было сделано..."
                rows={3}
                maxLength={2000}
              />
              <p className="text-xs text-muted-foreground text-right">
                {description.length}/2000
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Отмена
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Сохранение...' : workLog ? 'Сохранить' : 'Добавить'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
