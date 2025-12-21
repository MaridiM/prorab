import { Resolver, Query, Mutation, Args } from '@nestjs/graphql'
import { UseGuards } from '@nestjs/common'
import { AuthGuard } from '../../../shared/guards/auth.guard'
import { AdminGuard } from '../../../shared/guards/admin.guard'
import { PermissionsGuard } from '../../../shared/guards/permissions.guard'
import { RequirePermissions } from '../../../shared/decorators/permissions.decorator'
import { CurrentUser } from '../../../shared/decorators/current-user.decorator'
import { AdminPermissions } from '../models/admin.model'
import { AdminCommunicationsService } from '../services/admin-communications.service'
import {
  TeamAnnouncement,
  AnnouncementStatistics,
  CreateAnnouncementInput,
  UpdateAnnouncementInput,
  AnnouncementFilterInput,
} from '../models/admin-communications.model'

@Resolver()
@UseGuards(AuthGuard, AdminGuard, PermissionsGuard)
export class AdminCommunicationsResolver {
  constructor(private readonly communicationsService: AdminCommunicationsService) {}

  // ==================== QUERIES ====================

  @Query(() => [TeamAnnouncement], { name: 'adminGetAnnouncements' })
  @RequirePermissions(AdminPermissions.TEAMS_VIEW)
  async getAnnouncements(
    @Args('filter', { type: () => AnnouncementFilterInput, nullable: true })
    filter?: AnnouncementFilterInput,
  ): Promise<TeamAnnouncement[]> {
    return this.communicationsService.getAnnouncements(filter)
  }

  @Query(() => TeamAnnouncement, { name: 'adminGetAnnouncementById' })
  @RequirePermissions(AdminPermissions.TEAMS_VIEW)
  async getAnnouncementById(
    @Args('id', { type: () => String }) id: string,
  ): Promise<TeamAnnouncement> {
    return this.communicationsService.getAnnouncementById(id)
  }

  @Query(() => AnnouncementStatistics, { name: 'adminGetAnnouncementStatistics' })
  @RequirePermissions(AdminPermissions.TEAMS_VIEW)
  async getAnnouncementStatistics(
    @Args('teamId', { type: () => String, nullable: true }) teamId?: string,
  ): Promise<AnnouncementStatistics> {
    return this.communicationsService.getAnnouncementStatistics(teamId)
  }

  // ==================== MUTATIONS ====================

  @Mutation(() => TeamAnnouncement, { name: 'adminCreateAnnouncement' })
  @RequirePermissions(AdminPermissions.TEAMS_MANAGE)
  async createAnnouncement(
    @Args('input') input: CreateAnnouncementInput,
    @CurrentUser('id') userId: string,
  ): Promise<TeamAnnouncement> {
    return this.communicationsService.createAnnouncement(input, userId)
  }

  @Mutation(() => TeamAnnouncement, { name: 'adminUpdateAnnouncement' })
  @RequirePermissions(AdminPermissions.TEAMS_MANAGE)
  async updateAnnouncement(
    @Args('input') input: UpdateAnnouncementInput,
  ): Promise<TeamAnnouncement> {
    return this.communicationsService.updateAnnouncement(input)
  }

  @Mutation(() => Boolean, { name: 'adminDeleteAnnouncement' })
  @RequirePermissions(AdminPermissions.TEAMS_MANAGE)
  async deleteAnnouncement(
    @Args('id', { type: () => String }) id: string,
  ): Promise<boolean> {
    return this.communicationsService.deleteAnnouncement(id)
  }

  @Mutation(() => TeamAnnouncement, { name: 'adminPublishAnnouncement' })
  @RequirePermissions(AdminPermissions.TEAMS_MANAGE)
  async publishAnnouncement(
    @Args('id', { type: () => String }) id: string,
  ): Promise<TeamAnnouncement> {
    return this.communicationsService.publishAnnouncement(id)
  }

  @Mutation(() => TeamAnnouncement, { name: 'adminUnpublishAnnouncement' })
  @RequirePermissions(AdminPermissions.TEAMS_MANAGE)
  async unpublishAnnouncement(
    @Args('id', { type: () => String }) id: string,
  ): Promise<TeamAnnouncement> {
    return this.communicationsService.unpublishAnnouncement(id)
  }

  @Mutation(() => Boolean, { name: 'adminMarkAnnouncementAsRead' })
  @RequirePermissions(AdminPermissions.TEAMS_VIEW)
  async markAsRead(
    @Args('announcementId', { type: () => String }) announcementId: string,
    @CurrentUser('id') userId: string,
  ): Promise<boolean> {
    return this.communicationsService.markAsRead(announcementId, userId)
  }
}
