import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common'
import { PrismaService } from '../../../core/prisma/prisma.service'
import { AdminActionLogService } from './admin-action-log.service'
import type { User } from '@prisma/generated/client'

export interface AdminUserFilters {
	search?: string
	emailVerified?: boolean
	role?: string
	createdAfter?: Date
	createdBefore?: Date
	lastLoginAfter?: Date
	lastLoginBefore?: Date
}

export interface PaginationInput {
	page: number
	limit: number
}

export interface AdminUsersConnection {
	nodes: User[]
	totalCount: number
	pageInfo: {
		hasNextPage: boolean
		hasPreviousPage: boolean
		currentPage: number
		totalPages: number
	}
}

export interface AdminUserDetails {
	user: User
	ownedTeams: any[]
	teamMemberships: any[]
	_count: {
		ownedTeams: number
		teamMemberships: number
		payments: number
	}
}

export interface UserActivity {
	id: string
	action: string
	resource: string
	resourceId: string
	createdAt: Date
	ipAddress: string | null
}

export interface UserSession {
	id: string
	userId: string
	token: string
	expiresAt: Date
	createdAt: Date
	ipAddress: string | null
	userAgent: string | null
}

@Injectable()
export class AdminUsersService {
	private readonly logger = new Logger(AdminUsersService.name)

	constructor(
		private prisma: PrismaService,
		private auditService: AdminActionLogService,
	) {}

	/**
	 * Get paginated list of users with filters
	 */
	async findAll(
		filters: AdminUserFilters,
		pagination: PaginationInput,
	): Promise<AdminUsersConnection> {
		this.logger.log(`Fetching users with filters: ${JSON.stringify(filters)}`)

		const where: any = {}

		// Search filter (email, fullName, phone)
		if (filters.search) {
			where.OR = [
				{ email: { contains: filters.search, mode: 'insensitive' } },
				{ fullName: { contains: filters.search, mode: 'insensitive' } },
				{ phone: { contains: filters.search, mode: 'insensitive' } },
			]
		}

		// Email verified filter
		if (filters.emailVerified !== undefined) {
			where.emailVerified = filters.emailVerified
		}

		// Role filter
		if (filters.role) {
			if (filters.role === 'USER') {
				// Filter for users without admin role
				where.adminRole = null
			} else {
				// Filter for users with specific admin role
				where.adminRole = {
					role: filters.role,
				}
			}
		}

		// Date filters
		if (filters.createdAfter || filters.createdBefore) {
			where.createdAt = {}
			if (filters.createdAfter) {
				where.createdAt.gte = filters.createdAfter
			}
			if (filters.createdBefore) {
				where.createdAt.lte = filters.createdBefore
			}
		}

		if (filters.lastLoginAfter || filters.lastLoginBefore) {
			where.lastLoginAt = {}
			if (filters.lastLoginAfter) {
				where.lastLoginAt.gte = filters.lastLoginAfter
			}
			if (filters.lastLoginBefore) {
				where.lastLoginAt.lte = filters.lastLoginBefore
			}
		}

		// Get total count
		const totalCount = await this.prisma.user.count({ where })

		// Calculate pagination
		const skip = (pagination.page - 1) * pagination.limit
		const totalPages = Math.ceil(totalCount / pagination.limit)

		// Get users
		const nodes = await this.prisma.user.findMany({
			where,
			skip,
			take: pagination.limit,
			orderBy: { createdAt: 'desc' },
			include: {
				adminRole: true,
				_count: {
					select: {
						ownedTeams: true,
						teamMemberships: true,
					},
				},
			},
		})

		return {
			nodes,
			totalCount,
			pageInfo: {
				hasNextPage: pagination.page < totalPages,
				hasPreviousPage: pagination.page > 1,
				currentPage: pagination.page,
				totalPages,
			},
		}
	}

	/**
	 * Get detailed information about a user
	 */
	async findById(userId: string): Promise<AdminUserDetails> {
		this.logger.log(`Fetching user details for ID: ${userId}`)

		const user = await this.prisma.user.findUnique({
			where: { id: userId },
			include: {
				adminRole: true,
				ownedTeams: {
					include: {
						subscription: true,
						_count: {
							select: {
								members: true,
								projects: true,
							},
						},
					},
				},
				teamMemberships: {
					include: {
						team: {
							include: {
								subscription: true,
							},
						},
					},
				},
				_count: {
					select: {
						ownedTeams: true,
						teamMemberships: true,
						// payments: true, // TODO: Add when Payment relation exists
					},
				},
			},
		})

		if (!user) {
			throw new NotFoundException(`User with ID ${userId} not found`)
		}

		return {
			user,
			ownedTeams: user.ownedTeams || [],
			teamMemberships: user.teamMemberships || [],
			_count: { ...user._count, payments: 0 },
		}
	}

