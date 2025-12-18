import { Injectable, BadRequestException, ForbiddenException, NotFoundException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CoreService } from '../../core/core.service';
import { PrismaService } from '../../core/prisma/prisma.service';
import { RedisService } from '../../core/redis/redis.service';
import { CsvExportService } from '../../shared/services/csv-export.service';
import { CompleteOnboardingInput } from './dto/complete-onboarding.input';
import { UpdateTeamInput } from './dto/update-team.input';
import { OnboardingResult } from './models/onboarding-result.model';
import { StorageService } from '../../core/storage/storage.service';
import { LogoType } from './models/logo-type.enum';
import { BusinessRole } from '../users/models/user.model';
import { TeamRole } from './models/team-member.model';

/**
 * Сервис для работы с командами/бригадами
 */
@Injectable()
export class TeamsService extends CoreService {
  private readonly logger = new Logger(TeamsService.name);

  constructor(
    prisma: PrismaService,
    redis: RedisService,
    config: ConfigService,
    private storageService: StorageService,
    private csvExportService: CsvExportService,
  ) {
    super(prisma, redis, config);
  }

  /**
   * Завершение онбординга: создание команды и первого проекта
   * Атомарная транзакция - либо всё успешно, либо откат
   */
  async completeOnboarding(
    userId: string,
    input: CompleteOnboardingInput,
  ): Promise<OnboardingResult> {
    this.logger.log(`Starting onboarding for user ${userId}`);

    // Валидация: проверяем что онбординг ещё не завершён
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new BadRequestException('Пользователь не найден');
    }

    if (user.hasCompletedOnboarding) {
      throw new BadRequestException('Онбординг уже завершён');
    }

    // Валидация: проверяем businessRole (WORKER не может создавать команды)
    if (user.businessRole === BusinessRole.WORKER) {
      throw new ForbiddenException(
        'Вы уже являетесь работником в команде. ' +
        'Работники не могут создавать собственные команды. ' +
        'Если вы хотите стать бригадиром, сначала покиньте все команды через настройки.'
      );
    }

    // Дополнительная проверка: есть ли активные членства в других командах
    const existingMembership = await this.prisma.teamMember.findFirst({
      where: {
        userId,
        role: TeamRole.MEMBER,
      },
      include: { team: true },
    });

    if (existingMembership) {
      throw new ForbiddenException(
        `Вы уже являетесь работником в команде "${existingMembership.team.name}". ` +
        'Работники не могут создавать команды. ' +
        'Сначала покиньте команду через настройки.'
      );
    }

    // Валидация: проверяем что у пользователя нет команды как владелец
    const existingTeam = await this.prisma.team.findFirst({
      where: { ownerId: userId },
    });

    if (existingTeam) {
      throw new BadRequestException(
        'Вы уже являетесь владельцем команды. Один пользователь может владеть только одной командой.',
      );
    }

    // Валидация входных данных
    this.validateOnboardingData(input);

    // Выполняем всё в транзакции
    const result = await this.prisma.$transaction(async (tx) => {
      // 1. Обрабатываем логотип
      const logoData = await this.processLogo(input, userId);

      // 2. Создаём команду
      const team = await tx.team.create({
        data: {
          name: input.teamName,
          ownerId: userId,
          ...logoData,
        },
      });

      this.logger.log(`Created team ${team.id} for user ${userId}`);

      // 3. Добавляем пользователя как владельца в TeamMember
      await tx.teamMember.create({
        data: {
          teamId: team.id,
          userId: userId,
          role: TeamRole.OWNER, // Use enum instead of string
        },
      });

      this.logger.log(`Added user ${userId} as owner of team ${team.id}`);

      // 4. Создаём первый проект
      const project = await tx.project.create({
        data: {
          name: input.projectName,
          address: input.projectAddress,
          description: input.projectDescription,
          teamId: team.id,
          createdById: userId,
          status: 'ACTIVE', // Используем status вместо isActive
          progress: 0,
        },
      });

      this.logger.log(`Created project ${project.id} for team ${team.id}`);

      // 5. Обновляем пользователя: отмечаем онбординг завершённым + assign FOREMAN role
      await tx.user.update({
        where: { id: userId },
        data: {
          hasCompletedOnboarding: true,
          onboardingCompletedAt: new Date(),
          currentTeamId: team.id,
          businessRole: BusinessRole.FOREMAN,
          businessRoleAssignedAt: new Date(),
        },
      });

      this.logger.log(`Completed onboarding for user ${userId}`);

      return { team, project };
    });

