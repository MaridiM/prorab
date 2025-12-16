/**
 * Cloudinary Storage Provider
 *
 * Implements Cloudinary cloud storage with unified folder structure
 * Folder structure: prorab-space/user-{userId}/team-{teamId}/project-{projectId}/{fileType}/
 */

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import {
  IStorageProvider,
  FileMetadata,
  UploadResult,
  ThumbnailOptions,
  FileType,
} from '../interfaces/storage-provider.interface';
import {
  UploadError,
  DeleteError,
  ConnectionError,
  ConfigurationError,
} from '../exceptions/storage-provider.exception';

@Injectable()
export class CloudinaryProvider implements IStorageProvider {
  private readonly logger = new Logger(CloudinaryProvider.name);
  private readonly cloudName: string;
  private readonly apiKey: string;
  private readonly apiSecret: string;

  constructor(private configService: ConfigService) {
    // Get credentials from config
    this.cloudName = this.configService.get<string>('CLOUDINARY_CLOUD_NAME', 'prorab-space');
    this.apiKey = this.configService.get<string>('CLOUDINARY_API_KEY', '');
    this.apiSecret = this.configService.get<string>('CLOUDINARY_API_SECRET', '');

    // Configure Cloudinary only if credentials are available
    if (this.apiKey && this.apiSecret) {
      cloudinary.config({
        cloud_name: this.cloudName,
        api_key: this.apiKey,
        api_secret: this.apiSecret,
      });

      this.logger.log(`Cloudinary provider initialized with cloud: ${this.cloudName}`);
    } else {
      this.logger.warn(`Cloudinary provider initialized without credentials - will fail on use`);
    }
  }

