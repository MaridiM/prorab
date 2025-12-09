import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs/promises';
import * as path from 'path';
import sharp from 'sharp';
import * as crypto from 'crypto';
import type { FileUpload } from 'graphql-upload-minimal';

/**
 * Сервис для работы с файлами и изображениями
 */
@Injectable()
export class StorageService {
  private readonly uploadsDir: string;
  private readonly maxFileSize = 5 * 1024 * 1024; // 5MB
  private readonly allowedMimeTypes = [
    'image/png',
    'image/jpeg',
    'image/jpg',
    'image/webp',
  ];

  constructor(private configService: ConfigService) {
    // Временно храним в локальной папке uploads/
    this.uploadsDir = path.join(process.cwd(), 'uploads');
  }

  /**
   * Загрузка логотипа команды
   * @param file - Загружаемый файл
   * @returns URL загруженного файла
   */
  async uploadTeamLogo(file: FileUpload): Promise<string> {
    // Читаем файл
    const { createReadStream, filename, mimetype } = file;

    // Валидация MIME type
    if (!this.allowedMimeTypes.includes(mimetype)) {
      throw new BadRequestException(
        `Недопустимый формат файла. Разрешены: PNG, JPG, JPEG, WEBP`,
      );
    }

    // Читаем содержимое файла
    const stream = createReadStream();
    const chunks: Buffer[] = [];

    for await (const chunk of stream) {
      chunks.push(chunk);
    }

    const buffer = Buffer.concat(chunks);

    // Проверка размера файла
    if (buffer.length > this.maxFileSize) {
      throw new BadRequestException(
        `Размер файла превышает ${this.maxFileSize / 1024 / 1024}MB`,
      );
    }

    // Обработка изображения с Sharp
    const processedBuffer = await this.processImage(buffer);

    // Генерируем уникальное имя файла
    const fileExt = path.extname(filename);
    const uniqueBasename = this.generateUniqueBasename();
    // For team logos, we might want to keep the extension or just use .webp if we process it
    // But logically, generateUniqueBasename returns just unique base.
    // Let's assume we want to keep the extension but process to webp regardless? 
    // Wait, processImage converts to webp. So the extension should be .webp.
    const uniqueName = `${uniqueBasename}.webp`;

    // Сохраняем файл
    await this.saveFile(
      processedBuffer,
      'team-logos',
      uniqueName,
    );

    // Возвращаем относительный URL
    return `/uploads/team-logos/${uniqueName}`;
  }

  /**
   * Обработка изображения: resize и оптимизация
   */
  private async processImage(buffer: Buffer): Promise<Buffer> {
    return sharp(buffer)
      .resize(512, 512, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 0 }, // Прозрачный фон
      })
      .webp({ quality: 90 }) // Конвертируем в WebP для оптимизации
      .toBuffer();
  }

  /**
   * Сохранение файла на диск
   */
  private async saveFile(
    buffer: Buffer,
    directory: string,
    filename: string,
  ): Promise<string> {
    const dirPath = path.join(this.uploadsDir, directory);

    // Создаём директорию если не существует
    await fs.mkdir(dirPath, { recursive: true });

    const filePath = path.join(dirPath, filename);
    await fs.writeFile(filePath, buffer);

    return filePath;
  }

  /*
   * Генерация уникального имени файла (без расширения)
   */
  private generateUniqueBasename(): string {
    const timestamp = Date.now();
    const randomString = crypto.randomBytes(8).toString('hex');
    return `${timestamp}-${randomString}`;
  }

  /**
   * Загрузка фото для фотоотчёта
   * @param file - Загружаемый файл
   * @returns Object с URL оригинала, thumbnail, и метаданными
   */
  async uploadReportPhoto(file: FileUpload): Promise<{
    photoUrl: string;
    thumbnailUrl: string;
    width: number;
    height: number;
    fileSize: number;
  }> {
    // Читаем файл
    const { createReadStream, mimetype } = file;

    // Валидация MIME type
    if (!this.allowedMimeTypes.includes(mimetype)) {
      throw new BadRequestException(
        `Недопустимый формат файла. Разрешены: PNG, JPG, JPEG, WEBP`,
      );
    }

    // Читаем содержимое файла
    const stream = createReadStream();
    const chunks: Buffer[] = [];

    for await (const chunk of stream) {
      chunks.push(chunk);
    }

    const buffer = Buffer.concat(chunks);

    // Проверка размера файла (5MB)
    if (buffer.length > this.maxFileSize) {
      throw new BadRequestException(
        `Размер файла превышает ${this.maxFileSize / 1024 / 1024}MB`,
      );
    }

    // Генерируем уникальное базовое имя
    const uniqueBasename = this.generateUniqueBasename();

    // Обработка оригинала (max 1920x1920, WebP)
    const originalImage = sharp(buffer);
    const metadata = await originalImage.metadata();

    const processedOriginal = await originalImage
      .resize(1920, 1920, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .webp({ quality: 85 })
      .toBuffer();

    // Обработка thumbnail (400x400, WebP)
    const thumbnailBuffer = await sharp(buffer)
      .resize(400, 400, {
        fit: 'cover',
      })
      .webp({ quality: 80 })
      .toBuffer();

    // Сохраняем оба файла
    const originalFilename = `${uniqueBasename}.webp`;
    const thumbnailFilename = `${uniqueBasename}-thumb.webp`;

    await this.saveFile(processedOriginal, 'report-photos', originalFilename);
    await this.saveFile(thumbnailBuffer, 'report-photos', thumbnailFilename);

    // Получаем финальные размеры после обработки
    const finalMetadata = await sharp(processedOriginal).metadata();

    return {
      photoUrl: `/uploads/report-photos/${originalFilename}`,
      thumbnailUrl: `/uploads/report-photos/${thumbnailFilename}`,
      width: finalMetadata.width || metadata.width || 0,
      height: finalMetadata.height || metadata.height || 0,
      fileSize: processedOriginal.length,
    };
  }

  /**
   * Удаление файла (для будущего использования)
   */
  async deleteFile(filePath: string): Promise<void> {
    try {
      await fs.unlink(filePath);
    } catch (error) {
      // Файл не существует - игнорируем ошибку
    }
  }
}
