import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PrismaService } from '../../core/prisma/prisma.service'
import * as crypto from 'crypto'
import * as OTPAuth from 'otpauth'

@Injectable()
export class TwoFactorService {
	private readonly encryptionKey: Buffer

	constructor(
		private readonly prisma: PrismaService,
		private readonly configService: ConfigService,
	) {
		const keyHex = this.configService.get<string>('ENCRYPTION_KEY')
		if (!keyHex || keyHex.length !== 64) {
			throw new Error(
				'ENCRYPTION_KEY must be a 64-character hex string (32 bytes). ' +
					'Generate with: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"',
			)
		}
		this.encryptionKey = Buffer.from(keyHex, 'hex')
	}

	/**
	 * Get 2FA status for a user
	 */
	async getStatus(userId: string): Promise<{ enabled: boolean; backupCodesRemaining: number }> {
		const user = await this.prisma.user.findUnique({
			where: { id: userId },
			select: {
				twoFactorEnabled: true,
				twoFactorBackupCodes: true,
			},
		})

		return {
			enabled: user?.twoFactorEnabled || false,
			backupCodesRemaining: user?.twoFactorBackupCodes?.length || 0,
		}
	}

	/**
	 * Generate a new TOTP secret and QR code URL for the user
	 */
	async generateSecret(userId: string) {
		const user = await this.prisma.user.findUnique({
			where: { id: userId },
			select: { email: true, fullName: true },
		})

		if (!user) {
			throw new Error('User not found')
		}

		// Generate a random secret (base32 encoded)
		const secret = new OTPAuth.Secret({ size: 20 })

		// Create TOTP instance
		const totp = new OTPAuth.TOTP({
			issuer: 'Prorab',
			label: user.email,
			algorithm: 'SHA1',
			digits: 6,
			period: 30,
			secret: secret,
		})

		// Generate QR code URL
		const qrCodeUrl = totp.toString()

		return {
			secret: secret.base32,
			qrCodeUrl,
			manualEntryCode: secret.base32,
		}
	}

	/**
	 * Verify a TOTP code against the user's secret
	 */
	verifyToken(secret: string, token: string): boolean {
		try {
			const totp = new OTPAuth.TOTP({
				issuer: 'Prorab',
				algorithm: 'SHA1',
				digits: 6,
				period: 30,
				secret: OTPAuth.Secret.fromBase32(secret),
			})

			// Verify with a window of ±1 period (90 seconds total)
			const delta = totp.validate({ token, window: 1 })

			return delta !== null
		} catch (error) {
			return false
		}
	}

	/**
	 * Enable 2FA for a user after verifying their token
	 */
	async enable2FA(userId: string, secret: string, token: string) {
		// Verify the token first
		if (!this.verifyToken(secret, token)) {
			throw new Error('Invalid verification code')
		}

		// Generate backup codes
		const backupCodes = this.generateBackupCodes(10)
		const hashedBackupCodes = backupCodes.map((code) => this.hashBackupCode(code))

		// Save to database
		await this.prisma.user.update({
			where: { id: userId },
			data: {
				twoFactorEnabled: true,
				twoFactorSecret: this.encryptSecret(secret),
				twoFactorBackupCodes: hashedBackupCodes,
			},
		})

		// Return backup codes to user (only time they'll see them)
		return {
			success: true,
			backupCodes,
		}
	}

	/**
	 * Disable 2FA for a user
	 */
	async disable2FA(userId: string, token: string) {
		const user = await this.prisma.user.findUnique({
			where: { id: userId },
			select: { twoFactorSecret: true, twoFactorEnabled: true },
		})

		if (!user?.twoFactorEnabled || !user?.twoFactorSecret) {
			throw new Error('2FA is not enabled')
		}

		const secret = this.decryptSecret(user.twoFactorSecret)

		// Verify the token before disabling
		if (!this.verifyToken(secret, token)) {
			throw new Error('Invalid verification code')
		}

		await this.prisma.user.update({
			where: { id: userId },
			data: {
				twoFactorEnabled: false,
				twoFactorSecret: null,
				twoFactorBackupCodes: [],
			},
		})

		return { success: true }
	}

