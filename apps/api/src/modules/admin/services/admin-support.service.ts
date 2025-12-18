import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { AdminActionLogService } from './admin-action-log.service';
import { AdminSupportTicketFilterInput, AdminUpdateSupportTicketInput, AdminSendMessageInput } from '../dto/admin-support-ticket-filter.input';
import { PaginationInput } from '../dto/pagination.input';
import { SupportTicketStatus, SupportTicketPriority } from '../models/admin-support-ticket.model';

@Injectable()
export class AdminSupportService {
  private readonly logger = new Logger(AdminSupportService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly actionLogService: AdminActionLogService,
  ) {}

  /**
   * Get all support tickets with filters and pagination
   */
  async findAll(
    filter: AdminSupportTicketFilterInput,
    pagination: PaginationInput,
  ): Promise<{
    tickets: any[];
    total: number;
    hasMore: boolean;
  }> {
    const { page = 1, limit = 50 } = pagination;
    const skip = (page - 1) * limit;

    const where: any = {};

    // Search filter (search in subject or user email)
    if (filter.search) {
      where.OR = [
        { subject: { contains: filter.search, mode: 'insensitive' } },
        { user: { email: { contains: filter.search, mode: 'insensitive' } } },
      ];
    }

    // Status filter
    if (filter.status) {
      where.status = filter.status;
    }

    // Priority filter
    if (filter.priority) {
      where.priority = filter.priority;
    }

    // Category filter
    if (filter.category) {
      where.category = filter.category;
    }

    // User ID filter
    if (filter.userId) {
      where.userId = filter.userId;
    }

    // Date range filter
    if (filter.startDate || filter.endDate) {
      where.createdAt = {};
      if (filter.startDate) {
        where.createdAt.gte = filter.startDate;
      }
      if (filter.endDate) {
        where.createdAt.lte = filter.endDate;
      }
    }

    const [tickets, total] = await Promise.all([
      this.prisma.supportTicket.findMany({
        where,
        skip,
        take: limit,
        orderBy: [
          { priority: 'desc' },
          { createdAt: 'desc' },
        ],
        include: {
          user: {
            select: {
              email: true,
              fullName: true,
            },
          },
          messages: {
            orderBy: { createdAt: 'desc' },
            take: 10,
          },
          _count: {
            select: {
              messages: true,
            },
          },
        },
      }),
      this.prisma.supportTicket.count({ where }),
    ]);

    // Map to include user data
    const ticketsWithUserData = tickets.map((ticket) => ({
      ...ticket,
      userEmail: ticket.user?.email || 'Unknown',
      userFullName: ticket.user?.fullName || 'Unknown',
      messageCount: ticket._count.messages,
    }));

    return {
      tickets: ticketsWithUserData,
      total,
      hasMore: skip + tickets.length < total,
    };
  }

