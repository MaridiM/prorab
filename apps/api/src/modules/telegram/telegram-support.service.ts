import { Injectable, Logger, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../../core/prisma/prisma.service'
import type {
	SupportTicket,
	SupportMessage,
	SupportTicketStatus,
	SupportTicketPriority,
} from '../../../prisma/generated/client'
import { Prisma } from '../../../prisma/generated/client'

type SupportTicketWithMessages = Prisma.SupportTicketGetPayload<{
	include: { messages: true; user: true }
}>

@Injectable()
export class TelegramSupportService {
	private readonly logger = new Logger(TelegramSupportService.name)

	constructor(private readonly prisma: PrismaService) {}

	// ==================== Ticket Management ====================

	/**
	 * Create new support ticket
	 */
	async createTicket(
		userId: string,
		chatId: string,
		subject?: string,
		category?: string,
		priority: SupportTicketPriority = 'MEDIUM',
	): Promise<SupportTicket> {
		this.logger.log(`Creating support ticket for user ${userId}`)

		const ticket = await this.prisma.supportTicket.create({
			data: {
				userId,
				telegramChatId: chatId,
				subject,
				category,
				priority,
				status: 'OPEN',
			},
			include: {
				user: true,
				messages: true,
			},
		})

		this.logger.log(`Support ticket #${ticket.id} created`)
		return ticket
	}

	/**
	 * Get active ticket for user (status = OPEN or IN_PROGRESS)
	 */
	async getActiveTicket(chatId: string): Promise<SupportTicket | null> {
		return await this.prisma.supportTicket.findFirst({
			where: {
				telegramChatId: chatId,
				status: {
					in: ['OPEN', 'IN_PROGRESS'],
				},
			},
			include: {
				user: true,
				messages: {
					orderBy: {
						createdAt: 'asc',
					},
				},
			},
		})
	}

	/**
	 * Get ticket by ID
	 */
	async getTicketById(ticketId: string): Promise<SupportTicketWithMessages> {
		const ticket = await this.prisma.supportTicket.findUnique({
			where: { id: ticketId },
			include: {
				user: true,
				messages: {
					orderBy: {
						createdAt: 'asc',
					},
				},
			},
		})

		if (!ticket) {
			throw new NotFoundException(`Ticket #${ticketId} not found`)
		}

		return ticket
	}

	/**
	 * Update ticket status
	 */
	async updateTicketStatus(
		ticketId: string,
		status: SupportTicketStatus,
	): Promise<SupportTicket> {
		this.logger.log(`Updating ticket #${ticketId} status to ${status}`)

		const data: {
			status: SupportTicketStatus
			closedAt?: Date
		} = {
			status,
		}

		// Set closedAt when ticket is resolved/closed
		if (status === 'RESOLVED' || status === 'CLOSED') {
			data.closedAt = new Date()
		}

		return await this.prisma.supportTicket.update({
			where: { id: ticketId },
			data,
			include: {
				user: true,
				messages: true,
			},
		})
	}

	/**
	 * Close ticket
	 */
	async closeTicket(ticketId: string): Promise<void> {
		await this.updateTicketStatus(ticketId, 'CLOSED')
		this.logger.log(`Ticket #${ticketId} closed`)
	}

	/**
	 * Update ticket priority
	 */
	async updateTicketPriority(
		ticketId: string,
		priority: SupportTicketPriority,
	): Promise<SupportTicket> {
		this.logger.log(`Updating ticket #${ticketId} priority to ${priority}`)

		return await this.prisma.supportTicket.update({
			where: { id: ticketId },
			data: { priority },
			include: {
				user: true,
				messages: true,
			},
		})
	}

	// ==================== Message Management ====================

	/**
	 * Add message to ticket
	 */
	async addMessage(
		ticketId: string,
		message: string,
		fromUser: boolean,
	): Promise<SupportMessage> {
		this.logger.log(
			`Adding message to ticket #${ticketId} (fromUser: ${fromUser})`,
		)

		return await this.prisma.supportMessage.create({
			data: {
				ticketId,
				message,
				fromUser,
			},
		})
	}

	/**
	 * Get all messages for ticket
	 */
	async getTicketMessages(ticketId: string): Promise<SupportMessage[]> {
		return await this.prisma.supportMessage.findMany({
			where: { ticketId },
			orderBy: {
				createdAt: 'asc',
			},
		})
	}

	// ==================== Statistics & Queries ====================

	/**
	 * Get all tickets for user
	 */
	async getUserTickets(
		userId: string,
		includeMessages = false,
	): Promise<SupportTicket[]> {
		return await this.prisma.supportTicket.findMany({
			where: { userId },
			include: {
				user: true,
				messages: includeMessages
					? {
							orderBy: {
								createdAt: 'asc',
							},
						}
					: false,
			},
			orderBy: {
				createdAt: 'desc',
			},
		})
	}

	/**
	 * Get ticket statistics
	 */
	async getTicketStats(ticketId: string): Promise<{
		messageCount: number
		userMessageCount: number
		supportMessageCount: number
		responseTime: number | null // Average response time in minutes
		firstResponseTime: number | null // First response time in minutes
	}> {
		const ticket = await this.getTicketById(ticketId)
		const messages = ticket.messages || []

		const userMessages = messages.filter((m: any) => m.fromUser)
		const supportMessages = messages.filter((m: any) => !m.fromUser)

		// Calculate average response time
		let totalResponseTime = 0
		let responseCount = 0
		let firstResponseTime: number | null = null

		for (let i = 0; i < messages.length - 1; i++) {
			const current = messages[i]
			const next = messages[i + 1]

			// User message followed by support message = response
			if (current.fromUser && !next.fromUser) {
				const responseTime =
					next.createdAt.getTime() - current.createdAt.getTime()
				totalResponseTime += responseTime
				responseCount++

				// First response
				if (firstResponseTime === null) {
					firstResponseTime = Math.round(responseTime / 1000 / 60) // minutes
				}
			}
		}

		const averageResponseTime =
			responseCount > 0
				? Math.round(totalResponseTime / responseCount / 1000 / 60)
				: null

		return {
			messageCount: messages.length,
			userMessageCount: userMessages.length,
			supportMessageCount: supportMessages.length,
			responseTime: averageResponseTime,
			firstResponseTime,
		}
	}

	/**
	 * Get support team statistics
	 */
	async getSupportStats(): Promise<{
		totalTickets: number
		openTickets: number
		inProgressTickets: number
		resolvedTickets: number
		closedTickets: number
		averageResponseTime: number | null
	}> {
		const [
			totalTickets,
			openTickets,
			inProgressTickets,
			resolvedTickets,
			closedTickets,
		] = await Promise.all([
			this.prisma.supportTicket.count(),
			this.prisma.supportTicket.count({ where: { status: 'OPEN' } }),
			this.prisma.supportTicket.count({ where: { status: 'IN_PROGRESS' } }),
			this.prisma.supportTicket.count({ where: { status: 'RESOLVED' } }),
			this.prisma.supportTicket.count({ where: { status: 'CLOSED' } }),
		])

		// Calculate average response time for all tickets
		const tickets = await this.prisma.supportTicket.findMany({
			include: {
				messages: {
					orderBy: {
						createdAt: 'asc',
					},
				},
			},
		})

		let totalResponseTime = 0
		let responseCount = 0

		for (const ticket of tickets) {
			const stats = await this.getTicketStats(ticket.id)
			if (stats.firstResponseTime !== null) {
				totalResponseTime += stats.firstResponseTime
				responseCount++
			}
		}

		const averageResponseTime =
			responseCount > 0 ? Math.round(totalResponseTime / responseCount) : null

		return {
			totalTickets,
			openTickets,
			inProgressTickets,
			resolvedTickets,
			closedTickets,
			averageResponseTime,
		}
	}
}
