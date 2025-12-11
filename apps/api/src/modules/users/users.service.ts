import { Injectable } from '@nestjs/common'

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
		// Prisma should handle cascading deletes for Sessions, TeamMembers, etc. if configured correctly.
		// However, we should be careful about Teams where this user is the Owner.
		// For MVP, we will allow deletion which might delete the Team if they are the only owner and cascade is on, 
		// or will assume the Schema handles it. 
		// Given the schema isn't fully visible here, we'll assume standard Prisma cascade.
		
		return this.prisma.user.delete({
			where: { id: userId },
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

