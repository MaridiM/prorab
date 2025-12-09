import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../core/prisma/prisma.service';
import { StorageService } from '../../core/storage/storage.service';
import { CreatePhotoReportInput } from './dto/create-photo-report.input';
import { UpdatePhotoReportInput } from './dto/update-photo-report.input';
import { AddPhotoInput } from './dto/add-photo.input';
import { UploadPhotoInput } from './dto/upload-photo.input';
import { nanoid } from 'nanoid';
import type { FileUpload } from 'graphql-upload-minimal';

@Injectable()
export class PhotoReportsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storageService: StorageService,
  ) {}

  /**
   * Генерирует уникальный slug для фотоотчёта
   * Использует nanoid для создания криптостойких URL-safe идентификаторов
   */
  private async generateUniqueSlug(): Promise<string> {
    let attempts = 0;
    const maxAttempts = 10;

    while (attempts < maxAttempts) {
      const slug = nanoid(7); // 7-символьный slug (URL-safe)

      const existing = await this.prisma.photoReport.findUnique({
        where: { slug },
      });

      if (!existing) {
        return slug;
      }

      attempts++;
    }

    throw new BadRequestException('Не удалось сгенерировать уникальный slug. Повторите попытку.');
  }

  /**
   * Создать новый фотоотчёт
   */
  async createPhotoReport(userId: string, input: CreatePhotoReportInput) {
    // Проверяем доступ к проекту через TeamMember
    const project = await this.prisma.project.findUnique({
      where: { id: input.projectId },
      include: {
        team: {
          include: {
            members: {
              where: { userId },
            },
          },
        },
      },
    });

    if (!project) {
      throw new NotFoundException('Проект не найден');
    }

    if (project.team.members.length === 0) {
      throw new BadRequestException('У вас нет доступа к этому проекту');
    }

    // Генерируем уникальный slug
    const slug = await this.generateUniqueSlug();

    // Создаём фотоотчёт
    return this.prisma.photoReport.create({
      data: {
        slug,
        projectId: input.projectId,
        title: input.title,
        description: input.description,
        isPublic: input.isPublic ?? true,
        createdById: userId,
        publishedAt: input.isPublic ? new Date() : null,
      },
      include: {
        photos: {
          orderBy: { orderIndex: 'asc' },
        },
      },
    });
  }

  /**
   * Обновить фотоотчёт
   */
  async updatePhotoReport(userId: string, input: UpdatePhotoReportInput) {
    // Проверяем существование и доступ
    const report = await this.prisma.photoReport.findUnique({
      where: { id: input.id },
      include: {
        project: {
          include: {
            team: {
              include: {
                members: {
                  where: { userId },
                },
              },
            },
          },
        },
      },
    });

    if (!report) {
      throw new NotFoundException('Фотоотчёт не найден');
    }

    if (report.project.team.members.length === 0) {
      throw new BadRequestException('У вас нет доступа к этому фотоотчёту');
    }

    // Обновляем
    const updateData: any = {};
    if (input.title !== undefined) updateData.title = input.title;
    if (input.description !== undefined) updateData.description = input.description;
    if (input.isPublic !== undefined) {
      updateData.isPublic = input.isPublic;
      // Если делаем публичным - ставим publishedAt
      if (input.isPublic && !report.publishedAt) {
        updateData.publishedAt = new Date();
      }
    }

    return this.prisma.photoReport.update({
      where: { id: input.id },
      data: updateData,
      include: {
        photos: {
          orderBy: { orderIndex: 'asc' },
        },
      },
    });
  }

  /**
   * Удалить фотоотчёт
   */
  async deletePhotoReport(userId: string, id: string) {
    // Проверяем доступ
    const report = await this.prisma.photoReport.findUnique({
      where: { id },
      include: {
        project: {
          include: {
            team: {
              include: {
                members: {
                  where: { userId },
                },
              },
            },
          },
        },
      },
    });

    if (!report) {
      throw new NotFoundException('Фотоотчёт не найден');
    }

    if (report.project.team.members.length === 0) {
      throw new BadRequestException('У вас нет доступа к этому фотоотчёту');
    }

    // Удаляем (CASCADE удалит все фото)
    await this.prisma.photoReport.delete({
      where: { id },
    });

    return true;
  }

  /**
   * Получить все фотоотчёты проекта
   */
  async getProjectPhotoReports(userId: string, projectId: string) {
    // Проверяем доступ к проекту
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: {
        team: {
          include: {
            members: {
              where: { userId },
            },
          },
        },
      },
    });

    if (!project) {
      throw new NotFoundException('Проект не найден');
    }

    if (project.team.members.length === 0) {
      throw new BadRequestException('У вас нет доступа к этому проекту');
    }

    return this.prisma.photoReport.findMany({
      where: { projectId },
      include: {
        photos: {
          orderBy: { orderIndex: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Получить фотоотчёт по ID
   */
  async getPhotoReportById(userId: string, id: string) {
    const report = await this.prisma.photoReport.findUnique({
      where: { id },
      include: {
        photos: {
          orderBy: { orderIndex: 'asc' },
        },
        project: {
          include: {
            team: {
              include: {
                members: {
                  where: { userId },
                },
              },
            },
          },
        },
      },
    });

    if (!report) {
      throw new NotFoundException('Фотоотчёт не найден');
    }

    if (report.project.team.members.length === 0) {
      throw new BadRequestException('У вас нет доступа к этому фотоотчёту');
    }

    return report;
  }

  /**
   * Увеличить счётчик просмотров фотоотчёта
   * Вызывается асинхронно, ошибки не блокируют основной запрос
   */
  async incrementViewCount(reportId: string): Promise<void> {
    try {
      await this.prisma.photoReport.update({
        where: { id: reportId },
        data: {
          viewCount: { increment: 1 },
        },
      });
    } catch (error) {
      // Логируем ошибку, но не пробрасываем её дальше
      console.error(`Failed to increment view count for report ${reportId}:`, error);
    }
  }

  /**
   * PUBLIC: Получить фотоотчёт по slug (без аутентификации)
   */
  async getPublicPhotoReportBySlug(slug: string) {
    const report = await this.prisma.photoReport.findUnique({
      where: { slug },
      include: {
        photos: {
          orderBy: { orderIndex: 'asc' },
        },
        project: {
          select: {
            name: true,
            address: true,
          },
        },
      },
    });

    if (!report) {
      throw new NotFoundException('Фотоотчёт не найден');
    }

    if (!report.isPublic) {
      throw new BadRequestException('Этот фотоотчёт недоступен публично');
    }

    // Увеличиваем счётчик просмотров асинхронно (не ждём завершения)
    // Это не должно блокировать ответ пользователю
    this.incrementViewCount(report.id).catch((err) => {
      console.error('Error incrementing view count:', err);
    });

    return report;
  }

  /**
   * Добавить фото к фотоотчёту
   */
  async addPhoto(userId: string, input: AddPhotoInput) {
    // Проверяем доступ к отчёту
    const report = await this.prisma.photoReport.findUnique({
      where: { id: input.reportId },
      include: {
        project: {
          include: {
            team: {
              include: {
                members: {
                  where: { userId },
                },
              },
            },
          },
        },
      },
    });

    if (!report) {
      throw new NotFoundException('Фотоотчёт не найден');
    }

    if (report.project.team.members.length === 0) {
      throw new BadRequestException('У вас нет доступа к этому фотоотчёту');
    }

    // Добавляем фото
    const photo = await this.prisma.reportPhoto.create({
      data: {
        reportId: input.reportId,
        photoUrl: input.photoUrl,
        thumbnailUrl: input.thumbnailUrl,
        caption: input.caption,
        orderIndex: input.orderIndex ?? 0,
        width: input.width,
        height: input.height,
        fileSize: input.fileSize,
      },
    });

    // Обновляем coverPhotoUrl если это первое фото
    if (!report.coverPhotoUrl) {
      await this.prisma.photoReport.update({
        where: { id: input.reportId },
        data: { coverPhotoUrl: input.thumbnailUrl || input.photoUrl },
      });
    }

    return photo;
  }

  /**
   * Удалить фото из фотоотчёта
   */
  async deletePhoto(userId: string, photoId: string) {
    // Находим фото
    const photo = await this.prisma.reportPhoto.findUnique({
      where: { id: photoId },
      include: {
        report: {
          include: {
            project: {
              include: {
                team: {
                  include: {
                    members: {
                      where: { userId },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!photo) {
      throw new NotFoundException('Фото не найдено');
    }

    if (photo.report.project.team.members.length === 0) {
      throw new BadRequestException('У вас нет доступа к этому фото');
    }

    // Удаляем
    await this.prisma.reportPhoto.delete({
      where: { id: photoId },
    });

    return true;
  }

  /**
   * Загрузить фото в фотоотчёт (с обработкой файла)
   */
  async uploadPhotoToReport(userId: string, input: UploadPhotoInput) {
    // Проверяем доступ к отчёту
    const report = await this.prisma.photoReport.findUnique({
      where: { id: input.reportId },
      include: {
        project: {
          include: {
            team: {
              include: {
                members: {
                  where: { userId },
                },
              },
            },
          },
        },
      },
    });

    if (!report) {
      throw new NotFoundException('Фотоотчёт не найден');
    }

    if (report.project.team.members.length === 0) {
      throw new BadRequestException('У вас нет доступа к этому фотоотчёту');
    }

    // Загружаем файл через StorageService
    const file = await input.file;
    const uploadResult = await this.storageService.uploadReportPhoto(file);

    // Создаём запись в БД
    const photo = await this.prisma.reportPhoto.create({
      data: {
        reportId: input.reportId,
        photoUrl: uploadResult.photoUrl,
        thumbnailUrl: uploadResult.thumbnailUrl,
        caption: input.caption,
        orderIndex: input.orderIndex ?? 0,
        width: uploadResult.width,
        height: uploadResult.height,
        fileSize: uploadResult.fileSize,
      },
    });

    // Обновляем coverPhotoUrl если это первое фото
    if (!report.coverPhotoUrl) {
      await this.prisma.photoReport.update({
        where: { id: input.reportId },
        data: { coverPhotoUrl: uploadResult.thumbnailUrl },
      });
    }

    return photo;
  }
  /**
   * Изменить порядок фотографий
   */
  async reorderReportPhotos(
    reportId: string,
    photoIds: string[],
    userId: string
  ): Promise<boolean> {
    const report = await this.prisma.photoReport.findUnique({
      where: { id: reportId },
      include: {
        project: {
          include: {
            team: {
              include: {
                members: {
                  where: { userId },
                },
              },
            },
          },
        },
      },
    });

    if (!report) {
      throw new NotFoundException('Отчёт не найден');
    }

    if (report.project.team.members.length === 0) {
      throw new BadRequestException('У вас нет доступа к этому отчёту');
    }

    // Verify all photos belong to this report
    const count = await this.prisma.reportPhoto.count({
      where: {
        id: { in: photoIds },
        reportId: reportId,
      },
    });

    if (count !== photoIds.length) {
      // This might happen if some photos were deleted concurrently, 
      // or if frontend sent IDs that don't belong here.
      // We can either throw or just update the ones that match.
      // Let's be strict for now.
      throw new BadRequestException('Некоторые фото не принадлежат этому отчёту или не найдены');
    }

    // Update order in transaction
    await this.prisma.$transaction(
      photoIds.map((id, index) =>
        this.prisma.reportPhoto.update({
          where: { id },
          data: { orderIndex: index },
        })
      )
    );

    return true;
  }

  /**
   * Обновить подпись фото
   */
  async updatePhotoCaption(
    photoId: string,
    caption: string,
    userId: string
  ) {
    // Находим фото с проверкой доступа
    const photo = await this.prisma.reportPhoto.findUnique({
      where: { id: photoId },
      include: {
        report: {
          include: {
            project: {
              include: {
                team: {
                  include: {
                    members: {
                      where: { userId },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!photo) {
      throw new NotFoundException('Фото не найдено');
    }

    if (photo.report.project.team.members.length === 0) {
      throw new BadRequestException('У вас нет доступа к этому фото');
    }

    // Обновляем подпись
    return this.prisma.reportPhoto.update({
      where: { id: photoId },
      data: { caption },
    });
  }
}
