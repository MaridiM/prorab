/**
 * GraphQL Models for Admin Storage
 */

import { ObjectType, Field, InputType, Int, Float, registerEnumType } from '@nestjs/graphql';

/**
 * Storage Provider Types
 */
export enum StorageProviderType {
  LOCAL = 'local',
  CLOUDINARY = 'cloudinary',
  R2 = 'r2',
}

registerEnumType(StorageProviderType, {
  name: 'StorageProviderType',
  description: 'Available storage provider types',
});

/**
 * Storage Settings Model
 */
@ObjectType()
export class StorageSettings {
  @Field(() => String, { description: 'Storage admin mode (local | cloudinary | r2 | user_choice)' })
  adminMode: string;

  @Field(() => String, { description: 'Default storage provider (local | cloudinary | r2)' })
  defaultProvider: string;

  @Field(() => Boolean, { description: 'Auto-migrate files on provider switch' })
  autoMigrate: boolean;

  // Cloudinary
  @Field(() => String, { nullable: true, description: 'Cloudinary cloud name' })
  cloudinaryCloudName?: string;

  @Field(() => String, { nullable: true, description: 'Cloudinary API key' })
  cloudinaryApiKey?: string;

  @Field(() => Boolean, { description: 'Whether Cloudinary API secret is set' })
  cloudinaryApiSecretSet: boolean;

  // R2
  @Field(() => String, { nullable: true, description: 'Cloudflare account ID' })
  r2AccountId?: string;

  @Field(() => Boolean, { description: 'Whether R2 access key ID is set' })
  r2AccessKeyIdSet: boolean;

  @Field(() => Boolean, { description: 'Whether R2 secret access key is set' })
  r2SecretAccessKeySet: boolean;

  @Field(() => String, { nullable: true, description: 'R2 bucket name' })
  r2BucketName?: string;

  @Field(() => String, { nullable: true, description: 'R2 public URL' })
  r2PublicUrl?: string;
}

/**
 * Update Storage Settings Input
 */
@InputType()
export class UpdateStorageSettingsInput {
  @Field(() => String, { nullable: true })
  adminMode?: string;

  @Field(() => String, { nullable: true })
  defaultProvider?: string;

  @Field(() => Boolean, { nullable: true })
  autoMigrate?: boolean;

  // Cloudinary
  @Field(() => String, { nullable: true })
  cloudinaryCloudName?: string;

  @Field(() => String, { nullable: true })
  cloudinaryApiKey?: string;

  @Field(() => String, { nullable: true })
  cloudinaryApiSecret?: string;

  // R2
  @Field(() => String, { nullable: true })
  r2AccountId?: string;

  @Field(() => String, { nullable: true })
  r2AccessKeyId?: string;

  @Field(() => String, { nullable: true })
  r2SecretAccessKey?: string;

  @Field(() => String, { nullable: true })
  r2BucketName?: string;

  @Field(() => String, { nullable: true })
  r2PublicUrl?: string;
}

/**
 * Storage Statistics
 */
@ObjectType()
export class StorageStats {
  @Field(() => Int, { description: 'Total number of files' })
  totalFiles: number;

  @Field(() => Float, { description: 'Total size in bytes' })
  totalSize: number;

  @Field(() => [ProviderFileStats], { description: 'Files grouped by provider' })
  filesByProvider: ProviderFileStats[];

  @Field(() => [FileTypeStats], { description: 'Files grouped by type' })
  filesByType: FileTypeStats[];
}

@ObjectType()
export class ProviderFileStats {
  @Field(() => String, { description: 'Provider name' })
  provider: string;

  @Field(() => Int, { description: 'Number of files' })
  fileCount: number;

  @Field(() => Float, { description: 'Total size in bytes' })
  totalSize: number;
}

@ObjectType()
export class FileTypeStats {
  @Field(() => String, { description: 'File type (avatars, team-logos, etc.)' })
  fileType: string;

  @Field(() => Int, { description: 'Number of files' })
  count: number;

  @Field(() => Float, { description: 'Total size in bytes' })
  totalSize: number;
}

/**
 * Provider Test Result
 */
@ObjectType()
export class ProviderTestResult {
  @Field(() => StorageProviderType, { description: 'Provider type' })
  provider: StorageProviderType;

  @Field(() => Boolean, { description: 'Whether test was successful' })
  success: boolean;

  @Field(() => String, { description: 'Test result message' })
  message: string;

  @Field(() => Int, { nullable: true, description: 'Test latency in milliseconds' })
  latency?: number;
}

/**
 * Migration Result
 */
@ObjectType()
export class StorageMigrationResult {
  @Field(() => String, { description: 'User ID' })
  userId: string;

  @Field(() => StorageProviderType, { description: 'Source provider' })
  fromProvider: StorageProviderType;

  @Field(() => StorageProviderType, { description: 'Destination provider' })
  toProvider: StorageProviderType;

  @Field(() => Int, { description: 'Total files to migrate' })
  totalFiles: number;

  @Field(() => Int, { description: 'Successfully migrated files' })
  successCount: number;

  @Field(() => Int, { description: 'Failed migrations' })
  failedCount: number;

  @Field(() => [MigrationFailure], { description: 'List of failures' })
  failures: MigrationFailure[];
}

@ObjectType()
export class MigrationFailure {
  @Field(() => String, { description: 'File URL' })
  url: string;

  @Field(() => String, { description: 'Error message' })
  error: string;
}
