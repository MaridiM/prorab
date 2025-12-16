/**
 * Cloudflare R2 Storage Provider
 *
 * Implements S3-compatible storage with unified folder structure
 * Object key structure: prorab-space/user-{userId}/team-{teamId}/project-{projectId}/{fileType}/filename
 */

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  ListObjectsV2Command,
  HeadBucketCommand,
} from '@aws-sdk/client-s3';
import {
  IStorageProvider,
  FileMetadata,
  UploadResult,
} from '../interfaces/storage-provider.interface';
import {
  UploadError,
  DeleteError,
  ConnectionError,
  ConfigurationError,
} from '../exceptions/storage-provider.exception';

@Injectable()
export class R2Provider implements IStorageProvider {
  private readonly logger = new Logger(R2Provider.name);
  private readonly s3Client: S3Client | null = null;
  private readonly bucketName: string;
  private readonly publicUrl: string;
  private readonly accountId: string;
  private readonly accessKeyId: string;
  private readonly secretAccessKey: string;

  constructor(private configService: ConfigService) {
    // Get R2 configuration
    this.accountId = this.configService.get<string>('R2_ACCOUNT_ID', '');
    this.accessKeyId = this.configService.get<string>('R2_ACCESS_KEY_ID', '');
    this.secretAccessKey = this.configService.get<string>('R2_SECRET_ACCESS_KEY', '');
    this.bucketName = this.configService.get<string>('R2_BUCKET_NAME', 'prorab-uploads');
    this.publicUrl = this.configService.get<string>(
      'R2_PUBLIC_URL',
      'https://uploads.prorab.space',
    );

    // Initialize S3 client only if credentials are available
    if (this.accountId && this.accessKeyId && this.secretAccessKey) {
      this.s3Client = new S3Client({
        region: 'auto',
        endpoint: `https://${this.accountId}.r2.cloudflarestorage.com`,
        credentials: {
          accessKeyId: this.accessKeyId,
          secretAccessKey: this.secretAccessKey,
        },
      });

      this.logger.log(`R2 provider initialized with bucket: ${this.bucketName}`);
    } else {
      this.logger.warn(`R2 provider initialized without credentials - will fail on use`);
    }
  }

  /**
   * Upload a file to Cloudflare R2
   */
  async upload(
    buffer: Buffer,
    metadata: FileMetadata,
  ): Promise<UploadResult> {
    // Validate configuration before use
    if (!this.s3Client) {
      throw new ConfigurationError(
        'Cloudflare R2 credentials are not configured',
        'r2',
        ['R2_ACCOUNT_ID', 'R2_ACCESS_KEY_ID', 'R2_SECRET_ACCESS_KEY'],
      );
    }

    try {
      // Build object key using unified structure
      const objectKey = this.buildObjectKey(metadata);

      // Upload to R2
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: objectKey,
        Body: buffer,
        ContentType: metadata.mimetype,
        CacheControl: 'public, max-age=31536000', // 1 year
        Metadata: {
          userId: metadata.userId,
          teamId: metadata.teamId || '',
          projectId: metadata.projectId || '',
          fileType: metadata.fileType,
          originalFilename: metadata.filename,
        },
      });

      await this.s3Client.send(command);

      // Build public URL
      const url = `${this.publicUrl}/${objectKey}`;

      this.logger.log(`File uploaded to R2: ${objectKey}`);

