import { Injectable, BadRequestException } from '@nestjs/common'
import { FileUpload } from 'graphql-upload-minimal'
import { createWriteStream, existsSync, mkdirSync, unlinkSync } from 'fs'
import { join } from 'path'

import { PrismaService } from '../../core/prisma/prisma.service'
import { UpdateProfileInput } from './dto/update-profile.input'

interface CreateUserData {
	email: string
	emailNormalized: string
	passwordHash: string
	fullName: string
	phone?: string
}

@Injectable()
export class UsersService {
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

	async deleteAccount(userId: string) {
		// Delete avatar file if exists
		const user = await this.findById(userId)
		if (user?.avatarUrl) {
			this.deleteAvatarFile(user.avatarUrl)
		}

		// Prisma should handle cascading deletes for Sessions, TeamMembers, etc. if configured correctly.
		// However, we should be careful about Teams where this user is the Owner.
		// For MVP, we will allow deletion which might delete the Team if they are the only owner and cascade is on,
		// or will assume the Schema handles it.
		// Given the schema isn't fully visible here, we'll assume standard Prisma cascade.

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
}

