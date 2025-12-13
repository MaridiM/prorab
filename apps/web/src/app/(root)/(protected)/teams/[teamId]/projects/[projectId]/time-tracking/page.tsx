'use client';

import { use, useState, useMemo } from 'react';
import { useQuery, useMutation, useLazyQuery } from '@apollo/client/react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, Clock, Calendar as CalendarIcon, Users, Download, X, Table as TableIcon, CalendarDays } from 'lucide-react';
import { format, isWithinInterval, startOfDay, endOfDay } from 'date-fns';
import { ru } from 'date-fns/locale/ru';
import {
  ProjectWorkLogsDocument,
  CreateWorkLogDocument,
  UpdateWorkLogDocument,
  DeleteWorkLogDocument,
  ExportProjectWorkLogsDocument,
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
  Popover,
  PopoverContent,
  PopoverTrigger,
  Calendar,
  Badge,
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
  const [viewMode, setViewMode] = useState<'table' | 'calendar'>('table');
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined,
  });

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

  const [exportWorkLogs, { loading: exporting }] = useLazyQuery(ExportProjectWorkLogsDocument, {
    variables: { projectId },
    onCompleted: (data) => {
      const blob = new Blob([data.exportProjectWorkLogs], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `work-logs-${projectId}-${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      URL.revokeObjectURL(url);
      toast.success('CSV экспортирован');
    },
    onError: (error) => {
      toast.error('Ошибка экспорта', { description: error.message });
    },
  });

  const allWorkLogs = data?.projectWorkLogs || [];

  // Filter work logs by date range with useMemo
  const workLogs = useMemo(() => {
    return allWorkLogs.filter((log) => {
      if (!dateRange.from && !dateRange.to) return true;
      const logDate = new Date(log.date);

      if (dateRange.from && dateRange.to) {
        return isWithinInterval(logDate, {
          start: startOfDay(dateRange.from),
          end: endOfDay(dateRange.to),
        });
      }

      if (dateRange.from) {
        return logDate >= startOfDay(dateRange.from);
      }

      if (dateRange.to) {
        return logDate <= endOfDay(dateRange.to);
      }

      return true;
    });
  }, [allWorkLogs, dateRange]);

  // Group work logs by member with useMemo
  const groupedByMember = useMemo(() => {
    return workLogs.reduce((acc, log) => {
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
  }, [workLogs]);

  const totalProjectHours = useMemo(() =>
    workLogs.reduce((sum, log) => sum + log.hours, 0),
    [workLogs]
  );

  const handleClearDateRange = () => {
    setDateRange({ from: undefined, to: undefined });
  };

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

        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 border rounded-lg p-1">
            <Button
              variant={viewMode === 'table' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('table')}
            >
              <TableIcon className="w-4 h-4 mr-1" />
              Таблица
            </Button>
            <Button
              variant={viewMode === 'calendar' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('calendar')}
            >
              <CalendarDays className="w-4 h-4 mr-1" />
              Календарь
            </Button>
          </div>

          {/* Date Range Filter */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="default">
                <CalendarIcon className="w-4 h-4 mr-2" />
                {dateRange.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, 'dd.MM.yy')} - {format(dateRange.to, 'dd.MM.yy')}
                    </>
                  ) : (
                    format(dateRange.from, 'dd MMM yyyy', { locale: ru })
                  )
                ) : (
                  'Выбрать период'
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <div className="p-3 border-b">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold">Фильтр по датам</p>
                  {(dateRange.from || dateRange.to) && (
                    <Button variant="ghost" size="sm" onClick={handleClearDateRange}>
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
              <Calendar
                mode="range"
                selected={{
                  from: dateRange.from,
                  to: dateRange.to,
                }}
                onSelect={(range: any) =>
                  setDateRange({
                    from: range?.from,
                    to: range?.to,
                  })
                }
                locale={ru}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>

          {(dateRange.from || dateRange.to) && (
            <Badge variant="secondary" className="gap-1">
              Фильтр активен
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 hover:bg-transparent"
                onClick={handleClearDateRange}
              >
                <X className="w-3 h-3" />
              </Button>
            </Badge>
          )}

          <Button variant="outline" onClick={() => exportWorkLogs()} disabled={exporting}>
            <Download className="w-4 h-4 mr-2" />
            {exporting ? 'Экспорт...' : 'Экспорт CSV'}
          </Button>
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Добавить запись
          </Button>
        </div>
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

      {/* Calendar View */}
      {viewMode === 'calendar' && (
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Календарный вид</h2>
          {workLogs.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <CalendarDays className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>Нет записей для отображения</p>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(
                workLogs.reduce((acc, log) => {
                  const dateKey = format(new Date(log.date), 'yyyy-MM-dd');
                  if (!acc[dateKey]) {
                    acc[dateKey] = [];
                  }
                  acc[dateKey].push(log);
                  return acc;
                }, {} as Record<string, WorkLog[]>)
              )
                .sort(([dateA], [dateB]) => new Date(dateB).getTime() - new Date(dateA).getTime())
                .map(([dateKey, logs]) => {
                  const totalDayHours = logs.reduce((sum, log) => sum + log.hours, 0);
                  return (
                    <div key={dateKey} className="border-l-4 border-primary pl-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <CalendarIcon className="w-5 h-5 text-primary" />
                          <div>
                            <h3 className="font-semibold">
                              {format(new Date(dateKey), 'EEEE, d MMMM yyyy', { locale: ru })}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {logs.length} {logs.length === 1 ? 'запись' : 'записей'} • {totalDayHours.toFixed(2)} ч
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2 ml-8">
                        {logs.map((log) => (
                          <div
                            key={log.id}
                            className="p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <p className="font-semibold">{log.member.user.fullName}</p>
                                  <Badge variant="secondary">{log.hours}ч</Badge>
                                </div>
                                {log.description && (
                                  <p className="text-sm text-muted-foreground">{log.description}</p>
                                )}
                              </div>
                              <div className="flex items-center gap-1">
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
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </Card>
      )}

      {/* Work Logs by Member */}
      {viewMode === 'table' && (
        <>
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
      </>
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