	/**
	 * Get user activity logs
	 */
	async getUserActivity(userId: string, limit = 50): Promise<UserActivity[]> {
		this.logger.log(`Fetching activity for user ID: ${userId}`)

		// Check if user exists
		const user = await this.prisma.user.findUnique({
			where: { id: userId },
		})

		if (!user) {
			throw new NotFoundException(`User with ID ${userId} not found`)
		}

		// Get admin action logs where this user was the target or actor
		const logs = await this.prisma.adminActionLog.findMany({
			where: {
				OR: [
					{ resource: 'User', resourceId: userId },
					{ adminUserId: userId }, // Actions performed BY this user if admin
				],
			},
			take: limit,
			orderBy: { createdAt: 'desc' },
		})

		return logs.map((log) => ({
			id: log.id,
			action: log.action,
			resource: log.resource,
			resourceId: log.resourceId || '',
			createdAt: log.createdAt,
			ipAddress: log.ipAddress,
		}))
	}

	/**
	 * Get user sessions (placeholder - not implemented yet)
	 */
	async getUserSessions(userId: string): Promise<UserSession[]> {
		this.logger.log(`Fetching sessions for user ID: ${userId}`)

		// Check if user exists
		const user = await this.prisma.user.findUnique({
			where: { id: userId },
		})

		if (!user) {
			throw new NotFoundException(`User with ID ${userId} not found`)
		}

		// TODO: Implement session tracking if needed
		return []
	}

	/**
	 * Update user information
	 */
	async updateUser(
		userId: string,
		data: {
			email?: string
			fullName?: string
			phone?: string
			avatarUrl?: string
			emailVerified?: boolean
		},
		adminId: string,
	): Promise<User> {
		this.logger.log(`Updating user ${userId} by admin ${adminId}`)

		// Get current user state for audit
		const userBefore = await this.prisma.user.findUnique({
			where: { id: userId },
		})

		if (!userBefore) {
			throw new NotFoundException(`User with ID ${userId} not found`)
		}

		// Validate email uniqueness if changing
		if (data.email && data.email !== userBefore.email) {
			const existingUser = await this.prisma.user.findUnique({
				where: { email: data.email },
			})

			if (existingUser) {
				throw new BadRequestException('Email already in use')
			}
		}

		// Update user
		const userAfter = await this.prisma.user.update({
			where: { id: userId },
			data,
			include: {
				adminRole: true,
			},
		})

		// Log action
		await this.auditService.logAction({
			adminUserId: adminId,
			action: 'UPDATE_USER',
			resource: 'User',
			resourceId: userId,
			details: {
				before: userBefore,
				after: userAfter,
			},
		})

		return userAfter
	}

	/**
	 * Reset user password (send reset link)
	 */
	async resetUserPassword(userId: string, adminId: string): Promise<boolean> {
		this.logger.log(`Resetting password for user ${userId} by admin ${adminId}`)

		const user = await this.prisma.user.findUnique({
			where: { id: userId },
		})

		if (!user) {
			throw new NotFoundException(`User with ID ${userId} not found`)
		}

		// TODO: Integrate with email service to send password reset link

		// Log action
		await this.auditService.logAction({
			adminUserId: adminId,
			action: 'RESET_USER_PASSWORD',
			resource: 'User',
			resourceId: userId,
		})

		this.logger.log(`Password reset email would be sent to ${user.email}`)

		return true
	}

	/**
	 * Manually verify user email
	 */
	async verifyUserEmail(userId: string, adminId: string): Promise<User> {
		this.logger.log(`Verifying email for user ${userId} by admin ${adminId}`)

		const user = await this.prisma.user.findUnique({
			where: { id: userId },
		})

		if (!user) {
			throw new NotFoundException(`User with ID ${userId} not found`)
		}

		if (user.emailVerified) {
			throw new BadRequestException('Email is already verified')
		}

		// Verify email
		const updatedUser = await this.prisma.user.update({
			where: { id: userId },
			data: {
				emailVerified: true,
			},
		})

		// Log action
		await this.auditService.logAction({
			adminUserId: adminId,
			action: 'VERIFY_USER_EMAIL',
			resource: 'User',
			resourceId: userId,
		})

		return updatedUser
	}

	/**
	 * Delete user (soft delete or hard delete based on requirements)
	 */
	async deleteUser(userId: string, adminId: string): Promise<boolean> {
		this.logger.log(`Deleting user ${userId} by admin ${adminId}`)

		const user = await this.prisma.user.findUnique({
			where: { id: userId },
			include: {
				ownedTeams: true,
			},
		})

		if (!user) {
			throw new NotFoundException(`User with ID ${userId} not found`)
		}

		// Check if user owns teams
		if (user.ownedTeams.length > 0) {
			throw new BadRequestException(
				'Cannot delete user who owns teams. Transfer ownership first.',
			)
		}

		// Delete user (CASCADE will handle related records)
		await this.prisma.user.delete({
			where: { id: userId },
		})

		// Log action
		await this.auditService.logAction({
			adminUserId: adminId,
			action: 'DELETE_USER',
			resource: 'User',
			resourceId: userId,
		})

		return true
	}
}
