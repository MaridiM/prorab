import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '../../shared/guards/auth.guard';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';
import { PayoutsService } from './payouts.service';
import { ProjectPayout } from './models/project-payout.model';
import { PayoutSummary } from './models/payout-summary.model';
import { UpdateMemberSalaryInput } from './dto/update-member-salary.input';
import { CreatePayoutInput } from './dto/create-payout.input';
import { TeamMember } from '../teams/models/team-member.model';
import { Project } from '../teams/models/project.model';

@Resolver(() => ProjectPayout)
export class PayoutsResolver {
  constructor(private readonly payoutsService: PayoutsService) {}

  // ==================== QUERIES ====================

  @Query(() => PayoutSummary, {
    description: 'Calculate payout summary for a project (owner only)',
  })
  @UseGuards(AuthGuard)
  async payoutSummary(
    @Args('projectId', { type: () => ID }) projectId: string,
    @CurrentUser() user: any
  ): Promise<PayoutSummary> {
    return this.payoutsService.calculateProjectPayouts(projectId, user.id);
  }

  @Query(() => [ProjectPayout], {
    description: 'Get all payouts for a project (owner only)',
  })
  @UseGuards(AuthGuard)
  async projectPayouts(
    @Args('projectId', { type: () => ID }) projectId: string,
    @CurrentUser() user: any
  ): Promise<ProjectPayout[]> {
    return this.payoutsService.getProjectPayouts(projectId, user.id);
  }

  @Query(() => [ProjectPayout], {
    description: 'Get all payouts for a team member (owner or member themselves)',
  })
  @UseGuards(AuthGuard)
  async memberPayouts(
    @Args('memberId', { type: () => ID }) memberId: string,
    @CurrentUser() user: any
  ): Promise<ProjectPayout[]> {
    return this.payoutsService.getMemberPayouts(memberId, user.id);
  }

  // ==================== MUTATIONS ====================

  @Mutation(() => TeamMember, {
    description: 'Update team member salary settings (owner only)',
  })
  @UseGuards(AuthGuard)
  async updateMemberSalary(
    @Args('input') input: UpdateMemberSalaryInput,
    @CurrentUser() user: any
  ): Promise<TeamMember> {
    return this.payoutsService.updateMemberSalary(input, user.id);
  }

  @Mutation(() => ProjectPayout, {
    description: 'Create or update payout (mark as paid) (owner only)',
  })
  @UseGuards(AuthGuard)
  async createPayout(
    @Args('input') input: CreatePayoutInput,
    @CurrentUser() user: any
  ): Promise<ProjectPayout> {
    return this.payoutsService.createPayout(input, user.id);
  }

  @Mutation(() => Project, {
    description: 'Close project with final calculations (owner only)',
  })
  @UseGuards(AuthGuard)
  async closeProject(
    @Args('projectId', { type: () => ID }) projectId: string,
    @CurrentUser() user: any
  ): Promise<Project> {
    return this.payoutsService.closeProject(projectId, user.id);
  }
}
