import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { AdminActionLogService } from './admin-action-log.service';
import type { Payment } from '@prisma/generated/client';

export interface AdminPaymentFilters {
  search?: string;
  status?: string;
  createdAfter?: Date;
  createdBefore?: Date;
  minAmount?: number;
  maxAmount?: number;
}

export interface PaginationInput {
  page: number;
  limit: number;
}

export interface AdminPaymentsConnection {
  nodes: any[];
  totalCount: number;
  pageInfo: {
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    currentPage: number;
    totalPages: number;
  };
}

export interface PaymentStats {
  totalPayments: number;
  succeededPayments: number;
  pendingPayments: number;
  failedPayments: number;
  totalRevenue: number;
  averagePayment: number;
  byStatus: {
    PENDING: number;
    SUCCEEDED: number;
    FAILED: number;
    CANCELLED: number;
  };
}

@Injectable()
export class AdminPaymentsService {
  private readonly logger = new Logger(AdminPaymentsService.name);

  constructor(
    private prisma: PrismaService,
    private auditService: AdminActionLogService,
  ) {}

  /**
   * Get paginated list of payments with filters
   */
  async findAll(
    filters: AdminPaymentFilters,
    pagination: PaginationInput,
  ): Promise<AdminPaymentsConnection> {
    this.logger.log(`Fetching payments with filters: ${JSON.stringify(filters)}`);

    const where: any = {};

    // Search filter (team name, user email, yookassa payment ID)
    if (filters.search) {
      where.OR = [
        { yookassaPaymentId: { contains: filters.search, mode: 'insensitive' } },
        {
          subscription: {
            team: {
              OR: [
                { name: { contains: filters.search, mode: 'insensitive' } },
                { owner: { email: { contains: filters.search, mode: 'insensitive' } } },
              ],
            },
          },
        },
      ];
    }

    // Status filter
    if (filters.status) {
      where.status = filters.status;
    }

    // Date filters
    if (filters.createdAfter || filters.createdBefore) {
      where.createdAt = {};
      if (filters.createdAfter) {
        where.createdAt.gte = filters.createdAfter;
      }
      if (filters.createdBefore) {
        where.createdAt.lte = filters.createdBefore;
      }
    }

    // Amount filters
    if (filters.minAmount !== undefined || filters.maxAmount !== undefined) {
      where.amount = {};
      if (filters.minAmount !== undefined) {
        where.amount.gte = filters.minAmount;
      }
      if (filters.maxAmount !== undefined) {
        where.amount.lte = filters.maxAmount;
      }
    }

    // Get total count
    const totalCount = await this.prisma.payment.count({ where });

    // Calculate pagination
    const skip = (pagination.page - 1) * pagination.limit;
    const totalPages = Math.ceil(totalCount / pagination.limit);

    // Get payments
    const nodes = await this.prisma.payment.findMany({
      where,
      skip,
      take: pagination.limit,
      orderBy: { createdAt: 'desc' },
      include: {
        subscription: {
          include: {
            team: {
              include: {
                owner: {
                  select: {
                    id: true,
                    email: true,
                    fullName: true,
                    avatarUrl: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    return {
      nodes,
      totalCount,
      pageInfo: {
        hasNextPage: pagination.page < totalPages,
        hasPreviousPage: pagination.page > 1,
        currentPage: pagination.page,
        totalPages,
      },
    };
  }

  /**
   * Get detailed information about a payment
   */
  async findById(paymentId: string): Promise<any> {
    this.logger.log(`Fetching payment details for ID: ${paymentId}`);

    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        subscription: {
          include: {
            team: {
              include: {
                owner: {
                  select: {
                    id: true,
                    email: true,
                    fullName: true,
                    avatarUrl: true,
                    phone: true,
                  },
                },
                _count: {
                  select: {
                    members: true,
                    projects: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!payment) {
      throw new NotFoundException(`Payment with ID ${paymentId} not found`);
    }

    return payment;
  }

  /**
   * Get payment statistics
   */
  async getStats(): Promise<PaymentStats> {
    this.logger.log('Calculating payment statistics');

    // Get all payments
    const payments = await this.prisma.payment.findMany({
      select: {
        status: true,
        amount: true,
      },
    });

    const totalPayments = payments.length;
    const succeededPayments = payments.filter((p) => p.status === 'SUCCEEDED').length;
    const pendingPayments = payments.filter((p) => p.status === 'PENDING').length;
    const failedPayments = payments.filter((p) => p.status === 'FAILED').length;

    // Calculate total revenue (only succeeded payments)
    const totalRevenue = payments
      .filter((p) => p.status === 'SUCCEEDED')
      .reduce((sum, p) => sum + Number(p.amount), 0);

    const averagePayment = succeededPayments > 0 ? totalRevenue / succeededPayments : 0;

    // Count by status
    const byStatus = {
      PENDING: pendingPayments,
      SUCCEEDED: succeededPayments,
      FAILED: failedPayments,
      CANCELLED: payments.filter((p) => p.status === 'CANCELLED').length,
    };

    return {
      totalPayments,
      succeededPayments,
      pendingPayments,
      failedPayments,
      totalRevenue,
      averagePayment,
      byStatus,
    };
  }

  /**
   * Update payment status
   */
  async updatePaymentStatus(
    paymentId: string,
    status: string,
    adminId: string,
  ): Promise<Payment> {
    this.logger.log(`Updating payment ${paymentId} status to ${status} by admin ${adminId}`);

    // Get current payment state
    const paymentBefore = await this.prisma.payment.findUnique({
      where: { id: paymentId },
    });

    if (!paymentBefore) {
      throw new NotFoundException(`Payment with ID ${paymentId} not found`);
    }

    // Validate status
    const validStatuses = ['PENDING', 'SUCCEEDED', 'FAILED', 'CANCELLED'];
    if (!validStatuses.includes(status)) {
      throw new BadRequestException(
        `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
      );
    }

    // Update payment
    const paymentAfter = await this.prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: status as any,
      },
    });

    // Log action
    await this.auditService.logAction({
      adminUserId: adminId,
      action: 'UPDATE_PAYMENT_STATUS',
      resource: 'Payment',
      resourceId: paymentId,
      details: {
        oldStatus: paymentBefore.status,
        newStatus: status,
        amount: Number(paymentBefore.amount),
      },
    });

    return paymentAfter;
  }

  /**
   * Issue refund for payment
   */
  async refundPayment(
    paymentId: string,
    amount: number,
    reason: string,
    adminId: string,
  ): Promise<Payment> {
    this.logger.log(`Issuing refund for payment ${paymentId} by admin ${adminId}`);

    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
    });

    if (!payment) {
      throw new NotFoundException(`Payment with ID ${paymentId} not found`);
    }

    if (payment.status !== 'SUCCEEDED') {
      throw new BadRequestException('Can only refund succeeded payments');
    }

    if (amount > Number(payment.amount)) {
      throw new BadRequestException('Refund amount cannot exceed payment amount');
    }

    // Update payment status
    const updatedPayment = await this.prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: 'CANCELLED',
      },
    });

    // Log action
    await this.auditService.logAction({
      adminUserId: adminId,
      action: 'REFUND_PAYMENT',
      resource: 'Payment',
      resourceId: paymentId,
      details: {
        originalAmount: Number(payment.amount),
        refundAmount: amount,
        reason,
      },
    });

    return updatedPayment;
  }

  /**
   * Delete payment
   */
  async deletePayment(paymentId: string, adminId: string): Promise<boolean> {
    this.logger.log(`Deleting payment ${paymentId} by admin ${adminId}`);

    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        subscription: {
          include: {
            team: true,
          },
        },
      },
    });

    if (!payment) {
      throw new NotFoundException(`Payment with ID ${paymentId} not found`);
    }

    // Don't allow deletion of succeeded payments
    if (payment.status === 'SUCCEEDED') {
      throw new BadRequestException('Cannot delete succeeded payments. Use refund instead.');
    }

    // Log action before deletion
    await this.auditService.logAction({
      adminUserId: adminId,
      action: 'DELETE_PAYMENT',
      resource: 'Payment',
      resourceId: paymentId,
      details: {
        amount: Number(payment.amount),
        status: payment.status,
        teamName: payment.subscription.team.name,
      },
    });

    // Delete payment
    await this.prisma.payment.delete({
      where: { id: paymentId },
    });

    return true;
  }
}