  /**
   * Upload a file to Cloudinary
   */
  async upload(
    buffer: Buffer,
    metadata: FileMetadata,
  ): Promise<UploadResult> {
    // Validate configuration before use
    if (!this.apiKey || !this.apiSecret) {
      throw new ConfigurationError(
        'Cloudinary credentials are not configured',
        'cloudinary',
        ['CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET'],
      );
    }

    try {
      // Build folder path using unified structure
      const folderPath = this.buildFolderPath(metadata);

      // Extract filename without extension for public_id
      const filenameWithoutExt = metadata.filename.replace(/\.[^/.]+$/, '');

      // Build public_id: prorab-space/user-123/avatars/1702468800000-a1b2c3d4
      const publicId = `${folderPath}/${filenameWithoutExt}`;

      // Prepare upload options
      const uploadOptions = {
        public_id: publicId,
        folder: '', // Folder is included in public_id
        resource_type: 'image' as const,
        format: 'webp',
        overwrite: false,
        invalidate: true,
      };

      // Add transformation based on file type
      this.addTransformation(uploadOptions, metadata.fileType);

      // Upload to Cloudinary using buffer
      const result: UploadApiResponse = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          uploadOptions,
          (error, result) => {
            if (error) {
              reject(error);
            } else {
              resolve(result);
            }
          },
        );

        // Write buffer to stream
        uploadStream.end(buffer);
      });

      this.logger.log(`File uploaded to Cloudinary: ${result.public_id}`);

      return {
        url: result.secure_url,
        publicId: result.public_id,
        size: result.bytes,
        width: result.width,
        height: result.height,
      };
    } catch (error) {
      this.logger.error(`Cloudinary upload failed: ${error.message}`, error.stack);
      throw new UploadError(
        `Failed to upload to Cloudinary: ${error.message}`,
        'cloudinary',
        metadata.filename,
        error,
      );
    }
  }

  /**
   * Delete a file from Cloudinary
   */
  async delete(fileUrl: string): Promise<void> {
    try {
      // Extract public_id from URL
      const publicId = this.extractPublicId(fileUrl);

      if (!publicId) {
        this.logger.warn(`Could not extract public_id from URL: ${fileUrl}`);
        return;
      }

      // Delete from Cloudinary
      const result = await cloudinary.uploader.destroy(publicId);

      if (result.result === 'ok') {
        this.logger.log(`File deleted from Cloudinary: ${publicId}`);
      } else if (result.result === 'not found') {
        this.logger.warn(`File not found on Cloudinary: ${publicId}`);
      } else {
        throw new Error(`Unexpected result: ${result.result}`);
      }
    } catch (error) {
      this.logger.error(`Cloudinary delete failed: ${error.message}`, error.stack);
      throw new DeleteError(
        `Failed to delete from Cloudinary: ${error.message}`,
        'cloudinary',
        fileUrl,
        error,
      );
    }
  }

  /**
   * Delete a folder and all its contents from Cloudinary
   */
  async deleteFolder(folderPath: string): Promise<void> {
    try {
      // Cloudinary folder path should NOT have leading slash
      const normalizedPath = folderPath.replace(/^\/+/, '');

      // Delete all resources in folder
      await cloudinary.api.delete_resources_by_prefix(normalizedPath);

      // Delete the folder itself
      await cloudinary.api.delete_folder(normalizedPath);

      this.logger.log(`Folder deleted from Cloudinary: ${normalizedPath}`);
    } catch (error) {
      // Cloudinary throws error if folder doesn't exist, but we can ignore that
      if (error.error?.http_code === 404) {
        this.logger.warn(`Folder not found on Cloudinary: ${folderPath}`);
        return;
      }

      this.logger.error(`Cloudinary folder delete failed: ${error.message}`, error.stack);
      throw new DeleteError(
        `Failed to delete folder from Cloudinary: ${error.message}`,
        'cloudinary',
        folderPath,
        error,
      );
    }
  }

  /**
   * Test connection to Cloudinary
   */
  async testConnection(): Promise<boolean> {
    try {
      // Try to ping Cloudinary API
      await cloudinary.api.ping();

      this.logger.log('Cloudinary connection test successful');
      return true;
    } catch (error) {
      this.logger.error(`Cloudinary connection test failed: ${error.message}`, error.stack);
      throw new ConnectionError(
        `Cloudinary connection test failed: ${error.message}`,
        'cloudinary',
        error,
      );
    }
  }

  /**
   * Get thumbnail URL with Cloudinary transformations
   */
  getThumbnailUrl(fileUrl: string, options: ThumbnailOptions): string {
    try {
      const publicId = this.extractPublicId(fileUrl);

      if (!publicId) {
        // If we can't extract public_id, return original URL
        return fileUrl;
      }

      // Build transformation string
      const transformations = [];

      // Add dimensions
      transformations.push(`w_${options.width}`);
      transformations.push(`h_${options.height}`);

      // Add crop mode
      const cropMode = options.crop || 'fill';
      transformations.push(`c_${cropMode}`);

      // Add quality
      if (options.quality) {
        transformations.push(`q_${options.quality}`);
      }

      // Build URL with transformations
      const transformationString = transformations.join(',');

      return cloudinary.url(publicId, {
        transformation: transformationString,
        secure: true,
        format: 'webp',
      });
    } catch (error) {
      this.logger.error(`Failed to generate thumbnail URL: ${error.message}`, error.stack);
      return fileUrl; // Fallback to original URL
    }
  }

  /**
   * Build unified folder path (same as LocalProvider)
   *
   * Structure:
   * prorab-space/user-{userId}/avatars/
   * prorab-space/user-{userId}/team-{teamId}/team-logos/
   * prorab-space/user-{userId}/team-{teamId}/project-{projectId}/report-photos/
   */
  private buildFolderPath(metadata: FileMetadata): string {
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

    return parts.join('/');
  }

  /**
   * Extract public_id from Cloudinary URL
   *
   * Example:
   * URL: https://res.cloudinary.com/prorab-space/image/upload/v1234567890/prorab-space/user-123/avatars/file.webp
   * Public ID: prorab-space/user-123/avatars/file
   */
  private extractPublicId(fileUrl: string): string | null {
    try {
      // Match pattern: .../upload/v{version}/path/to/file.ext or .../upload/path/to/file.ext
      const match = fileUrl.match(/\/upload\/(?:v\d+\/)?(.+?)(?:\.\w+)?$/);

      if (match && match[1]) {
        return match[1];
      }

      return null;
    } catch (error) {
      this.logger.error(`Failed to extract public_id: ${error.message}`, error.stack);
      return null;
    }
  }

  /**
   * Add eager transformations based on file type
   */
  private addTransformation(uploadOptions: any, fileType: FileType): void {
    switch (fileType) {
      case FileType.AVATAR:
        uploadOptions.transformation = [
          {
            width: 512,
            height: 512,
            crop: 'fill',
            gravity: 'face',
            quality: 90,
          },
        ];
        break;

      case FileType.TEAM_LOGO:
        uploadOptions.transformation = [
          {
            width: 512,
            height: 512,
            crop: 'fit',
            quality: 90,
          },
        ];
        break;

      case FileType.REPORT_PHOTO:
        uploadOptions.transformation = [
          {
            width: 1920,
            height: 1920,
            crop: 'limit',
            quality: 85,
          },
        ];
        // Add eager thumbnail generation
        uploadOptions.eager = [
          {
            width: 400,
            height: 400,
            crop: 'fill',
            quality: 80,
          },
        ];
        break;

      case FileType.EXPENSE_PHOTO:
        uploadOptions.transformation = [
          {
            width: 1920,
            height: 1920,
            crop: 'limit',
            quality: 85,
          },
        ];
        break;
    }
  }
}
