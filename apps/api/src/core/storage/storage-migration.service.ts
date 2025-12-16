/**
 * Storage Migration Service
 *
 * Handles migration of files between different storage providers
 * Supports:
 * - Single file migration
 * - Bulk user migration
 * - Automatic migration on provider switch
 */

import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StorageProviderFactory } from './factories/storage-provider.factory';
import {
  IStorageProvider,
  StorageProviderType,
  FileMetadata,
} from './interfaces/storage-provider.interface';
import { MigrationError } from './exceptions/storage-provider.exception';
import * as https from 'https';
import * as http from 'http';

export interface MigrationResult {
  success: boolean;
  oldUrl: string;
  newUrl?: string;
  error?: string;
}

export interface BulkMigrationResult {
  totalFiles: number;
  successCount: number;
  failedCount: number;
  failures: Array<{ url: string; error: string }>;
}

@Injectable()
export class StorageMigrationService {
  private readonly logger = new Logger(StorageMigrationService.name);

  constructor(
    private prisma: PrismaService,
    private providerFactory: StorageProviderFactory,
  ) {}

  /**
   * Migrate a single file from one provider to another
   * @param fileUrl - Current file URL
   * @param metadata - File metadata for upload
   * @param fromProvider - Source provider type
   * @param toProvider - Destination provider type
   * @returns Migration result with new URL
   */
  async migrateFile(
    fileUrl: string,
    metadata: FileMetadata,
    fromProvider: StorageProviderType,
    toProvider: StorageProviderType,
  ): Promise<MigrationResult> {
    try {
      this.logger.log(`Migrating file from ${fromProvider} to ${toProvider}: ${fileUrl}`);

      // Get providers
      const sourceProvider = await this.providerFactory.getProviderByType(fromProvider);
      const targetProvider = await this.providerFactory.getProviderByType(toProvider);

      // Download file from source
      const fileBuffer = await this.downloadFile(fileUrl);

      // Upload to target provider
      const uploadResult = await targetProvider.upload(fileBuffer, metadata);

      // Delete from source provider (optional, can be done later)
      // await sourceProvider.delete(fileUrl);

      this.logger.log(`File migrated successfully: ${fileUrl} -> ${uploadResult.url}`);

      return {
        success: true,
        oldUrl: fileUrl,
        newUrl: uploadResult.url,
      };
    } catch (error) {
      this.logger.error(`File migration failed: ${error.message}`, error.stack);

      return {
        success: false,
        oldUrl: fileUrl,
        error: error.message,
      };
    }
  }

  /**
   * Migrate all files for a specific user
   * @param userId - User ID
   * @param fromProvider - Source provider type
   * @param toProvider - Destination provider type
   * @returns Bulk migration result
   */
  async migrateUserFiles(
    userId: string,
    fromProvider: StorageProviderType,
    toProvider: StorageProviderType,
  ): Promise<BulkMigrationResult> {
    this.logger.log(`Starting bulk migration for user ${userId}: ${fromProvider} -> ${toProvider}`);

    const result: BulkMigrationResult = {
      totalFiles: 0,
      successCount: 0,
      failedCount: 0,
      failures: [],
    };

    try {
      // Get user
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        include: {
          ownedTeams: {
            include: {
              projects: true,
            },
          },
        },
      });

      if (!user) {
        throw new Error(`User not found: ${userId}`);
      }

      // Collect all file URLs to migrate
      const filesToMigrate: Array<{ url: string; metadata: FileMetadata }> = [];

      // 1. User avatar
      if (user.avatarUrl) {
        filesToMigrate.push({
          url: user.avatarUrl,
          metadata: {
            userId,
            fileType: 'avatars' as any,
            filename: this.extractFilename(user.avatarUrl),
            mimetype: 'image/webp',
            size: 0,
          },
        });
      }

