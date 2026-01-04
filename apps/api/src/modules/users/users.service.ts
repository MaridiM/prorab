import { Injectable, BadRequestException, UnauthorizedException, Logger, Inject, forwardRef } from '@nestjs/common'
import { FileUpload } from 'graphql-upload-minimal'
import { createWriteStream, existsSync, mkdirSync, unlinkSync } from 'fs'
import { join } from 'path'
import * as argon2 from 'argon2'
import { nanoid } from 'nanoid'

import { PrismaService } from '../../core/prisma/prisma.service'
import { RedisService } from '../../core/redis/redis.service'
import { MailService } from '../../core/mail/mail.service'
import { UpdateProfileInput } from './dto/update-profile.input'
import { RequestChangeEmailInput } from './dto/request-change-email.input'
import { UserStoragePreference, StorageProviderOption, UserStorageProviderType } from './models/user-storage.model'
import { StorageProviderType } from '../../core/storage/interfaces/storage-provider.interface'
import { TwoFactorService } from '../auth/two-factor.service'

interface CreateUserData {
	email: string
	emailNormalized: string
	passwordHash: string
	fullName: string
	phone?: string
}

@Injectable()
export class UsersService {
	private readonly logger = new Logger(UsersService.name);
	private readonly baseUrl = process.env.BASE_URL || 'http://localhost:8080';
	private readonly uploadPath = join(process.cwd(), 'uploads', 'avatars');
	private readonly emailChangeTokenTtl = 24 * 60 * 60 * 1000; // 24 hours
	private readonly rateLimitWindow = 60 * 60 * 1000; // 1 hour

	constructor(
		private readonly prisma: PrismaService,
		private readonly redisService: RedisService,
		private readonly mailService: MailService,
		@Inject(forwardRef(() => TwoFactorService))
		private readonly twoFactorService: TwoFactorService,
	) {}

	async create(data: CreateUserData) {
		return this.prisma.user.create({
			data: {
				email: data.email,
				emailNormalized: data.emailNormalized,
				passwordHash: data.passwordHash,
				fullName: data.fullName,
				phone: data.phone,
			},
		})
	}

	async findById(id: string) {
		return this.prisma.user.findUnique({
			where: { id },
			include: {
				adminRole: true,
			},
		})
	}

	async findByEmail(email: string) {
		return this.prisma.user.findUnique({
			where: { email: email.trim().toLowerCase() },
		})
	}

	async findByEmailNormalized(emailNormalized: string) {
		return this.prisma.user.findUnique({
			where: { emailNormalized },
		})
	}

	async findByTelegramChatId(chatId: string) {
		return this.prisma.user.findUnique({
			where: { telegramChatId: chatId },
		})
	}

	async verifyEmail(userId: string) {
		return this.prisma.user.update({
			where: { id: userId },
			data: { emailVerified: true },
		})
	}

	async updatePassword(userId: string, passwordHash: string) {
		return this.prisma.user.update({
			where: { id: userId },
			data: { passwordHash },
		})
	}

	// ==================== Verification Tokens ====================

	async createVerificationToken(userId: string, token: string, expiresAt: Date) {
		// Delete existing tokens for this user
		await this.prisma.verificationToken.deleteMany({
			where: { userId },
		})

		return this.prisma.verificationToken.create({
			data: {
				userId,
				token,
				expiresAt,
			},
		})
	}

	async findVerificationToken(token: string) {
		return this.prisma.verificationToken.findUnique({
			where: { token },
		})
	}

	async deleteVerificationToken(token: string) {
		return this.prisma.verificationToken.delete({
			where: { token },
		})
	}

	// ==================== Password Reset Tokens ====================

	async createPasswordResetToken(userId: string, token: string, expiresAt: Date) {
		return this.prisma.passwordResetToken.create({
			data: {
				userId,
				token,
				expiresAt,
			},
		})
	}

	async findPasswordResetToken(token: string) {
		return this.prisma.passwordResetToken.findUnique({
			where: { token },
		})
	}

