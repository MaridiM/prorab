import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import { PrismaService } from '../../../shared/services/prisma.service'
import {
  TeamAnnouncement,
  AnnouncementStatistics,
  CreateAnnouncementInput,
  UpdateAnnouncementInput,
  AnnouncementFilterInput,
} from '../models/admin-communications.model'

@Injectable()
export class AdminCommunicationsService {
  constructor(private prisma: PrismaService) {}

  // ==================== ANNOUNCEMENTS ====================

  async getAnnouncements(filter?: AnnouncementFilterInput): Promise<TeamAnnouncement[]> {
    const where: any = {}

    if (filter) {
      if (filter.teamId) {
        where.teamId = filter.teamId
      }

      if (filter.publishedOnly) {
        where.publishedAt = { not: null }
      }

      if (filter.pinnedOnly) {
        where.isPinned = true
      }

      if (filter.activeOnly) {
        where.OR = [{ expiresAt: null }, { expiresAt: { gt: new Date() } }]
      }

      if (filter.priorities && filter.priorities.length > 0) {
        where.priority = { in: filter.priorities }
      }

      if (filter.types && filter.types.length > 0) {
        where.type = { in: filter.types }
      }
    }

    const announcements = await this.prisma.teamAnnouncement.findMany({
      where,
      include: {
        _count: {
          select: { readBy: true },
        },
        team: {
          include: {
            _count: {
              select: { members: true },
            },
          },
        },
      },
      orderBy: [{ isPinned: 'desc' }, { publishedAt: 'desc' }, { createdAt: 'desc' }],
    })

    return announcements.map((a) => this.mapAnnouncement(a))
  }

  async getAnnouncementById(id: string): Promise<TeamAnnouncement> {
    const announcement = await this.prisma.teamAnnouncement.findUnique({
      where: { id },
      include: {
        _count: {
          select: { readBy: true },
        },
        team: {
          include: {
            _count: {
              select: { members: true },
            },
          },
        },
      },
    })

    if (!announcement) {
      throw new NotFoundException(`Announcement with ID ${id} not found`)
    }

    return this.mapAnnouncement(announcement)
  }

  async createAnnouncement(input: CreateAnnouncementInput, userId: string): Promise<TeamAnnouncement> {
    const announcement = await this.prisma.teamAnnouncement.create({
      data: {
        teamId: input.teamId,
        title: input.title,
        content: input.content,
        priority: input.priority || 'NORMAL',
        type: input.type || 'INFO',
        isPinned: input.isPinned || false,
        expiresAt: input.expiresAt,
        publishedAt: input.publishNow ? new Date() : null,
        createdBy: userId,
      },
      include: {
        _count: {
          select: { readBy: true },
        },
        team: {
          include: {
            _count: {
              select: { members: true },
            },
          },
        },
      },
    })

    return this.mapAnnouncement(announcement)
  }

  async updateAnnouncement(input: UpdateAnnouncementInput): Promise<TeamAnnouncement> {
    const existing = await this.prisma.teamAnnouncement.findUnique({
      where: { id: input.id },
    })

    if (!existing) {
      throw new NotFoundException(`Announcement with ID ${input.id} not found`)
    }

    const announcement = await this.prisma.teamAnnouncement.update({
      where: { id: input.id },
      data: {
        title: input.title,
        content: input.content,
        priority: input.priority,
        type: input.type,
        isPinned: input.isPinned,
        expiresAt: input.expiresAt,
      },
      include: {
        _count: {
          select: { readBy: true },
        },
        team: {
          include: {
            _count: {
              select: { members: true },
            },
          },
        },
      },
    })

    return this.mapAnnouncement(announcement)
  }

  async deleteAnnouncement(id: string): Promise<boolean> {
    const announcement = await this.prisma.teamAnnouncement.findUnique({
      where: { id },
    })

    if (!announcement) {
      throw new NotFoundException(`Announcement with ID ${id} not found`)
    }

    await this.prisma.teamAnnouncement.delete({
      where: { id },
    })

    return true
  }

  async publishAnnouncement(id: string): Promise<TeamAnnouncement> {
    const announcement = await this.prisma.teamAnnouncement.update({
      where: { id },
      data: { publishedAt: new Date() },
      include: {
        _count: {
          select: { readBy: true },
        },
        team: {
          include: {
            _count: {
              select: { members: true },
            },
          },
        },
      },
    })

    return this.mapAnnouncement(announcement)
  }

  async unpublishAnnouncement(id: string): Promise<TeamAnnouncement> {
    const announcement = await this.prisma.teamAnnouncement.update({
      where: { id },
      data: { publishedAt: null },
      include: {
        _count: {
          select: { readBy: true },
        },
        team: {
          include: {
            _count: {
              select: { members: true },
            },
          },
        },
      },
    })

    return this.mapAnnouncement(announcement)
  }

  async markAsRead(announcementId: string, userId: string): Promise<boolean> {
    // Check if already read
    const existing = await this.prisma.announcementRead.findUnique({
      where: {
        announcementId_userId: {
          announcementId,
          userId,
        },
      },
    })

    if (existing) {
      return true
    }

    await this.prisma.announcementRead.create({
      data: {
        announcementId,
        userId,
      },
    })

    return true
  }

  // ==================== STATISTICS ====================

  async getAnnouncementStatistics(teamId?: string): Promise<AnnouncementStatistics> {
    const where: any = teamId ? { teamId } : {}

    const [total, published, pinned, expired, byPriority] = await Promise.all([
      this.prisma.teamAnnouncement.count({ where }),
      this.prisma.teamAnnouncement.count({
        where: { ...where, publishedAt: { not: null } },
      }),
      this.prisma.teamAnnouncement.count({
        where: { ...where, isPinned: true },
      }),
      this.prisma.teamAnnouncement.count({
        where: { ...where, expiresAt: { lt: new Date() } },
      }),
      this.prisma.teamAnnouncement.groupBy({
        by: ['priority'],
        where,
        _count: true,
      }),
    ])

    const priorityCounts = {
      LOW: 0,
      NORMAL: 0,
      HIGH: 0,
      URGENT: 0,
    }

    byPriority.forEach((item) => {
      priorityCounts[item.priority] = item._count
    })

    return {
      total,
      published,
      drafts: total - published,
      pinned,
      expired,
      lowPriority: priorityCounts.LOW,
      normalPriority: priorityCounts.NORMAL,
      highPriority: priorityCounts.HIGH,
      urgentPriority: priorityCounts.URGENT,
    }
  }

  // ==================== HELPER METHODS ====================

  private mapAnnouncement(announcement: any): TeamAnnouncement {
    const now = new Date()
    const isPublished = !!announcement.publishedAt
    const isExpired = announcement.expiresAt ? announcement.expiresAt < now : false

    return {
      id: announcement.id,
      teamId: announcement.teamId || undefined,
      title: announcement.title,
      content: announcement.content,
      priority: announcement.priority,
      type: announcement.type,
      isPinned: announcement.isPinned,
      expiresAt: announcement.expiresAt || undefined,
      publishedAt: announcement.publishedAt || undefined,
      createdBy: announcement.createdBy,
      createdAt: announcement.createdAt,
      updatedAt: announcement.updatedAt,
      isPublished,
      isExpired,
      readCount: announcement._count?.readBy || 0,
      totalMembers: announcement.team?._count?.members || 0,
      hasRead: undefined,
    }
  }
}
