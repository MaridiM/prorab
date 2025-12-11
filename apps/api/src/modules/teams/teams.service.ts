import { Injectable, BadRequestException, ForbiddenException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CoreService } from '../../core/core.service';
import { PrismaService } from '../../core/prisma/prisma.service';
import { RedisService } from '../../core/redis/redis.service';
import { CompleteOnboardingInput } from './dto/complete-onboarding.input';
import { UpdateTeamInput } from './dto/update-team.input';
import { OnboardingResult } from './models/onboarding-result.model';
import { StorageService } from '../../core/storage/storage.service';
import { LogoType } from './models/logo-type.enum';

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
      const logoData = await this.processLogo(input);

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
          role: 'owner',
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

      // 5. Обновляем пользователя: отмечаем онбординг завершённым
      await tx.user.update({
        where: { id: userId },
        data: {
          hasCompletedOnboarding: true,
          onboardingCompletedAt: new Date(),
          currentTeamId: team.id,
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
  private async processLogo(input: CompleteOnboardingInput): Promise<{
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
   */
  async getMyTeams(userId: string): Promise<any[]> {
    return this.prisma.team.findMany({
      where: {
        members: {
          some: {
            userId,
          },
        },
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
      const logoUrl = await this.storageService.uploadTeamLogo(logoFile);
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

    // 4. Проверяем что пользователь ещё не состоит в команде
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

    // 5. Добавляем пользователя в команду и отмечаем код как использованный
    const result = await this.prisma.$transaction(async (tx) => {
      // Создаём участника команды
      const teamMember = await tx.teamMember.create({
        data: {
          teamId: inviteCode.teamId,
          userId,
          role: 'member',
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
}