	/**
	 * Verify 2FA token during login
	 */
	async verify2FAToken(userId: string, token: string): Promise<boolean> {
		const user = await this.prisma.user.findUnique({
			where: { id: userId },
			select: {
				twoFactorEnabled: true,
				twoFactorSecret: true,
				twoFactorBackupCodes: true,
			},
		})

		if (!user?.twoFactorEnabled || !user?.twoFactorSecret) {
			return false
		}

		const secret = this.decryptSecret(user.twoFactorSecret)

		// Try TOTP first
		if (this.verifyToken(secret, token)) {
			return true
		}

		// Try backup codes
		return this.verifyBackupCode(userId, token, user.twoFactorBackupCodes)
	}

	/**
	 * Verify a backup code and invalidate it if valid
	 */
	private async verifyBackupCode(
		userId: string,
		code: string,
		hashedCodes: string[],
	): Promise<boolean> {
		const hashedInput = this.hashBackupCode(code)

		const index = hashedCodes.findIndex((hash) => hash === hashedInput)

		if (index === -1) {
			return false
		}

		// Remove the used backup code
		const updatedCodes = hashedCodes.filter((_, i) => i !== index)

		await this.prisma.user.update({
			where: { id: userId },
			data: { twoFactorBackupCodes: updatedCodes },
		})

		return true
	}

	/**
	 * Generate new backup codes
	 */
	async regenerateBackupCodes(userId: string, token: string) {
		const user = await this.prisma.user.findUnique({
			where: { id: userId },
			select: { twoFactorSecret: true, twoFactorEnabled: true },
		})

		if (!user?.twoFactorEnabled || !user?.twoFactorSecret) {
			throw new Error('2FA is not enabled')
		}

		const secret = this.decryptSecret(user.twoFactorSecret)

		// Verify token
		if (!this.verifyToken(secret, token)) {
			throw new Error('Invalid verification code')
		}

		// Generate new backup codes
		const backupCodes = this.generateBackupCodes(10)
		const hashedBackupCodes = backupCodes.map((code) => this.hashBackupCode(code))

		await this.prisma.user.update({
			where: { id: userId },
			data: { twoFactorBackupCodes: hashedBackupCodes },
		})

		return { backupCodes }
	}

	/**
	 * Generate random backup codes
	 */
	private generateBackupCodes(count: number): string[] {
		const codes: string[] = []

		for (let i = 0; i < count; i++) {
			// Generate 8-character alphanumeric code
			const code = crypto.randomBytes(4).toString('hex').toUpperCase()
			codes.push(code)
		}

		return codes
	}

	/**
	 * Hash a backup code for storage
	 */
	private hashBackupCode(code: string): string {
		return crypto.createHash('sha256').update(code).digest('hex')
	}

	/**
	 * Encrypt secret before storing in database using AES-256-GCM
	 */
	private encryptSecret(secret: string): string {
		const algorithm = 'aes-256-gcm'
		const iv = crypto.randomBytes(16)

		const cipher = crypto.createCipheriv(algorithm, this.encryptionKey, iv)
		let encrypted = cipher.update(secret, 'utf8', 'hex')
		encrypted += cipher.final('hex')
		const authTag = cipher.getAuthTag()

		// Format: iv:encrypted:authTag (all hex-encoded)
		return `${iv.toString('hex')}:${encrypted}:${authTag.toString('hex')}`
	}

	/**
	 * Decrypt secret from database using AES-256-GCM
	 */
	private decryptSecret(encryptedSecret: string): string {
		const algorithm = 'aes-256-gcm'

		// Handle legacy base64-encoded secrets (for migration compatibility)
		if (!encryptedSecret.includes(':')) {
			// This is a legacy base64-encoded secret
			// Decrypt it and re-encrypt with proper encryption
			return Buffer.from(encryptedSecret, 'base64').toString('utf-8')
		}

		const parts = encryptedSecret.split(':')
		if (parts.length !== 3) {
			throw new Error('Invalid encrypted secret format')
		}

		const [ivHex, encryptedHex, authTagHex] = parts
		const iv = Buffer.from(ivHex, 'hex')
		const authTag = Buffer.from(authTagHex, 'hex')

		const decipher = crypto.createDecipheriv(algorithm, this.encryptionKey, iv)
		decipher.setAuthTag(authTag)

		let decrypted = decipher.update(encryptedHex, 'hex', 'utf8')
		decrypted += decipher.final('utf8')
		return decrypted
	}
}