      return {
        url,
        size: buffer.length,
        width: metadata.width,
        height: metadata.height,
      };
    } catch (error) {
      this.logger.error(`R2 upload failed: ${error.message}`, error.stack);
      throw new UploadError(
        `Failed to upload to R2: ${error.message}`,
        'r2',
        metadata.filename,
        error,
      );
    }
  }

  /**
   * Delete a file from R2
   */
  async delete(fileUrl: string): Promise<void> {
    try {
      // Extract object key from URL
      const objectKey = this.extractObjectKey(fileUrl);

      if (!objectKey) {
        this.logger.warn(`Could not extract object key from URL: ${fileUrl}`);
        return;
      }

      // Delete from R2
      const command = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: objectKey,
      });

      await this.s3Client.send(command);

      this.logger.log(`File deleted from R2: ${objectKey}`);
    } catch (error) {
      this.logger.error(`R2 delete failed: ${error.message}`, error.stack);
      throw new DeleteError(
        `Failed to delete from R2: ${error.message}`,
        'r2',
        fileUrl,
        error,
      );
    }
  }

  /**
   * Delete a folder and all its contents from R2
   */
  async deleteFolder(folderPath: string): Promise<void> {
    try {
      // Normalize folder path (ensure it ends with /)
      const normalizedPath = folderPath.endsWith('/') ? folderPath : `${folderPath}/`;

      // List all objects with this prefix
      const listCommand = new ListObjectsV2Command({
        Bucket: this.bucketName,
        Prefix: normalizedPath,
      });

      const listResponse = await this.s3Client.send(listCommand);

      // Delete all objects
      if (listResponse.Contents && listResponse.Contents.length > 0) {
        const deletePromises = listResponse.Contents.map((object) => {
          if (object.Key) {
            const deleteCommand = new DeleteObjectCommand({
              Bucket: this.bucketName,
              Key: object.Key,
            });
            return this.s3Client.send(deleteCommand);
          }
          return Promise.resolve();
        });

        await Promise.all(deletePromises);

        this.logger.log(
          `Deleted ${listResponse.Contents.length} objects from R2 folder: ${folderPath}`,
        );
      } else {
        this.logger.warn(`No objects found in R2 folder: ${folderPath}`);
      }
    } catch (error) {
      this.logger.error(`R2 folder delete failed: ${error.message}`, error.stack);
      throw new DeleteError(
        `Failed to delete folder from R2: ${error.message}`,
        'r2',
        folderPath,
        error,
      );
    }
  }

  /**
   * Test connection to R2
   */
  async testConnection(): Promise<boolean> {
    try {
      // Try to head the bucket
      const command = new HeadBucketCommand({
        Bucket: this.bucketName,
      });

      await this.s3Client.send(command);

      this.logger.log('R2 connection test successful');
      return true;
    } catch (error) {
      this.logger.error(`R2 connection test failed: ${error.message}`, error.stack);
      throw new ConnectionError(
        `R2 connection test failed: ${error.message}`,
        'r2',
        error,
      );
    }
  }

  /**
   * Build unified object key (same structure as Local and Cloudinary)
   *
   * Structure:
   * prorab-space/user-{userId}/avatars/filename
   * prorab-space/user-{userId}/team-{teamId}/team-logos/filename
   * prorab-space/user-{userId}/team-{teamId}/project-{projectId}/report-photos/filename
   */
  private buildObjectKey(metadata: FileMetadata): string {
    const parts: string[] = ['prorab-space', `user-${metadata.userId}`];

    // Add teamId if present
    if (metadata.teamId) {
      parts.push(`team-${metadata.teamId}`);
    }

    // Add projectId if present
    if (metadata.projectId) {
      parts.push(`project-${metadata.projectId}`);
    }

    // Add fileType
    parts.push(metadata.fileType);

    // Add filename
    parts.push(metadata.filename);

    return parts.join('/');
  }

  /**
   * Extract object key from R2 public URL
   *
   * Example:
   * URL: https://uploads.prorab.space/prorab-space/user-123/avatars/file.webp
   * Object Key: prorab-space/user-123/avatars/file.webp
   */
  private extractObjectKey(fileUrl: string): string | null {
    try {
      // Remove public URL prefix
      const objectKey = fileUrl.replace(this.publicUrl + '/', '');

      // If the URL starts with prorab-space, it's valid
      if (objectKey.startsWith('prorab-space/')) {
        return objectKey;
      }

      // Try to extract from path
      const match = fileUrl.match(/prorab-space\/(.+)$/);
      if (match) {
        return match[0];
      }

      return null;
    } catch (error) {
      this.logger.error(`Failed to extract object key: ${error.message}`, error.stack);
      return null;
    }
  }
}
