import { ObjectType, Field, Int, Float } from '@nestjs/graphql';

@ObjectType()
export class UsersByBusinessRole {
  @Field(() => Int, { description: 'FOREMAN users' })
  FOREMAN: number;

  @Field(() => Int, { description: 'WORKER users' })
  WORKER: number;

  @Field(() => Int, { description: 'Unassigned users' })
  unassigned: number;
}

@ObjectType()
export class DashboardUserStats {
  @Field(() => Int, { description: 'Total number of users' })
  total: number;

  @Field(() => Int, { description: 'Number of verified users' })
  verified: number;

  @Field(() => Int, { description: 'Number of admin users' })
  admins: number;

  @Field(() => Int, { description: 'New users this month' })
  newThisMonth: number;

  @Field(() => Float, { description: 'Growth rate percentage' })
  growthRate: number;

  @Field(() => UsersByBusinessRole, { description: 'Users by business role' })
  byBusinessRole: UsersByBusinessRole;

  @Field(() => Int, { description: 'Active users in last week' })
  activeLastWeek: number;

  @Field(() => Int, { description: 'Active users in last month' })
  activeLastMonth: number;
}

@ObjectType()
export class TopTeamItem {
  @Field(() => String, { description: 'Team ID' })
  id: string;

  @Field(() => String, { description: 'Team name' })
  name: string;

  @Field(() => Int, { description: 'Members count' })
  membersCount: number;

  @Field(() => String, { description: 'Owner name' })
  ownerName: string;
}

@ObjectType()
export class DashboardTeamStats {
  @Field(() => Int, { description: 'Total number of teams' })
  total: number;

  @Field(() => Int, { description: 'Teams with active subscription' })
  withActiveSubscription: number;

  @Field(() => Float, { description: 'Average members per team' })
  averageMembers: number;

  @Field(() => Int, { description: 'New teams this month' })
  newThisMonth: number;

  @Field(() => [TopTeamItem], { description: 'Top teams by member count' })
  topTeamsByMembers: TopTeamItem[];
}

@ObjectType()
export class ProjectsByTeamItem {
  @Field(() => String, { description: 'Team ID' })
  teamId: string;

  @Field(() => String, { description: 'Team name' })
  teamName: string;

  @Field(() => Int, { description: 'Projects count' })
  projectsCount: number;
}

@ObjectType()
export class DashboardProjectStats {
  @Field(() => Int, { description: 'Total number of projects' })
  total: number;

  @Field(() => Int, { description: 'Active projects' })
  active: number;

  @Field(() => Int, { description: 'Completed projects' })
  completed: number;

  @Field(() => Int, { description: 'Archived projects' })
  archived: number;

  @Field(() => [ProjectsByTeamItem], { description: 'Projects by team' })
  byTeam: ProjectsByTeamItem[];
}

@ObjectType()
export class DashboardSubscriptionsByPlan {
  @Field(() => Int, { description: 'LITE subscriptions' })
  LITE: number;

  @Field(() => Int, { description: 'FOREMAN subscriptions' })
  FOREMAN: number;

  @Field(() => Int, { description: 'BRIGADE subscriptions' })
  BRIGADE: number;
}

@ObjectType()
export class DashboardSubscriptionStats {
  @Field(() => Int, { description: 'Total subscriptions' })
  total: number;

  @Field(() => Int, { description: 'Active subscriptions' })
  active: number;

  @Field(() => Int, { description: 'Trialing subscriptions' })
  trialing: number;

  @Field(() => Int, { description: 'Cancelled subscriptions' })
  cancelled: number;

  @Field(() => DashboardSubscriptionsByPlan, { description: 'Subscriptions by plan' })
  byPlan: DashboardSubscriptionsByPlan;
}

@ObjectType()
export class TopPayingTeamItem {
  @Field(() => String, { description: 'Team ID' })
  teamId: string;

  @Field(() => String, { description: 'Team name' })
  teamName: string;

  @Field(() => Float, { description: 'Total paid amount' })
  totalPaid: number;
}

@ObjectType()
export class DashboardPaymentStats {
  @Field(() => Int, { description: 'Total payments' })
  total: number;

  @Field(() => Int, { description: 'Succeeded payments' })
  succeeded: number;

  @Field(() => Float, { description: 'Total revenue' })
  totalRevenue: number;

  @Field(() => Float, { description: 'Revenue this month' })
  thisMonthRevenue: number;

  @Field(() => Float, { description: 'Average payment amount' })
  averagePayment: number;

  @Field(() => [TopPayingTeamItem], { description: 'Top paying teams' })
  topPayingTeams: TopPayingTeamItem[];
}

@ObjectType()
export class DashboardStorageStats {
  @Field(() => Float, { description: 'Total storage used in bytes' })
  totalUsedBytes: number;

  @Field(() => Float, { description: 'Total storage used in GB' })
  totalUsedGB: number;

  @Field(() => Float, { description: 'Average storage per team in bytes' })
  averagePerTeam: number;
}

@ObjectType()
export class DashboardStats {
  @Field(() => DashboardUserStats, { description: 'User statistics' })
  users: DashboardUserStats;

  @Field(() => DashboardTeamStats, { description: 'Team statistics' })
  teams: DashboardTeamStats;

  @Field(() => DashboardProjectStats, { description: 'Project statistics' })
  projects: DashboardProjectStats;

  @Field(() => DashboardSubscriptionStats, { description: 'Subscription statistics' })
  subscriptions: DashboardSubscriptionStats;

  @Field(() => DashboardPaymentStats, { description: 'Payment statistics' })
  payments: DashboardPaymentStats;

  @Field(() => DashboardStorageStats, { description: 'Storage statistics' })
  storage: DashboardStorageStats;
}

@ObjectType()
export class ChartData {
  @Field(() => [String], { description: 'Chart labels' })
  labels: string[];

  @Field(() => [Float], { description: 'Chart data points' })
  data: number[];
}

@ObjectType()
export class ActivityLog {
  @Field(() => String, { description: 'Log ID' })
  id: string;

  @Field(() => String, { description: 'Action performed' })
  action: string;

  @Field(() => String, { description: 'Resource type' })
  resource: string;

  @Field(() => String, { description: 'Resource ID' })
  resourceId: string;

  @Field(() => String, { description: 'Admin user email' })
  adminUserEmail: string;

  @Field(() => Date, { description: 'Action timestamp' })
  createdAt: Date;
}

@ObjectType()
export class SystemHealth {
  @Field(() => Boolean, { description: 'Database health status' })
  database: boolean;

  @Field(() => Boolean, { description: 'Storage availability' })
  storageAvailable: boolean;

  @Field(() => Date, { nullable: true, description: 'Last backup timestamp' })
  lastBackup: Date | null;
}