  /**
   * Get support ticket by ID
   */
  async findById(ticketId: string): Promise<any> {
    const ticket = await this.prisma.supportTicket.findUnique({
      where: { id: ticketId },
      include: {
        user: {
          select: {
            email: true,
            fullName: true,
          },
        },
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!ticket) {
      throw new NotFoundException(`Support ticket with ID ${ticketId} not found`);
    }

    return {
      ...ticket,
      userEmail: ticket.user?.email || 'Unknown',
      userFullName: ticket.user?.fullName || 'Unknown',
    };
  }

  /**
   * Update support ticket
   */
  async updateTicket(
    ticketId: string,
    input: AdminUpdateSupportTicketInput,
    adminUserId: string,
  ): Promise<any> {
    const ticket = await this.prisma.supportTicket.findUnique({
      where: { id: ticketId },
    });

    if (!ticket) {
      throw new NotFoundException(`Support ticket with ID ${ticketId} not found`);
    }

    const updateData: any = {};

    if (input.status !== undefined) {
      updateData.status = input.status;

      // If status is CLOSED or RESOLVED, set closedAt
      if (input.status === SupportTicketStatus.CLOSED || input.status === SupportTicketStatus.RESOLVED) {
        updateData.closedAt = new Date();
      }
    }

    if (input.priority !== undefined) {
      updateData.priority = input.priority;
    }

    if (input.category !== undefined) {
      updateData.category = input.category;
    }

    const updatedTicket = await this.prisma.supportTicket.update({
      where: { id: ticketId },
      data: updateData,
      include: {
        user: {
          select: {
            email: true,
            fullName: true,
          },
        },
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    // Log the action
    await this.actionLogService.logAction({
      adminUserId,
      action: 'UPDATE',
      resource: 'SupportTicket',
      resourceId: ticketId,
      details: {
        changes: updateData,
        oldStatus: ticket.status,
        newStatus: input.status,
      },
    });

    return {
      ...updatedTicket,
      userEmail: updatedTicket.user?.email || 'Unknown',
      userFullName: updatedTicket.user?.fullName || 'Unknown',
    };
  }

  /**
   * Send message in ticket (from support)
   */
  async sendMessage(
    input: AdminSendMessageInput,
    adminUserId: string,
  ): Promise<any> {
    const ticket = await this.prisma.supportTicket.findUnique({
      where: { id: input.ticketId },
    });

    if (!ticket) {
      throw new NotFoundException(`Support ticket with ID ${input.ticketId} not found`);
    }

    const message = await this.prisma.supportMessage.create({
      data: {
        ticketId: input.ticketId,
        message: input.message,
        fromUser: input.fromUser,
      },
    });

    // Update ticket status to IN_PROGRESS if it was OPEN
    if (ticket.status === SupportTicketStatus.OPEN) {
      await this.prisma.supportTicket.update({
        where: { id: input.ticketId },
        data: { status: SupportTicketStatus.IN_PROGRESS },
      });
    }

    // Log the action
    await this.actionLogService.logAction({
      adminUserId,
      action: 'REPLY',
      resource: 'SupportTicket',
      resourceId: input.ticketId,
      details: {
        messageLength: input.message.length,
        fromUser: input.fromUser,
      },
    });

    return message;
  }

  /**
   * Delete support ticket
   */
  async deleteTicket(ticketId: string, adminUserId: string): Promise<{
    success: boolean;
    message: string;
  }> {
    const ticket = await this.prisma.supportTicket.findUnique({
      where: { id: ticketId },
      include: {
        _count: {
          select: {
            messages: true,
          },
        },
      },
    });

    if (!ticket) {
      throw new NotFoundException(`Support ticket with ID ${ticketId} not found`);
    }

    // Delete ticket (messages will be cascade deleted)
    await this.prisma.supportTicket.delete({
      where: { id: ticketId },
    });

    // Log the action
    await this.actionLogService.logAction({
      adminUserId,
      action: 'DELETE',
      resource: 'SupportTicket',
      resourceId: ticketId,
      details: {
        subject: ticket.subject,
        status: ticket.status,
        messagesCount: ticket._count.messages,
      },
    });

    return {
      success: true,
      message: `Support ticket "${ticket.subject || ticketId}" deleted successfully`,
    };
  }

  /**
   * Get support statistics
   */
  async getStatistics(): Promise<{
    totalTickets: number;
    openTickets: number;
    inProgressTickets: number;
    resolvedTickets: number;
    closedTickets: number;
    ticketsByPriority: Record<string, number>;
    ticketsByCategory: Record<string, number>;
  }> {
    const [
      totalTickets,
      openTickets,
      inProgressTickets,
      resolvedTickets,
      closedTickets,
      allTickets,
    ] = await Promise.all([
      this.prisma.supportTicket.count(),
      this.prisma.supportTicket.count({ where: { status: SupportTicketStatus.OPEN } }),
      this.prisma.supportTicket.count({ where: { status: SupportTicketStatus.IN_PROGRESS } }),
      this.prisma.supportTicket.count({ where: { status: SupportTicketStatus.RESOLVED } }),
      this.prisma.supportTicket.count({ where: { status: SupportTicketStatus.CLOSED } }),
      this.prisma.supportTicket.findMany({
        select: {
          priority: true,
          category: true,
        },
      }),
    ]);

    const ticketsByPriority: Record<string, number> = {
      LOW: 0,
      MEDIUM: 0,
      HIGH: 0,
      URGENT: 0,
    };

    const ticketsByCategory: Record<string, number> = {};

    allTickets.forEach((ticket) => {
      ticketsByPriority[ticket.priority] = (ticketsByPriority[ticket.priority] || 0) + 1;

      if (ticket.category) {
        ticketsByCategory[ticket.category] = (ticketsByCategory[ticket.category] || 0) + 1;
      }
    });

    return {
      totalTickets,
      openTickets,
      inProgressTickets,
      resolvedTickets,
      closedTickets,
      ticketsByPriority,
      ticketsByCategory,
    };
  }

  /**
   * Assign priority automatically based on keywords
   */
  private detectPriority(subject?: string, message?: string): SupportTicketPriority {
    const text = `${subject || ''} ${message || ''}`.toLowerCase();

    const urgentKeywords = ['urgent', 'critical', 'emergency', 'down', 'срочно', 'критично'];
    const highKeywords = ['important', 'asap', 'problem', 'issue', 'важно', 'проблема'];

    if (urgentKeywords.some(keyword => text.includes(keyword))) {
      return SupportTicketPriority.URGENT;
    }

    if (highKeywords.some(keyword => text.includes(keyword))) {
      return SupportTicketPriority.HIGH;
    }

    return SupportTicketPriority.MEDIUM;
  }
}
