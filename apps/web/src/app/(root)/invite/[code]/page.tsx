'use client';

import { use, useEffect } from 'react';
import { useMutation } from '@apollo/client/react';
import { useRouter } from 'next/navigation';
import { Check, Users, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/packages/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/packages/components/ui/card';
import { Alert, AlertDescription } from '@/packages/components/ui/alert';
import { toast } from 'sonner';
import { JoinTeamByInviteDocument } from '@/packages/api/graphql/__generated__/output';
import { useAuth } from '@/packages/providers/auth-provider';

interface PageProps {
  params: Promise<{
    code: string;
  }>;
}

export default function InviteCodePage({ params }: PageProps) {
  const router = useRouter();
  const { code } = use(params);
  const { user, loading: authLoading } = useAuth();

  const [joinTeamByInvite, { data, loading, error }] = useMutation(JoinTeamByInviteDocument, {
    onCompleted: (data) => {
      toast.success('Успешно!', {
        description: `Вы присоединились к команде "${data.joinTeamByInvite.team?.name}"`,
      });

      // Redirect to team page after successful join
      setTimeout(() => {
        router.push(`/teams/${data.joinTeamByInvite.teamId}`);
      }, 2000);
    },
    onError: (error: any) => {
      toast.error('Ошибка', {
        description: error.message,
      });
    },
  });

  const handleJoinTeam = async () => {
    if (!user) {
      // Store the invite code and redirect to login
      sessionStorage.setItem('pendingInviteCode', code);
      router.push('/auth/login?redirect=/invite/' + code);
      return;
    }

    await joinTeamByInvite({
      variables: { code },
    });
  };

  // Auto-join if user is logged in and they just got redirected back
  useEffect(() => {
    const pendingCode = sessionStorage.getItem('pendingInviteCode');
    if (user && pendingCode === code && !data && !loading && !error) {
      sessionStorage.removeItem('pendingInviteCode');
      handleJoinTeam();
    }
  }, [user, code]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-primary/10">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center space-x-2">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <p className="text-muted-foreground">Загрузка...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Success state
  if (data) {
    const team = data.joinTeamByInvite.team;
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-background to-green-100 dark:from-green-950/20 dark:via-background dark:to-green-900/20">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
              <Check className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <CardTitle className="text-2xl">Вы в команде!</CardTitle>
            <CardDescription>
              Вы успешно присоединились к команде <strong>{team?.name}</strong>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <Users className="h-4 w-4" />
              <AlertDescription>
                Перенаправление на страницу команды через несколько секунд...
              </AlertDescription>
            </Alert>
            <Button
              className="w-full"
              onClick={() => router.push(`/teams/${data.joinTeamByInvite.teamId}`)}
            >
              Перейти к команде
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-destructive/5 via-background to-destructive/10">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
              <AlertCircle className="h-8 w-8 text-destructive" />
            </div>
            <CardTitle className="text-2xl">Не удалось присоединиться</CardTitle>
            <CardDescription>{error.message}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Эта ссылка-приглашение может быть использована, истёкшей или недействительной.
              </AlertDescription>
            </Alert>
            <Button className="w-full" variant="outline" onClick={() => router.push('/')}>
              Вернуться на главную
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Initial state - show join button
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-primary/10">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Users className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Приглашение в команду</CardTitle>
          <CardDescription>
            Вас пригласили присоединиться к команде в ProRab
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-muted p-4 text-center">
            <p className="text-sm text-muted-foreground mb-2">Код приглашения</p>
            <code className="text-lg font-mono font-bold">{code}</code>
          </div>

          {!user && (
            <Alert>
              <AlertDescription>
                Чтобы присоединиться к команде, необходимо войти в систему
              </AlertDescription>
            </Alert>
          )}

          <Button
            className="w-full"
            onClick={handleJoinTeam}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Присоединение...
              </>
            ) : user ? (
              'Присоединиться к команде'
            ) : (
              'Войти и присоединиться'
            )}
          </Button>

          <Button
            className="w-full"
            variant="outline"
            onClick={() => router.push('/')}
          >
            Отмена
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
