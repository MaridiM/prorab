/**
 * Storage Provider Interface
 *
 * Unified interface for all storage providers (Local, Cloudinary, R2)
 * Implements Strategy Pattern for flexible storage backend switching
 */

export interface IStorageProvider {
  /**
   * Upload a file to storage
   * @param buffer - File buffer (already processed with Sharp if needed)
   * @param metadata - File metadata (userId, teamId, projectId, fileType, etc.)
   * @returns Upload result with URL and metadata
   */
  upload(buffer: Buffer, metadata: FileMetadata): Promise<UploadResult>;

  /**
   * Delete a file from storage
   * @param fileUrl - Full URL or path to the file
   */
  delete(fileUrl: string): Promise<void>;

  /**
   * Delete a folder and all its contents recursively
   * @param folderPath - Path to the folder (e.g., "prorab-space/user-123/team-456")
   */
  deleteFolder(folderPath: string): Promise<void>;

  /**
   * Test connection to the storage provider
   * @returns true if connection is successful
   */
  testConnection(): Promise<boolean>;

  /**
   * Get thumbnail URL for an image (optional, provider-specific)
   * @param fileUrl - Original file URL
   * @param options - Thumbnail options (width, height, quality)
   * @returns Thumbnail URL (for providers that support URL transformations like Cloudinary)
   */
  getThumbnailUrl?(fileUrl: string, options: ThumbnailOptions): string;
}

/**
 * File metadata for upload
 */
export interface FileMetadata {
  /** User ID who owns the file */
  userId: string;

  /** Team ID (optional, for team-related files) */
  teamId?: string;

  /** Project ID (optional, for project-related files) */
  projectId?: string;

  /** File type (avatars, team-logos, report-photos, expense-photos) */
  fileType: FileType;

  /** Filename with extension (e.g., "1702468800000-a1b2c3d4.webp") */
  filename: string;

  /** MIME type (e.g., "image/webp", "image/jpeg") */
  mimetype: string;

  /** File size in bytes */
  size: number;

  /** Image width in pixels (optional) */
  width?: number;

  /** Image height in pixels (optional) */
  height?: number;
}

/**
 * Upload result
 */
export interface UploadResult {
  /** Full URL to access the uploaded file */
  url: string;

  /** Thumbnail URL (if applicable) */
  thumbnailUrl?: string;

  /** Public ID (for Cloudinary) */
  publicId?: string;

  /** File size in bytes */
  size: number;

  /** Image width in pixels (if applicable) */
  width?: number;

  /** Image height in pixels (if applicable) */
  height?: number;
}

/**
 * Thumbnail options
 */
export interface ThumbnailOptions {
  /** Thumbnail width in pixels */
  width: number;

  /** Thumbnail height in pixels */
  height: number;

  /** Crop mode (fill, fit, scale, etc.) */
  crop?: 'fill' | 'fit' | 'scale' | 'pad';

  /** Quality (1-100) */
  quality?: number;
}

/**
 * File types for organized folder structure
 *
 * Structure:
 * prorab-space/
 * ├── system/
 * │   └── bot-avatars/
 * └── user-{userId}/
 *     ├── avatars/
 *     └── team-{teamId}/
 *         ├── team-logos/
 *         └── project-{projectId}/
 *             ├── report-photos/
 *             └── expense-photos/
 */
export enum FileType {
  /** User avatars: prorab-space/user-{userId}/avatars/ */
  AVATAR = 'avatars',

  /** Team logos: prorab-space/user-{userId}/team-{teamId}/team-logos/ */
  TEAM_LOGO = 'team-logos',

  /** Photo reports: prorab-space/user-{userId}/team-{teamId}/project-{projectId}/report-photos/ */
  REPORT_PHOTO = 'report-photos',

  /** Expense receipts: prorab-space/user-{userId}/team-{teamId}/project-{projectId}/expense-photos/ */
  EXPENSE_PHOTO = 'expense-photos',

  /** Bot avatars: prorab-space/system/bot-avatars/ */
  BOT_AVATAR = 'bot-avatars',
}

/**
 * Storage provider types
 */
export enum StorageProviderType {
  /** Local file system storage */
  LOCAL = 'local',

  /** Cloudinary cloud storage */
  CLOUDINARY = 'cloudinary',

  /** Cloudflare R2 object storage */
  R2 = 'r2',
}
