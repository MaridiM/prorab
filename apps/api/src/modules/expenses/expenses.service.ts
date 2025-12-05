import {
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../../core/prisma/prisma.service';

import { CreateExpenseInput } from './dto/create-expense.input';
import { UpdateExpenseInput } from './dto/update-expense.input';

@Injectable()
export class ExpensesService {
  private readonly logger = new Logger(ExpensesService.name);

  constructor(private readonly prisma: PrismaService) {}

  // ========== QUERIES ==========

  /**
   * Получить расход по ID с проверкой доступа
   */
  async findById(id: string, userId: string) {
    const expense = await this.prisma.expense.findUnique({
      where: { id },
      include: {
        project: {
          include: {
            team: {
              include: {
                members: true,
              },
            },
          },
        },
      },
    });

    if (!expense) {
      throw new NotFoundException('Расход не найден');
    }

    const isMember = expense.project.team.members.some((m) => m.userId === userId);
    if (!isMember) {
      throw new ForbiddenException('У вас нет доступа к этому расходу');
    }

    return expense;
  }

  /**
   * Получить все расходы проекта
   */
  async findByProject(projectId: string, userId: string) {
    await this.validateProjectAccess(projectId, userId);

    return this.prisma.expense.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Получить расходы по категории
   */
  async findByCategory(projectId: string, category: string, userId: string) {
    await this.validateProjectAccess(projectId, userId);

    return this.prisma.expense.findMany({
      where: { projectId, category },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ========== MUTATIONS ==========

  /**
   * Создать новый расход
   */
  async create(userId: string, input: CreateExpenseInput) {
    await this.validateProjectAccess(input.projectId, userId);

    return this.prisma.expense.create({
      data: {
        projectId: input.projectId,
        amount: input.amount,
        category: input.category,
        photos: input.photos || [],
        comment: input.comment,
        paidByClient: input.paidByClient || false,
        createdById: userId,
      },
    });
  }

  /**
   * Обновить расход
   */
  async update(userId: string, input: UpdateExpenseInput) {
    const expense = await this.findById(input.id, userId);

    const updateData: any = {};
    if (input.amount !== undefined) {
      updateData.amount = input.amount;
    }
    if (input.category !== undefined) {
      updateData.category = input.category;
    }
    if (input.photos !== undefined) {
      updateData.photos = input.photos;
    }
    if (input.comment !== undefined) {
      updateData.comment = input.comment;
    }
    if (input.paidByClient !== undefined) {
      updateData.paidByClient = input.paidByClient;
    }

    return this.prisma.expense.update({
      where: { id: input.id },
      data: updateData,
    });
  }

  /**
   * Удалить расход
   */
  async delete(id: string, userId: string) {
    const expense = await this.findById(id, userId);

    await this.prisma.expense.delete({
      where: { id },
    });

    return expense;
  }

  // ========== VALIDATION HELPERS ==========

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
}
