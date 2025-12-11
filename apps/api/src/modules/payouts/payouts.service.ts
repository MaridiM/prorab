import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { CoreService } from '../../core/core.service';
import { UpdateMemberSalaryInput } from './dto/update-member-salary.input';
import { CreatePayoutInput } from './dto/create-payout.input';
import { PayoutSummary, MemberPayoutDetail } from './models/payout-summary.model';
import { ProjectPayout } from './models/project-payout.model';

@Injectable()
export class PayoutsService extends CoreService {
  /**
   * Calculate payouts for all team members of a project
   * Business logic:
   * 1. Get project with budget and expenses
   * 2. Calculate net profit = budget - totalExpenses
   * 3. For each member:
   *    - FIXED: payout = 0 (already in expenses)
   *    - PERCENTAGE: payout = netProfit * (percentage / 100)
   *    - NONE: payout = 0
   * 4. Owner profit = netProfit - Σ(PERCENTAGE payouts)
   */
  async calculateProjectPayouts(projectId: string, userId: string): Promise<PayoutSummary> {
    // 1. Validate owner access
    const team = await this.validateOwnerAccess(projectId, userId);

    // 2. Get project with expenses
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: {
        expenses: true,
        payouts: {
          include: {
            member: {
              include: {
                user: true,
              },
            },
          },
        },
      },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    if (!project.budget) {
      throw new BadRequestException('Project budget is not set');
    }

    // 3. Calculate total expenses
    const totalExpenses = project.expenses.reduce(
      (sum, expense) => sum + Number(expense.amount),
      0
    );

    // 4. Calculate net profit
    const budget = Number(project.budget);
    const netProfit = budget - totalExpenses;

    // 5. Get all team members with salary settings
    const teamMembers = await this.prisma.teamMember.findMany({
      where: { teamId: team.id },
      include: {
        user: true,
      },
    });

    // 6. Calculate payouts for each member
    const members: MemberPayoutDetail[] = [];
    let totalPayouts = 0;

    for (const member of teamMembers) {
      let calculatedPayout = 0;
      const salaryType = member.salaryType;
      const salaryAmount = member.salaryAmount ? Number(member.salaryAmount) : 0;

      if (salaryType === 'percentage' && salaryAmount > 0) {
        // Calculate percentage from net profit
        calculatedPayout = (netProfit * salaryAmount) / 100;
        totalPayouts += calculatedPayout;
      }
      // FIXED and NONE types: payout = 0

      // Check if payout already exists
      const existingPayout = project.payouts.find(p => p.memberId === member.id);
      const status = existingPayout?.status || 'pending';

      members.push({
        memberId: member.id,
        memberName: member.user.fullName,
        salaryType,
        salaryAmount: salaryAmount > 0 ? salaryAmount : undefined,
        calculatedPayout,
        status,
      });
    }

    // 7. Calculate owner profit
    const ownerProfit = netProfit - totalPayouts;

    return {
      projectId: project.id,
      projectName: project.name,
      budget,
      totalExpenses,
      netProfit,
      totalPayouts,
      ownerProfit,
      members,
    };
  }

  /**
   * Update team member salary settings
   * Only owner can update
   */
  async updateMemberSalary(
    input: UpdateMemberSalaryInput,
    userId: string
  ): Promise<any> {
    // 1. Get team member
    const teamMember = await this.prisma.teamMember.findUnique({
      where: { id: input.memberId },
      include: { team: true },
    });

    if (!teamMember) {
      throw new NotFoundException('Team member not found');
    }

    // 2. Validate owner access
    if (teamMember.team.ownerId !== userId) {
      throw new ForbiddenException('Only team owner can update member salaries');
    }

    // 3. Validate salary amount for percentage type
    if (input.salaryType === 'percentage' && input.salaryAmount) {
      if (input.salaryAmount < 0 || input.salaryAmount > 100) {
        throw new BadRequestException('Percentage must be between 0 and 100');
      }
    }

    // 4. Validate salary amount for fixed type
    if (input.salaryType === 'fixed' && input.salaryAmount) {
      if (input.salaryAmount < 0) {
        throw new BadRequestException('Fixed salary amount must be >= 0');
      }
    }

    // 5. Update team member
    const updated = await this.prisma.teamMember.update({
      where: { id: input.memberId },
      data: {
        salaryType: input.salaryType,
        salaryAmount: input.salaryAmount || null,
      },
      include: {
        user: true,
        team: true,
      },
    });

    return updated;
  }

