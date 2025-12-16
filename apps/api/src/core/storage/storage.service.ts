/**
 * Storage Service
 *
 * Main service for file upload/deletion operations
 * Uses StorageProviderFactory to delegate to appropriate storage backend
 */

import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import sharp from 'sharp';
import type { FileUpload } from 'graphql-upload-minimal';
import { StorageProviderFactory } from './factories/storage-provider.factory';
import {
  FileMetadata,
  FileType,
  UploadResult,
} from './interfaces/storage-provider.interface';

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly maxFileSize = 5 * 1024 * 1024; // 5MB
  private readonly allowedMimeTypes = [
    'image/png',
    'image/jpeg',
    'image/jpg',
    'image/webp',
  ];

  constructor(
    private readonly configService: ConfigService,
    private readonly providerFactory: StorageProviderFactory,
  ) {}

  /**
   * Upload avatar for user
   * @param file - Uploaded file
   * @param userId - User ID
   * @returns Upload result with URL
   */
  async uploadAvatar(file: FileUpload, userId: string): Promise<string> {
    // Validate and read file
    const { buffer, mimetype } = await this.validateAndReadFile(file);

    // Process image with Sharp (512x512, contain mode)
    const processedBuffer = await sharp(buffer)
      .resize(512, 512, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 0 },
      })
      .webp({ quality: 90 })
      .toBuffer();

    // Get metadata
    const metadata = await sharp(processedBuffer).metadata();

    // Generate unique filename
    const filename = this.generateUniqueFilename('webp');

    // Build file metadata
    const fileMetadata: FileMetadata = {
      userId,
      fileType: FileType.AVATAR,
      filename,
      mimetype: 'image/webp',
      size: processedBuffer.length,
      width: metadata.width,
      height: metadata.height,
    };

    // Get provider and upload
    const provider = await this.providerFactory.getProvider(userId);
    const result = await provider.upload(processedBuffer, fileMetadata);

    this.logger.log(`Avatar uploaded for user ${userId}: ${result.url}`);

    return result.url;
  }

  /**
   * Upload team logo
   * @param file - Uploaded file
   * @param userId - User ID (for provider selection)
   * @param teamId - Team ID (optional, for folder structure)
   * @returns URL of uploaded logo
   */
  async uploadTeamLogo(
    file: FileUpload,
    userId: string,
    teamId?: string,
  ): Promise<string> {
    // Validate and read file
    const { buffer, mimetype } = await this.validateAndReadFile(file);

    // Process image with Sharp (512x512, contain mode)
    const processedBuffer = await sharp(buffer)
      .resize(512, 512, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 0 },
      })
      .webp({ quality: 90 })
      .toBuffer();

    // Get metadata
    const metadata = await sharp(processedBuffer).metadata();

    // Generate unique filename
    const filename = this.generateUniqueFilename('webp');

    // Build file metadata
    const fileMetadata: FileMetadata = {
      userId,
      teamId,
      fileType: FileType.TEAM_LOGO,
      filename,
      mimetype: 'image/webp',
      size: processedBuffer.length,
      width: metadata.width,
      height: metadata.height,
    };

    // Get provider and upload
    const provider = await this.providerFactory.getProvider(userId);
    const result = await provider.upload(processedBuffer, fileMetadata);

    this.logger.log(`Team logo uploaded: ${result.url}`);

    return result.url;
  }

  /**
   * Upload report photo
   * @param file - Uploaded file
   * @param userId - User ID
   * @param teamId - Team ID
   * @param projectId - Project ID
   * @returns Upload result with URL, thumbnail, dimensions, and file size
   */
  async uploadReportPhoto(
    file: FileUpload,
    userId: string,
    teamId: string,
    projectId: string,
  ): Promise<{
    photoUrl: string;
    thumbnailUrl: string;
    width: number;
    height: number;
    fileSize: number;
  }> {
    // Validate and read file
    const { buffer, mimetype } = await this.validateAndReadFile(file);

    // Process original (max 1920x1920, WebP)
    const originalImage = sharp(buffer);
    const originalMetadata = await originalImage.metadata();

    const processedOriginal = await originalImage
      .resize(1920, 1920, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .webp({ quality: 85 })
      .toBuffer();

    // Process thumbnail (400x400, WebP)
    const thumbnailBuffer = await sharp(buffer)
      .resize(400, 400, {
        fit: 'cover',
      })
      .webp({ quality: 80 })
      .toBuffer();

    // Get final metadata
    const finalMetadata = await sharp(processedOriginal).metadata();

    // Generate unique filename
    const uniqueBasename = this.generateUniqueBasename();
    const originalFilename = `${uniqueBasename}.webp`;
    const thumbnailFilename = `${uniqueBasename}-thumb.webp`;

    // Build file metadata for original
    const originalFileMetadata: FileMetadata = {
      userId,
      teamId,
      projectId,
      fileType: FileType.REPORT_PHOTO,
      filename: originalFilename,
      mimetype: 'image/webp',
      size: processedOriginal.length,
      width: finalMetadata.width,
      height: finalMetadata.height,
    };

    // Build file metadata for thumbnail
    const thumbnailFileMetadata: FileMetadata = {
      userId,
      teamId,
      projectId,
      fileType: FileType.REPORT_PHOTO,
      filename: thumbnailFilename,
      mimetype: 'image/webp',
      size: thumbnailBuffer.length,
      width: 400,
      height: 400,
    };

    // Get provider
    const provider = await this.providerFactory.getProvider(userId);

    // Upload both original and thumbnail
    const [originalResult, thumbnailResult] = await Promise.all([
      provider.upload(processedOriginal, originalFileMetadata),
      provider.upload(thumbnailBuffer, thumbnailFileMetadata),
    ]);

    this.logger.log(`Report photo uploaded: ${originalResult.url}`);

    return {
      photoUrl: originalResult.url,
      thumbnailUrl: thumbnailResult.url,
      width: finalMetadata.width || originalMetadata.width || 0,
      height: finalMetadata.height || originalMetadata.height || 0,
      fileSize: processedOriginal.length,
    };
  }

  /**
   * Upload expense photo
   * @param file - Uploaded file
   * @param userId - User ID
   * @param teamId - Team ID
   * @param projectId - Project ID
   * @returns URL of uploaded photo
   */
  async uploadExpensePhoto(
    file: FileUpload,
    userId: string,
    teamId: string,
    projectId: string,
  ): Promise<string> {
    // Validate and read file
    const { buffer, mimetype } = await this.validateAndReadFile(file);

    // Process image (max 1920x1920, WebP)
    const processedBuffer = await sharp(buffer)
      .resize(1920, 1920, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .webp({ quality: 85 })
      .toBuffer();

    // Get metadata
    const metadata = await sharp(processedBuffer).metadata();

    // Generate unique filename
    const filename = this.generateUniqueFilename('webp');

    // Build file metadata
    const fileMetadata: FileMetadata = {
      userId,
      teamId,
      projectId,
      fileType: FileType.EXPENSE_PHOTO,
      filename,
      mimetype: 'image/webp',
      size: processedBuffer.length,
      width: metadata.width,
      height: metadata.height,
    };

    // Get provider and upload
    const provider = await this.providerFactory.getProvider(userId);
    const result = await provider.upload(processedBuffer, fileMetadata);

    this.logger.log(`Expense photo uploaded: ${result.url}`);

    return result.url;
  }

  /**
   * Delete a file
   * @param fileUrl - URL of the file to delete
   * @param userId - User ID (for provider selection)
   */
  async deleteFile(fileUrl: string, userId?: string): Promise<void> {
    try {
      const provider = await this.providerFactory.getProvider(userId);
      await provider.delete(fileUrl);
      this.logger.log(`File deleted: ${fileUrl}`);
    } catch (error) {
      this.logger.error(`Failed to delete file: ${error.message}`, error.stack);
      // Don't throw - file might not exist
    }
  }

  /**
   * Delete all files for a user (cascade delete on user deletion)
   * @param userId - User ID
   */
  async deleteUserFolder(userId: string): Promise<void> {
    try {
      const provider = await this.providerFactory.getProvider(userId);
      const folderPath = `prorab-space/user-${userId}`;
      await provider.deleteFolder(folderPath);
      this.logger.log(`User folder deleted: ${folderPath}`);
    } catch (error) {
      this.logger.error(`Failed to delete user folder: ${error.message}`, error.stack);
      // Don't throw - folder might not exist
    }
  }

  /**
   * Delete all files for a team (cascade delete on team deletion)
   * @param userId - User ID (team owner)
   * @param teamId - Team ID
   */
  async deleteTeamFolder(userId: string, teamId: string): Promise<void> {
    try {
      const provider = await this.providerFactory.getProvider(userId);
      const folderPath = `prorab-space/user-${userId}/team-${teamId}`;
      await provider.deleteFolder(folderPath);
      this.logger.log(`Team folder deleted: ${folderPath}`);
    } catch (error) {
      this.logger.error(`Failed to delete team folder: ${error.message}`, error.stack);
      // Don't throw - folder might not exist
    }
  }

  /**
   * Delete all files for a project (cascade delete on project deletion)
   * @param userId - User ID (project owner)
   * @param teamId - Team ID
   * @param projectId - Project ID
   */
  async deleteProjectFolder(
    userId: string,
    teamId: string,
    projectId: string,
  ): Promise<void> {
    try {
      const provider = await this.providerFactory.getProvider(userId);
      const folderPath = `prorab-space/user-${userId}/team-${teamId}/project-${projectId}`;
      await provider.deleteFolder(folderPath);
      this.logger.log(`Project folder deleted: ${folderPath}`);
    } catch (error) {
      this.logger.error(
        `Failed to delete project folder: ${error.message}`,
        error.stack,
      );
      // Don't throw - folder might not exist
    }
  }

  /**
   * Validate file and read buffer
   */
  private async validateAndReadFile(
    file: FileUpload,
  ): Promise<{ buffer: Buffer; mimetype: string }> {
    const { createReadStream, mimetype } = file;

    // Validate MIME type
    if (!this.allowedMimeTypes.includes(mimetype)) {
      throw new BadRequestException(
        `Invalid file format. Allowed: PNG, JPG, JPEG, WEBP`,
      );
    }

    // Read file into buffer
    const stream = createReadStream();
    const chunks: Buffer[] = [];

    for await (const chunk of stream) {
      chunks.push(chunk);
    }

    const buffer = Buffer.concat(chunks);

    // Check file size
    if (buffer.length > this.maxFileSize) {
      throw new BadRequestException(
        `File size exceeds ${this.maxFileSize / 1024 / 1024}MB`,
      );
    }

    return { buffer, mimetype };
  }

  /**
   * Generate unique filename with extension
   */
  private generateUniqueFilename(extension: string): string {
    const basename = this.generateUniqueBasename();
    return `${basename}.${extension}`;
  }

  /**
   * Generate unique basename (timestamp + random string)
   */
  private generateUniqueBasename(): string {
    const timestamp = Date.now();
    const randomString = crypto.randomBytes(8).toString('hex');
    return `${timestamp}-${randomString}`;
  }
}
