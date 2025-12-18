'use client';

import { useState, useMemo } from 'react';
import { useQuery } from '@apollo/client/react';
import { useParams, useRouter } from 'next/navigation';
import { Download, Filter, ArrowLeft, Calendar, CreditCard, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale/ru';

import {
  MemberPayoutsDocument,
  type MemberPayoutsQuery,
  PaymentMethod,
} from '@/packages/api/graphql/__generated__/output';
import {
  Button,
  Card,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Badge,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/packages/components';
import { MemberSalaryBadge } from '@/packages/components/payouts/MemberSalaryBadge';
import { toast } from 'sonner';

type Payout = MemberPayoutsQuery['memberPayouts'][0];

const STATUS_LABELS = {
  pending: 'Ожидает',
  paid: 'Выплачено',
};

const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  [PaymentMethod.Cash]: 'Наличные',
  [PaymentMethod.Card]: 'Банковская карта',
  [PaymentMethod.Transfer]: 'Банковский перевод',
  [PaymentMethod.Sbp]: 'СБП',
};

export default function MemberPayoutsPage() {
  const params = useParams();
  const router = useRouter();
  const teamId = params.teamId as string;
  const memberId = params.memberId as string;

  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [projectFilter, setProjectFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all'); // all, this-month, last-month, this-year

  const { data, loading, error } = useQuery(MemberPayoutsDocument, {
    variables: { memberId },
    skip: !memberId,
  });

  // Extract unique projects for filter
  const projects = useMemo(() => {
    if (!data?.memberPayouts) return [];
    const projectMap = new Map<string, string>();
    data.memberPayouts.forEach((payout) => {
      if (payout.project) {
        projectMap.set(payout.projectId, payout.project.name);
      }
    });
    return Array.from(projectMap.entries()).map(([id, name]) => ({ id, name }));
  }, [data]);

  // Apply filters
  const filteredPayouts = useMemo(() => {
    if (!data?.memberPayouts) return [];

    let payouts = [...data.memberPayouts];

    // Status filter
    if (statusFilter !== 'all') {
      payouts = payouts.filter((p) => p.status === statusFilter);
    }

    // Project filter
    if (projectFilter !== 'all') {
      payouts = payouts.filter((p) => p.projectId === projectFilter);
    }

    // Date filter
    if (dateFilter !== 'all') {
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();

      payouts = payouts.filter((p) => {
        const date = p.paidAt ? new Date(p.paidAt) : new Date(p.createdAt);
        const month = date.getMonth();
        const year = date.getFullYear();

        if (dateFilter === 'this-month') {
          return month === currentMonth && year === currentYear;
        } else if (dateFilter === 'last-month') {
          const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
          const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
          return month === lastMonth && year === lastMonthYear;
        } else if (dateFilter === 'this-year') {
          return year === currentYear;
        }
        return true;
      });
    }

    // Sort by date (newest first)
    payouts.sort((a, b) => {
      const dateA = a.paidAt ? new Date(a.paidAt) : new Date(a.createdAt);
      const dateB = b.paidAt ? new Date(b.paidAt) : new Date(b.createdAt);
      return dateB.getTime() - dateA.getTime();
    });

    return payouts;
  }, [data, statusFilter, projectFilter, dateFilter]);

  // Calculate totals
  const totals = useMemo(() => {
    const total = filteredPayouts.reduce(
      (acc, p) => acc + (p.actualAmount || p.calculatedAmount),
      0
    );
    const paid = filteredPayouts
      .filter((p) => p.status === 'paid')
      .reduce((acc, p) => acc + (p.actualAmount || p.calculatedAmount), 0);
    const pending = filteredPayouts
      .filter((p) => p.status === 'pending')
      .reduce((acc, p) => acc + (p.actualAmount || p.calculatedAmount), 0);

    return { total, paid, pending };
  }, [filteredPayouts]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date: string) => {
    return format(new Date(date), 'dd MMM yyyy', { locale: ru });
  };

  // Export to CSV
  const exportToCSV = () => {
    if (filteredPayouts.length === 0) {
      toast.error('Нет данных для экспорта');
      return;
    }

    const headers = [
      'Дата создания',
      'Дата выплаты',
      'Проект',
      'Сумма расчётная',
      'Сумма фактическая',
      'Статус',
      'Метод оплаты',
      'Примечания',
    ];

    const rows = filteredPayouts.map((payout) => [
      formatDate(payout.createdAt),
      payout.paidAt ? formatDate(payout.paidAt) : '-',
      payout.project?.name || '-',
      payout.calculatedAmount.toString(),
      (payout.actualAmount || payout.calculatedAmount).toString(),
      STATUS_LABELS[payout.status as keyof typeof STATUS_LABELS] || payout.status,
      payout.paymentMethod
        ? PAYMENT_METHOD_LABELS[payout.paymentMethod as PaymentMethod]
        : '-',
      payout.notes || '-',
    ]);

    const csvContent = [headers, ...rows].map((row) => row.join(',')).join('\n');
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `payouts-${memberId}-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
    URL.revokeObjectURL(url);

    toast.success('CSV файл загружен');
  };

  // Export to PDF (placeholder - requires library like jsPDF or react-pdf)
  const exportToPDF = () => {
    toast.info('Экспорт в PDF будет доступен в следующей версии', {
      description: 'Используйте CSV экспорт для табличных данных',
    });
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

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Card className="p-8 text-center">
          <p className="text-destructive">Ошибка загрузки данных: {error.message}</p>
        </Card>
      </div>
    );
  }

  const memberName = data?.memberPayouts[0]?.member?.user?.fullName || 'Участник';

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push(`/teams/${teamId}/people`)}
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <h1 className="text-3xl font-bold">История выплат</h1>
          </div>
          <p className="text-muted-foreground ml-11">{memberName}</p>
        </div>

        {/* Export buttons */}
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={exportToCSV}>
            <Download className="w-4 h-4 mr-2" />
            CSV
          </Button>
          <Button variant="outline" onClick={exportToPDF}>
            <Download className="w-4 h-4 mr-2" />
            PDF
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <p className="text-sm text-muted-foreground mb-1">Всего выплат</p>
          <p className="text-2xl font-bold">{formatCurrency(totals.total)}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {filteredPayouts.length} {filteredPayouts.length === 1 ? 'выплата' : 'выплат'}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground mb-1">Выплачено</p>
          <p className="text-2xl font-bold text-green-600">{formatCurrency(totals.paid)}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {filteredPayouts.filter((p) => p.status === 'paid').length} выплат
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground mb-1">Ожидает выплаты</p>
          <p className="text-2xl font-bold text-orange-600">{formatCurrency(totals.pending)}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {filteredPayouts.filter((p) => p.status === 'pending').length} выплат
          </p>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <h2 className="font-semibold">Фильтры</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Status Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Статус</label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все статусы</SelectItem>
                <SelectItem value="pending">Ожидает</SelectItem>
                <SelectItem value="paid">Выплачено</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Project Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Проект</label>
            <Select value={projectFilter} onValueChange={setProjectFilter}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все проекты</SelectItem>
                {projects.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Период</label>
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Весь период</SelectItem>
                <SelectItem value="this-month">Этот месяц</SelectItem>
                <SelectItem value="last-month">Прошлый месяц</SelectItem>
                <SelectItem value="this-year">Этот год</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Payouts Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Дата</TableHead>
              <TableHead>Проект</TableHead>
              <TableHead>Тип оплаты</TableHead>
              <TableHead>Сумма</TableHead>
              <TableHead>Статус</TableHead>
              <TableHead>Метод оплаты</TableHead>
              <TableHead>Действия</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPayouts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  Нет данных
                </TableCell>
              </TableRow>
            ) : (
              filteredPayouts.map((payout) => (
                <TableRow key={payout.id}>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-3 h-3 text-muted-foreground" />
                        {formatDate(payout.paidAt || payout.createdAt)}
                      </div>
                      {payout.paidAt && (
                        <p className="text-xs text-muted-foreground">
                          Создано: {formatDate(payout.createdAt)}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="font-medium">{payout.project?.name || '-'}</p>
                  </TableCell>
                  <TableCell>
                    <MemberSalaryBadge
                      salaryType={payout.member.salaryType as "FIXED" | "PERCENTAGE" | "NONE"}
                      salaryAmount={payout.member.salaryAmount}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <p className="font-semibold">
                        {formatCurrency(payout.actualAmount || payout.calculatedAmount)}
                      </p>
                      {payout.actualAmount &&
                        payout.actualAmount !== payout.calculatedAmount && (
                          <p className="text-xs text-muted-foreground line-through">
                            {formatCurrency(payout.calculatedAmount)}
                          </p>
                        )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {payout.status === 'paid' ? (
                      <Badge variant="default" className="bg-green-600">
                        Выплачено
                      </Badge>
                    ) : (
                      <Badge variant="secondary">Ожидает</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {payout.paymentMethod ? (
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">
                          {PAYMENT_METHOD_LABELS[payout.paymentMethod as PaymentMethod]}
                        </span>
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {payout.receiptUrl ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(payout.receiptUrl!, '_blank')}
                      >
                        <FileText className="w-4 h-4 mr-1" />
                        Чек
                      </Button>
                    ) : (
                      <span className="text-xs text-muted-foreground">-</span>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Notes section if any payout has notes */}
      {filteredPayouts.some((p) => p.notes) && (
        <Card className="p-4">
          <h3 className="font-semibold mb-3">Примечания</h3>
          <div className="space-y-2">
            {filteredPayouts
              .filter((p) => p.notes)
              .map((payout) => (
                <div key={payout.id} className="text-sm">
                  <span className="font-medium">{payout.project?.name}:</span>{' '}
                  <span className="text-muted-foreground">{payout.notes}</span>
                </div>
              ))}
          </div>
        </Card>
      )}
    </div>
  );
}