    // Возвращаем результат
    return {
      success: true,
      team: result.team as any,
      project: result.project as any,
      message: 'Онбординг успешно завершён! Добро пожаловать в ProRab!',
    };
  }

  /**
   * Обработка логотипа: загрузка файла ИЛИ сохранение iconId + colorId
   */
  private async processLogo(input: CompleteOnboardingInput, userId: string): Promise<{
    logoType: LogoType;
    logoUrl?: string;
    iconId?: string;
    colorId?: string;
  }> {
    // Случай 1: Загружен файл
    if (input.logoFile) {
      this.logger.log('Processing uploaded logo file');

      const logoFile = await input.logoFile;
      const logoUrl = await this.storageService.uploadTeamLogo(
        logoFile,
        userId,
      );

      return {
        logoType: LogoType.UPLOADED,
        logoUrl,
        iconId: null,
        colorId: null,
      };
    }

    // Случай 2: Выбраны иконка и цвет
    if (input.iconId && input.colorId) {
      this.logger.log(
        `Using generated logo: ${input.iconId} + ${input.colorId}`,
      );

      return {
        logoType: LogoType.GENERATED,
        logoUrl: null,
        iconId: input.iconId,
        colorId: input.colorId,
      };
    }

    // Случай 3: Дефолтный логотип (если ничего не выбрано)
    this.logger.log('Using default logo');

    return {
      logoType: LogoType.DEFAULT,
      logoUrl: null,
      iconId: null,
      colorId: null,
    };
  }

  /**
   * Валидация входных данных для онбординга
   */
  private validateOnboardingData(input: CompleteOnboardingInput): void {
    // Проверка Step 1: название команды
    if (!input.teamName || input.teamName.trim().length === 0) {
      throw new BadRequestException('Название команды обязательно');
    }

    if (input.teamName.length > 100) {
      throw new BadRequestException(
        'Название команды не должно превышать 100 символов',
      );
    }

    // Проверка Step 2: логотип (хотя бы одно из двух)
    const hasUploadedLogo = !!input.logoFile;
    const hasGeneratedLogo = !!(input.iconId && input.colorId);

    if (!hasUploadedLogo && !hasGeneratedLogo) {
      // Допускаем пропуск - будет DEFAULT
      this.logger.warn('No logo provided, using default');
    }

    if (input.iconId && !input.colorId) {
      throw new BadRequestException(
        'Если выбрана иконка, необходимо также выбрать цвет',
      );
    }

    if (input.colorId && !input.iconId) {
      throw new BadRequestException(
        'Если выбран цвет, необходимо также выбрать иконку',
      );
    }

    // Проверка Step 3: название проекта
    if (!input.projectName || input.projectName.trim().length === 0) {
      throw new BadRequestException('Название проекта обязательно');
    }

    if (input.projectName.length > 200) {
      throw new BadRequestException(
        'Название проекта не должно превышать 200 символов',
      );
    }

    // Опциональные поля
    if (input.projectAddress && input.projectAddress.length > 500) {
      throw new BadRequestException(
        'Адрес проекта не должен превышать 500 символов',
      );
    }

    if (input.projectDescription && input.projectDescription.length > 2000) {
      throw new BadRequestException(
        'Описание проекта не должно превышать 2000 символов',
      );
    }
  }

  /**
   * Получение команд пользователя
   * Возвращает все команды где пользователь является владельцем ИЛИ участником
   */
  async getMyTeams(userId: string): Promise<any[]> {
    return this.prisma.team.findMany({
      where: {
        OR: [
          // Команды где пользователь является владельцем
          { ownerId: userId },
          // Команды где пользователь является участником
          {
            members: {
              some: {
                userId,
              },
            },
          },
        ],
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * Получение команды по ID
   */
  async getTeamById(teamId: string): Promise<any> {
    return this.prisma.team.findUnique({
      where: { id: teamId },
      include: {
        members: {
          include: {
            user: true,
          },
        },
      },
    });
  }

  /**
   * Обновление данных команды (только для владельца)
   */
  async updateTeam(userId: string, input: UpdateTeamInput): Promise<any> {
    // 1. Проверяем существование команды
    const team = await this.prisma.team.findUnique({
      where: { id: input.teamId },
    });

    if (!team) {
      throw new BadRequestException('Команда не найдена');
    }

    // 2. Проверяем что пользователь - владелец
    if (team.ownerId !== userId) {
      throw new ForbiddenException('Только владелец может изменять настройки команды');
    }

    // 3. Подготавливаем данные для обновления
    const updateData: any = {};

    if (input.name) {
      updateData.name = input.name;
    }

    // 4. Обрабатываем логотип
    if (input.logoFile) {
      this.logger.log('Processing uploaded logo file for team update');
      const logoFile = await input.logoFile;
      const logoUrl = await this.storageService.uploadTeamLogo(logoFile, userId, input.teamId);
      updateData.logoType = LogoType.UPLOADED;
      updateData.logoUrl = logoUrl;
      updateData.iconId = null;
      updateData.colorId = null;
    } else if (input.iconId && input.colorId) {
      this.logger.log(`Updating team logo to generated: ${input.iconId} + ${input.colorId}`);
      updateData.logoType = LogoType.GENERATED;
      updateData.logoUrl = null;
      updateData.iconId = input.iconId;
      updateData.colorId = input.colorId;
    }

    // 5. Обновляем команду
    const updatedTeam = await this.prisma.team.update({
      where: { id: input.teamId },
      data: updateData,
    });

    this.logger.log(`Updated team ${input.teamId}`);

    return updatedTeam;
  }

  /**
   * Получение участников команды
   */
  async getTeamMembers(teamId: string, userId: string): Promise<any[]> {
    // Проверяем что пользователь состоит в команде
    const membership = await this.prisma.teamMember.findUnique({
      where: {
        teamId_userId: {
          teamId,
          userId,
        },
      },
    });

    if (!membership) {
      throw new ForbiddenException('Вы не являетесь участником этой команды');
    }

    const members = await this.prisma.teamMember.findMany({
      where: { teamId },
      include: {
        user: true,
      },
      orderBy: {
        joinedAt: 'asc',
      },
    });

    // Добавляем статистику для каждого участника
    const membersWithStats = await Promise.all(
      members.map(async (member) => {
        const stats = await this.getMemberStats(member.id);
        return {
          ...member,
          stats,
        };
      })
    );

    return membersWithStats;
  }

  /**
   * Получение статистики участника команды
   */
  private async getMemberStats(memberId: string): Promise<any> {
    // Получаем все проекты команды, в которых участвует member
    const teamMember = await this.prisma.teamMember.findUnique({
      where: { id: memberId },
      include: {
        team: {
          include: {
            projects: {
              select: { id: true },
            },
          },
        },
      },
    });

    if (!teamMember) {
      return {
        projectCount: 0,
        totalPayouts: 0,
        averagePayoutPerProject: 0,
        completedPayoutsCount: 0,
        pendingPayoutsCount: 0,
      };
    }

    const projectCount = teamMember.team.projects.length;

    // Получаем все выплаты участника
    const payouts = await this.prisma.projectPayout.findMany({
      where: {
        memberId: memberId,
      },
    });

    const totalPayouts = payouts.reduce(
      (sum, payout) => sum + Number(payout.actualAmount),
      0
    );

    const completedPayoutsCount = payouts.filter(
      (p) => p.status === 'paid'
    ).length;
    const pendingPayoutsCount = payouts.filter(
      (p) => p.status === 'pending'
    ).length;

    const averagePayoutPerProject =
      completedPayoutsCount > 0 ? totalPayouts / completedPayoutsCount : 0;

    return {
      projectCount,
      totalPayouts,
      averagePayoutPerProject,
      completedPayoutsCount,
      pendingPayoutsCount,
    };
  }

  /**
   * Удаление участника из команды (только для владельца)
   */
  async removeTeamMember(teamId: string, memberId: string, userId: string): Promise<boolean> {
    // 1. Проверяем что команда существует и пользователь - владелец
    const team = await this.prisma.team.findUnique({
      where: { id: teamId },
    });

    if (!team) {
      throw new BadRequestException('Команда не найдена');
    }

    if (team.ownerId !== userId) {
      throw new ForbiddenException('Только владелец может удалять участников');
    }

    // 2. Проверяем что участник существует
    const member = await this.prisma.teamMember.findUnique({
      where: { id: memberId },
    });

    if (!member) {
      throw new BadRequestException('Участник не найден');
    }

    // 3. Запрещаем удаление владельца
    if (member.userId === userId) {
      throw new BadRequestException('Владелец не может удалить себя из команды');
    }

    // 4. Удаляем участника
    await this.prisma.teamMember.delete({
      where: { id: memberId },
    });

    this.logger.log(`Removed member ${memberId} from team ${teamId}`);

    return true;
  }

  /**
   * Создание ссылки-приглашения в команду
   */
  async createInviteLink(userId: string, teamId: string, expiresInDays: number = 7): Promise<any> {
    // 1. Проверяем что команда существует и пользователь - владелец
    const team = await this.prisma.team.findUnique({
      where: { id: teamId },
    });

    if (!team) {
      throw new BadRequestException('Команда не найдена');
    }

    if (team.ownerId !== userId) {
      throw new ForbiddenException('Только владелец может создавать ссылки-приглашения');
    }

    // 2. Генерируем уникальный код (8 символов, A-Z, 0-9)
    const code = this.generateInviteCode();

    // 3. Вычисляем дату истечения
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiresInDays);

    // 4. Создаём запись в БД
    const inviteCode = await this.prisma.inviteCode.create({
      data: {
        teamId,
        code,
        expiresAt,
      },
      include: {
        team: true,
      },
    });

    this.logger.log(`Created invite code ${code} for team ${teamId}, expires ${expiresAt.toISOString()}`);

    return inviteCode;
  }

  /**
   * Присоединение к команде по коду приглашения
   */
  async joinTeamByInvite(userId: string, code: string): Promise<any> {
    // 1. Находим код приглашения
    const inviteCode = await this.prisma.inviteCode.findUnique({
      where: { code },
      include: {
        team: true,
      },
    });

    if (!inviteCode) {
      throw new BadRequestException('Код приглашения не найден');
    }

    // 2. Проверяем что код не использован
    if (inviteCode.usedBy) {
      throw new BadRequestException('Этот код приглашения уже был использован');
    }

    // 3. Проверяем что код не истёк
    const now = new Date();
    if (inviteCode.expiresAt < now) {
      throw new BadRequestException('Срок действия кода приглашения истёк');
    }

    // 4. Проверяем businessRole (FOREMAN не может присоединяться к другим командам)
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (user?.businessRole === BusinessRole.FOREMAN) {
      throw new ForbiddenException(
        'Вы являетесь владельцем команды и не можете присоединиться к другим командам. ' +
        'Бригадиры управляют СВОИМИ командами. ' +
        'Если вы хотите стать работником, сначала передайте владение вашей командой.'
      );
    }

    // Дополнительная проверка: владеет ли пользователь какой-либо командой
    const ownedTeam = await this.prisma.team.findFirst({
      where: { ownerId: userId },
      select: { id: true, name: true },
    });

    if (ownedTeam) {
      throw new ForbiddenException(
        `Вы являетесь владельцем команды "${ownedTeam.name}". ` +
        'Владельцы команд не могут присоединяться к другим командам как работники. ' +
        'Передайте владение вашей командой, если хотите стать работником.'
      );
    }

    // 5. Проверяем что пользователь ещё не состоит в команде
    const existingMembership = await this.prisma.teamMember.findUnique({
      where: {
        teamId_userId: {
          teamId: inviteCode.teamId,
          userId,
        },
      },
    });

    if (existingMembership) {
      throw new BadRequestException('Вы уже состоите в этой команде');
    }

    // 6. Добавляем пользователя в команду и отмечаем код как использованный
    const result = await this.prisma.$transaction(async (tx) => {
      // Создаём участника команды
      const teamMember = await tx.teamMember.create({
        data: {
          teamId: inviteCode.teamId,
          userId,
          role: TeamRole.MEMBER, // Use enum instead of string
        },
        include: {
          team: true,
          user: true,
        },
      });

      // Отмечаем код как использованный
      await tx.inviteCode.update({
        where: { id: inviteCode.id },
        data: {
          usedBy: userId,
          usedAt: new Date(),
        },
      });

      // Assign WORKER role if user doesn't have businessRole yet
      if (!user?.businessRole) {
        await tx.user.update({
          where: { id: userId },
          data: {
            businessRole: BusinessRole.WORKER,
            businessRoleAssignedAt: new Date(),
          },
        });
        this.logger.log(`✅ Assigned WORKER role to user ${userId}`);
      }

      return teamMember;
    });

    this.logger.log(`User ${userId} joined team ${inviteCode.teamId} via invite code ${code}`);

    return result;
  }

  /**
   * Получение активных кодов приглашения команды
   */
  async getTeamInvites(teamId: string, userId: string): Promise<any[]> {
    // Проверяем что пользователь - владелец команды
    const team = await this.prisma.team.findUnique({
      where: { id: teamId },
    });

    if (!team) {
      throw new BadRequestException('Команда не найдена');
    }

    if (team.ownerId !== userId) {
      throw new ForbiddenException('Только владелец может просматривать коды приглашения');
    }

    // Получаем все коды (включая использованные и истёкшие для истории)
    return this.prisma.inviteCode.findMany({
      where: { teamId },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * Удаление (деактивация) кода приглашения
   */
  async deleteInviteCode(userId: string, codeId: string): Promise<boolean> {
    // 1. Находим код
    const inviteCode = await this.prisma.inviteCode.findUnique({
      where: { id: codeId },
      include: { team: true },
    });

    if (!inviteCode) {
      throw new BadRequestException('Код приглашения не найден');
    }

    // 2. Проверяем что пользователь - владелец команды
    if (inviteCode.team.ownerId !== userId) {
      throw new ForbiddenException('Только владелец может удалять коды приглашения');
    }

    // 3. Удаляем код
    await this.prisma.inviteCode.delete({
      where: { id: codeId },
    });

    this.logger.log(`Deleted invite code ${codeId}`);

    return true;
  }

  /**
   * Генерация уникального кода приглашения (8 символов, A-Z, 0-9)
   */
  private generateInviteCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Убраны похожие символы: I, O, 1, 0
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  // ==================== ANALYTICS ====================

  /**
   * Get personnel analytics for a team
   * Only owner can access
   */
  async getPersonnelAnalytics(teamId: string, userId: string): Promise<any> {
    // Verify team exists and user is owner
    const team = await this.prisma.team.findUnique({
      where: { id: teamId },
      include: {
        projects: {
          include: {
            workLogs: true,
            payouts: true,
          },
        },
        members: {
          include: {
            user: true,
            workLogs: true,
            payouts: true,
          },
        },
      },
    });

    if (!team) {
      throw new BadRequestException('Команда не найдена');
    }

    if (team.ownerId !== userId) {
      throw new ForbiddenException('Только владелец команды может просматривать аналитику');
    }

    // Calculate member analytics
    const memberAnalytics = await Promise.all(
      team.members.map(async (member) => {
        // Get projects count (unique projects where member has work logs or payouts)
        const memberProjects = await this.prisma.project.findMany({
          where: {
            teamId,
            OR: [
              { workLogs: { some: { memberId: member.id } } },
              { payouts: { some: { memberId: member.id } } },
            ],
          },
        });

        // Total hours worked
        const hoursResult = await this.prisma.workLog.aggregate({
          where: { memberId: member.id },
          _sum: { hours: true },
        });

        // Total payouts
        const payoutsResult = await this.prisma.projectPayout.aggregate({
          where: { memberId: member.id },
          _sum: { actualAmount: true, calculatedAmount: true },
          _count: { _all: true },
        });

        // Completed vs pending payouts
        const completedPayouts = await this.prisma.projectPayout.count({
          where: { memberId: member.id, status: 'paid' },
        });

        const pendingPayouts = await this.prisma.projectPayout.count({
          where: { memberId: member.id, status: 'pending' },
        });

        const totalPayouts =
          Number(payoutsResult._sum.actualAmount || 0) ||
          Number(payoutsResult._sum.calculatedAmount || 0);
        const averagePayoutPerProject =
          memberProjects.length > 0 ? totalPayouts / memberProjects.length : 0;

        return {
          memberId: member.id,
          memberName: member.user.fullName,
          memberEmail: member.user.email,
          avatarUrl: member.user.avatarUrl,
          role: member.role,
          position: member.position,
          salaryType: member.salaryType,
          salaryAmount: member.salaryAmount ? Number(member.salaryAmount) : null,
          projectsCount: memberProjects.length,
          totalHoursWorked: Number(hoursResult._sum.hours || 0),
          totalPayouts,
          averagePayoutPerProject,
          completedPayoutsCount: completedPayouts,
          pendingPayoutsCount: pendingPayouts,
          joinedAt: member.joinedAt,
        };
      }),
    );

    // Calculate project analytics
    const projectAnalytics = await Promise.all(
      team.projects.map(async (project) => {
        // Total hours worked on project
        const hoursResult = await this.prisma.workLog.aggregate({
          where: { projectId: project.id },
          _sum: { hours: true },
        });

        // Total payouts for project
        const payoutsResult = await this.prisma.projectPayout.aggregate({
          where: { projectId: project.id },
          _sum: { actualAmount: true, calculatedAmount: true },
        });

        // Unique members who worked on project
        const membersCount = await this.prisma.teamMember.count({
          where: {
            OR: [
              { workLogs: { some: { projectId: project.id } } },
              { payouts: { some: { projectId: project.id } } },
            ],
          },
        });

        const totalPayouts =
          Number(payoutsResult._sum.actualAmount || 0) ||
          Number(payoutsResult._sum.calculatedAmount || 0);

        return {
          projectId: project.id,
          projectName: project.name,
          budget: project.budget ? Number(project.budget) : null,
          totalHoursWorked: Number(hoursResult._sum.hours || 0),
          totalPayouts,
          membersCount,
          status: project.status,
          startDate: project.startDate,
          endDate: project.endDate,
        };
      }),
    );

    // Calculate team totals
    const totalHoursWorked = memberAnalytics.reduce((sum, m) => sum + m.totalHoursWorked, 0);
    const totalPayouts = memberAnalytics.reduce((sum, m) => sum + m.totalPayouts, 0);
    const totalMembers = team.members.length;
    const averageHoursPerMember = totalMembers > 0 ? totalHoursWorked / totalMembers : 0;
    const averagePayoutPerMember = totalMembers > 0 ? totalPayouts / totalMembers : 0;

    return {
      teamId: team.id,
      teamName: team.name,
      totalMembers,
      totalHoursWorked,
      totalPayouts,
      averageHoursPerMember,
      averagePayoutPerMember,
      members: memberAnalytics.sort((a, b) => b.totalHoursWorked - a.totalHoursWorked),
      projects: projectAnalytics.sort((a, b) => b.totalHoursWorked - a.totalHoursWorked),
      generatedAt: new Date(),
    };
  }

  /**
   * Get salary change history for a team member
   * Only owner can view
   */
  async getMemberSalaryHistory(memberId: string, userId: string): Promise<any[]> {
    // Get member with team
    const member = await this.prisma.teamMember.findUnique({
      where: { id: memberId },
      include: { team: true },
    });

    if (!member) {
      throw new NotFoundException('Team member not found');
    }

    // Verify owner access
    if (member.team.ownerId !== userId) {
      throw new ForbiddenException('Only team owner can view salary history');
    }

    // Get salary history
    const history = await this.prisma.teamMemberSalaryHistory.findMany({
      where: { memberId },
      include: {
        member: {
          include: {
            user: true,
          },
        },
        changedBy: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return history;
  }

  /**
   * Update team member position
   * Only owner can update
   */
  async updateMemberPosition(memberId: string, position: string | null | undefined, userId: string): Promise<any> {
    // Get member with team
    const member = await this.prisma.teamMember.findUnique({
      where: { id: memberId },
      include: { team: true },
    });

    if (!member) {
      throw new NotFoundException('Team member not found');
    }

    // Verify owner access
    if (member.team.ownerId !== userId) {
      throw new ForbiddenException('Only team owner can update member position');
    }

    // Update position
    const updated = await this.prisma.teamMember.update({
      where: { id: memberId },
      data: {
        position: position || null,
      },
      include: {
        user: true,
        team: true,
      },
    });

    return updated;
  }

  // ==================== EXPORT ====================

  /**
   * Export personnel analytics to CSV
   * Owner only
   */
  async exportPersonnelAnalyticsToCsv(teamId: string, userId: string): Promise<string> {
    // Get analytics with access check
    const analytics = await this.getPersonnelAnalytics(teamId, userId);

    // Transform member data for CSV
    const csvData = analytics.members.map((member: any) => ({
      memberName: member.memberName,
      memberEmail: member.memberEmail,
      role: member.role === TeamRole.OWNER ? 'Владелец' : 'Участник',
      position: member.position || '—',
      salaryType:
        member.salaryType === 'FIXED'
          ? 'Фиксированная'
          : member.salaryType === 'PERCENTAGE'
          ? 'Процент'
          : 'Не установлена',
      salaryAmount: member.salaryAmount || 0,
      projectsCount: member.projectsCount,
      totalHoursWorked: member.totalHoursWorked.toFixed(2),
      totalPayouts: member.totalPayouts.toFixed(2),
      averagePayoutPerProject: member.averagePayoutPerProject.toFixed(2),
      completedPayoutsCount: member.completedPayoutsCount,
      pendingPayoutsCount: member.pendingPayoutsCount,
      joinedAt: member.joinedAt.toISOString().split('T')[0],
    }));

    // Define columns
    const columns = [
      { key: 'memberName' as const, label: 'Участник' },
      { key: 'memberEmail' as const, label: 'Email' },
      { key: 'role' as const, label: 'Роль' },
      { key: 'position' as const, label: 'Должность' },
      { key: 'salaryType' as const, label: 'Тип зарплаты' },
      { key: 'salaryAmount' as const, label: 'Размер зарплаты' },
      { key: 'projectsCount' as const, label: 'Проектов' },
      { key: 'totalHoursWorked' as const, label: 'Всего часов' },
      { key: 'totalPayouts' as const, label: 'Всего выплат (₽)' },
      { key: 'averagePayoutPerProject' as const, label: 'Средняя выплата (₽)' },
      { key: 'completedPayoutsCount' as const, label: 'Завершённых выплат' },
      { key: 'pendingPayoutsCount' as const, label: 'Ожидающих выплат' },
      { key: 'joinedAt' as const, label: 'Дата присоединения' },
    ];

    return this.csvExportService.exportToCsv(csvData, columns);
  }
}
