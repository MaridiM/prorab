import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../../core/prisma/prisma.service';

import { CreateProjectInput } from './dto/create-project.input';
import { ProjectFilterInput } from './dto/project-filter.input';
import { UpdateProjectInput } from './dto/update-project.input';
import { ProjectStatus } from './models/project-status.enum';
import { ProjectStats } from './models/project-stats.model';

@Injectable()
export class ProjectsService {
  private readonly logger = new Logger(ProjectsService.name);

  constructor(private readonly prisma: PrismaService) {}

  // ========== QUERIES ==========

  /**
   * Получить проект по ID с проверкой доступа
   */
  async findById(id: string, userId: string) {
    await this.validateProjectAccess(id, userId);
    const project = await this.prisma.project.findUnique({ where: { id } });

    if (!project) {
      throw new NotFoundException('Проект не найден');
    }

    return project;
  }

  /**
   * Получить список проектов команды с фильтрацией
   */
  async findByTeam(teamId: string, userId: string, filter?: ProjectFilterInput) {
    await this.validateTeamAccess(teamId, userId);

    const where: any = {
      teamId,
      ...(filter?.status && { status: filter.status }),
      ...(filter?.searchQuery && {
        OR: [
          { name: { contains: filter.searchQuery, mode: 'insensitive' } },
          { address: { contains: filter.searchQuery, mode: 'insensitive' } },
        ],
      }),
    };

    return this.prisma.project.findMany({
      where,
      take: filter?.take || 50,
      skip: filter?.skip || 0,
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Получить статистику проекта
   * TODO: Реализовать в Этапе 4 (Expenses)
   */
  async getProjectStats(projectId: string, userId: string): Promise<ProjectStats> {
    await this.validateProjectAccess(projectId, userId);

    // Заглушка - реальные данные будут в Этапе 4
    return {
      totalExpenses: 0,
      profit: 0,
      expenseCount: 0,
      taskCount: 0,
      reportCount: 0,
    };
  }

  // ========== MUTATIONS ==========

  /**
   * Создать новый проект
   */
  async create(userId: string, input: CreateProjectInput) {
    await this.validateTeamAccess(input.teamId, userId);
    await this.checkProjectLimit(input.teamId);

    // Валидация дат
    if (input.startDate && input.endDate && input.endDate < input.startDate) {
      throw new BadRequestException('Дата завершения не может быть раньше даты начала');
    }

    return this.prisma.project.create({
      data: {
        ...input,
        createdById: userId,
        status: ProjectStatus.ACTIVE,
        progress: 0,
      },
    });
  }

  /**
   * Обновить проект
   */
  async update(id: string, userId: string, input: UpdateProjectInput) {
    await this.validateProjectAccess(id, userId);

    // Валидация дат
    if (input.startDate && input.endDate && input.endDate < input.startDate) {
      throw new BadRequestException('Дата завершения не может быть раньше даты начала');
    }

    return this.prisma.project.update({
      where: { id },
      data: input,
    });
  }

  /**
   * Архивировать проект
   */
  async archive(id: string, userId: string) {
    await this.validateProjectAccess(id, userId);

    return this.prisma.project.update({
      where: { id },
      data: {
        status: ProjectStatus.ARCHIVED,
        archivedAt: new Date(),
      },
    });
  }

  /**
   * Восстановить проект из архива
   */
  async restore(id: string, userId: string) {
    await this.validateProjectAccess(id, userId);

    return this.prisma.project.update({
      where: { id },
      data: {
        status: ProjectStatus.ACTIVE,
        archivedAt: null,
      },
    });
  }

  /**
   * Обновить прогресс проекта
   */
  async updateProgress(id: string, userId: string, progress: number) {
    await this.validateProjectAccess(id, userId);

    if (progress < 0 || progress > 100) {
      throw new BadRequestException('Прогресс должен быть от 0 до 100');
    }

    return this.prisma.project.update({
      where: { id },
      data: {
        progress,
        ...(progress === 100 && {
          status: ProjectStatus.COMPLETED,
          completedAt: new Date(),
        }),
      },
    });
  }

  // ========== VALIDATION HELPERS ==========

  /**
   * Проверить доступ пользователя к команде
   */
  private async validateTeamAccess(teamId: string, userId: string): Promise<void> {
    const membership = await this.prisma.teamMember.findFirst({
      where: { teamId, userId },
    });

    if (!membership) {
      throw new ForbiddenException('У вас нет доступа к этой команде');
    }
  }

  /**
   * Проверить доступ пользователя к проекту
   */
  private async validateProjectAccess(projectId: string, userId: string): Promise<void> {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: {
        team: {
          include: {
            members: true,
          },
        },
      },
    });

    if (!project) {
      throw new NotFoundException('Проект не найден');
    }

    const isMember = project.team.members.some((m) => m.userId === userId);
    if (!isMember) {
      throw new ForbiddenException('У вас нет доступа к этому проекту');
    }
  }

  /**
   * Проверить лимит активных проектов
   */
  private async checkProjectLimit(teamId: string): Promise<void> {
    const activeCount = await this.prisma.project.count({
      where: { teamId, status: ProjectStatus.ACTIVE },
    });

    // TODO: Получать лимит из subscription (Этап 8)
    const limit = 10; // Hardcode для MVP

    if (activeCount >= limit) {
      throw new BadRequestException(
        `Достигнут лимит активных проектов (${limit}). Архивируйте неактивные проекты или обновите тариф.`,
      );
    }
  }
}
