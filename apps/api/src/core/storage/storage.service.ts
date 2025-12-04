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
    const { createReadStream, filename, mimetype } = await file;

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
    const uniqueName = this.generateUniqueFilename(fileExt);

    // Сохраняем файл
    const filePath = await this.saveFile(
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

  /**
   * Генерация уникального имени файла
   */
  private generateUniqueFilename(extension: string): string {
    const timestamp = Date.now();
    const randomString = crypto.randomBytes(8).toString('hex');
    return `${timestamp}-${randomString}${extension === '.jpg' ? '.webp' : '.webp'}`;
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
