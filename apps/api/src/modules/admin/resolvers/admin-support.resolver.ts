import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '../../../shared/guards/auth.guard';
import { AdminGuard } from '../../../shared/guards/admin.guard';
import { PermissionsGuard } from '../../../shared/guards/permissions.guard';
import { RequirePermissions } from '../../../shared/decorators/require-permissions.decorator';
import { AdminPermissions } from '../../../shared/constants/admin-permissions';
import { AdminSupportService } from '../services/admin-support.service';
import { CurrentUser } from '../../../shared/decorators/current-user.decorator';
import { User } from '../../users/models/user.model';
import { PaginationInput } from '../dto/pagination.input';
import {
  AdminSupportTicket,
  AdminSupportTicketsResult,
  AdminSupportStatistics,
  SupportMessage,
} from '../models/admin-support-ticket.model';
import {
  AdminSupportTicketFilterInput,
  AdminUpdateSupportTicketInput,
  AdminSendMessageInput,
} from '../dto/admin-support-ticket-filter.input';
import { DeleteResult } from '../models/shared/delete-result.model';

@Resolver()
export class AdminSupportResolver {
  constructor(private readonly adminSupportService: AdminSupportService) {}

  @Query(() => AdminSupportTicketsResult, {
    description: 'Get all support tickets with filters (admin only)',
  })
  @UseGuards(AuthGuard, AdminGuard, PermissionsGuard)
  @RequirePermissions(AdminPermissions.SUPPORT_TICKETS_VIEW)
  async adminSupportTickets(
    @Args('filter', { type: () => AdminSupportTicketFilterInput, nullable: true })
    filter?: AdminSupportTicketFilterInput,
    @Args('pagination', { type: () => PaginationInput, nullable: true })
    pagination?: PaginationInput,
  ): Promise<AdminSupportTicketsResult> {
    return this.adminSupportService.findAll(
      filter || {},
      pagination || { page: 1, limit: 50 }
    );
  }

  @Query(() => AdminSupportTicket, {
    description: 'Get support ticket by ID (admin only)',
  })
  @UseGuards(AuthGuard, AdminGuard, PermissionsGuard)
  @RequirePermissions(AdminPermissions.SUPPORT_TICKETS_VIEW)
  async adminSupportTicket(
    @Args('ticketId', { type: () => ID }) ticketId: string,
  ): Promise<AdminSupportTicket> {
    return this.adminSupportService.findById(ticketId);
  }

  @Query(() => AdminSupportStatistics, {
    description: 'Get support tickets statistics (admin only)',
  })
  @UseGuards(AuthGuard, AdminGuard, PermissionsGuard)
  @RequirePermissions(AdminPermissions.SUPPORT_TICKETS_VIEW)
  async adminSupportStatistics(): Promise<AdminSupportStatistics> {
    return this.adminSupportService.getStatistics();
  }

  @Mutation(() => AdminSupportTicket, {
    description: 'Update support ticket (admin only)',
  })
  @UseGuards(AuthGuard, AdminGuard, PermissionsGuard)
  @RequirePermissions(AdminPermissions.SUPPORT_TICKETS_MANAGE)
  async adminUpdateSupportTicket(
    @CurrentUser() currentUser: User,
    @Args('ticketId', { type: () => ID }) ticketId: string,
    @Args('input', { type: () => AdminUpdateSupportTicketInput }) input: AdminUpdateSupportTicketInput,
  ): Promise<AdminSupportTicket> {
    return this.adminSupportService.updateTicket(ticketId, input, currentUser.id);
  }

  @Mutation(() => SupportMessage, {
    description: 'Send message in support ticket (admin only)',
  })
  @UseGuards(AuthGuard, AdminGuard, PermissionsGuard)
  @RequirePermissions(AdminPermissions.SUPPORT_TICKETS_REPLY)
  async adminSendSupportMessage(
    @CurrentUser() currentUser: User,
    @Args('input', { type: () => AdminSendMessageInput }) input: AdminSendMessageInput,
  ): Promise<SupportMessage> {
    return this.adminSupportService.sendMessage(input, currentUser.id);
  }

  @Mutation(() => DeleteResult, {
    description: 'Delete support ticket (admin only)',
  })
  @UseGuards(AuthGuard, AdminGuard, PermissionsGuard)
  @RequirePermissions(AdminPermissions.SUPPORT_TICKETS_DELETE)
  async adminDeleteSupportTicket(
    @CurrentUser() currentUser: User,
    @Args('ticketId', { type: () => ID }) ticketId: string,
  ): Promise<DeleteResult> {
    return this.adminSupportService.deleteTicket(ticketId, currentUser.id);
  }
}