  /**
   * Create or update payout (mark as paid)
   * Only owner can create payouts
   */
  async createPayout(
    input: CreatePayoutInput,
    userId: string
  ): Promise<ProjectPayout> {
    // 1. Validate owner access
    await this.validateOwnerAccess(input.projectId, userId);

    // 2. Validate team member belongs to project team
    const project = await this.prisma.project.findUnique({
      where: { id: input.projectId },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    const teamMember = await this.prisma.teamMember.findUnique({
      where: { id: input.memberId },
    });

    if (!teamMember || teamMember.teamId !== project.teamId) {
      throw new BadRequestException('Team member does not belong to project team');
    }

    // 3. Check if payout already exists
    const existingPayout = await this.prisma.projectPayout.findFirst({
      where: {
        projectId: input.projectId,
        memberId: input.memberId,
      },
    });

    if (existingPayout) {
      // Update existing payout
      const updated = await this.prisma.projectPayout.update({
        where: { id: existingPayout.id },
        data: {
          actualAmount: input.amount,
          status: 'paid',
          paidAt: new Date(),
          notes: input.notes,
        },
        include: {
          project: true,
          member: {
            include: {
              user: true,
            },
          },
        },
      });

      return updated as any;
    }

    // 4. Create new payout
    const payout = await this.prisma.projectPayout.create({
      data: {
        projectId: input.projectId,
        memberId: input.memberId,
        calculatedAmount: input.amount,
        actualAmount: input.amount,
        status: 'paid',
        paidAt: new Date(),
        notes: input.notes,
      },
      include: {
        project: true,
        member: {
          include: {
            user: true,
          },
        },
      },
    });

    return payout as any;
  }

  /**
   * Close project with final calculations
   * Requirements:
   * - All payouts must be in PAID status
   * - Only owner can close
   */
  async closeProject(projectId: string, userId: string): Promise<any> {
    // 1. Validate owner access
    await this.validateOwnerAccess(projectId, userId);

    // 2. Get project with payouts
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: {
        payouts: true,
      },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    if (project.closedAt) {
      throw new BadRequestException('Project is already closed');
    }

    // 3. Calculate final summary
    const summary = await this.calculateProjectPayouts(projectId, userId);

    // 4. Check if all payouts are paid (optional - can allow closing with pending)
    // For MVP, we'll allow closing without checking payout status

    // 5. Close project in transaction
    const closedProject = await this.prisma.$transaction(async (prisma) => {
      // Create payout records for all members with calculated amounts
      for (const member of summary.members) {
        if (member.calculatedPayout > 0) {
          const existingPayout = await prisma.projectPayout.findFirst({
            where: {
              projectId,
              memberId: member.memberId,
            },
          });

          if (!existingPayout) {
            // Create new payout record
            await prisma.projectPayout.create({
              data: {
                projectId,
                memberId: member.memberId,
                calculatedAmount: member.calculatedPayout,
                status: 'pending',
              },
            });
          }
        }
      }

      // Update project
      return prisma.project.update({
        where: { id: projectId },
        data: {
          status: 'COMPLETED',
          closedAt: new Date(),
          completedAt: new Date(),
          finalProfit: summary.ownerProfit,
        },
        include: {
          team: true,
          expenses: true,
          payouts: {
            include: {
              member: {
                include: {
                  user: true,
                },
              },
            },
          },
        },
      });
    });

    return closedProject;
  }

  /**
   * Get all payouts for a project
   * Only owner can view all payouts
   */
  async getProjectPayouts(projectId: string, userId: string): Promise<ProjectPayout[]> {
    // Validate owner access
    await this.validateOwnerAccess(projectId, userId);

    const payouts = await this.prisma.projectPayout.findMany({
      where: { projectId },
      include: {
        project: true,
        member: {
          include: {
            user: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return payouts as any;
  }

  /**
   * Get all payouts for a team member
   * Member can view their own payouts, owner can view all
   */
  async getMemberPayouts(memberId: string, userId: string): Promise<ProjectPayout[]> {
    // Get team member
    const teamMember = await this.prisma.teamMember.findUnique({
      where: { id: memberId },
      include: { team: true },
    });

    if (!teamMember) {
      throw new NotFoundException('Team member not found');
    }

    // Check if user is owner or the member themselves
    const isOwner = teamMember.team.ownerId === userId;
    const isMember = teamMember.userId === userId;

    if (!isOwner && !isMember) {
      throw new ForbiddenException('You can only view your own payouts');
    }

    const payouts = await this.prisma.projectPayout.findMany({
      where: { memberId },
      include: {
        project: true,
        member: {
          include: {
            user: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return payouts as any;
  }

  /**
   * Helper: Validate owner access to project
   * Returns team if access is valid, throws error otherwise
   */
  private async validateOwnerAccess(projectId: string, userId: string) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: { team: true },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    if (project.team.ownerId !== userId) {
      throw new ForbiddenException('Only team owner can perform this operation');
    }

    return project.team;
  }

  /**
   * Обновление метода оплаты и чека для выплаты
   */
  async updatePayoutPayment(
    payoutId: string,
    paymentMethod: string,
    receiptUrl: string | undefined,
    userId: string,
  ): Promise<ProjectPayout> {
    // 1. Получаем выплату с проверкой доступа
    const payout = await this.prisma.projectPayout.findUnique({
      where: { id: payoutId },
      include: {
        project: {
          include: {
            team: true,
          },
        },
        member: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!payout) {
      throw new NotFoundException('Выплата не найдена');
    }

    // 2. Проверяем что пользователь - владелец команды
    if (payout.project.team.ownerId !== userId) {
      throw new ForbiddenException('Только владелец команды может обновлять данные о выплате');
    }

    // 3. Обновляем метод оплаты и чек
    const updatedPayout = await this.prisma.projectPayout.update({
      where: { id: payoutId },
      data: {
        paymentMethod,
        receiptUrl,
      },
      include: {
        project: true,
        member: {
          include: {
            user: true,
          },
        },
      },
    });

    return updatedPayout as any;
  }
}
