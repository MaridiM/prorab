/**
 * Local Storage Provider
 *
 * Implements local file system storage with unified folder structure
 * Storage path: uploads/prorab-space/{userId}/{teamId}/{projectId}/{fileType}/
 */

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs/promises';
import * as path from 'path';
import {
  IStorageProvider,
  FileMetadata,
  UploadResult,
} from '../interfaces/storage-provider.interface';
import {
  UploadError,
  DeleteError,
  ConnectionError,
} from '../exceptions/storage-provider.exception';

@Injectable()
export class LocalStorageProvider implements IStorageProvider {
  private readonly logger = new Logger(LocalStorageProvider.name);
  private readonly uploadsDir: string;
  private readonly baseUrl: string;

  constructor(private configService: ConfigService) {
    // Base directory: uploads/prorab-space/
    this.uploadsDir = path.join(
      process.cwd(),
      'uploads',
      'prorab-space',
    );

    // Base URL for accessing files
    this.baseUrl = this.configService.get<string>('BASE_URL', 'http://localhost:4000');
  }

  /**
   * Upload a file to local storage
   */
  async upload(
    buffer: Buffer,
    metadata: FileMetadata,
  ): Promise<UploadResult> {
    try {
      // Build folder path using unified structure
      const folderPath = this.buildFolderPath(metadata);
      const fullDirPath = path.join(this.uploadsDir, folderPath);

      // Ensure directory exists
      await this.ensureDirectoryExists(fullDirPath);

      // Build full file path
      const filePath = path.join(fullDirPath, metadata.filename);

      // Save file to disk (buffer is already processed by StorageService)
      await fs.writeFile(filePath, buffer);

      // Build public URL
      const relativePath = path.join('prorab-space', folderPath, metadata.filename);
      const url = `/uploads/${relativePath.replace(/\\/g, '/')}`;

      this.logger.log(`File uploaded successfully: ${url}`);

      return {
        url,
        size: buffer.length,
        width: metadata.width,
        height: metadata.height,
      };
    } catch (error) {
      this.logger.error(`Upload failed: ${error.message}`, error.stack);
      throw new UploadError(
        `Failed to upload file: ${error.message}`,
        'local',
        metadata.filename,
        error,
      );
    }
  }

  /**
   * Delete a file from local storage
   */
  async delete(fileUrl: string): Promise<void> {
    try {
      // Extract file path from URL
      // Example: /uploads/prorab-space/user-123/avatars/file.webp
      const relativePath = fileUrl.replace('/uploads/', '');
      const filePath = path.join(process.cwd(), 'uploads', relativePath);

      // Check if file exists
      try {
        await fs.access(filePath);
      } catch {
        // File doesn't exist, nothing to delete
        this.logger.warn(`File not found for deletion: ${fileUrl}`);
        return;
      }

      // Delete file
      await fs.unlink(filePath);
      this.logger.log(`File deleted successfully: ${fileUrl}`);
    } catch (error) {
      this.logger.error(`Delete failed: ${error.message}`, error.stack);
      throw new DeleteError(
        `Failed to delete file: ${error.message}`,
        'local',
        fileUrl,
        error,
      );
    }
  }

  /**
   * Delete a folder and all its contents recursively
   */
  async deleteFolder(folderPath: string): Promise<void> {
    try {
      // Build full directory path
      // folderPath example: "prorab-space/user-123/team-456"
      const fullPath = path.join(process.cwd(), 'uploads', folderPath);

      // Check if directory exists
      try {
        await fs.access(fullPath);
      } catch {
        // Directory doesn't exist, nothing to delete
        this.logger.warn(`Folder not found for deletion: ${folderPath}`);
        return;
      }

      // Delete directory recursively
      await fs.rm(fullPath, { recursive: true, force: true });
      this.logger.log(`Folder deleted successfully: ${folderPath}`);
    } catch (error) {
      this.logger.error(`Folder delete failed: ${error.message}`, error.stack);
      throw new DeleteError(
        `Failed to delete folder: ${error.message}`,
        'local',
        folderPath,
        error,
      );
    }
  }

  /**
   * Test connection to local storage (check if uploads directory is accessible)
   */
  async testConnection(): Promise<boolean> {
    try {
      // Ensure base directory exists
      await this.ensureDirectoryExists(this.uploadsDir);

      // Try to write and read a test file
      const testFilePath = path.join(this.uploadsDir, '.test-connection');
      await fs.writeFile(testFilePath, 'test');
      await fs.readFile(testFilePath);
      await fs.unlink(testFilePath);

      this.logger.log('Local storage connection test successful');
      return true;
    } catch (error) {
      this.logger.error(`Connection test failed: ${error.message}`, error.stack);
      throw new ConnectionError(
        `Local storage connection test failed: ${error.message}`,
        'local',
        error,
      );
    }
  }

  /**
   * Build unified folder path
   *
   * Structure:
   * prorab-space/user-{userId}/avatars/
   * prorab-space/user-{userId}/team-{teamId}/team-logos/
   * prorab-space/user-{userId}/team-{teamId}/project-{projectId}/report-photos/
   * prorab-space/user-{userId}/team-{teamId}/project-{projectId}/expense-photos/
   */
  private buildFolderPath(metadata: FileMetadata): string {
    const parts: string[] = [`user-${metadata.userId}`];

    // Add teamId if present
    if (metadata.teamId) {
      parts.push(`team-${metadata.teamId}`);
    }

    // Add projectId if present
    if (metadata.projectId) {
      parts.push(`project-${metadata.projectId}`);
    }

    // Add fileType (avatars, team-logos, report-photos, expense-photos)
    parts.push(metadata.fileType);

    return parts.join('/');
  }

  /**
   * Ensure directory exists, create if not
   */
  private async ensureDirectoryExists(dirPath: string): Promise<void> {
    try {
      await fs.mkdir(dirPath, { recursive: true });
    } catch (error) {
      throw new Error(`Failed to create directory ${dirPath}: ${error.message}`);
    }
  }
}
