import { Injectable } from '@nestjs/common'

import { PrismaService } from '../../core/prisma/prisma.service'

interface CreateUserData {
	email: string
	emailNormalized: string
	passwordHash: string
	name?: string
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
				name: data.name,
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
}