	async markPasswordResetTokenUsed(token: string) {
		return this.prisma.passwordResetToken.update({
			where: { token },
			data: { used: true },
		})
	}

	// ==================== Profile ====================

	async updateProfile(userId: string, input: UpdateProfileInput) {
		const updateData: any = {}

		if (input.fullName !== undefined) {
			updateData.fullName = input.fullName
		}

		if (input.phone !== undefined) {
			updateData.phone = input.phone || null
		}

		return this.prisma.user.update({
			where: { id: userId },
			data: updateData,
		})
	}

	// ==================== Account Management ====================

	private async verifyPassword(hash: string, password: string): Promise<boolean> {
		return argon2.verify(hash, password)
	}

	async deleteAccount(userId: string, password: string) {
		this.logger.log(`[DeleteAccount] Starting deletion for user ${userId}`)
		
		// Verify password first
		const user = await this.findById(userId)
		if (!user) {
			this.logger.warn(`[DeleteAccount] User ${userId} not found`)
			throw new BadRequestException('Пользователь не найден')
		}

		const isValidPassword = await this.verifyPassword(user.passwordHash, password)
		if (!isValidPassword) {
			this.logger.warn(`[DeleteAccount] Invalid password for user ${userId}`)
			throw new UnauthorizedException('Неверный пароль')
		}

		// Safety check: find all teams where user is the owner
		const ownedTeams = await this.prisma.team.findMany({
			where: { ownerId: userId },
			include: {
				members: true,
				projects: true,
				subscription: true,
			},
		})

		this.logger.log(`[DeleteAccount] Found ${ownedTeams.length} owned teams for user ${userId}`)

		// Check if user owns any teams with other members or active projects
		const hasActiveTeams = ownedTeams.some(
			team => team.members.length > 1 || team.projects.length > 0
		)

		if (hasActiveTeams) {
			this.logger.warn(`[DeleteAccount] User ${userId} has active teams, cannot delete`)
			throw new BadRequestException(
				'Невозможно удалить аккаунт. У вас есть команды с участниками или проектами. Пожалуйста, удалите команды или передайте право владения другому участнику.'
			)
		}

		// Cancel all active subscriptions before deleting
		for (const team of ownedTeams) {
			if (team.subscription && team.subscription.status === 'ACTIVE') {
				this.logger.log(`[DeleteAccount] Cancelling subscription for team ${team.id}`)
				await this.prisma.subscription.update({
					where: { id: team.subscription.id },
					data: { status: 'CANCELLED' },
				})
			}
		}

		// Delete avatar file if exists
		if (user.avatarUrl) {
			this.logger.log(`[DeleteAccount] Deleting avatar file: ${user.avatarUrl}`)
			this.deleteAvatarFile(user.avatarUrl)
		}

		// Delete all user sessions first (to prevent any issues)
		await this.prisma.session.deleteMany({
			where: { userId },
		})
		this.logger.log(`[DeleteAccount] Deleted all sessions for user ${userId}`)

		// Delete the user (Prisma cascade will handle related records)
		try {
			const deletedUser = await this.prisma.user.delete({
				where: { id: userId },
			})
			this.logger.log(`[DeleteAccount] Successfully deleted user ${userId}`)
			return deletedUser
		} catch (error: any) {
			this.logger.error(`[DeleteAccount] Failed to delete user ${userId}:`, error)
			throw new BadRequestException(
				`Не удалось удалить аккаунт: ${error.message || 'Неизвестная ошибка'}`
			)
		}
	}

	// ==================== Avatar ====================

	private deleteAvatarFile(avatarUrl: string): void {
		if (!avatarUrl) return

		// Extract filename from URL
		const filename = avatarUrl.split('/').pop()
		const filePath = join(this.uploadPath, filename)

		if (existsSync(filePath)) {
			try {
				unlinkSync(filePath)
			} catch (error) {
				console.error(`Failed to delete avatar file: ${filename}`, error)
			}
		}
	}

