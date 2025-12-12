import { Injectable, BadRequestException } from '@nestjs/common';
import { unlinkSync, existsSync } from 'fs';
import { join } from 'path';

@Injectable()
export class FileUploadService {
  private readonly baseUrl = process.env.BASE_URL || 'http://localhost:8080';
  private readonly uploadPath = join(process.cwd(), 'uploads', 'avatars');

  /**
   * Get public URL for uploaded file
   */
  getFileUrl(filename: string): string {
    return `${this.baseUrl}/uploads/avatars/${filename}`;
  }

  /**
   * Delete file from filesystem
   */
  deleteFile(filename: string): void {
    if (!filename) {
      return;
    }

    // Extract filename from URL if full URL was passed
    const filenameOnly = filename.split('/').pop();
    const filePath = join(this.uploadPath, filenameOnly);

    if (existsSync(filePath)) {
      try {
        unlinkSync(filePath);
      } catch (error) {
        console.error(`Failed to delete file ${filename}:`, error);
      }
    }
  }

  /**
   * Validate image file
   */
  validateImage(file: Express.Multer.File): void {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    // Check file size (5MB max)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new BadRequestException('File too large. Maximum size is 5MB');
    }

    // Check mimetype
    const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedMimes.includes(file.mimetype)) {
      throw new BadRequestException('Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed');
    }
  }
}
