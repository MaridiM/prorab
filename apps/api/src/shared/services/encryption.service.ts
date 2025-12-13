import { Injectable, Logger } from '@nestjs/common';
import * as crypto from 'crypto';

@Injectable()
export class EncryptionService {
  private readonly logger = new Logger(EncryptionService.name);
  private readonly algorithm = 'aes-256-gcm';
  private readonly ivLength = 16;
  private readonly saltLength = 64;
  private readonly tagLength = 16;
  private readonly keyLength = 32;

  /**
   * Get encryption key from environment variable
   * In production, this should be stored in a secure key management service
   */
  private getEncryptionKey(): Buffer {
    const key = process.env.ENCRYPTION_KEY;

    if (!key) {
      throw new Error(
        'ENCRYPTION_KEY environment variable is required for encryption operations'
      );
    }

    // Derive a key using PBKDF2
    const salt = Buffer.from(process.env.ENCRYPTION_SALT || 'prorab-default-salt');
    return crypto.pbkdf2Sync(key, salt, 100000, this.keyLength, 'sha256');
  }

  /**
   * Encrypt sensitive data using AES-256-GCM
   * @param text Plain text to encrypt
   * @returns Encrypted string in format: iv:tag:encryptedData
   */
  encrypt(text: string): string {
    try {
      const key = this.getEncryptionKey();
      const iv = crypto.randomBytes(this.ivLength);

      const cipher = crypto.createCipheriv(this.algorithm, key, iv);

      let encrypted = cipher.update(text, 'utf8', 'hex');
      encrypted += cipher.final('hex');

      const tag = cipher.getAuthTag();

      // Format: iv:tag:encryptedData
      return `${iv.toString('hex')}:${tag.toString('hex')}:${encrypted}`;
    } catch (error) {
      this.logger.error('Encryption failed', error);
      throw new Error('Failed to encrypt data');
    }
  }

  /**
   * Decrypt encrypted data
   * @param encryptedData Encrypted string in format: iv:tag:encryptedData
   * @returns Decrypted plain text
   */
  decrypt(encryptedData: string): string {
    try {
      const key = this.getEncryptionKey();
      const parts = encryptedData.split(':');

      if (parts.length !== 3) {
        throw new Error('Invalid encrypted data format');
      }

      const iv = Buffer.from(parts[0], 'hex');
      const tag = Buffer.from(parts[1], 'hex');
      const encrypted = parts[2];

      const decipher = crypto.createDecipheriv(this.algorithm, key, iv);
      decipher.setAuthTag(tag);

      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');

      return decrypted;
    } catch (error) {
      this.logger.error('Decryption failed', error);
      throw new Error('Failed to decrypt data');
    }
  }

  /**
   * Hash sensitive data (one-way, cannot be decrypted)
   * Used for storing passwords, backup codes, etc.
   * @param text Plain text to hash
   * @returns Hashed string
   */
  hash(text: string): string {
    const salt = crypto.randomBytes(this.saltLength);
    const hash = crypto.pbkdf2Sync(text, salt, 100000, 64, 'sha512');

    return `${salt.toString('hex')}:${hash.toString('hex')}`;
  }

  /**
   * Verify hashed data
   * @param text Plain text to verify
   * @param hashedText Hashed text in format: salt:hash
   * @returns True if match, false otherwise
   */
  verifyHash(text: string, hashedText: string): boolean {
    try {
      const parts = hashedText.split(':');

      if (parts.length !== 2) {
        return false;
      }

      const salt = Buffer.from(parts[0], 'hex');
      const originalHash = parts[1];

      const hash = crypto.pbkdf2Sync(text, salt, 100000, 64, 'sha512');

      return hash.toString('hex') === originalHash;
    } catch (error) {
      this.logger.error('Hash verification failed', error);
      return false;
    }
  }

  /**
   * Generate a random token (for API keys, secrets, etc.)
   * @param length Length in bytes (default 32)
   * @returns Random hex string
   */
  generateToken(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex');
  }

  /**
   * Generate TOTP secret for 2FA
   * @returns Base32 encoded secret
   */
  generateTOTPSecret(): string {
    const buffer = crypto.randomBytes(20);
    return this.base32Encode(buffer);
  }

  /**
   * Base32 encode (for TOTP secrets)
   */
  private base32Encode(buffer: Buffer): string {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    let bits = 0;
    let value = 0;
    let output = '';

    for (let i = 0; i < buffer.length; i++) {
      value = (value << 8) | buffer[i];
      bits += 8;

      while (bits >= 5) {
        output += alphabet[(value >>> (bits - 5)) & 31];
        bits -= 5;
      }
    }

    if (bits > 0) {
      output += alphabet[(value << (5 - bits)) & 31];
    }

    return output;
  }
}