      // 2. Team logos
      for (const team of user.ownedTeams) {
        if (team.logoUrl) {
          filesToMigrate.push({
            url: team.logoUrl,
            metadata: {
              userId,
              teamId: team.id,
              fileType: 'team-logos' as any,
              filename: this.extractFilename(team.logoUrl),
              mimetype: 'image/webp',
              size: 0,
            },
          });
        }

        // 3. Project report photos and expense photos
        for (const project of team.projects) {
          // Get photo reports cover photos for this project
          const photoReports = await this.prisma.photoReport.findMany({
            where: { projectId: project.id },
          });

          for (const report of photoReports) {
            if (report.coverPhotoUrl) {
              filesToMigrate.push({
                url: report.coverPhotoUrl,
                metadata: {
                  userId,
                  teamId: team.id,
                  projectId: project.id,
                  fileType: 'report-photos' as any,
                  filename: this.extractFilename(report.coverPhotoUrl),
                  mimetype: 'image/webp',
                  size: 0,
                },
              });
            }
          }

          // Get individual report photos for this project
          const reportPhotos = await this.prisma.reportPhoto.findMany({
            where: {
              report: { projectId: project.id }
            },
          });

          for (const photo of reportPhotos) {
            if (photo.photoUrl) {
              filesToMigrate.push({
                url: photo.photoUrl,
                metadata: {
                  userId,
                  teamId: team.id,
                  projectId: project.id,
                  fileType: 'report-photos' as any,
                  filename: this.extractFilename(photo.photoUrl),
                  mimetype: 'image/webp',
                  size: photo.fileSize || 0,
                },
              });
            }

            if (photo.thumbnailUrl) {
              filesToMigrate.push({
                url: photo.thumbnailUrl,
                metadata: {
                  userId,
                  teamId: team.id,
                  projectId: project.id,
                  fileType: 'report-photos' as any,
                  filename: this.extractFilename(photo.thumbnailUrl),
                  mimetype: 'image/webp',
                  size: 0,
                },
              });
            }
          }

          // Get expenses with photos
          const expenses = await this.prisma.expense.findMany({
            where: {
              projectId: project.id,
            },
          });

          for (const expense of expenses) {
            // photos is an array of URLs
            for (const photoUrl of expense.photos) {
              filesToMigrate.push({
                url: photoUrl,
                metadata: {
                  userId,
                  teamId: team.id,
                  projectId: project.id,
                  fileType: 'expense-photos' as any,
                  filename: this.extractFilename(photoUrl),
                  mimetype: 'image/webp',
                  size: 0,
                },
              });
            }
          }
        }
      }

      result.totalFiles = filesToMigrate.length;

      this.logger.log(`Found ${result.totalFiles} files to migrate for user ${userId}`);

      // Migrate each file
      for (const file of filesToMigrate) {
        const migrationResult = await this.migrateFile(
          file.url,
          file.metadata,
          fromProvider,
          toProvider,
        );

        if (migrationResult.success) {
          result.successCount++;

          // Update database with new URL
          await this.updateFileUrl(file.url, migrationResult.newUrl!);
        } else {
          result.failedCount++;
          result.failures.push({
            url: file.url,
            error: migrationResult.error || 'Unknown error',
          });
        }
      }

      // Update user's storage migration info
      await this.prisma.user.update({
        where: { id: userId },
        data: {
          storagePreference: toProvider as any,
          storageMigratedFrom: fromProvider as any,
          storageMigratedAt: new Date(),
        },
      });

      this.logger.log(
        `Bulk migration complete for user ${userId}: ${result.successCount}/${result.totalFiles} successful`,
      );

      return result;
    } catch (error) {
      this.logger.error(`Bulk migration failed: ${error.message}`, error.stack);
      throw new MigrationError(
        `Bulk migration failed: ${error.message}`,
        'all',
        fromProvider,
        toProvider,
        error,
      );
    }
  }

  /**
   * Download file from URL (works with both HTTP and HTTPS)
   */
  private async downloadFile(url: string): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const protocol = url.startsWith('https') ? https : http;

      protocol
        .get(url, (response) => {
          if (response.statusCode !== 200) {
            reject(new Error(`Failed to download file: HTTP ${response.statusCode}`));
            return;
          }

          const chunks: Buffer[] = [];

          response.on('data', (chunk) => {
            chunks.push(chunk);
          });

          response.on('end', () => {
            resolve(Buffer.concat(chunks));
          });
        })
        .on('error', (error) => {
          reject(error);
        });
    });
  }

  /**
   * Extract filename from URL
   */
  private extractFilename(url: string): string {
    const parts = url.split('/');
    return parts[parts.length - 1];
  }

  /**
   * Update file URL in database
   */
  private async updateFileUrl(oldUrl: string, newUrl: string): Promise<void> {
    // Update user avatars
    await this.prisma.user.updateMany({
      where: { avatarUrl: oldUrl },
      data: { avatarUrl: newUrl },
    });

    // Update team logos
    await this.prisma.team.updateMany({
      where: { logoUrl: oldUrl },
      data: { logoUrl: newUrl },
    });

    // Update photo report cover photos
    await this.prisma.photoReport.updateMany({
      where: { coverPhotoUrl: oldUrl },
      data: { coverPhotoUrl: newUrl },
    });

    // Update report photos (photoUrl)
    await this.prisma.reportPhoto.updateMany({
      where: { photoUrl: oldUrl },
      data: { photoUrl: newUrl },
    });

    // Update report photos (thumbnailUrl)
    await this.prisma.reportPhoto.updateMany({
      where: { thumbnailUrl: oldUrl },
      data: { thumbnailUrl: newUrl },
    });

    // Update expenses (photos field is an array, so we need to update it differently)
    const expenses = await this.prisma.expense.findMany({
      where: {
        photos: {
          has: oldUrl,
        },
      },
    });

    for (const expense of expenses) {
      const updatedPhotos = expense.photos.map((photo) =>
        photo === oldUrl ? newUrl : photo,
      );
      await this.prisma.expense.update({
        where: { id: expense.id },
        data: { photos: updatedPhotos },
      });
    }
  }
}
