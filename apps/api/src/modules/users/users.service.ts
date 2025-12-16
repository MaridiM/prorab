import { Injectable, BadRequestException, UnauthorizedException, Logger } from '@nestjs/common'
import { FileUpload } from 'graphql-upload-minimal'
import { createWriteStream, existsSync, mkdirSync, unlinkSync } from 'fs'
import { join } from 'path'
import * as argon2 from 'argon2'

import { PrismaService } from '../../core/prisma/prisma.service'
import { UpdateProfileInput } from './dto/update-profile.input'
import { UserStoragePreference, StorageProviderOption, UserStorageProviderType } from './models/user-storage.model'
import { StorageProviderType } from '../../core/storage/interfaces/storage-provider.interface'

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

	constructor(private readonly prisma: PrismaService) {}

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
		// Verify password first
		const user = await this.findById(userId)
		if (!user) {
			throw new BadRequestException('Пользователь не найден')
		}

		const isValidPassword = await this.verifyPassword(user.passwordHash, password)
		if (!isValidPassword) {
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

		// Check if user owns any teams with other members or active projects
		const hasActiveTeams = ownedTeams.some(
			team => team.members.length > 1 || team.projects.length > 0
		)

		if (hasActiveTeams) {
			throw new BadRequestException(
				'Невозможно удалить аккаунт. У вас есть команды с участниками или проектами. Пожалуйста, удалите команды или передайте право владения другому участнику.'
			)
		}

		// Cancel all active subscriptions before deleting
		for (const team of ownedTeams) {
			if (team.subscription && team.subscription.status === 'ACTIVE') {
				await this.prisma.subscription.update({
					where: { id: team.subscription.id },
					data: { status: 'CANCELLED' },
				})
			}
		}

		// Delete avatar file if exists
		if (user.avatarUrl) {
			this.deleteAvatarFile(user.avatarUrl)
		}

		// Delete the user (Prisma cascade will handle related records)
		return this.prisma.user.delete({
			where: { id: userId },
		})
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
}

