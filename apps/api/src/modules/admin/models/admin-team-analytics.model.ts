import { ObjectType, Field, Int, Float } from '@nestjs/graphql';

@ObjectType({ description: 'Team growth chart data over time' })
export class TeamGrowthChart {
  @Field(() => [String], { description: 'Month labels (e.g., "Jan 2025")' })
  labels: string[];

  @Field(() => [Int], { description: 'Member count data points' })
  memberData: number[];

  @Field(() => [Int], { description: 'Project count data points' })
  projectData: number[];
}

@ObjectType({ description: 'Member activity metrics' })
export class MemberActivity {
  @Field(() => String, { description: 'User ID' })
  userId: string;

  @Field(() => String, { description: 'User full name' })
  userName: string;

  @Field(() => String, { nullable: true, description: 'User avatar URL' })
  avatarUrl: string | null;

  @Field(() => String, { nullable: true, description: 'User email' })
  email: string | null;

  @Field(() => String, { description: 'Team role (OWNER/MEMBER)' })
  role: string;

  @Field(() => String, { nullable: true, description: 'Position in team' })
  position: string | null;

  @Field(() => Int, { description: 'Total actions count (work logs, expenses, etc.)' })
  actionsCount: number;

  @Field(() => Date, { nullable: true, description: 'Last activity timestamp' })
  lastActiveAt: Date | null;

  @Field(() => Float, { description: 'Total hours logged' })
  hoursLogged: number;

  @Field(() => Int, { description: 'Projects participated in' })
  projectsCount: number;

  @Field(() => Date, { description: 'Date joined the team' })
  joinedAt: Date;
}

@ObjectType({ description: 'Role distribution count' })
export class RoleCount {
  @Field(() => String, { description: 'Role name' })
  role: string;

  @Field(() => Int, { description: 'Count of members with this role' })
  count: number;
}

@ObjectType({ description: 'Position distribution count' })
export class PositionCount {
  @Field(() => String, { description: 'Position name' })
  position: string;

  @Field(() => Int, { description: 'Count of members with this position' })
  count: number;
}

@ObjectType({ description: 'Salary type distribution' })
export class SalaryDistribution {
  @Field(() => Int, { description: 'Members with fixed salary' })
  fixed: number;

  @Field(() => Int, { description: 'Members with percentage-based salary' })
  percentage: number;

  @Field(() => Int, { description: 'Members without salary settings' })
  none: number;

  @Field(() => Float, { description: 'Total salary amount (fixed + calculated)' })
  totalAmount: number;
}

@ObjectType({ description: 'Team composition analysis' })
export class TeamComposition {
  @Field(() => [RoleCount], { description: 'Members grouped by role' })
  byRole: RoleCount[];

  @Field(() => [PositionCount], { description: 'Members grouped by position' })
  byPosition: PositionCount[];

  @Field(() => SalaryDistribution, { description: 'Salary type distribution' })
  salaryDistribution: SalaryDistribution;

  @Field(() => Int, { description: 'Total team members count' })
  totalMembers: number;
}

@ObjectType({ description: 'Storage usage per project' })
export class ProjectStorageUsage {
  @Field(() => String, { description: 'Project ID' })
  projectId: string;

  @Field(() => String, { description: 'Project name' })
  projectName: string;

  @Field(() => Float, { description: 'Used storage in bytes' })
  usedBytes: number;

  @Field(() => Int, { description: 'Number of files' })
  filesCount: number;

  @Field(() => Float, { description: 'Percentage of total team storage' })
  percentage: number;
}

@ObjectType({ description: 'Team storage usage breakdown' })
export class TeamStorageUsage {
  @Field(() => Float, { description: 'Total storage limit in bytes' })
  totalBytes: number;

  @Field(() => Float, { description: 'Used storage in bytes' })
  usedBytes: number;

  @Field(() => Float, { description: 'Used percentage (0-100)' })
  usedPercentage: number;

  @Field(() => Float, { description: 'Used storage in gigabytes' })
  usedGB: number;

  @Field(() => [ProjectStorageUsage], { description: 'Storage breakdown by project' })
  byProject: ProjectStorageUsage[];
}

@ObjectType({ description: 'Team key performance indicators' })
export class TeamKPIs {
  @Field(() => Float, { description: 'Member retention rate (0-100%)' })
  memberRetention: number;

  @Field(() => Float, { description: 'Project completion rate (0-100%)' })
  projectCompletionRate: number;

  @Field(() => Int, { description: 'Average project duration in days' })
  avgProjectDurationDays: number;

  @Field(() => Float, { description: 'Total revenue from projects' })
  totalRevenue: number;

  @Field(() => Int, { description: 'Active projects count' })
  activeProjectsCount: number;

  @Field(() => Int, { description: 'Completed projects count' })
  completedProjectsCount: number;

  @Field(() => Int, { description: 'Archived projects count' })
  archivedProjectsCount: number;

  @Field(() => Int, { description: 'Total team members' })
  totalMembers: number;

  @Field(() => Float, { description: 'Total hours worked by team' })
  totalHoursWorked: number;

  @Field(() => Float, { description: 'Average hours per member' })
  avgHoursPerMember: number;

  @Field(() => Float, { description: 'Total expenses amount' })
  totalExpenses: number;

  @Field(() => Float, { description: 'Total budget across projects' })
  totalBudget: number;

  @Field(() => Float, { description: 'Profit (budget - expenses)' })
  profit: number;
}

@ObjectType({ description: 'Combined team analytics data' })
export class TeamAnalytics {
  @Field(() => String, { description: 'Team ID' })
  teamId: string;

  @Field(() => String, { description: 'Team name' })
  teamName: string;

  @Field(() => TeamKPIs, { description: 'Key performance indicators' })
  kpis: TeamKPIs;

  @Field(() => TeamGrowthChart, { description: 'Growth chart data' })
  growthChart: TeamGrowthChart;

  @Field(() => [MemberActivity], { description: 'Member activity metrics' })
  memberActivity: MemberActivity[];

  @Field(() => TeamComposition, { description: 'Team composition analysis' })
  composition: TeamComposition;

  @Field(() => TeamStorageUsage, { description: 'Storage usage breakdown' })
  storageUsage: TeamStorageUsage;
}
