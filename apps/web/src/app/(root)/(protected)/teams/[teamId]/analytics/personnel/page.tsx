'use client';

import { use, useState } from 'react';
import { useQuery } from '@apollo/client/react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Users, Clock, DollarSign, TrendingUp, Search } from 'lucide-react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import {
  PersonnelAnalyticsDocument,
  type PersonnelAnalyticsQuery,
} from '@/packages/api/graphql/__generated__/output';
import {
  Button,
  Card,
  Input,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Badge,
} from '@/packages/components';

type PersonnelAnalytics = PersonnelAnalyticsQuery['personnelAnalytics'];
type MemberAnalytics = PersonnelAnalytics['members'][0];
type ProjectAnalytics = PersonnelAnalytics['projects'][0];

interface PageProps {
  params: Promise<{
    teamId: string;
  }>;
}

export default function PersonnelAnalyticsPage({ params }: PageProps) {
  const router = useRouter();
  const { teamId } = use(params);
  const [memberSearch, setMemberSearch] = useState('');
  const [projectSearch, setProjectSearch] = useState('');

  const { data, loading, error } = useQuery(PersonnelAnalyticsDocument, {
    variables: { teamId },
  });

  const analytics = data?.personnelAnalytics;

  // Filter members
  const filteredMembers = analytics?.members.filter((member) =>
    member.memberName.toLowerCase().includes(memberSearch.toLowerCase()) ||
    member.memberEmail.toLowerCase().includes(memberSearch.toLowerCase())
  ) || [];

  // Filter projects
  const filteredProjects = analytics?.projects.filter((project) =>
    project.projectName.toLowerCase().includes(projectSearch.toLowerCase())
  ) || [];

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-muted rounded" />
            ))}
          </div>
          <div className="h-96 bg-muted rounded" />
        </div>
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className="container mx-auto p-6">
        <Card className="p-12 text-center">
          <p className="text-lg font-semibold text-destructive mb-2">Ошибка загрузки аналитики</p>
          <p className="text-muted-foreground mb-4">
            {error?.message || 'Не удалось загрузить данные'}
          </p>
          <Button onClick={() => router.back()}>
            Вернуться назад
          </Button>
        </Card>
      </div>
    );
  }

  const getSalaryTypeLabel = (type: string) => {
    switch (type) {
      case 'FIXED':
        return 'Фикс';
      case 'PERCENTAGE':
        return '%';
      case 'NONE':
        return 'Нет';
      default:
        return type;
    }
  };

  const getSalaryTypeBadgeVariant = (type: string): 'default' | 'secondary' | 'success' | 'warning' | 'danger' => {
    switch (type) {
      case 'FIXED':
        return 'default';
      case 'PERCENTAGE':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  const getStatusBadgeVariant = (status: string): 'default' | 'secondary' | 'success' | 'warning' | 'danger' => {
    switch (status) {
      case 'ACTIVE':
        return 'success';
      case 'COMPLETED':
        return 'secondary';
      default:
        return 'warning';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'Активен';
      case 'COMPLETED':
        return 'Завершён';
      case 'ARCHIVED':
        return 'В архиве';
      default:
        return status;
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Аналитика персонала</h1>
            <p className="text-muted-foreground">
              Статистика по {analytics.teamName}
            </p>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          Обновлено: {format(new Date(analytics.generatedAt), 'dd MMM yyyy, HH:mm', { locale: ru })}
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Total Members */}
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-500/10 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Участников</p>
              <p className="text-2xl font-bold">{analytics.totalMembers}</p>
            </div>
          </div>
        </Card>

        {/* Total Hours */}
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/10 rounded-lg">
              <Clock className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Всего часов</p>
              <p className="text-2xl font-bold">{analytics.totalHoursWorked.toFixed(2)}</p>
            </div>
          </div>
        </Card>

        {/* Total Payouts */}
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-500/10 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Выплачено</p>
              <p className="text-2xl font-bold">{analytics.totalPayouts.toFixed(2)} ₽</p>
            </div>
          </div>
        </Card>

        {/* Average per Member */}
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-500/10 rounded-lg">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Средняя выплата</p>
              <p className="text-2xl font-bold">{analytics.averagePayoutPerMember.toFixed(2)} ₽</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Member Performance Table */}
      <Card>
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Производительность участников</h2>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Поиск по имени или email..."
                value={memberSearch}
                onChange={(e) => setMemberSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Участник</TableHead>
              <TableHead>Роль</TableHead>
              <TableHead>Зарплата</TableHead>
              <TableHead className="text-right">Проектов</TableHead>
              <TableHead className="text-right">Часов</TableHead>
              <TableHead className="text-right">Выплачено</TableHead>
              <TableHead className="text-right">Средняя выплата</TableHead>
              <TableHead className="text-right">Выплат</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredMembers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  {memberSearch ? 'Участники не найдены' : 'Нет участников'}
                </TableCell>
              </TableRow>
            ) : (
              filteredMembers.map((member) => (
                <TableRow key={member.memberId}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        {member.avatarUrl ? (
                          <img
                            src={member.avatarUrl}
                            alt={member.memberName}
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-sm font-bold text-primary">
                            {member.memberName.split(' ').map((n) => n[0]).join('')}
                          </span>
                        )}
                      </div>
                      <div>
                        <p className="font-semibold">{member.memberName}</p>
                        <p className="text-sm text-muted-foreground">{member.memberEmail}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{member.role}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Badge variant={getSalaryTypeBadgeVariant(member.salaryType)}>
                        {getSalaryTypeLabel(member.salaryType)}
                      </Badge>
                      {member.salaryAmount && (
                        <span className="text-sm text-muted-foreground">
                          {member.salaryAmount.toFixed(2)} {member.salaryType === 'PERCENTAGE' ? '%' : '₽'}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">{member.projectsCount}</TableCell>
                  <TableCell className="text-right font-semibold">
                    {member.totalHoursWorked.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right font-semibold text-green-600">
                    {member.totalPayouts.toFixed(2)} ₽
                  </TableCell>
                  <TableCell className="text-right">
                    {member.averagePayoutPerProject.toFixed(2)} ₽
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="text-green-600">{member.completedPayoutsCount}</span>
                    {member.pendingPayoutsCount > 0 && (
                      <span className="text-muted-foreground"> / {member.pendingPayoutsCount}</span>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Project Performance Table */}
      <Card>
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Производительность проектов</h2>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Поиск по названию..."
                value={projectSearch}
                onChange={(e) => setProjectSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Проект</TableHead>
              <TableHead>Статус</TableHead>
              <TableHead className="text-right">Бюджет</TableHead>
              <TableHead className="text-right">Часов</TableHead>
              <TableHead className="text-right">Выплачено</TableHead>
              <TableHead className="text-right">Участников</TableHead>
              <TableHead className="text-right">Период</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProjects.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  {projectSearch ? 'Проекты не найдены' : 'Нет проектов'}
                </TableCell>
              </TableRow>
            ) : (
              filteredProjects.map((project) => (
                <TableRow key={project.projectId}>
                  <TableCell className="font-semibold">{project.projectName}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(project.status)}>
                      {getStatusLabel(project.status)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {project.budget ? `${project.budget.toFixed(2)} ₽` : '—'}
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    {project.totalHoursWorked.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right font-semibold text-green-600">
                    {project.totalPayouts.toFixed(2)} ₽
                  </TableCell>
                  <TableCell className="text-right">{project.membersCount}</TableCell>
                  <TableCell className="text-right text-sm text-muted-foreground">
                    {project.startDate && project.endDate ? (
                      <>
                        {format(new Date(project.startDate), 'dd.MM.yy', { locale: ru })} —{' '}
                        {format(new Date(project.endDate), 'dd.MM.yy', { locale: ru })}
                      </>
                    ) : project.startDate ? (
                      format(new Date(project.startDate), 'dd MMM yyyy', { locale: ru })
                    ) : (
                      '—'
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Empty State */}
      {analytics.members.length === 0 && analytics.projects.length === 0 && (
        <Card className="p-12 text-center">
          <Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">Нет данных для аналитики</h3>
          <p className="text-muted-foreground mb-4">
            Добавьте участников и создайте проекты для отображения аналитики
          </p>
        </Card>
      )}
    </div>
  );
}
