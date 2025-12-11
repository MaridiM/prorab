'use client';

import { use, useState } from 'react';
import { useQuery } from '@apollo/client/react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, UserPlus, Users } from 'lucide-react';
import { Button } from '@/packages/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/packages/components/ui/card';
import { Skeleton } from '@/packages/components/ui/skeleton';
import { TeamMembersDocument } from '@/packages/api/graphql/__generated__/output';
import { PeopleTable } from '@/app/components/people/people-table';
import { InviteLinkDialog } from '@/app/components/people/invite-link-dialog';

interface PageProps {
  params: Promise<{
    teamId: string;
  }>;
}

export default function PeoplePage({ params }: PageProps) {
  const router = useRouter();
  const { teamId } = use(params);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);

  const { data, loading, refetch } = useQuery(TeamMembersDocument, {
    variables: { teamId },
  });

  const members = data?.teamMembers || [];

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        {/* Header Skeleton */}
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-8 w-64" />
        </div>

        {/* Card Skeleton */}
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-96 mt-2" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push(`/teams/${teamId}`)}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Управление персоналом</h1>
              <p className="text-sm text-muted-foreground">
                {members.length} {members.length === 1 ? 'участник' : 'участников'}
              </p>
            </div>
          </div>
        </div>

        <Button onClick={() => setInviteDialogOpen(true)}>
          <UserPlus className="mr-2 h-4 w-4" />
          Пригласить участника
        </Button>
      </div>

      {/* People Table */}
      <Card>
        <CardHeader>
          <CardTitle>Участники команды</CardTitle>
          <CardDescription>
            Управляйте участниками команды, настраивайте условия оплаты и отслеживайте статистику
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <PeopleTable
            members={members}
            teamId={teamId}
            onRefetch={refetch}
          />
        </CardContent>
      </Card>

      {/* Invite Dialog */}
      <InviteLinkDialog
        teamId={teamId}
        open={inviteDialogOpen}
        onClose={() => setInviteDialogOpen(false)}
      />
    </div>
  );
}
