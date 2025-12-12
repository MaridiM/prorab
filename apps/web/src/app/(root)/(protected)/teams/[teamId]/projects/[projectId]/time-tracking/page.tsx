'use client';

import { use, useState } from 'react';
import { useQuery, useMutation } from '@apollo/client/react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, Clock, Calendar, Users } from 'lucide-react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import {
  ProjectWorkLogsDocument,
  CreateWorkLogDocument,
  UpdateWorkLogDocument,
  DeleteWorkLogDocument,
  type ProjectWorkLogsQuery,
} from '@/packages/api/graphql/__generated__/output';
import {
  Button,
  Card,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/packages/components';
import { toast } from 'sonner';
import { WorkLogDialog } from '@/app/components/work-logs/work-log-dialog';

type WorkLog = ProjectWorkLogsQuery['projectWorkLogs'][0];

interface PageProps {
  params: Promise<{
    teamId: string;
    projectId: string;
  }>;
}

export default function TimeTrackingPage({ params }: PageProps) {
  const router = useRouter();
  const { teamId, projectId } = use(params);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState<WorkLog | null>(null);

  const { data, loading, refetch } = useQuery(ProjectWorkLogsDocument, {
    variables: { projectId },
  });

  const [deleteWorkLog, { loading: deleting }] = useMutation(DeleteWorkLogDocument, {
    onCompleted: () => {
      toast.success('Запись удалена');
      refetch();
    },
    onError: (error: any) => {
      toast.error('Ошибка', { description: error.message });
    },
  });

  const workLogs = data?.projectWorkLogs || [];

  // Group work logs by member
  const groupedByMember = workLogs.reduce((acc, log) => {
    const memberId = log.memberId;
    if (!acc[memberId]) {
      acc[memberId] = {
        member: log.member,
        logs: [],
        totalHours: 0,
      };
    }
    acc[memberId].logs.push(log);
    acc[memberId].totalHours += log.hours;
    return acc;
  }, {} as Record<string, { member: any; logs: WorkLog[]; totalHours: number }>);

  const totalProjectHours = workLogs.reduce((sum, log) => sum + log.hours, 0);

  const handleEdit = (log: WorkLog) => {
    setSelectedLog(log);
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Удалить запись о времени?')) return;
    await deleteWorkLog({ variables: { id } });
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedLog(null);
  };

  const handleSuccess = () => {
    refetch();
    handleCloseDialog();
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3" />
          <div className="h-64 bg-muted rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Учёт времени</h1>
            <p className="text-muted-foreground">Отслеживание рабочих часов по проекту</p>
          </div>
        </div>

        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Добавить запись
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/10 rounded-lg">
              <Clock className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Всего часов</p>
              <p className="text-2xl font-bold">{totalProjectHours.toFixed(2)}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-500/10 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Участников</p>
              <p className="text-2xl font-bold">{Object.keys(groupedByMember).length}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-500/10 rounded-lg">
              <Calendar className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Записей</p>
              <p className="text-2xl font-bold">{workLogs.length}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Work Logs by Member */}
      {Object.values(groupedByMember).map(({ member, logs, totalHours }) => (
        <Card key={member.id}>
          <div className="p-4 border-b bg-muted/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-sm font-bold text-primary">
                    {member.user.fullName.split(' ').map((n: string) => n[0]).join('')}
                  </span>
                </div>
                <div>
                  <p className="font-semibold">{member.user.fullName}</p>
                  <p className="text-sm text-muted-foreground">{member.user.email}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Всего часов</p>
                <p className="text-xl font-bold">{totalHours.toFixed(2)}</p>
              </div>
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Дата</TableHead>
                <TableHead>Часы</TableHead>
                <TableHead>Описание</TableHead>
                <TableHead>Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                    Нет записей
                  </TableCell>
                </TableRow>
              ) : (
                logs
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          {format(new Date(log.date), 'dd MMM yyyy', { locale: ru })}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-muted-foreground" />
                          <span className="font-semibold">{log.hours.toFixed(2)}</span>
                          <span className="text-xs text-muted-foreground">ч</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {log.description ? (
                          <p className="text-sm line-clamp-2">{log.description}</p>
                        ) : (
                          <span className="text-sm text-muted-foreground italic">Нет описания</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(log)}
                          >
                            Изменить
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(log.id)}
                            disabled={deleting}
                          >
                            Удалить
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
              )}
            </TableBody>
          </Table>
        </Card>
      ))}

      {workLogs.length === 0 && (
        <Card className="p-12 text-center">
          <Clock className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">Нет записей о времени</h3>
          <p className="text-muted-foreground mb-4">
            Начните отслеживать рабочее время для этого проекта
          </p>
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Добавить первую запись
          </Button>
        </Card>
      )}

      {/* Dialog */}
      <WorkLogDialog
        projectId={projectId}
        teamId={teamId}
        workLog={selectedLog}
        open={dialogOpen}
        onClose={handleCloseDialog}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
