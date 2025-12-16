/**
 * Storage Provider Exceptions
 *
 * Custom exceptions for storage provider operations
 */

/**
 * Base storage provider error
 */
export class StorageProviderError extends Error {
  constructor(
    message: string,
    public readonly provider: string,
    public readonly originalError?: Error,
  ) {
    super(message);
    this.name = 'StorageProviderError';

    // Maintain proper stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, StorageProviderError);
    }
  }
}

/**
 * Upload error
 */
export class UploadError extends StorageProviderError {
  constructor(
    message: string,
    provider: string,
    public readonly filename?: string,
    originalError?: Error,
  ) {
    super(message, provider, originalError);
    this.name = 'UploadError';
  }
}

/**
 * Delete error
 */
export class DeleteError extends StorageProviderError {
  constructor(
    message: string,
    provider: string,
    public readonly fileUrl?: string,
    originalError?: Error,
  ) {
    super(message, provider, originalError);
    this.name = 'DeleteError';
  }
}

/**
 * Connection test error
 */
export class ConnectionError extends StorageProviderError {
  constructor(message: string, provider: string, originalError?: Error) {
    super(message, provider, originalError);
    this.name = 'ConnectionError';
  }
}

/**
 * Migration error
 */
export class MigrationError extends Error {
  constructor(
    message: string,
    public readonly fileUrl: string,
    public readonly fromProvider: string,
    public readonly toProvider: string,
    public readonly originalError?: Error,
  ) {
    super(message);
    this.name = 'MigrationError';

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, MigrationError);
    }
  }
}

/**
 * Configuration error (missing credentials, invalid settings, etc.)
 */
export class ConfigurationError extends StorageProviderError {
  constructor(
    message: string,
    provider: string,
    public readonly missingConfig?: string[],
    originalError?: Error,
  ) {
    super(message, provider, originalError);
    this.name = 'ConfigurationError';
  }
}