	async uploadAvatar(userId: string, filePromise: Promise<FileUpload>) {
		const { createReadStream, filename, mimetype } = await filePromise

		// Validate file type
		const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
		if (!allowedMimes.includes(mimetype)) {
			throw new BadRequestException('Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed')
		}

		// Create uploads directory if it doesn't exist
		if (!existsSync(this.uploadPath)) {
			mkdirSync(this.uploadPath, { recursive: true })
		}

		// Generate unique filename
		const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`
		const ext = filename.split('.').pop()
		const newFilename = `avatar-${uniqueSuffix}.${ext}`
		const filepath = join(this.uploadPath, newFilename)

		// Get current user to delete old avatar
		const user = await this.findById(userId)
		if (user?.avatarUrl) {
			this.deleteAvatarFile(user.avatarUrl)
		}

		// Save file
		await new Promise<void>((resolve, reject) => {
			const stream = createReadStream()
			const writeStream = createWriteStream(filepath)

			stream
				.pipe(writeStream)
				.on('finish', () => resolve())
				.on('error', (err) => reject(err))
		})

		// Generate public URL
		const avatarUrl = `${this.baseUrl}/uploads/avatars/${newFilename}`

		// Update user with new avatar URL
		return this.prisma.user.update({
			where: { id: userId },
			data: { avatarUrl },
		})
	}

	async deleteAvatar(userId: string) {
		const user = await this.findById(userId)

		if (user?.avatarUrl) {
			this.deleteAvatarFile(user.avatarUrl)
		}

		return this.prisma.user.update({
			where: { id: userId },
			data: { avatarUrl: null },
		})
	}

	// ==================== Telegram ====================

	async disconnectTelegram(userId: string) {
		return this.prisma.user.update({
			where: { id: userId },
			data: {
				telegramChatId: null,
				telegramFirstName: null,
				telegramLastName: null,
				telegramUsername: null,
				telegramPhotoUrl: null,
			},
		})
	}

	// ==================== Notifications ====================

	async getNotificationSettings(userId: string) {
		let settings = await this.prisma.notificationSettings.findUnique({
			where: { userId },
		})

		if (!settings) {
			settings = await this.prisma.notificationSettings.create({
				data: { userId },
			})
		}

		return settings
	}

	async updateNotificationSettings(userId: string, input: any) {
		// Ensure settings exist
		await this.getNotificationSettings(userId)

		return this.prisma.notificationSettings.update({
			where: { userId },
			data: { ...input },
		})
	}

	// ==================== Storage Preference ====================

	/**
	 * Get user's storage preference
	 */
	async getStoragePreference(userId: string): Promise<UserStoragePreference> {
		const user = await this.prisma.user.findUnique({
			where: { id: userId },
			select: {
				storagePreference: true,
				storageMigratedFrom: true,
				storageMigratedAt: true,
			},
		})

		// Get admin mode setting
		const adminModeSetting = await this.prisma.systemSettings.findUnique({
			where: { key: 'storage.admin_mode' },
		})

		const adminMode = adminModeSetting?.value || 'local'
		const canChangeProvider = adminMode === 'user_choice'

		// Determine active provider
		let activeProvider: UserStorageProviderType
		if (adminMode !== 'user_choice') {
			// Admin forces a provider
			activeProvider = this.mapToUserProviderType(adminMode)
		} else if (user?.storagePreference) {
			// User has preference and admin allows choice
			activeProvider = user.storagePreference as UserStorageProviderType
		} else {
			// Use default provider
			const defaultProviderSetting = await this.prisma.systemSettings.findUnique({
				where: { key: 'storage.default_provider' },
			})
			activeProvider = this.mapToUserProviderType(defaultProviderSetting?.value || 'local')
		}

		return {
			preferredProvider: user?.storagePreference as UserStorageProviderType | null,
			canChangeProvider,
			activeProvider,
			migratedFrom: user?.storageMigratedFrom as UserStorageProviderType | null,
			migratedAt: user?.storageMigratedAt || null,
		}
	}

	/**
	 * Get available storage provider options
	 */
	async getAvailableStorageProviders(userId: string): Promise<StorageProviderOption[]> {
		const preference = await this.getStoragePreference(userId)

		const providers: StorageProviderOption[] = [
			{
				provider: UserStorageProviderType.LOCAL,
				name: 'Локальное хранилище',
				description: 'Файлы хранятся на сервере приложения',
				available: true,
				current: preference.activeProvider === UserStorageProviderType.LOCAL,
			},
			{
				provider: UserStorageProviderType.CLOUDINARY,
				name: 'Cloudinary',
				description: 'Облачное хранилище с CDN и трансформациями',
				available: preference.canChangeProvider,
				current: preference.activeProvider === UserStorageProviderType.CLOUDINARY,
			},
			{
				provider: UserStorageProviderType.R2,
				name: 'Cloudflare R2',
				description: 'S3-совместимое хранилище с нулевыми комиссиями за трафик',
				available: preference.canChangeProvider,
				current: preference.activeProvider === UserStorageProviderType.R2,
			},
		]

		return providers
	}

	/**
	 * Update user's storage preference
	 */
	async updateStoragePreference(
		userId: string,
		provider: UserStorageProviderType,
	): Promise<UserStoragePreference> {
		this.logger.log(`User ${userId} updating storage preference to: ${provider}`)

		// Check if user can change provider
		const adminModeSetting = await this.prisma.systemSettings.findUnique({
			where: { key: 'storage.admin_mode' },
		})

		const adminMode = adminModeSetting?.value || 'local'

		if (adminMode !== 'user_choice') {
			throw new BadRequestException(
				'Изменение провайдера хранилища запрещено администратором',
			)
		}

		// Validate provider
		const validProviders = ['local', 'cloudinary', 'r2']
		if (!validProviders.includes(provider)) {
			throw new BadRequestException(
				`Неверный провайдер. Допустимые значения: ${validProviders.join(', ')}`,
			)
		}

		// Get current preference to track migration
		const currentUser = await this.prisma.user.findUnique({
			where: { id: userId },
			select: { storagePreference: true },
		})

		const updateData: any = {
			storagePreference: provider,
		}

		// Track migration if changing provider (compare string values since enums are different types)
		if (currentUser?.storagePreference && currentUser.storagePreference !== (provider as any)) {
			updateData.storageMigratedFrom = currentUser.storagePreference
			updateData.storageMigratedAt = new Date()
		}

		// Update user preference
		await this.prisma.user.update({
			where: { id: userId },
			data: updateData,
		})

		this.logger.log(`Storage preference updated for user ${userId}`)

		// Return updated preference
		return this.getStoragePreference(userId)
	}

	/**
	 * Map string provider type to enum
	 */
	private mapToUserProviderType(provider: string): UserStorageProviderType {
		switch (provider.toLowerCase()) {
			case 'cloudinary':
				return UserStorageProviderType.CLOUDINARY
			case 'r2':
				return UserStorageProviderType.R2
			case 'local':
			default:
				return UserStorageProviderType.LOCAL
		}
	}

	// ==================== Email Change ====================

	/**
	 * Request email change with 2FA verification if enabled
	 */
	async requestEmailChange(userId: string, input: RequestChangeEmailInput): Promise<boolean> {
		// Rate limiting
		await this.checkRateLimit('change_email', userId)

		// Get user
		const user = await this.findById(userId)
		if (!user) {
			throw new BadRequestException('Пользователь не найден')
		}

		// Normalize new email
		const newEmailNormalized = input.newEmail.trim().toLowerCase()
		const newEmail = newEmailNormalized

		// Check if new email is the same as current
		if (user.emailNormalized === newEmailNormalized) {
			throw new BadRequestException('Новый email совпадает с текущим')
		}

		// Check if new email is already taken
		const existingUser = await this.findByEmailNormalized(newEmailNormalized)
		if (existingUser && existingUser.id !== userId) {
			throw new BadRequestException('Этот email уже используется другим пользователем')
		}

		// Check if 2FA is enabled
		const twoFactorStatus = await this.twoFactorService.getStatus(userId)
		if (twoFactorStatus.enabled) {
			// Verify 2FA code if provided
			if (!input.twoFactorCode) {
				throw new BadRequestException('Требуется код двухфакторной аутентификации')
			}

			const isValid = await this.twoFactorService.verify2FAToken(userId, input.twoFactorCode)
			if (!isValid) {
				throw new UnauthorizedException('Неверный код двухфакторной аутентификации')
			}
		}

		// Generate verification token
		const token = nanoid(48)
		const expiresAt = new Date(Date.now() + this.emailChangeTokenTtl)

		// Store email change request in Redis (with old email for reference)
		await this.redisService.set(
			`email_change:${token}`,
			JSON.stringify({
				userId,
				oldEmail: user.email,
				newEmail,
				newEmailNormalized,
			}),
			this.emailChangeTokenTtl,
		)

		// Send verification email to new address
		await this.mailService.sendEmailChangeConfirmationEmail(
			newEmail,
			user.fullName,
			token,
			user.email,
		)

		// Increment rate limit
		await this.incrementRateLimit('change_email', userId)

		this.logger.log(`Email change requested for user ${userId}: ${user.email} -> ${newEmail}`)

		return true
	}

	/**
	 * Confirm email change using token from email
	 */
	async confirmEmailChange(token: string): Promise<boolean> {
		// Get email change data from Redis
		const changeDataStr = await this.redisService.get(`email_change:${token}`)
		if (!changeDataStr) {
			throw new BadRequestException('Недействительный или истёкший токен подтверждения')
		}

		const changeData = JSON.parse(changeDataStr)
		const { userId, oldEmail, newEmail, newEmailNormalized } = changeData

		// Verify user still exists
		const user = await this.findById(userId)
		if (!user) {
			throw new BadRequestException('Пользователь не найден')
		}

		// Verify email hasn't changed since request
		if (user.emailNormalized !== oldEmail.toLowerCase()) {
			throw new BadRequestException('Email уже был изменён')
		}

		// Check if new email is still available
		const existingUser = await this.findByEmailNormalized(newEmailNormalized)
		if (existingUser && existingUser.id !== userId) {
			throw new BadRequestException('Этот email уже используется другим пользователем')
		}

		// Update user email
		await this.prisma.user.update({
			where: { id: userId },
			data: {
				email: newEmail,
				emailNormalized: newEmailNormalized,
				emailVerified: true, // New email is verified by clicking the link
			},
		})

		// Delete old verification tokens
		await this.prisma.verificationToken.deleteMany({
			where: { userId },
		})

		// Delete email change token from Redis
		await this.redisService.del(`email_change:${token}`)

		this.logger.log(`Email changed for user ${userId}: ${oldEmail} -> ${newEmail}`)

		return true
	}

	/**
	 * Check rate limit for email change
	 */
	private async checkRateLimit(action: string, identifier: string): Promise<void> {
		const key = `rate_limit:${action}:${identifier}`
		const count = await this.redisService.getRateLimit(key)

		if (count && count >= 3) {
			throw new BadRequestException(
				'Слишком много запросов. Пожалуйста, попробуйте позже.',
			)
		}
	}

	/**
	 * Increment rate limit counter
	 */
	private async incrementRateLimit(action: string, identifier: string): Promise<void> {
		const key = `rate_limit:${action}:${identifier}`
		await this.redisService.incrementRateLimit(key, this.rateLimitWindow)
	}

	/**
	 * Normalize email address (lowercase, trim)
	 */
	private normalizeEmail(email: string): string {
		return email.trim().toLowerCase()
	}
}

